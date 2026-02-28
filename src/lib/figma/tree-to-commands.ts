/**
 * TreeNode → FigmaCommand[] 변환기
 * AI가 생성한 중첩 트리 구조를 기존 flat 커맨드 배열로 변환한다.
 * Supabase broadcast 크기 제한을 우회하면서 트리 모드의 품질을 활용.
 */

import type { TreeNode, FigmaCommand, RGBAColor } from './types';

/** treeToFlatCommands 옵션 */
export interface TreeToCommandsOptions {
  /** 브랜드 메인 컬러 (HEX, 예: "#713b28") */
  brandColor?: string;
  /** 보조/강조 컬러 (HEX, 예: "#80b3db") */
  accentColor?: string;
  /** 보조 컬러 (HEX, 예: "#1A1A2E") — 어두운 섹션 배경용 */
  secondaryColor?: string;
  /** 캔버스 가로폭 (기본 860px). 폰트 크기 최소값이 캔버스 폭에 비례하여 조정됨 */
  canvasWidth?: number;
}

/** HEX → RGBAColor 변환 */
function hexToRgbaColor(hex: string): RGBAColor | null {
  const h = hex.replace('#', '');
  if (h.length < 6) return null;
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
    a: 1,
  };
}

/** 색상을 연하게 (밝은 배경용 틴트) */
function tintColor(color: RGBAColor, amount: number): RGBAColor {
  return {
    r: Math.min(1, color.r + (1 - color.r) * amount),
    g: Math.min(1, color.g + (1 - color.g) * amount),
    b: Math.min(1, color.b + (1 - color.b) * amount),
    a: 1,
  };
}

/** 색상을 어둡게 */
function shadeColor(color: RGBAColor, amount: number): RGBAColor {
  return {
    r: color.r * (1 - amount),
    g: color.g * (1 - amount),
    b: color.b * (1 - amount),
    a: 1,
  };
}

let cmdCounter = 0;
/** 현재 캔버스 폭 (enforceMinFontSize에서 참조) */
let currentCanvasWidth = 860;

function nextCmdId(): string {
  cmdCounter++;
  return `cmd_${String(cmdCounter).padStart(3, '0')}`;
}

function rgbaToParam(color: RGBAColor): { r: number; g: number; b: number; a: number } {
  return { r: color.r, g: color.g, b: color.b, a: color.a };
}

// 영문 전용 폰트를 한국어 지원 폰트로 교체
const ENGLISH_ONLY_FONTS = new Set(['Inter', 'Roboto', 'Arial', 'Helvetica', 'SF Pro', 'Poppins', 'Montserrat', 'Open Sans', 'Lato']);
function ensureKoreanFont(fontFamily: string | undefined): string {
  if (!fontFamily) return 'Noto Sans KR';
  if (ENGLISH_ONLY_FONTS.has(fontFamily)) return 'Noto Sans KR';
  // Pretendard는 Figma에서 기본 지원 안 됨 → Noto Sans KR로 교체
  if (fontFamily === 'Pretendard') return 'Noto Sans KR';
  return fontFamily;
}

// 색상 밝기(luminance) 계산 (0=검정, 1=흰색)
function luminance(c: RGBAColor): number {
  return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
}

// 배경색 대비 텍스트 색상 보정
const DARK_TEXT: RGBAColor = { r: 0.1, g: 0.1, b: 0.12, a: 1 };
const LIGHT_TEXT: RGBAColor = { r: 1, g: 1, b: 1, a: 1 };

/** 두 색상을 비율로 혼합 */
function mixColors(c1: RGBAColor, c2: RGBAColor, ratio: number): RGBAColor {
  return {
    r: c1.r * (1 - ratio) + c2.r * ratio,
    g: c1.g * (1 - ratio) + c2.g * ratio,
    b: c1.b * (1 - ratio) + c2.b * ratio,
    a: 1,
  };
}

// 브랜드 컬러 기반 섹션 배경색 팔레트 생성 (카테고리별 다양한 색감)
function buildSectionBgPalette(
  brand?: RGBAColor | null,
  accent?: RGBAColor | null,
  secondary?: RGBAColor | null,
): RGBAColor[] {
  const white: RGBAColor = { r: 1, g: 1, b: 1, a: 1 };
  const lightGray: RGBAColor = { r: 0.96, g: 0.96, b: 0.97, a: 1 };

  // 어두운 배경: secondary 컬러가 있으면 활용 (카테고리별 고유 다크톤)
  const darkSection: RGBAColor = secondary
    ? shadeColor(secondary, 0.3)
    : { r: 0.08, g: 0.08, b: 0.1, a: 1 };

  // 다크 변형: 브랜드 컬러 기반 깊은 색 (네이비, 딥그린, 딥퍼플 등)
  const deepBrand: RGBAColor = brand
    ? shadeColor(brand, 0.7)
    : darkSection;

  // 브랜드 컬러 틴트 (연한 톤 배경)
  const brandTintLight = brand ? tintColor(brand, 0.92) : lightGray;
  const brandTintMed = brand ? tintColor(brand, 0.85) : { r: 0.94, g: 0.94, b: 0.95, a: 1 };

  // secondary 틴트 (secondary 컬러 기반 따뜻한/차가운 톤)
  const secondaryTint = secondary ? tintColor(secondary, 0.90) : lightGray;

  // accent 틴트
  const accentTint = accent ? tintColor(accent, 0.88) : { r: 0.97, g: 0.96, b: 0.93, a: 1 };

  // 따뜻한 혼합 배경 (brand + accent 중간톤)
  const warmMix = (brand && accent)
    ? tintColor(mixColors(brand, accent, 0.4), 0.88)
    : brandTintLight;

  return [
    darkSection,      // 0: Hero — 카테고리 고유 다크톤
    brandTintLight,   // 1: 브랜드 컬러 연한 틴트
    secondaryTint,    // 2: secondary 연한 틴트
    white,            // 3: 화이트 (쉼표)
    accentTint,       // 4: accent 연한 틴트
    deepBrand,        // 5: 브랜드 딥톤 (두 번째 어두운 섹션)
    warmMix,          // 6: 따뜻한 혼합 톤
    brandTintMed,     // 7: 브랜드 중간 틴트
    darkSection,      // 8: CTA — 다크톤
    lightGray,        // 9: 라이트 그레이
  ];
}

// 기본 팔레트 (브랜드 컬러 없을 때)
const DEFAULT_SECTION_BG_PALETTE = buildSectionBgPalette();

// 이미지 노드 감지 패턴
const IMAGE_NAME_PATTERN = /image|img|이미지|photo|사진|gallery|hero_image|banner|thumbnail|poster|visual/i;

// 풀블리드 섹션 감지 패턴 (패딩 0으로 강제)
const FULLBLEED_NAME_PATTERN = /fullbleed|full.?bleed|풀블리드|hero.*image|banner|visual/i;

function ensureContrast(fontColor: RGBAColor | undefined, bgColor: RGBAColor | null): RGBAColor {
  // ★ 핵심 원칙: 배경을 모르면 항상 DARK_TEXT (검정) 반환
  // AI가 흰색 텍스트를 기본 생성하는 문제의 근본 해결
  if (!bgColor) {
    // 배경 정보 없음 → 무조건 어두운 텍스트 (흰 배경이 압도적으로 많으므로)
    if (!fontColor) return DARK_TEXT;
    const fgLum = luminance(fontColor);
    // AI가 준 색이 밝으면(흰색 계열) → 무조건 DARK_TEXT로 교체
    if (fgLum > 0.4) return DARK_TEXT;
    return fontColor;
  }

  const bgLum = luminance(bgColor);

  // 대비비가 더 높은 색상을 선택하는 헬퍼
  function pickBestColor(): RGBAColor {
    const darkLum = luminance(DARK_TEXT);
    const lightLum = luminance(LIGHT_TEXT);
    const darkContrast = (Math.max(bgLum, darkLum) + 0.05) / (Math.min(bgLum, darkLum) + 0.05);
    const lightContrast = (Math.max(bgLum, lightLum) + 0.05) / (Math.min(bgLum, lightLum) + 0.05);
    return darkContrast >= lightContrast ? DARK_TEXT : LIGHT_TEXT;
  }

  // fontColor가 없으면 배경 기반 기본값
  if (!fontColor) return pickBestColor();

  const fgLum = luminance(fontColor);

  // WCAG 대비비 계산
  const lighter = Math.max(bgLum, fgLum) + 0.05;
  const darker = Math.min(bgLum, fgLum) + 0.05;
  const contrastRatio = lighter / darker;

  // 대비비 4.5:1 미만이면 보정
  if (contrastRatio < 4.5) {
    return pickBestColor();
  }

  return fontColor;
}

// ★ 오버레이 방식 폐기. 히어로 이미지 위 텍스트는 forceHeroTextDark()가 어두운 색으로 강제.

/**
 * 노드 이름/텍스트 기반으로 최소 폰트 사이즈 강제 적용
 *
 * ★ 상세페이지 전체 적용 기준:
 *   메인 제목(Heading): 60~80px
 *   부제목(Subtitle):   40~50px
 *   본문(Body-Text):    최소 30px
 */
/**
 * 캔버스 폭 기반 최소 폰트 크기 테이블
 * 현업 상세페이지 기준:
 *   860px  = 쿠팡/네이버쇼핑 표준
 *   1200px = 웹 상세페이지
 *   1440px = 데스크톱 풀폭
 *
 * 각 역할별 [min, max] 범위를 정의하고,
 * AI 원본값이 min 미만이면 min으로, max 초과면 max로 클램프.
 */
interface FontSizeSpec {
  min: number;
  max: number;
}

function getFontSizeTable(canvasWidth: number): Record<string, FontSizeSpec> {
  // 860px 기준 현업 표준 → 캔버스 비율로 스케일
  const scale = canvasWidth / 860;

  const s = (base: number) => Math.round(base * scale);

  return {
    heroTitle:      { min: s(32), max: s(48) },
    heroSubtitle:   { min: s(16), max: s(24) },
    sectionHeading: { min: s(24), max: s(36) },
    subtitle:       { min: s(16), max: s(22) },
    body:           { min: s(14), max: s(18) },
    caption:        { min: s(14), max: s(18) },
    button:         { min: s(14), max: s(20) },
    badge:          { min: s(14), max: s(18) },
    price:          { min: s(24), max: s(40) },
    statsValue:     { min: s(36), max: s(56) },
    statsLabel:     { min: s(14), max: s(18) },
    globalMin:      { min: s(14), max: s(999) },
  };
}

function clamp(value: number, spec: FontSizeSpec): number {
  return Math.min(Math.max(value, spec.min), spec.max);
}

