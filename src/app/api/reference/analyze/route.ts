import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  unauthorizedError,
  validationError,
  internalError,
  externalApiError,
} from '@/lib/errors';
import { analyzeImage, analyzeUrl, analyzeImageTwoStage } from '@/lib/reference/analyzer';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * POST /api/reference/analyze
 * @description 레퍼런스 URL 또는 이미지를 분석하여 디자인 구조를 추출한다.
 */
export async function POST(request: Request) {
  try {
    // SECURITY-CRITICAL
    const supabase = await createClient();
    if (!supabase) return unauthorizedError();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedError();

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

    const contentType = request.headers.get('content-type') || '';

    // JSON 요청 (URL 분석 또는 Base64 이미지 분석)
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { url, imageBase64, mimeType } = body;

      // Base64 이미지 직접 분석 (피그마 프레임 내보내기용)
      if (imageBase64 && typeof imageBase64 === 'string') {
        const useTwoStage = body.twoStage === true;
        const analysis = useTwoStage
          ? await analyzeImageTwoStage(apiKey, imageBase64, mimeType || 'image/png')
          : await analyzeImage(apiKey, imageBase64, mimeType || 'image/png');
        return NextResponse.json({
          ok: true,
          data: { analysis },
        });
      }

      // URL 분석
      if (!url || typeof url !== 'string') {
        return validationError('URL 또는 imageBase64가 필요합니다');
      }

      try {
        new URL(url);
      } catch {
        return validationError('올바른 URL 형식이 아닙니다');
      }

      const analysis = await analyzeUrl(apiKey, url);

      return NextResponse.json({
        ok: true,
        data: { analysis },
      });
    }

    // multipart 요청 (이미지 분석)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('image') as File | null;

      if (!file) {
        return validationError('이미지 파일이 필요합니다');
      }

      // SECURITY-CRITICAL: 파일 검증
      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return validationError('PNG, JPG, WebP 이미지만 지원합니다');
      }

      if (file.size > MAX_IMAGE_SIZE) {
        return validationError('이미지 크기는 10MB 이하만 지원합니다');
      }

      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');

      const analysis = await analyzeImage(apiKey, base64, file.type);

      return NextResponse.json({
        ok: true,
        data: { analysis },
      });
    }

    return validationError('JSON 또는 multipart/form-data 형식으로 요청해주세요');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    if (message.includes('API key') || message.includes('apiKey')) {
      return externalApiError('Gemini API 키가 유효하지 않습니다');
    }

    return internalError(message);
  }
}
