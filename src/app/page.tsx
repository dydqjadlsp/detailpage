'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Paintbrush,
  Workflow,
  ShoppingBag,
  Building2,
  Stethoscope,
  GraduationCap,
  UtensilsCrossed,
  Plane,
  Lock,
  Eye,
  Server,
  ArrowRight,
  Quote,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const SERVICES = [
  {
    icon: Sparkles,
    label: 'AI 자동 생성',
    title: '업종별 맞춤 상세페이지를 자동으로 생성합니다',
    description: '카테고리를 선택하고 핵심 정보만 입력하면, AI가 업종 특성에 맞는 전문가급 상세페이지를 설계하고 카피를 작성합니다. 수십 시간의 작업을 단 몇 분으로 압축합니다.',
  },
  {
    icon: Paintbrush,
    label: '실시간 편집',
    title: '생성된 결과물을 자유롭게 수정하고 다듬습니다',
    description: 'Puck 에디터 기반의 비주얼 편집 도구로 드래그 앤 드롭 수정이 가능합니다. 자연어로 수정 요청을 보내면 AI가 즉시 반영하는 Vibe Coding도 지원합니다.',
  },
  {
    icon: Workflow,
    label: '워크플로우 자동화',
    title: '생성부터 배포까지 전체 과정을 자동화합니다',
    description: '프로젝트 관리, 버전 이력, HTML 추출 및 배포까지 원스톱으로 처리합니다. 반복적인 작업을 제거하고 핵심 의사결정에만 집중할 수 있습니다.',
  },
];

const CATEGORIES = [
  { icon: ShoppingBag, label: '이커머스', description: '상품 상세페이지' },
  { icon: Building2, label: '부동산', description: '매물 소개' },
  { icon: Stethoscope, label: '의료', description: '병원 홍보' },
  { icon: GraduationCap, label: '교육', description: '강의 랜딩' },
  { icon: UtensilsCrossed, label: '외식', description: '맛집 소개' },
  { icon: Plane, label: '여행', description: '여행 상품' },
];

const TESTIMONIALS = [
  {
    content: 'AutoPage로 상세페이지 제작 시간을 90% 이상 줄였습니다. AI가 업종 특성을 정확히 파악해서 전환율 높은 카피를 바로 뽑아줍니다. 이제 디자인 에이전시 없이도 충분합니다.',
    name: '김도현',
    role: '이커머스 사업부 팀장',
  },
  {
    content: 'AutoPage는 단순한 페이지 빌더가 아닙니다. AI가 고객 심리를 이해하고 설득 구조를 설계합니다. 도입 한 달 만에 전환율이 40% 올랐고, 운영 비용은 절반으로 줄었습니다.',
    name: '박서연',
    role: '스타트업 CEO',
  },
];

