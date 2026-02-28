/**
 * Modern Effects - 2025 트렌드 디자인 효과
 * 최신 웹 디자인 트렌드를 반영한 고급 효과
 */

// ===== 2025 디자인 트렌드 =====
export interface DesignTrend {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  implementation: string;
  css: string;
  bestFor: string[];
  intensity: 'subtle' | 'moderate' | 'bold';
}

export const TRENDS_2025: DesignTrend[] = [
  {
    id: 'bento-grid',
    name: 'Bento Grid',
    nameKo: '벤토 그리드',
    description: '다양한 크기의 카드가 조화롭게 배치된 그리드',
    implementation: 'CSS Grid with varying spans',
    css: `display: grid;
grid-template-columns: repeat(4, 1fr);
gap: 16px;
/* 카드별 grid-column/row span 다르게 */`,
    bestFor: ['대시보드', 'Features', '포트폴리오'],
    intensity: 'moderate',
  },
  {
    id: 'glassmorphism-2025',
    name: 'Modern Glassmorphism',
    nameKo: '모던 글래스모피즘',
    description: '더 정교해진 유리 효과, 미묘한 색상 반사',
    implementation: 'Backdrop blur + gradient border',
    css: `background: rgba(255, 255, 255, 0.6);
backdrop-filter: blur(20px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.3);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);`,
    bestFor: ['카드', '모달', '내비게이션'],
    intensity: 'moderate',
  },
  {
    id: 'aurora-gradient',
    name: 'Aurora Gradient',
    nameKo: '오로라 그라디언트',
    description: '오로라처럼 유동적인 멀티컬러 그라디언트',
    implementation: 'Multi-stop gradient with animation',
    css: `background: linear-gradient(
  135deg,
  #667eea 0%,
  #764ba2 25%,
  #6B8DD6 50%,
  #8E37D7 75%,
  #667eea 100%
);
background-size: 400% 400%;
animation: aurora 15s ease infinite;`,
    bestFor: ['Hero 배경', 'CTA 배경', '프리미엄 섹션'],
    intensity: 'bold',
  },
  {
    id: 'mesh-gradient',
    name: 'Mesh Gradient',
    nameKo: '메쉬 그라디언트',
    description: '여러 색상이 유기적으로 섞인 그라디언트',
    implementation: 'Multiple radial gradients layered',
    css: `background: 
  radial-gradient(at 40% 20%, #FFE4E1 0px, transparent 50%),
  radial-gradient(at 80% 0%, #E0E7FF 0px, transparent 50%),
  radial-gradient(at 0% 50%, #FEF3C7 0px, transparent 50%),
  radial-gradient(at 80% 50%, #DBEAFE 0px, transparent 50%),
  radial-gradient(at 0% 100%, #FCE7F3 0px, transparent 50%);
background-color: #FFFFFF;`,
    bestFor: ['배경', 'Hero', '카드'],
    intensity: 'moderate',
  },
  {
    id: 'noise-texture',
    name: 'Noise Texture',
    nameKo: '노이즈 텍스처',
    description: '미세한 노이즈로 깊이감 추가',
    implementation: 'SVG noise filter overlay',
    css: `position: relative;
&::after {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.03;
  pointer-events: none;
}`,
    bestFor: ['배경', '카드', '섹션'],
    intensity: 'subtle',
  },
  {
    id: 'glow-effect',
    name: 'Soft Glow',
    nameKo: '소프트 글로우',
    description: '부드러운 발광 효과',
    implementation: 'Multiple box-shadows with color',
    css: `box-shadow: 
  0 0 20px rgba(59, 130, 246, 0.3),
  0 0 40px rgba(59, 130, 246, 0.2),
  0 0 60px rgba(59, 130, 246, 0.1);`,
    bestFor: ['CTA 버튼', '하이라이트', '액센트'],
    intensity: 'moderate',
  },
  {
    id: 'floating-elements',
    name: 'Floating Elements',
    nameKo: '플로팅 요소',
    description: '미세하게 떠다니는 듯한 애니메이션',
    implementation: 'Keyframe animation with transform',
    css: `animation: float 6s ease-in-out infinite;

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}`,
    bestFor: ['아이콘', '일러스트', '배경 요소'],
    intensity: 'subtle',
  },
  {
    id: 'scroll-reveal',
    name: 'Scroll Reveal',
    nameKo: '스크롤 리빌',
    description: '스크롤 시 요소가 나타나는 효과',
    implementation: 'Intersection Observer + CSS animation',
    css: `.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}`,
    bestFor: ['섹션', '카드', '리스트'],
    intensity: 'moderate',
  },
  {
    id: 'morphing-shapes',
    name: 'Morphing Shapes',
    nameKo: '모핑 셰이프',
    description: '부드럽게 변형되는 유기적 형태',
    implementation: 'SVG or CSS border-radius animation',
    css: `border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
animation: morph 8s ease-in-out infinite;

@keyframes morph {
  0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
}`,
    bestFor: ['배경 장식', '아바타', '히어로'],
    intensity: 'moderate',
  },
  {
    id: 'grain-overlay',
    name: 'Film Grain',
    nameKo: '필름 그레인',
    description: '빈티지 필름 느낌의 미세 입자',
    implementation: 'Animated noise overlay',
    css: `&::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("grain.png");
  opacity: 0.08;
  animation: grain 0.5s steps(10) infinite;
}`,
    bestFor: ['사진 배경', '아티스틱', '레트로'],
    intensity: 'subtle',
  },
];

