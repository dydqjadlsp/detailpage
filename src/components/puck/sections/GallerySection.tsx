'use client';

import type { BaseSectionProps } from '../types';
import { SectionWrapper, SectionImage, ImagePlaceholder } from '../SectionWrapper';

type GallerySectionProps = BaseSectionProps & {
    items?: Array<{ title?: string; description?: string; imageUrl?: string }>;
};

export function GallerySection({
    title,
    subtitle,
    imageUrl,
    backgroundColor,
    textColor,
    items = [],
}: GallerySectionProps) {
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

                {imageUrl && (
                    <div className="mb-10">
                        <SectionImage src={imageUrl} alt={title || ''} className="shadow-xl" />
                    </div>
                )}

                {items.length > 0 && (
                    <div className={`grid ${items.length >= 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : items.length === 2 ? 'sm:grid-cols-2' : ''} gap-6`}>
                        {items.map((item, i) => (
                            <div key={i} className="group overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
                                {item.imageUrl ? (
                                    <SectionImage src={item.imageUrl} alt={item.title || ''} />
                                ) : (
                                    <ImagePlaceholder />
                                )}
                                {(item.title || item.description) && (
                                    <div className="p-5">
                                        {item.title && <h3 className="font-bold mb-1">{item.title}</h3>}
                                        {item.description && (
                                            <p className="text-sm opacity-65">{item.description}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {!imageUrl && items.length === 0 && (
                    <ImagePlaceholder className="max-w-3xl mx-auto" />
                )}
            </div>
        </SectionWrapper>
    );
}
