import type { QuickBaseConfig } from '../types/config';
import type { AppName, TableName, GetTableData, GetTableWritableData } from '../index';
export interface BaseOptions {
    /**
     * When set to `true`, errors will not be thrown.
     */
    disableErrors?: boolean;
    /**
     * Enable request logging for this operation
     */
    debug?: boolean;
}
export interface Where {
    [fieldId: string]: any | WhereCondition;
    and?: Where[];
    or?: Where[];
}
export interface WhereCondition {
    equals?: any;
    notEquals?: any;
    greaterThan?: number;
    lessThan?: number;
    greaterThanOrEqual?: number;
    lessThanOrEqual?: number;
    contains?: string | string[];
    notContains?: string | string[];
    startsWith?: string | string[];
    notStartsWith?: string | string[];
    endsWith?: string | string[];
    notEndsWith?: string | string[];
    isEmpty?: boolean;
    isNotEmpty?: boolean;
    in?: any[];
    notIn?: any[];
}
export type Sort = string | string[];
export type WhereWithFieldNames<TApp extends AppName, TTable extends TableName<TApp>> = {
    [K in keyof GetTableData<TApp, TTable>]?: GetTableData<TApp, TTable>[K] | WhereCondition;
} & {
    and?: WhereWithFieldNames<TApp, TTable>[];
    or?: WhereWithFieldNames<TApp, TTable>[];
};
export type SortWithFieldNames<TApp extends AppName, TTable extends TableName<TApp>> = keyof GetTableData<TApp, TTable> | string | Array<keyof GetTableData<TApp, TTable> | string>;
export interface FindOptions<TApp extends AppName, TTable extends TableName<TApp>> extends BaseOptions {
    /**
     * The app slug to query (type-safe)
     */
    app: TApp;
    /**
     * The table identifier to query (type-safe)
     */
    table: TTable;
    /**
     * Filter conditions using field names
     */
    where?: WhereWithFieldNames<TApp, TTable>;
    /**
     * Sort order using field names
     */
    sort?: SortWithFieldNames<TApp, TTable>;
    /**
     * Maximum number of records to return
     * @default 20
     */
    limit?: number;
    /**
     * Page number for pagination
     * @default 1
     */
    page?: number;
    /**
     * Specific fields to select (type-safe field names)
     */
    select?: Array<keyof GetTableData<TApp, TTable>>;
}
export interface FindByIDOptions<TApp extends AppName, TTable extends TableName<TApp> & string> extends BaseOptions {
    /**
     * The app slug to query (type-safe)
     */
    app: TApp;
    /**
     * The table identifier to query (type-safe)
     */
    table: TTable;
    /**
     * The record ID to find
     */
    id: number | string;
    /**
     * Specific fields to select (type-safe field names)
     */
    select?: Array<keyof GetTableData<TApp, TTable>>;
}
export interface CreateOptions<TApp extends AppName, TTable extends TableName<TApp> & string> extends BaseOptions {
    /**
     * The app slug to create in (type-safe)
     */
    app: TApp;
    /**
     * The table identifier to create in (type-safe)
     */
    table: TTable;
    /**
     * The data to create (type-safe)
     */
    data: Partial<GetTableWritableData<TApp, TTable>>;
    /**
     * Specific fields to return (type-safe field names)
     */
    select?: Array<keyof GetTableData<TApp, TTable>>;
}
export interface UpdateOptions<TApp extends AppName, TTable extends TableName<TApp> & string> extends BaseOptions {
    /**
     * The app slug to update in (type-safe)
     */
    app: TApp;
    /**
     * The table identifier to update in (type-safe)
     */
    table: TTable;
    /**
     * The record ID to update
     */
    id: number | string;
    /**
     * The data to update (type-safe)
     */
    data: Partial<GetTableWritableData<TApp, TTable>>;
    /**
     * Specific fields to return (type-safe field names)
     */
    select?: Array<keyof GetTableData<TApp, TTable>>;
}
export interface DeleteOptions<TApp extends AppName, TTable extends TableName<TApp> & string> extends BaseOptions {
    /**
     * The app slug to delete from (type-safe)
     */
    app: TApp;
    /**
     * The table identifier to delete from (type-safe)
     */
    table: TTable;
    /**
     * The record ID to delete
     */
    id: number | string;
}
export interface CountOptions<TApp extends AppName, TTable extends TableName<TApp> & string> extends BaseOptions {
    /**
     * The app slug to count in (type-safe)
     */
    app: TApp;
    /**
     * The table identifier to count in (type-safe)
     */
    table: TTable;
    /**
     * Filter conditions using field names
     */
    where?: WhereWithFieldNames<TApp, TTable>;
}
export interface PaginatedDocs<T = any> {
    docs: T[];
    totalDocs: number;
    limit: number;
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
}
export interface RecordResponse<T = any> {
    data: T;
    metadata?: {
        recordId: number;
        dateCreated?: string;
        dateModified?: string;
    };
}
export interface BulkOperationResult<T = any> {
    docs: T[];
    errors?: Array<{
        id: number | string;
        error: string;
    }>;
}
export interface CountResponse {
    totalDocs: number;
}
export interface QuickBaseClient<TConfig extends QuickBaseConfig> {
    config: TConfig;
    /**
     * Find multiple records
     */
    find<TApp extends AppName, TTable extends TableName<TApp> & string>(options: FindOptions<TApp, TTable>): Promise<PaginatedDocs<GetTableData<TApp, TTable>>>;
    /**
     * Find a single record by ID
     */
    findByID<TApp extends AppName, TTable extends TableName<TApp> & string>(options: FindByIDOptions<TApp, TTable>): Promise<RecordResponse<GetTableData<TApp, TTable>>>;
    /**
     * Create a new record
     */
    create<TApp extends AppName, TTable extends TableName<TApp> & string>(options: CreateOptions<TApp, TTable>): Promise<RecordResponse<GetTableData<TApp, TTable>>>;
    /**
     * Update an existing record
     */
    update<TApp extends AppName, TTable extends TableName<TApp> & string>(options: UpdateOptions<TApp, TTable>): Promise<RecordResponse<GetTableData<TApp, TTable>>>;
    /**
     * Delete a record
     */
    delete<TApp extends AppName, TTable extends TableName<TApp> & string>(options: DeleteOptions<TApp, TTable>): Promise<{
        id: number | string;
    }>;
    /**
     * Count records matching criteria
     */
    count<TApp extends AppName, TTable extends TableName<TApp> & string>(options: CountOptions<TApp, TTable>): Promise<CountResponse>;
}
//# sourceMappingURL=types.d.ts.map