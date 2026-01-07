import React from 'react';
import type { SettingsResponse, TsigKey } from '../../api/settings';
import { Plus, Trash2, X } from 'lucide-react';

interface TsigSettingsProps {
    data: SettingsResponse;
    onChange: (field: keyof SettingsResponse, value: any) => void;
}

export const TsigSettings: React.FC<TsigSettingsProps> = ({ data, onChange }) => {
    // State for the new key form
    const [isAdding, setIsAdding] = React.useState(false);
    const [newKeyName, setNewKeyName] = React.useState('');
    const [newKeyAlgo, setNewKeyAlgo] = React.useState('HmacSha256');
    const [newKeySecret, setNewKeySecret] = React.useState('');

    const handleAddKey = () => {
        if (!newKeyName || !newKeySecret) return;

        const newKey: TsigKey = {
            keyName: newKeyName,
            algorithmName: newKeyAlgo,
            sharedSecret: newKeySecret
        };

        const currentKeys = data.tsigKeys || [];
        // Prevent duplicates
        if (currentKeys.find(k => k.keyName === newKeyName)) return;

        onChange('tsigKeys', [...currentKeys, newKey]);
        setNewKeyName('');
        setNewKeySecret('');
        setNewKeyAlgo('HmacSha256');
        setIsAdding(false);
    };

    const handleRemoveKey = (keyName: string) => {
        const currentKeys = data.tsigKeys || [];
        onChange('tsigKeys', currentKeys.filter(k => k.keyName !== keyName));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        TSIG Keys
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">{(data.tsigKeys || []).length} keys</span>
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Manage TSIG keys for secure Zone Transfers (AXFR).</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95"
                    >
                        <Plus size={18} />
                        Add TSIG Key
                    </button>
                )}
            </div>

            {/* Add Key Form */}
            {isAdding && (
                <div className="p-5 rounded-xl border border-primary/20 dark:border-primary/30 bg-primary/5 dark:bg-primary/10 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">New TSIG Key</h4>
                        <button
                            onClick={() => setIsAdding(false)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-3 space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-400">Key Name</label>
                            <input
                                type="text"
                                value={newKeyName}
                                onChange={(e) => setNewKeyName(e.target.value)}
                                placeholder="example-key"
                                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                                autoFocus
                            />
                        </div>
                        <div className="md:col-span-3 space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-400">Algorithm</label>
                            <select
                                value={newKeyAlgo}
                                onChange={(e) => setNewKeyAlgo(e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            >
                                <option value="HmacMd5">HMAC-MD5</option>
                                <option value="HmacSha1">HMAC-SHA1</option>
                                <option value="HmacSha256">HMAC-SHA256</option>
                                <option value="HmacSha256-128">HMAC-SHA256 (128 bits)</option>
                                <option value="HmacSha384">HMAC-SHA384</option>
                                <option value="HmacSha384-192">HMAC-SHA384 (192 bits)</option>
                                <option value="HmacSha512">HMAC-SHA512</option>
                                <option value="HmacSha512-256">HMAC-SHA512 (256 bits)</option>
                            </select>
                        </div>
                        <div className="md:col-span-4 space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-400">Shared Secret</label>
                            <input
                                type="text"
                                value={newKeySecret}
                                onChange={(e) => setNewKeySecret(e.target.value)}
                                placeholder="Base64 encoded key..."
                                className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-shadow font-mono text-sm"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button
                                onClick={handleAddKey}
                                disabled={!newKeyName || !newKeySecret}
                                className="w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/10"
                            >
                                Save Key
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Existing Keys Table */}
            <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-none">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Key Name</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Algorithm</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Shared Secret</th>
                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                        {(!data.tsigKeys || data.tsigKeys.length === 0) ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                    No TSIG keys configured.
                                </td>
                            </tr>
                        ) : (
                            data.tsigKeys.map((key) => (
                                <tr key={key.keyName} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                                        {key.keyName}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                        {key.algorithmName}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500 truncate max-w-xs">
                                        {key.sharedSecret}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleRemoveKey(key.keyName)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                            title="Remove Key"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
