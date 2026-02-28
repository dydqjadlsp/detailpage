/**
 * 피그마 디자인 프롬프트 빌더
 * config 14개 파일의 설정을 활용해서 Gemini에 보낼 프롬프트를 구성한다.
 * 출력: 피그마 커맨드 JSON 배열
 */

import {
  getCategoryTemplate,
  getCategoryTone,
  getRecommendedFormulas,
  NINE_STEP_FORMULA,
  PIXEL_PRESETS,
  generateSectionOrder,
  calculateSectionHeights,
  getPrinciplesBySection,
  getImagePromptQuality,
  buildStrategyContext,
} from '@/config';

import type { FigmaGenerateRequest, ReferenceAnalysis } from './types';
import { extractInputField, extractInputArray } from './types';

const CANVAS_WIDTH = 1440;
const DEFAULT_PIXEL_HEIGHT = '8000';

// 카테고리 컨텍스트를 축약해서 토큰 절약
function buildCategoryContext(category: string): string {
  const template = getCategoryTemplate(category);
  const tone = getCategoryTone(category);
  const formulas = getRecommendedFormulas(category);

  const lines: string[] = [
    `[카테고리] ${template.name} - ${template.description}`,
    `[색상] primary: ${template.colorScheme.primary}, secondary: ${template.colorScheme.secondary}, accent: ${template.colorScheme.accent}, 모드: ${template.colorScheme.mode}, 배경: ${template.colorScheme.backgroundStyle}`,
    `[타이포] 제목: ${template.typography.headingStyle}, 본문: ${template.typography.bodyStyle}, 강조: ${template.typography.fontEmphasis}`,
    `[레이아웃] 밀도: ${template.layout.density}, 이미지비율: ${template.layout.imageRatio}, 섹션교차: ${template.layout.sectionAlternation}`,
    `[이미지 스타일] ${template.imagery.style}, 톤: ${template.imagery.colorTone}, 구도: ${template.imagery.composition.join(', ')}`,
    `[카피 톤] ${tone.voiceCharacteristics.join(', ')}`,
    `[파워워드] ${tone.powerWords.join(', ')}`,
    `[DO] ${tone.doList.join(' | ')}`,
    `[DON'T] ${tone.dontList.join(' | ')}`,
    `[특수 요소] ${template.specialElements.join(', ')}`,
    `[추천 카피 공식] ${formulas.map(f => `${f.name}(${f.acronym})`).join(', ')}`,
  ];

  return lines.join('\n');
}

// 섹션별 디자인 가이드 생성
function buildSectionGuide(sections: string[], pixelHeight: string): string {
  const heights = calculateSectionHeights(pixelHeight, sections as import('@/config/section-templates').SectionType[]);

  const guides = sections.map((section, index) => {
    const step = NINE_STEP_FORMULA.find(
      s => s.requiredSections.includes(section as import('@/config/section-templates').SectionType) || s.optionalSections.includes(section as import('@/config/section-templates').SectionType)
    );

    const principles = getPrinciplesBySection(section);
    const height = heights[section] || 600;

    const parts = [
      `${index + 1}. ${section} (높이 약 ${height}px)`,
    ];

    if (step) {
      parts.push(`   목적: ${step.purpose}`);
      parts.push(`   심리학: ${step.psychologyPrinciple}`);
      parts.push(`   카피: ${step.copywritingFocus}`);
      parts.push(`   비주얼: ${step.visualFocus}`);
    }

    if (principles.length > 0) {
      const principleNames = principles.slice(0, 2).map(p => p.nameKr).join(', ');
      parts.push(`   설득 원칙: ${principleNames}`);
    }

    return parts.join('\n');
  });

  return guides.join('\n');
}

// 피그마 커맨드 포맷 설명 (42개 커맨드 풀활용)
function buildCommandFormatGuide(): string {
  return `
## 출력 형식: FigmaCommand[] JSON 배열

각 커맨드는 다음 구조를 따른다:
{
  "id": "cmd_001",
  "command": "커맨드 타입",
  "params": { ... },
  "group": "섹션명 (예: hero, features)",
  "description": "한줄 설명"
}

## 사용 가능한 커맨드 (전체)

### 노드 생성
- create_frame: { x, y, width, height, name, parentId, fillColor: {r,g,b,a}, layoutMode: "NONE"|"VERTICAL"|"HORIZONTAL", layoutWrap: "NO_WRAP"|"WRAP", paddingTop, paddingRight, paddingBottom, paddingLeft, primaryAxisAlignItems: "MIN"|"MAX"|"CENTER"|"SPACE_BETWEEN", counterAxisAlignItems: "MIN"|"MAX"|"CENTER"|"BASELINE", layoutSizingHorizontal: "FIXED"|"HUG"|"FILL", layoutSizingVertical: "FIXED"|"HUG"|"FILL", itemSpacing }
- create_text: { x, y, text, fontSize, fontWeight, fontColor: {r,g,b,a}, fontFamily, name, parentId }
- create_rectangle: { x, y, width, height, name, parentId }
- create_ellipse: { x, y, width, height, name, parentId }

### 채우기/색상
- set_fill_color: { nodeId, color: {r,g,b,a} }
- set_gradient_fill: { nodeId, gradientType: "LINEAR"|"RADIAL"|"ANGULAR"|"DIAMOND", gradientStops: [{color:{r,g,b,a}, position:0-1}], gradientTransform: [[cos,sin,tx],[sin,cos,ty]] }
  - 수직(위→아래): gradientTransform: [[0,1,0],[0,0,1]]
  - 대각선(좌상→우하): gradientTransform: [[0.7071,0.7071,0],[-0.7071,0.7071,0]]
  - 수평(좌→우): gradientTransform: [[1,0,0],[0,1,0]]
- set_multiple_fills: { nodeId, fills: [{type:"SOLID", color:{r,g,b,a}, opacity?:0-1}, {type:"GRADIENT_LINEAR"|"GRADIENT_RADIAL", gradientStops:[{color,position}], opacity?:0-1}] } — SOLID+GRADIENT 동시 적용으로 레이어드 배경
- set_image_fill: { nodeId, imageUrl, scaleMode: "FILL"|"FIT"|"TILE"|"STRETCH" }

### 테두리
- set_stroke_color: { nodeId, color: {r,g,b,a}, strokeWeight, strokeAlign?: "INSIDE"|"OUTSIDE"|"CENTER" }

### 이펙트 (그림자, 블러)
- set_effects: { nodeId, effects: [
    { type: "DROP_SHADOW", color: {r,g,b,a}, offset: {x,y}, radius: blur, spread?, visible: true },
    { type: "INNER_SHADOW", color: {r,g,b,a}, offset: {x,y}, radius: blur },
    { type: "LAYER_BLUR", radius: blur },
    { type: "BACKGROUND_BLUR", radius: blur }
  ]}

### 투명도/혼합
- set_opacity: { nodeId, opacity: 0-1 }
- set_blend_mode: { nodeId, blendMode: "NORMAL"|"MULTIPLY"|"SCREEN"|"OVERLAY"|"DARKEN"|"LIGHTEN"|"COLOR_DODGE"|"SOFT_LIGHT" }

### 텍스트 스타일
- set_text_style: { nodeId, fontSize, fontWeight, fontFamily, letterSpacing?, lineHeight?, textAlignHorizontal?: "LEFT"|"CENTER"|"RIGHT"|"JUSTIFIED", textCase?: "ORIGINAL"|"UPPER"|"LOWER"|"TITLE", textDecoration?: "NONE"|"UNDERLINE"|"STRIKETHROUGH" }
- set_range_text_style: { nodeId, start, end, fontSize?, fontWeight?, fontFamily?, color?: {r,g,b,a}, textDecoration? }
- set_text_content: { nodeId, text }
- set_auto_resize: { nodeId, textAutoResize: "NONE"|"WIDTH_AND_HEIGHT"|"HEIGHT"|"TRUNCATE" }

### 레이아웃
- set_layout_mode: { nodeId, layoutMode: "NONE"|"VERTICAL"|"HORIZONTAL", layoutWrap?: "NO_WRAP"|"WRAP" }
- set_padding: { nodeId, paddingTop, paddingRight, paddingBottom, paddingLeft }
- set_axis_align: { nodeId, primaryAxisAlignItems: "MIN"|"MAX"|"CENTER"|"SPACE_BETWEEN", counterAxisAlignItems: "MIN"|"MAX"|"CENTER"|"BASELINE" }
- set_layout_sizing: { nodeId, layoutSizingHorizontal: "FIXED"|"HUG"|"FILL", layoutSizingVertical: "FIXED"|"HUG"|"FILL" }
- set_item_spacing: { nodeId, itemSpacing, counterAxisSpacing? }
- set_corner_radius: { nodeId, radius, corners?: [topLeft, topRight, bottomRight, bottomLeft] }

### 변환
- resize_node: { nodeId, width, height }
- move_node: { nodeId, x, y }
- set_rotation: { nodeId, rotation: 각도 }
- clone_node: { nodeId, parentId? }

### 그룹/마스크
- create_group: { nodeIds: ["$cmd_x", "$cmd_y"], name, parentId, isMask?: true }

## 참조 시스템
- parentId에 "$cmd_001" 형태로 이전 커맨드의 id를 참조할 수 있다.
- nodeId에도 "$cmd_xxx" 참조를 쓸 수 있다.
- 최상위 프레임의 parentId는 생략한다 (캔버스 루트에 생성됨).

## 색상 형식
- RGBA: { r: 0-1, g: 0-1, b: 0-1, a: 0-1 }
- 예: 흰색 = {r:1, g:1, b:1, a:1}, 검정 = {r:0, g:0, b:0, a:1}
- HEX #FF6B35 → {r: 1.0, g: 0.42, b: 0.21, a: 1}
`.trim();
}

// 이미지 프롬프트 품질 가이드
function buildImageQualityGuide(tier: string): string {
  const quality = getImagePromptQuality(tier);
  if (!quality) return '';

  return [
    `[이미지 품질] ${quality.tier} 등급`,
    `스타일: ${quality.styleKeywords.join(', ')}`,
    `품질: ${quality.qualityKeywords.join(', ')}`,
  ].join('\n');
}

/** 톤&매너에 따른 디자인 가이드 */
const TONE_GUIDES: Record<string, string> = {
  premium: '고급스럽고 절제된 디자인. 여백을 넉넉히, 골드/블랙/화이트 위주. 세리프 폰트 활용. 이미지에 고급 질감.',
  trendy: '최신 트렌드 반영. 대담한 색상, 비대칭 레이아웃, 그라데이션 활용. 이모지와 아이콘 적극 사용.',
  cute: '둥근 모서리(cornerRadius 큰 값), 파스텔 톤, 이모지 장식, 작은 아이콘 장식 많이.',
  clean: '미니멀. 불필요한 장식 최소화. 넓은 여백, 일관된 정렬. 흑백 위주 + 포인트 1색상.',
  warm: '따뜻한 색조(베이지, 브라운, 코럴). 부드러운 그림자. 감성적 카피. 라운드 모서리.',
  professional: '신뢰감 있는 블루/네이비 계열. 깔끔한 그리드. 데이터/수치 강조. 정돈된 레이아웃.',
  bold: '큰 텍스트. 강렬한 대비 색상. 굵은 폰트. 화면 가득 이미지. 임팩트 있는 CTA.',
  natural: '녹색/브라운/베이지 자연 색상. 유기적 형태. 자연 사진. 친환경 키워드 강조.',
};

/**
 * 확장된 inputData를 구조화된 프롬프트 텍스트로 변환한다.
 * 단순 key-value 나열이 아니라 AI가 이해하기 쉬운 구조화된 형식으로 반환.
 */
function buildStructuredInputData(inputData: Record<string, unknown> | undefined): string {
  if (!inputData || Object.keys(inputData).length === 0) {
    return '(입력 데이터 없음 - 카테고리에 맞는 샘플 데이터로 생성)';
  }

  const lines: string[] = [];

  // 기본 정보
  const primaryName = extractInputField(inputData, 'productName')
    || extractInputField(inputData, 'storeName')
    || extractInputField(inputData, 'hospitalName')
    || extractInputField(inputData, 'academyName')
    || extractInputField(inputData, 'gymName')
    || extractInputField(inputData, 'firmName')
    || extractInputField(inputData, 'packageName')
    || extractInputField(inputData, 'eventName')
    || extractInputField(inputData, 'name');

  if (primaryName) lines.push(`### 상품/서비스명: ${primaryName}`);

  const description = extractInputField(inputData, 'description');
  if (description) lines.push(`### 상세 설명:\n${description}`);

  const targetAudience = extractInputField(inputData, 'targetAudience');
  if (targetAudience) lines.push(`### 타겟 고객: ${targetAudience}`);

  // 핵심 특징/셀링포인트
  const keyFeatures = extractInputArray(inputData, 'keyFeatures');
  const sellingPoints = extractInputArray(inputData, 'sellingPoints');
  const allPoints = [...keyFeatures, ...sellingPoints].filter(Boolean);
  if (allPoints.length > 0) {
    lines.push(`### 핵심 셀링포인트 (상세페이지에서 반드시 강조):\n${allPoints.map(p => `- ${p}`).join('\n')}`);
  }

  // 가격 정보
  const price = extractInputField(inputData, 'price');
  const originalPrice = extractInputField(inputData, 'originalPrice');
  const salePrice = extractInputField(inputData, 'salePrice');
  const discountRate = extractInputField(inputData, 'discountRate');
  if (price || originalPrice || salePrice) {
    const priceLines = [];
    if (originalPrice) priceLines.push(`정가: ${originalPrice}`);
    if (salePrice) priceLines.push(`할인가: ${salePrice}`);
    if (discountRate) priceLines.push(`할인율: ${discountRate}`);
    if (price && !originalPrice && !salePrice) priceLines.push(`가격: ${price}`);
    lines.push(`### 가격 정보 (가격 섹션에서 눈에 띄게 표시):\n${priceLines.join(' / ')}`);
  }

  // 톤&매너
  const toneManner = extractInputField(inputData, 'toneManner');
  if (toneManner && TONE_GUIDES[toneManner]) {
    lines.push(`### 톤 & 매너: ${toneManner}\n${TONE_GUIDES[toneManner]}`);
  }

  // CTA 문구
  const ctaText = extractInputField(inputData, 'ctaText');
  if (ctaText) {
    lines.push(`### CTA 버튼 문구: "${ctaText}" (이 문구를 CTA 버튼에 정확히 사용하라)`);
  }

  // 기타 필드 (위에서 처리되지 않은 것들)
  const handledKeys = new Set([
    'productName', 'storeName', 'hospitalName', 'academyName', 'gymName', 'firmName',
    'packageName', 'eventName', 'name', 'description', 'targetAudience',
    'keyFeatures', 'sellingPoints', 'price', 'originalPrice', 'salePrice', 'discountRate',
    'toneManner', 'ctaText', 'brandColor', 'accentColor', 'referenceUrl',
  ]);
  const extraFields = Object.entries(inputData)
    .filter(([key]) => !handledKeys.has(key))
    .filter(([, value]) => value != null && value !== '');

  if (extraFields.length > 0) {
    lines.push(`### 추가 정보:\n${extraFields.map(([key, value]) => `- ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`).join('\n')}`);
  }

  // 이미지 주제 일관성 강조
  if (primaryName) {
    lines.push(`### 이미지 생성 주제 (중요!):\n모든 이미지는 "${primaryName}"과 직접 관련된 내용이어야 한다. 관련 없는 음식/제품/풍경 사용 금지. tag에 "${primaryName}" 키워드를 포함하라.`);
  }

  return lines.join('\n\n');
}

