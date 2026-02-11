import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient, ensureStorageBucket } from '@/lib/supabase/admin';
import {
  unauthorizedError,
  validationError,
  internalError,
  externalApiError,
} from '@/lib/errors';

const IMAGE_BUCKET = 'generated-images';

const TEXT_MODEL = 'gemini-2.0-flash-exp';
const IMAGE_MODEL = 'gemini-2.0-flash-exp';

const PIXEL_PRESETS: Record<string, { sections: number; label: string }> = {
  '4000': { sections: 4, label: '4,000px (compact)' },
  '8000': { sections: 6, label: '8,000px (standard)' },
  '12000': { sections: 8, label: '12,000px (detailed)' },
  '20000': { sections: 12, label: '20,000px (premium)' },
  '40000': { sections: 20, label: '40,000px (enterprise)' },
};

const CATEGORY_PROMPTS: Record<string, string> = {
  ecommerce:
    '이 상품의 구매 전환율을 극대화하는 이커머스 상세페이지를 만들어주세요. 핵심 USP를 강조하고, 구매 결정을 돕는 설득력 있는 카피를 작성하세요.',
  realestate:
    '이 매물의 가치와 장점을 부각시키는 고급스러운 부동산 소개 페이지를 만들어주세요. 투자 가치와 생활 편의성을 강조하세요.',
  medical:
    '환자에게 신뢰감과 전문성을 전달하는 병원 홍보 페이지를 만들어주세요. 의료진의 전문성과 첨단 장비를 강조하세요.',
  education:
    '수강생이 등록하고 싶어지는 교육 랜딩페이지를 만들어주세요. 성공 스토리와 차별화된 교육 방법을 강조하세요.',
  restaurant:
    '방문하고 싶어지는 음식점 소개 페이지를 만들어주세요. 음식의 매력과 분위기를 생동감 있게 표현하세요.',
  travel:
    '떠나고 싶게 만드는 여행 상품 소개 페이지를 만들어주세요. 감성적인 이미지와 합리적인 가격을 강조하세요.',
  wedding:
    '특별한 순간을 위한 우아하고 감동적인 이벤트 소개 페이지를 만들어주세요.',
  legal:
    '전문가의 권위와 신뢰성을 느낄 수 있는 법무/세무 사무소 소개 페이지를 만들어주세요.',
  fitness:
    '에너지 넘치고 동기부여가 되는 피트니스 프로그램 소개 페이지를 만들어주세요.',
  saas: '제품의 핵심 가치와 기능을 명쾌하게 전달하는 SaaS 소개 페이지를 만들어주세요. 문제 해결 중심으로 작성하세요.',
  personal:
    '전문성과 개성이 돋보이는 퍼스널 브랜딩 포트폴리오 페이지를 만들어주세요.',
};

const SECTION_TYPES = [
  'Hero',
  'Features',
  'Benefits',
  'Gallery',
  'Testimonials',
  'Process',
  'Pricing',
  'FAQ',
  'Stats',
  'Team',
  'About',
  'Contact',
  'CTA',
  'Comparison',
  'Timeline',
  'Portfolio',
  'Newsletter',
  'Partners',
  'VideoShowcase',
  'DetailedProduct',
];

