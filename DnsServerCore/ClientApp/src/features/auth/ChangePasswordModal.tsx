import React, { useState } from 'react';
import { X, Lock, KeyRound, Smartphone } from 'lucide-react';
import { apiClient } from '../../api/client';
import { AxiosError } from 'axios';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    username: string;
    totpEnabled: boolean;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, username, totpEnabled }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [totp, setTotp] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }

        if (totpEnabled && totp.length !== 6) {
            setError('Please enter a valid 6-digit OTP.');
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            // Using URLSearchParams for x-www-form-urlencoded as per legacy implementation style often seen in this app
            // However, apiClient seems to use axios. Let's send as form data or query params depending on backend expectation.
            // Looking at legacy auth.js: data: "token=" + ...
            // So it expects form data or query params.

            const params = new URLSearchParams();
            params.append('token', token || '');
            params.append('pass', currentPassword);
            params.append('newPass', newPassword);
            params.append('totp', totp);

            // The legacy app sends it as body data. 
            await apiClient.post('/user/changePassword', params);

            setSuccess('Password changed successfully.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTotp('');
            setTimeout(() => {
                onClose();
                setSuccess(null);
            }, 2000);
        } catch (err) {
            if (err instanceof AxiosError && err.response?.data?.errorMessage) {
                setError(err.response.data.errorMessage);
            } else {
                setError('Failed to change password. Please check your inputs.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-slate-800">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Lock size={20} className="text-primary" />
                        Change Password
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/50">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-lg border border-green-100 dark:border-green-900/50">
                            {success}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            disabled
                            className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-800 border border-transparent rounded-lg text-slate-500 dark:text-slate-400 text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                            Current Password
                        </label>
                        <div className="relative">
                            <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-slate-800 dark:text-white"
                                placeholder="Enter current password"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                            New Password
                        </label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-slate-800 dark:text-white"
                                placeholder="Enter new password"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-slate-800 dark:text-white"
                                placeholder="Re-enter new password"
                                required
                            />
                        </div>
                    </div>

                    {totpEnabled && (
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                Allocator OTP (2FA)
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
                            {isLoading ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
