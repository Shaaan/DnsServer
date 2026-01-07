import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { X, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface AddZoneModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type ZoneType = 'Primary' | 'Secondary' | 'Stub' | 'Forwarder' | 'SecondaryForwarder' | 'Catalog' | 'SecondaryCatalog';
type ProxyType = 'NoProxy' | 'DefaultProxy' | 'Http' | 'Socks5';

export const AddZoneModal: React.FC<AddZoneModalProps> = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const [zoneName, setZoneName] = useState('');
    const [zoneType, setZoneType] = useState<ZoneType>('Primary');
    const [error, setError] = useState<string | null>(null);

    // Primary & Catalog specific
    const [useSoaSerialDateScheme, setUseSoaSerialDateScheme] = useState(true);

    // Secondary, Stub, SecondaryForwarder, SecondaryCatalog specific
    const [primaryNameServers, setPrimaryNameServers] = useState('');
    const [zoneTransferProtocol, setZoneTransferProtocol] = useState<'Tcp' | 'Tls' | 'Quic'>('Tcp');
    const [tsigKeyName, setTsigKeyName] = useState('');
    const [validateZone, setValidateZone] = useState(false);

    // Forwarder specific
    const [initializeForwarder, setInitializeForwarder] = useState(true);
    const [forwarderIp, setForwarderIp] = useState('8.8.8.8');
    const [forwarderProtocol, setForwarderProtocol] = useState<'Udp' | 'Tcp' | 'Tls' | 'Https'>('Udp');
    const [dnssecValidation, setDnssecValidation] = useState(true);

    // Proxy specific
    const [proxyType, setProxyType] = useState<ProxyType>('DefaultProxy');
    const [proxyAddress, setProxyAddress] = useState('');
    const [proxyPort, setProxyPort] = useState<number>(0);
    const [proxyUsername, setProxyUsername] = useState('');
    const [proxyPassword, setProxyPassword] = useState('');

    const [catalogName, setCatalogName] = useState('');

    // File Upload
    const fileInputRef = useRef<HTMLInputElement>(null);

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const formData = new FormData();

            // Append common fields
            formData.append('token', localStorage.getItem('token') || '');
            formData.append('zone', data.zone);
            formData.append('type', data.type);

            if (data.catalog) formData.append('catalog', data.catalog);

            if (['Primary', 'Catalog'].includes(data.type)) {
                if (data.useSoaSerialDateScheme) formData.append('useSoaSerialDateScheme', 'true');
            } else if (['Secondary', 'Stub', 'SecondaryForwarder', 'SecondaryCatalog'].includes(data.type)) {
                if (data.primaryNameServerAddresses) formData.append('primaryNameServerAddresses', data.primaryNameServerAddresses);
                if (data.type !== 'Stub') {
                    if (data.zoneTransferProtocol) formData.append('zoneTransferProtocol', data.zoneTransferProtocol);
                    if (data.tsigKeyName) formData.append('tsigKeyName', data.tsigKeyName);
                }
                if (data.type === 'Secondary' && data.validateZone) {
                    formData.append('validateZone', 'true');
                }
            } else if (data.type === 'Forwarder') {
                if (data.initializeForwarder) {
                    formData.append('initializeForwarder', 'true');
                    formData.append('forwarder', data.forwarder);
                    formData.append('protocol', data.protocol);
                    if (data.dnssecValidation) formData.append('dnssecValidation', 'true');

                    formData.append('proxyType', data.proxyType);
                    if (data.proxyType !== 'NoProxy' && data.proxyType !== 'DefaultProxy') {
                        formData.append('proxyAddress', data.proxyAddress);
                        formData.append('proxyPort', data.proxyPort.toString());
                        if (data.proxyUsername) formData.append('proxyUsername', data.proxyUsername);
                        if (data.proxyPassword) formData.append('proxyPassword', data.proxyPassword);
                    }
                } else {
                    formData.append('initializeForwarder', 'false');
                }
            }

            // Handle File Upload
            if (fileInputRef.current?.files?.[0]) {
                formData.append('fileImportZone', fileInputRef.current.files[0]);
            }

            // For FormData we typically use post, but axios / apiClient might need specific handling to not serialize as JSON
            // But apiClient.post should handle FormData correctly if passed as data.
            // Note: API might expect query params for some things if not using FormData.
            // But usually mixed is fine or all in FormData. 
            // The API doc says "POST request with multi-part form data".

            // To be safe and consistent with previous calls that used params:
            // We can construct the URL with params AND send FormData? 
            // Or just send everything in FormData. Legacy uses common `HTTPRequest` which likely puts everything in FormData if file is present.
            // If CreateZone is strict about Query Params vs Form Data, we might need to adjust.
            // APIDOCS line 1935: "use POST request with multi-part form data containing the zone file data."
            // This suggests all params can go in body.

            await apiClient.post('/zones/create', formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['zones'] });
            toast.success('Zone created successfully');
            resetForm();
            onClose();
        },
        onError: (err: any) => {
            setError(err.response?.data?.errorMessage || err.response?.data?.message || 'Failed to create zone');
            toast.error('Failed to create zone');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!zoneName) {
            setError('Zone name is required');
            return;
        }

        // Forwarder validation
        if (zoneType === 'Forwarder' && initializeForwarder) {
            if (!forwarderIp) {
                setError('Forwarder IP is required');
                return;
            }
            if ((proxyType === 'Http' || proxyType === 'Socks5') && (!proxyAddress || !proxyPort)) {
                setError('Proxy Address and Port are required for manual proxy configuration');
                return;
            }
        }

        // Secondary validation
        if (['Secondary', 'Stub', 'SecondaryForwarder', 'SecondaryCatalog'].includes(zoneType)) {
            if (!primaryNameServers) {
                setError('Primary Name Servers are required');
                return;
            }
        }

        const request: any = {
            zone: zoneName,
            type: zoneType,
            catalog: catalogName,
            useSoaSerialDateScheme,
            primaryNameServerAddresses: primaryNameServers,
            zoneTransferProtocol,
            tsigKeyName,
            validateZone,
            initializeForwarder,
            forwarder: forwarderIp,
            protocol: forwarderProtocol,
            dnssecValidation,
            proxyType,
            proxyAddress,
            proxyPort,
            proxyUsername,
            proxyPassword
        };

        createMutation.mutate(request);
    };

    const resetForm = () => {
        setZoneName('');
        setZoneType('Primary');
        setPrimaryNameServers('');
        setForwarderIp('8.8.8.8');
        setUseSoaSerialDateScheme(true);
        setZoneTransferProtocol('Tcp');
        setTsigKeyName('');
        setValidateZone(false);
        setCatalogName('');
        setInitializeForwarder(true);
        setDnssecValidation(true);
        setProxyType('DefaultProxy');
        setProxyAddress('');
        setProxyPort(0);
        setProxyUsername('');
        setProxyPassword('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setError(null);
    };

    if (!isOpen) return null;

    const isSecondaryLike = ['Secondary', 'SecondaryForwarder', 'SecondaryCatalog'].includes(zoneType);
    const isStub = zoneType === 'Stub';
    const showForwarderSettings = zoneType === 'Forwarder' && initializeForwarder;
    const showFileUpload = (zoneType === 'Primary') || (zoneType === 'Forwarder' && !initializeForwarder);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 rounded-2xl shadow-soft-2xl dark:shadow-2xl w-full max-w-2xl p-6 animate-in fade-in zoom-in duration-200 my-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Add New Zone</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">Zone Name</label>
                            <input
                                type="text"
                                value={zoneName}
                                onChange={(e) => setZoneName(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="example.com"
                                autoFocus
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Domain name, IP (reverse), or CIDR.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">Zone Type</label>
                            <select
                                value={zoneType}
                                onChange={e => setZoneType(e.target.value as ZoneType)}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Primary">Primary</option>
                                <option value="Secondary">Secondary</option>
                                <option value="Stub">Stub</option>
                                <option value="Forwarder">Forwarder</option>
                                <option value="SecondaryForwarder">Secondary Forwarder</option>
                                <option value="Catalog">Catalog</option>
                                <option value="SecondaryCatalog">Secondary Catalog</option>
                            </select>
                        </div>
                    </div>

                    {['Primary', 'Secondary', 'Stub', 'Forwarder'].includes(zoneType) && (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">Member of Catalog Zone (Optional)</label>
                            <input
                                type="text"
                                value={catalogName}
                                onChange={(e) => setCatalogName(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="catalog.example.com"
                            />
                        </div>
                    )}

                    {/* Type Specific Fields */}
                    <div className="bg-gray-50 dark:bg-slate-950/50 rounded-xl p-4 border border-gray-100 dark:border-slate-800/50 space-y-4">
                        {(zoneType === 'Primary' || zoneType === 'Catalog' || zoneType === 'Forwarder') && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="useSoaSerialDateScheme"
                                    checked={useSoaSerialDateScheme}
                                    onChange={(e) => setUseSoaSerialDateScheme(e.target.checked)}
                                    className="rounded bg-gray-200 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-blue-600 focus:ring-offset-0 focus:ring-0"
                                />
                                <label htmlFor="useSoaSerialDateScheme" className="text-sm text-slate-600 dark:text-slate-300 select-none font-medium">
                                    Use YYYYMMDDnn Serial Date Scheme
                                </label>
                            </div>
                        )}

                        {zoneType === 'Forwarder' && (
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="initializeForwarder"
                                    checked={initializeForwarder}
                                    onChange={(e) => setInitializeForwarder(e.target.checked)}
                                    className="rounded bg-gray-200 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-blue-600 focus:ring-offset-0 focus:ring-0"
                                />
                                <label htmlFor="initializeForwarder" className="text-sm text-slate-600 dark:text-slate-300 select-none font-medium">
                                    Initialize Forwarder
                                </label>
                            </div>
                        )}

                        {showFileUpload && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">Import Zone File (Optional)</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-slate-800 dark:file:text-slate-200"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Upload a standard DNS zone file to populate the zone.</p>
                            </div>
                        )}

                        {(isSecondaryLike || isStub) && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">Primary Name Servers</label>
                                    <textarea
                                        value={primaryNameServers}
                                        onChange={(e) => setPrimaryNameServers(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                                        placeholder="1.1.1.1&#10;8.8.8.8"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">List of comma separated (or new line) IP addresses or domain names of the primary name server.</p>
                                </div>

                                {isSecondaryLike && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">Zone Transfer Protocol</label>
                                                <select
                                                    value={zoneTransferProtocol}
                                                    onChange={(e) => setZoneTransferProtocol(e.target.value as any)}
                                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="Tcp">TCP</option>
                                                    <option value="Tls">TLS</option>
                                                    <option value="Quic">QUIC</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">TSIG Key Name</label>
                                                <input
                                                    type="text"
                                                    value={tsigKeyName}
                                                    onChange={(e) => setTsigKeyName(e.target.value)}
                                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Optional"
                                                />
                                            </div>
                                        </div>
                                        {zoneType === 'Secondary' && (
                                            <div className="flex items-center gap-2 pt-2">
                                                <input
                                                    type="checkbox"
                                                    id="validateZone"
                                                    checked={validateZone}
                                                    onChange={(e) => setValidateZone(e.target.checked)}
                                                    className="rounded bg-gray-200 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-blue-600 focus:ring-offset-0 focus:ring-0"
                                                />
                                                <label htmlFor="validateZone" className="text-sm text-slate-600 dark:text-slate-300 select-none font-medium">
                                                    Enable ZONEMD Validation
                                                </label>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {showForwarderSettings && (
                            <div className="space-y-4 border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
                                <h4 className="font-semibold text-sm text-slate-800 dark:text-white">Forwarder Configuration</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">Forwarder IP</label>
                                        <input
                                            type="text"
                                            value={forwarderIp}
                                            onChange={(e) => setForwarderIp(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="8.8.8.8"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">Protocol</label>
                                        <select
                                            value={forwarderProtocol}
                                            onChange={(e) => setForwarderProtocol(e.target.value as any)}
                                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="Udp">UDP</option>
                                            <option value="Tcp">TCP</option>
                                            <option value="Tls">TLS</option>
                                            <option value="Https">HTTPS</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="dnssecValidation"
                                        checked={dnssecValidation}
                                        onChange={(e) => setDnssecValidation(e.target.checked)}
                                        className="rounded bg-gray-200 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-blue-600 focus:ring-offset-0 focus:ring-0"
                                    />
                                    <label htmlFor="dnssecValidation" className="text-sm text-slate-600 dark:text-slate-300 select-none font-medium">
                                        Enable DNSSEC Validation
                                    </label>
                                </div>

                                <div className="space-y-3 p-3 bg-gray-100 dark:bg-slate-900 rounded-lg">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-400">Proxy Settings</label>
                                    <select
                                        value={proxyType}
                                        onChange={(e) => setProxyType(e.target.value as ProxyType)}
                                        className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                                    >
                                        <option value="DefaultProxy">Use Default Proxy</option>
                                        <option value="NoProxy">No Proxy</option>
                                        <option value="Http">HTTP</option>
                                        <option value="Socks5">SOCKS5</option>
                                    </select>

                                    {(proxyType === 'Http' || proxyType === 'Socks5') && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                value={proxyAddress}
                                                onChange={(e) => setProxyAddress(e.target.value)}
                                                placeholder="Proxy Address"
                                                className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                                            />
                                            <input
                                                type="number"
                                                value={proxyPort}
                                                onChange={(e) => setProxyPort(Number(e.target.value))}
                                                placeholder="Port"
                                                className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                                            />
                                            <input
                                                type="text"
                                                value={proxyUsername}
                                                onChange={(e) => setProxyUsername(e.target.value)}
                                                placeholder="Username (Optional)"
                                                className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                                            />
                                            <input
                                                type="password"
                                                value={proxyPassword}
                                                onChange={(e) => setProxyPassword(e.target.value)}
                                                placeholder="Password (Optional)"
                                                className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
                            disabled={createMutation.isPending}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-gradient-to-tl from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all active:scale-95 flex items-center gap-2"
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? 'Creating...' : (
                                <>
                                    <Save size={16} />
                                    Create Zone
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
