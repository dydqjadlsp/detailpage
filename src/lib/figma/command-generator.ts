/**
 * 피그마 커맨드 생성기
 * Gemini AI를 호출하여 피그마 플러그인 커맨드 배열을 생성한다.
 */

import { buildPromptByMode, buildTreePrompt } from './prompt-builder';
import type {
  FigmaGenerateRequest,
  FigmaGenerateResponse,
  FigmaCommand,
  ReferenceAnalysis,
  TreeNode,
} from './types';

// 503 에러 시 폴백 모델 체인 (preview → stable pro → stable flash)
const TEXT_MODELS = [
  'gemini-3-pro-preview',
  'gemini-2.5-pro',
  'gemini-2.5-flash',
] as const;
const MAX_RETRY_PER_MODEL = 1;
// 모델 간 전환 대기 시간 (ms)
const MODEL_SWITCH_DELAY = 2000;
// 같은 모델 재시도 대기 시간 (ms)
const RETRY_DELAY = 5000;

/**
 * 503/429/5xx 에러인지 판별한다.
 */
function isServerOverloadError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /503|429|500|502|504|UNAVAILABLE|overloaded|quota|rate.?limit|resource.?exhausted/i.test(msg);
}

/**
 * 잘린 JSON 배열을 마지막 완전한 객체까지 복구한다.
 * Gemini가 토큰 한도로 JSON을 중간에 자른 경우 대응.
 */
function repairTruncatedJsonArray(text: string): string {
  // 이미 유효한 JSON이면 그대로 반환
  try {
    JSON.parse(text);
    return text;
  } catch {
    // 복구 시도
  }

  // 마지막 완전한 } 를 찾아서 그 뒤에 ] 를 붙인다
  let depth = 0;
  let lastCompleteObjectEnd = -1;
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\' && inString) {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === '{') depth++;
    if (char === '}') {
      depth--;
      if (depth === 0) {
        lastCompleteObjectEnd = i;
      }
    }
  }

  if (lastCompleteObjectEnd > 0) {
    return text.substring(0, lastCompleteObjectEnd + 1) + ']';
  }

  throw new Error('복구 가능한 JSON 구조를 찾을 수 없습니다');
}

/**
 * Gemini 응답에서 JSON 배열을 파싱한다.
 * 마크다운 코드블록이나 앞뒤 텍스트를 제거하고 순수 JSON만 추출.
 * 토큰 한도로 잘린 JSON도 복구한다.
 */
export function parseCommandsFromResponse(text: string): FigmaCommand[] {
  // 마크다운 코드블록 제거
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');

  // JSON 배열 시작 위치 찾기
  const arrayStart = cleaned.indexOf('[');
  if (arrayStart === -1) {
    throw new Error('응답에서 JSON 배열을 찾을 수 없습니다');
  }

  cleaned = cleaned.substring(arrayStart);

  // 잘린 JSON 복구 시도
  cleaned = repairTruncatedJsonArray(cleaned);

  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) {
    throw new Error('파싱 결과가 배열이 아닙니다');
  }

  // 각 커맨드 유효성 검증
  const commands: FigmaCommand[] = parsed.map((cmd, index) => {
    if (!cmd.id) {
      cmd.id = `cmd_${String(index + 1).padStart(3, '0')}`;
    }
    if (!cmd.command) {
      throw new Error(`커맨드 ${index}에 command 필드가 없습니다`);
    }
    if (!cmd.params || typeof cmd.params !== 'object') {
      cmd.params = {};
    }
    return {
      id: cmd.id,
      command: cmd.command,
      params: cmd.params,
      group: cmd.group || '',
      description: cmd.description || '',
    };
  });

  return commands;
}

/**
 * 커맨드 시퀀스의 섹션명 추출
 */
export function extractSections(commands: FigmaCommand[]): string[] {
  const sections = new Set<string>();
  for (const cmd of commands) {
    if (cmd.group) {
      sections.add(cmd.group);
    }
  }
  return Array.from(sections);
}

/**
 * 예상 실행 시간 계산 (커맨드당 약 0.5초)
 */
