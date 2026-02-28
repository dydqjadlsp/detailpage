/**
 * Design Validator - 디자인 품질 검증 시스템
 * 완성된 상세페이지의 품질을 자동으로 체크
 */

// ===== 검증 룰 정의 =====
export interface ValidationRule {
  id: string;
  category: 'structure' | 'typography' | 'spacing' | 'color' | 'content' | 'accessibility' | 'performance';
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  check: string; // 검증 방법 설명
  fix: string; // 수정 방법
}

export const VALIDATION_RULES: ValidationRule[] = [
  // ===== 구조 검증 =====
  {
    id: 'structure-hero-first',
    category: 'structure',
    name: 'Hero 섹션 최상단',
    description: '페이지 첫 섹션은 반드시 Hero 타입이어야 함',
    severity: 'error',
    check: '첫 번째 섹션 타입이 "Hero"인지 확인',
    fix: 'Hero 섹션을 최상단으로 이동',
  },
  {
    id: 'structure-cta-last',
    category: 'structure',
    name: 'CTA 섹션 최하단',
    description: '마지막 섹션은 CTA 타입이어야 함',
    severity: 'error',
    check: '마지막 섹션 타입이 "CTA"인지 확인',
    fix: 'CTA 섹션을 최하단에 추가',
  },
  {
    id: 'structure-section-count',
    category: 'structure',
    name: '섹션 수 적정성',
    description: '선택된 픽셀 높이에 맞는 섹션 수',
    severity: 'warning',
    check: 'PIXEL_PRESETS와 실제 섹션 수 비교',
    fix: '섹션 추가/제거로 조정',
  },
  {
    id: 'structure-no-duplicate-adjacent',
    category: 'structure',
    name: '연속 섹션 중복 방지',
    description: '같은 타입의 섹션이 연속으로 배치되면 안 됨',
    severity: 'warning',
    check: '연속된 섹션의 타입 비교',
    fix: '중간에 다른 섹션 삽입 또는 병합',
  },
  {
    id: 'structure-trust-early',
    category: 'structure',
    name: '신뢰 요소 조기 배치',
    description: 'TrustBadges 또는 Stats가 상위 3개 섹션 내에 있어야 함',
    severity: 'info',
    check: '상위 3개 섹션 중 신뢰 요소 존재 확인',
    fix: 'TrustBadges를 Hero 다음에 배치',
  },

  // ===== 타이포그래피 검증 =====
  {
    id: 'typo-hero-title-length',
    category: 'typography',
    name: 'Hero 타이틀 길이',
    description: 'Hero 타이틀은 40자(또는 2줄) 이내',
    severity: 'warning',
    check: 'Hero 섹션 title 문자 수 <= 40',
    fix: '핵심 메시지로 간결하게 수정',
  },
  {
    id: 'typo-subtitle-length',
    category: 'typography',
    name: '서브타이틀 길이',
    description: '서브타이틀은 80자(또는 3줄) 이내',
    severity: 'info',
    check: 'subtitle 문자 수 <= 80',
    fix: '불필요한 부분 제거',
  },
  {
    id: 'typo-section-title-consistency',
    category: 'typography',
    name: '섹션 제목 일관성',
    description: '모든 섹션 제목의 폰트 크기/웨이트 통일',
    severity: 'warning',
    check: '섹션 타이틀 스타일 비교',
    fix: 'TYPOGRAPHY.fontSize.h2로 통일',
  },
  {
    id: 'typo-cta-action-verb',
    category: 'typography',
    name: 'CTA 버튼 동사 시작',
    description: 'CTA 버튼 텍스트는 행동 동사로 시작',
    severity: 'warning',
    check: 'ctaText가 동사로 시작하는지 확인',
    fix: '"지금 시작하기", "무료로 체험하기" 등으로 수정',
  },
  {
    id: 'typo-items-count',
    category: 'typography',
    name: 'Items 배열 개수',
    description: 'Features, Benefits 등의 items는 3~6개',
    severity: 'warning',
    check: 'items.length >= 3 && items.length <= 6',
    fix: '항목 추가/제거로 조정',
  },

  // ===== 간격 검증 =====
  {
    id: 'spacing-section-padding',
    category: 'spacing',
    name: '섹션 패딩 적정성',
    description: '각 섹션의 상하 패딩이 최소 48px 이상',
    severity: 'warning',
    check: 'section padding-y >= 48px',
    fix: 'SPACING.sectionPaddingY.compact 이상 적용',
  },
  {
    id: 'spacing-element-gap',
    category: 'spacing',
    name: '요소 간격 일관성',
    description: '같은 레벨의 요소들은 동일한 간격',
    severity: 'info',
    check: '형제 요소 간 gap 통일 확인',
    fix: 'SPACING.gap 값으로 통일',
  },
  {
    id: 'spacing-8px-grid',
    category: 'spacing',
    name: '8px 그리드 준수',
    description: '모든 간격 값이 8의 배수',
    severity: 'info',
    check: 'spacing % 8 === 0',
    fix: '가장 가까운 8의 배수로 조정',
  },

  // ===== 색상 검증 =====
  {
    id: 'color-contrast-ratio',
    category: 'color',
    name: '색상 대비 비율 (WCAG)',
    description: '텍스트와 배경 색상 대비 4.5:1 이상',
    severity: 'error',
    check: '색상 대비 비율 계산',
    fix: '텍스트 색상 또는 배경색 조정',
  },
  {
    id: 'color-primary-usage',
    category: 'color',
    name: '주색상 사용',
    description: 'Primary 색상이 CTA, 강조 요소에 사용됨',
    severity: 'warning',
    check: 'CTA 버튼에 primary color 적용 확인',
    fix: 'CTA 버튼에 primary color 적용',
  },
  {
    id: 'color-section-variety',
    category: 'color',
    name: '섹션 배경 다양성',
    description: '연속 3개 섹션의 배경색이 동일하면 안 됨',
    severity: 'warning',
    check: '연속 섹션 backgroundColor 비교',
    fix: '중간 섹션 배경색 변경',
  },
  {
    id: 'color-dark-section-text',
    category: 'color',
    name: '다크 섹션 텍스트 색상',
    description: '어두운 배경에서 텍스트는 밝은 색상',
    severity: 'error',
    check: '배경 명도 낮으면 텍스트 명도 높은지 확인',
    fix: 'textColor를 inverse(흰색)로 변경',
  },

  // ===== 콘텐츠 검증 =====
  {
    id: 'content-image-prompt-detail',
    category: 'content',
    name: '이미지 프롬프트 상세도',
    description: 'imagePrompt는 50자 이상의 상세한 설명',
    severity: 'warning',
    check: 'imagePrompt.length >= 50',
    fix: '색상, 구도, 분위기, 스타일 추가',
  },
  {
    id: 'content-image-prompt-english',
    category: 'content',
    name: '이미지 프롬프트 영어',
    description: 'imagePrompt는 영어로 작성',
    severity: 'error',
    check: 'imagePrompt가 영어인지 확인',
    fix: '영어로 번역',
  },
  {
    id: 'content-testimonial-credibility',
    category: 'content',
    name: '후기 신뢰성',
    description: '후기에 이름, 직업/지역, 구체적 내용 포함',
    severity: 'warning',
    check: 'Testimonials의 author 정보 완성도',
    fix: '이름, 직업, 구체적 효과 추가',
  },
  {
    id: 'content-stats-number-format',
    category: 'content',
    name: '통계 숫자 형식',
    description: '큰 숫자는 단위 포함 (만, 억) 또는 콤마 구분',
    severity: 'info',
    check: '숫자 포맷 확인',
    fix: '10000 → 1만 또는 10,000',
  },
  {
    id: 'content-faq-count',
    category: 'content',
    name: 'FAQ 개수',
    description: 'FAQ는 5~8개',
    severity: 'warning',
    check: 'FAQ items.length >= 5 && <= 8',
    fix: '질문 추가/제거',
  },

  // ===== 접근성 검증 =====
  {
    id: 'a11y-alt-text',
    category: 'accessibility',
    name: '이미지 대체 텍스트',
    description: '모든 이미지에 의미 있는 alt 텍스트',
    severity: 'warning',
    check: 'imageUrl이 있으면 alt 속성 존재 확인',
    fix: '이미지 내용을 설명하는 alt 추가',
  },
  {
    id: 'a11y-heading-hierarchy',
    category: 'accessibility',
    name: '제목 계층 구조',
    description: 'h1 → h2 → h3 순서 준수',
    severity: 'info',
    check: '헤딩 레벨 순서 확인',
    fix: '헤딩 레벨 조정',
  },
  {
    id: 'a11y-link-text',
    category: 'accessibility',
    name: '링크 텍스트 명확성',
    description: '"여기", "클릭" 대신 명확한 링크 텍스트',
    severity: 'info',
    check: '링크 텍스트 내용 확인',
    fix: '"자세히 보기" 대신 "가격 정책 확인하기"',
  },

  // ===== 성능 검증 =====
  {
    id: 'perf-section-height',
    category: 'performance',
    name: '섹션 높이 적정성',
    description: '각 섹션 높이가 권장 범위 내',
    severity: 'info',
    check: 'SECTION_TEMPLATES 권장 높이와 비교',
    fix: '섹션 내용 추가/제거로 조정',
  },
  {
    id: 'perf-total-height',
    category: 'performance',
    name: '전체 높이 적정성',
    description: '전체 페이지 높이가 선택된 프리셋 ±20% 이내',
    severity: 'warning',
    check: '전체 높이 합산과 PIXEL_PRESET 비교',
    fix: '섹션 추가/제거/축소',
  },
];

