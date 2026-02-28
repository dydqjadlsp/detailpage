/**
 * CTA(Call-to-Action) 섹션 템플릿
 * 강렬한 배경 + 큰 제목 + 버튼
 */

import type { FigmaCommand } from '../types';

interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface CtaContent {
  title: string;
  subtitle?: string;
  ctaText: string;
  trustText?: string;
}

export interface CtaColors {
  primary: RgbaColor;
  background: RgbaColor;
  textWhite: RgbaColor;
  textMuted: RgbaColor;
}

interface CtaBuildConfig {
  canvasWidth: number;
  content: CtaContent;
  colors: CtaColors;
  startId: number;
  parentId: string;
}

export function buildCtaSection(config: CtaBuildConfig): {
  commands: FigmaCommand[];
  nextId: number;
} {
  const { canvasWidth, content, colors, parentId } = config;
  let id = config.startId;
  const nextId = () => `cmd_${String(id++).padStart(3, '0')}`;
  const commands: FigmaCommand[] = [];

  // CTA 루트 프레임
  const sectionId = nextId();
  commands.push({
    id: sectionId,
    command: 'create_frame',
    params: {
      width: canvasWidth,
      height: 500,
      layoutMode: 'VERTICAL',
      primaryAxisAlignItems: 'CENTER',
      counterAxisAlignItems: 'CENTER',
      paddingTop: 100,
      paddingBottom: 100,
      paddingLeft: 80,
      paddingRight: 80,
      itemSpacing: 28,
      fillColor: colors.background,
      layoutSizingHorizontal: 'FILL',
      layoutSizingVertical: 'HUG',
      name: 'CTA Section',
      parentId: `$${parentId}`,
    },
    group: 'cta',
    description: 'CTA 섹션 루트',
  });

  // 메인 제목
  const titleId = nextId();
  commands.push({
    id: titleId,
    command: 'create_text',
    params: {
      text: content.title,
      fontSize: 48,
      fontWeight: 800,
      fontColor: colors.textWhite,
      name: 'CTA Title',
      parentId: `$${sectionId}`,
    },
    group: 'cta',
    description: 'CTA 제목',
  });

  commands.push({
    id: nextId(),
    command: 'set_text_style',
    params: {
      nodeId: `$${titleId}`,
      textAlignHorizontal: 'CENTER',
      lineHeight: 60,
      letterSpacing: -1,
    },
    group: 'cta',
    description: 'CTA 제목 스타일',
  });

  commands.push({
    id: nextId(),
    command: 'set_auto_resize',
    params: {
      nodeId: `$${titleId}`,
      textAutoResize: 'WIDTH_AND_HEIGHT',
    },
    group: 'cta',
    description: 'CTA 제목 자동 크기',
  });

  // 서브 텍스트
  if (content.subtitle) {
    const subId = nextId();
    commands.push({
      id: subId,
      command: 'create_text',
      params: {
        text: content.subtitle,
        fontSize: 20,
        fontWeight: 400,
        fontColor: colors.textMuted,
        name: 'CTA Subtitle',
        parentId: `$${sectionId}`,
      },
      group: 'cta',
      description: 'CTA 서브 텍스트',
    });

    commands.push({
      id: nextId(),
      command: 'set_text_style',
      params: {
        nodeId: `$${subId}`,
        textAlignHorizontal: 'CENTER',
        lineHeight: 32,
      },
      group: 'cta',
      description: '서브 텍스트 스타일',
    });
  }

  // CTA 버튼
  const btnId = nextId();
  commands.push({
    id: btnId,
    command: 'create_frame',
    params: {
      width: 280,
      height: 64,
      layoutMode: 'HORIZONTAL',
      primaryAxisAlignItems: 'CENTER',
      counterAxisAlignItems: 'CENTER',
      paddingTop: 18,
      paddingBottom: 18,
      paddingLeft: 56,
      paddingRight: 56,
      fillColor: colors.primary,
      layoutSizingHorizontal: 'HUG',
      layoutSizingVertical: 'HUG',
      name: 'CTA Button',
      parentId: `$${sectionId}`,
    },
    group: 'cta',
    description: 'CTA 버튼',
  });

  commands.push({
    id: nextId(),
    command: 'set_corner_radius',
    params: { nodeId: `$${btnId}`, radius: 14 },
    group: 'cta',
    description: '버튼 둥글기',
  });

  // 버튼 그림자
  commands.push({
    id: nextId(),
    command: 'set_effects',
    params: {
      nodeId: `$${btnId}`,
      effects: [{
        type: 'DROP_SHADOW',
        color: { ...colors.primary, a: 0.35 },
        offset: { x: 0, y: 6 },
        radius: 24,
        spread: 0,
        visible: true,
      }],
    },
    group: 'cta',
    description: '버튼 그림자',
  });

  // 버튼 텍스트
  commands.push({
    id: nextId(),
    command: 'create_text',
    params: {
      text: content.ctaText,
      fontSize: 20,
      fontWeight: 700,
      fontColor: { r: 1, g: 1, b: 1, a: 1 },
      name: 'CTA Button Text',
      parentId: `$${btnId}`,
    },
    group: 'cta',
    description: '버튼 텍스트',
  });

  // 신뢰 텍스트
  if (content.trustText) {
    commands.push({
      id: nextId(),
      command: 'create_text',
      params: {
        text: content.trustText,
        fontSize: 14,
        fontWeight: 400,
        fontColor: { ...colors.textWhite, a: 0.5 },
        name: 'CTA Trust Text',
        parentId: `$${sectionId}`,
      },
      group: 'cta',
      description: '신뢰 텍스트',
    });
  }

  return { commands, nextId: id };
}