export function estimateTime(commandCount: number): string {
  const seconds = Math.ceil(commandCount * 0.5);
  if (seconds < 60) return `${seconds}초`;
  const minutes = Math.ceil(seconds / 60);
  return `약 ${minutes}분`;
}

/**
 * 피그마 커맨드 시퀀스를 생성한다.
 * Gemini AI를 호출하여 FigmaCommand[] 형태의 커맨드 배열을 반환.
 */
export async function generateFigmaCommands(
  apiKey: string,
  request: FigmaGenerateRequest,
  referenceAnalysis?: ReferenceAnalysis
): Promise<FigmaGenerateResponse> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  // 레퍼런스 분석 데이터 변환 (상세 분석 필드 포함)
  const analysisForPrompt = referenceAnalysis
    ? {
        colorPalette: {
          primary: referenceAnalysis.colorPalette.primary,
          secondary: referenceAnalysis.colorPalette.secondary,
          accent: referenceAnalysis.colorPalette.accent,
          background: referenceAnalysis.colorPalette.background,
          text: referenceAnalysis.colorPalette.text,
        } as Record<string, string>,
        sections: referenceAnalysis.sections.map(s => ({
          ...s,
          elements: s.elements as unknown as Array<Record<string, unknown>>,
        })),
        typography: referenceAnalysis.typography,
        totalHeight: referenceAnalysis.totalHeight,
        spacing: referenceAnalysis.spacing,
        effects: referenceAnalysis.effects
          ? {
              gradients: referenceAnalysis.effects.gradients.map(g => ({
                type: g.type,
                colors: g.colors,
                angle: g.angle,
                usage: g.usage,
              })),
              shadows: referenceAnalysis.effects.shadows,
              hasGlassEffect: referenceAnalysis.effects.hasGlassEffect,
            }
          : undefined,
      }
    : undefined;

  const prompt = buildPromptByMode(request, analysisForPrompt);

  let lastError: Error | null = null;

  for (const model of TEXT_MODELS) {
    for (let attempt = 0; attempt <= MAX_RETRY_PER_MODEL; attempt++) {
      try {
        const result = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: attempt === 0 ? 0.3 : 0.2,
            maxOutputTokens: 65536,
          },
        });

        const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) {
          throw new Error('Gemini 응답이 비어 있습니다');
        }

        const commands = parseCommandsFromResponse(responseText);

        if (commands.length < 30) {
          throw new Error(`커맨드가 너무 적습니다: ${commands.length}개 (최소 30개 필요)`);
        }

        const sections = extractSections(commands);

        return {
          commands,
          metadata: {
            totalCommands: commands.length,
            sections,
            estimatedTime: estimateTime(commands.length),
            model,
          },
        };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        // 서버 과부하 에러면 다음 모델로 전환
        if (isServerOverloadError(err)) {
          await new Promise(resolve => setTimeout(resolve, MODEL_SWITCH_DELAY));
          break;
        }

        // 그 외 에러는 같은 모델로 재시도
        if (attempt < MAX_RETRY_PER_MODEL) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }
    }
  }

  throw lastError || new Error('커맨드 생성에 실패했습니다 (모든 모델 실패)');
}

/**
 * 잘린 JSON 객체를 마지막 완전한 depth까지 복구한다.
 * Gemini가 토큰 한도로 중첩 JSON을 중간에 자른 경우 대응.
 */
function repairTruncatedJsonObject(text: string): string {
  try {
    JSON.parse(text);
    return text;
  } catch {
    // 복구 시도
  }

  let inString = false;
  let escapeNext = false;

  // 문자열 상태 확인 (잘린 문자열 감지)
  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\' && inString) {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }
  }

  let repaired = text;

  // 잘린 문자열 닫기
  if (inString) {
    repaired += '"';
  }

  // bracket 스택으로 열린 것들 추적
  let inStr = false;
  let esc = false;
  const stack: string[] = [];

  for (let i = 0; i < repaired.length; i++) {
    const c = repaired[i];
    if (esc) { esc = false; continue; }
    if (c === '\\' && inStr) { esc = true; continue; }
    if (c === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (c === '{') { stack.push('}'); }
    if (c === '[') { stack.push(']'); }
    if (c === '}' || c === ']') { stack.pop(); }
  }

  // 마지막 불완전한 키-값 쌍 제거 (콤마 뒤에 잘린 경우)
  repaired = repaired.replace(/,\s*"[^"]*"?\s*:?\s*$/, '');
  repaired = repaired.replace(/,\s*$/, '');

  // stack에 남은 것들을 역순으로 닫기
  while (stack.length > 0) {
    repaired += stack.pop();
  }

  // 검증
  JSON.parse(repaired);
  return repaired;
}

