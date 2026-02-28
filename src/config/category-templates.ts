/**
 * Category Templates - 카테고리별 완전한 스타일 조합
 * 각 카테고리에 최적화된 디자인 시스템 프리셋
 */

import type { SectionType } from './section-templates';
import type { CategoryKey } from './design-tokens';

// ===== 카테고리 템플릿 인터페이스 =====
export interface CategoryTemplate {
  id: CategoryKey;
  name: string;
  description: string;

  // 색상 테마
  colorScheme: {
    mode: 'light' | 'dark' | 'mixed';
    primary: string;
    secondary: string;
    accent: string;
    backgroundStyle: 'solid' | 'gradient' | 'alternating';
  };

  // 타이포그래피 스타일
  typography: {
    headingStyle: 'bold' | 'light' | 'elegant' | 'playful';
    bodyStyle: 'clean' | 'warm' | 'technical';
    fontEmphasis: 'size' | 'weight' | 'color';
  };

  // 레이아웃 선호도
  layout: {
    density: 'spacious' | 'balanced' | 'compact';
    imageRatio: 'image-heavy' | 'balanced' | 'text-heavy';
    sectionAlternation: boolean;
  };

  // 섹션 순서 (9단계 공식 기반)
  sectionOrder: {
    compact: SectionType[]; // 4000px
    standard: SectionType[]; // 8000px
    detailed: SectionType[]; // 12000px+
  };

  // 효과 프리셋
  effects: {
    preferredGradients: string[];
    preferredShadows: string[];
    useGlass: boolean;
    animationIntensity: 'subtle' | 'moderate' | 'dynamic';
  };

  // 이미지 스타일
  imagery: {
    style: 'photorealistic' | 'lifestyle' | 'minimal' | 'artistic';
    colorTone: 'warm' | 'cool' | 'neutral' | 'vibrant';
    composition: string[];
  };

  // 카피라이팅 톤
  copyTone: {
    voice: 'professional' | 'friendly' | 'luxurious' | 'energetic' | 'trustworthy';
    urgencyLevel: 'low' | 'medium' | 'high';
    emotionalAppeal: string[];
  };

  // 특수 요소
  specialElements: string[];
}

