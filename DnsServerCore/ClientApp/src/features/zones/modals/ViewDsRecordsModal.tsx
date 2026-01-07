import React from 'react';
import { X, ShieldCheck, Copy } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient, type ApiResponse } from '../../../api/client';
import type { ViewDsResponse } from '../../../api/zones';
import toast from 'react-hot-toast';

interface ViewDsRecordsModalProps {
    zoneName: string;
    isOpen: boolean;
    onClose: () => void;
}

export const ViewDsRecordsModal: React.FC<ViewDsRecordsModalProps> = ({ zoneName, isOpen, onClose }) => {
    const { data, isLoading } = useQuery({
        queryKey: ['zones', zoneName, 'dsRecords'],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<ViewDsResponse>>('/zones/dnssec/viewDS', {
                params: { zone: zoneName }
            });
            return response.data.response;
        },
        enabled: isOpen && !!zoneName
    });

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500/75 dark:bg-slate-900/80"></div>
                </div>

                <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
                    <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-start mb-5">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <ShieldCheck className="text-emerald-500" size={24} />
                                DS Records for {zoneName}
                            </h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                This zone is signed with DNSSEC. You need to add these DS records to your domain registrar's panel to complete the chain of trust.
                            </p>

                            {isLoading ? (
                                <div className="text-center py-8 text-slate-500">Loading records...</div>
                            ) : (
                                <div className="space-y-3">
                                    {data?.dsRecords?.map((record, idx) => (
                                        <div key={idx} className="bg-gray-50 dark:bg-slate-900 p-3 rounded-lg border border-gray-200 dark:border-slate-700 font-mono text-xs break-all relative group">
                                            <div className="text-slate-700 dark:text-slate-300 pr-8">
                                                {record}
                                            </div>
                                            <button
                                                onClick={() => handleCopy(record)}
                                                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Copy"
                                            >
                                                <Copy size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {(!data?.dsRecords || data.dsRecords.length === 0) && (
                                        <div className="text-center py-6 bg-gray-50 dark:bg-slate-900 rounded-lg border border-dashed border-gray-300 dark:border-slate-700 text-slate-500">
                                            No DS records found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full inline-flex justify-center rounded-lg border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
