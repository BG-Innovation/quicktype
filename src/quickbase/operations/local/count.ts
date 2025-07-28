// QuickBase Count Local Operation - Mirrors Payload's count operation

import type { 
  QuickBaseClient, 
  CountOptions
} from '../../types/index.js'

import { createLocalReq } from '../../utilities/createLocalReq.js'
import { 
  makeQuickBaseRequest,
  transformWhereToQBQuery
} from '../../utilities/apiRequest.js'

/**
 * Count documents in a QuickBase table
 * Mirrors Payload's countLocal operation
 */
export async function countLocal(
  quickbase: QuickBaseClient,
  options: CountOptions
): Promise<{ totalDocs: number }> {
  const {
    table,
    where,
    appId,
    context,
    req: providedReq,
    user,
    overrideAccess = true
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

  // Prepare request body for counting records
  const requestBody: any = {
    from: table,
    select: [3], // Only select Record ID field for counting
    options: {
      compareWithAppLocalTime: false
    }
  }

  // Add query if provided
  if (qbQuery) {
    requestBody.where = qbQuery
  }

  try {
    // Make the QuickBase API request
    const response = await makeQuickBaseRequest('/records/query', {
      method: 'POST',
      req,
      data: requestBody
    })

    // Get the total count from metadata or count the returned records
    const totalDocs = response.metadata?.totalRecords || response.data?.length || 0

    return { totalDocs }

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`QuickBase count operation failed: ${error.message}`)
    }
    throw new Error('QuickBase count operation failed: Unknown error')
  }
} 