/**
 * Image Composition - 이미지 구도 및 촬영 가이드
 * 제품 사진의 구도, 배치, 스타일 가이드라인
 */

// ===== 구도 타입 정의 =====
export interface CompositionGuide {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  useCases: string[];
  gridRule: string;
  cameraAngle: string;
  examplePrompt: string;
}

// ===== 기본 구도 =====
export const COMPOSITION_RULES: CompositionGuide[] = [
  {
    id: 'rule-of-thirds',
    name: 'Rule of Thirds',
    nameKo: '삼등분 법칙',
    description: '화면을 9등분하여 교차점에 주요 피사체 배치',
    useCases: ['제품 단독 샷', '라이프스타일 이미지', '배너 이미지'],
    gridRule: '가로 2선, 세로 2선으로 9분할',
    cameraAngle: '정면 또는 45도',
    examplePrompt: 'Product placed at left-third intersection, natural lighting, clean background',
  },
  {
    id: 'center-composition',
    name: 'Center Composition',
    nameKo: '중앙 구도',
    description: '피사체를 정중앙에 배치하여 강렬한 인상',
    useCases: ['대칭적인 제품', '고급 제품', '미니멀 디자인'],
    gridRule: '화면 정중앙',
    cameraAngle: '정면',
    examplePrompt: 'Product centered perfectly, symmetrical composition, dramatic lighting',
  },
  {
    id: 'diagonal',
    name: 'Diagonal Composition',
    nameKo: '대각선 구도',
    description: '대각선 방향으로 피사체 배치, 역동적인 느낌',
    useCases: ['액션 제품', '스포츠 용품', '모던 테크'],
    gridRule: '좌하단에서 우상단 또는 그 반대',
    cameraAngle: '45도 또는 틸트',
    examplePrompt: 'Dynamic diagonal placement, sense of motion, modern aesthetic',
  },
  {
    id: 'golden-ratio',
    name: 'Golden Ratio',
    nameKo: '황금비율',
    description: '1:1.618 비율을 활용한 자연스러운 구도',
    useCases: ['프리미엄 제품', '뷰티/화장품', '예술적 표현'],
    gridRule: '피보나치 나선형 배치',
    cameraAngle: '다양함',
    examplePrompt: 'Golden ratio spiral composition, elegant product placement, artistic lighting',
  },
  {
    id: 'negative-space',
    name: 'Negative Space',
    nameKo: '여백 활용',
    description: '의도적인 여백으로 제품 강조',
    useCases: ['미니멀 브랜드', '텍스트 오버레이용', '광고 배너'],
    gridRule: '70% 여백, 30% 피사체',
    cameraAngle: '정면',
    examplePrompt: 'Minimalist composition, abundant white space, isolated product, clean aesthetic',
  },
  {
    id: 'flat-lay',
    name: 'Flat Lay',
    nameKo: '플랫레이',
    description: '위에서 내려다보는 앵글로 여러 제품 배치',
    useCases: ['뷰티 세트', '음식', '라이프스타일', '문구'],
    gridRule: '규칙적 또는 자연스러운 산재',
    cameraAngle: '버드아이 (90도 위)',
    examplePrompt: 'Overhead flat lay, organized arrangement, complementary props, soft shadows',
  },
  {
    id: 'hero-shot',
    name: 'Hero Shot',
    nameKo: '히어로 샷',
    description: '제품을 영웅처럼 드라마틱하게 연출',
    useCases: ['주력 제품', 'Hero 섹션', '광고 메인'],
    gridRule: '화면 40-60% 차지',
    cameraAngle: '약간 아래에서 위로 (로우앵글)',
    examplePrompt: 'Dramatic hero shot, low angle, professional lighting, premium feel',
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle Shot',
    nameKo: '라이프스타일 샷',
    description: '실제 사용 환경에서의 제품 모습',
    useCases: ['사용 시연', '감성 어필', '타겟 공감'],
    gridRule: '삼등분 또는 자연스러운 배치',
    cameraAngle: '눈높이',
    examplePrompt: 'Lifestyle context, real-world setting, natural lighting, relatable scene',
  },
];

// ===== 배경 스타일 =====
export interface BackgroundStyle {
  id: string;
  name: string;
  css: string;
  bestFor: string[];
  mood: string;
}

