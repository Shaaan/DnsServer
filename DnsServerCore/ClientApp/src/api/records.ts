export interface DnsRecord {
    type: string;
    domain: string;
    ttl: number;
    rData: any; // Using any for now as specific RData varies widely
    disabled: boolean;
    expiry?: string;
    timeToLive: string; // Formatted TTL
    displayRData: string; // The text representation
    comments?: string;
    modifiedOn?: string;
}

export interface ZoneDetails {
    name: string;
    type: string;
    internal: boolean;
    dnssecStatus: string;
    disabled: boolean;
    isExpired: boolean;
    validationFailed: boolean;
    syncFailed: boolean;
    notifyFailed: boolean;
    expiry?: string;
    catalog?: string;
    nameIdn?: string;
    hasDnssecPrivateKeys: boolean;
}

export interface ZoneRecordsResponse {
    zone: ZoneDetails;
    records: DnsRecord[];
    totalRecords: number;
    pageNumber: number;
    totalPages: number;
}

export type RecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'PTR' | 'SRV';

export interface AddRecordRequest {
    zone: string;
    domain: string; // The record name (e.g. 'www' or '@')
    type: RecordType;
    ttl: number;
    comments?: string;
    overwrite?: boolean;

    // Type specific
    ipAddress?: string; // A, AAAA
    cname?: string; // CNAME
    nameServer?: string; // NS
    preference?: number; // MX
    exchange?: string; // MX
    text?: string; // TXT
    ptrName?: string; // PTR
    priority?: number; // SRV
    weight?: number; // SRV
    port?: number; // SRV
    target?: string; // SRV
}
