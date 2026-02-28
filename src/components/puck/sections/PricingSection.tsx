'use client';

import type { BaseSectionProps, SectionItem } from '../types';
import { SectionWrapper, getContrastText } from '../SectionWrapper';

interface PricingSectionProps extends BaseSectionProps {
    items: SectionItem[];
}

function parsePricingItem(item: SectionItem) {
    const parts = (item.description || '').split('|');
    const price = parts[0]?.trim() || '';
    const features = parts[1]?.split(',').map(f => f.trim()).filter(Boolean) || [];
    const isRecommended = item.icon === 'recommended';
    return { name: item.title, price, features, isRecommended };
}

export function PricingSection({
    title,
    subtitle,
    items = [],
    backgroundColor,
    textColor,
}: PricingSectionProps) {
    const plans = items.map(parsePricingItem);

    if (plans.length === 0) {
        return (
            <SectionWrapper backgroundColor={backgroundColor} textColor={textColor}>
                <div className="max-w-6xl mx-auto px-6 py-20 text-center">
                    {title && <h2 className="text-3xl sm:text-4xl font-bold">{title}</h2>}
                </div>
            </SectionWrapper>
        );
    }

    return (
        <SectionWrapper backgroundColor={backgroundColor} textColor={textColor}>
            <div className="max-w-6xl mx-auto px-6 py-20">
                <div className="text-center mb-14">
                    {title && <h2 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h2>}
                    {subtitle && <p className="text-lg max-w-2xl mx-auto opacity-70">{subtitle}</p>}
                </div>

                <div className={`grid gap-6 ${plans.length <= 2 ? 'sm:grid-cols-2 max-w-3xl mx-auto' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                    {plans.map((plan, i) => (
                        <div
                            key={i}
                            className={`relative flex flex-col rounded-2xl border-2 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                                plan.isRecommended ? 'scale-105 shadow-lg' : ''
                            }`}
                            style={{
                                borderColor: plan.isRecommended
                                    ? (textColor || '#6366f1')
                                    : (textColor ? `${textColor}20` : 'rgba(0,0,0,0.1)'),
                                backgroundColor: plan.isRecommended
                                    ? (textColor ? `${textColor}08` : 'rgba(99,102,241,0.05)')
                                    : 'transparent',
                            }}
                        >
                            {plan.isRecommended && (
                                <div
                                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                                    style={{
                                        backgroundColor: textColor || '#6366f1',
                                        color: getContrastText(textColor || '#6366f1'),
                                    }}
                                >
                                    추천
                                </div>
                            )}

                            <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                            <div className="text-3xl font-extrabold mb-6">{plan.price}</div>

                            <div className="border-t mb-6" style={{ borderColor: textColor ? `${textColor}15` : 'rgba(0,0,0,0.08)' }} />

                            <ul className="flex-1 space-y-3 mb-8">
                                {plan.features.map((feature, j) => (
                                    <li key={j} className="flex items-start gap-2 text-sm">
                                        <svg className="w-5 h-5 mt-0.5 flex-shrink-0 opacity-60" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span className="opacity-75">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:opacity-90"
                                style={{
                                    backgroundColor: plan.isRecommended ? (textColor || '#6366f1') : 'transparent',
                                    color: plan.isRecommended ? getContrastText(textColor || '#6366f1') : (textColor || '#6366f1'),
                                    border: plan.isRecommended ? 'none' : `2px solid ${textColor || '#6366f1'}`,
                                }}
                            >
                                선택하기
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </SectionWrapper>
    );
}
