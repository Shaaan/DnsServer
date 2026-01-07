import type { DnsRecord } from './records';

export interface CacheListResponse {
    domain: string;
    domainIdn?: string;
    zones: string[];
    records: DnsRecord[];
}

export interface CacheFlushRequest {
    node?: string;
}

export interface CacheDeleteRequest {
    domain: string;
    node?: string;
}
