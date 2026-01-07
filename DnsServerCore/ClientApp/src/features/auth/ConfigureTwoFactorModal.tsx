import React, { useState, useEffect } from 'react';
import { X, Smartphone, ShieldCheck, Copy, Check } from 'lucide-react';
import { apiClient, type ApiResponse } from '../../api/client';

interface ConfigureTwoFactorModalProps {
    isOpen: boolean;
    onClose: () => void;
    username: string;
    onStatusChange: (enabled: boolean) => void;
}

interface TwoFactorInitResponse {
    totpEnabled: boolean;
    secret?: string;
    qrCodePngImage?: string;
}

export const ConfigureTwoFactorModal: React.FC<ConfigureTwoFactorModalProps> = ({ isOpen, onClose, username, onStatusChange }) => {
    const [totpEnabled, setTotpEnabled] = useState(false);
    const [secret, setSecret] = useState<string | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [totp, setTotp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            initTwoFactor();
        } else {
            // Reset state on close
            setTotp('');
            setError(null);
            setSuccess(null);
        }
    }, [isOpen]);

    const initTwoFactor = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<ApiResponse<TwoFactorInitResponse>>('/user/2fa/init');
            setTotpEnabled(response.data.response.totpEnabled);
            setSecret(response.data.response.secret || null);
            setQrCode(response.data.response.qrCodePngImage || null);
        } catch (err: any) {
            setError('Failed to initialize 2FA configuration.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEnable = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (totp.length !== 6) {
            setError('Please enter a valid 6-digit OTP.');
            return;
        }

        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('totp', totp);

            await apiClient.post('/user/2fa/enable', params);

            setSuccess('Two-factor authentication enabled successfully.');
            setTotpEnabled(true);
            onStatusChange(true);
            setTotp('');
        } catch (err: any) {
            if (err.response?.data?.errorMessage) {
                setError(err.response.data.errorMessage);
            } else {
                setError('Failed to enable 2FA. Invalid OTP.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisable = async () => {
        if (!confirm('Are you sure you want to disable Two-factor authentication (2FA)?')) return;

        setError(null);
        setSuccess(null);
        setIsLoading(true);

        try {
            await apiClient.post('/user/2fa/disable');
            setSuccess('Two-factor authentication disabled successfully.');
            setTotpEnabled(false);
            onStatusChange(false);
        } catch (err: any) {
            setError('Failed to disable 2FA.');
        } finally {
            setIsLoading(false);
        }
    };

    const copySecret = () => {
        if (secret) {
            // Format secret with spaces for readability if not already formatted, 
            // but for copy-paste we might want raw. The API returns it raw typically 
            // but the UI shows it spaced. Let's copy it as is.
            // const formattedSecret = secret.match(/.{1,4}/g)?.join(' ') || secret;
            navigator.clipboard.writeText(secret);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <ShieldCheck size={20} className="text-primary" />
                        Configure 2FA
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/50">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-lg border border-green-100 dark:border-green-900/50">
                            {success}
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                            Status
                        </label>
                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${totpEnabled
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                }`}>
                                {totpEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                for user <b>{username}</b>
                            </span>
                        </div>
                    </div>

                    {isLoading && !secret && !totpEnabled ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : totpEnabled ? (
                        <div className="text-center py-4">
                            <div className="inline-flex items-center justify-center p-3 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                                <ShieldCheck size={32} className="text-green-600 dark:text-green-400" />
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 mb-6">
                                Two-factor authentication is currently enabled for your account.
                                You will be asked to enter an OTP when logging in.
                            </p>
                            <button
                                onClick={handleDisable}
                                disabled={isLoading}
                                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg text-sm font-bold transition-colors"
                            >
                                {isLoading ? 'Disabling...' : 'Disable 2FA'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-white rounded-xl border border-gray-200">
                                    {qrCode && <img src={`data:image/png;base64, ${qrCode}`} alt="2FA QR Code" className="w-40 h-40" />}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800 dark:text-white mb-2">1. Scan QR Code</h4>
                                    <p className="text-sm text-slate-500 mb-4">
                                        Use an authenticator app (like Google Authenticator or Authy) to scan the QR code.
                                    </p>

                                    <h4 className="font-semibold text-slate-800 dark:text-white mb-2">Or enter code manually</h4>
                                    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700">
                                        <code className="text-xs font-mono text-slate-600 dark:text-slate-300 break-all">
                                            {secret?.match(/.{1,4}/g)?.join(' ')}
                                        </code>
                                        <button
                                            onClick={copySecret}
                                            className="p-1.5 text-slate-400 hover:text-primary transition-colors ml-auto"
                                            title="Copy Secret"
                                        >
                                            {isCopied ? <Check size={14} /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleEnable}>
                                <h4 className="font-semibold text-slate-800 dark:text-white mb-2">2. Verify & Enable</h4>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Enter 6-digit OTP
                                </label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
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
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-bold transition-all shadow-md shadow-primary/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Enabling...' : 'Enable 2FA'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
