import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient, ensureStorageBucket } from '@/lib/supabase/admin';
import {
  unauthorizedError,
  validationError,
  internalError,
  externalApiError,
} from '@/lib/errors';
import {
  PIXEL_PRESETS,
  CATEGORY_TEMPLATES,
  NINE_STEP_FORMULA,
  CATEGORY_TONES,
  COPY_FORMULAS,
  IMAGE_PROMPT_QUALITY,
  COMPOSITION_RULES,
  LIGHTING_STYLES,
  buildStrategyContext,
} from '@/config';
import type { CategoryKey } from '@/config';

const IMAGE_BUCKET = 'generated-images';
// 503 에러 시 폴백 모델 체인
const TEXT_MODELS = ['gemini-3-pro-preview', 'gemini-2.5-pro', 'gemini-2.5-flash'] as const;
const IMAGE_MODELS = ['gemini-3-pro-image-preview', 'gemini-2.5-flash-image'] as const;

function isServerOverloadError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /503|429|500|502|504|UNAVAILABLE|overloaded|quota|rate.?limit|resource.?exhausted/i.test(msg);
}

interface SectionConfigInput {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  description?: string;
  referenceImageUrl?: string;
}

function buildSectionConfigContext(configs?: SectionConfigInput[]): string {
  if (!configs || configs.length === 0) return '';

  const validConfigs = configs.filter((c) => c.type);
  if (validConfigs.length === 0) return '';

  const lines = validConfigs.map((c, i) => {
    const parts = [`섹션 ${i + 1}: type="${c.type}"`];
    if (c.title) parts.push(`title="${c.title}"`);
    if (c.subtitle) parts.push(`subtitle="${c.subtitle}"`);
    if (c.description) parts.push(`description="${c.description}"`);
    if (c.referenceImageUrl) parts.push(`(참고 이미지 있음)`);
    return parts.join(', ');
  });

  return `\n\n[★ 사용자 지정 섹션 구성 - 반드시 이 구성을 따르세요]
사용자가 직접 지정한 섹션 구성입니다. 아래 순서와 타입을 정확히 따르세요.
사용자가 제공한 title/subtitle/description은 그대로 사용하되, 비어있는 필드는 AI가 자동으로 채워주세요.
총 ${validConfigs.length}개의 섹션을 생성하세요.

${lines.join('\n')}`;
}

const SECTION_TYPES = [
  'Hero', 'Features', 'Benefits', 'Gallery', 'Testimonials',
  'Process', 'Pricing', 'FAQ', 'Stats', 'Team', 'About',
  'Contact', 'CTA', 'Comparison', 'Timeline', 'Portfolio',
  'Newsletter', 'Partners', 'VideoShowcase', 'DetailedProduct',
  'TrustBadges', 'Urgency',
];

