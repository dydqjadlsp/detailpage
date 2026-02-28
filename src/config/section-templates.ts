/**
 * Section Templates - 섹션별 픽셀 정밀 레이아웃
 * 각 섹션의 구조, 크기, 배치를 픽셀 단위로 정의
 */

import { SPACING, TYPOGRAPHY } from './design-tokens';

// ===== 섹션 타입 정의 =====
export type SectionType =
  | 'Hero'
  | 'Features'
  | 'Benefits'
  | 'Gallery'
  | 'Testimonials'
  | 'Process'
  | 'Pricing'
  | 'FAQ'
  | 'Stats'
  | 'Team'
  | 'About'
  | 'Contact'
  | 'CTA'
  | 'Comparison'
  | 'Timeline'
  | 'Portfolio'
  | 'VideoShowcase'
  | 'DetailedProduct'
  | 'TrustBadges'
  | 'Urgency';

// ===== 레이아웃 변형 =====
export type LayoutVariant =
  | 'center'
  | 'left-image'
  | 'right-image'
  | 'full-width'
  | 'grid'
  | 'split'
  | 'stacked'
  | 'masonry'
  | 'carousel';

// ===== 섹션 템플릿 인터페이스 =====
export interface SectionTemplate {
  type: SectionType;
  name: string;
  description: string;
  layouts: LayoutVariant[];
  defaultLayout: LayoutVariant;
  height: {
    min: number;
    recommended: number;
    max: number;
  };
  padding: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  elements: SectionElement[];
  rules: string[];
}

export interface SectionElement {
  name: string;
  type: 'text' | 'image' | 'button' | 'icon' | 'badge' | 'card' | 'list' | 'divider';
  required: boolean;
  specs: {
    fontSize?: number;
    fontWeight?: number;
    lineHeight?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    aspectRatio?: string;
    marginTop?: number;
    marginBottom?: number;
  };
}

