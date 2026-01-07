import React from 'react';
import type { SettingsResponse } from '../../api/settings';

interface RecursionSettingsProps {
    data: SettingsResponse;
    onChange: (field: keyof SettingsResponse, value: any) => void;
}

export const RecursionSettings: React.FC<RecursionSettingsProps> = ({ data, onChange }) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft-sm space-y-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">Recursion Policy</h3>
                <div className="space-y-3">
                    {[
                        { value: 'Allow', label: 'Allow Recursion', desc: 'Allow recursion for all clients.' },
                        { value: 'AllowOnlyForPrivateNetworks', label: 'Allow Only for Private Networks', desc: 'Secure default. Allows recursion only for private IP ranges.' },
                        { value: 'UseSpecifiedNetworkACL', label: 'Use Specified Network ACL', desc: 'Limit recursion to specific networks.' },
                        { value: 'Deny', label: 'Deny Recursion', desc: 'Disable recursion completely (Authoritative Only).' }
                    ].map((opt) => (
                        <label key={opt.value} className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 cursor-pointer hover:bg-white dark:hover:bg-slate-800 hover:border-primary/50 transition-all">
                            <input
                                type="radio"
                                name="recursion"
                                value={opt.value}
                                checked={data.recursion === opt.value}
                                onChange={() => onChange('recursion', opt.value)}
                                className="mt-1 w-4 h-4 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary focus:ring-primary"
                            />
                            <div>
                                <span className="block font-bold text-slate-800 dark:text-slate-200">{opt.label}</span>
                                <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</span>
                            </div>
                        </label>
                    ))}
                </div>

                {data.recursion === 'UseSpecifiedNetworkACL' && (
                    <div className="mt-4 ml-7 animate-in fade-in slide-in-from-top-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Network ACL</label>
                        <textarea
                            value={data.recursionNetworkACL?.join('\n') || ''}
                            onChange={(e) => onChange('recursionNetworkACL', e.target.value.split('\n').map(s => s.trim()))}
                            rows={3}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm transition-shadow"
                            placeholder="192.168.1.0/24"
                        />
                        <p className="text-xs text-slate-500 mt-1">A comma separated Access Control List (ACL) of Network Access Control (NAC) entry. NAC is an IP address or network address to allow. Add ! character at the start of the NAC to deny access. The ACL is processed in the same order its listed. If no networks match, the default policy is to deny all except loopback.</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft-sm">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">Resolver Options</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={data.randomizeName}
                                onChange={(e) => onChange('randomizeName', e.target.checked)}
                                id="randomizeName"
                                className="w-5 h-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary focus:ring-primary"
                            />
                            <label htmlFor="randomizeName" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">Randomize Name (0x20 Encoding)</label>
                        </div>
                        <p className="text-xs text-slate-500 ml-8">Enables QNAME randomization when using UDP as the transport protocol.</p>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={data.qnameMinimization}
                                onChange={(e) => onChange('qnameMinimization', e.target.checked)}
                                id="qnameMinimization"
                                className="w-5 h-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary focus:ring-primary"
                            />
                            <label htmlFor="qnameMinimization" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">QNAME Minimization (Privacy)</label>
                        </div>
                        <p className="text-xs text-slate-500 ml-8">Enables QNAME minimization when doing recursive resolution.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft-sm">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">Performance Tuning</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Retries</label>
                            <input
                                type="number"
                                value={data.resolverRetries}
                                onChange={(e) => onChange('resolverRetries', parseInt(e.target.value))}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                            />
                            <p className="text-xs text-slate-500 mt-1">The number of retries that the recursive resolver must do.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Timeout (ms)</label>
                            <input
                                type="number"
                                value={data.resolverTimeout}
                                onChange={(e) => onChange('resolverTimeout', parseInt(e.target.value))}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                            />
                            <p className="text-xs text-slate-500 mt-1">The timeout value in milliseconds for the recursive resolver.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Concurrency</label>
                            <input
                                type="number"
                                value={data.resolverConcurrency}
                                onChange={(e) => onChange('resolverConcurrency', parseInt(e.target.value))}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                            />
                            <p className="text-xs text-slate-500 mt-1">The number of concurrent requests to be sent to name servers.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Stack</label>
                            <input
                                type="number"
                                value={data.resolverMaxStackCount}
                                onChange={(e) => onChange('resolverMaxStackCount', parseInt(e.target.value))}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                            />
                            <p className="text-xs text-slate-500 mt-1">The max stack count that the recursive resolver must use.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
