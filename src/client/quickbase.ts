// QuickBase Client Implementation
// Inspired by Payload CMS Local API pattern

import type {
  QuickBaseConfig,
  GetAppByName,
} from '../../types/config'
import type {
  QuickBaseClient,
  FindOptions,
  FindByIDOptions,
  CreateOptions,
  UpdateOptions,
  DeleteOptions,
  CountOptions,
  PaginatedDocs,
  RecordResponse,
  CountResponse,
  WhereWithFieldNames,
  WhereCondition,
  SortWithFieldNames,
} from './types'
import type {
  AppName,
  TableName,
  GetTableData,
} from '../index'

// Fallback field mappings when generated types aren't available
const fallbackFieldMappings: Record<string, Record<string, Record<string, number>>> = {}
const fallbackTableMappings: Record<string, Record<string, string>> = {}

// Try to import generated mappings, but don't fail if they don't exist
let FieldMappings: Record<string, Record<string, Record<string, number>>> = fallbackFieldMappings
let TableMappings: Record<string, Record<string, string>> = fallbackTableMappings

try {
  // Try to load mappings from the consuming codebase (where pnpm generate creates them)
  const generatedTypes = require(process.cwd() + '/quickbase-types')
  FieldMappings = generatedTypes.FieldMappings || fallbackFieldMappings
  TableMappings = generatedTypes.TableMappings || fallbackTableMappings
} catch {
  // Generated types don't exist - use fallbacks
  console.debug('QuickBase: Using fallback field mappings. Run `pnpm generate` to enable type-safe field mappings.')
}

// Fallback functions for field/table ID resolution
function getFieldId<TApp extends AppName, TTable extends TableName<TApp>>(
  app: TApp,
  table: TTable,
  fieldName: string
): number {
  const fieldId = FieldMappings[app as string]?.[table as string]?.[fieldName]
  return typeof fieldId === 'number' ? fieldId : 3 // Default to record ID field
}

function getTableId<TApp extends AppName, TTable extends TableName<TApp>>(
  app: TApp,
  table: TTable
): string {
  return TableMappings[app as string]?.[table as string] || String(table)
}

export class QuickBaseClientImpl<TConfig extends QuickBaseConfig> implements QuickBaseClient<TConfig> {
  public config: TConfig
  private fetch: typeof globalThis.fetch
  private reverseFieldMappings: Record<string, Record<string, Record<number, string>>> = {}

  constructor(config: TConfig) {
    this.config = config
    this.fetch = globalThis.fetch
    this.buildReverseMappings()
  }
  
  private buildReverseMappings() {
    for (const appName in FieldMappings) {
      this.reverseFieldMappings[appName] = {}
      const tables = FieldMappings[appName as AppName]
      for (const tableName in tables) {
        this.reverseFieldMappings[appName][tableName] = {}
        const fields = tables[tableName as keyof typeof tables]
        for (const fieldName in fields) {
          const fieldId = fields[fieldName as keyof typeof fields]
          this.reverseFieldMappings[appName][tableName][fieldId] = fieldName
        }
      }
    }
  }
  
  private transformRecordFromQB<TApp extends AppName, TTable extends TableName<TApp> & string>(
    app: TApp,
    table: TTable,
    record: Record<string, { value: any }>
  ): GetTableData<TApp, TTable> {
    const transformed: Record<string, any> = {}
    const mapping = this.reverseFieldMappings[app]?.[table]
    
    // If no mapping available, use raw field IDs as fallback
    if (!mapping || Object.keys(mapping).length === 0) {
      for (const fieldId in record) {
        if (fieldId === '3') {
          transformed['id'] = record[fieldId].value
        } else {
          transformed[`field_${fieldId}`] = record[fieldId].value
        }
      }
      return transformed as GetTableData<TApp, TTable>
    }
    
    for (const fieldId in record) {
      const fieldName = mapping[Number(fieldId)] || `field_${fieldId}`
      if (fieldName === 'id' || fieldName.startsWith('field_')) {
        transformed['id'] = record[fieldId].value
      } else {
        transformed[fieldName] = record[fieldId].value
      }
    }
    return transformed as GetTableData<TApp, TTable>
  }
  
  private transformDataToQB<TApp extends AppName, TTable extends TableName<TApp> & string>(
    app: TApp,
    table: TTable,
    data: Partial<GetTableData<TApp, TTable>>
  ): Record<string, { value: any }> {
    const transformed: Record<string, { value: any }> = {}
    for (const fieldName in data) {
      const fieldId = getFieldId(app, table, fieldName)
      if (fieldId) {
        transformed[String(fieldId)] = { value: data[fieldName as keyof typeof data] }
      }
    }
    return transformed
  }

