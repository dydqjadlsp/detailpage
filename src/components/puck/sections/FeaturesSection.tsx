'use client';

import type { BaseSectionProps, SectionItem } from '../types';
import { SectionWrapper, SectionImage } from '../SectionWrapper';

interface FeaturesSectionProps extends BaseSectionProps {
    items: SectionItem[];
}

export function FeaturesSection({
    title,
    subtitle,
    items = [],
    backgroundColor,
    textColor,
    imageUrl,
}: FeaturesSectionProps) {
    return (
        <SectionWrapper backgroundColor={backgroundColor} textColor={textColor}>
            <div className="max-w-7xl mx-auto px-6 py-20">
                {imageUrl && (
                    <div className="mb-12">
                        <SectionImage src={imageUrl} alt={title || ''} className="shadow-lg" />
                    </div>
                )}

                <div className="text-center mb-14">
                    {title && (
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h2>
                    )}
                    {subtitle && (
                        <p className="text-lg max-w-2xl mx-auto opacity-70">{subtitle}</p>
                    )}
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map((item, i) => (
                        <div
                            key={i}
                            className="group relative p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            style={{
                                borderColor: textColor ? `${textColor}15` : 'rgba(0,0,0,0.08)',
                                backgroundColor: textColor ? `${textColor}05` : 'rgba(0,0,0,0.02)',
                            }}
                        >
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-xl font-bold transition-transform duration-300 group-hover:scale-110"
                                style={{
                                    background: backgroundColor
                                        ? `linear-gradient(135deg, ${backgroundColor}, ${textColor || '#333'})`
                                        : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    color: '#ffffff',
                                }}
                            >
                                {i + 1}
                            </div>
                            <h3 className="text-lg font-bold mb-3">{item.title}</h3>
                            <p className="text-sm leading-relaxed opacity-65">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </SectionWrapper>
    );
}
