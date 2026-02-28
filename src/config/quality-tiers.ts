/**
 * Quality Tiers - 가격대별 품질 기준
 * 외주 가격에 따른 디자인 품질 차등화
 */

// ===== 품질 등급 정의 =====
export interface QualityTier {
  id: string;
  name: string;
  nameKo: string;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  deliveryDays: number;
  
  // 포함 요소
  includes: {
    sections: number;
    revisions: number;
    imagePrompts: number;
    variations: number;
    platforms: string[];
    effects: string[];
    copywriting: boolean;
    psychology: boolean;
    abVariants: boolean;
    responsive: boolean;
  };

  // 품질 지표
  qualityMetrics: {
    designDepth: 'basic' | 'standard' | 'premium' | 'luxury';
    typography: 'basic' | 'refined' | 'custom';
    effects: 'minimal' | 'moderate' | 'rich';
    imagery: 'stock' | 'enhanced' | 'custom-generated';
    copyTone: 'generic' | 'tailored' | 'brand-specific';
  };

  // 특징
  features: string[];
  
  // 적합한 고객
  bestFor: string[];
}

export const QUALITY_TIERS: QualityTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    nameKo: '베이직',
    priceRange: { min: 30000, max: 80000, currency: 'KRW' },
    description: '기본적인 상세페이지, 빠른 납품이 필요한 경우',
    deliveryDays: 1,
    
    includes: {
      sections: 5,
      revisions: 1,
      imagePrompts: 3,
      variations: 0,
      platforms: ['coupang'],
      effects: ['basic-shadow'],
      copywriting: false,
      psychology: false,
      abVariants: false,
      responsive: false,
    },

    qualityMetrics: {
      designDepth: 'basic',
      typography: 'basic',
      effects: 'minimal',
      imagery: 'stock',
      copyTone: 'generic',
    },

    features: [
      '5개 기본 섹션 (Hero, Features, Benefits, Specs, CTA)',
      '기본 레이아웃',
      '단일 플랫폼 최적화',
      '기본 타이포그래피',
      '심플 그림자 효과',
    ],
    
    bestFor: [
      '테스트 상품',
      '저가 상품',
      '빠른 런칭 필요',
      '예산 제한',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    nameKo: '스탠다드',
    priceRange: { min: 100000, max: 200000, currency: 'KRW' },
    description: '균형 잡힌 품질과 가격, 대부분의 상품에 적합',
    deliveryDays: 3,
    
    includes: {
      sections: 8,
      revisions: 2,
      imagePrompts: 6,
      variations: 1,
      platforms: ['coupang', 'naver'],
      effects: ['shadow', 'gradient', 'basic-glass'],
      copywriting: true,
      psychology: false,
      abVariants: false,
      responsive: true,
    },

    qualityMetrics: {
      designDepth: 'standard',
      typography: 'refined',
      effects: 'moderate',
      imagery: 'enhanced',
      copyTone: 'tailored',
    },

    features: [
      '8개 섹션 (9단계 공식 기본 적용)',
      '카테고리 맞춤 스타일',
      '2개 플랫폼 최적화',
      '정제된 타이포그래피',
      '그라디언트 + 쉐도우 효과',
      '기본 카피라이팅 적용',
      '모바일 반응형',
    ],
    
    bestFor: [
      '일반 상품',
      '신규 런칭 상품',
      '중소 브랜드',
      '가성비 추구',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    nameKo: '프리미엄',
    priceRange: { min: 250000, max: 400000, currency: 'KRW' },
    description: '전문가 수준의 퀄리티, 전환율 최적화',
    deliveryDays: 5,
    
    includes: {
      sections: 12,
      revisions: 3,
      imagePrompts: 10,
      variations: 2,
      platforms: ['coupang', 'naver', 'gmarket', 'cafe24'],
      effects: ['shadow', 'gradient', 'glass', 'glow', 'modern'],
      copywriting: true,
      psychology: true,
      abVariants: true,
      responsive: true,
    },

    qualityMetrics: {
      designDepth: 'premium',
      typography: 'custom',
      effects: 'rich',
      imagery: 'custom-generated',
      copyTone: 'brand-specific',
    },

    features: [
      '12개+ 섹션 (9단계 공식 완전 적용)',
      '심리학 기반 설득 요소',
      '전문 카피라이팅',
      '4개 플랫폼 최적화',
      '고급 디자인 효과',
      '2개 A/B 변형본',
      '프리미엄 이미지 프롬프트',
      'PC/모바일 완벽 반응형',
      '긴급성/희소성 요소',
    ],
    
    bestFor: [
      '주력 상품',
      '프리미엄 브랜드',
      '전환율 중시',
      '마케팅 캠페인',
    ],
  },
  {
    id: 'luxury',
    name: 'Luxury',
    nameKo: '럭셔리',
    priceRange: { min: 500000, max: 1000000, currency: 'KRW' },
    description: '최고급 브랜드 수준, 완벽주의 클라이언트용',
    deliveryDays: 7,
    
    includes: {
      sections: 15,
      revisions: 5,
      imagePrompts: 15,
      variations: 4,
      platforms: ['coupang', 'naver', 'gmarket', '11st', 'cafe24', 'instagram'],
      effects: ['all'],
      copywriting: true,
      psychology: true,
      abVariants: true,
      responsive: true,
    },

    qualityMetrics: {
      designDepth: 'luxury',
      typography: 'custom',
      effects: 'rich',
      imagery: 'custom-generated',
      copyTone: 'brand-specific',
    },

    features: [
      '15개+ 섹션 (확장형 상세페이지)',
      '완벽한 9단계 공식 + 추가 섹션',
      '고급 심리학 설득 전략',
      '브랜드 전용 카피라이팅',
      '6개 플랫폼 완벽 최적화',
      '2025 트렌드 효과 전체 적용',
      '4개 A/B 변형본',
      '프리미엄 AI 이미지 생성',
      '마이크로인터랙션 적용',
      '품질 검증 리포트',
      '무제한 수정 (5회 기본)',
    ],
    
    bestFor: [
      '럭셔리 브랜드',
      '고가 상품 ($500+)',
      '브랜드 리뉴얼',
      '완벽주의 클라이언트',
    ],
  },
];

