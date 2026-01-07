import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type ApiResponse } from '../../api/client';
import type { AppsListResponse, StoreAppsListResponse, AppConfigResponse } from '../../api/apps';
import { Grid, Download, Trash2, Settings, RefreshCw, Check, Search, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

export const AppsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'installed' | 'store'>('installed');
    const queryClient = useQueryClient();
    const [configModalApp, setConfigModalApp] = useState<string | null>(null);
    const [configContent, setConfigContent] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedApps, setExpandedApps] = useState<Set<string>>(new Set());

    const toggleAppExpansion = (appName: string) => {
        setExpandedApps(prev => {
            const next = new Set(prev);
            if (next.has(appName)) next.delete(appName);
            else next.add(appName);
            return next;
        });
    };

    // --- Queries ---
    const installedAppsQuery = useQuery({
        queryKey: ['apps', 'installed'],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<AppsListResponse>>('/apps/list');
            return response.data.response.apps;
        }
    });

    const storeAppsQuery = useQuery({
        queryKey: ['apps', 'store'],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<StoreAppsListResponse>>('/apps/listStoreApps');
            return response.data.response.storeApps;
        },
        enabled: activeTab === 'store'
    });

    const appConfigQuery = useQuery({
        queryKey: ['apps', 'config', configModalApp],
        queryFn: async () => {
            if (!configModalApp) return null;
            const response = await apiClient.get<ApiResponse<AppConfigResponse>>('/apps/config/get', {
                params: { name: configModalApp }
            });
            return response.data.response.config;
        },
        enabled: !!configModalApp
    });

    // Sync config content when query fetches
    React.useEffect(() => {
        if (appConfigQuery.data) setConfigContent(appConfigQuery.data);
    }, [appConfigQuery.data]);


    // --- Mutations ---
    const installMutation = useMutation({
        mutationFn: async ({ name, url }: { name: string; url: string }) => {
            await apiClient.get('/apps/downloadAndInstall', { params: { name, url } });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apps'] });
            toast.success('App installed successfully!');
        },
        onError: () => {
            toast.error('Failed to install app');
        }
    });

    const updateStoreMutation = useMutation({
        mutationFn: async ({ name, url }: { name: string; url: string }) => {
            await apiClient.get('/apps/downloadAndUpdate', { params: { name, url } });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apps'] });
            toast.success('App updated successfully!');
        },
        onError: () => {
            toast.error('Failed to update app');
        }
    });

    const uninstallMutation = useMutation({
        mutationFn: async (name: string) => {
            await apiClient.get('/apps/uninstall', { params: { name } });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['apps'] });
            toast.success('App uninstalled successfully');
        },
        onError: () => {
            toast.error('Failed to uninstall app');
        }
    });

    const saveConfigMutation = useMutation({
        mutationFn: async ({ name, config }: { name: string; config: string }) => {
            const formData = new FormData();
            formData.append('config', config);
            await apiClient.post('/apps/config/set', formData, {
                params: { name }
            });
        },
        onSuccess: () => {
            setConfigModalApp(null);
            toast.success('Configuration saved!');
        },
        onError: () => {
            toast.error('Failed to save configuration');
        }
    });

    // --- UI Helpers ---
    const handleOpenConfig = (appName: string) => {
        setConfigModalApp(appName);
    };

    // --- Filtering ---
    const filteredInstalledApps = installedAppsQuery.data?.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const filteredStoreApps = storeAppsQuery.data?.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                        <Grid className="text-primary" />
                        Apps
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage installed DNS applications.</p>
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search apps..."
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-slate-800 flex gap-6">
                <button
                    onClick={() => setActiveTab('installed')}
                    className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'installed' ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                    Installed ({installedAppsQuery.data?.length || 0})
                    {activeTab === 'installed' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('store')}
                    className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'store' ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                    App Store
                    {activeTab === 'store' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                </button>
            </div>

            {/* Config Modal */}
            {configModalApp && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Config: {configModalApp}</h3>
                            <button onClick={() => setConfigModalApp(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">Close</button>
                        </div>
                        <div className="p-4 flex-1 overflow-auto">
                            {appConfigQuery.isLoading ? (
                                <div className="text-center py-8 text-slate-500">Loading config...</div>
                            ) : (
                                <textarea
                                    className="w-full h-96 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl p-4 font-mono text-sm text-slate-800 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                                    value={configContent}
                                    onChange={(e) => setConfigContent(e.target.value)}
                                />
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-200 dark:border-slate-800 flex justify-end gap-3">
                            <button onClick={() => setConfigModalApp(null)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">Cancel</button>
                            <button
                                onClick={() => saveConfigMutation.mutate({ name: configModalApp, config: configContent })}
                                disabled={saveConfigMutation.isPending}
                                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium shadow-md shadow-primary/20 active:scale-95 transition-all"
                            >
                                {saveConfigMutation.isPending ? 'Saving...' : 'Save Config'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Installed Apps List */}
            {activeTab === 'installed' && (
                <div className="space-y-4">
                    {installedAppsQuery.isLoading ? (<div className="text-slate-500 text-center py-8">Loading apps...</div>)
                        : filteredInstalledApps.length === 0 ? (<div className="text-slate-500 text-center py-8">No apps found.</div>)
                            : filteredInstalledApps.map(app => (
                                <div key={app.name} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                    <div className="p-4 flex flex-col md:flex-row items-center gap-4">
                                        <div className="flex-1 flex items-center justify-between w-full md:w-auto min-w-0">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className="flex flex-col min-w-0">
                                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white truncate">{app.name}</h3>
                                                    {app.updateUrl && (
                                                        <a href={app.updateUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-primary transition-colors truncate" onClick={(e) => e.stopPropagation()}>
                                                            {app.updateUrl}
                                                        </a>
                                                    )}
                                                </div>
                                                <span className="text-xs font-mono bg-gray-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded whitespace-nowrap">v{app.version}</span>
                                                {app.updateAvailable && (
                                                    <span className="bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-500 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/20 whitespace-nowrap">Update</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                            <button
                                                onClick={() => handleOpenConfig(app.name)}
                                                className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                                            >
                                                <Settings size={14} /> Config
                                            </button>
                                            {app.updateAvailable && (
                                                <button
                                                    onClick={() => updateStoreMutation.mutate({ name: app.name, url: app.updateUrl })}
                                                    className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors shadow-sm"
                                                    title="Update from Store"
                                                >
                                                    <RefreshCw size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => { if (confirm(`Uninstall ${app.name}?`)) uninstallMutation.mutate(app.name); }}
                                                className="p-1.5 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-500/20 transition-colors"
                                                title="Uninstall"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => toggleAppExpansion(app.name)}
                                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                            >
                                                {expandedApps.has(app.name) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                    {expandedApps.has(app.name) && (
                                        <div className="px-4 pb-4 pt-0 text-sm text-slate-600 dark:text-slate-400 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30">
                                            <div className="pt-3">
                                                <p>{app.description}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                </div>
            )}

            {/* Store Apps List */}
            {activeTab === 'store' && (
                <div className="space-y-4">
                    {storeAppsQuery.isLoading ? (<div className="text-slate-500 text-center py-8">Loading store...</div>)
                        : filteredStoreApps.length === 0 ? (<div className="text-slate-500 text-center py-8">No apps found matching "{searchQuery}"</div>)
                            : filteredStoreApps.map(app => (
                                <div key={app.name} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                    <div className="p-4 flex flex-col md:flex-row items-center gap-4">
                                        <div className="flex-1 flex items-center justify-between w-full md:w-auto min-w-0">
                                            <div className="flex flex-col min-w-0">
                                                <h3 className="font-bold text-lg text-slate-800 dark:text-white truncate">{app.name}</h3>
                                                <a href={app.url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-primary transition-colors truncate" onClick={(e) => e.stopPropagation()}>
                                                    {app.url}
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 whitespace-nowrap">
                                                    <span className="text-xs font-mono bg-gray-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded">v{app.version}</span>
                                                    <span className="text-xs font-mono bg-gray-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded">{app.size}</span>
                                                </div>
                                                {app.installed && (
                                                    <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-500 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-1 whitespace-nowrap">
                                                        <Check size={10} /> Installed
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                            {app.installed ? (
                                                app.updateAvailable ? (
                                                    <button
                                                        onClick={() => updateStoreMutation.mutate({ name: app.name, url: app.url })}
                                                        disabled={updateStoreMutation.isPending && updateStoreMutation.variables?.name === app.name}
                                                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                                                    >
                                                        {updateStoreMutation.isPending && updateStoreMutation.variables?.name === app.name ? (
                                                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                                                        ) : <RefreshCw size={14} />}
                                                        {updateStoreMutation.isPending && updateStoreMutation.variables?.name === app.name ? 'Updating...' : 'Update'}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => { if (confirm(`Uninstall ${app.name}?`)) uninstallMutation.mutate(app.name); }}
                                                        disabled={uninstallMutation.isPending && uninstallMutation.variables === app.name}
                                                        className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                                                    >
                                                        {uninstallMutation.isPending && uninstallMutation.variables === app.name ? '...' : 'Uninstall'}
                                                    </button>
                                                )
                                            ) : (
                                                <button
                                                    onClick={() => installMutation.mutate({ name: app.name, url: app.url })}
                                                    disabled={installMutation.isPending && installMutation.variables?.name === app.name}
                                                    className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-bold transition-all shadow-md shadow-primary/20 active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:active:scale-100"
                                                >
                                                    {installMutation.isPending && installMutation.variables?.name === app.name ? (
                                                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                                                    ) : <Download size={14} />}
                                                    {installMutation.isPending && installMutation.variables?.name === app.name ? 'Installing...' : 'Install'}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => toggleAppExpansion(app.name)}
                                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                            >
                                                {expandedApps.has(app.name) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                    {expandedApps.has(app.name) && (
                                        <div className="px-4 pb-4 pt-0 text-sm text-slate-600 dark:text-slate-400 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30">
                                            <div className="pt-3">
                                                <p>{app.description}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                </div>
            )
            }
        </div >
    );
};