function buildTextPrompt(
  category: string,
  inputData: Record<string, unknown>,
  sectionCount: number
): string {
  const categoryPrompt = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS.saas;
  const inputSummary = Object.entries(inputData)
    .map(([key, value]) => {
      if (Array.isArray(value)) return `${key}: ${value.join(', ')}`;
      return `${key}: ${value}`;
    })
    .join('\n');

  const availableTypes = SECTION_TYPES.slice(0, Math.min(sectionCount + 3, SECTION_TYPES.length));

  return `당신은 전문 웹 디자이너이자 카피라이터입니다.

[요청]
${categoryPrompt}

[입력 정보]
${inputSummary}

[섹션 수]
총 ${sectionCount}개의 섹션을 생성하세요.

[출력 형식]
아래 JSON 형식으로 정확하게 출력하세요. 다른 텍스트 없이 JSON만 출력하세요.

{
  "content": [
    {
      "type": "섹션타입",
      "props": {
        "id": "고유ID",
        "title": "섹션 제목",
        "subtitle": "부제목",
        "description": "상세 설명",
        "ctaText": "CTA 버튼 텍스트 (있는 경우)",
        "items": [
          { "title": "항목 제목", "description": "항목 설명", "icon": "아이콘명" }
        ],
        "backgroundColor": "#hex색상코드",
        "textColor": "#hex색상코드",
        "imagePrompt": "이 섹션에 들어갈 이미지를 설명하는 영어 프롬프트 (구체적이고 상세하게)",
        "layout": "left-image | right-image | center | full-width | grid | split"
      }
    }
  ],
  "root": {
    "props": {
      "title": "페이지 제목"
    }
  },
  "theme": {
    "primaryColor": "#hex",
    "secondaryColor": "#hex",
    "accentColor": "#hex",
    "fontFamily": "Pretendard"
  }
}

[사용 가능한 섹션 타입]
${availableTypes.join(', ')}

[중요 규칙]
1. 반드시 첫 섹션은 Hero 타입이어야 합니다.
2. 반드시 마지막 섹션은 CTA 타입이어야 합니다.
3. 각 섹션의 카피는 입력 정보를 기반으로 구체적이고 설득력 있게 작성하세요.
4. imagePrompt는 반드시 영어로 작성하고, 상세하게 묘사하세요 (색상, 구도, 분위기, 스타일 포함).
5. backgroundColor는 각 섹션마다 다르게 설정하여 시각적 다양성을 주세요.
6. layout은 섹션별로 적절하게 다양하게 배치하세요.
7. 한국어로 카피를 작성하세요.
8. items 배열은 3~6개의 항목을 포함하세요.`;
}

function buildImagePrompt(
  sectionType: string,
  sectionTitle: string,
  imagePrompt: string,
  category: string
): string {
  return `Create a high-quality, professional ${category} detail page section image.
Section type: ${sectionType}
Section title: ${sectionTitle}
Image description: ${imagePrompt}

Style requirements:
- Clean, modern, professional design
- Suitable for a Korean commercial detail page
- High contrast, vibrant colors
- No text overlays (text will be added separately)
- Photorealistic quality
- 16:9 aspect ratio`;
}

function parsePuckData(text: string) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('JSON not found');

  const parsed = JSON.parse(jsonMatch[0]);

  if (!parsed.content || !Array.isArray(parsed.content)) {
    throw new Error('content array missing');
  }

  parsed.content = parsed.content.map(
    (item: Record<string, unknown>, index: number) => {
      const props = (item.props || {}) as Record<string, unknown>;
      if (!props.id) {
        props.id = `${String(item.type).toLowerCase()}-${index}`;
      }
      return { ...item, props };
    }
  );

  if (!parsed.root) {
    parsed.root = { props: { title: 'Generated Page' } };
  }

  return parsed;
}

async function generateSectionImage(
  apiKey: string,
  sectionType: string,
  sectionTitle: string,
  imagePrompt: string,
  category: string
): Promise<string | null> {
  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const prompt = buildImagePrompt(
      sectionType,
      sectionTitle,
      imagePrompt,
      category
    );

    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: '16:9',
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) return null;

    for (const part of parts) {
      if (part.inlineData) {
        return part.inlineData.data as string;
      }
    }

    return null;
  } catch (err) {
    console.error(`Image generation failed for ${sectionType}:`, err);
    return null;
  }
}

