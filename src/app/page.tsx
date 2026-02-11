"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Code, LayoutTemplate } from "lucide-react";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { BentoGrid, BentoGridItem } from "@/components/ui/BentoGrid";
import { Meteors } from "@/components/ui/Meteors";
import { useState, useEffect } from "react";

const CATEGORIES = [
  {
    title: "이커머스",
    description: "전환율이 40% 더 높은 상품 상세페이지",
    header: (
      <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-white/5" />
    ),
    icon: <Sparkles className="h-4 w-4 text-violet-400" />,
  },
  {
    title: "스타트업 & SaaS",
    description: "혁신적인 기능을 명료하게 전달하는 소개 페이지",
    header: (
      <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-white/5" />
    ),
    icon: <Zap className="h-4 w-4 text-cyan-400" />,
  },
  {
    title: "전문가 프로필",
    description: "신뢰감을 주는 전문가 포트폴리오",
    header: (
      <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-white/5" />
    ),
    icon: <LayoutTemplate className="h-4 w-4 text-amber-400" />,
  },
  {
    title: "학원 & 교육",
    description: "수강생을 끌어모으는 강의 랜딩페이지",
    header: (
      <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-white/5" />
    ),
    icon: <Code className="h-4 w-4 text-emerald-400" />,
  },
];

const STATS = [
  { value: "5", unit: "min", label: "평균 생성 시간" },
  { value: "11", unit: "+", label: "산업별 카테고리" },
  { value: "50", unit: "+", label: "분석된 오픈소스" },
  { value: "0", unit: "won", label: "초기 비용" },
];

function TypewriterEffect() {
  const [typedText, setTypedText] = useState("");
  const targetText =
    "배경을 좀 더 신뢰감 있는 딥 네이비로 바꾸고, 헤드라인을 강조해줘.";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedText(targetText.slice(0, index));
      index++;
      if (index > targetText.length) {
        clearInterval(interval);
      }
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="font-mono text-sm text-green-400">
      <span className="text-neutral-500 mr-2">{">"}</span>
      {typedText}
      <span className="animate-pulse ml-0.5">|</span>
    </div>
  );
}

function CountUp({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count}</span>;
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      {/* ===== HERO ===== */}
      <AuroraBackground>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          className="relative flex flex-col gap-6 items-center justify-center px-4 z-10"
        >
          <div className="badge mb-2">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-violet-400" />
            AI-Powered Design Partner
          </div>

          <h1 className="text-4xl md:text-7xl font-bold text-white text-center tracking-tight leading-[1.1]">
            기획 2일, 디자인 3일...
            <br />
            이 모든 과정을{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400">
              단 5분으로.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-neutral-400 text-center max-w-2xl leading-relaxed">
            GitHub 50+ 오픈소스 분석 기반,
            <br className="hidden md:block" />
            검증된 데이터로 설계된{" "}
            <strong className="text-white">AI 디자인 파트너</strong>를
            만나세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Link
              href="/new"
              className="btn-primary text-base md:text-lg px-8 py-4"
            >
              <Sparkles className="w-5 h-5" />
              지금 무료로 시작하기
            </Link>
            <Link
              href="/dashboard"
              className="btn-secondary text-base md:text-lg px-8 py-4"
            >
              대시보드 이동
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </motion.div>
      </AuroraBackground>

      {/* ===== STATS BAR ===== */}
      <section className="border-y border-white/5 bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                <CountUp target={parseInt(stat.value)} />
                <span className="text-violet-400 text-2xl ml-1">
                  {stat.unit}
                </span>
              </div>
              <div className="text-sm text-neutral-500 mt-2">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES BENTO GRID ===== */}
      <section className="py-28 md:py-36 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.15),transparent)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <span className="section-label">비즈니스 맞춤 설계</span>
            <h2 className="section-title mt-4 mb-6">
              11가지 산업군에 최적화된
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                팔리는 구조
              </span>
            </h2>
            <p className="text-lg text-neutral-400 max-w-xl mx-auto">
              단순히 예쁜 페이지만 만들지 않습니다.
              <br />
              고객 심리를 관통하는 설득의 구조를 자동으로 설계합니다.
            </p>
          </motion.div>

          <BentoGrid>
            {CATEGORIES.map((item, i) => (
              <BentoGridItem
                key={i}
                title={item.title}
                description={item.description}
                header={item.header}
                icon={item.icon}
                className={i === 3 ? "md:col-span-2" : ""}
              />
            ))}
          </BentoGrid>
        </div>
      </section>

      {/* ===== VIBE CODING ===== */}
      <section className="py-28 md:py-36 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent pointer-events-none" />
        <Meteors number={15} />
        <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1 space-y-8"
          >
            <span className="section-label">바이브 코딩</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight">
              &quot;좀 더 신뢰감 있게 바꿔줘&quot;
              <br />
              <span className="text-neutral-400">
                말로 하면, AI가 디자인합니다.
              </span>
            </h2>
            <p className="text-lg text-neutral-400 leading-relaxed">
              복잡한 설정창을 뒤질 필요가 없습니다.
              <br />
              당신의 의도(Vibe)를 AI가 이해하고 디자인에 즉시 반영합니다.
            </p>

            <div className="p-6 rounded-2xl glass-card border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-xs text-neutral-600 ml-2 font-mono">
                  vibe-terminal
                </span>
              </div>
              <TypewriterEffect />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 relative w-full"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/30 to-cyan-500/30 rounded-2xl blur-3xl opacity-40" />
            <div className="relative rounded-2xl overflow-hidden glass-panel border border-white/10 aspect-[4/3] flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <p className="text-white font-medium text-lg">
                  AI가 디자인을 생성하고 있습니다...
                </p>
                <div className="flex justify-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"
                      style={{ animationDelay: `${i * 0.3}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-32 md:py-40 border-t border-white/5 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_110%,rgba(124,58,237,0.15),transparent)] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight leading-tight">
              전문가급 상세페이지,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400">
                오늘 바로 소유하세요.
              </span>
            </h2>
            <p className="text-xl text-neutral-400 mb-12 leading-relaxed">
              카드 등록 없이 무료로 시작할 수 있습니다.
            </p>
            <Link
              href="/new"
              className="inline-flex h-16 px-10 items-center justify-center rounded-full bg-white text-black text-lg font-bold tracking-tight hover:scale-105 transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.25)]"
            >
              지금 무료로 시작하기
              <ArrowRight className="ml-3 w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
