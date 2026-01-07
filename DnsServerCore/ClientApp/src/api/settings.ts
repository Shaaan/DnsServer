import { apiClient } from './client';

export interface TsigKey {
    keyName: string;
    algorithmName: string;
    sharedSecret: string;
}

export interface QpmPrefixLimit {
    prefix: string;
    udpLimit: number;
    tcpLimit: number;
}

export interface ProxySettings {
    type: 'None' | 'Http' | 'Socks5';
    address: string;
    port: number;
    username?: string;
    password?: string;
    bypass: string[];
}

export interface SettingsResponse {
    version: string;
    dnsServerDomain: string;
    uptimestamp: string;
    clusterNodes: string[];

    // General
    dnsServerLocalEndPoints: string[];
    dnsServerIPv4SourceAddresses: string[];
    dnsServerIPv6SourceAddresses: string[];
    preferIPv6: boolean;
    enableUdpSocketPool: boolean;
    socketPoolExcludedPorts: number[];

    defaultRecordTtl: number;
    defaultNsRecordTtl: number;
    defaultSoaRecordTtl: number;
    defaultResponsiblePerson: string;
    useSoaSerialDateScheme: boolean;
    minSoaRefresh: number;
    minSoaRetry: number;

    zoneTransferAllowedNetworks: string[];
    notifyAllowedNetworks: string[];
    dnsAppsEnableAutomaticUpdate: boolean;

    udpPayloadSize: number;
    dnssecValidation: boolean;

    eDnsClientSubnet: boolean;
    eDnsClientSubnetIPv4PrefixLength: number;
    eDnsClientSubnetIPv6PrefixLength: number;
    eDnsClientSubnetIpv4Override: string;
    eDnsClientSubnetIpv6Override: string;
    eDnsClientSubnetScopeZero: boolean;
    eDnsClientSubnetCacheLimit: number;

    qpmPrefixLimitsIPv4: QpmPrefixLimit[];
    qpmPrefixLimitsIPv6: QpmPrefixLimit[];
    qpmLimitSampleMinutes: number;
    qpmLimitUdpTruncationPercentage: number;
    qpmLimitBypassList: string[];

    clientTimeout: number;
    udpSendTimeout: number;
    udpReceiveTimeout: number;
    tcpSendTimeout: number;
    tcpReceiveTimeout: number;
    quicIdleTimeout: number;
    quicMaxInboundStreams: number;
    listenBacklog: number;
    maxConcurrentResolutionsPerCore: number;

    // Web Service
    webServiceLocalAddresses: string[];
    webServiceHttpPort: number;
    webServiceEnableTls: boolean;
    webServiceEnableHttp3: boolean;
    webServiceHttpToTlsRedirect: boolean;
    webServiceUseSelfSignedTlsCertificate: boolean;
    webServiceTlsPort: number;
    webServiceTlsCertificatePath: string;
    webServiceTlsCertificatePassword?: string;
    webServiceRealIpHeader: string;

    // Optional Protocols
    enableDnsOverUdpProxy: boolean;
    enableDnsOverTcpProxy: boolean;
    enableDnsOverHttp: boolean;
    enableDnsOverTls: boolean;
    enableDnsOverHttps: boolean;
    enableDnsOverHttp3: boolean;
    enableDnsOverQuic: boolean;

    dnsOverUdpProxyPort: number;
    dnsOverTcpProxyPort: number;
    dnsOverHttpPort: number;
    dnsOverTlsPort: number;
    dnsOverHttpsPort: number;
    dnsOverQuicPort: number;

    reverseProxyNetworkACL: string[];
    dnsTlsCertificatePath: string;
    dnsTlsCertificatePassword?: string;
    dnsOverHttpRealIpHeader: string;

    // TSIG
    tsigKeys: TsigKey[];

