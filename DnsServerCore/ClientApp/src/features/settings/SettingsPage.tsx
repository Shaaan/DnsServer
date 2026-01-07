import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient, type ApiResponse } from '../../api/client';
import type { SettingsResponse } from '../../api/settings';
import { Skeleton } from '../../components/ui/Skeleton';
import { Settings, Save, RotateCw, Database } from 'lucide-react';
import toast from 'react-hot-toast';
import { GeneralSettings } from './GeneralSettings';
import { BlockingSettings } from './BlockingSettings';
import { WebServiceSettings } from './WebServiceSettings';
import { ProtocolSettings } from './ProtocolSettings';
import { TsigSettings } from './TsigSettings';
import { RecursionSettings } from './RecursionSettings';
import { CacheSettings } from './CacheSettings';
import { ProxyForwarderSettings } from './ProxyForwarderSettings';
import { LoggingSettings } from './LoggingSettings';
import { BackupRestoreModal } from '../admin/modals/BackupRestoreModal';

// ...existing code...
/**
 * Settings Page
 * 
 * Configures global server settings.
 * Features:
 * - Forwarders configuration
 * - Network interfaces binding
 * - Logging options
 * - Cache settings
 */
export const SettingsPage: React.FC = () => {
    // ...
    const [activeTab, setActiveTab] = useState('general');
    const [node, setNode] = useState('');
    const [formData, setFormData] = useState<SettingsResponse | null>(null);
    const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

    const settingsQuery = useQuery({
        queryKey: ['settings', node],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<SettingsResponse>>('/settings/get', {
                params: { node }
            });
            return response.data.response;
        }
    });

    // Update form data when query data changes
    React.useEffect(() => {
        if (settingsQuery.data) {
            setFormData(settingsQuery.data);
        }
    }, [settingsQuery.data]);

    const handleChange = (field: keyof SettingsResponse, value: any) => {
        if (!formData) return;
        setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
    };

    const saveMutation = useMutation({
        mutationFn: async (data: SettingsResponse) => {
            // Clone data to avoid mutating state and handle type conversions
            const payload = { ...data } as any;

            // Backend expects strings for socketPoolExcludedPorts parsing (due to ushort.Parse)
            if (payload.socketPoolExcludedPorts && Array.isArray(payload.socketPoolExcludedPorts)) {
                payload.socketPoolExcludedPorts = payload.socketPoolExcludedPorts.map(String);
            }

            // Flatten Proxy object (Backend expects flat fields like proxyType, proxyAddress, etc.)
            if (payload.proxy) {
                payload.proxyType = payload.proxy.type;
                payload.proxyAddress = payload.proxy.address;
                payload.proxyPort = payload.proxy.port;
                payload.proxyUsername = payload.proxy.username;
                payload.proxyPassword = payload.proxy.password;
                payload.proxyBypass = payload.proxy.bypass;
                delete payload.proxy;
            } else {
                // If explicitly null/undefined, ensure it's disabled if that's the intent, 
                // typically backend checks proxyType == None for disabling.
                // However, if we just receive data without proxy, we might assume no change? 
                // But usage in SettingsPage implies 'null' means no proxy.
                // Let's check logic: if (formData.proxy === null) ... 
                // Backend: if (request.TryGetQueryOrFormEnum("proxyType", out ...))
                // effectively we should send proxyType: 'None' if we want to disable it.
                // But adhering to 'if payload.proxy is null' -> we send proxyType: 'None'
                if (data.proxy === null) {
                    payload.proxyType = 'None';
                }
            }

            await apiClient.post('/settings/set', payload, {
                params: { node }
            });
        },
        onSuccess: () => {
            toast.success('Settings saved successfully');
            settingsQuery.refetch();
        },
        onError: () => {
            toast.error('Failed to save settings');
        }
    });

    if (settingsQuery.isLoading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <Skeleton className="h-8 w-32" />
                        </div>
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-48 rounded-lg" />
                        <Skeleton className="h-10 w-32 rounded-lg" />
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 md:col-span-3 lg:col-span-2 space-y-1">
                        {[...Array(9)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full rounded-xl" />
                        ))}
                    </div>
                    <div className="col-span-12 md:col-span-9 lg:col-span-10 bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl p-6 min-h-[600px] shadow-soft-xl dark:shadow-none space-y-6">
                        <Skeleton className="h-8 w-1/3 mb-6" />
                        <div className="space-y-4">
                            <Skeleton className="h-24 w-full rounded-xl" />
                            <Skeleton className="h-24 w-full rounded-xl" />
                            <Skeleton className="h-24 w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (settingsQuery.isError) {
        return <div className="p-8 text-center text-red-400">Error loading settings.</div>;
    }

    // Use formData for rendering if available, else fallback to query data (initial load)
    const data = formData || settingsQuery.data;

    if (!data) return null;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                        <Settings className="text-primary" size={32} />
                        Settings
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Configure server settings and options.</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                        value={node}
                        onChange={(e) => setNode(e.target.value)}
                    >
                        <option value="">This Server</option>
                        {settingsQuery.data?.clusterNodes?.map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => setIsBackupModalOpen(true)}
                        className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors"
                    >
                        <Database size={18} />
                        Backup / Restore
                    </button>
                    <button
                        onClick={() => saveMutation.mutate(data)}
                        disabled={saveMutation.isPending}
                        className="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                    >
                        {saveMutation.isPending ? <RotateCw className="animate-spin" size={18} /> : <Save size={18} />}
                        {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-slate-800 flex gap-6 overflow-x-auto">
                {[
                    { id: 'general', label: 'General' },
                    { id: 'web-service', label: 'Web Service' },
                    { id: 'protocols', label: 'Optional Protocols' },
                    { id: 'tsig', label: 'TSIG' },
                    { id: 'recursion', label: 'Recursion' },
                    { id: 'cache', label: 'Cache' },
                    { id: 'blocking', label: 'Blocking' },
                    { id: 'proxy', label: 'Proxy & Forwarders' },
                    { id: 'logging', label: 'Logging' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-3 text-sm font-bold transition-colors relative whitespace-nowrap ${activeTab === tab.id
                            ? 'text-primary'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft-xl dark:shadow-none min-h-[600px]">
                {activeTab === 'general' && data && (
                    <GeneralSettings data={data} onChange={handleChange} />
                )}

                {activeTab === 'web-service' && data && (
                    <WebServiceSettings data={data} onChange={handleChange} />
                )}

                {activeTab === 'protocols' && data && (
                    <ProtocolSettings data={data} onChange={handleChange} />
                )}

                {activeTab === 'tsig' && data && (
                    <TsigSettings data={data} onChange={handleChange} />
                )}

                {activeTab === 'recursion' && data && (
                    <RecursionSettings data={data} onChange={handleChange} />
                )}

                {activeTab === 'cache' && data && (
                    <CacheSettings data={data} onChange={handleChange} />
                )}

                {activeTab === 'blocking' && data && (
                    <BlockingSettings data={data} onChange={handleChange} />
                )}

                {activeTab === 'proxy' && data && (
                    <ProxyForwarderSettings data={data} onChange={handleChange} />
                )}

                {activeTab === 'logging' && data && (
                    <LoggingSettings data={data} onChange={handleChange} />
                )}
            </div>

            <BackupRestoreModal
                isOpen={isBackupModalOpen}
                onClose={() => setIsBackupModalOpen(false)}
            />
        </div >
    );
};
