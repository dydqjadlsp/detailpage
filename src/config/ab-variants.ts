/**
 * A/B Variants - A/B 테스트 변형 규칙
 * 전환율 최적화를 위한 자동 변형 생성
 */

// ===== 변형 타입 정의 =====
export interface VariantRule {
  id: string;
  name: string;
  description: string;
  targetElement: string;
  variations: VariantOption[];
  expectedImpact: string;
  testPriority: 'high' | 'medium' | 'low';
}

export interface VariantOption {
  id: string;
  name: string;
  value: string | Record<string, unknown>;
  hypothesis: string;
}

// ===== 레이아웃 변형 =====
export const LAYOUT_VARIANTS: VariantRule[] = [
  {
    id: 'hero-layout',
    name: 'Hero 레이아웃',
    description: 'Hero 섹션의 이미지와 텍스트 배치',
    targetElement: 'Hero.layout',
    variations: [
      {
        id: 'center',
        name: '중앙 정렬',
        value: 'center',
        hypothesis: '집중도 높음, 모바일 최적화',
      },
      {
        id: 'left-image',
        name: '좌측 이미지',
        value: 'left-image',
        hypothesis: '제품 강조, 시선 흐름 자연스러움',
      },
      {
        id: 'right-image',
        name: '우측 이미지',
        value: 'right-image',
        hypothesis: '텍스트 먼저 읽힘, 메시지 전달 우선',
      },
      {
        id: 'full-width',
        name: '풀 와이드',
        value: 'full-width',
        hypothesis: '임팩트 극대화, 감성적 접근',
      },
    ],
    expectedImpact: '스크롤 유도율 10-20% 변화',
    testPriority: 'high',
  },
  {
    id: 'features-grid',
    name: 'Features 그리드',
    description: '특징 섹션의 열 개수',
    targetElement: 'Features.gridColumns',
    variations: [
      {
        id: '2-col',
        name: '2열',
        value: { columns: 2 },
        hypothesis: '더 큰 카드, 상세 정보 강조',
      },
      {
        id: '3-col',
        name: '3열',
        value: { columns: 3 },
        hypothesis: '균형 잡힌 레이아웃',
      },
      {
        id: '4-col',
        name: '4열',
        value: { columns: 4 },
        hypothesis: '많은 정보, 빠른 스캔',
      },
    ],
    expectedImpact: '체류 시간 5-15% 변화',
    testPriority: 'medium',
  },
  {
    id: 'testimonials-style',
    name: '후기 표시 방식',
    description: '후기 섹션의 레이아웃',
    targetElement: 'Testimonials.layout',
    variations: [
      {
        id: 'carousel',
        name: '캐러셀',
        value: 'carousel',
        hypothesis: '공간 효율, 인터랙션 유도',
      },
      {
        id: 'grid',
        name: '그리드',
        value: 'grid',
        hypothesis: '한눈에 여러 후기, 신뢰도 상승',
      },
      {
        id: 'stacked',
        name: '스택형',
        value: 'stacked',
        hypothesis: '스토리 흐름, 깊이 있는 읽기',
      },
    ],
    expectedImpact: '신뢰도 인식 10-20% 변화',
    testPriority: 'medium',
  },
];