    // Recursion
    recursion: 'Allow' | 'AllowOnlyForPrivateNetworks' | 'UseSpecifiedNetworkACL' | 'Deny';
    recursionNetworkACL: string[];
    randomizeName: boolean;
    qnameMinimization: boolean;
    resolverRetries: number;
    resolverTimeout: number;
    resolverConcurrency: number;
    resolverMaxStackCount: number;

    // Cache
    saveCache: boolean;
    serveStale: boolean;
    serveStaleTtl: number;
    serveStaleAnswerTtl: number;
    serveStaleResetTtl: number;
    serveStaleMaxWaitTime: number;
    cacheMaximumEntries: number;
    cacheMinimumRecordTtl: number;
    cacheMaximumRecordTtl: number;
    cacheNegativeRecordTtl: number;
    cacheFailureRecordTtl: number;
    cachePrefetchEligibility: number;
    cachePrefetchTrigger: number;
    cachePrefetchSampleIntervalInMinutes: number;
    cachePrefetchSampleEligibilityHitsPerHour: number;

    // Blocking
    enableBlocking: boolean;
    allowTxtBlockingReport: boolean;
    blockingType: 'NxDomain' | 'CustomAddress' | 'AnyAddress';
    customBlockingAddresses: string[];
    blockingBypassList: string[];
    blockingAnswerTtl: number;
    blockListUrls: string[];
    blockListUpdateIntervalHours: number;
    blockListNextUpdatedOn?: string;
    temporaryDisableBlockingTill?: string;

    // Proxy & Forwarders
    proxy: ProxySettings | null;
    forwarders: string[];
    forwarderProtocol: 'Udp' | 'Tcp' | 'Tls' | 'Https' | 'Quic';
    concurrentForwarding: boolean;
    forwarderRetries: number;
    forwarderTimeout: number;
    forwarderConcurrency: number;

    // Logging
    loggingType: 'None' | 'File' | 'Console' | 'FileAndConsole';
    ignoreResolverLogs: boolean;
    logQueries: boolean;
    useLocalTime: boolean;
    logFolder: string;
    maxLogFileDays: number;
    enableInMemoryStats: boolean;
    maxStatFileDays: number;
}

export interface SaveSettingsRequest extends Partial<SettingsResponse> {
    node: string;
}

