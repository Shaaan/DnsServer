import React, { useState, useEffect } from 'react';
import { X, Lock, Users } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient, type ApiResponse } from '../../../api/client';
import type { ZonePermissionsResponse } from '../../../api/zones';
import toast from 'react-hot-toast';

interface ZonePermissionsModalProps {
    zoneName: string;
    isOpen: boolean;
    onClose: () => void;
}

export const ZonePermissionsModal: React.FC<ZonePermissionsModalProps> = ({ zoneName, isOpen, onClose }) => {
    // const queryClient = useQueryClient();
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());

    // Fetch available users/groups and current permissions
    const { data: permissionData, isLoading } = useQuery({
        queryKey: ['zones', zoneName, 'permissions'],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<ZonePermissionsResponse>>('/zones/permissions/get', {
                params: {
                    zone: zoneName,
                    includeUsersAndGroups: true
                }
            });
            return response.data.response;
        },
        enabled: isOpen && !!zoneName
    });

    // Initialize state when data loads
    useEffect(() => {
        if (permissionData) {
            setSelectedUsers(new Set(permissionData.userPermissions));
            setSelectedGroups(new Set(permissionData.groupPermissions));
        }
    }, [permissionData]);

    const saveMutation = useMutation({
        mutationFn: async () => {
            const userPermissions = Array.from(selectedUsers).join(',');
            const groupPermissions = Array.from(selectedGroups).join(',');

            // The legacy API expects simple comma-separated strings
            const params = new URLSearchParams();
            params.append('zone', zoneName);
            params.append('userPermissions', userPermissions);
            params.append('groupPermissions', groupPermissions);

            await apiClient.post('/zones/permissions/set', null, { params });
        },
        onSuccess: () => {
            toast.success('Permissions updated successfully');
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.errorMessage || 'Failed to update permissions');
        }
    });

    const toggleUser = (user: string) => {
        const next = new Set(selectedUsers);
        if (next.has(user)) next.delete(user);
        else next.add(user);
        setSelectedUsers(next);
    };

    const toggleGroup = (group: string) => {
        const next = new Set(selectedGroups);
        if (next.has(group)) next.delete(group);
        else next.add(group);
        setSelectedGroups(next);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500/75 dark:bg-slate-900/80"></div>
                </div>

                <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl w-full">
                    <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-start mb-5">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Lock className="text-blue-500" size={24} />
                                Zone Permissions: {zoneName}
                            </h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1">
                            {isLoading ? (
                                <div className="text-center py-8 text-slate-500">Loading permissions...</div>
                            ) : (
                                <>
                                    {/* Groups Section */}
                                    <div>
                                        <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
                                            <Users size={16} /> Groups
                                        </h4>
                                        <div className="space-y-2">
                                            {permissionData?.groups?.map(group => (
                                                <label key={group} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-700/50 cursor-pointer transition-colors border border-transparent hover:border-blue-200 dark:hover:border-slate-600">
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{group}</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedGroups.has(group)}
                                                        onChange={() => toggleGroup(group)}
                                                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                    />
                                                </label>
                                            ))}
                                            {(!permissionData?.groups || permissionData.groups.length === 0) && (
                                                <p className="text-sm text-slate-500 italic">No groups available.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Users Section */}
                                    <div>
                                        <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
                                            <Users size={16} /> Users
                                        </h4>
                                        <div className="space-y-2">
                                            {permissionData?.users?.map(user => (
                                                <label key={user} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-700/50 cursor-pointer transition-colors border border-transparent hover:border-blue-200 dark:hover:border-slate-600">
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user}</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUsers.has(user)}
                                                        onChange={() => toggleUser(user)}
                                                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                    />
                                                </label>
                                            ))}
                                            {(!permissionData?.users || permissionData.users.length === 0) && (
                                                <p className="text-sm text-slate-500 italic">No users available.</p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={() => saveMutation.mutate()}
                            disabled={saveMutation.isPending || isLoading}
                            className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                        >
                            {saveMutation.isPending ? 'Saving...' : 'Save Permissions'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
