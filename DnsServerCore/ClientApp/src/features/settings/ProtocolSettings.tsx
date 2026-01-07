import React from 'react';
import type { SettingsResponse } from '../../api/settings';
import { Lock } from 'lucide-react';

interface ProtocolSettingsProps {
    data: SettingsResponse;
    onChange: (field: keyof SettingsResponse, value: any) => void;
}

export const ProtocolSettings: React.FC<ProtocolSettingsProps> = ({ data, onChange }) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* DNS Over UDP/TCP */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-gray-200 dark:border-slate-800 pb-2">Traditional DNS</h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 shadow-sm dark:shadow-none transition-shadow">
                            <div>
                                <div className="font-bold text-slate-800 dark:text-slate-200">UDP Proxy</div>
                                <div className="text-xs text-slate-500">Enable this option to accept DNS-over-UDP-PROXY requests. It implements the PROXY Protocol for both version 1 & 2 over UDP datagram.</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    value={data.dnsOverUdpProxyPort}
                                    onChange={(e) => onChange('dnsOverUdpProxyPort', parseInt(e.target.value))}
                                    className="w-20 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-2 py-1.5 text-sm text-right text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                    disabled={!data.enableDnsOverUdpProxy}
                                />
                                <input
                                    type="checkbox"
                                    checked={data.enableDnsOverUdpProxy}
                                    onChange={(e) => onChange('enableDnsOverUdpProxy', e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 shadow-sm dark:shadow-none transition-shadow">
                            <div>
                                <div className="font-bold text-slate-800 dark:text-slate-200">TCP Proxy</div>
                                <div className="text-xs text-slate-500">Enable this option to accept DNS-over-TCP-PROXY requests. It implements the PROXY Protocol for both version 1 & 2 over TCP connection.</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    value={data.dnsOverTcpProxyPort}
                                    onChange={(e) => onChange('dnsOverTcpProxyPort', parseInt(e.target.value))}
                                    className="w-20 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-2 py-1.5 text-sm text-right text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                    disabled={!data.enableDnsOverTcpProxy}
                                />
                                <input
                                    type="checkbox"
                                    checked={data.enableDnsOverTcpProxy}
                                    onChange={(e) => onChange('enableDnsOverTcpProxy', e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-primary transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* HTTP (Plain) */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 shadow-sm dark:shadow-none transition-shadow">
                        <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">DNS-over-HTTP</div>
                            <div className="text-xs text-slate-500">Enable this option to accept DNS-over-HTTP requests. It must be used with a TLS terminating reverse proxy like nginx.</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                value={data.dnsOverHttpPort}
                                onChange={(e) => onChange('dnsOverHttpPort', parseInt(e.target.value))}
                                className="w-20 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-2 py-1.5 text-sm text-right text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                disabled={!data.enableDnsOverHttp}
                            />
                            <input
                                type="checkbox"
                                checked={data.enableDnsOverHttp}
                                onChange={(e) => onChange('enableDnsOverHttp', e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-primary transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Encrypted DNS */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white border-b border-gray-200 dark:border-slate-800 pb-2 flex items-center gap-2">
                        <Lock size={16} className="text-primary" />
                        Encrypted DNS
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 shadow-sm dark:shadow-none transition-shadow">
                            <div>
                                <div className="font-bold text-slate-800 dark:text-slate-200">DNS-over-TLS (DoT)</div>
                                <div className="text-xs text-slate-500">Enable this option to accept DNS-over-TLS requests.</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    value={data.dnsOverTlsPort}
                                    onChange={(e) => onChange('dnsOverTlsPort', parseInt(e.target.value))}
                                    className="w-20 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-2 py-1.5 text-sm text-right text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                    disabled={!data.enableDnsOverTls}
                                />
                                <input
                                    type="checkbox"
                                    checked={data.enableDnsOverTls}
                                    onChange={(e) => onChange('enableDnsOverTls', e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 shadow-sm dark:shadow-none transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-slate-800 dark:text-slate-200">DNS-over-HTTPS (DoH)</div>
                                    <div className="text-xs text-slate-500">Enable this option to accept DNS-over-HTTPS requests.</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        value={data.dnsOverHttpsPort}
                                        onChange={(e) => onChange('dnsOverHttpsPort', parseInt(e.target.value))}
                                        className="w-20 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-2 py-1.5 text-sm text-right text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                        disabled={!data.enableDnsOverHttps}
                                    />
                                    <input
                                        type="checkbox"
                                        checked={data.enableDnsOverHttps}
                                        onChange={(e) => onChange('enableDnsOverHttps', e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-primary transition-all"
                                    />
                                </div>
                            </div>
                            {data.enableDnsOverHttps && (
                                <div className="flex items-center gap-2 mt-2 pl-2">
                                    <input
                                        type="checkbox"
                                        checked={data.enableDnsOverHttp3}
                                        onChange={(e) => onChange('enableDnsOverHttp3', e.target.checked)}
                                        id="enableDnsOverHttp3"
                                        className="w-4 h-4 rounded border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="enableDnsOverHttp3" className="text-sm font-semibold text-slate-700 dark:text-slate-300 select-none">Enable HTTP/3</label>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 shadow-sm dark:shadow-none transition-shadow">
                            <div>
                                <div className="font-bold text-slate-800 dark:text-slate-200">DNS-over-QUIC (DoQ)</div>
                                <div className="text-xs text-slate-500">Enable this option to accept DNS-over-QUIC requests.</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    value={data.dnsOverQuicPort}
                                    onChange={(e) => onChange('dnsOverQuicPort', parseInt(e.target.value))}
                                    className="w-20 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-2 py-1.5 text-sm text-right text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                                    disabled={!data.enableDnsOverQuic}
                                />
                                <input
                                    type="checkbox"
                                    checked={data.enableDnsOverQuic}
                                    onChange={(e) => onChange('enableDnsOverQuic', e.target.checked)}
                                    className="w-5 h-5 rounded border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-primary transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full h-px bg-gray-200 dark:bg-slate-800" />

            {/* Certificate & ACL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">DNS-over-TLS Certificate</h4>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">Certificate Path</label>
                        <input
                            type="text"
                            value={data.dnsTlsCertificatePath}
                            onChange={(e) => onChange('dnsTlsCertificatePath', e.target.value)}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            placeholder="/path/to/cert.pfx"
                        />
                        <p className="text-xs text-slate-500">Specify a PKCS #12 certificate (.pfx) file path on the server. The certificate must contain private key. This certificate is used by the DNS-over-TLS and DNS-over-HTTPS optional protocols.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">Certificate Password</label>
                        <input
                            type="password"
                            value={data.dnsTlsCertificatePassword || ''}
                            onChange={(e) => onChange('dnsTlsCertificatePassword', e.target.value)}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                        />
                        <p className="text-xs text-slate-500">Enter the certificate (.pfx) password, if any.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">Access Control</h4>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">Reverse Proxy Network ACL</label>
                        <textarea
                            value={data.reverseProxyNetworkACL?.join('\n') || ''}
                            onChange={(e) => onChange('reverseProxyNetworkACL', e.target.value.split('\n').map(s => s.trim()))}
                            rows={3}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm transition-shadow"
                            placeholder="127.0.0.1"
                        />
                        <p className="text-xs text-slate-500">Configure the ACL to allow only requests coming from your reverse proxy server for DNS-over-UDP-PROXY, DNS-over-TCP-PROXY, and DNS-over-HTTP protocols. Enter IP addresses or network addresses one below another to allow access. Add ! character at the start to deny access. The ACL is processed in the same order its listed. If no networks match, the default policy is to deny all.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">Real IP Header</label>
                        <input
                            type="text"
                            value={data.dnsOverHttpRealIpHeader || ''}
                            onChange={(e) => onChange('dnsOverHttpRealIpHeader', e.target.value)}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            placeholder="X-Forwarded-For"
                        />
                        <p className="text-xs text-slate-500">The HTTP header that must be used to read client's actual IP address when the request comes from a reverse proxy with a private IP address.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
