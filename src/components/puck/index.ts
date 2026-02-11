import { createElement, ReactNode } from 'react';
import { HeroSection } from './sections/HeroSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { BenefitsSection } from './sections/BenefitsSection';
import { GallerySection } from './sections/GallerySection';
import { CTASection } from './sections/CTASection';
import { TestimonialsSection } from './sections/TestimonialsSection';
import { ProcessSection } from './sections/ProcessSection';
import { FAQSection } from './sections/FAQSection';
import { StatsSection } from './sections/StatsSection';
import { FallbackSection } from './sections/FallbackSection';

type ComponentEntry = {
    render: (props: Record<string, unknown>) => ReactNode;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wrap(Component: React.ComponentType<any>) {
    return { render: (props: Record<string, unknown>) => createElement(Component, props) };
}

export const PUCK_COMPONENTS: Record<string, ComponentEntry> = {
    Hero: wrap(HeroSection),
    Features: wrap(FeaturesSection),
    Benefits: wrap(BenefitsSection),
    Gallery: wrap(GallerySection),
    Testimonials: wrap(TestimonialsSection),
    Process: wrap(ProcessSection),
    FAQ: wrap(FAQSection),
    Stats: wrap(StatsSection),
    CTA: wrap(CTASection),
    DetailedProduct: wrap(FallbackSection),
    Pricing: wrap(FallbackSection),
    Comparison: wrap(FallbackSection),
    Timeline: wrap(FallbackSection),
    Team: wrap(FallbackSection),
    About: wrap(FallbackSection),
    Contact: wrap(FallbackSection),
    Portfolio: wrap(FallbackSection),
    Newsletter: wrap(FallbackSection),
    Partners: wrap(FallbackSection),
    VideoShowcase: wrap(FallbackSection),
};

export function getFallbackComponent(): ComponentEntry {
    return wrap(FallbackSection);
}
