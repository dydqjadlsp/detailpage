import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient, ensureStorageBucket } from '@/lib/supabase/admin';
import {
  unauthorizedError,
  validationError,
  internalError,
  externalApiError,
} from '@/lib/errors';
import { generateFigmaCommands, generateFigmaTree } from '@/lib/figma/command-generator';
import { treeToFlatCommands, type TreeToCommandsOptions } from '@/lib/figma/tree-to-commands';
import { assembleDetailPage } from '@/lib/figma/templates';
import {
  CATEGORY_TEMPLATES,
  IMAGE_PROMPT_QUALITY,
  COMPOSITION_RULES,
  LIGHTING_STYLES,
} from '@/config';
import type { CategoryKey } from '@/config';
import type { FigmaGenerateRequest, GenerateMode, FigmaCommand, FigmaGenerateResponse, GenerateOutputFormat } from '@/lib/figma/types';

const VALID_MODES: GenerateMode[] = ['detail-page', 'web-design', 'reference-clone'];
// 이미지 생성 폴백 모델 체인
const IMAGE_MODELS = [
  'gemini-3-pro-image-preview',
  'gemini-2.5-flash-image',
] as const;

function isServerOverloadError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /503|429|500|502|504|UNAVAILABLE|overloaded|quota|rate.?limit|resource.?exhausted/i.test(msg);
}
const IMAGE_BUCKET = 'generated-images';

// 섹션 타입에서 이미지 프롬프트를 생성한다.
/** 입력 데이터에서 상품/서비스명 추출 (가장 구체적인 이름 우선) */
function extractProductName(inputData: Record<string, unknown> | undefined): string {
  if (!inputData) return '';
  const keys = [
    'productName', 'menuName', 'itemName', 'serviceName', 'programName',
    'packageName', 'courseName', 'treatmentName',
    'storeName', 'hospitalName', 'academyName', 'gymName', 'firmName',
    'restaurantName', 'hotelName', 'eventName',
    'brandName', 'companyName', 'name',
  ];
  for (const key of keys) {
    const val = inputData[key];
    if (typeof val === 'string' && val.trim()) return val.trim();
  }
  // description에서 핵심 키워드 추출
  const desc = inputData.description;
  if (typeof desc === 'string' && desc.trim()) {
    return desc.substring(0, 30).trim();
  }
  return '';
}