// ===== 마이크로 인터랙션 =====
export interface MicroInteraction {
  id: string;
  name: string;
  trigger: string;
  effect: string;
  css: string;
  duration: string;
}

export const MICRO_INTERACTIONS: MicroInteraction[] = [
  {
    id: 'button-lift',
    name: '버튼 리프트',
    trigger: 'hover',
    effect: '살짝 떠오르며 그림자 증가',
    css: `transition: transform 0.2s, box-shadow 0.2s;
&:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}`,
    duration: '200ms',
  },
  {
    id: 'card-tilt',
    name: '카드 틸트',
    trigger: 'hover',
    effect: '3D 틸트 효과',
    css: `transition: transform 0.3s;
perspective: 1000px;
&:hover {
  transform: rotateX(5deg) rotateY(-5deg);
}`,
    duration: '300ms',
  },
  {
    id: 'image-zoom',
    name: '이미지 줌',
    trigger: 'hover',
    effect: '이미지가 부드럽게 확대',
    css: `overflow: hidden;
img {
  transition: transform 0.4s ease;
}
&:hover img {
  transform: scale(1.05);
}`,
    duration: '400ms',
  },
  {
    id: 'underline-grow',
    name: '언더라인 그로우',
    trigger: 'hover',
    effect: '밑줄이 중앙에서 확장',
    css: `position: relative;
&::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: currentColor;
  transition: width 0.3s, left 0.3s;
}
&:hover::after {
  width: 100%;
  left: 0;
}`,
    duration: '300ms',
  },
  {
    id: 'icon-bounce',
    name: '아이콘 바운스',
    trigger: 'hover',
    effect: '아이콘이 튀어오름',
    css: `&:hover .icon {
  animation: bounce 0.5s ease;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}`,
    duration: '500ms',
  },
  {
    id: 'text-reveal',
    name: '텍스트 리빌',
    trigger: 'scroll/load',
    effect: '글자가 아래에서 나타남',
    css: `.char {
  display: inline-block;
  opacity: 0;
  transform: translateY(20px);
  animation: charReveal 0.5s ease forwards;
}
@keyframes charReveal {
  to { opacity: 1; transform: translateY(0); }
}`,
    duration: '500ms per char',
  },
  {
    id: 'ripple-click',
    name: '리플 클릭',
    trigger: 'click',
    effect: '클릭 지점에서 물결 효과',
    css: `position: relative;
overflow: hidden;
.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.5);
  animation: ripple 0.6s linear;
}
@keyframes ripple {
  from { transform: scale(0); opacity: 1; }
  to { transform: scale(4); opacity: 0; }
}`,
    duration: '600ms',
  },
];

