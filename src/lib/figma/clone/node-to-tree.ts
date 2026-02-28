/**
 * FigmaRestNode → TreeNode 결정론적 변환
 * AI 없이 REST API 노드 데이터를 우리 TreeNode 형식으로 1:1 매핑한다.
 * 지원 불가 타입(VECTOR, BOOLEAN_OPERATION 등)은 RECTANGLE로 근사.
 */

import 'server-only';

import type { FigmaRestNode, TreeNode, TreeNodeType, RGBAColor, TreeNodeFill, TreeNodeEffect } from '../types';

export interface ConvertOptions {
  canvasWidth: number;
  fontFallback: Record<string, string>;
  imageUrls: Map<string, string>;
}

/** 기본 폰트 대체 매핑 */
export const DEFAULT_FONT_FALLBACK: Record<string, string> = {
  iceJaram: 'Noto Serif KR',
  'Ice Jaram': 'Noto Serif KR',
  '아이스자람': 'Noto Serif KR',
};

/** REST API 노드 → TreeNode 변환 (메인 함수) */
export function restNodeToTree(node: FigmaRestNode, options: ConvertOptions): TreeNode {
  return convertNode(node, options, true);
}

function convertNode(node: FigmaRestNode, options: ConvertOptions, isRoot: boolean): TreeNode {
  const treeType = mapNodeType(node.type);
  const bbox = node.absoluteBoundingBox;

  const result: TreeNode = {
    type: treeType,
    name: node.name,
    width: bbox?.width,
    height: bbox?.height,
  };

  if (isRoot && bbox) {
    result.x = 0;
    result.y = 0;
  }

  if (treeType === 'TEXT') {
    applyTextProps(result, node, options);
  } else {
    applyFrameProps(result, node, treeType);
  }

  applyStyleProps(result, node, options);

  if (node.children && treeType !== 'TEXT') {
    result.children = node.children
      .filter(child => !shouldSkipNode(child))
      .map(child => convertNode(child, options, false));
  }

  return result;
}

/** REST API type → TreeNode type 매핑 */
function mapNodeType(type: string): TreeNodeType {
  switch (type) {
    case 'FRAME':
    case 'COMPONENT':
    case 'COMPONENT_SET':
    case 'INSTANCE':
    case 'GROUP':
      return 'FRAME';
    case 'TEXT':
      return 'TEXT';
    case 'ELLIPSE':
      return 'ELLIPSE';
    case 'RECTANGLE':
      return 'RECTANGLE';
    case 'VECTOR':
    case 'BOOLEAN_OPERATION':
    case 'REGULAR_POLYGON':
    case 'STAR':
    case 'LINE':
      return 'RECTANGLE';
    default:
      return 'RECTANGLE';
  }
}

/** 건너뛸 노드 판단 */
function shouldSkipNode(node: FigmaRestNode): boolean {
  if (node.type === 'SLICE') return true;
  if (node.opacity === 0) return true;
  const bbox = node.absoluteBoundingBox;
  if (bbox && (bbox.width <= 0 || bbox.height <= 0)) return true;
  return false;
}

/** 텍스트 속성 적용 */
function applyTextProps(result: TreeNode, node: FigmaRestNode, options: ConvertOptions): void {
  result.text = node.characters || '';

  if (node.style) {
    const fontFamily = node.style.fontFamily || 'Pretendard';
    result.fontFamily = options.fontFallback[fontFamily] || fontFamily;
    result.fontSize = node.style.fontSize || 16;
    result.fontWeight = node.style.fontWeight || 400;

    if (node.style.lineHeightPx) {
      result.lineHeight = node.style.lineHeightPx;
    }
    if (node.style.letterSpacing) {
      result.letterSpacing = node.style.letterSpacing;
    }

    const align = node.style.textAlignHorizontal;
    if (align === 'LEFT' || align === 'CENTER' || align === 'RIGHT' || align === 'JUSTIFIED') {
      result.textAlignHorizontal = align;
    }

    const autoResize = node.style.textAutoResize;
    if (autoResize === 'HEIGHT' || autoResize === 'WIDTH_AND_HEIGHT' || autoResize === 'TRUNCATE') {
      result.textAutoResize = autoResize;
    }
  }

  const textFill = node.fills?.find(f => f.type === 'SOLID' && f.visible !== false);
  if (textFill?.color) {
    result.fontColor = figmaColorToRgba(textFill.color);
  }

  applyRangeStyles(result, node, options);
}

