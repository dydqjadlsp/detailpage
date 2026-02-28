'use client';

import type { BaseSectionProps, SectionItem } from '../types';
import { SectionImage, getAutoTextColor, getContrastText } from '../SectionWrapper';

interface HeroSectionProps extends BaseSectionProps {
    title: string;
    subtitle?: string;
    description?: string;
    ctaText?: string;
    items?: SectionItem[];
}

export function HeroSection({
    title,
    subtitle,
    description,
    ctaText,
    items = [],
    backgroundColor,
    textColor,
    imageUrl,
}: HeroSectionProps) {
    const hasImage = !!imageUrl;

    // 이미지가 있으면 오버레이 위에 흰 텍스트, 없으면 배경색 기반 자동 감지
    const baseTextColor = hasImage ? '#ffffff' : getAutoTextColor(backgroundColor, textColor);
    const mutedAlpha = hasImage ? 'rgba(255,255,255,0.85)' : undefined;
    const subtleAlpha = hasImage ? 'rgba(255,255,255,0.7)' : undefined;

    return (
        <section className="relative overflow-hidden w-full" style={{ minHeight: '600px' }}>
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
                            ? backgroundColor
                            : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                    }}
                />
            )}

            <div className="relative z-10 flex flex-col items-center justify-center text-center w-full px-5 py-24 sm:py-32">
                <h1
                    className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 w-full"
                    style={{ color: baseTextColor }}
                >
                    {title}
                </h1>

                {subtitle && (
                    <p
                        className="text-lg sm:text-xl leading-relaxed mb-6 w-full max-w-[90%]"
                        style={{ color: mutedAlpha || `${baseTextColor}cc` }}
                    >
                        {subtitle}
                    </p>
                )}

                {description && (
                    <p
                        className="text-base sm:text-lg leading-relaxed mb-8 w-full max-w-[90%]"
                        style={{ color: subtleAlpha || `${baseTextColor}99` }}
                    >
                        {description}
                    </p>
                )}

                {items.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-3 mb-10 w-full max-w-[90%]">
                        {items.map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm"
                                style={{
                                    backgroundColor: hasImage
                                        ? 'rgba(255,255,255,0.15)'
                                        : `${baseTextColor}12`,
                                    color: baseTextColor,
                                    border: `1px solid ${hasImage ? 'rgba(255,255,255,0.2)' : `${baseTextColor}22`}`,
                                }}
                            >
                                <span>{item.title}</span>
                            </div>
                        ))}
                    </div>
                )}

                {ctaText && (
                    <button
                        className="px-10 py-4 rounded-full text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                        style={{
                            backgroundColor: hasImage ? '#ffffff' : baseTextColor,
                            color: getContrastText(hasImage ? '#ffffff' : baseTextColor),
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
    description,
    ctaText,
    items = [],
    backgroundColor,
    textColor,
    imageUrl,
}: HeroSectionProps) {
    const resolvedText = getAutoTextColor(backgroundColor, textColor);

    return (
        <section
            className="w-full"
            style={{
                backgroundColor: backgroundColor || '#f8fafc',
                color: resolvedText,
            }}
        >
            <div className="w-full px-5 py-20 grid lg:grid-cols-2 gap-10 items-center">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-lg leading-relaxed mb-4 opacity-75">
                            {subtitle}
                        </p>
                    )}
                    {description && (
                        <p className="text-base leading-relaxed mb-6 opacity-60">
                            {description}
                        </p>
                    )}
                    {items.length > 0 && (
                        <ul className="space-y-2 mb-8">
                            {items.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                    <span className="mt-0.5 shrink-0 opacity-50">&#10003;</span>
                                    <span>
                                        <strong>{item.title}</strong>
                                        {item.description && (
                                            <span className="opacity-65"> — {item.description}</span>
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                    {ctaText && (
                        <button
                            className="px-8 py-4 rounded-full text-lg font-bold transition-all duration-300 hover:scale-105"
                            style={{
                                backgroundColor: resolvedText,
                                color: getContrastText(resolvedText),
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