/** 카테고리별 구체적 이미지 주제 매핑 */
const CATEGORY_IMAGE_SUBJECTS: Record<string, Record<string, string>> = {
  restaurant: {
    hero: '음식 클로즈업, 김이 모락모락 나는 갓 조리된 요리, 식욕을 자극하는 플레이팅',
    features: '요리 재료 클로즈업, 신선한 식재료, 셰프의 손길',
    benefits: '맛있게 식사하는 사람들, 행복한 식사 장면, 따뜻한 분위기',
    gallery: '다양한 메뉴 플레이팅, 음식 플랫레이, 아름다운 그릇에 담긴 요리',
    testimonials: '만족스럽게 식사하는 고객, 미소 짓는 모습',
    process: '요리 과정, 셰프가 조리하는 장면, 불꽃이 이는 웍',
    team: '셰프 프로필, 요리사 전문 포트레이트, 주방에서 요리하는 셰프',
    cta: '시그니처 메뉴 클로즈업, 가장 인기있는 요리, 화려한 플레이팅',
  },
  ecommerce: {
    hero: '상품 히어로샷, 깔끔한 배경에 제품이 돋보이는 스튜디오 촬영',
    features: '제품 디테일 클로즈업, 소재/질감이 보이는 매크로 촬영',
    benefits: '제품을 사용하는 라이프스타일 장면, 만족스러운 사용 경험',
    gallery: '여러 각도에서 촬영한 제품, 45도/정면/측면 앵글',
    testimonials: '제품을 사용하며 만족하는 고객',
    process: '제품 제조/생산 과정, 장인 정신이 느껴지는 공정',
    cta: '제품 패키지와 함께 라이프스타일 연출',
  },
  medical: {
    hero: '깨끗하고 현대적인 병원 시설, 밝고 쾌적한 진료 환경',
    features: '첨단 의료 장비, 깔끔한 진료실, 최신 기술',
    benefits: '환자와 상담하는 의료진, 따뜻한 케어 장면',
    gallery: '병원 시설 투어, 대기실, 상담실, 수술실',
    testimonials: '건강해진 환자의 밝은 표정',
    team: '의료진 프로필, 전문적이면서 친근한 의사/간호사',
    process: '진료 과정, 상담 → 검사 → 치료 단계',
    cta: '깨끗한 병원 로비, 안내 데스크, 환영하는 분위기',
  },
  education: {
    hero: '역동적인 수업 장면, 열정적인 강의, 집중하는 학생들',
    features: '학습 환경, 스마트 교실, 최신 교육 기자재',
    benefits: '성취감에 빛나는 학생, 합격/졸업 축하 장면',
    gallery: '다양한 수업 모습, 실습 장면, 토론, 그룹 활동',
    testimonials: '밝게 웃는 수강생, 자신감 넘치는 표정',
    team: '강사 프로필, 전문적이면서 열정적인 교육자',
    process: '커리큘럼 단계, 기초 → 심화 → 실전 학습 과정',
    cta: '함께 공부하는 학생들, 밝은 미래를 향한 모습',
  },
  fitness: {
    hero: '역동적인 운동 장면, 에너지 넘치는 트레이닝, 땀방울',
    features: '최신 운동 기구, 넓고 쾌적한 시설, 트레이닝 존',
    benefits: 'Before/After 체형 변화, 건강해진 모습, 자신감',
    gallery: '다양한 운동 프로그램, 요가/웨이트/유산소',
    testimonials: '변화된 몸매에 자신감 넘치는 회원',
    team: '전문 트레이너, 근육질의 프로페셔널한 코치',
    process: '운동 루틴, 워밍업 → 메인운동 → 쿨다운',
    cta: '도전적인 운동 장면, 동기부여가 되는 에너지',
  },
  realestate: {
    hero: '고급 아파트/주택 외관, 아름다운 건축물, 야경 조명',
    features: '넓은 거실 인테리어, 통유리 창문, 자연 채광',
    benefits: '가족이 행복하게 생활하는 모습, 프리미엄 라이프스타일',
    gallery: '각 실 투어, 주방/침실/거실/욕실 인테리어',
    team: '전문 공인중개사, 신뢰감 있는 부동산 전문가',
    process: '분양/계약 과정, 모델하우스 투어',
    cta: '야경이 아름다운 아파트 전경, 프리미엄 주거 공간',
  },
  travel: {
    hero: '숨막히는 여행지 풍경, 하늘과 바다, 탁 트인 전망',
    features: '숙소 시설, 풀빌라, 리조트 편의시설',
    benefits: '여행을 즐기는 사람들, 힐링 장면, 감성 여행',
    gallery: '다양한 여행 스팟, 명소, 액티비티, 현지 음식',
    testimonials: '행복한 여행자, 추억을 만드는 장면',
    process: '여행 일정, 출발 → 관광 → 체험 → 귀국',
    cta: '꿈같은 여행지 전경, 지금 당장 떠나고 싶은 풍경',
  },
  wedding: {
    hero: '로맨틱한 웨딩 장면, 꽃 장식, 따뜻한 조명',
    features: '웨딩홀 시설, 연회장, 가든 웨딩 공간',
    benefits: '행복한 신랑신부, 감동적인 순간',
    gallery: '드레스/턱시도, 부케, 케이크, 웨딩 장식',
    team: '웨딩 플래너, 전문 스태프',
    process: '웨딩 준비 과정, 상담 → 드레스 → 촬영 → 본식',
    cta: '꿈같은 웨딩 장면, 로맨틱한 조명과 꽃',
  },
  legal: {
    hero: '권위있는 법률 사무소, 서재, 법전이 늘어선 책장',
    features: '전문적인 상담 장면, 서류 검토, 법률 자문',
    benefits: '성공적인 결과에 안도하는 의뢰인',
    gallery: '사무실, 회의실, 상담 공간',
    team: '변호사/세무사 프로필, 전문가다운 포트레이트',
    process: '법률 서비스 절차, 상담 → 분석 → 수행 → 결과',
    cta: '신뢰감 있는 전문가와의 상담 장면',
  },
  saas: {
    hero: '깔끔한 대시보드 UI, 모니터에 표시된 앱 화면, 모던 워크스페이스',
    features: '앱 기능 스크린샷, 모바일/데스크톱 목업',
    benefits: '생산성이 향상된 팀, 효율적으로 일하는 모습',
    gallery: '다양한 디바이스에서의 앱 화면, 반응형 UI',
    team: '스타트업 팀원, 에너지 넘치는 개발자/디자이너',
    process: '서비스 온보딩, 가입 → 설정 → 활용 과정',
    cta: '미래지향적인 테크 이미지, 디지털 혁신',
  },
  personal: {
    hero: '전문적인 프로필 사진, 자연광 포트레이트, 자신감 있는 포즈',
    features: '작업물/포트폴리오, 프로젝트 결과물 촬영',
    benefits: '전문가의 작업 과정, 몰입하여 일하는 장면',
    gallery: '다양한 프로젝트 결과물, 수상 내역',
    process: '작업 과정, 기획 → 제작 → 완성',
    cta: '전문적이면서 친근한 프로필, 함께 일하고 싶은 느낌',
  },
};

