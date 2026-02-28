import { describe, it, expect } from 'vitest';
import { CATEGORIES, getCategoryById } from '../categories';

describe('CATEGORIES', () => {
  it('has exactly 11 categories', () => {
    expect(CATEGORIES).toHaveLength(11);
  });

  it('every category has required fields', () => {
    for (const category of CATEGORIES) {
      expect(category.id).toBeTruthy();
      expect(category.name).toBeTruthy();
      expect(category.description).toBeTruthy();
      expect(category.icon).toBeTruthy();
      expect(Array.isArray(category.inputSchema)).toBe(true);
    }
  });

  it('all category ids are unique', () => {
    const ids = CATEGORIES.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('every category inputSchema has at least one required field', () => {
    for (const category of CATEGORIES) {
      const requiredFields = category.inputSchema.filter(f => f.required);
      expect(requiredFields.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('every category has advanced fields from COMMON_ADVANCED_FIELDS', () => {
    const commonAdvancedNames = [
      'sellingPoints', 'originalPrice', 'salePrice', 'discountRate',
      'brandColor', 'accentColor', 'toneManner', 'ctaText', 'referenceUrl',
    ];
    for (const category of CATEGORIES) {
      const fieldNames = category.inputSchema.map(f => f.name);
      for (const advName of commonAdvancedNames) {
        expect(fieldNames).toContain(advName);
      }
    }
  });

  it('advanced fields are marked with advanced: true', () => {
    for (const category of CATEGORIES) {
      const advancedFields = category.inputSchema.filter(f => f.advanced);
      expect(advancedFields.length).toBeGreaterThanOrEqual(9);
      for (const field of advancedFields) {
        expect(field.advanced).toBe(true);
      }
    }
  });

  it('brandColor and accentColor fields have type "color"', () => {
    for (const category of CATEGORIES) {
      const brandColor = category.inputSchema.find(f => f.name === 'brandColor');
      const accentColor = category.inputSchema.find(f => f.name === 'accentColor');
      expect(brandColor?.type).toBe('color');
      expect(accentColor?.type).toBe('color');
    }
  });

  it('toneManner field has select options', () => {
    for (const category of CATEGORIES) {
      const toneManner = category.inputSchema.find(f => f.name === 'toneManner');
      expect(toneManner?.type).toBe('select');
      expect(toneManner?.options).toBeDefined();
      expect(toneManner!.options!.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('does not duplicate fields when category already has one', () => {
    for (const category of CATEGORIES) {
      const names = category.inputSchema.map(f => f.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBe(names.length);
    }
  });
});

describe('getCategoryById', () => {
  it('returns the correct category for ecommerce', () => {
    const result = getCategoryById('ecommerce');
    expect(result).toBeDefined();
    expect(result!.id).toBe('ecommerce');
    expect(result!.name).toBeTruthy();
  });

  it('returns undefined for nonexistent id', () => {
    const result = getCategoryById('nonexistent');
    expect(result).toBeUndefined();
  });

  it('returns correct category for each known id', () => {
    const expectedIds = [
      'ecommerce', 'realestate', 'medical', 'education', 'restaurant',
      'travel', 'wedding', 'legal', 'fitness', 'saas', 'personal',
    ];
    for (const id of expectedIds) {
      const result = getCategoryById(id);
      expect(result).toBeDefined();
      expect(result!.id).toBe(id);
    }
  });
});