  /**
   * Find multiple records
   */
  async find<TApp extends AppName, TTable extends TableName<TApp> & string>(
    options: FindOptions<TApp, TTable>
  ): Promise<PaginatedDocs<GetTableData<TApp, TTable>>> {
    const { app, table, where, sort, limit = 20, page = 1, select, debug, disableErrors } = options
    
    const appConfig = this.getAppConfig(app)
    const tableId = getTableId(app, table)
    
    try {
      const body = {
        from: tableId,
        select: this.buildSelectFields(app, table, select),
        where: this.buildWhereClause(app, table, where),
        sortBy: this.buildSortClause(app, table, sort),
        options: {
          skip: (page - 1) * limit,
          top: limit,
        },
      }

      const response = await this.makeRequest(appConfig, '/records/query', 'POST', body, debug)
      
      const totalDocs = response.metadata?.totalRecords || response.data?.length || 0
      const totalPages = Math.ceil(totalDocs / limit)
      
      const docs = response.data.map((rec: any) => this.transformRecordFromQB(app, table, rec))
      
      return {
        docs,
        totalDocs,
        limit,
        page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      }
    } catch (error) {
      if (disableErrors) {
        return {
          docs: [], totalDocs: 0, limit, page, totalPages: 0,
          hasNextPage: false, hasPrevPage: false, nextPage: null, prevPage: null,
        }
      }
      throw error
    }
  }

  /**
   * Find a single record by ID
   */
  async findByID<TApp extends AppName, TTable extends TableName<TApp> & string>(
    options: FindByIDOptions<TApp, TTable>
  ): Promise<RecordResponse<GetTableData<TApp, TTable>>> {
    const { app, table, id, select, debug, disableErrors } = options
    
    const appConfig = this.getAppConfig(app)
    const tableId = getTableId(app, table)
    
    try {
      const body = {
        from: tableId,
        select: this.buildSelectFields(app, table, select),
        where: `{3.EX.${id}}`,
        options: { top: 1 },
      }

      const response = await this.makeRequest(appConfig, '/records/query', 'POST', body, debug)
      
      if (!response.data || response.data.length === 0) {
        if (disableErrors) return { data: null as any }
        throw new Error(`Record with ID ${id} not found in table ${table}`)
      }
      
      const record = this.transformRecordFromQB(app, table, response.data[0])
      
      return {
        data: record,
        metadata: {
          recordId: (record as any).id || id,
        },
      }
    } catch (error) {
      if (disableErrors) {
        return { data: null as any }
      }
      throw error
    }
  }

  /**
   * Create a new record
   */
  async create<TApp extends AppName, TTable extends TableName<TApp> & string>(
    options: CreateOptions<TApp, TTable>
  ): Promise<RecordResponse<GetTableData<TApp, TTable>>> {
    const { app, table, data, select, debug } = options
    
    const appConfig = this.getAppConfig(app)
    const tableId = getTableId(app, table)
    
    const body = {
      to: tableId,
      data: [this.transformDataToQB(app, table, data)],
      fieldsToReturn: this.buildSelectFields(app, table, select)?.map(String),
    }

    const response = await this.makeRequest(appConfig, '/records', 'POST', body, debug)
    const createdRecord = response.data?.[0] ? this.transformRecordFromQB(app, table, response.data[0]) : ({} as any)
    
    return {
      data: createdRecord,
      metadata: {
        recordId: response.metadata?.createdRecordIds?.[0],
      },
    }
  }

  /**
   * Update an existing record
   */
  async update<TApp extends AppName, TTable extends TableName<TApp> & string>(
    options: UpdateOptions<TApp, TTable>
  ): Promise<RecordResponse<GetTableData<TApp, TTable>>> {
    const { app, table, id, data, select, debug } = options
    
    const appConfig = this.getAppConfig(app)
    const tableId = getTableId(app, table)
    
    const transformedData = this.transformDataToQB(app, table, data)
    transformedData['3'] = { value: id }

    const body = {
      to: tableId,
      data: [transformedData],
      fieldsToReturn: this.buildSelectFields(app, table, select)?.map(String),
    }

    const response = await this.makeRequest(appConfig, '/records', 'POST', body, debug)
    const updatedRecord = response.data?.[0] ? this.transformRecordFromQB(app, table, response.data[0]) : ({} as any)
    
    return {
      data: updatedRecord,
      metadata: { recordId: Number(id) },
    }
  }

  /**
   * Delete a record
   */
  async delete<TApp extends AppName, TTable extends TableName<TApp> & string>(
    options: DeleteOptions<TApp, TTable>
  ): Promise<{ id: number | string }> {
    const { app, table, id, debug } = options
    
    const appConfig = this.getAppConfig(app)
    const tableId = getTableId(app, table)
    
    const body = {
      from: tableId,
      where: `{3.EX.${id}}`,
    }

    await this.makeRequest(appConfig, '/records', 'DELETE', body, debug)
    
    return { id }
  }

  /**
   * Count records matching criteria
   */
  async count<TApp extends AppName, TTable extends TableName<TApp> & string>(
    options: CountOptions<TApp, TTable>
  ): Promise<CountResponse> {
    const { app, table, where, debug, disableErrors } = options
    
    const appConfig = this.getAppConfig(app)
    const tableId = getTableId(app, table)
    
    try {
      const body = {
        from: tableId,
        where: this.buildWhereClause(app, table, where),
        options: { top: 0 },
      }

      const response = await this.makeRequest(appConfig, '/records/query', 'POST', body, debug)
      
      return { totalDocs: response.metadata?.totalRecords || 0 }
    } catch (error) {
      if (disableErrors) {
        return { totalDocs: 0 }
      }
      throw error
    }
  }

