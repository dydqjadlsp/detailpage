/**
 * 클론 보정기
 * 점수가 미달이지만 가까울 때(예: 75~90점) 전체 재생성 대신 타겟 수정 커맨드를 생성한다.
 * 보정 가능: 색상, 폰트 크기, 크기, 패딩, 간격
 * 보정 불가: 구조(트리 깊이/노드 수), 레이아웃 모드, 노드 타입
 */

import 'server-only';

import type { CloneScore, CloneScoreDetail, FigmaCommand } from '../types';

/** 보정 가능 여부 판별 */
export function isPatchable(score: CloneScore): boolean {
  if (score.structure < 60) return false;

  const patchableIssues = score.details.filter(d =>
    d.severity !== 'critical' || d.category !== 'structure',
  );
  const criticalStructure = score.details.filter(d =>
    d.category === 'structure' && d.severity === 'critical',
  );

  return criticalStructure.length === 0 && patchableIssues.length > 0;
}

/** 불일치 항목에서 보정 커맨드 생성 */
export function generatePatchCommands(
  scoreResult: CloneScore,
  generatedNodeMap: Record<string, string>,
): FigmaCommand[] {
  const commands: FigmaCommand[] = [];
  let cmdIndex = 0;

  for (const detail of scoreResult.details) {
    if (detail.score >= 80) continue;

    const nodeId = findNodeIdForDetail(detail, generatedNodeMap);
    if (!nodeId) continue;

    const cmd = createPatchCommand(detail, nodeId, cmdIndex);
    if (cmd) {
      commands.push(cmd);
      cmdIndex++;
    }
  }

  return commands;
}

function findNodeIdForDetail(
  detail: CloneScoreDetail,
  nodeMap: Record<string, string>,
): string | null {
  const fieldMatch = detail.field.match(/\[(\d+)\]/);
  if (!fieldMatch) return null;

  const index = parseInt(fieldMatch[1], 10);
  const keys = Object.keys(nodeMap);
  if (index < keys.length) {
    return nodeMap[keys[index]];
  }
  return null;
}

function createPatchCommand(
  detail: CloneScoreDetail,
  nodeId: string,
  index: number,
): FigmaCommand | null {
  const id = `patch_${index}_${Date.now()}`;

  switch (detail.category) {
    case 'color': {
      const expectedHex = detail.expected;
      const rgb = hexToRgba(expectedHex);
      if (!rgb) return null;
      return {
        id,
        command: 'set_fill_color',
        params: { nodeId, color: rgb },
        description: `색상 보정: ${detail.expected}`,
      };
    }

    case 'typography': {
      const match = detail.expected.match(/(.+?)\s+(\d+)\/([\d.]+)/);
      if (!match) return null;
      return {
        id,
        command: 'set_text_style',
        params: {
          nodeId,
          fontFamily: match[1],
          fontSize: parseFloat(match[2]),
          fontWeight: parseFloat(match[3]),
        },
        description: `폰트 보정: ${detail.expected}`,
      };
    }

    case 'dimension': {
      const match = detail.expected.match(/(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)/);
      if (!match) return null;
      return {
        id,
        command: 'resize_node',
        params: {
          nodeId,
          width: parseFloat(match[1]),
          height: parseFloat(match[2]),
        },
        description: `크기 보정: ${detail.expected}`,
      };
    }

    case 'spacing': {
      const padMatch = detail.expected.match(/pad=(\d+)\/(\d+)\/(\d+)\/(\d+)/);
      const gapMatch = detail.expected.match(/gap=(\d+)/);
      if (!padMatch) return null;

      const cmds: FigmaCommand[] = [];
      cmds.push({
        id: `${id}_pad`,
        command: 'set_padding',
        params: {
          nodeId,
          paddingTop: parseInt(padMatch[1], 10),
          paddingRight: parseInt(padMatch[2], 10),
          paddingBottom: parseInt(padMatch[3], 10),
          paddingLeft: parseInt(padMatch[4], 10),
        },
        description: `패딩 보정`,
      });

      if (gapMatch) {
        cmds.push({
          id: `${id}_gap`,
          command: 'set_item_spacing',
          params: {
            nodeId,
            itemSpacing: parseInt(gapMatch[1], 10),
          },
          description: `간격 보정`,
        });
      }

      return cmds[0];
    }

    default:
      return null;
  }
}

function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } | null {
  const match = hex.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!match) return null;
  return {
    r: parseInt(match[1], 16) / 255,
    g: parseInt(match[2], 16) / 255,
    b: parseInt(match[3], 16) / 255,
    a: 1,
  };
}
