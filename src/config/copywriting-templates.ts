/**
 * Copywriting Templates - 카피라이팅 공식 및 톤
 * 전환율을 높이는 검증된 카피라이팅 구조
 */

// ===== 3단계 카피라이팅 구조 =====
export interface CopyStructure {
  phase: 'opening' | 'body' | 'closing';
  name: string;
  purpose: string;
  techniques: string[];
  examples: string[];
}

export const COPY_STRUCTURE: CopyStructure[] = [
  {
    phase: 'opening',
    name: '오프닝 (Hook)',
    purpose: '3초 안에 주목을 끌어 스크롤 유도',
    techniques: [
      '충격적 질문',
      '공감 질문',
      '놀라운 사실/통계',
      '대담한 약속',
      '스토리 시작',
    ],
    examples: [
      '아직도 이렇게 하고 계세요?',
      '10명 중 9명이 모르는 비밀',
      '단 3일 만에 완전히 달라졌습니다',
      '드디어 찾았습니다, 정답을',
      '저도 1년 전까지는 똑같았어요',
    ],
  },
  {
    phase: 'body',
    name: '본문 (Build)',
    purpose: '논리와 감정으로 가치 전달',
    techniques: [
      '문제 확대 (Pain)',
      '해결책 제시 (Solution)',
      '증거 제시 (Proof)',
      '혜택 나열 (Benefits)',
      '차별점 강조 (Differentiation)',
    ],
    examples: [
      '이 문제를 방치하면 더 심각해집니다',
      '바로 이것이 해결책입니다',
      '실제로 10,000명이 효과를 봤습니다',
      '시간 절약, 비용 절감, 품질 향상',
      '다른 제품과 비교해보세요',
    ],
  },
  {
    phase: 'closing',
    name: '클로징 (Action)',
    purpose: '즉시 행동을 유도하는 마무리',
    techniques: [
      '긴급성 (Urgency)',
      '위험 제거 (Risk Reversal)',
      '명확한 CTA',
      '마지막 혜택',
      '미래 그리기',
    ],
    examples: [
      '오늘이 마지막 기회입니다',
      '100% 환불 보장, 위험은 저희가',
      '지금 바로 시작하세요',
      '지금 신청하면 추가 증정',
      '내일의 당신은 오늘에 감사할 것입니다',
    ],
  },
];

// ===== 카피라이팅 공식 =====
export interface CopyFormula {
  name: string;
  acronym: string;
  steps: string[];
  example: string;
  bestFor: string[];
}

export const COPY_FORMULAS: CopyFormula[] = [
  {
    name: 'AIDA',
    acronym: 'Attention → Interest → Desire → Action',
    steps: [
      'Attention: 강렬한 헤드라인으로 주목',
      'Interest: 관련성 있는 정보로 흥미 유발',
      'Desire: 혜택 강조로 욕구 자극',
      'Action: 명확한 행동 유도',
    ],
    example: '피부 고민 끝! (주목) | 피부과 전문의가 개발한 (흥미) | 2주 만에 환한 피부 (욕구) | 지금 무료 샘플 받기 (행동)',
    bestFor: ['ecommerce', 'fitness', 'education'],
  },
  {
    name: 'PAS',
    acronym: 'Problem → Agitate → Solution',
    steps: [
      'Problem: 타겟의 문제 명시',
      'Agitate: 문제의 심각성 확대',
      'Solution: 제품/서비스로 해결',
    ],
    example: '매일 아침 피곤하신가요? (문제) | 이대로 두면 건강에 심각한 영향을... (확대) | 하루 1알로 활력 되찾으세요 (해결)',
    bestFor: ['medical', 'fitness', 'saas'],
  },
  {
    name: 'BAB',
    acronym: 'Before → After → Bridge',
    steps: [
      'Before: 현재 상태 (문제)',
      'After: 이상적인 상태 (해결 후)',
      'Bridge: 도달 방법 (제품)',
    ],
    example: '매출이 정체되어 있나요? (Before) | 월 매출 2배 성장을 상상해보세요 (After) | 저희 솔루션이 그 다리가 되어드립니다 (Bridge)',
    bestFor: ['saas', 'education', 'legal'],
  },
  {
    name: 'FAB',
    acronym: 'Feature → Advantage → Benefit',
    steps: [
      'Feature: 제품의 특징',
      'Advantage: 특징으로 인한 장점',
      'Benefit: 고객이 얻는 실질 혜택',
    ],
    example: '천연 실크 100% 소재 (특징) | 통기성이 뛰어나고 피부 자극 없음 (장점) | 하루 종일 쾌적하고 편안한 착용감 (혜택)',
    bestFor: ['ecommerce', 'restaurant', 'travel'],
  },
  {
    name: '4Ps',
    acronym: 'Promise → Picture → Proof → Push',
    steps: [
      'Promise: 핵심 약속',
      'Picture: 결과 상상',
      'Proof: 증거 제시',
      'Push: 행동 유도',
    ],
    example: '30일 안에 영어 실력 향상 보장 (약속) | 외국인과 자신있게 대화하는 나를 상상해보세요 (상상) | 수강생 95%가 효과를 입증 (증거) | 지금 등록하고 변화를 시작하세요 (행동)',
    bestFor: ['education', 'fitness', 'personal'],
  },
];

