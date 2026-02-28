/**
 * 클론 채점 시스템
 * 원본 FigmaRestNode와 생성물 FigmaRestNode를 비교하여 점수를 산출한다.
 * 가중치: Structure 25%, Typography 25%, Color 20%, Dimension 15%, Spacing 15%
 */

import 'server-only';

import type { FigmaRestNode, CloneScore, CloneScoreDetail } from '../types';

const WEIGHTS = {
  structure: 0.25,
  typography: 0.25,
  color: 0.20,
  dimension: 0.15,
  spacing: 0.15,
};

/** 원본 vs 생성물 비교 채점 */
export function scoreClone(original: FigmaRestNode, generated: FigmaRestNode): CloneScore {
  const details: CloneScoreDetail[] = [];

  const structure = scoreStructure(original, generated, details);
  const typography = scoreTypography(original, generated, details);
  const color = scoreColor(original, generated, details);
  const dimension = scoreDimension(original, generated, details);
  const spacing = scoreSpacing(original, generated, details);

  const total = Math.round(
    structure * WEIGHTS.structure +
    typography * WEIGHTS.typography +
    color * WEIGHTS.color +
    dimension * WEIGHTS.dimension +
    spacing * WEIGHTS.spacing,
  );

  return { total, structure, typography, color, dimension, spacing, details };
}

// ===== 구조 점수 (25%) =====

function scoreStructure(original: FigmaRestNode, generated: FigmaRestNode, details: CloneScoreDetail[]): number {
  const origCount = countNodes(original);
  const genCount = countNodes(generated);
  const countRatio = Math.min(origCount, genCount) / Math.max(origCount, genCount);
  const countScore = Math.round(countRatio * 100);

  if (countScore < 80) {
    details.push({
      category: 'structure', field: 'nodeCount',
      expected: String(origCount), actual: String(genCount),
      score: countScore, severity: 'critical',
    });
  }

  const origDepth = maxDepth(original);
  const genDepth = maxDepth(generated);
  const depthDiff = Math.abs(origDepth - genDepth);
  const depthScore = Math.max(0, 100 - depthDiff * 20);

  if (depthScore < 80) {
    details.push({
      category: 'structure', field: 'treeDepth',
      expected: String(origDepth), actual: String(genDepth),
      score: depthScore, severity: depthDiff > 3 ? 'critical' : 'major',
    });
  }

  const origTypes = countTypes(original);
  const genTypes = countTypes(generated);
  const typeScore = scoreTypeDist(origTypes, genTypes);

  return Math.round((countScore * 0.4 + depthScore * 0.3 + typeScore * 0.3));
}

// ===== 타이포그래피 점수 (25%) =====

function scoreTypography(original: FigmaRestNode, generated: FigmaRestNode, details: CloneScoreDetail[]): number {
  const origTexts = collectTexts(original);
  const genTexts = collectTexts(generated);

  if (origTexts.length === 0) return 100;

  let totalScore = 0;
  const matched = Math.min(origTexts.length, genTexts.length);

  for (let i = 0; i < matched; i++) {
    const orig = origTexts[i];
    const gen = genTexts[i];
    let itemScore = 0;

    const sizeMatch = scoreTolerance(orig.fontSize, gen.fontSize, 2);
    itemScore += sizeMatch * 0.35;

    const weightMatch = orig.fontWeight === gen.fontWeight ? 100 : 50;
    itemScore += weightMatch * 0.20;

    const familyMatch = orig.fontFamily === gen.fontFamily ? 100 : 30;
    itemScore += familyMatch * 0.20;

    const contentMatch = orig.characters === gen.characters ? 100 :
      orig.characters.length > 0 && gen.characters.length > 0 ? 60 : 0;
    itemScore += contentMatch * 0.25;

    totalScore += itemScore;

    if (itemScore < 70) {
      details.push({
        category: 'typography', field: `text[${i}]`,
        expected: `${orig.fontFamily} ${orig.fontSize}/${orig.fontWeight}`,
        actual: `${gen.fontFamily} ${gen.fontSize}/${gen.fontWeight}`,
        score: Math.round(itemScore),
        severity: itemScore < 50 ? 'critical' : 'major',
      });
    }
  }

  const unmatchedPenalty = Math.abs(origTexts.length - genTexts.length) * 10;
  const avgScore = matched > 0 ? totalScore / matched : 0;

  return Math.max(0, Math.round(avgScore - unmatchedPenalty));
}