// ===== 등급별 효과 매핑 =====
export const TIER_EFFECT_MAP: Record<string, string[]> = {
  basic: ['soft-shadow'],
  standard: ['soft-shadow', 'elevated-shadow', 'gradient-subtle', 'glass-light'],
  premium: ['soft-shadow', 'elevated-shadow', 'floating-shadow', 'gradient-vibrant', 'glass-frosted', 'glow-effect', 'noise-texture'],
  luxury: ['all'], // 모든 효과 사용 가능
};

// ===== 등급별 섹션 타입 =====
export const TIER_SECTION_MAP: Record<string, string[]> = {
  basic: ['Hero', 'Features', 'Benefits', 'Specs', 'CTA'],
  standard: ['Hero', 'PainPoint', 'Solution', 'Features', 'Benefits', 'SocialProof', 'Specs', 'CTA'],
  premium: ['Hero', 'PainPoint', 'Solution', 'Features', 'Benefits', 'Process', 'SocialProof', 'Trust', 'Comparison', 'FAQ', 'Guarantee', 'CTA'],
  luxury: ['Hero', 'Brand', 'PainPoint', 'Solution', 'Features', 'Benefits', 'Process', 'Gallery', 'SocialProof', 'Trust', 'Comparison', 'FAQ', 'Guarantee', 'Urgency', 'CTA'],
};

// ===== 등급별 이미지 프롬프트 품질 =====
export interface ImagePromptQuality {
  tier: string;
  detailLevel: 'low' | 'medium' | 'high' | 'ultra';
  styleKeywords: string[];
  qualityKeywords: string[];
}

export const IMAGE_PROMPT_QUALITY: ImagePromptQuality[] = [
  {
    tier: 'basic',
    detailLevel: 'low',
    styleKeywords: ['clean', 'simple', 'white background'],
    qualityKeywords: ['product photography', 'well-lit'],
  },
  {
    tier: 'standard',
    detailLevel: 'medium',
    styleKeywords: ['professional', 'clean composition', 'studio lighting'],
    qualityKeywords: ['high quality', 'commercial photography', 'sharp focus'],
  },
  {
    tier: 'premium',
    detailLevel: 'high',
    styleKeywords: ['premium', 'artistic composition', 'dramatic lighting', 'lifestyle context'],
    qualityKeywords: ['8k quality', 'commercial grade', 'magazine worthy', 'professional retouching'],
  },
  {
    tier: 'luxury',
    detailLevel: 'ultra',
    styleKeywords: ['luxury brand aesthetic', 'cinematic', 'award-winning composition', 'editorial style'],
    qualityKeywords: ['ultra high definition', 'world-class photography', 'Hasselblad quality', 'post-production perfected'],
  },
];

