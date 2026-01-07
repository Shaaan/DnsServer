import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../api/client';
import { Shield, Save, Plus, X, Users, UsersRound } from 'lucide-react';

const PermissionSection = {
    Dashboard: 'Dashboard',
    Zones: 'Zones',
    Cache: 'Cache',
    Allowed: 'Allowed',
    Blocked: 'Blocked',
    Apps: 'Apps',
    DnsClient: 'DnsClient',
    Settings: 'Settings',
    DhcpServer: 'DhcpServer',
    Administration: 'Administration',
    Logs: 'Logs'
} as const;

type PermissionSection = typeof PermissionSection[keyof typeof PermissionSection];

interface PermissionEntry {
    name: string; // username or group name
    canView: boolean;
    canModify: boolean;
    canDelete: boolean;
}

interface PermissionsResponse {
    section: string;
    userPermissions: { username: string; canView: boolean; canModify: boolean; canDelete: boolean }[];
    groupPermissions: { name: string; canView: boolean; canModify: boolean; canDelete: boolean }[];
    users: string[]; // Available users to add
    groups: string[]; // Available groups to add
}

export const PermissionsTab: React.FC = () => {
    const [selectedSection, setSelectedSection] = useState<PermissionSection>(PermissionSection.Dashboard);
    const [data, setData] = useState<PermissionsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Staged changes
    const [userPerms, setUserPerms] = useState<PermissionEntry[]>([]);
    const [groupPerms, setGroupPerms] = useState<PermissionEntry[]>([]);

    // Pending adds
    const [pendingUser, setPendingUser] = useState<string>('');
    const [pendingGroup, setPendingGroup] = useState<string>('');

    const fetchPermissions = async (section: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<any>('/admin/permissions/get', {
                params: {
                    section,
                    includeUsersAndGroups: true
                }
            });
            const res = response.data.response;
            setData(res);

            // Map to local state for editing
            setUserPerms(res.userPermissions.map((p: any) => ({
                name: p.username,
                canView: p.canView,
                canModify: p.canModify,
                canDelete: p.canDelete
            })));

            setGroupPerms(res.groupPermissions.map((p: any) => ({
                name: p.name,
                canView: p.canView,
                canModify: p.canModify,
                canDelete: p.canDelete
            })));

        } catch (err) {
            setError('Failed to load permissions.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPermissions(selectedSection);
    }, [selectedSection]);

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            // Serialize permissions
            // Format expected by backend (based on main.js serializeTableData logic):
            // name|canView|canModify|canDelete|...
            // Note: checkboxes are sent as 'true' or 'false' string in main.js logic?
            // Actually main.js uses `serializeTableData` which concatenates values with `|`.
            // Let's verify the format. main.js line 2006: `serializeTableData($("#tableEditPermissionsUser"), 4)`
            // It grabs 4 columns. 
            // We need to replicate that string format: "username|true|false|false|username2|..."

            const serialize = (perms: PermissionEntry[]) => {
                return perms.map(p => `${p.name}|${p.canView}|${p.canModify}|${p.canDelete}`).join('|');
            };

            await apiClient.post('/admin/permissions/set', null, {
                params: {
                    section: selectedSection,
                    userPermissions: serialize(userPerms),
                    groupPermissions: serialize(groupPerms),
                    // node: '...' // backend seems to handle default if omitted or we can try to fetch it from session
                }
            });

            alert('Permissions saved successfully.');
            fetchPermissions(selectedSection);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save permissions');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddUser = () => {
        if (!pendingUser || pendingUser === 'blank' || pendingUser === 'none') return;
        if (userPerms.some(p => p.name === pendingUser)) return;

        setUserPerms([...userPerms, { name: pendingUser, canView: false, canModify: false, canDelete: false }]);
        setPendingUser('');
    };

    const handleAddGroup = () => {
        if (!pendingGroup || pendingGroup === 'blank' || pendingGroup === 'none') return;
        if (groupPerms.some(p => p.name === pendingGroup)) return;

        setGroupPerms([...groupPerms, { name: pendingGroup, canView: false, canModify: false, canDelete: false }]);
        setPendingGroup('');
    };

    const updatePerm = (type: 'user' | 'group', name: string, field: keyof PermissionEntry, value: boolean) => {
        if (type === 'user') {
            setUserPerms(userPerms.map(p => p.name === name ? { ...p, [field]: value } : p));
        } else {
            setGroupPerms(groupPerms.map(p => p.name === name ? { ...p, [field]: value } : p));
        }
    };

    const removePerm = (type: 'user' | 'group', name: string) => {
        if (type === 'user') {
            setUserPerms(userPerms.filter(p => p.name !== name));
        } else {
            setGroupPerms(groupPerms.filter(p => p.name !== name));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Shield className="text-primary" size={24} />
                    <select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value as PermissionSection)}
                        className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary font-medium text-lg"
                    >
                        {Object.values(PermissionSection).map(section => (
                            <option key={section} value={section}>{section}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving || isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
                >
                    <Save size={18} />
                    {isSaving ? 'Saving...' : 'Save Permissions'}
                </button>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-gray-200 dark:border-slate-800">
                {/* User Permissions */}
                <div className="flex flex-col border-b border-gray-200 dark:border-slate-800">
                    <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center border-b border-gray-100 dark:border-slate-800">
                        <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                            <Users size={18} className="text-slate-500" />
                            User Permissions
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="flex gap-2 mb-4 max-w-md">
                            <select
                                value={pendingUser}
                                onChange={(e) => setPendingUser(e.target.value)}
                                className="flex-1 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                disabled={isLoading}
                            >
                                <option value="">Select User to Add...</option>
                                {data?.users.map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleAddUser}
                                disabled={!pendingUser}
                                className="px-3 py-2 bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        <div className="overflow-hidden ring-1 ring-gray-900/5 dark:ring-white/10 rounded-lg">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium">
                                    <tr>
                                        <th className="px-4 py-3">User</th>
                                        <th className="px-4 py-3 text-center w-24">View</th>
                                        <th className="px-4 py-3 text-center w-24">Modify</th>
                                        <th className="px-4 py-3 text-center w-24">Delete</th>
                                        <th className="px-4 py-3 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                    {userPerms.map(perm => (
                                        <tr key={perm.name} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                            <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-medium">{perm.name}</td>
                                            <td className="px-4 py-3 text-center">
                                                <input type="checkbox" checked={perm.canView} onChange={e => updatePerm('user', perm.name, 'canView', e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <input type="checkbox" checked={perm.canModify} onChange={e => updatePerm('user', perm.name, 'canModify', e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <input type="checkbox" checked={perm.canDelete} onChange={e => updatePerm('user', perm.name, 'canDelete', e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => removePerm('user', perm.name)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                    <X size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {userPerms.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">No user permissions assigned.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Group Permissions */}
                <div className="flex flex-col">
                    <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center border-b border-gray-100 dark:border-slate-800">
                        <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                            <UsersRound size={18} className="text-slate-500" />
                            Group Permissions
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="flex gap-2 mb-4 max-w-md">
                            <select
                                value={pendingGroup}
                                onChange={(e) => setPendingGroup(e.target.value)}
                                className="flex-1 rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                disabled={isLoading}
                            >
                                <option value="">Select Group to Add...</option>
                                {data?.groups.map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleAddGroup}
                                disabled={!pendingGroup}
                                className="px-3 py-2 bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        <div className="overflow-hidden ring-1 ring-gray-900/5 dark:ring-white/10 rounded-lg">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium">
                                    <tr>
                                        <th className="px-4 py-3">Group</th>
                                        <th className="px-4 py-3 text-center w-24">View</th>
                                        <th className="px-4 py-3 text-center w-24">Modify</th>
                                        <th className="px-4 py-3 text-center w-24">Delete</th>
                                        <th className="px-4 py-3 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                                    {groupPerms.map(perm => (
                                        <tr key={perm.name} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                            <td className="px-4 py-3 text-slate-800 dark:text-slate-200 font-medium">{perm.name}</td>
                                            <td className="px-4 py-3 text-center">
                                                <input type="checkbox" checked={perm.canView} onChange={e => updatePerm('group', perm.name, 'canView', e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <input type="checkbox" checked={perm.canModify} onChange={e => updatePerm('group', perm.name, 'canModify', e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <input type="checkbox" checked={perm.canDelete} onChange={e => updatePerm('group', perm.name, 'canDelete', e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => removePerm('group', perm.name)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                    <X size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {groupPerms.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">No group permissions assigned.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-center text-xs text-slate-400 mt-4">
                Changes are applied immediately after clicking save.
            </div>
        </div>
    );
};
