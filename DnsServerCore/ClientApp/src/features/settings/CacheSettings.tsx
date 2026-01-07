import React from 'react';
import type { SettingsResponse } from '../../api/settings';

interface CacheSettingsProps {
    data: SettingsResponse;
    onChange: (field: keyof SettingsResponse, value: any) => void;
}

export const CacheSettings: React.FC<CacheSettingsProps> = ({ data, onChange }) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* General Cache Options */}
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft-sm space-y-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">Cache Options</h3>

                    <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                        <input
                            type="checkbox"
                            checked={data.saveCache}
                            onChange={(e) => onChange('saveCache', e.target.checked)}
                            id="saveCache"
                            className="w-5 h-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary focus:ring-primary"
                        />
                        <div>
                            <label htmlFor="saveCache" className="block text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer">Save Cache to Disk</label>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Persist cache to disk across service restarts.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Cache Entries</label>
                            <input
                                type="number"
                                value={data.cacheMaximumEntries}
                                onChange={(e) => onChange('cacheMaximumEntries', parseInt(e.target.value))}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                            />
                            <p className="text-xs text-slate-500 mt-1">The maximum number of cache entries that can be stored in the cache.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Min Record TTL</label>
                                <input
                                    type="number"
                                    value={data.cacheMinimumRecordTtl}
                                    onChange={(e) => onChange('cacheMinimumRecordTtl', parseInt(e.target.value))}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                                />
                                <p className="text-xs text-slate-500 mt-1">The minimum TTL value to use for all records in the cache.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Record TTL</label>
                                <input
                                    type="number"
                                    value={data.cacheMaximumRecordTtl}
                                    onChange={(e) => onChange('cacheMaximumRecordTtl', parseInt(e.target.value))}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                                />
                                <p className="text-xs text-slate-500 mt-1">The maximum TTL value to use for all records in the cache.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Negative Record TTL</label>
                                <input
                                    type="number"
                                    value={data.cacheNegativeRecordTtl}
                                    onChange={(e) => onChange('cacheNegativeRecordTtl', parseInt(e.target.value))}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                                />
                                <p className="text-xs text-slate-500 mt-1">The TTL value to use for all negative responses (NXDOMAIN) in the cache.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Failure Record TTL</label>
                                <input
                                    type="number"
                                    value={data.cacheFailureRecordTtl}
                                    onChange={(e) => onChange('cacheFailureRecordTtl', parseInt(e.target.value))}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                                />
                                <p className="text-xs text-slate-500 mt-1">The TTL value to use for all failure responses (SERVFAIL) in the cache.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stale & Prefetch */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft-sm">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">Stale Content</h3>
                        <div className="flex items-center gap-3 mb-4">
                            <input
                                type="checkbox"
                                checked={data.serveStale}
                                onChange={(e) => onChange('serveStale', e.target.checked)}
                                id="serveStale"
                                className="w-5 h-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary focus:ring-primary"
                            />
                            <label htmlFor="serveStale" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Serve Stale Records</label>
                        </div>
                        <p className="text-xs text-slate-500 mb-4 ml-8">Enable this option to serve stale cache records when the upstream name server is offline or not responding.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stale TTL</label>
                                <input
                                    type="number"
                                    value={data.serveStaleTtl}
                                    onChange={(e) => onChange('serveStaleTtl', parseInt(e.target.value))}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                                />
                                <p className="text-xs text-slate-500 mt-1">The maximum amount of time in seconds that a stale record can be served.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Wait (ms)</label>
                                <input
                                    type="number"
                                    value={data.serveStaleMaxWaitTime}
                                    onChange={(e) => onChange('serveStaleMaxWaitTime', parseInt(e.target.value))}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                                />
                                <p className="text-xs text-slate-500 mt-1">The maximum amount of time in milliseconds that the server must wait for a response from the upstream name server before serving a stale record.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Answer TTL</label>
                                <input
                                    type="number"
                                    value={data.serveStaleAnswerTtl}
                                    onChange={(e) => onChange('serveStaleAnswerTtl', parseInt(e.target.value))}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                                />
                                <p className="text-xs text-slate-500 mt-1">The TTL value to use for a stale record when it is served.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reset TTL</label>
                                <input
                                    type="number"
                                    value={data.serveStaleResetTtl}
                                    onChange={(e) => onChange('serveStaleResetTtl', parseInt(e.target.value))}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                                />
                                <p className="text-xs text-slate-500 mt-1">The TTL value to use for a stale record when it is reset after a successful response from the upstream name server.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft-sm">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">Prefetching</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trigger (%)</label>
                                <input
                                    type="number"
                                    value={data.cachePrefetchTrigger}
                                    onChange={(e) => onChange('cachePrefetchTrigger', parseInt(e.target.value))}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400">The percentage of the original TTL at which the cache record must be refreshed.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Eligibility</label>
                                <input
                                    type="number"
                                    value={data.cachePrefetchEligibility}
                                    onChange={(e) => onChange('cachePrefetchEligibility', parseInt(e.target.value))}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400">The minimum original TTL value required for a record to be eligible for prefetching.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sample Interval</label>
                                <input
                                    type="number"
                                    value={data.cachePrefetchSampleIntervalInMinutes}
                                    onChange={(e) => onChange('cachePrefetchSampleIntervalInMinutes', parseInt(e.target.value))}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400">The time interval in minutes to track the number of hits for a cache record.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hits Per Hour</label>
                                <input
                                    type="number"
                                    value={data.cachePrefetchSampleEligibilityHitsPerHour}
                                    onChange={(e) => onChange('cachePrefetchSampleEligibilityHitsPerHour', parseInt(e.target.value))}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400">The minimum number of hits per hour required for a cache record to be eligible for prefetching.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