async function uploadImageToSupabase(
  projectId: string,
  sectionId: string,
  imageBase64: string
): Promise<string | null> {
  const admin = createAdminClient();
  if (!admin) return null;

  try {
    const buffer = Buffer.from(imageBase64, 'base64');
    const filePath = `${projectId}/${sectionId}.png`;

    const { error } = await admin.storage
      .from(IMAGE_BUCKET)
      .upload(filePath, buffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return null;
    }

    const {
      data: { publicUrl },
    } = admin.storage.from(IMAGE_BUCKET).getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.error('Upload failed:', err);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    await ensureStorageBucket(IMAGE_BUCKET);

    const supabase = createClient();
    if (!supabase) return unauthorizedError();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return unauthorizedError();

    const body = await request.json();
    const { category, inputData, pixelHeight = '8000' } = body;

    if (!category || !inputData) {
      return validationError('카테고리와 입력 데이터는 필수입니다');
    }

    const { data: settings } = await supabase
      .from('user_settings')
      .select('gemini_api_key')
      .eq('user_id', user.id)
      .single();

    const apiKey = settings?.gemini_api_key;
    if (!apiKey) {
      return validationError(
        '마이페이지에서 Gemini API 키를 먼저 등록해주세요'
      );
    }

    const preset = PIXEL_PRESETS[String(pixelHeight)] || PIXEL_PRESETS['8000'];
    const sectionCount = preset.sections;

    // Step 1: Generate text/structure with text model
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const textPrompt = buildTextPrompt(category, inputData, sectionCount);
    const textResult = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: textPrompt,
    });

    const textResponse =
      textResult.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      return externalApiError('텍스트 생성 결과가 비어 있습니다');
    }

    let puckData;
    try {
      puckData = parsePuckData(textResponse);
    } catch {
      return externalApiError('AI 응답 파싱에 실패했습니다');
    }

    // Create project first to get ID for image storage
    const firstInputValue = Object.values(inputData)[0];
    const title =
      typeof firstInputValue === 'string'
        ? firstInputValue
        : `${category} project`;

    const { data: project, error: dbError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        title,
        category,
        status: 'generating',
        puck_data: puckData,
        input_data: inputData,
      })
      .select()
      .single();

    if (dbError) return internalError(dbError.message);

    // Step 2: Generate images for each section (parallel, max 4 concurrent)
    const sections = puckData.content as Array<{
      type: string;
      props: Record<string, unknown>;
    }>;

    const imagePromises = sections.map(async (section) => {
      const props = section.props;
      const imagePrompt = (props.imagePrompt as string) || '';
      if (!imagePrompt) return null;

      const base64 = await generateSectionImage(
        apiKey,
        section.type,
        String(props.title || ''),
        imagePrompt,
        category
      );

      if (!base64) return null;

      const publicUrl = await uploadImageToSupabase(
        project.id,
        String(props.id),
        base64
      );

      return { sectionId: props.id, imageUrl: publicUrl };
    });

    const imageResults = await Promise.allSettled(imagePromises);

    // Attach image URLs to puck data
    const imageMap = new Map<string, string>();
    for (const result of imageResults) {
      if (result.status === 'fulfilled' && result.value) {
        imageMap.set(
          String(result.value.sectionId),
          String(result.value.imageUrl)
        );
      }
    }

    puckData.content = sections.map((section) => {
      const imageUrl = imageMap.get(String(section.props.id));
      if (imageUrl) {
        section.props.imageUrl = imageUrl;
      }
      return section;
    });

    // Update project with final data
    await supabase
      .from('projects')
      .update({
        puck_data: puckData,
        status: 'draft',
      })
      .eq('id', project.id);

    await supabase.from('generation_logs').insert({
      project_id: project.id,
      user_id: user.id,
      prompt: textPrompt,
      category,
      input_data: inputData,
      output_data: puckData,
      model_version: `${TEXT_MODEL} + ${IMAGE_MODEL}`,
      tokens_used: 0,
    });

    return NextResponse.json({
      ok: true,
      data: {
        projectId: project.id,
        puckData,
        imagesGenerated: imageMap.size,
        totalSections: sections.length,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return internalError(message);
  }
}
