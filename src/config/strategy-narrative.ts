/**
 * Strategy Narrative - 기억에 남는 상세페이지의 7가지 핵심 구성 요소
 * 출처: "매출을 부르는 상세페이지" Chapter 2
 * AI가 상세페이지를 생성할 때 스토리텔링과 설득 흐름을 자연스럽게 구성하도록 가이드한다.
 */

// ===== 내러티브 요소 인터페이스 =====
export interface NarrativeElement {
  id: string;
  name: string;
  description: string;
  implementation: string[];
  examplePhrases: string[];
  appliesTo: string[];
}

// ===== 7가지 내러티브 요소 =====
export const NARRATIVE_ELEMENTS: NarrativeElement[] = [
  {
    id: 'empathy-story',
    name: '공감을 끌어내는 이야기 구조',
    description: '무미건조한 정보 나열보다, 하나의 흐름과 스토리를 가진 문장은 감정을 건드리고 집중을 유도한다. 문제 상황 제시 → 공감 또는 사례 삽입 → 제품 등장 및 해결 포인트 → 사용 후 변화의 흐름을 따른다.',
    implementation: [
      'Benefits 섹션에서 고객의 문제 상황을 구체적으로 묘사하는 것으로 시작하라',
      'Features 섹션에서 제품이 해결책으로 자연스럽게 등장하게 하라',
      'Testimonials에서 실제 사용 후 변화를 구체적 사례로 보여줘라',
      '각 섹션이 독립적 정보가 아니라, 하나의 스토리 흐름으로 이어지게 구성하라',
    ],
    examplePhrases: [
      '아침마다 바쁘게 나서면서도 피부가 푸석한 게 신경 쓰이셨죠? 저도 그랬어요. 그래서 이 제품을 찾게 됐습니다.',
      '이런 고민, 혹시 당신도 하고 계신가요?',
      '수많은 시행착오 끝에 찾은 답',
      '처음엔 반신반의했지만, 결과는 놀라웠습니다',
      '저도 1년 전까지는 똑같았어요',
    ],
    appliesTo: ['Benefits', 'Features', 'Testimonials', 'Hero', 'About'],
  },
  {
    id: 'emotional-trigger',
    name: '감정을 자극하는 문장 사용',
    description: '사람은 논리보다 감정에 따라 행동한다. 상세페이지는 설명이 아니라 설득의 도구이며, 설득에는 감정이 필요하다. 감정 언어를 사용하면 고객은 마치 제품을 이미 사용해 본 것 같은 "상상 체험"을 하게 되고, 구매욕구가 증폭된다.',
    implementation: [
      'Hero 서브타이틀에 감정적 상상 유도 문장을 배치하라',
      '기능 설명 옆에 감정적 혜택을 1줄 추가하라',
      'CTA 직전에 미래의 자신을 상상하게 하는 문장을 넣어라',
      '"식물 유래 계면활성제 함유" 같은 기능 설명만 하지 말고, "우리 아이 입에 들어가도 걱정 없는 순한 포뮬러" 같은 감정 문장을 병행하라',
    ],
    examplePhrases: [
      '하루 종일 땡기는 피부, 이젠 안녕.',
      '아침마다 거울 보는 게 즐거워지는 순간',
      '우리 아이 입에 들어가도 걱정 없는 순한 포뮬러',
      '돌아갈 수 없는 편안함을 경험하세요',
      '내일의 당신은 오늘에 감사할 것입니다',
    ],
    appliesTo: ['Hero', 'Benefits', 'CTA', 'Features'],
  },
  {
    id: 'problem-pinpoint',
    name: '고객의 문제를 정확히 짚기',
    description: '사람은 자신의 문제를 정확히 지적당할 때 "이건 내 얘기야"라는 생각이 들면서 귀를 기울이게 된다. 고객의 불편, 고민, 불만을 먼저 건드려야 한다.',
    implementation: [
      'Benefits/Problem 섹션 도입부에 질문형 헤드라인을 사용하라',
      '3-4개의 구체적인 문제 상황을 나열하라',
      '즉시 해결책(제품)으로 전환하는 브릿지 문장을 넣어라',
      '"그래서 준비했습니다" 같은 전환 문장으로 자연스럽게 이어라',
    ],
    examplePhrases: [
      '이런 고민 있으시죠?',
      '샴푸를 바꿔도 두피 간지러움이 계속된다면?',
      '무선 청소기, 자꾸 빨아들이는 힘이 약해져서 스트레스셨죠?',
      '매일 반복되는 불편함, 참을 필요 없습니다',
      '그래서 저희가 준비했습니다',
    ],
    appliesTo: ['Benefits', 'Hero', 'Features'],
  },
  {
    id: 'before-after',
    name: '전후 비교를 통해 체감 효과 전달',
    description: 'Before & After는 소비자 입장에서 가장 직관적인 설득 장치다. 말보다 보여주는 것이 강하다. 가능하다면 실제 사용자 후기나 영상, 비교 사진을 활용하는 것이 효과적이다.',
    implementation: [
      'Benefits 또는 Comparison 섹션에 시각적 전후 비교를 배치하라',
      '이미지와 텍스트 모두에서 변화를 극적으로 표현하라',
      '수치적 변화(%, 시간, 금액)를 반드시 포함하라',
      '실제 고객의 변화 사례를 보여주는 것이 가장 설득력 있다',
    ],
    examplePhrases: [
      'Before: 손등이 건조하고 하얗게 들뜬 상태 → After: 촉촉하고 광택 있는 손등, "단 7일 사용 후 변화"',
      '사용 전: 매일 30분 낭비 → 사용 후: 단 3분이면 끝',
      '사용 전 vs 사용 후, 차이가 보이시나요?',
      '3개월 전의 나와 지금의 나, 달라진 건 딱 하나입니다',
    ],
    appliesTo: ['Benefits', 'Comparison', 'Features', 'Testimonials', 'Stats'],
  },
  {
    id: 'readability-design',
    name: '가독성을 고려한 구성 설계',
    description: '내용이 아무리 좋아도, 복잡하고 눈에 잘 안 들어오면 소비자는 스크롤을 멈춘다. 핵심 문장은 굵게 강조, 불렛 포인트로 정보 요약, 컬러 포인트 최소화(2-3컬러), 한 문장 단위로 적절히 줄바꿈.',
    implementation: [
      '긴 문단 대신 불렛 포인트/체크리스트 형태로 정보를 제공하라',
      '핵심 키워드는 bold + primary 색상으로 강조하라',
      '컬러는 primary, secondary, accent 3가지만 사용하라',
      '"이 제품은 수분막이 형성되고 촉촉한 느낌을 오랫동안 유지시켜줍니다" 대신 "3중 수분막 형성으로 하루 종일 촉촉함 유지"처럼 짧고 강하게',
    ],
    examplePhrases: [
      '3중 수분막 형성으로 하루 종일 촉촉함 유지',
      '30% 시간 절약 | 50% 비용 절감 | 100% 만족 보장',
    ],
    appliesTo: ['Features', 'Benefits', 'DetailedProduct', 'FAQ', 'Process'],
  },
  {
    id: 'repetition',
    name: '반복을 통한 메시지 각인',
    description: '광고학 이론에서 "사람은 같은 메시지를 최소 3번 이상 봐야 인식한다"고 한다. 핵심 메시지는 여러 번 반복해서 고객의 기억에 남도록 설계해야 한다. 단, 같은 문장 반복이 아니라 형태만 바꿔 자연스럽게 각인시킨다.',
    implementation: [
      'USP/핵심 메시지를 Hero(헤드라인), Benefits(부제목), CTA(마무리) 3곳에 배치하라',
      'Hero에서는 질문형, Benefits에서는 선언형, CTA에서는 감성형으로 변형하라',
      '반복하되 지루하지 않게 표현 방식을 매번 변경하라',
    ],
    examplePhrases: [
      '상단: "저자극 테스트 완료" → 중단: "EWG 올그린 성분만 사용" → 하단: "민감한 피부도 매일 안심 사용"',
      'Hero: "단 3분, 당신의 아침이 바뀝니다" → Benefits: "3분 투자로 달라지는 일상" → CTA: "지금 3분의 변화를 시작하세요"',
    ],
    appliesTo: ['Hero', 'Benefits', 'CTA'],
  },
  {
    id: 'scroll-flow',
    name: '스크롤 흐름을 설계하라',
    description: '상세페이지는 단순한 정보 나열이 아닌, 스크롤의 흐름을 고려한 구조 설계가 필요하다. 공감인트로 → 제품등장+첫번째강점 → 후기로신뢰확보 → 추가정보(성분,사용법,인증) → 경쟁제품비교 → 가격/구성강조 → CTA 유도문구. 이 흐름을 따라가는 고객은 자연스럽게 구매 페이지로 이동하게 된다.',
    implementation: [
      '이미 9단계 공식에 반영됨 — 각 단계 전환 시 자연스러운 브릿지 문장을 배치하라',
      '각 섹션 끝에 다음 섹션을 암시하는 전환 문장 1줄을 넣어라',
      '섹션 간 흐름이 끊기지 않도록, 이전 섹션의 결론이 다음 섹션의 서론과 연결되게 하라',
    ],
    examplePhrases: [
      '그렇다면 어떻게 해결할 수 있을까요?',
      '실제로 사용해본 분들의 이야기를 들어보세요',
      '마지막으로, 가격에 대해 이야기해볼게요',
      '지금까지 확인하셨다면, 이제 결정만 남았습니다',
    ],
    appliesTo: ['Benefits', 'Features', 'Testimonials', 'Pricing', 'CTA'],
  },
];

// ===== 헬퍼 함수 =====
export function getNarrativeElementsForSection(sectionType: string): NarrativeElement[] {
  return NARRATIVE_ELEMENTS.filter(ne => ne.appliesTo.includes(sectionType));
}

export function getNarrativeImplementation(sectionType: string): string[] {
  const elements = getNarrativeElementsForSection(sectionType);
  return elements.flatMap(e => e.implementation);
}
