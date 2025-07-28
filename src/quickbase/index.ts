// Main QuickBase Client - Provides Payload-like local API

import type { 
  QuickBaseClient as IQuickBaseClient,
  QuickBaseConfig,
  QuickBaseLocalAPI,
  QuickBaseTable,
  QuickBaseRequest,
  FindOptions,
  FindByIDOptions,
  CreateOptions,
  UpdateOptions,
  DeleteOptions,
  CountOptions,
  PaginatedQuickBaseDocs,
  TransformQuickBaseWithSelect,
  QuickBaseSelectType,
  BulkOperationResult
} from './types/index.js'

import { createLocalReq } from './utilities/createLocalReq.js'
import { findLocal } from './operations/local/find.js'
import { findByIDLocal } from './operations/local/findByID.js'
import { createLocal } from './operations/local/create.js'
import { updateLocal } from './operations/local/update.js'
import { deleteLocal } from './operations/local/delete.js'
import { countLocal } from './operations/local/count.js'

export class QuickBaseClient implements IQuickBaseClient {
  public config: QuickBaseConfig
  public tables: Record<string, QuickBaseTable> = {}

  constructor(config: QuickBaseConfig) {
    this.config = config
    this.initializeTables()
  }

  /**
   * Initialize tables from config - can be extended to load from generated types
   */
  private initializeTables(): void {
    // This will be populated by the generated types or discovery
    // For now, it's empty and will be filled by operations as needed
  }

  /**
   * Find documents in a QuickBase table
   */
  public find: QuickBaseLocalAPI['find'] = async <
    TTable extends Record<string, any> = any, 
    TSelect extends QuickBaseSelectType = never
  >(
    options: FindOptions<TTable, TSelect>
  ): Promise<PaginatedQuickBaseDocs<TransformQuickBaseWithSelect<TTable, TSelect>>> => {
    return findLocal(this, options)
  }

  /**
   * Find a document by ID in a QuickBase table
   */
  public findByID: QuickBaseLocalAPI['findByID'] = async <
    TTable extends Record<string, any> = any,
    TSelect extends QuickBaseSelectType = never
  >(
    options: FindByIDOptions<TTable, TSelect>
  ): Promise<TransformQuickBaseWithSelect<TTable, TSelect> | null> => {
    return findByIDLocal(this, options)
  }

  /**
   * Create a new document in a QuickBase table
   */
  public create: QuickBaseLocalAPI['create'] = async <
    TData extends Record<string, any> = any
  >(
    options: CreateOptions<TData>
  ): Promise<TData> => {
    return createLocal(this, options)
  }

  /**
   * Update documents in a QuickBase table
   */
  public update: QuickBaseLocalAPI['update'] = async <
    TData extends Record<string, any> = any,
    TSelect extends QuickBaseSelectType = never
  >(
    options: UpdateOptions<TData, TSelect>
  ): Promise<TransformQuickBaseWithSelect<TData, TSelect>> => {
    return updateLocal(this, options)
  }

  /**
   * Delete documents from a QuickBase table
   */
  public delete: QuickBaseLocalAPI['delete'] = async <
    TData extends Record<string, any> = any
  >(
    options: DeleteOptions<TData>
  ): Promise<TData> => {
    return deleteLocal(this, options)
  }

  /**
   * Count documents in a QuickBase table
   */
  public count: QuickBaseLocalAPI['count'] = async (
    options: CountOptions
  ): Promise<{ totalDocs: number }> => {
    return countLocal(this, options)
  }

  /**
   * Get app configuration for a specific app ID
   */
  public getAppConfig(appId: string) {
    return this.config.apps.find(app => app.appId === appId)
  }

  /**
   * Get table information (placeholder - will be enhanced with generated types)
   */
  public getTable(tableId: string): QuickBaseTable | undefined {
    return this.tables[tableId]
  }

  /**
   * Register a table (used by operations or type generation)
   */
  public registerTable(tableId: string, table: QuickBaseTable): void {
    this.tables[tableId] = table
  }
}

// Factory function to create a QuickBase client
export function createQuickBaseClient(config: QuickBaseConfig): QuickBaseClient {
  return new QuickBaseClient(config)
}

// Default export
export default QuickBaseClient 