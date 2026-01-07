import React from 'react';
import type { SettingsResponse } from '../../api/settings';
import { Shield, List, AlertTriangle } from 'lucide-react';
import { quickBlockLists } from './quickBlockLists';

interface BlockingSettingsProps {
    data: SettingsResponse;
    onChange: (field: keyof SettingsResponse, value: any) => void;
}

export const BlockingSettings: React.FC<BlockingSettingsProps> = ({ data, onChange }) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Enable Blocking */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft-sm">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                        <Shield size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={data.enableBlocking}
                                onChange={(e) => onChange('enableBlocking', e.target.checked)}
                                id="enableBlocking"
                                className="w-5 h-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary focus:ring-primary transition-all cursor-pointer"
                            />
                            <label htmlFor="enableBlocking" className="text-lg font-bold text-slate-800 dark:text-white select-none cursor-pointer">Enable Ad Blocking</label>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Set this to true to enable blocking.</p>
                    </div>
                </div>
            </div>

            {/* Blocking Type */}
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft-sm space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">Blocking Behavior</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { value: 'NxDomain', label: 'NXDOMAIN', desc: 'Return "Non-Existent Domain" response.' },
                            { value: 'AnyAddress', label: '0.0.0.0 / ::', desc: 'Return 0.0.0.0 (IPv4) or :: (IPv6).' },
                            { value: 'CustomAddress', label: 'Custom Address', desc: 'Return specific IP addresses.' }
                        ].map((type) => (
                            <label key={type.value} className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all duration-200 ${data.blockingType === type.value
                                ? 'bg-primary/5 border-primary/20'
                                : 'bg-gray-50 dark:bg-slate-900/30 border-gray-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:border-primary/50'
                                }`}>
                                <div className="flex items-center gap-3 mb-2">
                                    <input
                                        type="radio"
                                        name="blockingType"
                                        value={type.value}
                                        checked={data.blockingType === type.value}
                                        onChange={() => onChange('blockingType', type.value)}
                                        className="w-4 h-4 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary focus:ring-primary"
                                    />
                                    <span className={`font-bold ${data.blockingType === type.value ? 'text-primary' : 'text-slate-700 dark:text-slate-200'}`}>{type.label}</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 ml-7">{type.desc}</p>
                            </label>
                        ))}
                    </div>

                    {/* Custom Address Input */}
                    {data.blockingType === 'CustomAddress' && (
                        <div className="mt-4 ml-1 md:w-1/3 animate-in fade-in slide-in-from-top-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Custom Blocking Addresses</label>
                            <textarea
                                value={data.customBlockingAddresses?.join('\n') || ''}
                                onChange={(e) => onChange('customBlockingAddresses', e.target.value.split('\n').map(s => s.trim()))}
                                rows={2}
                                placeholder="1.2.3.4"
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm transition-shadow"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">A comma separated list of IP addresses that must be used as the response for blocked domains when `CustomAddress` BlockingType is selected.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Block Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft-sm h-full">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                        <List size={20} className="text-slate-400" />
                        Block List URLs
                    </h3>
                    <div className="space-y-4">
                        <div className="relative">
                            <select
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary appearance-none font-medium"
                                onChange={(e) => {
                                    const selected = quickBlockLists.find(l => l.name === e.target.value);
                                    if (selected) {
                                        const current = data.blockListUrls || [];
                                        const newUrls = selected.urls.filter(u => !current.includes(u));
                                        if (newUrls.length > 0) {
                                            onChange('blockListUrls', [...current, ...newUrls]);
                                        }
                                        e.target.value = "";
                                    }
                                }}
                                defaultValue=""
                            >
                                <option value="" disabled>Quick Add Block List...</option>
                                {quickBlockLists.map(list => (
                                    <option key={list.name} value={list.name}>{list.name}</option>
                                ))}
                            </select>
                        </div>
                        <textarea
                            value={data.blockListUrls?.join('\n') || ''}
                            onChange={(e) => onChange('blockListUrls', e.target.value.split('\n').map(s => s.trim()))}
                            rows={8}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm transition-shadow"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">A comma separated list of URLs that contains the list of domains to be blocked.</p>
                        <div className="flex items-end gap-3">
                            <div className="flex-1 space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Update Interval (Hours)</label>
                                <input
                                    type="number"
                                    value={data.blockListUpdateIntervalHours}
                                    onChange={(e) => onChange('blockListUpdateIntervalHours', parseInt(e.target.value))}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">The interval in hours to update the block lists.</p>
                            </div>
                            <button className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors border border-gray-200 dark:border-slate-700">
                                Update Now
                            </button>
                        </div>
                        {data.blockListNextUpdatedOn && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 text-right">Next update: {new Date(data.blockListNextUpdatedOn).toLocaleString()}</p>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft-sm h-full">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
                        <AlertTriangle size={20} className="text-slate-400" />
                        Exceptions & Options
                    </h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Allowed Domains (Bypass List)</label>
                            <textarea
                                value={data.blockingBypassList?.join('\n') || ''}
                                onChange={(e) => onChange('blockingBypassList', e.target.value.split('\n').map(s => s.trim()))}
                                rows={8}
                                placeholder="example.com"
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm transition-shadow"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400">A comma separated list of domains that must be bypassed from blocking.</p>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <input
                                type="checkbox"
                                checked={data.allowTxtBlockingReport}
                                onChange={(e) => onChange('allowTxtBlockingReport', e.target.checked)}
                                id="allowTxtBlockingReport"
                                className="w-5 h-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary focus:ring-primary"
                            />
                            <label htmlFor="allowTxtBlockingReport" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">Allow TXT Blocking Report</label>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 ml-8">Set this to true to allow query for TXT record for the blocked domain to see the blocking report.</p>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Blocking Answer TTL</label>
                            <input
                                type="number"
                                value={data.blockingAnswerTtl}
                                onChange={(e) => onChange('blockingAnswerTtl', parseInt(e.target.value))}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400">The TTL value to use for the blocked response.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