// ===== 섹션 템플릿 정의 =====
export const SECTION_TEMPLATES: Record<SectionType, SectionTemplate> = {
  Hero: {
    type: 'Hero',
    name: '히어로 섹션',
    description: '첫 화면에서 3초 안에 사로잡는 메인 섹션',
    layouts: ['center', 'left-image', 'right-image', 'full-width'],
    defaultLayout: 'center',
    height: {
      min: 600,
      recommended: 800,
      max: 1000,
    },
    padding: {
      top: SPACING.sectionPaddingY.spacious,
      bottom: SPACING.sectionPaddingY.spacious,
      left: SPACING.sectionPaddingX.desktop,
      right: SPACING.sectionPaddingX.desktop,
    },
    elements: [
      {
        name: 'badge',
        type: 'badge',
        required: false,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.caption,
          fontWeight: TYPOGRAPHY.fontWeight.semibold,
          marginBottom: SPACING.md,
        },
      },
      {
        name: 'title',
        type: 'text',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.display2,
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          lineHeight: TYPOGRAPHY.lineHeight.tight,
          maxWidth: 800,
          marginBottom: SPACING.lg,
        },
      },
      {
        name: 'subtitle',
        type: 'text',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.h4,
          fontWeight: TYPOGRAPHY.fontWeight.regular,
          lineHeight: TYPOGRAPHY.lineHeight.relaxed,
          maxWidth: 600,
          marginBottom: SPACING.xl,
        },
      },
      {
        name: 'cta',
        type: 'button',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.bodyLarge,
          fontWeight: TYPOGRAPHY.fontWeight.semibold,
          minHeight: 56,
        },
      },
      {
        name: 'image',
        type: 'image',
        required: true,
        specs: {
          aspectRatio: '16:9',
          maxWidth: 1200,
          maxHeight: 600,
        },
      },
    ],
    rules: [
      '타이틀은 최대 2줄 (40자 이내)',
      '서브타이틀은 최대 3줄 (80자 이내)',
      'CTA 버튼 텍스트는 액션 동사로 시작',
      '히어로 이미지는 제품의 가장 매력적인 앵글',
      '배경은 그라디언트 또는 단색 (시선 분산 방지)',
    ],
  },

  Features: {
    type: 'Features',
    name: '특징/기능 섹션',
    description: '핵심 특징을 아이콘과 함께 그리드로 배치',
    layouts: ['grid', 'stacked', 'left-image', 'right-image'],
    defaultLayout: 'grid',
    height: {
      min: 500,
      recommended: 700,
      max: 1000,
    },
    padding: {
      top: SPACING.sectionPaddingY.standard,
      bottom: SPACING.sectionPaddingY.standard,
      left: SPACING.sectionPaddingX.desktop,
      right: SPACING.sectionPaddingX.desktop,
    },
    elements: [
      {
        name: 'sectionTitle',
        type: 'text',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.h2,
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          marginBottom: SPACING.xxl,
        },
      },
      {
        name: 'featureCards',
        type: 'card',
        required: true,
        specs: {
          minHeight: 200,
          maxWidth: 350,
        },
      },
      {
        name: 'featureIcon',
        type: 'icon',
        required: true,
        specs: {
          minHeight: 48,
          maxHeight: 64,
          marginBottom: SPACING.md,
        },
      },
      {
        name: 'featureTitle',
        type: 'text',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.h5,
          fontWeight: TYPOGRAPHY.fontWeight.semibold,
          marginBottom: SPACING.sm,
        },
      },
      {
        name: 'featureDescription',
        type: 'text',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.bodyMedium,
          lineHeight: TYPOGRAPHY.lineHeight.relaxed,
        },
      },
    ],
    rules: [
      '특징은 3~6개로 제한',
      '그리드는 3열 (데스크탑), 2열 (태블릿), 1열 (모바일)',
      '각 특징 카드 높이 통일',
      '아이콘은 동일한 스타일/두께',
      '제목은 10자 이내, 설명은 40자 이내',
    ],
  },

  Benefits: {
    type: 'Benefits',
    name: '혜택/이점 섹션',
    description: '고객이 얻는 가치를 시각적으로 강조',
    layouts: ['left-image', 'right-image', 'stacked', 'grid'],
    defaultLayout: 'left-image',
    height: {
      min: 500,
      recommended: 650,
      max: 900,
    },
    padding: {
      top: SPACING.sectionPaddingY.standard,
      bottom: SPACING.sectionPaddingY.standard,
      left: SPACING.sectionPaddingX.desktop,
      right: SPACING.sectionPaddingX.desktop,
    },
    elements: [
      {
        name: 'sectionTitle',
        type: 'text',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.h2,
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          marginBottom: SPACING.lg,
        },
      },
      {
        name: 'benefitImage',
        type: 'image',
        required: true,
        specs: {
          aspectRatio: '4:3',
          maxWidth: 500,
        },
      },
      {
        name: 'benefitList',
        type: 'list',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.bodyLarge,
          lineHeight: TYPOGRAPHY.lineHeight.relaxed,
        },
      },
    ],
    rules: [
      '혜택은 Before/After 또는 문제/해결 구조',
      '구체적인 수치 포함 (예: 30% 절감)',
      '이미지와 텍스트 5:5 비율',
      '체크마크 또는 번호로 리스트 구성',
    ],
  },

  Gallery: {
    type: 'Gallery',
    name: '갤러리 섹션',
    description: '제품/서비스 이미지를 그리드로 전시',
    layouts: ['grid', 'masonry', 'carousel'],
    defaultLayout: 'grid',
    height: {
      min: 500,
      recommended: 800,
      max: 1200,
    },
    padding: {
      top: SPACING.sectionPaddingY.standard,
      bottom: SPACING.sectionPaddingY.standard,
      left: SPACING.sectionPaddingX.desktop,
      right: SPACING.sectionPaddingX.desktop,
    },
    elements: [
      {
        name: 'sectionTitle',
        type: 'text',
        required: false,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.h2,
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          marginBottom: SPACING.xxl,
        },
      },
      {
        name: 'galleryImages',
        type: 'image',
        required: true,
        specs: {
          aspectRatio: '1:1',
          minHeight: 250,
        },
      },
    ],
    rules: [
      '이미지 최소 4개, 최대 9개',
      '메인 이미지 1개는 크게 (2x2)',
      '일관된 색감/톤 유지',
      '호버 시 확대 효과',
    ],
  },

  Testimonials: {
    type: 'Testimonials',
    name: '후기/추천 섹션',
    description: '실제 고객 후기로 신뢰 구축',
    layouts: ['carousel', 'grid', 'stacked'],
    defaultLayout: 'carousel',
    height: {
      min: 400,
      recommended: 550,
      max: 750,
    },
    padding: {
      top: SPACING.sectionPaddingY.standard,
      bottom: SPACING.sectionPaddingY.standard,
      left: SPACING.sectionPaddingX.desktop,
      right: SPACING.sectionPaddingX.desktop,
    },
    elements: [
      {
        name: 'sectionTitle',
        type: 'text',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.h2,
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          marginBottom: SPACING.xxl,
        },
      },
      {
        name: 'testimonialCard',
        type: 'card',
        required: true,
        specs: {
          minHeight: 280,
          maxWidth: 400,
        },
      },
      {
        name: 'quote',
        type: 'text',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.bodyLarge,
          lineHeight: TYPOGRAPHY.lineHeight.relaxed,
          fontWeight: TYPOGRAPHY.fontWeight.medium,
        },
      },
      {
        name: 'authorImage',
        type: 'image',
        required: false,
        specs: {
          aspectRatio: '1:1',
          maxWidth: 64,
          maxHeight: 64,
        },
      },
      {
        name: 'authorName',
        type: 'text',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.bodyMedium,
          fontWeight: TYPOGRAPHY.fontWeight.semibold,
        },
      },
      {
        name: 'rating',
        type: 'icon',
        required: false,
        specs: {
          maxHeight: 20,
        },
      },
    ],
    rules: [
      '후기 최소 3개',
      '별점 5점 만점 중 4.5 이상만 표시',
      '실제 고객명 또는 닉네임 + 직업/지역',
      '인용부호로 후기 감싸기',
      '사진이 없으면 이니셜 아바타',
    ],
  },

  Process: {
    type: 'Process',
    name: '프로세스/단계 섹션',
    description: '서비스 이용 과정을 단계별로 안내',
    layouts: ['stacked', 'grid', 'left-image'],
    defaultLayout: 'stacked',
    height: {
      min: 400,
      recommended: 600,
      max: 900,
    },
    padding: {
      top: SPACING.sectionPaddingY.standard,
      bottom: SPACING.sectionPaddingY.standard,
      left: SPACING.sectionPaddingX.desktop,
      right: SPACING.sectionPaddingX.desktop,
    },
    elements: [
      {
        name: 'sectionTitle',
        type: 'text',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.h2,
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          marginBottom: SPACING.xxl,
        },
      },
      {
        name: 'stepNumber',
        type: 'badge',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.h4,
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          minHeight: 48,
        },
      },
      {
        name: 'stepTitle',
        type: 'text',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.h5,
          fontWeight: TYPOGRAPHY.fontWeight.semibold,
        },
      },
      {
        name: 'stepDescription',
        type: 'text',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.bodyMedium,
          lineHeight: TYPOGRAPHY.lineHeight.relaxed,
        },
      },
      {
        name: 'connector',
        type: 'divider',
        required: false,
        specs: {
          minHeight: 2,
        },
      },
    ],
    rules: [
      '단계 3~5개로 제한',
      '각 단계 번호 또는 아이콘으로 구분',
      '단계 간 화살표 또는 연결선',
      '마지막 단계는 "완료/결과" 강조',
    ],
  },

  Stats: {
    type: 'Stats',
    name: '통계/숫자 섹션',
    description: '인상적인 숫자로 신뢰도 상승',
    layouts: ['grid', 'center'],
    defaultLayout: 'grid',
    height: {
      min: 250,
      recommended: 350,
      max: 500,
    },
    padding: {
      top: SPACING.sectionPaddingY.compact,
      bottom: SPACING.sectionPaddingY.compact,
      left: SPACING.sectionPaddingX.desktop,
      right: SPACING.sectionPaddingX.desktop,
    },
    elements: [
      {
        name: 'statNumber',
        type: 'text',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.display2,
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          lineHeight: TYPOGRAPHY.lineHeight.tight,
        },
      },
      {
        name: 'statLabel',
        type: 'text',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.bodyMedium,
          fontWeight: TYPOGRAPHY.fontWeight.medium,
        },
      },
    ],
    rules: [
      '통계 3~4개로 제한',
      '숫자는 최대 5자리 + 단위',
      '카운트업 애니메이션 권장',
      '가장 인상적인 숫자를 첫번째/가운데',
    ],
  },

  FAQ: {
    type: 'FAQ',
    name: 'FAQ 섹션',
    description: '자주 묻는 질문으로 의문 해소',
    layouts: ['stacked', 'grid'],
    defaultLayout: 'stacked',
    height: {
      min: 400,
      recommended: 600,
      max: 1000,
    },
    padding: {
      top: SPACING.sectionPaddingY.standard,
      bottom: SPACING.sectionPaddingY.standard,
      left: SPACING.sectionPaddingX.desktop,
      right: SPACING.sectionPaddingX.desktop,
    },
    elements: [
      {
        name: 'sectionTitle',
        type: 'text',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.h2,
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          marginBottom: SPACING.xxl,
        },
      },
      {
        name: 'question',
        type: 'text',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.h5,
          fontWeight: TYPOGRAPHY.fontWeight.semibold,
        },
      },
      {
        name: 'answer',
        type: 'text',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.bodyMedium,
          lineHeight: TYPOGRAPHY.lineHeight.relaxed,
        },
      },
    ],
    rules: [
      'FAQ 5~8개로 제한',
      '아코디언 UI로 펼침/접힘',
      '질문은 고객 관점에서 작성',
      '답변은 2~4문장으로 간결하게',
      '가장 많이 묻는 질문 상단 배치',
    ],
  },

  CTA: {
    type: 'CTA',
    name: 'CTA (행동유도) 섹션',
    description: '마지막 전환을 유도하는 강력한 섹션',
    layouts: ['center', 'split'],
    defaultLayout: 'center',
    height: {
      min: 300,
      recommended: 450,
      max: 600,
    },
    padding: {
      top: SPACING.sectionPaddingY.spacious,
      bottom: SPACING.sectionPaddingY.spacious,
      left: SPACING.sectionPaddingX.desktop,
      right: SPACING.sectionPaddingX.desktop,
    },
    elements: [
      {
        name: 'title',
        type: 'text',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.h1,
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          lineHeight: TYPOGRAPHY.lineHeight.tight,
          marginBottom: SPACING.lg,
        },
      },
      {
        name: 'subtitle',
        type: 'text',
        required: false,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.bodyLarge,
          marginBottom: SPACING.xl,
        },
      },
      {
        name: 'primaryButton',
        type: 'button',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.h5,
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          minHeight: 60,
        },
      },
      {
        name: 'secondaryButton',
        type: 'button',
        required: false,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.bodyLarge,
          minHeight: 48,
        },
      },
      {
        name: 'trustBadge',
        type: 'badge',
        required: false,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.caption,
          marginTop: SPACING.lg,
        },
      },
    ],
    rules: [
      'CTA 제목은 행동 유도 문구',
      '버튼 색상은 Primary Color',
      '버튼 아래 안심 문구 (무료배송, 환불보장 등)',
      '배경은 다크 또는 그라디언트로 대비',
      '긴급성 요소 포함 (오늘만, 한정수량)',
    ],
  },

  Pricing: {
    type: 'Pricing',
    name: '가격/요금제 섹션',
    description: '투명한 가격 정보로 결정 유도',
    layouts: ['grid', 'stacked'],
    defaultLayout: 'grid',
    height: {
      min: 500,
      recommended: 700,
      max: 1000,
    },
    padding: {
      top: SPACING.sectionPaddingY.standard,
      bottom: SPACING.sectionPaddingY.standard,
      left: SPACING.sectionPaddingX.desktop,
      right: SPACING.sectionPaddingX.desktop,
    },
    elements: [
      {
        name: 'sectionTitle',
        type: 'text',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.h2,
          fontWeight: TYPOGRAPHY.fontWeight.bold,
          marginBottom: SPACING.xxl,
        },
      },
      {
        name: 'pricingCard',
        type: 'card',
        required: true,
        specs: {
          minHeight: 450,
          maxWidth: 380,
        },
      },
      {
        name: 'planName',
        type: 'text',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.h4,
          fontWeight: TYPOGRAPHY.fontWeight.semibold,
        },
      },
      {
        name: 'price',
        type: 'text',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.display3,
          fontWeight: TYPOGRAPHY.fontWeight.bold,
        },
      },
      {
        name: 'featureList',
        type: 'list',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.bodyMedium,
        },
      },
    ],
    rules: [
      '요금제 2~4개로 제한',
      '추천 요금제 강조 (BEST, 인기)',
      '정가 취소선 + 할인가 표시',
      '월/연 토글 제공',
      '기능 비교 체크마크로 시각화',
    ],
  },

  TrustBadges: {
    type: 'TrustBadges',
    name: '신뢰 배지 섹션',
    description: '인증, 수상, 미디어 노출로 권위 확보',
    layouts: ['center', 'grid'],
    defaultLayout: 'center',
    height: {
      min: 150,
      recommended: 250,
      max: 350,
    },
    padding: {
      top: SPACING.sectionPaddingY.compact,
      bottom: SPACING.sectionPaddingY.compact,
      left: SPACING.sectionPaddingX.desktop,
      right: SPACING.sectionPaddingX.desktop,
    },
    elements: [
      {
        name: 'badgeImage',
        type: 'image',
        required: true,
        specs: {
          maxHeight: 60,
          maxWidth: 150,
        },
      },
      {
        name: 'partnerLogos',
        type: 'image',
        required: false,
        specs: {
          maxHeight: 40,
        },
      },
    ],
    rules: [
      '배지 4~8개',
      '그레이스케일로 통일 (컬러는 호버 시)',
      '공인 인증 > 수상 > 미디어 노출 순서',
    ],
  },

  Urgency: {
    type: 'Urgency',
    name: '긴급성 섹션',
    description: '시간/수량 제한으로 즉시 행동 유도',
    layouts: ['center', 'full-width'],
    defaultLayout: 'center',
    height: {
      min: 150,
      recommended: 200,
      max: 300,
    },
    padding: {
      top: SPACING.sectionPaddingY.compact,
      bottom: SPACING.sectionPaddingY.compact,
      left: SPACING.sectionPaddingX.desktop,
      right: SPACING.sectionPaddingX.desktop,
    },
    elements: [
      {
        name: 'urgencyMessage',
        type: 'text',
        required: true,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.h4,
          fontWeight: TYPOGRAPHY.fontWeight.bold,
        },
      },
      {
        name: 'countdown',
        type: 'text',
        required: false,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.display3,
          fontWeight: TYPOGRAPHY.fontWeight.bold,
        },
      },
      {
        name: 'stockIndicator',
        type: 'badge',
        required: false,
        specs: {
          fontSize: TYPOGRAPHY.fontSize.bodyLarge,
        },
      },
    ],
    rules: [
      '빨간색/주황색 강조',
      '카운트다운 또는 재고 수량',
      '너무 자주 사용하면 신뢰 하락',
      '실제 마감/재고와 일치해야 함',
    ],
  },

  // 기본 템플릿 (나머지 섹션용)
  Team: {
    type: 'Team',
    name: '팀 소개 섹션',
    description: '팀원/전문가 프로필',
    layouts: ['grid', 'carousel'],
    defaultLayout: 'grid',
    height: { min: 400, recommended: 600, max: 900 },
    padding: {
      top: SPACING.sectionPaddingY.standard,
      bottom: SPACING.sectionPaddingY.standard,
      left: SPACING.sectionPaddingX.desktop,
      right: SPACING.sectionPaddingX.desktop,
    },
    elements: [],
    rules: ['팀원 3~6명', '동일한 사진 스타일', '직책 + 한줄 소개'],
  },

  About: {
    type: 'About',
    name: '소개 섹션',
    description: '브랜드/회사 스토리',
    layouts: ['split', 'left-image', 'center'],
    defaultLayout: 'split',
    height: { min: 400, recommended: 600, max: 800 },
    padding: {
      top: SPACING.sectionPaddingY.standard,
      bottom: SPACING.sectionPaddingY.standard,
      left: SPACING.sectionPaddingX.desktop,
      right: SPACING.sectionPaddingX.desktop,
    },
    elements: [],
    rules: ['핵심 가치 3가지', '연혁 타임라인', '비전/미션 명확히'],
  },

  Contact: {
    type: 'Contact',
    name: '연락처 섹션',
    description: '문의 및 연락 정보',
    layouts: ['split', 'center'],
    defaultLayout: 'split',
    height: { min: 350, recommended: 500, max: 700 },
    padding: {
      top: SPACING.sectionPaddingY.standard,
      bottom: SPACING.sectionPaddingY.standard,
      left: SPACING.sectionPaddingX.desktop,
      right: SPACING.sectionPaddingX.desktop,
    },
    elements: [],
    rules: ['전화번호 클릭 가능', '지도 삽입', '영업시간 명시'],
  },

  Comparison: {
    type: 'Comparison',
    name: '비교 섹션',
    description: '경쟁사/이전 제품과 비교',
    layouts: ['grid', 'split'],
    defaultLayout: 'grid',
    height: { min: 400, recommended: 600, max: 900 },
    padding: {
      top: SPACING.sectionPaddingY.standard,
      bottom: SPACING.sectionPaddingY.standard,
      left: SPACING.sectionPaddingX.desktop,
      right: SPACING.sectionPaddingX.desktop,
    },
    elements: [],
    rules: ['Before/After 형식', '체크마크로 우위 표시', '공정한 비교'],
  },

  Timeline: {
    type: 'Timeline',
    name: '타임라인 섹션',
    description: '연혁/진행 과정',
    layouts: ['stacked', 'left-image'],
    defaultLayout: 'stacked',
    height: { min: 400, recommended: 700, max: 1200 },
    padding: {
      top: SPACING.sectionPaddingY.standard,
      bottom: SPACING.sectionPaddingY.standard,
      left: SPACING.sectionPaddingX.desktop,
      right: SPACING.sectionPaddingX.desktop,
    },
    elements: [],
    rules: ['시간순 정렬', '각 이벤트 짧은 설명', '아이콘으로 구분'],
  },

  Portfolio: {
    type: 'Portfolio',
    name: '포트폴리오 섹션',
    description: '작업물/사례 전시',
    layouts: ['grid', 'masonry', 'carousel'],
    defaultLayout: 'grid',
    height: { min: 500, recommended: 800, max: 1200 },
    padding: {
      top: SPACING.sectionPaddingY.standard,
      bottom: SPACING.sectionPaddingY.standard,
      left: SPACING.sectionPaddingX.desktop,
      right: SPACING.sectionPaddingX.desktop,
    },
    elements: [],
    rules: ['최신 작업물 먼저', '카테고리 필터', '클릭 시 상세 보기'],
  },

  VideoShowcase: {
    type: 'VideoShowcase',
    name: '비디오 섹션',
    description: '영상 콘텐츠 전시',
    layouts: ['center', 'full-width'],
    defaultLayout: 'center',
    height: { min: 400, recommended: 600, max: 800 },
    padding: {
      top: SPACING.sectionPaddingY.standard,
      bottom: SPACING.sectionPaddingY.standard,
      left: SPACING.sectionPaddingX.desktop,
      right: SPACING.sectionPaddingX.desktop,
    },
    elements: [],
    rules: ['자동재생 X, 클릭 재생', '16:9 비율', '썸네일 고퀄리티'],
  },

  DetailedProduct: {
    type: 'DetailedProduct',
    name: '상세 제품 정보',
    description: '제품 스펙/구성품 상세',
    layouts: ['stacked', 'grid', 'split'],
    defaultLayout: 'stacked',
    height: { min: 500, recommended: 800, max: 1500 },
    padding: {
      top: SPACING.sectionPaddingY.standard,
      bottom: SPACING.sectionPaddingY.standard,
      left: SPACING.sectionPaddingX.desktop,
      right: SPACING.sectionPaddingX.desktop,
    },
    elements: [],
    rules: ['스펙 테이블', '구성품 이미지', '사이즈 가이드'],
  },
};

// 섹션 타입 배열 (순서대로)
export const SECTION_ORDER: SectionType[] = [
  'Hero',
  'TrustBadges',
  'Features',
  'Benefits',
  'Process',
  'Gallery',
  'DetailedProduct',
  'Stats',
  'Testimonials',
  'Pricing',
  'FAQ',
  'Urgency',
  'CTA',
];

// 헬퍼 함수
export function getTemplate(type: SectionType): SectionTemplate {
  return SECTION_TEMPLATES[type];
}

export function getRecommendedHeight(type: SectionType): number {
  return SECTION_TEMPLATES[type].height.recommended;
}

export function getTotalHeight(sections: SectionType[]): number {
  return sections.reduce((total, type) => {
    return total + getRecommendedHeight(type);
  }, 0);
}