function enforceMinFontSize(fontSize: number, name?: string, text?: string): number {
  const n = (name || '').toLowerCase();
  const t = (text || '');
  const table = getFontSizeTable(currentCanvasWidth);

  // Stats 수치 (숫자+단위 패턴: "1,500+", "73%", "4.9점")
  if (/stat/i.test(n) && /heading|value|number/i.test(n)) {
    return clamp(fontSize, table.statsValue);
  }
  if (/stat/i.test(n) && /label/i.test(n)) {
    return clamp(fontSize, table.statsLabel);
  }

  // Hero 제목
  if (/hero/i.test(n) && /heading|title/i.test(n)) {
    return clamp(fontSize, table.heroTitle);
  }
  // Hero 부제목/본문
  if (/hero/i.test(n) && /sub|body|desc/i.test(n)) {
    return clamp(fontSize, table.heroSubtitle);
  }

  // 가격
  if (/price|가격|discount|할인/i.test(n)) {
    return clamp(fontSize, table.price);
  }

  // 섹션 메인 제목 — "Heading", "Title" (sub/label/caption 제외)
  if (/heading|title/i.test(n) && !/sub|body|desc|label|caption/i.test(n)) {
    return clamp(fontSize, table.sectionHeading);
  }

  // 부제목 — "Subtitle", "Subheading"
  if (/subtitle|sub.?heading/i.test(n)) {
    return clamp(fontSize, table.subtitle);
  }

  // 본문 텍스트 — "Body-Text", "description", "content"
  if (/body.?text|description|desc|content/i.test(n) && !/counter/i.test(n)) {
    return clamp(fontSize, table.body);
  }

  // CTA 버튼 텍스트
  if (/cta|button/i.test(n) && /text/i.test(n)) {
    return clamp(fontSize, table.button);
  }

  // Label, Badge, Tag, Caption
  if (/badge|tag/i.test(n)) {
    return clamp(fontSize, table.badge);
  }
  if (/label|caption|num/i.test(n)) {
    return clamp(fontSize, table.caption);
  }

  // 숫자가 포함된 큰 수치 (1,500+ 등)
  if (/^\d[\d,.]+[+%점명개]?$/.test(t.trim())) {
    return clamp(fontSize, table.statsValue);
  }

  // 전체 최소값
  return Math.max(fontSize, table.globalMin.min);
}

/**
 * TreeNode를 재귀적으로 순회하면서 FigmaCommand[] 배열을 생성한다.
 */
