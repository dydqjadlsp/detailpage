'use client';

import { ReactNode } from 'react';

interface HeroProps {
    title: string;
    subtitle: string;
    ctaText: string;
    backgroundStyle?: 'gradient' | 'solid' | 'image';
    id: string;
}

export function Hero({ title, subtitle, ctaText, backgroundStyle = 'gradient' }: HeroProps) {
    return (
        <section className="relative px-6 py-24 text-center overflow-hidden">
            {backgroundStyle === 'gradient' && (
                <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--color-primary)/0.08)] to-[rgb(var(--color-secondary)/0.12)]" />
            )}
            <div className="relative max-w-3xl mx-auto">
                <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
                    {title}
                </h1>
                <p className="text-lg text-[rgb(var(--color-text-secondary))] mb-8 leading-relaxed">
                    {subtitle}
                </p>
                <button className="btn-primary text-lg px-8 py-4">
                    {ctaText}
                </button>
            </div>
        </section>
    );
}

interface FeaturesItem {
    title: string;
    description: string;
    icon?: string;
}

interface FeaturesProps {
    title: string;
    items: FeaturesItem[];
    id: string;
}

export function Features({ title, items }: FeaturesProps) {
    return (
        <section className="px-6 py-20">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {items.map((item, i) => (
                        <div key={i} className="card p-6 text-center">
                            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                                <span className="text-white text-xl font-bold">{i + 1}</span>
                            </div>
                            <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                            <p className="text-sm text-[rgb(var(--color-text-secondary))] leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

interface BenefitsItem {
    title: string;
    description: string;
}

interface BenefitsProps {
    title: string;
    items: BenefitsItem[];
    id: string;
}

export function Benefits({ title, items }: BenefitsProps) {
    return (
        <section className="px-6 py-20 bg-[rgb(var(--color-surface))]">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
                <div className="space-y-6">
                    {items.map((item, i) => (
                        <div
                            key={i}
                            className="flex gap-4 p-6 rounded-2xl bg-white border border-[rgb(var(--color-border))] hover:shadow-md transition-shadow"
                        >
                            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shrink-0 text-white font-bold">
                                {i + 1}
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">{item.title}</h3>
                                <p className="text-sm text-[rgb(var(--color-text-secondary))] leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

interface TestimonialsItem {
    name: string;
    role: string;
    content: string;
}

interface TestimonialsProps {
    title: string;
    items: TestimonialsItem[];
    id: string;
}

export function Testimonials({ title, items }: TestimonialsProps) {
    return (
        <section className="px-6 py-20">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {items.map((item, i) => (
                        <div key={i} className="card p-6">
                            <p className="text-[rgb(var(--color-text-secondary))] leading-relaxed mb-4 italic">
                                &ldquo;{item.content}&rdquo;
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm">
                                    {item.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{item.name}</p>
                                    <p className="text-xs text-[rgb(var(--color-text-tertiary))]">{item.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

interface CTAProps {
    title: string;
    subtitle: string;
    ctaText: string;
    id: string;
}

export function CTA({ title, subtitle, ctaText }: CTAProps) {
    return (
        <section className="px-6 py-24">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h2>
                <p className="text-lg text-[rgb(var(--color-text-secondary))] mb-8">
                    {subtitle}
                </p>
                <button className="btn-primary text-lg px-10 py-4">
                    {ctaText}
                </button>
            </div>
        </section>
    );
}

export const PUCK_COMPONENTS: Record<string, { render: (props: Record<string, unknown>) => ReactNode }> = {
    Hero: { render: (props) => <Hero {...(props as unknown as HeroProps)} /> },
    Features: { render: (props) => <Features {...(props as unknown as FeaturesProps)} /> },
    Benefits: { render: (props) => <Benefits {...(props as unknown as BenefitsProps)} /> },
    Testimonials: { render: (props) => <Testimonials {...(props as unknown as TestimonialsProps)} /> },
    CTA: { render: (props) => <CTA {...(props as unknown as CTAProps)} /> },
};
