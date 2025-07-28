// Auto-generated strongly-typed QuickBase client
// This provides the clean, Payload-like interface you requested

import type { 
  AppName, 
  TableName, 
  GetTableData
} from './client-mappings.js';
import { getFieldId, getTableId, AppConfig } from './client-mappings.js';

// Base client configuration - only needs secrets, not full config
export interface QuickBaseClientConfig {
  userToken: string;
  realm: string;
  baseUrl?: string;
}

// Query operators for where clauses
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

export type QuickBaseWhereField = {
  [key in QuickBaseOperator]?: any
}

export type QuickBaseWhere = {
  [fieldName: string]: QuickBaseWhere[] | QuickBaseWhereField | any
  AND?: QuickBaseWhere[]
  OR?: QuickBaseWhere[]
}

export type QuickBaseSort<TApp extends AppName, TTable extends TableName<TApp>> = Array<{
  field: keyof GetTableData<TApp, TTable>
  order?: 'ASC' | 'DESC'
}> | string

export type QuickBaseSelect<TApp extends AppName, TTable extends TableName<TApp>> = Partial<{
  [K in keyof GetTableData<TApp, TTable>]: boolean
}>

// Paginated response
export interface PaginatedResponse<T> {
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

// Transform type based on select - extracts only selected fields
export type TransformWithSelect<
  TData extends Record<string, any>,
  TSelect extends Partial<Record<string, boolean>>
> = {
  [K in keyof TData as K extends keyof TSelect
    ? TSelect[K] extends true
      ? K
      : never
    : K extends 'id'
      ? K  // Always include ID field
      : never
  ]: TData[K]
}

// Operation options
export interface FindOptions<TApp extends AppName, TTable extends TableName<TApp>, TSelect extends QuickBaseSelect<TApp, TTable> = never> {
  app: TApp
  table: TTable
  where?: QuickBaseWhere
  sort?: QuickBaseSort<TApp, TTable>
  limit?: number
  page?: number
  select?: TSelect
}

export interface FindByIDOptions<TApp extends AppName, TTable extends TableName<TApp>, TSelect extends QuickBaseSelect<TApp, TTable> = never> {
  app: TApp
  table: TTable
  id: string | number
  select?: TSelect
}

export interface CreateOptions<TApp extends AppName, TTable extends TableName<TApp>> {
  app: TApp
  table: TTable
  data: Partial<GetTableData<TApp, TTable>>
  mergeFieldId?: number
}

export interface UpdateOptions<TApp extends AppName, TTable extends TableName<TApp>, TSelect extends QuickBaseSelect<TApp, TTable> = never> {
  app: TApp
  table: TTable
  id?: string | number
  where?: QuickBaseWhere
  data: Partial<GetTableData<TApp, TTable>>
  select?: TSelect
  upsert?: boolean
}

export interface DeleteOptions<TApp extends AppName, TTable extends TableName<TApp>> {
  app: TApp
  table: TTable
  id?: string | number
  where?: QuickBaseWhere
}

export interface CountOptions<TApp extends AppName, TTable extends TableName<TApp>> {
  app: TApp
  table: TTable
  where?: QuickBaseWhere
}

// Main QuickBase client class
export class QuickBaseClient {
  private config: QuickBaseClientConfig

  constructor(config: QuickBaseClientConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || 'https://api.quickbase.com/v1'
    }
  }

  async find<
    TApp extends AppName,
    TTable extends TableName<TApp>,
    TSelect extends QuickBaseSelect<TApp, TTable> = never
  >(
    options: FindOptions<TApp, TTable, TSelect>
  ): Promise<PaginatedResponse<GetTableData<TApp, TTable>>> {
    const { app, table, where, sort, limit = 25, page = 1, select } = options
    
    const appConfig = AppConfig[app]
    const tableId = getTableId(app, table)
    
    // Build QuickBase query
    const qbQuery = this.transformWhereToQBQuery(app, table, where)
    const qbSort = this.transformSortToQBFormat(app, table, sort)
    const qbSelect = this.transformSelectToQBFormat(app, table, select)
    
    const skip = (page - 1) * limit
    
    const requestBody: any = {
      from: tableId,
      options: {
        skip,
        top: limit,
        compareWithAppLocalTime: false
      }
    }
    
    if (qbQuery) requestBody.where = qbQuery
    if (qbSort.length > 0) requestBody.sortBy = qbSort
    if (qbSelect && qbSelect.length > 0) requestBody.select = qbSelect
    
    const response = await this.makeRequest('/records/query', {
      method: 'POST',
      data: requestBody,
      appToken: this.getAppToken(app)
    })
    
    const docs = response.data || []
    const totalRecords = response.metadata?.totalRecords || docs.length
    const totalPages = Math.ceil(totalRecords / limit)
    
    return {
      docs: docs.map((doc: any) => this.transformRecord(app, table, doc)),
      totalDocs: totalRecords,
      limit,
      totalPages,
      page,
      pagingInfo: {
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
      }
    }
  }

