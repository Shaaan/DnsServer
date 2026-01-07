import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type ApiResponse } from '../../api/client';
import type { CacheListResponse } from '../../api/cache';
import { Archive, ArrowUp, Trash2, RefreshCw, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

export const CachePage: React.FC = () => {
    const queryClient = useQueryClient();
    const [currentDomain, setCurrentDomain] = useState(''); // Empty string is ROOT
    const [expandedRecords, setExpandedRecords] = useState<Set<number>>(new Set());

    // Reset expanded items when navigating
    React.useEffect(() => {
        setExpandedRecords(new Set());
    }, [currentDomain]);

    const toggleExpand = (index: number) => {
        setExpandedRecords(prev => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ['cache', currentDomain],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<CacheListResponse>>('/cache/list', {
                params: {
                    domain: currentDomain,
                }
            });
            return response.data.response;
        }
    });

    const flushMutation = useMutation({
        mutationFn: async () => {
            await apiClient.get('/cache/flush');
        },
        onSuccess: () => {
            setCurrentDomain('');
            queryClient.invalidateQueries({ queryKey: ['cache'] });
            toast.success('Cache flushed successfully');
        },
        onError: () => {
            toast.error('Failed to flush cache');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (domain: string) => {
            await apiClient.get('/cache/delete', { params: { domain } });
        },
        onSuccess: () => {
            // Logic to go up one level if we deleted current domain?
            // Actually legacy stays on parent usually.
            queryClient.invalidateQueries({ queryKey: ['cache'] });
            toast.success('Cached zone deleted');
        },
        onError: () => {
            toast.error('Failed to delete cached zone');
        }
    });

    const handleNavigate = (zoneName: string) => {
        // Correct logic to append or set domain
        // If we are at root (""), new domain is just zoneName.
        // If we make hierarchical nav:
        // Actually api/cache/list takes "domain" to list its subzones.
        // So if we click "com", we request "com".
        setCurrentDomain(zoneName);
    };

    const handleUp = () => {
        if (!currentDomain) return;
        const parent = currentDomain.split('.').slice(1).join('.');
        setCurrentDomain(parent);
    };

    const handleDelete = (domain: string) => {
        if (confirm(`Are you sure you want to delete the cached zone '${domain}' and all its records?`)) {
            // If deleting the current view's domain, we should probably go up first or handle navigation after.
            // But usually we delete a child from the list.
            // If we are VIEWING 'google.com' and delete it, we should go up to 'com'.

            // Wait, the UI shows a list of SUBZONES and RECORDS for the CURRENT domain.
            // So if I am at "google.com", I see "mail" (subzone) or "www" (record).
            // I usually delete the current domain I am viewing?
            // Legacy has a button "Delete Cached Zone" which deletes the CURRENT viewed domain.

            deleteMutation.mutate(domain, {
                onSuccess: () => {
                    handleUp();
                }
            });
        }
    }

    if (error) return <div className="p-8 text-center text-red-500">Error loading cache data</div>;

    const displayDomain = currentDomain || '<ROOT>';

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                            <Archive className="text-blue-600 dark:text-blue-400" size={24} />
                        </div>
                        DNS Cache
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">View and manage cached DNS records.</p>
                </div>
                <button
                    onClick={() => {
                        if (confirm('Are you sure you want to flush the DNS Server cache?')) flushMutation.mutate();
                    }}
                    disabled={flushMutation.isPending}
                    className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-red-600 dark:text-red-400 border border-gray-200 dark:border-slate-700 px-4 py-2 rounded-lg shadow-sm transition-all text-sm font-medium"
                >
                    <RefreshCw size={16} className={flushMutation.isPending ? "animate-spin" : ""} />
                    <span>Flush Cache</span>
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-xl overflow-hidden shadow-soft-xl dark:shadow-none min-h-[400px]">
                <div className="p-3 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-mono text-slate-600 dark:text-slate-300 font-bold">
                        <Folder size={16} className="text-blue-500" />
                        <span>{data?.domainIdn || displayDomain}</span>
                    </div>
                    <div className="flex gap-2">
                        {currentDomain && (
                            <>
                                <button
                                    onClick={() => handleDelete(currentDomain)}
                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-500 dark:text-red-400 transition-colors"
                                    title="Delete this cached zone"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <div className="w-px h-4 bg-gray-300 dark:bg-slate-700 my-auto"></div>
                                <button
                                    onClick={handleUp}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                                    title="Go Up"
                                >
                                    <ArrowUp size={16} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-slate-800/50">
                    {isLoading ? (
                        <div className="p-8 text-center text-slate-500">Loading cache...</div>
                    ) : (!data?.zones.length && !data?.records.length) ? (
                        <div className="p-8 text-center text-slate-500">
                            {currentDomain ? 'No records or sub-zones found.' : 'Cache is empty.'}
                        </div>
                    ) : (
                        <>
                            {/* Zones List */}
                            {/* Sort zones alphabetically maybe? */}
                            {data?.zones.map((zone) => (
                                <div key={zone} className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer" onClick={() => handleNavigate(zone)}>
                                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 font-medium">
                                        <Folder size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors" />
                                        <span>{zone}</span>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />
                                </div>
                            ))}

                            {/* Records List */}
                            {data?.records.map((record, index) => {
                                const isExpanded = expandedRecords.has(index);

                                return (
                                    <div key={index} className="group border-b border-gray-100 dark:border-slate-800/50 last:border-0 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/30">
                                        <div className="p-3 flex items-center gap-3" onClick={() => toggleExpand(index)}>
                                            <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded transition-colors">
                                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                            </button>
                                            <div className="flex-1 overflow-hidden">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 min-w-[3rem] text-center">
                                                        {record.type}
                                                    </span>
                                                    <span className="font-mono text-sm truncate text-slate-700 dark:text-slate-200">{record.domain}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">TTL: {record.timeToLive}</span>
                                        </div>
                                        {isExpanded && (
                                            <div className="px-10 pb-4">
                                                <div className="bg-gray-50 dark:bg-slate-950/50 rounded-lg p-3 border border-gray-200 dark:border-slate-800/50 shadow-inner space-y-2">
                                                    <div className="grid grid-cols-[80px_1fr] gap-2 text-xs">
                                                        <span className="text-slate-500 dark:text-slate-400 font-semibold">Name:</span>
                                                        <span className="font-mono text-slate-700 dark:text-slate-300 select-all">{record.domain}</span>

                                                        <span className="text-slate-500 dark:text-slate-400 font-semibold">Type:</span>
                                                        <span className="font-mono text-slate-700 dark:text-slate-300">{record.type}</span>

                                                        <span className="text-slate-500 dark:text-slate-400 font-semibold">TTL:</span>
                                                        <span className="font-mono text-slate-700 dark:text-slate-300">{record.timeToLive} ({record.ttl}s)</span>

                                                        <span className="text-slate-500 dark:text-slate-400 font-semibold">RData:</span>
                                                        <span className="font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-all select-all">
                                                            {/* Display raw JSON or specific field */}
                                                            {JSON.stringify(record.rData, null, 2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