function buildSectionImagePrompt(
  sectionGroup: string,
  category: string,
  inputData: Record<string, unknown> | undefined,
  imageName?: string,
  imageTag?: string,
): string {
  const template = CATEGORY_TEMPLATES[category as CategoryKey];
  const imageryStyle = template?.imagery?.style || 'photorealistic';
  const colorTone = template?.imagery?.colorTone || 'neutral';
  const compositions = template?.imagery?.composition || [];

  const quality = IMAGE_PROMPT_QUALITY.find(q => q.tier === 'premium')
    || IMAGE_PROMPT_QUALITY[0];

  const compositionMap: Record<string, string> = {
    hero: 'hero-shot', gallery: 'flat-lay', features: 'rule-of-thirds',
    benefits: 'lifestyle', testimonials: 'lifestyle', team: 'center-composition',
    stats: 'center-composition', process: 'rule-of-thirds', pricing: 'center-composition',
  };
  const compositionId = compositionMap[sectionGroup] || 'center-composition';
  const composition = COMPOSITION_RULES.find(c => c.id === compositionId) || COMPOSITION_RULES[0];

  const lightingMap: Record<string, string> = {
    ecommerce: 'studio-clean', realestate: 'soft-natural', medical: 'studio-clean',
    education: 'high-key', restaurant: 'golden-hour', travel: 'golden-hour',
    wedding: 'soft-natural', legal: 'studio-clean', fitness: 'dramatic',
    saas: 'studio-clean', personal: 'soft-natural',
  };
  const lightingId = lightingMap[category] || 'studio-clean';
  const lighting = LIGHTING_STYLES.find(l => l.id === lightingId) || LIGHTING_STYLES[0];

  // ★ 상품/서비스명 추출 (이미지 일관성의 핵심)
  const productName = extractProductName(inputData);

  // ★ 카테고리별 구체적 이미지 주제
  const categorySubjects = CATEGORY_IMAGE_SUBJECTS[category] || {};
  const subjectHint = categorySubjects[sectionGroup] || '';

  // ★ tag에서 추가 키워드 추출 (예: "img_hero_tteokbokki_main" → "tteokbokki main")
  const tagHint = imageTag
    ? imageTag.replace(/^img_/, '').replace(/_/g, ' ').trim()
    : '';

  // 이미지 이름에서 힌트 추출
  const nameHint = imageName
    ? imageName.replace('[이미지]', '').replace(/[\[\]]/g, '').trim()
    : '';

  // 카테고리 구도 중 랜덤 선택 (섹션마다 다른 구도)
  const categoryComposition = compositions.length > 0
    ? compositions[Math.floor(Math.random() * compositions.length)]
    : '';

  // ★ 구체적인 프롬프트 조합
  const parts: string[] = [
    `Create a ${imageryStyle} commercial photograph`,
  ];

  // 상품명이 있으면 최우선 반영
  if (productName) {
    parts.push(`Subject: "${productName}" - this image MUST be directly related to "${productName}"`);
    if (subjectHint) parts.push(subjectHint);
  } else if (subjectHint) {
    parts.push(subjectHint);
  } else {
    parts.push(`Professional ${category} commercial image for ${sectionGroup} section`);
  }

  // tag/name 힌트 추가
  if (tagHint && tagHint !== nameHint) parts.push(`Scene: ${tagHint}`);
  if (nameHint) parts.push(`Context: ${nameHint}`);

  // 구도
  if (categoryComposition) parts.push(`Composition: ${categoryComposition}`);
  parts.push(composition.examplePrompt);

  // 조명/톤/품질
  parts.push(lighting.promptKeywords.join(', '));
  parts.push(`Color tone: ${colorTone}`);
  parts.push(quality.styleKeywords.join(', '));
  parts.push(quality.qualityKeywords.join(', '));

  // ★ 금지 사항 강화
  parts.push('No text, no watermark, no overlay, no logos');
  parts.push(`IMPORTANT: This image is for a Korean ${category} detail page. The image must look authentic and relevant to "${productName || category}". Do NOT generate unrelated stock photos`);
  parts.push('16:9 aspect ratio, Korean commercial style');

  return parts.filter(Boolean).join('. ');
}

