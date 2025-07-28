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
  AppName,
  TableName,
  GetTableData,
  GeneratedTypes,
  FallbackAppName,
  FallbackTableName,
  FallbackTableData,
} from './client/types'

// Re-export types from the existing type system
export type {
  QuickBaseField,
  QuickBaseTable,
  QuickBaseApp,
} from '../types/quickbase'

// Export the generation script function
export { buildTypes } from '../scripts/generate' 