/**
 * Hero 섹션 템플릿
 * 코드로 레이아웃을 확정하고, 콘텐츠(텍스트/이미지)만 외부에서 주입한다.
 */

import type { FigmaCommand } from '../types';

interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface HeroContent {
  badge?: string;
  title: string;
  subtitle: string;
  ctaText: string;
  secondaryCtaText?: string;
  trustText?: string;
}

export interface HeroColors {
  primary: RgbaColor;
  background: RgbaColor;
  textWhite: RgbaColor;
  textMuted: RgbaColor;
}

interface HeroBuildConfig {
  canvasWidth: number;
  content: HeroContent;
  colors: HeroColors;
  startId: number;
  parentId: string;
}

/**
 * Hero 섹션 커맨드 배열을 생성한다.
 * 레이아웃은 100% 코드로 결정. AI 의존 없음.
 */
export function buildHeroSection(config: HeroBuildConfig): {
  commands: FigmaCommand[];
  nextId: number;
} {
  const { canvasWidth, content, colors, parentId } = config;
  let id = config.startId;
  const nextId = () => `cmd_${String(id++).padStart(3, '0')}`;
  const commands: FigmaCommand[] = [];

  // Hero 루트 프레임 (세로 정렬, 중앙)
  const heroId = nextId();
  commands.push({
    id: heroId,
    command: 'create_frame',
    params: {
      width: canvasWidth,
      height: 850,
      layoutMode: 'VERTICAL',
      primaryAxisAlignItems: 'CENTER',
      counterAxisAlignItems: 'CENTER',
      paddingTop: 80,
      paddingBottom: 60,
      paddingLeft: 80,
      paddingRight: 80,
      itemSpacing: 28,
      fillColor: colors.background,
      layoutSizingHorizontal: 'FILL',
      layoutSizingVertical: 'HUG',
      name: 'Hero Section',
      parentId: `$${parentId}`,
    },
    group: 'hero',
    description: 'Hero 배경 프레임',
  });

  // 배지 (선택사항)
  if (content.badge) {
    const badgeFrameId = nextId();
    commands.push({
      id: badgeFrameId,
      command: 'create_frame',
      params: {
        width: 200,
        height: 36,
        layoutMode: 'HORIZONTAL',
        primaryAxisAlignItems: 'CENTER',
        counterAxisAlignItems: 'CENTER',
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 20,
        paddingRight: 20,
        fillColor: { ...colors.primary, a: 0.15 },
        name: 'Hero Badge',
        parentId: `$${heroId}`,
        layoutSizingHorizontal: 'HUG',
        layoutSizingVertical: 'HUG',
      },
      group: 'hero',
      description: '배지 프레임',
    });

    // 배지 모서리
    commands.push({
      id: nextId(),
      command: 'set_corner_radius',
      params: { nodeId: `$${badgeFrameId}`, radius: 20 },
      group: 'hero',
      description: '배지 둥글기',
    });

    // 배지 텍스트
    commands.push({
      id: nextId(),
      command: 'create_text',
      params: {
        text: content.badge,
        fontSize: 14,
        fontWeight: 600,
        fontColor: colors.primary,
        name: 'Badge Text',
        parentId: `$${badgeFrameId}`,
      },
      group: 'hero',
      description: '배지 텍스트',
    });
  }

  // 메인 제목
  const titleId = nextId();
  commands.push({
    id: titleId,
    command: 'create_text',
    params: {
      text: content.title,
      fontSize: 64,
      fontWeight: 800,
      fontColor: colors.textWhite,
      name: 'Hero Title',
      parentId: `$${heroId}`,
    },
    group: 'hero',
    description: '메인 제목',
  });

  // 제목 스타일 (중앙 정렬)
  commands.push({
    id: nextId(),
    command: 'set_text_style',
    params: {
      nodeId: `$${titleId}`,
      textAlignHorizontal: 'CENTER',
      lineHeight: 78,
      letterSpacing: -1.5,
    },
    group: 'hero',
    description: '제목 스타일',
  });

  // 제목 자동 크기
  commands.push({
    id: nextId(),
    command: 'set_auto_resize',
    params: {
      nodeId: `$${titleId}`,
      textAutoResize: 'WIDTH_AND_HEIGHT',
    },
    group: 'hero',
    description: '제목 자동 크기',
  });

  // 서브 타이틀
  const subtitleId = nextId();
  commands.push({
    id: subtitleId,
    command: 'create_text',
    params: {
      text: content.subtitle,
      fontSize: 22,
      fontWeight: 400,
      fontColor: colors.textMuted,
      name: 'Hero Subtitle',
      parentId: `$${heroId}`,
    },
    group: 'hero',
    description: '서브 타이틀',
  });

  // 서브 타이틀 스타일
  commands.push({
    id: nextId(),
    command: 'set_text_style',
    params: {
      nodeId: `$${subtitleId}`,
      textAlignHorizontal: 'CENTER',
      lineHeight: 34,
    },
    group: 'hero',
    description: '서브 타이틀 스타일',
  });

  commands.push({
    id: nextId(),
    command: 'set_auto_resize',
    params: {
      nodeId: `$${subtitleId}`,
      textAutoResize: 'WIDTH_AND_HEIGHT',
    },
    group: 'hero',
    description: '서브 타이틀 자동 크기',
  });

  // 메인 이미지 플레이스홀더 (섹션 폭에 꽉 차게)
  const imageId = nextId();
  commands.push({
    id: imageId,
    command: 'create_rectangle',
    params: {
      width: canvasWidth - 160,
      height: 480,
      name: '[이미지] hero-main',
      parentId: `$${heroId}`,
      fillColor: { r: 0.2, g: 0.2, b: 0.22, a: 1 },
      layoutSizingHorizontal: 'FILL',
    },
    group: 'hero',
    description: 'Hero 메인 이미지',
  });

  // 이미지 모서리
  commands.push({
    id: nextId(),
    command: 'set_corner_radius',
    params: { nodeId: `$${imageId}`, radius: 16 },
    group: 'hero',
    description: '이미지 둥글기',
  });

  // CTA 버튼 행 (수평 배치)
  const ctaRowId = nextId();
  commands.push({
    id: ctaRowId,
    command: 'create_frame',
    params: {
      width: 400,
      height: 60,
      layoutMode: 'HORIZONTAL',
      primaryAxisAlignItems: 'CENTER',
      counterAxisAlignItems: 'CENTER',
      itemSpacing: 16,
      name: 'CTA Row',
      parentId: `$${heroId}`,
      layoutSizingHorizontal: 'HUG',
      layoutSizingVertical: 'HUG',
    },
    group: 'hero',
    description: 'CTA 버튼 행',
  });

  // 메인 CTA 버튼
  const primaryBtnId = nextId();
  commands.push({
    id: primaryBtnId,
    command: 'create_frame',
    params: {
      width: 220,
      height: 56,
      layoutMode: 'HORIZONTAL',
      primaryAxisAlignItems: 'CENTER',
      counterAxisAlignItems: 'CENTER',
      paddingTop: 16,
      paddingBottom: 16,
      paddingLeft: 48,
      paddingRight: 48,
      fillColor: colors.primary,
      name: 'Primary CTA',
      parentId: `$${ctaRowId}`,
      layoutSizingHorizontal: 'HUG',
      layoutSizingVertical: 'HUG',
    },
    group: 'hero',
    description: '메인 CTA 버튼',
  });

  commands.push({
    id: nextId(),
    command: 'set_corner_radius',
    params: { nodeId: `$${primaryBtnId}`, radius: 12 },
    group: 'hero',
    description: 'CTA 둥글기',
  });

  // CTA 그림자
  commands.push({
    id: nextId(),
    command: 'set_effects',
    params: {
      nodeId: `$${primaryBtnId}`,
      effects: [{
        type: 'DROP_SHADOW',
        color: { ...colors.primary, a: 0.3 },
        offset: { x: 0, y: 4 },
        radius: 16,
        spread: 0,
        visible: true,
      }],
    },
    group: 'hero',
    description: 'CTA 그림자',
  });

  // CTA 텍스트
  commands.push({
    id: nextId(),
    command: 'create_text',
    params: {
      text: content.ctaText,
      fontSize: 18,
      fontWeight: 700,
      fontColor: { r: 1, g: 1, b: 1, a: 1 },
      name: 'CTA Text',
      parentId: `$${primaryBtnId}`,
    },
    group: 'hero',
    description: 'CTA 텍스트',
  });

  // 보조 CTA (선택사항)
  if (content.secondaryCtaText) {
    const secondaryBtnId = nextId();
    commands.push({
      id: secondaryBtnId,
      command: 'create_frame',
      params: {
        width: 180,
        height: 56,
        layoutMode: 'HORIZONTAL',
        primaryAxisAlignItems: 'CENTER',
        counterAxisAlignItems: 'CENTER',
        paddingTop: 16,
        paddingBottom: 16,
        paddingLeft: 36,
        paddingRight: 36,
        name: 'Secondary CTA',
        parentId: `$${ctaRowId}`,
        layoutSizingHorizontal: 'HUG',
        layoutSizingVertical: 'HUG',
      },
      group: 'hero',
      description: '보조 CTA 버튼',
    });

    commands.push({
      id: nextId(),
      command: 'set_corner_radius',
      params: { nodeId: `$${secondaryBtnId}`, radius: 12 },
      group: 'hero',
      description: '보조 CTA 둥글기',
    });

    commands.push({
      id: nextId(),
      command: 'set_stroke_color',
      params: {
        nodeId: `$${secondaryBtnId}`,
        color: { ...colors.textWhite, a: 0.4 },
        strokeWeight: 1.5,
      },
      group: 'hero',
      description: '보조 CTA 테두리',
    });

    commands.push({
      id: nextId(),
      command: 'create_text',
      params: {
        text: content.secondaryCtaText,
        fontSize: 18,
        fontWeight: 500,
        fontColor: colors.textWhite,
        name: 'Secondary CTA Text',
        parentId: `$${secondaryBtnId}`,
      },
      group: 'hero',
      description: '보조 CTA 텍스트',
    });
  }

  // 신뢰 텍스트 (선택사항)
  if (content.trustText) {
    const trustId = nextId();
    commands.push({
      id: trustId,
      command: 'create_text',
      params: {
        text: content.trustText,
        fontSize: 14,
        fontWeight: 400,
        fontColor: { ...colors.textWhite, a: 0.5 },
        name: 'Trust Text',
        parentId: `$${heroId}`,
      },
      group: 'hero',
      description: '신뢰 텍스트',
    });

    commands.push({
      id: nextId(),
      command: 'set_text_style',
      params: {
        nodeId: `$${trustId}`,
        textAlignHorizontal: 'CENTER',
      },
      group: 'hero',
      description: '신뢰 텍스트 스타일',
    });
  }

  return { commands, nextId: id };
}
