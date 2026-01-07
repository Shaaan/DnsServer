import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient, type ApiResponse } from '../../api/client';
import type { DashboardResponse } from '../../api/dashboard';
import { useTheme } from '../../context/ThemeContext';
import { StatsWidget } from './StatsWidget';
import { DashboardStatsGrid } from './DashboardStatsGrid';
import { Activity, ShieldBan, Zap, Users, Server, PlayCircle, Info } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

interface UserInfo {
    info: {
        version: string;
        dnsServerDomain: string;
        uptimestamp: string;
    };
}

// ...existing code...
/**
 * Dashboard Page
 * 
 * Displays the main dashboard using React Query for real-time data fetching.
 * Features:
 * - Real-time traffic chart (Recharts)
 * - Server statistics (Query types, protocols)
 * - Top clients and domains lists
 */
export const DashboardPage: React.FC = () => {
    const { theme } = useTheme();
    const [userInfo, setUserInfo] = useState<UserInfo['info'] | null>(null);
    const [uptime, setUptime] = useState<string>('');
    const [range, setRange] = useState<string>('lastHour');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.info) {
                    setUserInfo(user.info);
                }
            } catch (e) {
                console.error("Failed to parse user info", e);
            }
        }
    }, []);

    useEffect(() => {
        if (!userInfo?.uptimestamp) return;

        const updateUptime = () => {
            const start = new Date(userInfo.uptimestamp).getTime();
            const now = new Date().getTime();
            const diff = now - start;

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            setUptime(`${days}d ${hours}h ${minutes}m`);
        };

        updateUptime();
        const interval = setInterval(updateUptime, 60000);
        return () => clearInterval(interval);
    }, [userInfo]);

    const { data, isLoading, isPlaceholderData } = useQuery({
        queryKey: ['dashboard', 'stats', range],
        queryFn: async () => {
            const params: any = { type: range, utc: 'true', node: '' };

            const response = await apiClient.get<ApiResponse<DashboardResponse>>('/dashboard/stats/get', {
                params
            });
            return response.data.response;
        },
        refetchInterval: 3000,
        placeholderData: (previousData) => previousData, // Keep showing previous data while fetching new
    });

    // We no longer return early here. We handle missing data in the render.
    // if (isLoading) ...

    const stats = data?.stats;
    const mainChartData = data?.mainChartData;
    const queryTypeChartData = data?.queryTypeChartData;
    const protocolTypeChartData = data?.protocolTypeChartData;

    // Transform Main Chart Data for Recharts
    const chartData = mainChartData?.labels.map((label, index) => {
        const point: any = { time: label };
        mainChartData.datasets.forEach(ds => {
            point[ds.label] = ds.data[index]
        });
        return point;
    }) || [];

    const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];
    const isDark = theme === 'dark';

    const tooltipStyle = {
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        borderColor: isDark ? '#1e293b' : '#e2e8f0',
        color: isDark ? '#f1f5f9' : '#1e293b',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header & Server Info */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Dashboard</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time overview of your DNS server</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">

                    {userInfo && (
                        <>
                            <div className="px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <Server size={16} className="text-blue-500" />
                                <span className="font-bold">{userInfo.dnsServerDomain}</span>
                            </div>
                            <div className="px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <PlayCircle size={16} className="text-emerald-500" />
                                <span>Uptime: <span className="font-bold">{uptime}</span></span>
                            </div>
                            <div className="px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                <Info size={16} className="text-purple-500" />
                                <span>v<span className="font-bold">{userInfo.version}</span></span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Top Stats Grid */}
            {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsWidget
                        title="Total Queries"
                        value={stats.totalQueries}
                        icon={Activity}
                        color="text-blue-500"
                        iconBgColor="bg-blue-500/10"
                    />
                    <StatsWidget
                        title="Blocked"
                        value={stats.totalBlocked}
                        icon={ShieldBan}
                        color="text-red-500"
                        iconBgColor="bg-red-500/10"
                        subValue={stats.totalQueries > 0 ? ((stats.totalBlocked / stats.totalQueries) * 100).toFixed(1) + '%' : '0%'}
                    />
                    <StatsWidget
                        title="Cached"
                        value={stats.totalCached}
                        icon={Zap}
                        color="text-emerald-500"
                        iconBgColor="bg-emerald-500/10"
                        subValue={stats.totalQueries > 0 ? ((stats.totalCached / stats.totalQueries) * 100).toFixed(1) + '%' : '0%'}
                    />
                    <StatsWidget
                        title="Clients"
                        value={stats.totalClients}
                        icon={Users}
                        color="text-purple-500"
                        iconBgColor="bg-purple-500/10"
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-gray-200 dark:bg-slate-800 rounded-2xl"></div>
                    ))}
                </div>
            )}

            {/* Main Chart (Traffic Overview) - Moved to Location 2 */}
            <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl p-6 shadow-soft-xl dark:shadow-none">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                        Traffic Overview
                        {isLoading && !data && <span className="text-xs font-normal text-slate-400 ml-2 animate-pulse">Loading...</span>}
                        {isPlaceholderData && <span className="text-xs font-normal text-slate-400 ml-2">Updating...</span>}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Range Buttons */}
                        <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                            {['lastHour', 'lastDay', 'lastWeek', 'lastMonth', 'lastYear'].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRange(r)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${range === r
                                        ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                        }`}
                                >
                                    {r === 'lastHour' ? '1h' :
                                        r === 'lastDay' ? '24h' :
                                            r === 'lastWeek' ? '1w' :
                                                r === 'lastMonth' ? '1m' :
                                                    r === 'lastYear' ? '1y' : ''}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#e2e8f0"} />
                                <XAxis
                                    dataKey="time"
                                    stroke={isDark ? "#64748b" : "#94a3b8"}
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => {
                                        try {
                                            const date = new Date(value);
                                            // Simple formatting for axis triggers
                                            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        } catch { return value; }
                                    }}
                                />
                                <YAxis stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            // Format date label
                                            let formattedLabel = '';
                                            if (label) {
                                                try {
                                                    const date = new Date(label);
                                                    const day = date.getDate().toString().padStart(2, '0');
                                                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                                                    const year = date.getFullYear();
                                                    const hours = date.getHours().toString().padStart(2, '0');
                                                    const minutes = date.getMinutes().toString().padStart(2, '0');
                                                    formattedLabel = `${day}-${month}-${year} ${hours}:${minutes}`;
                                                } catch {
                                                    formattedLabel = String(label);
                                                }
                                            }

                                            return (
                                                <div style={tooltipStyle} className="p-3 border">
                                                    <p className="font-medium mb-2 pb-2 border-b border-gray-100 dark:border-slate-800">{formattedLabel}</p>
                                                    <div className="space-y-1">
                                                        {payload
                                                            .filter((entry: any) => !entry.name.toLowerCase().includes('client'))
                                                            .map((entry: any, index: number) => (
                                                                <div key={index} className="flex items-center justify-between gap-4 text-xs">
                                                                    <div className="flex items-center gap-2">
                                                                        <span
                                                                            className="w-2.5 h-2.5 rounded-full shadow-sm"
                                                                            style={{ backgroundColor: entry.color }}
                                                                        />
                                                                        <span className="text-slate-600 dark:text-slate-300 font-medium">{entry.name}</span>
                                                                    </div>
                                                                    <span className="font-bold text-slate-800 dark:text-white">
                                                                        {Number(entry.value).toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                {mainChartData && mainChartData.datasets.map((ds, idx) => (
                                    <Area
                                        key={ds.label}
                                        type="monotone"
                                        dataKey={ds.label}
                                        stroke={COLORS[idx % COLORS.length]}
                                        fillOpacity={1}
                                        fill={`url(#colorTotal)`}
                                        strokeWidth={2}
                                    />
                                ))}
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                            No traffic data available for this period
                        </div>
                    )}
                </div>
            </div>

            {/* Detailed Stats Grid - Only show if stats exist */}
            {stats && (
                <DashboardStatsGrid stats={stats} />
            )}

            {/* Bottom Grid: Top Lists & Pie Charts  - Only show if data exists */}
            {data && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Clients */}
                    <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl p-6 shadow-soft-xl dark:shadow-none lg:col-span-1 hover:shadow-2xl transition-shadow duration-300">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">Top Clients</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-gray-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-3 py-2 rounded-l-lg">Client</th>
                                        <th className="px-3 py-2 text-right rounded-r-lg">Hits</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                                    {data.topClients.slice(0, 5).map((client, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-3 py-3 font-medium text-slate-600 dark:text-slate-300">
                                                <div className="truncate max-w-[200px]" title={client.name}>{client.name}</div>
                                            </td>
                                            <td className="px-3 py-3 text-right text-slate-500 dark:text-slate-400 font-mono">{client.hits.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {data.topClients.length === 0 && (
                                        <tr><td colSpan={2} className="px-3 py-4 text-center text-slate-500">No data</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Top Domains */}
                    <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl p-6 shadow-soft-xl dark:shadow-none lg:col-span-1 hover:shadow-2xl transition-shadow duration-300">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">Top Allowed Domains</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-gray-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-3 py-2 rounded-l-lg">Domain</th>
                                        <th className="px-3 py-2 text-right rounded-r-lg">Hits</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                                    {data.topDomains.slice(0, 5).map((domain, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-3 py-3 font-medium text-slate-600 dark:text-slate-300">
                                                <div className="truncate max-w-[200px]" title={domain.name}>{domain.name || '.'}</div>
                                            </td>
                                            <td className="px-3 py-3 text-right text-slate-500 dark:text-slate-400 font-mono">{domain.hits.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {data.topDomains.length === 0 && (
                                        <tr><td colSpan={2} className="px-3 py-4 text-center text-slate-500">No data</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Top Blocked Domains */}
                    <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl p-6 shadow-soft-xl dark:shadow-none lg:col-span-1 hover:shadow-2xl transition-shadow duration-300">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">Top Blocked Domains</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-gray-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-3 py-2 rounded-l-lg">Domain</th>
                                        <th className="px-3 py-2 text-right rounded-r-lg">Hits</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                                    {data.topBlockedDomains.slice(0, 5).map((domain, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-3 py-3 font-medium text-slate-600 dark:text-slate-300">
                                                <div className="truncate max-w-[200px]" title={domain.name}>{domain.name || '.'}</div>
                                            </td>
                                            <td className="px-3 py-3 text-right text-slate-500 dark:text-slate-400 font-mono">{domain.hits.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {data.topBlockedDomains.length === 0 && (
                                        <tr><td colSpan={2} className="px-3 py-4 text-center text-slate-500">No data</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Query Types Pie Chart */}
                    <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl p-6 shadow-soft-xl dark:shadow-none lg:col-span-1 hover:shadow-2xl transition-shadow duration-300">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Query Types</h3>
                        <div className="h-[250px]">
                            {queryTypeChartData ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={queryTypeChartData.labels.map((label, i) => ({
                                                name: label,
                                                value: queryTypeChartData.datasets[0].data[i]
                                            }))}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {queryTypeChartData.labels.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={tooltipStyle}
                                            itemStyle={{ color: isDark ? '#e2e8f0' : '#475569' }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }} layout="vertical" align="right" verticalAlign="middle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400 text-sm">No data</div>
                            )}
                        </div>
                    </div>

                    {/* Protocol Types Pie Chart */}
                    <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl p-6 shadow-soft-xl dark:shadow-none lg:col-span-1 hover:shadow-2xl transition-shadow duration-300">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Protocol Types</h3>
                        <div className="h-[250px]">
                            {protocolTypeChartData ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={protocolTypeChartData.labels.map((label, i) => ({
                                                name: label,
                                                value: protocolTypeChartData.datasets[0].data[i]
                                            }))}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {protocolTypeChartData.labels.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={tooltipStyle}
                                            itemStyle={{ color: isDark ? '#e2e8f0' : '#475569' }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '12px', color: isDark ? '#94a3b8' : '#64748b' }} layout="vertical" align="right" verticalAlign="middle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400 text-sm">No data</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
