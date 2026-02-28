/**
 * 레퍼런스 분석기
 * 이미지를 Gemini Vision으로 분석하여 픽셀 수준의 디자인 구조를 추출한다.
 */

import type { ReferenceAnalysis, DetailedSection, SectionElement, GradientDef, GlobalStructure } from '@/lib/figma/types';

// 503 에러 시 폴백 모델 체인 (preview → stable pro → stable flash)
const VISION_MODELS = [
  'gemini-3-pro-preview',
  'gemini-2.5-pro',
  'gemini-2.5-flash',
] as const;
const MODEL_SWITCH_DELAY = 2000;

function isServerOverloadError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /503|429|500|502|504|UNAVAILABLE|overloaded|quota|rate.?limit|resource.?exhausted/i.test(msg);
}

const ANALYSIS_PROMPT = `
당신은 웹 디자인 분석 전문가다.
이 상세페이지/웹페이지 스크린샷을 픽셀 수준으로 정밀 분석하여 피그마에서 1:1 복제할 수 있는 구조 데이터를 JSON으로 추출하라.

반드시 아래 형식의 JSON만 출력하라. 설명이나 마크다운 없이:
{
  "colorPalette": {
    "primary": "#hex (메인 브랜드 색상)",
    "secondary": "#hex (보조 색상)",
    "accent": "#hex (강조 색상)",
    "background": "#hex (전체 배경색)",
    "text": "#hex (본문 텍스트 색상)",
    "additionalColors": ["#hex", "#hex", "...사용된 모든 고유 색상"]
  },
  "sections": [
    {
      "type": "hero|features|benefits|gallery|testimonials|process|pricing|faq|stats|team|about|contact|cta|comparison|timeline|footer|navigation|banner|partner-logos",
      "layout": "full-width|two-column|three-column|grid-2x2|grid-3x3|center|left-image|right-image|split|zigzag|stacked",
      "hasImage": true,
      "hasText": true,
      "estimatedHeight": 800,
      "backgroundColor": "#hex 또는 null(투명)",
      "backgroundGradient": {
        "type": "linear|radial|angular",
        "colors": [{"color": "#hex", "position": 0}, {"color": "#hex", "position": 1}],
        "angle": 180
      },
      "padding": {"top": 80, "right": 60, "bottom": 80, "left": 60},
      "gap": 32,
      "contentWidth": 1200,
      "contentAlign": "center",
      "elements": [
        {
          "type": "heading|subheading|body-text|caption|image|button|card|icon|divider|badge|form-input|list-item",
          "x": 120,
          "y": 100,
          "width": 800,
          "height": 60,
          "text": "실제 텍스트 내용 (있으면)",
          "fontSize": 48,
          "fontWeight": 700,
          "fontFamily": "Pretendard 또는 추정 폰트",
          "letterSpacing": -0.5,
          "lineHeight": 1.3,
          "textAlign": "CENTER",
          "textColor": "#hex",
          "backgroundColor": "#hex 또는 null",
          "gradient": null,
          "borderRadius": 12,
          "border": {"color": "#hex", "width": 1},
          "shadow": {"x": 0, "y": 4, "blur": 16, "spread": 0, "color": "rgba(0,0,0,0.1)"},
          "opacity": 1.0,
          "imageDescription": "이미지인 경우 내용 설명"
        }
      ]
    }
  ],
  "typography": {
    "headingStyle": "bold|light|elegant|playful",
    "bodyStyle": "clean|warm|technical",
    "headingSize": 48,
    "bodySize": 16,
    "headingFont": "추정 폰트명",
    "bodyFont": "추정 폰트명",
    "headingWeight": 700,
    "bodyWeight": 400,
    "headingLetterSpacing": -0.5,
    "bodyLineHeight": 1.6
  },
  "overallStyle": "modern-minimal|corporate|creative|luxury|playful|editorial|dark-premium|gradient-modern",
  "totalHeight": 8000,
  "spacing": {
    "sectionGap": 0,
    "contentMaxWidth": 1200,
    "defaultPadding": {"top": 80, "right": 60, "bottom": 80, "left": 60}
  },
  "effects": {
    "gradients": [
      {"type": "linear", "colors": [{"color": "#hex", "position": 0}, {"color": "#hex", "position": 1}], "angle": 135, "usage": "hero 배경"}
    ],
    "shadows": [
      {"x": 0, "y": 4, "blur": 24, "spread": 0, "color": "rgba(0,0,0,0.08)", "usage": "카드"}
    ],
    "hasGlassEffect": false,
    "hasParallax": false
  }
}

분석 규칙:
1. 모든 섹션을 위에서 아래 순서대로 빠짐없이 분석하라.
2. 각 섹션 내부의 모든 시각적 요소(텍스트, 이미지, 버튼, 카드, 아이콘, 구분선 등)를 elements 배열에 넣어라.
3. 색상은 실제 사용된 HEX 코드를 최대한 정확하게 추출하라.
4. 텍스트가 보이면 실제 텍스트 내용, 폰트 크기, 굵기, 색상을 추출하라.
5. 이미지는 위치, 크기, 설명을 넣고 type을 "image"로 설정하라.
6. 버튼은 배경색, 텍스트, 둥글기, 패딩을 정확히 분석하라.
7. 카드 컴포넌트는 그림자, 둥글기, 배경색, 보더를 분석하라.
8. 그라데이션이 있으면 색상, 방향, 사용 위치를 모두 기록하라.
9. 섹션 간 간격, 내부 패딩, 요소 간 갭을 픽셀 단위로 추정하라.
10. 전체 페이지 높이(totalHeight)는 모든 섹션 높이의 합이다.
11. elements의 x, y 좌표는 해당 섹션 내부 기준이다.
12. 폰트 추정이 어려우면 "Pretendard"를 기본값으로 사용하라.
13. JSON만 출력하라. 설명이나 마크다운 절대 금지.
`.trim();

