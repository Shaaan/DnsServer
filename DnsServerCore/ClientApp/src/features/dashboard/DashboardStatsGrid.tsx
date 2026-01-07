import React from 'react';
import { Database, CheckCircle, Globe } from 'lucide-react';
import { StatsListWidget } from './StatsListWidget';
import type { DashboardStats } from '../../api/dashboard';

interface DashboardStatsGridProps {
    stats: DashboardStats;
}

// ...existing code...
/**
 * Dashboard Stats Grid
 * 
 * Displays detailed statistics lists (Response Codes, Resolution Types) and Zone statistics.
 * Uses StatsListWidget for uniform list presentation.
 */
export const DashboardStatsGrid: React.FC<DashboardStatsGridProps> = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsListWidget
                title="Response Codes"
                icon={CheckCircle}
                items={[
                    { label: 'No Error', value: stats.totalNoError, total: stats.totalQueries, color: 'bg-emerald-500' },
                    { label: 'NX Domain', value: stats.totalNxDomain, total: stats.totalQueries, color: 'bg-amber-500' },
                    { label: 'Server Failure', value: stats.totalServerFailure, total: stats.totalQueries, color: 'bg-red-500' },
                    { label: 'Refused', value: stats.totalRefused, total: stats.totalQueries, color: 'bg-slate-500' },
                ]}
            />
            <StatsListWidget
                title="Resolution Type"
                icon={Globe}
                items={[
                    { label: 'Recursive', value: stats.totalRecursive, total: stats.totalQueries, color: 'bg-blue-500' },
                    { label: 'Cached', value: stats.totalCached, total: stats.totalQueries, color: 'bg-emerald-500' },
                    { label: 'Authoritative', value: stats.totalAuthoritative, total: stats.totalQueries, color: 'bg-purple-500' },
                    { label: 'Blocked', value: stats.totalBlocked, total: stats.totalQueries, color: 'bg-red-500' },
                    { label: 'Dropped', value: stats.totalDropped, total: stats.totalQueries, color: 'bg-gray-500' },
                ]}
            />
            {/* Zone Stats - Custom Card */}
            <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl p-6 shadow-soft-xl dark:shadow-none h-full hover:shadow-2xl transition-shadow duration-300">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Database size={20} className="text-slate-400" />
                    Zone Statistics
                </h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Zones</span>
                        <span className="font-bold text-slate-800 dark:text-white">{stats.zones.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Cached Records</span>
                        <span className="font-bold text-slate-800 dark:text-white">{stats.cachedEntries.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 text-center">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Blocked</div>
                            <div className="font-bold text-red-500">{stats.blockedZones.toLocaleString()}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 text-center">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Allowed</div>
                            <div className="font-bold text-emerald-500">{stats.allowedZones.toLocaleString()}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 text-center">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Block Lists</div>
                            <div className="font-bold text-slate-700 dark:text-slate-300">{stats.blockListZones.toLocaleString()}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 text-center">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Allow Lists</div>
                            <div className="font-bold text-slate-700 dark:text-slate-300">{stats.allowListZones.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
