'use client';

import type { BaseSectionProps, SectionItem } from '../types';
import { SectionWrapper } from '../SectionWrapper';

interface TimelineSectionProps extends BaseSectionProps {
    items: SectionItem[];
}

export function TimelineSection({
    title,
    subtitle,
    items = [],
    backgroundColor,
    textColor,
}: TimelineSectionProps) {
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

                <div className="relative">
                    {/* 중앙 세로선 */}
                    <div
                        className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 hidden md:block"
                        style={{ backgroundColor: textColor ? `${textColor}20` : 'rgba(0,0,0,0.1)' }}
                    />
                    {/* 모바일 좌측선 */}
                    <div
                        className="absolute left-6 top-0 bottom-0 w-0.5 md:hidden"
                        style={{ backgroundColor: textColor ? `${textColor}20` : 'rgba(0,0,0,0.1)' }}
                    />

                    <div className="space-y-12">
                        {items.map((item, i) => {
                            const isLeft = i % 2 === 0;
                            return (
                                <div key={i} className="relative">
                                    {/* 중앙 점 (데스크탑) */}
                                    <div
                                        className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 z-10 hidden md:block"
                                        style={{
                                            borderColor: textColor || '#6366f1',
                                            backgroundColor: backgroundColor || '#ffffff',
                                            top: '1.5rem',
                                        }}
                                    />
                                    {/* 좌측 점 (모바일) */}
                                    <div
                                        className="absolute left-6 -translate-x-1/2 w-3 h-3 rounded-full z-10 md:hidden"
                                        style={{
                                            backgroundColor: textColor || '#6366f1',
                                            top: '0.5rem',
                                        }}
                                    />

                                    {/* 데스크탑 지그재그 */}
                                    <div className={`hidden md:grid md:grid-cols-2 gap-8 ${isLeft ? '' : 'direction-rtl'}`}>
                                        {isLeft ? (
                                            <>
                                                <div className="text-right pr-10">
                                                    <div
                                                        className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2"
                                                        style={{
                                                            backgroundColor: textColor ? `${textColor}15` : 'rgba(99,102,241,0.1)',
                                                            color: textColor || '#6366f1',
                                                        }}
                                                    >
                                                        {item.icon || `STEP ${i + 1}`}
                                                    </div>
                                                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                                    <p className="text-sm opacity-65 leading-relaxed">{item.description}</p>
                                                </div>
                                                <div />
                                            </>
                                        ) : (
                                            <>
                                                <div />
                                                <div className="pl-10">
                                                    <div
                                                        className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2"
                                                        style={{
                                                            backgroundColor: textColor ? `${textColor}15` : 'rgba(99,102,241,0.1)',
                                                            color: textColor || '#6366f1',
                                                        }}
                                                    >
                                                        {item.icon || `STEP ${i + 1}`}
                                                    </div>
                                                    <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                                    <p className="text-sm opacity-65 leading-relaxed">{item.description}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* 모바일 단일 열 */}
                                    <div className="md:hidden pl-12">
                                        <div
                                            className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2"
                                            style={{
                                                backgroundColor: textColor ? `${textColor}15` : 'rgba(99,102,241,0.1)',
                                                color: textColor || '#6366f1',
                                            }}
                                        >
                                            {item.icon || `STEP ${i + 1}`}
                                        </div>
                                        <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                        <p className="text-sm opacity-65 leading-relaxed">{item.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </SectionWrapper>
    );
}