export const BACKGROUND_STYLES: BackgroundStyle[] = [
  {
    id: 'pure-white',
    name: '순백색',
    css: 'background: #FFFFFF',
    bestFor: ['이커머스', '제품 상세', '깔끔한 인상'],
    mood: '깨끗함, 신뢰',
  },
  {
    id: 'off-white',
    name: '아이보리/오프화이트',
    css: 'background: #FAFAF8',
    bestFor: ['뷰티', '라이프스타일', '내추럴 제품'],
    mood: '따뜻함, 자연스러움',
  },
  {
    id: 'light-gray',
    name: '라이트 그레이',
    css: 'background: #F5F5F5',
    bestFor: ['테크', '프리미엄', '모던'],
    mood: '세련됨, 전문적',
  },
  {
    id: 'gradient-subtle',
    name: '미묘한 그라디언트',
    css: 'background: linear-gradient(180deg, #FFFFFF 0%, #F0F0F0 100%)',
    bestFor: ['다이나믹', '앱/서비스', '모던'],
    mood: '입체감, 깊이',
  },
  {
    id: 'warm-beige',
    name: '웜 베이지',
    css: 'background: #F5F0E8',
    bestFor: ['식품', '내추럴', '핸드메이드'],
    mood: '자연, 따뜻함',
  },
  {
    id: 'dark-luxury',
    name: '다크 럭셔리',
    css: 'background: #1A1A1A',
    bestFor: ['프리미엄', '주류', '럭셔리'],
    mood: '고급, 드라마틱',
  },
  {
    id: 'pastel-soft',
    name: '파스텔 소프트',
    css: 'background: #FFF0F5',
    bestFor: ['뷰티', '베이비', '여성타겟'],
    mood: '부드러움, 여성스러움',
  },
  {
    id: 'nature-texture',
    name: '자연 텍스처',
    css: 'background: url(natural-texture.jpg)',
    bestFor: ['유기농', '에코', '핸드메이드'],
    mood: '친환경, 자연',
  },
];

// ===== 조명 스타일 =====
export interface LightingStyle {
  id: string;
  name: string;
  description: string;
  setup: string;
  mood: string;
  promptKeywords: string[];
}

export const LIGHTING_STYLES: LightingStyle[] = [
  {
    id: 'soft-natural',
    name: '소프트 내추럴',
    description: '창가의 부드러운 자연광',
    setup: '측면 창문, 디퓨저 사용',
    mood: '자연스럽고 따뜻한',
    promptKeywords: ['soft natural light', 'window light', 'diffused'],
  },
  {
    id: 'studio-clean',
    name: '스튜디오 클린',
    description: '깔끔한 스튜디오 조명',
    setup: '소프트박스 2-3개, 균일한 조명',
    mood: '전문적, 깔끔한',
    promptKeywords: ['studio lighting', 'professional', 'even lighting'],
  },
  {
    id: 'dramatic',
    name: '드라마틱',
    description: '강한 명암 대비',
    setup: '단일 강한 광원, 어두운 배경',
    mood: '임팩트, 고급',
    promptKeywords: ['dramatic lighting', 'high contrast', 'chiaroscuro'],
  },
  {
    id: 'rim-light',
    name: '림 라이트',
    description: '가장자리를 강조하는 백라이트',
    setup: '후면 조명으로 윤곽 강조',
    mood: '입체감, 분리감',
    promptKeywords: ['rim lighting', 'backlit', 'edge highlight'],
  },
  {
    id: 'golden-hour',
    name: '골든아워',
    description: '황금빛 따뜻한 조명',
    setup: '낮은 각도의 따뜻한 조명',
    mood: '감성적, 따뜻한',
    promptKeywords: ['golden hour', 'warm light', 'sunset tones'],
  },
  {
    id: 'high-key',
    name: '하이키',
    description: '밝고 그림자 없는 조명',
    setup: '전방위 소프트 조명',
    mood: '밝음, 친근함',
    promptKeywords: ['high key lighting', 'bright', 'minimal shadows'],
  },
];

// ===== 제품별 촬영 가이드 =====
export interface ProductPhotoGuide {
  category: string;
  composition: string[];
  angles: string[];
  props: string[];
  background: string[];
  lighting: string[];
  tips: string[];
}

