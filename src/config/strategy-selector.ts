/**
 * Strategy Selector - 카테고리+섹션 조합에 따라 최적 전략을 선택적으로 주입하는 엔진
 * 토큰 관리를 위해 전체 전략을 다 넣지 않고, 가장 관련 높은 전략만 골라서 프롬프트에 주입한다.
 * 출력: ~400-500 토큰 분량의 전략 가이드 텍스트
 */

import { getAntiPatternsForSection, getTopAntiPatternRules } from './strategy-antipatterns';
import { getNarrativeElementsForSection } from './strategy-narrative';
import { getCustomerLanguageExamples, getPriceResistanceFlow } from './strategy-usp';
import { getCategoryPhrases, getAllPrincipleIds } from './strategy-psychology-extended';

// ===== 카테고리별 최우선 심리 전략 (효과 순서) =====
export const CATEGORY_STRATEGY_PRIORITY: Record<string, string[]> = {
  ecommerce: ['social-proof', 'anchoring', 'loss-aversion', 'bandwagon', 'caligula-effect', 'cocktail-party'],
  realestate: ['scarcity', 'anchoring', 'veblen-snob', 'social-proof', 'loss-aversion', 'fear-appeal'],
  medical: ['authority', 'social-proof', 'fear-appeal', 'status-quo-bias', 'underdog', 'peak-end'],
  education: ['social-proof', 'commitment', 'cocktail-party', 'bandwagon', 'loss-aversion', 'anchoring'],
  restaurant: ['mehrabian', 'social-proof', 'reciprocity', 'underdog', 'cocktail-party', 'peak-end'],
  travel: ['mehrabian', 'scarcity', 'veblen-snob', 'caligula-effect', 'peak-end', 'loss-aversion'],
  wedding: ['peak-end', 'veblen-snob', 'mehrabian', 'social-proof', 'liking', 'authority'],
  legal: ['authority', 'social-proof', 'fear-appeal', 'status-quo-bias', 'underdog', 'commitment'],
  fitness: ['social-proof', 'commitment', 'loss-aversion', 'cocktail-party', 'caligula-effect', 'anchoring'],
  saas: ['social-proof', 'anchoring', 'reciprocity', 'status-quo-bias', 'commitment', 'loss-aversion'],
  personal: ['authority', 'liking', 'social-proof', 'underdog', 'cocktail-party', 'veblen-snob'],
};

// ===== 섹션별 최적 심리 전략 =====
export const SECTION_STRATEGY_MAP: Record<string, string[]> = {
  Hero: ['cocktail-party', 'mehrabian', 'status-quo-bias', 'caligula-effect'],
  Benefits: ['loss-aversion', 'fear-appeal', 'social-proof', 'anchoring'],
  Features: ['authority', 'mehrabian', 'underdog', 'commitment'],
  Testimonials: ['social-proof', 'bandwagon', 'underdog', 'liking'],
  CTA: ['loss-aversion', 'scarcity', 'peak-end', 'veblen-snob'],
  Pricing: ['anchoring', 'loss-aversion', 'reciprocity', 'veblen-snob'],
  FAQ: ['status-quo-bias', 'authority', 'commitment', 'fear-appeal'],
  Process: ['commitment', 'status-quo-bias', 'authority', 'social-proof'],
  Stats: ['social-proof', 'authority', 'anchoring', 'bandwagon'],
  Gallery: ['mehrabian', 'veblen-snob', 'peak-end', 'liking'],
  About: ['liking', 'underdog', 'authority', 'social-proof'],
  Team: ['authority', 'liking', 'social-proof', 'underdog'],
  Comparison: ['anchoring', 'loss-aversion', 'social-proof', 'authority'],
  Contact: ['reciprocity', 'commitment', 'status-quo-bias', 'liking'],
  TrustBadges: ['authority', 'social-proof', 'fear-appeal', 'commitment'],
  Urgency: ['scarcity', 'loss-aversion', 'caligula-effect', 'peak-end'],
  DetailedProduct: ['mehrabian', 'authority', 'underdog', 'anchoring'],
  Timeline: ['commitment', 'social-proof', 'authority', 'peak-end'],
  Partners: ['authority', 'social-proof', 'bandwagon', 'veblen-snob'],
  Portfolio: ['social-proof', 'authority', 'veblen-snob', 'peak-end'],
};

/**
 * 카테고리+섹션 배열 → ~400-500 토큰 분량의 전략 가이드 텍스트 생성
 * 프롬프트에 주입할 핵심 전략만 선별
 */