// Gemini로 이미지 생성 (폴백 모델 체인 적용)
async function generateImage(apiKey: string, prompt: string, sectionName: string): Promise<string | null> {
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

      const candidate = response.candidates?.[0];
      if (!candidate) {
        console.error(`[figma-img] 후보 없음: ${sectionName}, finishReason=${response.candidates?.[0]?.finishReason || 'N/A'}`);
        return null;
      }

      const parts = candidate.content?.parts;
      if (!parts || parts.length === 0) {
        console.error(`[figma-img] 파트 없음: ${sectionName}, finishReason=${candidate.finishReason}`);
        return null;
      }

      const imagePart = parts.find(
        (p) => 'inlineData' in p && p.inlineData
      );
      if (!imagePart || !('inlineData' in imagePart) || !imagePart.inlineData?.data) {
        const partTypes = parts.map(p => Object.keys(p).join(',')).join(' | ');
        console.error(`[figma-img] 이미지 데이터 없음: ${sectionName}, partTypes=[${partTypes}]`);
        return null;
      }

      return imagePart.inlineData.data as string;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (isServerOverloadError(err)) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      console.error(`[figma-img] 생성 실패: ${sectionName} - ${msg}`);
      return null;
    }
  }

  console.error(`[figma-img] 모든 모델 실패: ${sectionName}`);
  return null;
}