// 카테고리 컨텍스트 추출 (프롬프트 토큰 최적화)
function buildCategoryContext(category: string, tier: string): string {
  const template = CATEGORY_TEMPLATES[category as CategoryKey];
  if (!template) return '';

  const tone = CATEGORY_TONES[category];
  const formulas = COPY_FORMULAS.filter(f => f.bestFor.includes(category));
  const formula = formulas[0];

  const sectionOrderKey = tier === 'compact' ? 'compact'
    : tier === 'standard' ? 'standard'
    : 'detailed';
  const sectionOrder = template.sectionOrder[sectionOrderKey];

  const parts: string[] = [];

  // 색상 시스템
  parts.push(`[색상 시스템]
Primary: ${template.colorScheme.primary}
Secondary: ${template.colorScheme.secondary}
Accent: ${template.colorScheme.accent}
배경 스타일: ${template.colorScheme.backgroundStyle}
모드: ${template.colorScheme.mode}`);

  // 섹션 순서
  parts.push(`[섹션 순서 (반드시 이 순서를 따르세요)]
${sectionOrder.join(' -> ')}`);

  // 9단계 공식에서 해당 섹션들의 심리학 원칙 추출
  const stepGuides = sectionOrder.map(sectionType => {
    const step = NINE_STEP_FORMULA.find(s =>
      s.requiredSections.includes(sectionType) ||
      s.optionalSections.includes(sectionType)
    );
    if (!step) return null;
    return `${sectionType}: ${step.name} (${step.psychologyPrinciple}) - ${step.copywritingFocus}`;
  }).filter(Boolean);

  parts.push(`[섹션별 심리학 원칙과 카피 포커스]
${stepGuides.join('\n')}`);

  // 카피라이팅 공식
  if (formula) {
    parts.push(`[카피라이팅 공식: ${formula.name}]
${formula.steps.join('\n')}
예시: ${formula.example}`);
  }

  // 톤앤매너
  if (tone) {
    parts.push(`[톤앤매너]
목소리: ${tone.voiceCharacteristics.join(', ')}
파워워드: ${tone.powerWords.join(', ')}
주의사항: ${tone.dontList.join(', ')}

[참고 헤드라인]
${tone.sampleHeadlines.join('\n')}`);
  }

  // 이미지 스타일
  parts.push(`[이미지 스타일]
스타일: ${template.imagery.style}
컬러톤: ${template.imagery.colorTone}
구도: ${template.imagery.composition.join(', ')}`);

  // 타이포그래피
  parts.push(`[타이포그래피]
제목: ${template.typography.headingStyle}
본문: ${template.typography.bodyStyle}
강조방식: ${template.typography.fontEmphasis}`);

  // 레이아웃
  parts.push(`[레이아웃]
밀도: ${template.layout.density}
이미지 비중: ${template.layout.imageRatio}
교대 배치: ${template.layout.sectionAlternation ? '적용' : '미적용'}`);

  return parts.join('\n\n');
}

