'use client';

import type { BaseSectionProps, SectionItem } from '../types';
import { SectionWrapper, getContrastText } from '../SectionWrapper';

interface ContactSectionProps extends BaseSectionProps {
    items: SectionItem[];
}

const CONTACT_ICONS: Record<string, string> = {
    phone: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
    email: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    location: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
    clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
};

function getIconPath(iconName: string): string {
    const key = iconName.toLowerCase();
    for (const [k, v] of Object.entries(CONTACT_ICONS)) {
        if (key.includes(k)) return v;
    }
    return CONTACT_ICONS.phone;
}

export function ContactSection({
    title,
    subtitle,
    items = [],
    backgroundColor,
    textColor,
    ctaText,
}: ContactSectionProps) {
    return (
        <SectionWrapper backgroundColor={backgroundColor} textColor={textColor}>
            <div className="max-w-6xl mx-auto px-6 py-20">
                <div className="text-center mb-14">
                    {title && <h2 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h2>}
                    {subtitle && <p className="text-lg max-w-2xl mx-auto opacity-70">{subtitle}</p>}
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* 연락처 정보 */}
                    <div>
                        <h3 className="text-xl font-bold mb-6">연락처</h3>
                        <div className="space-y-5">
                            {items.map((item, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{
                                            backgroundColor: textColor ? `${textColor}10` : 'rgba(99,102,241,0.08)',
                                            color: textColor || '#6366f1',
                                        }}
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d={getIconPath(item.icon || item.title)} />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{item.title}</p>
                                        <p className="text-sm opacity-65">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 문의 폼 */}
                    <div
                        className="rounded-2xl p-8"
                        style={{
                            backgroundColor: textColor ? `${textColor}05` : 'rgba(0,0,0,0.02)',
                            border: `1px solid ${textColor ? `${textColor}10` : 'rgba(0,0,0,0.06)'}`,
                        }}
                    >
                        <h3 className="text-xl font-bold mb-6">문의하기</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 opacity-70">이름</label>
                                <div
                                    className="w-full h-11 rounded-lg px-4"
                                    style={{
                                        backgroundColor: textColor ? `${textColor}08` : 'rgba(0,0,0,0.04)',
                                        border: `1px solid ${textColor ? `${textColor}20` : 'rgba(0,0,0,0.12)'}`,
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 opacity-70">연락처</label>
                                <div
                                    className="w-full h-11 rounded-lg px-4"
                                    style={{
                                        backgroundColor: textColor ? `${textColor}08` : 'rgba(0,0,0,0.04)',
                                        border: `1px solid ${textColor ? `${textColor}20` : 'rgba(0,0,0,0.12)'}`,
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5 opacity-70">문의 내용</label>
                                <div
                                    className="w-full h-28 rounded-lg px-4"
                                    style={{
                                        backgroundColor: textColor ? `${textColor}08` : 'rgba(0,0,0,0.04)',
                                        border: `1px solid ${textColor ? `${textColor}20` : 'rgba(0,0,0,0.12)'}`,
                                    }}
                                />
                            </div>
                            <button
                                className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 hover:opacity-90"
                                style={{
                                    backgroundColor: textColor || '#6366f1',
                                    color: getContrastText(textColor || '#6366f1'),
                                }}
                            >
                                {ctaText || '문의 보내기'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </SectionWrapper>
    );
}