export const PRODUCT_PHOTO_GUIDES: Record<string, ProductPhotoGuide> = {
  cosmetics: {
    category: '화장품/뷰티',
    composition: ['center-composition', 'flat-lay', 'hero-shot'],
    angles: ['45도 각도', '정면', '플랫레이'],
    props: ['꽃잎', '물방울', '텍스처 샘플', '거울'],
    background: ['pure-white', 'off-white', 'pastel-soft'],
    lighting: ['soft-natural', 'studio-clean', 'rim-light'],
    tips: [
      '제품 질감이 보이도록 조명 조절',
      '반사광 관리 (광택 제품)',
      '스와치 이미지 필수',
      '사용 전후 비교 효과적',
    ],
  },
  food: {
    category: '식품/음료',
    composition: ['flat-lay', 'rule-of-thirds', 'diagonal'],
    angles: ['45도', '탑뷰', '눈높이'],
    props: ['재료', '식기', '냅킨', '컷러리'],
    background: ['warm-beige', 'nature-texture', 'off-white'],
    lighting: ['soft-natural', 'golden-hour', 'high-key'],
    tips: [
      '신선함이 느껴지는 조명',
      '김이 피어오르는 연출 (온음식)',
      '재료 배치로 원산지/품질 강조',
      '먹음직스러운 각도 선택',
    ],
  },
  fashion: {
    category: '의류/패션',
    composition: ['lifestyle', 'hero-shot', 'center-composition'],
    angles: ['정면', '측면', '디테일 클로즈업'],
    props: ['행거', '마네킹', '모델', '스타일링 소품'],
    background: ['pure-white', 'light-gray', 'studio clean'],
    lighting: ['studio-clean', 'soft-natural', 'high-key'],
    tips: [
      '원단 질감이 보이도록',
      '피팅감 확인 가능한 각도',
      '색상 정확도 중요',
      '디테일 샷 필수 (단추, 스티치)',
    ],
  },
  electronics: {
    category: '전자기기/테크',
    composition: ['hero-shot', 'center-composition', 'diagonal'],
    angles: ['45도', '정면', '사용 장면'],
    props: ['깔끔한 데스크', '미니멀 환경'],
    background: ['light-gray', 'dark-luxury', 'gradient-subtle'],
    lighting: ['studio-clean', 'rim-light', 'dramatic'],
    tips: [
      '화면 켜진 상태 촬영',
      '제품 크기감 표현',
      '포트/버튼 디테일',
      '그림자로 입체감',
    ],
  },
  furniture: {
    category: '가구/인테리어',
    composition: ['lifestyle', 'rule-of-thirds', 'negative-space'],
    angles: ['눈높이', '와이드앵글', '코너 뷰'],
    props: ['인테리어 소품', '그린 식물', '조명'],
    background: ['lifestyle-room', 'off-white'],
    lighting: ['soft-natural', 'golden-hour', 'studio-clean'],
    tips: [
      '공간감 표현 중요',
      '실제 배치 이미지 효과적',
      '크기 참고용 비교 대상',
      '다양한 인테리어 스타일에 배치',
    ],
  },
  jewelry: {
    category: '주얼리/액세서리',
    composition: ['center-composition', 'hero-shot', 'flat-lay'],
    angles: ['45도', '매크로 클로즈업', '착용 샷'],
    props: ['보석함', '벨벳', '거울', '모델 손/목'],
    background: ['dark-luxury', 'off-white', 'pastel-soft'],
    lighting: ['rim-light', 'dramatic', 'studio-clean'],
    tips: [
      '반짝임/광택 표현',
      '실제 크기 참고 이미지',
      '디테일 매크로 필수',
      '착용 시 분위기 연출',
    ],
  },
};

// ===== 이미지 프롬프트 빌더 =====
export interface ImagePromptConfig {
  product: string;
  category: string;
  composition?: string;
  lighting?: string;
  background?: string;
  mood?: string;
  additionalElements?: string[];
}

export function buildImagePrompt(config: ImagePromptConfig): string {
  const guide = PRODUCT_PHOTO_GUIDES[config.category];
  const composition = COMPOSITION_RULES.find(c => c.id === config.composition) || COMPOSITION_RULES[0];
  const lighting = LIGHTING_STYLES.find(l => l.id === config.lighting) || LIGHTING_STYLES[0];
  
  const parts: string[] = [
    `Professional product photography of ${config.product}`,
    composition.examplePrompt,
    lighting.promptKeywords.join(', '),
  ];

  if (config.background) {
    const bg = BACKGROUND_STYLES.find(b => b.id === config.background);
    if (bg) parts.push(bg.mood + ' background');
  }

  if (config.mood) {
    parts.push(config.mood + ' aesthetic');
  }

  if (guide) {
    parts.push(...guide.tips.slice(0, 2).map(t => t.split(' ')[0].toLowerCase()));
  }

  if (config.additionalElements) {
    parts.push(...config.additionalElements);
  }

  parts.push('8k quality, commercial photography, clean composition');

  return parts.join(', ');
}

// ===== 헬퍼 함수 =====
export function getCompositionByCategory(category: string): CompositionGuide[] {
  const guide = PRODUCT_PHOTO_GUIDES[category];
  if (!guide) return COMPOSITION_RULES.slice(0, 3);
  
  return guide.composition
    .map(id => COMPOSITION_RULES.find(c => c.id === id))
    .filter((c): c is CompositionGuide => c !== undefined);
}

export function getLightingByCategory(category: string): LightingStyle[] {
  const guide = PRODUCT_PHOTO_GUIDES[category];
  if (!guide) return LIGHTING_STYLES.slice(0, 2);
  
  return guide.lighting
    .map(id => LIGHTING_STYLES.find(l => l.id === id))
    .filter((l): l is LightingStyle => l !== undefined);
}

export function getBackgroundByCategory(category: string): BackgroundStyle[] {
  const guide = PRODUCT_PHOTO_GUIDES[category];
  if (!guide) return BACKGROUND_STYLES.slice(0, 2);
  
  return guide.background
    .map(id => BACKGROUND_STYLES.find(b => b.id === id))
    .filter((b): b is BackgroundStyle => b !== undefined);
}
