export interface DhcpScope {
    name: string;
    startingAddress: string;
    endingAddress: string;
    subnetMask: string;
    networkAddress?: string;
    broadcastAddress?: string;
    interfaceAddress?: string;
    enabled: boolean;
    // Details
    leaseTimeDays?: number;
    leaseTimeHours?: number;
    leaseTimeMinutes?: number;
    offerDelayTime?: number;
    pingCheckEnabled?: boolean;
    pingCheckTimeout?: number;
    pingCheckRetries?: number;
    domainName?: string;
    domainSearchList?: string[];
    dnsUpdates?: boolean;
    dnsOverwriteForDynamicLease?: boolean;
    dnsTtl?: number;
    routerAddress?: string;
    useThisDnsServer?: boolean;
    dnsServers?: string[];
    winsServers?: string[];
    ntpServers?: string[];
    bootServerAddress?: string;
    bootFileName?: string;
    webProxyAutoDiscoveryUrl?: string;
    mtu?: number;
    staticRoutes?: string[];
}

export interface DhcpLease {
    scope: string;
    hardwareAddress: string;
    address: string;
    type: 'Dynamic' | 'Reserved';
    hostName: string;
    clientIdentifier: string;
    leaseObtained: string;
    leaseExpires: string;
}

export interface DhcpScopesResponse {
    scopes: DhcpScope[];
}

export interface DhcpLeasesResponse {
    leases: DhcpLease[];
}

export interface DhcpScopeDetails extends DhcpScope {
    // Extended properties for editing
    dnsServers?: string[];
    winsServers?: string[];
    ntpServers?: string[];
    // ... complete as we implement the edit form
}
