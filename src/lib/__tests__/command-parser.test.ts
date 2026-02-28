import { describe, it, expect } from 'vitest';
import {
  parseCommandsFromResponse,
  extractSections,
  estimateTime,
} from '../figma/command-generator';

describe('parseCommandsFromResponse', () => {
  it('parses a valid JSON array', () => {
    const input = JSON.stringify([
      { id: 'cmd_001', command: 'create_frame', params: { width: 100 } },
      { id: 'cmd_002', command: 'create_text', params: { text: 'hello' } },
    ]);

    const result = parseCommandsFromResponse(input);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('cmd_001');
    expect(result[0].command).toBe('create_frame');
    expect(result[0].params).toEqual({ width: 100 });
    expect(result[1].id).toBe('cmd_002');
  });

  it('parses JSON wrapped in markdown code block', () => {
    const input = '```json\n[\n{"id": "a1", "command": "create_text", "params": {"text": "test"}}\n]\n```';

    const result = parseCommandsFromResponse(input);
    expect(result).toHaveLength(1);
    expect(result[0].command).toBe('create_text');
  });

  it('auto-generates id when id is empty', () => {
    const input = JSON.stringify([
      { command: 'create_frame', params: {} },
      { command: 'create_text', params: {} },
    ]);

    const result = parseCommandsFromResponse(input);
    expect(result[0].id).toBe('cmd_001');
    expect(result[1].id).toBe('cmd_002');
  });

  it('throws when command field is missing', () => {
    const input = JSON.stringify([
      { id: 'cmd_001', params: {} },
    ]);

    expect(() => parseCommandsFromResponse(input)).toThrow();
  });

  it('throws for non-JSON text', () => {
    const input = 'This is just plain text without any JSON.';
    expect(() => parseCommandsFromResponse(input)).toThrow();
  });

  it('repairs truncated JSON array from token limit', () => {
    // Gemini가 토큰 한도로 JSON을 중간에 자른 경우
    const input = '[{"id":"cmd_001","command":"create_frame","params":{"width":100}},{"id":"cmd_002","command":"create_text","params":{"text":"hello"}},{"id":"cmd_003","command":"create_rect';

    const result = parseCommandsFromResponse(input);
    // 완전한 객체 2개만 복구되어야 한다
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('cmd_001');
    expect(result[1].id).toBe('cmd_002');
  });

  it('repairs truncated JSON with nested objects', () => {
    const input = '[{"id":"cmd_001","command":"create_frame","params":{"fillColor":{"r":1,"g":0,"b":0,"a":1}}},{"id":"cmd_002","command":"create_text","params":{"text":"잘린';

    const result = parseCommandsFromResponse(input);
    expect(result).toHaveLength(1);
    expect(result[0].params).toEqual({ fillColor: { r: 1, g: 0, b: 0, a: 1 } });
  });

  it('sets default empty object for missing params', () => {
    const input = JSON.stringify([
      { id: 'cmd_001', command: 'get_selection' },
    ]);

    const result = parseCommandsFromResponse(input);
    expect(result[0].params).toEqual({});
  });

  it('preserves group and description fields', () => {
    const input = JSON.stringify([
      {
        id: 'cmd_001',
        command: 'create_frame',
        params: {},
        group: 'Hero',
        description: 'Main hero section',
      },
    ]);

    const result = parseCommandsFromResponse(input);
    expect(result[0].group).toBe('Hero');
    expect(result[0].description).toBe('Main hero section');
  });
});

describe('extractSections', () => {
  it('returns unique section names from group fields', () => {
    const commands = [
      { id: '1', command: 'create_frame' as const, params: {}, group: 'Hero' },
      { id: '2', command: 'create_text' as const, params: {}, group: 'Hero' },
      { id: '3', command: 'create_frame' as const, params: {}, group: 'Features' },
      { id: '4', command: 'create_text' as const, params: {}, group: 'CTA' },
    ];

    const result = extractSections(commands);
    expect(result).toHaveLength(3);
    expect(result).toContain('Hero');
    expect(result).toContain('Features');
    expect(result).toContain('CTA');
  });

  it('returns empty array when no groups exist', () => {
    const commands = [
      { id: '1', command: 'create_frame' as const, params: {} },
    ];

    const result = extractSections(commands);
    expect(result).toHaveLength(0);
  });
});

describe('estimateTime', () => {
  it('returns seconds for small command counts', () => {
    const result = estimateTime(10);
    expect(result).toContain('5');
  });

  it('returns minutes for large command counts', () => {
    const result = estimateTime(200);
    expect(result).toContain('2');
  });

  it('returns seconds string for counts under 120', () => {
    const result = estimateTime(60);
    expect(result).toBe('30초');
  });

  it('returns minutes string for counts over 120', () => {
    const result = estimateTime(240);
    expect(result).toBe('약 2분');
  });
});