/**
 * 엘리먼트 데이터를 SectionElement 타입으로 변환한다.
 */
function parseSectionElement(raw: Record<string, unknown>): SectionElement {
  const element: SectionElement = {
    type: (raw.type as SectionElement['type']) || 'body-text',
    x: Number(raw.x) || 0,
    y: Number(raw.y) || 0,
    width: Number(raw.width) || 100,
    height: Number(raw.height) || 40,
  };

  if (raw.text) element.text = String(raw.text);
  if (raw.fontSize) element.fontSize = Number(raw.fontSize);
  if (raw.fontWeight) element.fontWeight = Number(raw.fontWeight);
  if (raw.fontFamily) element.fontFamily = String(raw.fontFamily);
  if (raw.letterSpacing != null) element.letterSpacing = Number(raw.letterSpacing);
  if (raw.lineHeight != null) element.lineHeight = Number(raw.lineHeight);
  if (raw.textAlign) element.textAlign = raw.textAlign as SectionElement['textAlign'];
  if (raw.textColor) element.textColor = String(raw.textColor);
  if (raw.backgroundColor) element.backgroundColor = String(raw.backgroundColor);
  if (raw.borderRadius != null) element.borderRadius = Number(raw.borderRadius);
  if (raw.opacity != null) element.opacity = Number(raw.opacity);
  if (raw.imageDescription) element.imageDescription = String(raw.imageDescription);

  if (raw.gradient && typeof raw.gradient === 'object') {
    element.gradient = parseGradient(raw.gradient as Record<string, unknown>);
  }

  if (raw.border && typeof raw.border === 'object') {
    const b = raw.border as Record<string, unknown>;
    element.border = {
      color: String(b.color || '#E5E7EB'),
      width: Number(b.width) || 1,
    };
  }

  if (raw.shadow && typeof raw.shadow === 'object') {
    const s = raw.shadow as Record<string, unknown>;
    element.shadow = {
      x: Number(s.x) || 0,
      y: Number(s.y) || 4,
      blur: Number(s.blur) || 16,
      spread: Number(s.spread) || 0,
      color: String(s.color || 'rgba(0,0,0,0.1)'),
    };
  }

  return element;
}

/**
 * 그라데이션 데이터를 GradientDef 타입으로 변환한다.
 */
function parseGradient(raw: Record<string, unknown>): GradientDef {
  const gradient: GradientDef = {
    type: (raw.type as GradientDef['type']) || 'linear',
    colors: [],
  };

  if (Array.isArray(raw.colors)) {
    gradient.colors = raw.colors.map((c: unknown) => {
      if (typeof c === 'object' && c !== null) {
        const obj = c as Record<string, unknown>;
        return {
          color: String(obj.color || '#000000'),
          position: Number(obj.position) || 0,
        };
      }
      return { color: String(c), position: 0 };
    });
  }

  if (raw.angle != null) gradient.angle = Number(raw.angle);

  return gradient;
}