function flattenNode(
  node: TreeNode,
  parentCmdId: string | null,
  commands: FigmaCommand[],
  sectionName: string,
  parentBgColor: RGBAColor | null = null,
  parentLayoutMode: string | null = null
): string {
  const cmdId = nextCmdId();

  if (node.type === 'TEXT') {
    const correctedColor = ensureContrast(node.fontColor, parentBgColor);
    const rawFontSize = node.fontSize || 18;
    const fontSize = enforceMinFontSize(rawFontSize, node.name, node.text);
    const fontWeight = node.fontWeight || 400;

    // 텍스트 정렬: 상황별 자동 판단
    let textAlign = node.textAlignHorizontal;
    if (!textAlign) {
      const isHeading = fontSize >= 28 || fontWeight >= 700;
      const isInHorizontalParent = parentLayoutMode === 'HORIZONTAL';
      const nameLC = (node.name || '').toLowerCase();
      const isCTAText = /cta|button/i.test(nameLC);

      if (isCTAText) {
        textAlign = 'CENTER';
      } else if (isInHorizontalParent) {
        // 아이콘+텍스트 조합 → 좌측 정렬
        textAlign = 'LEFT';
      } else if (isHeading) {
        // 제목급 → 가운데
        textAlign = 'CENTER';
      } else {
        // 본문, 카드 내부, 설명 → 좌측
        textAlign = 'LEFT';
      }
    }

    commands.push({
      id: cmdId,
      command: 'create_text',
      params: {
        text: node.text || '',
        fontSize,
        fontWeight,
        fontColor: rgbaToParam(correctedColor),
        fontFamily: ensureKoreanFont(node.fontFamily),
        name: node.name,
        textAlignHorizontal: textAlign,
        ...(node.lineHeight ? { lineHeight: node.lineHeight } : {}),
        ...(node.letterSpacing ? { letterSpacing: node.letterSpacing } : {}),
        ...(parentCmdId ? { parentId: `$${parentCmdId}` } : {}),
      },
      group: sectionName,
      description: node.name || node.text?.substring(0, 30) || 'text',
    });

    // create_text 핸들러가 FILL + HEIGHT + resize + alignment 모두 처리
    // 중복 커맨드(set_text_style, set_auto_resize, set_layout_sizing) 제거
    // → 텍스트 높이 리셋 방지, 커맨드 수 절약

    // rangeStyles — 텍스트 내 부분 강조 (가격, 숫자, 키워드)
    if (node.rangeStyles && node.rangeStyles.length > 0) {
      for (const rs of node.rangeStyles) {
        commands.push({
          id: nextCmdId(),
          command: 'set_range_text_style',
          params: {
            nodeId: `$${cmdId}`,
            start: rs.start,
            end: rs.end,
            ...(rs.fontSize ? { fontSize: rs.fontSize } : {}),
            ...(rs.fontWeight ? { fontStyle: rs.fontWeight >= 700 ? 'Bold' : 'Regular' } : {}),
            ...(rs.fontColor ? { fontColor: rgbaToParam(rs.fontColor) } : {}),
            ...(rs.textDecoration && rs.textDecoration !== 'NONE' ? { textDecoration: rs.textDecoration } : {}),
            ...(rs.letterSpacing ? { letterSpacing: rs.letterSpacing } : {}),
          },
          group: sectionName,
          description: 'range text style',
        });
      }
    }

    return cmdId;
  }

  if (node.type === 'RECTANGLE') {
    const isImage = IMAGE_NAME_PATTERN.test(node.name || '') || (node.height != null && node.height >= 100);
    // 이미지 노드: 최소 높이 400px, Hero 이미지는 800px
    const isHeroImage = /hero/i.test(node.name || '');
    const minImgHeight = isHeroImage ? 800 : 400;
    const rectHeight = isImage ? Math.max(node.height || minImgHeight, minImgHeight) : (node.height || 100);

    commands.push({
      id: cmdId,
      command: 'create_rectangle',
      params: {
        width: node.width || 100,
        height: rectHeight,
        name: node.name,
        ...(parentCmdId ? { parentId: `$${parentCmdId}` } : {}),
      },
      group: sectionName,
      description: node.name || 'rectangle',
    });

    if (node.fillColor) {
      commands.push({
        id: nextCmdId(),
        command: 'set_fill_color',
        params: { nodeId: `$${cmdId}`, color: rgbaToParam(node.fillColor) },
        group: sectionName,
        description: 'fill',
      });
    }

    if (node.cornerRadius) {
      commands.push({
        id: nextCmdId(),
        command: 'set_corner_radius',
        params: { nodeId: `$${cmdId}`, radius: node.cornerRadius },
        group: sectionName,
        description: 'corner radius',
      });
    }

    // 이미지 노드는 무조건 FILL 사이징 강제 (부모 폭에 맞춤)
    if (isImage && parentCmdId) {
      commands.push({
        id: nextCmdId(),
        command: 'set_layout_sizing',
        params: {
          nodeId: `$${cmdId}`,
          layoutSizingHorizontal: 'FILL',
          ...(node.layoutSizingVertical ? { layoutSizingVertical: node.layoutSizingVertical } : {}),
        },
        group: sectionName,
        description: 'image fill sizing',
      });
    } else if (node.layoutSizingHorizontal || node.layoutSizingVertical) {
      commands.push({
        id: nextCmdId(),
        command: 'set_layout_sizing',
        params: {
          nodeId: `$${cmdId}`,
          ...(node.layoutSizingHorizontal ? { layoutSizingHorizontal: node.layoutSizingHorizontal } : {}),
          ...(node.layoutSizingVertical ? { layoutSizingVertical: node.layoutSizingVertical } : {}),
        },
        group: sectionName,
        description: 'layout sizing',
      });
    }

    // blendMode
    if (node.blendMode && node.blendMode !== 'NORMAL') {
      commands.push({
        id: nextCmdId(),
        command: 'set_blend_mode',
        params: { nodeId: `$${cmdId}`, blendMode: node.blendMode },
        group: sectionName,
        description: 'blend mode',
      });
    }

    // rotation
    if (node.rotation != null && node.rotation !== 0) {
      commands.push({
        id: nextCmdId(),
        command: 'set_rotation',
        params: { nodeId: `$${cmdId}`, rotation: node.rotation },
        group: sectionName,
        description: 'rotation',
      });
    }

    return cmdId;
  }

  if (node.type === 'ELLIPSE') {
    commands.push({
      id: cmdId,
      command: 'create_ellipse',
      params: {
        width: node.width || 48,
        height: node.height || 48,
        name: node.name,
        ...(parentCmdId ? { parentId: `$${parentCmdId}` } : {}),
      },
      group: sectionName,
      description: node.name || 'ellipse',
    });

    if (node.fillColor) {
      commands.push({
        id: nextCmdId(),
        command: 'set_fill_color',
        params: { nodeId: `$${cmdId}`, color: rgbaToParam(node.fillColor) },
        group: sectionName,
        description: 'fill',
      });
    }

    // blendMode
    if (node.blendMode && node.blendMode !== 'NORMAL') {
      commands.push({
        id: nextCmdId(),
        command: 'set_blend_mode',
        params: { nodeId: `$${cmdId}`, blendMode: node.blendMode },
        group: sectionName,
        description: 'blend mode',
      });
    }

    // rotation
    if (node.rotation != null && node.rotation !== 0) {
      commands.push({
        id: nextCmdId(),
        command: 'set_rotation',
        params: { nodeId: `$${cmdId}`, rotation: node.rotation },
        group: sectionName,
        description: 'rotation',
      });
    }

    return cmdId;
  }

  // 버튼 프레임 감지: 이름에 button/cta/btn 포함
  const isButton = /button|cta|btn/i.test(node.name || '');
  // 그라데이션 오버레이 감지: 이름에 overlay/gradient 포함하고 fills에 GRADIENT 존재
  const isGradientOverlay = /overlay|gradient/i.test(node.name || '');
  // 풀블리드 섹션 감지: 이름에 fullbleed 포함 → 패딩 0 강제
  const isFullBleed = FULLBLEED_NAME_PATTERN.test(node.name || '');

  // 자식 프레임 여부 (루트가 아닌 모든 프레임)
  const isChildFrame = parentCmdId !== null;
  const hasChildren = node.children && node.children.length > 0;

  // 버튼 최소 패딩 보정, 풀블리드는 패딩 제거
  let paddingTop: number | undefined;
  let paddingBottom: number | undefined;
  let paddingLeft: number | undefined;
  let paddingRight: number | undefined;

  // 섹션 레벨 감지 (루트 직계 자식)
  const isSectionLevel = parentCmdId !== null && parentLayoutMode === 'VERTICAL'
    && (node.name?.includes('Section') || node.name?.includes('section')
        || node.name?.includes('Hero') || node.name?.includes('hero')
        || node.name?.includes('CTA') || node.name?.includes('Footer'));
  // 루트 직계 자식이면서 height가 큰 프레임도 섹션으로 간주
  const isLikelySection = parentCmdId !== null && (node.height ?? 0) >= 300;

  if (isFullBleed) {
    paddingTop = 0;
    paddingBottom = 0;
    paddingLeft = 0;
    paddingRight = 0;
  } else if (isButton) {
    paddingTop = Math.max(node.paddingTop ?? 12, 12);
    paddingBottom = Math.max(node.paddingBottom ?? 12, 12);
    paddingLeft = Math.max(node.paddingLeft ?? 24, 24);
    paddingRight = Math.max(node.paddingRight ?? 24, 24);
  } else if (isSectionLevel || isLikelySection) {
    // ★ Hero/CTA 섹션: 이미지 풀블리드를 위해 좌우 패딩 0 강제
    const sectionName = (node.name || '').toLowerCase();
    const isImageSection = /hero|cta|gallery|banner|visual/i.test(sectionName);
    const hasImageChild = node.children?.some(c =>
      c.type === 'RECTANGLE' || /image|img|photo|visual|banner/i.test(c.name || '')
    );

    if (isImageSection || hasImageChild) {
      // 이미지 포함 섹션: 좌우 패딩 0 (풀블리드)
      paddingTop = node.paddingTop ?? 0;
      paddingBottom = node.paddingBottom ?? 0;
      paddingLeft = 0;
      paddingRight = 0;
    } else {
      // 일반 섹션: 표준 패딩
      paddingTop = Math.max(node.paddingTop ?? 40, 40);
      paddingBottom = Math.max(node.paddingBottom ?? 40, 40);
      paddingLeft = Math.max(node.paddingLeft ?? 40, 40);
      paddingRight = Math.max(node.paddingRight ?? 40, 40);
    }
  } else if (isChildFrame) {
    // 내부 프레임: sanitizer가 설정한 값 존중 (0도 허용)
    paddingTop = node.paddingTop ?? 0;
    paddingBottom = node.paddingBottom ?? 0;
    paddingLeft = node.paddingLeft ?? 0;
    paddingRight = node.paddingRight ?? 0;
  } else {
    paddingTop = node.paddingTop;
    paddingBottom = node.paddingBottom;
    paddingLeft = node.paddingLeft;
    paddingRight = node.paddingRight;
  }

  // 그라데이션 오버레이 최소 높이 보정 (1px 방지)
  const frameHeight = isGradientOverlay ? Math.max(node.height || 200, 200) : (node.height || 100);

  // 부모 레이아웃 방향에 따라 sizing 전략 결정
  const isParentHorizontal = parentLayoutMode === 'HORIZONTAL';

  let horizontalSizing = node.layoutSizingHorizontal;
  let verticalSizing = node.layoutSizingVertical;

  // 카드 그리드 자식 감지: 부모가 HORIZONTAL이고 WRAP인 경우
  const isCardInGrid = isParentHorizontal && node.layoutWrap !== 'WRAP';

  // ★ 구조적 프레임 감지 (header, content, overlay 등): 항상 FILL 강제
  const nodeName = (node.name || '').toLowerCase();
  const isStructuralFrame = /header|section-header|overlay|content|wrapper|container|inner|body|text-area/.test(nodeName);
  // 카드/버튼 등 기능적 프레임은 제외
  const isFunctionalFrame = /card|button|btn|badge|tag|pill|chip|price|box|item|divider|image|img|icon|logo/.test(nodeName);

  if (isChildFrame) {
    if (!horizontalSizing) {
      if (isCardInGrid && node.width) {
        // 카드 그리드 내부: FIXED 너비 유지 (균등 배치)
        horizontalSizing = 'FIXED';
      } else {
        horizontalSizing = isParentHorizontal ? 'HUG' : 'FILL';
      }
    }

    // ★ VERTICAL 부모 안의 구조적 프레임이 HUG면 FILL로 강제 교정
    // (AI가 Section-Header를 HUG로 생성 → 80px로 압축되는 문제 방지)
    if (!isParentHorizontal && horizontalSizing === 'HUG' && isStructuralFrame && !isFunctionalFrame) {
      horizontalSizing = 'FILL';
    }
  }

  if (isChildFrame && !verticalSizing && hasChildren && !isGradientOverlay) {
    verticalSizing = 'HUG'; // 기본 HUG (내용에 맞춤)
  }

  // HORIZONTAL 프레임: counterAxisAlignItems 기본값 CENTER, primaryAxis SPACE_BETWEEN 또는 CENTER
  const isHorizontalFrame = node.layoutMode === 'HORIZONTAL';

  // 프레임 정렬 기본값 (용도별 분기)
  const isCardFrame = /card/i.test(node.name || '');
  const isIconRow = isHorizontalFrame && hasChildren && (node.children?.length ?? 0) <= 3;

  let counterAlign = node.counterAxisAlignItems;
  if (!counterAlign && hasChildren) {
    if (isCardFrame) {
      counterAlign = 'MIN';
    } else if (isHorizontalFrame) {
      // HORIZONTAL: sanitizer가 MIN으로 설정한 경우 존중. 기본은 CENTER
      counterAlign = 'CENTER';
    } else {
      counterAlign = 'CENTER';
    }
  }

  // primaryAxis 기본값
  let primaryAlign = node.primaryAxisAlignItems;
  if (!primaryAlign && hasChildren) {
    if (isHorizontalFrame && isIconRow) {
      // 아이콘+텍스트 행 → 좌측 정렬
      primaryAlign = 'MIN';
    } else if (isHorizontalFrame) {
      primaryAlign = 'CENTER';
    }
  }

  // FRAME / GROUP
  commands.push({
    id: cmdId,
    command: 'create_frame',
    params: {
      width: node.width || 100,
      height: frameHeight,
      name: node.name,
      ...(parentCmdId ? { parentId: `$${parentCmdId}` } : {}),
      ...(node.fillColor ? { fillColor: rgbaToParam(node.fillColor) } : {}),
      ...(node.layoutMode ? { layoutMode: node.layoutMode } : {}),
      ...(node.layoutWrap ? { layoutWrap: node.layoutWrap } : {}),
      ...(paddingTop != null ? { paddingTop } : {}),
      ...(paddingRight != null ? { paddingRight } : {}),
      ...(paddingBottom != null ? { paddingBottom } : {}),
      ...(paddingLeft != null ? { paddingLeft } : {}),
      ...(primaryAlign ? { primaryAxisAlignItems: primaryAlign } : {}),
      ...(counterAlign ? { counterAxisAlignItems: counterAlign } : {}),
      ...(horizontalSizing ? { layoutSizingHorizontal: horizontalSizing } : {}),
      ...(verticalSizing ? { layoutSizingVertical: verticalSizing } : {}),
      ...(node.itemSpacing != null
        ? { itemSpacing: node.itemSpacing }
        : hasChildren
          ? { itemSpacing: (isSectionLevel || isLikelySection) ? 32 : 16 }
          : {}),
    },
    group: sectionName,
    description: node.name || 'frame',
  });

  // 프레임 후처리: cornerRadius
  if (node.cornerRadius) {
    commands.push({
      id: nextCmdId(),
      command: 'set_corner_radius',
      params: { nodeId: `$${cmdId}`, radius: node.cornerRadius },
      group: sectionName,
      description: 'corner radius',
    });
  }

  // stroke
  if (node.strokeColor && node.strokeWeight) {
    commands.push({
      id: nextCmdId(),
      command: 'set_stroke_color',
      params: {
        nodeId: `$${cmdId}`,
        color: rgbaToParam(node.strokeColor),
        strokeWeight: node.strokeWeight,
      },
      group: sectionName,
      description: 'stroke',
    });
  }

  // effects (shadow, blur)
  if (node.effects && node.effects.length > 0) {
    commands.push({
      id: nextCmdId(),
      command: 'set_effects',
      params: {
        nodeId: `$${cmdId}`,
        effects: node.effects.map(e => ({
          type: e.type,
          ...(e.color ? { color: rgbaToParam(e.color) } : {}),
          ...(e.offset ? { offset: e.offset } : {}),
          ...(e.radius != null ? { radius: e.radius } : {}),
          ...(e.spread != null ? { spread: e.spread } : {}),
          visible: e.visible !== false,
        })),
      },
      group: sectionName,
      description: 'effects',
    });
  }

  // opacity
  if (node.opacity != null && node.opacity < 1) {
    commands.push({
      id: nextCmdId(),
      command: 'set_opacity',
      params: { nodeId: `$${cmdId}`, opacity: node.opacity },
      group: sectionName,
      description: 'opacity',
    });
  }

  // blendMode
  if (node.blendMode && node.blendMode !== 'NORMAL') {
    commands.push({
      id: nextCmdId(),
      command: 'set_blend_mode',
      params: { nodeId: `$${cmdId}`, blendMode: node.blendMode },
      group: sectionName,
      description: 'blend mode',
    });
  }

  // rotation
  if (node.rotation != null && node.rotation !== 0) {
    commands.push({
      id: nextCmdId(),
      command: 'set_rotation',
      params: { nodeId: `$${cmdId}`, rotation: node.rotation },
      group: sectionName,
      description: 'rotation',
    });
  }

  // fills — 다중 fill이면 set_multiple_fills, 단일 gradient면 set_gradient_fill
  if (node.fills && node.fills.length > 0) {
    const hasSolid = node.fills.some(f => f.type === 'SOLID');
    const hasGradient = node.fills.some(f => f.type === 'GRADIENT_LINEAR' || f.type === 'GRADIENT_RADIAL');

    if (hasSolid && hasGradient) {
      // 다중 fill: SOLID + GRADIENT 동시 적용
      const fillsParam = node.fills.map(f => {
        if (f.type === 'SOLID' && f.color) {
          return { type: 'SOLID' as const, color: rgbaToParam(f.color), opacity: f.opacity ?? 1 };
        }
        return {
          type: f.type === 'GRADIENT_RADIAL' ? 'GRADIENT_RADIAL' as const : 'GRADIENT_LINEAR' as const,
          gradientStops: (f.gradientStops || []).map(s => ({
            color: s.color ? rgbaToParam(s.color) : { r: 0, g: 0, b: 0, a: 1 },
            position: s.position,
          })),
          ...(f.gradientTransform ? { gradientTransform: f.gradientTransform } : {}),
          opacity: f.opacity ?? 1,
        };
      });
      commands.push({
        id: nextCmdId(),
        command: 'set_multiple_fills',
        params: { nodeId: `$${cmdId}`, fills: fillsParam },
        group: sectionName,
        description: 'multiple fills',
      });
    } else if (hasGradient) {
      // 단일 gradient
      const gradientFill = node.fills.find(f => f.type === 'GRADIENT_LINEAR' || f.type === 'GRADIENT_RADIAL');
      if (gradientFill && gradientFill.gradientStops) {
        commands.push({
          id: nextCmdId(),
          command: 'set_gradient_fill',
          params: {
            nodeId: `$${cmdId}`,
            gradientType: gradientFill.type === 'GRADIENT_RADIAL' ? 'RADIAL' : 'LINEAR',
            gradientStops: gradientFill.gradientStops.map(s => ({
              color: s.color ? rgbaToParam(s.color) : { r: 0, g: 0, b: 0, a: 1 },
              position: s.position,
            })),
            ...(gradientFill.gradientTransform ? { gradientTransform: gradientFill.gradientTransform } : {}),
          },
          group: sectionName,
          description: 'gradient',
        });
      }
    }
  }

  // 자식 노드 재귀 (배경색을 자식에게 전달)
  if (node.children && node.children.length > 0) {
    const currentBg = node.fillColor || parentBgColor;
    for (const child of node.children) {
      const childSection = child.name
        ? child.name.replace('Section-', '').replace('section-', '').toLowerCase()
        : sectionName;
      flattenNode(child, cmdId, commands, childSection, currentBg, node.layoutMode || null);
    }
  }

  return cmdId;
}

/**
 * 섹션 배경색 교차 패턴을 항상 적용한다.
 * - 연속 2개 이상 같은 배경색이면 강제 교체
 * - 브랜드 컬러 기반 배경 포함
 * - 어두운 배경 섹션 내 텍스트 색상 자동 보정
 */
