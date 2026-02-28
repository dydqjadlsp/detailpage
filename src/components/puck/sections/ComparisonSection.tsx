'use client';

import type { BaseSectionProps, SectionItem } from '../types';
import { SectionWrapper, getContrastText } from '../SectionWrapper';

interface ComparisonSectionProps extends BaseSectionProps {
    items: SectionItem[];
}

export function ComparisonSection({
    title,
    subtitle,
    items = [],
    backgroundColor,
    textColor,
}: ComparisonSectionProps) {
    if (items.length === 0) {
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
            <div className="max-w-4xl mx-auto px-6 py-20">
                <div className="text-center mb-14">
                    {title && <h2 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h2>}
                    {subtitle && <p className="text-lg max-w-2xl mx-auto opacity-70">{subtitle}</p>}
                </div>

                <div className="rounded-2xl overflow-hidden border" style={{ borderColor: textColor ? `${textColor}15` : 'rgba(0,0,0,0.08)' }}>
                    {/* 헤더 */}
                    <div className="grid grid-cols-3 gap-0">
                        <div className="p-4 font-bold text-sm opacity-60">비교 항목</div>
                        <div className="p-4 text-center font-bold text-sm opacity-50" style={{ backgroundColor: textColor ? `${textColor}05` : 'rgba(0,0,0,0.02)' }}>
                            기존 방식
                        </div>
                        <div
                            className="p-4 text-center font-bold text-sm"
                            style={{
                                backgroundColor: textColor || '#6366f1',
                                color: getContrastText(textColor || '#6366f1'),
                            }}
                        >
                            우리 제품
                        </div>
                    </div>

                    {/* 비교 행 */}
                    {items.map((item, i) => {
                        const isCheck = item.icon !== 'x';
                        return (
                            <div
                                key={i}
                                className="grid grid-cols-3 gap-0 border-t"
                                style={{ borderColor: textColor ? `${textColor}10` : 'rgba(0,0,0,0.06)' }}
                            >
                                <div className="p-4 text-sm font-medium">{item.title}</div>
                                <div
                                    className="p-4 flex items-center justify-center"
                                    style={{ backgroundColor: textColor ? `${textColor}03` : 'rgba(0,0,0,0.01)' }}
                                >
                                    <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="p-4 flex items-center justify-center gap-2" style={{ backgroundColor: isCheck ? (textColor ? `${textColor}08` : 'rgba(99,102,241,0.05)') : 'transparent' }}>
                                    {isCheck ? (
                                        <svg className="w-5 h-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    {item.description && (
                                        <span className="text-xs opacity-65">{item.description}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </SectionWrapper>
    );
}