/**
 * 피그마 커맨드 생성용 Gemini 프롬프트를 빌드한다.
 */
export function buildFigmaPrompt(request: FigmaGenerateRequest): string {
  const category = request.category || 'ecommerce';
  const pixelHeight = request.pixelHeight || DEFAULT_PIXEL_HEIGHT;
  const canvasWidth = request.canvasWidth || CANVAS_WIDTH;

  // 카테고리 템플릿에서 tier별 섹션 순서 결정
  const template = getCategoryTemplate(category);
  const preset = PIXEL_PRESETS[pixelHeight] || PIXEL_PRESETS[DEFAULT_PIXEL_HEIGHT];
  const tier = preset.tier;

  // 카테고리 템플릿의 sectionOrder 우선 사용, 없으면 공식 기반 생성
  let sectionOrder: string[];
  if (tier === 'compact' || tier === 'standard' || tier === 'detailed') {
    sectionOrder = [...template.sectionOrder[tier]];
  } else {
    sectionOrder = generateSectionOrder(pixelHeight) as string[];
  }

  // 목표 섹션 수에 맞춰 확장 (sectionCount보다 적으면 추가 섹션으로 채움)
  const targetCount = preset.sectionCount;
  if (sectionOrder.length < targetCount) {
    const extras = generateSectionOrder(pixelHeight) as string[];
    for (const section of extras) {
      if (sectionOrder.length >= targetCount) break;
      if (!sectionOrder.includes(section)) {
        // CTA 앞에 삽입
        const ctaIdx = sectionOrder.lastIndexOf('CTA');
        if (ctaIdx > 0) {
          sectionOrder.splice(ctaIdx, 0, section);
        } else {
          sectionOrder.push(section);
        }
      }
    }
    // 그래도 부족하면 반복 가능 섹션 추가
    const repeatables = ['Benefits', 'Features', 'Gallery', 'Testimonials', 'Stats', 'DetailedProduct'];
    let ri = 0;
    while (sectionOrder.length < targetCount && ri < repeatables.length) {
      const ctaIdx = sectionOrder.lastIndexOf('CTA');
      if (ctaIdx > 0) {
        sectionOrder.splice(ctaIdx, 0, repeatables[ri]);
      } else {
        sectionOrder.push(repeatables[ri]);
      }
      ri++;
    }
  }

  const categoryContext = buildCategoryContext(category);
  const sectionGuide = buildSectionGuide(sectionOrder as string[], pixelHeight);
  const commandFormat = buildCommandFormatGuide();
  const imageQuality = buildImageQualityGuide(preset.tier);
  const strategyGuide = buildStrategyContext(category, sectionOrder);

  // 입력 데이터 정리
  const inputDataStr = request.inputData
    ? Object.entries(request.inputData)
        .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
        .join('\n')
    : '(입력 데이터 없음 - 카테고리에 맞는 샘플 데이터로 생성)';

  // 스타일 오버라이드
  const styleStr = request.style
    ? [
        request.style.colorScheme && `색상: ${request.style.colorScheme}`,
        request.style.fontStyle && `폰트: ${request.style.fontStyle}`,
        request.style.layout && `레이아웃: ${request.style.layout}`,
      ].filter(Boolean).join(', ')
    : '';

  // HEX → RGBA 0-1 변환 헬퍼
  const hexToRgba = (hex: string): string => {
    const h = hex.replace('#', '');
    const r = (parseInt(h.substring(0, 2), 16) / 255).toFixed(2);
    const g = (parseInt(h.substring(2, 4), 16) / 255).toFixed(2);
    const b = (parseInt(h.substring(4, 6), 16) / 255).toFixed(2);
    return `{r:${r}, g:${g}, b:${b}, a:1}`;
  };

  const primaryRgba = hexToRgba(template.colorScheme.primary);
  const secondaryRgba = hexToRgba(template.colorScheme.secondary);
  const accentRgba = hexToRgba(template.colorScheme.accent);

  // 배경색 패턴 (어두운 모드 / 밝은 모드)
  const isDarkMode = template.colorScheme.mode === 'dark';
  const bgLight = isDarkMode ? '{r:0.12, g:0.12, b:0.14, a:1}' : '{r:1, g:1, b:1, a:1}';
  const bgMedium = isDarkMode ? '{r:0.08, g:0.08, b:0.10, a:1}' : '{r:0.97, g:0.97, b:0.98, a:1}';
  const bgDark = isDarkMode ? '{r:0.05, g:0.05, b:0.07, a:1}' : '{r:0.95, g:0.95, b:0.96, a:1}';
  const bgAccent = isDarkMode ? '{r:0.10, g:0.08, b:0.18, a:1}' : `{r:0.96, g:0.95, b:1.0, a:1}`;
  const textPrimary = isDarkMode ? '{r:1, g:1, b:1, a:1}' : '{r:0.1, g:0.1, b:0.12, a:1}';
  const textSecondary = isDarkMode ? '{r:0.7, g:0.7, b:0.75, a:1}' : '{r:0.4, g:0.4, b:0.45, a:1}';
  const textOnAccent = '{r:1, g:1, b:1, a:1}';

  const prompt = `
당신은 한국 최고의 상세페이지 디자이너다. 네이버 스마트스토어, 쿠팡에서 매출 1위를 만드는 프리미엄 상세페이지를 설계한다.
피그마에서 실행할 수 있는 커맨드 시퀀스(JSON 배열)를 생성하라.

## 캔버스 사양
- 전체 너비: ${canvasWidth}px
- 전체 높이: ${preset.totalHeight}px (${preset.label})
- 섹션 수: ${sectionOrder.length}개

## 카테고리 스타일 가이드
${categoryContext}
${styleStr ? `\n[스타일 오버라이드] ${styleStr}` : ''}

${strategyGuide}

## 9단계 공식 기반 섹션 순서 및 가이드
${sectionGuide}

## 입력 데이터
${inputDataStr}

${imageQuality}

${commandFormat}

## 색상 팔레트 (반드시 이 값을 사용하라)
- primary(강조): ${template.colorScheme.primary} = ${primaryRgba}
- secondary(보조): ${template.colorScheme.secondary} = ${secondaryRgba}
- accent(포인트): ${template.colorScheme.accent} = ${accentRgba}
- 배경색1(기본): ${bgLight}
- 배경색2(교차): ${bgMedium}
- 배경색3(강조 섹션): ${bgDark}
- 배경색4(브랜드 톤): ${bgAccent}
- 본문 텍스트: ${textPrimary}
- 보조 텍스트: ${textSecondary}
- 버튼/배지 위 텍스트: ${textOnAccent} (★ 버튼/배지 내부만! 일반 텍스트에 절대 사용 금지!)

## 타이포그래피 사이즈 (반드시 지켜라 — 가장 많이 틀리는 부분!)
- Hero 메인 제목: fontSize 52~72, fontWeight 800 (크게! 임팩트 있게!)
- Hero 서브 타이틀: fontSize 22~28, fontWeight 400
- 섹션 제목 (h2): fontSize 36~48, fontWeight 700 (절대 32 미만 금지!)
- 섹션 부제목: fontSize 18~22, fontWeight 400
- 본문 텍스트: fontSize 16~20, fontWeight 400
- 작은 텍스트 (캡션, 라벨): fontSize 14~16, fontWeight 500
- CTA 버튼 텍스트: fontSize 18~22, fontWeight 700
- **★ Stats 수치 (숫자, 퍼센트, 점수): fontSize 48~72, fontWeight 800 (가장 크게! 눈에 확 들어와야 함)**
- **★ Stats 라벨 (단위, 설명): fontSize 18~22, fontWeight 500**
- **★ 가격 텍스트: fontSize 36~52, fontWeight 800**
- **★ 할인 전 가격: fontSize 20~24, fontWeight 400 (취소선 스타일)**
- 절대 금지: fontSize 13 미만의 텍스트 — 모바일에서 안 보인다!
- **자주 하는 실수: Heading을 16px로 만드는 것 = 절대 금지! Heading은 최소 32px!**

## 절대 규칙 (위반 시 실패로 간주)

### 오토 레이아웃 규칙 (가장 중요 - 텍스트 겹침 방지)
- 모든 프레임은 반드시 layoutMode="VERTICAL" 또는 "HORIZONTAL"로 설정하라. layoutMode="NONE" 절대 금지.
- 오토 레이아웃 프레임 내부의 자식 요소에는 x, y 좌표를 설정하지 마라. 오토 레이아웃이 자동으로 배치한다.
- create_text에서 parentId가 있으면 x=0, y=0으로 하거나 x, y를 생략하라.
- create_rectangle에서도 parentId가 있으면 x=0, y=0으로 하거나 x, y를 생략하라.
- 요소 간 간격은 부모 프레임의 itemSpacing으로만 조절하라.
- 텍스트가 겹치는 것은 절대 금지다. 같은 위치에 2개 이상의 텍스트를 만들지 마라.

### 이미지 크기 규칙 (크고 임팩트 있게)
- 이미지 플레이스홀더는 layoutSizingHorizontal="FILL"로 부모 폭에 맞게 채워라.
- Hero 이미지: FILL, height=700~900px. 강렬하고 풀블리드로.
- 기능/혜택/솔루션 이미지: FILL, height=500~650px. 큼직하게.
- 프로세스/비교 이미지: FILL, height=450~600px.
- 이미지는 전체 페이지에 최소 10개 이상. 텍스트만 있는 섹션은 없어야 한다.
- 이미지가 작으면 임팩트가 사라진다. 항상 크게 만들어라.

### 구조
1. 첫 번째 커맨드(id="cmd_001"): create_frame, width=${canvasWidth}, height=${preset.totalHeight}, layoutMode="VERTICAL", itemSpacing=0, name="상세페이지", fillColor=${bgLight}. 이것이 최상위 루트 프레임이다.
2. 각 섹션: create_frame, parentId="$cmd_001", layoutMode="VERTICAL", layoutSizingHorizontal="FILL", itemSpacing=24~40
3. 각 섹션에 paddingTop/Bottom 60~100, paddingLeft/Right 60~120
4. 각 커맨드의 group 필드에 섹션명(영문 소문자: hero, problem, solution, features, benefits, testimonials, guarantee, cta, footer)
5. 수평 배치가 필요한 곳(카드 그리드, 아이콘 행): 래퍼 프레임 layoutMode="HORIZONTAL", layoutWrap="WRAP", itemSpacing=20~30

### 각 섹션별 필수 포함 요소 (이것을 반드시 만들어라)

**Hero 섹션 (최소 12개 커맨드) ★ 이미지 + 메인카피 둘 다 필수!:**
- 배경 프레임: height 900~1200px, fillColor=${bgDark} 또는 primary 그라데이션
- ★ 메인 이미지 플레이스홀더: create_rectangle layoutSizingHorizontal="FILL" height=600~800px, name="[이미지] hero-main" — 상품/서비스를 강렬하게 보여주는 큰 이미지 필수!
- ★ 메인 제목 (메인카피): fontSize 52~72, fontWeight 800, 한국어 헤드라인 (파워워드 포함, 1~2줄) — 이미지 위에 오버레이로 배치하거나 이미지 아래에 크게 배치
- 서브 타이틀: fontSize 22~28, fontWeight 400, 혜택 중심 카피 (2~3줄)
- CTA 버튼 프레임: fillColor=primary, cornerRadius 12, padding 16/40
- CTA 버튼 텍스트: fontSize 20, fontWeight 700, 버튼 배경과 대비되는 색상
- 장식 요소: 배지, 아이콘, 구분선 등 최소 2개
- ★ 히어로 필수 조건: 이미지 없는 히어로 = 실패! 메인카피 없는 히어로 = 실패!

**Problem/Pain 섹션 (최소 10개 커맨드):**
- 배경 프레임: height 600~800px
- 섹션 제목: fontSize 36~48, fontWeight 700
- 부제목: fontSize 18~22
- 문제점 카드 3~4개: 각각 create_frame + 아이콘(create_ellipse 60x60) + 제목(fontSize 20) + 설명(fontSize 16)
- 카드 그리드: layoutMode="HORIZONTAL", layoutWrap="WRAP", itemSpacing 20~30

**Solution/Benefits 섹션 (최소 12개 커맨드):**
- 배경 프레임: height 800~1000px
- 큰 이미지 플레이스홀더: width=${Math.round(canvasWidth * 0.7)}px, height=400~500px
- 섹션 제목 + 부제목
- 혜택 리스트 3~5개: 각각 아이콘 + 텍스트
- 강조 수치/통계: fontSize 48~64, fontWeight 800, primary 색상

**Features 섹션 (최소 12개 커맨드):**
- 배경 프레임: height 800~1000px
- 섹션 제목 + 부제목
- 기능 카드 3~4개: 각각 create_frame(fillColor + cornerRadius 16 + shadow) + 이미지(200x150) + 제목 + 설명
- 카드에 set_effects(DROP_SHADOW: offset(0,4) blur=20 color={r:0,g:0,b:0,a:0.08})

**Testimonials 섹션 (최소 12개 커맨드) ★ 후기는 반드시 최소 3개!:**
- 배경 프레임: height 600~800px
- 섹션 제목
- ★ 후기 카드 최소 3개 (3~5개 권장): 각각 프레임 + 프로필(create_ellipse 64x64) + 이름 + 직업 + 후기 텍스트(2~3줄의 생생한 체험 후기) + 별점(★★★★★)
- 카드 디자인: fillColor 밝은색, cornerRadius 16, shadow
- ★ 후기가 3개 미만이면 신뢰도가 떨어져 전환율이 급감한다. 반드시 3개 이상!

**Guarantee/Trust 섹션 (최소 8개 커맨드):**
- 배경 프레임: height 400~600px
- 보증 아이콘(큰 원형 create_ellipse 120x120)
- 보증 제목 + 상세 설명
- ★ 로고/파트너 영역: 기업 로고 이미지 플레이스홀더 3~5개 (HORIZONTAL 배치, 각 create_rectangle 120x60~160x80, name="[이미지] partner-logo-N")
- 로고 영역은 이미지 태그에 "logo", "brand", "partner" 키워드를 반드시 포함하여 AI가 로고 스타일 이미지를 생성하도록 유도
- 신뢰 배지 3~4개

**CTA 섹션 (최소 8개 커맨드):**
- 배경 프레임: height 400~500px, fillColor=primary 또는 그라데이션
- 강렬한 제목: fontSize 40~52, fontWeight 800, 흰색
- 부제목: 혜택 요약
- 큰 CTA 버튼: fillColor 흰색, 텍스트 primary 색상, cornerRadius 16, padding 20/60
- 보조 정보: "30일 무료 체험", "환불 보장" 등

**Footer 섹션 (최소 6개 커맨드):**
- 배경 프레임: height 200~300px, fillColor=${bgDark}
- 회사 정보, 연락처, 저작권 텍스트
- 구분선 (create_rectangle height=1)

### 배경색 다양화 (단조로운 흰/검 반복 절대 금지!)
- 각 섹션의 배경색을 카테고리 색상 기반으로 다양하게 변화시켜라.
- 사용 가능한 배경색 팔레트:
  * 다크: secondary ${secondaryRgba} 또는 어둡게 변형 (Hero, CTA용)
  * 브랜드 틴트: primary를 90% 연하게 (은은한 색감)
  * secondary 틴트: secondary를 90% 연하게
  * accent 틴트: accent를 88% 연하게
  * 따뜻한 혼합톤: primary+accent 중간 연한 색
  * 순백: ${bgLight}
  * 라이트그레이: ${bgMedium}
- 패턴 예시: 다크 → 브랜드틴트 → secondary틴트 → 화이트 → accent틴트 → 딥브랜드(두번째 어두운) → 혼합톤 → ...
- 두 개 연속 같은 밝기의 배경색 절대 금지
- Hero: secondary ${secondaryRgba} 기반 배경 (후처리에서 자동 보정됨). 텍스트는 항상 어두운 색 ${textPrimary}
- CTA: primary를 진하게 한 배경. 텍스트는 항상 어두운 색 ${textPrimary}
- 중간에 1~2개 섹션도 어두운 배경 사용 (리듬감, primary를 어둡게 한 색)

### ★★★ 장식 배경 효과 (프리미엄 퀄리티 핵심! 매번 다른 스타일로!) ★★★
텍스트 위주 섹션(Hero, CTA, Benefits, Features 등)에 단색 배경만 깔지 말고, 반드시 장식 효과를 추가하라.
아래 스타일 중 섹션마다 1~2개를 조합하여 사용. 같은 페이지에서 모든 섹션이 같은 효과 사용 금지!

**스타일 A: 방사형 광선 (Radial Burst)**
- 섹션 중앙에 create_ellipse (width=800, height=800), set_gradient_fill RADIAL로 중앙에서 바깥으로 fade
- 색상: primary 또는 accent를 30% 불투명도로, set_opacity 0.15~0.25
- 배경 프레임 바로 위, 텍스트 아래에 배치

**스타일 B: 떠다니는 원형 보케 (Floating Orbs)**
- create_ellipse 3~5개, 크기 100~400px, 랜덤 위치
- set_gradient_fill RADIAL: 중심=primary/accent 20% opacity → 가장자리=투명
- set_effects: LAYER_BLUR radius 40~80

**스타일 C: 대각선 그라데이션 메쉬 (Gradient Mesh)**
- 섹션 배경 위에 create_frame (FILL), set_gradient_fill LINEAR 대각선
- 2~3개 색상 stops: primary 10% opacity → 투명 → accent 8% opacity
- gradientTransform 대각선: [[0.7071,0.7071,0],[-0.7071,0.7071,0]]

**스타일 D: 기하학 도형 패턴 (Geometric Shapes)**
- create_rectangle 또는 create_ellipse 여러 개, 큰 크기(200~600px), 회전
- set_opacity 0.03~0.08, set_rotation 15~45도
- 배경색보다 약간 밝거나 어두운 색상

**스타일 E: 상단/하단 그라데이션 페이드 (Gradient Fade)**
- 섹션 상단/하단에 create_frame (height 200~300px), set_gradient_fill LINEAR 수직
- 인접 섹션 색상에서 현재 섹션 색상으로 자연스럽게 전환
- 섹션 간 경계를 부드럽게

각 어두운 배경 섹션(Hero, CTA 등)에는 반드시 스타일 A 또는 B를 적용하라.
밝은 배경 섹션에는 스타일 C, D, E 중 선택하라.

### 색상 대비 (가독성 필수 — 가장 자주 틀리는 부분!)
★★★ 기본 텍스트 색상은 반드시 검정/어두운 색 {r:0.1, g:0.1, b:0.12, a:1}을 사용하라! ★★★
★★★ 흰색/밝은 텍스트는 확실히 어두운 배경(fillColor의 r+g+b < 0.6)인 경우에만 사용 ★★★
- 절대 금지: 밝은 배경에 밝은 텍스트 (예: 흰 배경 + 흰색/노랑/연두/하늘색 글씨) → 안 보임!
- 절대 금지: 어두운 배경에 어두운 텍스트
- 확신 없으면 무조건 어두운 텍스트 ${textPrimary} 사용 (가장 안전한 선택)
- ★★★ Hero/CTA 섹션: 무조건 어두운 텍스트 ${textPrimary}. 절대 흰색 금지! 후처리에서 자동 보정됨 ★★★
- 밝은 배경(${bgLight}, ${bgMedium})에는 → 어두운 텍스트 ${textPrimary}
- 어두운 배경이어도 → 어두운 텍스트 ${textPrimary} 사용. 후처리 파이프라인이 대비를 자동 보정한다
- 강조 텍스트는 primary 색상 ${primaryRgba} 사용 (밝은 배경일 때만)

### ★ 배지/버튼 텍스트 대비 규칙 (매우 중요!)
- 밝은 배경색 배지/버튼(파스텔, 흰색 계열, r+g+b > 2.0) → 반드시 어두운 텍스트 {r:0.1, g:0.1, b:0.12, a:1}
- 어두운 배경색 배지/버튼(r+g+b < 1.0) → 밝은 텍스트 허용 (버튼/배지 내부만!)
- 배지 배경이 primary/accent 밝은 계열이면 → 텍스트 색상을 {r:0.1, g:0.1, b:0.12, a:1}로 설정
- 예: 배지 fillColor={r:0.95,g:0.93,b:1.0} (연보라) → fontColor={r:0.27,g:0.22,b:0.54} (진보라)
- 예: 버튼 fillColor={r:1,g:1,b:1} (흰색) → fontColor=primary 색상 사용

### 이미지 (최우선 - 전체 페이지에 최소 10개 이상, 크고 임팩트 있게)
- 모든 섹션에 최소 1~3개 이미지 플레이스홀더를 넣어라
- 이미지 없는 섹션은 허용하지 않는다
- Hero: create_rectangle, FILL, height=700~900, name="[이미지] hero-main"
- Features: 각 기능 카드 안에 create_rectangle, FILL, height=350~450, name="[이미지] feature-N"
- Benefits: create_rectangle, FILL, height=500~650, name="[이미지] benefit-main"
- Testimonials: create_ellipse 80x80 (프로필), name="[이미지] profile-N"
- Solution: create_rectangle, FILL, height=500~650, name="[이미지] solution-main"
- Guarantee: create_rectangle, width=200, height=200, name="[이미지] trust-badge"
- Process/Comparison: create_rectangle, FILL, height=450~600, name="[이미지] process-main"
- 모든 이미지 플레이스홀더: fillColor={r:0.92, g:0.92, b:0.93, a:1}, 이름에 "[이미지]" 포함
- set_corner_radius로 둥글기 12~16 적용
- ★ 이미지가 작으면 허접해 보인다. 항상 크고 시원하게!

### 버튼 디자인
- CTA 버튼: create_frame + fillColor=primary + cornerRadius 12 + paddingTop/Bottom 16~20 + paddingLeft/Right 40~60
- 버튼 텍스트: 버튼 배경과 대비되는 색상 (어두운 배경 버튼 → 흰색, 밝은 배경 버튼 → 어두운 색), fontSize 18~22, fontWeight 700
- 보조 버튼: set_stroke_color(primary, strokeWeight=2) + 투명 배경

### 텍스트 내용 (모든 텍스트 한국어 필수)
- 입력 데이터가 있으면 최대한 활용하여 실제 비즈니스에 맞는 카피 작성
- 파워워드를 헤드라인과 CTA에 적극 활용하라
- Hero 제목은 1줄~2줄로 강렬하게, 서브타이틀은 2줄~3줄로 혜택 중심
- Problem 섹션: 고객의 고민/불만을 구체적으로 언급
- Solution 섹션: 해결책을 수치와 함께 제시
- CTA: "지금 바로 시작하기", "무료 체험 신청", "한정 특가 확인" 등 긴급성 + 행동 유도
- ★ **문장 끝에 쉼표(,) 넣지 마라!** 줄바꿈 전에 쉼표 금지. 텍스트 맨 끝에 쉼표 금지. 쉼표는 한 문장 안 나열에만 사용.

### 이펙트 (프리미엄 퀄리티를 위해 반드시 적용)
- 카드/버튼에 DROP_SHADOW: offset(0,4) blur=20 spread=0 color={r:0,g:0,b:0,a:0.08}
- Hero 배경: 반드시 set_gradient_fill + 장식 효과(radial glow 또는 orbs) 포함
- CTA 섹션 배경: 반드시 set_gradient_fill + 장식 효과 포함
- 텍스트 위주 섹션: 장식 배경 효과 필수 (위 "장식 배경 효과" 섹션 참고)
- 중요 텍스트에 강조색 적용
- 장식 효과 레이어는 텍스트 아래(먼저 생성), 텍스트 위에 올라가지 않게
- **블렌드 모드 활용**: 오버레이 프레임에 set_blend_mode(MULTIPLY), 글로우 장식에 set_blend_mode(SCREEN), 도형 장식에 set_blend_mode(SOFT_LIGHT) 적용
- **장식 도형 회전**: Decoration-Shape 등 장식 도형에 set_rotation(15~45도) 적용하여 역동적 배경 연출
- **텍스트 부분 강조**: 가격, 할인율, 통계 숫자에 set_range_text_style로 브랜드 컬러+Bold 부분 적용

### ★ 동적/인포그래픽 섹션 (GIF 없이 임팩트 극대화!)
실제 상세페이지에서 GIF/영상을 쓰는 곳(프로세스, 데모, 비교 등)은 정적 이미지로 대체하되 훨씬 화려하게 만들어라:
- **프로세스/로드맵 섹션**: 큰 인포그래픽 이미지(height 600~800px) + 그라데이션 배경 + 아이콘+숫자 조합
- **Before/After 섹션**: 두 이미지를 나란히 배치(각각 height 500+), 화살표/아이콘으로 변화를 극적으로 표현
- **기능 시연 섹션**: 큰 스크린샷/목업 이미지(height 700~900px) + 포인트 화살표/번호 오버레이
- **숫자/통계 섹션**: 큰 숫자(fontSize 64~96) + 그라데이션 텍스트 효과 + 원형/막대 인포그래픽 이미지
- ★ 핵심: GIF가 없으니 정적 이미지+장식 효과+대비 강한 색상으로 눈길을 사로잡아라!

### 출력 형식 (엄격하게 지켜라)
- 결과는 반드시 유효한 JSON 배열만 출력하라. 설명, 마크다운, 주석 없이 [ ... ] 형태만
- 커맨드 id는 "cmd_001", "cmd_002" ... 순차 번호
- 커맨드 수: 최소 ${Math.max(sectionOrder.length * 15, 120)}개. 부족하면 안 된다. 실제 프리미엄 상세페이지는 150개+ 커맨드가 필요하다.
- 모든 색상 값은 0-1 범위의 RGBA
- 모든 parentId 참조는 "$cmd_001" 형태로 ($ + 이전 커맨드 id)
`.trim();

  return prompt;
}