/**
 * 패딩 데이터를 파싱한다.
 */
function parsePadding(raw: unknown): { top: number; right: number; bottom: number; left: number } {
  if (!raw || typeof raw !== 'object') {
    return { top: 60, right: 40, bottom: 60, left: 40 };
  }
  const p = raw as Record<string, unknown>;
  return {
    top: Number(p.top) || 60,
    right: Number(p.right) || 40,
    bottom: Number(p.bottom) || 60,
    left: Number(p.left) || 40,
  };
}

/**
 * Gemini Vision 응답에서 JSON을 파싱한다.
 */
export function parseAnalysisResponse(text: string): Omit<ReferenceAnalysis, 'analysisId' | 'screenshot'> {
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('분석 결과에서 JSON을 찾을 수 없습니다');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  if (!parsed.colorPalette || !parsed.sections || !Array.isArray(parsed.sections)) {
    throw new Error('분석 결과가 올바른 형식이 아닙니다');
  }

  // 섹션 파싱 (상세 엘리먼트 포함)
  const sections: DetailedSection[] = parsed.sections.map((s: Record<string, unknown>) => {
    const section: DetailedSection = {
      type: String(s.type || 'unknown'),
      layout: String(s.layout || 'full-width'),
      hasImage: Boolean(s.hasImage),
      hasText: Boolean(s.hasText),
      estimatedHeight: Number(s.estimatedHeight) || 600,
      elements: [],
    };

    if (s.backgroundColor) section.backgroundColor = String(s.backgroundColor);
    if (s.gap != null) section.gap = Number(s.gap);
    if (s.contentWidth) section.contentWidth = Number(s.contentWidth);
    if (s.contentAlign) section.contentAlign = s.contentAlign as DetailedSection['contentAlign'];
    if (s.padding) section.padding = parsePadding(s.padding);

    if (s.backgroundGradient && typeof s.backgroundGradient === 'object') {
      section.backgroundGradient = parseGradient(s.backgroundGradient as Record<string, unknown>);
    }

    if (Array.isArray(s.elements)) {
      section.elements = s.elements.map((e: Record<string, unknown>) => parseSectionElement(e));
    }

    return section;
  });

  // 이펙트 파싱
  const effects = parsed.effects ? {
    gradients: Array.isArray(parsed.effects.gradients)
      ? parsed.effects.gradients.map((g: Record<string, unknown>) => ({
          ...parseGradient(g),
          usage: String(g.usage || ''),
        }))
      : [],
    shadows: Array.isArray(parsed.effects.shadows)
      ? parsed.effects.shadows.map((s: Record<string, unknown>) => ({
          x: Number(s.x) || 0,
          y: Number(s.y) || 4,
          blur: Number(s.blur) || 16,
          spread: Number(s.spread) || 0,
          color: String(s.color || 'rgba(0,0,0,0.1)'),
          usage: String(s.usage || ''),
        }))
      : [],
    hasGlassEffect: Boolean(parsed.effects.hasGlassEffect),
    hasParallax: Boolean(parsed.effects.hasParallax),
  } : undefined;

  // 스페이싱 파싱
  const spacing = parsed.spacing ? {
    sectionGap: Number(parsed.spacing.sectionGap) || 0,
    contentMaxWidth: Number(parsed.spacing.contentMaxWidth) || 1200,
    defaultPadding: parsePadding(parsed.spacing.defaultPadding),
  } : undefined;

  return {
    colorPalette: {
      primary: parsed.colorPalette.primary || '#6366F1',
      secondary: parsed.colorPalette.secondary || '#8B5CF6',
      accent: parsed.colorPalette.accent || '#06B6D4',
      background: parsed.colorPalette.background || '#FFFFFF',
      text: parsed.colorPalette.text || '#1A1A1A',
      additionalColors: Array.isArray(parsed.colorPalette.additionalColors)
        ? parsed.colorPalette.additionalColors.map(String)
        : undefined,
    },
    sections,
    typography: {
      headingStyle: String(parsed.typography?.headingStyle || 'bold'),
      bodyStyle: String(parsed.typography?.bodyStyle || 'clean'),
      headingSize: Number(parsed.typography?.headingSize) || 48,
      bodySize: Number(parsed.typography?.bodySize) || 16,
      headingFont: parsed.typography?.headingFont ? String(parsed.typography.headingFont) : undefined,
      bodyFont: parsed.typography?.bodyFont ? String(parsed.typography.bodyFont) : undefined,
      headingWeight: parsed.typography?.headingWeight ? Number(parsed.typography.headingWeight) : undefined,
      bodyWeight: parsed.typography?.bodyWeight ? Number(parsed.typography.bodyWeight) : undefined,
      headingLetterSpacing: parsed.typography?.headingLetterSpacing != null
        ? Number(parsed.typography.headingLetterSpacing) : undefined,
      bodyLineHeight: parsed.typography?.bodyLineHeight != null
        ? Number(parsed.typography.bodyLineHeight) : undefined,
    },
    overallStyle: String(parsed.overallStyle || 'modern-minimal'),
    totalHeight: Number(parsed.totalHeight) || 4000,
    spacing,
    effects,
  };
}

