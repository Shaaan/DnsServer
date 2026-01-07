import React, { useEffect, useState } from 'react';
import { apiClient } from '../../../api/client';
import { Server, Activity, Database, Trash2, LogOut } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface ClusterNode {
    id: string;
    type: 'Primary' | 'Secondary';
    state: 'Self' | 'Connected' | 'Unreachable' | 'Unknown';
    name: string;
    url: string;
    ipAddresses: string[];
    upSince: string | null;
    lastSeen: string | null;
    configLastSynced: string | null;
    version: string;
}

interface ClusterStateResponse {
    clusterInitialized: boolean;
    clusterDomain: string;
    dnsServerDomain: string;
    clusterNodes: ClusterNode[];
    serverIpAddresses: string[];
    version: string;
}

export const ClusterTab: React.FC = () => {
    const [clusterState, setClusterState] = useState<ClusterStateResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [initMode, setInitMode] = useState<'create' | 'join' | null>(null);

    // Form states
    const [clusterDomain, setClusterDomain] = useState('');
    const [primaryNodeIp, setPrimaryNodeIp] = useState('');
    const [joinPrimaryUrl, setJoinPrimaryUrl] = useState('');
    const [joinPrimaryIp, setJoinPrimaryIp] = useState('');
    const [joinSecondaryIp, setJoinSecondaryIp] = useState('');
    const [joinUsername, setJoinUsername] = useState('admin');
    const [joinPassword, setJoinPassword] = useState('');
    const [joinTotp, setJoinTotp] = useState('');
    const [ignoreCertErrors, setIgnoreCertErrors] = useState(false);

    const fetchClusterState = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.get<any>('/admin/cluster/state', {
                params: { includeServerIpAddresses: true }
            });
            setClusterState(response.data.response);
        } catch (err) {
            setError('Failed to load cluster state.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClusterState();
    }, []);

    const handleInitCluster = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await apiClient.get('/admin/cluster/init', {
                params: {
                    clusterDomain,
                    primaryNodeIpAddresses: primaryNodeIp
                }
            });
            setInitMode(null);
            fetchClusterState();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to initialize cluster');
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinCluster = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData();
        formData.append('secondaryNodeIpAddresses', joinSecondaryIp);
        formData.append('primaryNodeUrl', joinPrimaryUrl);
        formData.append('primaryNodeIpAddress', joinPrimaryIp);
        formData.append('ignoreCertificateErrors', ignoreCertErrors.toString());
        formData.append('primaryNodeUsername', joinUsername);
        formData.append('primaryNodePassword', joinPassword);
        formData.append('primaryNodeTotp', joinTotp);

        try {
            await apiClient.post('/admin/cluster/initJoin', formData);
            setInitMode(null);
            fetchClusterState();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to join cluster');
            if (err.response?.data?.status === 'invalid-token') {
                // Handle 2FA required if applicable, though typically this endpoint returns error
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResync = async () => {
        if (!confirm("Are you sure you want to resync the cluster config? This will overwrite local changes.")) return;
        try {
            await apiClient.get('/admin/cluster/secondary/resync');
            toast.success('Resync triggered. Check logs for details.');
        } catch (err) {
            toast.error('Failed to trigger resync');
        }
    };

    const handleRemoveNode = async (nodeId: string, nodeName: string) => {
        if (!confirm(`Are you sure you want to remove node ${nodeName} from the cluster?`)) return;
        try {
            await apiClient.get('/admin/cluster/primary/removeSecondary', {
                params: { secondaryNodeId: nodeId }
            });
            toast.success(`Node ${nodeName} removed successfully`);
            fetchClusterState();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to remove node');
        }
    };

    const handleLeaveCluster = async () => {
        if (!confirm("Are you sure you want to leave the cluster? This server will become a standalone Primary node.")) return;
        try {
            await apiClient.get('/admin/cluster/secondary/leave');
            toast.success('Left cluster successfully');
            fetchClusterState();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to leave cluster');
        }
    };

    const handleDeleteCluster = async () => {
        if (!confirm("Are you sure you want to handleDelete the cluster? This will revert this server to a standalone instance. Secondary nodes will be orphaned.")) return;
        try {
            await apiClient.get('/admin/cluster/delete');
            toast.success('Cluster deleted successfully');
            fetchClusterState();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete cluster');
        }
    };

    const selfNode = clusterState?.clusterNodes?.find(n => n.state === 'Self');
    const isPrimary = selfNode?.type === 'Primary';

    // Helper for safe dates
    const safeDate = (dateStr: string | null) => {
        if (!dateStr) return null;
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return null;
            return date;
        } catch {
            return null;
        }
    };

    if (isLoading && !clusterState) {
        return <div className="text-center py-8 text-slate-500">Loading cluster state...</div>;
    }

    if (!clusterState?.clusterInitialized) {
        return (
            <div className="space-y-6">
                {error && <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-200 dark:border-red-900/20">{error}</div>}

                {!initMode ? (
                    <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800">
                        <Server size={48} className="mx-auto text-slate-400 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Cluster Not Initialized</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                            Setup a high-availability cluster to synchronize configuration across multiple DNS servers.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setInitMode('create')}
                                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors flex items-center gap-2"
                            >
                                <Database size={18} />
                                Initialize New Cluster
                            </button>
                            <button
                                onClick={() => setInitMode('join')}
                                className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                            >
                                <Activity size={18} />
                                Join Existing Cluster
                            </button>
                        </div>
                    </div>
                ) : initMode === 'create' ? (
                    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-6">Initialize New Cluster</h3>
                        <form onSubmit={handleInitCluster} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Cluster Domain
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={clusterDomain}
                                    onChange={e => setClusterDomain(e.target.value)}
                                    placeholder="e.g. cluster.local"
                                    className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <p className="text-xs text-slate-500 mt-1">The fully qualified domain name to be used to identify the new Cluster.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Primary Node IP Address
                                </label>
                                <select
                                    className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-2"
                                    onChange={e => setPrimaryNodeIp(e.target.value)}
                                    value={primaryNodeIp}
                                >
                                    <option value="">Select IP Address...</option>
                                    {clusterState?.serverIpAddresses?.map(ip => (
                                        <option key={ip} value={ip}>{ip}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    required
                                    value={primaryNodeIp}
                                    onChange={e => setPrimaryNodeIp(e.target.value)}
                                    placeholder="IP Address"
                                    className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <p className="text-xs text-slate-500 mt-1">A comma separated list of IP addresses of this DNS server that will be accessible by all other DNS Servers to be added later as Secondary nodes.</p>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setInitMode(null)}
                                    className="px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
                                >
                                    {isLoading ? 'Initializing...' : 'Initialize'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-6">Join Existing Cluster</h3>
                        <form onSubmit={handleJoinCluster} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    This Node's IP Address (Secondary)
                                </label>
                                <select
                                    className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-2"
                                    onChange={e => setJoinSecondaryIp(e.target.value)}
                                    value={joinSecondaryIp}
                                >
                                    <option value="">Select IP Address...</option>
                                    {clusterState?.serverIpAddresses?.map(ip => (
                                        <option key={ip} value={ip}>{ip}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">A comma separated list of IP addresses of this DNS server that will be accessible by all other DNS Server nodes in the Cluster.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Primary Node URL
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={joinPrimaryUrl}
                                        onChange={e => setJoinPrimaryUrl(e.target.value)}
                                        placeholder="http://192.168.1.10:5380/"
                                        className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">The web service HTTPS URL of the Primary node in the Cluster.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Primary Node IP (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={joinPrimaryIp}
                                        onChange={e => setJoinPrimaryIp(e.target.value)}
                                        placeholder="Leave blank to auto-detect"
                                        className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">The IP address of the Primary node in the Cluster. When unspecified, domain name in the Primary node URL will be resolved and used.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Admin Username
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={joinUsername}
                                        onChange={e => setJoinUsername(e.target.value)}
                                        className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">The username of an administrator on the Primary node in the Cluster.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={joinPassword}
                                        onChange={e => setJoinPassword(e.target.value)}
                                        className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">The password of the administrator user specified above.</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    TOTP (If enabled)
                                </label>
                                <input
                                    type="text"
                                    value={joinTotp}
                                    onChange={e => setJoinTotp(e.target.value)}
                                    maxLength={6}
                                    className="w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <p className="text-xs text-slate-500 mt-1">The 6-digit code you see in your authenticator app for the administrator user specified above. Only to be used if the user has 2FA enabled.</p>
                            </div>

                            <div>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={ignoreCertErrors}
                                        onChange={e => setIgnoreCertErrors(e.target.checked)}
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Ignore Certificate Errors</span>
                                </label>
                                <p className="text-xs text-slate-500 mt-1 pl-6">Set to true only when you know that the Primary node web service is using a self-signed TLS certificate and is reachable on a private network.</p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setInitMode(null)}
                                    className="px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
                                >
                                    {isLoading ? 'Joining...' : 'Join Cluster'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium text-slate-800 dark:text-white">Cluster Nodes</h3>
                    <p className="text-sm text-slate-500">{clusterState.clusterDomain}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchClusterState}
                        className="px-3 py-1 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                        Refresh
                    </button>
                    <button
                        onClick={handleResync}
                        className="px-3 py-1 text-sm bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                        Resync Config
                    </button>
                    {isPrimary ? (
                        <button
                            onClick={handleDeleteCluster}
                            className="px-3 py-1 text-sm bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-900/30 flex items-center gap-2"
                        >
                            <Trash2 size={14} />
                            Delete Cluster
                        </button>
                    ) : (
                        <button
                            onClick={handleLeaveCluster}
                            className="px-3 py-1 text-sm bg-orange-50 text-orange-600 border border-orange-200 rounded-md hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/30 dark:hover:bg-orange-900/30 flex items-center gap-2"
                        >
                            <LogOut size={14} />
                            Leave Cluster
                        </button>
                    )}
                </div>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-gray-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium border-b border-gray-200 dark:border-slate-700">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">State</th>
                            <th className="px-4 py-3">URL / IP</th>
                            <th className="px-4 py-3">Last Seen</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {clusterState.clusterNodes?.map((node) => {
                            const lastSeenDate = safeDate(node.lastSeen);
                            return (
                                <tr key={node.name} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                                        {node.name}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${node.type === 'Primary'
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                            : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                            }`}>
                                            {node.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${node.state === 'Connected' || node.state === 'Self'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {node.state}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                        <div className="text-xs">{node.url}</div>
                                        <div className="text-xs opacity-75">{node.ipAddresses?.join(', ') || '-'}</div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                        {lastSeenDate ? (
                                            <>
                                                <div>{lastSeenDate.toLocaleString()}</div>
                                                <div className="text-xs opacity-75">({formatDistanceToNow(lastSeenDate)} ago)</div>
                                            </>
                                        ) : node.state === 'Self' ? (
                                            <span className="text-slate-400 italic">Self</span>
                                        ) : (
                                            <span className="text-slate-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {isPrimary && node.type === 'Secondary' && (
                                            <button
                                                onClick={() => handleRemoveNode(node.id, node.name)}
                                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                                title="Remove Node"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