const SECURITY_ITEMS = [
  {
    icon: Lock,
    title: '데이터 암호화',
    description: '전송 및 저장 시 업계 최고 수준의 암호화 적용',
  },
  {
    icon: Eye,
    title: '접근 제어',
    description: '적절한 권한을 가진 사용자만 데이터에 접근 가능',
  },
  {
    icon: Server,
    title: '클라우드 보안',
    description: '보안 클라우드 아키텍처 기반 24시간 모니터링',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-44 lg:pb-36">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-4xl"
          >
            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-balance"
            >
              AI가 설계하는
              <br />
              <span className="text-[rgb(var(--color-text-secondary))]">
                전문가급 상세페이지
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-8 text-lg md:text-xl text-[rgb(var(--color-text-secondary))] max-w-2xl leading-relaxed"
            >
              업종별 맞춤 분석부터 설득 카피 작성, 시각 설계까지.
              <br />
              수십 시간의 작업을 몇 분으로 압축합니다.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
              <Link href="/signup" className="btn-primary text-base px-8 py-3.5">
                지금 시작하기
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="#features" className="btn-secondary text-base px-8 py-3.5">
                서비스 알아보기
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8"><div className="divider" /></div>

      {/* Services Section */}
      <section id="features" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
          >
            <motion.span variants={fadeUp} className="section-label">
              AutoPage의 핵심 기능
            </motion.span>

            <motion.div variants={fadeUp} className="mt-16 space-y-0">
              {SERVICES.map((service, index) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={service.label}
                    variants={fadeUp}
                    className="group border-t border-[rgb(var(--color-border))] py-12 lg:py-16"
                  >
                    <div className="grid lg:grid-cols-12 gap-6 lg:gap-12 items-start">
                      <div className="lg:col-span-1">
                        <span className="text-sm font-mono text-[rgb(var(--color-text-tertiary))]">
                          0{index + 1}
                        </span>
                      </div>
                      <div className="lg:col-span-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Icon className="w-5 h-5 text-[rgb(var(--color-text-tertiary))]" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--color-text-tertiary))]">
                            {service.label}
                          </span>
                        </div>
                        <h3 className="text-xl lg:text-2xl font-semibold leading-snug text-white">
                          {service.title}
                        </h3>
                      </div>
                      <div className="lg:col-span-7">
                        <p className="text-[rgb(var(--color-text-secondary))] leading-relaxed text-base lg:text-lg">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8"><div className="divider" /></div>

      {/* Categories Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
          >
            <motion.span variants={fadeUp} className="section-label">
              지원 업종
            </motion.span>
            <motion.h2 variants={fadeUp} className="section-title mt-4">
              11개 이상의 업종에
              <br />
              최적화된 템플릿
            </motion.h2>
            <motion.p variants={fadeUp} className="section-subtitle mt-6">
              각 업종의 고객 심리와 구매 동선을 분석한 전문 템플릿으로 시작합니다.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div
                    key={cat.label}
                    className="card p-6 text-center group cursor-pointer hover:bg-[rgb(var(--color-surface-hover))] transition-colors"
                  >
                    <Icon className="w-6 h-6 mx-auto mb-3 text-[rgb(var(--color-text-tertiary))] group-hover:text-white transition-colors" />
                    <p className="text-sm font-semibold text-white mb-1">{cat.label}</p>
                    <p className="text-xs text-[rgb(var(--color-text-tertiary))]">{cat.description}</p>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8"><div className="divider" /></div>

      {/* Use Cases / Blog Section */}
      <section id="cases" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
          >
            <motion.span variants={fadeUp} className="section-label">
              활용 사례
            </motion.span>
            <motion.h2 variants={fadeUp} className="section-title mt-4">
              실제 비즈니스에서
              <br />
              검증된 결과
            </motion.h2>

            <motion.div variants={fadeUp} className="mt-16 grid md:grid-cols-3 gap-6">
              {[
                {
                  title: '이커머스 상품 상세페이지 자동 생성으로 전환율 2.4배 향상',
                  description: 'AI 기반 설득 카피와 시각 구조 설계로 고객의 구매 결정을 가속화합니다.',
                  tag: '이커머스',
                },
                {
                  title: '부동산 매물 소개 페이지 제작 시간 90% 절감',
                  description: '매물 정보만 입력하면 투자 가치와 입지 조건을 강조한 고급 소개 페이지가 완성됩니다.',
                  tag: '부동산',
                },
                {
                  title: 'Vibe Coding으로 디자인 수정 비용 제로화',
                  description: '자연어로 수정 요청만 보내면 AI가 즉시 반영합니다. 디자이너 없이도 원하는 결과를 얻습니다.',
                  tag: 'Vibe Coding',
                },
              ].map((item) => (
                <div key={item.title} className="card p-8 flex flex-col justify-between group cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider">
                      {item.tag}
                    </span>
                    <h3 className="text-lg font-semibold text-white mt-4 mb-3 leading-snug group-hover:text-[rgb(var(--color-primary))] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[rgb(var(--color-text-secondary))] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-sm text-[rgb(var(--color-text-tertiary))] group-hover:text-white transition-colors">
                    자세히 보기 <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8"><div className="divider" /></div>

      {/* Testimonials Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
          >
            <motion.span variants={fadeUp} className="section-label">
              고객 후기
            </motion.span>
            <motion.h2 variants={fadeUp} className="section-title mt-4">
              파트너들의 이야기
            </motion.h2>

            <motion.div variants={fadeUp} className="mt-16 grid md:grid-cols-2 gap-8">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="card p-10">
                  <Quote className="w-8 h-8 text-[rgb(var(--color-border-hover))] mb-6" />
                  <p className="text-lg text-[rgb(var(--color-text-secondary))] leading-relaxed mb-8">
                    {t.content}
                  </p>
                  <div>
                    <p className="font-semibold text-white">{t.name}</p>
                    <p className="text-sm text-[rgb(var(--color-text-tertiary))] mt-0.5">{t.role}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8"><div className="divider" /></div>

      {/* Security Section */}
      <section id="security" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
          >
            <motion.span variants={fadeUp} className="section-label">
              보안
            </motion.span>
            <motion.h2 variants={fadeUp} className="section-title mt-4">
              엔터프라이즈급 보안
            </motion.h2>

            <motion.div variants={fadeUp} className="mt-16 grid md:grid-cols-3 gap-8">
              {SECURITY_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-5">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[rgb(var(--color-text-tertiary))]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                      <p className="text-sm text-[rgb(var(--color-text-secondary))] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8"><div className="divider" /></div>

      {/* CTA Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
            className="max-w-3xl"
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-5xl font-bold leading-tight tracking-tight"
            >
              지금 바로 시작하세요.
              <br />
              <span className="text-[rgb(var(--color-text-secondary))]">
                첫 프로젝트는 무료입니다.
              </span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="mt-6 text-lg text-[rgb(var(--color-text-secondary))] leading-relaxed"
            >
              카드 등록 없이 바로 체험할 수 있습니다.
              AI가 만드는 상세페이지의 품질을 직접 확인해보세요.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
              <Link href="/signup" className="btn-primary text-base px-8 py-3.5">
                무료로 시작하기
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="mt-6 text-sm text-[rgb(var(--color-text-tertiary))]"
            >
              문의: contact@autopage.ai
            </motion.p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
