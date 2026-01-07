import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatItem {
    label: string;
    value: number;
    total: number;
    color?: string;
}

interface StatsListWidgetProps {
    title: string;
    icon: LucideIcon;
    items: StatItem[];
}

export const StatsListWidget: React.FC<StatsListWidgetProps> = ({ title, icon: Icon, items }) => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl p-6 shadow-soft-xl dark:shadow-none h-full">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Icon size={20} className="text-slate-400" />
                {title}
            </h3>
            <div className="space-y-4">
                {items.map((item, index) => {
                    const percentage = item.total > 0 ? ((item.value / item.total) * 100).toFixed(2) : '0.00';
                    return (
                        <div key={index} className="flex flex-col gap-1">
                            <div className="flex justify-between items-end text-sm">
                                <span className="text-slate-600 dark:text-slate-400 font-medium">{item.label}</span>
                                <div className="text-right">
                                    <span className="font-bold text-slate-800 dark:text-white">{item.value.toLocaleString()}</span>
                                    <span className="text-xs text-slate-400 ml-1">({percentage}%)</span>
                                </div>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${item.color || 'bg-blue-500'}`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
