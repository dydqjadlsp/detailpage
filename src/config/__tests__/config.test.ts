import { describe, it, expect } from 'vitest';
import {
  getCategoryTemplate,
  getCategoryTone,
  getRecommendedFormulas,
  NINE_STEP_FORMULA,
  PIXEL_PRESETS,
  generateSectionOrder,
  calculateSectionHeights,
  getPrinciplesBySection,
  getImagePromptQuality,
} from '../index';

describe('getCategoryTemplate', () => {
  it('returns template with required fields for ecommerce', () => {
    const template = getCategoryTemplate('ecommerce');
    expect(template).toBeDefined();
    expect(template.name).toBeTruthy();
    expect(template.colorScheme).toBeDefined();
    expect(template.colorScheme.primary).toBeTruthy();
    expect(template.typography).toBeDefined();
    expect(template.typography.headingStyle).toBeTruthy();
  });

  it('returns default template for unknown category', () => {
    const template = getCategoryTemplate('unknown');
    expect(template).toBeDefined();
    expect(template.name).toBeTruthy();
    expect(template.colorScheme).toBeDefined();
  });
});

describe('getCategoryTone', () => {
  it('returns tone with voiceCharacteristics and powerWords for ecommerce', () => {
    const tone = getCategoryTone('ecommerce');
    expect(tone).toBeDefined();
    expect(Array.isArray(tone.voiceCharacteristics)).toBe(true);
    expect(tone.voiceCharacteristics.length).toBeGreaterThan(0);
    expect(Array.isArray(tone.powerWords)).toBe(true);
    expect(tone.powerWords.length).toBeGreaterThan(0);
  });

  it('returns default tone for unknown category', () => {
    const tone = getCategoryTone('unknown');
    expect(tone).toBeDefined();
    expect(tone.voiceCharacteristics).toBeDefined();
  });
});

describe('getRecommendedFormulas', () => {
  it('returns formulas that include the given category', () => {
    const formulas = getRecommendedFormulas('ecommerce');
    expect(Array.isArray(formulas)).toBe(true);
    expect(formulas.length).toBeGreaterThan(0);
    for (const formula of formulas) {
      expect(formula.bestFor).toContain('ecommerce');
    }
  });
});

describe('NINE_STEP_FORMULA', () => {
  it('has exactly 9 steps', () => {
    expect(NINE_STEP_FORMULA).toHaveLength(9);
  });

  it('each step has required fields', () => {
    for (const step of NINE_STEP_FORMULA) {
      expect(step.step).toBeGreaterThanOrEqual(1);
      expect(step.step).toBeLessThanOrEqual(9);
      expect(step.name).toBeTruthy();
      expect(step.nameEn).toBeTruthy();
      expect(step.purpose).toBeTruthy();
      expect(Array.isArray(step.requiredSections)).toBe(true);
    }
  });
});

describe('PIXEL_PRESETS', () => {
  it('contains all expected preset keys', () => {
    expect(PIXEL_PRESETS['4000']).toBeDefined();
    expect(PIXEL_PRESETS['8000']).toBeDefined();
    expect(PIXEL_PRESETS['12000']).toBeDefined();
    expect(PIXEL_PRESETS['20000']).toBeDefined();
    expect(PIXEL_PRESETS['40000']).toBeDefined();
  });

  it('each preset has totalHeight matching key', () => {
    for (const [key, preset] of Object.entries(PIXEL_PRESETS)) {
      expect(preset.totalHeight).toBe(Number(key));
    }
  });
});

describe('generateSectionOrder', () => {
  it('returns an array for 8000px preset', () => {
    const sections = generateSectionOrder('8000');
    expect(Array.isArray(sections)).toBe(true);
    expect(sections.length).toBeGreaterThan(0);
  });

  it('falls back to 8000 for unknown height', () => {
    const sections = generateSectionOrder('9999');
    const defaultSections = generateSectionOrder('8000');
    expect(sections).toEqual(defaultSections);
  });
});

describe('calculateSectionHeights', () => {
  it('returns an object with height values for given sections', () => {
    const sections = ['Hero', 'Features', 'CTA'] as const;
    const heights = calculateSectionHeights('8000', [...sections]);

    expect(typeof heights).toBe('object');
    for (const section of sections) {
      expect(typeof heights[section]).toBe('number');
      expect(heights[section]).toBeGreaterThan(0);
    }
  });
});

describe('getPrinciplesBySection', () => {
  it('returns principles for Hero section', () => {
    const principles = getPrinciplesBySection('Hero');
    expect(Array.isArray(principles)).toBe(true);
    expect(principles.length).toBeGreaterThan(0);
    for (const p of principles) {
      expect(p.placement).toContain('Hero');
    }
  });

  it('returns empty array for unknown section', () => {
    const principles = getPrinciplesBySection('NonexistentSection');
    expect(Array.isArray(principles)).toBe(true);
    expect(principles).toHaveLength(0);
  });
});

describe('getImagePromptQuality', () => {
  it('returns quality config with styleKeywords for standard tier', () => {
    const quality = getImagePromptQuality('standard');
    expect(quality).toBeDefined();
    expect(Array.isArray(quality!.styleKeywords)).toBe(true);
    expect(quality!.styleKeywords.length).toBeGreaterThan(0);
  });

  it('returns undefined for unknown tier', () => {
    const quality = getImagePromptQuality('nonexistent');
    expect(quality).toBeUndefined();
  });
});
