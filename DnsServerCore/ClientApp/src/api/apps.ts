export interface DnsAppDetail {
    classPath: string;
    description: string;
    isAppRecordRequestHandler: boolean;
    isRequestController: boolean;
    isAuthoritativeRequestHandler: boolean;
    isRequestBlockingHandler: boolean;
    isQueryLogger: boolean;
    isQueryLogs: boolean;
    isPostProcessor: boolean;
    recordDataTemplate?: string;
}

export interface App {
    name: string;
    version: string;
    description: string;
    updateVersion: string;
    updateUrl: string;
    updateAvailable: boolean;
    dnsApps: DnsAppDetail[];
}

export interface StoreApp {
    name: string;
    version: string;
    description: string;
    url: string;
    size: string;
    installed: boolean;
    installedVersion?: string;
    updateAvailable: boolean;
}

export interface AppsListResponse {
    apps: App[];
}

export interface StoreAppsListResponse {
    storeApps: StoreApp[];
}

export interface AppConfigResponse {
    config: string;
}
