import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type ApiResponse } from '../../api/client';
import type { DhcpScopesResponse, DhcpLeasesResponse } from '../../api/dhcp';
import { Network, Plus, Trash2, Edit2, Play, Pause, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const DhcpPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'scopes' | 'leases'>('scopes');
    const queryClient = useQueryClient();
    const [searchLeases, setSearchLeases] = useState('');

    const scopesQuery = useQuery({
        queryKey: ['dhcp-scopes'],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<DhcpScopesResponse>>('/dhcp/scopes/list');
            return response.data.response.scopes;
        }
    });

    const leasesQuery = useQuery({
        queryKey: ['dhcp-leases'],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<DhcpLeasesResponse>>('/dhcp/leases/list');
            return response.data.response.leases;
        }
    });

    const scopeActionMutation = useMutation({
        mutationFn: async ({ name, action }: { name: string; action: 'enable' | 'disable' | 'delete' }) => {
            await apiClient.get(`/dhcp/scopes/${action}`, { params: { name } });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['dhcp-scopes'] });
            const actionText = variables.action === 'delete' ? 'deleted' : variables.action === 'enable' ? 'enabled' : 'disabled';
            toast.success(`Scope ${actionText} successfully`);
        },
        onError: () => {
            toast.error('Failed to update scope');
        }
    });

    const leaseActionMutation = useMutation({
        mutationFn: async ({ scope, clientIdentifier, action }: { scope: string; clientIdentifier: string; action: 'remove' | 'convertToReserved' | 'convertToDynamic' }) => {
            // Mapping action to endpoint
            let endpoint = 'remove';
            if (action === 'convertToReserved') endpoint = 'convertToReserved';
            if (action === 'convertToDynamic') endpoint = 'convertToDynamic';

            await apiClient.get(`/dhcp/leases/${endpoint}`, { params: { name: scope, clientIdentifier } });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['dhcp-leases'] });
            let actionText = 'removed';
            if (variables.action === 'convertToReserved') actionText = 'converted to reserved';
            if (variables.action === 'convertToDynamic') actionText = 'converted to dynamic';
            toast.success(`Lease ${actionText} successfully`);
        },
        onError: () => {
            toast.error('Failed to update lease');
        }
    });

    const filteredLeases = leasesQuery.data?.filter(l =>
        l.hostName?.toLowerCase().includes(searchLeases.toLowerCase()) ||
        l.address.includes(searchLeases) ||
        l.hardwareAddress.toLowerCase().includes(searchLeases.toLowerCase())
    ) || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                        <Network className="text-blue-500" />
                        DHCP Server
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage IP address pools and client leases.</p>
                </div>
                {activeTab === 'scopes' && (
                    <Link to="/dhcp/scopes/new" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all font-bold text-sm">
                        <Plus size={18} />
                        <span>Add Scope</span>
                    </Link>
                )}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-slate-800 flex gap-6">
                <button
                    onClick={() => setActiveTab('scopes')}
                    className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'scopes' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                    Scopes ({scopesQuery.data?.length || 0})
                    {activeTab === 'scopes' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('leases')}
                    className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'leases' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                    Leases ({leasesQuery.data?.length || 0})
                    {activeTab === 'leases' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" />}
                </button>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-soft-md">
                {activeTab === 'scopes' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-gray-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Scope Name</th>
                                    <th className="px-6 py-4 font-bold">Range</th>
                                    <th className="px-6 py-4 font-bold">Network</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 text-right font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                                {scopesQuery.isLoading ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading scopes...</td></tr>
                                ) : scopesQuery.data?.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No scopes defined</td></tr>
                                ) : (
                                    scopesQuery.data?.map((scope) => (
                                        <tr key={scope.name} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">{scope.name}</td>
                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                <div className="font-medium">{scope.startingAddress} - {scope.endingAddress}</div>
                                                <div className="text-xs opacity-75">{scope.subnetMask}</div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                                                <div>{scope.networkAddress}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${scope.enabled ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${scope.enabled ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                                                    {scope.enabled ? 'Enabled' : 'Disabled'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {scope.enabled ? (
                                                        <button
                                                            onClick={() => scopeActionMutation.mutate({ name: scope.name, action: 'disable' })}
                                                            className="p-2 text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors"
                                                            title="Disable Scope"
                                                        >
                                                            <Pause size={18} />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => scopeActionMutation.mutate({ name: scope.name, action: 'enable' })}
                                                            className="p-2 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
                                                            title="Enable Scope"
                                                        >
                                                            <Play size={18} />
                                                        </button>
                                                    )}
                                                    <Link
                                                        to={`/dhcp/scopes/${encodeURIComponent(scope.name)}`}
                                                        className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                                                        title="Edit Scope"
                                                    >
                                                        <Edit2 size={18} />
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm(`Delete scope ${scope.name}?`)) scopeActionMutation.mutate({ name: scope.name, action: 'delete' });
                                                        }}
                                                        className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Delete Scope"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex gap-4 bg-gray-50 dark:bg-slate-900/50">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search leases..."
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                                    value={searchLeases}
                                    onChange={(e) => setSearchLeases(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-gray-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">IP Address</th>
                                        <th className="px-6 py-4 font-bold">MAC Address</th>
                                        <th className="px-6 py-4 font-bold">Hostname</th>
                                        <th className="px-6 py-4 font-bold">Scope</th>
                                        <th className="px-6 py-4 font-bold">Type</th>
                                        <th className="px-6 py-4 font-bold">Expires</th>
                                        <th className="px-6 py-4 text-right font-bold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                                    {leasesQuery.isLoading ? (
                                        <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading leases...</td></tr>
                                    ) : filteredLeases.length === 0 ? (
                                        <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">No leases found</td></tr>
                                    ) : (
                                        filteredLeases.map((lease) => (
                                            <tr key={lease.clientIdentifier + lease.address} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4 font-mono text-emerald-600 dark:text-emerald-400 font-medium">{lease.address}</td>
                                                <td className="px-6 py-4 font-mono text-slate-500 dark:text-slate-400 text-xs uppercase">{lease.hardwareAddress}</td>
                                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">{lease.hostName}</td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{lease.scope}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${lease.type === 'Reserved' ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20' : 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20'}`}>
                                                        {lease.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                                                    {new Date(lease.leaseExpires).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {lease.type === 'Dynamic' && (
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(`Convert lease ${lease.address} to reserved?`)) leaseActionMutation.mutate({ scope: lease.scope, clientIdentifier: lease.clientIdentifier, action: 'convertToReserved' });
                                                                }}
                                                                className="p-2 text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-lg transition-colors"
                                                                title="Convert to Reserved"
                                                            >
                                                                <Edit2 size={18} />
                                                            </button>
                                                        )}
                                                        {lease.type === 'Reserved' && (
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(`Convert lease ${lease.address} to dynamic?`)) leaseActionMutation.mutate({ scope: lease.scope, clientIdentifier: lease.clientIdentifier, action: 'convertToDynamic' });
                                                                }}
                                                                className="p-2 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                                                                title="Convert to Dynamic"
                                                            >
                                                                <Edit2 size={18} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`Remove lease for ${lease.address}?`)) leaseActionMutation.mutate({ scope: lease.scope, clientIdentifier: lease.clientIdentifier, action: 'remove' });
                                                            }}
                                                            className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                            title="Remove Lease"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
