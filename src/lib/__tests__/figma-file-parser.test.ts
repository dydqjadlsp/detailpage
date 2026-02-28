import { describe, it, expect } from 'vitest';
import { extractFileKey, fileAnalysisToReference } from '../figma/figma-file-parser';
import type { FigmaFileAnalysis } from '../figma/types';

describe('extractFileKey', () => {
  it('extracts file key from standard figma design URL', () => {
    const url = 'https://www.figma.com/design/AbCdEf123456/My-Design';
    expect(extractFileKey(url)).toBe('AbCdEf123456');
  });

  it('extracts file key from figma file URL', () => {
    const url = 'https://www.figma.com/file/XyZ789AbCdEf/Some-File';
    expect(extractFileKey(url)).toBe('XyZ789AbCdEf');
  });

  it('extracts file key from URL with query params', () => {
    const url = 'https://www.figma.com/design/AbCdEf123456/My-Design?node-id=0-1&t=abc';
    expect(extractFileKey(url)).toBe('AbCdEf123456');
  });

  it('extracts file key from URL without title', () => {
    const url = 'https://www.figma.com/design/AbCdEf123456';
    expect(extractFileKey(url)).toBe('AbCdEf123456');
  });

  it('returns null for invalid URL', () => {
    expect(extractFileKey('https://google.com')).toBeNull();
    expect(extractFileKey('not-a-url')).toBeNull();
    expect(extractFileKey('')).toBeNull();
  });

  it('returns null for figma URL without file key', () => {
    expect(extractFileKey('https://www.figma.com/')).toBeNull();
    expect(extractFileKey('https://www.figma.com/design/')).toBeNull();
  });
});

describe('fileAnalysisToReference', () => {
  const mockAnalysis: FigmaFileAnalysis = {
    fileKey: 'test123',
    fileName: 'Test Design',
    colorPalette: [
      { color: '#FF6B35', rgba: { r: 1, g: 0.42, b: 0.21, a: 1 }, count: 10, usage: 'fill' },
      { color: '#004E89', rgba: { r: 0, g: 0.31, b: 0.54, a: 1 }, count: 5, usage: 'text' },
    ],
    textStyles: [
      { fontFamily: 'Pretendard', fontSize: 32, fontWeight: 700, letterSpacing: 0, lineHeight: 1.4, count: 3 },
      { fontFamily: 'Pretendard', fontSize: 16, fontWeight: 400, letterSpacing: 0, lineHeight: 1.6, count: 12 },
    ],
    sections: [
      {
        name: 'Hero Section',
        type: 'FRAME',
        width: 860,
        height: 800,
        layoutMode: 'VERTICAL',
        padding: { top: 40, right: 40, bottom: 40, left: 40 },
        gap: 16,
        backgroundColor: '#FF6B35',
        childCount: 5,
        hasImage: true,
        hasOverlay: true,
        effects: ['DROP_SHADOW'],
      },
      {
        name: 'Features Section',
        type: 'FRAME',
        width: 860,
        height: 600,
        layoutMode: 'VERTICAL',
        childCount: 8,
        hasImage: false,
        hasOverlay: false,
        effects: [],
      },
    ],
    stats: {
      totalNodes: 150,
      totalTexts: 40,
      totalImages: 8,
      totalFrames: 30,
      canvasWidth: 860,
      canvasHeight: 5000,
    },
  };

  it('converts analysis to ReferenceAnalysis format', () => {
    const result = fileAnalysisToReference(mockAnalysis);
    expect(result).toBeDefined();
    expect(result.sections).toBeDefined();
    expect(Array.isArray(result.sections)).toBe(true);
  });

  it('preserves section count', () => {
    const result = fileAnalysisToReference(mockAnalysis);
    expect(result.sections.length).toBe(mockAnalysis.sections.length);
  });

  it('includes color palette with primary/secondary/accent', () => {
    const result = fileAnalysisToReference(mockAnalysis);
    expect(result.colorPalette).toBeDefined();
    expect(result.colorPalette.primary).toBeTruthy();
    expect(result.colorPalette.secondary).toBeTruthy();
    expect(result.colorPalette.accent).toBeTruthy();
  });

  it('includes overall style as string', () => {
    const result = fileAnalysisToReference(mockAnalysis);
    expect(result.overallStyle).toBeDefined();
    expect(typeof result.overallStyle).toBe('string');
  });

  it('maps section data correctly', () => {
    const result = fileAnalysisToReference(mockAnalysis);
    const heroSection = result.sections[0];
    expect(heroSection).toBeDefined();
    expect(heroSection.contentWidth).toBe(860);
    expect(heroSection.estimatedHeight).toBe(800);
  });
});