export function buildStrategyContext(category: string, sections: string[]): string {
  const lines: string[] = ['## 전략 가이드 (카테고리 최적화)'];

  // 1. 금지사항 (안티패턴) — 상위 2개만
  const topRules = getTopAntiPatternRules(2);
  if (topRules.length > 0) {
    lines.push('');
    lines.push('[금지사항]');
    for (const rule of topRules) {
      // 긴 규칙을 1줄로 축약
      const short = rule.length > 80 ? rule.substring(0, 80) + '…' : rule;
      lines.push(`- ${short}`);
    }
  }

  // 2. USP 고객 언어 변환 — 상위 3개
  const customerLang = getCustomerLanguageExamples(category);
  if (customerLang.length > 0) {
    lines.push('');
    lines.push('[USP 고객 언어 변환]');
    const top3 = customerLang.slice(0, 3);
    for (const example of top3) {
      lines.push(`- ${example}`);
    }
    lines.push('- 모든 기능 설명에 "고객이 느끼는 혜택" 1줄 추가');
  }

  // 3. 섹션별 설득 문구 — 카테고리+섹션 교집합 전략의 추천 문구
  const categoryPriority = CATEGORY_STRATEGY_PRIORITY[category] || CATEGORY_STRATEGY_PRIORITY.ecommerce;
  const allPrincipleIds = getAllPrincipleIds();

  const sectionPhrases: string[] = [];
  for (const section of sections) {
    const sectionStrategies = SECTION_STRATEGY_MAP[section] || [];
    // 카테고리 우선순위와 섹션 전략의 교집합에서 상위 2개
    const matched = categoryPriority.filter(s => sectionStrategies.includes(s)).slice(0, 2);
    if (matched.length === 0) continue;

    const phrases: string[] = [];
    for (const strategyId of matched) {
      if (!allPrincipleIds.includes(strategyId)) continue;
      const catPhrases = getCategoryPhrases(strategyId, category);
      if (catPhrases.length > 0) {
        phrases.push(catPhrases[0]); // 카테고리별 최적 문구 1개
      }
    }

    if (phrases.length > 0) {
      sectionPhrases.push(`- ${section}: ${phrases.map(p => `"${p}"`).join(' / ')}`);
    }
  }

  if (sectionPhrases.length > 0) {
    lines.push('');
    lines.push('[섹션별 설득 문구]');
    lines.push(...sectionPhrases);
  }

  // 4. 내러티브 요소 — Hero/Benefits/CTA에 해당하는 것만 핵심 1줄
  const narrativeKeywords: string[] = [];
  for (const section of ['Hero', 'Benefits', 'CTA']) {
    if (!sections.includes(section)) continue;
    const narratives = getNarrativeElementsForSection(section);
    if (narratives.length > 0) {
      const top = narratives[0];
      narrativeKeywords.push(`${section}: ${top.name}`);
    }
  }
  if (narrativeKeywords.length > 0) {
    lines.push('');
    lines.push('[내러티브 흐름]');
    lines.push(`- ${narrativeKeywords.join(' → ')}`);
  }

  // 5. 핵심 메시지 반복 규칙
  const hasHero = sections.includes('Hero');
  const hasBenefits = sections.includes('Benefits');
  const hasCTA = sections.includes('CTA');
  if (hasHero && hasBenefits && hasCTA) {
    lines.push('');
    lines.push('[핵심 메시지 반복]');
    lines.push('- Hero(질문형), Benefits(선언형), CTA(감성형) 3곳에 USP 반복 — 형태만 바꿔 자연스럽게 각인');
  }

  // 6. 가격 저항 전략 — Pricing/CTA 섹션이 있으면 4단계 흐름 요약
  const hasPricing = sections.includes('Pricing');
  if (hasPricing || hasCTA) {
    const priceFlow = getPriceResistanceFlow(category);
    if (priceFlow) {
      lines.push('');
      lines.push('[가격 저항 돌파 4단계]');
      lines.push(`1. 불편함: "${priceFlow.step1_discomfort}"`);
      lines.push(`2. 해결책: "${priceFlow.step2_solution}"`);
      lines.push(`3. 납득: "${priceFlow.step3_justification}"`);
      lines.push(`4. 감성CTA: "${priceFlow.step4_emotionalCTA}"`);
    }
  }

  // 7. 섹션별 안티패턴 핵심 경고
  const sectionAntiWarnings: string[] = [];
  for (const section of sections.slice(0, 3)) {
    const aps = getAntiPatternsForSection(section);
    if (aps.length > 0) {
      const top = aps[0];
      sectionAntiWarnings.push(`${section}: ${top.mistake}→${top.reality.substring(0, 40)}`);
    }
  }
  if (sectionAntiWarnings.length > 0) {
    lines.push('');
    lines.push('[주의]');
    for (const w of sectionAntiWarnings) {
      lines.push(`- ${w}`);
    }
  }

  return lines.join('\n');
}

/**
 * 특정 섹션에 대한 간략한 전략 힌트 (1-2줄)
 * buildSectionGuide()에서 각 섹션 설명에 추가할 때 사용
 */
export function getSectionStrategyHint(category: string, section: string): string {
  const categoryPriority = CATEGORY_STRATEGY_PRIORITY[category] || CATEGORY_STRATEGY_PRIORITY.ecommerce;
  const sectionStrategies = SECTION_STRATEGY_MAP[section] || [];

  const matched = categoryPriority.filter(s => sectionStrategies.includes(s)).slice(0, 2);
  if (matched.length === 0) return '';

  const hints: string[] = [];
  for (const strategyId of matched) {
    const catPhrases = getCategoryPhrases(strategyId, category);
    if (catPhrases.length > 0) {
      hints.push(`"${catPhrases[0]}"`);
    }
  }

  return hints.length > 0 ? `   추천 문구: ${hints.join(' | ')}` : '';
}
