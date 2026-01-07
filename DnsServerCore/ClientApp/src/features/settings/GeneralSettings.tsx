import React from 'react';
import type { SettingsResponse } from '../../api/settings';

interface GeneralSettingsProps {
    data: SettingsResponse;
    onChange: (field: keyof SettingsResponse, value: any) => void;
    // We might need a more complex onChange or react-hook-form later
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({ data, onChange }) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Local Parameters */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    Server Configuration
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">This Server</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">DNS Server Domain</label>
                        <input
                            type="text"
                            value={data.dnsServerDomain}
                            onChange={(e) => onChange('dnsServerDomain', e.target.value)}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                        />
                        <p className="text-xs text-slate-500">The primary domain name used by this DNS Server to identify itself.</p>
                    </div>

                    <div className="space-y-2 col-span-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">Local End Points</label>
                        <textarea
                            value={data.dnsServerLocalEndPoints?.join('\n') || ''}
                            onChange={(e) => onChange('dnsServerLocalEndPoints', e.target.value.split('\n').map(s => s.trim()))}
                            rows={3}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm transition-shadow"
                        />
                        <p className="text-xs text-slate-500">Local end points are the network interface IP addresses and ports you want the DNS Server to listen for requests. Example: 0.0.0.0:53, [::]:53</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">IPv4 Source Addresses</label>
                        <textarea
                            value={data.dnsServerIPv4SourceAddresses?.join('\n') || ''}
                            onChange={(e) => onChange('dnsServerIPv4SourceAddresses', e.target.value.split('\n').map(s => s.trim()))}
                            rows={2}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm transition-shadow"
                            placeholder="0.0.0.0"
                        />
                        <p className="text-xs text-slate-500">A comma separated list of IPv4 source addresses that the DNS server must use for making all outbound DNS requests when the server is connected to two or more networks. Network addresses are also accepted. By default, the IPv4 address of the network with a default route will be used as the source address.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">IPv6 Source Addresses</label>
                        <textarea
                            value={data.dnsServerIPv6SourceAddresses?.join('\n') || ''}
                            onChange={(e) => onChange('dnsServerIPv6SourceAddresses', e.target.value.split('\n').map(s => s.trim()))}
                            rows={2}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm transition-shadow"
                            placeholder="::"
                        />
                        <p className="text-xs text-slate-500">A comma separated list of IPv6 source addresses that the DNS server must use for making all outbound DNS requests when the server is connected to two or more networks. Network addresses are also accepted. By default, the IPv6 address of the network with a default route will be used as the source address. Note that this option will be used only when Prefer IPv6 option is enabled.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mt-7">
                            <input
                                type="checkbox"
                                checked={data.enableUdpSocketPool}
                                onChange={(e) => onChange('enableUdpSocketPool', e.target.checked)}
                                id="enableUdpSocketPool"
                                className="w-4 h-4 rounded border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-primary focus:ring-primary"
                            />
                            <label htmlFor="enableUdpSocketPool" className="text-sm font-semibold text-slate-700 dark:text-slate-300 select-none">Enable UDP Socket Pool</label>
                        </div>
                        <p className="text-xs text-slate-500 ml-6">Set this to true to enable UDP socket pool. The DNS Server will use UDP socket pool for all outbound DNS-over-UDP requests when enabled.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">Socket Pool Excluded Ports</label>
                        <input
                            type="text"
                            value={data.socketPoolExcludedPorts?.join(', ') || ''}
                            onChange={(e) => onChange('socketPoolExcludedPorts', e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)))}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            placeholder="80, 443"
                        />
                        <p className="text-xs text-slate-500">A comma separated list of port numbers that must be excluded from being used by the UDP socket pool.</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={data.preferIPv6}
                                onChange={(e) => onChange('preferIPv6', e.target.checked)}
                                id="preferIPv6"
                                className="w-4 h-4 rounded border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-primary focus:ring-primary"
                            />
                            <label htmlFor="preferIPv6" className="text-sm font-semibold text-slate-700 dark:text-slate-300 select-none">Prefer IPv6</label>
                        </div>
                        <p className="text-xs text-slate-500 ml-6">DNS Server will use IPv6 for querying whenever possible with this option enabled.</p>
                    </div>
                </div>
            </div>

            <div className="w-full h-px bg-gray-200 dark:bg-slate-800" />

            {/* Default SOA Parameters */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    Default Parameters
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Cluster</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">Default TTL</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={data.defaultRecordTtl}
                                onChange={(e) => onChange('defaultRecordTtl', parseInt(e.target.value))}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            />
                            <span className="absolute right-3 top-2.5 text-xs text-slate-500">sec</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">NS Record TTL</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={data.defaultNsRecordTtl}
                                onChange={(e) => onChange('defaultNsRecordTtl', parseInt(e.target.value))}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            />
                            <span className="absolute right-3 top-2.5 text-xs text-slate-500">sec</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">SOA Record TTL</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={data.defaultSoaRecordTtl}
                                onChange={(e) => onChange('defaultSoaRecordTtl', parseInt(e.target.value))}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            />
                            <span className="absolute right-3 top-2.5 text-xs text-slate-500">sec</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">Min Refresh Limit</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={data.minSoaRefresh}
                                onChange={(e) => onChange('minSoaRefresh', parseInt(e.target.value))}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            />
                            <span className="absolute right-3 top-2.5 text-xs text-slate-500">sec</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">Min Retry Limit</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={data.minSoaRetry}
                                onChange={(e) => onChange('minSoaRetry', parseInt(e.target.value))}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            />
                            <span className="absolute right-3 top-2.5 text-xs text-slate-500">sec</span>
                        </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">Responsible Person</label>
                        <input
                            type="text"
                            value={data.defaultResponsiblePerson}
                            onChange={(e) => onChange('defaultResponsiblePerson', e.target.value)}
                            placeholder="hostmaster"
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-shadow"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400 block mb-2">SOA Serial Scheme</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={data.useSoaSerialDateScheme}
                                onChange={(e) => onChange('useSoaSerialDateScheme', e.target.checked)}
                                id="useSoaSerialDateScheme"
                                className="w-4 h-4 rounded border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-amber-600 focus:ring-amber-500"
                            />
                            <label htmlFor="useSoaSerialDateScheme" className="text-sm font-semibold text-slate-700 dark:text-slate-300 select-none">Use Date Scheme (YYYYMMDDnn)</label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full h-px bg-gray-200 dark:bg-slate-800" />

            {/* Security */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Transfer & Update Security</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">Zone Transfer Allowed Networks</label>
                        <textarea
                            value={data.zoneTransferAllowedNetworks?.join('\n') || ''}
                            onChange={(e) => onChange('zoneTransferAllowedNetworks', e.target.value.split('\n').map(s => s.trim()))}
                            rows={3}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-sm transition-shadow"
                            placeholder="127.0.0.1"
                        />
                        <p className="text-xs text-slate-500">A comma separated list of IP addresses or network addresses that are allowed to perform zone transfer for all zones without any TSIG authentication.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">Notify Allowed Networks</label>
                        <textarea
                            value={data.notifyAllowedNetworks?.join('\n') || ''}
                            onChange={(e) => onChange('notifyAllowedNetworks', e.target.value.split('\n').map(s => s.trim()))}
                            rows={3}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-sm transition-shadow"
                            placeholder="127.0.0.1"
                        />
                        <p className="text-xs text-slate-500">A comma separated list of IP addresses or network addresses that are allowed to Notify all secondary zones.</p>
                    </div>
                </div>
            </div>

            <div className="w-full h-px bg-gray-200 dark:bg-slate-800" />

            {/* DNSSEC */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    DNSSEC & EDNS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
                            <input
                                type="checkbox"
                                checked={data.dnssecValidation}
                                onChange={(e) => onChange('dnssecValidation', e.target.checked)}
                                id="dnssecValidation"
                                className="mt-1 w-4 h-4 rounded border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-amber-600 focus:ring-amber-500"
                            />
                            <div>
                                <label htmlFor="dnssecValidation" className="text-sm font-bold text-slate-700 dark:text-slate-200 block select-none">DNSSEC Validation</label>
                                <p className="text-xs text-slate-500 mt-1">Set this to true to enable DNSSEC validation. DNS Server will validate all responses from name servers or forwarders when this option is enabled.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
                            <input
                                type="checkbox"
                                defaultChecked={data.eDnsClientSubnet}
                                id="eDnsClientSubnet"
                                className="mt-1 w-4 h-4 rounded border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-amber-600 focus:ring-amber-500"
                            />
                            <div>
                                <label htmlFor="eDnsClientSubnet" className="text-sm font-bold text-slate-700 dark:text-slate-200 block select-none">EDNS Client Subnet (ECS)</label>
                                <p className="text-xs text-slate-500 mt-1">Set this to true to enable EDNS Client Subnet. DNS Server will use the public IP address of the request with a prefix length, or the existing Client Subnet option from the request while resolving requests.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* EDNS Advanced */}
            {data.eDnsClientSubnet && (
                <div className="animate-in fade-in slide-in-from-top-4 mt-6 p-6 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">EDNS Client Subnet Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-400">IPv4 Prefix Length</label>
                            <input
                                type="number"
                                value={data.eDnsClientSubnetIPv4PrefixLength}
                                onChange={(e) => onChange('eDnsClientSubnetIPv4PrefixLength', parseInt(e.target.value))}
                                className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            />
                            <p className="text-xs text-slate-500">The EDNS Client Subnet IPv4 prefix length to define the client subnet.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-400">IPv6 Prefix Length</label>
                            <input
                                type="number"
                                value={data.eDnsClientSubnetIPv6PrefixLength}
                                onChange={(e) => onChange('eDnsClientSubnetIPv6PrefixLength', parseInt(e.target.value))}
                                className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            />
                            <p className="text-xs text-slate-500">The EDNS Client Subnet IPv6 prefix length to define the client subnet.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-400">IPv4 Override</label>
                            <input
                                type="text"
                                value={data.eDnsClientSubnetIpv4Override || ''}
                                onChange={(e) => onChange('eDnsClientSubnetIpv4Override', e.target.value)}
                                placeholder="Optional"
                                className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            />
                            <p className="text-xs text-slate-500">The IPv4 network address that must be used as ECS for all outbound requests overriding client's actual subnet.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-400">IPv6 Override</label>
                            <input
                                type="text"
                                value={data.eDnsClientSubnetIpv6Override || ''}
                                onChange={(e) => onChange('eDnsClientSubnetIpv6Override', e.target.value)}
                                placeholder="Optional"
                                className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            />
                            <p className="text-xs text-slate-500">The IPv6 network address that must be used as ECS for all outbound requests overriding client's actual subnet.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-400">Scope Zero</label>
                            <div className="flex items-center gap-2 mt-2">
                                <input
                                    type="checkbox"
                                    checked={data.eDnsClientSubnetScopeZero}
                                    onChange={(e) => onChange('eDnsClientSubnetScopeZero', e.target.checked)}
                                    id="eDnsClientSubnetScopeZero"
                                    className="w-4 h-4 rounded border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-primary"
                                />
                                <label htmlFor="eDnsClientSubnetScopeZero" className="text-sm font-semibold text-slate-700 dark:text-slate-300 select-none">Enable Scope Zero</label>
                            </div>
                            <p className="text-xs text-slate-500">Indicate that the response is not valid for other subnets.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-400">Cache Limit</label>
                            <input
                                type="number"
                                value={data.eDnsClientSubnetCacheLimit}
                                onChange={(e) => onChange('eDnsClientSubnetCacheLimit', parseInt(e.target.value))}
                                className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            />
                            <p className="text-xs text-slate-500">Max ECS cache entries.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full h-px bg-gray-200 dark:bg-slate-800" />

            {/* Rate Limiting (QPM) */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    Rate Limiting (QPM)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">IPv4 Limits (JSON)</label>
                        <textarea
                            value={JSON.stringify(data.qpmPrefixLimitsIPv4, null, 2)}
                            onChange={(e) => {
                                try {
                                    onChange('qpmPrefixLimitsIPv4', JSON.parse(e.target.value));
                                } catch { }
                            }}
                            rows={5}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs transition-shadow"
                        />
                        <p className="text-xs text-slate-500">Muti-row list of prefix, udpLimit and tcpLimit.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">IPv6 Limits (JSON)</label>
                        <textarea
                            value={JSON.stringify(data.qpmPrefixLimitsIPv6, null, 2)}
                            onChange={(e) => {
                                try {
                                    onChange('qpmPrefixLimitsIPv6', JSON.parse(e.target.value));
                                } catch { }
                            }}
                            rows={5}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs transition-shadow"
                        />
                        <p className="text-xs text-slate-500">Muti-row list of prefix, udpLimit and tcpLimit.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">Sample Minutes</label>
                        <input
                            type="number"
                            value={data.qpmLimitSampleMinutes}
                            onChange={(e) => onChange('qpmLimitSampleMinutes', parseInt(e.target.value))}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                        />
                        <p className="text-xs text-slate-500">Sample size in minutes.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">UDP Truncation %</label>
                        <input
                            type="number"
                            value={data.qpmLimitUdpTruncationPercentage}
                            onChange={(e) => onChange('qpmLimitUdpTruncationPercentage', parseInt(e.target.value))}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                        />
                        <p className="text-xs text-slate-500">% of requests truncated when limit exceeded.</p>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">Bypass List</label>
                        <textarea
                            value={data.qpmLimitBypassList?.join('\n') || ''}
                            onChange={(e) => onChange('qpmLimitBypassList', e.target.value.split('\n').map(s => s.trim()))}
                            rows={2}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm transition-shadow"
                            placeholder="127.0.0.1"
                        />
                        <p className="text-xs text-slate-500">IPs allowed to bypass QPM limit.</p>
                    </div>
                </div>
            </div>

            <div className="w-full h-px bg-gray-200 dark:bg-slate-800" />

            {/* Advanced Performance */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    Advanced Performance
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Tuning</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">UDP Payload Size</label>
                        <input
                            type="number"
                            value={data.udpPayloadSize}
                            onChange={(e) => onChange('udpPayloadSize', parseInt(e.target.value))}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                        />
                        <p className="text-xs text-slate-500">Max UDP payload size (default 4096).</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">UDP Receive Timeout</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={data.udpReceiveTimeout}
                                onChange={(e) => onChange('udpReceiveTimeout', parseInt(e.target.value))}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            />
                            <span className="absolute right-3 top-2.5 text-xs text-slate-500">ms</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">UDP Send Timeout</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={data.udpSendTimeout}
                                onChange={(e) => onChange('udpSendTimeout', parseInt(e.target.value))}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            />
                            <span className="absolute right-3 top-2.5 text-xs text-slate-500">ms</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">TCP Receive Timeout</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={data.tcpReceiveTimeout}
                                onChange={(e) => onChange('tcpReceiveTimeout', parseInt(e.target.value))}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            />
                            <span className="absolute right-3 top-2.5 text-xs text-slate-500">ms</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">TCP Send Timeout</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={data.tcpSendTimeout}
                                onChange={(e) => onChange('tcpSendTimeout', parseInt(e.target.value))}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            />
                            <span className="absolute right-3 top-2.5 text-xs text-slate-500">ms</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">QUIC Idle Timeout</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={data.quicIdleTimeout}
                                onChange={(e) => onChange('quicIdleTimeout', parseInt(e.target.value))}
                                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                            />
                            <span className="absolute right-3 top-2.5 text-xs text-slate-500">ms</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">QUIC Max Streams</label>
                        <input
                            type="number"
                            value={data.quicMaxInboundStreams}
                            onChange={(e) => onChange('quicMaxInboundStreams', parseInt(e.target.value))}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                        />
                        <p className="text-xs text-slate-500">Max inbound QUIC streams.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">Listen Backlog</label>
                        <input
                            type="number"
                            value={data.listenBacklog}
                            onChange={(e) => onChange('listenBacklog', parseInt(e.target.value))}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                        />
                        <p className="text-xs text-slate-500">Socket listen backlog size.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-400">Max Resolutions/Core</label>
                        <input
                            type="number"
                            value={data.maxConcurrentResolutionsPerCore}
                            onChange={(e) => onChange('maxConcurrentResolutionsPerCore', parseInt(e.target.value))}
                            className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                        />
                        <p className="text-xs text-slate-500">Max concurrent resolutions per CPU core.</p>
                    </div>
                </div>
            </div>

            <div className="w-full h-px bg-gray-200 dark:bg-slate-800" />

            {/* Updates */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    System Updates
                </h3>
                <div className="flex items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50">
                    <input
                        type="checkbox"
                        checked={data.dnsAppsEnableAutomaticUpdate}
                        onChange={(e) => onChange('dnsAppsEnableAutomaticUpdate', e.target.checked)}
                        id="dnsAppsEnableAutomaticUpdate"
                        className="w-5 h-5 rounded border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-primary"
                    />
                    <div>
                        <label htmlFor="dnsAppsEnableAutomaticUpdate" className="text-sm font-bold text-slate-700 dark:text-slate-200 select-none">Enable Automatic App Updates</label>
                        <p className="text-xs text-slate-500 mt-1">Automatically update DNS Apps from the App Store every 24 hours.</p>
                    </div>
                </div>
            </div>

        </div>
    );
};