// ===== 검증 결과 인터페이스 =====
export interface ValidationResult {
  ruleId: string;
  passed: boolean;
  severity: 'error' | 'warning' | 'info';
  message: string;
  details?: string;
  suggestion?: string;
}

export interface ValidationReport {
  totalRules: number;
  passedRules: number;
  failedRules: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  score: number; // 0-100
  results: ValidationResult[];
  summary: string;
}

// ===== 품질 점수 계산 =====
export function calculateQualityScore(results: ValidationResult[]): number {
  const weights = {
    error: 10,
    warning: 3,
    info: 1,
  };

  const maxScore = 100;
  let deductions = 0;

  for (const result of results) {
    if (!result.passed) {
      deductions += weights[result.severity];
    }
  }

  const score = Math.max(0, maxScore - deductions);
  return score;
}

// ===== 품질 등급 =====
export type QualityGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export function getQualityGrade(score: number): QualityGrade {
  if (score >= 95) return 'S';
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

export function getGradeDescription(grade: QualityGrade): string {
  const descriptions: Record<QualityGrade, string> = {
    S: '외주 판매 가능 수준 (프리미엄)',
    A: '외주 판매 가능 수준 (스탠다드)',
    B: '약간의 수정 후 판매 가능',
    C: '수정 필요, 내부 사용 가능',
    D: '상당한 개선 필요',
    F: '전면 재작업 필요',
  };
  return descriptions[grade];
}

// ===== 검증 체크리스트 (빠른 확인용) =====
export interface ChecklistItem {
  category: string;
  items: {
    label: string;
    critical: boolean;
  }[];
}

export const QUICK_CHECKLIST: ChecklistItem[] = [
  {
    category: '구조',
    items: [
      { label: 'Hero 섹션이 최상단에 있음', critical: true },
      { label: 'CTA 섹션이 최하단에 있음', critical: true },
      { label: '신뢰 요소가 상단에 배치됨', critical: false },
      { label: '섹션 순서가 9단계 공식을 따름', critical: false },
    ],
  },
  {
    category: '타이포그래피',
    items: [
      { label: '제목이 명확하고 간결함', critical: true },
      { label: '폰트 크기 계층이 일관됨', critical: true },
      { label: 'CTA 버튼이 행동 유도 문구', critical: true },
      { label: '한글 카피, 이미지 프롬프트 영어', critical: true },
    ],
  },
  {
    category: '색상',
    items: [
      { label: '텍스트 가독성 확보 (대비 4.5:1+)', critical: true },
      { label: '카테고리에 맞는 색상 팔레트', critical: false },
      { label: 'CTA에 Primary 색상 사용', critical: true },
      { label: '섹션별 배경색 다양성', critical: false },
    ],
  },
  {
    category: '콘텐츠',
    items: [
      { label: '이미지 프롬프트가 상세함 (50자+)', critical: true },
      { label: '후기에 신뢰 요소 포함', critical: false },
      { label: '숫자/통계가 구체적', critical: false },
      { label: 'FAQ 5~8개', critical: false },
    ],
  },
  {
    category: '심리학',
    items: [
      { label: '사회적 증거 포함', critical: false },
      { label: '긴급성 요소 포함', critical: false },
      { label: '위험 제거 요소 (환불 보장 등)', critical: false },
      { label: '혜택 중심 카피', critical: true },
    ],
  },
];

// ===== 헬퍼 함수 =====
export function getRulesByCategory(category: string): ValidationRule[] {
  return VALIDATION_RULES.filter(r => r.category === category);
}

export function getCriticalRules(): ValidationRule[] {
  return VALIDATION_RULES.filter(r => r.severity === 'error');
}

export function getQuickChecklistByCategory(category: string): ChecklistItem | undefined {
  return QUICK_CHECKLIST.find(c => c.category === category);
}

export function getCriticalChecklistItems(): { category: string; label: string }[] {
  const items: { category: string; label: string }[] = [];
  for (const checklist of QUICK_CHECKLIST) {
    for (const item of checklist.items) {
      if (item.critical) {
        items.push({ category: checklist.category, label: item.label });
      }
    }
  }
  return items;
}