/**
 * 웹디자인 모드용 프롬프트 빌드
 */
export function buildWebDesignPrompt(request: FigmaGenerateRequest): string {
  const category = request.category || 'saas';
  const canvasWidth = request.canvasWidth || CANVAS_WIDTH;
  const template = getCategoryTemplate(category);
  const tone = getCategoryTone(category);

  const inputDataStr = request.inputData
    ? Object.entries(request.inputData)
        .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
        .join('\n')
    : '(입력 데이터 없음 - 카테고리에 맞는 샘플 데이터로 생성)';

  const prompt = `
당신은 웹디자인 전문가이자 UI/UX 디자이너다.
랜딩 페이지를 피그마에서 실행할 수 있는 커맨드 시퀀스(JSON 배열)로 생성하라.

## 캔버스 사양
- 전체 너비: ${canvasWidth}px
- 디자인 타입: 웹사이트 랜딩페이지

## 스타일 가이드
- 카테고리: ${template.name}
- 색상: primary ${template.colorScheme.primary}, secondary ${template.colorScheme.secondary}, accent ${template.colorScheme.accent}
- 모드: ${template.colorScheme.mode}
- 타이포: 제목 ${template.typography.headingStyle}, 본문 ${template.typography.bodyStyle}
- 톤: ${tone.voiceCharacteristics.join(', ')}
- 파워워드: ${tone.powerWords.join(', ')}

## 입력 데이터
${inputDataStr}

## 필수 섹션
1. Navigation (GNB - 로고 + 메뉴 + CTA 버튼)
2. Hero (메인 비주얼 + 헤드라인 + 서브카피 + CTA)
3. Features (핵심 기능 3-4개 카드)
4. Social Proof (고객 후기 또는 고객사 로고)
5. CTA (최종 행동 유도)
6. Footer (연락처 + 링크 + 저작권)

${buildCommandFormatGuide()}

## 규칙
1. 최상위 프레임: width=${canvasWidth}, layoutMode="VERTICAL", name="Landing Page".
2. 모든 텍스트는 한국어.
3. 네비게이션: height=72px, layoutMode="HORIZONTAL", 양쪽 패딩 80px.
4. Hero: 최소 height 600px, 강렬한 헤드라인.
5. 이미지 자리: create_rectangle, 회색 채우기, 이름에 "[이미지]" 포함.
6. 결과는 JSON 배열만 출력. 설명 없이 [ ... ] 형태만.
7. 색상은 RGBA 0-1 범위.
`.trim();

  return prompt;
}

