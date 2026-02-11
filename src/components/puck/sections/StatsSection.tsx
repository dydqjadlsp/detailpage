'use client';

import type { BaseSectionProps, StatItem } from '../types';
import { SectionWrapper } from '../SectionWrapper';

interface StatsSectionProps extends BaseSectionProps {
    items: StatItem[];
}

export function StatsSection({
    title,
    subtitle,
    items = [],
    backgroundColor,
    textColor,
}: StatsSectionProps) {
    return (
        <SectionWrapper backgroundColor={backgroundColor} textColor={textColor}>
            <div className="max-w-6xl mx-auto px-6 py-20">
                {title && (
                    <div className="text-center mb-14">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h2>
                        {subtitle && (
                            <p className="text-lg max-w-2xl mx-auto opacity-70">{subtitle}</p>
                        )}
                    </div>
                )}

                <div className={`grid ${items.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : items.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-8`}>
                    {items.map((item, i) => (
                        <div key={i} className="text-center p-6">
                            <div
                                className="text-4xl sm:text-5xl font-extrabold mb-3"
                                style={{
                                    background: backgroundColor
                                        ? `linear-gradient(135deg, ${backgroundColor}, ${textColor || '#333'})`
                                        : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                {item.value}{item.suffix || ''}
                            </div>
                            <p className="text-sm font-medium opacity-65">{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </SectionWrapper>
    );
}
