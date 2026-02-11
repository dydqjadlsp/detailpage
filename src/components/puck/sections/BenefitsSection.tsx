'use client';

import type { BaseSectionProps, SectionItem } from '../types';
import { SectionWrapper, SectionImage } from '../SectionWrapper';

interface BenefitsSectionProps extends BaseSectionProps {
    items: SectionItem[];
}

export function BenefitsSection({
    title,
    subtitle,
    items = [],
    backgroundColor,
    textColor,
    imageUrl,
    layout = 'left-image',
}: BenefitsSectionProps) {
    const showImageLeft = layout === 'left-image' || layout === 'split';
    const showImageRight = layout === 'right-image';
    const hasImage = !!imageUrl;

    return (
        <SectionWrapper backgroundColor={backgroundColor} textColor={textColor}>
            <div className="max-w-7xl mx-auto px-6 py-20">
                {title && (
                    <div className="text-center mb-14">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h2>
                        {subtitle && (
                            <p className="text-lg max-w-2xl mx-auto opacity-70">{subtitle}</p>
                        )}
                    </div>
                )}

                <div className={`grid ${hasImage ? 'lg:grid-cols-2' : ''} gap-12 items-center`}>
                    {hasImage && showImageLeft && (
                        <div>
                            <SectionImage src={imageUrl} alt={title || ''} className="shadow-2xl" aspectRatio="4/5" />
                        </div>
                    )}

                    <div className="space-y-6">
                        {items.map((item, i) => (
                            <div
                                key={i}
                                className="flex gap-5 p-5 rounded-xl transition-all duration-300 hover:shadow-md"
                                style={{
                                    backgroundColor: textColor ? `${textColor}06` : 'rgba(0,0,0,0.03)',
                                }}
                            >
                                <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
                                    style={{
                                        background: backgroundColor
                                            ? `linear-gradient(135deg, ${backgroundColor}, ${textColor || '#333'})`
                                            : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        color: '#ffffff',
                                    }}
                                >
                                    {i + 1}
                                </div>
                                <div>
                                    <h3 className="font-bold mb-1.5">{item.title}</h3>
                                    <p className="text-sm leading-relaxed opacity-65">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {hasImage && showImageRight && (
                        <div>
                            <SectionImage src={imageUrl} alt={title || ''} className="shadow-2xl" aspectRatio="4/5" />
                        </div>
                    )}
                </div>
            </div>
        </SectionWrapper>
    );
}
