import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { unauthorizedError, validationError, internalError, externalApiError } from '@/lib/errors';

const CATEGORY_PROMPTS: Record<string, string> = {
  ecommerce: '이 상품의 구매 전환율을 극대화하는 이커머스 상세페이지를 만들어주세요. 핵심 USP를 강조하고, 구매 결정을 돕는 설득력 있는 카피를 작성하세요.',
  realestate: '이 매물의 가치와 장점을 부각시키는 고급스러운 부동산 소개 페이지를 만들어주세요. 투자 가치와 생활 편의성을 강조하세요.',
  medical: '환자에게 신뢰감과 전문성을 전달하는 병원 홍보 페이지를 만들어주세요. 의료진의 전문성과 첨단 장비를 강조하세요.',
  education: '수강생이 등록하고 싶어지는 교육 랜딩페이지를 만들어주세요. 성공 스토리와 차별화된 교육 방법을 강조하세요.',
  restaurant: '방문하고 싶어지는 음식점 소개 페이지를 만들어주세요. 음식의 매력과 분위기를 생동감 있게 표현하세요.',
  travel: '떠나고 싶게 만드는 여행 상품 소개 페이지를 만들어주세요. 감성적인 이미지와 합리적인 가격을 강조하세요.',
  wedding: '특별한 순간을 위한 우아하고 감동적인 이벤트 소개 페이지를 만들어주세요.',
  legal: '전문가의 권위와 신뢰성을 느낄 수 있는 법무/세무 사무소 소개 페이지를 만들어주세요.',
  fitness: '에너지 넘치고 동기부여가 되는 피트니스 프로그램 소개 페이지를 만들어주세요.',
  saas: '제품의 핵심 가치와 기능을 명쾌하게 전달하는 SaaS 소개 페이지를 만들어주세요. 문제 해결 중심으로 작성하세요.',
  personal: '전문성과 개성이 돋보이는 퍼스널 브랜딩 포트폴리오 페이지를 만들어주세요.',
};

function buildPrompt(category: string, inputData: Record<string, unknown>): string {
  const categoryPrompt = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS.saas;
  const inputSummary = Object.entries(inputData)
    .map(([key, value]) => {
      if (Array.isArray(value)) return `${key}: ${value.join(', ')}`;
      return `${key}: ${value}`;
    })
    .join('\n');

  return `당신은 전문 웹 디자이너이자 카피라이터입니다.

[요청]
${categoryPrompt}

[입력 정보]
${inputSummary}

[출력 형식]
아래 JSON 형식으로 정확하게 출력하세요. 다른 텍스트 없이 JSON만 출력하세요.

{
  "content": [
    {
      "type": "Hero",
      "props": {
        "id": "hero-1",
        "title": "메인 헤드라인",
        "subtitle": "서브 헤드라인",
        "ctaText": "CTA 버튼 텍스트",
        "backgroundStyle": "gradient"
      }
    },
    {
      "type": "Features",
      "props": {
        "id": "features-1",
        "title": "핵심 특징 섹션 제목",
        "items": [
          { "title": "특징 1", "description": "설명", "icon": "Zap" },
          { "title": "특징 2", "description": "설명", "icon": "Shield" },
          { "title": "특징 3", "description": "설명", "icon": "Star" }
        ]
      }
    },
    {
      "type": "Benefits",
      "props": {
        "id": "benefits-1",
        "title": "혜택 섹션 제목",
        "items": [
          { "title": "혜택 1", "description": "상세 설명" },
          { "title": "혜택 2", "description": "상세 설명" },
          { "title": "혜택 3", "description": "상세 설명" }
        ]
      }
    },
    {
      "type": "Testimonials",
      "props": {
        "id": "testimonials-1",
        "title": "고객 후기 섹션 제목",
        "items": [
          { "name": "이름", "role": "직책", "content": "후기 내용" },
          { "name": "이름", "role": "직책", "content": "후기 내용" }
        ]
      }
    },
    {
      "type": "CTA",
      "props": {
        "id": "cta-1",
        "title": "행동 유도 제목",
        "subtitle": "보조 설명",
        "ctaText": "버튼 텍스트"
      }
    }
  ],
  "root": {
    "props": {
      "title": "페이지 제목"
    }
  }
}

각 섹션의 카피는 입력 정보를 기반으로 구체적이고 설득력 있게 작성하세요.
한국어로 작성하세요.`;
}

function parsePuckData(text: string) {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('JSON 파싱 실패');

  const parsed = JSON.parse(jsonMatch[0]);

  if (!parsed.content || !Array.isArray(parsed.content)) {
    throw new Error('content 배열이 없습니다');
  }

  parsed.content = parsed.content.map((item: Record<string, unknown>, index: number) => {
    const props = (item.props || {}) as Record<string, unknown>;
    if (!props.id) {
      props.id = `${String(item.type).toLowerCase()}-${index}`;
    }
    return { ...item, props };
  });

  if (!parsed.root) {
    parsed.root = { props: { title: 'Generated Page' } };
  }

  return parsed;
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    if (!supabase) return unauthorizedError();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return unauthorizedError();

    const body = await request.json();
    const { category, inputData } = body;

    if (!category || !inputData) {
      return validationError('카테고리와 입력 데이터가 필요합니다');
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return internalError('AI API 키가 설정되지 않았습니다');
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = buildPrompt(category, inputData);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    let puckData;
    try {
      puckData = parsePuckData(text);
    } catch {
      return externalApiError('AI 응답을 파싱할 수 없습니다');
    }

    const firstInputValue = Object.values(inputData)[0];
    const title = typeof firstInputValue === 'string'
      ? firstInputValue
      : `${category} 프로젝트`;

    const { data: project, error: dbError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        title,
        category,
        status: 'draft',
        puck_data: puckData,
        input_data: inputData,
      })
      .select()
      .single();

    if (dbError) return internalError(dbError.message);

    await supabase.from('generation_logs').insert({
      project_id: project.id,
      user_id: user.id,
      prompt,
      category,
      input_data: inputData,
      output_data: puckData,
      model_version: 'gemini-pro',
      tokens_used: 0,
    });

    return NextResponse.json({
      ok: true,
      data: {
        projectId: project.id,
        puckData,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    return internalError(message);
  }
}