// ===== 카테고리별 템플릿 정의 =====
export const CATEGORY_TEMPLATES: Record<CategoryKey, CategoryTemplate> = {
  ecommerce: {
    id: 'ecommerce',
    name: '이커머스',
    description: '구매 전환 극대화를 위한 상품 상세페이지',

    colorScheme: {
      mode: 'light',
      primary: '#FF6B35',
      secondary: '#1A1A2E',
      accent: '#FFD93D',
      backgroundStyle: 'alternating',
    },

    typography: {
      headingStyle: 'bold',
      bodyStyle: 'clean',
      fontEmphasis: 'size',
    },

    layout: {
      density: 'balanced',
      imageRatio: 'image-heavy',
      sectionAlternation: true,
    },

    sectionOrder: {
      compact: ['Hero', 'Features', 'Testimonials', 'CTA'],
      standard: ['Hero', 'TrustBadges', 'Features', 'Benefits', 'Gallery', 'Testimonials', 'CTA'],
      detailed: ['Hero', 'TrustBadges', 'Benefits', 'Features', 'DetailedProduct', 'Process', 'Gallery', 'Stats', 'Testimonials', 'FAQ', 'Urgency', 'CTA'],
    },

    effects: {
      preferredGradients: ['sunsetOrange', 'warmSunrise', 'subtleWarm'],
      preferredShadows: ['elevated', 'soft'],
      useGlass: false,
      animationIntensity: 'moderate',
    },

    imagery: {
      style: 'photorealistic',
      colorTone: 'warm',
      composition: ['제품 정면', '45도 앵글', '사용 장면', '디테일 클로즈업', '패키지'],
    },

    copyTone: {
      voice: 'friendly',
      urgencyLevel: 'high',
      emotionalAppeal: ['가성비', '품질', '만족감', '트렌드'],
    },

    specialElements: ['할인 배지', '재고 표시', '카운트다운', '별점', '구매 후기'],
  },

  realestate: {
    id: 'realestate',
    name: '부동산',
    description: '고급스러움과 투자 가치를 강조하는 매물 소개',

    colorScheme: {
      mode: 'light',
      primary: '#1E3A5F',
      secondary: '#C9A962',
      accent: '#2E5A3C',
      backgroundStyle: 'gradient',
    },

    typography: {
      headingStyle: 'elegant',
      bodyStyle: 'clean',
      fontEmphasis: 'weight',
    },

    layout: {
      density: 'spacious',
      imageRatio: 'image-heavy',
      sectionAlternation: true,
    },

    sectionOrder: {
      compact: ['Hero', 'Features', 'Gallery', 'CTA'],
      standard: ['Hero', 'Stats', 'Features', 'Gallery', 'Benefits', 'Contact', 'CTA'],
      detailed: ['Hero', 'TrustBadges', 'Stats', 'Features', 'Gallery', 'Benefits', 'Process', 'Timeline', 'FAQ', 'Contact', 'CTA'],
    },

    effects: {
      preferredGradients: ['premiumGold', 'coolSlate', 'subtleGray'],
      preferredShadows: ['floating', 'elevated'],
      useGlass: true,
      animationIntensity: 'subtle',
    },

    imagery: {
      style: 'photorealistic',
      colorTone: 'neutral',
      composition: ['외관 전경', '거실', '주방', '침실', '전망', '편의시설'],
    },

    copyTone: {
      voice: 'luxurious',
      urgencyLevel: 'medium',
      emotionalAppeal: ['투자 가치', '프리미엄', '희소성', '생활의 질'],
    },

    specialElements: ['평형 정보', '층/향', '가격 정보', '지도', '교통 정보'],
  },

  medical: {
    id: 'medical',
    name: '병원/의료',
    description: '전문성과 신뢰를 전달하는 의료기관 소개',

    colorScheme: {
      mode: 'light',
      primary: '#0077B6',
      secondary: '#00B4D8',
      accent: '#90E0EF',
      backgroundStyle: 'solid',
    },

    typography: {
      headingStyle: 'bold',
      bodyStyle: 'clean',
      fontEmphasis: 'color',
    },

    layout: {
      density: 'balanced',
      imageRatio: 'balanced',
      sectionAlternation: true,
    },

    sectionOrder: {
      compact: ['Hero', 'Features', 'Team', 'CTA'],
      standard: ['Hero', 'TrustBadges', 'Features', 'Process', 'Team', 'Testimonials', 'CTA'],
      detailed: ['Hero', 'TrustBadges', 'Stats', 'Features', 'Process', 'Team', 'Gallery', 'Testimonials', 'FAQ', 'Contact', 'CTA'],
    },

    effects: {
      preferredGradients: ['oceanBlue', 'mintFresh', 'subtleCool'],
      preferredShadows: ['soft', 'md'],
      useGlass: false,
      animationIntensity: 'subtle',
    },

    imagery: {
      style: 'photorealistic',
      colorTone: 'cool',
      composition: ['병원 외관', '진료실', '의료진', '장비', '상담 장면'],
    },

    copyTone: {
      voice: 'trustworthy',
      urgencyLevel: 'low',
      emotionalAppeal: ['전문성', '안전', '첨단', '케어'],
    },

    specialElements: ['의료진 프로필', '인증/수상', '진료 시간', '예약 버튼'],
  },

  education: {
    id: 'education',
    name: '학원/교육',
    description: '성공 스토리와 차별화된 교육 방법 강조',

    colorScheme: {
      mode: 'light',
      primary: '#5E60CE',
      secondary: '#48BFE3',
      accent: '#72EFDD',
      backgroundStyle: 'alternating',
    },

    typography: {
      headingStyle: 'bold',
      bodyStyle: 'clean',
      fontEmphasis: 'size',
    },

    layout: {
      density: 'balanced',
      imageRatio: 'balanced',
      sectionAlternation: true,
    },

    sectionOrder: {
      compact: ['Hero', 'Features', 'Testimonials', 'CTA'],
      standard: ['Hero', 'Stats', 'Features', 'Process', 'Testimonials', 'Pricing', 'CTA'],
      detailed: ['Hero', 'TrustBadges', 'Stats', 'Benefits', 'Features', 'Process', 'Team', 'Testimonials', 'Pricing', 'FAQ', 'CTA'],
    },

    effects: {
      preferredGradients: ['purpleHaze', 'oceanBlue', 'subtleCool'],
      preferredShadows: ['elevated', 'glowPrimary'],
      useGlass: true,
      animationIntensity: 'moderate',
    },

    imagery: {
      style: 'lifestyle',
      colorTone: 'vibrant',
      composition: ['수업 장면', '학습 공간', '강사', '성과물', '단체 사진'],
    },

    copyTone: {
      voice: 'energetic',
      urgencyLevel: 'medium',
      emotionalAppeal: ['성공', '성장', '변화', '가능성'],
    },

    specialElements: ['합격률/성적 향상', '수강생 후기', '커리큘럼', '수강료'],
  },

  restaurant: {
    id: 'restaurant',
    name: '음식점/카페',
    description: '식욕을 자극하는 비주얼 중심 메뉴판',

    colorScheme: {
      mode: 'mixed',
      primary: '#D62828',
      secondary: '#F77F00',
      accent: '#FCBF49',
      backgroundStyle: 'gradient',
    },

    typography: {
      headingStyle: 'elegant',
      bodyStyle: 'warm',
      fontEmphasis: 'weight',
    },

    layout: {
      density: 'spacious',
      imageRatio: 'image-heavy',
      sectionAlternation: false,
    },

    sectionOrder: {
      compact: ['Hero', 'Gallery', 'Features', 'CTA'],
      standard: ['Hero', 'Gallery', 'Features', 'Process', 'Testimonials', 'Contact', 'CTA'],
      detailed: ['Hero', 'Gallery', 'Features', 'Benefits', 'Process', 'Team', 'Testimonials', 'FAQ', 'Contact', 'CTA'],
    },

    effects: {
      preferredGradients: ['warmSunrise', 'sunsetOrange', 'subtleWarm'],
      preferredShadows: ['floating', 'glowWarning'],
      useGlass: true,
      animationIntensity: 'moderate',
    },

    imagery: {
      style: 'artistic',
      colorTone: 'warm',
      composition: ['음식 클로즈업', '플레이팅', '매장 분위기', '셰프', '재료'],
    },

    copyTone: {
      voice: 'friendly',
      urgencyLevel: 'low',
      emotionalAppeal: ['맛', '분위기', '특별함', '신선함'],
    },

    specialElements: ['메뉴 가격', '영업 시간', '예약 버튼', '위치 지도'],
  },

  travel: {
    id: 'travel',
    name: '여행/숙박',
    description: '떠나고 싶게 만드는 감성 여행 상품',

    colorScheme: {
      mode: 'light',
      primary: '#00B4D8',
      secondary: '#0077B6',
      accent: '#FF9F1C',
      backgroundStyle: 'gradient',
    },

    typography: {
      headingStyle: 'light',
      bodyStyle: 'warm',
      fontEmphasis: 'size',
    },

    layout: {
      density: 'spacious',
      imageRatio: 'image-heavy',
      sectionAlternation: true,
    },

    sectionOrder: {
      compact: ['Hero', 'Gallery', 'Features', 'CTA'],
      standard: ['Hero', 'Gallery', 'Features', 'Process', 'Benefits', 'Testimonials', 'CTA'],
      detailed: ['Hero', 'Gallery', 'Features', 'Process', 'Benefits', 'Timeline', 'Testimonials', 'FAQ', 'Pricing', 'CTA'],
    },

    effects: {
      preferredGradients: ['oceanBlue', 'mintFresh', 'sunsetOrange'],
      preferredShadows: ['floating', 'elevated'],
      useGlass: true,
      animationIntensity: 'dynamic',
    },

    imagery: {
      style: 'lifestyle',
      colorTone: 'vibrant',
      composition: ['풍경', '숙소 외관', '객실', '액티비티', '음식', '현지 문화'],
    },

    copyTone: {
      voice: 'friendly',
      urgencyLevel: 'medium',
      emotionalAppeal: ['힐링', '모험', '추억', '특별한 경험'],
    },

    specialElements: ['일정표', '포함/불포함', '가격', '예약 버튼'],
  },

  wedding: {
    id: 'wedding',
    name: '웨딩/이벤트',
    description: '특별한 순간을 위한 우아한 초대장',

    colorScheme: {
      mode: 'light',
      primary: '#C9A962',
      secondary: '#8B7355',
      accent: '#F2E8CF',
      backgroundStyle: 'gradient',
    },

    typography: {
      headingStyle: 'elegant',
      bodyStyle: 'warm',
      fontEmphasis: 'weight',
    },

    layout: {
      density: 'spacious',
      imageRatio: 'image-heavy',
      sectionAlternation: false,
    },

    sectionOrder: {
      compact: ['Hero', 'Gallery', 'Process', 'CTA'],
      standard: ['Hero', 'About', 'Gallery', 'Timeline', 'Process', 'Contact', 'CTA'],
      detailed: ['Hero', 'About', 'Gallery', 'Timeline', 'Process', 'Team', 'Testimonials', 'FAQ', 'Contact', 'CTA'],
    },

    effects: {
      preferredGradients: ['premiumGold', 'subtleWarm', 'subtleGray'],
      preferredShadows: ['soft', 'elevated'],
      useGlass: true,
      animationIntensity: 'subtle',
    },

    imagery: {
      style: 'artistic',
      colorTone: 'warm',
      composition: ['웨딩 홀', '드레스/턱시도', '장식', '케이크', '부케'],
    },

    copyTone: {
      voice: 'luxurious',
      urgencyLevel: 'low',
      emotionalAppeal: ['사랑', '행복', '특별함', '영원'],
    },

    specialElements: ['일시/장소', 'RSVP', '지도', '갤러리'],
  },

  legal: {
    id: 'legal',
    name: '법률/세무',
    description: '전문가의 권위를 드러내는 프로필',

    colorScheme: {
      mode: 'light',
      primary: '#1A1A2E',
      secondary: '#4A4E69',
      accent: '#C9A962',
      backgroundStyle: 'solid',
    },

    typography: {
      headingStyle: 'bold',
      bodyStyle: 'clean',
      fontEmphasis: 'weight',
    },

    layout: {
      density: 'balanced',
      imageRatio: 'text-heavy',
      sectionAlternation: true,
    },

    sectionOrder: {
      compact: ['Hero', 'Features', 'Team', 'CTA'],
      standard: ['Hero', 'TrustBadges', 'Features', 'Process', 'Team', 'FAQ', 'CTA'],
      detailed: ['Hero', 'TrustBadges', 'Stats', 'Features', 'Process', 'Team', 'Testimonials', 'FAQ', 'Contact', 'CTA'],
    },

    effects: {
      preferredGradients: ['coolSlate', 'midnightDark', 'subtleGray'],
      preferredShadows: ['md', 'lg'],
      useGlass: false,
      animationIntensity: 'subtle',
    },

    imagery: {
      style: 'photorealistic',
      colorTone: 'neutral',
      composition: ['사무실', '회의 장면', '전문가 프로필', '자격증'],
    },

    copyTone: {
      voice: 'professional',
      urgencyLevel: 'low',
      emotionalAppeal: ['신뢰', '전문성', '경험', '성공 사례'],
    },

    specialElements: ['전문 분야', '경력/자격', '상담 예약', '성공 사례'],
  },

  fitness: {
    id: 'fitness',
    name: '피트니스/요가',
    description: '에너지 넘치는 운동 프로그램 소개',

    colorScheme: {
      mode: 'dark',
      primary: '#FF006E',
      secondary: '#8338EC',
      accent: '#FFBE0B',
      backgroundStyle: 'gradient',
    },

    typography: {
      headingStyle: 'bold',
      bodyStyle: 'clean',
      fontEmphasis: 'size',
    },

    layout: {
      density: 'balanced',
      imageRatio: 'image-heavy',
      sectionAlternation: true,
    },

    sectionOrder: {
      compact: ['Hero', 'Features', 'Testimonials', 'CTA'],
      standard: ['Hero', 'Stats', 'Features', 'Process', 'Team', 'Pricing', 'CTA'],
      detailed: ['Hero', 'TrustBadges', 'Stats', 'Benefits', 'Features', 'Process', 'Team', 'Testimonials', 'Pricing', 'FAQ', 'CTA'],
    },

    effects: {
      preferredGradients: ['purpleHaze', 'sunsetOrange', 'midnightDark'],
      preferredShadows: ['glowDanger', 'glowPrimary'],
      useGlass: true,
      animationIntensity: 'dynamic',
    },

    imagery: {
      style: 'lifestyle',
      colorTone: 'vibrant',
      composition: ['운동 장면', '시설', '트레이너', 'Before/After', '그룹 수업'],
    },

    copyTone: {
      voice: 'energetic',
      urgencyLevel: 'high',
      emotionalAppeal: ['변화', '도전', '성취', '에너지'],
    },

    specialElements: ['프로그램 가격', 'Before/After', '트레이너 프로필', '시설 투어'],
  },

  saas: {
    id: 'saas',
    name: '스타트업/SaaS',
    description: '기능을 명쾌하게 전달하는 제품 소개',

    colorScheme: {
      mode: 'light',
      primary: '#6366F1',
      secondary: '#8B5CF6',
      accent: '#06B6D4',
      backgroundStyle: 'gradient',
    },

    typography: {
      headingStyle: 'bold',
      bodyStyle: 'technical',
      fontEmphasis: 'size',
    },

    layout: {
      density: 'balanced',
      imageRatio: 'balanced',
      sectionAlternation: true,
    },

    sectionOrder: {
      compact: ['Hero', 'Features', 'Pricing', 'CTA'],
      standard: ['Hero', 'TrustBadges', 'Features', 'Benefits', 'Pricing', 'Testimonials', 'CTA'],
      detailed: ['Hero', 'TrustBadges', 'Stats', 'Features', 'Benefits', 'Process', 'Comparison', 'Pricing', 'Testimonials', 'FAQ', 'CTA'],
    },

    effects: {
      preferredGradients: ['purpleHaze', 'oceanBlue', 'subtleCool'],
      preferredShadows: ['elevated', 'glowPrimary'],
      useGlass: true,
      animationIntensity: 'moderate',
    },

    imagery: {
      style: 'minimal',
      colorTone: 'cool',
      composition: ['대시보드 스크린샷', '기능 UI', '모바일 앱', '팀 협업 장면'],
    },

    copyTone: {
      voice: 'professional',
      urgencyLevel: 'medium',
      emotionalAppeal: ['효율', '생산성', '혁신', '성장'],
    },

    specialElements: ['기능 비교표', '요금제', '데모 버튼', '통합 로고'],
  },

  personal: {
    id: 'personal',
    name: '개인 브랜딩',
    description: '전문성이 돋보이는 퍼스널 포트폴리오',

    colorScheme: {
      mode: 'light',
      primary: '#1A1A1A',
      secondary: '#4A4A4A',
      accent: '#FF4D4D',
      backgroundStyle: 'solid',
    },

    typography: {
      headingStyle: 'light',
      bodyStyle: 'clean',
      fontEmphasis: 'weight',
    },

    layout: {
      density: 'spacious',
      imageRatio: 'balanced',
      sectionAlternation: false,
    },

    sectionOrder: {
      compact: ['Hero', 'Portfolio', 'Features', 'CTA'],
      standard: ['Hero', 'About', 'Portfolio', 'Features', 'Testimonials', 'Contact', 'CTA'],
      detailed: ['Hero', 'About', 'Stats', 'Portfolio', 'Features', 'Process', 'Testimonials', 'FAQ', 'Contact', 'CTA'],
    },

    effects: {
      preferredGradients: ['coolSlate', 'subtleGray', 'midnightDark'],
      preferredShadows: ['soft', 'lg'],
      useGlass: false,
      animationIntensity: 'subtle',
    },

    imagery: {
      style: 'minimal',
      colorTone: 'neutral',
      composition: ['프로필 사진', '작업물', '작업 과정', '수상/인증'],
    },

    copyTone: {
      voice: 'professional',
      urgencyLevel: 'low',
      emotionalAppeal: ['전문성', '개성', '신뢰', '경험'],
    },

    specialElements: ['포트폴리오 그리드', '스킬 차트', 'SNS 링크', '이력'],
  },
};

// ===== 헬퍼 함수 =====
export function getCategoryTemplate(category: string): CategoryTemplate {
  return CATEGORY_TEMPLATES[category as CategoryKey] || CATEGORY_TEMPLATES.ecommerce;
}

export function getSectionOrderByTier(
  category: string,
  tier: 'compact' | 'standard' | 'detailed'
): SectionType[] {
  const template = getCategoryTemplate(category);
  return template.sectionOrder[tier];
}

export function getCategoryColorScheme(category: string) {
  return getCategoryTemplate(category).colorScheme;
}

export function getCategoryCopyTone(category: string) {
  return getCategoryTemplate(category).copyTone;
}

export function getCategoryImagery(category: string) {
  return getCategoryTemplate(category).imagery;
}
