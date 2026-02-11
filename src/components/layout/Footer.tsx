import Link from 'next/link';
import { Terminal } from 'lucide-react';

const FOOTER_LINKS = {
    '서비스': [
        { label: '자동 생성', href: '#features' },
        { label: '실시간 편집', href: '#features' },
        { label: '활용 사례', href: '#cases' },
        { label: '요금제', href: '/pricing' },
    ],
    '고객지원': [
        { label: '도움말', href: '/docs' },
        { label: 'API 문서', href: '/docs/api' },
        { label: '커뮤니티', href: '/community' },
        { label: '블로그', href: '/blog' },
    ],
    '회사': [
        { label: '소개', href: '/about' },
        { label: '채용', href: '/careers' },
        { label: '이용약관', href: '/terms' },
        { label: '개인정보처리방침', href: '/privacy' },
    ],
};

export default function Footer() {
    return (
        <footer className="border-t border-[rgb(var(--color-border))] bg-[rgb(var(--color-background))]">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2.5 mb-5">
                            <div className="w-7 h-7 bg-white rounded flex items-center justify-center">
                                <Terminal className="w-3.5 h-3.5 text-[rgb(var(--color-background))]" />
                            </div>
                            <span className="font-bold text-[15px] tracking-tight text-white">
                                DetailPage
                            </span>
                        </Link>
                        <p className="text-sm text-[rgb(var(--color-text-tertiary))] leading-relaxed mb-8 max-w-xs">
                            AI 기반 자동 상세페이지 생성 엔진.
                            <br />
                            전문가급 결과물을 몇 분 안에.
                        </p>
                        <div className="text-xs text-[rgb(var(--color-text-tertiary))] font-mono">
                            &copy; 2024 DetailPage Inc.
                        </div>
                    </div>

                    {Object.entries(FOOTER_LINKS).map(([category, links]) => (
                        <div key={category}>
                            <h3 className="text-xs font-semibold text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider mb-5">
                                {category}
                            </h3>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-[rgb(var(--color-text-secondary))] hover:text-white transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </footer>
    );
}
