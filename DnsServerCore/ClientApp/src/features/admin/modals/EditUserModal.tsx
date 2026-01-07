import React, { useEffect, useState } from 'react';
import { UserCog } from 'lucide-react';
import { apiClient } from '../../../api/client';
import toast from 'react-hot-toast';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    username: string | null;
}

interface UserDetails {
    username: string;
    displayName: string;
    disabled: boolean;
    sessionTimeoutSeconds: number;
    totpEnabled: boolean;
    memberOfGroups: string[];
    groups: string[]; // Available groups
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, onSuccess, username }) => {
    const [details, setDetails] = useState<UserDetails | null>(null);
    const [newDisplayName, setNewDisplayName] = useState('');
    const [newDisabled, setNewDisabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [sessionTimeout, setSessionTimeout] = useState(1800);

    // Fetch user details when modal opens
    useEffect(() => {
        if (isOpen && username) {
            fetchUserDetails(username);
        } else {
            setDetails(null);
            setNewDisplayName('');
            setNewDisabled(false);
            setSelectedGroups([]);
        }
    }, [isOpen, username]);

    const fetchUserDetails = async (user: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<any>('/admin/users/get', {
                params: {
                    user,
                    includeGroups: true
                }
            });
            const data = response.data.response;
            setDetails(data);
            setNewDisplayName(data.displayName);
            setNewDisabled(data.disabled);
            setSelectedGroups(data.memberOfGroups || []);
            setSessionTimeout(data.sessionTimeoutSeconds || 1800);
        } catch (err) {
            setError('Failed to load user details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username) return;

        setIsSaving(true);
        setError(null);

        try {
            // Build the update request
            // Groups are typically sent as a newline separated string or special format in this legacy API
            // Based on auth.js: memberOfGroups = cleanTextList(...)
            const groupsString = selectedGroups.join('\n');

            await apiClient.post('/admin/users/set', null, {
                params: {
                    user: username,
                    displayName: newDisplayName,
                    disabled: newDisabled,
                    sessionTimeoutSeconds: sessionTimeout,
                    memberOfGroups: groupsString
                }
            });
            onSuccess();
            toast.success('User updated successfully');
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update user');
            toast.error('Failed to update user');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleGroup = (group: string) => {
        setSelectedGroups(prev =>
            prev.includes(group)
                ? prev.filter(g => g !== group)
                : [...prev, group]
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
                        <div className="p-8 text-center text-slate-500">Loading user details...</div>
                    ) : details ? (
                        <>
                            <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 sm:mx-0 sm:h-10 sm:w-10">
                                        <UserCog className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-white" id="modal-title">
                                            Edit User: {username}
                                        </h3>
                                        <div className="mt-4">
                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        Display Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={newDisplayName}
                                                        onChange={(e) => setNewDisplayName(e.target.value)}
                                                        className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1">The display name for the user account.</p>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        Session Timeout (seconds)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={sessionTimeout}
                                                        onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
                                                        className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1">A session time out value in seconds for the user account.</p>
                                                </div>

                                                <div className="flex items-center">
                                                    <input
                                                        id="disabled-checkbox"
                                                        type="checkbox"
                                                        checked={newDisabled}
                                                        onChange={(e) => setNewDisabled(e.target.checked)}
                                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                                    />
                                                    <label htmlFor="disabled-checkbox" className="ml-2 block text-sm text-slate-900 dark:text-slate-300">
                                                        Account Disabled
                                                    </label>
                                                </div>
                                                <p className="text-xs text-slate-500 mb-4 pl-6">Set true to disable the user account and delete all its active sessions.</p>

                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                        Member Of Groups
                                                    </label>
                                                    <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-slate-700 rounded p-2">
                                                        {details.groups && details.groups.map(group => (
                                                            <div key={group} className="flex items-center">
                                                                <input
                                                                    id={`group-${group}`}
                                                                    type="checkbox"
                                                                    checked={selectedGroups.includes(group)}
                                                                    onChange={() => toggleGroup(group)}
                                                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                                                />
                                                                <label htmlFor={`group-${group}`} className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                                                                    {group}
                                                                </label>
                                                            </div>
                                                        ))}
                                                        {(!details.groups || details.groups.length === 0) && (
                                                            <div className="text-sm text-slate-500 italic">No groups available</div>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1">A list of comma separated group names that the user must be set as a member.</p>
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
                        <div className="p-8 text-center text-red-500">User details not found</div>
                    )}
                </div>
            </div>
        </div>
    );
};
