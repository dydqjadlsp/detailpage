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
import { PricingSection } from './sections/PricingSection';
import { ComparisonSection } from './sections/ComparisonSection';
import { TimelineSection } from './sections/TimelineSection';
import { TeamSection } from './sections/TeamSection';
import { ContactSection } from './sections/ContactSection';

type ComponentEntry = {
    render: (props: Record<string, unknown>) => ReactNode;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wrap(Component: React.ComponentType<any>) {
    return { render: (props: Record<string, unknown>) => createElement(Component, props) };
}

const BASE_COMPONENTS: Record<string, ComponentEntry> = {
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
    Pricing: wrap(PricingSection),
    Comparison: wrap(ComparisonSection),
    Timeline: wrap(TimelineSection),
    Team: wrap(TeamSection),
    About: wrap(FallbackSection),
    Contact: wrap(ContactSection),
    Portfolio: wrap(FallbackSection),
    Newsletter: wrap(FallbackSection),
    Partners: wrap(FallbackSection),
    VideoShowcase: wrap(FallbackSection),
};

export const PUCK_COMPONENTS: Record<string, ComponentEntry> = {
    ...BASE_COMPONENTS,
    ...Object.fromEntries(
        Object.entries(BASE_COMPONENTS).map(([key, value]) => [`${key}Section`, value])
    ),
};

export function getFallbackComponent(): ComponentEntry {
    return wrap(FallbackSection);
}
