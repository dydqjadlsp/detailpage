import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  unauthorizedError,
  validationError,
  internalError,
  externalApiError,
} from '@/lib/errors';
import type { ScannedTextNode, TextReplacement } from '@/lib/figma/types';

const TEXT_MODELS = ['gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'] as const;

function isServerOverloadError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /503|429|500|502|504|UNAVAILABLE|overloaded|quota|rate.?limit|resource.?exhausted/i.test(msg);
}
const MAX_TEXT_NODES = 300;
const CHUNK_SIZE = 40;

/**
 * POST /api/figma/clone
 * 스캔된 텍스트 노드를 받아 사용자 inputData 기반으로 카피를 리라이팅한다.
 */
// SECURITY-CRITICAL
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return internalError('Supabase 연결에 실패했습니다');
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return unauthorizedError();
    }

    const body = await request.json();
    const {
      textNodes,
      inputData,
      category,
    } = body as {
      textNodes: ScannedTextNode[];
      inputData: Record<string, unknown>;
      category?: string;
    };

    if (!textNodes || !Array.isArray(textNodes) || textNodes.length === 0) {
      return validationError('텍스트 노드 목록이 필요합니다');
    }

    if (!inputData) {
      return validationError('상품/서비스 정보가 필요합니다');
    }

    const { data: settings } = await supabase
      .from('user_settings')
      .select('gemini_api_key')
      .eq('user_id', user.id)
      .single();

    const apiKey = settings?.gemini_api_key;
    if (!apiKey) {
      return validationError('마이페이지에서 Gemini API 키를 먼저 등록해주세요');
    }

    const trimmedNodes = textNodes.slice(0, MAX_TEXT_NODES);
    const replacements = await rewriteTextNodes(apiKey, trimmedNodes, inputData, category);

    return NextResponse.json({
      ok: true,
      data: { replacements, totalNodes: trimmedNodes.length },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : '';

    if (msg.includes('API key') || msg.includes('apiKey')) {
      return externalApiError('Gemini API 키가 유효하지 않습니다');
    }

    return internalError();
  }
}

/**
 * Gemini를 사용해 텍스트 노드의 카피를 리라이팅한다.
 * 대량 노드를 청크로 분할하여 처리한다 (한번에 다 보내면 누락 발생).
 */
async function rewriteTextNodes(
  apiKey: string,
  textNodes: ScannedTextNode[],
  inputData: Record<string, unknown>,
  category?: string,
): Promise<TextReplacement[]> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  const inputSummary = buildInputSummary(inputData);
  const categoryHint = category ? `업종: ${category}` : '';

  const allReplacements: TextReplacement[] = [];

  // 청크로 분할 처리 (CHUNK_SIZE개씩)
  for (let start = 0; start < textNodes.length; start += CHUNK_SIZE) {
    const chunk = textNodes.slice(start, start + CHUNK_SIZE);

    const nodeList = chunk.map((node, idx) => ({
      index: idx,
      original: node.characters,
      role: classifyTextRole(node),
      maxLength: estimateMaxLength(node),
    }));

    const prompt = `당신은 전환율 높은 상세페이지를 만드는 CRO 카피라이터입니다.

아래 텍스트 ${chunk.length}개를 모두 빠짐없이 리라이팅하세요.

## 상품/서비스 정보
${inputSummary}
${categoryHint}

## 텍스트 노드 목록 (${chunk.length}개 전부 반환 필수)
${nodeList.map(n => `[${n.index}] 역할: ${n.role} | 원본: "${n.original}" | 최대글자수: ${n.maxLength}`).join('\n')}

## 규칙
1. 목록의 ${chunk.length}개 항목을 모두 빠짐없이 리라이팅하라. 하나도 빠뜨리지 마라.
2. 각 텍스트의 역할(제목/본문/버튼/배지/캡션)에 맞는 톤과 길이를 유지하라.
3. 원본 텍스트의 글자 수를 크게 초과하지 마라 (최대 1.3배).
4. 숫자, 통계, 구체적 수치를 적극 활용하라.
5. 한국어로 작성하라.
6. 버튼 텍스트는 짧고 행동을 유도하는 문구로 만들어라.
7. 제목은 파워워드를 사용해서 강렬하게 만들어라.
8. 원본이 영어인 경우 한국어로 번역하되, 브랜드명이나 고유명사는 그대로 두라.

## 출력 형식
JSON 배열로 반환하라. 각 항목은 { "index": number, "text": "리라이팅된 텍스트" } 형태.
반드시 ${chunk.length}개 항목을 모두 반환하라. 배열만 반환하고 다른 텍스트는 포함하지 마라.`;

    let response;
    for (const model of TEXT_MODELS) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
        });
        break;
      } catch (err) {
        if (isServerOverloadError(err)) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        throw err;
      }
    }
    if (!response) throw new Error('모든 모델이 실패했습니다');

    const responseText = response.text?.trim() || '[]';
    let parsed: Array<{ index: number; text: string }> = [];

    try {
      parsed = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[0]); } catch { /* skip */ }
      }
    }

    // 청크 내 결과 매핑
    for (const item of parsed) {
      if (item.index >= 0 && item.index < chunk.length && item.text) {
        allReplacements.push({
          nodeId: chunk[item.index].id,
          text: item.text,
        });
      }
    }

    // Gemini가 빠뜨린 노드는 원본 유지
    for (let i = 0; i < chunk.length; i++) {
      if (!allReplacements.find(r => r.nodeId === chunk[i].id)) {
        allReplacements.push({
          nodeId: chunk[i].id,
          text: chunk[i].characters,
        });
      }
    }
  }

  return allReplacements;
}

function classifyTextRole(node: ScannedTextNode): string {
  const fontSize = node.fontSize;
  const text = node.characters.toLowerCase();
  const name = node.name.toLowerCase();

  if (name.includes('button') || name.includes('cta') || name.includes('btn')) return 'button';
  if (name.includes('badge') || name.includes('tag') || name.includes('label')) return 'badge';
  if (name.includes('caption') || name.includes('note')) return 'caption';

  if (fontSize >= 32) return 'heading';
  if (fontSize >= 24) return 'subheading';
  if (fontSize >= 18) return 'body-large';
  if (fontSize <= 12) return 'caption';

  if (text.length <= 20) return 'label';
  return 'body';
}

function estimateMaxLength(node: ScannedTextNode): number {
  const originalLength = node.characters.length;
  return Math.max(originalLength, Math.ceil(originalLength * 1.3));
}

function buildInputSummary(inputData: Record<string, unknown>): string {
  const lines: string[] = [];

  const fieldMap: Record<string, string> = {
    storeName: '상호명',
    brandName: '브랜드명',
    companyName: '회사명',
    productName: '상품명',
    description: '설명',
    targetAudience: '타겟 고객',
    uniqueSellingPoint: '차별점',
    price: '가격',
    features: '특징',
    benefits: '혜택',
    category: '카테고리',
    phone: '연락처',
    address: '주소',
    website: '웹사이트',
  };

  for (const [key, label] of Object.entries(fieldMap)) {
    const value = inputData[key];
    if (value && typeof value === 'string' && value.trim()) {
      lines.push(`- ${label}: ${value}`);
    }
  }

  if (lines.length === 0) {
    lines.push('- 기본 상품/서비스 (구체적 정보 없음)');
  }

  return lines.join('\n');
}
