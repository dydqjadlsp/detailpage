import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  unauthorizedError,
  validationError,
  internalError,
} from '@/lib/errors';
import { extractFileKey, parseFigmaFile, fileAnalysisToReference } from '@/lib/figma/figma-file-parser';

/**
 * POST /api/figma/parse
 * 피그마 파일 URL을 받아 구조를 파싱하고, ReferenceAnalysis 호환 형식으로 반환한다.
 */
// SECURITY-CRITICAL
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return internalError('Supabase 연결에 실패했습니다');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return unauthorizedError();
    }

    const body = await request.json();
    const { figmaUrl, figmaToken } = body as {
      figmaUrl: string;
      figmaToken?: string;
    };

    if (!figmaUrl) {
      return validationError('피그마 파일 URL이 필요합니다');
    }

    // URL에서 파일 키 추출
    const fileKey = extractFileKey(figmaUrl);
    if (!fileKey) {
      return validationError('유효한 피그마 파일 URL이 아닙니다. (예: https://www.figma.com/design/FILE_KEY/...)');
    }

    // 토큰: 요청에서 직접 전달받거나, user_settings에서 가져오기
    let token = figmaToken;
    if (!token) {
      const { data: settings } = await supabase
        .from('user_settings')
        .select('figma_token')
        .eq('user_id', user.id)
        .single();

      token = settings?.figma_token;
    }

    if (!token) {
      return validationError('피그마 Personal Access Token이 필요합니다. 설정에서 입력하거나 요청에 포함해주세요.');
    }

    // 파일 파싱
    const fileAnalysis = await parseFigmaFile(fileKey, token);

    // ReferenceAnalysis 호환 형식으로 변환
    const referenceAnalysis = fileAnalysisToReference(fileAnalysis);

    return NextResponse.json({
      ok: true,
      data: {
        fileAnalysis,
        referenceAnalysis,
      },
    });
  } catch {
    return internalError();
  }
}