/** characterStyleOverrides → rangeStyles 변환 */
function applyRangeStyles(result: TreeNode, node: FigmaRestNode, options: ConvertOptions): void {
  if (!node.characterStyleOverrides || !node.styleOverrideTable) return;
  if (node.characterStyleOverrides.length === 0) return;

  const overrides = node.characterStyleOverrides;
  const table = node.styleOverrideTable;
  const ranges: TreeNode['rangeStyles'] = [];

  let currentStyleId = overrides[0];
  let rangeStart = 0;

  for (let i = 1; i <= overrides.length; i++) {
    const styleId = i < overrides.length ? overrides[i] : -1;

    if (styleId !== currentStyleId) {
      if (currentStyleId !== 0) {
        const styleKey = String(currentStyleId);
        const override = table[styleKey];
        if (override) {
          const range: NonNullable<TreeNode['rangeStyles']>[number] = {
            start: rangeStart,
            end: i,
          };

          if (override.fontSize) range.fontSize = override.fontSize;
          if (override.fontWeight) range.fontWeight = override.fontWeight;
          if (override.fontFamily) {
            range.fontFamily = options.fontFallback[override.fontFamily] || override.fontFamily;
          }
          if (override.letterSpacing) range.letterSpacing = override.letterSpacing;

          const textDec = override.textDecoration;
          if (textDec === 'UNDERLINE' || textDec === 'STRIKETHROUGH') {
            range.textDecoration = textDec;
          }

          const overrideFill = override.fills?.find(f => f.type === 'SOLID');
          if (overrideFill?.color) {
            range.fontColor = figmaColorToRgba(overrideFill.color);
          }

          ranges.push(range);
        }
      }
      currentStyleId = styleId;
      rangeStart = i;
    }
  }

  if (ranges.length > 0) {
    result.rangeStyles = ranges;
  }
}

/** FRAME/RECTANGLE/ELLIPSE 레이아웃 속성 */
function applyFrameProps(result: TreeNode, node: FigmaRestNode, treeType: TreeNodeType): void {
  if (treeType !== 'FRAME') return;

  if (node.type === 'GROUP') {
    result.layoutMode = 'NONE';
  } else if (node.layoutMode) {
    const mode = node.layoutMode;
    if (mode === 'VERTICAL' || mode === 'HORIZONTAL') {
      result.layoutMode = mode;
    } else {
      result.layoutMode = 'NONE';
    }
  }

  if (node.layoutWrap === 'WRAP') {
    result.layoutWrap = 'WRAP';
  }

  if (node.paddingTop != null) result.paddingTop = node.paddingTop;
  if (node.paddingRight != null) result.paddingRight = node.paddingRight;
  if (node.paddingBottom != null) result.paddingBottom = node.paddingBottom;
  if (node.paddingLeft != null) result.paddingLeft = node.paddingLeft;
  if (node.itemSpacing != null) result.itemSpacing = node.itemSpacing;

  const pAxis = node.primaryAxisAlignItems;
  if (pAxis === 'MIN' || pAxis === 'MAX' || pAxis === 'CENTER' || pAxis === 'SPACE_BETWEEN') {
    result.primaryAxisAlignItems = pAxis;
  }

  const cAxis = node.counterAxisAlignItems;
  if (cAxis === 'MIN' || cAxis === 'MAX' || cAxis === 'CENTER' || cAxis === 'BASELINE') {
    result.counterAxisAlignItems = cAxis;
  }

  const hSizing = node.layoutSizingHorizontal;
  if (hSizing === 'FIXED' || hSizing === 'HUG' || hSizing === 'FILL') {
    result.layoutSizingHorizontal = hSizing;
  }

  const vSizing = node.layoutSizingVertical;
  if (vSizing === 'FIXED' || vSizing === 'HUG' || vSizing === 'FILL') {
    result.layoutSizingVertical = vSizing;
  }
}

/** 공통 스타일 속성 (fill, stroke, effects, corner, opacity, blend, rotation) */
function applyStyleProps(result: TreeNode, node: FigmaRestNode, options: ConvertOptions): void {
  if (node.opacity != null && node.opacity < 1) {
    result.opacity = node.opacity;
  }

  if (node.cornerRadius != null && node.cornerRadius > 0) {
    result.cornerRadius = node.cornerRadius;
  }
  if (node.rectangleCornerRadii) {
    result.corners = node.rectangleCornerRadii;
  }

  const blendMode = node.blendMode;
  if (blendMode && blendMode !== 'PASS_THROUGH' && blendMode !== 'NORMAL') {
    const validModes = ['MULTIPLY', 'SCREEN', 'OVERLAY', 'SOFT_LIGHT', 'COLOR_DODGE'] as const;
    type ValidBlend = typeof validModes[number];
    if (validModes.includes(blendMode as ValidBlend)) {
      result.blendMode = blendMode as TreeNode['blendMode'];
    }
  }

  if (node.rotation != null && node.rotation !== 0) {
    result.rotation = node.rotation;
  }

  applyFills(result, node, options);
  applyStrokes(result, node);
  applyEffects(result, node);
}

