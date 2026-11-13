import { Lightbulb, Sparkles, type LucideIcon } from 'lucide-react';
import type { ReactElement } from 'react';

export interface InsightItem {
    num?: number;
    title: string;
    description: string;
    icon?: LucideIcon;
    tone?: 'blue' | 'green' | 'amber' | 'purple' | 'rose';
}

interface BiInsightsCardProps {
    title?: string;
    subtitle?: string;
    items: InsightItem[];
    actionHref?: string;
    actionLabel?: string;
    isSparkle?: boolean;
}

const toneMap = {
    blue: 'bg-blue-50 text-[#1769E0]',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-violet-50 text-violet-600',
    rose: 'bg-rose-50 text-rose-600',
};

export function BiInsightsCard({
    title = 'Insight BI',
    subtitle = 'Ringkasan temuan penting dari analisis data.',
    items,
    actionHref,
    actionLabel,
    isSparkle = false,
}: BiInsightsCardProps): ReactElement {
    return (
        <section className="rounded-2xl border border-[#E2EAF3] bg-white p-5 shadow-[0_2px_12px_rgba(23,105,224,0.03)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    {isSparkle ? (
                        <Sparkles className="h-5 w-5 text-[#1769E0]" />
                    ) : (
                        <Lightbulb className="h-5 w-5 text-amber-500" />
                    )}
                    <div>
                        <h3 className="text-sm font-extrabold text-[#101B4D]">{title}</h3>
                        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
                    </div>
                </div>

                {actionHref && actionLabel && (
                    <a
                        href={actionHref}
                        className="text-xs font-bold text-[#1769E0] hover:underline"
                    >
                        {actionLabel}
                    </a>
                )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {items.map((it, idx) => {
                    const Icon = it.icon;
                    const toneClass = toneMap[it.tone || 'blue'];

                    return (
                        <div
                            key={idx}
                            className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 transition hover:bg-white hover:shadow-sm"
                        >
                            <div className="flex items-start gap-3">
                                {it.num !== undefined ? (
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1769E0] text-xs font-bold text-white">
                                        {it.num}
                                    </span>
                                ) : Icon ? (
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                ) : null}

                                <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-[#101B4D]">{it.title}</h4>
                                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                                        {it.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
