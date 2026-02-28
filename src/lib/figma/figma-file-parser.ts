/**
 * Figma REST API 기반 파일 구조 파서
 * 피그마 파일 URL에서 프레임 구조, 텍스트 스타일, 색상 팔레트, 효과를 추출한다.
 * 결과를 ReferenceAnalysis 호환 형식으로 변환하여 프롬프트에 주입 가능.
 */

import type {
  RGBAColor,
  FigmaFileAnalysis,
  FigmaTextStyle,
  ReferenceAnalysis,
  DetailedSection,
  SectionElement,
  GradientDef,
} from './types';

const FIGMA_API_BASE = 'https://api.figma.com/v1';

/** 피그마 URL에서 파일 키를 추출 */
export function extractFileKey(url: string): string | null {
  // https://www.figma.com/design/FILE_KEY/...
  // https://www.figma.com/file/FILE_KEY/...
  const match = url.match(/figma\.com\/(?:design|file)\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

/** Figma REST API에서 파일 JSON을 가져온다 */
async function fetchFigmaFile(fileKey: string, token: string, depth: number = 3): Promise<FigmaApiResponse> {
  const url = `${FIGMA_API_BASE}/files/${fileKey}?depth=${depth}`;
  const response = await fetch(url, {
    headers: { 'X-Figma-Token': token },
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Figma API error ${response.status}: ${text}`);
  }

  return response.json() as Promise<FigmaApiResponse>;
}

// ===== Figma API 응답 타입 (간소화) =====

interface FigmaApiResponse {
  name: string;
  document: FigmaNode;
  components: Record<string, unknown>;
}

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  // 스타일
  fills?: FigmaFill[];
  strokes?: FigmaStroke[];
  strokeWeight?: number;
  effects?: FigmaEffect[];
  cornerRadius?: number;
  opacity?: number;
  // 레이아웃
  layoutMode?: string;
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  itemSpacing?: number;
  layoutSizingHorizontal?: string;
  layoutSizingVertical?: string;
  // 크기/위치
  absoluteBoundingBox?: { x: number; y: number; width: number; height: number };
  size?: { x: number; y: number };
  // 텍스트
  characters?: string;
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: number;
    lineHeightPx?: number;
    letterSpacing?: number;
    textAlignHorizontal?: string;
  };
}

interface FigmaFill {
  type: string;
  color?: { r: number; g: number; b: number; a: number };
  opacity?: number;
  visible?: boolean;
  gradientStops?: Array<{ color: { r: number; g: number; b: number; a: number }; position: number }>;
}

interface FigmaStroke {
  type: string;
  color?: { r: number; g: number; b: number; a: number };
}

interface FigmaEffect {
  type: string;
  color?: { r: number; g: number; b: number; a: number };
  offset?: { x: number; y: number };
  radius?: number;
  spread?: number;
  visible?: boolean;
}

// ===== 색상 유틸 =====

function rgbaToHex(c: { r: number; g: number; b: number; a?: number }): string {
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(c.r)}${toHex(c.g)}${toHex(c.b)}`;
}

function toRGBA(c: { r: number; g: number; b: number; a?: number }): RGBAColor {
  return { r: c.r, g: c.g, b: c.b, a: c.a ?? 1 };
}

// ===== 노드 트리 순회 =====

interface ColorEntry {
  hex: string;
  rgba: RGBAColor;
  usage: 'fill' | 'text' | 'stroke';
}

interface TextEntry extends FigmaTextStyle {
  characters: string;
}

function collectFromTree(
  node: FigmaNode,
  colors: ColorEntry[],
  texts: TextEntry[],
  images: Array<{ name: string; width: number; height: number }>,
  frames: Array<{ name: string; type: string; node: FigmaNode }>,
  depth: number = 0,
  maxDepth: number = 1,
): void {
  // 색상 수집 (fills)
  if (node.fills) {
    for (const fill of node.fills) {
      if (fill.visible === false) continue;
      if (fill.type === 'SOLID' && fill.color) {
        colors.push({
          hex: rgbaToHex(fill.color),
          rgba: toRGBA(fill.color),
          usage: node.type === 'TEXT' ? 'text' : 'fill',
        });
      }
    }
  }

  // 색상 수집 (strokes)
  if (node.strokes) {
    for (const stroke of node.strokes) {
      if (stroke.color) {
        colors.push({ hex: rgbaToHex(stroke.color), rgba: toRGBA(stroke.color), usage: 'stroke' });
      }
    }
  }

  // 텍스트 수집
  if (node.type === 'TEXT' && node.style && node.characters) {
    const textFillColor = node.fills?.find(f => f.type === 'SOLID' && f.color);
    texts.push({
      fontFamily: node.style.fontFamily || 'unknown',
      fontSize: node.style.fontSize || 16,
      fontWeight: node.style.fontWeight || 400,
      lineHeight: node.style.lineHeightPx,
      letterSpacing: node.style.letterSpacing,
      textAlignHorizontal: node.style.textAlignHorizontal,
      fills: textFillColor?.color ? [{ type: 'SOLID', color: toRGBA(textFillColor.color) }] : undefined,
      characters: node.characters,
    });
  }

  // 이미지 수집 (FILL 타입이 IMAGE인 노드)
  if (node.fills?.some(f => f.type === 'IMAGE') && node.absoluteBoundingBox) {
    images.push({
      name: node.name,
      width: node.absoluteBoundingBox.width,
      height: node.absoluteBoundingBox.height,
    });
  }

  // 최상위 섹션 프레임 수집
  if (depth === maxDepth && (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'GROUP')) {
    frames.push({ name: node.name, type: node.type, node });
  }

  // 재귀
  if (node.children) {
    for (const child of node.children) {
      collectFromTree(child, colors, texts, images, frames, depth + 1, maxDepth);
    }
  }
}

/** 섹션 프레임에서 효과 목록 추출 */
function extractEffects(node: FigmaNode): string[] {
  const effects: Set<string> = new Set();

  function walk(n: FigmaNode): void {
    if (n.effects) {
      for (const e of n.effects) {
        if (e.visible !== false) effects.add(e.type);
      }
    }
    if (n.fills) {
      for (const f of n.fills) {
        if (f.type.startsWith('GRADIENT')) effects.add(f.type);
      }
    }
    if (n.children) {
      for (const child of n.children) walk(child);
    }
  }

  walk(node);
  return Array.from(effects);
}

/** 섹션 프레임에 이미지 노드가 있는지 확인 */
function hasImageNode(node: FigmaNode): boolean {
  if (node.fills?.some(f => f.type === 'IMAGE')) return true;
  if (node.children) {
    return node.children.some(child => hasImageNode(child));
  }
  return false;
}

/** 오버레이 패턴 감지 (그라데이션 FRAME이 이미지 위에 있는 경우) */
function hasOverlayPattern(node: FigmaNode): boolean {
  if (!node.children || node.children.length < 2) return false;
  return node.children.some(child =>
    child.fills?.some(f => f.type.startsWith('GRADIENT') && (f.opacity ?? 1) < 1)
  );
}

/** 색상 빈도수 집계 */
function aggregateColors(colors: ColorEntry[]): FigmaFileAnalysis['colorPalette'] {
  const countMap = new Map<string, { rgba: RGBAColor; count: number; usage: 'fill' | 'text' | 'stroke' }>();

  for (const c of colors) {
    const existing = countMap.get(c.hex);
    if (existing) {
      existing.count++;
    } else {
      countMap.set(c.hex, { rgba: c.rgba, count: 1, usage: c.usage });
    }
  }

  return Array.from(countMap.entries())
    .map(([hex, data]) => ({ color: hex, rgba: data.rgba, count: data.count, usage: data.usage }))
    .sort((a, b) => b.count - a.count);
}

/** 텍스트 스타일 빈도수 집계 */
function aggregateTextStyles(texts: TextEntry[]): Array<FigmaTextStyle & { count: number }> {
  const key = (t: TextEntry) => `${t.fontFamily}|${t.fontSize}|${t.fontWeight}`;
  const countMap = new Map<string, FigmaTextStyle & { count: number }>();

  for (const t of texts) {
    const k = key(t);
    const existing = countMap.get(k);
    if (existing) {
      existing.count++;
    } else {
      countMap.set(k, { ...t, count: 1 });
    }
  }

  return Array.from(countMap.values()).sort((a, b) => b.count - a.count);
}

// ===== 메인 함수 =====

/**
 * Figma REST API로 파일 구조를 파싱하여 FigmaFileAnalysis를 반환한다.
 */
export async function parseFigmaFile(fileKey: string, token: string): Promise<FigmaFileAnalysis> {
  const data = await fetchFigmaFile(fileKey, token, 4);
  const document = data.document;

  // 첫 번째 페이지의 첫 번째 프레임을 대상으로
  const pages = document.children || [];
  const firstPage = pages[0];
  if (!firstPage) {
    throw new Error('피그마 파일에 페이지가 없습니다');
  }

  // 페이지 내 최상위 프레임 (상세페이지)
  const topFrames = firstPage.children || [];
  // 가장 큰 프레임을 대상으로 (상세페이지는 보통 가장 큰 프레임)
  const targetFrame = topFrames.reduce((largest, frame) => {
    const lSize = largest.absoluteBoundingBox;
    const fSize = frame.absoluteBoundingBox;
    if (!lSize || !fSize) return largest;
    return fSize.height > lSize.height ? frame : largest;
  }, topFrames[0]);

  if (!targetFrame) {
    throw new Error('피그마 파일에서 프레임을 찾을 수 없습니다');
  }

  const colors: ColorEntry[] = [];
  const texts: TextEntry[] = [];
  const images: Array<{ name: string; width: number; height: number }> = [];
  const sectionFrames: Array<{ name: string; type: string; node: FigmaNode }> = [];

  // 대상 프레임의 직접 자식을 섹션으로 간주 (depth=1)
  collectFromTree(targetFrame, colors, texts, images, sectionFrames, 0, 1);

  // 섹션 정보 구성
  const sections = sectionFrames.map(sf => {
    const bbox = sf.node.absoluteBoundingBox;
    const bgFill = sf.node.fills?.find(f => f.type === 'SOLID' && f.visible !== false);

    return {
      name: sf.name,
      type: sf.type,
      width: bbox?.width || 0,
      height: bbox?.height || 0,
      layoutMode: sf.node.layoutMode,
      padding: sf.node.paddingTop != null ? {
        top: sf.node.paddingTop || 0,
        right: sf.node.paddingRight || 0,
        bottom: sf.node.paddingBottom || 0,
        left: sf.node.paddingLeft || 0,
      } : undefined,
      gap: sf.node.itemSpacing,
      backgroundColor: bgFill?.color ? rgbaToHex(bgFill.color) : undefined,
      childCount: sf.node.children?.length || 0,
      hasImage: hasImageNode(sf.node),
      hasOverlay: hasOverlayPattern(sf.node),
      effects: extractEffects(sf.node),
    };
  });

  const targetBbox = targetFrame.absoluteBoundingBox;

  return {
    fileKey,
    fileName: data.name,
    colorPalette: aggregateColors(colors),
    textStyles: aggregateTextStyles(texts),
    sections,
    stats: {
      totalNodes: countNodes(targetFrame),
      totalTexts: texts.length,
      totalImages: images.length,
      totalFrames: sectionFrames.length,
      canvasWidth: targetBbox?.width || 0,
      canvasHeight: targetBbox?.height || 0,
    },
  };
}

function countNodes(node: FigmaNode): number {
  let count = 1;
  if (node.children) {
    for (const child of node.children) {
      count += countNodes(child);
    }
  }
  return count;
}

// ===== ReferenceAnalysis 변환 =====

/**
 * FigmaFileAnalysis를 ReferenceAnalysis 호환 형식으로 변환한다.
 * 기존 프롬프트 빌더의 referenceGuide 부분을 그대로 활용 가능.
 */
export function fileAnalysisToReference(analysis: FigmaFileAnalysis): ReferenceAnalysis {
  const palette = analysis.colorPalette;
  const fillColors = palette.filter(c => c.usage === 'fill');
  const textColors = palette.filter(c => c.usage === 'text');

  // 가장 많이 사용된 색상으로 팔레트 구성
  const primary = fillColors[0]?.color || '#333333';
  const secondary = fillColors[1]?.color || '#666666';
  const accent = fillColors[2]?.color || '#0066FF';
  const background = fillColors.find(c => {
    const lum = c.rgba.r * 0.299 + c.rgba.g * 0.587 + c.rgba.b * 0.114;
    return lum > 0.8; // 밝은 색
  })?.color || '#FFFFFF';
  const text = textColors[0]?.color || '#1A1A1A';

  // 텍스트 스타일에서 제목/본문 추출
  const sortedStyles = [...analysis.textStyles].sort((a, b) => b.fontSize - a.fontSize);
  const headingStyle = sortedStyles[0];
  const bodyStyle = sortedStyles.find(s => s.fontSize < (headingStyle?.fontSize || 40)) || sortedStyles[1];

  // 섹션 변환
  const sections: DetailedSection[] = analysis.sections.map(s => {
    const elements: SectionElement[] = [];

    // 섹션 내 이미지 존재 시 이미지 엘리먼트 추가
    if (s.hasImage) {
      elements.push({
        type: 'image',
        x: 0,
        y: 0,
        width: s.width,
        height: Math.round(s.height * 0.6),
      });
    }

    // 오버레이 존재 시 표시
    if (s.hasOverlay) {
      elements.push({
        type: 'divider',
        x: 0,
        y: 0,
        width: s.width,
        height: s.height,
        backgroundColor: 'gradient-overlay',
      });
    }

    return {
      type: guessSectionType(s.name),
      layout: s.layoutMode === 'HORIZONTAL' ? 'horizontal' : 'vertical',
      hasImage: s.hasImage,
      hasText: true,
      estimatedHeight: s.height,
      backgroundColor: s.backgroundColor,
      padding: s.padding,
      gap: s.gap,
      contentWidth: s.width,
      contentAlign: 'center' as const,
      elements,
    };
  });

  return {
    analysisId: `figma-${analysis.fileKey}`,
    colorPalette: {
      primary,
      secondary,
      accent,
      background,
      text,
      additionalColors: palette.slice(3, 8).map(c => c.color),
    },
    sections,
    typography: {
      headingStyle: headingStyle ? `${headingStyle.fontFamily} ${headingStyle.fontWeight}` : 'Noto Sans KR 700',
      bodyStyle: bodyStyle ? `${bodyStyle.fontFamily} ${bodyStyle.fontWeight}` : 'Noto Sans KR 400',
      headingSize: headingStyle?.fontSize || 48,
      bodySize: bodyStyle?.fontSize || 16,
      headingFont: headingStyle?.fontFamily,
      bodyFont: bodyStyle?.fontFamily,
      headingWeight: headingStyle?.fontWeight,
      bodyWeight: bodyStyle?.fontWeight,
      headingLetterSpacing: headingStyle?.letterSpacing,
      bodyLineHeight: bodyStyle?.lineHeight,
    },
    overallStyle: guessOverallStyle(analysis),
    totalHeight: analysis.stats.canvasHeight,
    spacing: {
      sectionGap: analysis.sections[0]?.gap || 0,
      contentMaxWidth: analysis.stats.canvasWidth,
      defaultPadding: analysis.sections[0]?.padding || { top: 60, right: 40, bottom: 60, left: 40 },
    },
    effects: {
      gradients: extractGradientInfo(analysis),
      shadows: extractShadowInfo(analysis),
      hasGlassEffect: false,
      hasParallax: false,
    },
  };
}

/** 섹션 이름에서 타입 추정 */
function guessSectionType(name: string): string {
  const lower = name.toLowerCase();
  if (/hero|banner|main|visual/i.test(lower)) return 'hero';
  if (/feature|benefit|장점/i.test(lower)) return 'features';
  if (/review|testimon|후기|리뷰/i.test(lower)) return 'testimonials';
  if (/cta|action|구매|주문/i.test(lower)) return 'cta';
  if (/gallery|갤러리|사진/i.test(lower)) return 'gallery';
  if (/price|pricing|가격/i.test(lower)) return 'pricing';
  if (/faq|질문/i.test(lower)) return 'faq';
  if (/footer|하단/i.test(lower)) return 'footer';
  return 'content';
}

/** 전체 스타일 추정 */
function guessOverallStyle(analysis: FigmaFileAnalysis): string {
  const hasGradients = analysis.sections.some(s => s.effects.some(e => e.includes('GRADIENT')));
  const hasShadows = analysis.sections.some(s => s.effects.some(e => e === 'DROP_SHADOW'));
  const darkBg = analysis.colorPalette.some(c => {
    const lum = c.rgba.r * 0.299 + c.rgba.g * 0.587 + c.rgba.b * 0.114;
    return lum < 0.2 && c.count > 3;
  });

  if (darkBg && hasGradients) return 'dark-gradient';
  if (darkBg) return 'dark-minimal';
  if (hasGradients && hasShadows) return 'modern-elevated';
  if (hasGradients) return 'modern-gradient';
  if (hasShadows) return 'clean-elevated';
  return 'clean-minimal';
}

function extractGradientInfo(analysis: FigmaFileAnalysis): Array<GradientDef & { usage: string }> {
  const gradients: Array<GradientDef & { usage: string }> = [];
  for (const section of analysis.sections) {
    for (const effect of section.effects) {
      if (effect.includes('GRADIENT')) {
        gradients.push({
          type: 'linear',
          colors: [{ color: '#000000', position: 0 }, { color: '#333333', position: 1 }],
          usage: section.name,
        });
      }
    }
  }
  return gradients;
}

function extractShadowInfo(analysis: FigmaFileAnalysis): Array<{ x: number; y: number; blur: number; spread: number; color: string; usage: string }> {
  const shadows: Array<{ x: number; y: number; blur: number; spread: number; color: string; usage: string }> = [];
  for (const section of analysis.sections) {
    if (section.effects.includes('DROP_SHADOW')) {
      shadows.push({ x: 0, y: 4, blur: 20, spread: 0, color: 'rgba(0,0,0,0.1)', usage: section.name });
    }
  }
  return shadows;
}
