import React, { useState } from 'react';
import { Dialog } from '../../../components/ui/Dialog';
import { apiClient } from '../../../api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Copy } from 'lucide-react';

interface CloneZoneModalProps {
    sourceZone: string;
    isOpen: boolean;
    onClose: () => void;
}

export const CloneZoneModal: React.FC<CloneZoneModalProps> = ({ sourceZone, isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const [newZoneName, setNewZoneName] = useState('');

    const mutation = useMutation({
        mutationFn: async () => {
            // Legacy: `zone` is the new name, `sourceZone` is the old name
            await apiClient.post('/zones/clone', null, {
                params: {
                    zone: newZoneName,
                    sourceZone: sourceZone
                }
            });
        },
        onSuccess: () => {
            toast.success('Zone cloned successfully');
            onClose();
            setNewZoneName('');
            queryClient.invalidateQueries({ queryKey: ['zones'] });
        },
        onError: () => {
            toast.error('Failed to clone zone');
        }
    });

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <Copy size={20} /> Clone Zone
                </div>
            }
            maxWidth="max-w-md"
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Source Zone</label>
                    <input
                        type="text"
                        value={sourceZone}
                        disabled
                        className="w-full bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md py-2 px-3 text-slate-500 cursor-not-allowed"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Zone Name</label>
                    <input
                        type="text"
                        value={newZoneName}
                        onChange={(e) => setNewZoneName(e.target.value)}
                        placeholder="example.com"
                        className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md py-2 px-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md">
                    Cancel
                </button>
                <button
                    onClick={() => mutation.mutate()}
                    disabled={mutation.isPending || !newZoneName}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2"
                >
                    {mutation.isPending ? 'Cloning...' : 'Clone Zone'}
                </button>
            </div>
        </Dialog>
    );
};
