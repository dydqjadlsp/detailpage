/**
 * 템플릿 기반 상세페이지 조립기
 * AI 의존 없이 코드로 레이아웃 확정, 콘텐츠만 외부 주입
 */

import type { FigmaCommand, FigmaGenerateResponse } from '../types';
import { buildHeroSection } from './hero';
import { buildFeaturesSection } from './features';
import { buildGallerySection } from './gallery';
import { buildCtaSection } from './cta';

interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface ColorScheme {
  primary: RgbaColor;
  background: RgbaColor;
  backgroundAlt: RgbaColor;
  cardBackground: RgbaColor;
  textWhite: RgbaColor;
  textMuted: RgbaColor;
}

interface AssembleConfig {
  category: string;
  canvasWidth: number;
  inputData?: Record<string, unknown>;
}

// 카테고리별 색상 팔레트
const COLOR_SCHEMES: Record<string, ColorScheme> = {
  ecommerce: {
    primary: { r: 0.44, g: 0.36, b: 0.96, a: 1 },      // 보라색
    background: { r: 0.06, g: 0.06, b: 0.09, a: 1 },     // 진한 배경
    backgroundAlt: { r: 0.08, g: 0.08, b: 0.12, a: 1 },  // 약간 밝은 배경
    cardBackground: { r: 0.1, g: 0.1, b: 0.14, a: 1 },
    textWhite: { r: 0.96, g: 0.96, b: 0.98, a: 1 },
    textMuted: { r: 0.6, g: 0.6, b: 0.66, a: 1 },
  },
  restaurant: {
    primary: { r: 0.92, g: 0.34, b: 0.2, a: 1 },         // 오렌지 레드
    background: { r: 0.07, g: 0.05, b: 0.04, a: 1 },
    backgroundAlt: { r: 0.1, g: 0.07, b: 0.05, a: 1 },
    cardBackground: { r: 0.12, g: 0.09, b: 0.07, a: 1 },
    textWhite: { r: 0.98, g: 0.95, b: 0.92, a: 1 },
    textMuted: { r: 0.65, g: 0.58, b: 0.52, a: 1 },
  },
  realestate: {
    primary: { r: 0.14, g: 0.55, b: 0.83, a: 1 },        // 블루
    background: { r: 0.04, g: 0.06, b: 0.09, a: 1 },
    backgroundAlt: { r: 0.06, g: 0.08, b: 0.12, a: 1 },
    cardBackground: { r: 0.08, g: 0.1, b: 0.14, a: 1 },
    textWhite: { r: 0.94, g: 0.96, b: 0.98, a: 1 },
    textMuted: { r: 0.55, g: 0.6, b: 0.68, a: 1 },
  },
  medical: {
    primary: { r: 0.12, g: 0.72, b: 0.56, a: 1 },        // 그린
    background: { r: 0.04, g: 0.07, b: 0.06, a: 1 },
    backgroundAlt: { r: 0.06, g: 0.09, b: 0.08, a: 1 },
    cardBackground: { r: 0.08, g: 0.12, b: 0.1, a: 1 },
    textWhite: { r: 0.94, g: 0.98, b: 0.96, a: 1 },
    textMuted: { r: 0.55, g: 0.65, b: 0.6, a: 1 },
  },
  fitness: {
    primary: { r: 0.96, g: 0.26, b: 0.21, a: 1 },        // 레드
    background: { r: 0.07, g: 0.05, b: 0.05, a: 1 },
    backgroundAlt: { r: 0.1, g: 0.07, b: 0.07, a: 1 },
    cardBackground: { r: 0.13, g: 0.09, b: 0.09, a: 1 },
    textWhite: { r: 0.98, g: 0.95, b: 0.95, a: 1 },
    textMuted: { r: 0.65, g: 0.55, b: 0.55, a: 1 },
  },
  saas: {
    primary: { r: 0.25, g: 0.47, b: 0.96, a: 1 },        // 블루
    background: { r: 0.04, g: 0.05, b: 0.09, a: 1 },
    backgroundAlt: { r: 0.06, g: 0.07, b: 0.12, a: 1 },
    cardBackground: { r: 0.08, g: 0.09, b: 0.15, a: 1 },
    textWhite: { r: 0.94, g: 0.95, b: 0.98, a: 1 },
    textMuted: { r: 0.55, g: 0.58, b: 0.68, a: 1 },
  },
};

