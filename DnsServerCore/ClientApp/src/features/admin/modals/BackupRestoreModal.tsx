import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { apiClient } from '../../../api/client';
import { Download, Upload, Database } from 'lucide-react';
import toast from 'react-hot-toast';

interface BackupRestoreModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'backup' | 'restore'>('backup');
    const [isLoading, setIsLoading] = useState(false);

    // Backup State
    const [backupAuth, setBackupAuth] = useState(true);
    const [backupCluster, setBackupCluster] = useState(true);
    const [backupWebService, setBackupWebService] = useState(true);
    const [backupDns, setBackupDns] = useState(true);
    const [backupLogsSettings, setBackupLogsSettings] = useState(true);
    const [backupZones, setBackupZones] = useState(true);
    const [backupAllowedZones, setBackupAllowedZones] = useState(true);
    const [backupBlockedZones, setBackupBlockedZones] = useState(true);
    const [backupBlockLists, setBackupBlockLists] = useState(true);
    const [backupApps, setBackupApps] = useState(true);
    const [backupScopes, setBackupScopes] = useState(true);
    const [backupStats, setBackupStats] = useState(true);
    const [backupLogs, setBackupLogs] = useState(false);

    // Restore State
    const [restoreAuth, setRestoreAuth] = useState(true);
    const [restoreCluster, setRestoreCluster] = useState(true);
    const [restoreWebService, setRestoreWebService] = useState(true);
    const [restoreDns, setRestoreDns] = useState(true);
    const [restoreLogsSettings, setRestoreLogsSettings] = useState(true);
    const [restoreZones, setRestoreZones] = useState(true);
    const [restoreAllowedZones, setRestoreAllowedZones] = useState(true);
    const [restoreBlockedZones, setRestoreBlockedZones] = useState(true);
    const [restoreBlockLists, setRestoreBlockLists] = useState(true);
    const [restoreApps, setRestoreApps] = useState(true);
    const [restoreScopes, setRestoreScopes] = useState(true);
    const [restoreStats, setRestoreStats] = useState(true);
    const [restoreLogs, setRestoreLogs] = useState(false);
    const [restoreDeleteExisting, setRestoreDeleteExisting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleBackup = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Not authenticated");
            return;
        }

        const params = new URLSearchParams();
        params.append('token', token);
        if (backupAuth) params.append('authConfig', 'true');
        if (backupCluster) params.append('clusterConfig', 'true');
        if (backupWebService) params.append('webServiceSettings', 'true');
        if (backupDns) params.append('dnsSettings', 'true');
        if (backupLogsSettings) params.append('logSettings', 'true');
        if (backupZones) params.append('zones', 'true');
        if (backupAllowedZones) params.append('allowedZones', 'true');
        if (backupBlockedZones) params.append('blockedZones', 'true');
        if (backupBlockLists) params.append('blockLists', 'true');
        if (backupApps) params.append('apps', 'true');
        if (backupScopes) params.append('scopes', 'true');
        if (backupStats) params.append('stats', 'true');
        if (backupLogs) params.append('logs', 'true');

        window.location.href = `/api/settings/backup?${params.toString()}`;
        onClose();
    };

    const handleRestore = async (e: React.FormEvent) => {
        e.preventDefault();
        const file = fileInputRef.current?.files?.[0];
        if (!file) {
            toast.error("Please select a backup file");
            return;
        }

        // Must select at least one item
        if (!restoreAuth && !restoreCluster && !restoreWebService && !restoreDns && !restoreLogsSettings &&
            !restoreZones && !restoreAllowedZones && !restoreBlockedZones && !restoreBlockLists &&
            !restoreApps && !restoreScopes && !restoreStats && !restoreLogs) {
            toast.error("Please select at least one item to restore");
            return;
        }

        if (!confirm("Are you sure you want to restore settings? Current settings will be overwritten.")) return;

        setIsLoading(true);
        const formData = new FormData();
        formData.append('fileBackupZip', file);
        if (restoreAuth) formData.append('authConfig', 'true');
        if (restoreCluster) formData.append('clusterConfig', 'true');
        if (restoreWebService) formData.append('webServiceSettings', 'true');
        if (restoreDns) formData.append('dnsSettings', 'true');
        if (restoreLogsSettings) formData.append('logSettings', 'true');
        if (restoreZones) formData.append('zones', 'true');
        if (restoreAllowedZones) formData.append('allowedZones', 'true');
        if (restoreBlockedZones) formData.append('blockedZones', 'true');
        if (restoreBlockLists) formData.append('blockLists', 'true');
        if (restoreApps) formData.append('apps', 'true');
        if (restoreScopes) formData.append('scopes', 'true');
        if (restoreStats) formData.append('stats', 'true');
        if (restoreLogs) formData.append('logs', 'true');
        if (restoreDeleteExisting) formData.append('deleteExistingFiles', 'true');

        try {
            await apiClient.post('/settings/restore', formData);
            toast.success("Settings restored successfully.");
            onClose();
            // Reload page to reflect changes as they might affect authentication or critical settings
            setTimeout(() => window.location.reload(), 1500);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to restore settings");
        } finally {
            setIsLoading(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 dark:bg-slate-900 opacity-75" onClick={onClose}></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block relative z-10 align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl sm:w-full">
                    <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 sm:mx-0 sm:h-10 sm:w-10">
                                <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-white" id="modal-title">
                                    Backup & Restore
                                </h3>

                                <div className="mt-4 border-b border-gray-200 dark:border-slate-700">
                                    <nav className="-mb-px flex space-x-8">
                                        <button
                                            onClick={() => setActiveTab('backup')}
                                            className={`${activeTab === 'backup'
                                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                                                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                                        >
                                            <Download size={16} />
                                            Backup
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('restore')}
                                            className={`${activeTab === 'restore'
                                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                                                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                                        >
                                            <Upload size={16} />
                                            Restore
                                        </button>
                                    </nav>
                                </div>

                                <div className="mt-4">
                                    {activeTab === 'backup' ? (
                                        <div className="space-y-4">
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Select items to include in the backup zip file.</p>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={backupAuth} onChange={e => setBackupAuth(e.target.checked)} className="rounded text-primary" /> Auth Config</label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={backupCluster} onChange={e => setBackupCluster(e.target.checked)} className="rounded text-primary" /> Cluster Config</label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={backupWebService} onChange={e => setBackupWebService(e.target.checked)} className="rounded text-primary" /> Web Service</label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={backupDns} onChange={e => setBackupDns(e.target.checked)} className="rounded text-primary" /> DNS Settings</label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={backupLogsSettings} onChange={e => setBackupLogsSettings(e.target.checked)} className="rounded text-primary" /> Log Settings</label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={backupZones} onChange={e => setBackupZones(e.target.checked)} className="rounded text-primary" /> Zones</label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={backupAllowedZones} onChange={e => setBackupAllowedZones(e.target.checked)} className="rounded text-primary" /> Allowed Zones</label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={backupBlockedZones} onChange={e => setBackupBlockedZones(e.target.checked)} className="rounded text-primary" /> Blocked Zones</label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={backupBlockLists} onChange={e => setBackupBlockLists(e.target.checked)} className="rounded text-primary" /> Block Lists</label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={backupApps} onChange={e => setBackupApps(e.target.checked)} className="rounded text-primary" /> DNS Apps</label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={backupScopes} onChange={e => setBackupScopes(e.target.checked)} className="rounded text-primary" /> DHCP Scopes</label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={backupStats} onChange={e => setBackupStats(e.target.checked)} className="rounded text-primary" /> Statistics</label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={backupLogs} onChange={e => setBackupLogs(e.target.checked)} className="rounded text-primary" /> Logs (Files)</label>
                                            </div>
                                            <div className="pt-4 flex justify-end">
                                                <button
                                                    onClick={handleBackup}
                                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    Download Backup
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleRestore} className="space-y-4">
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Select backup file and items to restore.</p>
                                            <div>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    accept=".zip"
                                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-700 dark:file:text-slate-200"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={restoreAuth} onChange={e => setRestoreAuth(e.target.checked)} className="rounded text-primary" /> Auth Config</label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={restoreCluster} onChange={e => setRestoreCluster(e.target.checked)} className="rounded text-primary" /> Cluster Config</label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={restoreWebService} onChange={e => setRestoreWebService(e.target.checked)} className="rounded text-primary" /> Web Service</label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={restoreDns} onChange={e => setRestoreDns(e.target.checked)} className="rounded text-primary" /> DNS Settings</label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={restoreLogsSettings} onChange={e => setRestoreLogsSettings(e.target.checked)} className="rounded text-primary" /> Log Settings</label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={restoreZones} onChange={e => setRestoreZones(e.target.checked)} className="rounded text-primary" /> Zones</label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={restoreAllowedZones} onChange={e => setRestoreAllowedZones(e.target.checked)} className="rounded text-primary" /> Allowed Zones</label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={restoreBlockedZones} onChange={e => setRestoreBlockedZones(e.target.checked)} className="rounded text-primary" /> Blocked Zones</label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={restoreBlockLists} onChange={e => setRestoreBlockLists(e.target.checked)} className="rounded text-primary" /> Block Lists</label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={restoreApps} onChange={e => setRestoreApps(e.target.checked)} className="rounded text-primary" /> DNS Apps</label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={restoreScopes} onChange={e => setRestoreScopes(e.target.checked)} className="rounded text-primary" /> DHCP Scopes</label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={restoreStats} onChange={e => setRestoreStats(e.target.checked)} className="rounded text-primary" /> Statistics</label>
                                                <label className="flex items-center gap-2"><input type="checkbox" checked={restoreLogs} onChange={e => setRestoreLogs(e.target.checked)} className="rounded text-primary" /> Logs (Files)</label>
                                            </div>
                                            <div className="pt-2">
                                                <label className="flex items-center gap-2 text-sm text-red-600 font-medium">
                                                    <input type="checkbox" checked={restoreDeleteExisting} onChange={e => setRestoreDeleteExisting(e.target.checked)} className="rounded text-red-600 focus:ring-red-500" />
                                                    Delete existing files before restoring
                                                </label>
                                            </div>
                                            <div className="pt-4 flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                                >
                                                    {isLoading ? 'Restoring...' : 'Restore Backup'}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-800 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};
