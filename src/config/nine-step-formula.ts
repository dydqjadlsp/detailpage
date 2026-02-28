/**
 * Nine-Step Formula - 9단계 상세페이지 공식
 * 전환율을 극대화하는 검증된 상세페이지 구조
 */

import type { SectionType } from './section-templates';

// ===== 9단계 공식 정의 =====
export interface FormulaStep {
  step: number;
  name: string;
  nameEn: string;
  purpose: string;
  psychologyPrinciple: string;
  requiredSections: SectionType[];
  optionalSections: SectionType[];
  heightRatio: number; // 전체 페이지 대비 비율 (%)
  copywritingFocus: string;
  visualFocus: string;
}

export const NINE_STEP_FORMULA: FormulaStep[] = [
  {
    step: 1,
    name: '후킹',
    nameEn: 'Hook',
    purpose: '3초 안에 시선을 사로잡고 스크롤 유도',
    psychologyPrinciple: '첫인상 효과 (Primacy Effect)',
    requiredSections: ['Hero'],
    optionalSections: [],
    heightRatio: 12,
    copywritingFocus: '강렬한 헤드라인, 공감 질문, 충격적 사실',
    visualFocus: '고퀄리티 히어로 이미지, 다이나믹 레이아웃',
  },
  {
    step: 2,
    name: '신뢰 확보',
    nameEn: 'Trust Building',
    purpose: '초기 불신을 해소하고 권위 확보',
    psychologyPrinciple: '권위의 법칙 (Authority Principle)',
    requiredSections: ['TrustBadges'],
    optionalSections: ['Stats'],
    heightRatio: 5,
    copywritingFocus: '수상, 인증, 미디어 노출 강조',
    visualFocus: '로고 그리드, 배지, 숫자 카운터',
  },
  {
    step: 3,
    name: '문제 공감',
    nameEn: 'Problem Agitation',
    purpose: '타겟 고객의 고민/문제에 공감 표현',
    psychologyPrinciple: '손실 회피 (Loss Aversion)',
    requiredSections: ['Benefits'],
    optionalSections: ['About'],
    heightRatio: 10,
    copywritingFocus: '"이런 고민 있으시죠?", Before 상태 묘사',
    visualFocus: '문제 상황 일러스트, 부정적 감정 컬러',
  },
  {
    step: 4,
    name: '해결책 제시',
    nameEn: 'Solution Introduction',
    purpose: '제품/서비스가 해결책임을 명확히 전달',
    psychologyPrinciple: '대조 효과 (Contrast Effect)',
    requiredSections: ['Features'],
    optionalSections: ['DetailedProduct'],
    heightRatio: 15,
    copywritingFocus: 'USP 강조, "바로 이것이 답입니다"',
    visualFocus: '제품 클로즈업, 기능 아이콘, After 상태',
  },
  {
    step: 5,
    name: '상세 설명',
    nameEn: 'Detailed Explanation',
    purpose: '핵심 기능/특징을 구체적으로 설명',
    psychologyPrinciple: '정보 갭 이론 (Information Gap Theory)',
    requiredSections: ['DetailedProduct'],
    optionalSections: ['Process', 'Gallery'],
    heightRatio: 18,
    copywritingFocus: '스펙, 소재, 제작 과정, 차별점',
    visualFocus: '상세 이미지, 확대 컷, 구성품 나열',
  },
  {
    step: 6,
    name: '사용 방법',
    nameEn: 'How It Works',
    purpose: '사용/이용 과정을 단계별로 안내',
    psychologyPrinciple: '인지 용이성 (Cognitive Ease)',
    requiredSections: ['Process'],
    optionalSections: ['VideoShowcase'],
    heightRatio: 10,
    copywritingFocus: '3단계로 끝, 누구나 쉽게',
    visualFocus: '스텝 번호, 화살표, 프로세스 다이어그램',
  },
  {
    step: 7,
    name: '사회적 증거',
    nameEn: 'Social Proof',
    purpose: '실제 사용자 후기로 확신 강화',
    psychologyPrinciple: '밴드왜건 효과 (Bandwagon Effect)',
    requiredSections: ['Testimonials'],
    optionalSections: ['Stats', 'Gallery'],
    heightRatio: 12,
    copywritingFocus: '구체적 수치, 실명, 직업, 사용 기간',
    visualFocus: '고객 사진, 별점, 인용부호',
  },
  {
    step: 8,
    name: '불안 해소',
    nameEn: 'Objection Handling',
    purpose: '구매 전 걱정/의문 사전 해소',
    psychologyPrinciple: '불확실성 감소 (Uncertainty Reduction)',
    requiredSections: ['FAQ'],
    optionalSections: ['Comparison', 'Contact'],
    heightRatio: 8,
    copywritingFocus: '환불 정책, 배송, AS, 보증',
    visualFocus: '아코디언 UI, 보증 아이콘',
  },
  {
    step: 9,
    name: '행동 유도',
    nameEn: 'Call to Action',
    purpose: '최종 구매/신청 결정 유도',
    psychologyPrinciple: '희소성 원칙 (Scarcity Principle)',
    requiredSections: ['CTA'],
    optionalSections: ['Urgency', 'Pricing'],
    heightRatio: 10,
    copywritingFocus: '지금 바로, 오늘만, 한정 수량',
    visualFocus: '강조 버튼, 카운트다운, 재고 표시',
  },
];

