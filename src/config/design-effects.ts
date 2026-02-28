/**
 * Design Effects - 그라디언트, 쉐도우, 글래스모피즘 효과
 * 2025 트렌드를 반영한 고급 시각 효과
 */

// ===== 그라디언트 정의 =====
export interface GradientDef {
  name: string;
  type: 'linear' | 'radial' | 'conic';
  angle?: number; // linear일 때
  colors: Array<{
    color: string;
    position: number; // 0-100%
  }>;
  css: string;
}

export const GRADIENTS: Record<string, GradientDef> = {
  // 프리미엄 그라디언트
  premiumGold: {
    name: 'Premium Gold',
    type: 'linear',
    angle: 135,
    colors: [
      { color: '#C9A962', position: 0 },
      { color: '#F2E8CF', position: 50 },
      { color: '#C9A962', position: 100 },
    ],
    css: 'linear-gradient(135deg, #C9A962 0%, #F2E8CF 50%, #C9A962 100%)',
  },

  sunsetOrange: {
    name: 'Sunset Orange',
    type: 'linear',
    angle: 135,
    colors: [
      { color: '#FF6B35', position: 0 },
      { color: '#F7931E', position: 50 },
      { color: '#FFD93D', position: 100 },
    ],
    css: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 50%, #FFD93D 100%)',
  },

  oceanBlue: {
    name: 'Ocean Blue',
    type: 'linear',
    angle: 135,
    colors: [
      { color: '#0077B6', position: 0 },
      { color: '#00B4D8', position: 50 },
      { color: '#90E0EF', position: 100 },
    ],
    css: 'linear-gradient(135deg, #0077B6 0%, #00B4D8 50%, #90E0EF 100%)',
  },

  purpleHaze: {
    name: 'Purple Haze',
    type: 'linear',
    angle: 135,
    colors: [
      { color: '#5E60CE', position: 0 },
      { color: '#7209B7', position: 50 },
      { color: '#F72585', position: 100 },
    ],
    css: 'linear-gradient(135deg, #5E60CE 0%, #7209B7 50%, #F72585 100%)',
  },

  mintFresh: {
    name: 'Mint Fresh',
    type: 'linear',
    angle: 135,
    colors: [
      { color: '#06D6A0', position: 0 },
      { color: '#72EFDD', position: 100 },
    ],
    css: 'linear-gradient(135deg, #06D6A0 0%, #72EFDD 100%)',
  },

  midnightDark: {
    name: 'Midnight Dark',
    type: 'linear',
    angle: 180,
    colors: [
      { color: '#1A1A2E', position: 0 },
      { color: '#16213E', position: 50 },
      { color: '#0F3460', position: 100 },
    ],
    css: 'linear-gradient(180deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
  },

  warmSunrise: {
    name: 'Warm Sunrise',
    type: 'linear',
    angle: 45,
    colors: [
      { color: '#FF6B6B', position: 0 },
      { color: '#FEC89A', position: 100 },
    ],
    css: 'linear-gradient(45deg, #FF6B6B 0%, #FEC89A 100%)',
  },

  coolSlate: {
    name: 'Cool Slate',
    type: 'linear',
    angle: 135,
    colors: [
      { color: '#334155', position: 0 },
      { color: '#475569', position: 50 },
      { color: '#64748B', position: 100 },
    ],
    css: 'linear-gradient(135deg, #334155 0%, #475569 50%, #64748B 100%)',
  },

  // 미묘한 배경 그라디언트
  subtleGray: {
    name: 'Subtle Gray',
    type: 'linear',
    angle: 180,
    colors: [
      { color: '#FFFFFF', position: 0 },
      { color: '#F8F9FA', position: 100 },
    ],
    css: 'linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%)',
  },

  subtleWarm: {
    name: 'Subtle Warm',
    type: 'linear',
    angle: 180,
    colors: [
      { color: '#FFFFFF', position: 0 },
      { color: '#FFF8F0', position: 100 },
    ],
    css: 'linear-gradient(180deg, #FFFFFF 0%, #FFF8F0 100%)',
  },

  subtleCool: {
    name: 'Subtle Cool',
    type: 'linear',
    angle: 180,
    colors: [
      { color: '#FFFFFF', position: 0 },
      { color: '#F0F9FF', position: 100 },
    ],
    css: 'linear-gradient(180deg, #FFFFFF 0%, #F0F9FF 100%)',
  },

  // 라디얼 그라디언트
  spotlightCenter: {
    name: 'Spotlight Center',
    type: 'radial',
    colors: [
      { color: 'rgba(255,255,255,0.3)', position: 0 },
      { color: 'rgba(255,255,255,0)', position: 70 },
    ],
    css: 'radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)',
  },

  glowAccent: {
    name: 'Glow Accent',
    type: 'radial',
    colors: [
      { color: 'rgba(99,102,241,0.2)', position: 0 },
      { color: 'rgba(99,102,241,0)', position: 60 },
    ],
    css: 'radial-gradient(circle at center, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0) 60%)',
  },
};

