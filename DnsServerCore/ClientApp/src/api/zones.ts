export interface Zone {
    name: string;
    type: 'Primary' | 'Secondary' | 'Stub' | 'Forwarder' | 'SecondaryForwarder' | 'Catalog' | 'SecondaryCatalog';
    internal: boolean;
    soaSerial?: number;
    dnssecStatus: string;
    disabled: boolean;
    isExpired: boolean;
    validationFailed: boolean;
    syncFailed: boolean;
    notifyFailed: boolean;
    expiry?: string;
    lastModified?: string;
    catalog?: string;
    nameIdn?: string;
    hasDnssecPrivateKeys: boolean;
}

export interface ZonesListResponse {
    zones: Zone[];
    pageNumber: number;
    totalPages: number;
    totalZones: number;
}
export interface CreateZoneRequest {
    zone: string;
    type: 'Primary' | 'Secondary' | 'Stub' | 'Forwarder' | 'SecondaryForwarder' | 'Catalog' | 'SecondaryCatalog';
    node?: string;

    // Primary
    catalog?: string; // Also for Secondary, Stub, Forwarder
    useSoaSerialDateScheme?: boolean;

    // Secondary / Stub
    primaryNameServerAddresses?: string; // Comma separated IPs
    zoneTransferProtocol?: 'Tcp' | 'Udp'; // Default Tcp
    tsigKeyName?: string;
    validateZone?: boolean;

    // Forwarder
    initializeForwarder?: boolean;
    protocol?: 'Udp' | 'Tcp' | 'Tls' | 'Https' | 'Quic';
    forwarder?: string; // IP or Hostname
    dnssecValidation?: boolean;
    proxyType?: 'None' | 'DefaultProxy' | 'Socks5' | 'Http';
    proxyAddress?: string;
    proxyPort?: number;
    proxyUsername?: string;
    proxyPassword?: string;
}

export interface ZonePermissionsResponse {
    users: string[];
    groups: string[];
    userPermissions: string[];
    groupPermissions: string[];
}

export interface SignZoneRequest {
    zone: string;
    algorithm: string;
    result: any; // Using any for now as response structure isn't fully known, but likely standard Api response
}

export interface KeyInfo {
    keyTag: number;
    algorithm: string;
    flags: number;
    publicKey: string;
    privateKey?: string;
}

export interface ViewDsResponse {
    dsRecords: string[];
}