  async findByID<
    TApp extends AppName,
    TTable extends TableName<TApp>,
    TSelect extends QuickBaseSelect<TApp, TTable> = never
  >(
    options: FindByIDOptions<TApp, TTable, TSelect>
  ): Promise<GetTableData<TApp, TTable> | null> {
    const { app, table, id, select } = options
    
    const result = await this.find({
      app,
      table,
      where: { id: { CT: id } },
      limit: 1,
      ...(select && { select })
    })
    
    return result.docs[0] || null
  }

  async create<TApp extends AppName, TTable extends TableName<TApp>>(
    options: CreateOptions<TApp, TTable>
  ): Promise<GetTableData<TApp, TTable>> {
    const { app, table, data, mergeFieldId } = options
    
    const appConfig = AppConfig[app]
    const tableId = getTableId(app, table)
    
    const recordData: any = {}
    for (const [fieldName, value] of Object.entries(data)) {
      if (fieldName === 'id') continue // Skip ID field for create
      const fieldId = getFieldId(app, table, fieldName)
      recordData[fieldId] = { value }
    }
    
    const requestBody: any = {
      to: tableId,
      data: [recordData],
      fieldsToReturn: [3] // Return at least the Record ID
    }
    
    if (mergeFieldId) requestBody.mergeFieldId = mergeFieldId
    
    const response = await this.makeRequest('/records', {
      method: 'POST',
      data: requestBody,
      appToken: this.getAppToken(app)
    })
    
    const created = response.data[0]
    return this.transformRecord(app, table, created)
  }

  async update<
    TApp extends AppName,
    TTable extends TableName<TApp>,
    TSelect extends QuickBaseSelect<TApp, TTable> = never
  >(
    options: UpdateOptions<TApp, TTable, TSelect>
  ): Promise<GetTableData<TApp, TTable>> {
    const { app, table, id, where, data, select, upsert = false } = options
    
    const appConfig = AppConfig[app]
    const tableId = getTableId(app, table)
    
    const recordData: any = {}
    
    if (id) {
      recordData['3'] = { value: id } // Record ID field
    }
    
    for (const [fieldName, value] of Object.entries(data)) {
      if (fieldName === 'id') continue
      const fieldId = getFieldId(app, table, fieldName)
      recordData[fieldId] = { value }
    }
    
    const qbSelect = this.transformSelectToQBFormat(app, table, select)
    
    const requestBody: any = {
      to: tableId,
      data: [recordData],
      fieldsToReturn: qbSelect || [3]
    }
    
    if (upsert) requestBody.mergeFieldId = 3
    
    const response = await this.makeRequest('/records', {
      method: 'POST',
      data: requestBody,
      appToken: this.getAppToken(app)
    })
    
    const updated = response.data[0]
    return this.transformRecord(app, table, updated)
  }

  async delete<TApp extends AppName, TTable extends TableName<TApp>>(
    options: DeleteOptions<TApp, TTable>
  ): Promise<GetTableData<TApp, TTable>> {
    const { app, table, id, where } = options
    
    // First get the record to return it
    let recordToDelete
    if (id) {
      recordToDelete = await this.findByID({ app, table, id })
    } else if (where) {
      const result = await this.find({ app, table, where, limit: 1 })
      recordToDelete = result.docs[0]
    }
    
    if (!recordToDelete) {
      throw new Error('Record not found')
    }
    
    const appConfig = AppConfig[app]
    const tableId = getTableId(app, table)
    
    let qbQuery = ''
    if (id) {
      qbQuery = `{3.EX.${id}}`
    } else if (where) {
      qbQuery = this.transformWhereToQBQuery(app, table, where)
    }
    
    await this.makeRequest('/records', {
      method: 'DELETE',
      data: { from: tableId, where: qbQuery },
      appToken: this.getAppToken(app)
    })
    
    return recordToDelete
  }

  async count<TApp extends AppName, TTable extends TableName<TApp>>(
    options: CountOptions<TApp, TTable>
  ): Promise<{ totalDocs: number }> {
    const { app, table, where } = options
    
    const result = await this.find({
      app,
      table,
      where,
      limit: 1
    })
    
    return { totalDocs: result.totalDocs }
  }

