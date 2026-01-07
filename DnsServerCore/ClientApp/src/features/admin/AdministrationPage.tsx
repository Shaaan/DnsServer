import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { SessionsTab } from './components/SessionsTab';
import { UsersTab } from './components/UsersTab';
import { GroupsTab } from './components/GroupsTab';
import { ClusterTab } from './components/ClusterTab';
import { PermissionsTab } from './components/PermissionsTab';

export const AdministrationPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'sessions' | 'users' | 'groups' | 'permissions' | 'cluster'>('sessions');

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                        <Shield className="text-primary" />
                        Administration
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage users, groups, permissions, and cluster configuration.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-slate-800 flex gap-6 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('sessions')}
                    className={`pb-3 text-sm font-bold transition-colors relative whitespace-nowrap ${activeTab === 'sessions'
                        ? 'text-primary'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                >
                    Sessions
                    {activeTab === 'sessions' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`pb-3 text-sm font-bold transition-colors relative whitespace-nowrap ${activeTab === 'users'
                        ? 'text-primary'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                >
                    Users
                    {activeTab === 'users' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('groups')}
                    className={`pb-3 text-sm font-bold transition-colors relative whitespace-nowrap ${activeTab === 'groups'
                        ? 'text-primary'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                >
                    Groups
                    {activeTab === 'groups' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('permissions')}
                    className={`pb-3 text-sm font-bold transition-colors relative whitespace-nowrap ${activeTab === 'permissions'
                        ? 'text-primary'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                >
                    Permissions
                    {activeTab === 'permissions' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('cluster')}
                    className={`pb-3 text-sm font-bold transition-colors relative whitespace-nowrap ${activeTab === 'cluster'
                        ? 'text-primary'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                >
                    Cluster
                    {activeTab === 'cluster' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />}
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft-md">
                {activeTab === 'sessions' && <SessionsTab />}
                {activeTab === 'users' && <UsersTab />}
                {activeTab === 'groups' && <GroupsTab />}
                {activeTab === 'permissions' && <PermissionsTab />}
                {activeTab === 'cluster' && <ClusterTab />}
            </div>
        </div>
    );
};