function buildTextPrompt(
  category: string,
  inputData: Record<string, unknown>,
  sectionCount: number,
  tier: string,
  referenceAnalysis?: Record<string, unknown> | null,
  sectionConfigContext?: string,
): string {
  const inputSummary = Object.entries(inputData)
    .filter(([key]) => !key.startsWith('_'))
    .map(([key, value]) => {
      if (Array.isArray(value)) return `${key}: ${value.join(', ')}`;
      return `${key}: ${value}`;
    })
    .join('\n');

  // 확장 입력 데이터 (고급 설정) 활용
  const advancedParts: string[] = [];

  if (Array.isArray(inputData.sellingPoints) && inputData.sellingPoints.length > 0) {
    advancedParts.push(`[핵심 셀링포인트]\n${(inputData.sellingPoints as string[]).join(', ')}\nHero, Features, Benefits 섹션에 적극 반영하세요.`);
  }

  if (inputData.originalPrice || inputData.salePrice) {
    const priceParts = ['[가격 정보]'];
    if (inputData.originalPrice) priceParts.push(`정가: ${inputData.originalPrice}`);
    if (inputData.salePrice) priceParts.push(`할인가: ${inputData.salePrice}`);
    if (inputData.discountRate) priceParts.push(`할인율: ${inputData.discountRate}`);
    priceParts.push('Pricing/CTA 섹션에 할인을 강조하세요.');
    advancedParts.push(priceParts.join('\n'));
  }

  if (typeof inputData.toneManner === 'string' && inputData.toneManner) {
    advancedParts.push(`[지정 톤앤매너]\n"${inputData.toneManner}" 스타일 우선 적용.`);
  }

  if (inputData.brandColor || inputData.accentColor) {
    const colorParts = ['[브랜드 커스텀 컬러]'];
    if (inputData.brandColor) colorParts.push(`Primary: ${inputData.brandColor}`);
    if (inputData.accentColor) colorParts.push(`Accent: ${inputData.accentColor}`);
    colorParts.push('색상 시스템의 Primary/Accent 대신 이 컬러를 사용하세요.');
    advancedParts.push(colorParts.join('\n'));
  }

  if (typeof inputData.ctaText === 'string' && inputData.ctaText) {
    advancedParts.push(`[지정 CTA 문구]\nCTA 버튼: "${inputData.ctaText}"`);
  }

  if (referenceAnalysis) {
    const refParts: string[] = ['[레퍼런스 디자인 참고]'];
    const style = referenceAnalysis.overallStyle as Record<string, unknown> | undefined;
    if (style?.layoutType) refParts.push(`레이아웃: ${style.layoutType}`);
    if (style?.colorPalette && Array.isArray(style.colorPalette)) {
      refParts.push(`참고 컬러: ${(style.colorPalette as string[]).join(', ')}`);
    }
    if (Array.isArray(referenceAnalysis.sections)) {
      const refSections = referenceAnalysis.sections as Array<Record<string, unknown>>;
      refParts.push(`참고 섹션: ${refSections.map(s => s.type || s.name).join(' → ')}`);
    }
    refParts.push('이 레퍼런스의 디자인 패턴을 참고하세요.');
    advancedParts.push(refParts.join('\n'));
  }

  const advancedContext = advancedParts.length > 0 ? '\n\n' + advancedParts.join('\n\n') : '';

  const template = CATEGORY_TEMPLATES[category as CategoryKey];
  const categoryName = template?.name || category;
  const categoryContext = buildCategoryContext(category, tier);

  // 전략 가이드: 카테고리+섹션 기반 설득 전략 주입
  const sectionOrderKey = tier === 'compact' ? 'compact' : tier === 'standard' ? 'standard' : 'detailed';
  const sectionOrderForStrategy = template?.sectionOrder?.[sectionOrderKey] || ['Hero', 'Features', 'Benefits', 'CTA'];
  const strategyGuide = buildStrategyContext(category, sectionOrderForStrategy as string[]);

  const availableTypes = SECTION_TYPES.slice(0, Math.min(sectionCount + 5, SECTION_TYPES.length));

  return `당신은 대한민국 최고의 상세페이지 전문 디자이너이자 전환율 최적화(CRO) 전문가입니다.
카테고리: ${categoryName}
등급: ${tier}
목표: 구매/신청 전환율을 극대화하는 고퀄리티 상세페이지 구조와 카피 생성

${categoryContext}

${strategyGuide}

[입력 정보]
${inputSummary}${advancedContext}${sectionConfigContext || ''}

[섹션 수]
총 ${sectionCount}개의 섹션을 생성하세요.

[출력 형식]
아래 JSON 형식으로 정확하게 출력하세요. 다른 텍스트 없이 JSON만 출력하세요.

{
  "content": [
    {
      "type": "섹션타입",
      "props": {
        "id": "고유ID",
        "title": "섹션 제목 (위 파워워드를 활용, 설득력 있게)",
        "subtitle": "부제목 (공감/혜택 중심)",
        "description": "상세 설명 (위 카피라이팅 공식 적용)",
        "ctaText": "CTA 버튼 텍스트 (동사로 시작, 긴급성 포함)",
        "items": [
          { "title": "항목 제목", "description": "항목 설명", "icon": "아이콘명" }
        ],
        "backgroundColor": "#hex (위 색상 시스템 기반)",
        "textColor": "#hex (배경과 대비 4.5:1 이상)",
        "imagePrompt": "이 섹션 이미지 영어 프롬프트 (구체적 구도, 조명, 분위기 포함)",
        "layout": "left-image | right-image | center | full-width | grid | split"
      }
    }
  ],
  "root": {
    "props": {
      "title": "페이지 제목"
    }
  },
  "theme": {
    "primaryColor": "${template?.colorScheme.primary || '#6366F1'}",
    "secondaryColor": "${template?.colorScheme.secondary || '#8B5CF6'}",
    "accentColor": "${template?.colorScheme.accent || '#06B6D4'}",
    "fontFamily": "Pretendard"
  }
}

[사용 가능한 섹션 타입]
${availableTypes.join(', ')}

[섹션별 items 데이터 형식]
- Pricing: title=요금제명, description="가격|포함기능1,포함기능2,포함기능3", icon="recommended" (추천 요금제만)
- Team: title=이름, description="직책|한줄소개"
- Comparison: title=비교항목명, description="우리 제품 설명", icon="check" 또는 "x"
- Timeline: title=단계/시점명, description=설명
- 기타 섹션: title=항목명, description=항목설명

[중요 규칙]
1. 반드시 첫 섹션은 Hero 타입이어야 합니다.
2. 반드시 마지막 섹션은 CTA 타입이어야 합니다.
3. 위 [섹션 순서]를 최대한 따르되, sectionCount에 맞게 조정하세요.
4. 각 섹션의 카피는 위 [카피라이팅 공식]과 [심리학 원칙]을 반영하세요.
5. imagePrompt는 반드시 영어로, 구도/조명/분위기/색상을 구체적으로 묘사하세요.
13. 위 [전략 가이드]의 금지사항, USP 고객 언어 변환, 섹션별 설득 문구를 반드시 반영하세요.
14. 기능 설명만 나열하지 말고, 고객이 느끼는 혜택을 함께 쓰세요. (스펙→혜택 변환)
15. 핵심 메시지는 Hero/Benefits/CTA 3곳에서 형태를 바꿔 반복하세요.
16. 가격 정보가 있으면 [가격 저항 돌파 4단계] 흐름을 CTA/Pricing 섹션에 적용하세요.
6. backgroundColor는 위 [색상 시스템]의 값을 활용하여 섹션마다 다양하게 설정하세요.
7. textColor는 배경과 충분한 대비를 유지하세요 (다크 배경 → 흰색, 라이트 배경 → 어두운 색).
8. layout은 섹션별로 적절하게 다양하게 배치하세요.
9. 한국어로 카피를 작성하세요. 파워워드를 Hero 제목과 CTA에 반드시 포함하세요.
10. items 배열은 3~6개의 항목을 포함하세요.
11. Hero 타이틀은 40자 이내, 서브타이틀은 80자 이내로 작성하세요.
12. CTA 버튼 텍스트는 "지금", "바로" 등 즉각적 행동을 유도하는 동사로 시작하세요.

[★ Hero 섹션 필수 콘텐츠 규칙 - 매우 중요]
Hero 섹션은 반드시 다음 4가지를 모두 포함해야 합니다:
- "title": 강렬한 헤드라인 (40자 이내)
- "subtitle": 타겟 고객의 공감을 끄는 부제목 (80자 이내)
- "description": 제품/서비스의 핵심 가치를 2~3문장으로 설명하는 상세 설명문. 고객이 왜 이 제품이 필요한지, 어떤 변화를 줄 수 있는지를 설득력 있게 작성하세요. 절대 비워두지 마세요.
- "items": 핵심 셀링포인트 3~5개를 배열로 제공. 각 항목은 {"title": "짧은 키워드", "description": "한줄 설명"} 형태. 예시: {"title": "무료 배송", "description": "전국 어디든 무료 배송"}, {"title": "100% 환불 보장", "description": "30일 이내 무조건 환불"}
- "ctaText": CTA 버튼 텍스트

[★ 모든 섹션 콘텐츠 풍부도 규칙]
각 섹션의 description 필드를 절대 빈 문자열로 두지 마세요. 최소 1~2문장의 의미 있는 설명을 작성하세요.
items 배열이 있는 섹션은 각 item의 description도 반드시 채워주세요.

[★ 텍스트 대비 필수 규칙 - 매우 중요]
- 밝은 배경(#ffffff, #f5f5f5 등) → 반드시 어두운 텍스트(#1a1a1a, #333333)
- 어두운 배경(#1a1a1a, #000000 등) → 반드시 밝은 텍스트(#ffffff, #f5f5f5)
- 배지/버튼이 밝은 색상(파스텔, 흰색 계열)이면 → 반드시 어두운 텍스트를 사용
- 배지/버튼이 어두운 색상이면 → 반드시 밝은 텍스트를 사용
- textColor와 backgroundColor의 대비비가 최소 4.5:1 이상이어야 합니다

[★ Hero 섹션 이미지 필수 - 이미지 없는 히어로는 실패!]
Hero 섹션에는 반드시 imagePrompt를 포함하세요. 상품/서비스를 강렬하게 보여주는 이미지가 있어야 방문자의 첫인상을 사로잡습니다.

[★ Testimonials 최소 3개 필수]
Testimonials 섹션의 items는 반드시 3개 이상 포함하세요. 후기 2개 이하는 신뢰도가 떨어져 전환율이 급감합니다.
각 후기는 이름, 직업/직책, 구체적인 체험 후기(2~3줄)를 포함해야 합니다.

[★ 짧은 텍스트 줄바꿈 금지]
카드 제목, 배지 텍스트, 기능 이름 등 짧은 텍스트는 한줄에 맞춰 작성하세요:
- items의 title: 10자 이내
- 배지/라벨: 6자 이내
- 넘칠 것 같으면 텍스트를 줄여 쓰세요 (예: "무제한 스트리밍 서비스 제공" → "무제한 스트리밍")

[★ 메인컬러 일관성]
brandColor가 지정되어 있으면 CTA 버튼 배경, 강조 텍스트, 배지, 아이콘 색상에 일관되게 사용하세요.
페이지 전체에 메인 컬러가 통일감 있게 나타나야 전문적으로 보입니다.

[★ 프로세스/데모 섹션 화려하게]
Process, Timeline 등 설명 위주 섹션은 단순 텍스트 나열 대신:
- 큰 인포그래픽 이미지 + 숫자 아이콘 조합으로 시각적 임팩트 극대화
- imagePrompt에 "infographic", "step-by-step visual" 등 구체적 키워드 포함`;
}

