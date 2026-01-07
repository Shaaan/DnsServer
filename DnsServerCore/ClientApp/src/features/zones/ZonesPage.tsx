import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    Plus,
    Search,
    RefreshCw,
    MoreVertical,
    FileDown,
    Copy,
    Trash2,
    Settings,
    ShieldCheck,
    Lock,
    Upload,
    Shield,
    ShieldX,
    Power
} from 'lucide-react';
import { apiClient, type ApiResponse } from '../../api/client';
import type { ZonesListResponse } from '../../api/zones';
import { AddZoneModal } from './AddZoneModal';
import { CloneZoneModal } from './modals/CloneZoneModal';
import { ConvertZoneModal } from './modals/ConvertZoneModal';
import { ZoneOptionsModal } from './modals/ZoneOptionsModal';
import { ImportZoneModal } from './modals/ImportZoneModal';
import { SignZoneModal } from './modals/SignZoneModal';
import { UnsignZoneModal } from './modals/UnsignZoneModal';
import { ViewDsRecordsModal } from './modals/ViewDsRecordsModal';
import { ZonePermissionsModal } from './modals/ZonePermissionsModal';
import { Skeleton } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

// ...existing code...
/**
 * Zones Page
 * 
 * Manages DNS zones including creation, deletion, and records management.
 * Features:
 * - List of all hosted zones
 * - Options to add new zones (primary/secondary)
 * - Navigation to zone records
 */
