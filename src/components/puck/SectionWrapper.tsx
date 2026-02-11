'use client';

import { ReactNode } from 'react';

interface SectionWrapperProps {
    backgroundColor?: string;
    textColor?: string;
    children: ReactNode;
    className?: string;
}

const DEFAULT_BG = '#ffffff';
const DEFAULT_TEXT = '#1a1a1a';

export function SectionWrapper({
    backgroundColor,
    textColor,
    children,
    className = '',
}: SectionWrapperProps) {
    return (
        <section
            className={className}
            style={{
                backgroundColor: backgroundColor || DEFAULT_BG,
                color: textColor || DEFAULT_TEXT,
            }}
        >
            {children}
        </section>
    );
}

interface SectionImageProps {
    src: string;
    alt: string;
    className?: string;
    aspectRatio?: string;
}

export function SectionImage({ src, alt, className = '', aspectRatio = '16/9' }: SectionImageProps) {
    return (
        <div
            className={`overflow-hidden rounded-xl ${className}`}
            style={{ aspectRatio }}
        >
            <img
                src={src}
                alt={alt}
                loading="lazy"
                className="w-full h-full object-cover"
            />
        </div>
    );
}

export function ImagePlaceholder({ className = '' }: { className?: string }) {
    return (
        <div
            className={`rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center ${className}`}
            style={{ aspectRatio: '16/9' }}
        >
            <svg
                className="w-12 h-12 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91M6.75 9a1.125 1.125 0 100-2.25A1.125 1.125 0 006.75 9z"
                />
            </svg>
        </div>
    );
}
