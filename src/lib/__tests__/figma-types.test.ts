import { describe, it, expect } from 'vitest';
import { extractInputField, extractInputArray } from '../figma/types';

describe('extractInputField', () => {
  it('returns string value for string field', () => {
    const data = { productName: '오가닉 티셔츠' };
    expect(extractInputField(data, 'productName')).toBe('오가닉 티셔츠');
  });

  it('returns joined string for array field', () => {
    const data = { tags: ['친환경', '면100%'] };
    expect(extractInputField(data, 'tags')).toBe('친환경, 면100%');
  });

  it('returns empty string for missing key', () => {
    const data = { productName: '테스트' };
    expect(extractInputField(data, 'missing')).toBe('');
  });

  it('returns empty string for undefined inputData', () => {
    expect(extractInputField(undefined, 'any')).toBe('');
  });

  it('returns empty string for non-string/non-array value', () => {
    const data = { count: 42 };
    expect(extractInputField(data, 'count')).toBe('');
  });
});

describe('extractInputArray', () => {
  it('returns array value for array field', () => {
    const data = { features: ['빠른배송', '무료반품'] };
    expect(extractInputArray(data, 'features')).toEqual(['빠른배송', '무료반품']);
  });

  it('splits comma-separated string into array', () => {
    const data = { features: '빠른배송, 무료반품, 친환경' };
    expect(extractInputArray(data, 'features')).toEqual(['빠른배송', '무료반품', '친환경']);
  });

  it('returns empty array for missing key', () => {
    const data = { other: 'value' };
    expect(extractInputArray(data, 'features')).toEqual([]);
  });

  it('returns empty array for undefined inputData', () => {
    expect(extractInputArray(undefined, 'any')).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    const data = { features: '' };
    expect(extractInputArray(data, 'features')).toEqual([]);
  });

  it('converts non-string array elements to string', () => {
    const data = { items: [1, 2, 3] };
    expect(extractInputArray(data, 'items')).toEqual(['1', '2', '3']);
  });
});
