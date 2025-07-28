// QuickBase Find By ID Local Operation - Mirrors Payload's findByID operation

import type { 
  QuickBaseClient, 
  FindByIDOptions,
  TransformQuickBaseWithSelect,
  QuickBaseSelectType
} from '../../types/index.js'

import { createLocalReq } from '../../utilities/createLocalReq.js'
import { 
  makeQuickBaseRequest,
  transformSelectToQBFormat
} from '../../utilities/apiRequest.js'

/**
 * Find a document by ID in a QuickBase table
 * Mirrors Payload's findByIDLocal operation
 */
export async function findByIDLocal<
  TTable extends Record<string, any> = any,
  TSelect extends QuickBaseSelectType = never
>(
  quickbase: QuickBaseClient,
  options: FindByIDOptions<TTable, TSelect>
): Promise<TransformQuickBaseWithSelect<TTable, TSelect> | null> {
  const {
    table,
    id,
    select,
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

  // Transform select fields
  const qbSelect = transformSelectToQBFormat(select)

  // Prepare request body for finding by record ID
  const requestBody: any = {
    from: table,
    where: `{3.EX.${id}}`, // Field 3 is typically the Record ID field in QuickBase
    options: {
      top: 1,
      compareWithAppLocalTime: false
    }
  }

  // Add select if provided
  if (qbSelect && qbSelect.length > 0) {
    requestBody.select = qbSelect
  }

  try {
    // Make the QuickBase API request
    const response = await makeQuickBaseRequest('/records/query', {
      method: 'POST',
      req,
      data: requestBody
    })

    // Get the first record from the response
    const records = response.data || []
    
    if (records.length === 0) {
      return null
    }

    // Return the first (and should be only) record
    return records[0] as TransformQuickBaseWithSelect<TTable, TSelect>

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`QuickBase findByID operation failed: ${error.message}`)
    }
    throw new Error('QuickBase findByID operation failed: Unknown error')
  }
} 