// Supabase Storage에 업로드 후 공개 URL 반환
async function uploadImage(
  projectId: string,
  sectionName: string,
  imageBase64: string,
): Promise<string | null> {
  const admin = createAdminClient();
  if (!admin) {
    console.error(`[figma-img] 업로드 실패: admin 클라이언트 생성 불가 (SERVICE_ROLE_KEY 확인)`);
    return null;
  }

  try {
    await ensureStorageBucket(IMAGE_BUCKET);
  } catch (bucketErr) {
    console.error(`[figma-img] 버킷 확인 실패: ${bucketErr instanceof Error ? bucketErr.message : String(bucketErr)}`);
    return null;
  }

  const buffer = Buffer.from(imageBase64, 'base64');
  // Supabase Storage는 ASCII만 key로 허용 → 한글/특수문자 모두 제거
  const safeName = sectionName
    .replace(/\[.*?\]/g, '')  // [이미지] 등 대괄호 태그 제거
    .replace(/[^a-zA-Z0-9_\-]/g, '_')  // ASCII 영숫자+언더스코어+하이픈만 허용
    .replace(/_+/g, '_')  // 연속 언더스코어 정리
    .replace(/^_|_$/g, '');  // 앞뒤 언더스코어 제거
  const filePath = `figma/${projectId}/${safeName || 'img'}_${Date.now()}.png`;

  const { error } = await admin.storage
    .from(IMAGE_BUCKET)
    .upload(filePath, buffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (error) {
    console.error(`[figma-img] Storage 업로드 실패: ${error.message} (bucket=${IMAGE_BUCKET}, path=${filePath})`);
    return null;
  }

  const { data: urlData } = admin.storage
    .from(IMAGE_BUCKET)
    .getPublicUrl(filePath);

  const publicUrl = urlData?.publicUrl || null;
  return publicUrl;
}

// 커맨드에서 이미지 플레이스홀더를 찾아 실제 이미지로 교체
async function enrichCommandsWithImages(
  commands: FigmaCommand[],
  apiKey: string,
  category: string,
  inputData: Record<string, unknown> | undefined,
): Promise<FigmaCommand[]> {
  // 이미지 플레이스홀더 찾기 (이름에 "[이미지]" 또는 "[img]"가 포함된 rectangle)
  const imagePlaceholders: Array<{ index: number; cmdId: string; group: string; tag?: string }> = [];

  const IMAGE_NAME_PATTERN = /img|image|이미지|photo|사진|gallery|hero_image|banner|thumbnail|poster|visual/i;

  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];
    if (cmd.command !== 'create_rectangle') continue;

    const name = String(cmd.params.name || '');
    const height = Number(cmd.params.height || 0);

    // 이미지 플레이스홀더 판별: 이름 패턴 매칭 또는 큰 rectangle (divider 제외)
    const nameMatch = IMAGE_NAME_PATTERN.test(name);
    const sizeMatch = height >= 100;

    if (nameMatch || sizeMatch) {
      imagePlaceholders.push({
        index: i,
        cmdId: cmd.id,
        group: cmd.group || 'general',
        tag: cmd.params.tag as string | undefined,
      });
    }
  }

  if (imagePlaceholders.length === 0) return commands;

  const projectId = `figma_${Date.now().toString(36)}`;
  const additionalCommands: FigmaCommand[] = [];

  // 모든 이미지 플레이스홀더에 이미지 생성 (중복 제거 없음)
  const batchSize = 4;

  for (let i = 0; i < imagePlaceholders.length; i += batchSize) {
    const batch = imagePlaceholders.slice(i, i + batchSize);

    const results = await Promise.allSettled(
      batch.map(async (placeholder, batchIdx) => {
        const imgName = String(commands[placeholder.index].params.name || '');
        const imgTag = placeholder.tag || (commands[placeholder.index].params.tag as string | undefined);
        const prompt = buildSectionImagePrompt(placeholder.group, category, inputData, imgName, imgTag);
        const imageBase64 = await generateImage(apiKey, prompt, `${placeholder.group}_${i + batchIdx}`);
        if (!imageBase64) {
          console.error(`[figma-img] 생성 null 반환: ${placeholder.group}_${i + batchIdx}`);
          return null;
        }

        const imageUrl = await uploadImage(projectId, `${placeholder.group}_${i + batchIdx}`, imageBase64);
        if (!imageUrl) {
          console.error(`[figma-img] 업로드 null 반환: ${placeholder.group}_${i + batchIdx}`);
          return null;
        }

        return { placeholder, imageUrl };
      })
    );

    for (const result of results) {
      if (result.status === 'rejected') {
        console.error(`[figma-img] Promise rejected: ${result.reason}`);
      }
      if (result.status === 'fulfilled' && result.value) {
        const { placeholder, imageUrl } = result.value;
        additionalCommands.push({
          id: `cmd_img_${placeholder.cmdId}`,
          command: 'set_image_fill',
          params: {
            nodeId: `$${placeholder.cmdId}`,
            imageUrl,
            scaleMode: 'FILL',
          },
          group: placeholder.group,
          description: `${placeholder.group} 이미지 적용`,
        });
      }
    }
  }

  return [...commands, ...additionalCommands];
}

/**
 * POST /api/figma/generate
 * @description 피그마 커맨드 시퀀스를 생성한다. 이미지도 자동 생성하여 포함.
 */
