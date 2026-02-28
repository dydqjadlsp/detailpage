/**
 * Persuasion Psychology - 심리학 기반 설득 요소
 * 전환율을 높이는 검증된 심리학 기법
 */

// ===== 심리학 원칙 정의 =====
export interface PsychologyPrinciple {
  id: string;
  name: string;
  nameKr: string;
  description: string;
  implementation: string[];
  copyExamples: string[];
  visualElements: string[];
  placement: string[]; // 어떤 섹션에 배치할지
  categoryPhrases?: Record<string, string[]>; // 카테고리별 추천 문구
}

export const PSYCHOLOGY_PRINCIPLES: PsychologyPrinciple[] = [
  {
    id: 'social-proof',
    name: 'Social Proof',
    nameKr: '사회적 증거 (밴드웨건 효과)',
    description: '많은 사람이 선택했다는 것을 보여주어 안심감 제공',
    implementation: [
      '총 구매/이용 고객 수 표시',
      '실시간 구매 알림',
      '"지금 OO명이 보고 있어요" 표시',
      '별점과 리뷰 수 강조',
      '베스트셀러/인기 상품 배지',
    ],
    copyExamples: [
      '10,000명이 선택한',
      '98%가 재구매하는',
      '누적 판매 50만개 돌파',
      '별점 4.9 | 리뷰 2,340개',
      '오늘 127명이 구매했어요',
    ],
    visualElements: [
      '숫자 카운터 (애니메이션)',
      '별점 아이콘',
      '실시간 알림 팝업',
      '고객 아바타 그룹',
      '인기 배지',
    ],
    placement: ['Hero', 'TrustBadges', 'Testimonials', 'CTA'],
  },

  {
    id: 'authority',
    name: 'Authority Principle',
    nameKr: '권위의 법칙',
    description: '전문가, 기관, 미디어의 인정으로 신뢰 확보',
    implementation: [
      '전문가 추천 문구',
      '공인 인증 마크',
      '수상 경력 표시',
      '미디어 노출 로고',
      '전문가 프로필 (학력, 경력)',
    ],
    copyExamples: [
      '피부과 전문의가 추천하는',
      'ISO 9001 인증',
      '2025 올해의 브랜드 수상',
      'MBC, KBS, SBS 방영',
      '10년 경력 전문가가 만든',
    ],
    visualElements: [
      '인증 마크 이미지',
      '미디어 로고 그리드',
      '전문가 사진 + 직함',
      '수상 트로피 아이콘',
      '자격증/학위 이미지',
    ],
    placement: ['Hero', 'TrustBadges', 'Team', 'About'],
  },

  {
    id: 'scarcity',
    name: 'Scarcity Principle',
    nameKr: '희소성 원칙',
    description: '제한된 수량/시간으로 긴급한 행동 유도',
    implementation: [
      '한정 수량 표시',
      '마감 카운트다운',
      '남은 재고 표시',
      '기간 한정 할인',
      '선착순 혜택',
    ],
    copyExamples: [
      '오늘만 50% 할인',
      '선착순 100명 한정',
      '마감까지 2시간 남음',
      '재고 3개 남았습니다',
      '이번 달 마지막 기회',
    ],
    visualElements: [
      '카운트다운 타이머',
      '재고 진행 바',
      '긴급 배지 (빨간색)',
      '깜빡이는 효과',
      '마감 아이콘',
    ],
    placement: ['Hero', 'Urgency', 'CTA', 'Pricing'],
  },

  {
    id: 'loss-aversion',
    name: 'Loss Aversion',
    nameKr: '손실 회피 편향',
    description: '얻는 것보다 잃는 것에 더 민감한 심리 활용',
    implementation: [
      '문제 상황 묘사 (Before)',
      '놓치면 손해인 이유 강조',
      '포인트/쿠폰 소멸 알림',
      '가격 인상 예고',
      '회원 전용 혜택 강조',
    ],
    copyExamples: [
      '이 기회를 놓치면',
      '지금 신청 안 하면 다시 없습니다',
      '포인트 오늘 자정 소멸',
      '내일부터 정가 판매',
      '회원만 받을 수 있는 특별 혜택',
    ],
    visualElements: [
      'Before/After 비교',
      '취소선 가격',
      '소멸 경고 아이콘',
      '빨간색 강조',
      '시계 아이콘',
    ],
    placement: ['Benefits', 'Urgency', 'CTA'],
  },

  {
    id: 'anchoring',
    name: 'Anchoring Effect',
    nameKr: '앵커링 효과',
    description: '처음 제시된 정보가 기준점이 되는 심리',
    implementation: [
      '정가 먼저 표시 → 할인가',
      '가장 비싼 옵션 먼저',
      '큰 숫자 (절감액) 강조',
      '경쟁사 가격 비교',
      '1일 환산 가격',
    ],
    copyExamples: [
      '정가 120,000원 → 59,000원',
      '하루 1,000원으로 누리는',
      '경쟁사 대비 50% 저렴',
      '총 200만원 상당의 혜택',
      '지금 가입하면 61,000원 절약',
    ],
    visualElements: [
      '취소선 정가',
      '큰 할인가 폰트',
      '절감액 강조 배지',
      '비교 테이블',
      '그래프 (가격 비교)',
    ],
    placement: ['Hero', 'Pricing', 'Benefits', 'CTA'],
  },

  {
    id: 'reciprocity',
    name: 'Reciprocity Principle',
    nameKr: '상호성 원칙',
    description: '무료 제공 후 보답 심리 활용',
    implementation: [
      '무료 샘플/체험',
      '무료 가이드/전자책',
      '무료 상담/진단',
      '무료 배송',
      '추가 증정품',
    ],
    copyExamples: [
      '무료 샘플 신청하기',
      '지금 신청하면 가이드북 무료 증정',
      '첫 상담 무료',
      '5만원 이상 무료 배송',
      '구매 시 2종 추가 증정',
    ],
    visualElements: [
      '무료 배지',
      '선물 아이콘',
      '체크리스트 (포함 항목)',
      '패키지 이미지',
      '보너스 스티커',
    ],
    placement: ['Hero', 'Benefits', 'CTA', 'Pricing'],
  },

  {
    id: 'commitment',
    name: 'Commitment & Consistency',
    nameKr: '일관성 원칙',
    description: '작은 약속이 큰 행동으로 이어지는 심리',
    implementation: [
      '무료 가입 → 유료 전환',
      '간단한 테스트/퀴즈',
      '관심 상품 찜하기',
      '뉴스레터 구독',
      '작은 첫 구매 유도',
    ],
    copyExamples: [
      '3초 회원가입',
      '나에게 맞는 상품 찾기 테스트',
      '관심 상품에 담기',
      '무료로 시작하기',
      '첫 구매 1,000원',
    ],
    visualElements: [
      '간단한 입력 폼',
      '진행 바 (1/3 단계)',
      '하트/찜 아이콘',
      '체크박스',
      '퀴즈 UI',
    ],
    placement: ['Hero', 'CTA', 'Process'],
  },

  {
    id: 'liking',
    name: 'Liking Principle',
    nameKr: '호감의 법칙',
    description: '호감 가는 사람/브랜드에게 설득당하기 쉬움',
    implementation: [
      '친근한 톤 사용',
      '브랜드 스토리 공유',
      '비하인드 씬 공개',
      '고객과의 공통점 강조',
      '휴먼 터치 (대표 인사말)',
    ],
    copyExamples: [
      '안녕하세요, OO입니다',
      '저희도 같은 고민을 했었어요',
      '이런 마음으로 만들었습니다',
      '여러분과 함께 성장하는',
      '진심을 담아 준비했습니다',
    ],
    visualElements: [
      '대표/팀 사진',
      '제작 과정 사진',
      '손글씨 폰트',
      '따뜻한 색감',
      '미소 짓는 얼굴',
    ],
    placement: ['About', 'Team', 'Hero', 'CTA'],
  },

  {
    id: 'fear-appeal',
    name: 'Fear Appeal',
    nameKr: '공포 소구',
    description: '두려움을 자극하여 해결책(제품) 제시',
    implementation: [
      '문제 상황의 심각성 강조',
      '방치 시 결과 경고',
      '통계로 위험성 제시',
      '즉시 해결책 제시',
    ],
    copyExamples: [
      '이대로 두면 더 악화됩니다',
      '10명 중 8명이 겪는 문제',
      '지금 조치하지 않으면',
      '전문가들이 경고하는',
      '늦기 전에 시작하세요',
    ],
    visualElements: [
      '경고 아이콘',
      '어두운 색상 (Before)',
      '밝은 색상 (After)',
      '통계 그래프',
      '체크리스트',
    ],
    placement: ['Benefits', 'Hero', 'Stats'],
  },

  {
    id: 'peak-end',
    name: 'Peak-End Rule',
    nameKr: '피크엔드 법칙',
    description: '경험의 정점과 마지막 순간이 전체 인상 결정',
    implementation: [
      '가장 강력한 혜택을 하이라이트',
      'CTA 직전 최고의 가치 제안',
      '구매 완료 후 감사 메시지',
      '마지막 섹션에 임팩트',
    ],
    copyExamples: [
      '지금까지 본 것 중 가장 좋은 조건입니다',
      '마지막으로 확인하세요',
      '결정만 남았습니다',
      '감사합니다, 최선을 다하겠습니다',
    ],
    visualElements: [
      '대형 CTA 버튼',
      '최종 혜택 요약 박스',
      '축하 이펙트',
      '감사 메시지',
    ],
    placement: ['CTA', 'Urgency'],
  },
];

