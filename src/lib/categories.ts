import type { Category, CategoryInputField } from '@/types';
import {
    ShoppingCart,
    Building2,
    Stethoscope,
    GraduationCap,
    UtensilsCrossed,
    Plane,
    Heart,
    Scale,
    Dumbbell,
    Rocket,
    User,
} from 'lucide-react';

/** 모든 카테고리에 공통 추가되는 고급 입력 필드 */
const COMMON_ADVANCED_FIELDS: CategoryInputField[] = [
    { name: 'sellingPoints', label: '핵심 셀링포인트', type: 'tags', required: false, placeholder: '셀링포인트 입력 후 Enter (예: 무방부제, 당일배송)', advanced: true },
    { name: 'originalPrice', label: '정가', type: 'text', required: false, placeholder: '예: 49,000원', advanced: true },
    { name: 'salePrice', label: '할인가', type: 'text', required: false, placeholder: '예: 29,000원', advanced: true },
    { name: 'discountRate', label: '할인율', type: 'text', required: false, placeholder: '예: 40%', advanced: true },
    { name: 'brandColor', label: '브랜드 메인 컬러', type: 'color', required: false, placeholder: '#FF6B35', advanced: true },
    { name: 'accentColor', label: '브랜드 보조 컬러', type: 'color', required: false, placeholder: '#004E89', advanced: true },
    {
        name: 'toneManner', label: '톤 & 매너', type: 'select', required: false, advanced: true,
        options: [
            { value: 'premium', label: '고급/럭셔리' },
            { value: 'trendy', label: '트렌디/모던' },
            { value: 'cute', label: '귀여운/캐주얼' },
            { value: 'clean', label: '깔끔/미니멀' },
            { value: 'warm', label: '따뜻한/감성' },
            { value: 'professional', label: '전문적/신뢰' },
            { value: 'bold', label: '강렬/임팩트' },
            { value: 'natural', label: '자연적/친환경' },
        ],
    },
    { name: 'ctaText', label: 'CTA 버튼 문구', type: 'text', required: false, placeholder: '예: 지금 구매하기', advanced: true },
    { name: 'referenceUrl', label: '레퍼런스 URL (피그마 or 웹)', type: 'text', required: false, placeholder: '예: https://figma.com/design/...', advanced: true },
];

/** 카테고리 스키마에 공통 고급 필드를 병합 */
function withAdvancedFields(baseSchema: CategoryInputField[]): CategoryInputField[] {
    // 기존 필드 중 이미 존재하는 이름은 중복 추가하지 않음
    const existingNames = new Set(baseSchema.map(f => f.name));
    const newFields = COMMON_ADVANCED_FIELDS.filter(f => !existingNames.has(f.name));
    return [...baseSchema, ...newFields];
}