function buildImagePrompt(
  sectionType: string,
  sectionTitle: string,
  imagePrompt: string,
  category: string,
  tier: string,
  inputData?: Record<string, unknown>
): string {
  const template = CATEGORY_TEMPLATES[category as CategoryKey];
  const imageryStyle = template?.imagery?.style || 'photorealistic';
  const colorTone = template?.imagery?.colorTone || 'neutral';

  // 상품 주제 일관성을 위한 컨텍스트
  const productName = String(
    inputData?.productName || inputData?.storeName || inputData?.hospitalName ||
    inputData?.packageName || inputData?.gymName || inputData?.firmName ||
    inputData?.academyName || inputData?.eventName || inputData?.name || ''
  );

  // 등급별 품질 키워드
  const qualitySpec = IMAGE_PROMPT_QUALITY.find(q => q.tier === tier)
    || IMAGE_PROMPT_QUALITY.find(q => q.tier === 'standard')
    || { styleKeywords: ['professional'], qualityKeywords: ['high quality'] };

  // 섹션 타입별 구도 선택
  const compositionMap: Record<string, string> = {
    Hero: 'hero-shot',
    Gallery: 'flat-lay',
    Features: 'rule-of-thirds',
    Benefits: 'lifestyle',
    Testimonials: 'lifestyle',
    Team: 'center-composition',
    Stats: 'center-composition',
    Process: 'rule-of-thirds',
    DetailedProduct: 'hero-shot',
    Pricing: 'center-composition',
  };
  const compositionId = compositionMap[sectionType] || 'center-composition';
  const composition = COMPOSITION_RULES.find(c => c.id === compositionId) || COMPOSITION_RULES[0];

  // 카테고리별 조명 선택
  const lightingMap: Record<string, string> = {
    ecommerce: 'studio-clean',
    realestate: 'soft-natural',
    medical: 'studio-clean',
    education: 'high-key',
    restaurant: 'golden-hour',
    travel: 'golden-hour',
    wedding: 'soft-natural',
    legal: 'studio-clean',
    fitness: 'dramatic',
    saas: 'studio-clean',
    personal: 'soft-natural',
  };
  const lightingId = lightingMap[category] || 'studio-clean';
  const lighting = LIGHTING_STYLES.find(l => l.id === lightingId) || LIGHTING_STYLES[0];

  const brandColor = inputData?.brandColor ? String(inputData.brandColor) : '';

  const parts: string[] = [
    ...(productName ? [`Subject: ${productName}.`] : []),
    `Create a ${imageryStyle} ${category} commercial image`,
    `for a ${sectionType} section titled "${sectionTitle}"`,
    `Scene: ${imagePrompt}`,
    composition.examplePrompt,
    lighting.promptKeywords.join(', '),
    `Color tone: ${colorTone}`,
    ...(brandColor ? [`Brand color accent: ${brandColor}`] : []),
    qualitySpec.styleKeywords.join(', '),
    qualitySpec.qualityKeywords.join(', '),
    'Korean commercial detail page, no text overlays, 16:9 aspect ratio',
  ];

  return parts.join('. ');
}

