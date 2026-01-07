import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../api/client';
import { MoreVertical, User, Check, Shield, Trash2, UserCog, Ban, KeyRound } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { AddUserModal } from '../modals/AddUserModal';
import { EditUserModal } from '../modals/EditUserModal';
import { ResetUserPasswordModal } from '../modals/ResetUserPasswordModal';

interface UserData {
    username: string;
    displayName: string;
    totpEnabled: boolean;
    disabled: boolean;
    recentSessionLoggedOn: string;
    recentSessionRemoteAddress: string;
    previousSessionLoggedOn: string;
    previousSessionRemoteAddress: string;
}

export const UsersTab: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [editUser, setEditUser] = useState<string | null>(null);
    const [resetPasswordUser, setResetPasswordUser] = useState<string | null>(null);

    // Dropdown state
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<any>('/admin/users/list');
            setUsers(response.data.response.users);
        } catch (err) {
            setError('Failed to load users.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openDropdownId && !(event.target as Element).closest('.dropdown-container')) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdownId]);

    const handleToggleUserStatus = async (user: UserData) => {
        if (!confirm(`Are you sure you want to ${user.disabled ? 'enable' : 'disable'} user [${user.username}]?`)) return;

        try {
            await apiClient.post('/admin/users/set', null, {
                params: {
                    user: user.username,
                    disabled: !user.disabled
                }
            });
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to update user status');
        }
    };

    const handleDisable2FA = async (username: string) => {
        if (!confirm(`Are you sure you want to disable 2FA for user [${username}]?`)) return;

        try {
            await apiClient.post('/admin/users/set', null, {
                params: {
                    user: username,
                    totpEnabled: false
                }
            });
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to disable 2FA');
        }
    };

    const handleDeleteUser = async (username: string) => {
        if (!confirm(`Are you sure you want to delete user [${username}]?`)) return;

        try {
            await apiClient.post('/admin/users/delete', null, {
                params: {
                    user: username
                }
            });
            fetchUsers();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete user');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-slate-800 dark:text-white">Users</h3>
                <div className="flex gap-2">
                    <button
                        onClick={fetchUsers}
                        className="px-3 py-1 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                        Refresh
                    </button>
                    <button
                        className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary-dark"
                        onClick={() => setIsAddUserModalOpen(true)}
                    >
                        Add User
                    </button>
                </div>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            {isLoading ? (
                <div className="text-center py-8 text-slate-500">Loading users...</div>
            ) : (
                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-gray-200 dark:border-slate-800 overflow-visible">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium border-b border-gray-200 dark:border-slate-700">
                            <tr>
                                <th className="px-4 py-3">Username</th>
                                <th className="px-4 py-3">Display Name</th>
                                <th className="px-4 py-3">2FA</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Last Login</th>
                                <th className="px-4 py-3">Remote Address</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {users.map((user) => (
                                <tr key={user.username} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                                        <button
                                            onClick={() => setEditUser(user.username)}
                                            className="hover:text-primary transition-colors flex items-center gap-2"
                                        >
                                            <User size={16} className="text-slate-400" />
                                            {user.username}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                        {user.displayName}
                                    </td>
                                    <td className="px-4 py-3">
                                        {user.totpEnabled ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                Enabled
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-400">
                                                Disabled
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {user.disabled ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                                Disabled
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                        {user.recentSessionLoggedOn !== "0001-01-01T00:00:00" ? (
                                            <div>
                                                <div>{new Date(user.recentSessionLoggedOn).toLocaleString()}</div>
                                                <div className="text-xs text-slate-400">({formatDistanceToNow(new Date(user.recentSessionLoggedOn))} ago)</div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                        {user.recentSessionRemoteAddress || <span className="text-slate-400">-</span>}
                                    </td>
                                    <td className="px-4 py-3 text-right relative dropdown-container">
                                        <button
                                            onClick={() => setOpenDropdownId(openDropdownId === user.username ? null : user.username)}
                                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {openDropdownId === user.username && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-slate-700 z-10">
                                                <button
                                                    onClick={() => { setEditUser(user.username); setOpenDropdownId(null); }}
                                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                                >
                                                    <UserCog size={14} />
                                                    View Details
                                                </button>
                                                <button
                                                    onClick={() => { handleToggleUserStatus(user); setOpenDropdownId(null); }}
                                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                                >
                                                    {user.disabled ? <Check size={14} /> : <Ban size={14} />}
                                                    {user.disabled ? 'Enable User' : 'Disable User'}
                                                </button>
                                                <button
                                                    onClick={() => { setResetPasswordUser(user.username); setOpenDropdownId(null); }}
                                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                                >
                                                    <KeyRound size={14} />
                                                    Reset Password
                                                </button>
                                                {user.totpEnabled && (
                                                    <button
                                                        onClick={() => { handleDisable2FA(user.username); setOpenDropdownId(null); }}
                                                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                                    >
                                                        <Shield size={14} />
                                                        Disable 2FA
                                                    </button>
                                                )}
                                                <div className="border-t border-gray-100 dark:border-slate-700 my-1"></div>
                                                <button
                                                    onClick={() => { handleDeleteUser(user.username); setOpenDropdownId(null); }}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                                >
                                                    <Trash2 size={14} />
                                                    Delete User
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <AddUserModal
                isOpen={isAddUserModalOpen}
                onClose={() => setIsAddUserModalOpen(false)}
                onSuccess={fetchUsers}
            />

            <EditUserModal
                isOpen={!!editUser}
                username={editUser}
                onClose={() => setEditUser(null)}
                onSuccess={fetchUsers}
            />

            <ResetUserPasswordModal
                isOpen={!!resetPasswordUser}
                username={resetPasswordUser}
                onClose={() => setResetPasswordUser(null)}
                onSuccess={() => alert("Password reset successfully.")}
            />
        </div>
    );
};
