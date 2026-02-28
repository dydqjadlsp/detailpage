'use client';

import type { BaseSectionProps, SectionItem } from '../types';
import { SectionWrapper, getContrastText } from '../SectionWrapper';

interface TeamSectionProps extends BaseSectionProps {
    items: SectionItem[];
}

function parseTeamMember(item: SectionItem) {
    const parts = (item.description || '').split('|');
    const role = parts[0]?.trim() || '';
    const bio = parts[1]?.trim() || '';
    return { name: item.title, role, bio };
}

const TEAM_COLORS = [
    { gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', start: '#6366f1' },
    { gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)', start: '#06b6d4' },
    { gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', start: '#f59e0b' },
    { gradient: 'linear-gradient(135deg, #ec4899, #db2777)', start: '#ec4899' },
    { gradient: 'linear-gradient(135deg, #10b981, #059669)', start: '#10b981' },
    { gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', start: '#ef4444' },
];

export function TeamSection({
    title,
    subtitle,
    items = [],
    backgroundColor,
    textColor,
}: TeamSectionProps) {
    const members = items.map(parseTeamMember);

    if (members.length === 0) {
        return (
            <SectionWrapper backgroundColor={backgroundColor} textColor={textColor}>
                <div className="max-w-6xl mx-auto px-6 py-20 text-center">
                    {title && <h2 className="text-3xl sm:text-4xl font-bold">{title}</h2>}
                </div>
            </SectionWrapper>
        );
    }

    return (
        <SectionWrapper backgroundColor={backgroundColor} textColor={textColor}>
            <div className="max-w-6xl mx-auto px-6 py-20">
                <div className="text-center mb-14">
                    {title && <h2 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h2>}
                    {subtitle && <p className="text-lg max-w-2xl mx-auto opacity-70">{subtitle}</p>}
                </div>

                <div className={`grid gap-8 ${
                    members.length <= 3 ? 'sm:grid-cols-3 max-w-4xl mx-auto' : 'sm:grid-cols-2 lg:grid-cols-4'
                }`}>
                    {members.map((member, i) => (
                        <div
                            key={i}
                            className="group text-center p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                            style={{ backgroundColor: textColor ? `${textColor}05` : 'rgba(0,0,0,0.02)' }}
                        >
                            <div
                                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold transition-transform duration-300 group-hover:scale-110"
                                style={{
                                    background: TEAM_COLORS[i % TEAM_COLORS.length].gradient,
                                    color: getContrastText(TEAM_COLORS[i % TEAM_COLORS.length].start),
                                }}
                            >
                                {member.name.charAt(0)}
                            </div>
                            <h3 className="text-lg font-bold mb-1">{member.name}</h3>
                            <p
                                className="text-sm font-medium mb-2"
                                style={{ color: textColor ? `${textColor}88` : 'rgba(0,0,0,0.5)' }}
                            >
                                {member.role}
                            </p>
                            {member.bio && (
                                <p className="text-xs leading-relaxed opacity-60">{member.bio}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </SectionWrapper>
    );
}