// ===== CTA 변형 =====
export const CTA_VARIANTS: VariantRule[] = [
  {
    id: 'cta-text',
    name: 'CTA 버튼 텍스트',
    description: '행동 유도 버튼의 문구',
    targetElement: 'CTA.ctaText',
    variations: [
      {
        id: 'action-focused',
        name: '행동 중심',
        value: '지금 시작하기',
        hypothesis: '명확한 행동 유도',
      },
      {
        id: 'benefit-focused',
        name: '혜택 중심',
        value: '무료로 체험하기',
        hypothesis: '위험 부담 감소',
      },
      {
        id: 'urgency-focused',
        name: '긴급성 중심',
        value: '오늘만 특가 신청',
        hypothesis: '즉시 행동 유도',
      },
      {
        id: 'curiosity-focused',
        name: '호기심 중심',
        value: '비밀 혜택 확인하기',
        hypothesis: '클릭 유도',
      },
    ],
    expectedImpact: '클릭률 20-40% 변화',
    testPriority: 'high',
  },
  {
    id: 'cta-color',
    name: 'CTA 버튼 색상',
    description: '행동 유도 버튼의 배경색',
    targetElement: 'CTA.buttonColor',
    variations: [
      {
        id: 'primary',
        name: '브랜드 컬러',
        value: 'primary',
        hypothesis: '브랜드 일관성',
      },
      {
        id: 'contrast',
        name: '대비 컬러',
        value: 'contrast',
        hypothesis: '시선 집중',
      },
      {
        id: 'green',
        name: '그린 (진행/성공)',
        value: '#10B981',
        hypothesis: '긍정적 행동 연상',
      },
      {
        id: 'orange',
        name: '오렌지 (긴급)',
        value: '#F97316',
        hypothesis: '에너지, 긴급성',
      },
    ],
    expectedImpact: '클릭률 10-30% 변화',
    testPriority: 'high',
  },
  {
    id: 'cta-size',
    name: 'CTA 버튼 크기',
    description: '버튼의 높이와 패딩',
    targetElement: 'CTA.buttonSize',
    variations: [
      {
        id: 'standard',
        name: '표준 (48px)',
        value: { height: 48, paddingX: 24 },
        hypothesis: '일반적인 기대',
      },
      {
        id: 'large',
        name: '대형 (56px)',
        value: { height: 56, paddingX: 32 },
        hypothesis: '터치 편의성, 강조',
      },
      {
        id: 'extra-large',
        name: '초대형 (64px)',
        value: { height: 64, paddingX: 40 },
        hypothesis: '최대 강조',
      },
    ],
    expectedImpact: '모바일 클릭률 5-15% 변화',
    testPriority: 'medium',
  },
  {
    id: 'cta-position',
    name: 'CTA 버튼 위치',
    description: '버튼의 정렬 위치',
    targetElement: 'CTA.buttonPosition',
    variations: [
      {
        id: 'center',
        name: '중앙',
        value: 'center',
        hypothesis: '집중도 높음',
      },
      {
        id: 'left',
        name: '좌측',
        value: 'left',
        hypothesis: '시선 흐름 자연스러움',
      },
      {
        id: 'full-width',
        name: '전체 너비',
        value: 'full',
        hypothesis: '모바일 터치 최적화',
      },
    ],
    expectedImpact: '클릭률 5-10% 변화',
    testPriority: 'low',
  },
];

