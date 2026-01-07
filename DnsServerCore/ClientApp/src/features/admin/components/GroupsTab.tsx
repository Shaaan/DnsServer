import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../api/client';
import { MoreVertical, Users, Trash2, UserCog } from 'lucide-react';
import { AddGroupModal } from '../modals/AddGroupModal';
import { EditGroupModal } from '../modals/EditGroupModal';

interface GroupData {
    name: string;
    description: string;
}

export const GroupsTab: React.FC = () => {
    const [groups, setGroups] = useState<GroupData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
    const [editGroup, setEditGroup] = useState<string | null>(null);

    // Dropdown state
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    const fetchGroups = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<any>('/admin/groups/list');
            setGroups(response.data.response.groups);
        } catch (err) {
            setError('Failed to load groups.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
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

    const handleDeleteGroup = async (groupName: string) => {
        if (!confirm(`Are you sure you want to delete group [${groupName}]?`)) return;

        try {
            await apiClient.post('/admin/groups/delete', null, {
                params: {
                    group: groupName
                }
            });
            fetchGroups();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete group');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-slate-800 dark:text-white">Groups</h3>
                <div className="flex gap-2">
                    <button
                        onClick={fetchGroups}
                        className="px-3 py-1 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                        Refresh
                    </button>
                    <button
                        className="px-3 py-1 text-sm bg-primary text-white rounded-md hover:bg-primary-dark"
                        onClick={() => setIsAddGroupModalOpen(true)}
                    >
                        Add Group
                    </button>
                </div>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            {isLoading ? (
                <div className="text-center py-8 text-slate-500">Loading groups...</div>
            ) : (
                <div className="bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-gray-200 dark:border-slate-800 overflow-visible">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium border-b border-gray-200 dark:border-slate-700">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {groups.map((group, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                                        <button
                                            onClick={() => setEditGroup(group.name)}
                                            className="hover:text-primary transition-colors flex items-center gap-2"
                                        >
                                            <Users size={16} className="text-slate-400" />
                                            {group.name}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                        {group.description}
                                    </td>
                                    <td className="px-4 py-3 text-right relative dropdown-container">
                                        <button
                                            onClick={() => setOpenDropdownId(openDropdownId === group.name ? null : group.name)}
                                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {openDropdownId === group.name && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-slate-700 z-10">
                                                <button
                                                    onClick={() => { setEditGroup(group.name); setOpenDropdownId(null); }}
                                                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                                >
                                                    <UserCog size={14} />
                                                    View Details
                                                </button>
                                                <div className="border-t border-gray-100 dark:border-slate-700 my-1"></div>
                                                <button
                                                    onClick={() => { handleDeleteGroup(group.name); setOpenDropdownId(null); }}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                                >
                                                    <Trash2 size={14} />
                                                    Delete Group
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {groups.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                                        No groups found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <AddGroupModal
                isOpen={isAddGroupModalOpen}
                onClose={() => setIsAddGroupModalOpen(false)}
                onSuccess={fetchGroups}
            />

            <EditGroupModal
                isOpen={!!editGroup}
                groupName={editGroup}
                onClose={() => setEditGroup(null)}
                onSuccess={fetchGroups}
            />
        </div>
    );
};
