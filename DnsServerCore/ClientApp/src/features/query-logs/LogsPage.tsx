import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { apiClient, type ApiResponse } from '../../api/client';
import type { LogsListResponse, QueryLogsResponse, QueryLogEntry } from '../../api/logs';
import type { AppsListResponse } from '../../api/apps';
import { Link } from 'react-router-dom';
import { FileText, Search, Trash2, ChevronLeft, ChevronRight, MoreVertical, Globe, ShieldAlert } from 'lucide-react';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatTimestamp } from '../../utils/utils';
import toast from 'react-hot-toast';

// ...existing code...
/**
 * Logs Page
 * 
 * Displays Query Logs and Server Logs.
 * Features:
 * - Query Logs: Filterable table of DNS queries with blocking capabilities.
 * - Server Logs: Viewer for raw server log files with search functionality.
 */
export const LogsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'query-logs' | 'server-logs'>('query-logs');
    const queryClient = useQueryClient();

    // Track open menu by row number or ID
    const [openMenuRow, setOpenMenuRow] = useState<number | null>(null);

    // --- Query Logs State ---
    // ... [existing state]
    const [page, setPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [filters, setFilters] = useState({
        appName: '',
        classPath: '',
        qname: '',
        clientIp: '',
        protocol: '',
        qtype: '',
        responseType: '',
        rcode: '',
        start: '',
        end: ''
    });
    // Temporary state for filter inputs to avoid refetching on every keystroke
    const [filterInputs, setFilterInputs] = useState(filters);

    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = () => setOpenMenuRow(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // ... [Server Logs State]
    const [selectedLogFile, setSelectedLogFile] = useState<string | null>(null);
    const [logContent, setLogContent] = useState<string>('');
    const [serverLogSearch, setServerLogSearch] = useState('');

    // ...

    const parsedServerLogs = React.useMemo(() => {
        if (!logContent) return [];
        const lines = logContent.split('\n').filter(Boolean);
        return lines
            .map(line => {
                // Try to match [Timestamp] Message format
                const match = line.match(/^\[(.*?)\] (.*)$/);
                if (match) {
                    // Convert "2023-11-20 05:30:00 UTC" to "2023-11-20T05:30:00Z"
                    const rawTime = match[1];
                    const isoTime = rawTime.includes(' UTC')
                        ? rawTime.replace(' UTC', 'Z').replace(' ', 'T')
                        : rawTime;

                    return { timestamp: formatTimestamp(isoTime), message: match[2] };
                }
                return { timestamp: '', message: line };
            })
            .filter(entry =>
                entry.message.toLowerCase().includes(serverLogSearch.toLowerCase()) ||
                entry.timestamp.toLowerCase().includes(serverLogSearch.toLowerCase())
            );
    }, [logContent, serverLogSearch]);

    // --- Queries ---

    // 1. Get apps to populate the "App Name" dropdown (Query Logs)
    const appsQuery = useQuery({
        queryKey: ['apps', 'installed'],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<AppsListResponse>>('/apps/list');
            return response.data.response.apps;
        },
        enabled: activeTab === 'query-logs'
    });

    // Determine available logging apps
    const loggingApps = appsQuery.data?.filter(app => app.dnsApps.some(da => da.isQueryLogs)) || [];

    // Auto-select first logging app if not selected
    React.useEffect(() => {
        if (loggingApps.length > 0 && !filters.appName) {
            const firstApp = loggingApps[0];
            const firstClassPath = firstApp.dnsApps.find(da => da.isQueryLogs)?.classPath || '';
            setFilters(prev => ({ ...prev, appName: firstApp.name, classPath: firstClassPath }));
            setFilterInputs(prev => ({ ...prev, appName: firstApp.name, classPath: firstClassPath }));
        }
    }, [loggingApps, filters.appName]);

    // 2. Fetch Query Logs
    const queryLogsQuery = useQuery({
        queryKey: ['logs', 'query', page, filters],
        queryFn: async () => {
            if (!filters.appName || !filters.classPath) return null;

            // Destructure to separate appName (which maps to 'name') from other filters
            const { appName, ...restFilters } = filters;

            const params: any = {
                name: appName,
                pageNumber: page,
                entriesPerPage: entriesPerPage,
                descendingOrder: true,
                ...restFilters
            };

            // Remove empty filters
            Object.keys(params).forEach(key => {
                if (params[key] === '') delete params[key];
            });

            const response = await apiClient.get<ApiResponse<QueryLogsResponse>>('/logs/query', { params });
            return response.data.response;
        },
        enabled: activeTab === 'query-logs' && !!filters.appName && !!filters.classPath,
        placeholderData: keepPreviousData
    });

    // 3. Fetch Server Log Files
    const serverLogsQuery = useQuery({
        queryKey: ['logs', 'files'],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<LogsListResponse>>('/logs/list');
            return response.data.response.logFiles;
        },
        enabled: activeTab === 'server-logs'
    });

    // 4. Fetch specific server log content
    const viewLogMutation = useMutation({
        mutationFn: async (fileName: string) => {
            const response = await apiClient.get('/logs/download', {
                params: { fileName, limit: 100 }, // Fetch last 100 lines preview
                responseType: 'text' // Important: logs/download returns text, not JSON
            });
            // The API returns text. Axios might try to parse JSON if content-type is json. 
            // logs.js says: isTextResponse: true. 
            // Let's assume it returns text.
            return response.data;
        },
        onSuccess: (data) => {
            if (typeof data === 'object') {
                setLogContent(JSON.stringify(data, null, 2));
            } else {
                setLogContent(data);
            }
        }
    });

    const blockDomainMutation = useMutation({
        mutationFn: async (domain: string) => {
            await apiClient.get('/blocked/add', { params: { domain } });
        },
        onSuccess: () => {
            toast.success('Domain blocked successfully');
        },
        onError: () => {
            toast.error('Failed to block domain');
        }
    });

    // --- Actions ---
    const handleSearch = () => {
        setPage(1);
        setFilters(filterInputs);
    };

    const handleViewLog = (fileName: string) => {
        setSelectedLogFile(fileName);
        viewLogMutation.mutate(fileName);
    };

    const handleDeleteLog = async (fileName: string) => {
        if (!confirm(`Delete log file ${fileName}?`)) return;
        try {
            await apiClient.get('/logs/delete', { params: { log: fileName } });
            toast.success(`Log file ${fileName} deleted successfully`);
            queryClient.invalidateQueries({ queryKey: ['logs', 'files'] });
        } catch (error) {
            toast.error(`Failed to delete log file ${fileName}`);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                        <FileText className="text-blue-500" />
                        Logs
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">View DNS query logs and server logs.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-slate-800 flex gap-6">
                <button
                    onClick={() => setActiveTab('query-logs')}
                    className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'query-logs' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                    Query Logs
                    {activeTab === 'query-logs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" />}
                </button>
                <button
                    onClick={() => setActiveTab('server-logs')}
                    className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'server-logs' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                    Server Logs
                    {activeTab === 'server-logs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-t-full" />}
                </button>
            </div>

            {/* Query Logs Tab */}
            {activeTab === 'query-logs' && (
                <div className="space-y-4">
                    {/* Filters */}
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft-sm space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Logging App</label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                    value={filterInputs.appName}
                                    onChange={(e) => {
                                        const app = loggingApps.find(a => a.name === e.target.value);
                                        const cp = app?.dnsApps.find(da => da.isQueryLogs)?.classPath || '';
                                        setFilterInputs(prev => ({ ...prev, appName: e.target.value, classPath: cp }));
                                    }}
                                >
                                    {loggingApps.map(app => (
                                        <option key={app.name} value={app.name}>{app.name}</option>
                                    ))}
                                    {loggingApps.length === 0 && <option value="">No Logging App Found</option>}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Domain (QName)</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="example.com"
                                    value={filterInputs.qname}
                                    onChange={(e) => setFilterInputs(prev => ({ ...prev, qname: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Client IP</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="192.168.1.1"
                                    value={filterInputs.clientIp}
                                    onChange={(e) => setFilterInputs(prev => ({ ...prev, clientIp: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Protocol</label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                    value={filterInputs.protocol || ''}
                                    onChange={(e) => setFilterInputs(prev => ({ ...prev, protocol: e.target.value }))}
                                >
                                    <option value="">Any</option>
                                    <option value="Udp">UDP</option>
                                    <option value="Tcp">TCP</option>
                                    <option value="Tls">TLS</option>
                                    <option value="Https">HTTPS</option>
                                    <option value="Quic">QUIC</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Type (QType)</label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                    value={filterInputs.qtype || ''}
                                    onChange={(e) => setFilterInputs(prev => ({ ...prev, qtype: e.target.value }))}
                                >
                                    <option value="">Any</option>
                                    <option value="A">A</option>
                                    <option value="AAAA">AAAA</option>
                                    <option value="CNAME">CNAME</option>
                                    <option value="MX">MX</option>
                                    <option value="NS">NS</option>
                                    <option value="PTR">PTR</option>
                                    <option value="SOA">SOA</option>
                                    <option value="SRV">SRV</option>
                                    <option value="TXT">TXT</option>
                                    <option value="ANY">ANY</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Response</label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                    value={filterInputs.responseType || ''}
                                    onChange={(e) => setFilterInputs(prev => ({ ...prev, responseType: e.target.value }))}
                                >
                                    <option value="">Any</option>
                                    <option value="Recursive">Recursive</option>
                                    <option value="Cached">Cached</option>
                                    <option value="Blocked">Blocked</option>
                                    <option value="Authoritative">Authoritative</option>
                                    <option value="Dropped">Dropped</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">RCode</label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                    value={filterInputs.rcode || ''}
                                    onChange={(e) => setFilterInputs(prev => ({ ...prev, rcode: e.target.value }))}
                                >
                                    <option value="">Any</option>
                                    <option value="NoError">NoError</option>
                                    <option value="FormErr">FormErr</option>
                                    <option value="ServFail">ServFail</option>
                                    <option value="NXDomain">NXDomain</option>
                                    <option value="NotImp">NotImp</option>
                                    <option value="Refused">Refused</option>
                                    <option value="YXDomain">YXDomain</option>
                                    <option value="YXRRSet">YXRRSet</option>
                                    <option value="NXRRSet">NXRRSet</option>
                                    <option value="NotAuth">NotAuth</option>
                                    <option value="NotZone">NotZone</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
                                <input
                                    type="datetime-local"
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={filterInputs.start || ''}
                                    onChange={(e) => setFilterInputs(prev => ({ ...prev, start: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">End Date</label>
                                <input
                                    type="datetime-local"
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={filterInputs.end || ''}
                                    onChange={(e) => setFilterInputs(prev => ({ ...prev, end: e.target.value }))}
                                />
                            </div>
                            <div className="md:col-start-4 flex items-end">
                                <button
                                    onClick={handleSearch}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-2 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Search size={16} /> Search Logs
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-soft-md">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-gray-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Time</th>
                                        <th className="px-6 py-4 font-bold">Client</th>
                                        <th className="px-6 py-4 font-bold">Protocol</th>
                                        <th className="px-6 py-4 font-bold">Type</th>
                                        <th className="px-6 py-4 font-bold">QName</th>
                                        <th className="px-6 py-4 font-bold">Answer</th>
                                        <th className="px-6 py-4 font-bold">RCode</th>
                                        <th className="px-6 py-4 font-bold w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                                    {queryLogsQuery.isLoading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={`skel-${i}`}>
                                                <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                                <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                                                <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                                                <td className="px-6 py-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                                                <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                                                <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                                                <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                                                <td className="px-6 py-4"><div className="w-4" /></td>
                                            </tr>
                                        ))
                                    ) : !queryLogsQuery.data ? (
                                        <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Select a logging app to view logs</td></tr>
                                    ) : queryLogsQuery.data.entries.length === 0 ? (
                                        <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">No logs found matching criteria</td></tr>
                                    ) : (
                                        queryLogsQuery.data.entries.map((entry: QueryLogEntry) => (
                                            <tr key={entry.rowNumber} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap text-xs font-medium">
                                                    {new Date(entry.timestamp).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-emerald-600 dark:text-emerald-400">{entry.clientIpAddress}</td>
                                                <td className="px-6 py-4 text-xs font-medium text-slate-600 dark:text-slate-300">{entry.protocol}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                                                        ${entry.responseType === 'Blocked' ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20' :
                                                            entry.responseType === 'Cached' ? 'bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20' :
                                                                'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20'}`}>
                                                        {entry.responseType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300 max-w-xs truncate font-medium" title={entry.qname}>{entry.qname}</td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-xs truncate text-xs font-mono" title={entry.answer}>{entry.answer}</td>
                                                <td className="px-6 py-4 text-slate-500 text-xs font-medium">{entry.rcode}</td>
                                                <td className="px-6 py-4">
                                                    <div className="relative">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenMenuRow(openMenuRow === entry.rowNumber ? null : entry.rowNumber);
                                                            }}
                                                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
                                                        >
                                                            <MoreVertical size={16} />
                                                        </button>

                                                        {openMenuRow === entry.rowNumber && (
                                                            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                                <Link
                                                                    to={`/tools/dns-client?domain=${encodeURIComponent(entry.qname)}&type=${entry.qtype}&protocol=${entry.protocol?.toUpperCase() || 'UDP'}`}
                                                                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors w-full text-left"
                                                                >
                                                                    <Globe size={14} className="text-blue-500" />
                                                                    Query DNS Server
                                                                </Link>
                                                                <button
                                                                    onClick={() => {
                                                                        if (confirm(`Block domain ${entry.qname}?`)) {
                                                                            blockDomainMutation.mutate(entry.qname);
                                                                        }
                                                                        setOpenMenuRow(null);
                                                                    }}
                                                                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors w-full text-left"
                                                                >
                                                                    <ShieldAlert size={14} />
                                                                    Block Domain
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {queryLogsQuery.data && (
                            <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-slate-900/50">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rows per page:</span>
                                    <select
                                        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        value={entriesPerPage}
                                        onChange={(e) => {
                                            setEntriesPerPage(Number(e.target.value));
                                            setPage(1); // Reset to first page on change
                                        }}
                                    >
                                        <option value={10}>10</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                        <option value={200}>200</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                    >
                                        <ChevronLeft size={16} /> Previous
                                    </button>
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        // Disable next if we have fewer entries than requested, suggesting end of list
                                        disabled={queryLogsQuery.data.entries.length < entriesPerPage}
                                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                    >
                                        Next <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Server Logs Tab */}
            {activeTab === 'server-logs' && (
                <div className="space-y-4">
                    {/* Filters */}
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-soft-sm space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Log File</label>
                                <select
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                    value={selectedLogFile || ''}
                                    onChange={(e) => handleViewLog(e.target.value)}
                                >
                                    <option value="" disabled>Select a log file</option>
                                    {serverLogsQuery.data?.map(file => (
                                        <option key={file.fileName} value={file.fileName}>
                                            {file.fileName} ({file.size})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2 space-y-1">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Search Content</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Search in logs..."
                                        value={serverLogSearch}
                                        onChange={(e) => setServerLogSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex items-end gap-2">
                                {selectedLogFile && (
                                    <button
                                        onClick={() => handleDeleteLog(selectedLogFile)}
                                        className="w-full bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 py-2 rounded-xl text-sm font-bold transition-all border border-red-200 dark:border-red-500/20 flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={16} /> Delete File
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-soft-md">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-gray-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-4 font-bold w-48">Time</th>
                                        <th className="px-6 py-4 font-bold">Message</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                                    {viewLogMutation.isPending ? (
                                        <tr><td colSpan={2} className="px-6 py-8 text-center text-slate-500">Loading log content...</td></tr>
                                    ) : !selectedLogFile ? (
                                        <tr><td colSpan={2} className="px-6 py-8 text-center text-slate-500">Select a log file to view records</td></tr>
                                    ) : parsedServerLogs.length === 0 ? (
                                        <tr><td colSpan={2} className="px-6 py-8 text-center text-slate-500">No logs found matching criteria</td></tr>
                                    ) : (
                                        parsedServerLogs.map((entry, index) => (
                                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 whitespace-nowrap text-xs font-medium align-top">
                                                    {entry.timestamp}
                                                </td>
                                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-mono text-xs break-all">
                                                    {entry.message}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
