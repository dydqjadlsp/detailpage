/**
 * 분석 결과(ReferenceAnalysis) -> TreeNode 변환기
 * create_tree 커맨드에 바로 전달 가능한 형태로 변환한다.
 */

import type {
  TreeNode,
  RGBAColor,
  ReferenceAnalysis,
  DetailedSection,
  SectionElement,
} from './types';

const DEFAULT_CANVAS_WIDTH = 1440;

export function hexToRgba(hex: string): RGBAColor {
  const h = hex.replace('#', '');
  if (h.length < 6) return { r: 0.5, g: 0.5, b: 0.5, a: 1 };
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
    a: 1,
  };
}

export function analysisToTree(
  analysis: ReferenceAnalysis,
  canvasWidth = DEFAULT_CANVAS_WIDTH
): TreeNode {
  const root: TreeNode = {
    type: 'FRAME',
    name: 'Detail Page',
    width: canvasWidth,
    height: analysis.totalHeight,
    layoutMode: 'VERTICAL',
    primaryAxisAlignItems: 'CENTER',
    counterAxisAlignItems: 'CENTER',
    layoutSizingVertical: 'HUG',
    itemSpacing: analysis.spacing?.sectionGap || 0,
    fillColor: hexToRgba(analysis.colorPalette.background),
    tag: 'root',
    children: [],
  };

  for (let i = 0; i < analysis.sections.length; i++) {
    const section = analysis.sections[i];
    const sectionTree = sectionToTree(section, canvasWidth, i);
    root.children!.push(sectionTree);
  }

  return root;
}

function sectionToTree(
  section: DetailedSection,
  canvasWidth: number,
  index: number
): TreeNode {
  const sectionNode: TreeNode = {
    type: 'FRAME',
    name: `Section-${section.type}`,
    layoutMode: 'VERTICAL',
    layoutSizingHorizontal: 'FILL',
    layoutSizingVertical: 'HUG',
    paddingTop: section.padding?.top || 60,
    paddingRight: section.padding?.right || 40,
    paddingBottom: section.padding?.bottom || 60,
    paddingLeft: section.padding?.left || 40,
    itemSpacing: section.gap || 24,
    primaryAxisAlignItems: 'CENTER',
    counterAxisAlignItems: section.contentAlign === 'left' ? 'MIN'
      : section.contentAlign === 'right' ? 'MAX' : 'CENTER',
    tag: `section_${index}_${section.type}`,
    children: [],
  };

  if (section.backgroundColor) {
    sectionNode.fillColor = hexToRgba(section.backgroundColor);
  }

  const contentWidth = section.contentWidth || canvasWidth;
  let contentParent = sectionNode;

  if (contentWidth < canvasWidth - 40) {
    const wrapper: TreeNode = {
      type: 'FRAME',
      name: 'content-wrapper',
      width: contentWidth,
      layoutMode: 'VERTICAL',
      layoutSizingVertical: 'HUG',
      itemSpacing: section.gap || 24,
      children: [],
    };
    sectionNode.children!.push(wrapper);
    contentParent = wrapper;
  }

  for (const element of section.elements) {
    const elementNode = elementToTree(element);
    contentParent.children!.push(elementNode);
  }

  return sectionNode;
}

function elementToTree(element: SectionElement): TreeNode {
  switch (element.type) {
    case 'heading':
    case 'subheading':
    case 'body-text':
    case 'caption':
    case 'list-item':
      return textElementToTree(element);
    case 'image':
      return imageElementToTree(element);
    case 'button':
      return buttonElementToTree(element);
    case 'card':
      return cardElementToTree(element);
    case 'icon':
      return iconElementToTree(element);
    case 'divider':
      return dividerElementToTree();
    case 'badge':
      return badgeElementToTree(element);
    case 'form-input':
      return formInputElementToTree(element);
    default:
      return textElementToTree(element);
  }
}

const MIN_FONT_SIZE = 40;
const FONT_SIZE_MAP: Record<string, number> = {
  heading: 75, subheading: 55, 'body-text': 40, caption: 40, 'list-item': 40,
};
const FONT_WEIGHT_MAP: Record<string, number> = {
  heading: 700, subheading: 600, 'body-text': 400, caption: 400, 'list-item': 400,
};

function textElementToTree(el: SectionElement): TreeNode {
  return {
    type: 'TEXT',
    name: el.text?.substring(0, 30) || el.type,
    text: el.text || '',
    fontSize: Math.max(el.fontSize || FONT_SIZE_MAP[el.type] || MIN_FONT_SIZE, MIN_FONT_SIZE),
    fontWeight: el.fontWeight || FONT_WEIGHT_MAP[el.type] || 400,
    fontFamily: el.fontFamily || 'Pretendard',
    fontColor: el.textColor ? hexToRgba(el.textColor) : { r: 0.1, g: 0.1, b: 0.12, a: 1 },
    textAlignHorizontal: el.textAlign || 'CENTER',
    layoutSizingHorizontal: 'FILL',
    textAutoResize: 'HEIGHT',
    letterSpacing: el.letterSpacing,
    lineHeight: el.lineHeight,
  };
}

function imageElementToTree(el: SectionElement): TreeNode {
  return {
    type: 'RECTANGLE',
    name: `[이미지] ${el.imageDescription || 'placeholder'}`,
    width: el.width || 860,
    height: el.height || 550,
    fillColor: { r: 0.92, g: 0.92, b: 0.93, a: 1 },
    cornerRadius: el.borderRadius || 16,
    layoutSizingHorizontal: 'FILL',
    tag: `img_${(el.imageDescription || 'placeholder').substring(0, 20).replace(/\s+/g, '_')}`,
  };
}