// ===== 쉐도우 정의 =====
export interface ShadowDef {
  name: string;
  values: Array<{
    x: number;
    y: number;
    blur: number;
    spread: number;
    color: string;
  }>;
  css: string;
}

export const SHADOWS: Record<string, ShadowDef> = {
  // 기본 쉐도우
  sm: {
    name: 'Small',
    values: [{ x: 0, y: 1, blur: 2, spread: 0, color: 'rgba(0,0,0,0.05)' }],
    css: '0 1px 2px 0 rgba(0,0,0,0.05)',
  },

  md: {
    name: 'Medium',
    values: [
      { x: 0, y: 4, blur: 6, spread: -1, color: 'rgba(0,0,0,0.1)' },
      { x: 0, y: 2, blur: 4, spread: -2, color: 'rgba(0,0,0,0.1)' },
    ],
    css: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
  },

  lg: {
    name: 'Large',
    values: [
      { x: 0, y: 10, blur: 15, spread: -3, color: 'rgba(0,0,0,0.1)' },
      { x: 0, y: 4, blur: 6, spread: -4, color: 'rgba(0,0,0,0.1)' },
    ],
    css: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
  },

  xl: {
    name: 'Extra Large',
    values: [
      { x: 0, y: 20, blur: 25, spread: -5, color: 'rgba(0,0,0,0.1)' },
      { x: 0, y: 8, blur: 10, spread: -6, color: 'rgba(0,0,0,0.1)' },
    ],
    css: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
  },

  xxl: {
    name: '2XL',
    values: [{ x: 0, y: 25, blur: 50, spread: -12, color: 'rgba(0,0,0,0.25)' }],
    css: '0 25px 50px -12px rgba(0,0,0,0.25)',
  },

  // 특수 쉐도우
  soft: {
    name: 'Soft',
    values: [{ x: 0, y: 8, blur: 32, spread: 0, color: 'rgba(0,0,0,0.08)' }],
    css: '0 8px 32px 0 rgba(0,0,0,0.08)',
  },

  elevated: {
    name: 'Elevated',
    values: [
      { x: 0, y: 12, blur: 24, spread: -4, color: 'rgba(0,0,0,0.12)' },
      { x: 0, y: 4, blur: 8, spread: 0, color: 'rgba(0,0,0,0.04)' },
    ],
    css: '0 12px 24px -4px rgba(0,0,0,0.12), 0 4px 8px 0 rgba(0,0,0,0.04)',
  },

  floating: {
    name: 'Floating',
    values: [
      { x: 0, y: 24, blur: 48, spread: -8, color: 'rgba(0,0,0,0.15)' },
      { x: 0, y: 8, blur: 16, spread: 0, color: 'rgba(0,0,0,0.06)' },
    ],
    css: '0 24px 48px -8px rgba(0,0,0,0.15), 0 8px 16px 0 rgba(0,0,0,0.06)',
  },

  // 컬러 쉐도우
  glowPrimary: {
    name: 'Glow Primary',
    values: [{ x: 0, y: 8, blur: 24, spread: 0, color: 'rgba(99,102,241,0.35)' }],
    css: '0 8px 24px 0 rgba(99,102,241,0.35)',
  },

  glowSuccess: {
    name: 'Glow Success',
    values: [{ x: 0, y: 8, blur: 24, spread: 0, color: 'rgba(16,185,129,0.35)' }],
    css: '0 8px 24px 0 rgba(16,185,129,0.35)',
  },

  glowWarning: {
    name: 'Glow Warning',
    values: [{ x: 0, y: 8, blur: 24, spread: 0, color: 'rgba(245,158,11,0.35)' }],
    css: '0 8px 24px 0 rgba(245,158,11,0.35)',
  },

  glowDanger: {
    name: 'Glow Danger',
    values: [{ x: 0, y: 8, blur: 24, spread: 0, color: 'rgba(239,68,68,0.35)' }],
    css: '0 8px 24px 0 rgba(239,68,68,0.35)',
  },

  // 인셋 쉐도우
  inset: {
    name: 'Inset',
    values: [{ x: 0, y: 2, blur: 4, spread: 0, color: 'rgba(0,0,0,0.06)' }],
    css: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
  },

  innerGlow: {
    name: 'Inner Glow',
    values: [{ x: 0, y: 0, blur: 0, spread: 1, color: 'rgba(255,255,255,0.1)' }],
    css: 'inset 0 0 0 1px rgba(255,255,255,0.1)',
  },
};

