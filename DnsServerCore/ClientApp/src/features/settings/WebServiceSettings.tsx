import React from 'react';
import type { SettingsResponse } from '../../api/settings';
import { Lock, Info } from 'lucide-react';

interface WebServiceSettingsProps {
    data: SettingsResponse;
    onChange: (field: keyof SettingsResponse, value: any) => void;
}

export const WebServiceSettings: React.FC<WebServiceSettingsProps> = ({ data, onChange }) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* HTTP Settings */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    HTTP Configuration
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Web Console</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">HTTP Port</label>
                        <input
                            type="number"
                            value={data.webServiceHttpPort}
                            onChange={(e) => onChange('webServiceHttpPort', parseInt(e.target.value))}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                        />
                        <p className="text-xs text-slate-500">Specify the TCP port number for the web console and this API web service.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">Local Addresses (Listen IPs)</label>
                        <textarea
                            value={data.webServiceLocalAddresses?.join('\n') || ''}
                            onChange={(e) => onChange('webServiceLocalAddresses', e.target.value.split('\n').map(s => s.trim()))}
                            rows={3}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm transition-shadow"
                            placeholder="0.0.0.0, [::]"
                        />
                        <p className="text-xs text-slate-500">Local addresses are the network interface IP addresses you want the web service to listen for requests.</p>
                    </div>
                </div>
            </div>

            <div className="w-full h-px bg-gray-200 dark:bg-slate-800" />

            {/* TLS Settings */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Lock size={20} className="text-slate-400" />
                    TLS & HTTPS
                </h3>

                <div className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 shadow-sm dark:shadow-none mb-6">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={data.webServiceEnableTls}
                            onChange={(e) => onChange('webServiceEnableTls', e.target.checked)}
                            id="webServiceEnableTls"
                            className="w-5 h-5 rounded border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-primary transition-all"
                        />
                        <label htmlFor="webServiceEnableTls" className="text-lg font-bold text-slate-800 dark:text-white select-none">Enable TLS (HTTPS)</label>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 ml-8">Set this to true to start the HTTPS service to access web service.</p>
                </div>

                <div className={`space-y-6 ${!data.webServiceEnableTls ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-400">TLS Port</label>
                            <input
                                type="number"
                                value={data.webServiceTlsPort}
                                onChange={(e) => onChange('webServiceTlsPort', parseInt(e.target.value))}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            />
                            <p className="text-xs text-slate-500">Specified the TCP port number for the web console for HTTPS access.</p>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-400">Certificate Path</label>
                            <input
                                type="text"
                                value={data.webServiceTlsCertificatePath}
                                onChange={(e) => onChange('webServiceTlsCertificatePath', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                                placeholder="/path/to/cert.pfx"
                            />
                            <p className="text-xs text-slate-500">Specify a PKCS #12 certificate (.pfx) file path on the server. The certificate must contain private key. This certificate is used by the web console for HTTPS access.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-400">Certificate Password</label>
                            <input
                                type="password"
                                value={data.webServiceTlsCertificatePassword || ''}
                                onChange={(e) => onChange('webServiceTlsCertificatePassword', e.target.value)}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            />
                            <p className="text-xs text-slate-500">Enter the certificate (.pfx) password, if any.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={data.webServiceEnableHttp3}
                                onChange={(e) => onChange('webServiceEnableHttp3', e.target.checked)}
                                id="webServiceEnableHttp3"
                                className="w-4 h-4 rounded border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-primary focus:ring-primary"
                            />
                            <label htmlFor="webServiceEnableHttp3" className="text-sm font-semibold text-slate-700 dark:text-slate-300 select-none">Enable HTTP/3 (QUIC)</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={data.webServiceHttpToTlsRedirect}
                                onChange={(e) => onChange('webServiceHttpToTlsRedirect', e.target.checked)}
                                id="webServiceHttpToTlsRedirect"
                                className="w-4 h-4 rounded border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-primary focus:ring-primary"
                            />
                            <label htmlFor="webServiceHttpToTlsRedirect" className="text-sm font-semibold text-slate-700 dark:text-slate-300 select-none">Redirect HTTP to HTTPS</label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={data.webServiceUseSelfSignedTlsCertificate}
                                onChange={(e) => onChange('webServiceUseSelfSignedTlsCertificate', e.target.checked)}
                                id="webServiceUseSelfSignedTlsCertificate"
                                className="w-4 h-4 rounded border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-primary focus:ring-primary"
                            />
                            <label htmlFor="webServiceUseSelfSignedTlsCertificate" className="text-sm font-semibold text-slate-700 dark:text-slate-300 select-none">Use Self Signed Certificate (Dev)</label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full h-px bg-gray-200 dark:bg-slate-800" />

            {/* Proxy Settings (Reverse Proxy) */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Info size={20} className="text-slate-400" />
                    Reverse Proxy Integration
                </h3>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-400">Real IP Header</label>
                    <input
                        type="text"
                        value={data.webServiceRealIpHeader}
                        onChange={(e) => onChange('webServiceRealIpHeader', e.target.value)}
                        className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                        placeholder="X-Real-IP"
                    />
                    <p className="text-xs text-slate-500">The HTTP header that must be used to read client's actual IP address when the request comes from a reverse proxy with a private IP address.</p>
                </div>
            </div>
        </div>
    );
};
