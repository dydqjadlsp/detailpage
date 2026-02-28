'use client';

import { ChevronDown } from 'lucide-react';

const SECTION_TYPES = [
    { value: 'Hero', label: 'Hero', desc: '메인 비주얼' },
    { value: 'Features', label: 'Features', desc: '핵심 특징' },
    { value: 'Benefits', label: 'Benefits', desc: '혜택/장점' },
    { value: 'Gallery', label: 'Gallery', desc: '이미지 갤러리' },
    { value: 'Testimonials', label: 'Testimonials', desc: '고객 후기' },
    { value: 'Process', label: 'Process', desc: '프로세스/절차' },
    { value: 'Pricing', label: 'Pricing', desc: '가격/요금제' },
    { value: 'FAQ', label: 'FAQ', desc: '자주 묻는 질문' },
    { value: 'Stats', label: 'Stats', desc: '통계/수치' },
    { value: 'Team', label: 'Team', desc: '팀 소개' },
    { value: 'About', label: 'About', desc: '소개/스토리' },
    { value: 'Contact', label: 'Contact', desc: '연락처/문의' },
    { value: 'CTA', label: 'CTA', desc: '행동 유도' },
    { value: 'Comparison', label: 'Comparison', desc: '비교표' },
    { value: 'Timeline', label: 'Timeline', desc: '타임라인' },
    { value: 'Portfolio', label: 'Portfolio', desc: '포트폴리오' },
] as const;

interface SectionTypeSelectorProps {
    value: string;
    onChange: (value: string) => void;
    accentColor?: string;
}

export default function SectionTypeSelector({
    value,
    onChange,
    accentColor = '#7C3AED',
}: SectionTypeSelectorProps) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none w-full px-3 py-2 pr-8 rounded-lg text-sm font-medium border transition-colors cursor-pointer bg-white/5 border-white/10 hover:border-white/20 focus:outline-none"
                style={{
                    color: accentColor,
                    borderColor: value ? `${accentColor}40` : undefined,
                }}
            >
                <option value="">섹션 타입 선택</option>
                {SECTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                        {t.label} - {t.desc}
                    </option>
                ))}
            </select>
            <ChevronDown
                className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: accentColor }}
            />
        </div>
    );
}