// ===== 가격 계산기 =====
export interface PriceCalculation {
  baseTier: string;
  basePrice: number;
  additions: { name: string; price: number }[];
  totalPrice: number;
  estimatedDays: number;
}

export function calculatePrice(
  tierId: string,
  options: {
    extraSections?: number;
    extraRevisions?: number;
    extraPlatforms?: number;
    rushDelivery?: boolean;
    brandGuideline?: boolean;
  } = {}
): PriceCalculation {
  const tier = QUALITY_TIERS.find(t => t.id === tierId);
  if (!tier) throw new Error(`Unknown tier: ${tierId}`);

  const additions: { name: string; price: number }[] = [];
  let totalPrice = tier.priceRange.min;
  let estimatedDays = tier.deliveryDays;

  // 추가 섹션
  if (options.extraSections && options.extraSections > 0) {
    const sectionPrice = options.extraSections * 15000;
    additions.push({ name: `추가 섹션 x${options.extraSections}`, price: sectionPrice });
    totalPrice += sectionPrice;
  }

  // 추가 수정
  if (options.extraRevisions && options.extraRevisions > 0) {
    const revisionPrice = options.extraRevisions * 20000;
    additions.push({ name: `추가 수정 x${options.extraRevisions}`, price: revisionPrice });
    totalPrice += revisionPrice;
  }

  // 추가 플랫폼
  if (options.extraPlatforms && options.extraPlatforms > 0) {
    const platformPrice = options.extraPlatforms * 30000;
    additions.push({ name: `추가 플랫폼 x${options.extraPlatforms}`, price: platformPrice });
    totalPrice += platformPrice;
  }

  // 급행 배송
  if (options.rushDelivery) {
    const rushPrice = Math.round(totalPrice * 0.5);
    additions.push({ name: '급행 배송 (50%)', price: rushPrice });
    totalPrice += rushPrice;
    estimatedDays = Math.ceil(estimatedDays / 2);
  }

  // 브랜드 가이드라인 적용
  if (options.brandGuideline) {
    additions.push({ name: '브랜드 가이드라인 적용', price: 50000 });
    totalPrice += 50000;
  }

  return {
    baseTier: tier.nameKo,
    basePrice: tier.priceRange.min,
    additions,
    totalPrice,
    estimatedDays,
  };
}

// ===== 품질 점수 매핑 =====
export const QUALITY_SCORE_MAP: Record<string, number> = {
  basic: 60,
  standard: 75,
  premium: 90,
  luxury: 98,
};

// ===== 헬퍼 함수 =====
export function getTierById(id: string): QualityTier | undefined {
  return QUALITY_TIERS.find(t => t.id === id);
}

export function getTierByPrice(price: number): QualityTier | undefined {
  return QUALITY_TIERS.find(t => price >= t.priceRange.min && price <= t.priceRange.max);
}

export function getRecommendedTier(requirements: {
  sections: number;
  platforms: number;
  needsPsychology: boolean;
  needsAbTest: boolean;
}): QualityTier {
  if (requirements.needsAbTest || requirements.needsPsychology) {
    return requirements.sections > 12 
      ? QUALITY_TIERS.find(t => t.id === 'luxury')!
      : QUALITY_TIERS.find(t => t.id === 'premium')!;
  }
  
  if (requirements.sections > 8 || requirements.platforms > 2) {
    return QUALITY_TIERS.find(t => t.id === 'premium')!;
  }
  
  if (requirements.sections > 5 || requirements.platforms > 1) {
    return QUALITY_TIERS.find(t => t.id === 'standard')!;
  }
  
  return QUALITY_TIERS.find(t => t.id === 'basic')!;
}

export function getTierEffects(tierId: string): string[] {
  return TIER_EFFECT_MAP[tierId] || TIER_EFFECT_MAP.basic;
}

export function getTierSections(tierId: string): string[] {
  return TIER_SECTION_MAP[tierId] || TIER_SECTION_MAP.basic;
}

export function getImagePromptQuality(tierId: string): ImagePromptQuality | undefined {
  return IMAGE_PROMPT_QUALITY.find(q => q.tier === tierId);
}