// ===== 긴급성 요소 =====
export interface UrgencyElement {
  type: 'countdown' | 'stock' | 'viewers' | 'deadline' | 'limited';
  template: string;
  visualStyle: string;
  intensity: 'low' | 'medium' | 'high';
}

export const URGENCY_ELEMENTS: UrgencyElement[] = [
  {
    type: 'countdown',
    template: '마감까지 {hours}시간 {minutes}분 남음',
    visualStyle: '카운트다운 타이머 (빨간색)',
    intensity: 'high',
  },
  {
    type: 'stock',
    template: '재고 {count}개 남음',
    visualStyle: '재고 바 (점점 줄어드는)',
    intensity: 'high',
  },
  {
    type: 'viewers',
    template: '지금 {count}명이 보고 있어요',
    visualStyle: '실시간 숫자 업데이트',
    intensity: 'medium',
  },
  {
    type: 'deadline',
    template: '오늘 {time}까지만',
    visualStyle: '시계 아이콘 + 시간',
    intensity: 'medium',
  },
  {
    type: 'limited',
    template: '선착순 {count}명 한정',
    visualStyle: '한정 배지',
    intensity: 'high',
  },
];

// ===== 신뢰 배지 =====
export interface TrustBadge {
  type: string;
  label: string;
  icon: string;
  importance: number; // 1-5
}