function enforceSectionBgAlternation(
  commands: FigmaCommand[],
  tree: TreeNode,
  palette: RGBAColor[]
): void {
  if (!tree.children || tree.children.length < 2) return;

  const rootCmdId = commands[0]?.id;
  if (!rootCmdId) return;

  const sectionCmds = commands.filter(
    c => c.command === 'create_frame' && c.params.parentId === `$${rootCmdId}`
  );

  if (sectionCmds.length < 2) return;

  // 어두운 배경을 받은 섹션 ID 목록
  const darkSectionIds = new Set<string>();

  // 다양한 배경색 패턴 적용
  // 팔레트 인덱스: 0=다크, 1=브랜드틴트, 2=세컨더리틴트, 3=화이트,
  //   4=액센트틴트, 5=딥브랜드, 6=웜믹스, 7=브랜드미듐, 8=다크(CTA), 9=라이트그레이
  let prevBgLum = -1;
  // 어두운 섹션이 연속되지 않도록 추적
  let prevWasDark = false;

  sectionCmds.forEach((cmd, index) => {
    const cmdName = (cmd.params.name as string) || '';
    const isHero = index === 0;
    const isCTA = /cta/i.test(cmdName) || /urgency/i.test(cmdName);
    const isFooter = index === sectionCmds.length - 1;

    // Hero: 카테고리 고유 다크톤
    if (isHero) {
      cmd.params.fillColor = rgbaToParam(palette[0]);
      darkSectionIds.add(cmd.id);
      prevBgLum = luminance(palette[0]);
      prevWasDark = true;
      return;
    }

    // CTA: 딥 브랜드 톤 (Hero와 다른 어두운 색)
    if (isCTA) {
      const ctaBg = palette[5]; // deepBrand
      cmd.params.fillColor = rgbaToParam(ctaBg);
      darkSectionIds.add(cmd.id);
      prevBgLum = luminance(ctaBg);
      prevWasDark = true;
      return;
    }

    // Footer: 다크
    if (isFooter) {
      cmd.params.fillColor = rgbaToParam(palette[8]);
      darkSectionIds.add(cmd.id);
      prevBgLum = luminance(palette[8]);
      return;
    }

    // 중간 섹션: 팔레트에서 순환하되 연속 같은 밝기 방지
    // 어두운 배경 섹션을 중간에도 1~2개 배치 (리듬감)
    const totalMiddle = sectionCmds.length - 2; // Hero/Footer 제외
    const middleIndex = index - 1; // Hero 이후 0부터

    // 중간 지점에 어두운 섹션 1개 배치 (전체 섹션이 6개 이상일 때)
    const shouldBeDark = totalMiddle >= 4 && middleIndex === Math.floor(totalMiddle / 2) && !prevWasDark;

    let chosenColor: RGBAColor;
    if (shouldBeDark) {
      chosenColor = palette[5]; // deepBrand (두 번째 어두운 톤)
    } else {
      // 밝은 팔레트에서 순환 (1, 2, 3, 4, 6, 7, 9)
      const lightPaletteIndices = [1, 2, 4, 6, 3, 7, 9];
      const lightIdx = middleIndex % lightPaletteIndices.length;
      chosenColor = palette[lightPaletteIndices[lightIdx]];
    }

    const chosenLum = luminance(chosenColor);

    // 이전 섹션과 밝기 차이가 너무 작으면 건너뛰고 다음 팔레트 색상 사용
    if (Math.abs(chosenLum - prevBgLum) < 0.1) {
      // 대비가 부족하면 화이트 또는 라이트그레이로 대체
      chosenColor = prevBgLum > 0.8 ? palette[2] : palette[3];
    }

    const finalLum = luminance(chosenColor);
    cmd.params.fillColor = rgbaToParam(chosenColor);
    prevBgLum = finalLum;
    prevWasDark = finalLum < 0.3;
    if (finalLum < 0.3) darkSectionIds.add(cmd.id);
  });

  // ★ 텍스트 색상 보정은 여기서 하지 않는다!
  // 이유: 섹션 배경 기준으로 텍스트를 강제하면, 어두운 섹션 안의 흰색 카드 텍스트도
  // 전부 흰색이 되어 안 보이는 문제가 발생.
  // 대신 finalContrastSafetyNet()에서 각 텍스트의 실제 가장 가까운 부모 배경을 기준으로 보정.
}

/**
 * ★ 어두운 섹션 내부의 구조용 프레임(Overlay, Content, Wrapper 등)에서
 * 흰색 솔리드 fill을 제거하여 섹션 배경이 비치도록 한다.
 *
 * 근본 원인: AI가 모든 FRAME에 흰색 fill을 기본 생성하므로,
 * 어두운 Hero/CTA 섹션 내부의 Overlay 프레임이 흰색으로 덮여
 * 흰색 텍스트가 안 보이는 문제가 발생.
 *
 * enforceSectionBgAlternation 바로 뒤에 실행해야 함.
 */
function stripWhiteFillsInDarkSections(commands: FigmaCommand[]): void {
  // ★ Overlay / Content 프레임의 흰색 fill을 삭제한다.
  // 오버레이(반투명 다크) 대신, 흰색 fill만 제거하여 배경이 자연스럽게 비치도록 한다.
  // 텍스트 가독성은 forceHeroTextDark()가 담당.

  // Hero/CTA 섹션 ID 수집 (normalizeLayerNames 전후 둘 다 매칭)
  const heroCtaSectionIds = new Set<string>();
  for (const cmd of commands) {
    if (cmd.command !== 'create_frame') continue;
    const name = (cmd.params.name as string) || '';
    if (/hero|cta/i.test(name)) {
      heroCtaSectionIds.add(cmd.id);
    }
  }

  // Hero/CTA 섹션의 직계 자식 프레임 ID 수집
  const heroCtaChildIds = new Set<string>();
  for (const cmd of commands) {
    if (cmd.command !== 'create_frame') continue;
    const parentRef = cmd.params.parentId as string | undefined;
    if (!parentRef) continue;
    const parentId = parentRef.replace('$', '');
    if (heroCtaSectionIds.has(parentId)) {
      heroCtaChildIds.add(cmd.id);
    }
  }

  const OVERLAY_PATTERN = /overlay|gradient|content|hero.?content/i;
  const EXCLUDE_PATTERN = /card|badge|button|cta.?button|tag|chip/i;

  const strippedIds = new Set<string>();

  for (const cmd of commands) {
    if (cmd.command !== 'create_frame') continue;

    const name = (cmd.params.name as string) || '';
    if (EXCLUDE_PATTERN.test(name)) continue;

    const isOverlayName = OVERLAY_PATTERN.test(name);
    const isHeroCtaChild = heroCtaChildIds.has(cmd.id);
    if (!isOverlayName && !isHeroCtaChild) continue;

    const fill = cmd.params.fillColor as RGBAColor | undefined;
    if (!fill) continue;

    // 밝은 솔리드 fill → 삭제 (오버레이 없음)
    if (luminance(fill) > 0.7) {
      delete cmd.params.fillColor;
      strippedIds.add(cmd.id);
    }
  }

  // set_fill_color도 제거
  for (let i = commands.length - 1; i >= 0; i--) {
    const cmd = commands[i];
    if (cmd.command !== 'set_fill_color') continue;
    const nodeRef = cmd.params.nodeId as string | undefined;
    if (!nodeRef) continue;
    const nodeId = nodeRef.replace('$', '');
    if (strippedIds.has(nodeId)) {
      const color = cmd.params.color as RGBAColor | undefined;
      if (color && luminance(color) > 0.7) {
        commands.splice(i, 1);
      }
    }
  }
}

/**
 * 버튼/배지 프레임 내부 텍스트의 색상을 보정한다.
 * 밝은 배경 → 어두운 텍스트, 어두운 배경 → 밝은 텍스트
 */
function fixButtonTextColors(commands: FigmaCommand[]): void {
  // 버튼/배지 프레임 ID 수집
  const interactiveCmdIds = new Set<string>();
  const interactiveBgColors = new Map<string, RGBAColor>();

  for (const cmd of commands) {
    if (cmd.command === 'create_frame') {
      const name = (cmd.params.name as string) || '';
      // 버튼 + 배지 + 태그 + 뱃지 + pill 모두 포함
      if (/button|cta|btn|badge|뱃지|tag|태그|pill|chip/i.test(name)) {
        interactiveCmdIds.add(cmd.id);
        if (cmd.params.fillColor) {
          interactiveBgColors.set(`$${cmd.id}`, cmd.params.fillColor as RGBAColor);
        }
      }
    }
  }

  // set_fill_color로 나중에 색상이 설정되는 경우도 체크
  for (const cmd of commands) {
    if (cmd.command === 'set_fill_color' && cmd.params.nodeId) {
      const nodeRef = cmd.params.nodeId as string;
      const nodeId = nodeRef.replace('$', '');
      if (interactiveCmdIds.has(nodeId) && cmd.params.color) {
        interactiveBgColors.set(nodeRef, cmd.params.color as RGBAColor);
      }
    }
  }

  // 버튼/배지 내부 텍스트 찾아서 색상 보정
  for (const cmd of commands) {
    if (cmd.command === 'create_text' && cmd.params.parentId) {
      const parentRef = cmd.params.parentId as string;
      const parentId = parentRef.replace('$', '');
      if (interactiveCmdIds.has(parentId)) {
        const bgColor = interactiveBgColors.get(parentRef);
        if (bgColor) {
          const bgLum = luminance(bgColor);
          // 실제 대비비 비교로 더 잘 보이는 색상 선택
          const dLum = luminance(DARK_TEXT);
          const lLum = luminance(LIGHT_TEXT);
          const dContrast = (Math.max(bgLum, dLum) + 0.05) / (Math.min(bgLum, dLum) + 0.05);
          const lContrast = (Math.max(bgLum, lLum) + 0.05) / (Math.min(bgLum, lLum) + 0.05);
          cmd.params.fontColor = dContrast >= lContrast
            ? rgbaToParam(DARK_TEXT)
            : rgbaToParam(LIGHT_TEXT);
        }
      }
    }
  }
}

/**
 * 소제목/라벨 텍스트에 브랜드 컬러를 적용하여 색상 다양성을 높인다.
 * 밝은 배경의 소제목, 라벨, 강조 텍스트에만 적용한다.
 */
function applyBrandColorToAccentTexts(
  commands: FigmaCommand[],
  brandColor: RGBAColor | null,
  accentColor: RGBAColor | null
): void {
  if (!brandColor && !accentColor) return;

  // 어두운 배경 섹션 ID 수집
  const darkSectionIds = new Set<string>();
  const rootCmdId = commands[0]?.id;
  if (!rootCmdId) return;

  for (const cmd of commands) {
    if (cmd.command === 'create_frame' && cmd.params.parentId === `$${rootCmdId}`) {
      const fill = cmd.params.fillColor as RGBAColor | undefined;
      if (fill && luminance(fill) < 0.3) darkSectionIds.add(cmd.id);
    }
  }

  // 커맨드 → 섹션 매핑 구축
  const cmdToSection = new Map<string, string>();
  for (const cmd of commands) {
    const parentRef = cmd.params.parentId as string | undefined;
    if (!parentRef) continue;
    const parentId = parentRef.replace('$', '');
    if (parentId === rootCmdId) {
      cmdToSection.set(cmd.id, cmd.id);
    } else if (cmdToSection.has(parentId)) {
      cmdToSection.set(cmd.id, cmdToSection.get(parentId)!);
    }
  }

  // 텍스트 커맨드 중 소제목/라벨에 브랜드 컬러 적용
  let brandApplyCount = 0;
  for (const cmd of commands) {
    if (cmd.command !== 'create_text') continue;

    const sectionId = cmdToSection.get(cmd.id);
    if (sectionId && darkSectionIds.has(sectionId)) continue; // 어두운 배경은 건너뜀

    const fontSize = cmd.params.fontSize as number;
    const fontWeight = cmd.params.fontWeight as number;
    const name = ((cmd.params.name as string) || '').toLowerCase();

    // 소제목 (fontSize 40~55, weight 500~700)이거나 라벨/뱃지 텍스트
    const isSubheading = fontSize >= 40 && fontSize <= 55 && fontWeight >= 500 && fontWeight <= 700;
    const isLabel = /label|라벨|badge|뱃지|tag|태그|caption/i.test(name);
    const isHighlight = /highlight|강조|accent|포인트|emphasis/i.test(name);

    if (isSubheading || isLabel || isHighlight) {
      // 번갈아가며 브랜드/강조 컬러 적용
      const colorToUse = brandApplyCount % 2 === 0
        ? (brandColor || accentColor)
        : (accentColor || brandColor);

      if (colorToUse) {
        // 너무 밝으면 어둡게 조정 (밝은 배경에서 가독성 보장)
        const adjusted = luminance(colorToUse) > 0.55
          ? shadeColor(colorToUse, 0.3)
          : colorToUse;
        cmd.params.fontColor = rgbaToParam(adjusted);
        brandApplyCount++;
      }
    }
  }
}

