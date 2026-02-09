'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES, CATEGORY_ICONS } from '@/lib/categories';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
};

const stagger = {
    animate: {
        transition: { staggerChildren: 0.06 },
    },
};

const CATEGORY_COLORS: Record<string, string> = {
    ecommerce: '#F59E0B',
    realestate: '#3B82F6',
    medical: '#10B981',
    education: '#8B5CF6',
    restaurant: '#EF4444',
    travel: '#06B6D4',
    wedding: '#EC4899',
    legal: '#6366F1',
    fitness: '#F97316',
    saas: '#7C3AED',
    personal: '#14B8A6',
};

export default function NewProjectPage() {
    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                    어떤 페이지를 만들까요?
                </h1>
                <p className="text-lg text-[rgb(var(--color-text-secondary))]">
                    카테고리를 선택하면 AI가 최적화된 상세페이지를 생성합니다
                </p>
            </motion.div>

            <motion.div
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
                variants={stagger}
                initial="initial"
                animate="animate"
            >
                {CATEGORIES.filter((c) => c.isActive).map((category) => {
                    const Icon = CATEGORY_ICONS[category.icon];
                    const color = CATEGORY_COLORS[category.id] ?? '#7C3AED';

                    return (
                        <motion.div key={category.id} variants={fadeInUp}>
                            <Link href={`/new/${category.id}`} className="block">
                                <div className="card p-6 group h-full">
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                                            style={{ backgroundColor: `${color}15`, color }}
                                        >
                                            {Icon && <Icon className="w-6 h-6" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                                                {category.name}
                                                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[rgb(var(--color-primary))]" />
                                            </h3>
                                            <p className="text-sm text-[rgb(var(--color-text-secondary))] leading-relaxed">
                                                {category.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}