function parsePuckData(text: string) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('JSON not found');

  const parsed = JSON.parse(jsonMatch[0]);

  if (!parsed.content || !Array.isArray(parsed.content)) {
    throw new Error('content array missing');
  }

  parsed.content = parsed.content.map(
    (item: Record<string, unknown>, index: number) => {
      let type = String(item.type);
      if (type.endsWith('Section') && type !== 'Section') {
        type = type.replace(/Section$/, '');
      }
      const props = (item.props || {}) as Record<string, unknown>;
      if (!props.id) {
        props.id = `${type.toLowerCase()}-${index}`;
      }
      return { ...item, type, props };
    }
  );

  if (!parsed.root) {
    parsed.root = { props: { title: 'Generated Page' } };
  }

  return parsed;
}

async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const mimeType = res.headers.get('content-type') || 'image/png';
    return { data: buf.toString('base64'), mimeType };
  } catch {
    return null;
  }
}

async function generateSectionImage(
  apiKey: string,
  sectionType: string,
  sectionTitle: string,
  imagePrompt: string,
  category: string,
  tier: string,
  inputData?: Record<string, unknown>,
  referenceImageUrl?: string,
): Promise<string | null> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  const prompt = buildImagePrompt(
    sectionType,
    sectionTitle,
    imagePrompt,
    category,
    tier,
    inputData
  );

  // 참고 이미지가 있으면 multimodal 컨텐츠 구성
  let refImage: { data: string; mimeType: string } | null = null;
  if (referenceImageUrl) {
    refImage = await fetchImageAsBase64(referenceImageUrl);
  }

  for (const model of IMAGE_MODELS) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let contents: any;
      if (refImage) {
        contents = [
          {
            inlineData: {
              mimeType: refImage.mimeType,
              data: refImage.data,
            },
          },
          {
            text: `Reference image above. Generate a NEW image inspired by this reference's style, composition, and mood.\n\n${prompt}`,
          },
        ];
      } else {
        contents = prompt;
      }

      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          responseModalities: ['image', 'text'],
        },
      });

      const parts = response.candidates?.[0]?.content?.parts;
      if (!parts) return null;

      const imagePart = parts.find(
        (p) => 'inlineData' in p && p.inlineData
      );
      if (!imagePart || !('inlineData' in imagePart) || !imagePart.inlineData?.data) return null;

      return imagePart.inlineData.data as string;
    } catch (err) {
      if (isServerOverloadError(err)) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      console.error(`Image generation failed for ${sectionType}:`, err);
      return null;
    }
  }

  return null;
}

