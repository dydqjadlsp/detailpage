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

                <div className="space-y-8">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-start gap-5">
                            <span
                                className="text-4xl font-extrabold shrink-0 leading-none mt-1 tabular-nums"
                                style={{
                                    color: textColor || '#6366f1',
                                    opacity: 0.25,
                                }}
                            >
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <div
                                className="flex-1 pb-8"
                                style={{
                                    borderBottom: i < items.length - 1
                                        ? `1px solid ${textColor ? `${textColor}12` : 'rgba(0,0,0,0.06)'}`
                                        : 'none',
                                }}
                            >
                                <h3 className="text-lg font-bold mb-1.5">{item.title}</h3>
                                <p className="text-sm leading-relaxed opacity-65">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </SectionWrapper>
    );
}
