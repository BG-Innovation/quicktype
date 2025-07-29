export interface DiscoveryConfig {
    appToken: string;
    userToken: string;
    realm: string;
    appId: string;
    baseUrl: string;
}
export interface AppConfigEntry {
    name: string;
    appId: string;
    appToken: string;
    description?: string;
}
export interface AppsConfig {
    apps: AppConfigEntry[];
    global: {
        userToken: string;
        realm: string;
        baseUrl: string;
    };
}
export interface QuickBaseField {
    fieldId: number;
    type: 'text' | 'email' | 'number' | 'date' | 'checkbox' | 'list' | 'file' | 'url';
    displayName: string;
    friendlyName: string;
    required: boolean;
    choices?: string[];
}
export interface QuickBaseTable {
    tableId: string;
    displayName: string;
    friendlyName: string;
    fields: Record<string, QuickBaseField>;
}
export interface QuickBaseApp {
    name: string;
    appId: string;
    displayName: string;
    description?: string;
    generatedAt: string;
    tables: Record<string, QuickBaseTable>;
}
export interface QuickBaseApiField {
    id: number;
    label: string;
    type: string;
    required: boolean;
    properties?: {
        choices?: string[];
    };
}
export interface QuickBaseApiTable {
    id: string;
    name: string;
}
export interface QuickBaseApiApp {
    name?: string;
    description?: string;
}
//# sourceMappingURL=quickbase.d.ts.map