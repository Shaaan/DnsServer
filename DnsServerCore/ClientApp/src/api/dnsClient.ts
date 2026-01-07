export interface DnsClientResolveRequest {
    server: string;
    domain: string;
    type: string;
    protocol: 'UDP' | 'TCP' | 'TLS' | 'HTTPS' | 'QUIC';
    dnssec?: boolean;
    eDnsClientSubnet?: string;
    import?: boolean;
}

export interface DnsClientResolveResponse {
    result: any; // The formatted result struct
    rawResponses?: any[]; // Raw DNS packets/responses
    warningMessage?: string;
}
