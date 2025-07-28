// Auto-generated index file for QuickBase types
// This file exports all generated app types

export * from './bg_software.types';

// Re-export common interfaces
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