// ===== 글래스모피즘 효과 =====
export interface GlassDef {
  name: string;
  background: string;
  backdropBlur: number; // px
  border: string;
  css: {
    background: string;
    backdropFilter: string;
    border: string;
  };
}

export const GLASS_EFFECTS: Record<string, GlassDef> = {
  light: {
    name: 'Light Glass',
    background: 'rgba(255,255,255,0.7)',
    backdropBlur: 12,
    border: '1px solid rgba(255,255,255,0.3)',
    css: {
      background: 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.3)',
    },
  },

  lightSubtle: {
    name: 'Light Subtle Glass',
    background: 'rgba(255,255,255,0.5)',
    backdropBlur: 8,
    border: '1px solid rgba(255,255,255,0.2)',
    css: {
      background: 'rgba(255,255,255,0.5)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.2)',
    },
  },

  dark: {
    name: 'Dark Glass',
    background: 'rgba(0,0,0,0.5)',
    backdropBlur: 12,
    border: '1px solid rgba(255,255,255,0.1)',
    css: {
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)',
    },
  },

  darkSubtle: {
    name: 'Dark Subtle Glass',
    background: 'rgba(0,0,0,0.3)',
    backdropBlur: 8,
    border: '1px solid rgba(255,255,255,0.05)',
    css: {
      background: 'rgba(0,0,0,0.3)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.05)',
    },
  },

  frosted: {
    name: 'Frosted Glass',
    background: 'rgba(255,255,255,0.85)',
    backdropBlur: 20,
    border: '1px solid rgba(255,255,255,0.5)',
    css: {
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.5)',
    },
  },

  coloredLight: {
    name: 'Colored Light Glass',
    background: 'rgba(99,102,241,0.1)',
    backdropBlur: 12,
    border: '1px solid rgba(99,102,241,0.2)',
    css: {
      background: 'rgba(99,102,241,0.1)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(99,102,241,0.2)',
    },
  },
};

// ===== 투명도 프리셋 =====
export const OPACITY = {
  0: 0,
  5: 0.05,
  10: 0.1,
  20: 0.2,
  25: 0.25,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  75: 0.75,
  80: 0.8,
  90: 0.9,
  95: 0.95,
  100: 1,
} as const;

// ===== 오버레이 효과 (Figma 플러그인 한계 고려) =====
export interface OverlayDef {
  name: string;
  type: 'solid' | 'gradient';
  value: string;
  purpose: string;
}

