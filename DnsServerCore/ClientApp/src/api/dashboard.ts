export interface DashboardStats {
    totalQueries: number;
    totalNoError: number;
    totalServerFailure: number;
    totalNxDomain: number;
    totalRefused: number;
    totalAuthoritative: number;
    totalRecursive: number;
    totalCached: number;
    totalBlocked: number;
    totalDropped: number;
    totalClients: number;
    zones: number;
    cachedEntries: number;
    allowedZones: number;
    blockedZones: number;
    allowListZones: number;
    blockListZones: number;
}

export interface ChartDataset {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
}

export interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

export interface TopClient {
    name: string;
    domain: string;
    hits: number;
    rateLimited: boolean;
}

export interface TopDomain {
    name: string;
    nameIdn?: string;
    hits: number;
}

export interface DashboardResponse {
    stats: DashboardStats;
    mainChartData: ChartData;
    queryResponseChartData: ChartData;
    queryTypeChartData: ChartData;
    protocolTypeChartData: ChartData;
    topClients: TopClient[];
    topDomains: TopDomain[];
    topBlockedDomains: TopDomain[];
}
