import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient, ensureStorageBucket } from '@/lib/supabase/admin';
import {
  unauthorizedError,
  validationError,
  internalError,
} from '@/lib/errors';

const IMAGE_MODELS = ['gemini-3-pro-image-preview', 'gemini-2.5-flash-image'] as const;

function isServerOverloadError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /503|429|500|502|504|UNAVAILABLE|overloaded|quota|rate.?limit|resource.?exhausted/i.test(msg);
}
const IMAGE_BUCKET = 'generated-images';

/**
 * POST /api/figma/clone/image
 * 노드 이름과 컨텍스트를 받아 AI 이미지를 생성하고 URL을 반환한다.
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
    const { nodeName, category, inputData, width, height } = body as {
      nodeName: string;
      category?: string;
      inputData?: Record<string, unknown>;
      width?: number;
      height?: number;
    };

    if (!nodeName) {
      return validationError('노드 이름이 필요합니다');
    }

    const { data: settings } = await supabase
      .from('user_settings')
      .select('gemini_api_key')
      .eq('user_id', user.id)
      .single();

    const apiKey = settings?.gemini_api_key;
    if (!apiKey) {
      return validationError('Gemini API 키가 필요합니다');
    }

    const prompt = buildImagePrompt(nodeName, category, inputData, width, height);
    const imageBase64 = await generateImage(apiKey, prompt);

    if (!imageBase64) {
      return NextResponse.json({ ok: true, data: { imageUrl: null } });
    }

    // Supabase Storage에 업로드
    const imageUrl = await uploadToStorage(user.id, nodeName, imageBase64);

    return NextResponse.json({
      ok: true,
      data: { imageUrl },
    });
  } catch {
    return internalError();
  }
}

function buildImagePrompt(
  nodeName: string,
  category?: string,
  inputData?: Record<string, unknown>,
  width?: number,
  height?: number,
): string {
  const aspectRatio = width && height ? `${width}x${height}` : '1200x800';
  const productName = String(inputData?.productName || inputData?.storeName || inputData?.brandName || '').trim();
  const categoryHint = category || 'general';

  // inputData에서 상품 관련 키워드 추출 (이미지 주제 일관성 강화)
  const productKeywords: string[] = [];
  if (productName) productKeywords.push(productName);
  if (inputData?.description) productKeywords.push(String(inputData.description).slice(0, 80));
  if (inputData?.mainFeature) productKeywords.push(String(inputData.mainFeature));

  // 노드 이름에서 상품 키워드 추출 (tag에 포함된 상품명)
  const tagKeywords = nodeName
    .replace(/img_|image_|Image|_/g, ' ')
    .replace(/hero|main|feature|gallery|closeup|plating|section|banner/gi, '')
    .trim();

  // 노드 이름에서 촬영 스타일 힌트 추출
  const nameHints = nodeName.toLowerCase();
  let styleHint = 'detailed product photography';

  if (nameHints.includes('hero') || nameHints.includes('main')) {
    styleHint = 'hero banner, eye-catching main visual, centered composition';
  } else if (nameHints.includes('closeup') || nameHints.includes('detail')) {
    styleHint = 'extreme close-up detail shot, macro photography';
  } else if (nameHints.includes('gallery') || nameHints.includes('photo')) {
    styleHint = 'lifestyle product photography, natural setting';
  } else if (nameHints.includes('plating') || nameHints.includes('arrange')) {
    styleHint = 'beautiful food plating, overhead shot, artistic arrangement';
  } else if (nameHints.includes('ingredient') || nameHints.includes('material') || nameHints.includes('재료')) {
    styleHint = 'fresh ingredients spread out, ingredient showcase';
  } else if (nameHints.includes('team') || nameHints.includes('person') || nameHints.includes('avatar')) {
    styleHint = 'professional headshot portrait';
  } else if (nameHints.includes('icon') || nameHints.includes('logo')) {
    styleHint = 'minimalist icon or logo';
  } else if (nameHints.includes('bg') || nameHints.includes('background')) {
    styleHint = 'abstract gradient background';
  }

  // 상품 주제를 프롬프트 최상단에 배치 → 주제 일관성 보장
  const subjectContext = productName
    ? `Subject: ${productName}${tagKeywords ? ` - ${tagKeywords}` : ''}. `
    : (tagKeywords ? `Subject: ${tagKeywords}. ` : '');
  const extraContext = productKeywords.length > 1
    ? `Context: ${productKeywords.slice(1).join(', ')}. `
    : '';

  return `${subjectContext}${extraContext}${styleHint}. ${categoryHint} commercial photography. High quality, 8K resolution, magazine-worthy. Clean composition, professional lighting, vibrant colors. Aspect ratio: ${aspectRatio}. No text overlays, no watermarks, no logos.`;
}

async function generateImage(apiKey: string, prompt: string): Promise<string | null> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  for (const model of IMAGE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseModalities: ['image', 'text'],
        },
      });

      const parts = response.candidates?.[0]?.content?.parts;
      if (!parts) return null;

      const imagePart = parts.find(
        (p) => 'inlineData' in p && p.inlineData
      );

      if (!imagePart || !('inlineData' in imagePart) || !imagePart.inlineData?.data) {
        return null;
      }

      return imagePart.inlineData.data as string;
    } catch (err) {
      if (isServerOverloadError(err)) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      return null;
    }
  }

  return null;
}

async function uploadToStorage(
  userId: string,
  nodeName: string,
  imageBase64: string,
): Promise<string | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  await ensureStorageBucket(IMAGE_BUCKET);

  const buffer = Buffer.from(imageBase64, 'base64');
  const safeName = nodeName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
  const filePath = `figma/clone/${userId}/${safeName}_${Date.now()}.png`;

  const { error } = await admin.storage
    .from(IMAGE_BUCKET)
    .upload(filePath, buffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (error) return null;

  const { data: urlData } = admin.storage
    .from(IMAGE_BUCKET)
    .getPublicUrl(filePath);

  return urlData?.publicUrl || null;
}
