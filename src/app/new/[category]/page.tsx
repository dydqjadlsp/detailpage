'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Loader2, X, Plus, CheckCircle, Layers, Type, Star, MessageSquare, Megaphone, Image as ImageIcon, Ruler, Wand2, ChevronDown, Search } from 'lucide-react';
import Link from 'next/link';
import { FigmaExportButton } from '@/components/figma';
import { getCategoryById, CATEGORY_ICONS } from '@/lib/categories';
import type { CategoryInputField } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
    ecommerce: '#F59E0B', realestate: '#3B82F6', medical: '#10B981',
    education: '#8B5CF6', restaurant: '#EF4444', travel: '#06B6D4',
    wedding: '#EC4899', legal: '#6366F1', fitness: '#F97316',
    saas: '#7C3AED', personal: '#14B8A6',
};

const GENERATION_STEPS = [
    { id: 'analyze', label: '입력 데이터 분석', icon: Layers, duration: 1500 },
    { id: 'hero', label: 'Hero 섹션 생성', icon: Type, duration: 2000 },
    { id: 'features', label: '핵심 특징 섹션 생성', icon: Star, duration: 2500 },
    { id: 'images', label: '이미지 생성 중', icon: ImageIcon, duration: 3000 },
    { id: 'testimonials', label: '고객 후기 섹션 생성', icon: MessageSquare, duration: 2000 },
    { id: 'cta', label: 'CTA 섹션 생성', icon: Megaphone, duration: 1500 },
    { id: 'finalize', label: '최종 조합 및 최적화', icon: CheckCircle, duration: 1000 },
];

interface GeneratedSection {
    type: string;
    title: string;
    subtitle?: string;
}

