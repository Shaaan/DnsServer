import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Dialog } from '../../../components/ui/Dialog';
import { RefreshCw } from 'lucide-react';

interface ConvertZoneModalProps {
    zoneName: string;
    currentType: string;
    isOpen: boolean;
    onClose: () => void;
}

export const ConvertZoneModal: React.FC<ConvertZoneModalProps> = ({ zoneName, currentType, isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const [targetType, setTargetType] = useState('Primary');

    // Based on legacy `showConvertZoneModal` logic
    const availableTypes = (() => {
        switch (currentType) {
            case 'Primary': return ['Forwarder'];
            case 'Secondary':
            case 'SecondaryForwarder': return ['Primary', 'Forwarder'];
            case 'Forwarder': return ['Primary'];
            case 'SecondaryCatalog': return ['Catalog'];
            default: return [];
        }
    })();

    // Set default selection
    useEffect(() => {
        if (availableTypes.length > 0) setTargetType(availableTypes[0]);
    }, [currentType, availableTypes.length]);

    const mutation = useMutation({
        mutationFn: async () => {
            await apiClient.post('/zones/convert', null, {
                params: {
                    zone: zoneName,
                    type: targetType
                }
            });
        },
        onSuccess: () => {
            toast.success('Zone converted successfully');
            onClose();
            queryClient.invalidateQueries({ queryKey: ['zones'] });
        },
        onError: () => {
            toast.error('Failed to convert zone');
        }
    });

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <RefreshCw size={20} /> Convert Zone: {zoneName}
                </div>
            }
            maxWidth="max-w-md"
        >
            <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Convert zone from <strong>{currentType}</strong> to:
                </p>

                <div className="space-y-2">
                    {availableTypes.length === 0 ? (
                        <div className="text-red-500 text-sm">No conversion options available for this zone type.</div>
                    ) : (
                        availableTypes.map(type => (
                            <label key={type} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-700 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                                <input
                                    type="radio"
                                    name="targetType"
                                    value={type}
                                    checked={targetType === type}
                                    onChange={() => setTargetType(type)}
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                                />
                                <span className="text-slate-900 dark:text-white font-medium">{type}</span>
                            </label>
                        ))
                    )}
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md">
                    Cancel
                </button>
                <button
                    onClick={() => mutation.mutate()}
                    disabled={mutation.isPending || availableTypes.length === 0}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2"
                >
                    {mutation.isPending ? 'Converting...' : 'Convert Zone'}
                </button>
            </div>
        </Dialog>
    );
};
