/**
 * Platform Specs - 플랫폼별 규격 및 가이드라인
 * 쿠팡, 네이버, 자사몰 등 다양한 플랫폼 최적화
 */

// ===== 플랫폼 정의 =====
export interface PlatformSpec {
  id: string;
  name: string;
  description: string;
  
  // 이미지 규격
  imageSpecs: {
    width: number;
    maxHeight: number;
    format: string[];
    maxFileSize: number; // bytes
    aspectRatio?: string;
  };

  // 타이포그래피
  typography: {
    minFontSize: number;
    recommendedFontSize: number;
    fontFamily: string[];
  };

  // 콘텐츠 가이드
  content: {
    maxTitleLength: number;
    maxDescriptionLength: number;
    forbiddenWords: string[];
    requiredSections: string[];
  };

  // 특수 규정
  regulations: string[];

  // 최적화 팁
  optimizationTips: string[];
}

export const PLATFORM_SPECS: Record<string, PlatformSpec> = {
  coupang: {
    id: 'coupang',
    name: '쿠팡',
    description: '대한민국 최대 이커머스 플랫폼',
    
    imageSpecs: {
      width: 860,
      maxHeight: 40000,
      format: ['jpg', 'png', 'gif'],
      maxFileSize: 10 * 1024 * 1024, // 10MB
    },

    typography: {
      minFontSize: 18,
      recommendedFontSize: 24,
      fontFamily: ['Malgun Gothic', 'Apple SD Gothic Neo', 'sans-serif'],
    },

    content: {
      maxTitleLength: 100,
      maxDescriptionLength: 5000,
      forbiddenWords: ['1등', '최고', '최저가', '무조건', '100%'],
      requiredSections: ['제품 이미지', '상세 설명', '배송/반품 안내'],
    },

    regulations: [
      '과대광고 금지 (공정거래위원회 기준)',
      '원산지 표기 필수',
      '제조일/유통기한 필수 (식품)',
      '인증마크 필수 (해당 시)',
      '모델 사진 사용 시 초상권 확보',
    ],

    optimizationTips: [
      '상단 500px 내 핵심 정보 배치',
      '모바일 비율 85% - 모바일 우선 디자인',
      '로켓배송 뱃지 활용',
      '키워드 검색 최적화 (타이틀)',
      'GIF 사용 시 첫 프레임 중요',
    ],
  },

  naver: {
    id: 'naver',
    name: '네이버 스마트스토어',
    description: '네이버 쇼핑 연동 스토어',
    
    imageSpecs: {
      width: 860,
      maxHeight: 50000,
      format: ['jpg', 'png', 'gif'],
      maxFileSize: 20 * 1024 * 1024, // 20MB
    },

    typography: {
      minFontSize: 16,
      recommendedFontSize: 22,
      fontFamily: ['Nanum Gothic', 'Malgun Gothic', 'sans-serif'],
    },

    content: {
      maxTitleLength: 100,
      maxDescriptionLength: 10000,
      forbiddenWords: ['최저가', '무조건', '100% 보장'],
      requiredSections: ['제품 이미지', '상세 설명', 'Q&A'],
    },

    regulations: [
      '과대광고 금지',
      '원산지 표시 의무',
      '네이버 정책 준수',
      '비교 광고 주의',
    ],

    optimizationTips: [
      '네이버 검색 SEO 최적화',
      '쇼핑 검색광고 연동 고려',
      '리뷰/별점 시스템 활용',
      '네이버 페이 강조',
      '톡톡 문의 유도',
    ],
  },

  gmarket: {
    id: 'gmarket',
    name: 'G마켓/옥션',
    description: 'eBay Korea 오픈마켓',
    
    imageSpecs: {
      width: 860,
      maxHeight: 30000,
      format: ['jpg', 'png'],
      maxFileSize: 5 * 1024 * 1024, // 5MB
    },

    typography: {
      minFontSize: 16,
      recommendedFontSize: 20,
      fontFamily: ['Malgun Gothic', 'Apple SD Gothic Neo', 'sans-serif'],
    },

    content: {
      maxTitleLength: 100,
      maxDescriptionLength: 5000,
      forbiddenWords: ['1위', '최저가', '무조건', '당일배송 보장'],
      requiredSections: ['제품 이미지', '상세 설명', '교환/반품'],
    },

    regulations: [
      '광고 규정 준수',
      '가격 비교 광고 주의',
      'G마켓 정책 준수',
    ],

    optimizationTips: [
      '슈퍼딜/타임세일 참여',
      '스마일클럽 혜택 강조',
      '카드 할인 정보 표시',
    ],
  },

  elevenst: {
    id: 'elevenst',
    name: '11번가',
    description: 'SK 오픈마켓',
    
    imageSpecs: {
      width: 860,
      maxHeight: 35000,
      format: ['jpg', 'png', 'gif'],
      maxFileSize: 10 * 1024 * 1024, // 10MB
    },

    typography: {
      minFontSize: 16,
      recommendedFontSize: 22,
      fontFamily: ['Malgun Gothic', 'Apple SD Gothic Neo', 'sans-serif'],
    },

    content: {
      maxTitleLength: 100,
      maxDescriptionLength: 5000,
      forbiddenWords: ['1위', '최저가', '무조건'],
      requiredSections: ['제품 이미지', '상세 설명', '배송/반품'],
    },

    regulations: [
      '광고 규정 준수',
      '11번가 정책 준수',
    ],

    optimizationTips: [
      '오늘발송 뱃지 활용',
      '아마존 직구 연계 시 영문 설명 추가',
      'T멤버십 혜택 강조',
    ],
  },

  cafe24: {
    id: 'cafe24',
    name: '카페24 자사몰',
    description: '자체 쇼핑몰 솔루션',
    
    imageSpecs: {
      width: 1200,
      maxHeight: 100000, // 사실상 무제한
      format: ['jpg', 'png', 'gif', 'webp'],
      maxFileSize: 50 * 1024 * 1024, // 50MB
    },

    typography: {
      minFontSize: 14,
      recommendedFontSize: 18,
      fontFamily: ['Pretendard', 'Noto Sans KR', 'sans-serif'],
    },

    content: {
      maxTitleLength: 200,
      maxDescriptionLength: 50000,
      forbiddenWords: [],
      requiredSections: [],
    },

    regulations: [
      '자체 운영 정책',
      '결제 대행사 정책 준수',
      '광고법 준수',
    ],

    optimizationTips: [
      '브랜드 아이덴티티 강조',
      '자체 배송/CS 정책 명시',
      'SEO 최적화 (자체 도메인)',
      '반응형 디자인 필수',
      '로딩 속도 최적화',
    ],
  },

  instagram: {
    id: 'instagram',
    name: '인스타그램 쇼핑',
    description: 'SNS 기반 소셜 커머스',
    
    imageSpecs: {
      width: 1080,
      maxHeight: 1350,
      format: ['jpg', 'png'],
      maxFileSize: 8 * 1024 * 1024, // 8MB
      aspectRatio: '4:5',
    },

    typography: {
      minFontSize: 24,
      recommendedFontSize: 32,
      fontFamily: ['SF Pro Display', 'Apple SD Gothic Neo', 'sans-serif'],
    },

    content: {
      maxTitleLength: 30,
      maxDescriptionLength: 2200,
      forbiddenWords: [],
      requiredSections: [],
    },

    regulations: [
      '인스타그램 커뮤니티 가이드라인',
      '상업적 콘텐츠 태그 필요',
    ],

    optimizationTips: [
      '정사각형 또는 4:5 비율',
      '텍스트 최소화 (이미지 중심)',
      '밝고 선명한 색상',
      '해시태그 전략',
      '스토리/릴스 연계',
    ],
  },
};

