
import { QuickBaseApp, QuickBaseTable } from "./quickbase";

export interface AppRegistry {
  [key: string]: QuickBaseApp;
}

export interface AppTableRegistry {
  [key:string]: {
    [key: string]: QuickBaseTable;
  }
}

export type AppName = keyof AppRegistry;

export type TableName<TApp extends AppName> = keyof AppTableRegistry[TApp];

export type AppTable<TApp extends AppName, TTable extends TableName<TApp>> = 
  TApp extends keyof AppTableRegistry 
    ? TTable extends keyof AppTableRegistry[TApp] 
      ? AppTableRegistry[TApp][TTable]
      : QuickBaseTable
    : QuickBaseTable;

export type GetTableData<TApp extends AppName, TTable extends TableName<TApp>> = Record<string, any>;

export interface TableDataMap {
    [key: string]: {
        [key: string]: Record<string, any>;
    };
}

export const FieldMappings = {} as const;

export const TableMappings = {} as const;

export function getFieldId<TApp extends AppName, TTable extends TableName<TApp>>(
  app: TApp,
  table: TTable,
  fieldName: string
): number {
  console.warn('Using placeholder getFieldId. Generate types for full type safety.');
  return 3; // Default to record ID
}

export function getTableId<TApp extends AppName, TTable extends TableName<TApp>>(
  app: TApp,
  table: TTable
): string {
  console.warn('Using placeholder getTableId. Generate types for full type safety.');
  return String(table);
} 