function buttonElementToTree(el: SectionElement): TreeNode {
  return {
    type: 'FRAME',
    name: el.text || 'Button',
    layoutMode: 'HORIZONTAL',
    primaryAxisAlignItems: 'CENTER',
    counterAxisAlignItems: 'CENTER',
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 56,
    paddingRight: 56,
    cornerRadius: el.borderRadius || 16,
    fillColor: el.backgroundColor ? hexToRgba(el.backgroundColor) : { r: 0.4, g: 0.36, b: 0.96, a: 1 },
    layoutSizingVertical: 'HUG',
    effects: el.shadow ? [{
      type: 'DROP_SHADOW',
      color: { r: 0, g: 0, b: 0, a: 0.15 },
      offset: { x: el.shadow.x, y: el.shadow.y },
      radius: el.shadow.blur,
      spread: el.shadow.spread,
      visible: true,
    }] : [{
      type: 'DROP_SHADOW',
      color: { r: 0, g: 0, b: 0, a: 0.12 },
      offset: { x: 0, y: 4 },
      radius: 16,
      spread: 0,
      visible: true,
    }],
    children: [{
      type: 'TEXT',
      text: el.text || 'Button',
      fontSize: Math.max(el.fontSize || 40, 40),
      fontWeight: el.fontWeight || 700,
      fontColor: { r: 1, g: 1, b: 1, a: 1 },
      fontFamily: el.fontFamily || 'Pretendard',
    }],
  };
}

function cardElementToTree(el: SectionElement): TreeNode {
  return {
    type: 'FRAME',
    name: 'Card',
    layoutMode: 'VERTICAL',
    width: el.width || 350,
    layoutSizingVertical: 'HUG',
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 24,
    paddingRight: 24,
    itemSpacing: 16,
    cornerRadius: el.borderRadius || 16,
    fillColor: el.backgroundColor ? hexToRgba(el.backgroundColor) : { r: 1, g: 1, b: 1, a: 1 },
    effects: el.shadow ? [{
      type: 'DROP_SHADOW',
      color: { r: 0, g: 0, b: 0, a: 0.08 },
      offset: { x: el.shadow.x, y: el.shadow.y },
      radius: el.shadow.blur,
      spread: el.shadow.spread,
      visible: true,
    }] : [{
      type: 'DROP_SHADOW',
      color: { r: 0, g: 0, b: 0, a: 0.06 },
      offset: { x: 0, y: 4 },
      radius: 16,
      spread: 0,
      visible: true,
    }],
    children: [],
  };
}

function iconElementToTree(el: SectionElement): TreeNode {
  return {
    type: 'FRAME',
    name: 'Icon',
    width: el.width || 96,
    height: el.height || 96,
    layoutMode: 'HORIZONTAL',
    primaryAxisAlignItems: 'CENTER',
    counterAxisAlignItems: 'CENTER',
    cornerRadius: 24,
    fillColor: el.backgroundColor ? hexToRgba(el.backgroundColor) : { r: 0.4, g: 0.36, b: 0.96, a: 0.12 },
    children: [{
      type: 'TEXT',
      text: el.text || '★',
      fontSize: 52,
      fontWeight: 400,
      fontColor: el.textColor ? hexToRgba(el.textColor) : { r: 0.4, g: 0.36, b: 0.96, a: 1 },
    }],
  };
}

function dividerElementToTree(): TreeNode {
  return {
    type: 'RECTANGLE',
    name: 'Divider',
    width: 100,
    height: 1,
    fillColor: { r: 0.9, g: 0.9, b: 0.9, a: 1 },
    layoutSizingHorizontal: 'FILL',
  };
}

function badgeElementToTree(el: SectionElement): TreeNode {
  return {
    type: 'FRAME',
    name: 'Badge',
    layoutMode: 'HORIZONTAL',
    primaryAxisAlignItems: 'CENTER',
    counterAxisAlignItems: 'CENTER',
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 16,
    paddingRight: 16,
    cornerRadius: 20,
    fillColor: el.backgroundColor ? hexToRgba(el.backgroundColor) : { r: 0.4, g: 0.36, b: 0.96, a: 0.15 },
    layoutSizingVertical: 'HUG',
    children: [{
      type: 'TEXT',
      text: el.text || 'Badge',
      fontSize: el.fontSize || 13,
      fontWeight: el.fontWeight || 600,
      fontColor: el.textColor ? hexToRgba(el.textColor) : { r: 0.4, g: 0.36, b: 0.96, a: 1 },
      fontFamily: 'Pretendard',
    }],
  };
}

function formInputElementToTree(el: SectionElement): TreeNode {
  return {
    type: 'FRAME',
    name: 'Input',
    layoutMode: 'HORIZONTAL',
    primaryAxisAlignItems: 'MIN',
    counterAxisAlignItems: 'CENTER',
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 16,
    paddingRight: 16,
    cornerRadius: el.borderRadius || 8,
    fillColor: { r: 0.97, g: 0.97, b: 0.98, a: 1 },
    strokeColor: { r: 0.85, g: 0.85, b: 0.87, a: 1 },
    strokeWeight: 1,
    layoutSizingHorizontal: 'FILL',
    layoutSizingVertical: 'HUG',
    children: [{
      type: 'TEXT',
      text: el.text || 'placeholder',
      fontSize: el.fontSize || 15,
      fontWeight: 400,
      fontColor: { r: 0.6, g: 0.6, b: 0.62, a: 1 },
      fontFamily: 'Pretendard',
    }],
  };
}
