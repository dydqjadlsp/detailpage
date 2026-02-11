'use client';

import type { BaseSectionProps, TestimonialItem } from '../types';
import { SectionWrapper } from '../SectionWrapper';

interface TestimonialsSectionProps extends BaseSectionProps {
    items: TestimonialItem[];
}

export function TestimonialsSection({
    title,
    subtitle,
    items = [],
    backgroundColor,
    textColor,
}: TestimonialsSectionProps) {
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

                <div className="grid md:grid-cols-2 gap-8">
                    {items.map((item, i) => {
                        const initial = (item.name || '?').charAt(0).toUpperCase();
                        const hues = [220, 260, 330, 180, 30, 150];
                        const hue = hues[i % hues.length];

                        return (
                            <div
                                key={i}
                                className="p-7 rounded-2xl border transition-all duration-300 hover:shadow-lg"
                                style={{
                                    borderColor: textColor ? `${textColor}12` : 'rgba(0,0,0,0.06)',
                                    backgroundColor: textColor ? `${textColor}04` : 'rgba(0,0,0,0.02)',
                                }}
                            >
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg key={star} className="w-5 h-5" viewBox="0 0 20 20" fill={`hsl(${45}, 90%, 55%)`}>
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>

                                <p className="leading-relaxed mb-5 opacity-80 italic">
                                    &ldquo;{item.content}&rdquo;
                                </p>

                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                        style={{ background: `linear-gradient(135deg, hsl(${hue}, 70%, 55%), hsl(${hue + 30}, 70%, 45%))` }}
                                    >
                                        {initial}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{item.name}</p>
                                        <p className="text-xs opacity-55">{item.role}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </SectionWrapper>
    );
}
