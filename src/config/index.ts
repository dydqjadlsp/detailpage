/**
 * Design System Configuration - 통합 Export
 * 모든 디자인 시스템 설정을 한 곳에서 관리
 */

// ===== 디자인 토큰 =====
export * from './design-tokens';

// ===== 섹션 템플릿 =====
export * from './section-templates';

// ===== 9단계 공식 =====
export * from './nine-step-formula';

// ===== 디자인 효과 =====
export * from './design-effects';

// ===== 카테고리 템플릿 =====
export * from './category-templates';

// ===== 설득 심리학 =====
export * from './persuasion-psychology';

// ===== 카피라이팅 =====
export * from './copywriting-templates';

// ===== 디자인 검증 =====
export * from './design-validator';

// ===== A/B 테스트 변형 =====
export * from './ab-variants';

// ===== 플랫폼 규격 =====
export * from './platform-specs';

// ===== 이미지 구도 =====
export * from './image-composition';

// ===== 2025 트렌드 효과 =====
export * from './modern-effects';

// ===== 품질 등급 =====
export * from './quality-tiers';

// ===== 전략 가이드 (PDF 기반) =====
export * from './strategy-antipatterns';
export * from './strategy-narrative';
export * from './strategy-usp';
export * from './strategy-psychology-extended';
export * from './strategy-selector';

// ===== 통합 설정 객체 =====
import { COLOR_PALETTES, TYPOGRAPHY, SPACING, LAYOUT } from './design-tokens';
import { SECTION_TEMPLATES, SECTION_ORDER } from './section-templates';
import { NINE_STEP_FORMULA, PIXEL_PRESETS } from './nine-step-formula';
import { GRADIENTS, SHADOWS, GLASS_EFFECTS, CATEGORY_EFFECTS } from './design-effects';
import { CATEGORY_TEMPLATES } from './category-templates';
import { PSYCHOLOGY_PRINCIPLES, TRUST_BADGES } from './persuasion-psychology';
import { COPY_FORMULAS, CATEGORY_TONES } from './copywriting-templates';
import { VALIDATION_RULES, QUICK_CHECKLIST } from './design-validator';
import { ALL_VARIANT_RULES } from './ab-variants';
import { PLATFORM_SPECS, DEVICE_SPECS } from './platform-specs';
import { COMPOSITION_RULES, PRODUCT_PHOTO_GUIDES } from './image-composition';
import { TRENDS_2025, MICRO_INTERACTIONS } from './modern-effects';
import { QUALITY_TIERS, TIER_EFFECT_MAP, TIER_SECTION_MAP } from './quality-tiers';

/**
 * 전체 디자인 시스템 설정
 * 모든 설정을 하나의 객체로 접근 가능
 */
export const DESIGN_SYSTEM = {
  // 기초 토큰
  tokens: {
    colors: COLOR_PALETTES,
    typography: TYPOGRAPHY,
    spacing: SPACING,
    layout: LAYOUT,
  },
  
  // 섹션 및 구조
  sections: {
    templates: SECTION_TEMPLATES,
    order: SECTION_ORDER,
    formula: NINE_STEP_FORMULA,
    presets: PIXEL_PRESETS,
  },
  
  // 효과
  effects: {
    gradients: GRADIENTS,
    shadows: SHADOWS,
    glass: GLASS_EFFECTS,
    byCategory: CATEGORY_EFFECTS,
    modern: TRENDS_2025,
    interactions: MICRO_INTERACTIONS,
  },
  
  // 카테고리별 설정
  categories: CATEGORY_TEMPLATES,
  
  // 설득 요소
  persuasion: {
    principles: PSYCHOLOGY_PRINCIPLES,
    badges: TRUST_BADGES,
    copyFormulas: COPY_FORMULAS,
    tones: CATEGORY_TONES,
  },
  
  // 검증
  validation: {
    rules: VALIDATION_RULES,
    checklist: QUICK_CHECKLIST,
  },
  
  // A/B 테스트
  abTest: {
    variants: ALL_VARIANT_RULES,
  },
  
  // 플랫폼
  platforms: {
    specs: PLATFORM_SPECS,
    devices: DEVICE_SPECS,
  },
  
  // 이미지
  imagery: {
    compositions: COMPOSITION_RULES,
    guides: PRODUCT_PHOTO_GUIDES,
  },
  
  // 품질 등급
  quality: {
    tiers: QUALITY_TIERS,
    effects: TIER_EFFECT_MAP,
    sections: TIER_SECTION_MAP,
  },
} as const;

// ===== 유틸리티 타입 =====
export type DesignSystemConfig = typeof DESIGN_SYSTEM;
export type CategoryKey = keyof typeof CATEGORY_TEMPLATES;
export type SectionType = keyof typeof SECTION_TEMPLATES;
export type QualityTierId = 'basic' | 'standard' | 'premium' | 'luxury';
export type PlatformId = keyof typeof PLATFORM_SPECS;

// ===== 빠른 접근 함수 =====

/**
 * 카테고리에 맞는 전체 설정 가져오기
 */
export function getConfigByCategory(category: string) {
  const template = CATEGORY_TEMPLATES[category as keyof typeof CATEGORY_TEMPLATES];
  const effects = CATEGORY_EFFECTS[category as keyof typeof CATEGORY_EFFECTS];
  const tone = CATEGORY_TONES[category as keyof typeof CATEGORY_TONES];
  const colors = COLOR_PALETTES[category as keyof typeof COLOR_PALETTES];
  const photoGuide = PRODUCT_PHOTO_GUIDES[category as keyof typeof PRODUCT_PHOTO_GUIDES];

  return {
    template,
    effects,
    tone,
    colors,
    photoGuide,
  };
}

/**
 * 품질 등급에 맞는 설정 가져오기
 */
export function getConfigByTier(tierId: QualityTierId) {
  const tier = QUALITY_TIERS.find(t => t.id === tierId);
  const effects = TIER_EFFECT_MAP[tierId];
  const sections = TIER_SECTION_MAP[tierId];

  return {
    tier,
    allowedEffects: effects,
    allowedSections: sections,
  };
}

/**
 * 플랫폼에 맞는 설정 가져오기
 */
export function getConfigByPlatform(platformId: string) {
  const spec = PLATFORM_SPECS[platformId as keyof typeof PLATFORM_SPECS];
  
  return {
    spec,
    imageWidth: spec?.imageSpecs.width,
    typography: spec?.typography,
    regulations: spec?.regulations,
  };
}

/**
 * 프롬프트 생성을 위한 종합 컨텍스트
 */
export function getPromptContext(options: {
  category: string;
  tier: QualityTierId;
  platform: string;
  pixelHeight: number;
}) {
  const categoryConfig = getConfigByCategory(options.category);
  const tierConfig = getConfigByTier(options.tier);
  const platformConfig = getConfigByPlatform(options.platform);
  
  // 픽셀 높이에 따른 섹션 수 결정
  const presetKey = options.pixelHeight as 4000 | 6000 | 8000 | 10000 | 12000;
  const preset = PIXEL_PRESETS[presetKey];
  
  return {
    category: categoryConfig,
    tier: tierConfig,
    platform: platformConfig,
    preset,
    formula: NINE_STEP_FORMULA,
    validation: {
      rules: VALIDATION_RULES,
      checklist: QUICK_CHECKLIST,
    },
  };
}