export const ZonesPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Modal States
    const [optionsModalZone, setOptionsModalZone] = useState<string | null>(null);
    const [cloneModalZone, setCloneModalZone] = useState<string | null>(null);
    const [convertModalZone, setConvertModalZone] = useState<{ name: string, type: string } | null>(null);
    const [zoneToImport, setZoneToImport] = useState<string | null>(null);
    const [zoneToSign, setZoneToSign] = useState<string | null>(null);
    const [zoneToUnsign, setZoneToUnsign] = useState<string | null>(null);
    const [zoneToViewDs, setZoneToViewDs] = useState<string | null>(null);
    const [zoneToEditPermissions, setZoneToEditPermissions] = useState<string | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    const { data, isLoading, error } = useQuery({
        queryKey: ['zones', page],
        queryFn: async () => {
            const response = await apiClient.get<ApiResponse<ZonesListResponse>>('/zones/list', {
                params: { pageNumber: page, zonesPerPage: 10 }
            });
            return response.data.response;
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (zoneName: string) => {
            await apiClient.post('/zones/delete', null, { params: { zone: zoneName } });
        },
        onSuccess: (_, zoneName) => {
            queryClient.invalidateQueries({ queryKey: ['zones'] });
            toast.success(`Zone ${zoneName} deleted successfully`);
        },
        onError: () => {
            toast.error('Failed to delete zone');
        }
    });

    const toggleMutation = useMutation({
        mutationFn: async ({ zone, enable }: { zone: string; enable: boolean }) => {
            const endpoint = enable ? '/zones/enable' : '/zones/disable';
            await apiClient.post(endpoint, null, { params: { zone } });
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['zones'] });
            toast.success(`Zone ${variables.enable ? 'enabled' : 'disabled'} successfully`);
        },
        onError: () => {
            toast.error('Failed to update zone status');
        }
    });

    const resyncMutation = useMutation({
        mutationFn: async (zoneName: string) => {
            await apiClient.post('/zones/resync', null, { params: { zone: zoneName } });
        },
        onSuccess: (_, zoneName) => {
            toast.success(`Resync triggered for ${zoneName}`);
        },
        onError: () => {
            toast.error('Failed to trigger resync');
        }
    });

    const handleExport = (zoneName: string) => {
        apiClient.get('/zones/export', {
            params: { zone: zoneName },
            responseType: 'blob'
        }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${zoneName}.zone`); // or extract filename from header
            document.body.appendChild(link);
            link.click();
            link.remove();
        }).catch(() => toast.error('Failed to export zone'));
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <Skeleton className="h-8 w-32 mb-1" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-10 w-32 rounded-lg" />
                </div>

                <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl overflow-hidden shadow-soft-xl dark:shadow-none min-h-[400px]">
                    <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex gap-4">
                        <Skeleton className="h-10 w-full max-w-md rounded-lg" />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-gray-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-3 font-semibold"><Skeleton className="h-4 w-24" /></th>
                                    <th className="px-6 py-3 font-semibold"><Skeleton className="h-4 w-16" /></th>
                                    <th className="px-6 py-3 font-semibold"><Skeleton className="h-4 w-16" /></th>
                                    <th className="px-6 py-3 text-right font-semibold"><Skeleton className="h-4 w-16 ml-auto" /></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                                {[...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-4"><Skeleton className="h-5 w-48" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-5 w-20" /></td>
                                        <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                                        <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-24 ml-auto rounded-lg" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
    if (error) return <div className="p-8 text-center text-red-500">Error loading zones</div>;

    const zones = data?.zones || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500" onClick={() => setOpenDropdownId(null)}>
            <AddZoneModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

            {optionsModalZone && (
                <ZoneOptionsModal
                    zoneName={optionsModalZone}
                    isOpen={!!optionsModalZone}
                    onClose={() => setOptionsModalZone(null)}
                />
            )}

            {cloneModalZone && (
                <CloneZoneModal
                    sourceZone={cloneModalZone}
                    isOpen={!!cloneModalZone}
                    onClose={() => setCloneModalZone(null)}
                />
            )}

            {convertModalZone && (
                <ConvertZoneModal
                    zoneName={convertModalZone.name}
                    currentType={convertModalZone.type}
                    isOpen={!!convertModalZone}
                    onClose={() => setConvertModalZone(null)}
                />
            )}

            <ImportZoneModal
                isOpen={!!zoneToImport}
                onClose={() => setZoneToImport(null)}
                zoneName={zoneToImport || undefined}
            />

            {zoneToSign && (
                <SignZoneModal
                    zoneName={zoneToSign}
                    isOpen={!!zoneToSign}
                    onClose={() => setZoneToSign(null)}
                />
            )}

            {zoneToUnsign && (
                <UnsignZoneModal
                    zoneName={zoneToUnsign}
                    isOpen={!!zoneToUnsign}
                    onClose={() => setZoneToUnsign(null)}
                />
            )}

            {zoneToViewDs && (
                <ViewDsRecordsModal
                    zoneName={zoneToViewDs}
                    isOpen={!!zoneToViewDs}
                    onClose={() => setZoneToViewDs(null)}
                />
            )}

            {zoneToEditPermissions && (
                <ZonePermissionsModal
                    zoneName={zoneToEditPermissions}
                    isOpen={!!zoneToEditPermissions}
                    onClose={() => setZoneToEditPermissions(null)}
                />
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Zones</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your DNS zones</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-gradient-to-tl from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all active:scale-95"
                >
                    <Plus size={18} />
                    <span>Add Zone</span>
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl overflow-hidden shadow-soft-xl dark:shadow-none min-h-[400px]">
                <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search zones..."
                            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                    <div className="inline-block min-w-full align-middle">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-gray-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Zone Name</th>
                                    <th className="px-6 py-3 font-semibold">Type</th>
                                    <th className="px-6 py-3 font-semibold">Status</th>
                                    <th className="px-6 py-3 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                                {zones.map((zone) => (
                                    <tr key={zone.name} className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">
                                            <Link to={`/zones/${zone.name}`} className="hover:text-blue-500 hover:underline transition-colors flex items-center gap-2">
                                                {zone.name}
                                                {zone.internal && <span className="ml-2 text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Internal</span>}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                            {zone.type}
                                        </td>
                                        <td className="px-6 py-4">
                                            {zone.disabled ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-transparent">
                                                    Disabled
                                                </span>
                                            ) : zone.isExpired ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-transparent">
                                                    Expired
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-transparent">
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 relative">
                                                {!zone.internal && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleMutation.mutate({ zone: zone.name, enable: !zone.disabled }); }}
                                                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                                        title={zone.disabled ? "Enable" : "Disable"}
                                                    >
                                                        <Power size={16} className={!zone.disabled ? "text-emerald-500" : ""} />
                                                    </button>
                                                )}

                                                {/* Dropdown Menu */}
                                                <div className="relative">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === zone.name ? null : zone.name); }}
                                                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                                    >
                                                        <MoreVertical size={16} />
                                                    </button>

                                                    {openDropdownId === zone.name && (
                                                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-gray-100 dark:border-slate-700 z-10 py-1 text-left">
                                                            <Link to={`/zones/${zone.name}`} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700">
                                                                {zone.internal ? 'View Zone' : 'Edit Zone'}
                                                            </Link>

                                                            {!zone.internal && (
                                                                <>
                                                                    <button onClick={() => setOptionsModalZone(zone.name)} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                                                        <Settings size={14} /> Zone Options
                                                                    </button>

                                                                    {(zone.type === 'Primary' || zone.type === 'Forwarder' || zone.type === 'Secondary' || zone.type === 'SecondaryForwarder' || zone.type === 'Catalog' || zone.type === 'SecondaryCatalog') && (
                                                                        <button onClick={() => handleExport(zone.name)} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                                                            <FileDown size={14} /> Export Zone
                                                                        </button>
                                                                    )}

                                                                    {(zone.type === 'Primary' || zone.type === 'Forwarder') && (
                                                                        <button onClick={() => setCloneModalZone(zone.name)} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                                                            <Copy size={14} /> Clone Zone
                                                                        </button>
                                                                    )}

                                                                    {(zone.type !== 'Catalog' && !zone.internal) && (
                                                                        <button onClick={() => setConvertModalZone({ name: zone.name, type: zone.type })} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2">
                                                                            <RefreshCw size={14} /> Convert Zone
                                                                        </button>
                                                                    )}

                                                                    {(zone.type !== 'Primary' && zone.type !== 'Forwarder' && zone.type !== 'Catalog') && (
                                                                        <button onClick={() => resyncMutation.mutate(zone.name)} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2">
                                                                            <RefreshCw size={14} /> Resync
                                                                        </button>
                                                                    )}

                                                                    <div className="border-t border-gray-100 dark:border-slate-700 my-1"></div>

                                                                    <button onClick={() => setZoneToEditPermissions(zone.name)} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2">
                                                                        <Lock size={14} /> Permissions
                                                                    </button>

                                                                    <button onClick={() => setZoneToImport(zone.name)} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2">
                                                                        <Upload size={14} /> Import Zone
                                                                    </button>

                                                                    <div className="border-t border-gray-100 dark:border-slate-700 my-1"></div>

                                                                    {!zone.hasDnssecPrivateKeys ? (
                                                                        <button onClick={() => setZoneToSign(zone.name)} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2">
                                                                            <ShieldCheck size={14} /> Sign Zone
                                                                        </button>
                                                                    ) : (
                                                                        <>
                                                                            <button onClick={() => setZoneToViewDs(zone.name)} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2">
                                                                                <Shield size={14} /> View DS Info
                                                                            </button>
                                                                            <button onClick={() => setZoneToUnsign(zone.name)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                                                                                <ShieldX size={14} /> Unsign Zone
                                                                            </button>
                                                                        </>
                                                                    )}

                                                                    <div className="border-t border-gray-100 dark:border-slate-700 my-1"></div>

                                                                    <button
                                                                        onClick={() => {
                                                                            if (confirm(`Delete zone ${zone.name}?`)) deleteMutation.mutate(zone.name);
                                                                        }}
                                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                                                    >
                                                                        <Trash2 size={14} /> Delete Zone
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {zones.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                            No zones found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination Controls */}
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
                            disabled={page === (data?.totalPages || 1)}
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