// ─── 네이밍 규칙 정규화 ─────────────────────────────────────────
// 현업 피그마 파일 기준 레이어 네이밍 컨벤션 적용
// 외주 납품 수준의 정리된 파일 구조를 보장한다.

/** 섹션 타입 → 표준 영문명 매핑 */
const SECTION_NAME_MAP: Record<string, string> = {
  hero: 'Hero', 'hero section': 'Hero', 'hero-section': 'Hero',
  problem: 'Problem', pain: 'Problem', 'pain point': 'Problem',
  solution: 'Solution', benefit: 'Benefits', benefits: 'Benefits',
  feature: 'Features', features: 'Features',
  testimonial: 'Testimonials', testimonials: 'Testimonials', review: 'Testimonials',
  guarantee: 'Guarantee', trust: 'Trust',
  cta: 'CTA', 'call to action': 'CTA', urgency: 'CTA',
  footer: 'Footer',
  price: 'Pricing', pricing: 'Pricing',
  faq: 'FAQ', gallery: 'Gallery',
  about: 'About', story: 'Story', brand: 'Brand',
  process: 'Process', howto: 'How-To', 'how-to': 'How-To',
  stats: 'Stats', numbers: 'Stats',
  comparison: 'Comparison', spec: 'Specs', specs: 'Specs',
};

/** 노드 역할 감지 → 표준 이름 반환 */
function classifyNodeRole(name: string, cmd: FigmaCommand): string {
  const lower = name.toLowerCase();
  const command = cmd.command;

  // 텍스트 노드 분류
  if (command === 'create_text') {
    const fontSize = cmd.params.fontSize as number;
    const fontWeight = cmd.params.fontWeight as number;

    if (fontSize >= 60 || fontWeight >= 800) return 'Heading';
    if (fontSize >= 48 && fontWeight >= 600) return 'Title';
    if (fontSize >= 40 && fontWeight >= 500) return 'Subtitle';
    if (/price|가격|원|₩/i.test(lower)) return 'Price';
    if (/label|라벨|badge|뱃지|tag|태그/i.test(lower)) return 'Label';
    if (/caption|캡션|small/i.test(lower)) return 'Caption';
    if (/cta|button/i.test(lower)) return 'Button-Text';
    if (/star|별|⭐/i.test(lower)) return 'Rating';
    return 'Body-Text';
  }

  // 이미지 노드 (RECTANGLE)
  if (command === 'create_rectangle') {
    if (/\[이미지\]|\[image\]/i.test(lower)) {
      const desc = lower
        .replace(/\[이미지\]\s*/i, '')
        .replace(/\[image\]\s*/i, '')
        .trim();
      return desc ? `[Image] ${toTitleCase(desc)}` : '[Image] Placeholder';
    }
    if (/image|img|이미지|photo|사진|hero.*image|banner|thumbnail/i.test(lower)) {
      return `[Image] ${toTitleCase(name.replace(/image|img|이미지|photo|사진/gi, '').trim()) || 'Main'}`;
    }
    if (/divider|구분선|line/i.test(lower)) return 'Divider';
    return name;
  }

  // 프레임 노드 분류
  if (command === 'create_frame') {
    if (/button|cta.*btn|btn/i.test(lower)) return 'CTA-Button';
    if (/card.*grid|grid|card.*wrap/i.test(lower)) return 'Card-Grid';
    if (/card/i.test(lower)) {
      const num = lower.match(/\d+/);
      return num ? `Card-${num[0].padStart(2, '0')}` : 'Card';
    }
    if (/overlay|gradient.*overlay/i.test(lower)) return 'Overlay';
    if (/header|section.*header/i.test(lower)) return 'Section-Header';
    if (/content|wrapper|container/i.test(lower)) return 'Content';
    if (/icon|아이콘/i.test(lower)) {
      const desc = lower.replace(/icon|아이콘/gi, '').trim();
      return desc ? `Icon / ${toTitleCase(desc)}` : 'Icon';
    }
    if (/badge|뱃지|tag.*frame/i.test(lower)) return 'Badge';
    if (/stat|수치|number/i.test(lower)) return 'Stat-Box';
  }

  // ELLIPSE
  if (command === 'create_ellipse') {
    if (/profile|프로필/i.test(lower)) return '[Image] Profile';
    if (/icon|아이콘/i.test(lower)) return 'Icon';
    return 'Decoration';
  }

  return name;
}

// ===== 프리미엄 비주얼 후처리 함수 3개 =====

/**
 * 장식/오버레이 프레임에 블렌드 모드 자동 적용
 * - overlay/gradient 이름 → MULTIPLY
 * - decoration-glow/bokeh → SCREEN
 * - decoration-shape → SOFT_LIGHT
 * - 구조적 프레임(섹션/카드/버튼)은 건드리지 않음
 */
function addBlendModeEffects(commands: FigmaCommand[]): void {
  const STRUCTURAL_PATTERN = /section|hero|cta|footer|content|wrapper|inner|header|card|button|btn|badge|tag|pill|price|item|grid|row|column|text-area|body/i;

  for (const cmd of commands) {
    if (cmd.command !== 'create_frame') continue;
    const name = ((cmd.params.name as string) || '').toLowerCase();

    // 구조적 프레임 건너뜀
    if (STRUCTURAL_PATTERN.test(name)) continue;

    // 이미 set_blend_mode가 존재하면 건너뜀
    const nodeRef = `$${cmd.id}`;
    const hasBlend = commands.some(c => c.command === 'set_blend_mode' && c.params.nodeId === nodeRef);
    if (hasBlend) continue;

    let blendMode: string | null = null;

    if (/overlay|gradient-overlay|dim/i.test(name)) {
      blendMode = 'MULTIPLY';
    } else if (/glow|bokeh|light|radial-bg/i.test(name)) {
      blendMode = 'SCREEN';
    } else if (/decoration-shape|shape|orb|blob/i.test(name)) {
      blendMode = 'SOFT_LIGHT';
    }

    if (blendMode) {
      commands.push({
        id: nextCmdId(),
        command: 'set_blend_mode',
        params: { nodeId: nodeRef, blendMode },
        group: cmd.group,
        description: 'auto blend mode',
      });
    }
  }
}

/**
 * 장식 도형에 회전 자동 적용 (15~45도)
 * - decoration-shape/orb/blob 이름 매칭
 * - 이미지/카드/버튼/구분선 제외
 */
function addDecorationRotation(commands: FigmaCommand[]): void {
  const ROTATION_ANGLES = [15, -20, 30, -15, 45, -30, 25, -45];
  let rotIdx = 0;

  const SKIP_PATTERN = /image|img|photo|card|button|btn|divider|separator|line|text|content|header|section|hero|cta|footer/i;

  for (const cmd of commands) {
    if (cmd.command !== 'create_rectangle' && cmd.command !== 'create_ellipse') continue;
    const name = ((cmd.params.name as string) || '').toLowerCase();

    if (SKIP_PATTERN.test(name)) continue;
    if (!/decoration|shape|orb|blob|accent-shape|bg-shape/i.test(name)) continue;

    // 이미 set_rotation이 존재하면 건너뜀
    const nodeRef = `$${cmd.id}`;
    const hasRotation = commands.some(c => c.command === 'set_rotation' && c.params.nodeId === nodeRef);
    if (hasRotation) continue;

    const angle = ROTATION_ANGLES[rotIdx % ROTATION_ANGLES.length];
    rotIdx++;

    commands.push({
      id: nextCmdId(),
      command: 'set_rotation',
      params: { nodeId: nodeRef, rotation: angle },
      group: cmd.group,
      description: 'auto decoration rotation',
    });
  }
}

/**
 * 텍스트 내 숫자/키워드를 자동 강조 (set_range_text_style)
 * - 숫자 패턴: 73%, 1,500+, ₩39,900, 30일, 24시간
 * - 키워드: 무료, 한정, 특가, 즉시, 할인, 보장, 업계최초
 * - 제목급(fontSize≥36)은 건너뜀
 * - 텍스트당 최대 3개 range
 */
function addRangeTextStyles(
  commands: FigmaCommand[],
  brandColor: RGBAColor | null,
  accentColor: RGBAColor | null,
): void {
  if (!brandColor && !accentColor) return;

  // 숫자 패턴: "73%" "1,500+" "₩39,900" "30일" "24시간" "100만" "3개월" "#1"
  const NUMBER_PATTERN = /(?:₩\s*)?[\d,]+(?:\.\d+)?(?:\s*[%+]|만|억|원|일|시간|개월|명|건|곳|위|배|종|가지|년|개)?(?:\+)?/g;
  // 강조 키워드
  const KEYWORD_PATTERN = /무료|한정|특가|즉시|할인|보장|업계\s*최초|지금|오늘|마감|최대|최저|단독|독점|평생|영구|0원|100%/g;

  // 어두운 배경 섹션의 텍스트인지 판단하기 위해 부모 배경색 수집
  const parentBgMap = new Map<string, RGBAColor>();
  for (const cmd of commands) {
    if (cmd.command === 'create_frame' && cmd.params.fillColor) {
      parentBgMap.set(cmd.id, cmd.params.fillColor as RGBAColor);
    }
    if (cmd.command === 'set_fill_color' && cmd.params.nodeId && cmd.params.color) {
      const refId = (cmd.params.nodeId as string).replace('$', '');
      parentBgMap.set(refId, cmd.params.color as RGBAColor);
    }
  }

  const highlightColor = brandColor || accentColor!;
  const brightHighlight = accentColor
    ? (luminance(accentColor) > 0.4 ? accentColor : tintColor(accentColor, 0.3))
    : tintColor(highlightColor, 0.3);

  for (const cmd of commands) {
    if (cmd.command !== 'create_text') continue;

    const text = cmd.params.text as string;
    if (!text || text.length < 3) continue;

    const fontSize = (cmd.params.fontSize as number) || 18;
    // 제목급 텍스트는 이미 눈에 띄므로 건너뜀
    if (fontSize >= 36) continue;

    // 이미 range style이 있으면 건너뜀
    const nodeRef = `$${cmd.id}`;
    const hasRange = commands.some(c => c.command === 'set_range_text_style' && c.params.nodeId === nodeRef);
    if (hasRange) continue;

    // 부모 배경 밝기 확인
    const parentId = (cmd.params.parentId as string || '').replace('$', '');
    const parentBg = parentBgMap.get(parentId);
    const isDark = parentBg ? luminance(parentBg) < 0.35 : false;
    const useColor = isDark ? brightHighlight : highlightColor;

    // 숫자+키워드 매칭
    const ranges: Array<{ start: number; end: number; bold: boolean }> = [];

    let m: RegExpExecArray | null;
    NUMBER_PATTERN.lastIndex = 0;
    while ((m = NUMBER_PATTERN.exec(text)) !== null) {
      if (m[0].length >= 2) {
        ranges.push({ start: m.index, end: m.index + m[0].length, bold: true });
      }
    }

    KEYWORD_PATTERN.lastIndex = 0;
    while ((m = KEYWORD_PATTERN.exec(text)) !== null) {
      // 기존 range와 겹치지 않는지 확인
      const overlap = ranges.some(r => m!.index < r.end && (m!.index + m![0].length) > r.start);
      if (!overlap) {
        ranges.push({ start: m.index, end: m.index + m[0].length, bold: false });
      }
    }

    // 최대 3개만
    const topRanges = ranges.slice(0, 3);

    for (const r of topRanges) {
      commands.push({
        id: nextCmdId(),
        command: 'set_range_text_style',
        params: {
          nodeId: nodeRef,
          start: r.start,
          end: r.end,
          fontColor: rgbaToParam(useColor),
          ...(r.bold ? { fontStyle: 'Bold' } : {}),
        },
        group: cmd.group,
        description: 'auto range highlight',
      });
    }
  }
}

