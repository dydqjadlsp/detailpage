'use client';

import type { BaseSectionProps } from '../types';

interface CTASectionProps extends BaseSectionProps {
    title: string;
    subtitle?: string;
    ctaText?: string;
}

export function CTASection({
    title,
    subtitle,
    ctaText,
    backgroundColor,
    textColor,
    imageUrl,
}: CTASectionProps) {
    const bgGradient = backgroundColor
        ? `linear-gradient(135deg, ${backgroundColor} 0%, ${backgroundColor}dd 100%)`
        : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';
    const txtColor = textColor || '#ffffff';

    return (
        <section className="relative overflow-hidden">
            {imageUrl ? (
                <>
                    <img
                        src={imageUrl}
                        alt={title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80" />
                </>
            ) : (
                <div className="absolute inset-0" style={{ background: bgGradient }} />
            )}

            <div className="relative z-10 max-w-3xl mx-auto text-center px-6 py-24">
                <h2
                    className="text-3xl sm:text-4xl font-bold mb-5"
                    style={{ color: txtColor }}
                >
                    {title}
                </h2>
                {subtitle && (
                    <p
                        className="text-lg mb-10 leading-relaxed"
                        style={{ color: `${txtColor}bb` }}
                    >
                        {subtitle}
                    </p>
                )}
                {ctaText && (
                    <button
                        className="px-10 py-4 rounded-full text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                        style={{
                            backgroundColor: txtColor,
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
