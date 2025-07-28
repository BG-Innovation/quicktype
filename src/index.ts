// QuickBase Local API - Main Entry Point
// Payload-inspired QuickBase client with full type safety

// Export configuration
export { buildConfig } from '../types/config'
export type {
  QuickBaseConfig,
  QuickBaseAppConfig,
  ExtractAppSlugs,
  GetAppBySlug,
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

// Re-export generated types if available
export * from '../types/generated' 