/**
 * 이미지(Base64)를 분석한다.
 */
export async function analyzeImage(
  apiKey: string,
  imageBase64: string,
  mimeType: string = 'image/png'
): Promise<ReferenceAnalysis> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  let lastError: Error | null = null;

  for (const model of VISION_MODELS) {
    try {
      const result = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { data: imageBase64, mimeType } },
              { text: ANALYSIS_PROMPT },
            ],
          },
        ],
        config: {
          maxOutputTokens: 65536,
          temperature: 0.3,
        },
      });

      const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) {
        throw new Error('분석 응답이 비어 있습니다');
      }

      const analysis = parseAnalysisResponse(responseText);
      const analysisId = `ref_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      return {
        analysisId,
        ...analysis,
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (isServerOverloadError(err)) {
        await new Promise(resolve => setTimeout(resolve, MODEL_SWITCH_DELAY));
        continue;
      }
      throw lastError;
    }
  }

  throw lastError || new Error('이미지 분석에 실패했습니다 (모든 모델 실패)');
}

// ===== 2단계 분석 파이프라인 (Codia 패턴) =====

const STAGE1_PROMPT = `
당신은 웹 디자인 구조 분석 전문가다.
이 상세페이지/웹페이지 스크린샷의 전체 구조만 빠르게 분석하라.
개별 엘리먼트의 상세 분석은 하지 않는다. 전체 섹션 구분과 스타일만 파악하라.

반드시 아래 형식의 JSON만 출력하라:
{
  "totalHeight": 8000,
  "canvasWidth": 1440,
  "sectionCount": 8,
  "sections": [
    {
      "type": "hero|features|benefits|gallery|testimonials|process|pricing|faq|stats|team|about|contact|cta|comparison|timeline|footer|navigation|banner",
      "estimatedHeight": 800,
      "backgroundColor": "#hex 또는 null",
      "layout": "full-width|two-column|three-column|grid|center|left-image|right-image|split"
    }
  ],
  "colorPalette": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "text": "#hex",
    "additionalColors": ["#hex"]
  },
  "typography": {
    "headingStyle": "bold|light|elegant",
    "bodyStyle": "clean|warm|technical",
    "headingSize": 48,
    "bodySize": 16,
    "headingFont": "추정 폰트",
    "bodyFont": "추정 폰트",
    "headingWeight": 700,
    "bodyWeight": 400,
    "headingLetterSpacing": -0.5,
    "bodyLineHeight": 1.6
  },
  "overallStyle": "modern-minimal|corporate|creative|luxury|dark-premium|gradient-modern"
}

