import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Save, AlertCircle } from 'lucide-react';
import { Dialog } from '../../components/ui/Dialog';
import type { DnsRecord, RecordType } from '../../api/records';
import toast from 'react-hot-toast';

interface RecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    zoneName: string;
    record?: DnsRecord | null; // If provided, we are in Edit mode
}

export const RecordModal: React.FC<RecordModalProps> = ({ isOpen, onClose, zoneName, record }) => {
    const queryClient = useQueryClient();
    const isEdit = !!record;

    // Form State
    const [domain, setDomain] = useState('');
    const [type, setType] = useState<RecordType>('A');
    const [ttl, setTtl] = useState(3600);
    const [comments, setComments] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Type specific states
    const [ipAddress, setIpAddress] = useState('');
    const [cname, setCname] = useState('');
    const [nameServer, setNameServer] = useState('');
    const [preference, setPreference] = useState(10);
    const [exchange, setExchange] = useState('');
    const [text, setText] = useState('');
    const [ptrName, setPtrName] = useState('');
    const [target, setTarget] = useState('');
    const [priority, setPriority] = useState(10);
    const [weight, setWeight] = useState(10);
    const [port, setPort] = useState(0);

    // Populate form on open/record change
    useEffect(() => {
        if (isOpen && record) {
            // Edit Mode: Populate fields
            // Domain: strip zone name to show relative
            let relDomain = record.domain;
            if (relDomain === zoneName) relDomain = '@';
            else if (relDomain.endsWith('.' + zoneName)) {
                relDomain = relDomain.substring(0, relDomain.length - (zoneName.length + 1));
            }
            setDomain(relDomain);
            setType(record.type as RecordType);
            setTtl(Number(record.ttl));
            setComments(record.comments || '');

            // Type specific population
            const rData = record.rData || {};
            if (record.type === 'A' || record.type === 'AAAA') setIpAddress(rData.ipAddress || '');
            else if (record.type === 'CNAME') setCname(rData.cname || '');
            else if (record.type === 'NS') setNameServer(rData.nameServer || '');
            else if (record.type === 'MX') {
                setPreference(rData.preference || 10);
                setExchange(rData.exchange || '');
            }
            else if (record.type === 'TXT') setText(rData.text || '');
            else if (record.type === 'PTR') setPtrName(rData.ptrName || '');
            else if (record.type === 'SRV') {
                setPriority(rData.priority || 10);
                setWeight(rData.weight || 10);
                setPort(rData.port || 0);
                setTarget(rData.target || '');
            }
        } else if (isOpen && !record) {
            // Add Mode: Reset
            resetForm();
        }
    }, [isOpen, record, zoneName]);

    const resetForm = () => {
        setDomain('');
        setType('A');
        setTtl(3600);
        setComments('');
        setIpAddress('');
        setCname('');
        setNameServer('');
        setExchange('');
        setText('');
        setTarget('');
        setError(null);
    };

    const mutation = useMutation({
        mutationFn: async () => {
            // Calculate FQDN for domain
            let fqdn = domain || '@';
            if (fqdn === '@') fqdn = zoneName;
            else if (zoneName === '.') fqdn = fqdn + '.';
            else fqdn = fqdn + '.' + zoneName;

            if (isEdit && record) {
                // Update
                const params: any = {
                    zone: zoneName,
                    domain: record.domain, // Old Domain
                    newDomain: fqdn, // New Domain
                    type: record.type,
                    ttl: ttl,
                    comments: comments,
                };

                // Type specific params
                if (type === 'A' || type === 'AAAA') {
                    params.ipAddress = record.rData.ipAddress;
                    params.newIpAddress = ipAddress;
                    params.updateSvcbHints = false; // Default
                } else if (type === 'CNAME') {
                    params.cname = cname; // API seems to take just cname for update? Or assumes old cname isn't needed for identity?
                    // Based on legacy `zone.js`: apiUrl += "&cname=" + encodeURIComponent(cname);
                } else if (type === 'NS') {
                    params.nameServer = record.rData.nameServer;
                    params.newNameServer = nameServer;
                    params.glue = ""; // Simplify for now
                } else if (type === 'MX') {
                    params.preference = record.rData.preference;
                    params.newPreference = preference;
                    params.exchange = record.rData.exchange;
                    params.newExchange = exchange;
                } else if (type === 'TXT') {
                    params.text = record.rData.text;
                    params.newText = text;
                    params.splitText = false;
                    params.newSplitText = false;
                } else if (type === 'PTR') {
                    params.ptrName = record.rData.ptrName;
                    params.newPtrName = ptrName;
                } else if (type === 'SRV') {
                    params.priority = record.rData.priority;
                    params.newPriority = priority;
                    params.weight = record.rData.weight;
                    params.newWeight = weight;
                    params.port = record.rData.port;
                    params.newPort = port;
                    params.target = record.rData.target;
                    params.newTarget = target;
                }

                await apiClient.post('/zones/records/update', null, { params });
            } else {
                // Add
                // Legacy Add assumes 'domain' parameter. If it expects FQDN or relative depends on backend.
                // But `zone.js` Add uses `$("#txtAddEditRecordName").val()` directly as `domain`. 
                // However, our `domain` state acts as relative. 
                // If we send relative, the backend might appends zone. 
                // Let's send relative if backend expects relative, but `update` logic suggests we manual construct FQDN.
                // Safe bet: Send what user typed? No, consistency.
                // Legacy `addRecord` URL construction: `&domain=` + `domain`.
                // If I assume `AddRecordModal` was working with relative input, then backend handles it.
                // But if I want to be sure, I can use the same FQDN logic if the backend supports it.
                // Let's stick to sending `domain` (relative/partial) for Add, as standard DNS servers often take relative.
                // actually `zone.js` `updateRecord` logic was explicit about `newDomain` construction. 
                // `addRecord` logic just grabs value. 
                // I will try sending relative `domain` for Add to match previous behavior, 
                // BUT for Update I MUST use `newDomain` FQDN as per `zone.js`.

                // wait, if I use `domain` state which is relative, passing it to `add` matches legacy.

                const params: any = {
                    zone: zoneName,
                    domain: domain || '@',
                    type: type,
                    ttl: ttl,
                    comments: comments,
                    overwrite: false,
                };

                if (type === 'A' || type === 'AAAA') params.ipAddress = ipAddress;
                else if (type === 'CNAME') params.cname = cname;
                else if (type === 'NS') params.nameServer = nameServer;
                else if (type === 'MX') { params.preference = preference; params.exchange = exchange; }
                else if (type === 'TXT') params.text = text;
                else if (type === 'PTR') params.ptrName = ptrName;
                else if (type === 'SRV') {
                    params.priority = priority;
                    params.weight = weight;
                    params.port = port;
                    params.target = target;
                }

                await apiClient.post('/zones/records/add', null, { params });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['zone-records', zoneName] });
            toast.success(isEdit ? 'Record updated successfully' : 'Record added successfully');
            if (!isEdit) resetForm(); // Keep form if edit failed? no this is success
            onClose();
        },
        onError: (err: any) => {
            setError(err.response?.data?.errorMessage || (isEdit ? 'Failed to update record' : 'Failed to add record'));
            toast.error(isEdit ? 'Failed to update record' : 'Failed to add record');
        }
    });

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? `Edit Record` : `Add Record to ${zoneName}`}
            maxWidth="max-w-lg"
            className="flex flex-col max-h-[90vh]"
        >
            <div className="flex-1 overflow-y-auto -mx-6 px-6 py-2">
                {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">Name</label>
                            <input
                                type="text"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="@"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">The domain name (relative).</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">Type</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as RecordType)}
                                disabled={isEdit}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'PTR', 'SRV'].map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Dynamic Fields */}
                    <div className="bg-gray-50 dark:bg-slate-950/50 rounded-xl p-4 border border-gray-100 dark:border-slate-800/50 space-y-4">
                        {(type === 'A' || type === 'AAAA') && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">IP Address</label>
                                <input
                                    type="text"
                                    value={ipAddress}
                                    onChange={(e) => setIpAddress(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={type === 'A' ? "1.2.3.4" : "2001:db8::1"}
                                />
                            </div>
                        )}
                        {type === 'CNAME' && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">CNAME</label>
                                <input
                                    type="text"
                                    value={cname}
                                    onChange={(e) => setCname(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="example.com"
                                />
                            </div>
                        )}
                        {type === 'NS' && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">Name Server</label>
                                <input
                                    type="text"
                                    value={nameServer}
                                    onChange={(e) => setNameServer(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="ns1.example.com"
                                />
                            </div>
                        )}
                        {type === 'MX' && (
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">Preference</label>
                                    <input
                                        type="number"
                                        value={preference}
                                        onChange={(e) => setPreference(Number(e.target.value))}
                                        className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">Exchange</label>
                                    <input
                                        type="text"
                                        value={exchange}
                                        onChange={(e) => setExchange(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="mail.example.com"
                                    />
                                </div>
                            </div>
                        )}
                        {type === 'TXT' && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">Text</label>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                                    placeholder="v=spf1 ..."
                                />
                            </div>
                        )}
                        {type === 'PTR' && (
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">PTR Name</label>
                                <input
                                    type="text"
                                    value={ptrName}
                                    onChange={(e) => setPtrName(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="example.com"
                                />
                            </div>
                        )}
                        {type === 'SRV' && (
                            <div className="grid grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">Priority</label>
                                    <input
                                        type="number"
                                        value={priority}
                                        onChange={(e) => setPriority(Number(e.target.value))}
                                        className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">Weight</label>
                                    <input
                                        type="number"
                                        value={weight}
                                        onChange={(e) => setWeight(Number(e.target.value))}
                                        className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">Port</label>
                                    <input
                                        type="number"
                                        value={port}
                                        onChange={(e) => setPort(Number(e.target.value))}
                                        className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="col-span-4">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">Target</label>
                                    <input
                                        type="text"
                                        value={target}
                                        onChange={(e) => setTarget(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="sip.example.com"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">TTL</label>
                            <input
                                type="number"
                                value={ttl}
                                onChange={(e) => setTtl(Number(e.target.value))}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">Comments (Optional)</label>
                            <input
                                type="text"
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-slate-800 pt-4 mt-4 flex justify-end gap-3 flex-shrink-0">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={() => mutation.mutate()}
                    className="px-4 py-2 bg-gradient-to-tl from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all active:scale-95 flex items-center gap-2"
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? 'Saving...' : (
                        <>
                            <Save size={16} />
                            {isEdit ? 'Save Changes' : 'Add Record'}
                        </>
                    )}
                </button>
            </div>
        </Dialog>
    );
};
