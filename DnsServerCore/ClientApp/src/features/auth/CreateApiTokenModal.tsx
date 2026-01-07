import React, { useState, useEffect } from 'react';
import { X, Key, Smartphone, Lock, Clipboard, Check } from 'lucide-react';
import { apiClient } from '../../api/client';

interface CreateApiTokenModalProps {
    isOpen: boolean;
    onClose: () => void;
    username: string;
    totpEnabled: boolean;
}

interface CreateTokenResponse {
    username: string;
    tokenName: string;
    token: string;
}

export const CreateApiTokenModal: React.FC<CreateApiTokenModalProps> = ({ isOpen, onClose, username, totpEnabled }) => {
    const [tokenName, setTokenName] = useState('');
    const [password, setPassword] = useState('');
    const [totp, setTotp] = useState('');
    const [createdToken, setCreatedToken] = useState<CreateTokenResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    // Use local state for username, defaulting to prop but allowing edit if empty
    const [localUsername, setLocalUsername] = useState(username);

    // Update local username if prop changes and is not empty
    useEffect(() => {
        if (username) setLocalUsername(username);
    }, [username]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!localUsername) {
            setError('Please enter a username.');
            return;
        }

        if (totpEnabled && totp.length !== 6) {
            setError('Please enter a valid 6-digit OTP.');
            return;
        }

        setIsLoading(true);

        try {
            const params = new URLSearchParams();
            params.append('user', localUsername);
            params.append('pass', password);
            params.append('tokenName', tokenName);
            params.append('totp', totp);

            const response = await apiClient.post<any>('/user/createToken', params);
            // The API returns the token info directly (based on legacy auth.js success callback)
            setCreatedToken(response.data);

        } catch (err: any) {
            if (err.response?.data?.errorMessage) {
                setError(err.response.data.errorMessage);
            } else {
                setError('Failed to create API token.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const copyToken = () => {
        if (createdToken?.token) {
            navigator.clipboard.writeText(createdToken.token);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const handleClose = () => {
        setTokenName('');
        setPassword('');
        setTotp('');
        setCreatedToken(null);
        setError(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Key size={20} className="text-primary" />
                        Create API Token
                    </h3>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/50">
                            {error}
                        </div>
                    )}

                    {createdToken ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/30 text-center">
                                <div className="font-semibold text-green-800 dark:text-green-400 mb-1">Token Created Successfully!</div>
                                <div className="text-xs text-green-700 dark:text-green-500">
                                    Please copy your token now. You won't be able to see it again.
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Token Name
                                </label>
                                <div className="text-sm font-medium text-slate-800 dark:text-white bg-gray-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700">
                                    {createdToken.tokenName}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                    API Token
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-100 dark:bg-slate-950 p-3 rounded-lg border border-gray-200 dark:border-slate-800 font-mono text-xs break-all text-slate-600 dark:text-slate-300">
                                        {createdToken.token}
                                    </div>
                                    <button
                                        onClick={copyToken}
                                        className="p-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500 dark:text-slate-400"
                                        title="Copy Token"
                                    >
                                        {isCopied ? <Check size={18} className="text-green-600" /> : <Clipboard size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleClose}
                                className="w-full mt-4 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-bold transition-all shadow-md shadow-primary/20 active:scale-95"
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    value={localUsername}
                                    onChange={(e) => setLocalUsername(e.target.value)}
                                    disabled={!!username} // Only disable if auto-populated
                                    className={`w-full px-3 py-2 border rounded-lg text-sm ${!!username
                                            ? 'bg-gray-100 dark:bg-slate-800 border-transparent text-slate-500 dark:text-slate-400'
                                            : 'bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-800 text-slate-800 dark:text-white'
                                        }`}
                                    placeholder="Enter username"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Token Name
                                </label>
                                <input
                                    type="text"
                                    value={tokenName}
                                    onChange={(e) => setTokenName(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-slate-800 dark:text-white"
                                    placeholder="e.g. Backup Script"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Your Password
                                </label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-slate-800 dark:text-white"
                                        placeholder="Enter password to verify"
                                        required
                                    />
                                </div>
                            </div>

                            {totpEnabled && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                        Authenticator OTP
                                    </label>
                                    <div className="relative">
                                        <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={totp}
                                            onChange={(e) => setTotp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-slate-800 dark:text-white font-mono tracking-widest"
                                            placeholder="000000"
                                            maxLength={6}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-bold transition-all shadow-md shadow-primary/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isLoading ? 'Creating...' : 'Create Token'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