/** 문자열을 Title Case로 변환 */
function toTitleCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('-');
}

/**
 * 모든 커맨드의 name을 현업 네이밍 컨벤션으로 정규화한다.
 *
 * 규칙:
 * - 섹션 프레임: `{2자리번호}_{영문명}` (예: 01_Hero, 02_Problem)
 * - 내부 컨테이너: `{섹션영문} / {역할}` (예: Hero / Content)
 * - 텍스트: 역할 기반 (Heading, Subtitle, Body-Text, Price, Label)
 * - 이미지: `[Image] {설명}` (예: [Image] Hero-Main)
 * - 버튼: `CTA-Button`, `Secondary-Button`
 * - 카드: `Card-01`, `Card-02`
 * - 아이콘: `Icon / {설명}`
 * - 장식: `Divider`, `Badge`, `Decoration`
 */
function normalizeLayerNames(commands: FigmaCommand[]): void {
  const rootCmdId = commands[0]?.id;
  if (!rootCmdId) return;

  // 루트 프레임 이름 설정
  if (commands[0].command === 'create_frame') {
    commands[0].params.name = '상세페이지';
  }

  // 1단계: 섹션 프레임 식별 + 번호 매기기
  const sectionCmds = commands.filter(
    c => c.command === 'create_frame' && c.params.parentId === `$${rootCmdId}`
  );

  const sectionIdToName = new Map<string, string>();
  sectionCmds.forEach((cmd, index) => {
    const rawName = ((cmd.params.name as string) || '').toLowerCase().trim();
    const num = String(index + 1).padStart(2, '0');

    // 섹션명 추출: 기존 이름에서 매핑하거나 생성
    let sectionLabel = 'Section';
    for (const [key, value] of Object.entries(SECTION_NAME_MAP)) {
      if (rawName.includes(key)) {
        sectionLabel = value;
        break;
      }
    }

    // "Section_01_Hero" 같은 기존 패턴에서 추출
    const sectionMatch = rawName.match(/section[_\s-]*\d*[_\s-]*(\w+)/i);
    if (sectionMatch) {
      const extracted = sectionMatch[1].toLowerCase();
      if (SECTION_NAME_MAP[extracted]) {
        sectionLabel = SECTION_NAME_MAP[extracted];
      }
    }

    const standardName = `${num}_${sectionLabel}`;
    cmd.params.name = standardName;
    sectionIdToName.set(cmd.id, sectionLabel);
  });

  // 2단계: 커맨드 → 소속 섹션 매핑 구축
  const cmdToSectionLabel = new Map<string, string>();
  for (const cmd of commands) {
    const parentRef = cmd.params.parentId as string | undefined;
    if (!parentRef) continue;
    const parentId = parentRef.replace('$', '');

    if (sectionIdToName.has(parentId)) {
      cmdToSectionLabel.set(cmd.id, sectionIdToName.get(parentId)!);
    } else if (cmdToSectionLabel.has(parentId)) {
      cmdToSectionLabel.set(cmd.id, cmdToSectionLabel.get(parentId)!);
    }
  }

  // 3단계: 각 커맨드 이름 정규화
  // 섹션 내 같은 역할 카운터 (Card-01, Card-02 등)
  const sectionRoleCounters = new Map<string, Map<string, number>>();

  for (const cmd of commands) {
    // 루트 프레임과 섹션 프레임은 이미 처리됨
    if (cmd.id === rootCmdId) continue;
    if (sectionIdToName.has(cmd.id)) continue;

    const sectionLabel = cmdToSectionLabel.get(cmd.id);
    if (!sectionLabel) continue;

    const rawName = (cmd.params.name as string) || '';
    const role = classifyNodeRole(rawName, cmd);

    // 카운터 관리 (같은 섹션 내 동일 역할 번호 매기기)
    if (!sectionRoleCounters.has(sectionLabel)) {
      sectionRoleCounters.set(sectionLabel, new Map());
    }
    const counters = sectionRoleCounters.get(sectionLabel)!;

    let finalName: string;

    // 텍스트/이미지/프레임에 따라 네이밍 패턴 적용
    if (role.startsWith('[Image]') || role.startsWith('Icon /')) {
      // 이미지/아이콘: 섹션명 / 역할
      finalName = `${sectionLabel} / ${role}`;
    } else if (role === 'Card' || role.startsWith('Card-')) {
      // 카드: 자동 번호 매기기
      const count = (counters.get('Card') || 0) + 1;
      counters.set('Card', count);
      finalName = `${sectionLabel} / Card-${String(count).padStart(2, '0')}`;
    } else if (cmd.command === 'create_text') {
      // 텍스트: 섹션명 / 역할
      const count = (counters.get(role) || 0) + 1;
      counters.set(role, count);
      // 같은 역할이 여러 개면 번호 추가
      finalName = count > 1
        ? `${sectionLabel} / ${role}-${String(count).padStart(2, '0')}`
        : `${sectionLabel} / ${role}`;
    } else if (cmd.command === 'create_frame') {
      // 프레임: 섹션명 / 역할
      finalName = `${sectionLabel} / ${role}`;
    } else if (cmd.command === 'create_rectangle') {
      // 사각형: 이미지가 아니면 섹션명 / 역할
      finalName = `${sectionLabel} / ${role}`;
    } else {
      finalName = `${sectionLabel} / ${role}`;
    }

    cmd.params.name = finalName;

    // description도 업데이트 (읽기 쉽게)
    if (cmd.description) {
      cmd.description = finalName;
    }
  }
}

/**
 * ★ normalizeLayerNames 후 정규화된 이름으로 폰트 크기 재검증
 * AI가 "text" 같은 generic 이름으로 생성 → enforceMinFontSize에서 패턴 미매칭 → 16px 그대로
 * normalizeLayerNames가 "Hero / Heading"으로 변환 후 → 이 함수에서 52px 최소값 적용
 */
function reEnforceMinFontSize(commands: FigmaCommand[]): void {
  for (const cmd of commands) {
    if (cmd.command !== 'create_text') continue;

    const name = (cmd.params.name as string) || '';
    const text = (cmd.params.text as string) || '';
    const fontSize = cmd.params.fontSize as number;

    if (!fontSize) continue;

    const newSize = enforceMinFontSize(fontSize, name, text);
    if (newSize !== fontSize) {
      cmd.params.fontSize = newSize;
    }
  }
}

/**
 * ★ 레이아웃 정렬 보정
 * AI가 잘못 생성하는 레이아웃 패턴을 일괄 수정:
 * 1) VERTICAL 부모 안의 자식 프레임이 HUG → FILL로 강제 (오버플로 방지)
 * 2) CTA 버튼 텍스트 너무 큰 경우 축소
 * 3) 섹션 좌우 패딩 표준화 (40~80px 범위)
 */
