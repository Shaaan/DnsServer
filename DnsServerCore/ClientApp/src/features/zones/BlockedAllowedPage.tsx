import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, type ApiResponse } from '../../api/client';
import type { BlockedAllowedListResponse } from '../../api/blockedAllowed';
import { Shield, ShieldAlert, Folder, ArrowUp, Trash2, Plus, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface BlockedAllowedPageProps {
    type: 'blocked' | 'allowed';
}

export const BlockedAllowedPage: React.FC<BlockedAllowedPageProps> = ({ type }) => {
    const queryClient = useQueryClient();
    const [currentDomain, setCurrentDomain] = useState(''); // Empty string is ROOT
    const [newDomain, setNewDomain] = useState('');
    const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());

    // Reset expanded items when navigating
    React.useEffect(() => {
        setExpandedRecords(new Set());
    }, [currentDomain]);

    const toggleExpand = (name: string) => {
        setExpandedRecords(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    const isBlocked = type === 'blocked';
    const title = isBlocked ? 'Blocked Zones' : 'Allowed Zones';
    const description = isBlocked
        ? 'Manage domains that should be blocked.'
        : 'Manage domains that should be explicitly allowed.';
    const Icon = isBlocked ? ShieldAlert : Shield;

    const themeColor = isBlocked ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400';
    const bgColor = isBlocked ? 'bg-red-100 dark:bg-red-500/10' : 'bg-emerald-100 dark:bg-emerald-500/10';
    const borderColor = isBlocked ? 'border-red-200 dark:border-red-500/20' : 'border-emerald-200 dark:border-emerald-500/20';

    const { data, isLoading } = useQuery({
        queryKey: [type, currentDomain],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<BlockedAllowedListResponse>>(`/${type}/list`, {
                params: {
                    domain: currentDomain,
                }
            });
            return response.data.response;
        }
    });

    const addMutation = useMutation({
        mutationFn: async (domain: string) => {
            await apiClient.get(`/${type}/add`, { params: { domain } });
        },
        onSuccess: () => {
            setNewDomain('');
            queryClient.invalidateQueries({ queryKey: [type, currentDomain] });
            toast.success(`Domain added to ${type} list`);
        },
        onError: () => {
            toast.error('Failed to add domain');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (domain: string) => {
            await apiClient.get(`/${type}/delete`, { params: { domain } });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [type, currentDomain] });
            toast.success(`Domain removed from ${type} list`);
        },
        onError: () => {
            toast.error('Failed to remove domain');
        }
    });

    const handleNavigate = (domain: string) => {
        setCurrentDomain(domain);
    };

    const handleUp = () => {
        if (!currentDomain) return;
        const parent = currentDomain.split('.').slice(1).join('.');
        setCurrentDomain(parent);
    };

    const uniqueRecords = React.useMemo(() => {
        if (!data) return [];
        const seen = new Set(data.zones || []);
        const unique: any[] = [];
        for (const record of (data.records || [])) {
            const displayName = typeof record === 'string' ? record : (record.name || record.domain);
            if (!seen.has(displayName)) {
                seen.add(displayName);
                unique.push(record);
            }
        }
        return unique;
    }, [data]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${bgColor} ${borderColor} border`}>
                            <Icon className={themeColor} size={24} />
                        </div>
                        {title}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{description}</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-xl p-4 shadow-soft-md dark:shadow-sm flex items-center gap-2">
                    <input
                        type="text"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && newDomain && addMutation.mutate(newDomain)}
                        className="flex-1 bg-transparent border-none text-slate-800 dark:text-white focus:outline-none placeholder-slate-400"
                        placeholder={`Add domain to ${type} list (e.g. example.com)`}
                    />
                    <button
                        disabled={!newDomain || addMutation.isPending}
                        onClick={() => addMutation.mutate(newDomain)}
                        className={`p-2 rounded-lg transition-colors ${addMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-blue-500'}`}
                    >
                        <Plus />
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-xl overflow-hidden shadow-soft-xl dark:shadow-none">
                <div className="p-3 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-mono text-slate-600 dark:text-slate-300">
                        <Folder size={16} className="text-yellow-500" />
                        <span>{currentDomain || '<ROOT>'}</span>
                    </div>
                    {currentDomain && (
                        <button onClick={handleUp} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                            <ArrowUp size={16} />
                        </button>
                    )}
                </div>

                <div className="divide-y divide-gray-100 dark:divide-slate-800/50">
                    {isLoading ? (
                        <div className="p-8 text-center text-slate-500">Loading...</div>
                    ) : ((data?.zones || []).length === 0 && (data?.records || []).length === 0) ? (
                        <div className="p-8 text-center text-slate-500">List is empty</div>
                    ) : (
                        <>
                            {/* Sub-zones */}
                            {(data?.zones || []).map((zone) => (
                                <div key={zone} className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors group">
                                    <button
                                        onClick={() => handleNavigate(zone)}
                                        className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium hover:text-blue-600 dark:hover:text-white transition-colors"
                                    >
                                        <Folder size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-yellow-500 transition-colors" />
                                        {zone}
                                    </button>
                                </div>
                            ))}


                            {uniqueRecords.map((record) => {
                                const displayName = typeof record === 'string' ? record : (record.name || record.domain || JSON.stringify(record));
                                const isExpanded = expandedRecords.has(displayName);

                                return (
                                    <div key={displayName} className="group border-b border-gray-100 dark:border-slate-800/50 last:border-0 transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/30">
                                        <div className="p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200 overflow-hidden">
                                                <button
                                                    onClick={() => toggleExpand(displayName)}
                                                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded transition-colors"
                                                >
                                                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                </button>
                                                <FileText size={18} className="text-slate-400 dark:text-slate-600 shrink-0" />
                                                <span className="font-mono text-sm truncate">{displayName}</span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Remove ${displayName}?`)) deleteMutation.mutate(currentDomain ? `${displayName}.${currentDomain}` : displayName);
                                                }}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-800 rounded transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        {isExpanded && (
                                            <div className="px-10 pb-4">
                                                <pre className="bg-gray-50 dark:bg-slate-950/50 rounded-lg p-3 text-xs font-mono text-slate-700 dark:text-emerald-400 overflow-x-auto border border-gray-200 dark:border-slate-800/50 shadow-inner">
                                                    {JSON.stringify(record, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            </div>

            {/* Delete current zone button */}
            {currentDomain && (
                <div className="flex justify-end pt-4">
                    <button
                        onClick={() => {
                            if (confirm(`Delete entire zone ${currentDomain}?`)) {
                                deleteMutation.mutate(currentDomain);
                                handleUp();
                            }
                        }}
                        className="flex items-center gap-2 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-500/20"
                    >
                        <Trash2 size={16} />
                        <span>Delete {currentDomain}</span>
                    </button>
                </div>
            )}
        </div>
    );
};
