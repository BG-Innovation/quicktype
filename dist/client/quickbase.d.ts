import type { QuickBaseConfig } from '../types/config';
import type { QuickBaseClient, FindOptions, FindByIDOptions, CreateOptions, UpdateOptions, DeleteOptions, CountOptions, PaginatedDocs, RecordResponse, CountResponse } from './types';
import type { AppName, TableName, GetTableData } from '../index';
export declare class QuickBaseClientImpl<TConfig extends QuickBaseConfig> implements QuickBaseClient<TConfig> {
    config: TConfig;
    private fetch;
    constructor(config: TConfig);
    private transformRecordFromQB;
    private transformDataToQB;
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
    private getAppConfig;
    private buildSelectFields;
    private buildWhereClause;
    private buildFieldCondition;
    private buildSortClause;
    private makeRequest;
}
/**
 * Create a QuickBase client instance
 * Similar to Payload's local API initialization
 */
export declare function getQuickbase<TConfig extends QuickBaseConfig>(options: {
    config: TConfig;
}): QuickBaseClient<TConfig>;
//# sourceMappingURL=quickbase.d.ts.map