규칙:
1. 섹션을 위에서 아래로 순서대로 나열하라.
2. 색상은 실제 HEX 코드를 최대한 정확하게 추출하라.
3. 폰트가 불확실하면 "Pretendard" 기본값.
4. JSON만 출력. 설명 금지.
`.trim();

/**
 * Stage1: 전체 구조를 빠르게 파악한다.
 * 섹션 구분, 색상 팔레트, 타이포그래피만 추출. 토큰을 절약한다.
 */
export async function analyzeImageStage1(
  apiKey: string,
  imageBase64: string,
  mimeType: string = 'image/png'
): Promise<GlobalStructure> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  let lastError: Error | null = null;
  let responseText: string | undefined;

  for (const model of VISION_MODELS) {
    try {
      const result = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { data: imageBase64, mimeType } },
              { text: STAGE1_PROMPT },
            ],
          },
        ],
        config: {
          maxOutputTokens: 8192,
          temperature: 0.2,
        },
      });

      responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (responseText) break;
      throw new Error('Stage1 분석 응답이 비어 있습니다');
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (isServerOverloadError(err)) {
        await new Promise(resolve => setTimeout(resolve, MODEL_SWITCH_DELAY));
        continue;
      }
      throw lastError;
    }
  }

  if (!responseText) {
    throw lastError || new Error('Stage1 분석에 실패했습니다 (모든 모델 실패)');
  }

  const cleaned = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Stage1 응답에서 JSON을 찾을 수 없습니다');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    totalHeight: Number(parsed.totalHeight) || 4000,
    canvasWidth: Number(parsed.canvasWidth) || 1440,
    sectionCount: Number(parsed.sectionCount) || parsed.sections?.length || 5,
    sections: Array.isArray(parsed.sections)
      ? parsed.sections.map((s: Record<string, unknown>) => ({
          type: String(s.type || 'unknown'),
          estimatedHeight: Number(s.estimatedHeight) || 600,
          backgroundColor: s.backgroundColor ? String(s.backgroundColor) : undefined,
          layout: String(s.layout || 'full-width'),
        }))
      : [],
    colorPalette: {
      primary: parsed.colorPalette?.primary || '#6366F1',
      secondary: parsed.colorPalette?.secondary || '#8B5CF6',
      accent: parsed.colorPalette?.accent || '#06B6D4',
      background: parsed.colorPalette?.background || '#FFFFFF',
      text: parsed.colorPalette?.text || '#1A1A1A',
      additionalColors: Array.isArray(parsed.colorPalette?.additionalColors)
        ? parsed.colorPalette.additionalColors.map(String)
        : undefined,
    },
    typography: {
      headingStyle: String(parsed.typography?.headingStyle || 'bold'),
      bodyStyle: String(parsed.typography?.bodyStyle || 'clean'),
      headingSize: Number(parsed.typography?.headingSize) || 48,
      bodySize: Number(parsed.typography?.bodySize) || 16,
      headingFont: parsed.typography?.headingFont ? String(parsed.typography.headingFont) : undefined,
      bodyFont: parsed.typography?.bodyFont ? String(parsed.typography.bodyFont) : undefined,
      headingWeight: parsed.typography?.headingWeight ? Number(parsed.typography.headingWeight) : undefined,
      bodyWeight: parsed.typography?.bodyWeight ? Number(parsed.typography.bodyWeight) : undefined,
      headingLetterSpacing: parsed.typography?.headingLetterSpacing != null
        ? Number(parsed.typography.headingLetterSpacing) : undefined,
      bodyLineHeight: parsed.typography?.bodyLineHeight != null
        ? Number(parsed.typography.bodyLineHeight) : undefined,
    },
    overallStyle: String(parsed.overallStyle || 'modern-minimal'),
  };
}

function buildStage2Prompt(
  globalStructure: GlobalStructure,
  sectionIndices: number[]
): string {
  const sectionList = sectionIndices
    .map(i => {
      const s = globalStructure.sections[i];
      return s ? `${i + 1}번: ${s.type} (${s.layout}, ${s.estimatedHeight}px, bg=${s.backgroundColor || 'none'})` : '';
    })
    .filter(Boolean)
    .join('\n');

  return `
당신은 웹 디자인 엘리먼트 분석 전문가다.
이 상세페이지에서 다음 섹션들의 내부 엘리먼트를 정밀 분석하라.

분석할 섹션:
${sectionList}

전체 페이지 정보:
- 캔버스 폭: ${globalStructure.canvasWidth}px
- 전체 높이: ${globalStructure.totalHeight}px
- 색상 팔레트: primary=${globalStructure.colorPalette.primary}, secondary=${globalStructure.colorPalette.secondary}