/** fill 변환 */
function applyFills(result: TreeNode, node: FigmaRestNode, options: ConvertOptions): void {
  if (!node.fills || node.fills.length === 0) return;

  const visibleFills = node.fills.filter(f => f.visible !== false);
  if (visibleFills.length === 0) return;

  const solidFills = visibleFills.filter(f => f.type === 'SOLID');
  const gradientFills = visibleFills.filter(f => f.type.startsWith('GRADIENT'));
  const imageFills = visibleFills.filter(f => f.type === 'IMAGE');

  if (imageFills.length > 0 && result.type !== 'TEXT') {
    const imageRef = imageFills[0].imageRef;
    if (imageRef) {
      const unsplashUrl = options.imageUrls.get(imageRef);
      if (unsplashUrl) {
        result.tag = `img_${unsplashUrl}`;
      } else {
        result.tag = 'img_placeholder';
      }
    }
  }

  if (gradientFills.length > 0 || (solidFills.length > 0 && gradientFills.length > 0)) {
    const treeNodeFills: TreeNodeFill[] = [];

    for (const fill of visibleFills) {
      if (fill.type === 'IMAGE') continue;
      const converted = convertFill(fill);
      if (converted) treeNodeFills.push(converted);
    }

    if (treeNodeFills.length > 0) {
      result.fills = treeNodeFills;
    }
  } else if (solidFills.length > 0 && result.type !== 'TEXT') {
    const first = solidFills[0];
    if (first.color) {
      result.fillColor = figmaColorToRgba(first.color);
    }
  }
}

function convertFill(fill: { type: string; color?: { r: number; g: number; b: number; a: number }; opacity?: number; gradientStops?: Array<{ color: { r: number; g: number; b: number; a: number }; position: number }> }): TreeNodeFill | null {
  if (fill.type === 'SOLID' && fill.color) {
    return {
      type: 'SOLID',
      color: figmaColorToRgba(fill.color),
      opacity: fill.opacity,
    };
  }

  if (fill.type.startsWith('GRADIENT') && fill.gradientStops) {
    const gradientType = fill.type === 'GRADIENT_RADIAL' ? 'GRADIENT_RADIAL' : 'GRADIENT_LINEAR';
    return {
      type: gradientType,
      gradientStops: fill.gradientStops.map(stop => ({
        color: figmaColorToRgba(stop.color),
        position: stop.position,
      })),
      opacity: fill.opacity,
    };
  }

  return null;
}

/** stroke 변환 */
function applyStrokes(result: TreeNode, node: FigmaRestNode): void {
  if (!node.strokes || node.strokes.length === 0) return;

  const visible = node.strokes.find(s => s.color);
  if (visible?.color) {
    result.strokeColor = figmaColorToRgba(visible.color);
    result.strokeWeight = node.strokeWeight || 1;
  }
}

/** effect 변환 */
function applyEffects(result: TreeNode, node: FigmaRestNode): void {
  if (!node.effects || node.effects.length === 0) return;

  const visibleEffects = node.effects.filter(e => e.visible !== false);
  if (visibleEffects.length === 0) return;

  const treeEffects: TreeNodeEffect[] = [];

  for (const effect of visibleEffects) {
    const type = effect.type;
    if (type !== 'DROP_SHADOW' && type !== 'INNER_SHADOW' && type !== 'LAYER_BLUR' && type !== 'BACKGROUND_BLUR') {
      continue;
    }

    const treeEffect: TreeNodeEffect = { type };
    if (effect.color) treeEffect.color = figmaColorToRgba(effect.color);
    if (effect.offset) treeEffect.offset = effect.offset;
    if (effect.radius != null) treeEffect.radius = effect.radius;
    if (effect.spread != null) treeEffect.spread = effect.spread;
    treeEffects.push(treeEffect);
  }

  if (treeEffects.length > 0) {
    result.effects = treeEffects;
  }
}

/** Figma 0~1 컬러 → RGBAColor */
function figmaColorToRgba(c: { r: number; g: number; b: number; a?: number }): RGBAColor {
  return {
    r: Math.round(c.r * 255) / 255,
    g: Math.round(c.g * 255) / 255,
    b: Math.round(c.b * 255) / 255,
    a: c.a ?? 1,
  };
}