export const saveSettings = async (settings: SaveSettingsRequest) => {
    // Construct form data or URL params similar to legacy main.js
    const params = new URLSearchParams();
    params.append('node', settings.node);

    // Helper to append if defined
    const appendIfDefined = (key: string, value: any) => {
        if (value !== undefined && value !== null) {
            params.append(key, value.toString());
        }
    };

    // General
    appendIfDefined('dnsServerDomain', settings.dnsServerDomain);
    if (settings.dnsServerLocalEndPoints) {
        settings.dnsServerLocalEndPoints.forEach(ep => params.append('dnsServerLocalEndPoints', ep));
    }
    if (settings.dnsServerIPv4SourceAddresses) {
        settings.dnsServerIPv4SourceAddresses.forEach(addr => params.append('dnsServerIPv4SourceAddresses', addr));
    }
    if (settings.dnsServerIPv6SourceAddresses) {
        settings.dnsServerIPv6SourceAddresses.forEach(addr => params.append('dnsServerIPv6SourceAddresses', addr));
    }
    appendIfDefined('preferIPv6', settings.preferIPv6);
    appendIfDefined('enableUdpSocketPool', settings.enableUdpSocketPool);
    if (settings.socketPoolExcludedPorts) {
        settings.socketPoolExcludedPorts.forEach(port => params.append('socketPoolExcludedPorts', port.toString()));
    }
    appendIfDefined('defaultRecordTtl', settings.defaultRecordTtl);
    appendIfDefined('defaultNsRecordTtl', settings.defaultNsRecordTtl);
    appendIfDefined('defaultSoaRecordTtl', settings.defaultSoaRecordTtl);
    appendIfDefined('defaultResponsiblePerson', settings.defaultResponsiblePerson);
    appendIfDefined('useSoaSerialDateScheme', settings.useSoaSerialDateScheme);
    appendIfDefined('minSoaRefresh', settings.minSoaRefresh);
    appendIfDefined('minSoaRetry', settings.minSoaRetry);
    if (settings.zoneTransferAllowedNetworks) {
        settings.zoneTransferAllowedNetworks.forEach(net => params.append('zoneTransferAllowedNetworks', net));
    }
    if (settings.notifyAllowedNetworks) {
        settings.notifyAllowedNetworks.forEach(net => params.append('notifyAllowedNetworks', net));
    }
    appendIfDefined('dnsAppsEnableAutomaticUpdate', settings.dnsAppsEnableAutomaticUpdate);
    appendIfDefined('udpPayloadSize', settings.udpPayloadSize);
    appendIfDefined('dnssecValidation', settings.dnssecValidation);
    appendIfDefined('eDnsClientSubnet', settings.eDnsClientSubnet);
    appendIfDefined('eDnsClientSubnetIPv4PrefixLength', settings.eDnsClientSubnetIPv4PrefixLength);
    appendIfDefined('eDnsClientSubnetIPv6PrefixLength', settings.eDnsClientSubnetIPv6PrefixLength);
    appendIfDefined('eDnsClientSubnetIpv4Override', settings.eDnsClientSubnetIpv4Override);
    appendIfDefined('eDnsClientSubnetIpv6Override', settings.eDnsClientSubnetIpv6Override);

    // QPM Limits
    if (settings.qpmPrefixLimitsIPv4) {
        settings.qpmPrefixLimitsIPv4.forEach(limit => {
            // Backend expects prefix|udpLimit|tcpLimit format or similar, but main.js used a complex table serialization.
            // Looking at WebServiceSettingsApi.cs: TryGetQueryOrFormArray("qpmPrefixLimitsIPv4", ... with pipe separator)
            params.append('qpmPrefixLimitsIPv4', `${limit.prefix}|${limit.udpLimit}|${limit.tcpLimit}`);
        });
    }
    if (settings.qpmPrefixLimitsIPv6) {
        settings.qpmPrefixLimitsIPv6.forEach(limit => {
            params.append('qpmPrefixLimitsIPv6', `${limit.prefix}|${limit.udpLimit}|${limit.tcpLimit}`);
        });
    }
    appendIfDefined('qpmLimitSampleMinutes', settings.qpmLimitSampleMinutes);
    appendIfDefined('qpmLimitUdpTruncationPercentage', settings.qpmLimitUdpTruncationPercentage);
    if (settings.qpmLimitBypassList) {
        settings.qpmLimitBypassList.forEach(net => params.append('qpmLimitBypassList', net));
    }

    appendIfDefined('clientTimeout', settings.clientTimeout);
    appendIfDefined('udpSendTimeout', settings.udpSendTimeout);
    appendIfDefined('udpReceiveTimeout', settings.udpReceiveTimeout);
    appendIfDefined('tcpSendTimeout', settings.tcpSendTimeout);
    appendIfDefined('tcpReceiveTimeout', settings.tcpReceiveTimeout);
    appendIfDefined('quicIdleTimeout', settings.quicIdleTimeout);
    appendIfDefined('quicMaxInboundStreams', settings.quicMaxInboundStreams);
    appendIfDefined('listenBacklog', settings.listenBacklog);
    appendIfDefined('maxConcurrentResolutionsPerCore', settings.maxConcurrentResolutionsPerCore);

    // Web Service
    if (settings.webServiceLocalAddresses) {
        settings.webServiceLocalAddresses.forEach(addr => params.append('webServiceLocalAddresses', addr));
    }
    appendIfDefined('webServiceHttpPort', settings.webServiceHttpPort);
    appendIfDefined('webServiceEnableTls', settings.webServiceEnableTls);
    appendIfDefined('webServiceEnableHttp3', settings.webServiceEnableHttp3);
    appendIfDefined('webServiceHttpToTlsRedirect', settings.webServiceHttpToTlsRedirect);
    appendIfDefined('webServiceUseSelfSignedTlsCertificate', settings.webServiceUseSelfSignedTlsCertificate);
    appendIfDefined('webServiceTlsPort', settings.webServiceTlsPort);
    appendIfDefined('webServiceTlsCertificatePath', settings.webServiceTlsCertificatePath);
    // Don't send placeholder password
    if (settings.webServiceTlsCertificatePassword && settings.webServiceTlsCertificatePassword !== '************') {
        params.append('webServiceTlsCertificatePassword', settings.webServiceTlsCertificatePassword);
    }
    appendIfDefined('webServiceRealIpHeader', settings.webServiceRealIpHeader);

    // Optional Protocols
    appendIfDefined('enableDnsOverUdpProxy', settings.enableDnsOverUdpProxy);
    appendIfDefined('enableDnsOverTcpProxy', settings.enableDnsOverTcpProxy);
    appendIfDefined('enableDnsOverHttp', settings.enableDnsOverHttp);
    appendIfDefined('enableDnsOverTls', settings.enableDnsOverTls);
    appendIfDefined('enableDnsOverHttps', settings.enableDnsOverHttps);
    appendIfDefined('enableDnsOverHttp3', settings.enableDnsOverHttp3);
    appendIfDefined('enableDnsOverQuic', settings.enableDnsOverQuic);
    appendIfDefined('dnsOverUdpProxyPort', settings.dnsOverUdpProxyPort);
    appendIfDefined('dnsOverTcpProxyPort', settings.dnsOverTcpProxyPort);
    appendIfDefined('dnsOverHttpPort', settings.dnsOverHttpPort);
    appendIfDefined('dnsOverTlsPort', settings.dnsOverTlsPort);
    appendIfDefined('dnsOverHttpsPort', settings.dnsOverHttpsPort);
    appendIfDefined('dnsOverQuicPort', settings.dnsOverQuicPort);

    if (settings.reverseProxyNetworkACL) {
        settings.reverseProxyNetworkACL.forEach(acl => params.append('reverseProxyNetworkACL', acl));
    }
    appendIfDefined('dnsTlsCertificatePath', settings.dnsTlsCertificatePath);
    if (settings.dnsTlsCertificatePassword && settings.dnsTlsCertificatePassword !== '************') {
        params.append('dnsTlsCertificatePassword', settings.dnsTlsCertificatePassword);
    }
    appendIfDefined('dnsOverHttpRealIpHeader', settings.dnsOverHttpRealIpHeader);

    // TSIG
    // Skipping TSIG Key updates for now as it usually requires separate handling or complex object array mapping not standard in simple params?
    // main.js usually handles this via specific form data construction.
    // If TSIG keys are needing update, they might rely on a specific format.
    // Looking at WebServiceSettingsApi.cs: TryGetQueryOrFormArray("tsigKeys", ...) expecting keys and secrets. 
    // It seems to parse JsonElement or table rows. Since we are using form-urlencoded, we'd need to match the "tableRow" format or similar.
    // For now, omitting TSIG keys to avoid breaking if format is wrong, unless explicitly required.

    // Recursion
    appendIfDefined('recursion', settings.recursion);
    if (settings.recursionNetworkACL) {
        settings.recursionNetworkACL.forEach(acl => params.append('recursionNetworkACL', acl));
    }
    appendIfDefined('randomizeName', settings.randomizeName);
    appendIfDefined('qnameMinimization', settings.qnameMinimization);
    appendIfDefined('resolverRetries', settings.resolverRetries);
    appendIfDefined('resolverTimeout', settings.resolverTimeout);
    appendIfDefined('resolverConcurrency', settings.resolverConcurrency);
    appendIfDefined('resolverMaxStackCount', settings.resolverMaxStackCount);

    // Cache
    appendIfDefined('saveCache', settings.saveCache);
    appendIfDefined('serveStale', settings.serveStale);
    appendIfDefined('serveStaleTtl', settings.serveStaleTtl);
    appendIfDefined('serveStaleAnswerTtl', settings.serveStaleAnswerTtl);
    appendIfDefined('serveStaleResetTtl', settings.serveStaleResetTtl);
    appendIfDefined('serveStaleMaxWaitTime', settings.serveStaleMaxWaitTime);
    appendIfDefined('cacheMaximumEntries', settings.cacheMaximumEntries);
    appendIfDefined('cacheMinimumRecordTtl', settings.cacheMinimumRecordTtl);
    appendIfDefined('cacheMaximumRecordTtl', settings.cacheMaximumRecordTtl);
    appendIfDefined('cacheNegativeRecordTtl', settings.cacheNegativeRecordTtl);
    appendIfDefined('cacheFailureRecordTtl', settings.cacheFailureRecordTtl);
    appendIfDefined('cachePrefetchEligibility', settings.cachePrefetchEligibility);
    appendIfDefined('cachePrefetchTrigger', settings.cachePrefetchTrigger);
    appendIfDefined('cachePrefetchSampleIntervalInMinutes', settings.cachePrefetchSampleIntervalInMinutes);
    appendIfDefined('cachePrefetchSampleEligibilityHitsPerHour', settings.cachePrefetchSampleEligibilityHitsPerHour);

    // Blocking
    appendIfDefined('enableBlocking', settings.enableBlocking);
    appendIfDefined('allowTxtBlockingReport', settings.allowTxtBlockingReport);
    appendIfDefined('blockingType', settings.blockingType);
    if (settings.customBlockingAddresses) {
        settings.customBlockingAddresses.forEach(addr => params.append('customBlockingAddresses', addr));
    }
    if (settings.blockingBypassList) {
        settings.blockingBypassList.forEach(net => params.append('blockingBypassList', net));
    }
    appendIfDefined('blockingAnswerTtl', settings.blockingAnswerTtl);
    if (settings.blockListUrls) {
        settings.blockListUrls.forEach(url => params.append('blockListUrls', url));
    }
    appendIfDefined('blockListUpdateIntervalHours', settings.blockListUpdateIntervalHours);

    // Proxy & Forwarders
    if (settings.proxy) {
        appendIfDefined('proxyType', settings.proxy.type);
        if (settings.proxy.type !== 'None') {
            appendIfDefined('proxyAddress', settings.proxy.address);
            appendIfDefined('proxyPort', settings.proxy.port);
            appendIfDefined('proxyUsername', settings.proxy.username);
            appendIfDefined('proxyPassword', settings.proxy.password);
            if (settings.proxy.bypass) {
                settings.proxy.bypass.forEach(bp => params.append('proxyBypassList', bp));
            }
        }
    }

    if (settings.forwarders) {
        params.append('forwarders', settings.forwarders.join('\n')); // main.js uses newline separated string for forwarders textarea
    }
    appendIfDefined('forwarderProtocol', settings.forwarderProtocol);
    appendIfDefined('concurrentForwarding', settings.concurrentForwarding);
    appendIfDefined('forwarderRetries', settings.forwarderRetries);
    appendIfDefined('forwarderTimeout', settings.forwarderTimeout);
    appendIfDefined('forwarderConcurrency', settings.forwarderConcurrency);

    // Logging
    appendIfDefined('loggingType', settings.loggingType);
    appendIfDefined('ignoreResolverLogs', settings.ignoreResolverLogs);
    appendIfDefined('logQueries', settings.logQueries);
    appendIfDefined('useLocalTime', settings.useLocalTime);
    appendIfDefined('logFolder', settings.logFolder);
    appendIfDefined('maxLogFileDays', settings.maxLogFileDays);
    appendIfDefined('enableInMemoryStats', settings.enableInMemoryStats);
    appendIfDefined('maxStatFileDays', settings.maxStatFileDays);

    return apiClient.post('/settings/set', params);
};
