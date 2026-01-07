export interface BlockedAllowedListResponse {
    domain: string;
    domainIdn?: string;
    zones: string[];
    records: any[]; // The records at this level
    totalRecords: number;
    pageNumber: number;
    totalPages: number;
}