// ===== 색상 점수 (20%) =====

function scoreColor(original: FigmaRestNode, generated: FigmaRestNode, details: CloneScoreDetail[]): number {
  const origColors = collectFillColors(original);
  const genColors = collectFillColors(generated);

  if (origColors.length === 0) return 100;

  let totalScore = 0;
  const matched = Math.min(origColors.length, genColors.length);

  for (let i = 0; i < matched; i++) {
    const orig = origColors[i];
    const gen = genColors[i];
    const delta = colorDeltaE(orig, gen);
    const itemScore = delta < 5 ? 100 : delta < 15 ? 80 : delta < 30 ? 50 : 20;
    totalScore += itemScore;

    if (itemScore < 70) {
      details.push({
        category: 'color', field: `fill[${i}]`,
        expected: rgbToHex(orig), actual: rgbToHex(gen),
        score: itemScore,
        severity: itemScore < 50 ? 'critical' : 'major',
      });
    }
  }

  const unmatchedPenalty = Math.abs(origColors.length - genColors.length) * 5;
  const avgScore = matched > 0 ? totalScore / matched : 0;

  return Math.max(0, Math.round(avgScore - unmatchedPenalty));
}

// ===== 크기 점수 (15%) =====

function scoreDimension(original: FigmaRestNode, generated: FigmaRestNode, details: CloneScoreDetail[]): number {
  const origBoxes = collectBboxes(original);
  const genBoxes = collectBboxes(generated);

  if (origBoxes.length === 0) return 100;

  let totalScore = 0;
  const matched = Math.min(origBoxes.length, genBoxes.length);

  for (let i = 0; i < matched; i++) {
    const orig = origBoxes[i];
    const gen = genBoxes[i];
    const wScore = scoreTolerance(orig.width, gen.width, 5);
    const hScore = scoreTolerance(orig.height, gen.height, 10);
    const itemScore = wScore * 0.5 + hScore * 0.5;
    totalScore += itemScore;

    if (itemScore < 70) {
      details.push({
        category: 'dimension', field: `node[${i}]`,
        expected: `${orig.width}x${orig.height}`,
        actual: `${gen.width}x${gen.height}`,
        score: Math.round(itemScore),
        severity: itemScore < 50 ? 'major' : 'minor',
      });
    }
  }

  return matched > 0 ? Math.round(totalScore / matched) : 100;
}

// ===== 간격 점수 (15%) =====

function scoreSpacing(original: FigmaRestNode, generated: FigmaRestNode, details: CloneScoreDetail[]): number {
  const origSpacings = collectSpacings(original);
  const genSpacings = collectSpacings(generated);

  if (origSpacings.length === 0) return 100;

  let totalScore = 0;
  const matched = Math.min(origSpacings.length, genSpacings.length);

  for (let i = 0; i < matched; i++) {
    const orig = origSpacings[i];
    const gen = genSpacings[i];

    const padScore = (
      scoreTolerance(orig.paddingTop, gen.paddingTop, 3) +
      scoreTolerance(orig.paddingRight, gen.paddingRight, 3) +
      scoreTolerance(orig.paddingBottom, gen.paddingBottom, 3) +
      scoreTolerance(orig.paddingLeft, gen.paddingLeft, 3)
    ) / 4;

    const gapScore = scoreTolerance(orig.itemSpacing, gen.itemSpacing, 3);
    const itemScore = padScore * 0.6 + gapScore * 0.4;
    totalScore += itemScore;

    if (itemScore < 70) {
      details.push({
        category: 'spacing', field: `frame[${i}]`,
        expected: `pad=${orig.paddingTop}/${orig.paddingRight}/${orig.paddingBottom}/${orig.paddingLeft} gap=${orig.itemSpacing}`,
        actual: `pad=${gen.paddingTop}/${gen.paddingRight}/${gen.paddingBottom}/${gen.paddingLeft} gap=${gen.itemSpacing}`,
        score: Math.round(itemScore),
        severity: 'minor',
      });
    }
  }

  return matched > 0 ? Math.round(totalScore / matched) : 100;
}

// ===== 유틸리티 =====

function countNodes(node: FigmaRestNode): number {
  let count = 1;
  if (node.children) {
    for (const child of node.children) {
      count += countNodes(child);
    }
  }
  return count;
}

