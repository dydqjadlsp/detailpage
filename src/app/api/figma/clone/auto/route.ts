/**
 * POST /api/figma/clone/auto
 * 레퍼런스 템플릿 자동 클론 루프
 * SSE(Server-Sent Events) 스트리밍으로 실시간 진행 상태 전달.
 *
 * 흐름: REST API 원본 추출 → TreeNode 변환 → create_tree 생성
 * → get_node_info 스캔 → 채점 → 미달 시 이동+재생성 반복
 * → 통과 시 maindocs/에 템플릿 저장
 */

// SECURITY-CRITICAL
import { createClient } from '@/lib/supabase/server';
import {
  unauthorizedError,
  validationError,
  internalError,
} from '@/lib/errors';
import { fetchNodeDeep, listSections, collectImageNodes, countNodes } from '@/lib/figma/clone/deep-extractor';
import { restNodeToTree, DEFAULT_FONT_FALLBACK } from '@/lib/figma/clone/node-to-tree';
import { resolveImages } from '@/lib/figma/clone/image-resolver';
import { scoreClone } from '@/lib/figma/clone/clone-scorer';
import { isPatchable, generatePatchCommands } from '@/lib/figma/clone/clone-patcher';
import { ServerFigmaTransport } from '@/lib/figma/clone/server-transport';
import type { CloneProgress, FigmaRestNode, TreeNode } from '@/lib/figma/types';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const DEFAULT_TARGET_SCORE = 90;
const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_OFFSET_X_STEP = 1000;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) return internalError('Supabase 연결 실패');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedError();

    const body = await request.json();
    const {
      fileKey,
      token,
      pageId,
      sectionIds,
      targetScore = DEFAULT_TARGET_SCORE,
      maxAttempts = DEFAULT_MAX_ATTEMPTS,
      channelName,
      category = 'ecommerce',
    } = body as {
      fileKey: string;
      token: string;
      pageId?: string;
      sectionIds?: string[];
      targetScore?: number;
      maxAttempts?: number;
      channelName: string;
      category?: string;
    };

    if (!fileKey || !token) {
      return validationError('fileKey와 token은 필수입니다');
    }
    if (!channelName) {
      return validationError('channelName은 필수입니다');
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return internalError('Supabase 환경변수 누락');
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        function sendProgress(progress: CloneProgress): void {
          const data = `data: ${JSON.stringify(progress)}\n\n`;
          controller.enqueue(encoder.encode(data));
        }

        const transport = new ServerFigmaTransport({ supabaseUrl, supabaseKey });

        try {
          sendProgress({
            phase: 'extracting', attempt: 0, maxAttempts,
            sectionIndex: 0, sectionName: '초기화',
            message: '플러그인 연결 중...',
          });

          await transport.connect(channelName);

          let targetSectionIds = sectionIds;
          if (!targetSectionIds || targetSectionIds.length === 0) {
            const pages = await listSections(fileKey, token);
            const targetPage = pageId
              ? pages.find(p => p.pageId === pageId)
              : pages[0];

            if (!targetPage || targetPage.sections.length === 0) {
              sendProgress({
                phase: 'failed', attempt: 0, maxAttempts,
                sectionIndex: 0, sectionName: '',
                message: '섹션을 찾을 수 없습니다',
              });
              controller.close();
              return;
            }

            targetSectionIds = targetPage.sections
              .filter(s => s.width >= 800 && s.height >= 100)
              .map(s => s.id);
          }

          const templateSections: Array<{
            name: string; originalNodeId: string;
            tree: TreeNode; width: number; height: number;
            fonts: string[]; colors: string[];
          }> = [];

          let bestOverallScore = 0;
          let cumulativeY = 0;

          for (let sIdx = 0; sIdx < targetSectionIds.length; sIdx++) {
            const sectionId = targetSectionIds[sIdx];
            let bestScore = 0;

            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
              sendProgress({
                phase: 'extracting', attempt, maxAttempts,
                sectionIndex: sIdx, sectionName: sectionId,
                message: `섹션 ${sIdx + 1}/${targetSectionIds.length} 원본 추출 중...`,
              });

              const originalNode = await fetchNodeDeep(fileKey, token, sectionId);
              const nodeCount = countNodes(originalNode);
              const sectionName = originalNode.name;

              sendProgress({
                phase: 'converting', attempt, maxAttempts,
                sectionIndex: sIdx, sectionName,
                message: `${sectionName} 변환 중 (${nodeCount}노드)...`,
              });

              const imageNodes = collectImageNodes(originalNode);
              const imageUrls = resolveImages(imageNodes, category);

              const tree = restNodeToTree(originalNode, {
                canvasWidth: 860,
                fontFallback: DEFAULT_FONT_FALLBACK,
                imageUrls,
              });

              sendProgress({
                phase: 'creating', attempt, maxAttempts,
                sectionIndex: sIdx, sectionName,
                message: `${sectionName} Figma 생성 중 (시도 ${attempt}/${maxAttempts})...`,
              });

              const treeResult = await transport.sendTree(tree, undefined, 0, cumulativeY);

              sendProgress({
                phase: 'scanning', attempt, maxAttempts,
                sectionIndex: sIdx, sectionName,
                message: `${sectionName} 생성물 스캔 중...`,
              });

              const generatedNode = await transport.getNodeInfo(treeResult.rootId);

              sendProgress({
                phase: 'scoring', attempt, maxAttempts,
                sectionIndex: sIdx, sectionName,
                message: `${sectionName} 채점 중...`,
              });

              const score = scoreClone(originalNode, generatedNode);

              sendProgress({
                phase: 'scoring', attempt, maxAttempts,
                sectionIndex: sIdx, sectionName,
                score,
                message: `${sectionName} 점수: ${score.total}점 (목표: ${targetScore}점)`,
              });

              if (score.total >= targetScore) {
                bestScore = score.total;


                const fonts = collectFonts(originalNode);
                const colors = collectColors(originalNode);
                const bbox = originalNode.absoluteBoundingBox;
                templateSections.push({
                  name: sectionName,
                  originalNodeId: sectionId,
                  tree,
                  width: bbox?.width || 860,
                  height: bbox?.height || 0,
                  fonts,
                  colors,
                });

                cumulativeY += (bbox?.height || 0) + 20;

                sendProgress({
                  phase: 'complete', attempt, maxAttempts,
                  sectionIndex: sIdx, sectionName,
                  score,
                  message: `${sectionName} 성공! (${score.total}점)`,
                });
                break;
              }

              if (score.total >= targetScore - 15 && isPatchable(score)) {
                sendProgress({
                  phase: 'patching', attempt, maxAttempts,
                  sectionIndex: sIdx, sectionName,
                  score,
                  message: `${sectionName} 보정 시도 중 (${score.total}점)...`,
                });

                const nodeMap = buildNodeMap(generatedNode);
                const patches = generatePatchCommands(score, nodeMap);
                if (patches.length > 0) {
                  await transport.sendCommands(patches);

                  const rescanned = await transport.getNodeInfo(treeResult.rootId);
                  const rescore = scoreClone(originalNode, rescanned);

                  if (rescore.total >= targetScore) {
                    bestScore = rescore.total;
    

                    const fonts = collectFonts(originalNode);
                    const colors = collectColors(originalNode);
                    const bbox = originalNode.absoluteBoundingBox;
                    templateSections.push({
                      name: sectionName,
                      originalNodeId: sectionId,
                      tree,
                      width: bbox?.width || 860,
                      height: bbox?.height || 0,
                      fonts,
                      colors,
                    });

                    cumulativeY += (bbox?.height || 0) + 20;

                    sendProgress({
                      phase: 'complete', attempt, maxAttempts,
                      sectionIndex: sIdx, sectionName,
                      score: rescore,
                      message: `${sectionName} 보정 성공! (${rescore.total}점)`,
                    });
                    break;
                  }
                }
              }

              if (score.total > bestScore) {
                bestScore = score.total;

              }

              if (attempt < maxAttempts) {
                sendProgress({
                  phase: 'moving', attempt, maxAttempts,
                  sectionIndex: sIdx, sectionName,
                  score,
                  message: `${sectionName} 미달 (${score.total}점) → 이동 후 재생성...`,
                });

                await transport.moveNode(
                  treeResult.rootId,
                  DEFAULT_OFFSET_X_STEP * attempt,
                  cumulativeY,
                );
              } else {
                const fonts = collectFonts(originalNode);
                const colors = collectColors(originalNode);
                const bbox = originalNode.absoluteBoundingBox;
                templateSections.push({
                  name: sectionName,
                  originalNodeId: sectionId,
                  tree,
                  width: bbox?.width || 860,
                  height: bbox?.height || 0,
                  fonts,
                  colors,
                });

                cumulativeY += (bbox?.height || 0) + 20;

                sendProgress({
                  phase: 'complete', attempt, maxAttempts,
                  sectionIndex: sIdx, sectionName,
                  score,
                  message: `${sectionName} 최대 시도 도달 (최고 ${bestScore}점)`,
                });
              }
            }

            bestOverallScore = Math.max(bestOverallScore, bestScore);
          }

          if (templateSections.length > 0) {
            const templateData = {
              name: `클론 템플릿`,
              fileKey,
              canvasWidth: 860,
              score: { total: bestOverallScore },
              sections: templateSections,
              fontMapping: DEFAULT_FONT_FALLBACK,
              createdAt: new Date().toISOString(),
            };

            try {
              const maindocsDir = join(process.cwd(), 'maindocs');
              await mkdir(maindocsDir, { recursive: true });
              const fileName = `template-clone-${Date.now()}.json`;
              await writeFile(
                join(maindocsDir, fileName),
                JSON.stringify(templateData, null, 2),
                'utf-8',
              );

              sendProgress({
                phase: 'complete', attempt: 0, maxAttempts,
                sectionIndex: targetSectionIds.length, sectionName: 'all',
                message: `전체 완료! 평균 점수: ${bestOverallScore}점. 저장: maindocs/${fileName}`,
              });
            } catch {
              sendProgress({
                phase: 'complete', attempt: 0, maxAttempts,
                sectionIndex: targetSectionIds.length, sectionName: 'all',
                message: `전체 완료! 평균 점수: ${bestOverallScore}점. (파일 저장 실패)`,
              });
            }
          }

          transport.disconnect();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          sendProgress({
            phase: 'failed', attempt: 0, maxAttempts,
            sectionIndex: 0, sectionName: '',
            message: `오류: ${msg}`,
          });
          transport.disconnect();
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return internalError(message);
  }
}