function fixLayoutAlignment(commands: FigmaCommand[]): void {
  const rootCmdId = commands[0]?.id;
  if (!rootCmdId) return;

  // 1. 부모-자식 관계 맵 구축
  const parentMap = new Map<string, string>();
  const childrenMap = new Map<string, string[]>();
  const cmdMap = new Map<string, FigmaCommand>();

  // 프레임 이름 맵 (이미지 최소 높이에서 소속 섹션 판별용)
  const frameNames = new Map<string, string>();

  for (const cmd of commands) {
    cmdMap.set(cmd.id, cmd);
    if (cmd.command === 'create_frame') {
      frameNames.set(cmd.id, (cmd.params.name as string) || '');
    }
    const parentRef = cmd.params.parentId as string | undefined;
    if (!parentRef) continue;
    const parentId = parentRef.replace('$', '');
    parentMap.set(cmd.id, parentId);
    if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
    childrenMap.get(parentId)!.push(cmd.id);
  }

  // 2. 섹션 레벨 프레임 (루트 직계 자식)
  const sectionIds = new Set<string>();
  const sectionLayoutModes = new Map<string, string>();
  for (const cmd of commands) {
    if (cmd.command === 'create_frame' && cmd.params.parentId === `$${rootCmdId}`) {
      sectionIds.add(cmd.id);
      sectionLayoutModes.set(cmd.id, (cmd.params.layoutMode as string) || 'VERTICAL');
    }
  }

  // 3. VERTICAL 섹션 안의 자식 프레임: HUG → FILL 강제
  const functionalPattern = /button|btn|cta-button|card|badge|tag|pill|chip|price|box|item|divider|image|img|icon|logo|rectangle/i;

  for (const cmd of commands) {
    if (cmd.command !== 'create_frame') continue;

    const parentId = parentMap.get(cmd.id);
    if (!parentId) continue;

    // 섹션 직계 자식이거나, 섹션 내부 VERTICAL 프레임의 자식
    const parentCmd = cmdMap.get(parentId);
    if (!parentCmd || parentCmd.command !== 'create_frame') continue;

    const parentLayout = (parentCmd.params.layoutMode as string) || '';
    if (parentLayout !== 'VERTICAL') continue;

    const name = (cmd.params.name as string) || '';
    const currentHSizing = cmd.params.layoutSizingHorizontal as string | undefined;

    // HUG인 프레임 중 기능적 프레임이 아닌 것 → FILL
    if (currentHSizing === 'HUG' && !functionalPattern.test(name)) {
      cmd.params.layoutSizingHorizontal = 'FILL';
    }
  }

  // 4. 텍스트 노드: VERTICAL 부모 안에서 FILL 강제 (텍스트가 부모 너비를 채우도록)
  for (const cmd of commands) {
    if (cmd.command !== 'create_text') continue;

    const parentId = parentMap.get(cmd.id);
    if (!parentId) continue;

    const parentCmd = cmdMap.get(parentId);
    if (!parentCmd || parentCmd.command !== 'create_frame') continue;

    const parentLayout = (parentCmd.params.layoutMode as string) || '';
    if (parentLayout !== 'VERTICAL') continue;

    // 텍스트가 HUG/FIXED로 되어있으면 FILL로 교정
    const textHSizing = cmd.params.layoutSizingHorizontal as string | undefined;
    if (!textHSizing || textHSizing === 'HUG' || textHSizing === 'FIXED') {
      cmd.params.layoutSizingHorizontal = 'FILL';
    }
  }

  // 5. CTA 버튼 텍스트가 너무 크면 축소 (500px 안에 1줄 들어가도록)
  for (const cmd of commands) {
    if (cmd.command !== 'create_text') continue;

    const name = (cmd.params.name as string) || '';
    if (!/cta.*button|button.*cta|cta-button/i.test(name) && !/cta.*title/i.test(name)) continue;

    const fontSize = cmd.params.fontSize as number | undefined;
    const text = (cmd.params.characters as string) || '';

    // 한글 기준: 글자당 대략 fontSize 폭. 500px에 들어가려면...
    if (fontSize && text && fontSize > 20) {
      const approxWidth = text.length * fontSize * 0.85; // 한글은 폭이 거의 fontSize와 같음
      const maxWidth = 500; // CTA 버튼 내부 가용 폭
      if (approxWidth > maxWidth) {
        const newSize = Math.max(20, Math.floor(maxWidth / (text.length * 0.85)));
        cmd.params.fontSize = Math.min(fontSize, Math.max(newSize, 28));
      }
    }
  }

  // 6. Process/Step 프레임의 아이콘-텍스트 세로 중앙 정렬
  for (const cmd of commands) {
    if (cmd.command !== 'create_frame') continue;
    const name = ((cmd.params.name as string) || '').toLowerCase();
    // Step 프레임 감지: HORIZONTAL 레이아웃에서 아이콘+텍스트 정렬
    if (/step|item/i.test(name) && cmd.params.layoutMode === 'HORIZONTAL') {
      cmd.params.counterAxisAlignItems = 'CENTER';
    }
  }

  // 7. 섹션 좌우 패딩 표준화
  // Hero/CTA/Gallery 등 이미지 섹션은 패딩 0 유지 (풀블리드)
  // 나머지 섹션은 40~80px 범위로 제한
  for (const cmd of commands) {
    if (!sectionIds.has(cmd.id)) continue;

    const name = ((cmd.params.name as string) || '').toLowerCase();
    const isImageSection = /hero|cta|gallery|banner|visual/i.test(name);

    // 이미지 섹션은 좌우 패딩 0 강제 (풀블리드)
    if (isImageSection) {
      cmd.params.paddingLeft = 0;
      cmd.params.paddingRight = 0;
      continue;
    }

    const pL = cmd.params.paddingLeft as number | undefined;
    const pR = cmd.params.paddingRight as number | undefined;

    if (pL != null && pL < 40) cmd.params.paddingLeft = 40;
    if (pR != null && pR < 40) cmd.params.paddingRight = 40;
    if (pL != null && pL > 100) cmd.params.paddingLeft = 80;
    if (pR != null && pR > 100) cmd.params.paddingRight = 80;
  }

  // 8. 이미지 RECTANGLE: FILL 강제 + 섹션별 최소 높이 보정
  for (const cmd of commands) {
    if (cmd.command !== 'create_rectangle') continue;
    const name = ((cmd.params.name as string) || '').toLowerCase();
    const isImage = /image|img|이미지|photo|사진|gallery|hero|banner|thumbnail|poster|visual|\[이미지\]/i.test(name);
    if (!isImage) continue;

    const parentId = parentMap.get(cmd.id);
    if (!parentId) continue;

    // FILL 강제
    cmd.params.layoutSizingHorizontal = 'FILL';

    // 섹션 타입별 최소 높이 (임팩트 있는 이미지)
    const height = cmd.params.height as number || 0;
    // 부모 체인을 타고 올라가서 소속 섹션 이름 파악
    let sectionName = '';
    let cur = cmd.id;
    for (let d = 0; d < 20; d++) {
      const p = parentMap.get(cur);
      if (!p) break;
      const pName = frameNames.get(p) || '';
      if (/^section/i.test(pName)) { sectionName = pName; break; }
      cur = p;
    }

    let minHeight: number;
    if (/hero/i.test(name) || /hero/i.test(sectionName)) {
      minHeight = 800;
    } else if (/banner|cta/i.test(sectionName)) {
      minHeight = 600;
    } else if (/benefit|solution|process|comparison/i.test(sectionName)) {
      minHeight = 550;
    } else if (/thumbnail|profile|avatar|badge|trust|partner|logo/i.test(name)) {
      minHeight = 0; // 프로필/배지/로고는 강제하지 않음
    } else {
      minHeight = 480;
    }
    if (minHeight > 0 && height < minHeight) {
      cmd.params.height = minHeight;
    }
  }

  // 기존 set_layout_sizing 커맨드에서도 이미지 노드 FILL 강제
  const imageRectIds = new Set<string>();
  for (const cmd of commands) {
    if (cmd.command !== 'create_rectangle') continue;
    const name = ((cmd.params.name as string) || '').toLowerCase();
    if (/image|img|이미지|photo|사진|gallery|hero|banner|thumbnail|poster|visual|\[이미지\]/i.test(name)) {
      imageRectIds.add(cmd.id);
    }
  }
  for (const cmd of commands) {
    if (cmd.command !== 'set_layout_sizing') continue;
    const nodeRef = cmd.params.nodeId as string | undefined;
    if (!nodeRef) continue;
    const nodeId = nodeRef.replace('$', '');
    if (imageRectIds.has(nodeId)) {
      cmd.params.layoutSizingHorizontal = 'FILL';
    }
  }
}

/**
 * ★ 섹션 레벨 텍스트 중앙정렬 보정
 * 섹션 직계 또는 섹션 Content 래퍼 직계의 제목/부제목/설명 텍스트를 CENTER 정렬로 보정.
 * 카드/아이템 내부 텍스트는 LEFT 유지.
 */
function fixSectionTextAlignment(commands: FigmaCommand[]): void {
  const rootCmdId = commands[0]?.id;
  if (!rootCmdId) return;

  // 부모-자식 관계 맵
  const parentMap = new Map<string, string>();
  const cmdMap = new Map<string, FigmaCommand>();
  for (const cmd of commands) {
    cmdMap.set(cmd.id, cmd);
    const parentRef = cmd.params.parentId as string | undefined;
    if (!parentRef) continue;
    parentMap.set(cmd.id, parentRef.replace('$', ''));
  }

  // 섹션 ID 수집 (루트 직계 자식 프레임)
  const sectionIds = new Set<string>();
  for (const cmd of commands) {
    if (cmd.command === 'create_frame' && cmd.params.parentId === `$${rootCmdId}`) {
      sectionIds.add(cmd.id);
    }
  }

  // 섹션 직계 자식 중 Content/Wrapper 프레임 ID 수집
  const sectionContentIds = new Set<string>();
  for (const cmd of commands) {
    if (cmd.command !== 'create_frame') continue;
    const parentId = parentMap.get(cmd.id);
    if (!parentId || !sectionIds.has(parentId)) continue;
    const name = ((cmd.params.name as string) || '').toLowerCase();
    // Content, Header, Wrapper, Overlay 등 구조 프레임
    if (/content|header|wrapper|overlay|text|info|detail/i.test(name)) {
      sectionContentIds.add(cmd.id);
    }
  }

  // 카드/아이템 프레임 감지 (이 안의 텍스트는 LEFT 유지)
  const cardFrameIds = new Set<string>();
  for (const cmd of commands) {
    if (cmd.command !== 'create_frame') continue;
    const name = ((cmd.params.name as string) || '').toLowerCase();
    if (/card|item|step|review|testimonial|feature.?card|benefit.?card/i.test(name)) {
      cardFrameIds.add(cmd.id);
    }
  }

  // 카드 내부 여부 판별 (부모 체인에 카드가 있는지)
  function isInsideCard(cmdId: string): boolean {
    let current = cmdId;
    let depth = 0;
    while (depth < 15) {
      const parent = parentMap.get(current);
      if (!parent) return false;
      if (cardFrameIds.has(parent)) return true;
      current = parent;
      depth++;
    }
    return false;
  }

  // HORIZONTAL 부모 안의 텍스트는 LEFT 유지
  function isInHorizontalParent(cmdId: string): boolean {
    const parentId = parentMap.get(cmdId);
    if (!parentId) return false;
    const parentCmd = cmdMap.get(parentId);
    if (!parentCmd) return false;
    return (parentCmd.params.layoutMode as string) === 'HORIZONTAL';
  }

  for (const cmd of commands) {
    if (cmd.command !== 'create_text') continue;

    const parentId = parentMap.get(cmd.id);
    if (!parentId) continue;

    // 섹션 직계 또는 섹션 Content 직계인 텍스트만 대상
    const isSectionDirect = sectionIds.has(parentId);
    const isSectionContentDirect = sectionContentIds.has(parentId);
    if (!isSectionDirect && !isSectionContentDirect) continue;

    // 카드 내부면 스킵
    if (isInsideCard(cmd.id)) continue;
    // HORIZONTAL 부모면 스킵
    if (isInHorizontalParent(cmd.id)) continue;

    const name = ((cmd.params.name as string) || '').toLowerCase();
    // CTA 버튼 텍스트는 이미 CENTER
    if (/cta.*text|button.*text/i.test(name)) continue;

    // 섹션 레벨 제목, 부제목, 설명 → CENTER
    const isHeadingLike = /heading|title|subtitle|sub|tagline|label|caption|body|desc/i.test(name);
    const fontSize = cmd.params.fontSize as number || 0;
    // 섹션 직계면 fontSize 관계없이 CENTER, Content 직계면 heading/subtitle/body 이름 매칭
    if (isSectionDirect || isHeadingLike || fontSize >= 24) {
      cmd.params.textAlignHorizontal = 'CENTER';
    }
  }
}

/**
 * ★ 텍스트 끝 불필요한 쉼표 제거
 * AI가 줄바꿈 위치에 쉼표를 넣는 문제 해결.
 * - 텍스트 맨 끝 쉼표 제거
 * - 줄바꿈(\n) 앞 쉼표 제거
 * - 문장 중간의 정상적인 쉼표는 유지
 */
function stripTrailingCommas(commands: FigmaCommand[]): void {
  for (const cmd of commands) {
    if (cmd.command !== 'create_text') continue;
    let text = cmd.params.text as string;
    if (!text) continue;

    // 줄바꿈 앞 쉼표 제거: "문장 끝,\n다음 줄" → "문장 끝\n다음 줄"
    text = text.replace(/,\s*\n/g, '\n');
    // 텍스트 맨 끝 쉼표 제거
    text = text.replace(/,\s*$/, '');

    cmd.params.text = text;
  }

  // set_text_content 커맨드에도 적용
  for (const cmd of commands) {
    if (cmd.command !== 'set_text_content') continue;
    let text = cmd.params.text as string;
    if (!text) continue;
    text = text.replace(/,\s*\n/g, '\n');
    text = text.replace(/,\s*$/, '');
    cmd.params.text = text;
  }
}

/**
 * ★ 최종 안전장치: 모든 후처리 완료 후 전체 텍스트 대비 재검증
 * 이전 후처리(배경색 교차, 브랜드 컬러 적용 등)에서 텍스트 색상이 깨진 경우를 최종 보정.
 * 각 텍스트 노드의 실제 가장 가까운 부모 배경색(프레임 fillColor)을 찾아서 대비 확인.
 */
