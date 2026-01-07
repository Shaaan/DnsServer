import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/client';
import toast from 'react-hot-toast';

interface SignZoneModalProps {
    zoneName: string;
    isOpen: boolean;
    onClose: () => void;
}

export const SignZoneModal: React.FC<SignZoneModalProps> = ({ zoneName, isOpen, onClose }) => {
    const queryClient = useQueryClient();

    // Basic options only for now, can be expanded to full parity if needed
    const [algorithm, setAlgorithm] = useState('ECDSA'); // Recommended default
    const [nsecMode, setNsecMode] = useState<'NSEC' | 'NSEC3'>('NSEC');

    const signMutation = useMutation({
        mutationFn: async () => {
            // Mapping UI selections to backend params
            // We'll stick to 'Automatic' key generation for simplicity in this initial implementation
            // matching the defaults usually desired.

            const params = new URLSearchParams();
            params.append('zone', zoneName);
            params.append('algorithm', algorithm);
            params.append('nxProof', nsecMode);

            // Default params for automatic key generation
            params.append('kskGeneration', 'Automatic');
            params.append('zskGeneration', 'Automatic');
            params.append('zskRolloverDays', '30');

            await apiClient.post('/zones/dnssec/sign', null, { params });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['zones'] });
            toast.success('Zone signed successfully');
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.errorMessage || 'Failed to sign zone');
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500/75 dark:bg-slate-900/80"></div>
                </div>

                <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                    <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-start mb-5">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <ShieldCheck className="text-emerald-500" size={24} />
                                Sign Zone with DNSSEC
                            </h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Algorithm
                                </label>
                                <select
                                    value={algorithm}
                                    onChange={(e) => setAlgorithm(e.target.value)}
                                    className="w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2"
                                >
                                    <option value="ECDSA">ECDSA (Recommended) - ECDSAP256SHA256 (13)</option>
                                    <option value="RSA">RSA - RSASHA256 (8)</option>
                                    <option value="EDDSA">EdDSA - ED25519 (15)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Denial of Existence Proof
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="nsecMode"
                                            value="NSEC"
                                            checked={nsecMode === 'NSEC'}
                                            onChange={() => setNsecMode('NSEC')}
                                            className="text-blue-600"
                                        />
                                        <span className="text-slate-700 dark:text-slate-300">NSEC</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="nsecMode"
                                            value="NSEC3"
                                            checked={nsecMode === 'NSEC3'}
                                            onChange={() => setNsecMode('NSEC3')}
                                            className="text-blue-600"
                                        />
                                        <span className="text-slate-700 dark:text-slate-300">NSEC3 (Prevent Zone Walking)</span>
                                    </label>
                                </div>
                            </div>

                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                                Keys will be automatically generated and managed by the server. ZSK rollover is set to 30 days.
                            </p>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={() => signMutation.mutate()}
                            disabled={signMutation.isPending}
                            className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                        >
                            {signMutation.isPending ? 'Signing...' : 'Sign Zone'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
