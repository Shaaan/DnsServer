import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { apiClient, type ApiResponse } from '../../api/client';
import type { DnsClientResolveResponse } from '../../api/dnsClient';
import { Search, Globe, Shield, Network, Server, Play, AlertTriangle } from 'lucide-react';

// ...existing code...
/**
 * DNS Client Page
 * 
 * A UI tool for performing DNS lookups directly from the server.
 * Supports various record types, protocols, and optional DNSSEC validation.
 */
export const DnsClientPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [domain, setDomain] = useState(searchParams.get('domain') || '');
    const [type, setType] = useState(searchParams.get('type') || 'A');
    const [server, setServer] = useState(searchParams.get('server') || 'This Server {this-server}');
    const [protocol, setProtocol] = useState<'UDP' | 'TCP' | 'TLS' | 'HTTPS' | 'QUIC'>((searchParams.get('protocol') as any) || 'UDP');
    const [dnssec, setDnssec] = useState(false);
    const [subnet, setSubnet] = useState('');

    // We use a separate state to trigger the query to avoid searching on every keystroke
    const [queryTrigger, setQueryTrigger] = useState(0);

    const { data, error, isFetching } = useQuery({
        queryKey: ['dns-resolve', queryTrigger],
        queryFn: async () => {
            if (!domain) return null;

            const response = await apiClient.get<ApiResponse<DnsClientResolveResponse>>('/dnsClient/resolve', {
                params: {
                    server: server === 'This Server {this-server}' ? 'this-server' : server,
                    domain,
                    type,
                    protocol,
                    dnssec,
                    eDnsClientSubnet: subnet,
                    node: ''
                }
            });
            return response.data.response;
        },
        enabled: queryTrigger > 0,
        retry: false
    });

    const handleResolve = (e: React.FormEvent) => {
        e.preventDefault();
        if (domain) {
            setQueryTrigger(prev => prev + 1);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">DNS Client</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Resolve DNS queries from the server.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Request Form */}
                <div className="lg:col-span-1 space-y-4">
                    <form onSubmit={handleResolve} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-soft-xl">
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Domain</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                    placeholder="example.com"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Type</label>
                                <div className="relative">
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium"
                                    >
                                        {['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'PTR', 'SRV', 'SOA', 'CAA', 'DS', 'DNSKEY'].map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Protocol</label>
                                <div className="relative">
                                    <select
                                        value={protocol}
                                        onChange={(e) => setProtocol(e.target.value as any)}
                                        className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none font-medium"
                                    >
                                        <option value="UDP">UDP</option>
                                        <option value="TCP">TCP</option>
                                        <option value="TLS">TLS</option>
                                        <option value="HTTPS">HTTPS</option>
                                        <option value="QUIC">QUIC</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Name Server</label>
                            <div className="relative">
                                <Server className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={server}
                                    onChange={(e) => setServer(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                    placeholder="8.8.8.8"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">EDNS Subnet (Optional)</label>
                            <div className="relative">
                                <Network className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={subnet}
                                    onChange={(e) => setSubnet(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                    placeholder="1.2.3.0/24"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="dnssec"
                                checked={dnssec}
                                onChange={(e) => setDnssec(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 bg-gray-50 dark:bg-slate-800"
                            />
                            <label htmlFor="dnssec" className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer select-none">
                                <Shield size={16} className="text-slate-400" /> Enable DNSSEC Validation
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isFetching || !domain}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            {isFetching ? 'Resolving...' : (
                                <>
                                    <Play size={18} /> Resolve
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Response Display */}
                <div className="lg:col-span-2">
                    {error ? (
                        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-8 text-center text-red-600 dark:text-red-400 shadow-soft-md">
                            <AlertTriangle className="mx-auto h-10 w-10 mb-3 opacity-50" />
                            <p className="font-bold text-lg">Failed to resolve query.</p>
                            <p className="text-sm mt-1 opacity-75">{(error as any).response?.data?.errorMessage || (error as Error).message}</p>
                        </div>
                    ) : data ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {data.warningMessage && (
                                <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 flex items-start gap-3 text-amber-700 dark:text-amber-400 shadow-sm">
                                    <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                                    <span className="font-medium">{data.warningMessage}</span>
                                </div>
                            )}

                            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-soft-md">
                                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Result</span>
                                </div>
                                <div className="p-0 overflow-x-auto">
                                    <pre className="p-6 text-xs font-mono text-slate-700 dark:text-white/90 bg-white dark:bg-slate-950/50 leading-relaxed">
                                        {JSON.stringify(data.result, null, 2)}
                                    </pre>
                                </div>
                            </div>

                            {data.rawResponses && data.rawResponses.length > 0 && (
                                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-soft-md">
                                    <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Raw Responses ({data.rawResponses.length})</span>
                                    </div>
                                    <div className="divide-y divide-gray-100 dark:divide-slate-800">
                                        {data.rawResponses.map((resp: any, i: number) => (
                                            <pre key={i} className="p-6 text-xs font-mono text-slate-600 dark:text-slate-400 overflow-x-auto bg-white dark:bg-slate-950/30">
                                                {JSON.stringify(resp, null, 2)}
                                            </pre>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-4 min-h-[400px] border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-3xl bg-gray-50/50 dark:bg-slate-900/30">
                            <Search size={64} className="opacity-20" />
                            <p className="font-medium">Enter a domain and click Resolve to see results.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
