import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, type ApiResponse } from '../../api/client';
import type { ZoneRecordsResponse, DnsRecord } from '../../api/records';
import { ArrowLeft, Search, Plus, Trash2, Pencil, Settings } from 'lucide-react';
import { RecordModal } from './RecordModal';
import { ZoneOptionsModal } from './modals/ZoneOptionsModal';
import toast from 'react-hot-toast';

export const ZoneRecordsPage: React.FC = () => {
    const { zoneName } = useParams<{ zoneName: string }>();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<DnsRecord | null>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ['zone-records', zoneName, page, search],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<ZoneRecordsResponse>>('/zones/records/get', {
                params: {
                    zone: zoneName,
                    domain: search || zoneName,
                    listZone: true,
                    pageNumber: page,
                    recordsPerPage: 100
                }
            });
            return response.data.response;
        },
        enabled: !!zoneName
    });

    const deleteMutation = useMutation({
        mutationFn: async (record: DnsRecord) => {
            const params: any = {
                zone: zoneName,
                domain: record.domain,
                type: record.type
            };

            // Enhanced delete logic for specificity
            if (record.type === 'A' || record.type === 'AAAA') {
                params.ipAddress = record.rData?.ipAddress;
            } else if (record.type === 'MX') {
                params.exchange = record.rData?.exchange;
                params.preference = record.rData?.preference;
            } else if (record.type === 'TXT') {
                // params.text = record.rData?.text; // Might be too long, trust domain/type?
            }

            await apiClient.post('/zones/records/delete', null, { params });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['zone-records', zoneName] });
            toast.success('Record deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete record');
        }
    });

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading records...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error loading records</div>;

    const zone = data?.zone;
    const records = data?.records || [];

    const handleAdd = () => {
        setEditingRecord(null);
        setIsAddModalOpen(true);
    };

    const handleEdit = (record: DnsRecord) => {
        setEditingRecord(record);
        setIsAddModalOpen(true);
    };

    const handleClose = () => {
        setIsAddModalOpen(false);
        setEditingRecord(null);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {zoneName && (
                <>
                    <RecordModal
                        isOpen={isAddModalOpen}
                        onClose={handleClose}
                        zoneName={zoneName}
                        record={editingRecord}
                    />
                    <ZoneOptionsModal
                        isOpen={isOptionsModalOpen}
                        onClose={() => setIsOptionsModalOpen(false)}
                        zoneName={zoneName}
                    />
                </>
            )}

            <div className="flex flex-col gap-4">
                <Link to="/zones" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors w-fit">
                    <ArrowLeft size={16} />
                    <span>Back to Zones</span>
                </Link>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                            {zone?.name}
                            {zone?.internal && <span className="text-sm bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded ml-2 font-bold uppercase tracking-wider">Internal</span>}
                        </h2>
                        <div className="flex items-center gap-3 mt-1 text-slate-500 dark:text-slate-400 text-sm">
                            <span className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${!zone?.disabled ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                                {zone?.disabled ? 'Disabled' : 'Active'}
                            </span>
                            <span>•</span>
                            <span>{zone?.type}</span>
                            {zone?.dnssecStatus && (
                                <>
                                    <span>•</span>
                                    <span className={`inline-flex items-center gap-1 ${zone.hasDnssecPrivateKeys ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                                        {zone.dnssecStatus}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsOptionsModalOpen(true)}
                            className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all text-sm font-medium"
                        >
                            <Settings size={18} />
                            <span>Zone Options</span>
                        </button>
                        <button
                            onClick={handleAdd}
                            className="bg-gradient-to-tl from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all active:scale-95"
                        >
                            <Plus size={18} />
                            <span>Add Record</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl overflow-hidden shadow-soft-xl dark:shadow-none min-h-[400px]">
                <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search records..."
                            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-gray-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-3 font-semibold">Name</th>
                                <th className="px-6 py-3 w-24 font-semibold">Type</th>
                                <th className="px-6 py-3 w-24 font-semibold">TTL</th>
                                <th className="px-6 py-3 font-semibold">Data</th>
                                <th className="px-6 py-3 w-24 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                            {records.map((record, i) => (
                                <tr key={i} className={`hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors ${record.disabled ? 'opacity-50' : ''}`}>
                                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">
                                        {record.domain}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-mono font-bold">
                                            {record.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                                        {record.timeToLive}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono text-xs break-all">
                                        {record.displayRData}
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(record)}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                            title="Edit Record"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete this record?')) {
                                                    deleteMutation.mutate(record);
                                                }
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Delete Record"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {records.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No records found. Click 'Add Record' to create one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-sm text-slate-500">
                        Page {data?.pageNumber} of {data?.totalPages}
                    </div>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-3 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm text-slate-600 dark:text-slate-300 transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            disabled={page === data?.totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm text-slate-600 dark:text-slate-300 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
