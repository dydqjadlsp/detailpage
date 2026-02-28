'use client';

import type { BaseSectionProps } from '../types';
import { getAutoTextColor, getContrastText } from '../SectionWrapper';

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
    const hasImage = !!imageUrl;
    const bgGradient = backgroundColor
        ? `linear-gradient(135deg, ${backgroundColor} 0%, ${backgroundColor}dd 100%)`
        : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)';

    // 이미지가 있으면 흰색, 없으면 배경색 기반 자동 감지
    const txtColor = hasImage ? '#ffffff' : getAutoTextColor(backgroundColor, textColor);

    return (
        <section className="relative overflow-hidden w-full">
            {hasImage ? (
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

            <div className="relative z-10 w-full text-center px-5 py-24">
                <h2
                    className="text-3xl sm:text-4xl font-bold mb-5"
                    style={{ color: txtColor }}
                >
                    {title}
                </h2>
                {subtitle && (
                    <p
                        className="text-lg mb-10 leading-relaxed max-w-[90%] mx-auto"
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
                            color: getContrastText(txtColor),
                        }}
                    >
                        {ctaText}
                    </button>
                )}
            </div>
        </section>
    );
}
