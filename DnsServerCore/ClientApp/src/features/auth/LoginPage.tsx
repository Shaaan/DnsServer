import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Lock, User, KeyRound, Server } from 'lucide-react';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [totp, setTotp] = useState('');
    const [showTotp, setShowTotp] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const formData = new URLSearchParams();
            formData.append('user', username);
            formData.append('pass', password);
            formData.append('includeInfo', 'true');
            if (totp) formData.append('totp', totp);

            const response = await apiClient.post<any>('/user/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const data = response.data;

            if (data.status === 'ok') {
                localStorage.setItem('token', data.token || '');
                localStorage.setItem('user', JSON.stringify(data));
                if (!data.totpEnabled && username === 'admin' && password === 'admin') {
                    navigate('/', { state: { showChangePassword: true } });
                } else {
                    navigate('/');
                }
            } else if (data.status === '2fa-required') {
                setShowTotp(true);
                setError('Two-Factor Authentication required.');
            } else {
                setError(data.errorMessage || 'Login failed');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-soft-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
                <div className="bg-white dark:bg-slate-900 p-8 text-center border-b border-gray-100 dark:border-slate-800">
                    <div className="mx-auto bg-primary w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white shadow-lg shadow-primary/20 transform hover:scale-110 transition-transform duration-300">
                        <Server size={28} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Technitium DNS</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Sign in to manage your server</p>
                </div>

                <form onSubmit={handleLogin} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm text-center font-medium animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative group">
                            <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm group-hover:shadow-md"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm group-hover:shadow-md"
                                required
                            />
                        </div>

                        {showTotp && (
                            <div className="relative group animate-in fade-in slide-in-from-top-4 duration-300">
                                <KeyRound className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="2FA Code"
                                    value={totp}
                                    onChange={(e) => setTotp(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm group-hover:shadow-md"
                                    maxLength={6}
                                />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide text-sm"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="bg-gray-50 dark:bg-slate-900/50 p-4 border-t border-gray-100 dark:border-slate-800 text-center space-y-2">
                    <a href="/" className="text-slate-500 hover:text-primary dark:hover:text-primary-light text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1">
                        &larr; Back to Legacy Console
                    </a>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Theme based on <a href="https://www.creative-tim.com/product/soft-ui-dashboard-tailwind" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Soft UI Dashboard</a> (MIT)
                    </p>
                </div>
            </div>
        </div>
    );
};