export const TRUST_BADGES: TrustBadge[] = [
  { type: 'certification', label: 'ISO 인증', icon: 'shield-check', importance: 5 },
  { type: 'certification', label: 'KC 인증', icon: 'badge-check', importance: 5 },
  { type: 'certification', label: 'FDA 승인', icon: 'shield-check', importance: 5 },
  { type: 'award', label: '올해의 브랜드', icon: 'trophy', importance: 4 },
  { type: 'award', label: '소비자 대상', icon: 'award', importance: 4 },
  { type: 'media', label: 'TV 방영', icon: 'tv', importance: 3 },
  { type: 'media', label: '매거진 소개', icon: 'book-open', importance: 3 },
  { type: 'guarantee', label: '100% 환불 보장', icon: 'refresh-cw', importance: 5 },
  { type: 'guarantee', label: '무료 교환', icon: 'repeat', importance: 4 },
  { type: 'shipping', label: '무료 배송', icon: 'truck', importance: 3 },
  { type: 'shipping', label: '당일 출고', icon: 'zap', importance: 3 },
  { type: 'support', label: '24시간 고객 지원', icon: 'headphones', importance: 4 },
  { type: 'security', label: '안전 결제', icon: 'lock', importance: 5 },
  { type: 'quality', label: '품질 보증', icon: 'check-circle', importance: 4 },
];

// ===== 헬퍼 함수 =====
export function getPrinciplesBySection(sectionType: string): PsychologyPrinciple[] {
  return PSYCHOLOGY_PRINCIPLES.filter(p => p.placement.includes(sectionType));
}

export function getRandomCopyExample(principleId: string): string {
  const principle = PSYCHOLOGY_PRINCIPLES.find(p => p.id === principleId);
  if (!principle) return '';
  const examples = principle.copyExamples;
  return examples[Math.floor(Math.random() * examples.length)];
}

export function getUrgencyElement(intensity: 'low' | 'medium' | 'high'): UrgencyElement {
  const elements = URGENCY_ELEMENTS.filter(e => e.intensity === intensity);
  return elements[Math.floor(Math.random() * elements.length)] || URGENCY_ELEMENTS[0];
}

export function getTopTrustBadges(count: number = 4): TrustBadge[] {
  return [...TRUST_BADGES]
    .sort((a, b) => b.importance - a.importance)
    .slice(0, count);
}
