/**
 * Features 섹션 템플릿
 * 3열 카드 그리드: 아이콘 영역 + 제목 + 설명
 */

import type { FigmaCommand } from '../types';

interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FeatureItem {
  title: string;
  description: string;
}

export interface FeaturesContent {
  sectionTitle: string;
  sectionSubtitle?: string;
  items: FeatureItem[];
}

export interface FeaturesColors {
  primary: RgbaColor;
  background: RgbaColor;
  cardBackground: RgbaColor;
  textWhite: RgbaColor;
  textMuted: RgbaColor;
}

interface FeaturesBuildConfig {
  canvasWidth: number;
  content: FeaturesContent;
  colors: FeaturesColors;
  startId: number;
  parentId: string;
}

export function buildFeaturesSection(config: FeaturesBuildConfig): {
  commands: FigmaCommand[];
  nextId: number;
} {
  const { canvasWidth, content, colors, parentId } = config;
  let id = config.startId;
  const nextId = () => `cmd_${String(id++).padStart(3, '0')}`;
  const commands: FigmaCommand[] = [];

  // Features 루트 프레임
  const sectionId = nextId();
  commands.push({
    id: sectionId,
    command: 'create_frame',
    params: {
      width: canvasWidth,
      height: 700,
      layoutMode: 'VERTICAL',
      primaryAxisAlignItems: 'CENTER',
      counterAxisAlignItems: 'CENTER',
      paddingTop: 80,
      paddingBottom: 80,
      paddingLeft: 80,
      paddingRight: 80,
      itemSpacing: 48,
      fillColor: colors.background,
      layoutSizingHorizontal: 'FILL',
      layoutSizingVertical: 'HUG',
      name: 'Features Section',
      parentId: `$${parentId}`,
    },
    group: 'features',
    description: 'Features 섹션 루트',
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
      name: 'Features Title',
      parentId: `$${sectionId}`,
    },
    group: 'features',
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
    group: 'features',
    description: '제목 스타일',
  });

  // 섹션 서브 제목
  if (content.sectionSubtitle) {
    const subId = nextId();
    commands.push({
      id: subId,
      command: 'create_text',
      params: {
        text: content.sectionSubtitle,
        fontSize: 18,
        fontWeight: 400,
        fontColor: colors.textMuted,
        name: 'Features Subtitle',
        parentId: `$${sectionId}`,
      },
      group: 'features',
      description: '섹션 서브 제목',
    });

    commands.push({
      id: nextId(),
      command: 'set_text_style',
      params: {
        nodeId: `$${subId}`,
        textAlignHorizontal: 'CENTER',
      },
      group: 'features',
      description: '서브 제목 스타일',
    });
  }

  // 카드 그리드 (수평 배치, 3열)
  const gridId = nextId();
  commands.push({
    id: gridId,
    command: 'create_frame',
    params: {
      width: canvasWidth - 160,
      height: 350,
      layoutMode: 'HORIZONTAL',
      primaryAxisAlignItems: 'MIN',
      counterAxisAlignItems: 'MIN',
      itemSpacing: 24,
      layoutSizingHorizontal: 'FILL',
      layoutSizingVertical: 'HUG',
      primaryAxisSizingMode: 'AUTO',
      name: 'Features Grid',
      parentId: `$${sectionId}`,
    },
    group: 'features',
    description: '카드 그리드',
  });

  // 최대 3개 카드 생성
  const items = content.items.slice(0, 3);
  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // 카드 프레임
    const cardId = nextId();
    commands.push({
      id: cardId,
      command: 'create_frame',
      params: {
        width: 380,
        height: 320,
        layoutMode: 'VERTICAL',
        primaryAxisAlignItems: 'MIN',
        counterAxisAlignItems: 'MIN',
        paddingTop: 36,
        paddingBottom: 36,
        paddingLeft: 32,
        paddingRight: 32,
        itemSpacing: 16,
        fillColor: colors.cardBackground,
        layoutSizingHorizontal: 'FILL',
        layoutSizingVertical: 'HUG',
        name: `Feature Card ${i + 1}`,
        parentId: `$${gridId}`,
      },
      group: 'features',
      description: `카드 ${i + 1}`,
    });

    commands.push({
      id: nextId(),
      command: 'set_corner_radius',
      params: { nodeId: `$${cardId}`, radius: 16 },
      group: 'features',
      description: '카드 둥글기',
    });

    // 아이콘 영역 (원형 배경)
    const iconBgId = nextId();
    commands.push({
      id: iconBgId,
      command: 'create_frame',
      params: {
        width: 56,
        height: 56,
        layoutMode: 'HORIZONTAL',
        primaryAxisAlignItems: 'CENTER',
        counterAxisAlignItems: 'CENTER',
        fillColor: { ...colors.primary, a: 0.15 },
        name: `Icon BG ${i + 1}`,
        parentId: `$${cardId}`,
      },
      group: 'features',
      description: '아이콘 배경',
    });

    commands.push({
      id: nextId(),
      command: 'set_corner_radius',
      params: { nodeId: `$${iconBgId}`, radius: 28 },
      group: 'features',
      description: '아이콘 둥글기',
    });

    // 아이콘 심볼 (텍스트로 대체)
    commands.push({
      id: nextId(),
      command: 'create_text',
      params: {
        text: String(i + 1),
        fontSize: 22,
        fontWeight: 700,
        fontColor: colors.primary,
        name: `Icon ${i + 1}`,
        parentId: `$${iconBgId}`,
      },
      group: 'features',
      description: '아이콘 번호',
    });

    // 카드 제목
    commands.push({
      id: nextId(),
      command: 'create_text',
      params: {
        text: item.title,
        fontSize: 22,
        fontWeight: 700,
        fontColor: colors.textWhite,
        name: `Feature Title ${i + 1}`,
        parentId: `$${cardId}`,
      },
      group: 'features',
      description: '카드 제목',
    });

    // 카드 설명
    const descId = nextId();
    commands.push({
      id: descId,
      command: 'create_text',
      params: {
        text: item.description,
        fontSize: 16,
        fontWeight: 400,
        fontColor: colors.textMuted,
        name: `Feature Description ${i + 1}`,
        parentId: `$${cardId}`,
      },
      group: 'features',
      description: '카드 설명',
    });

    commands.push({
      id: nextId(),
      command: 'set_text_style',
      params: {
        nodeId: `$${descId}`,
        lineHeight: 26,
      },
      group: 'features',
      description: '설명 줄간격',
    });
  }

  return { commands, nextId: id };
}
