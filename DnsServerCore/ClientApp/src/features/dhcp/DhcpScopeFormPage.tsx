import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type ApiResponse } from '../../api/client';
import type { DhcpScopeDetails } from '../../api/dhcp';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const DhcpScopeFormPage: React.FC = () => {
    const { scopeName } = useParams();
    const isEdit = !!scopeName && scopeName !== 'new';
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<Partial<DhcpScopeDetails>>({
        name: '',
        startingAddress: '',
        endingAddress: '',
        subnetMask: '255.255.255.0',
        leaseTimeDays: 1,
        leaseTimeHours: 0,
        leaseTimeMinutes: 0,
        routerAddress: '',
        dnsServers: [], // will be comma separated string in input
        domainName: '',
        dnsUpdates: true,
        useThisDnsServer: false
    });

    const [dnsServersInput, setDnsServersInput] = useState('');

    const { data: scopeDetails, isLoading } = useQuery({
        queryKey: ['dhcp-scope', scopeName],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<DhcpScopeDetails>>('/dhcp/scopes/get', {
                params: { name: scopeName }
            });
            return response.data.response;
        },
        enabled: isEdit
    });

    useEffect(() => {
        if (scopeDetails) {
            setFormData(scopeDetails);
            setDnsServersInput(scopeDetails.dnsServers?.join(', ') || '');
        }
    }, [scopeDetails]);

    const saveMutation = useMutation({
        mutationFn: async (data: Partial<DhcpScopeDetails>) => {
            const params = new URLSearchParams();
            params.append('name', isEdit ? scopeName! : data.name!);
            if (isEdit && data.name !== scopeName) params.append('newName', data.name!);

            params.append('startingAddress', data.startingAddress || '');
            params.append('endingAddress', data.endingAddress || '');
            params.append('subnetMask', data.subnetMask || '');

            // Lease time
            params.append('leaseTimeDays', String(data.leaseTimeDays || 0));
            params.append('leaseTimeHours', String(data.leaseTimeHours || 0));
            params.append('leaseTimeMinutes', String(data.leaseTimeMinutes || 0));

            params.append('routerAddress', data.routerAddress || '');
            params.append('domainName', data.domainName || '');
            params.append('dnsUpdates', String(!!data.dnsUpdates));

            // DNS Servers
            const dnsList = dnsServersInput.split(',').map(s => s.trim()).filter(Boolean);
            if (dnsList.length > 0) {
                params.append('dnsServers', dnsList.join(','));
            }

            // Defaults for others to avoid errors if API requires them
            params.append('offerDelayTime', '0');
            params.append('pingCheckEnabled', 'false');
            params.append('pingCheckTimeout', '1000');
            params.append('pingCheckRetries', '2');
            params.append('useThisDnsServer', 'false'); // Simplified for now

            // Advanced
            if (formData.ntpServers && formData.ntpServers.length > 0) params.append('ntpServers', formData.ntpServers.join(','));
            if (formData.winsServers && formData.winsServers.length > 0) params.append('winsServers', formData.winsServers.join(','));
            if (formData.domainSearchList && formData.domainSearchList.length > 0) params.append('domainSearchList', formData.domainSearchList.join(','));

            params.append('bootServerAddress', formData.bootServerAddress || '');
            params.append('bootFileName', formData.bootFileName || '');
            params.append('webProxyAutoDiscoveryUrl', formData.webProxyAutoDiscoveryUrl || '');

            // We use POST with form data
            await apiClient.post('/dhcp/scopes/set', params);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dhcp-scopes'] });
            toast.success(`Scope ${isEdit ? 'updated' : 'created'} successfully`);
            navigate('/dhcp');
        },
        onError: () => {
            toast.error(`Failed to ${isEdit ? 'update' : 'create'} scope`);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        saveMutation.mutate(formData);
    };

    if (isEdit && isLoading) return <div className="p-8 text-center text-slate-500">Loading scope details...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <button
                onClick={() => navigate('/dhcp')}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
                <ArrowLeft size={16} />
                <span>Back to DHCP</span>
            </button>

            <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                    {isEdit ? 'Edit Scope' : 'Add New Scope'}
                </h2>
                <p className="text-slate-400 mt-1">Configure IP address pool and network settings.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* General Settings */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-medium text-white border-b border-slate-800 pb-2">General Settings</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-400 mb-1">Scope Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name || ''}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="My LAN Scope"
                            />
                            <p className="text-xs text-slate-500 mt-1">The name of the DHCP scope.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Starting IP Address</label>
                            <input
                                type="text"
                                required
                                value={formData.startingAddress || ''}
                                onChange={e => setFormData({ ...formData, startingAddress: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                placeholder="192.168.1.100"
                            />
                            <p className="text-xs text-slate-500 mt-1">The starting IP address of the DHCP scope.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Ending IP Address</label>
                            <input
                                type="text"
                                required
                                value={formData.endingAddress || ''}
                                onChange={e => setFormData({ ...formData, endingAddress: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                placeholder="192.168.1.200"
                            />
                            <p className="text-xs text-slate-500 mt-1">The ending IP address of the DHCP scope.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Subnet Mask</label>
                            <input
                                type="text"
                                required
                                value={formData.subnetMask || ''}
                                onChange={e => setFormData({ ...formData, subnetMask: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                placeholder="255.255.255.0"
                            />
                            <p className="text-xs text-slate-500 mt-1">The subnet mask of the network.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-2">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Lease Days</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.leaseTimeDays}
                                onChange={e => setFormData({ ...formData, leaseTimeDays: parseInt(e.target.value) || 0 })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Hours</label>
                            <input
                                type="number"
                                min="0" max="23"
                                value={formData.leaseTimeHours}
                                onChange={e => setFormData({ ...formData, leaseTimeHours: parseInt(e.target.value) || 0 })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Minutes</label>
                            <input
                                type="number"
                                min="0" max="59"
                                value={formData.leaseTimeMinutes}
                                onChange={e => setFormData({ ...formData, leaseTimeMinutes: parseInt(e.target.value) || 0 })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Network Settings */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-medium text-white border-b border-slate-800 pb-2">Network Configuration</h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Router (Gateway) Address</label>
                            <input
                                type="text"
                                value={formData.routerAddress || ''}
                                onChange={e => setFormData({ ...formData, routerAddress: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                placeholder="192.168.1.1"
                            />
                            <p className="text-xs text-slate-500 mt-1">The default gateway IP address to be used by the clients. (Option 3)</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">DNS Servers (comma separated)</label>
                            <input
                                type="text"
                                value={dnsServersInput}
                                onChange={e => setDnsServersInput(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                placeholder="8.8.8.8, 1.1.1.1"
                            />
                            <p className="text-xs text-slate-500 mt-1">A comma separated list of DNS server IP addresses to be used by the clients. (Option 6)</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Domain Name</label>
                            <input
                                type="text"
                                value={formData.domainName || ''}
                                onChange={e => setFormData({ ...formData, domainName: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="lan"
                            />
                            <p className="text-xs text-slate-500 mt-1">The domain name to be used by this network. (Option 15)</p>
                        </div>
                    </div>
                </div>

                {/* Advanced Settings */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-medium text-white border-b border-slate-800 pb-2">Advanced Options</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">NTP Servers (comma separated)</label>
                            <input
                                type="text"
                                value={formData.ntpServers?.join(', ') || ''}
                                onChange={e => setFormData({ ...formData, ntpServers: e.target.value.split(',').map(s => s.trim()) })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                placeholder="time.google.com"
                            />
                            <p className="text-xs text-slate-500 mt-1">A comma separated list of Network Time Protocol (NTP) server IP addresses to be used by the clients. (Option 42)</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">WINS Servers (comma separated)</label>
                            <input
                                type="text"
                                value={formData.winsServers?.join(', ') || ''}
                                onChange={e => setFormData({ ...formData, winsServers: e.target.value.split(',').map(s => s.trim()) })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                            />
                            <p className="text-xs text-slate-500 mt-1">A comma separated list of NBNS/WINS server IP addresses to be used by the clients. (Option 44)</p>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-400 mb-1">Domain Search List (comma separated)</label>
                            <input
                                type="text"
                                value={formData.domainSearchList?.join(', ') || ''}
                                onChange={e => setFormData({ ...formData, domainSearchList: e.target.value.split(',').map(s => s.trim()) })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                placeholder="example.com, lan"
                            />
                            <p className="text-xs text-slate-500 mt-1">A comma separated list of domain names that the clients can use as a suffix when searching a domain name. (Option 119)</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Boot Server Address</label>
                            <input
                                type="text"
                                value={formData.bootServerAddress || ''}
                                onChange={e => setFormData({ ...formData, bootServerAddress: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                            />
                            <p className="text-xs text-slate-500 mt-1">The IP address of next server (TFTP) to use in bootstrap by the clients. (siaddr)</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Boot File Name</label>
                            <input
                                type="text"
                                value={formData.bootFileName || ''}
                                onChange={e => setFormData({ ...formData, bootFileName: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <p className="text-xs text-slate-500 mt-1">The boot file name stored on the bootstrap TFTP server to be used by the clients. (file/Option 67)</p>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-400 mb-1">PAC URL (Web Proxy Auto Discovery)</label>
                            <input
                                type="text"
                                value={formData.webProxyAutoDiscoveryUrl || ''}
                                onChange={e => setFormData({ ...formData, webProxyAutoDiscoveryUrl: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <p className="text-xs text-slate-500 mt-1">The Web Proxy Auto Discovery URL. (Option 252)</p>
                        </div>
                    </div>
                </div>

                {saveMutation.isError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3 text-red-400">
                        <AlertCircle className="shrink-0 mt-0.5" size={18} />
                        <div>
                            <p className="font-medium">Failed to save scope</p>
                            <p className="text-sm opacity-75">{(saveMutation.error as any).response?.data?.errorMessage || (saveMutation.error as Error).message}</p>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/dhcp')}
                        className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saveMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save size={18} />
                        {saveMutation.isPending ? 'Saving...' : 'Save Scope'}
                    </button>
                </div>
            </form>
        </div>
    );
};