// ===== 섹션 전환 효과 =====
export interface SectionTransition {
  id: string;
  name: string;
  type: 'divider' | 'overlap' | 'gradient';
  css: string;
}

export const SECTION_TRANSITIONS: SectionTransition[] = [
  {
    id: 'wave-divider',
    name: '웨이브 디바이더',
    type: 'divider',
    css: `&::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 80px;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 1440 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill='%23FFFFFF' d='M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z'/%3E%3C/svg%3E");
  background-size: cover;
}`,
  },
  {
    id: 'angle-divider',
    name: '앵글 디바이더',
    type: 'divider',
    css: `clip-path: polygon(0 0, 100% 0, 100% calc(100% - 60px), 0 100%);
margin-bottom: -60px;`,
  },
  {
    id: 'gradient-fade',
    name: '그라디언트 페이드',
    type: 'gradient',
    css: `&::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120px;
  background: linear-gradient(to bottom, transparent, var(--next-section-bg));
}`,
  },
  {
    id: 'overlap-card',
    name: '오버랩 카드',
    type: 'overlap',
    css: `position: relative;
z-index: 1;
margin-bottom: -80px;
padding-bottom: 120px;`,
  },
];

// ===== 텍스트 효과 =====
export interface TextEffect {
  id: string;
  name: string;
  effect: string;
  css: string;
  bestFor: string[];
}

export const TEXT_EFFECTS: TextEffect[] = [
  {
    id: 'gradient-text',
    name: '그라디언트 텍스트',
    effect: '텍스트에 그라디언트 적용',
    css: `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;`,
    bestFor: ['헤드라인', '강조 문구', '브랜드명'],
  },
  {
    id: 'text-shadow-glow',
    name: '텍스트 글로우',
    effect: '텍스트 주변에 발광 효과',
    css: `text-shadow: 
  0 0 10px rgba(59, 130, 246, 0.5),
  0 0 20px rgba(59, 130, 246, 0.3),
  0 0 30px rgba(59, 130, 246, 0.2);`,
    bestFor: ['다크 모드', '히어로 타이틀', 'CTA'],
  },
  {
    id: 'text-stroke',
    name: '아웃라인 텍스트',
    effect: '텍스트 외곽선만 표시',
    css: `-webkit-text-stroke: 2px currentColor;
-webkit-text-fill-color: transparent;`,
    bestFor: ['디자인 요소', '백그라운드 텍스트', '장식'],
  },
  {
    id: 'text-highlight',
    name: '하이라이트 텍스트',
    effect: '형광펜 효과',
    css: `background: linear-gradient(120deg, #FEF08A 0%, #FEF08A 100%);
background-repeat: no-repeat;
background-size: 100% 40%;
background-position: 0 85%;`,
    bestFor: ['강조', '키워드', '중요 문구'],
  },
];

// ===== 헬퍼 함수 =====
export function getTrendById(id: string): DesignTrend | undefined {
  return TRENDS_2025.find(t => t.id === id);
}

export function getTrendsByIntensity(intensity: 'subtle' | 'moderate' | 'bold'): DesignTrend[] {
  return TRENDS_2025.filter(t => t.intensity === intensity);
}

export function getMicroInteractionByTrigger(trigger: string): MicroInteraction[] {
  return MICRO_INTERACTIONS.filter(m => m.trigger === trigger);
}

export function getSubtleEffects(): DesignTrend[] {
  return TRENDS_2025.filter(t => t.intensity === 'subtle');
}

export function getBoldEffects(): DesignTrend[] {
  return TRENDS_2025.filter(t => t.intensity === 'bold');
}

export function getTextEffectById(id: string): TextEffect | undefined {
  return TEXT_EFFECTS.find(t => t.id === id);
}