// ===== 픽셀 높이별 섹션 배분 =====
export interface PixelPreset {
  totalHeight: number;
  label: string;
  tier: 'compact' | 'standard' | 'detailed' | 'premium' | 'enterprise';
  sectionCount: number;
  includedSteps: number[]; // 포함할 9단계 중 어떤 것들
  description: string;
}

export const PIXEL_PRESETS: Record<string, PixelPreset> = {
  '4000': {
    totalHeight: 4000,
    label: '4,000px (간편형)',
    tier: 'compact',
    sectionCount: 8,
    includedSteps: [1, 2, 3, 4, 5, 7, 8, 9],
    description: '핵심만 담은 간편 상세페이지',
  },
  '8000': {
    totalHeight: 8000,
    label: '8,000px (표준형)',
    tier: 'standard',
    sectionCount: 11,
    includedSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    description: '균형 잡힌 표준 상세페이지',
  },
  '12000': {
    totalHeight: 12000,
    label: '12,000px (상세형)',
    tier: 'detailed',
    sectionCount: 14,
    includedSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    description: '모든 단계를 포함한 완전한 상세페이지',
  },
  '20000': {
    totalHeight: 20000,
    label: '20,000px (프리미엄)',
    tier: 'premium',
    sectionCount: 21,
    includedSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    description: '각 단계 심화 + 추가 섹션',
  },
  '40000': {
    totalHeight: 40000,
    label: '40,000px (엔터프라이즈)',
    tier: 'enterprise',
    sectionCount: 33,
    includedSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    description: '모든 옵션 포함 + 반복 섹션',
  },
};

// ===== 헬퍼 함수 =====

/**
 * 픽셀 높이와 카테고리에 맞는 섹션 순서 생성
 */
