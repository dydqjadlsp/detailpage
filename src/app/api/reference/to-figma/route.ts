import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  unauthorizedError,
  validationError,
  internalError,
  externalApiError,
} from '@/lib/errors';
import { generateFigmaCommands } from '@/lib/figma/command-generator';
import type { FigmaGenerateRequest, ReferenceAnalysis } from '@/lib/figma/types';

/**
 * POST /api/reference/to-figma
 * @description 레퍼런스 분석 결과를 피그마 커맨드 시퀀스로 변환한다.
 */
export async function POST(request: Request) {
  try {
    // SECURITY-CRITICAL
    const supabase = await createClient();
    if (!supabase) return unauthorizedError();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedError();

    const body = await request.json();
    const { analysis, customizations, canvasWidth = 1440 } = body;

    if (!analysis || !analysis.colorPalette || !analysis.sections) {
      return validationError('분석 결과가 필요합니다');
    }

    // 사용자 API 키 조회
    const { data: settings } = await supabase
      .from('user_settings')
      .select('gemini_api_key')
      .eq('user_id', user.id)
      .single();

    const apiKey = settings?.gemini_api_key;
    if (!apiKey) {
      return validationError('마이페이지에서 Gemini API 키를 먼저 등록해주세요');
    }

    const generateRequest: FigmaGenerateRequest = {
      mode: 'reference-clone',
      inputData: customizations || {},
      canvasWidth: Number(canvasWidth),
    };

    const referenceAnalysis: ReferenceAnalysis = {
      analysisId: analysis.analysisId || `ref_${Date.now()}`,
      colorPalette: analysis.colorPalette,
      sections: analysis.sections,
      typography: analysis.typography,
      overallStyle: analysis.overallStyle,
      totalHeight: analysis.totalHeight,
      spacing: analysis.spacing,
      effects: analysis.effects,
    };

    const result = await generateFigmaCommands(apiKey, generateRequest, referenceAnalysis);

    return NextResponse.json({
      ok: true,
      data: result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    if (message.includes('API key') || message.includes('apiKey')) {
      return externalApiError('Gemini API 키가 유효하지 않습니다');
    }

    return internalError(message);
  }
}
