// QuickBase Local API - Main Entry Point
// Payload-inspired QuickBase client with full type safety

// Export configuration
export { buildConfig } from '../types/config'
export type {
  QuickBaseConfig,
  QuickBaseAppConfig,
  ExtractAppNames,
  GetAppByName,
} from '../types/config'

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
} from '../types/quickbase'

// Base GeneratedTypes interface with fallback untyped properties
export interface GeneratedTypes {
  // Fallback types when no generated types exist
  appsUntyped: { [appName: string]: any }
  tablesUntyped: { [appName: string]: { [tableName: string]: any } }
  tableDataUntyped: { [appName: string]: { [tableName: string]: Record<string, any> } }
  appNamesUntyped: string
  tableNamesUntyped: { [appName: string]: string }
}

// Type resolution system - conditionally use generated types or fallbacks
type ResolveAppType<T> = 'apps' extends keyof T 
  ? T['apps'] 
  : 'appsUntyped' extends keyof T 
    ? T['appsUntyped'] 
    : { [appName: string]: any }

type ResolveTableType<T> = 'tables' extends keyof T 
  ? T['tables'] 
  : 'tablesUntyped' extends keyof T 
    ? T['tablesUntyped'] 
    : { [appName: string]: { [tableName: string]: any } }

type ResolveTableDataType<T> = 'tableData' extends keyof T 
  ? T['tableData'] 
  : 'tableDataUntyped' extends keyof T 
    ? T['tableDataUntyped'] 
    : { [appName: string]: { [tableName: string]: Record<string, any> } }

// Export resolved types for use throughout the system
export type TypedApps = ResolveAppType<GeneratedTypes>
export type TypedTables = ResolveTableType<GeneratedTypes>
export type TypedTableData = ResolveTableDataType<GeneratedTypes>

// Extract type-safe names
export type AppName = keyof TypedApps extends string ? keyof TypedApps : string
export type TableName<TApp extends AppName> = TApp extends keyof TypedTables 
  ? keyof TypedTables[TApp] extends string ? keyof TypedTables[TApp] : string
  : string

// Get table data type
export type GetTableData<TApp extends AppName, TTable extends TableName<TApp>> = 
  TApp extends keyof TypedTableData 
    ? TTable extends keyof TypedTableData[TApp]
      ? TypedTableData[TApp][TTable]
      : Record<string, any>
    : Record<string, any>

// Helper type for string keys
type StringKeyOf<T> = Extract<keyof T, string>

// Note: Generated types are created in the consuming codebase via module declaration merging 