반드시 아래 형식의 JSON만 출력하라:
{
  "sections": [
    {
      "index": 1,
      "type": "hero",
      "layout": "full-width",
      "hasImage": true,
      "hasText": true,
      "estimatedHeight": 800,
      "backgroundColor": "#hex 또는 null",
      "backgroundGradient": null,
      "padding": {"top": 80, "right": 60, "bottom": 80, "left": 60},
      "gap": 32,
      "contentWidth": 1200,
      "contentAlign": "center",
      "elements": [
        {
          "type": "heading|subheading|body-text|caption|image|button|card|icon|divider|badge|form-input|list-item",
          "x": 120, "y": 100, "width": 800, "height": 60,
          "text": "실제 텍스트 내용",
          "fontSize": 48, "fontWeight": 700,
          "fontFamily": "Pretendard",
          "letterSpacing": -0.5, "lineHeight": 1.3,
          "textAlign": "CENTER",
          "textColor": "#hex",
          "backgroundColor": "#hex 또는 null",
          "gradient": null,
          "borderRadius": 12,
          "border": null,
          "shadow": {"x": 0, "y": 4, "blur": 16, "spread": 0, "color": "rgba(0,0,0,0.1)"},
          "opacity": 1.0,
          "imageDescription": "이미지인 경우 설명"
        }
      ]
    }
  ]
}

규칙:
1. 지정된 섹션만 분석하라. 다른 섹션은 포함하지 마라.
2. 각 섹션의 모든 시각적 요소를 빠짐없이 elements에 넣어라.
3. x, y 좌표는 해당 섹션 내부 기준.
4. 텍스트가 보이면 실제 내용, 크기, 굵기, 색상을 최대한 정확히 추출하라.
5. 이미지는 크기, 위치, 설명 포함.
6. 버튼의 배경색, 텍스트, 둥글기 분석.
7. 카드의 그림자, 둥글기, 보더 분석.
8. JSON만 출력. 설명 금지.
`.trim();
}

/**
 * Stage2: 섹션별 상세 분석.
 * globalStructure를 참고하여 3개씩 병렬로 섹션 내부 엘리먼트를 정밀 추출한다.
 */
export async function analyzeImageStage2(
  apiKey: string,
  imageBase64: string,
  globalStructure: GlobalStructure,
  mimeType: string = 'image/png'
): Promise<DetailedSection[]> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  const sectionCount = globalStructure.sections.length;
  const BATCH_SIZE = 3;
  const allSections: DetailedSection[] = new Array(sectionCount);

  // 3개씩 병렬 처리
  for (let batch = 0; batch < sectionCount; batch += BATCH_SIZE) {
    const indices = [];
    for (let i = batch; i < Math.min(batch + BATCH_SIZE, sectionCount); i++) {
      indices.push(i);
    }

    const prompt = buildStage2Prompt(globalStructure, indices);
    let batchSuccess = false;

    for (const model of VISION_MODELS) {
      if (batchSuccess) break;
      try {
        const result = await ai.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [
                { inlineData: { data: imageBase64, mimeType } },
                { text: prompt },
              ],
            },
          ],
          config: {
            maxOutputTokens: 32768,
            temperature: 0.3,
          },
        });

        const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) {
          throw new Error(`Stage2 배치 ${batch} 응답이 비어 있습니다`);
        }

        const cleaned = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error(`Stage2 배치 ${batch} 응답에서 JSON을 찾을 수 없습니다`);
        }

        const parsed = JSON.parse(jsonMatch[0]);

        if (Array.isArray(parsed.sections)) {
          for (const rawSection of parsed.sections) {
            const idx = Number(rawSection.index) - 1;
            if (idx < 0 || idx >= sectionCount) continue;

            allSections[idx] = {
              type: String(rawSection.type || globalStructure.sections[idx]?.type || 'unknown'),
              layout: String(rawSection.layout || globalStructure.sections[idx]?.layout || 'full-width'),
              hasImage: Boolean(rawSection.hasImage),
              hasText: Boolean(rawSection.hasText),
              estimatedHeight: Number(rawSection.estimatedHeight) || globalStructure.sections[idx]?.estimatedHeight || 600,
              backgroundColor: rawSection.backgroundColor ? String(rawSection.backgroundColor) : globalStructure.sections[idx]?.backgroundColor,
              backgroundGradient: rawSection.backgroundGradient
                ? parseGradient(rawSection.backgroundGradient)
                : undefined,
              padding: rawSection.padding ? parsePadding(rawSection.padding) : undefined,
              gap: rawSection.gap ? Number(rawSection.gap) : undefined,
              contentWidth: rawSection.contentWidth ? Number(rawSection.contentWidth) : undefined,
              contentAlign: rawSection.contentAlign as DetailedSection['contentAlign'],
              elements: Array.isArray(rawSection.elements)
                ? rawSection.elements.map((e: Record<string, unknown>) => parseSectionElement(e))
                : [],
            };
          }
        }
        batchSuccess = true;
      } catch (err) {
        if (isServerOverloadError(err)) {
          await new Promise(resolve => setTimeout(resolve, MODEL_SWITCH_DELAY));
          continue;
        }
        break;
      }
    }

    // 모든 모델 실패 시 Stage1 데이터로 폴백
    if (!batchSuccess) {
      for (const idx of indices) {
        if (!allSections[idx]) {
          const s1 = globalStructure.sections[idx];
          allSections[idx] = {
            type: s1?.type || 'unknown',
            layout: s1?.layout || 'full-width',
            hasImage: true,
            hasText: true,
            estimatedHeight: s1?.estimatedHeight || 600,
            backgroundColor: s1?.backgroundColor,
            elements: [],
          };
        }
      }
    }
  }

  // 빈 슬롯 폴백 처리
  for (let i = 0; i < sectionCount; i++) {
    if (!allSections[i]) {
      const s1 = globalStructure.sections[i];
      allSections[i] = {
        type: s1?.type || 'unknown',
        layout: s1?.layout || 'full-width',
        hasImage: true,
        hasText: true,
        estimatedHeight: s1?.estimatedHeight || 600,
        backgroundColor: s1?.backgroundColor,
        elements: [],
      };
    }
  }

  return allSections;
}

/**
 * 2단계 분석 통합 함수.
 * Stage1(전체 구조) + Stage2(섹션별 상세)를 합쳐서 ReferenceAnalysis를 반환.
 * 기존 analyzeImage와 같은 반환 타입이므로 호환된다.
 */
export async function analyzeImageTwoStage(
  apiKey: string,
  imageBase64: string,
  mimeType: string = 'image/png'
): Promise<ReferenceAnalysis> {
  // Stage1: 전체 구조
  const globalStructure = await analyzeImageStage1(apiKey, imageBase64, mimeType);

  // Stage2: 섹션별 상세
  const detailedSections = await analyzeImageStage2(apiKey, imageBase64, globalStructure, mimeType);

  const analysisId = `ref_2stage_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  return {
    analysisId,
    colorPalette: globalStructure.colorPalette,
    sections: detailedSections,
    typography: globalStructure.typography,
    overallStyle: globalStructure.overallStyle,
    totalHeight: globalStructure.totalHeight,
    spacing: {
      sectionGap: 0,
      contentMaxWidth: globalStructure.canvasWidth,
      defaultPadding: { top: 80, right: 60, bottom: 80, left: 60 },
    },
  };
}

