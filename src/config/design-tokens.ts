/**
 * Design Tokens - 픽셀 단위 디자인 시스템
 * 외주 판매 수준의 고퀄리티 상세페이지를 위한 정밀 토큰
 */

// ===== 색상 팔레트 =====
export const COLOR_PALETTES = {
  // 이커머스 - 따뜻하고 신뢰감 있는
  ecommerce: {
    primary: '#FF6B35',
    secondary: '#1A1A2E',
    accent: '#FFD93D',
    background: {
      light: '#FFFFFF',
      soft: '#F8F9FA',
      warm: '#FFF8F0',
      dark: '#1A1A2E',
    },
    text: {
      primary: '#1A1A2E',
      secondary: '#6C757D',
      muted: '#ADB5BD',
      inverse: '#FFFFFF',
    },
    semantic: {
      success: '#28A745',
      warning: '#FFC107',
      error: '#DC3545',
      info: '#17A2B8',
    },
  },

  // 부동산 - 고급스럽고 신뢰감
  realestate: {
    primary: '#1E3A5F',
    secondary: '#C9A962',
    accent: '#2E5A3C',
    background: {
      light: '#FFFFFF',
      soft: '#F5F5F0',
      warm: '#FAF8F5',
      dark: '#1E3A5F',
    },
    text: {
      primary: '#1E3A5F',
      secondary: '#5A6C7D',
      muted: '#8A9BAC',
      inverse: '#FFFFFF',
    },
    semantic: {
      success: '#2E5A3C',
      warning: '#C9A962',
      error: '#8B3A3A',
      info: '#3A5A8B',
    },
  },

  // 병원/의료 - 깨끗하고 전문적
  medical: {
    primary: '#0077B6',
    secondary: '#00B4D8',
    accent: '#90E0EF',
    background: {
      light: '#FFFFFF',
      soft: '#F0F9FF',
      warm: '#E8F4F8',
      dark: '#023E8A',
    },
    text: {
      primary: '#023E8A',
      secondary: '#0077B6',
      muted: '#90A4AE',
      inverse: '#FFFFFF',
    },
    semantic: {
      success: '#00C853',
      warning: '#FFB300',
      error: '#E53935',
      info: '#00B4D8',
    },
  },

  // 교육 - 활기차고 신선한
  education: {
    primary: '#5E60CE',
    secondary: '#48BFE3',
    accent: '#72EFDD',
    background: {
      light: '#FFFFFF',
      soft: '#F8F9FF',
      warm: '#F0F3FF',
      dark: '#3A0CA3',
    },
    text: {
      primary: '#1A1A2E',
      secondary: '#5E60CE',
      muted: '#9D9DBA',
      inverse: '#FFFFFF',
    },
    semantic: {
      success: '#06D6A0',
      warning: '#FFD166',
      error: '#EF476F',
      info: '#48BFE3',
    },
  },

  // 음식점 - 식욕 자극
  restaurant: {
    primary: '#D62828',
    secondary: '#F77F00',
    accent: '#FCBF49',
    background: {
      light: '#FFFFFF',
      soft: '#FFF9F0',
      warm: '#FFF5E6',
      dark: '#2B2D42',
    },
    text: {
      primary: '#2B2D42',
      secondary: '#D62828',
      muted: '#8D99AE',
      inverse: '#FFFFFF',
    },
    semantic: {
      success: '#2D6A4F',
      warning: '#F77F00',
      error: '#D62828',
      info: '#457B9D',
    },
  },

  // 여행 - 감성적이고 몽환적
  travel: {
    primary: '#00B4D8',
    secondary: '#0077B6',
    accent: '#FF9F1C',
    background: {
      light: '#FFFFFF',
      soft: '#F0FAFF',
      warm: '#FFF8E8',
      dark: '#023047',
    },
    text: {
      primary: '#023047',
      secondary: '#0077B6',
      muted: '#8ECAE6',
      inverse: '#FFFFFF',
    },
    semantic: {
      success: '#06D6A0',
      warning: '#FF9F1C',
      error: '#E63946',
      info: '#00B4D8',
    },
  },

  // 웨딩 - 우아하고 로맨틱
  wedding: {
    primary: '#C9A962',
    secondary: '#8B7355',
    accent: '#F2E8CF',
    background: {
      light: '#FFFFFF',
      soft: '#FBF9F4',
      warm: '#F8F4EC',
      dark: '#2C2C2C',
    },
    text: {
      primary: '#2C2C2C',
      secondary: '#8B7355',
      muted: '#B8A888',
      inverse: '#FFFFFF',
    },
    semantic: {
      success: '#6B8E23',
      warning: '#DAA520',
      error: '#CD5C5C',
      info: '#708090',
    },
  },

  // 법률/세무 - 권위적이고 신뢰
  legal: {
    primary: '#1A1A2E',
    secondary: '#4A4E69',
    accent: '#C9A962',
    background: {
      light: '#FFFFFF',
      soft: '#F8F8F8',
      warm: '#F5F3F0',
      dark: '#1A1A2E',
    },
    text: {
      primary: '#1A1A2E',
      secondary: '#4A4E69',
      muted: '#9A8C98',
      inverse: '#FFFFFF',
    },
    semantic: {
      success: '#2E5A3C',
      warning: '#C9A962',
      error: '#8B3A3A',
      info: '#4A4E69',
    },
  },

  // 피트니스 - 역동적이고 에너지
  fitness: {
    primary: '#FF006E',
    secondary: '#8338EC',
    accent: '#FFBE0B',
    background: {
      light: '#FFFFFF',
      soft: '#F8F9FA',
      warm: '#FFF8F0',
      dark: '#1A1A2E',
    },
    text: {
      primary: '#1A1A2E',
      secondary: '#8338EC',
      muted: '#6C757D',
      inverse: '#FFFFFF',
    },
    semantic: {
      success: '#06D6A0',
      warning: '#FFBE0B',
      error: '#FF006E',
      info: '#3A86FF',
    },
  },

  // SaaS - 모던하고 테크
  saas: {
    primary: '#6366F1',
    secondary: '#8B5CF6',
    accent: '#06B6D4',
    background: {
      light: '#FFFFFF',
      soft: '#F8FAFC',
      warm: '#F1F5F9',
      dark: '#0F172A',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      muted: '#94A3B8',
      inverse: '#FFFFFF',
    },
    semantic: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#06B6D4',
    },
  },

  // 개인 브랜딩 - 미니멀하고 세련
  personal: {
    primary: '#1A1A1A',
    secondary: '#4A4A4A',
    accent: '#FF4D4D',
    background: {
      light: '#FFFFFF',
      soft: '#FAFAFA',
      warm: '#F5F5F5',
      dark: '#1A1A1A',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#4A4A4A',
      muted: '#9A9A9A',
      inverse: '#FFFFFF',
    },
    semantic: {
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3',
    },
  },
} as const;