function maxDepth(node: FigmaRestNode, depth: number = 0): number {
  if (!node.children || node.children.length === 0) return depth;
  let max = depth;
  for (const child of node.children) {
    max = Math.max(max, maxDepth(child, depth + 1));
  }
  return max;
}

function countTypes(node: FigmaRestNode): Record<string, number> {
  const counts: Record<string, number> = {};
  function walk(n: FigmaRestNode): void {
    counts[n.type] = (counts[n.type] || 0) + 1;
    if (n.children) {
      for (const child of n.children) walk(child);
    }
  }
  walk(node);
  return counts;
}

function scoreTypeDist(orig: Record<string, number>, gen: Record<string, number>): number {
  const allTypes = new Set([...Object.keys(orig), ...Object.keys(gen)]);
  let totalScore = 0;
  let count = 0;

  for (const type of allTypes) {
    const o = orig[type] || 0;
    const g = gen[type] || 0;
    const ratio = o === 0 && g === 0 ? 1 : Math.min(o, g) / Math.max(o, g);
    totalScore += ratio * 100;
    count++;
  }

  return count > 0 ? Math.round(totalScore / count) : 100;
}

interface TextInfo {
  characters: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
}

function collectTexts(node: FigmaRestNode): TextInfo[] {
  const texts: TextInfo[] = [];
  function walk(n: FigmaRestNode): void {
    if (n.type === 'TEXT' && n.characters && n.style) {
      texts.push({
        characters: n.characters,
        fontFamily: n.style.fontFamily || 'unknown',
        fontSize: n.style.fontSize || 16,
        fontWeight: n.style.fontWeight || 400,
      });
    }
    if (n.children) {
      for (const child of n.children) walk(child);
    }
  }
  walk(node);
  return texts;
}

interface RGB { r: number; g: number; b: number }

function collectFillColors(node: FigmaRestNode): RGB[] {
  const colors: RGB[] = [];
  function walk(n: FigmaRestNode): void {
    if (n.fills) {
      for (const fill of n.fills) {
        if (fill.type === 'SOLID' && fill.color && fill.visible !== false) {
          colors.push({ r: fill.color.r, g: fill.color.g, b: fill.color.b });
        }
      }
    }
    if (n.children) {
      for (const child of n.children) walk(child);
    }
  }
  walk(node);
  return colors;
}

/** 간이 Delta-E (CIE76) — 정밀도보다 속도 우선 */
function colorDeltaE(a: RGB, b: RGB): number {
  const dr = (a.r - b.r) * 255;
  const dg = (a.g - b.g) * 255;
  const db = (a.b - b.b) * 255;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function rgbToHex(c: RGB): string {
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(c.r)}${toHex(c.g)}${toHex(c.b)}`;
}

interface BboxInfo { width: number; height: number }

function collectBboxes(node: FigmaRestNode): BboxInfo[] {
  const boxes: BboxInfo[] = [];
  function walk(n: FigmaRestNode, depth: number): void {
    if (depth <= 3 && n.absoluteBoundingBox) {
      boxes.push({
        width: n.absoluteBoundingBox.width,
        height: n.absoluteBoundingBox.height,
      });
    }
    if (n.children && depth < 3) {
      for (const child of n.children) walk(child, depth + 1);
    }
  }
  walk(node, 0);
  return boxes;
}

interface SpacingInfo {
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  itemSpacing: number;
}

function collectSpacings(node: FigmaRestNode): SpacingInfo[] {
  const spacings: SpacingInfo[] = [];
  function walk(n: FigmaRestNode): void {
    if (n.layoutMode && n.layoutMode !== 'NONE') {
      spacings.push({
        paddingTop: n.paddingTop || 0,
        paddingRight: n.paddingRight || 0,
        paddingBottom: n.paddingBottom || 0,
        paddingLeft: n.paddingLeft || 0,
        itemSpacing: n.itemSpacing || 0,
      });
    }
    if (n.children) {
      for (const child of n.children) walk(child);
    }
  }
  walk(node);
  return spacings;
}

/** 허용 오차 내 점수 계산 */
function scoreTolerance(expected: number, actual: number, tolerance: number): number {
  const diff = Math.abs(expected - actual);
  if (diff <= tolerance) return 100;
  if (diff <= tolerance * 3) return 80;
  if (diff <= tolerance * 6) return 50;
  return 20;
}
