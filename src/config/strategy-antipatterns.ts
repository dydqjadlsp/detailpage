/**
 * Strategy Anti-Patterns - 상세페이지 제작 시 피해야 할 5가지 오해
 * 출처: "매출을 부르는 상세페이지" Chapter 1
 * AI 프롬프트에 금지 규칙으로 주입하여 흔한 실수를 방지한다.
 */

// ===== 안티패턴 인터페이스 =====
export interface AntiPattern {
  id: string;
  mistake: string;
  reality: string;
  aiRule: string;
  applicableSections: string[];
}

// ===== 5가지 안티패턴 =====
export const DETAIL_PAGE_ANTIPATTERNS: AntiPattern[] = [
  {
    id: 'pretty-not-enough',
    mistake: '예쁘기만 하면 팔린다',
    reality: '핵심 정보(USP, 혜택, 스펙, 인증)가 중심이어야 전환된다. 예쁜 것과 잘 팔리는 것은 다르다.',
    aiRule: '장식 요소보다 정보 밀도를 우선하라. 모든 섹션에 구체적 수치/혜택/USP가 반드시 포함되어야 한다. 이미지만 있고 설명이 없는 섹션 금지. 감성적인 배경+문구만 있는 구성 금지. 반드시 "한 잔에 카페인 30mg / 무설탕 / 10팩 구성" 같은 정보 중심 카피를 포함하라.',
    applicableSections: ['Hero', 'Features', 'Benefits', 'Gallery', 'DetailedProduct'],
  },
  {
    id: 'too-many-images',
    mistake: '이미지를 많이 넣을수록 좋다',
    reality: '소비자는 스크롤 피로감을 느낀다. 이미지의 목적은 시각적 이해를 돕고 핵심을 강조하는 것이다.',
    aiRule: '이미지는 반드시 목적이 있어야 한다. 허용 목적: 사용 장면 촬영, 크기/비율 비교, 디테일 클로즈업, Before/After, 인증서/수상 이미지. 같은 각도 반복 컷 금지. 장식용 이미지 남발 금지.',
    applicableSections: ['Gallery', 'DetailedProduct', 'Features', 'Benefits'],
  },
  {
    id: 'too-short-text',
    mistake: '텍스트는 안 읽으니 줄여야 한다',
    reality: '쓸데없는 글은 안 읽지만, 내 문제를 해결해주는 정보는 정독한다. 텍스트는 줄이는 것이 아니라 핵심을 정확히 전달하는 문장으로 다듬는 것이 중요하다.',
    aiRule: '핵심 셀링포인트와 스펙 설명은 줄이지 마라. 모든 문장은 정보를 담아야 한다. "최고의 만족, 프리미엄 품질" 같은 수식어만 있는 빈 문장 금지. "전 성분 EWG 그린 등급 / 피부과 테스트 완료 / 3세 이상 사용 가능" 같은 구체적 정보 문장만 허용.',
    applicableSections: ['Features', 'DetailedProduct', 'Benefits', 'FAQ', 'Hero'],
  },
  {
    id: 'copy-benchmarking',
    mistake: '다른 쇼핑몰처럼 만들면 된다',
    reality: '모두 똑같은 구성/문구/디자인이면 고객은 가장 싼 제품을 고른다. 내 제품만의 배경 스토리, 특별한 원재료, 철학, 제조 과정을 담아야 가격과 무관하게 신뢰를 얻는다.',
    aiRule: '일반적/범용적 카피 금지. "유산균, 장까지 도달!" 같은 누구나 쓰는 표현 대신 "3중 코팅 기술로 장까지 96% 생존율 — 특허번호 OOOO" 같은 차별화된 정보를 넣어라. 입력 데이터의 고유한 강점을 USP로 표현하라.',
    applicableSections: ['Hero', 'Benefits', 'Features', 'CTA'],
  },
  {
    id: 'design-only',
    mistake: '디자이너에게 맡기면 알아서 잘 만들어줄 것이다',
    reality: '디자인보다 먼저 고민해야 할 것은 무엇을 어떻게 설득할 것인가다. 타겟 고객, 주력 포인트, 핵심 질문, 인증/후기 정보가 정리되어야 한다.',
    aiRule: '타겟 고객 명시 없이 범용 카피 작성 금지. 반드시 카테고리와 입력 데이터에 기반하여 타겟 고객을 특정하고, Problem/Benefits 섹션에 타겟의 구체적 고민을 반영하라. Testimonials에는 타겟과 동일한 페르소나의 후기를 넣어라.',
    applicableSections: ['Hero', 'Benefits', 'Testimonials', 'FAQ', 'CTA'],
  },
];

// ===== 헬퍼 함수 =====
export function getAntiPatternsForSection(sectionType: string): AntiPattern[] {
  return DETAIL_PAGE_ANTIPATTERNS.filter(ap =>
    ap.applicableSections.includes(sectionType),
  );
}

export function getTopAntiPatternRules(count: number = 3): string[] {
  return DETAIL_PAGE_ANTIPATTERNS
    .slice(0, count)
    .map(ap => ap.aiRule);
}