/**
 * Gemini 응답에서 TreeNode JSON 객체를 파싱한다.
 */
export function parseTreeFromResponse(text: string): TreeNode {
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');

  // JSON 객체 시작 위치 찾기
  const objectStart = cleaned.indexOf('{');
  if (objectStart === -1) {
    throw new Error('응답에서 JSON 객체를 찾을 수 없습니다');
  }

  cleaned = cleaned.substring(objectStart);

  // 잘린 JSON 복구 시도
  cleaned = repairTruncatedJsonObject(cleaned);

  const parsed = JSON.parse(cleaned);
  if (typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('파싱 결과가 TreeNode 객체가 아닙니다');
  }

  if (!parsed.type) {
    throw new Error('루트 노드에 type 필드가 없습니다');
  }

  // 파싱 후 레이아웃 보정 (AI가 규칙을 어겨도 코드에서 강제 수정)
  sanitizeTreeLayout(parsed as TreeNode, null);

  return parsed as TreeNode;
}

/**
 * AI가 생성한 트리의 layoutSizing을 강제 보정한다.
 * - VERTICAL 부모의 자식에 layoutSizingHorizontal="FILL" 강제
 * - TEXT에 layoutSizingHorizontal="FILL" + textAutoResize="HEIGHT" 강제
 * - RECTANGLE에 layoutSizingHorizontal="FILL" 강제 (VERTICAL 부모)
 * - layoutMode 누락된 FRAME에 "VERTICAL" 강제
 */
function hasImageDescendant(node: TreeNode): boolean {
  const name = (node.name || '').toLowerCase();
  if (node.type === 'RECTANGLE') {
    return name.includes('image') || name.includes('이미지') || name.includes('photo')
      || name.includes('background') || name.includes('illustration')
      || name.includes('profile') || name.includes('portfolio')
      || name.includes('gallery') || name.includes('banner');
  }
  if (node.children) {
    return node.children.some(c => hasImageDescendant(c));
  }
  return false;
}

function isLightSolidFill(node: TreeNode): boolean {
  if (!node.fillColor) return false;
  const { r, g, b } = node.fillColor;
  return r + g + b > 2.0;
}

