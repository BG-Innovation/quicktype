export { buildConfig } from './types/config';
export type { QuickBaseConfig, QuickBaseAppConfig, ExtractAppNames, GetAppByName, } from './types/config';
export { getQuickbase } from './client/quickbase';
export type { QuickBaseClient, FindOptions, FindByIDOptions, CreateOptions, UpdateOptions, DeleteOptions, CountOptions, Where, WhereCondition, Sort, PaginatedDocs, RecordResponse, CountResponse, BulkOperationResult, BaseOptions, } from './client/types';
export type { QuickBaseField, QuickBaseTable, QuickBaseApp, } from './types/quickbase';
export interface GeneratedTypes {
    appsUntyped: {
        [appName: string]: {
            name: string;
            appId: string;
            displayName: string;
            tables: Record<string, any>;
        };
    };
    tablesUntyped: {
        [appName: string]: {
            [tableName: string]: {
                tableId: string;
                displayName: string;
                fields: Record<string, any>;
            };
        };
    };
    tableDataUntyped: {
        [appName: string]: {
            [tableName: string]: Record<string, any>;
        };
    };
    tableWritableDataUntyped: {
        [appName: string]: {
            [tableName: string]: Record<string, any>;
        };
    };
}
type ResolveAppType<T> = 'apps' extends keyof T ? T['apps'] : T['appsUntyped'];
type ResolveTableType<T> = 'tables' extends keyof T ? T['tables'] : T['tablesUntyped'];
type ResolveTableDataType<T> = 'tableData' extends keyof T ? T['tableData'] : T['tableDataUntyped'];
type ResolveTableWritableDataType<T> = 'tableWritableData' extends keyof T ? T['tableWritableData'] : T['tableWritableDataUntyped'];
export type TypedApps = ResolveAppType<GeneratedTypes>;
export type TypedTables = ResolveTableType<GeneratedTypes>;
export type TypedTableData = ResolveTableDataType<GeneratedTypes>;
export type TypedTableWritableData = ResolveTableWritableDataType<GeneratedTypes>;
type StringKeyOf<T> = Extract<keyof T, string>;
export type AppName = StringKeyOf<TypedApps>;
export type TableName<TApp extends AppName> = TApp extends keyof TypedTables ? StringKeyOf<TypedTables[TApp]> : string;
export type GetTableData<TApp extends AppName, TTable extends TableName<TApp>> = TApp extends keyof TypedTableData ? TTable extends keyof TypedTableData[TApp] ? TypedTableData[TApp][TTable] : Record<string, any> : Record<string, any>;
export type GetTableWritableData<TApp extends AppName, TTable extends TableName<TApp>> = TApp extends keyof TypedTableWritableData ? TTable extends keyof TypedTableWritableData[TApp] ? TypedTableWritableData[TApp][TTable] : Record<string, any> : Record<string, any>;
//# sourceMappingURL=index.d.ts.map