// ===== 콘텐츠 변형 =====
export const CONTENT_VARIANTS: VariantRule[] = [
  {
    id: 'headline-style',
    name: '헤드라인 스타일',
    description: 'Hero 제목의 접근 방식',
    targetElement: 'Hero.title',
    variations: [
      {
        id: 'benefit',
        name: '혜택 강조',
        value: '{benefit}로 {result}를 경험하세요',
        hypothesis: '가치 제안 명확',
      },
      {
        id: 'question',
        name: '질문형',
        value: '아직도 {problem}으로 고민하세요?',
        hypothesis: '공감 유발, 관여도 증가',
      },
      {
        id: 'number',
        name: '숫자 강조',
        value: '{number}명이 선택한 {product}',
        hypothesis: '사회적 증거',
      },
      {
        id: 'how-to',
        name: '방법 제시',
        value: '{time}만에 {result}하는 방법',
        hypothesis: '솔루션 제공 인식',
      },
    ],
    expectedImpact: '스크롤 유도율 15-30% 변화',
    testPriority: 'high',
  },
  {
    id: 'image-order',
    name: '이미지 순서',
    description: '갤러리/제품 이미지의 배치 순서',
    targetElement: 'Gallery.imageOrder',
    variations: [
      {
        id: 'hero-first',
        name: '대표 이미지 먼저',
        value: 'hero-first',
        hypothesis: '첫인상 중요',
      },
      {
        id: 'detail-first',
        name: '디테일 먼저',
        value: 'detail-first',
        hypothesis: '품질 인식 강화',
      },
      {
        id: 'lifestyle-first',
        name: '라이프스타일 먼저',
        value: 'lifestyle-first',
        hypothesis: '감성적 연결',
      },
      {
        id: 'benefit-first',
        name: '효과/결과 먼저',
        value: 'benefit-first',
        hypothesis: '가치 즉시 전달',
      },
    ],
    expectedImpact: '상세 페이지 체류시간 10-20% 변화',
    testPriority: 'medium',
  },
  {
    id: 'text-length',
    name: '텍스트 길이',
    description: '섹션별 설명 텍스트의 길이',
    targetElement: 'section.description',
    variations: [
      {
        id: 'concise',
        name: '간결형 (50자 이하)',
        value: { maxLength: 50 },
        hypothesis: '빠른 스캔, 모바일 최적화',
      },
      {
        id: 'standard',
        name: '표준형 (100자)',
        value: { maxLength: 100 },
        hypothesis: '적절한 정보량',
      },
      {
        id: 'detailed',
        name: '상세형 (200자+)',
        value: { maxLength: 200 },
        hypothesis: '설득력 강화, SEO 유리',
      },
    ],
    expectedImpact: '체류 시간 및 이탈률 변화',
    testPriority: 'medium',
  },
  {
    id: 'social-proof-type',
    name: '사회적 증거 유형',
    description: '신뢰 요소의 종류',
    targetElement: 'TrustBadges.type',
    variations: [
      {
        id: 'numbers',
        name: '숫자 강조',
        value: 'numbers',
        hypothesis: '10,000+ 고객 = 안전한 선택',
      },
      {
        id: 'logos',
        name: '로고/인증',
        value: 'logos',
        hypothesis: '권위 있는 기관 인정',
      },
      {
        id: 'testimonials',
        name: '후기 인용',
        value: 'testimonials',
        hypothesis: '실제 경험 = 공감',
      },
      {
        id: 'mixed',
        name: '복합형',
        value: 'mixed',
        hypothesis: '다양한 증거 = 강한 신뢰',
      },
    ],
    expectedImpact: '전환율 10-25% 변화',
    testPriority: 'high',
  },
];

// ===== 긴급성 변형 =====
export const URGENCY_VARIANTS: VariantRule[] = [
  {
    id: 'urgency-type',
    name: '긴급성 유형',
    description: '긴급성을 표현하는 방식',
    targetElement: 'Urgency.type',
    variations: [
      {
        id: 'countdown',
        name: '카운트다운',
        value: 'countdown',
        hypothesis: '시간 압박 = 즉시 행동',
      },
      {
        id: 'stock',
        name: '재고 표시',
        value: 'stock',
        hypothesis: '희소성 = 가치 인식',
      },
      {
        id: 'viewers',
        name: '현재 조회 수',
        value: 'viewers',
        hypothesis: '경쟁 심리 유발',
      },
      {
        id: 'none',
        name: '없음',
        value: 'none',
        hypothesis: '과한 압박 없이 자연스럽게',
      },
    ],
    expectedImpact: '전환율 15-40% 변화',
    testPriority: 'high',
  },
  {
    id: 'urgency-intensity',
    name: '긴급성 강도',
    description: '긴급성 메시지의 강도',
    targetElement: 'Urgency.intensity',
    variations: [
      {
        id: 'subtle',
        name: '약한 (정보 제공)',
        value: 'subtle',
        hypothesis: '신뢰 유지, 반감 없음',
      },
      {
        id: 'moderate',
        name: '중간 (권유)',
        value: 'moderate',
        hypothesis: '적절한 동기 부여',
      },
      {
        id: 'strong',
        name: '강한 (경고)',
        value: 'strong',
        hypothesis: '즉각적 행동 유도',
      },
    ],
    expectedImpact: '전환율 및 브랜드 인식 변화',
    testPriority: 'medium',
  },
];

