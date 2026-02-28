/**
 * Figma REST API 전체 깊이 노드 추출
 * 클론 루프에서 원본 템플릿의 모든 노드 속성을 가져온다.
 * 기존 figma-file-parser.ts(depth=4 + 집계)와 다르게 전체 depth로 가져온다.
 */

import 'server-only';

import type { FigmaRestNode } from '../types';

const FIGMA_API = 'https://api.figma.com/v1';
const REQUEST_TIMEOUT = 60000;

async function figmaFetch<T>(url: string, token: string): Promise<T> {
  const response = await fetch(url, {
    headers: { 'X-Figma-Token': token },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Figma API ${response.status}: ${text.substring(0, 200)}`);
  }

  return response.json() as Promise<T>;
}

interface FigmaFileResponse {
  name: string;
  document: FigmaRestNode;
}

interface FigmaNodesResponse {
  nodes: Record<string, { document: FigmaRestNode }>;
}

/** 파일의 페이지/섹션 목록 조회 (depth=2로 가볍게) */
export async function listSections(
  fileKey: string,
  token: string,
): Promise<Array<{
  pageId: string;
  pageName: string;
  sections: Array<{ id: string; name: string; width: number; height: number }>;
}>> {
  const url = `${FIGMA_API}/files/${fileKey}?depth=2`;
  const data = await figmaFetch<FigmaFileResponse>(url, token);

  const pages = data.document.children || [];
  return pages.map(page => ({
    pageId: page.id,
    pageName: page.name,
    sections: (page.children || [])
      .filter(child => child.type === 'FRAME' || child.type === 'COMPONENT' || child.type === 'GROUP')
      .map(child => ({
        id: child.id,
        name: child.name,
        width: child.absoluteBoundingBox?.width || 0,
        height: child.absoluteBoundingBox?.height || 0,
      })),
  }));
}

/** 특정 노드를 전체 깊이로 가져오기 */
export async function fetchNodeDeep(
  fileKey: string,
  token: string,
  nodeId: string,
): Promise<FigmaRestNode> {
  const encodedId = encodeURIComponent(nodeId);
  const url = `${FIGMA_API}/files/${fileKey}/nodes?ids=${encodedId}`;
  const data = await figmaFetch<FigmaNodesResponse>(url, token);

  const nodeData = data.nodes[nodeId];
  if (!nodeData?.document) {
    throw new Error(`노드를 찾을 수 없습니다: ${nodeId}`);
  }

  return nodeData.document;
}

/** 여러 노드를 한 번에 가져오기 (배치) */
export async function fetchNodesDeep(
  fileKey: string,
  token: string,
  nodeIds: string[],
): Promise<Map<string, FigmaRestNode>> {
  const batchSize = 5;
  const result = new Map<string, FigmaRestNode>();

  for (let i = 0; i < nodeIds.length; i += batchSize) {
    const batch = nodeIds.slice(i, i + batchSize);
    const ids = batch.map(id => encodeURIComponent(id)).join(',');
    const url = `${FIGMA_API}/files/${fileKey}/nodes?ids=${ids}`;
    const data = await figmaFetch<FigmaNodesResponse>(url, token);

    for (const id of batch) {
      const nodeData = data.nodes[id];
      if (nodeData?.document) {
        result.set(id, nodeData.document);
      }
    }
  }

  return result;
}

/** 노드 트리의 총 노드 수 카운트 */
export function countNodes(node: FigmaRestNode): number {
  let count = 1;
  if (node.children) {
    for (const child of node.children) {
      count += countNodes(child);
    }
  }
  return count;
}

/** 노드에서 이미지 fill이 있는 노드 목록 추출 */
export function collectImageNodes(
  node: FigmaRestNode,
): Array<{ id: string; name: string; imageRef: string; width: number; height: number }> {
  const images: Array<{ id: string; name: string; imageRef: string; width: number; height: number }> = [];

  function walk(n: FigmaRestNode): void {
    if (n.fills) {
      for (const fill of n.fills) {
        if (fill.type === 'IMAGE' && fill.imageRef && n.absoluteBoundingBox) {
          images.push({
            id: n.id,
            name: n.name,
            imageRef: fill.imageRef,
            width: n.absoluteBoundingBox.width,
            height: n.absoluteBoundingBox.height,
          });
          break;
        }
      }
    }
    if (n.children) {
      for (const child of n.children) {
        walk(child);
      }
    }
  }

  walk(node);
  return images;
}
