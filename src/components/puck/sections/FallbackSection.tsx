'use client';

import type { BaseSectionProps, SectionItem } from '../types';
import { SectionWrapper, SectionImage } from '../SectionWrapper';

interface FallbackSectionProps extends BaseSectionProps {
    items?: SectionItem[];
}

export function FallbackSection({
    title,
    subtitle,
    description,
    items = [],
    backgroundColor,
    textColor,
    imageUrl,
}: FallbackSectionProps) {
    return (
        <SectionWrapper backgroundColor={backgroundColor} textColor={textColor}>
            <div className="max-w-6xl mx-auto px-6 py-20">
                {title && (
                    <div className="text-center mb-10">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h2>
                        {subtitle && (
                            <p className="text-lg max-w-2xl mx-auto opacity-70">{subtitle}</p>
                        )}
                    </div>
                )}

                {description && (
                    <p className="text-base leading-relaxed max-w-3xl mx-auto text-center mb-10 opacity-75">
                        {description}
                    </p>
                )}

                {imageUrl && (
                    <div className="mb-10 max-w-4xl mx-auto">
                        <SectionImage src={imageUrl} alt={title || ''} className="shadow-lg" />
                    </div>
                )}

                {items.length > 0 && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item, i) => (
                            <div
                                key={i}
                                className="p-6 rounded-xl border"
                                style={{
                                    borderColor: textColor ? `${textColor}12` : 'rgba(0,0,0,0.08)',
                                }}
                            >
                                <h3 className="font-bold mb-2">{item.title}</h3>
                                <p className="text-sm opacity-65 leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </SectionWrapper>
    );
}