// ===== 카테고리별 톤앤매너 =====
export interface CategoryTone {
  category: string;
  voiceCharacteristics: string[];
  doList: string[];
  dontList: string[];
  powerWords: string[];
  sampleHeadlines: string[];
}

export const CATEGORY_TONES: Record<string, CategoryTone> = {
  ecommerce: {
    category: '이커머스',
    voiceCharacteristics: [
      '친근하고 대화하듯',
      '열정적이고 에너지 있는',
      '신뢰감 있는',
      '구체적인 혜택 강조',
    ],
    doList: [
      '구체적인 숫자 사용 (30% 할인, 2일 배송)',
      '감정적 언어 활용 (설레는, 만족스러운)',
      '긴급성 요소 포함',
      '후기/리뷰 인용',
    ],
    dontList: [
      '모호한 표현 (좋은 품질)',
      '부정적 경쟁사 비교',
      '과장된 약속',
    ],
    powerWords: [
      '한정', '무료', '특가', '베스트셀러', '품절임박', '추천', '인기', '신상',
    ],
    sampleHeadlines: [
      '이 가격, 오늘이 마지막입니다',
      '10만 고객이 선택한 이유',
      '품절 전에 장바구니 담으세요',
    ],
  },

  realestate: {
    category: '부동산',
    voiceCharacteristics: [
      '고급스럽고 세련된',
      '전문적이고 신뢰감 있는',
      '투자 가치 중심',
      '라이프스타일 강조',
    ],
    doList: [
      '투자 수익률/가치 상승 언급',
      '희소성 강조 (한정 세대, 프리미엄)',
      '생활 편의 시설 구체적 나열',
      '전문 용어 적절히 활용',
    ],
    dontList: [
      '저렴함 강조 (가치 하락 인상)',
      '과도한 감정 호소',
      '검증 안 된 수익률 제시',
    ],
    powerWords: [
      '프리미엄', '한정', '최고층', '조망권', '투자', '랜드마크', '희소', '역세권',
    ],
    sampleHeadlines: [
      '강남의 마지막 노른자 땅',
      '입주 전 분양권 프리미엄 형성 중',
      '이 가격에 이 입지, 다시 없습니다',
    ],
  },

  medical: {
    category: '병원/의료',
    voiceCharacteristics: [
      '전문적이고 권위 있는',
      '따뜻하고 케어하는',
      '안전하고 신뢰감 있는',
      '과학적 근거 기반',
    ],
    doList: [
      '전문의 자격/경력 강조',
      '안전성/검증 언급',
      '시술 전후 사진 (동의 하에)',
      '환자 후기 (실명)',
    ],
    dontList: [
      '과장된 효과 약속',
      '경쟁 병원 비하',
      '의료 광고 규정 위반',
    ],
    powerWords: [
      '전문', '안전', '검증', '최신', '첨단', '1:1', '맞춤', '케어',
    ],
    sampleHeadlines: [
      '15년 경력 전문의가 직접 시술합니다',
      '안전이 최우선, 결과는 자연스럽게',
      '10,000건 시술 무사고의 비결',
    ],
  },

  education: {
    category: '학원/교육',
    voiceCharacteristics: [
      '동기부여하는',
      '자신감 넘치는',
      '성공 지향적',
      '친근하고 지지하는',
    ],
    doList: [
      '합격률/성적 향상 수치',
      '수강생 성공 스토리',
      '차별화된 커리큘럼 강조',
      '한정 모집 긴급성',
    ],
    dontList: [
      '100% 보장 (현실적 약속)',
      '경쟁 학원 비하',
      '과도한 압박감 조성',
    ],
    powerWords: [
      '합격', '만점', '성공', '변화', '1등', '마감임박', '소수정예', '검증',
    ],
    sampleHeadlines: [
      '6개월 만에 토익 900 달성한 비결',
      '올해 합격자 127명 배출',
      '당신도 할 수 있습니다, 우리가 도와드릴게요',
    ],
  },

  restaurant: {
    category: '음식점/카페',
    voiceCharacteristics: [
      '감각적이고 맛있는',
      '따뜻하고 환영하는',
      '스토리텔링',
      '감성적인',
    ],
    doList: [
      '음식 묘사 감각적으로 (바삭, 촉촉, 진한)',
      '재료/원산지 강조',
      '셰프/주인장 스토리',
      '분위기 전달',
    ],
    dontList: [
      '가격만 강조',
      '음식 사진 저퀄리티',
      '과도한 할인 이미지',
    ],
    powerWords: [
      '신선', '정성', '엄선', '수제', '시그니처', '특제', '비밀', '프리미엄',
    ],
    sampleHeadlines: [
      '매일 새벽, 노량진에서 직송되는 신선함',
      '3대째 이어온 비밀 레시피',
      '한 입에 행복이 느껴지는 순간',
    ],
  },

  travel: {
    category: '여행/숙박',
    voiceCharacteristics: [
      '설레고 몽환적인',
      '모험적이고 자유로운',
      '휴식과 힐링',
      '특별한 경험 강조',
    ],
    doList: [
      '감성적 이미지 활용',
      '구체적 일정/포함 사항',
      '특별 체험 강조',
      '실제 여행 후기',
    ],
    dontList: [
      '지루한 일정 나열',
      '저퀄리티 사진',
      '숨겨진 추가 비용',
    ],
    powerWords: [
      '힐링', '특별', '프라이빗', '올인클루시브', '버킷리스트', '인생샷', '비밀', '숨겨진',
    ],
    sampleHeadlines: [
      '일상에서 벗어나, 나를 찾는 여행',
      '인생 사진 보장되는 그 곳',
      '아무것도 하지 않아도 되는 3일',
    ],
  },

  wedding: {
    category: '웨딩/이벤트',
    voiceCharacteristics: [
      '로맨틱하고 감동적인',
      '우아하고 세련된',
      '특별하고 유일한',
      '따뜻하고 축복하는',
    ],
    doList: [
      '감동 스토리 활용',
      '세부 사항 꼼꼼히',
      '실제 행사 사진/영상',
      '맞춤 서비스 강조',
    ],
    dontList: [
      '저렴함 강조',
      '과도한 화려함',
      '일반적인 표현',
    ],
    powerWords: [
      '평생', '유일', '특별', '감동', '로맨틱', '프라이빗', '맞춤', '축복',
    ],
    sampleHeadlines: [
      '두 사람만의 특별한 하루',
      '평생 기억될 그 순간',
      '당신의 사랑 이야기를 완성합니다',
    ],
  },

  legal: {
    category: '법률/세무',
    voiceCharacteristics: [
      '전문적이고 권위 있는',
      '신뢰감 있고 안정적인',
      '명확하고 직접적인',
      '문제 해결 중심',
    ],
    doList: [
      '전문 분야 명확히',
      '성공 사례 언급',
      '자격/경력 강조',
      '무료 상담 제안',
    ],
    dontList: [
      '100% 승소 보장',
      '감정적 언어',
      '경쟁사 비하',
    ],
    powerWords: [
      '전문', '경험', '신뢰', '해결', '보호', '성공', '검증', '1:1',
    ],
    sampleHeadlines: [
      '20년 경험, 1,000건 성공 사례',
      '복잡한 문제, 명쾌한 해결',
      '첫 상담 무료, 부담 없이 문의하세요',
    ],
  },

  fitness: {
    category: '피트니스/요가',
    voiceCharacteristics: [
      '에너지 넘치는',
      '동기부여하는',
      '도전적이고 긍정적',
      '변화 지향적',
    ],
    doList: [
      'Before/After 사진',
      '구체적 성과 수치',
      '트레이너 자격 강조',
      '체험 수업 제안',
    ],
    dontList: [
      '비현실적 변화 약속',
      '부정적 바디 이미지',
      '과도한 압박',
    ],
    powerWords: [
      '변화', '도전', '한계', '성장', '에너지', '1:1', '맞춤', '결과',
    ],
    sampleHeadlines: [
      '3개월 후, 거울이 달라집니다',
      '오늘의 나를 넘어서세요',
      '포기하지 않으면 반드시 변합니다',
    ],
  },

  saas: {
    category: '스타트업/SaaS',
    voiceCharacteristics: [
      '혁신적이고 스마트한',
      '문제 해결 중심',
      '효율성 강조',
      '데이터 기반',
    ],
    doList: [
      '구체적 효과 수치 (50% 시간 절약)',
      '무료 체험/데모 제안',
      '고객사 로고 나열',
      '기능 비교표',
    ],
    dontList: [
      '기술 용어 과다 사용',
      '모호한 혜택',
      '경쟁사 비방',
    ],
    powerWords: [
      '자동화', '효율', '스마트', '간편', '통합', '실시간', '무료', 'AI',
    ],
    sampleHeadlines: [
      '업무 시간 50%를 돌려드립니다',
      '10분 만에 시작하세요',
      '1,000개 기업이 선택한 이유',
    ],
  },

  personal: {
    category: '개인 브랜딩',
    voiceCharacteristics: [
      '진정성 있는',
      '전문적이면서 친근한',
      '스토리텔링',
      '개성 있는',
    ],
    doList: [
      '개인 스토리 공유',
      '포트폴리오 하이라이트',
      '추천사/후기',
      'SNS 연동',
    ],
    dontList: [
      '과장된 자기 PR',
      '복사한 듯한 표현',
      '모호한 전문성',
    ],
    powerWords: [
      '경험', '전문', '함께', '진심', '성장', '가치', '변화', '파트너',
    ],
    sampleHeadlines: [
      '10년간 100개 프로젝트, 그 경험을 나눕니다',
      '디자인으로 비즈니스 가치를 높이다',
      '당신의 브랜드가 궁금합니다',
    ],
  },
};

// ===== 헬퍼 함수 =====
export function getCopyFormula(name: string): CopyFormula | undefined {
  return COPY_FORMULAS.find(f => f.name === name);
}

export function getCategoryTone(category: string): CategoryTone {
  return CATEGORY_TONES[category] || CATEGORY_TONES.ecommerce;
}

export function getRecommendedFormulas(category: string): CopyFormula[] {
  return COPY_FORMULAS.filter(f => f.bestFor.includes(category));
}

export function getRandomPowerWord(category: string): string {
  const tone = getCategoryTone(category);
  return tone.powerWords[Math.floor(Math.random() * tone.powerWords.length)];
}

export function getRandomHeadline(category: string): string {
  const tone = getCategoryTone(category);
  return tone.sampleHeadlines[Math.floor(Math.random() * tone.sampleHeadlines.length)];
}
