'use client';

import { useState } from 'react';
import type { BaseSectionProps } from '../types';
import { SectionWrapper } from '../SectionWrapper';

interface FAQItem {
    question?: string;
    title?: string;
    answer?: string;
    description?: string;
}

interface FAQSectionProps extends BaseSectionProps {
    items: FAQItem[];
}

export function FAQSection({
    title,
    subtitle,
    items = [],
    backgroundColor,
    textColor,
}: FAQSectionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <SectionWrapper backgroundColor={backgroundColor} textColor={textColor}>
            <div className="max-w-3xl mx-auto px-6 py-20">
                {title && (
                    <div className="text-center mb-14">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h2>
                        {subtitle && (
                            <p className="text-lg max-w-2xl mx-auto opacity-70">{subtitle}</p>
                        )}
                    </div>
                )}

                <div className="space-y-3">
                    {items.map((item, i) => {
                        const isOpen = openIndex === i;
                        const questionText = item.question || item.title || '';
                        const answerText = item.answer || item.description || '';

                        return (
                            <div
                                key={i}
                                className="rounded-xl border overflow-hidden transition-all duration-300"
                                style={{
                                    borderColor: textColor ? `${textColor}12` : 'rgba(0,0,0,0.08)',
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpenIndex(isOpen ? null : i)}
                                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-medium transition-colors duration-200"
                                    style={{
                                        backgroundColor: isOpen
                                            ? (textColor ? `${textColor}06` : 'rgba(0,0,0,0.03)')
                                            : 'transparent',
                                    }}
                                >
                                    <span className="text-base">{questionText}</span>
                                    <svg
                                        className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                <div
                                    className="overflow-hidden transition-all duration-300"
                                    style={{
                                        maxHeight: isOpen ? '500px' : '0',
                                        opacity: isOpen ? 1 : 0,
                                    }}
                                >
                                    <p className="px-6 pb-5 text-sm leading-relaxed opacity-70">
                                        {answerText}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </SectionWrapper>
    );
}
