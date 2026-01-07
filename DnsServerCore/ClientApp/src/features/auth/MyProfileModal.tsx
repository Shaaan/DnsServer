import React, { useState, useEffect } from 'react';
import { X, UserCircle, Clock, Trash2, Smartphone } from 'lucide-react';
import { apiClient, type ApiResponse } from '../../api/client';

interface MyProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ProfileResponse {
    username: string;
    displayName: string;
    totpEnabled: boolean;
    sessionTimeoutSeconds: number;
    memberOfGroups: string[];
    sessions: SessionInfo[];
}

interface SessionInfo {
    tokenName?: string;
    partialToken: string;
    isCurrentSession: boolean;
    type: 'Standard' | 'ApiToken' | string;
    lastSeen: string;
    lastSeenRemoteAddress: string;
    lastSeenUserAgent: string;
}

export const MyProfileModal: React.FC<MyProfileModalProps> = ({ isOpen, onClose }) => {
    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [sessionTimeout, setSessionTimeout] = useState(1800);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get<ApiResponse<ProfileResponse>>('/user/profile/get');
            setProfile(response.data.response);
            setDisplayName(response.data.response.displayName);
            setSessionTimeout(response.data.response.sessionTimeoutSeconds);
        } catch (err) {
            setError('Failed to load profile.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchProfile();
            setError(null);
            setSuccess(null);
        }
    }, [isOpen]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            const params = new URLSearchParams();
            params.append('displayName', displayName);
            params.append('sessionTimeoutSeconds', sessionTimeout.toString());

            const response = await apiClient.post<ApiResponse<ProfileResponse>>('/user/profile/set', params);

            // Update local storage user display name if changed
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                user.displayName = response.data.response.displayName;
                localStorage.setItem('user', JSON.stringify(user));
            }

            setSuccess('Profile saved successfully.');
            // Refresh logic handled in parent normally but here we just update state
            setProfile(prev => prev ? ({ ...prev, displayName, sessionTimeoutSeconds: sessionTimeout }) : null);

        } catch (err: any) {
            if (err.response?.data?.errorMessage) {
                setError(err.response.data.errorMessage);
            } else {
                setError('Failed to save profile.');
            }
        }
    };

    const handleDeleteSession = async (session: SessionInfo) => {
        if (!confirm(`Are you sure you want to delete session [${session.partialToken}]?`)) return;

        try {
            const params = new URLSearchParams();
            params.append('partialToken', session.partialToken);

            if (session.type === 'ApiToken') {
                // We need to guess the node name or pass it if cluster support is active.
                // For direct server management, typically not needed or 'this-server'
                // Legacy code: getPrimaryClusterNodeName()
                // We'll omit for now as we seem to be in single server mode context mostly
            }

            await apiClient.post('/user/session/delete', params);
            // Refresh list
            fetchProfile();

        } catch (err) {
            alert('Failed to delete session.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-100 dark:border-slate-800 flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-800/50 flex-shrink-0">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <UserCircle size={20} className="text-primary" />
                        My Profile
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading && !profile ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : profile ? (
                        <div className="space-y-8">
                            {/* Profile Form */}
                            <form onSubmit={handleSave} className="space-y-4">
                                {success && (
                                    <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-lg border border-green-100 dark:border-green-900/50">
                                        {success}
                                    </div>
                                )}
                                {error && (
                                    <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/50">
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            value={profile.username}
                                            disabled
                                            className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-800 border border-transparent rounded-lg text-slate-500 dark:text-slate-400 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                            Display Name
                                        </label>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-slate-800 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                            2FA Status
                                        </label>
                                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700">
                                            <Smartphone size={16} className={profile.totpEnabled ? "text-green-500" : "text-slate-400"} />
                                            <span className={`text-sm font-medium ${profile.totpEnabled ? "text-green-600 dark:text-green-400" : "text-slate-500"}`}>
                                                {profile.totpEnabled ? "Enabled" : "Disabled"}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                            Session Timeout (seconds)
                                        </label>
                                        <input
                                            type="number"
                                            value={sessionTimeout}
                                            onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-slate-800 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-bold transition-all shadow-md shadow-primary/20 active:scale-95"
                                    >
                                        Save Profile
                                    </button>
                                </div>
                            </form>

                            <hr className="border-gray-200 dark:border-slate-800" />

                            {/* Active Sessions */}
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <Clock size={18} className="text-slate-500" />
                                    Active Sessions ({profile.sessions.length})
                                </h4>

                                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-xs font-semibold">
                                            <tr>
                                                <th className="px-4 py-3">Token Info</th>
                                                <th className="px-4 py-3">Last Seen</th>
                                                <th className="px-4 py-3">IP Address</th>
                                                <th className="px-4 py-3">User Agent</th>
                                                <th className="px-4 py-3 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                            {profile.sessions.map((session, idx) => (
                                                <tr key={idx} className="bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col">
                                                            {session.tokenName && <span className="font-semibold text-slate-800 dark:text-white">{session.tokenName}</span>}
                                                            <span className="font-mono text-xs text-slate-500">[{session.partialToken}]</span>
                                                            <div className="flex gap-1 mt-1">
                                                                {session.isCurrentSession && <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded border border-green-200 uppercase font-bold">Current</span>}
                                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold ${session.type === 'ApiToken'
                                                                    ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
                                                                    : 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                                                                    }`}>
                                                                    {session.type}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                                        <div>{new Date(session.lastSeen).toLocaleString()}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono text-xs">
                                                        {session.lastSeenRemoteAddress}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500 text-xs max-w-xs truncate" title={session.lastSeenUserAgent}>
                                                        {session.lastSeenUserAgent}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button
                                                            onClick={() => handleDeleteSession(session)}
                                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            title="Delete Session"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};