/** 생성된 노드 트리에서 이름→ID 매핑 */
function buildNodeMap(node: FigmaRestNode): Record<string, string> {
  const map: Record<string, string> = {};
  function walk(n: FigmaRestNode): void {
    map[n.name] = n.id;
    if (n.children) {
      for (const child of n.children) walk(child);
    }
  }
  walk(node);
  return map;
}

/** 노드에서 사용된 폰트 목록 추출 */
function collectFonts(node: FigmaRestNode): string[] {
  const fonts = new Set<string>();
  function walk(n: FigmaRestNode): void {
    if (n.type === 'TEXT' && n.style?.fontFamily) {
      fonts.add(n.style.fontFamily);
    }
    if (n.children) {
      for (const child of n.children) walk(child);
    }
  }
  walk(node);
  return Array.from(fonts);
}

/** 노드에서 사용된 색상 목록 추출 */
function collectColors(node: FigmaRestNode): string[] {
  const colors = new Set<string>();
  function walk(n: FigmaRestNode): void {
    if (n.fills) {
      for (const fill of n.fills) {
        if (fill.type === 'SOLID' && fill.color && fill.visible !== false) {
          const hex = `#${Math.round(fill.color.r * 255).toString(16).padStart(2, '0')}${Math.round(fill.color.g * 255).toString(16).padStart(2, '0')}${Math.round(fill.color.b * 255).toString(16).padStart(2, '0')}`;
          colors.add(hex);
        }
      }
    }
    if (n.children) {
      for (const child of n.children) walk(child);
    }
  }
  walk(node);
  return Array.from(colors).slice(0, 20);
}
