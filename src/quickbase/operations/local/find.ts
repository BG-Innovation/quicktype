// QuickBase Find Local Operation - Mirrors Payload's find operation

import type { 
  QuickBaseClient, 
  FindOptions,
  PaginatedQuickBaseDocs,
  TransformQuickBaseWithSelect,
  QuickBaseSelectType
} from '../../types/index.js'

import { createLocalReq } from '../../utilities/createLocalReq.js'
import { 
  makeQuickBaseRequest,
  transformWhereToQBQuery,
  transformSortToQBFormat,
  transformSelectToQBFormat,
  calculatePagination
} from '../../utilities/apiRequest.js'

/**
 * Find documents in a QuickBase table
 * Mirrors Payload's findLocal operation
 */
export async function findLocal<
  TTable extends Record<string, any> = any,
  TSelect extends QuickBaseSelectType = never
>(
  quickbase: QuickBaseClient,
  options: FindOptions<TTable, TSelect>
): Promise<PaginatedQuickBaseDocs<TransformQuickBaseWithSelect<TTable, TSelect>>> {
  const {
    table,
    where,
    sort,
    limit = 25,
    page = 1,
    select,
    appId,
    context,
    req: providedReq,
    user,
    overrideAccess = true,
    options: qbOptions
  } = options

  // Create local request context
  const req = await createLocalReq({
    context,
    req: providedReq,
    user,
    appId: appId || providedReq?.appId
  }, quickbase.config)

  // Build QuickBase query
  const qbQuery = transformWhereToQBQuery(where)
  const qbSort = transformSortToQBFormat(sort)
  const qbSelect = transformSelectToQBFormat(select)

  // Calculate skip value for pagination
  const skip = (page - 1) * limit

  // Prepare request body
  const requestBody: any = {
    from: table,
    options: {
      skip,
      top: limit,
      compareWithAppLocalTime: false
    }
  }

  // Add query if provided
  if (qbQuery) {
    requestBody.where = qbQuery
  }

  // Add sort if provided
  if (qbSort.length > 0) {
    requestBody.sortBy = qbSort
  }

  // Add select if provided
  if (qbSelect && qbSelect.length > 0) {
    requestBody.select = qbSelect
  }

  // Add custom options if provided
  if (qbOptions) {
    // qbOptions is a string in QuickBase API
    requestBody.options.qbOptions = qbOptions
  }

  try {
    // Make the QuickBase API request
    const response = await makeQuickBaseRequest('/records/query', {
      method: 'POST',
      req,
      data: requestBody
    })

    // Transform response data
    const docs = response.data || []
    const totalRecords = response.metadata?.totalRecords || docs.length

    // Calculate pagination info
    const paginationInfo = calculatePagination(page, limit, totalRecords)

    // Return paginated result in Payload format
    return {
      docs: docs as TransformQuickBaseWithSelect<TTable, TSelect>[],
      totalDocs: totalRecords,
      limit,
      totalPages: paginationInfo.totalPages,
      page,
      pagingInfo: paginationInfo
    }

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`QuickBase find operation failed: ${error.message}`)
    }
    throw new Error('QuickBase find operation failed: Unknown error')
  }
} 