// HEX → RGBA 0-1 변환
function hexToRgbaStr(hex: string): string {
  const h = hex.replace('#', '');
  if (h.length < 6) return '{r:0.5, g:0.5, b:0.5, a:1}';
  const r = (parseInt(h.substring(0, 2), 16) / 255).toFixed(3);
  const g = (parseInt(h.substring(2, 4), 16) / 255).toFixed(3);
  const b = (parseInt(h.substring(4, 6), 16) / 255).toFixed(3);
  return `{r:${r}, g:${g}, b:${b}, a:1}`;
}

// rgba(r,g,b,a) 문자열을 RGBA 0-1 객체 문자열로 변환
function rgbaStrToFigma(rgba: string): string {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
  if (!match) return '{r:0, g:0, b:0, a:0.1}';
  const r = (parseInt(match[1]) / 255).toFixed(3);
  const g = (parseInt(match[2]) / 255).toFixed(3);
  const b = (parseInt(match[3]) / 255).toFixed(3);
  const a = match[4] || '1';
  return `{r:${r}, g:${g}, b:${b}, a:${a}}`;
}

// 상세 섹션 분석 결과를 프롬프트용 텍스트로 변환
function buildDetailedSectionGuide(
  sections: Array<{
    type: string;
    layout: string;
    estimatedHeight: number;
    backgroundColor?: string;
    backgroundGradient?: { type: string; colors: Array<{ color: string; position: number }>; angle?: number };
    padding?: { top: number; right: number; bottom: number; left: number };
    gap?: number;
    contentWidth?: number;
    contentAlign?: string;
    elements?: Array<Record<string, unknown>>;
  }>,
  canvasWidth: number,
): string {
  return sections.map((section, sIndex) => {
    const parts: string[] = [];
    parts.push(`### 섹션 ${sIndex + 1}: ${section.type} (${section.layout})`);
    parts.push(`- 높이: ${section.estimatedHeight}px`);

    if (section.backgroundColor) {
      parts.push(`- 배경색: ${section.backgroundColor} = ${hexToRgbaStr(section.backgroundColor)}`);
    }
    if (section.backgroundGradient) {
      const g = section.backgroundGradient;
      const stops = g.colors.map(c => `${c.color}(${c.position})`).join(' → ');
      parts.push(`- 배경 그라데이션: ${g.type}, ${stops}, angle=${g.angle || 180}`);
    }
    if (section.padding) {
      parts.push(`- 패딩: top=${section.padding.top} right=${section.padding.right} bottom=${section.padding.bottom} left=${section.padding.left}`);
    }
    if (section.gap) {
      parts.push(`- 요소 간격: ${section.gap}px`);
    }
    if (section.contentWidth) {
      parts.push(`- 콘텐츠 폭: ${section.contentWidth}px (캔버스 ${canvasWidth}px 중앙정렬)`);
    }

    // 엘리먼트 상세
    if (section.elements && section.elements.length > 0) {
      parts.push(`- 엘리먼트 ${section.elements.length}개:`);
      for (const el of section.elements) {
        const elType = String(el.type || 'unknown');
        const size = `${el.width || '?'}x${el.height || '?'}`;
        const pos = `(${el.x || 0}, ${el.y || 0})`;

        let detail = `  * ${elType} ${size} ${pos}`;

        if (el.text) detail += ` text="${String(el.text).substring(0, 40)}"`;
        if (el.fontSize) detail += ` size=${el.fontSize}`;
        if (el.fontWeight) detail += ` weight=${el.fontWeight}`;
        if (el.textColor) detail += ` color=${el.textColor}`;
        if (el.textAlign) detail += ` align=${el.textAlign}`;
        if (el.backgroundColor) detail += ` bg=${el.backgroundColor}`;
        if (el.borderRadius) detail += ` radius=${el.borderRadius}`;
        if (el.shadow) detail += ` shadow=true`;
        if (el.border) detail += ` border=true`;
        if (el.imageDescription) detail += ` img="${String(el.imageDescription).substring(0, 30)}"`;

        parts.push(detail);
      }
    }

    return parts.join('\n');
  }).join('\n\n');
}

/**
 * 레퍼런스 복제 모드용 프롬프트 빌드 (42개 커맨드 풀활용)
 */
