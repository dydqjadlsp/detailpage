export interface SectionItem {
    title: string;
    description: string;
    icon?: string;
}

export interface FAQItem {
    question: string;
    answer: string;
}

export interface TestimonialItem {
    name: string;
    role: string;
    content: string;
}

export interface StatItem {
    value: string;
    label: string;
    suffix?: string;
}

export interface ProcessItem {
    title: string;
    description: string;
    step?: number;
}

export interface BaseSectionProps {
    id: string;
    title?: string;
    subtitle?: string;
    description?: string;
    backgroundColor?: string;
    textColor?: string;
    imageUrl?: string;
    imagePrompt?: string;
    layout?: 'left-image' | 'right-image' | 'center' | 'full-width' | 'grid' | 'split';
    ctaText?: string;
}
