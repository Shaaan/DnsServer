import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { apiClient } from '../../../api/client';
import toast from 'react-hot-toast';

interface EditGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    groupName: string | null;
}

interface GroupDetails {
    name: string;
    description: string;
    members: string[]; // List of usernames
    users: string[]; // List of all available users to add
}

export const EditGroupModal: React.FC<EditGroupModalProps> = ({ isOpen, onClose, onSuccess, groupName }) => {
    const [details, setDetails] = useState<GroupDetails | null>(null);
    const [newName, setNewName] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch group details when modal opens
    useEffect(() => {
        if (isOpen && groupName) {
            fetchGroupDetails(groupName);
        } else {
            setDetails(null);
            setNewName('');
            setNewDescription('');
            setSelectedMembers([]);
        }
    }, [isOpen, groupName]);

    const fetchGroupDetails = async (name: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<any>('/admin/groups/get', {
                params: {
                    group: name,
                    includeUsers: true
                }
            });
            const data = response.data.response;
            setDetails(data);
            setNewName(data.name);
            setNewDescription(data.description);
            setSelectedMembers(data.members || []);
        } catch (err) {
            setError('Failed to load group details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!groupName) return;

        setIsSaving(true);
        setError(null);

        try {
            // Build the update request
            // Members are sent as a newline separated string
            const membersString = selectedMembers.join('\n');

            await apiClient.post('/admin/groups/set', null, {
                params: {
                    group: groupName,
                    newGroup: newName !== groupName ? newName : undefined,
                    description: newDescription,
                    members: membersString
                }
            });
            onSuccess();
            toast.success('Group updated successfully');
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update group');
            toast.error('Failed to update group');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleMember = (username: string) => {
        setSelectedMembers(prev =>
            prev.includes(username)
                ? prev.filter(u => u !== username)
                : [...prev, username]
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 dark:bg-slate-900 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    {isLoading ? (
                        <div className="p-8 text-center text-slate-500">Loading group details...</div>
                    ) : details ? (
                        <>
                            <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 sm:mx-0 sm:h-10 sm:w-10">
                                        <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-white" id="modal-title">
                                            Edit Group: {groupName}
                                        </h3>
                                        <div className="mt-4">
                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        Group Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={newName}
                                                        onChange={(e) => setNewName(e.target.value)}
                                                        className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1">The name of the group.</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        Description
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newDescription}
                                                        onChange={(e) => setNewDescription(e.target.value)}
                                                        className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1">The description text for the group.</p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                        Members
                                                    </label>
                                                    <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 dark:border-slate-700 rounded p-2">
                                                        {details.users && details.users.map(user => (
                                                            <div key={user} className="flex items-center">
                                                                <input
                                                                    id={`user-${user}`}
                                                                    type="checkbox"
                                                                    checked={selectedMembers.includes(user)}
                                                                    onChange={() => toggleMember(user)}
                                                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                                                />
                                                                <label htmlFor={`user-${user}`} className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                                                                    {user}
                                                                </label>
                                                            </div>
                                                        ))}
                                                        {(!details.users || details.users.length === 0) && (
                                                            <div className="text-sm text-slate-500 italic">No users available</div>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1">A comma separated list of usernames to set as the group's members.</p>
                                                </div>

                                                {error && (
                                                    <div className="text-red-500 text-sm mt-2">{error}</div>
                                                )}
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-slate-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSaving}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-800 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="p-8 text-center text-red-500">Group details not found</div>
                    )}
                </div>
            </div>
        </div>
    );
};