function sanitizeTreeLayout(node: TreeNode, parent: TreeNode | null): void {
  const parentIsVertical = parent?.layoutMode === 'VERTICAL';
  const name = (node.name || '').toLowerCase();

  // ===== 1. ROOT 프레임: 좌우 패딩 0 강제 (전체 너비 사용) =====
  if (!parent && node.type === 'FRAME') {
    node.paddingLeft = 0;
    node.paddingRight = 0;
  }

  // ===== 2. FRAME: layoutMode 없으면 VERTICAL 강제 =====
  if (node.type === 'FRAME' && !node.layoutMode) {
    node.layoutMode = 'VERTICAL';
  }

  // ===== 3. TEXT 노드: 항상 FILL + HEIGHT =====
  if (node.type === 'TEXT') {
    node.layoutSizingHorizontal = 'FILL';
    if (!node.textAutoResize) {
      node.textAutoResize = 'HEIGHT';
    }
  }

  // ===== 4. VERTICAL 부모의 자식: FILL 강제 =====
  if (parentIsVertical) {
    if (node.type === 'FRAME' || node.type === 'RECTANGLE') {
      if (!node.layoutSizingHorizontal || node.layoutSizingHorizontal === 'FIXED') {
        node.layoutSizingHorizontal = 'FILL';
      }
    }
  }

  // ===== 5. 이미지 포함 섹션: 좌우 패딩 0 (이미지 풀블리드) =====
  if (node.type === 'FRAME' && node.children && hasImageDescendant(node)) {
    const hasBareText = node.children.some(c => c.type === 'TEXT');
    // 이미지 + 별도 Content/Overlay FRAME 패턴: bare TEXT 없으면 패딩 제거
    if (!hasBareText) {
      node.paddingLeft = 0;
      node.paddingRight = 0;
    }
  }

  // ===== 6. 이미지 래퍼 FRAME: 패딩 0 + 흰색 fill 제거 =====
  // AI가 이미지를 FRAME으로 감싸고 흰색 배경을 까는 패턴 차단
  if (node.type === 'FRAME' && node.children) {
    const rectChildren = node.children.filter(c => c.type === 'RECTANGLE');
    const hasOnlyImages = rectChildren.length > 0
      && rectChildren.length === node.children.length
      && rectChildren.some(c => hasImageDescendant(c));
    if (hasOnlyImages) {
      node.paddingLeft = 0;
      node.paddingRight = 0;
      node.paddingTop = 0;
      node.paddingBottom = 0;
      if (isLightSolidFill(node)) {
        delete node.fillColor;
      }
    }
  }

  // ===== 7. Overlay/Content FRAME: 흰색 SOLID fill 제거 → 투명 =====
  if (node.type === 'FRAME') {
    if (name.includes('overlay') || name.includes('content')) {
      if (isLightSolidFill(node)) {
        delete node.fillColor;
      }
    }
  }

  // ===== 8. Overlay/Content FRAME: FIXED → HUG (빈 공간 방지) =====
  if (node.type === 'FRAME' && node.layoutSizingVertical === 'FIXED') {
    if (name.includes('overlay') || name.includes('content') || name.includes('hero')) {
      node.layoutSizingVertical = 'HUG';
    }
  }

  // ===== 9. 폰트 사이즈 보정 (AI가 과도한 사이즈 생성 시 강제 축소) =====
  if (node.type === 'TEXT' && node.fontSize) {
    const fs = node.fontSize;
    // 역할별 분류 (순서: subtitle > body > price > caption > button > heading > title > etc)
    const isSubtitle = name.includes('subtitle') || name.includes('부제') || name.includes('sub-title');
    const isBody = name.includes('body') || name.includes('본문') || name.includes('description') || name.includes('text');
    const isPrice = name.includes('price') || name.includes('가격') || name.includes('discount');
    const isCaption = name.includes('caption') || name.includes('label') || name.includes('tagline')
      || name.includes('badge') || name.includes('rating') || name.includes('num');
    const isButton = name.includes('cta-') || name.includes('button');
    const isMainHeading = !isSubtitle && name.includes('heading') && !name.includes('-02') && !name.includes('-03') && !name.includes('-04') && !name.includes('-05');
    const isSectionTitle = !isSubtitle && (
      (name.includes('heading') && (name.includes('-02') || name.includes('-03') || name.includes('-04') || name.includes('-05')))
      || (name.includes('title') && !name.includes('subtitle'))
      || name.includes('제목')
    );

    // 우선순위: subtitle > button > price > caption > body > heading > title > etc
    if (isSubtitle) {
      if (fs > 24) node.fontSize = 22;
      else if (fs < 16) node.fontSize = 18;
    } else if (isButton) {
      if (fs > 20) node.fontSize = 18;
      else if (fs < 14) node.fontSize = 16;
    } else if (isPrice) {
      if (fs > 36) node.fontSize = 36;
      else if (fs < 28) node.fontSize = 32;
    } else if (isCaption) {
      if (fs > 18) node.fontSize = 16;
      else if (fs < 12) node.fontSize = 13;
    } else if (isBody) {
      if (fs > 22) node.fontSize = 18;
      else if (fs < 14) node.fontSize = 16;
    } else if (isMainHeading) {
      if (fs > 44) node.fontSize = 40;
      else if (fs < 28) node.fontSize = 32;
    } else if (isSectionTitle) {
      if (fs > 34) node.fontSize = 30;
      else if (fs < 22) node.fontSize = 26;
    } else {
      if (fs > 24) node.fontSize = 20;
      else if (fs < 14) node.fontSize = 14;
    }

    if (node.fontSize !== fs) {
      node.lineHeight = Math.round(node.fontSize * 1.5);
    }
  }

  // ===== 10. 아이콘+텍스트 HORIZONTAL: 상단 정렬 =====
  if (node.type === 'FRAME' && node.layoutMode === 'HORIZONTAL') {
    const hasSmallFixedChild = node.children?.some(c =>
      c.type === 'FRAME' && c.layoutSizingHorizontal === 'FIXED' && (c.width || 0) <= 80
    );
    const hasFillChild = node.children?.some(c =>
      c.layoutSizingHorizontal === 'FILL' || (c.type === 'FRAME' && c.layoutMode === 'VERTICAL')
    );
    if (hasSmallFixedChild && hasFillChild) {
      node.counterAxisAlignItems = 'MIN';
    }
  }

  // ===== 11. 숫자 아이콘 박스: 최소 너비 보장 =====
  if (node.type === 'FRAME' && node.layoutSizingHorizontal === 'FIXED') {
    if (name.includes('num') || name.includes('step') || name.includes('icon')) {
      if (node.width && node.width < 56) {
        node.width = 56;
      }
      if ((node.paddingLeft || 0) + (node.paddingRight || 0) > 16) {
        node.paddingLeft = 4;
        node.paddingRight = 4;
      }
    }
  }

  // ===== 재귀 =====
  if (node.children) {
    for (const child of node.children) {
      sanitizeTreeLayout(child, node);
    }
  }
}

