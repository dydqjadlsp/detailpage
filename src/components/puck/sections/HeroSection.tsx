'use client';

import type { BaseSectionProps } from '../types';
import { SectionImage } from '../SectionWrapper';

interface HeroSectionProps extends BaseSectionProps {
    title: string;
    subtitle?: string;
    ctaText?: string;
}

export function HeroSection({
    title,
    subtitle,
    ctaText,
    backgroundColor,
    textColor,
    imageUrl,
}: HeroSectionProps) {
    const hasImage = !!imageUrl;

    return (
        <section className="relative overflow-hidden" style={{ minHeight: '520px' }}>
            {hasImage ? (
                <>
                    <img
                        src={imageUrl}
                        alt={title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
                </>
            ) : (
                <div
                    className="absolute inset-0"
                    style={{
                        background: backgroundColor
                            ? `linear-gradient(135deg, ${backgroundColor}ee 0%, ${backgroundColor}88 50%, ${backgroundColor}44 100%)`
                            : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                    }}
                />
            )}

            <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-28 sm:py-36">
                <h1
                    className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 max-w-4xl"
                    style={{ color: hasImage ? '#ffffff' : (textColor || '#ffffff') }}
                >
                    {title}
                </h1>

                {subtitle && (
                    <p
                        className="text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl"
                        style={{
                            color: hasImage ? 'rgba(255,255,255,0.85)' : (textColor ? `${textColor}cc` : 'rgba(255,255,255,0.85)'),
                        }}
                    >
                        {subtitle}
                    </p>
                )}

                {ctaText && (
                    <button
                        className="px-10 py-4 rounded-full text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                        style={{
                            backgroundColor: '#ffffff',
                            color: backgroundColor || '#1a1a2e',
                        }}
                    >
                        {ctaText}
                    </button>
                )}
            </div>
        </section>
    );
}

export function HeroSectionWithSideImage({
    title,
    subtitle,
    ctaText,
    backgroundColor,
    textColor,
    imageUrl,
}: HeroSectionProps) {
    return (
        <section
            style={{
                backgroundColor: backgroundColor || '#f8fafc',
                color: textColor || '#1a1a1a',
            }}
        >
            <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-lg leading-relaxed mb-8 opacity-75">
                            {subtitle}
                        </p>
                    )}
                    {ctaText && (
                        <button
                            className="px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 hover:scale-105"
                            style={{
                                backgroundColor: textColor || '#1a1a1a',
                                color: backgroundColor || '#ffffff',
                            }}
                        >
                            {ctaText}
                        </button>
                    )}
                </div>
                <div>
                    {imageUrl ? (
                        <SectionImage src={imageUrl} alt={title} className="shadow-2xl" />
                    ) : (
                        <div
                            className="rounded-2xl shadow-2xl"
                            style={{
                                aspectRatio: '4/3',
                                background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                            }}
                        />
                    )}
                </div>
            </div>
        </section>
    );
}
