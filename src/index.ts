// QuickBase Local API - Main Entry Point
// Payload-inspired QuickBase client with full type safety

// Export configuration
export { buildConfig } from './types/config'
export type {
  QuickBaseConfig,
  QuickBaseAppConfig,
  ExtractAppNames,
  GetAppByName,
} from './types/config'

// Export client
export { getQuickbase } from './client/quickbase'
export type {
  QuickBaseClient,
  FindOptions,
  FindByIDOptions,
  CreateOptions,
  UpdateOptions,
  DeleteOptions,
  CountOptions,
  Where,
  WhereCondition,
  Sort,
  PaginatedDocs,
  RecordResponse,
  CountResponse,
  BulkOperationResult,
  BaseOptions,
} from './client/types'

// Re-export types from the existing type system
export type {
  QuickBaseField,
  QuickBaseTable,
  QuickBaseApp,
} from './types/quickbase'

// Base GeneratedTypes interface with fallback untyped properties (Payload-style)
export interface GeneratedTypes {
  // Fallback types when no generated types exist (like Payload's collectionsUntyped)
  appsUntyped: {
    [appName: string]: {
      name: string
      appId: string
      displayName: string
      tables: Record<string, any>
    }
  }
  tablesUntyped: {
    [appName: string]: {
      [tableName: string]: {
        tableId: string
        displayName: string
        fields: Record<string, any>
      }
    }
  }
  tableDataUntyped: {
    [appName: string]: {
      [tableName: string]: Record<string, any>
    }
  }

}

// Conditional type resolution system (exactly like Payload's approach)
type ResolveAppType<T> = 'apps' extends keyof T 
  ? T['apps'] 
  : // @ts-expect-error
    T['appsUntyped']

type ResolveTableType<T> = 'tables' extends keyof T 
  ? T['tables'] 
  : // @ts-expect-error
    T['tablesUntyped']

type ResolveTableDataType<T> = 'tableData' extends keyof T 
  ? T['tableData'] 
  : // @ts-expect-error
    T['tableDataUntyped']



// Apply resolver types to GeneratedTypes (like Payload's TypedCollection)
export type TypedApps = ResolveAppType<GeneratedTypes>
export type TypedTables = ResolveTableType<GeneratedTypes>
export type TypedTableData = ResolveTableDataType<GeneratedTypes>

// Helper type for string keys (like Payload's StringKeyOf)
type StringKeyOf<T> = Extract<keyof T, string>

// Extract type-safe names using the resolved types
export type AppName = StringKeyOf<TypedApps>
export type TableName<TApp extends AppName> = TApp extends keyof TypedTables 
  ? StringKeyOf<TypedTables[TApp]>
  : string

// Get table data type using resolved types
export type GetTableData<TApp extends AppName, TTable extends TableName<TApp>> = 
  TApp extends keyof TypedTableData 
    ? TTable extends keyof TypedTableData[TApp]
      ? TypedTableData[TApp][TTable]
      : Record<string, any>
    : Record<string, any>

// Note: Generated types are created in the consuming codebase via module declaration merging 