  // Helper methods
  private transformWhereToQBQuery<TApp extends AppName, TTable extends TableName<TApp>>(
    app: TApp,
    table: TTable,
    where?: QuickBaseWhere
  ): string {
    if (!where) return ''
    
    const buildCondition = (condition: QuickBaseWhere): string => {
      const conditions: string[] = []

      for (const [key, value] of Object.entries(condition)) {
        if (key === 'AND' && Array.isArray(value)) {
          const andConditions = value.map(buildCondition).filter(Boolean)
          if (andConditions.length > 0) {
            conditions.push(`(${andConditions.join(' AND ')})`)
          }
        } else if (key === 'OR' && Array.isArray(value)) {
          const orConditions = value.map(buildCondition).filter(Boolean)
          if (orConditions.length > 0) {
            conditions.push(`(${orConditions.join(' OR ')})`)
          }
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          for (const [operator, operatorValue] of Object.entries(value)) {
            if (operatorValue !== undefined) {
              const fieldId = getFieldId(app, table, key)
              conditions.push(`{${fieldId}.${operator}.'${operatorValue}'}`)
            }
          }
        } else if (value !== undefined) {
          const fieldId = getFieldId(app, table, key)
          conditions.push(`{${fieldId}.CT.'${value}'}`)
        }
      }

      return conditions.join(' AND ')
    }

    return buildCondition(where)
  }

  private transformSortToQBFormat<TApp extends AppName, TTable extends TableName<TApp>>(
    app: TApp,
    table: TTable,
    sort?: QuickBaseSort<TApp, TTable>
  ): Array<{ fieldId: number; order: 'ASC' | 'DESC' }> {
    if (!sort) return []

    if (typeof sort === 'string') {
      const isDesc = sort.startsWith('-')
      const fieldName = isDesc ? sort.substring(1) : sort
      const fieldId = getFieldId(app, table, fieldName)
      return [{ fieldId, order: isDesc ? 'DESC' : 'ASC' }]
    }

    if (Array.isArray(sort)) {
      return sort.map(item => ({
        fieldId: getFieldId(app, table, String(item.field)),
        order: item.order || 'ASC'
      }))
    }

    return []
  }

  private transformSelectToQBFormat<TApp extends AppName, TTable extends TableName<TApp>>(
    app: TApp,
    table: TTable,
    select?: QuickBaseSelect<TApp, TTable>
  ): number[] | undefined {
    if (!select) return undefined

    const selectedFields = Object.entries(select)
      .filter(([_, included]) => included === true)
      .map(([fieldName]) => getFieldId(app, table, fieldName))

    return selectedFields.length > 0 ? selectedFields : undefined
  }

  private transformRecord<TApp extends AppName, TTable extends TableName<TApp>>(
    app: TApp,
    table: TTable,
    record: any
  ): GetTableData<TApp, TTable> {
    const result: any = {}

    for (const [fieldId, fieldData] of Object.entries(record)) {
      if (fieldData && typeof fieldData === 'object' && 'value' in fieldData) {
        result[fieldId] = (fieldData as { value: any }).value
      } else {
        result[fieldId] = fieldData
      }
    }

    return result
  }

  private async makeRequest(endpoint: string, options: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    data?: any
    appToken: string
  }) {
    const url = `${this.config.baseUrl}${endpoint}`

    const headers: Record<string, string> = {
      'QB-Realm-Hostname': this.config.realm,
      'Authorization': `QB-USER-TOKEN ${this.config.userToken}`,
      'QB-App-Token': options.appToken,
      'Content-Type': 'application/json'
    }

    const requestOptions: RequestInit = {
      method: options.method,
      headers
    }

    if (options.data && (options.method === 'POST' || options.method === 'PUT')) {
      requestOptions.body = JSON.stringify(options.data)
    }

    const response = await fetch(url, requestOptions)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`QuickBase API Error: ${response.status} ${response.statusText}\n${errorText}`)
    }

    return await response.json()
  }

  private getAppToken(app: AppName): string {
    // This would be enhanced to get app tokens from environment or config
    // For now, this is a placeholder that should be filled by the user
    const envVar = `${app.toUpperCase()}_APP_TOKEN`
    return process.env[envVar] || ''
  }
}

// Factory function to create client
export function createQuickBaseClient(config: QuickBaseClientConfig): QuickBaseClient {
  return new QuickBaseClient(config)
}

export default QuickBaseClient
