import { describe, it, expect } from 'vitest';
import { parseAnalysisResponse } from '../reference/analyzer';

const VALID_ANALYSIS = {
  colorPalette: {
    primary: '#FF6B35',
    secondary: '#1A1A2E',
    accent: '#FFD93D',
    background: '#FFFFFF',
    text: '#333333',
  },
  sections: [
    { type: 'hero', layout: 'full-width', hasImage: true, hasText: true, estimatedHeight: 800, elements: [] },
    { type: 'features', layout: 'three-column', hasImage: true, hasText: true, estimatedHeight: 600, elements: [] },
  ],
  typography: {
    headingStyle: 'bold',
    bodyStyle: 'clean',
    headingSize: 48,
    bodySize: 16,
  },
  overallStyle: 'modern-minimal',
  totalHeight: 5000,
};

describe('parseAnalysisResponse', () => {
  it('parses valid JSON correctly', () => {
    const input = JSON.stringify(VALID_ANALYSIS);
    const result = parseAnalysisResponse(input);

    expect(result.colorPalette.primary).toBe('#FF6B35');
    expect(result.colorPalette.secondary).toBe('#1A1A2E');
    expect(result.sections).toHaveLength(2);
    expect(result.sections[0].type).toBe('hero');
    expect(result.typography.headingStyle).toBe('bold');
    expect(result.typography.headingSize).toBe(48);
    expect(result.overallStyle).toBe('modern-minimal');
    expect(result.totalHeight).toBe(5000);
  });

  it('parses JSON wrapped in markdown code block', () => {
    const input = '```json\n' + JSON.stringify(VALID_ANALYSIS) + '\n```';
    const result = parseAnalysisResponse(input);

    expect(result.colorPalette.primary).toBe('#FF6B35');
    expect(result.sections).toHaveLength(2);
  });

  it('throws when colorPalette is missing', () => {
    const invalid = { sections: [{ type: 'hero' }] };
    const input = JSON.stringify(invalid);
    expect(() => parseAnalysisResponse(input)).toThrow();
  });

  it('throws when sections is missing', () => {
    const invalid = { colorPalette: { primary: '#000' } };
    const input = JSON.stringify(invalid);
    expect(() => parseAnalysisResponse(input)).toThrow();
  });

  it('throws when sections is not an array', () => {
    const invalid = {
      colorPalette: { primary: '#000' },
      sections: 'not-an-array',
    };
    const input = JSON.stringify(invalid);
    expect(() => parseAnalysisResponse(input)).toThrow();
  });

  it('applies default colors when palette fields are missing', () => {
    const partial = {
      colorPalette: { primary: '#123456' },
      sections: [{ type: 'hero' }],
    };
    const input = JSON.stringify(partial);
    const result = parseAnalysisResponse(input);

    expect(result.colorPalette.primary).toBe('#123456');
    expect(result.colorPalette.secondary).toBe('#8B5CF6');
    expect(result.colorPalette.accent).toBe('#06B6D4');
    expect(result.colorPalette.background).toBe('#FFFFFF');
    expect(result.colorPalette.text).toBe('#1A1A1A');
  });

  it('applies default typography when typography is missing', () => {
    const noTypography = {
      colorPalette: { primary: '#000' },
      sections: [{ type: 'hero' }],
    };
    const input = JSON.stringify(noTypography);
    const result = parseAnalysisResponse(input);

    expect(result.typography.headingStyle).toBe('bold');
    expect(result.typography.bodyStyle).toBe('clean');
    expect(result.typography.headingSize).toBe(48);
    expect(result.typography.bodySize).toBe(16);
  });

  it('applies default overallStyle and totalHeight when missing', () => {
    const minimal = {
      colorPalette: { primary: '#000' },
      sections: [{ type: 'hero' }],
    };
    const input = JSON.stringify(minimal);
    const result = parseAnalysisResponse(input);

    expect(result.overallStyle).toBe('modern-minimal');
    expect(result.totalHeight).toBe(4000);
  });

  it('throws for text without JSON', () => {
    const input = 'This response contains no JSON at all.';
    expect(() => parseAnalysisResponse(input)).toThrow();
  });

  it('parses detailed section elements', () => {
    const withElements = {
      colorPalette: { primary: '#6366F1' },
      sections: [{
        type: 'hero',
        layout: 'full-width',
        hasImage: true,
        hasText: true,
        estimatedHeight: 800,
        backgroundColor: '#1A1A2E',
        padding: { top: 80, right: 60, bottom: 80, left: 60 },
        gap: 32,
        contentWidth: 1200,
        contentAlign: 'center',
        elements: [
          {
            type: 'heading',
            x: 120,
            y: 100,
            width: 960,
            height: 72,
            text: '프리미엄 서비스',
            fontSize: 56,
            fontWeight: 800,
            textColor: '#FFFFFF',
            textAlign: 'CENTER',
            letterSpacing: -1.5,
          },
          {
            type: 'image',
            x: 0,
            y: 0,
            width: 1440,
            height: 600,
            imageDescription: '히어로 배경 이미지',
            borderRadius: 0,
          },
          {
            type: 'button',
            x: 520,
            y: 500,
            width: 200,
            height: 56,
            text: '시작하기',
            fontSize: 18,
            fontWeight: 700,
            textColor: '#FFFFFF',
            backgroundColor: '#6366F1',
            borderRadius: 12,
            shadow: { x: 0, y: 4, blur: 16, spread: 0, color: 'rgba(99,102,241,0.3)' },
          },
        ],
      }],
    };
    const input = JSON.stringify(withElements);
    const result = parseAnalysisResponse(input);

    expect(result.sections[0].elements).toHaveLength(3);

    const heading = result.sections[0].elements[0];
    expect(heading.type).toBe('heading');
    expect(heading.fontSize).toBe(56);
    expect(heading.fontWeight).toBe(800);
    expect(heading.textColor).toBe('#FFFFFF');
    expect(heading.letterSpacing).toBe(-1.5);
    expect(heading.text).toBe('프리미엄 서비스');

    const image = result.sections[0].elements[1];
    expect(image.type).toBe('image');
    expect(image.width).toBe(1440);
    expect(image.imageDescription).toBe('히어로 배경 이미지');

    const button = result.sections[0].elements[2];
    expect(button.type).toBe('button');
    expect(button.shadow).toBeDefined();
    expect(button.shadow?.blur).toBe(16);
    expect(button.borderRadius).toBe(12);
  });

  it('parses background gradient in sections', () => {
    const withGradient = {
      colorPalette: { primary: '#6366F1' },
      sections: [{
        type: 'hero',
        layout: 'full-width',
        hasImage: false,
        hasText: true,
        estimatedHeight: 700,
        backgroundGradient: {
          type: 'linear',
          colors: [
            { color: '#1A1A2E', position: 0 },
            { color: '#6366F1', position: 1 },
          ],
          angle: 135,
        },
        elements: [],
      }],
    };
    const input = JSON.stringify(withGradient);
    const result = parseAnalysisResponse(input);

    expect(result.sections[0].backgroundGradient).toBeDefined();
    expect(result.sections[0].backgroundGradient?.type).toBe('linear');
    expect(result.sections[0].backgroundGradient?.colors).toHaveLength(2);
    expect(result.sections[0].backgroundGradient?.angle).toBe(135);
  });

  it('parses effects (gradients and shadows)', () => {
    const withEffects = {
      colorPalette: { primary: '#6366F1' },
      sections: [{ type: 'hero', layout: 'full-width', hasImage: false, hasText: true, estimatedHeight: 600, elements: [] }],
      effects: {
        gradients: [
          { type: 'linear', colors: [{ color: '#6366F1', position: 0 }, { color: '#8B5CF6', position: 1 }], angle: 180, usage: 'hero 배경' },
        ],
        shadows: [
          { x: 0, y: 4, blur: 24, spread: 0, color: 'rgba(0,0,0,0.08)', usage: '카드' },
        ],
        hasGlassEffect: true,
        hasParallax: false,
      },
    };
    const input = JSON.stringify(withEffects);
    const result = parseAnalysisResponse(input);

    expect(result.effects).toBeDefined();
    expect(result.effects?.gradients).toHaveLength(1);
    expect(result.effects?.gradients[0].type).toBe('linear');
    expect(result.effects?.shadows).toHaveLength(1);
    expect(result.effects?.shadows[0].blur).toBe(24);
    expect(result.effects?.hasGlassEffect).toBe(true);
  });

  it('parses spacing system', () => {
    const withSpacing = {
      colorPalette: { primary: '#6366F1' },
      sections: [{ type: 'hero', layout: 'full-width', hasImage: false, hasText: true, estimatedHeight: 600, elements: [] }],
      spacing: {
        sectionGap: 0,
        contentMaxWidth: 1200,
        defaultPadding: { top: 80, right: 60, bottom: 80, left: 60 },
      },
    };
    const input = JSON.stringify(withSpacing);
    const result = parseAnalysisResponse(input);

    expect(result.spacing).toBeDefined();
    expect(result.spacing?.contentMaxWidth).toBe(1200);
    expect(result.spacing?.defaultPadding.top).toBe(80);
  });

  it('parses additionalColors in colorPalette', () => {
    const withAdditional = {
      colorPalette: {
        primary: '#6366F1',
        additionalColors: ['#F3F4F6', '#E5E7EB', '#FF6B35'],
      },
      sections: [{ type: 'hero', layout: 'full-width', hasImage: false, hasText: true, estimatedHeight: 600, elements: [] }],
    };
    const input = JSON.stringify(withAdditional);
    const result = parseAnalysisResponse(input);

    expect(result.colorPalette.additionalColors).toHaveLength(3);
    expect(result.colorPalette.additionalColors?.[0]).toBe('#F3F4F6');
  });

  it('parses extended typography fields', () => {
    const withTypo = {
      colorPalette: { primary: '#000' },
      sections: [{ type: 'hero', elements: [] }],
      typography: {
        headingStyle: 'elegant',
        bodyStyle: 'warm',
        headingSize: 52,
        bodySize: 17,
        headingFont: 'Pretendard',
        bodyFont: 'Noto Sans KR',
        headingWeight: 800,
        bodyWeight: 400,
        headingLetterSpacing: -1.0,
        bodyLineHeight: 1.7,
      },
    };
    const input = JSON.stringify(withTypo);
    const result = parseAnalysisResponse(input);

    expect(result.typography.headingFont).toBe('Pretendard');
    expect(result.typography.bodyFont).toBe('Noto Sans KR');
    expect(result.typography.headingWeight).toBe(800);
    expect(result.typography.headingLetterSpacing).toBe(-1.0);
    expect(result.typography.bodyLineHeight).toBe(1.7);
  });

  it('handles sections without elements array gracefully', () => {
    const noElements = {
      colorPalette: { primary: '#000' },
      sections: [
        { type: 'hero', layout: 'full-width', hasImage: true, hasText: true, estimatedHeight: 700 },
      ],
    };
    const input = JSON.stringify(noElements);
    const result = parseAnalysisResponse(input);

    expect(result.sections[0].elements).toEqual([]);
  });

  it('handles element with border data', () => {
    const withBorder = {
      colorPalette: { primary: '#000' },
      sections: [{
        type: 'features',
        elements: [
          {
            type: 'card',
            x: 0, y: 0, width: 300, height: 200,
            border: { color: '#E5E7EB', width: 1 },
            borderRadius: 16,
          },
        ],
      }],
    };
    const input = JSON.stringify(withBorder);
    const result = parseAnalysisResponse(input);

    const card = result.sections[0].elements[0];
    expect(card.border?.color).toBe('#E5E7EB');
    expect(card.border?.width).toBe(1);
    expect(card.borderRadius).toBe(16);
  });
});
