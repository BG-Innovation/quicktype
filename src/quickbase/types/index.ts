// Core QuickBase Types - Mirrors Payload's type structure

import type { DiscoveryConfig, AppsConfig } from '../../../types/quickbase.js'

// Base QuickBase configuration
export interface QuickBaseConfig {
  apps: AppsConfig['apps']
  global: AppsConfig['global']
}

// QuickBase client instance type
export interface QuickBaseClient {
  config: QuickBaseConfig
  tables: Record<string, QuickBaseTable>
  find: QuickBaseLocalAPI['find']
  findByID: QuickBaseLocalAPI['findByID']
  create: QuickBaseLocalAPI['create']
  update: QuickBaseLocalAPI['update']
  delete: QuickBaseLocalAPI['delete']
  count: QuickBaseLocalAPI['count']
}

// Table and App slug types
export type TableSlug = string
export type AppSlug = string

// QuickBase request context (mirrors Payload's RequestContext)
export interface QuickBaseRequestContext {
  [key: string]: unknown
}

// QuickBase request object (mirrors PayloadRequest)
export interface QuickBaseRequest {
  context?: QuickBaseRequestContext
  locale?: string
  fallbackLocale?: string
  user?: QuickBaseUser | null
  appId?: string
  userToken?: string
  appToken?: string
  realm?: string
  baseUrl?: string
}

// User type for QuickBase operations
export interface QuickBaseUser {
  id: string | number
  email?: string
  [key: string]: unknown
}

// QuickBase response structure
export interface QuickBaseResponse<T = any> {
  data: T
  fields?: QuickBaseFieldSchema[]
  metadata?: {
    numFields: number
    numRecords: number
    totalRecords?: number
    skip?: number
  }
}

// Paginated response type (mirrors Payload's PaginatedDocs)
export interface PaginatedQuickBaseDocs<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingInfo: {
    hasNextPage: boolean
    hasPrevPage: boolean
    nextPage: number | null
    prevPage: number | null
  }
}

// QuickBase field schema
export interface QuickBaseFieldSchema {
  id: number
  label: string
  type: string
  required?: boolean
  choices?: string[]
}

// QuickBase table structure
export interface QuickBaseTable {
  id: string
  name: string
  alias?: string
  fields: Record<string, QuickBaseFieldSchema>
}

// QuickBase query operators (similar to Payload's Where type)
export type QuickBaseOperator = 
  | 'EX' // exists
  | 'TV' // true/false
  | 'IR' // contains
  | 'SW' // starts with
  | 'EW' // ends with
  | 'CT' // equal to
  | 'XCT' // not equal to
  | 'GT' // greater than
  | 'GTE' // greater than or equal
  | 'LT' // less than
  | 'LTE' // less than or equal
  | 'BF' // before (date)
  | 'AF' // after (date)
  | 'OBF' // on or before (date)
  | 'OAF' // on or after (date)

// QuickBase where clause structure
export type QuickBaseWhereField = {
  [key in QuickBaseOperator]?: any
}

export type QuickBaseWhere = {
  [fieldId: string]: QuickBaseWhere[] | QuickBaseWhereField | any
  AND?: QuickBaseWhere[]
  OR?: QuickBaseWhere[]
}

// Sort type for QuickBase
export type QuickBaseSort = Array<{ fieldId: number; order?: 'ASC' | 'DESC' }> | string

// Select type for field selection
export type QuickBaseSelectType = Record<string, boolean> | string[]

// Transform types (mirrors Payload's transform types)
export type TransformQuickBaseWithSelect<
  TTable extends Record<string, any>,
  TSelect extends QuickBaseSelectType
> = TSelect extends Record<string, boolean>
  ? {
      [K in keyof TTable as K extends keyof TSelect
        ? TSelect[K] extends true
          ? K
          : never
        : K extends 'id'
          ? K  // Always include ID
          : never
      ]: TTable[K]
    }
  : TTable

// Local API interface (mirrors Payload's local operations)
export interface QuickBaseLocalAPI {
  find: <TTable extends Record<string, any> = any, TSelect extends QuickBaseSelectType = never>(
    options: FindOptions<TTable, TSelect>
  ) => Promise<PaginatedQuickBaseDocs<TransformQuickBaseWithSelect<TTable, TSelect>>>

  findByID: <TTable extends Record<string, any> = any, TSelect extends QuickBaseSelectType = never>(
    options: FindByIDOptions<TTable, TSelect>
  ) => Promise<TransformQuickBaseWithSelect<TTable, TSelect> | null>

  create: <TData extends Record<string, any> = any>(
    options: CreateOptions<TData>
  ) => Promise<TData>

  update: <TData extends Record<string, any> = any, TSelect extends QuickBaseSelectType = never>(
    options: UpdateOptions<TData, TSelect>
  ) => Promise<TransformQuickBaseWithSelect<TData, TSelect>>

  delete: <TData extends Record<string, any> = any>(
    options: DeleteOptions<TData>
  ) => Promise<TData>

  count: (
    options: CountOptions
  ) => Promise<{ totalDocs: number }>
}

// Operation options interfaces
export interface BaseOptions {
  table: TableSlug
  appId?: string
  context?: QuickBaseRequestContext
  req?: Partial<QuickBaseRequest>
  user?: QuickBaseUser
  overrideAccess?: boolean
}

export interface FindOptions<TTable = any, TSelect extends QuickBaseSelectType = never> extends BaseOptions {
  where?: QuickBaseWhere
  sort?: QuickBaseSort
  limit?: number
  page?: number
  select?: TSelect
  options?: string // QuickBase query options
}

export interface FindByIDOptions<TTable = any, TSelect extends QuickBaseSelectType = never> extends BaseOptions {
  id: string | number
  select?: TSelect
}

export interface CreateOptions<TData = any> extends BaseOptions {
  data: Partial<TData>
  mergeFieldId?: number // For upsert operations
}

export interface UpdateOptions<TData = any, TSelect extends QuickBaseSelectType = never> extends BaseOptions {
  id?: string | number
  where?: QuickBaseWhere
  data: Partial<TData>
  select?: TSelect
  upsert?: boolean
}

export interface DeleteOptions<TData = any> extends BaseOptions {
  id?: string | number
  where?: QuickBaseWhere
}

export interface CountOptions extends BaseOptions {
  where?: QuickBaseWhere
}

// Bulk operation result type
export interface BulkOperationResult<TData = any> {
  docs: TData[]
  totalDocs: number
  errors?: Array<{
    id?: string | number
    message: string
  }>
} 