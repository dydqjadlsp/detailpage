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

/**
 * 배경색 밝기를 판단하여 적절한 텍스트 색상을 자동 반환
 * - 밝은 배경 → 어두운 텍스트 (#1a1a1a)
 * - 어두운 배경 → 밝은 텍스트 (#ffffff)
 * - 대비 부족 시 자동 보정
 */
export function getAutoTextColor(backgroundColor?: string, textColor?: string): string {
    if (textColor && backgroundColor) {
        const bgLight = isLightColor(backgroundColor);
        const txtLight = isLightColor(textColor);
        if (bgLight === txtLight) {
            return bgLight ? '#1a1a1a' : '#ffffff';
        }
        return textColor;
    }
    // textColor만 있고 backgroundColor 없을 때: 기본 배경(흰색) 대비 체크
    if (textColor) {
        return isLightColor(textColor) ? '#1a1a1a' : textColor;
    }
    if (!backgroundColor) return DEFAULT_TEXT;
    return isLightColor(backgroundColor) ? '#1a1a1a' : '#ffffff';
}

/**
 * 특정 배경색 위에 올라갈 텍스트의 대비 색상 반환
 * - 버튼, 배지, 아이콘 등 자체 배경을 가진 요소용
 */
export function getContrastText(bgColor: string): string {
    return isLightColor(bgColor) ? '#1a1a1a' : '#ffffff';
}

function isLightColor(hex: string): boolean {
    const color = hex.replace(/^#/, '');
    if (color.length < 6) return true; // 파싱 불가하면 밝은색으로 가정
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return true;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
}

export function SectionWrapper({
    backgroundColor,
    textColor,
    children,
    className = '',
}: SectionWrapperProps) {
    const resolvedText = getAutoTextColor(backgroundColor, textColor);
    return (
        <section
            className={className}
            style={{
                backgroundColor: backgroundColor || DEFAULT_BG,
                color: resolvedText,
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