export async function POST(request: Request) {
  try {
    // SECURITY-CRITICAL
    const supabase = await createClient();
    if (!supabase) return unauthorizedError();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedError();

    const body = await request.json();
    const {
      mode = 'detail-page',
      category,
      inputData,
      style,
      pixelHeight = '8000',
      canvasWidth = 1440,
      referenceAnalysis: refAnalysis,
      outputFormat = 'flat-commands',
    } = body;

    const validFormats: GenerateOutputFormat[] = ['flat-commands', 'tree', 'hybrid'];
    const format: GenerateOutputFormat = validFormats.includes(outputFormat) ? outputFormat : 'flat-commands';

    if (!VALID_MODES.includes(mode)) {
      return validationError(`지원하지 않는 모드입니다: ${mode}`);
    }

    if (mode !== 'reference-clone' && !category) {
      return validationError('카테고리는 필수입니다');
    }

    const { data: settings } = await supabase
      .from('user_settings')
      .select('gemini_api_key')
      .eq('user_id', user.id)
      .single();

    const apiKey = settings?.gemini_api_key;
    if (!apiKey) {
      return validationError('마이페이지에서 Gemini API 키를 먼저 등록해주세요');
    }

    let result: FigmaGenerateResponse;

    const generateRequest: FigmaGenerateRequest = {
      mode,
      category,
      inputData,
      style,
      pixelHeight: String(pixelHeight),
      canvasWidth: Number(canvasWidth),
      outputFormat: format,
    };

    const refData = (mode === 'reference-clone' && refAnalysis)
      ? {
          analysisId: refAnalysis.analysisId || `ref_${Date.now()}`,
          colorPalette: refAnalysis.colorPalette,
          sections: refAnalysis.sections,
          typography: refAnalysis.typography,
          overallStyle: refAnalysis.overallStyle,
          totalHeight: refAnalysis.totalHeight,
          spacing: refAnalysis.spacing,
          effects: refAnalysis.effects,
        }
      : undefined;

    if (mode === 'detail-page' && format === 'flat-commands') {
      // 템플릿 기반 생성: AI 없이 코드로 레이아웃 확정
      result = assembleDetailPage({
        category: category || 'ecommerce',
        canvasWidth: Number(canvasWidth),
        inputData,
      });
    } else if (format === 'tree' || format === 'hybrid') {
      // 트리 모드: AI가 중첩 TreeNode JSON을 반환 → flat 커맨드로 자동 변환
      const treeResult = await generateFigmaTree(apiKey, generateRequest, refData);
      if (treeResult.tree) {
        const catTemplate = CATEGORY_TEMPLATES[category as CategoryKey] || CATEGORY_TEMPLATES.ecommerce;
        const treeOptions: TreeToCommandsOptions = {
          brandColor: (inputData?.brandColor as string) || catTemplate.colorScheme.primary,
          accentColor: (inputData?.accentColor as string) || catTemplate.colorScheme.accent,
          secondaryColor: catTemplate.colorScheme.secondary,
          canvasWidth: Number(canvasWidth),
        };
        const flatCommands = treeToFlatCommands(treeResult.tree, treeOptions);
        result = {
          commands: flatCommands,
          metadata: {
            totalCommands: flatCommands.length,
            sections: treeResult.metadata.sections,
            estimatedTime: treeResult.metadata.estimatedTime,
            outputFormat: 'tree',
          },
        };
      } else {
        result = treeResult;
      }
    } else {
      // 기존 flat 커맨드 모드: AI가 커맨드 배열을 반환
      result = await generateFigmaCommands(apiKey, generateRequest, refData);
    }

    // 2. 이미지 생성 + 커맨드에 추가
    const enrichedCommands = await enrichCommandsWithImages(
      result.commands,
      apiKey,
      category || 'ecommerce',
      inputData,
    );

    const imageCount = enrichedCommands.length - result.commands.length;

    // 생성 로그 저장 (실패 무시)
    try {
      await supabase.from('generation_logs').insert({
        user_id: user.id,
        category: category || mode,
        input_data: { mode, category, inputData, pixelHeight, canvasWidth },
        output_data: {
          commandCount: enrichedCommands.length,
          sections: result.metadata.sections,
          imageCount,
        },
        model_version: `gemini-3-pro-preview + ${IMAGE_MODELS[0]}`,
        tokens_used: 0,
      });
    } catch {
      // 로그 실패는 무시
    }

    return NextResponse.json({
      ok: true,
      data: {
        ...result,
        commands: enrichedCommands,
        metadata: {
          ...result.metadata,
          totalCommands: enrichedCommands.length,
          imageCount,
        },
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';

    if (message.includes('API key') || message.includes('apiKey')) {
      return externalApiError('Gemini API 키가 유효하지 않습니다');
    }

    return internalError(message);
  }
}