  // Private helper methods

  private getAppConfig<TApp extends AppName>(
    appName: TApp
  ): GetAppByName<TConfig, TApp> {
    const app = this.config.apps.find(a => a.name === appName)
    if (!app) {
      throw new Error(`App with name "${appName}" not found in configuration`)
    }
    return app as any
  }

  private buildSelectFields<TApp extends AppName, TTable extends TableName<TApp> & string>(
    app: TApp,
    table: TTable,
    select?: Array<keyof GetTableData<TApp, TTable>>
  ): number[] | undefined {
    if (!select || select.length === 0) return undefined
    
    return select.map(field => getFieldId(app, table, field as string)).filter(id => id > 0)
  }

  private buildWhereClause<TApp extends AppName, TTable extends TableName<TApp> & string>(
    app: TApp,
    table: TTable,
    where?: WhereWithFieldNames<TApp, TTable>
  ): string {
    if (!where) return ''
    
    const build = (w: WhereWithFieldNames<TApp, TTable>): string[] => {
      const innerConditions: string[] = []
      for (const [field, condition] of Object.entries(w)) {
        if (field === 'and' || field === 'or') continue

        const fieldId = getFieldId(app, table, field as string)
        if (typeof condition === 'object' && condition !== null) {
          innerConditions.push(this.buildFieldCondition(String(fieldId), condition as WhereCondition))
        } else {
          innerConditions.push(`{${fieldId}.EX.'${condition}'}`)
        }
      }

      if (w.and) {
        const andConditions = w.and.map(build).flat().join(' AND ')
        if (andConditions) innerConditions.push(`(${andConditions})`)
      }

      if (w.or) {
        const orConditions = w.or.map(build).flat().join(' OR ')
        if (orConditions) innerConditions.push(`(${orConditions})`)
      }
      
      return innerConditions
    }

    return build(where).join(' AND ')
  }

  private buildFieldCondition(fieldId: string, condition: WhereCondition): string {
    const operatorMap = {
      equals: 'EX', notEquals: 'XEX', greaterThan: 'GT', lessThan: 'LT',
      greaterThanOrEqual: 'GTE', lessThanOrEqual: 'LTE', contains: 'CT', notContains: 'XCT',
      startsWith: 'SW', endsWith: 'EW',
    }
    
    const conditions = Object.entries(condition).map(([op, value]) => {
      if (op === 'isEmpty') return `{${fieldId}.EX.''}`
      if (op === 'isNotEmpty') return `{${fieldId}.XEX.''}`
      if (op === 'in' || op === 'notIn') {
        const opStr = op === 'in' ? 'EX' : 'XEX'
        const values = (Array.isArray(value) ? value : [value]).map(v => `'${v}'`).join(';')
        return `{${fieldId}.${opStr}.${values}}`
      }
      const qbOp = operatorMap[op as keyof typeof operatorMap]
      return qbOp ? `{${fieldId}.${qbOp}.'${value}'}` : ''
    }).filter(Boolean)

    return conditions.join(' AND ')
  }

  private buildSortClause<TApp extends AppName, TTable extends TableName<TApp> & string>(
    app: TApp,
    table: TTable,
    sort?: SortWithFieldNames<TApp, TTable>
  ): Array<{ fieldId: number; order: 'ASC' | 'DESC' }> | undefined {
    if (!sort) return undefined

    const sortArray = Array.isArray(sort) ? sort : [sort]
    
    return sortArray.map(sortField => {
      const fieldName = String(sortField).replace(/^-/, '')
      const fieldId = getFieldId(app, table, fieldName)
      return {
        fieldId,
        order: String(sortField).startsWith('-') ? 'DESC' as const : 'ASC' as const,
      }
    }).filter(s => s.fieldId > 0)
  }

  private async makeRequest(
    appConfig: any,
    endpoint: string,
    method: string,
    body?: any,
    debug?: boolean
  ): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`
    
    const headers: Record<string, string> = {
      'QB-Realm-Hostname': this.config.realm,
      'Authorization': `QB-USER-TOKEN ${this.config.userToken}`,
      'QB-App-Token': appConfig.appToken,
      'Content-Type': 'application/json',
    }

    if (debug || this.config.debug) {
      console.log(`QuickBase ${method} ${url}`, { body: JSON.stringify(body, null, 2) })
    }

    const response = await this.fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(this.config.timeout || 30000),
    })

    const result = await response.json()
    
    if (!response.ok) {
      const message = result.message || 'Unknown error'
      const description = result.description || 'No description'
      throw new Error(`QuickBase API error: ${response.status} - ${message}\n${description}`)
    }
    
    if (debug || this.config.debug) {
      console.log(`QuickBase response:`, JSON.stringify(result, null, 2))
    }

    return result
  }
}

/**
 * Create a QuickBase client instance
 * Similar to Payload's local API initialization
 */
export function getQuickbase<TConfig extends QuickBaseConfig>(options: {
  config: TConfig
}): QuickBaseClient<TConfig> {
  return new QuickBaseClientImpl(options.config)
} 