// ===== 디바이스별 규격 =====
export interface DeviceSpec {
  id: string;
  name: string;
  width: number;
  pixelRatio: number;
  typography: {
    scale: number;
    minTouchTarget: number;
  };
}

export const DEVICE_SPECS: Record<string, DeviceSpec> = {
  mobile: {
    id: 'mobile',
    name: '모바일',
    width: 375,
    pixelRatio: 2,
    typography: {
      scale: 0.9,
      minTouchTarget: 44,
    },
  },
  tablet: {
    id: 'tablet',
    name: '태블릿',
    width: 768,
    pixelRatio: 2,
    typography: {
      scale: 1.0,
      minTouchTarget: 44,
    },
  },
  desktop: {
    id: 'desktop',
    name: '데스크탑',
    width: 1440,
    pixelRatio: 1,
    typography: {
      scale: 1.0,
      minTouchTarget: 32,
    },
  },
};

// ===== 반응형 변환 규칙 =====
export interface ResponsiveRule {
  property: string;
  mobile: string | number;
  tablet: string | number;
  desktop: string | number;
}

export const RESPONSIVE_RULES: ResponsiveRule[] = [
  {
    property: 'containerPadding',
    mobile: 16,
    tablet: 32,
    desktop: 64,
  },
  {
    property: 'sectionPaddingY',
    mobile: 48,
    tablet: 64,
    desktop: 80,
  },
  {
    property: 'gridColumns',
    mobile: 1,
    tablet: 2,
    desktop: 3,
  },
  {
    property: 'headingScale',
    mobile: 0.75,
    tablet: 0.9,
    desktop: 1.0,
  },
  {
    property: 'imageLayout',
    mobile: 'stacked',
    tablet: 'side-by-side',
    desktop: 'side-by-side',
  },
  {
    property: 'buttonWidth',
    mobile: 'full',
    tablet: 'auto',
    desktop: 'auto',
  },
];

