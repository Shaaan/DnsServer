export interface LogFile {
    fileName: string;
    size: string;
}

export interface LogsListResponse {
    logFiles: LogFile[];
}

export interface QueryLogEntry {
    rowNumber: number;
    timestamp: string;
    clientIpAddress: string;
    protocol: string;
    responseType: string;
    responseRtt?: number;
    rcode: string;
    qname: string;
    qtype: string;
    qclass: string;
    answer: string;
}

export interface QueryLogsResponse {
    entries: QueryLogEntry[];
    totalEntries: number;
    pageNumber: number;
    totalPages: number;
}

export interface QueryLogsRequest {
    name: string;
    classPath: string;
    pageNumber: number;
    entriesPerPage: number;
    descendingOrder: boolean;
    start?: string;
    end?: string;
    clientIpAddress?: string;
    protocol?: string;
    responseType?: string;
    rcode?: string;
    qname?: string;
    qtype?: string;
    qclass?: string;
    node?: string;
}
