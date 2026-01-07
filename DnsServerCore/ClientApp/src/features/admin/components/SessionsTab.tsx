import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../api/client';
import { Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Session {
    username: string;
    tokenName: string | null;
    partialToken: string;
    type: 'Standard' | 'ApiToken' | string;
    isCurrentSession: boolean;
    lastSeen: string;
    lastSeenRemoteAddress: string;
    lastSeenUserAgent: string;
}

export const SessionsTab: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSessions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // "node" parameter is optional, defaults to blank (local/primary)
            const response = await apiClient.get<any>('/admin/sessions/list');
            setSessions(response.data.response.sessions);
        } catch (err) {
            setError('Failed to load sessions.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleDeleteSession = async (partialToken: string) => {
        if (!confirm(`Are you sure you want to delete session [${partialToken}]?`)) return;

        try {
            await apiClient.post(`/admin/sessions/delete`, null, {
                params: {
                    partialToken,
                    // For now assuming local node. If clustered, logic needs expansion
                    node: ''
                }
            });
            fetchSessions();
        } catch (err) {
            alert('Failed to delete session');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-slate-800 dark:text-white">Active Sessions</h3>
                <button
                    onClick={fetchSessions}
                    className="px-3 py-1 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                    Refresh
                </button>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            {isLoading ? (
                <div className="text-center py-8 text-slate-500">Loading sessions...</div>
            ) : (
                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-gray-200 dark:border-slate-800 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium border-b border-gray-200 dark:border-slate-700">
                            <tr>
                                <th className="px-4 py-3">Username</th>
                                <th className="px-4 py-3">Session</th>
                                <th className="px-4 py-3">Last Seen</th>
                                <th className="px-4 py-3">Remote Address</th>
                                <th className="px-4 py-3">User Agent</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {sessions.map((session, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                                        {session.username}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                        <div>
                                            {session.tokenName ? (
                                                <span className="font-medium">{session.tokenName}</span>
                                            ) : null}
                                            <span className="font-mono text-xs ml-1 opacity-75">[{session.partialToken}]</span>
                                        </div>
                                        {session.isCurrentSession && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 mt-1">
                                                Current
                                            </span>
                                        )}
                                        <div className="mt-1">
                                            {session.type === 'ApiToken' ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                    API Token
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-400">
                                                    Standard
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                        <div>{new Date(session.lastSeen).toLocaleString()}</div>
                                        <div className="text-xs text-slate-400">({formatDistanceToNow(new Date(session.lastSeen))} ago)</div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                        {session.lastSeenRemoteAddress}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate" title={session.lastSeenUserAgent}>
                                        {session.lastSeenUserAgent}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => handleDeleteSession(session.partialToken)}
                                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                            title="Delete Session"
                                            disabled={session.isCurrentSession} // Prevent deleting own session via this button, although API might allow it
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {sessions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                        No active sessions found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