// ===== 색상 변형 =====
export const COLOR_VARIANTS: VariantRule[] = [
  {
    id: 'color-scheme',
    name: '전체 색상 톤',
    description: '페이지의 전체적인 색상 분위기',
    targetElement: 'theme.colorScheme',
    variations: [
      {
        id: 'warm',
        name: '따뜻한 톤',
        value: 'warm',
        hypothesis: '친근함, 감성적 연결',
      },
      {
        id: 'cool',
        name: '차가운 톤',
        value: 'cool',
        hypothesis: '전문성, 신뢰감',
      },
      {
        id: 'neutral',
        name: '중립 톤',
        value: 'neutral',
        hypothesis: '세련됨, 고급스러움',
      },
      {
        id: 'vibrant',
        name: '비비드 톤',
        value: 'vibrant',
        hypothesis: '에너지, 젊은 느낌',
      },
    ],
    expectedImpact: '브랜드 인식, 체류 시간 변화',
    testPriority: 'low',
  },
  {
    id: 'section-bg-alternation',
    name: '섹션 배경 교차',
    description: '섹션별 배경색 교차 패턴',
    targetElement: 'section.backgroundAlternation',
    variations: [
      {
        id: 'light-only',
        name: '밝은 배경만',
        value: 'light-only',
        hypothesis: '깔끔함, 통일감',
      },
      {
        id: 'alternate',
        name: '밝은/어두운 교차',
        value: 'alternate',
        hypothesis: '시각적 구분, 리듬감',
      },
      {
        id: 'gradient-blocks',
        name: '그라디언트 블록',
        value: 'gradient-blocks',
        hypothesis: '현대적, 트렌디',
      },
    ],
    expectedImpact: '스크롤 깊이 5-15% 변화',
    testPriority: 'low',
  },
];

// ===== 변형 조합 생성 =====
export interface VariantCombination {
  id: string;
  name: string;
  variants: Record<string, string>;
  description: string;
}

export function generateVariantCombinations(
  rules: VariantRule[],
  maxCombinations: number = 4
): VariantCombination[] {
  // 우선순위 높은 룰 선택
  const highPriorityRules = rules.filter(r => r.testPriority === 'high').slice(0, 2);
  
  const combinations: VariantCombination[] = [];
  
  // 각 룰의 첫 번째 변형을 기본으로
  const baseline: Record<string, string> = {};
  for (const rule of highPriorityRules) {
    baseline[rule.id] = rule.variations[0].id;
  }
  
  combinations.push({
    id: 'control',
    name: '기본 (Control)',
    variants: baseline,
    description: '현재 기본 설정',
  });

  // 각 룰의 다른 변형으로 조합 생성
  let combIndex = 1;
  for (const rule of highPriorityRules) {
    for (let i = 1; i < rule.variations.length && combIndex < maxCombinations; i++) {
      const variant = { ...baseline };
      variant[rule.id] = rule.variations[i].id;
      
      combinations.push({
        id: `variant-${combIndex}`,
        name: `변형 ${combIndex} (${rule.variations[i].name})`,
        variants: variant,
        description: rule.variations[i].hypothesis,
      });
      combIndex++;
    }
  }

  return combinations;
}

// ===== 전체 변형 규칙 =====
export const ALL_VARIANT_RULES: VariantRule[] = [
  ...LAYOUT_VARIANTS,
  ...CTA_VARIANTS,
  ...CONTENT_VARIANTS,
  ...URGENCY_VARIANTS,
  ...COLOR_VARIANTS,
];

// ===== 헬퍼 함수 =====
export function getVariantRuleById(id: string): VariantRule | undefined {
  return ALL_VARIANT_RULES.find(r => r.id === id);
}

export function getHighPriorityVariants(): VariantRule[] {
  return ALL_VARIANT_RULES.filter(r => r.testPriority === 'high');
}

export function getVariantsByCategory(category: 'layout' | 'cta' | 'content' | 'urgency' | 'color'): VariantRule[] {
  switch (category) {
    case 'layout': return LAYOUT_VARIANTS;
    case 'cta': return CTA_VARIANTS;
    case 'content': return CONTENT_VARIANTS;
    case 'urgency': return URGENCY_VARIANTS;
    case 'color': return COLOR_VARIANTS;
    default: return [];
  }
}
