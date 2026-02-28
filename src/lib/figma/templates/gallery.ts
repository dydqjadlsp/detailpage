/**
 * Gallery 섹션 템플릿
 * 큰 이미지 1개 + 작은 이미지 2개 그리드
 */

import type { FigmaCommand } from '../types';

interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface GalleryContent {
  sectionTitle: string;
  sectionSubtitle?: string;
}

export interface GalleryColors {
  background: RgbaColor;
  textWhite: RgbaColor;
  textMuted: RgbaColor;
}

interface GalleryBuildConfig {
  canvasWidth: number;
  content: GalleryContent;
  colors: GalleryColors;
  startId: number;
  parentId: string;
}

export function buildGallerySection(config: GalleryBuildConfig): {
  commands: FigmaCommand[];
  nextId: number;
} {
  const { canvasWidth, content, colors, parentId } = config;
  let id = config.startId;
  const nextId = () => `cmd_${String(id++).padStart(3, '0')}`;
  const commands: FigmaCommand[] = [];

  // Gallery 루트 프레임
  const sectionId = nextId();
  commands.push({
    id: sectionId,
    command: 'create_frame',
    params: {
      width: canvasWidth,
      height: 800,
      layoutMode: 'VERTICAL',
      primaryAxisAlignItems: 'CENTER',
      counterAxisAlignItems: 'CENTER',
      paddingTop: 80,
      paddingBottom: 80,
      paddingLeft: 80,
      paddingRight: 80,
      itemSpacing: 40,
      fillColor: colors.background,
      layoutSizingHorizontal: 'FILL',
      layoutSizingVertical: 'HUG',
      name: 'Gallery Section',
      parentId: `$${parentId}`,
    },
    group: 'gallery',
    description: 'Gallery 섹션 루트',
  });

  // 섹션 제목
  const titleId = nextId();
  commands.push({
    id: titleId,
    command: 'create_text',
    params: {
      text: content.sectionTitle,
      fontSize: 40,
      fontWeight: 700,
      fontColor: colors.textWhite,
      name: 'Gallery Title',
      parentId: `$${sectionId}`,
    },
    group: 'gallery',
    description: '섹션 제목',
  });

  commands.push({
    id: nextId(),
    command: 'set_text_style',
    params: {
      nodeId: `$${titleId}`,
      textAlignHorizontal: 'CENTER',
      lineHeight: 52,
      letterSpacing: -0.8,
    },
    group: 'gallery',
    description: '제목 스타일',
  });

  if (content.sectionSubtitle) {
    commands.push({
      id: nextId(),
      command: 'create_text',
      params: {
        text: content.sectionSubtitle,
        fontSize: 18,
        fontWeight: 400,
        fontColor: colors.textMuted,
        name: 'Gallery Subtitle',
        parentId: `$${sectionId}`,
      },
      group: 'gallery',
      description: '서브 제목',
    });
  }

  // 큰 메인 이미지
  const mainImageId = nextId();
  commands.push({
    id: mainImageId,
    command: 'create_rectangle',
    params: {
      width: canvasWidth - 160,
      height: 400,
      name: '[이미지] gallery-main',
      parentId: `$${sectionId}`,
      fillColor: { r: 0.18, g: 0.18, b: 0.2, a: 1 },
      layoutSizingHorizontal: 'FILL',
    },
    group: 'gallery',
    description: '메인 이미지',
  });

  commands.push({
    id: nextId(),
    command: 'set_corner_radius',
    params: { nodeId: `$${mainImageId}`, radius: 16 },
    group: 'gallery',
    description: '메인 이미지 둥글기',
  });

  // 하단 2열 이미지 행
  const rowId = nextId();
  commands.push({
    id: rowId,
    command: 'create_frame',
    params: {
      width: canvasWidth - 160,
      height: 240,
      layoutMode: 'HORIZONTAL',
      primaryAxisAlignItems: 'MIN',
      counterAxisAlignItems: 'MIN',
      itemSpacing: 24,
      layoutSizingHorizontal: 'FILL',
      name: 'Gallery Row',
      parentId: `$${sectionId}`,
    },
    group: 'gallery',
    description: '이미지 2열 행',
  });

  // 좌측 이미지
  const leftImgId = nextId();
  commands.push({
    id: leftImgId,
    command: 'create_rectangle',
    params: {
      width: 600,
      height: 240,
      name: '[이미지] gallery-left',
      parentId: `$${rowId}`,
      fillColor: { r: 0.2, g: 0.2, b: 0.22, a: 1 },
      layoutSizingHorizontal: 'FILL',
    },
    group: 'gallery',
    description: '좌측 이미지',
  });

  commands.push({
    id: nextId(),
    command: 'set_corner_radius',
    params: { nodeId: `$${leftImgId}`, radius: 12 },
    group: 'gallery',
    description: '좌측 이미지 둥글기',
  });

  // 우측 이미지
  const rightImgId = nextId();
  commands.push({
    id: rightImgId,
    command: 'create_rectangle',
    params: {
      width: 600,
      height: 240,
      name: '[이미지] gallery-right',
      parentId: `$${rowId}`,
      fillColor: { r: 0.2, g: 0.2, b: 0.22, a: 1 },
      layoutSizingHorizontal: 'FILL',
    },
    group: 'gallery',
    description: '우측 이미지',
  });

  commands.push({
    id: nextId(),
    command: 'set_corner_radius',
    params: { nodeId: `$${rightImgId}`, radius: 12 },
    group: 'gallery',
    description: '우측 이미지 둥글기',
  });

  return { commands, nextId: id };
}