/**
 * URL에서 스크린샷을 캡처하고 분석한다.
 * Gemini에 URL을 텍스트로 전달하고 웹사이트 분석 요청.
 */
export async function analyzeUrl(
  apiKey: string,
  url: string
): Promise<ReferenceAnalysis> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  const urlPrompt = `
다음 웹사이트 URL의 디자인을 분석하라: ${url}

이 URL에 접속했을 때 보이는 웹페이지의 디자인 구조를 추정하여 분석하라.
URL의 도메인과 경로에서 유추할 수 있는 정보(업종, 목적 등)를 활용하라.

${ANALYSIS_PROMPT}
`;

  let lastError: Error | null = null;
  let responseText: string | undefined;

  for (const model of VISION_MODELS) {
    try {
      const result = await ai.models.generateContent({
        model,
        contents: urlPrompt,
        config: {
          maxOutputTokens: 65536,
          temperature: 0.3,
        },
      });

      responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (responseText) break;
      throw new Error('분석 응답이 비어 있습니다');
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (isServerOverloadError(err)) {
        await new Promise(resolve => setTimeout(resolve, MODEL_SWITCH_DELAY));
        continue;
      }
      throw lastError;
    }
  }

  if (!responseText) {
    throw lastError || new Error('URL 분석에 실패했습니다 (모든 모델 실패)');
  }

  const analysis = parseAnalysisResponse(responseText);
  const analysisId = `ref_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  return {
    analysisId,
    ...analysis,
  };
}