export const CATEGORIES: Category[] = [
    {
        id: 'ecommerce',
        name: '이커머스',
        description: '구매 전환율을 극대화하는 상품 상세페이지',
        icon: 'ShoppingCart',
        sortOrder: 1,
        isActive: true,
        inputSchema: withAdvancedFields([
            { name: 'productName', label: '상품명', type: 'text', required: true, placeholder: '예: 오가닉 코튼 티셔츠' },
            { name: 'description', label: '상품 설명', type: 'textarea', required: true, placeholder: '상품의 핵심 특징을 설명해주세요' },
            { name: 'price', label: '가격', type: 'text', required: true, placeholder: '예: 39,000원' },
            { name: 'targetAudience', label: '타겟 고객', type: 'text', required: false, placeholder: '예: 20-30대 여성' },
            { name: 'keyFeatures', label: '핵심 특징', type: 'tags', required: true, placeholder: '특징을 입력 후 Enter' },
        ]),
    },
    {
        id: 'realestate',
        name: '부동산',
        description: '매물의 가치를 돋보이게 하는 고급스러운 소개',
        icon: 'Building2',
        sortOrder: 2,
        isActive: true,
        inputSchema: withAdvancedFields([
            { name: 'propertyName', label: '매물명', type: 'text', required: true, placeholder: '예: 강남 타워팰리스 42층' },
            {
                name: 'propertyType', label: '매물 유형', type: 'select', required: true, options: [
                    { value: 'apartment', label: '아파트' },
                    { value: 'officetel', label: '오피스텔' },
                    { value: 'villa', label: '빌라' },
                    { value: 'office', label: '사무실' },
                    { value: 'store', label: '상가' },
                ]
            },
            { name: 'description', label: '매물 설명', type: 'textarea', required: true, placeholder: '매물의 특장점을 설명해주세요' },
            { name: 'price', label: '가격', type: 'text', required: true, placeholder: '예: 15억' },
            { name: 'keyFeatures', label: '핵심 특징', type: 'tags', required: false, placeholder: '특징을 입력 후 Enter' },
        ]),
    },
    {
        id: 'medical',
        name: '병원/의료',
        description: '신뢰감과 전문성을 강조하는 병원 홍보',
        icon: 'Stethoscope',
        sortOrder: 3,
        isActive: true,
        inputSchema: withAdvancedFields([
            { name: 'hospitalName', label: '병원명', type: 'text', required: true, placeholder: '예: 서울밝은안과' },
            { name: 'specialty', label: '전문 분야', type: 'text', required: true, placeholder: '예: 라식/라섹, 백내장' },
            { name: 'description', label: '병원 소개', type: 'textarea', required: true, placeholder: '병원의 강점과 특징을 설명해주세요' },
            { name: 'doctorName', label: '대표 원장', type: 'text', required: false, placeholder: '예: 김진수 원장' },
            { name: 'price', label: '시술 가격', type: 'text', required: false, placeholder: '예: 상담 5만원, 레이저 토닝 1회 15만원' },
            { name: 'keyFeatures', label: '핵심 특징', type: 'tags', required: false, placeholder: '특징을 입력 후 Enter' },
        ]),
    },
    {
        id: 'education',
        name: '학원/교육',
        description: '수강생의 성공 스토리를 강조하는 랜딩페이지',
        icon: 'GraduationCap',
        sortOrder: 4,
        isActive: true,
        inputSchema: withAdvancedFields([
            { name: 'academyName', label: '학원명', type: 'text', required: true, placeholder: '예: 탑클래스 영어학원' },
            { name: 'courseName', label: '대표 강좌', type: 'text', required: true, placeholder: '예: TOEIC 900점 보장반' },
            { name: 'description', label: '학원 소개', type: 'textarea', required: true, placeholder: '학원의 교육 철학과 성과를 설명해주세요' },
            { name: 'targetAudience', label: '대상', type: 'text', required: false, placeholder: '예: 대학생, 직장인' },
            { name: 'price', label: '수강료', type: 'text', required: false, placeholder: '예: 3개월 180만원' },
            { name: 'keyFeatures', label: '핵심 특징', type: 'tags', required: false, placeholder: '특징을 입력 후 Enter' },
        ]),
    },
    {
        id: 'restaurant',
        name: '음식점/카페',
        description: '식욕을 자극하는 비주얼 중심 메뉴판',
        icon: 'UtensilsCrossed',
        sortOrder: 5,
        isActive: true,
        inputSchema: withAdvancedFields([
            { name: 'storeName', label: '가게명', type: 'text', required: true, placeholder: '예: 청담 스시 오마카세' },
            { name: 'cuisine', label: '음식 종류', type: 'text', required: true, placeholder: '예: 일식, 오마카세' },
            { name: 'description', label: '가게 소개', type: 'textarea', required: true, placeholder: '가게의 분위기와 특색을 설명해주세요' },
            { name: 'signatureMenu', label: '시그니처 메뉴', type: 'text', required: false, placeholder: '예: 특선 오마카세 코스' },
            { name: 'price', label: '가격대', type: 'text', required: false, placeholder: '예: 1인 25,000원~' },
            { name: 'keyFeatures', label: '핵심 특징', type: 'tags', required: false, placeholder: '특징을 입력 후 Enter' },
        ]),
    },
    {
        id: 'travel',
        name: '여행/숙박',
        description: '떠나고 싶게 만드는 감성 여행 상품 소개',
        icon: 'Plane',
        sortOrder: 6,
        isActive: true,
        inputSchema: withAdvancedFields([
            { name: 'packageName', label: '상품명', type: 'text', required: true, placeholder: '예: 제주 3박4일 힐링 패키지' },
            { name: 'destination', label: '목적지', type: 'text', required: true, placeholder: '예: 제주도' },
            { name: 'description', label: '상품 설명', type: 'textarea', required: true, placeholder: '여행 상품의 매력 포인트를 설명해주세요' },
            { name: 'price', label: '가격', type: 'text', required: false, placeholder: '예: 1인 599,000원' },
            { name: 'keyFeatures', label: '포함 사항', type: 'tags', required: false, placeholder: '항목을 입력 후 Enter' },
        ]),
    },
    {
        id: 'wedding',
        name: '웨딩/이벤트',
        description: '인생의 특별한 순간을 위한 우아한 초대장',
        icon: 'Heart',
        sortOrder: 7,
        isActive: true,
        inputSchema: withAdvancedFields([
            { name: 'eventName', label: '행사명', type: 'text', required: true, placeholder: '예: 김철수 & 이영희 결혼식' },
            {
                name: 'eventType', label: '행사 유형', type: 'select', required: true, options: [
                    { value: 'wedding', label: '결혼식' },
                    { value: 'birthday', label: '생일파티' },
                    { value: 'corporate', label: '기업 행사' },
                    { value: 'exhibition', label: '전시회' },
                ]
            },
            { name: 'description', label: '행사 소개', type: 'textarea', required: true, placeholder: '행사의 분위기와 컨셉을 설명해주세요' },
            { name: 'dateLocation', label: '일시/장소', type: 'text', required: false, placeholder: '예: 2026.03.15 / 서울 JW 메리어트' },
            { name: 'price', label: '패키지 가격', type: 'text', required: false, placeholder: '예: 500만원~' },
            { name: 'keyFeatures', label: '키워드', type: 'tags', required: false, placeholder: '키워드를 입력 후 Enter' },
        ]),
    },
    {
        id: 'legal',
        name: '법률/세무',
        description: '전문가의 권위를 드러내는 프로필 페이지',
        icon: 'Scale',
        sortOrder: 8,
        isActive: true,
        inputSchema: withAdvancedFields([
            { name: 'firmName', label: '사무소명', type: 'text', required: true, placeholder: '예: 법무법인 정의' },
            { name: 'specialty', label: '전문 분야', type: 'text', required: true, placeholder: '예: 부동산, 기업법무' },
            { name: 'description', label: '사무소 소개', type: 'textarea', required: true, placeholder: '사무소의 전문성과 실적을 설명해주세요' },
            { name: 'representative', label: '대표 변호사/세무사', type: 'text', required: false, placeholder: '예: 박정의 변호사' },
            { name: 'price', label: '상담/수임료', type: 'text', required: false, placeholder: '예: 초기상담 무료, 성공보수 별도' },
            { name: 'keyFeatures', label: '핵심 강점', type: 'tags', required: false, placeholder: '강점을 입력 후 Enter' },
        ]),
    },
    {
        id: 'fitness',
        name: '피트니스/요가',
        description: '역동적이고 에너지 넘치는 운동 프로그램 소개',
        icon: 'Dumbbell',
        sortOrder: 9,
        isActive: true,
        inputSchema: withAdvancedFields([
            { name: 'gymName', label: '센터명', type: 'text', required: true, placeholder: '예: 파워짐 강남점' },
            { name: 'programName', label: '프로그램', type: 'text', required: true, placeholder: '예: 1:1 퍼스널 트레이닝' },
            { name: 'description', label: '센터 소개', type: 'textarea', required: true, placeholder: '센터와 프로그램의 특징을 설명해주세요' },
            { name: 'price', label: '가격', type: 'text', required: false, placeholder: '예: 월 200,000원' },
            { name: 'keyFeatures', label: '핵심 특징', type: 'tags', required: false, placeholder: '특징을 입력 후 Enter' },
        ]),
    },
    {
        id: 'saas',
        name: '스타트업/SaaS',
        description: '혁신적인 기능을 명료하게 전달하는 제품 소개',
        icon: 'Rocket',
        sortOrder: 10,
        isActive: true,
        inputSchema: withAdvancedFields([
            { name: 'productName', label: '제품명', type: 'text', required: true, placeholder: '예: TaskFlow Pro' },
            { name: 'tagline', label: '태그라인', type: 'text', required: true, placeholder: '예: 팀 생산성을 200% 높이는 프로젝트 관리 도구' },
            { name: 'description', label: '제품 설명', type: 'textarea', required: true, placeholder: '제품이 해결하는 문제와 핵심 가치를 설명해주세요' },
            { name: 'targetAudience', label: '타겟 사용자', type: 'text', required: false, placeholder: '예: 스타트업 팀, 프리랜서' },
            { name: 'price', label: '가격', type: 'text', required: false, placeholder: '예: 월 19,000원~' },
            { name: 'keyFeatures', label: '핵심 기능', type: 'tags', required: true, placeholder: '기능을 입력 후 Enter' },
        ]),
    },
    {
        id: 'personal',
        name: '개인 브랜딩',
        description: '나만의 포트폴리오를 위한 퍼스널 페이지',
        icon: 'User',
        sortOrder: 11,
        isActive: true,
        inputSchema: withAdvancedFields([
            { name: 'name', label: '이름', type: 'text', required: true, placeholder: '예: 홍길동' },
            { name: 'title', label: '직함/소개', type: 'text', required: true, placeholder: '예: UI/UX 디자이너' },
            { name: 'description', label: '자기소개', type: 'textarea', required: true, placeholder: '본인의 경력과 강점을 설명해주세요' },
            { name: 'portfolio', label: '포트폴리오 URL', type: 'text', required: false, placeholder: '예: https://dribbble.com/username' },
            { name: 'price', label: '서비스 비용', type: 'text', required: false, placeholder: '예: 프로젝트 당 200만원~' },
            { name: 'keyFeatures', label: '보유 스킬', type: 'tags', required: true, placeholder: '스킬을 입력 후 Enter' },
        ]),
    },
];

export const CATEGORY_ICONS: Record<string, typeof ShoppingCart> = {
    ShoppingCart,
    Building2,
    Stethoscope,
    GraduationCap,
    UtensilsCrossed,
    Plane,
    Heart,
    Scale,
    Dumbbell,
    Rocket,
    User,
};

export function getCategoryById(id: string): Category | undefined {
    return CATEGORIES.find((c) => c.id === id);
}
