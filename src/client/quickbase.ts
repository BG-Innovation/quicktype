// QuickBase Client Implementation
// Inspired by Payload CMS Local API pattern

import type {
  QuickBaseConfig,
  GetAppByName,
} from '../types/config'
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
  GetTableWritableData,
} from '../index'

// Payload-inspired approach: Pure TypeScript conditional type resolution
// NO runtime loading, NO global variables, NO side effects - exactly like Payload!

// Pure Payload approach: Type safety + sensible runtime defaults (no runtime mapping needed!)
function getFieldId<TApp extends AppName, TTable extends TableName<TApp>>(
  config: QuickBaseConfig,
  app: TApp,
  table: TTable,
  fieldName: string
): number {
  const fieldId = config.mappings.fieldMappings?.[app as string]?.[table as string]?.[fieldName];
  if (typeof fieldId === 'number') {
    return fieldId;
  }
  // Fallback for safety, though with required mappings this is less likely to be hit.
  return 3;
}

function getTableId<TApp extends AppName, TTable extends TableName<TApp>>(
  config: QuickBaseConfig,
  app: TApp,
  table: TTable
): string {
  const tableId = config.mappings.tableMappings?.[app as string]?.[table as string];
  if (typeof tableId === 'string') {
    return tableId;
  }
  return String(table);
}

export class QuickBaseClientImpl<TConfig extends QuickBaseConfig> implements QuickBaseClient<TConfig> {
  public config: TConfig
  private fetch: typeof globalThis.fetch

  constructor(config: TConfig) {
    this.config = config
    this.fetch = globalThis.fetch
  }
  
  private transformRecordFromQB<TApp extends AppName, TTable extends TableName<TApp> & string>(
    app: TApp,
    table: TTable,
    record: Record<string, { value: any }>
  ): GetTableData<TApp, TTable> {
    const transformed: Record<string, any> = {};
    const fieldMappings = this.config.mappings?.fieldMappings;
    const reverseMapping: Record<number, string> = {};

    if (fieldMappings?.[app as string]?.[table as string]) {
      for (const [name, id] of Object.entries(fieldMappings[app as string][table as string])) {
        reverseMapping[id] = name;
      }
    }

    for (const fieldId in record) {
      const numericFieldId = Number(fieldId);
      const fieldName = reverseMapping[numericFieldId];

      if (fieldName) {
        transformed[fieldName] = record[fieldId].value;
      } else {
        // Fallback for system fields or unmapped fields
        switch (numericFieldId) {
          case 1: transformed['dateCreated'] = record[fieldId].value; break;
          case 2: transformed['dateModified'] = record[fieldId].value; break;
          case 3: transformed['id'] = record[fieldId].value; break;
          case 4: transformed['recordOwner'] = record[fieldId].value; break;
          case 5: transformed['lastModifiedBy'] = record[fieldId].value; break;
          default: transformed[`field_${fieldId}`] = record[fieldId].value; break;
        }
      }
    }
    
    return transformed as GetTableData<TApp, TTable>;
  }
  
  private transformDataToQB<TApp extends AppName, TTable extends TableName<TApp> & string>(
    app: TApp,
    table: TTable,
    data: Partial<GetTableWritableData<TApp, TTable>>
  ): Record<string, { value: any }> {
    const transformed: Record<string, { value: any }> = {};
    for (const fieldName in data) {
      const value = data[fieldName as keyof typeof data];

      // The QuickBase API requires a 'value' property for all fields sent.
      // If a value is undefined, we must skip it to avoid sending an invalid empty object.
      if (value !== undefined) {
        const fieldId = getFieldId(this.config, app, table, fieldName);
        if (fieldId) {
          transformed[String(fieldId)] = { value };
        }
      }
    }
    return transformed;
  }

  /**
   * Find multiple records
   */
  async find<TApp extends AppName, TTable extends TableName<TApp> & string>(
    options: FindOptions<TApp, TTable>
  ): Promise<PaginatedDocs<GetTableData<TApp, TTable>>> {
    const { app, table, where, sort, limit = 20, page = 1, select, debug, disableErrors } = options
    
    const appConfig = this.getAppConfig(app)
    const tableId = getTableId(this.config, app, table)
    
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
    const tableId = getTableId(this.config, app, table)
    
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
    const tableId = getTableId(this.config, app, table)
    
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
    const tableId = getTableId(this.config, app, table)
    
    const transformedData = this.transformDataToQB(app, table, data)
    transformedData['3'] = { value: id }

    const body = {
      to: tableId,
      data: [transformedData],
      mergeFieldId: 3, // This tells QuickBase to update records matching field 3 (Record ID) instead of creating new ones
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
    const tableId = getTableId(this.config, app, table)
    
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
    const tableId = getTableId(this.config, app, table)
    
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
    
    return select.map(field => getFieldId(this.config, app, table, field as string)).filter(id => id > 0)
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

        const fieldId = getFieldId(this.config, app, table, field as string)
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
      startsWith: 'SW', notStartsWith: 'XSW', endsWith: 'EW', notEndsWith: 'XEW',
    }
    
    const conditions = Object.entries(condition).map(([op, value]) => {
      if (op === 'isEmpty') return `{${fieldId}.EX.''}`
      if (op === 'isNotEmpty') return `{${fieldId}.XEX.''}`
      if (op === 'in' || op === 'notIn') {
        const opStr = op === 'in' ? 'EX' : 'XEX'
        const values = (Array.isArray(value) ? value : [value]).map(v => `'${v}'`).join(';')
        return `{${fieldId}.${opStr}.${values}}`
      }
      // Handle text operators that can accept arrays
      if (op === 'contains' || op === 'notContains' || op === 'startsWith' || op === 'notStartsWith' || op === 'endsWith' || op === 'notEndsWith') {
        const qbOp = operatorMap[op as keyof typeof operatorMap]
        if (Array.isArray(value)) {
          const arrayConditions = value.map(v => `{${fieldId}.${qbOp}.'${v}'}`);
          // For "not" operators, use AND logic (must not match ANY of the values)
          // For positive operators, use OR logic (can match ANY of the values)
          const useAndLogic = op.startsWith('not');
          const joiner = useAndLogic ? ' AND ' : ' OR ';
          const combined = arrayConditions.join(joiner);
          return value.length > 1 ? `(${combined})` : combined;
        } else {
          return `{${fieldId}.${qbOp}.'${value}'}`
        }
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
      const fieldId = getFieldId(this.config, app, table, fieldName)
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