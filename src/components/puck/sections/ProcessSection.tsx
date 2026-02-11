'use client';

import type { BaseSectionProps, ProcessItem } from '../types';
import { SectionWrapper } from '../SectionWrapper';

interface ProcessSectionProps extends BaseSectionProps {
    items: ProcessItem[];
}

export function ProcessSection({
    title,
    subtitle,
    items = [],
    backgroundColor,
    textColor,
}: ProcessSectionProps) {
    return (
        <SectionWrapper backgroundColor={backgroundColor} textColor={textColor}>
            <div className="max-w-4xl mx-auto px-6 py-20">
                {title && (
                    <div className="text-center mb-14">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h2>
                        {subtitle && (
                            <p className="text-lg max-w-2xl mx-auto opacity-70">{subtitle}</p>
                        )}
                    </div>
                )}

                <div className="relative">
                    <div
                        className="absolute left-6 top-0 bottom-0 w-0.5"
                        style={{
                            backgroundColor: textColor ? `${textColor}15` : 'rgba(0,0,0,0.08)',
                        }}
                    />

                    <div className="space-y-10">
                        {items.map((item, i) => (
                            <div key={i} className="relative flex gap-6 pl-1">
                                <div
                                    className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 shadow-lg"
                                    style={{
                                        background: backgroundColor
                                            ? `linear-gradient(135deg, ${backgroundColor}, ${textColor || '#333'})`
                                            : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        color: '#ffffff',
                                    }}
                                >
                                    {i + 1}
                                </div>
                                <div className="pt-2">
                                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                    <p className="text-sm leading-relaxed opacity-65">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </SectionWrapper>
    );
}