export default function CategoryInputPage() {
    const params = useParams();
    const router = useRouter();
    const categoryId = params.category as string;
    const category = getCategoryById(categoryId);

    const [formData, setFormData] = useState<Record<string, string | string[]>>({});
    const [tagInput, setTagInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentStep, setCurrentStep] = useState(-1);
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);
    const [generatedSections, setGeneratedSections] = useState<GeneratedSection[]>([]);
    const [error, setError] = useState('');
    const [pixelHeight, setPixelHeight] = useState('8000');
    const [canvasWidth, setCanvasWidth] = useState(860);
    const [generatingField, setGeneratingField] = useState<string | null>(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isParsingReference, setIsParsingReference] = useState(false);
    const [referenceData, setReferenceData] = useState<Record<string, unknown> | null>(null);

    const simulateSteps = useCallback((): Promise<void> => {
        return new Promise((resolve) => {
            let stepIndex = 0;

            const runStep = () => {
                if (stepIndex >= GENERATION_STEPS.length) {
                    resolve();
                    return;
                }

                setCurrentStep(stepIndex);
                const step = GENERATION_STEPS[stepIndex];

                setTimeout(() => {
                    setCompletedSteps((prev) => [...prev, step.id]);

                    if (step.id === 'hero') {
                        setGeneratedSections((prev) => [...prev, {
                            type: 'Hero',
                            title: '히어로 섹션',
                            subtitle: 'AI 생성 헤드라인',
                        }]);
                    } else if (step.id === 'features') {
                        setGeneratedSections((prev) => [...prev, {
                            type: 'Features',
                            title: '핵심 특징',
                        }]);
                    } else if (step.id === 'testimonials') {
                        setGeneratedSections((prev) => [...prev, {
                            type: 'Testimonials',
                            title: '고객 후기',
                        }]);
                    } else if (step.id === 'cta') {
                        setGeneratedSections((prev) => [...prev, {
                            type: 'CTA',
                            title: '행동 유도',
                        }]);
                    }

                    stepIndex++;
                    runStep();
                }, step.duration);
            };

            runStep();
        });
    }, []);

    const handleGenerateDescription = async (fieldName: string) => {
        setGeneratingField(fieldName);
        try {
            const response = await fetch('/api/generate/description', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: categoryId,
                    fieldName,
                    currentData: formData,
                }),
            });
            const result = await response.json();
            if (result.ok && result.data?.text) {
                setFormData((prev) => ({ ...prev, [fieldName]: result.data.text }));
            } else {
                const errMsg = typeof result.error === 'string'
                    ? result.error
                    : result.error?.message || 'AI 설명 생성에 실패했습니다.';
                setError(errMsg);
            }
        } catch {
            setError('네트워크 오류가 발생했습니다.');
        } finally {
            setGeneratingField(null);
        }
    };

    const handleParseReference = async () => {
        const url = (formData['referenceUrl'] as string)?.trim();
        if (!url) return;
        setIsParsingReference(true);
        setError('');
        try {
            const response = await fetch('/api/figma/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ figmaUrl: url }),
            });
            const result = await response.json();
            if (result.ok && result.data?.referenceAnalysis) {
                setReferenceData(result.data.referenceAnalysis);
            } else {
                const errMsg = typeof result.error === 'string'
                    ? result.error
                    : result.error?.message || '레퍼런스 분석에 실패했습니다.';
                setError(errMsg);
            }
        } catch {
            setError('레퍼런스 분석 중 네트워크 오류가 발생했습니다.');
        } finally {
            setIsParsingReference(false);
        }
    };

    if (!category) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">카테고리를 찾을 수 없습니다</h1>
                <Link href="/new" className="btn-primary">
                    카테고리 선택으로 돌아가기
                </Link>
            </div>
        );
    }

    const Icon = CATEGORY_ICONS[category.icon];
    const color = CATEGORY_COLORS[category.id] ?? '#7C3AED';

    const handleChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // 카테고리별 샘플 데이터 (테스트용 자동 채우기)
    const SAMPLE_DATA: Record<string, Record<string, string | string[]>> = {
        ecommerce: {
            productName: '오가닉 리넨 셔츠',
            price: '59,000원',
            description: '100% 유기농 리넨으로 제작된 프리미엄 셔츠입니다. 프랑스 노르망디 지방에서 재배한 최상급 플랙스(아마)를 직접 수입하여, GOTS(Global Organic Textile Standard) 인증을 받은 원단만 사용합니다. 화학 표백이나 합성 염료를 일절 사용하지 않는 자연 염색 공정으로, 피부가 민감한 분도 안심하고 착용할 수 있습니다. 리넨 특유의 까슬거림을 최소화하기 위해 3단계 소프트닝 워싱 공정을 거쳤으며, 세탁할수록 오히려 부드러워지는 특성이 있습니다. 여름철 체온 조절에 탁월한 통기성과 흡습성을 갖추고 있어, 한낮의 무더위에도 쾌적한 착용감을 유지합니다. 미니멀한 오버핏 디자인으로 데일리룩부터 비즈니스 캐주얼까지 다양한 스타일링이 가능합니다.',
            targetAudience: '30-40대 친환경 라이프스타일에 관심 있는 직장인. 패스트패션에 지친 미니멀리스트. 피부가 민감해서 천연 소재를 선호하는 소비자. 지속 가능한 패션에 기꺼이 투자하는 가치 소비층.',
            keyFeatures: ['GOTS 인증 유기농 리넨 100%, 프랑스 노르망디산 최상급 플랙스 원단', '무화학 자연 염색, 합성 염료·표백제 제로, 민감성 피부도 안심', '3단계 소프트닝 워싱, 리넨 까슬거림 최소화, 세탁할수록 부드러워짐', '올시즌 미니멀 오버핏, 데일리부터 비즈니스 캐주얼까지 스타일링 자유', '탁월한 통기성·흡습성, 한여름에도 쾌적한 체온 조절 기능', 'OEKO-TEX Standard 100 인증, 유해물질 불검출 안전 인증'],
            sellingPoints: ['화학 처리 없는 자연 그대로의 촉감, 아이 피부에 닿아도 걱정 없는 순수한 원단', '세탁할수록 나만의 빈티지 텍스처, 시간이 지날수록 더 매력적으로 변하는 리넨의 마법', '30일 무조건 무료 반품, 입어보고 마음에 안 들면 이유 불문 100% 환불', '전 상품 무료 배송 + 친환경 패키징, 종이 택배 상자와 옥수수 전분 완충재 사용', '재구매율 73%, 한번 입으면 옷장의 다른 셔츠가 불편해집니다'],
            originalPrice: '89,000',
            salePrice: '59,000',
            discountRate: '34%',
            brandColor: '#5B7553',
            accentColor: '#D4A574',
            toneManner: 'natural',
            ctaText: '자연을 입다, 지금 주문하기',
        },
        realestate: {
            propertyName: '한남 더 힐 레지던스',
            price: '15억~28억',
            description: '서울 용산구 한남동, 대한민국 최상위 주거 입지에 들어서는 프리미엄 레지던스입니다. 남향 전 세대에서 한강과 남산을 동시에 조망할 수 있으며, 지상 35층 규모의 랜드마크 타워와 저층형 테라스하우스로 구성됩니다. 세계적 건축사무소 OMA가 설계에 참여했으며, 이탈리아 천연 대리석과 독일산 시스템 창호를 적용한 하이엔드 마감재가 특징입니다. 단지 내 프라이빗 피트니스 센터, 인피니티 풀, 사우나, 골프 시뮬레이터, 와인 셀러, 게스트 하우스를 갖추고 있으며, 24시간 전담 컨시어지가 입주민의 모든 생활을 케어합니다. 한남대교·이태원·녹사평역을 도보로 이용 가능한 트리플 역세권이자, 용산국제업무지구 개발 호재를 직접 누릴 수 있는 미래가치 높은 입지입니다.',
            targetAudience: '40-60대 자산 10억 이상 고액 자산가. 강남 대치동·압구정에서 주거 업그레이드를 원하는 가구. 해외 거주 후 귀국하는 글로벌 엘리트 가정. 부동산 투자 포트폴리오 다각화를 원하는 투자자.',
            keyFeatures: ['한강·남산 듀얼 파노라마 뷰, 남향 전 세대 리버뷰 보장', '전용면적 85~145㎡ 다양한 평형대, 2룸~4룸 라이프스타일별 선택', 'OMA 건축사무소 설계, 세계적 건축 거장의 디자인 철학', '이탈리아 대리석 + 독일 시스템 창호, 하이엔드 마감재 적용', '프라이빗 커뮤니티, 인피니티 풀, 피트니스, 골프 시뮬레이터, 와인 셀러', '트리플 역세권, 한남대교·이태원역·녹사평역 도보권'],
            sellingPoints: ['한남동 최고 입지, 대한민국 부동산 가치 1순위 지역', '용산국제업무지구 개발 수혜, 향후 10년간 지속적 프리미엄 상승 기대', 'VIP 24시간 전담 컨시어지, 하우스키핑, 발렛, 케이터링, 여행 수배까지', '프라이빗 게스트하우스, 지인 방문 시 호텔급 숙소 제공', '세대당 2대 주차 보장, 지하 3층 규모 넉넉한 주차 공간'],
            originalPrice: '28억',
            salePrice: '25억',
            discountRate: '분양가 할인',
            brandColor: '#1B3A5C',
            accentColor: '#C9A96E',
            toneManner: 'premium',
            ctaText: '모델하우스 VIP 방문 예약',
        },
        medical: {
            hospitalName: '미소 피부과의원',
            price: '레이저 토닝 1회 15만원, 울쎄라 리프팅 80만원~',
            description: '피부과 전문의 3인이 함께 운영하는 프리미엄 피부 클리닉입니다. 서울대학교 의과대학 출신 의료진이 환자 한 분 한 분의 피부 상태를 정밀 분석하여, 레이저 토닝, 프락셀, IPL, 울쎄라 리프팅, 보톡스, 필러 등 최적의 시술 플랜을 설계합니다. 미국 FDA와 한국 식약처 이중 인증을 받은 정품 장비만을 사용하며, 시술 전 3D 피부 분석 시스템으로 현재 상태를 객관적으로 진단합니다. 시술 후에는 전담 코디네이터가 6개월간 경과를 추적 관리하며, 모든 시술에 대해 재시술 보증 프로그램을 운영합니다. 강남역 5번 출구에서 도보 2분, 야간 진료(월·수 20시까지)도 가능하여 바쁜 직장인도 부담 없이 방문하실 수 있습니다.',
            targetAudience: '25-45세 피부 고민이 있는 직장인 남녀. 여드름 흉터·색소침착으로 자신감이 떨어진 분. 노화 초기 징후(잔주름, 탄력 저하)를 관리하고 싶은 30대. 결혼식·면접 등 중요한 일정을 앞두고 피부 개선이 필요한 분.',
            keyFeatures: ['서울대 의대 출신 피부과 전문의 3인 상주', 'FDA + 식약처 이중 인증 정품 장비 사용', '3D AI 피부 분석, 모공·색소·주름·탄력 정밀 측정', '1:1 맞춤 시술 플랜 + 6개월 경과 추적 관리', '재시술 보증 프로그램, 결과 불만족 시 무료 재시술', '강남역 도보 2분 + 야간 진료(월·수 20시)'],
            sellingPoints: ['시술 전후 HD 비교 사진 제공, 변화를 눈으로 직접 확인', '무통 마취 크림 + 쿨링 시스템, 시술 중 통증 최소화', '첫 방문 피부 분석 + 상담 100% 무료, 부담 없이 전문가 진단', '네이버 예약 리뷰 4.9점, 2,400건 이상의 검증된 후기', '당일 시술 가능, 빠른 예약 시스템으로 대기 시간 최소화'],
            originalPrice: '250,000',
            salePrice: '150,000',
            discountRate: '40%',
            brandColor: '#2D8B7A',
            accentColor: '#E8D5B7',
            toneManner: 'professional',
            ctaText: '무료 피부 분석 예약하기',
        },
        education: {
            academyName: '코드랩 코딩 아카데미',
            price: '12주 과정 480만원',
            description: '현직 시니어 개발자가 직접 가르치는 실무 중심 코딩 부트캠프입니다. 네이버·카카오·쿠팡·토스 출신 개발자 12인이 강사진으로 참여하며, 단순 이론이 아닌 실제 서비스 개발 프로젝트를 중심으로 커리큘럼이 구성됩니다. 웹 프론트엔드(React/Next.js), 백엔드(Node.js/Spring), 앱 개발(Flutter/React Native), 데이터 분석(Python/SQL) 4개 트랙을 운영합니다. 12주 집중 과정 동안 4개의 실전 프로젝트를 완성하며, 최종 프로젝트는 실제 서비스로 런칭하여 포트폴리오에 바로 활용 가능합니다. 수료 후에는 파트너 기업 120여 곳과의 채용 연계 프로그램을 통해 취업·이직을 지원하며, 6개월 내 미취업 시 수강료를 전액 환불하는 취업 보장 제도를 운영합니다.',
            targetAudience: '비전공자 중 개발자로 커리어 전환을 원하는 20-30대. IT 기업 이직을 준비하는 주니어 개발자. 사이드 프로젝트를 위해 코딩을 배우고 싶은 기획자·디자이너. 퇴사 후 새로운 커리어를 찾는 직장인.',
            keyFeatures: ['네이버·카카오·쿠팡·토스 출신 현직 시니어 개발자 12인 강사진', '12주 동안 실전 프로젝트 4개 완성, 이론보다 실습 70% 비율', '소수 정예 12인 반 편성, 강사 1인당 학생 4인 밀착 멘토링', '취업 연계 파트너 기업 120곳, 수료 직후 면접 기회 제공', '6개월 취업 보장, 미취업 시 수강료 100% 환불', '졸업 후에도 평생 커뮤니티, 동문 네트워크 3,000명+'],
            sellingPoints: ['수료생 평균 연봉 4,200만 원, 비전공자 출신도 대기업 입사 성공', '취업 성공률 92%, 3개월 이내 취업 기준', '수강료 후불제 + 분할 납부, 취업 후 갚아도 OK', '매일 오전 9시~오후 9시 강의장 자유 이용 + 무료 간식 제공', '수료생 실제 후기 평점 4.8/5.0, 1,200명의 생생한 후기'],
            originalPrice: '6,000,000',
            salePrice: '4,800,000',
            discountRate: '20%',
            brandColor: '#6C5CE7',
            accentColor: '#00CEC9',
            toneManner: 'trendy',
            ctaText: '무료 체험 수업 신청하기',
        },
        restaurant: {
            storeName: '봉추 찜닭',
            price: '2인분 27,000원~',
            description: '1982년 안동에서 시작된 정통 찜닭의 맛을 3대째 이어가고 있는 프리미엄 찜닭 전문점입니다. 할머니 레시피를 기반으로 한약재 12가지를 넣고 6시간 우려낸 비법 육수가 핵심입니다. 당일 새벽 도축한 국내산 생닭만을 사용하며, 채소도 매일 아침 가락시장에서 직접 경매로 가져옵니다. 매운맛은 청양고추와 하바네로를 블렌딩한 자체 개발 소스로 1~5단계까지 선택 가능합니다. 당면은 국내산 고구마 전분 100%로 만든 수제 당면을 사용하여 쫄깃한 식감이 남다릅니다. 2인분부터 최대 10인분까지 주문 가능하며, 회식·모임 단체 주문 시 양을 넉넉히 서비스로 더 드립니다.',
            targetAudience: '20-40대 맛집 탐방을 즐기는 직장인과 대학생. 회식 장소를 찾는 팀장급 직장인. 주말 외식으로 가족과 함께하는 3-4인 가족. 매운 음식을 좋아하는 MZ세대 푸드파이터.',
            keyFeatures: ['한약재 12가지 6시간 비법 육수, 3대째 전해지는 안동 할머니 레시피', '당일 새벽 도축 국내산 생닭 100%, 냉동닭 절대 불사용', '매운맛 5단계 선택, 청양고추 + 하바네로 블렌딩 자체 개발 소스', '국내산 고구마 전분 수제 당면, 일반 당면과 차원이 다른 쫄깃함', '배달 주문 30분 내 보장, 늦으면 다음 주문 2,000원 할인 쿠폰', '단체 주문(5인분+) 시 사이드 메뉴 서비스'],
            sellingPoints: ['네이버 맛집 랭킹 TOP 10, 강남구 찜닭 부문 1위', '월 평균 리뷰 500건 이상, 별점 4.7/5.0의 검증된 맛', '단체 주문 10% 할인 + 무료 배달, 직장인 회식 최적 메뉴', '리뷰 작성 시 떡볶이 1인분 무료, 포장 주문 혜택', '재주문율 68%, 한번 맛보면 단골이 되는 중독적인 맛'],
            originalPrice: '32,000',
            salePrice: '27,000',
            discountRate: '15%',
            brandColor: '#C0392B',
            accentColor: '#F39C12',
            toneManner: 'bold',
            ctaText: '지금 바로 주문하기',
        },
        travel: {
            packageName: '제주 힐링 3박 4일',
            price: '1인 890,000원~',
            description: '일상에 지친 당신을 위한 프리미엄 제주 힐링 여행 패키지입니다. 애월 해안가에 위치한 5성급 오션뷰 리조트에서 3박을 보내며, 매일 아침 수평선 위로 떠오르는 일출을 객실에서 감상할 수 있습니다. 전용 차량과 프라이빗 가이드가 동행하여 한라산 중산간 비밀 숲길, 성산일출봉 프라이빗 트레킹, 우도 자전거 투어를 안내합니다. 제주 미슐랭 가이드에 소개된 레스토랑 3곳에서의 코스 디너가 포함되어 있으며, 해녀가 직접 잡은 싱싱한 해산물 체험도 즐기실 수 있습니다. 리조트 내 인피니티 풀, 스파 트리트먼트 60분, 요가 클래스가 매일 제공되어 몸과 마음을 완전히 충전할 수 있습니다.',
            targetAudience: '30-50대 부부·커플 중 기념일 여행을 계획 중인 분. 번아웃으로 재충전이 필요한 30대 직장인. 부모님 효도 여행을 선물하고 싶은 자녀. 단체 여행보다 프라이빗 투어를 선호하는 소규모 그룹.',
            keyFeatures: ['애월 오션뷰 5성급 리조트 3박, 전 객실 해변 조망 보장', '전용 차량 + 프라이빗 가이드 동행, 원하는 곳 어디든 맞춤 투어', '제주 미슐랭 레스토랑 3곳 코스 디너 포함, 현지 최고의 미식 경험', '매일 스파 트리트먼트 60분 + 요가 클래스, 완벽한 휴식과 힐링', '성산일출봉 프라이빗 트레킹 + 우도 자전거 투어, 제주의 숨은 명소 탐방', '해녀 체험 + 해산물 BBQ, 바다에서 직접 잡은 신선한 해산물'],
            sellingPoints: ['출발 7일 전까지 100% 무료 취소, 일정 변경 부담 제로', '소규모 프라이빗 투어 최대 8인, 대형 관광버스 NO, 나만의 여행', '여행자 보험 + 코로나 보장 포함, 만일의 상황에도 걱정 없이', '네이버 여행 후기 4.9점, 800건 이상의 만족 리뷰', '얼리버드 예약 시 리조트 스위트룸 무료 업그레이드'],
            originalPrice: '1,290,000',
            salePrice: '890,000',
            discountRate: '31%',
            brandColor: '#0984E3',
            accentColor: '#00B894',
            toneManner: 'warm',
            ctaText: '힐링 여행 예약하기',
        },
        wedding: {
            eventName: '가든 웨딩 패키지',
            price: '50인 기준 6,900,000원~',
            description: '서울 근교 남양주에 위치한 3,000평 규모의 프라이빗 가든에서 펼쳐지는 로맨틱 야외 웨딩입니다. 사계절 아름다운 정원과 100년 된 느티나무 아래에서 두 분의 영원한 사랑을 약속하세요. 프랑스 플로리스트가 직접 디자인하는 플라워 아치, 버진 로드, 테이블 데코레이션이 동화 같은 분위기를 완성합니다. 4K 시네마틱 영상 촬영과 스냅 사진 500컷 보정본이 기본 제공되며, 드론 촬영으로 가든 전경의 웅장한 항공샷도 담아드립니다. 50인 기준 프렌치-한식 퓨전 코스 케이터링이 포함되어 있으며, 주방장이 현장에서 직접 조리합니다. 우천 시에는 단지 내 유리 온실 채플로 자동 전환되어 날씨 걱정 없이 진행됩니다.',
            targetAudience: '야외 웨딩을 꿈꾸는 25-35세 예비 신랑신부. 기존 호텔 웨딩홀의 획일적인 형식에서 벗어나고 싶은 커플. 소규모로 가까운 사람들만 초대하는 스몰 웨딩을 원하는 분. SNS에 올릴 감성적인 웨딩 사진을 중요하게 생각하는 분.',
            keyFeatures: ['3,000평 프라이빗 가든, 100년 느티나무 아래 로맨틱 세레모니', '프랑스 플로리스트 직접 디자인, 플라워 아치·버진 로드·테이블 풀 데코', '4K 시네마틱 영상 + 드론 항공 촬영 + 스냅 500컷 보정본', '50인 프렌치-한식 퓨전 코스 케이터링, 현장 라이브 쿠킹', '우천 시 유리 온실 채플 자동 전환, 날씨 걱정 제로', '하객 셔틀버스 2대 운영, 서울↔남양주 왕복 무료'],
            sellingPoints: ['날씨 100% 보장, 우천 시 유리 온실 채플 자동 전환, 추가 비용 없음', '완전 맞춤 컨셉 디자인, 두 분의 러브 스토리를 테마로 공간 연출', '하객 셔틀버스 왕복 무료, 서울 주요 거점 3곳 출발', '식전 리셉션 + 포토부스 + 캘리그라피 방명록, 하객 경험까지 완벽하게', '예식 후 프라이빗 가든 포토타임 1시간, 여유롭게 추억을 남기세요'],
            originalPrice: '8,500,000',
            salePrice: '6,900,000',
            discountRate: '19%',
            brandColor: '#B83280',
            accentColor: '#F8B4D9',
            toneManner: 'cute',
            ctaText: '무료 웨딩 상담 예약',
        },
        legal: {
            firmName: '정의 법률사무소',
            price: '초기상담 무료, 착수금 200만원~',
            description: '서울 서초동 법조타운에 위치한 종합 법률사무소입니다. 판사·검사 출신 변호사 5인이 팀 체제로 운영하며, 민사(손해배상·채권추심), 형사(사기·횡령·폭행), 가사(이혼·양육권·상속), 부동산(임대차·재건축·분양) 4개 전문 분야에서 체계적인 법률 서비스를 제공합니다. 사건 접수 시 2인 이상의 변호사가 공동으로 분석하여 최적의 법률 전략을 수립하는 크로스체크 시스템을 도입하고 있으며, 매 단계마다 의뢰인에게 진행 상황을 투명하게 보고합니다. 초기 상담 30분은 완전 무료이며, 성공보수 계약·분할 납부 등 유연한 보수 체계를 운영하여 비용 부담을 줄였습니다. 24시간 긴급 상담 핫라인을 운영하여 야간·주말에도 즉시 법률 조력을 받으실 수 있습니다.',
            targetAudience: '법률 분쟁에 처해 전문 변호사의 조력이 필요한 30-60대. 이혼·양육권·재산 분할 소송을 준비 중인 분. 부동산 사기·임대차 분쟁으로 피해를 입은 분. 형사 고소·고발을 준비 중이거나 피의자로 소환된 분. 사업 관련 계약 분쟁이나 채권 추심이 필요한 중소기업 대표.',
            keyFeatures: ['판사·검사 출신 변호사 5인 팀 체제, 4개 전문 분야 크로스체크 분석', '2인 이상 공동 사건 분석, 하나의 사건을 복수의 시각에서 검토', '진행 상황 실시간 투명 보고, 전담 매니저가 매 단계마다 안내', '초기 상담 30분 완전 무료, 사건의 승소 가능성을 먼저 판단해 드립니다', '24시간 긴급 상담 핫라인, 체포·구속 등 긴급 상황에 즉시 대응', '성공보수 + 분할 납부, 비용 부담을 최소화한 유연한 보수 체계'],
            sellingPoints: ['대한변호사협회 공식 등록 법률사무소, 신뢰할 수 있는 정식 사무소', '최근 3년 승소율 87%, 1,200건 이상의 검증된 사건 처리 실적', '24시간 긴급 상담, 경찰 소환·체포 시 1시간 내 변호사 출동', '첫 상담 무료 + 성공보수 가능, 비용이 부담되어 포기하지 마세요', '분할 납부 최대 12개월, 목돈 없이도 법률 서비스 이용 가능'],
            originalPrice: '3,000,000',
            salePrice: '2,000,000',
            discountRate: '33%',
            brandColor: '#2C3E50',
            accentColor: '#3498DB',
            toneManner: 'professional',
            ctaText: '무료 법률 상담 신청하기',
        },
        fitness: {
            gymName: '핏라인 PT 스튜디오',
            price: '월 315,000원 (1:1 PT 주3회)',
            description: '1:1 퍼스널 트레이닝만을 전문으로 하는 프리미엄 피트니스 스튜디오입니다. NSCA-CSCS, NASM-CPT 등 국제 공인 자격을 보유한 트레이너 8인이 상주하며, 회원 한 분 한 분의 체형·체력·목표에 맞춘 완전 개인화 프로그램을 설계합니다. 입회 시 인바디 정밀 측정, 관절 가동 범위 테스트, 자세 분석을 통해 현재 상태를 객관적으로 파악한 후 운동 플랜을 수립합니다. 운동뿐 아니라 전문 영양사가 설계한 맞춤 식단 프로그램을 제공하며, 전용 앱으로 매일 식단 사진을 공유하면 실시간 피드백을 받으실 수 있습니다. 바디프로필 촬영을 원하시는 분을 위한 12주 집중 바디프로필 패키지도 운영 중이며, 전문 포토그래퍼와 헤어·메이크업 아티스트가 함께합니다.',
            targetAudience: '20-40대 다이어트·체형 교정·바디프로필 촬영이 목표인 남녀. 혼자 운동하면 꾸준히 하기 어려운 분. 결혼식·바디프로필 등 중요한 이벤트를 앞두고 단기간 변화가 필요한 분. 허리·어깨 통증 등으로 전문가의 지도 하에 운동해야 하는 분.',
            keyFeatures: ['NSCA-CSCS 국제 인증 트레이너 8인 상주, 운동역학 전문가', '완전 개인화 1:1 맞춤 운동 프로그램, 체형·체력·목표별 설계', '전문 영양사 맞춤 식단 + 실시간 피드백, 운동만으로 부족한 식단 관리까지', '인바디 + 관절 가동 범위 + 자세 분석, 과학적 데이터 기반 프로그램', '전용 앱으로 운동 기록·식단·체중 변화 추적, 매일 눈에 보이는 변화', '12주 바디프로필 패키지, 전문 포토그래퍼 + 헤어메이크업 포함'],
            sellingPoints: ['3개월 평균 체지방 -8kg 감량, 실측 데이터 기반 검증된 결과', '바디프로필 촬영 올인원 패키지, 12주 트레이닝 + 촬영 + 보정까지', '첫 달 30% 할인 + 2주 무료 체험 PT, 만족 못하면 전액 환불', '새벽 6시~밤 11시 운영, 출근 전·퇴근 후 시간대 자유 선택', '회원 평균 만족도 4.9/5.0, 재등록율 82%의 압도적 신뢰'],
            originalPrice: '450,000',
            salePrice: '315,000',
            discountRate: '30%',
            brandColor: '#E67E22',
            accentColor: '#1ABC9C',
            toneManner: 'bold',
            ctaText: '무료 체험 PT 신청하기',
        },
        saas: {
            productName: '태스크플로우 (TaskFlow)',
            price: '월 19,000원/팀 (5인 이하 무료)',
            description: '팀의 모든 업무를 하나의 플랫폼에서 관리하는 올인원 프로젝트 협업 도구입니다. 칸반 보드로 작업 상태를 한눈에 파악하고, 간트 차트로 프로젝트 일정을 체계적으로 관리하며, 타임라인 뷰로 팀원별 워크로드를 균형 있게 분배할 수 있습니다. 실시간 채팅과 스레드 댓글로 별도의 메신저 없이 업무 맥락 안에서 소통이 가능하며, 파일 공유·문서 공동 편집·화면 녹화 기능까지 내장되어 있습니다. Slack, Notion, Google Workspace, GitHub 등 200개 이상의 외부 도구와 원클릭 연동되며, API를 통해 자체 시스템과의 커스텀 통합도 지원합니다. 매주 자동으로 생성되는 팀 생산성 리포트와 AI 기반 업무 우선순위 추천 기능으로 의사결정을 데이터로 뒷받침합니다.',
            targetAudience: '10-100인 규모 스타트업·중소기업의 PM과 팀 리더. 여러 도구(Slack+Notion+Jira)를 따로 쓰는 게 비효율적이라 느끼는 팀. 리모트 워크·하이브리드 근무 환경에서 팀 협업이 필요한 조직. 프로젝트 일정 관리와 리소스 배분에 어려움을 겪는 관리자.',
            keyFeatures: ['칸반 + 간트 + 타임라인 뷰, 프로젝트를 원하는 방식으로 시각화', '실시간 채팅 + 스레드 댓글, 업무 맥락 안에서 바로 소통', '200+ 외부 도구 연동, Slack, Notion, GitHub, Google Workspace 원클릭 연결', 'AI 업무 우선순위 추천, 마감일·의존성·워크로드 분석으로 자동 정렬', '주간 팀 생산성 리포트 자동 생성, 병목 구간과 개선점을 데이터로 파악', '파일 공유 + 문서 공동 편집 + 화면 녹화, 별도 도구 없이 올인원'],
            sellingPoints: ['도입 팀 업무 효율 평균 40% 향상, 500개 팀 실측 데이터', '14일 무료 체험, 신용카드 등록 없이 모든 기능 사용', '5인 이하 팀 영구 무료, 스타트업도 부담 없이 시작', '99.9% 업타임 SLA 보장, 엔터프라이즈급 안정성', '한국어 전용 고객지원, 평균 응답 시간 15분 이내'],
            originalPrice: '29,000/월',
            salePrice: '19,000/월',
            discountRate: '34%',
            brandColor: '#6C5CE7',
            accentColor: '#00CEC9',
            toneManner: 'clean',
            ctaText: '14일 무료로 시작하기',
        },
        personal: {
            name: '김민수',
            title: '프로덕트 디자이너',
            price: '프로젝트 당 300만원~, 월 고정 계약 500만원~',
            description: '5년차 프로덕트 디자이너로, 사용자의 문제를 디자인으로 해결하는 것을 좋아합니다. 카카오에서 2년, 토스에서 3년간 B2C 서비스의 UX/UI 디자인을 리드했으며, 500만 MAU 규모의 핀테크 앱 리디자인 프로젝트를 성공적으로 이끌었습니다. 디자인 시스템 구축부터 사용자 리서치, 프로토타이핑, A/B 테스트 설계까지 프로덕트 디자인 전 과정을 아우르며, 개발자·PM과의 원활한 협업을 강점으로 합니다. Figma, Sketch, Adobe Creative Suite에 능숙하고, Framer와 Principle로 인터랙션 프로토타입을 제작합니다. 2024년 레드닷 디자인 어워드 커뮤니케이션 디자인 부문을 수상했으며, 디자인 커뮤니티에서 월 1회 실무 디자인 강연을 진행하고 있습니다.',
            targetAudience: '프로덕트 디자이너를 채용하려는 IT 기업 인사 담당자. 디자인 에이전시에서 시니어 디자이너를 찾는 크리에이티브 디렉터. 사이드 프로젝트나 스타트업 MVP 디자인을 의뢰하고 싶은 창업자. 디자인 멘토링이나 강연을 원하는 주니어 디자이너.',
            keyFeatures: ['카카오·토스 출신 5년차 프로덕트 디자이너, B2C 서비스 UX/UI 전문', '500만 MAU 핀테크 앱 리디자인 프로젝트 리드, 전환율 23% 향상', '디자인 시스템 구축 경험, 컴포넌트 라이브러리 200+ 제작 및 운영', 'Figma·Sketch·Adobe·Framer 능숙, 도구에 구애받지 않는 유연함', '사용자 리서치 + A/B 테스트 설계, 데이터 기반 디자인 의사결정', '2024 레드닷 디자인 어워드 수상, 국제적으로 인정받은 디자인 역량'],
            sellingPoints: ['완성된 프로젝트 포트폴리오 20+, 실제 서비스 출시 경험만 포함', '레드닷 디자인 어워드 2024 수상, 세계 3대 디자인 어워드 인정', '영어 비즈니스 커뮤니케이션 가능, 글로벌 팀과의 협업 경험 다수', '디자인 커뮤니티 월간 강연 진행, 1,500명+ 팔로워의 신뢰', '프리랜서·정규직 모두 가능, 프로젝트 단위 또는 풀타임 협업'],
            originalPrice: '5,000,000',
            salePrice: '3,000,000',
            discountRate: '40%',
            brandColor: '#2D3436',
            accentColor: '#6C5CE7',
            toneManner: 'clean',
            ctaText: '프로젝트 문의하기',
        },
    };

    const handleFillSample = () => {
        const sample = SAMPLE_DATA[categoryId];
        if (!sample) return;
        setFormData(sample);
        setShowAdvanced(true);
    };

    const handleTagAdd = (name: string) => {
        if (!tagInput.trim()) return;
        const current = (formData[name] as string[]) || [];
        setFormData((prev) => ({ ...prev, [name]: [...current, tagInput.trim()] }));
        setTagInput('');
    };

    const handleTagRemove = (name: string, index: number) => {
        const current = (formData[name] as string[]) || [];
        setFormData((prev) => ({
            ...prev,
            [name]: current.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);
        setCurrentStep(0);
        setCompletedSteps([]);
        setGeneratedSections([]);
        setError('');

        const stepAnimation = simulateSteps();

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: category.id,
                    inputData: formData,
                    pixelHeight,
                    canvasWidth,
                    ...(referenceData && { referenceAnalysis: referenceData }),
                }),
            });

            const result = await response.json();

            await stepAnimation;
            setCurrentStep(GENERATION_STEPS.length);
            setCompletedSteps(GENERATION_STEPS.map((s) => s.id));

            if (result.ok && result.data?.puckData) {
                const sections = result.data.puckData.content || [];
                setGeneratedSections(
                    sections.map((s: Record<string, unknown>) => ({
                        type: String(s.type),
                        title: String((s.props as Record<string, unknown>)?.title || s.type),
                        subtitle: String((s.props as Record<string, unknown>)?.subtitle || ''),
                    }))
                );

                setTimeout(() => {
                    router.push(`/editor/${result.data.projectId}`);
                }, 1500);
            } else {
                const errMsg = typeof result.error === 'string'
                    ? result.error
                    : result.error?.message || 'AI 생성에 실패했습니다. 다시 시도해주세요.';
                setError(errMsg);
                setIsGenerating(false);
            }
        } catch {
            await stepAnimation;
            setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
            setIsGenerating(false);
        }
    };

    const renderField = (field: CategoryInputField) => {
        switch (field.type) {
            case 'textarea':
                return (
                    <div className="relative">
                        <textarea
                            className="input-field min-h-[120px] resize-none"
                            placeholder={field.placeholder}
                            required={field.required}
                            value={(formData[field.name] as string) || ''}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                        />
                        <button
                            type="button"
                            disabled={generatingField === field.name}
                            onClick={() => handleGenerateDescription(field.name)}
                            className="absolute top-2 right-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 hover:text-violet-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {generatingField === field.name ? (
                                <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    AI 작성 중...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-3 h-3" />
                                    AI 작성
                                </>
                            )}
                        </button>
                    </div>
                );
            case 'select':
                return (
                    <select
                        className="input-field"
                        required={field.required}
                        value={(formData[field.name] as string) || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                    >
                        <option value="">선택해주세요</option>
                        {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                );
            case 'tags':
                return (
                    <div>
                        <div className="flex gap-2">
                            <input
                                className="input-field flex-1"
                                placeholder={field.placeholder}
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleTagAdd(field.name);
                                    }
                                }}
                            />
                            <button
                                type="button"
                                className="btn-secondary px-3"
                                onClick={() => handleTagAdd(field.name)}
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        {((formData[field.name] as string[]) || []).length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {((formData[field.name] as string[]) || []).map((tag, i) => (
                                    <span
                                        key={`${tag}-${i}`}
                                        className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleTagRemove(field.name, i)}
                                            className="hover:text-red-400 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 'color':
                return (
                    <div className="flex gap-2 items-center">
                        <input
                            type="color"
                            className="w-10 h-10 rounded-lg border border-white/10 bg-transparent cursor-pointer"
                            value={(formData[field.name] as string) || field.placeholder || '#7C3AED'}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                        />
                        <input
                            type="text"
                            className="input-field flex-1 font-mono"
                            placeholder={field.placeholder}
                            value={(formData[field.name] as string) || ''}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                        />
                    </div>
                );
            default:
                return (
                    <input
                        type="text"
                        className="input-field"
                        placeholder={field.placeholder}
                        required={field.required}
                        value={(formData[field.name] as string) || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                );
        }
    };

    const basicFields = category.inputSchema.filter(f => !f.advanced);
    const advancedFields = category.inputSchema.filter(f => f.advanced);

    const progressPercent = isGenerating
        ? Math.round(((completedSteps.length) / GENERATION_STEPS.length) * 100)
        : 0;

    return (
        <div className={`min-h-screen transition-all duration-500 ${isGenerating ? 'flex' : ''}`}>
            {/* Left: Form */}
            <div className={`transition-all duration-500 ${isGenerating ? 'w-1/2 border-r border-white/5' : 'w-full'}`}>
                <div className={`mx-auto px-4 py-8 sm:py-12 ${isGenerating ? 'max-w-xl' : 'max-w-2xl'}`}>
                    <Link
                        href="/new"
                        className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        카테고리 선택
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${color}15`, color }}
                            >
                                {Icon && <Icon className="w-7 h-7" />}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold">{category.name}</h1>
                                <p className="text-neutral-400 text-sm">
                                    {category.description}
                                </p>
                            </div>
                            {SAMPLE_DATA[categoryId] && (
                                <button
                                    type="button"
                                    onClick={handleFillSample}
                                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all hover:scale-105"
                                    style={{
                                        borderColor: `${color}40`,
                                        color,
                                        backgroundColor: `${color}10`,
                                    }}
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    샘플 채우기
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
                            {basicFields.map((field) => (
                                <div key={field.name}>
                                    <label className="block text-sm font-semibold mb-2">
                                        {field.label}
                                        {field.required && (
                                            <span className="text-red-400 ml-1">*</span>
                                        )}
                                    </label>
                                    {renderField(field)}
                                </div>
                            ))}

                            {advancedFields.length > 0 && (
                                <div className="pt-4 border-t border-white/5">
                                    <button
                                        type="button"
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                        className="flex items-center gap-2 text-sm font-semibold text-neutral-400 hover:text-white transition-colors w-full"
                                    >
                                        <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                                        고급 설정 ({advancedFields.length}개 항목)
                                    </button>
                                    <AnimatePresence>
                                        {showAdvanced && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="space-y-6 mt-4">
                                                    {advancedFields.map((field) => (
                                                        <div key={field.name}>
                                                            <label className="block text-sm font-semibold mb-2">
                                                                {field.label}
                                                            </label>
                                                            {renderField(field)}
                                                            {field.name === 'referenceUrl' && (
                                                                <div className="mt-2 flex items-center gap-2">
                                                                    <button
                                                                        type="button"
                                                                        disabled={isParsingReference || !(formData['referenceUrl'] as string)?.trim()}
                                                                        onClick={handleParseReference}
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:text-blue-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                                                    >
                                                                        {isParsingReference ? (
                                                                            <>
                                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                                                분석 중...
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Search className="w-3 h-3" />
                                                                                레퍼런스 분석
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                    {referenceData && (
                                                                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                                                                            <CheckCircle className="w-3 h-3" />
                                                                            분석 완료
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            <div className="pt-2 border-t border-white/5">
                                <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                                    <Ruler className="w-4 h-4" style={{ color }} />
                                    페이지 높이
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {[
                                        { value: '4000', label: '4K', desc: '8개 섹션' },
                                        { value: '8000', label: '8K', desc: '11개 섹션' },
                                        { value: '12000', label: '12K', desc: '14개 섹션' },
                                        { value: '20000', label: '20K', desc: '21개 섹션' },
                                        { value: '40000', label: '40K', desc: '33개 섹션' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setPixelHeight(opt.value)}
                                            className={`p-2 rounded-lg text-center transition-all border ${pixelHeight === opt.value
                                                ? 'border-current bg-current/10'
                                                : 'border-white/10 hover:border-white/20 bg-white/5'
                                                }`}
                                            style={pixelHeight === opt.value ? { borderColor: color, color } : undefined}
                                        >
                                            <div className="text-sm font-bold">{opt.label}</div>
                                            <div className="text-[10px] text-neutral-500">{opt.desc}</div>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-neutral-500 mt-2">
                                    {Number(pixelHeight).toLocaleString()}px 높이 / 섹션이 많을수록 더 많은 이미지가 생성됩니다
                                </p>
                            </div>

                            <div className="pt-2 border-t border-white/5">
                                <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                                    <Ruler className="w-4 h-4" style={{ color }} />
                                    가로 폭
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {[
                                        { value: 790, label: '790', desc: '네이버' },
                                        { value: 800, label: '800', desc: '기본' },
                                        { value: 860, label: '860', desc: '쿠팡' },
                                        { value: 1200, label: '1200', desc: '웹' },
                                        { value: 1440, label: '1440', desc: '와이드' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setCanvasWidth(opt.value)}
                                            className={`p-2 rounded-lg text-center transition-all border ${canvasWidth === opt.value
                                                ? 'border-current bg-current/10'
                                                : 'border-white/10 hover:border-white/20 bg-white/5'
                                                }`}
                                            style={canvasWidth === opt.value ? { borderColor: color, color } : undefined}
                                        >
                                            <div className="text-sm font-bold">{opt.label}</div>
                                            <div className="text-[10px] text-neutral-500">{opt.desc}</div>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-neutral-500 mt-2">
                                    {canvasWidth}px / 네이버 상세페이지는 790, 쿠팡은 860 권장
                                </p>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isGenerating}
                                    className="btn-primary w-full py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            AI가 페이지를 생성하고 있습니다...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            AI로 상세페이지 생성하기
                                        </>
                                    )}
                                </button>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                                    {error}
                                </div>
                            )}
                        </form>

                        {/* 섹션 빌더 */}
                        <Link
                            href={`/new/${categoryId}/sections`}
                            className="mt-6 block glass-card rounded-2xl p-6 hover:bg-white/[0.04] transition-colors group"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-neutral-300 mb-1">
                                        섹션별 커스텀
                                    </h3>
                                    <p className="text-xs text-neutral-500">
                                        섹션별로 텍스트와 참고 이미지를 직접 지정하여 생성합니다
                                    </p>
                                </div>
                                <ArrowLeft className="w-4 h-4 text-neutral-500 rotate-180 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>

                        {/* 피그마 내보내기 */}
                        <div className="mt-4 glass-card rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-neutral-300 mb-3">
                                피그마에 직접 만들기
                            </h3>
                            <p className="text-xs text-neutral-500 mb-4">
                                피그마 플러그인에 연결하면 피그마에서 직접 상세페이지를 생성합니다.
                            </p>
                            <FigmaExportButton
                                category={category.id}
                                inputData={formData as Record<string, unknown>}
                                mode="detail-page"
                                pixelHeight={pixelHeight}
                                canvasWidth={canvasWidth}
                            />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right: Preview Panel */}
            <AnimatePresence>
                {isGenerating && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: '50%', opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className="h-screen sticky top-0 overflow-y-auto bg-[rgb(var(--color-surface))]"
                    >
                        <div className="p-6 sm:p-8">
                            {/* Preview Header */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-white">
                                        Preview
                                    </h2>
                                    <span className="text-xs font-mono text-violet-400 bg-violet-500/10 px-2 py-1 rounded">
                                        {progressPercent}%
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{
                                            background: `linear-gradient(90deg, ${color}, #8B5CF6)`,
                                        }}
                                        initial={{ width: '0%' }}
                                        animate={{ width: `${progressPercent}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>

                            {/* Generation Steps */}
                            <div className="space-y-3 mb-8">
                                {GENERATION_STEPS.map((step, index) => {
                                    const StepIcon = step.icon;
                                    const isCompleted = completedSteps.includes(step.id);
                                    const isCurrent = currentStep === index;

                                    return (
                                        <motion.div
                                            key={step.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{
                                                opacity: index <= currentStep ? 1 : 0.3,
                                                x: 0,
                                            }}
                                            transition={{ delay: index * 0.1, duration: 0.3 }}
                                            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isCurrent
                                                ? 'bg-violet-500/10 border border-violet-500/20'
                                                : isCompleted
                                                    ? 'bg-white/5 border border-white/5'
                                                    : 'border border-transparent'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCompleted
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : isCurrent
                                                    ? 'bg-violet-500/20 text-violet-400'
                                                    : 'bg-white/5 text-neutral-600'
                                                }`}>
                                                {isCompleted ? (
                                                    <CheckCircle className="w-4 h-4" />
                                                ) : isCurrent ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <StepIcon className="w-4 h-4" />
                                                )}
                                            </div>
                                            <span className={`text-sm font-medium ${isCompleted
                                                ? 'text-emerald-400'
                                                : isCurrent
                                                    ? 'text-white'
                                                    : 'text-neutral-600'
                                                }`}>
                                                {step.label}
                                            </span>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Section Preview Cards */}
                            {generatedSections.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-neutral-400 mb-3">
                                        생성된 섹션
                                    </h3>
                                    <div className="space-y-3">
                                        {generatedSections.map((section, index) => (
                                            <motion.div
                                                key={`${section.type}-${index}`}
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={{ duration: 0.4 }}
                                                className="glass-card rounded-xl p-4"
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span
                                                        className="px-2 py-0.5 text-xs font-mono rounded"
                                                        style={{
                                                            backgroundColor: `${color}15`,
                                                            color,
                                                        }}
                                                    >
                                                        {section.type}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-white font-medium">
                                                    {section.title}
                                                </p>
                                                {section.subtitle && (
                                                    <p className="text-xs text-neutral-500 mt-1">
                                                        {section.subtitle}
                                                    </p>
                                                )}
                                                {/* Section skeleton */}
                                                <div className="mt-3 space-y-2">
                                                    <div className="h-2 bg-white/5 rounded-full w-3/4" />
                                                    <div className="h-2 bg-white/5 rounded-full w-1/2" />
                                                    <div className="h-2 bg-white/5 rounded-full w-5/6" />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Completion State */}
                            {completedSteps.length === GENERATION_STEPS.length && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="mt-8 text-center p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20"
                                >
                                    <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                                    <p className="text-lg font-semibold text-emerald-400">
                                        Generation Complete
                                    </p>
                                    <p className="text-sm text-neutral-400 mt-1">
                                        Moving to editor...
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
