import React from 'react';
import type { SettingsResponse } from '../../api/settings';

interface LoggingSettingsProps {
    data: SettingsResponse;
    onChange: (field: keyof SettingsResponse, value: any) => void;
}

export const LoggingSettings: React.FC<LoggingSettingsProps> = ({ data, onChange }) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft-sm">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">Log Output</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {['None', 'File', 'Console', 'FileAndConsole'].map(opt => (
                        <label key={opt} className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${data.loggingType === opt
                            ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                            : 'bg-gray-50 dark:bg-slate-900/30 border-gray-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:border-primary/50'
                            }`}>
                            <input
                                type="radio"
                                name="loggingType"
                                value={opt}
                                checked={data.loggingType === opt}
                                onChange={() => onChange('loggingType', opt)}
                                className="hidden"
                            />
                            <span className="font-medium">{opt.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </label>
                    ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Set the logging type. Valid values are None, File, Console, FileAndConsole.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft-sm space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-3">Options</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={data.logQueries}
                                onChange={(e) => onChange('logQueries', e.target.checked)}
                                id="logQueries"
                                className="w-5 h-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary focus:ring-primary"
                            />
                            <label htmlFor="logQueries" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Log DNS Queries</label>
                        </div>
                        <p className="text-xs text-slate-500 ml-8 mb-2">Set this to true to log all queries.</p>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={data.ignoreResolverLogs}
                                onChange={(e) => onChange('ignoreResolverLogs', e.target.checked)}
                                id="ignoreResolverLogs"
                                className="w-5 h-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary focus:ring-primary"
                            />
                            <label htmlFor="ignoreResolverLogs" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Ignore Resolver Logs</label>
                        </div>
                        <p className="text-xs text-slate-500 ml-8 mb-2">Set this to true to ignore logs from the recursive resolver.</p>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={data.useLocalTime}
                                onChange={(e) => onChange('useLocalTime', e.target.checked)}
                                id="useLocalTime"
                                className="w-5 h-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary focus:ring-primary"
                            />
                            <label htmlFor="useLocalTime" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Use Local Time in Logs</label>
                        </div>
                        <p className="text-xs text-slate-500 ml-8">Set this to true to use local time in logs instead of UTC.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft-sm space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-3">Storage</h3>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Log Folder</label>
                        <input
                            type="text"
                            value={data.logFolder}
                            onChange={(e) => onChange('logFolder', e.target.value)}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                        />
                        <p className="text-xs text-slate-500 mt-1">The folder path to store the log files.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Log Retention (Days)</label>
                        <input
                            type="number"
                            value={data.maxLogFileDays}
                            onChange={(e) => onChange('maxLogFileDays', parseInt(e.target.value))}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                        />
                        <p className="text-xs text-slate-500 mt-1">The number of days to retain the log files.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft-sm space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-3">Statistics</h3>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={data.enableInMemoryStats}
                            onChange={(e) => onChange('enableInMemoryStats', e.target.checked)}
                            id="enableInMemoryStats"
                            className="w-5 h-5 rounded border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-primary focus:ring-primary"
                        />
                        <label htmlFor="enableInMemoryStats" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Enable In-Memory Stats</label>
                    </div>
                    <p className="text-xs text-slate-500 ml-8 mb-4">Set this to true to enable in-memory statistics.</p>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stats Retention (Days)</label>
                        <input
                            type="number"
                            value={data.maxStatFileDays}
                            onChange={(e) => onChange('maxStatFileDays', parseInt(e.target.value))}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-medium"
                        />
                        <p className="text-xs text-slate-500 mt-1">The number of days to retain the statistics files.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
