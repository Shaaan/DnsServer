import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatsWidgetProps {
    title: string;
    value: number;
    icon: LucideIcon;
    color: string;
    subValue?: string; // e.g. percentage
}

// ...existing code...
/**
 * Stats Widget
 * 
 * A reusable card component for displaying a single statistic with an icon and optional sub-value.
 */
export const StatsWidget: React.FC<StatsWidgetProps & { iconBgColor?: string }> = ({ title, value, icon: Icon, color, iconBgColor, subValue }) => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl p-4 shadow-soft-lg hover:shadow-soft-xl dark:shadow-none hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
                    <div className="mt-1 flex items-baseline gap-2">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
                            {value.toLocaleString()}
                        </h3>
                        {subValue && (
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                                {subValue}
                            </span>
                        )}
                    </div>
                </div>
                <div className={`p-2.5 rounded-lg ${iconBgColor || `${color.replace('text-', 'bg-')}/10`}`}>
                    <Icon size={20} className={color} />
                </div>
            </div>
        </div>
    );
};