export function buildReferenceClonePrompt(
  request: FigmaGenerateRequest,
  analysis: {
    colorPalette: Record<string, string>;
    sections: Array<{
      type: string;
      layout: string;
      estimatedHeight: number;
      backgroundColor?: string;
      backgroundGradient?: { type: string; colors: Array<{ color: string; position: number }>; angle?: number };
      padding?: { top: number; right: number; bottom: number; left: number };
      gap?: number;
      contentWidth?: number;
      contentAlign?: string;
      elements?: Array<Record<string, unknown>>;
    }>;
    typography: {
      headingSize: number;
      bodySize: number;
      headingFont?: string;
      bodyFont?: string;
      headingWeight?: number;
      bodyWeight?: number;
      headingLetterSpacing?: number;
      bodyLineHeight?: number;
    };
    totalHeight: number;
    spacing?: {
      sectionGap: number;
      contentMaxWidth: number;
      defaultPadding: { top: number; right: number; bottom: number; left: number };
    };
    effects?: {
      gradients: Array<{ type: string; colors: Array<{ color: string; position: number }>; angle?: number; usage: string }>;
      shadows: Array<{ x: number; y: number; blur: number; spread: number; color: string; usage: string }>;
      hasGlassEffect: boolean;
    };
  }
): string {
  const canvasWidth = request.canvasWidth || CANVAS_WIDTH;
  const customizations = request.inputData || {};

  // 색상 팔레트를 RGBA 형태로 변환
  const colorsWithRgba = Object.entries(analysis.colorPalette)
    .filter(([, value]) => typeof value === 'string' && value.startsWith('#'))
    .map(([key, value]) => `${key}: ${value} = ${hexToRgbaStr(value as string)}`)
    .join('\n');

  // 타이포 상세
  const typoLines: string[] = [
    `- 제목: ${analysis.typography.headingSize}px, weight=${analysis.typography.headingWeight || 700}`,
    `- 본문: ${analysis.typography.bodySize}px, weight=${analysis.typography.bodyWeight || 400}`,
  ];
  if (analysis.typography.headingFont) typoLines.push(`- 제목 폰트: ${analysis.typography.headingFont}`);
  if (analysis.typography.bodyFont) typoLines.push(`- 본문 폰트: ${analysis.typography.bodyFont}`);
  if (analysis.typography.headingLetterSpacing != null) typoLines.push(`- 제목 자간: ${analysis.typography.headingLetterSpacing}`);
  if (analysis.typography.bodyLineHeight != null) typoLines.push(`- 본문 행간: ${analysis.typography.bodyLineHeight}`);

  // 이펙트 가이드
  const effectLines: string[] = [];
  if (analysis.effects) {
    if (analysis.effects.gradients.length > 0) {
      effectLines.push('### 그라데이션 (set_gradient_fill 사용)');
      for (const g of analysis.effects.gradients) {
        const stops = g.colors.map(c => `${c.color}(${c.position})`).join(' → ');
        effectLines.push(`- ${g.usage}: ${g.type} ${stops} angle=${g.angle || 180}`);
      }
    }
    if (analysis.effects.shadows.length > 0) {
      effectLines.push('### 그림자 (set_effects + DROP_SHADOW 사용)');
      for (const s of analysis.effects.shadows) {
        effectLines.push(`- ${s.usage}: offset(${s.x},${s.y}) blur=${s.blur} spread=${s.spread} color=${s.color} = ${rgbaStrToFigma(s.color)}`);
      }
    }
    if (analysis.effects.hasGlassEffect) {
      effectLines.push('### 글래스모피즘 (set_effects + BACKGROUND_BLUR + 반투명 배경)');
      effectLines.push('- 배경: rgba 투명도 0.1~0.3 + BACKGROUND_BLUR radius 20~40');
    }
  }

  // 스페이싱 가이드
  const spacingLines: string[] = [];
  if (analysis.spacing) {
    spacingLines.push(`- 섹션 간격: ${analysis.spacing.sectionGap}px`);
    spacingLines.push(`- 콘텐츠 최대폭: ${analysis.spacing.contentMaxWidth}px`);
    spacingLines.push(`- 기본 패딩: top=${analysis.spacing.defaultPadding.top} right=${analysis.spacing.defaultPadding.right} bottom=${analysis.spacing.defaultPadding.bottom} left=${analysis.spacing.defaultPadding.left}`);
  }

  // 상세 섹션 가이드
  const sectionGuide = buildDetailedSectionGuide(analysis.sections, canvasWidth);

  const prompt = `
당신은 디자인 복제 전문가다. 레퍼런스 디자인을 피그마에서 1:1로 완벽히 재현하라.
분석된 모든 디자인 요소(색상, 폰트, 크기, 간격, 그라데이션, 그림자, 둥글기 등)를 정확히 반영한 피그마 커맨드 시퀀스(JSON 배열)를 생성하라.

## 캔버스 사양
- 전체 너비: ${canvasWidth}px
- 전체 높이: ${analysis.totalHeight}px

## 색상 팔레트 (반드시 이 RGBA 값을 사용)
${colorsWithRgba}

## 타이포그래피
${typoLines.join('\n')}

${spacingLines.length > 0 ? `## 스페이싱 시스템\n${spacingLines.join('\n')}` : ''}

${effectLines.length > 0 ? `## 이펙트 (반드시 적용)\n${effectLines.join('\n')}` : ''}

## 섹션별 상세 구조 (이 구조를 정확히 재현하라)
${sectionGuide}

## 커스터마이징
${customizations.brandName ? `- 브랜드명: ${customizations.brandName} (텍스트에 반영)` : ''}
${customizations.brandColor ? `- 브랜드 색상: ${customizations.brandColor} (primary 대체)` : ''}
${customizations.replaceText !== false ? '- 텍스트: 한국어로 작성. 분석된 텍스트가 있으면 그대로 사용하되 자연스러운 한국어로.' : ''}

${buildCommandFormatGuide()}

## 필수 복제 규칙

### 구조
1. 첫 번째 커맨드(id="cmd_001"): create_frame, width=${canvasWidth}, height=${analysis.totalHeight}, layoutMode="VERTICAL", name="레퍼런스 복제". 이것이 최상위 루트 프레임이다.
2. 각 섹션은 create_frame으로 생성, parentId="$cmd_001", layoutMode="VERTICAL", layoutSizingHorizontal="FILL"
3. 분석된 padding, gap, contentWidth를 정확히 반영하라
4. contentWidth < canvasWidth인 경우: 섹션 내부에 콘텐츠 래퍼 프레임을 만들어 중앙정렬

### 배경
5. 섹션별 backgroundColor가 있으면 해당 색상으로 fillColor 설정
6. backgroundGradient가 있으면 set_gradient_fill로 정확히 구현
7. 배경색이 없는 섹션은 투명(fillColor 없음) 또는 기본 배경색 사용

### 텍스트
8. 분석된 fontSize, fontWeight, textColor, textAlign을 정확히 반영
9. fontFamily는 분석된 값 사용. 없으면 "Pretendard" 기본값
10. letterSpacing, lineHeight가 있으면 set_text_style로 적용
11. 텍스트 내용은 분석된 text가 있으면 사용, 없으면 적절한 한국어 생성
12. set_auto_resize로 텍스트 크기 자동 조절: "WIDTH_AND_HEIGHT" 또는 "HEIGHT"

### 이미지
13. 이미지 위치에 create_rectangle로 플레이스홀더 생성
14. 분석된 크기(width, height)를 정확히 반영
15. 이름에 반드시 "[이미지]" 포함, fillColor={r:0.92, g:0.92, b:0.93, a:1}
16. borderRadius가 있으면 set_corner_radius 적용

### 버튼
17. 버튼은 create_frame으로 구현: fillColor + paddingTop/Bottom/Left/Right + cornerRadius
18. 내부에 create_text로 버튼 텍스트 추가
19. 그라데이션 버튼은 set_gradient_fill 사용

### 카드
20. 카드는 create_frame + fillColor + set_corner_radius + set_effects(DROP_SHADOW)
21. 카드 그리드는 부모 프레임 layoutMode="HORIZONTAL", layoutWrap="WRAP" 사용

### 이펙트 (프리미엄 퀄리티 필수)
22. 그림자가 분석됐으면 반드시 set_effects 적용 (카드, 버튼, 이미지 등)
23. 그라데이션이 분석됐으면 반드시 set_gradient_fill 적용
24. 투명도가 1.0이 아닌 요소는 set_opacity 적용
25. 보더가 있는 요소는 set_stroke_color 적용

### 구분선/장식
26. divider는 create_rectangle height=1 + fillColor로 구현
27. 배지/태그는 작은 create_frame + fillColor + cornerRadius + 텍스트
28. 아이콘은 create_ellipse 또는 create_rectangle + fillColor로 대체

### 출력
29. JSON 배열만 출력. 설명, 마크다운, 주석 절대 금지
30. 모든 색상 값은 0-1 범위의 RGBA
31. 커맨드 수: 최소 ${Math.max(analysis.sections.length * 15, 120)}개. 프리미엄 복제에는 충분한 커맨드가 필요하다.
32. 각 커맨드의 group 필드에 섹션 type을 영문으로
`.trim();

  return prompt;
}

/**
 * 트리 모드용 프롬프트 빌드
 * AI가 중첩 TreeNode JSON 객체 하나를 반환하도록 유도한다.
 * create_tree 커맨드 1회로 전체 구조를 생성하므로 네트워크 왕복을 최소화한다.
 */
export function buildTreePrompt(
  request: FigmaGenerateRequest,
  referenceAnalysis?: ReferenceAnalysis
): string {
  const category = request.category || 'ecommerce';
  const pixelHeight = request.pixelHeight || DEFAULT_PIXEL_HEIGHT;
  const canvasWidth = request.canvasWidth || CANVAS_WIDTH;

  const categoryContext = buildCategoryContext(category);

  const template = getCategoryTemplate(category);
  const preset = PIXEL_PRESETS[pixelHeight] || PIXEL_PRESETS[DEFAULT_PIXEL_HEIGHT];
  const tier = preset.tier as 'compact' | 'standard' | 'detailed';

  const sectionOrder = (tier === 'compact' || tier === 'standard' || tier === 'detailed')
    ? template.sectionOrder[tier]
    : generateSectionOrder(pixelHeight);

  const sectionGuide = buildSectionGuide(sectionOrder as string[], pixelHeight);
  const imageQuality = buildImageQualityGuide(preset.tier);
  const strategyGuide = buildStrategyContext(category, sectionOrder as string[]);

  const inputDataStr = buildStructuredInputData(request.inputData);

  // 브랜드 커스텀 컬러 (입력폼에서 지정한 경우)
  const customBrandColor = extractInputField(request.inputData, 'brandColor');
  const customAccentColor = extractInputField(request.inputData, 'accentColor');

  const isDarkMode = template.colorScheme.mode === 'dark';
  const primaryRgba = customBrandColor
    ? hexToRgbaStr(customBrandColor)
    : hexToRgbaStr(template.colorScheme.primary);
  const secondaryRgba = hexToRgbaStr(template.colorScheme.secondary);
  const accentRgba = customAccentColor
    ? hexToRgbaStr(customAccentColor)
    : hexToRgbaStr(template.colorScheme.accent);
  const bgLight = isDarkMode ? '{r:0.12, g:0.12, b:0.14, a:1}' : '{r:1, g:1, b:1, a:1}';
  const bgMedium = isDarkMode ? '{r:0.08, g:0.08, b:0.10, a:1}' : '{r:0.97, g:0.97, b:0.98, a:1}';
  const bgDark = isDarkMode ? '{r:0.05, g:0.05, b:0.07, a:1}' : '{r:0.95, g:0.95, b:0.96, a:1}';
  const textPrimary = isDarkMode ? '{r:1, g:1, b:1, a:1}' : '{r:0.1, g:0.1, b:0.12, a:1}';
  const textOnAccent = '{r:1, g:1, b:1, a:1}';

  // 레퍼런스 분석 결과가 있으면 색상/타이포/구조 정보 추가
  let referenceGuide = '';
  if (referenceAnalysis) {
    const colorsWithRgba = Object.entries(referenceAnalysis.colorPalette)
      .filter(([, v]) => typeof v === 'string' && (v as string).startsWith('#'))
      .map(([k, v]) => `${k}: ${v} = ${hexToRgbaStr(v as string)}`)
      .join('\n');

    const sectionDetails = referenceAnalysis.sections.map((s, i) => {
      const parts = [`### 섹션 ${i + 1}: ${s.type} (${s.layout}), 높이 ${s.estimatedHeight}px`];
      if (s.backgroundColor) parts.push(`배경: ${s.backgroundColor}`);
      if (s.padding) parts.push(`패딩: top=${s.padding.top} right=${s.padding.right} bottom=${s.padding.bottom} left=${s.padding.left}`);
      if (s.gap) parts.push(`간격: ${s.gap}px`);
      if (s.elements.length > 0) {
        parts.push(`엘리먼트 ${s.elements.length}개:`);
        for (const el of s.elements) {
          let detail = `- ${el.type} ${el.width}x${el.height}`;
          if (el.text) detail += ` "${String(el.text).substring(0, 40)}"`;
          if (el.fontSize) detail += ` size=${el.fontSize}`;
          if (el.fontWeight) detail += ` weight=${el.fontWeight}`;
          if (el.textColor) detail += ` color=${el.textColor}`;
          if (el.backgroundColor) detail += ` bg=${el.backgroundColor}`;
          parts.push(detail);
        }
      }
      return parts.join('\n');
    }).join('\n\n');

    referenceGuide = `
## 레퍼런스 분석 결과 (이 구조를 정확히 재현)
### 색상 팔레트
${colorsWithRgba}

### 타이포그래피
- 제목: ${referenceAnalysis.typography.headingSize}px, weight=${referenceAnalysis.typography.headingWeight || 700}
- 본문: ${referenceAnalysis.typography.bodySize}px, weight=${referenceAnalysis.typography.bodyWeight || 400}

### 섹션 구조
${sectionDetails}
`;
  }

  const prompt = `
당신은 한국 최고의 상세페이지 디자이너다. 피그마에서 실행할 수 있는 중첩 트리 구조(JSON 객체)를 생성하라.

## 캔버스 사양 (반드시 준수!)
- 전체 너비: ${canvasWidth}px
- 전체 높이: 약 ${preset.totalHeight}px (${preset.label})
- **섹션 수: 정확히 ${sectionOrder.length}개 (이보다 적게 만들면 안 된다!)**
- 각 섹션 평균 높이: 약 ${Math.round(preset.totalHeight / sectionOrder.length)}px
- **모든 ${sectionOrder.length}개 섹션을 빠짐없이 생성하라. 토큰 한도에 도달하기 전에 반드시 JSON을 완성하라.**

## 카테고리 스타일 가이드
${categoryContext}

${strategyGuide}

## 9단계 공식 기반 섹션 가이드 (${sectionOrder.length}개 섹션 모두 구현 필수!)
${sectionGuide}

## 입력 데이터
${inputDataStr}

${imageQuality}
${referenceGuide}

## 색상 팔레트
- primary: ${template.colorScheme.primary} = ${primaryRgba}
- secondary: ${template.colorScheme.secondary} = ${secondaryRgba}
- accent: ${template.colorScheme.accent} = ${accentRgba}
- 배경1: ${bgLight}, 배경2: ${bgMedium}, 배경3: ${bgDark}
- 본문: ${textPrimary}, 버튼위: ${textOnAccent}

## 출력 형식: TreeNode JSON 객체 (단일 객체, 배열 아님)

TreeNode 스키마:
{
  "type": "FRAME" | "TEXT" | "RECTANGLE" | "ELLIPSE",
  "name": "노드 이름",
  "width": number,
  "height": number,
  "layoutMode": "VERTICAL" | "HORIZONTAL",
  "layoutWrap": "NO_WRAP" | "WRAP",
  "paddingTop": number, "paddingRight": number, "paddingBottom": number, "paddingLeft": number,
  "primaryAxisAlignItems": "MIN" | "MAX" | "CENTER" | "SPACE_BETWEEN",
  "counterAxisAlignItems": "MIN" | "MAX" | "CENTER" | "BASELINE",
  "layoutSizingHorizontal": "FIXED" | "HUG" | "FILL",
  "layoutSizingVertical": "FIXED" | "HUG" | "FILL",
  "itemSpacing": number,
  "fillColor": { "r": 0-1, "g": 0-1, "b": 0-1, "a": 0-1 },
  "fills": [{ "type": "SOLID" | "GRADIENT_LINEAR", "color": RGBA, "gradientStops": [...], "opacity": 0-1 }],
  "strokeColor": RGBA,
  "strokeWeight": number,
  "cornerRadius": number,
  "opacity": number,
  "effects": [{ "type": "DROP_SHADOW", "color": RGBA, "offset": {"x":0,"y":4}, "radius": 20, "spread": 0, "visible": true }],
  "blendMode": "NORMAL" | "MULTIPLY" | "SCREEN" | "OVERLAY" | "SOFT_LIGHT" | "COLOR_DODGE",
  "rotation": number (도 단위, 장식 도형 회전용),
  "text": "텍스트 내용 (TEXT 타입 전용)",
  "fontSize": number,
  "fontWeight": number,
  "fontFamily": "Pretendard",
  "fontColor": RGBA,
  "textAlignHorizontal": "LEFT" | "CENTER" | "RIGHT",
  "letterSpacing": number,
  "lineHeight": number,
  "textAutoResize": "HEIGHT" | "WIDTH_AND_HEIGHT",
  "rangeStyles": [{ "start": number, "end": number, "fontSize": number, "fontWeight": number, "fontColor": RGBA, "textDecoration": "UNDERLINE" }],
  "children": [ TreeNode, TreeNode, ... ],
  "tag": "고유 식별 태그 (이미지 노드에 필수)"
}

## 절대 규칙 (이 규칙을 어기면 레이아웃이 완전히 깨진다)

### 핵심 레이아웃 규칙 (layoutSizingHorizontal — 가장 중요!)
**이 규칙을 어기면 텍스트가 세로로 읽히고, 프레임이 수십 px로 축소되어 레이아웃이 깨진다.**

1. 루트 노드: type="FRAME", width=${canvasWidth}, layoutMode="VERTICAL", layoutSizingVertical="HUG", name="상세페이지", **paddingLeft=0, paddingRight=0, paddingTop=0, paddingBottom=0** (루트에 패딩 금지!)
2. **VERTICAL 레이아웃 내부의 모든 자식은 layoutSizingHorizontal="FILL" 필수:**
   - 섹션 FRAME → layoutSizingHorizontal="FILL"
   - 섹션 내부의 Content FRAME → layoutSizingHorizontal="FILL"
   - Content 내부의 텍스트 래퍼 FRAME → layoutSizingHorizontal="FILL"
   - TEXT 노드 → layoutSizingHorizontal="FILL"
   - RECTANGLE(이미지) → layoutSizingHorizontal="FILL"
   - **예외**: HORIZONTAL 레이아웃 내부에서 고정 너비가 필요한 카드/아이콘만 width 고정 가능
3. **HORIZONTAL 레이아웃 내부의 자식:**
   - 균등 분배: 모든 자식 layoutSizingHorizontal="FILL" (예: 카드 3개 균등 배치)
   - 고정+유동: 아이콘 width=56(FIXED) + 텍스트 FRAME layoutSizingHorizontal="FILL"
   - **고정 width를 쓸 때도 최소 200px 이상** (56px 아이콘/48px 배지 제외)
4. **width 속성 사용 규칙:**
   - 루트 FRAME만 width=${canvasWidth} 명시
   - VERTICAL 부모의 자식에는 width를 쓰지 마라. layoutSizingHorizontal="FILL"만 사용
   - HORIZONTAL 부모의 자식에서 고정 크기가 필요하면 width 명시 가능
   - **절대 금지: width가 200 미만인 FRAME이나 TEXT** (아이콘 제외)
5. **TEXT 노드 필수 속성:**
   - layoutSizingHorizontal="FILL" (부모 너비를 채움 → 텍스트가 가로로 흐름)
   - textAutoResize="HEIGHT" (높이만 텍스트 양에 맞게 자동 조절)
   - 이 두 속성이 없으면 텍스트가 세로로 한 글자씩 읽히거나 잘린다!
6. 모든 FRAME은 반드시 layoutMode="VERTICAL" 또는 "HORIZONTAL". "NONE" 절대 금지
7. 오토레이아웃 자식에는 x, y 설정 금지

### 정확한 트리 구조 예시 (이 패턴을 따라라 — 폰트 크기와 패딩 비율 필수 준수!)
\`\`\`
{
  "type":"FRAME", "name":"상세페이지", "width":${canvasWidth}, "layoutMode":"VERTICAL", "layoutSizingVertical":"HUG", "itemSpacing":0,
  "paddingTop":0, "paddingBottom":0, "paddingLeft":0, "paddingRight":0,
  "children":[
    {
      "type":"FRAME", "name":"Section_Hero", "layoutMode":"VERTICAL", "layoutSizingHorizontal":"FILL", "layoutSizingVertical":"HUG",
      "paddingTop":0, "paddingBottom":0, "paddingLeft":0, "paddingRight":0, "itemSpacing":0,
      "fillColor":{"r":0.05,"g":0.05,"b":0.07,"a":1}, "clipsContent":true,
      "children":[
        {"type":"RECTANGLE", "name":"[이미지] Hero-Main", "layoutSizingHorizontal":"FILL", "height":1000,
         "fillColor":{"r":0.85,"g":0.85,"b":0.86,"a":1}, "tag":"img_hero_main"},
        {
          "type":"FRAME", "name":"Hero-Content", "layoutMode":"VERTICAL", "layoutSizingHorizontal":"FILL", "layoutSizingVertical":"HUG",
          "paddingTop":48, "paddingBottom":60, "paddingLeft":32, "paddingRight":32, "itemSpacing":20,
          "counterAxisAlignItems":"CENTER",
          "fills":[{"type":"GRADIENT_LINEAR","gradientStops":[{"color":{"r":0.05,"g":0.05,"b":0.07,"a":0.95},"position":0},{"color":{"r":0.05,"g":0.05,"b":0.07,"a":0.6},"position":1}],"gradientHandlePositions":[{"x":0.5,"y":1},{"x":0.5,"y":0}]}],
          "children":[
            {"type":"TEXT", "name":"Tagline", "text":"PREMIUM ORGANIC", "fontSize":14, "fontWeight":500, "fontFamily":"Noto Sans KR",
             "fontColor":{"r":1,"g":1,"b":1,"a":0.6}, "letterSpacing":4, "textAlignHorizontal":"CENTER",
             "layoutSizingHorizontal":"FILL", "textAutoResize":"HEIGHT"},
            {"type":"TEXT", "name":"Heading", "text":"자연이 주는\\n가장 완벽한 쾌적함", "fontSize":40, "fontWeight":800, "fontFamily":"Noto Serif KR",
             "fontColor":{"r":1,"g":1,"b":1,"a":1}, "textAlignHorizontal":"CENTER", "lineHeight":52,
             "layoutSizingHorizontal":"FILL", "textAutoResize":"HEIGHT"},
            {"type":"TEXT", "name":"Body", "text":"화학 처리 없는 자연 그대로의 촉감.\\n입을수록 부드러워지는 오가닉 리넨을 경험하세요.", "fontSize":18, "fontWeight":400, "fontFamily":"Noto Sans KR",
             "fontColor":{"r":1,"g":1,"b":1,"a":0.8}, "textAlignHorizontal":"CENTER", "lineHeight":28,
             "layoutSizingHorizontal":"FILL", "textAutoResize":"HEIGHT"},
            {
              "type":"FRAME", "name":"CTA-Button", "layoutMode":"HORIZONTAL", "layoutSizingHorizontal":"HUG", "layoutSizingVertical":"HUG",
              "paddingTop":16, "paddingBottom":16, "paddingLeft":40, "paddingRight":40,
              "cornerRadius":8, "fillColor":{"r":0.35,"g":0.46,"b":0.33,"a":1},
              "primaryAxisAlignItems":"CENTER", "counterAxisAlignItems":"CENTER",
              "effects":[{"type":"DROP_SHADOW","color":{"r":0,"g":0,"b":0,"a":0.3},"offset":{"x":0,"y":4},"radius":16,"spread":0,"visible":true}],
              "children":[
                {"type":"TEXT", "name":"CTA-Text", "text":"지금 주문하기", "fontSize":18, "fontWeight":700, "fontFamily":"Noto Sans KR",
                 "fontColor":{"r":1,"g":1,"b":1,"a":1}, "textAlignHorizontal":"CENTER",
                 "layoutSizingHorizontal":"HUG", "textAutoResize":"WIDTH_AND_HEIGHT"}
              ]
            }
          ]
        }
      ]
    },
    {
      "type":"FRAME", "name":"Section_Features", "layoutMode":"VERTICAL", "layoutSizingHorizontal":"FILL", "layoutSizingVertical":"HUG",
      "paddingTop":48, "paddingBottom":48, "paddingLeft":32, "paddingRight":32, "itemSpacing":28,
      "fillColor":{"r":1,"g":1,"b":1,"a":1},
      "children":[
        {"type":"TEXT", "name":"Section-Title", "text":"왜 이 제품인가요?", "fontSize":32, "fontWeight":700, "fontFamily":"Noto Sans KR",
         "fontColor":{"r":0.1,"g":0.1,"b":0.12,"a":1}, "textAlignHorizontal":"CENTER",
         "layoutSizingHorizontal":"FILL", "textAutoResize":"HEIGHT"},
        {
          "type":"FRAME", "name":"Card-Grid", "layoutMode":"HORIZONTAL", "layoutSizingHorizontal":"FILL", "layoutSizingVertical":"HUG",
          "itemSpacing":16,
          "children":[
            {
              "type":"FRAME", "name":"Card-01", "layoutMode":"VERTICAL", "layoutSizingHorizontal":"FILL", "layoutSizingVertical":"HUG",
              "paddingTop":20, "paddingBottom":20, "paddingLeft":20, "paddingRight":20, "itemSpacing":12,
              "cornerRadius":12, "fillColor":{"r":0.97,"g":0.97,"b":0.98,"a":1},
              "children":[
                {"type":"TEXT", "name":"Card-Title", "text":"카드 제목", "fontSize":22, "fontWeight":700,
                 "fontFamily":"Noto Sans KR", "fontColor":{"r":0.1,"g":0.1,"b":0.12,"a":1},
                 "layoutSizingHorizontal":"FILL", "textAutoResize":"HEIGHT"},
                {"type":"TEXT", "name":"Card-Body", "text":"카드 설명 텍스트가 여기에 들어갑니다. 충분한 길이로 작성하세요.", "fontSize":16, "fontWeight":400,
                 "fontFamily":"Noto Sans KR", "fontColor":{"r":0.1,"g":0.1,"b":0.12,"a":0.7},
                 "textAlignHorizontal":"LEFT", "lineHeight":24,
                 "layoutSizingHorizontal":"FILL", "textAutoResize":"HEIGHT"}
              ]
            }
          ]
        }
      ]
    }
  ]
}
\`\`\`
**위 예시에서 핵심:**
1. 모든 TEXT에 layoutSizingHorizontal="FILL" + textAutoResize="HEIGHT"
2. 모든 FRAME에 layoutSizingHorizontal="FILL"
3. **Hero 이미지(1000px) 아래에 그라데이션 Content FRAME → 이미지 위 텍스트 합성 효과**
4. **폰트: 제목 40px, 본문 18px, 캡션 14px — 이 비율이 핵심!**
5. **루트 itemSpacing=0 → 섹션 간 빈틈 없이 이어짐**

### 고급 비주얼 효과 (프리미엄 디자인 필수!)

#### 1. 블렌드 모드 — 레이어 합성으로 깊이감 (장식 프레임에만 사용!)
- **오버레이/그라데이션 프레임**: blendMode="MULTIPLY" → 어두운 영역이 더 깊어짐
- **글로우/보케/빛 효과 프레임**: blendMode="SCREEN" → 밝은 빛이 퍼지는 효과
- **장식 도형 프레임**: blendMode="SOFT_LIGHT" → 배경에 은은하게 녹아듦
- **절대 금지**: 섹션, 카드, 버튼, 텍스트 래퍼 등 구조적 프레임에 blendMode 사용 금지!
- 예시:
\`\`\`
{"type":"FRAME", "name":"Decoration-Glow", "width":400, "height":400, "cornerRadius":200,
 "fillColor":{"r":0.4,"g":0.2,"b":0.8,"a":0.3}, "blendMode":"SCREEN",
 "layoutMode":"VERTICAL", "layoutSizingHorizontal":"FIXED"}
\`\`\`

#### 2. 회전 — 장식 도형에 역동적 각도 (이미지/카드/버튼에는 절대 금지!)
- 장식 RECTANGLE/ELLIPSE에 rotation=15~45 또는 -15~-45 사용
- **사용 대상**: Decoration-Shape, Accent-Shape, Bg-Shape 등 순수 장식 도형만
- **절대 금지**: 이미지, 카드, 버튼, 텍스트, 구분선에 회전 사용 금지!
- 예시:
\`\`\`
{"type":"RECTANGLE", "name":"Decoration-Shape", "width":300, "height":300,
 "fillColor":{"r":0.3,"g":0.5,"b":0.9,"a":0.15}, "cornerRadius":20, "rotation":25}
\`\`\`

#### 3. rangeStyles — 텍스트 내 부분 강조 (가격, 숫자, 키워드에 색상+볼드)
- 숫자(73%, ₩39,900, 1,500+)나 키워드(무료, 한정)를 브랜드 컬러+볼드로 강조
- **start/end는 텍스트의 문자 인덱스** (0부터 시작)
- 제목급(fontSize≥36)에는 사용하지 마라 (이미 눈에 띔)
- 텍스트당 최대 3개 rangeStyle (과도한 강조 방지)
- 예시:
\`\`\`
{"type":"TEXT", "name":"Stats-Number", "text":"고객 만족도 97.3%를 달성했습니다",
 "fontSize":24, "fontWeight":400, "fontColor":{"r":0.1,"g":0.1,"b":0.12,"a":1},
 "rangeStyles":[{"start":7, "end":12, "fontWeight":800, "fontColor":{"r":0.8,"g":0.3,"b":0.1,"a":1}}],
 "layoutSizingHorizontal":"FILL", "textAutoResize":"HEIGHT"}
\`\`\`

#### 4. 아코디언/"+" 버튼 패턴 (FAQ/기능 상세 섹션용)
- HORIZONTAL FRAME 안에 [질문 TEXT(FILL)] + ["+" TEXT(FIXED 56px)] 구조
- 카드형으로 배경색+패딩+cornerRadius 적용
\`\`\`
{"type":"FRAME", "name":"Accordion-Item", "layoutMode":"HORIZONTAL", "layoutSizingHorizontal":"FILL",
 "layoutSizingVertical":"HUG", "paddingTop":20, "paddingBottom":20, "paddingLeft":24, "paddingRight":24,
 "itemSpacing":16, "counterAxisAlignItems":"CENTER", "cornerRadius":12,
 "fillColor":{"r":0.15,"g":0.15,"b":0.18,"a":1},
 "children":[
   {"type":"TEXT", "name":"Question", "text":"어떤 결제 수단을 지원하나요?", "fontSize":20, "fontWeight":500,
    "fontColor":{"r":1,"g":1,"b":1,"a":0.9}, "layoutSizingHorizontal":"FILL", "textAutoResize":"HEIGHT"},
   {"type":"FRAME", "name":"Toggle-Button", "layoutMode":"HORIZONTAL", "width":44, "height":44,
    "cornerRadius":22, "fillColor":{"r":1,"g":1,"b":1,"a":0.1},
    "primaryAxisAlignItems":"CENTER", "counterAxisAlignItems":"CENTER",
    "layoutSizingHorizontal":"FIXED", "layoutSizingVertical":"FIXED",
    "children":[
      {"type":"TEXT", "name":"Plus-Icon", "text":"+", "fontSize":24, "fontWeight":300,
       "fontColor":{"r":1,"g":1,"b":1,"a":0.7}, "layoutSizingHorizontal":"HUG", "textAutoResize":"WIDTH_AND_HEIGHT"}
    ]}
 ]}
\`\`\`

#### 5. 다중 fills — SOLID + GRADIENT 동시 적용 (깊이감 있는 배경)
- fills 배열에 SOLID + GRADIENT_LINEAR을 함께 넣으면 레이어드 효과
\`\`\`
"fills":[
  {"type":"SOLID", "color":{"r":0.05,"g":0.05,"b":0.1,"a":1}},
  {"type":"GRADIENT_RADIAL", "gradientStops":[
    {"color":{"r":0.3,"g":0.1,"b":0.6,"a":0.4},"position":0},
    {"color":{"r":0,"g":0,"b":0,"a":0},"position":1}
  ]}
]
\`\`\`

#### 6. 장식 요소 적극 활용 (섹션당 1~2개 장식 도형 권장)
- 어두운 섹션 배경에 큰 원형/사각형 장식 (opacity 0.1~0.3, blendMode="SCREEN" 또는 "SOFT_LIGHT")
- 글로우 효과: 큰 ELLIPSE(400~600px), 브랜드 컬러 연한 버전, blendMode="SCREEN"
- 기하학 도형: RECTANGLE(200~400px), rotation=15~30, opacity 0.1~0.2, cornerRadius=20

### 패딩/간격 규칙
8. **모든 섹션 FRAME에 반드시 padding과 itemSpacing을 명시하라:**
   - paddingTop/paddingBottom: 40~60 (일반), Hero는 60~80, 풀블리드 이미지 섹션은 0
   - paddingLeft/paddingRight: 24~40 (일반), 좁은 느낌이 필요하면 20도 가능
   - itemSpacing: 16~32 (섹션 내부), 섹션 사이는 루트 itemSpacing=0으로 빈틈 없이
   - padding이나 itemSpacing을 생략하지 마라. 생략하면 요소가 겹친다
   - **패딩을 줄여야 콘텐츠가 넓게 펼쳐진다. 과도한 패딩은 빈약해 보이는 원인!**
9. **모든 내부 FRAME에도 padding과 itemSpacing을 명시하라:**
   - 카드 프레임: padding 16~24, itemSpacing 8~16
   - 래퍼 프레임: padding 0~8, itemSpacing 12~20
   - **래퍼 FRAME에 padding=8을 무조건 넣지 마라. 불필요한 padding=0이 깔끔할 때가 많다**

### 레이어 네이밍 규칙 (외주 납품 수준 필수)
- 섹션 FRAME name: "Section_Hero", "Section_Problem", "Section_Features" 등 (Section_ 접두사 + 영문 역할명)
- 내부 FRAME name: 역할을 명확히 (예: "Content", "Card-Grid", "Card-01", "CTA-Button", "Section-Header")
- TEXT name: 역할 기반 (예: "Heading", "Subheading", "Body-Text", "Price", "Label", "Caption", "CTA-Text")
- 이미지 RECTANGLE name: "[이미지]" + 설명 (예: "[이미지] Hero-Main", "[이미지] Feature-01")
- 아이콘 FRAME name: "Icon" + 설명 (예: "Icon-Check", "Icon-Star")
- 장식 요소: "Divider", "Badge", "Decoration"
- 버튼 FRAME name: "CTA-Button", "Secondary-Button" (반드시 "Button" 포함)
- 카드 FRAME name: "Card-01", "Card-02" (번호 2자리)

### 텍스트 (모든 TEXT에 layoutSizingHorizontal="FILL" + textAutoResize="HEIGHT" 필수!)
★★★ fontColor 기본값 = {r:0.1, g:0.1, b:0.12, a:1} (검정). 흰색 텍스트는 어두운 fillColor가 확인된 부모 안에서만! ★★★
10. 모든 텍스트 한국어 필수. 자연스러운 한국어 문법과 문장으로 작성. 직역체/번역체 금지
11. TEXT 노드 필수 속성 (하나라도 빠지면 레이아웃 깨짐):
   - text, fontSize, fontWeight, fontColor, fontFamily (내용+스타일)
   - layoutSizingHorizontal="FILL" (부모 너비 채움 — 이것 없으면 텍스트가 세로로 읽힌다!)
   - textAutoResize="HEIGHT" (높이만 자동 조절)
7. fontFamily 사용 가능 폰트: "Noto Sans KR"(기본), "Noto Serif KR"(고급/격식)
   - 제목과 본문에 서로 다른 fontFamily 조합 권장 (예: 제목 Noto Serif KR + 본문 Noto Sans KR)
   - 한 페이지에 최대 2개 폰트만 사용
   - "Pretendard", "Inter" 등은 사용 금지. 반드시 "Noto Sans KR" 또는 "Noto Serif KR"만 사용
8. 폰트 크기 가이드 (캔버스 너비 ${canvasWidth}px 기준 — 실제 모바일 상세페이지 비율):
   - **절대 규칙: 본문 fontSize 최소 20 이상. 20 미만 금지. 제목은 최소 28 이상.**
   - 메인 제목(Hero heading): fontSize ${Math.round(36 * canvasWidth / 860)}~${Math.round(48 * canvasWidth / 860)} (임팩트 있게, 굵게)
   - 섹션 제목(section heading): fontSize ${Math.round(28 * canvasWidth / 860)}~${Math.round(36 * canvasWidth / 860)}
   - 부제목(subheading/tagline): fontSize ${Math.round(18 * canvasWidth / 860)}~${Math.round(24 * canvasWidth / 860)}
   - 본문(body): fontSize ${Math.round(20 * canvasWidth / 860)}~${Math.round(24 * canvasWidth / 860)}
   - 캡션/라벨/뱃지: fontSize ${Math.round(14 * canvasWidth / 860)}~${Math.round(18 * canvasWidth / 860)}
   - 가격(할인가): fontSize ${Math.round(32 * canvasWidth / 860)}~${Math.round(40 * canvasWidth / 860)}, fontWeight=800
   - 가격(원가/취소선): fontSize ${Math.round(20 * canvasWidth / 860)}~${Math.round(24 * canvasWidth / 860)}, opacity=0.5
   - **시각적 위계(hierarchy)가 핵심**: 제목 > 부제목 > 본문 > 캡션 순으로 크기 차이가 명확해야 한다
   - 같은 섹션 내에서도 강조할 텍스트는 크게, 보조 설명은 작게 차이를 줘라
   - 섹션마다 다양하게 변화. 매번 같은 크기로 고정하지 마라
9. **텍스트 정렬 규칙 (상황별로 다르게)**:
   - 섹션 제목, 부제목: textAlignHorizontal="CENTER" (가운데 정렬)
   - Hero 제목/부제목: textAlignHorizontal="CENTER"
   - CTA 제목/버튼: textAlignHorizontal="CENTER"
   - **본문 텍스트, 카드 내부 텍스트: textAlignHorizontal="LEFT" (좌측 정렬)**
   - **아이콘+텍스트 조합의 설명 텍스트: textAlignHorizontal="LEFT"**
   - **특징/장점 나열 항목: textAlignHorizontal="LEFT"**
   - 리뷰/후기 텍스트: textAlignHorizontal="LEFT"
   - 가격 텍스트: textAlignHorizontal="LEFT" 또는 "CENTER"
   - 캡션/라벨: textAlignHorizontal="LEFT"
   - 좌측 정렬이 기본. 제목/CTA만 가운데. 전부 CENTER로 하면 AI스럽게 보인다
10. 텍스트 작성 규칙:
   - 상세페이지답게 고객의 마음을 움직이는 카피라이팅으로 작성
   - 섹션마다 톤을 다르게: Hero는 임팩트, Features는 명쾌, Benefits는 감성, CTA는 긴급성
   - 같은 표현 반복 금지. 섹션마다 새로운 표현과 어조 사용
10-1. ★ **짧은 텍스트는 반드시 한줄에 맞춰라 (줄바꿈 금지!)**:
   - 카드 제목, 배지 텍스트, 기능 이름, 장점 한줄 요약 등 짧은 텍스트가 2줄로 떨어지면 디자인이 지저분해진다
   - **해결법**: 텍스트가 한줄에 안 들어오면 fontSize를 줄여서라도 한줄에 맞춰라
   - 카드 제목: 10자 이내로 작성하되, 넘칠 것 같으면 fontSize를 20→18→16으로 조절
   - 배지/라벨: 6자 이내, fontSize 줄여서라도 절대 2줄로 만들지 마라
   - 기능 이름/장점 키워드: 8자 이내가 이상적
   - ★ 줄바꿈이 발생하면 차라리 텍스트를 짧게 다시 써라 (예: "무제한 스트리밍 서비스 제공" → "무제한 스트리밍")
11. **텍스트 줄바꿈 자연스럽게 (가독성 핵심)**:
   - 한 줄에 15~25자(한글 기준) 이내로 작성. 너무 긴 문장은 2줄로 나눠라
   - 조사("은", "는", "이", "가")나 어미("니다", "요", "죠")만 혼자 다음 줄로 떨어지지 않게 문장 길이를 조절하라
   - **나쁜 예**: "최고의 맛을 선사합\\n니다" → **좋은 예**: "최고의 맛을\\n선사합니다"
   - 줄바꿈이 자연스러운 단위: 주어+서술어 / 목적어+동사 / 수식어+피수식어
   - 핵심 키워드가 줄의 맨 앞이나 맨 끝에 오도록 배치하라
   - 본문 텍스트는 짧게 2~3줄 이내로 끊어 작성
11-1. ★★★ **문장 끝 쉼표(,) 절대 금지!**:
   - 줄바꿈(\\n) 앞에 쉼표를 넣지 마라. 줄바꿈은 문장이 이어지는 게 아니다.
   - **나쁜 예**: "최상의 품질을 약속합니다,\\n지금 바로 경험하세요" ← 쉼표 불필요!
   - **좋은 예**: "최상의 품질을 약속합니다\\n지금 바로 경험하세요"
   - 텍스트 맨 끝에도 쉼표를 넣지 마라. 마침표(.)나 아무것도 넣지 않는 게 자연스럽다.
   - 쉼표는 오직 한 문장 안에서 나열(목록)할 때만 사용하라.

### 텍스트 꾸미기 + 아이콘 디자인 (프로페셔널하게)
12. **아이콘+텍스트 조합 패턴 (현업 디자인 - 이모지 남용 금지)**:
    - 구조: HORIZONTAL FRAME(itemSpacing=16, **counterAxisAlignItems="MIN"** ← 반드시 MIN! CENTER 쓰면 텍스트가 아이콘보다 위에서 시작함) 안에:
      * 아이콘 FRAME(cornerRadius=16, fillColor=브랜드색 10% 투명도, width=56, height=56, primaryAxisAlignItems="CENTER", counterAxisAlignItems="CENTER") + 아이콘 TEXT(fontSize=28~32)
      * VERTICAL FRAME(itemSpacing=6, **padding=0**) + [제목 TEXT(fontSize=24~28, fontWeight=700, textAlignHorizontal="LEFT")] + [설명 TEXT(fontSize=16~18, fontWeight=400, textAlignHorizontal="LEFT")]
    - **counterAxisAlignItems="MIN" 필수!** 아이콘과 텍스트의 첫 줄이 같은 높이에서 시작해야 한다
    - **숫자 아이콘("01", "02")은 width 최소 64px** — 너무 좁으면 숫자가 세로로 표시됨
    - **이모지 사용 규칙: 카테고리와 어울리는 것만 선택하고 최소 사용**
      * 이커머스: 📦 배송, ✨ 품질, 🔒 보안, ♻️ 친환경
      * 의료: 🏥 병원, 💊 치료, 🩺 진료, ⏰ 시간
      * 음식: 🍽️ 음식, 🔥 인기, ⭐ 평점
      * 교육: 📚 학습, 🎯 목표, 💡 아이디어
    - **이모지 대신 숫자/문자 아이콘도 활용 (더 프로페셔널)**:
      * FRAME(cornerRadius=32, fillColor=primary, width=56, height=56) + TEXT("01", fontSize=24, fontWeight=700, fontColor=배경과 대비되는 색)
      * FRAME(cornerRadius=16, fillColor=accent 연한, width=56, height=56) + TEXT("✓", fontSize=28, fontWeight=700, fontColor=primary)
    - **아이콘 크기 일관성**: 같은 섹션 내 아이콘은 모두 동일한 크기(56x56 또는 48x48)로 통일
    - **아이콘 배경색**: 브랜드 컬러의 10% 불투명도 버전 사용. 너무 진하지 않게
13. **강조 텍스트 박스 (할인율, 핵심 수치)**:
    - FRAME(cornerRadius=12, fillColor=브랜드색 연한 버전, paddingTop=12, paddingBottom=12, paddingLeft=24, paddingRight=24) + TEXT(fontWeight=700)
    - 할인율, 가격, 핵심 수치에 활용
14. **구분선/장식선 (섹션 헤더 아래)**:
    - 제목 아래: RECTANGLE(width=60~80, height=4, cornerRadius=2, fillColor=accent 색상)
    - 섹션 구분: RECTANGLE(width=전체폭, height=1, fillColor={r:0,g:0,b:0,a:0.06})

### 이미지 (시각적 임팩트가 핵심 — 상세페이지의 주인공)
15. 이미지 위치에 RECTANGLE 사용. tag 필수 (예: "img_hero_main"), name에 "Image" 포함
16. fillColor={r:0.92, g:0.92, b:0.93, a:1}
17. **이미지는 크게! 양옆 여백 없이 섹션 가로폭 전체를 꽉 채워라**: layoutSizingHorizontal="FILL" 필수
18. **이미지 높이를 다양하고 과감하게 (세로로 긴 이미지도 적극 활용!)**:
    - Hero 이미지: height 900~1400 (화면 가득 채우는 풀스크린, 가장 크게!)
    - **세로형 몰입 이미지**: height 1000~1600 (스크롤하면서 빠져드는 느낌 — 최소 2개 섹션에 사용)
    - 섹션 메인 이미지: height 600~1000 (세로로 길게, 존재감 있게)
    - 갤러리/카드 이미지: height 400~600
    - **같은 높이로 반복하지 마라. 짧은(400px) → 긴(1200px) → 중간(700px) 변화를 줘라**
    - **이미지 하단에 그라데이션 오버레이 + 큰 텍스트 배치 = 몰입감 극대화**
    - **이미지 크기 비율: 가로로 넓게! 정사각형이나 세로형이 아닌, 16:9 또는 3:2 비율로 가로가 더 긴 이미지를 기본으로 사용하라.**
    - **절대 금지: 이미지를 작게 만들어서 섹션 안에서 떠 있게 하는 것. 이미지는 섹션 가로폭을 꽉 채워야 한다!**
19. **이미지 배치 절대 규칙 — 가장 중요! (이것을 어기면 상세페이지가 못생겨진다)**:
    - **이미지 RECTANGLE은 섹션 FRAME의 직접 자식으로 넣어라** (중간에 래퍼 FRAME 절대 금지!)
    - **나쁜 구조 (절대 금지!)**: Section > Wrapper-FRAME(흰색배경, 패딩) > RECTANGLE ← 이렇게 하면 이미지 주위에 흰색 테두리가 생김
    - **좋은 구조 (필수!)**: Section > RECTANGLE(이미지, FILL) ← 이미지가 섹션 전체를 꽉 채움
    - 이미지가 포함된 섹션: paddingLeft=0, paddingRight=0 (이미지가 가로 전체를 채우도록)
    - 이미지 + 텍스트를 함께 넣고 싶으면: Section(padding=0) > RECTANGLE(이미지) + Content-FRAME(padding=32, 투명 배경)
    - **이미지 양옆에 여백을 두면 답답하고 빈약해 보인다 — 절대 금지!**
    - **이미지를 FRAME으로 감싸고 그 FRAME에 배경색/패딩을 주는 패턴 = 가장 흔한 실수 → 절대 금지!**
20. **이미지 아래 텍스트 영역 (Content/Overlay FRAME) 규칙**:
    - **fillColor 사용 금지! 투명 배경(fillColor 없음) 또는 GRADIENT_LINEAR만 허용**
    - 나쁜 예: Content FRAME에 fillColor={r:1,g:1,b:1,a:1} ← 흰색 박스가 이미지 아래에 생김
    - 좋은 예: Content FRAME에 fillColor 없음 + 섹션 배경색이 자연스럽게 보임
    - 좋은 예: Overlay FRAME에 fills=[GRADIENT_LINEAR] ← 이미지와 자연스럽게 합성
21. **그라데이션 오버레이 패턴 (필수 — 최소 3개 섹션에 적용)**:
    - 이미지 RECTANGLE 다음에 같은 부모 안에 FRAME을 추가 (name에 "Overlay" 포함)
    - fills에 GRADIENT_LINEAR 사용: 아래에서 위로 투명→반투명 검정 (또는 브랜드 컬러)
    - 그 위에 텍스트를 올려서 이미지+텍스트 합성 효과
    - 오버레이 활용 패턴:
      * Hero: 이미지 위에 어두운 그라데이션 + 큰 제목 + CTA 버튼
      * 상품 강조: 이미지 아래쪽에 그라데이션 + 가격/할인 정보
      * CTA: 배경 이미지 + 브랜드색 반투명 오버레이 + 행동 유도 문구
22. 전체 트리에 이미지 RECTANGLE 최소 12개 이상
23. **이미지 tag 작성 규칙 (AI 이미지 생성 일관성 — 매우 중요!)**:
    - ★★★ tag에 상품/서비스명 키워드를 반드시 포함하라! 이 tag로 이미지를 생성한다! ★★★
    - 입력 데이터의 상품명/서비스명/가게명을 tag에 반드시 반영
    - tag 형식: "img_{섹션}_{상품명영문}_{구체적설명}"
    - **좋은 예**: "img_hero_tteokbokki_closeup_steam", "img_feature_tteokbokki_ingredients_fresh", "img_gallery_tteokbokki_plating_beautiful"
    - **나쁜 예**: "img_hero_main", "img_section_1", "img_food_generic" ← 상품명 없으면 엉뚱한 사진 생성됨!
    - 같은 상품이면 모든 이미지 tag에 해당 상품명 키워드 포함
    - **각 tag에 구체적인 장면 설명 추가**: closeup, ingredients, cooking, plating, customer, interior 등
    - name 필드에도 상품 키워드 포함 (예: "[이미지] 떡볶이 Hero Main", "[이미지] 떡볶이 재료 Close-up")

### 버튼 (적당한 크기, 눈에 띄게)
23. 버튼 FRAME: paddingTop/Bottom 14~20, paddingLeft/Right 32~48, cornerRadius 8~12
24. 버튼 텍스트 fontSize 16~20, fontWeight 700
25. CTA 버튼에는 반드시 DROP_SHADOW 적용 ({"type":"DROP_SHADOW","color":{"r":0,"g":0,"b":0,"a":0.25},"offset":{"x":0,"y":4},"radius":16,"spread":0,"visible":true})
26. 버튼 이름(name)에 반드시 "Button" 또는 "CTA" 포함
27. **CTA 버튼은 layoutSizingHorizontal="FILL" (부모 너비에 맞게 넓게) 또는 "HUG" (텍스트에 맞게) 상황에 따라 선택**

### 그라데이션 오버레이 (이미지와 텍스트 합성 — 핵심 디자인 패턴)
28. **오버레이 패턴 (Hero/CTA에서 이미지+텍스트 합성)**:
    - 부모 FRAME: VERTICAL, itemSpacing=0, 모든 padding=0 (이미지 풀블리드!)
    - 이미지 RECTANGLE: layoutSizingHorizontal="FILL", height=800~1200
    - Content/Overlay FRAME: layoutSizingHorizontal="FILL", layoutSizingVertical="HUG"
      - fills에 GRADIENT_LINEAR 사용 (아래→위: 진한 배경색 → 투명)
      - **fillColor 사용 금지! fills 배열의 GRADIENT_LINEAR만 허용**
      - padding: 48~60 top/bottom, 32 left/right, itemSpacing=16~24
      - 내부에 텍스트/버튼 배치
    - **결과: 이미지 바로 아래에 그라데이션이 이어져서 자연스러운 합성 효과**
29. **절대 금지 3가지:**
    - 오버레이/Content FRAME에 **fillColor** 사용 금지 (특히 흰색!). fills[GRADIENT_LINEAR] 또는 투명만
    - 오버레이 FRAME에 layoutSizingVertical="FIXED" 금지 → HUG만
    - 이미지를 감싸는 래퍼 FRAME 금지 → 이미지는 섹션의 직접 자식
30. 오버레이 이름(name)에 "Overlay" 또는 "Content" 포함 필수

### 아이콘/장식 요소 (프로페셔널 + 일관성)
31. ELLIPSE 단독 사용 금지. 아이콘은 반드시 배경 FRAME + 내부 콘텐츠 조합:
    - **기본 아이콘**: FRAME(cornerRadius=16, fillColor=브랜드색 10% 버전, width=64, height=64, layoutMode="VERTICAL", primaryAxisAlignItems="CENTER", counterAxisAlignItems="CENTER") + TEXT(fontSize=32~36)
    - **원형 숫자 아이콘**: FRAME(cornerRadius=32, fillColor=primary, **width=64, height=64**, layoutMode="VERTICAL", primaryAxisAlignItems="CENTER", counterAxisAlignItems="CENTER") + TEXT("01", **fontSize=24**, fontWeight=700, fontColor=배경과 대비되는 색)
    - **숫자 텍스트가 세로로 표시되지 않게: 아이콘 width는 최소 64px, fontSize는 22~28px로 제한**
    - **체크 아이콘**: FRAME(cornerRadius=16, fillColor=accent 연한, width=56, height=56) + TEXT("✓", fontSize=28, fontWeight=800, fontColor=primary)
32. **아이콘 일관성 규칙**:
    - 같은 섹션의 아이콘은 모두 동일한 크기, 동일한 cornerRadius, 동일한 배경색
    - 아이콘 크기: 56x56 또는 64x64 중 하나로 통일 (섹션 내에서 혼용 금지, 48x48 이하 금지!)
    - 아이콘 배경색은 해당 섹션의 브랜드/강조 컬러의 연한 버전으로 통일
33. **이모지 사용 절제**: 이모지는 한 섹션에 최대 4~5개. 무분별한 이모지 나열은 AI스럽게 보인다. 이모지 대신 숫자 아이콘이나 ✓ 체크가 더 프로페셔널하다
34. 장식용 도형: cornerRadius, 그라데이션, opacity 활용. 하지만 과하지 않게

### 리뷰/후기 섹션 (콤팩트 + 지그재그)
34. 리뷰 카드는 작고 밀도 있게 배치:
    - 카드 FRAME: width 고정 350~400px, cornerRadius=12, padding=20, DROP_SHADOW
    - 별점: 이모지 "⭐⭐⭐⭐⭐" TEXT fontSize=16
    - 리뷰 텍스트: fontSize=16~18, lineHeight=26, 2~3줄 이내
    - 리뷰어 이름: fontSize=14, fontWeight=400, opacity=0.5
35. 지그재그/그리드 레이아웃:
    - 상위 FRAME: layoutMode="HORIZONTAL", layoutWrap="WRAP", itemSpacing=24
    - 카드 3~4개를 WRAP으로 배치 → 자연스러운 그리드
    - 또는 2열: HORIZONTAL FRAME에 카드 2개씩, 좌우 교대 배치

### Hero 섹션 디자인 (상세페이지의 얼굴 — 가장 중요! 임팩트 퐉!)
**Hero는 방문자의 첫인상. 3초 안에 "이것 사고 싶다"를 느끼게 해야 한다.**
**매번 같은 패턴 금지! 아래 변형 중 랜덤으로 선택하라:**

**패턴 A: 풀블리드 이미지 + 그라데이션 오버레이 (가장 임팩트 있음)**
- 거대한 상품 이미지 (height 1200~1600, 스크롤을 압도하는 크기!)
- 이미지 아래에 그라데이션 Content FRAME (GRADIENT_LINEAR: 어두운색 95% → 투명 0%)
- itemSpacing=0으로 이미지와 그라데이션이 이어짐 → 이미지 위에 텍스트가 떠있는 느낌
- 헤드카피 fontSize 40~52, fontWeight 900, 임팩트 있는 1~2줄

**패턴 B: 분할 히어로 (좌: 텍스트 / 우: 이미지)**
- HORIZONTAL FRAME 안에:
  * 좌측 VERTICAL FRAME (FILL, padding 48): 태그라인 + 헤드카피 + 서브카피 + CTA
  * 우측 이미지 RECTANGLE (width=50%, height 800~1000)
- 텍스트가 먼저 눈에 들어오는 구조

**패턴 C: 세로형 몰입 히어로 (쿠팡/네이버 스타일)**
- 이미지 height 1400~1800 (스크롤해야 할 정도로 큼!)
- 이미지 하단에 그라데이션 fade + 짧은 텍스트만 (제목+CTA)
- 이미지가 주인공, 텍스트는 최소한

**공통 규칙:**
- **Hero 이미지 tag에 반드시 상품명/서비스명 키워드 포함** (예: "img_hero_tteokbokki_main")
- Hero Content FRAME은 반드시 fills에 GRADIENT_LINEAR 사용 (흰색 배경 절대 금지!)
- **태그라인**: 영문 대문자 또는 짧은 한국어, fontSize 14~16, letterSpacing 3~5, 연한 색상
- **헤드카피**: fontSize 36~52, fontWeight 800~900, 2줄 이내, 고객의 욕구를 건드리는 카피
- **서브카피**: fontSize 16~20, fontWeight 400, 80% 불투명도, 핵심 가치 1~2문장
- **CTA 버튼**: 브랜드 accent 배경, fontSize 16~18, cornerRadius 8, DROP_SHADOW
- **장식 효과 필수**: 방사형 글로우 또는 보케 원형 추가 (위 "장식 배경 효과" 참고)

### ★ 메인컬러 일관성 (브랜드 정체성 핵심!)
- 사용자가 brandColor(primary)를 지정했으면 CTA 버튼, 강조 텍스트, 배지, 아이콘 배경, 구분선 등에 반드시 해당 색상을 일관되게 사용하라
- brandColor가 없으면 카테고리 기본 primary를 메인컬러로 사용
- ★ 메인컬러가 페이지 전체에 일관되게 나타나야 "전문 디자이너가 만든" 느낌이 난다
- 메인컬러 활용처: CTA 버튼 배경, 강조 텍스트 색상, 아이콘 원형 배경(10% opacity), 배지 배경, 구분선, 링크 색상, 가격 강조
- 보조컬러(accent)는 포인트로만 사용: 할인율 태그, 별점, 특별 혜택 강조 등

### 배경색 다양화 (단조로운 흰/검 반복 절대 금지! 카테고리별 고유 색감!)
36. 각 섹션의 배경색을 카테고리 색상 기반으로 풍부하게 변화시켜라.
37. **사용할 배경색 팔레트:**
    - 다크1: secondary ${secondaryRgba} 어둡게 (Hero용)
    - 다크2: primary를 70% 어둡게 (중간/CTA용 — 다크1과 다른 톤)
    - 브랜드 틴트: primary를 92% 연하게 (은은한 브랜드 색감)
    - secondary 틴트: secondary를 90% 연하게 (차분한 색감)
    - accent 틴트: accent를 88% 연하게 (따뜻한/포인트 색감)
    - 혼합 톤: primary+accent 중간을 88% 연하게 (유니크한 톤)
    - 화이트: ${bgLight}
    - 라이트그레이: ${bgMedium}
38. **배경 패턴**: 다크1 → 브랜드틴트 → secondary틴트 → 화이트 → accent틴트 → 다크2 → 혼합톤 → 브랜드미듐 → 다크1 → 라이트그레이
39. Hero: secondary 기반 어두운 배경 (임팩트!)
40. CTA: primary 기반 깊은 배경 (Hero와 다른 색감!)
41. **중간 섹션 1~2개도 어두운 배경 사용** (페이지에 리듬감 부여!)
42. 두 개 연속 같은 밝기의 배경색 절대 금지

### ★★★ 장식 배경 효과 (프리미엄 상세페이지의 핵심! 매번 다른 스타일!) ★★★
텍스트 위주 섹션에 단색 배경만 사용하면 밋밋하다. 장식 효과를 추가하라!
아래 스타일을 섹션마다 다르게 조합. 같은 페이지에서 모든 섹션이 같은 효과 금지!

**스타일 A: 방사형 글로우 (어두운 배경 섹션용)**
- 섹션 children 첫 번째에 ELLIPSE 추가 (name="Decoration-Glow")
- width=800, height=800, layoutSizingHorizontal="FILL"
- fills: GRADIENT_RADIAL, 중앙=primary 또는 accent (a:0.15~0.25) → 가장자리=투명(a:0)
- opacity: 0.2~0.3

**스타일 B: 보케 원형 (어두운 배경 섹션용)**
- ELLIPSE 3~5개 (name="Decoration-Orb-01" 등)
- 크기 100~400px, 각기 다른 위치에 배치
- fillColor: primary 또는 accent, opacity=0.05~0.12
- effects: [{"type":"LAYER_BLUR","radius":60}]

**스타일 C: 대각선 그라데이션 (밝은 배경 섹션용)**
- children 첫 번째에 FRAME (name="Decoration-Gradient", layoutSizingHorizontal="FILL", height=전체높이)
- fills: GRADIENT_LINEAR 대각선, primary(a:0.04~0.08) → 투명 → accent(a:0.04~0.06)

**스타일 D: 기하학 도형 (밝은 배경 섹션용)**
- RECTANGLE 또는 ELLIPSE 2~4개 (name="Decoration-Shape-01" 등)
- 큰 크기 200~500px, opacity=0.03~0.06
- 배경색보다 약간 진한 색, cornerRadius 크게

**스타일 E: 상하단 페이드 (모든 섹션)**
- 섹션 상단/하단에 FRAME (height=100~200px, layoutSizingHorizontal="FILL")
- fills: GRADIENT_LINEAR 수직, 인접 섹션 색 → 현재 섹션 색 (자연스러운 전환)

어두운 섹션에는 A 또는 B 필수. 밝은 섹션에는 C 또는 D 선택. 최소 3개 섹션에 장식 효과 적용.

### 이펙트
38. 카드/버튼에 DROP_SHADOW 적용
39. Hero/CTA에 그라데이션 fills 사용 (GRADIENT_LINEAR)
40. 핵심 이미지에 cornerRadius=20~32 적용으로 부드러운 느낌
41. **장식 효과 레이어는 반드시 텍스트보다 먼저(앞에) children에 배치 (텍스트 뒤에 깔려야 함)**

### 색상 대비 및 텍스트 색상 다양성 (시각적 풍부함 핵심!)
41. ★★★ 기본 fontColor = {r:0.1, g:0.1, b:0.12, a:1} (검정). 흰색 텍스트는 어두운 fillColor 부모 안에서만 ★★★
42. 모든 RGBA 값은 0-1 범위
43. **텍스트 색상을 다양하게 사용하라! 단조로운 색상은 AI스럽게 보인다:**
    - **밝은 배경 위 텍스트 (최소 4가지 색상 사용!):**
      * 메인 제목: 진한 primary ${primaryRgba} 또는 진한 secondary ${secondaryRgba}
      * 소제목/라벨: accent ${accentRgba}로 포인트
      * 본문: 기본 어두운 색상 ${textPrimary}
      * 캡션/보조: 연한 회색 {r:0.5, g:0.5, b:0.52, a:1}
      * 강조 수치/가격: accent 또는 primary 강한 색상
    - **어두운 배경이어도 일단 어두운 텍스트로 생성하라. 후처리 파이프라인이 자동으로 대비를 보정한다.**
      * 메인 제목: ${textPrimary} (후처리에서 필요 시 자동 밝게 변환)
      * 소제목/라벨: accent ${accentRgba}
      * 본문: ${textPrimary}
      * 캡션: {r:0.5, g:0.5, b:0.52, a:1}
    - **같은 섹션에서 제목-소제목-본문의 fontColor가 모두 같으면 안 된다! 최소 2가지 색상 사용**
    - **흰색 배경에 흰색 텍스트 = 절대 금지! 확신 없으면 무조건 어두운 텍스트 사용**

### 콘텐츠 밀도 (빈약하면 안 된다 — 꽉 차야 매력적)
- **각 섹션에 최소 3개 이상의 의미 있는 요소** (제목+이미지만은 빈약!)
- 특징/장점 섹션: 최소 3개 항목, 각 항목에 아이콘+제목+설명 조합
- 본문 텍스트: 2~3문장, lineHeight 지정(fontSize * 1.5~1.7)으로 가독성 확보
- 이미지와 텍스트의 비율: 이미지 60% + 텍스트 40% (이미지가 주인공)
- **빈 FRAME, 빈 Overlay, 높이만 큰 빈 공간 절대 금지**
- 카드/리스트는 실제 데이터처럼 구체적인 내용으로 채워라

### ★★★ layoutSizingHorizontal 핵심 규칙 (최우선!)
- **VERTICAL 부모의 모든 자식 FRAME/TEXT → layoutSizingHorizontal="FILL" 필수!**
- **"HUG"를 사용하면 자식이 내용물 크기로 축소되어 80px짜리 세로 텍스트 등 깨진 레이아웃이 됨**
- **유일한 예외: 아이콘 FRAME (56x56, 64x64), 이미지 RECTANGLE**
- Section-Header, Content, Overlay, Wrapper, Body 등 구조 프레임은 반드시 FILL
- HORIZONTAL 부모 안에서만 HUG 또는 FIXED 허용

### 출력 전 자체 검증 (JSON 출력 전에 반드시 확인!)
43. **검증 체크리스트 — 하나라도 위반하면 처음부터 다시 생성하라:**
   - [ ] 모든 TEXT 노드에 layoutSizingHorizontal="FILL"과 textAutoResize="HEIGHT"가 있는가?
   - [ ] VERTICAL 부모의 모든 자식 FRAME에 layoutSizingHorizontal="FILL"이 있는가?
   - [ ] VERTICAL 부모의 자식에 width 속성을 명시하지 않았는가? (FILL이면 width 불필요)
   - [ ] width가 200 미만인 FRAME이나 TEXT가 없는가? (아이콘 48~56px 제외)
   - [ ] 모든 FRAME에 layoutMode="VERTICAL" 또는 "HORIZONTAL"이 있는가?
   - [ ] 모든 섹션 FRAME에 padding과 itemSpacing이 명시되어 있는가?
   - [ ] **Hero 섹션의 Content/Overlay FRAME에 흰색 배경이 아닌 그라데이션이 적용되어 있는가?**
   - [ ] **어떤 FRAME도 layoutSizingVertical="FIXED"로 빈 공간을 만들고 있지 않은가? (HUG 사용!)**
   - [ ] **모든 fontSize가 폰트 크기 가이드 범위 안에 있는가? (본문 20~24, 제목 28~48, 캡션 14~18)**
   - [ ] **루트 프레임의 paddingLeft/Right가 0인가? (루트에 패딩 있으면 전체 레이아웃이 좁아진다)**
   - [ ] **이미지 RECTANGLE이 FRAME 래퍼 없이 섹션의 직접 자식인가? (이미지 래퍼 FRAME 금지!)**
   - [ ] **Overlay/Content FRAME에 fillColor(흰색 SOLID)가 없고 fills[GRADIENT] 또는 투명인가?**
   - [ ] **이미지가 포함된 섹션의 paddingLeft/Right가 0인가? (이미지 풀블리드 필수!)**
   - [ ] **Hero 섹션에 이미지 RECTANGLE + 메인카피 TEXT 둘 다 있는가? (하나라도 없으면 실패!)**
   - [ ] **Testimonials 섹션에 후기 카드가 최소 3개 있는가? (3개 미만이면 실패!)**
   - [ ] **Trust/Partners 섹션에 로고용 이미지 플레이스홀더가 있는가?**
   - [ ] **짧은 텍스트(카드 제목, 배지)가 10자 이내인가? (줄바꿈 방지)**
   - [ ] **메인컬러(primary)가 CTA 버튼, 배지, 아이콘 배경에 일관되게 사용되었는가?**

### 출력 형식
44. 유효한 JSON 객체만 출력. 설명, 마크다운, 주석 없이 { ... } 형태만
45. 노드 총 개수 최소 100개 이상 (풍부하고 다채로운 디자인)
`.trim();

  return prompt;
}

/**
 * 모드에 따라 적절한 프롬프트를 빌드한다.
 */
export function buildPromptByMode(
  request: FigmaGenerateRequest,
  referenceAnalysis?: Omit<Parameters<typeof buildReferenceClonePrompt>[1], never>
): string {
  switch (request.mode) {
    case 'detail-page':
      return buildFigmaPrompt(request);
    case 'web-design':
      return buildWebDesignPrompt(request);
    case 'reference-clone':
      if (!referenceAnalysis) {
        throw new Error('reference-clone 모드에는 분석 결과가 필요합니다');
      }
      return buildReferenceClonePrompt(request, referenceAnalysis);
    default:
      return buildFigmaPrompt(request);
  }
}