export function generateSectionOrder(
  pixelHeight: string
): SectionType[] {
  const preset = PIXEL_PRESETS[pixelHeight] || PIXEL_PRESETS['8000'];
  const sections: SectionType[] = [];

  // 포함할 단계들의 필수 섹션 추가
  for (const stepNum of preset.includedSteps) {
    const step = NINE_STEP_FORMULA.find(s => s.step === stepNum);
    if (step) {
      sections.push(...step.requiredSections);
    }
  }

  // standard 이상: 1차 옵션 섹션 추가 (중복 제거)
  if (preset.tier !== 'compact') {
    for (const stepNum of preset.includedSteps) {
      const step = NINE_STEP_FORMULA.find(s => s.step === stepNum);
      if (step && step.optionalSections.length > 0) {
        const opt = step.optionalSections[0];
        if (!sections.includes(opt)) {
          sections.push(opt);
        }
      }
    }
  }

  // detailed 이상: 2차 옵션 섹션도 추가
  if (preset.tier === 'detailed' || preset.tier === 'premium' || preset.tier === 'enterprise') {
    for (const stepNum of preset.includedSteps) {
      const step = NINE_STEP_FORMULA.find(s => s.step === stepNum);
      if (step && step.optionalSections.length > 1) {
        const opt = step.optionalSections[1];
        if (!sections.includes(opt)) {
          sections.push(opt);
        }
      }
    }
  }

  // premium 이상: Gallery, Comparison, Timeline 추가
  if (preset.tier === 'premium' || preset.tier === 'enterprise') {
    const extras: SectionType[] = ['Gallery', 'Comparison', 'Timeline'];
    for (const ex of extras) {
      if (!sections.includes(ex)) sections.push(ex);
    }
  }

  // enterprise: 반복 강조 섹션 추가 (총 33개 목표)
  if (preset.tier === 'enterprise') {
    const repeatables: SectionType[] = [
      'Benefits', 'Features', 'Gallery', 'Testimonials',
      'Stats', 'DetailedProduct', 'Process', 'About',
    ];
    let ri = 0;
    while (sections.length < preset.sectionCount && ri < repeatables.length) {
      sections.push(repeatables[ri]);
      ri++;
    }
  }

  // 목표 섹션 수에 도달하지 못했으면 추가 섹션으로 채우기
  const fillers: SectionType[] = [
    'Stats', 'Gallery', 'About', 'Comparison', 'Timeline',
    'Benefits', 'Features', 'Testimonials', 'DetailedProduct',
  ];
  let fi = 0;
  while (sections.length < preset.sectionCount && fi < fillers.length) {
    if (!sections.includes(fillers[fi]) || preset.tier === 'premium' || preset.tier === 'enterprise') {
      sections.push(fillers[fi]);
    }
    fi++;
  }

  return sections;
}

/**
 * 각 섹션의 권장 높이 계산
 */
export function calculateSectionHeights(
  pixelHeight: string,
  sections: SectionType[]
): Record<string, number> {
  const preset = PIXEL_PRESETS[pixelHeight] || PIXEL_PRESETS['8000'];
  const heights: Record<string, number> = {};

  // 각 섹션에 대한 단계 찾기
  for (const section of sections) {
    let ratio = 10; // 기본 10%

    for (const step of NINE_STEP_FORMULA) {
      if (step.requiredSections.includes(section)) {
        ratio = step.heightRatio;
        break;
      }
      if (step.optionalSections.includes(section)) {
        ratio = step.heightRatio * 0.7; // 옵션 섹션은 70%
        break;
      }
    }

    heights[section] = Math.round((preset.totalHeight * ratio) / 100);
  }

  return heights;
}

/**
 * 단계별 카피라이팅 가이드 반환
 */
export function getCopywritingGuide(sectionType: SectionType): string {
  for (const step of NINE_STEP_FORMULA) {
    if (step.requiredSections.includes(sectionType) || 
        step.optionalSections.includes(sectionType)) {
      return step.copywritingFocus;
    }
  }
  return '명확하고 설득력 있는 카피';
}

/**
 * 단계별 비주얼 가이드 반환
 */
export function getVisualGuide(sectionType: SectionType): string {
  for (const step of NINE_STEP_FORMULA) {
    if (step.requiredSections.includes(sectionType) || 
        step.optionalSections.includes(sectionType)) {
      return step.visualFocus;
    }
  }
  return '깔끔하고 전문적인 비주얼';
}

/**
 * 심리학 원칙 반환
 */
export function getPsychologyPrinciple(sectionType: SectionType): string {
  for (const step of NINE_STEP_FORMULA) {
    if (step.requiredSections.includes(sectionType) || 
        step.optionalSections.includes(sectionType)) {
      return step.psychologyPrinciple;
    }
  }
  return '';
}