const DEFAULT_COLORS: ColorScheme = COLOR_SCHEMES.ecommerce;

// 카테고리별 기본 콘텐츠
interface DefaultContent {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
    ctaText: string;
    secondaryCtaText: string;
    trustText: string;
  };
  features: {
    sectionTitle: string;
    sectionSubtitle: string;
    items: Array<{ title: string; description: string }>;
  };
  gallery: {
    sectionTitle: string;
    sectionSubtitle: string;
  };
  cta: {
    title: string;
    subtitle: string;
    ctaText: string;
    trustText: string;
  };
}

function getDefaultContent(category: string, inputData?: Record<string, unknown>): DefaultContent {
  const brandName = String(
    inputData?.storeName || inputData?.brandName || inputData?.companyName || ''
  );

  const contentMap: Record<string, DefaultContent> = {
    ecommerce: {
      hero: {
        badge: '신규 오픈 특별 할인',
        title: brandName || '당신만을 위한\n프리미엄 쇼핑 경험',
        subtitle: '엄선된 상품과 빠른 배송으로\n특별한 쇼핑 경험을 선사합니다',
        ctaText: '지금 쇼핑하기',
        secondaryCtaText: '베스트 상품 보기',
        trustText: '50,000+ 고객이 선택한 신뢰할 수 있는 쇼핑몰',
      },
      features: {
        sectionTitle: '왜 저희를 선택해야 할까요?',
        sectionSubtitle: '차별화된 서비스로 최고의 쇼핑 경험을 제공합니다',
        items: [
          { title: '프리미엄 품질', description: '까다로운 기준으로 엄선된 최고급 상품만을 제공합니다. 모든 제품은 품질 검증을 거칩니다.' },
          { title: '무료 배송 & 반품', description: '5만원 이상 구매 시 무료 배송, 14일 이내 무조건 반품 보장으로 안심하고 구매하세요.' },
          { title: '1:1 맞춤 상담', description: '전문 스타일리스트가 고객님의 취향에 맞는 상품을 1:1로 추천해드립니다.' },
        ],
      },
      gallery: {
        sectionTitle: '인기 상품 갤러리',
        sectionSubtitle: '고객들이 가장 사랑하는 베스트 아이템을 만나보세요',
      },
      cta: {
        title: '지금 시작하세요',
        subtitle: '첫 구매 고객에게 20% 할인 쿠폰을 드립니다',
        ctaText: '회원가입 하고 쿠폰 받기',
        trustText: '가입 즉시 쿠폰 발급 | 언제든 해지 가능',
      },
    },
    restaurant: {
      hero: {
        badge: '예약 가능',
        title: brandName || '맛과 감동이 있는\n특별한 다이닝',
        subtitle: '신선한 재료와 셰프의 정성으로\n잊지 못할 미식 경험을 선사합니다',
        ctaText: '예약하기',
        secondaryCtaText: '메뉴 보기',
        trustText: '미슐랭 추천 | 월 평균 방문객 3,000+',
      },
      features: {
        sectionTitle: '우리만의 특별함',
        sectionSubtitle: '최고의 식재료와 셰프의 열정이 만나는 곳',
        items: [
          { title: '신선한 식재료', description: '매일 아침 직접 엄선한 신선한 재료만을 사용합니다. 산지 직송 프리미엄 식재료.' },
          { title: '수석 셰프의 요리', description: '15년 경력의 수석 셰프가 정성을 담아 한 접시 한 접시 완성합니다.' },
          { title: '프라이빗 다이닝', description: '소중한 모임을 위한 프라이빗 공간과 맞춤 코스를 제공합니다.' },
        ],
      },
      gallery: {
        sectionTitle: '시그니처 메뉴',
        sectionSubtitle: '셰프가 자신있게 추천하는 대표 메뉴를 만나보세요',
      },
      cta: {
        title: '특별한 자리를 예약하세요',
        subtitle: '온라인 예약 시 웰컴 드링크를 제공합니다',
        ctaText: '온라인 예약하기',
        trustText: '카카오톡 예약 가능 | 당일 예약 가능',
      },
    },
  };

  // 카테고리 매핑이 없으면 ecommerce 기반으로 brandName만 적용
  const base = contentMap[category] || contentMap.ecommerce;
  if (brandName && !contentMap[category]) {
    base.hero.title = `${brandName}\n최고의 서비스를 경험하세요`;
  }
  return base;
}