function finalContrastSafetyNet(commands: FigmaCommand[]): void {
  // ★ alpha-aware 배경색: 반투명이면 뒤에 밝은 배경(이미지)이 있다고 가정하고 흰색과 블렌딩
  // 이유: 오버레이 rgba(0,0,0,0.3)을 "어두운 배경"으로 판단하면 흰색 텍스트 → 안 보임
  function toEffectiveBg(fc: RGBAColor): RGBAColor {
    const a = fc.a ?? 1;
    if (a >= 0.85) return fc;
    // 뒤에 이미지/밝은 배경이 있을 수 있으므로 흰색과 블렌딩
    return { r: fc.r * a + 1.0 * (1 - a), g: fc.g * a + 1.0 * (1 - a), b: fc.b * a + 1.0 * (1 - a), a: 1 };
  }

  // 모든 프레임의 배경색 수집 (id → fillColor)
  const frameBgColors = new Map<string, RGBAColor>();
  for (const cmd of commands) {
    if (cmd.command === 'create_frame' && cmd.params.fillColor) {
      frameBgColors.set(cmd.id, toEffectiveBg(cmd.params.fillColor as RGBAColor));
    }
  }

  // set_fill_color 커맨드로 나중에 설정되는 경우도 반영
  for (const cmd of commands) {
    if (cmd.command === 'set_fill_color' && cmd.params.nodeId) {
      const nodeId = (cmd.params.nodeId as string).replace('$', '');
      if (cmd.params.color) {
        frameBgColors.set(nodeId, toEffectiveBg(cmd.params.color as RGBAColor));
      }
    }
  }

  // ★ gradient fill도 수집 (solid fill이 없는 오버레이 프레임의 effective bg)
  // gradient의 가장 밝은 불투명 스톱을 effective bg로 사용 → 밝은 영역에서도 텍스트 가독성 보장
  for (const cmd of commands) {
    if (cmd.command !== 'set_gradient_fill' || !cmd.params.nodeId) continue;
    const nodeId = (cmd.params.nodeId as string).replace('$', '');
    if (frameBgColors.has(nodeId)) continue; // solid fill이 이미 있으면 스킵

    const stops = cmd.params.gradientStops as Array<{ color: RGBAColor; position: number }> | undefined;
    if (!stops || stops.length === 0) continue;

    let lightestColor: RGBAColor | null = null;
    let maxLum = -1;
    for (const stop of stops) {
      if (!stop.color || stop.color.a < 0.3) continue; // 투명 스톱은 무시
      const lum = luminance(stop.color);
      if (lum > maxLum) {
        maxLum = lum;
        lightestColor = stop.color;
      }
    }
    if (lightestColor) {
      frameBgColors.set(nodeId, toEffectiveBg(lightestColor));
    }
  }

  // 각 커맨드의 부모 체인 구축 (id → parentId)
  const parentMap = new Map<string, string>();
  for (const cmd of commands) {
    if (cmd.params.parentId) {
      const parentId = (cmd.params.parentId as string).replace('$', '');
      parentMap.set(cmd.id, parentId);
    }
  }

  // 텍스트 노드마다 가장 가까운 배경색을 찾아 대비 검증
  for (const cmd of commands) {
    if (cmd.command !== 'create_text') continue;

    // 부모 체인을 타고 올라가면서 가장 가까운 배경색 찾기
    let effectiveBg: RGBAColor | null = null;
    let currentId = cmd.id;
    let depth = 0;
    while (depth < 20) {
      const parentId = parentMap.get(currentId);
      if (!parentId) break;
      if (frameBgColors.has(parentId)) {
        effectiveBg = frameBgColors.get(parentId)!;
        break;
      }
      currentId = parentId;
      depth++;
    }

    // ★ 배경을 못 찾으면 → 밝은 텍스트를 DARK_TEXT로 강제 (흰 배경에 흰 텍스트 방지)
    if (!effectiveBg) {
      const fontColor = cmd.params.fontColor as RGBAColor | undefined;
      const fontLum = fontColor ? luminance(fontColor) : 0.5;
      // 텍스트가 밝으면(흰색/회색 계열) → 무조건 검정으로
      if (fontLum > 0.4) {
        cmd.params.fontColor = rgbaToParam(DARK_TEXT);
      }
      continue;
    }

    const bgLum = luminance(effectiveBg);
    const fontColor = cmd.params.fontColor as RGBAColor | undefined;
    const fontLum = fontColor ? luminance(fontColor) : 0.5;

    // 대비비 계산
    const lighter = Math.max(bgLum, fontLum) + 0.05;
    const darker = Math.min(bgLum, fontLum) + 0.05;
    const contrastRatio = lighter / darker;

    // ★ 대비비 4.5:1 미만이면 강제 보정 (WCAG AA 기준)
    if (contrastRatio < 4.5) {
      const darkLum = luminance(DARK_TEXT);
      const lightLum = luminance(LIGHT_TEXT);
      const darkContrast = (Math.max(bgLum, darkLum) + 0.05) / (Math.min(bgLum, darkLum) + 0.05);
      const lightContrast = (Math.max(bgLum, lightLum) + 0.05) / (Math.min(bgLum, lightLum) + 0.05);
      cmd.params.fontColor = darkContrast >= lightContrast
        ? rgbaToParam(DARK_TEXT)
        : rgbaToParam(LIGHT_TEXT);
    }
  }
}

/**
 * 히어로/CTA 섹션에 이미지가 있으면 모든 텍스트를 어두운 색으로 강제.
 * 오버레이 없이도 텍스트가 읽히도록 한다.
 * - 버튼/배지 내부 텍스트는 제외 (별도 배경이 있으므로).
 * - finalContrastSafetyNet 뒤에 실행하여 최종 오버라이드.
 */
function forceHeroTextDark(commands: FigmaCommand[]): void {
  // 1. Hero/CTA 섹션 ID 수집
  // normalizeLayerNames 후 "01_Hero", "08_CTA" 형태이므로 두 패턴 모두 매칭
  const heroCtaSectionIds = new Set<string>();
  for (const cmd of commands) {
    if (cmd.command !== 'create_frame') continue;
    const name = (cmd.params.name as string) || '';
    if (/hero|cta/i.test(name)) {
      heroCtaSectionIds.add(cmd.id);
    }
  }
  if (heroCtaSectionIds.size === 0) return;

  // 2. 부모 맵 구축
  const parentMap = new Map<string, string>();
  for (const cmd of commands) {
    if (cmd.params.parentId) {
      parentMap.set(cmd.id, (cmd.params.parentId as string).replace('$', ''));
    }
  }

  function isDescendantOf(nodeId: string, ancestorIds: Set<string>): boolean {
    let cur = nodeId;
    let depth = 0;
    while (depth < 30) {
      const parent = parentMap.get(cur);
      if (!parent) return false;
      if (ancestorIds.has(parent)) return true;
      cur = parent;
      depth++;
    }
    return false;
  }

  // 3. 버튼/배지 프레임 ID 수집 (내부 텍스트는 건드리지 않음)
  const excludeFrameIds = new Set<string>();
  for (const cmd of commands) {
    if (cmd.command !== 'create_frame') continue;
    const name = (cmd.params.name as string) || '';
    if (/button|badge|tag|chip/i.test(name)) {
      excludeFrameIds.add(cmd.id);
    }
  }

  function isInsideExcluded(nodeId: string): boolean {
    let cur = nodeId;
    let depth = 0;
    while (depth < 30) {
      const parent = parentMap.get(cur);
      if (!parent) return false;
      if (excludeFrameIds.has(parent)) return true;
      cur = parent;
      depth++;
    }
    return false;
  }

  // 4. Hero/CTA 섹션 내 모든 텍스트를 어두운 색으로 강제 (이미지 유무 상관없이)
  for (const cmd of commands) {
    if (cmd.command !== 'create_text') continue;
    if (!isDescendantOf(cmd.id, heroCtaSectionIds)) continue;
    if (isInsideExcluded(cmd.id)) continue;

    const fontColor = cmd.params.fontColor as RGBAColor | undefined;
    const fontLum = fontColor ? luminance(fontColor) : 0.5;
    // 밝은 텍스트(흰색/회색)만 어둡게 변환
    if (fontLum > 0.4) {
      cmd.params.fontColor = rgbaToParam(DARK_TEXT);
    }
  }
}

/**
 * TreeNode 트리를 FigmaCommand[] flat 배열로 변환한다.
 * AI가 생성한 트리 구조의 품질을 유지하면서 기존 전송 방식과 호환.
 */
export function treeToFlatCommands(tree: TreeNode, options?: TreeToCommandsOptions): FigmaCommand[] {
  cmdCounter = 0;
  currentCanvasWidth = options?.canvasWidth || tree.width || 860;
  const commands: FigmaCommand[] = [];
  flattenNode(tree, null, commands, 'root');

  // 브랜드/강조/보조 컬러 파싱
  const brandRgba = options?.brandColor ? hexToRgbaColor(options.brandColor) : null;
  const accentRgba = options?.accentColor ? hexToRgbaColor(options.accentColor) : null;
  const secondaryRgba = options?.secondaryColor ? hexToRgbaColor(options.secondaryColor) : null;

  // 브랜드 컬러 기반 배경색 팔레트 생성 (카테고리별 다양한 색감)
  const palette = (brandRgba || accentRgba || secondaryRgba)
    ? buildSectionBgPalette(brandRgba, accentRgba, secondaryRgba)
    : DEFAULT_SECTION_BG_PALETTE;

  // 후처리 1: 섹션 배경색 교차 강제 (항상 실행)
  enforceSectionBgAlternation(commands, tree, palette);

  // 후처리 1.5: 오버레이 프레임의 흰색 솔리드 fill 제거 (gradient가 보이도록)
  // overlay/gradient 이름의 프레임만 대상. 카드/박스는 건드리지 않음.
  stripWhiteFillsInDarkSections(commands);

  // 후처리 2: 버튼 텍스트 색상 보정
  fixButtonTextColors(commands);

  // 후처리 3: 소제목/라벨에 브랜드 컬러 적용
  applyBrandColorToAccentTexts(commands, brandRgba, accentRgba);

  // 후처리 3.5: 장식/오버레이 프레임에 블렌드 모드 자동 적용
  addBlendModeEffects(commands);

  // 후처리 3.6: 장식 도형 회전 자동 적용
  addDecorationRotation(commands);

  // 후처리 3.7: 숫자/키워드 자동 강조 (set_range_text_style)
  addRangeTextStyles(commands, brandRgba, accentRgba);

  // 후처리 4: 현업 네이밍 컨벤션 적용
  normalizeLayerNames(commands);

  // 후처리 4.5: ★ 정규화된 이름 기반 폰트 크기 재검증
  // normalizeLayerNames 후 "Hero / Heading" 등 정규화된 이름으로 최소 폰트 크기 재적용
  reEnforceMinFontSize(commands);

  // 후처리 5: ★ 레이아웃 정렬 보정 (HUG→FILL, 텍스트 FILL, 버튼 텍스트 축소, 패딩 표준화, 이미지 FILL)
  fixLayoutAlignment(commands);

  // 후처리 5.5: ★ 섹션 레벨 텍스트 중앙정렬 보정
  fixSectionTextAlignment(commands);

  // 후처리 5.7: ★ 텍스트 끝 불필요한 쉼표 제거
  stripTrailingCommas(commands);

  // 후처리 6: ★ 최종 안전장치 — 모든 텍스트 대비 재검증
  // 이전 후처리(배경색 교차, 브랜드 컬러 적용 등)로 텍스트가 안 보이게 된 경우 최종 보정
  finalContrastSafetyNet(commands);

  // 후처리 7: ★ 히어로/CTA에 이미지가 있으면 텍스트를 어두운 색으로 강제
  // 오버레이 없이도 텍스트가 잘 보이도록. finalContrastSafetyNet 뒤에 실행하여 최종 오버라이드.
  forceHeroTextDark(commands);

  return commands;
}
