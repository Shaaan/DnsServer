import React, { useState, useRef } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../api/client';
import toast from 'react-hot-toast';

interface ImportZoneModalProps {
    isOpen: boolean;
    onClose: () => void;
    zoneName?: string; // Optional, if importing into existing zone (though typically import creates/overwrites)
}

export const ImportZoneModal: React.FC<ImportZoneModalProps> = ({ isOpen, onClose, zoneName }) => {
    const queryClient = useQueryClient();
    const [file, setFile] = useState<File | null>(null);
    const [importType, setImportType] = useState<'File' | 'Text'>('File');
    const [textData, setTextData] = useState('');
    const [targetZone, setTargetZone] = useState(zoneName || '');
    const [overwrite, setOverwrite] = useState(false);
    const [overwriteSoa, setOverwriteSoa] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const importMutation = useMutation({
        mutationFn: async () => {
            const formData = new FormData();
            formData.append('zone', targetZone);
            formData.append('overwrite', overwrite.toString());
            formData.append('overwriteSoaSerial', overwriteSoa.toString());

            if (importType === 'File' && file) {
                formData.append('file', file);
            } else {
                // For text import, we might need a specific endpoint or just send as blob
                // The legacy app uses the same endpoint for file upload.
                // We'll create a blob from text.
                const blob = new Blob([textData], { type: 'text/plain' });
                formData.append('file', blob, 'import.txt');
            }

            await apiClient.post('/zones/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' } // axios sets this auto but just to be sure
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['zones'] });
            toast.success('Zone imported successfully');
            onClose();
            setFile(null);
            setTextData('');
            setTargetZone('');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.errorMessage || 'Failed to import zone');
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
                                <Upload className="text-blue-500" size={24} />
                                Import Zone
                            </h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Zone Name
                                </label>
                                <input
                                    type="text"
                                    value={targetZone}
                                    onChange={(e) => setTargetZone(e.target.value)}
                                    placeholder="example.com"
                                    className="w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3"
                                />
                            </div>

                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={importType === 'File'}
                                        onChange={() => setImportType('File')}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Upload File</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={importType === 'Text'}
                                        onChange={() => setImportType('Text')}
                                        className="text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Paste Text</span>
                                </label>
                            </div>

                            {importType === 'File' ? (
                                <div
                                    className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-500 transition-colors cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept=".txt,.zone,.dns"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    />
                                    <div className="flex flex-col items-center gap-2">
                                        {file ? (
                                            <>
                                                <FileText size={32} className="text-emerald-500" />
                                                <span className="text-sm font-medium text-slate-900 dark:text-white">{file.name}</span>
                                                <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={32} className="text-slate-400" />
                                                <span className="text-sm text-slate-600 dark:text-slate-400">Click to upload zone file</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <textarea
                                    value={textData}
                                    onChange={(e) => setTextData(e.target.value)}
                                    rows={8}
                                    placeholder="Paste zone file content here..."
                                    className="w-full rounded-lg border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm font-mono"
                                />
                            )}

                            <div className="space-y-2">
                                <label className="flex items-start gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={overwrite}
                                        onChange={(e) => setOverwrite(e.target.checked)}
                                        className="mt-1 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                        Overwrite existing zone if it exists
                                    </span>
                                </label>
                                <label className="flex items-start gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={overwriteSoa}
                                        onChange={(e) => setOverwriteSoa(e.target.checked)}
                                        className="mt-1 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                        Overwrite SOA Serial (Use serial from imported file)
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={() => importMutation.mutate()}
                            disabled={!targetZone || (importType === 'File' && !file) || (importType === 'Text' && !textData) || importMutation.isPending}
                            className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {importMutation.isPending ? 'Importing...' : 'Import Zone'}
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