/**
 * 템플릿 기반으로 상세페이지 커맨드를 조립한다.
 * Gemini AI 없이 100% 코드로 레이아웃 결정.
 */
export function assembleDetailPage(config: AssembleConfig): FigmaGenerateResponse {
  const { category, canvasWidth, inputData } = config;
  const colors = COLOR_SCHEMES[category] || DEFAULT_COLORS;
  const content = getDefaultContent(category, inputData);

  const allCommands: FigmaCommand[] = [];
  let currentId = 1;

  // 루트 프레임 (전체 페이지 컨테이너)
  const rootId = `cmd_${String(currentId++).padStart(3, '0')}`;
  allCommands.push({
    id: rootId,
    command: 'create_frame',
    params: {
      width: canvasWidth,
      height: 4000,
      layoutMode: 'VERTICAL',
      primaryAxisAlignItems: 'CENTER',
      counterAxisAlignItems: 'CENTER',
      itemSpacing: 0,
      fillColor: colors.background,
      name: 'Detail Page',
      primaryAxisSizingMode: 'AUTO',
    },
    group: 'root',
    description: '상세페이지 루트 프레임',
  });

  // Hero 섹션
  const heroResult = buildHeroSection({
    canvasWidth,
    content: {
      badge: content.hero.badge,
      title: content.hero.title,
      subtitle: content.hero.subtitle,
      ctaText: content.hero.ctaText,
      secondaryCtaText: content.hero.secondaryCtaText,
      trustText: content.hero.trustText,
    },
    colors: {
      primary: colors.primary,
      background: colors.background,
      textWhite: colors.textWhite,
      textMuted: colors.textMuted,
    },
    startId: currentId,
    parentId: rootId,
  });
  allCommands.push(...heroResult.commands);
  currentId = heroResult.nextId;

  // Features 섹션
  const featuresResult = buildFeaturesSection({
    canvasWidth,
    content: {
      sectionTitle: content.features.sectionTitle,
      sectionSubtitle: content.features.sectionSubtitle,
      items: content.features.items,
    },
    colors: {
      primary: colors.primary,
      background: colors.backgroundAlt,
      cardBackground: colors.cardBackground,
      textWhite: colors.textWhite,
      textMuted: colors.textMuted,
    },
    startId: currentId,
    parentId: rootId,
  });
  allCommands.push(...featuresResult.commands);
  currentId = featuresResult.nextId;

  // Gallery 섹션
  const galleryResult = buildGallerySection({
    canvasWidth,
    content: {
      sectionTitle: content.gallery.sectionTitle,
      sectionSubtitle: content.gallery.sectionSubtitle,
    },
    colors: {
      background: colors.background,
      textWhite: colors.textWhite,
      textMuted: colors.textMuted,
    },
    startId: currentId,
    parentId: rootId,
  });
  allCommands.push(...galleryResult.commands);
  currentId = galleryResult.nextId;

  // CTA 섹션
  const ctaResult = buildCtaSection({
    canvasWidth,
    content: {
      title: content.cta.title,
      subtitle: content.cta.subtitle,
      ctaText: content.cta.ctaText,
      trustText: content.cta.trustText,
    },
    colors: {
      primary: colors.primary,
      background: colors.backgroundAlt,
      textWhite: colors.textWhite,
      textMuted: colors.textMuted,
    },
    startId: currentId,
    parentId: rootId,
  });
  allCommands.push(...ctaResult.commands);

  const sections = ['hero', 'features', 'gallery', 'cta'];
  const estimatedSeconds = Math.ceil(allCommands.length * 0.5);
  const estimatedTime = estimatedSeconds < 60
    ? `${estimatedSeconds}초`
    : `약 ${Math.ceil(estimatedSeconds / 60)}분`;

  return {
    commands: allCommands,
    metadata: {
      totalCommands: allCommands.length,
      sections,
      estimatedTime,
    },
  };
}
