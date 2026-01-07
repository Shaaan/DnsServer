import React from 'react';
import type { SettingsResponse } from '../../api/settings';
import { Globe, Terminal } from 'lucide-react'; // Assuming these icons are imported from lucide-react

interface ProxyForwarderSettingsProps {
    data: SettingsResponse;
    onChange: (field: keyof SettingsResponse, value: any) => void;
}

export const ProxyForwarderSettings: React.FC<ProxyForwarderSettingsProps> = ({ data, onChange }) => {
    const updateProxy = (field: string, value: any) => {
        onChange('proxy', { ...(data.proxy || {}), [field]: value });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Forwarders */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                    <Globe size={20} className="text-slate-400" />
                    Forwarding
                </h3>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">DNS Forwarders</label>
                        <textarea
                            value={data.forwarders?.join('\n') || ''}
                            onChange={(e) => onChange('forwarders', e.target.value.split('\n').map(s => s.trim()))}
                            rows={4}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm transition-shadow"
                            placeholder="8.8.8.8"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">A comma separated list of IP addresses or network addresses to which this DNS server should forward queries. Enter multiple server addresses on separate lines.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Forwarder Protocol</label>
                            <div className="relative">
                                <select
                                    value={data.forwarderProtocol}
                                    onChange={(e) => onChange('forwarderProtocol', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary appearance-none font-medium"
                                >
                                    <option value="Udp">UDP</option>
                                    <option value="Tcp">TCP</option>
                                    <option value="Tls">TLS</option>
                                    <option value="Https">HTTPS</option>
                                </select>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">The transport protocol that should be used for forwarding queries.</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-4 border border-gray-200 dark:border-slate-800">
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-4">Performance</h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={data.concurrentForwarding}
                                    onChange={(e) => onChange('concurrentForwarding', e.target.checked)}
                                    id="concurrentForwarding"
                                    className="w-5 h-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary focus:ring-primary"
                                />
                                <label htmlFor="concurrentForwarding" className="text-sm font-bold text-slate-700 dark:text-slate-300 select-none cursor-pointer">Concurrent Querying</label>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 ml-8">Set this to true to query all forwarders concurrently. The fastest response will be used.</p>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Retries</label>
                                    <input
                                        type="number"
                                        value={data.forwarderRetries}
                                        onChange={(e) => onChange('forwarderRetries', parseInt(e.target.value))}
                                        className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium text-sm"
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">The number of retries that must be done with the forwarders.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Timeout (ms)</label>
                                    <input
                                        type="number"
                                        value={data.forwarderTimeout}
                                        onChange={(e) => onChange('forwarderTimeout', parseInt(e.target.value))}
                                        className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium text-sm"
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">The timeout value in milliseconds for the forwarders.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Concurrency</label>
                                    <input
                                        type="number"
                                        value={data.forwarderConcurrency}
                                        onChange={(e) => onChange('forwarderConcurrency', parseInt(e.target.value))}
                                        className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium text-sm"
                                    />
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">The number of concurrent requests that should be sent to the forwarders.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Outbound Proxy */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                    <Terminal size={20} className="text-slate-400" />
                    Outbound Proxy
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Proxy Type</label>
                        <div className="relative">
                            <select
                                value={data.proxy ? data.proxy.type : 'None'}
                                onChange={(e) => updateProxy('type', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary appearance-none font-medium"
                            >
                                <option value="None">None</option>
                                <option value="Http">HTTP</option>
                                <option value="Socks5">SOCKS5</option>
                            </select>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select the proxy type to use for outbound connections.</p>
                    </div>
                </div>

                {data.proxy && data.proxy.type !== 'None' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2 col-span-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address</label>
                                <input
                                    type="text"
                                    value={data.proxy.address}
                                    onChange={(e) => updateProxy('address', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow font-medium"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">The IP address or hostname of the proxy server.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Port</label>
                                <input
                                    type="number"
                                    value={data.proxy.port}
                                    onChange={(e) => updateProxy('port', parseInt(e.target.value))}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow font-medium"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">The port number of the proxy server.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Username</label>
                                <input
                                    type="text"
                                    value={data.proxy.username || ''}
                                    onChange={(e) => updateProxy('username', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow font-medium"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">The username for proxy authentication.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                                <input
                                    type="password"
                                    value={data.proxy.password || ''}
                                    onChange={(e) => updateProxy('password', e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow font-medium"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">The password for proxy authentication.</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bypass List</label>
                            <textarea
                                value={data.proxy.bypass?.join('\n') || ''}
                                onChange={(e) => updateProxy('bypass', e.target.value.split('\n').map(s => s.trim()))}
                                rows={3}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm transition-shadow"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">A comma separated list of IP addresses or network addresses that should bypass the proxy.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