/**
 * 트리 내 총 노드 수를 센다.
 */
function countTreeNodes(node: TreeNode): number {
  let count = 1;
  if (node.children) {
    for (const child of node.children) {
      count += countTreeNodes(child);
    }
  }
  return count;
}

/**
 * 트리 모드 피그마 디자인을 생성한다.
 * AI가 중첩 TreeNode JSON을 반환하면 create_tree 커맨드 1회로 래핑.
 */
export async function generateFigmaTree(
  apiKey: string,
  request: FigmaGenerateRequest,
  referenceAnalysis?: ReferenceAnalysis
): Promise<FigmaGenerateResponse> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  const prompt = buildTreePrompt(request, referenceAnalysis);

  // 요청 픽셀높이에 따라 maxOutputTokens 조정 (긴 페이지는 더 많은 토큰 필요)
  const pixelHeight = Number(request.pixelHeight || 8000);
  const baseTokens = 65536;
  const outputTokens = pixelHeight >= 20000 ? 131072
    : pixelHeight >= 12000 ? 100000
    : baseTokens;

  let lastError: Error | null = null;

  for (const model of TEXT_MODELS) {
    for (let attempt = 0; attempt <= MAX_RETRY_PER_MODEL; attempt++) {
      try {
        const result = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature: attempt === 0 ? 0.3 : 0.2,
            maxOutputTokens: outputTokens,
          },
        });

        const candidate = result.candidates?.[0];
        const responseText = candidate?.content?.parts?.[0]?.text;
        if (!responseText) {
          throw new Error('Gemini 응답이 비어 있습니다');
        }

        const tree = parseTreeFromResponse(responseText);
        const nodeCount = countTreeNodes(tree);
        const sectionCount = tree.children?.length || 0;

        if (nodeCount < 20) {
          throw new Error(`트리 노드가 너무 적습니다: ${nodeCount}개 (최소 20개 필요)`);
        }

        const command: FigmaCommand = {
          id: 'cmd_tree_001',
          command: 'create_tree',
          params: { tree },
          group: 'tree',
          description: `트리 구조 생성 (${nodeCount}개 노드, ${sectionCount}개 섹션)`,
        };

        const sections: string[] = [];
        if (tree.children) {
          for (const child of tree.children) {
            if (child.name) {
              sections.push(child.name.replace('Section-', '').replace('Section_', '').toLowerCase());
            }
          }
        }

        return {
          commands: [command],
          tree,
          metadata: {
            totalCommands: 1,
            sections,
            estimatedTime: '5~15초',
            outputFormat: 'tree',
            model,
          },
        };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        if (isServerOverloadError(err)) {
          await new Promise(resolve => setTimeout(resolve, MODEL_SWITCH_DELAY));
          break;
        }

        if (attempt < MAX_RETRY_PER_MODEL) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }
    }
  }

  throw lastError || new Error('트리 생성에 실패했습니다 (모든 모델 실패)');
}