// ===== 플랫폼별 추천 설정 =====
export interface PlatformPreset {
  platformId: string;
  recommendedWidth: number;
  recommendedFonts: string[];
  colorConsiderations: string;
  specialFeatures: string[];
}

export const PLATFORM_PRESETS: Record<string, PlatformPreset> = {
  coupang: {
    platformId: 'coupang',
    recommendedWidth: 860,
    recommendedFonts: ['Malgun Gothic'],
    colorConsiderations: '로켓배송 빨간색과 조화',
    specialFeatures: ['로켓배송 뱃지', '오늘도착 표시', '와우회원 가격'],
  },
  naver: {
    platformId: 'naver',
    recommendedWidth: 860,
    recommendedFonts: ['Nanum Gothic'],
    colorConsiderations: '네이버 그린과 조화',
    specialFeatures: ['네이버페이', '톡톡상담', 'N포인트'],
  },
  gmarket: {
    platformId: 'gmarket',
    recommendedWidth: 860,
    recommendedFonts: ['Malgun Gothic'],
    colorConsiderations: '옐로우/레드 브랜드컬러 고려',
    specialFeatures: ['스마일배송', 'G마켓 할인'],
  },
  cafe24: {
    platformId: 'cafe24',
    recommendedWidth: 1200,
    recommendedFonts: ['Pretendard', 'Noto Sans KR'],
    colorConsiderations: '브랜드 자유 적용',
    specialFeatures: ['자체 배송', '멤버십', '포인트'],
  },
};

// ===== 헬퍼 함수 =====
export function getPlatformSpec(platformId: string): PlatformSpec {
  return PLATFORM_SPECS[platformId] || PLATFORM_SPECS.cafe24;
}

export function getDeviceSpec(deviceId: string): DeviceSpec {
  return DEVICE_SPECS[deviceId] || DEVICE_SPECS.desktop;
}

export function getPlatformPreset(platformId: string): PlatformPreset {
  return PLATFORM_PRESETS[platformId] || PLATFORM_PRESETS.cafe24;
}

export function validateImageForPlatform(
  imageWidth: number,
  imageHeight: number,
  fileSize: number,
  platformId: string
): { valid: boolean; errors: string[] } {
  const spec = getPlatformSpec(platformId);
  const errors: string[] = [];

  if (imageWidth !== spec.imageSpecs.width) {
    errors.push(`이미지 너비는 ${spec.imageSpecs.width}px이어야 합니다.`);
  }

  if (imageHeight > spec.imageSpecs.maxHeight) {
    errors.push(`이미지 높이는 ${spec.imageSpecs.maxHeight}px를 초과할 수 없습니다.`);
  }

  if (fileSize > spec.imageSpecs.maxFileSize) {
    const maxSizeMB = spec.imageSpecs.maxFileSize / (1024 * 1024);
    errors.push(`파일 크기는 ${maxSizeMB}MB를 초과할 수 없습니다.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function getResponsiveValue(
  property: string,
  device: 'mobile' | 'tablet' | 'desktop'
): string | number | undefined {
  const rule = RESPONSIVE_RULES.find(r => r.property === property);
  if (!rule) return undefined;
  return rule[device];
}