export const OVERLAYS: Record<string, OverlayDef> = {
  darkScrim: {
    name: 'Dark Scrim',
    type: 'solid',
    value: 'rgba(0,0,0,0.4)',
    purpose: '밝은 이미지 위 텍스트 가독성',
  },

  lightScrim: {
    name: 'Light Scrim',
    type: 'solid',
    value: 'rgba(255,255,255,0.6)',
    purpose: '어두운 이미지 위 텍스트 가독성',
  },

  gradientBottom: {
    name: 'Gradient Bottom',
    type: 'gradient',
    value: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%)',
    purpose: '이미지 하단 텍스트 영역',
  },

  gradientTop: {
    name: 'Gradient Top',
    type: 'gradient',
    value: 'linear-gradient(to top, transparent 0%, rgba(0,0,0,0.7) 100%)',
    purpose: '이미지 상단 텍스트 영역',
  },

  colorWash: {
    name: 'Color Wash',
    type: 'solid',
    value: 'rgba(99,102,241,0.15)',
    purpose: '브랜드 컬러 톤 적용',
  },

  duotone: {
    name: 'Duotone',
    type: 'gradient',
    value: 'linear-gradient(135deg, rgba(99,102,241,0.8) 0%, rgba(236,72,153,0.8) 100%)',
    purpose: '트렌디한 듀오톤 효과',
  },
};

// ===== 카테고리별 추천 효과 =====
export const CATEGORY_EFFECTS: Record<string, {
  gradients: string[];
  shadows: string[];
  glass: string[];
}> = {
  ecommerce: {
    gradients: ['sunsetOrange', 'warmSunrise', 'subtleWarm'],
    shadows: ['elevated', 'soft', 'glowWarning'],
    glass: ['light', 'frosted'],
  },
  realestate: {
    gradients: ['premiumGold', 'coolSlate', 'subtleGray'],
    shadows: ['floating', 'elevated', 'xxl'],
    glass: ['frosted', 'lightSubtle'],
  },
  medical: {
    gradients: ['oceanBlue', 'mintFresh', 'subtleCool'],
    shadows: ['soft', 'md', 'glowPrimary'],
    glass: ['light', 'lightSubtle'],
  },
  education: {
    gradients: ['purpleHaze', 'oceanBlue', 'subtleCool'],
    shadows: ['elevated', 'glowPrimary', 'lg'],
    glass: ['coloredLight', 'light'],
  },
  restaurant: {
    gradients: ['warmSunrise', 'sunsetOrange', 'subtleWarm'],
    shadows: ['floating', 'glowWarning', 'xl'],
    glass: ['dark', 'darkSubtle'],
  },
  travel: {
    gradients: ['oceanBlue', 'mintFresh', 'sunsetOrange'],
    shadows: ['floating', 'elevated', 'glowPrimary'],
    glass: ['light', 'frosted'],
  },
  wedding: {
    gradients: ['premiumGold', 'subtleWarm', 'subtleGray'],
    shadows: ['soft', 'elevated', 'lg'],
    glass: ['frosted', 'light'],
  },
  legal: {
    gradients: ['coolSlate', 'midnightDark', 'subtleGray'],
    shadows: ['md', 'lg', 'soft'],
    glass: ['lightSubtle', 'light'],
  },
  fitness: {
    gradients: ['purpleHaze', 'sunsetOrange', 'midnightDark'],
    shadows: ['glowDanger', 'glowPrimary', 'floating'],
    glass: ['dark', 'coloredLight'],
  },
  saas: {
    gradients: ['purpleHaze', 'oceanBlue', 'subtleCool'],
    shadows: ['elevated', 'glowPrimary', 'soft'],
    glass: ['light', 'coloredLight'],
  },
  personal: {
    gradients: ['coolSlate', 'subtleGray', 'midnightDark'],
    shadows: ['soft', 'lg', 'elevated'],
    glass: ['lightSubtle', 'frosted'],
  },
};

// ===== 헬퍼 함수 =====
export function getGradient(name: string): GradientDef | undefined {
  return GRADIENTS[name];
}

export function getShadow(name: string): ShadowDef | undefined {
  return SHADOWS[name];
}

export function getGlassEffect(name: string): GlassDef | undefined {
  return GLASS_EFFECTS[name];
}

export function getCategoryEffects(category: string) {
  return CATEGORY_EFFECTS[category] || CATEGORY_EFFECTS.ecommerce;
}