async function uploadImageToSupabase(
  projectId: string,
  sectionId: string,
  imageBase64: string
): Promise<string | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  try {
    const buffer = Buffer.from(imageBase64, 'base64');
    const filePath = `${projectId}/${sectionId}.png`;

    const { error } = await admin.storage
      .from(IMAGE_BUCKET)
      .upload(filePath, buffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return null;
    }

    const {
      data: { publicUrl },
    } = admin.storage.from(IMAGE_BUCKET).getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.error('Upload failed:', err);
    return null;
  }
}

/**
 * POST /api/generate
 * @description 카테고리와 입력 데이터를 기반으로 상세페이지를 생성한다
 */
export async function POST(request: Request) {
  try {
    await ensureStorageBucket(IMAGE_BUCKET);

    const supabase = await createClient();
    if (!supabase) return unauthorizedError();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return unauthorizedError();

    const body = await request.json();
    const { category, inputData, pixelHeight = '8000', referenceAnalysis, sectionConfigs } = body;

    if (!category) {
      return validationError('카테고리는 필수입니다');
    }
    if (!inputData && !sectionConfigs) {
      return validationError('입력 데이터 또는 섹션 설정이 필요합니다');
    }

    const { data: settings } = await supabase
      .from('user_settings')
      .select('gemini_api_key')
      .eq('user_id', user.id)
      .single();

    const apiKey = settings?.gemini_api_key;
    if (!apiKey) {
      return validationError(
        '마이페이지에서 Gemini API 키를 먼저 등록해주세요'
      );
    }

    // config에서 프리셋 가져오기
    const preset = PIXEL_PRESETS[String(pixelHeight)] || PIXEL_PRESETS['8000'];
    const sectionCount = preset.sectionCount;
    const tier = preset.tier;

    // Step 1: config 기반 프롬프트로 텍스트/구조 생성 (모델 폴백 적용)
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    // sectionConfigs가 있으면 프롬프트에 섹션별 지시사항 주입
    const sectionConfigContext = buildSectionConfigContext(sectionConfigs);

    const textPrompt = buildTextPrompt(
      category, inputData || {}, sectionConfigs ? (sectionConfigs as SectionConfigInput[]).filter((s: SectionConfigInput) => s.type).length : sectionCount, tier,
      referenceAnalysis as Record<string, unknown> | null,
      sectionConfigContext,
    );

    let textResponse: string | undefined;
    let textGenError: Error | null = null;

    for (const model of TEXT_MODELS) {
      try {
        const textResult = await ai.models.generateContent({
          model,
          contents: textPrompt,
        });
        textResponse = textResult.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textResponse) break;
        throw new Error('텍스트 생성 결과가 비어 있습니다');
      } catch (err) {
        textGenError = err instanceof Error ? err : new Error(String(err));
        if (isServerOverloadError(err)) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        break;
      }
    }

    if (!textResponse) {
      return externalApiError(textGenError?.message || '텍스트 생성 결과가 비어 있습니다');
    }

    let puckData;
    try {
      puckData = parsePuckData(textResponse);
    } catch {
      return externalApiError('AI 응답 파싱에 실패했습니다');
    }

    // sectionConfigs에서 참고 이미지 URL 맵 구성
    const refImageMap = new Map<number, string>();
    if (sectionConfigs && Array.isArray(sectionConfigs)) {
      (sectionConfigs as SectionConfigInput[]).forEach((c, i) => {
        if (c.referenceImageUrl) {
          refImageMap.set(i, c.referenceImageUrl);
        }
      });
    }

    // 프로젝트 생성
    const safeInputData = inputData || {};
    const firstInputValue = Object.values(safeInputData)[0];
    const title =
      typeof firstInputValue === 'string'
        ? firstInputValue
        : `${category} project`;

    const { data: project, error: dbError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        title,
        category,
        status: 'generating',
        puck_data: puckData,
        input_data: safeInputData,
      })
      .select()
      .single();

    if (dbError) return internalError();

    // Step 2: 각 섹션별 이미지 생성 (tier 정보 전달)
    const sections = puckData.content as Array<{
      type: string;
      props: Record<string, unknown>;
    }>;

    const imagePromises = sections.map(async (section, sectionIndex) => {
      const props = section.props;
      const sectionImagePrompt = (props.imagePrompt as string) || '';
      if (!sectionImagePrompt) return null;

      const refUrl = refImageMap.get(sectionIndex);

      const base64 = await generateSectionImage(
        apiKey,
        section.type,
        String(props.title || ''),
        sectionImagePrompt,
        category,
        tier,
        safeInputData,
        refUrl,
      );

      if (!base64) return null;

      const publicUrl = await uploadImageToSupabase(
        project.id,
        String(props.id),
        base64
      );

      return { sectionId: props.id, imageUrl: publicUrl };
    });

    const imageResults = await Promise.allSettled(imagePromises);

    // 이미지 URL을 puck 데이터에 연결
    const imageMap = new Map<string, string>();
    for (const result of imageResults) {
      if (result.status === 'fulfilled' && result.value) {
        imageMap.set(
          String(result.value.sectionId),
          String(result.value.imageUrl)
        );
      }
    }

    puckData.content = sections.map((section) => {
      const imageUrl = imageMap.get(String(section.props.id));
      if (imageUrl) {
        section.props.imageUrl = imageUrl;
      }
      return section;
    });

    // 프로젝트 업데이트
    await supabase
      .from('projects')
      .update({
        puck_data: puckData,
        status: 'draft',
      })
      .eq('id', project.id);

    await supabase.from('generation_logs').insert({
      project_id: project.id,
      user_id: user.id,
      prompt: textPrompt,
      category,
      input_data: safeInputData,
      output_data: puckData,
      model_version: `${TEXT_MODELS[0]} + ${IMAGE_MODELS[0]}`,
      tokens_used: 0,
    });

    return NextResponse.json({
      ok: true,
      data: {
        projectId: project.id,
        puckData,
        imagesGenerated: imageMap.size,
        totalSections: sections.length,
      },
    });
  } catch {
    return internalError();
  }
}