// ===== 타이포그래피 시스템 =====
export const TYPOGRAPHY = {
  // 폰트 패밀리
  fontFamily: {
    primary: 'Pretendard',
    secondary: 'Noto Sans KR',
    display: 'Poppins',
    mono: 'JetBrains Mono',
  },

  // 폰트 크기 (px)
  fontSize: {
    // Display - 대형 타이틀
    display1: 72,
    display2: 60,
    display3: 48,

    // Heading - 섹션 제목
    h1: 40,
    h2: 32,
    h3: 28,
    h4: 24,
    h5: 20,
    h6: 18,

    // Body - 본문
    bodyLarge: 18,
    bodyMedium: 16,
    bodySmall: 14,

    // Caption - 보조 텍스트
    caption: 12,
    overline: 10,
  },

  // Line Height (배수)
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2.0,
  },

  // Letter Spacing (em)
  letterSpacing: {
    tighter: -0.05,
    tight: -0.025,
    normal: 0,
    wide: 0.025,
    wider: 0.05,
    widest: 0.1,
  },

  // Font Weight
  fontWeight: {
    thin: 100,
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
} as const;

// ===== 간격 시스템 (8px 기반 그리드) =====
export const SPACING = {
  // Base unit: 8px
  unit: 8,

  // Named spacings
  xxs: 4,   // 0.5 unit
  xs: 8,    // 1 unit
  sm: 12,   // 1.5 units
  md: 16,   // 2 units
  lg: 24,   // 3 units
  xl: 32,   // 4 units
  xxl: 48,  // 6 units
  xxxl: 64, // 8 units

  // Section spacings
  sectionPaddingY: {
    compact: 48,
    standard: 80,
    spacious: 120,
  },

  sectionPaddingX: {
    mobile: 16,
    tablet: 32,
    desktop: 64,
    wide: 120,
  },

  // Component spacings
  cardPadding: {
    sm: 16,
    md: 24,
    lg: 32,
  },

  // Gap between elements
  gap: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  },
} as const;

// ===== 레이아웃 시스템 =====
export const LAYOUT = {
  // Container widths
  maxWidth: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    xxl: 1536,
    full: '100%',
  },

  // 상세페이지 기본 너비
  detailPageWidth: {
    mobile: 375,
    standard: 860,
    wide: 1200,
  },

  // 섹션 높이 가이드
  sectionHeight: {
    hero: { min: 600, max: 900 },
    standard: { min: 400, max: 800 },
    compact: { min: 300, max: 500 },
    tall: { min: 800, max: 1200 },
  },

  // Grid columns
  columns: {
    mobile: 4,
    tablet: 8,
    desktop: 12,
  },

  // Breakpoints
  breakpoints: {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
    wide: 1440,
  },
} as const;

// ===== 모서리 둥글기 =====
export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
} as const;

// ===== 테두리 =====
export const BORDERS = {
  width: {
    thin: 1,
    medium: 2,
    thick: 4,
  },
  style: {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
  },
} as const;

// ===== Z-Index 계층 =====
export const Z_INDEX = {
  background: -1,
  base: 0,
  elevated: 10,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  toast: 500,
  tooltip: 600,
} as const;

// ===== 애니메이션 시간 =====
export const ANIMATION = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 700,
  },
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const;

// 타입 exports
export type CategoryKey = keyof typeof COLOR_PALETTES;
export type ColorPalette = (typeof COLOR_PALETTES)[CategoryKey];
