// QuickBase Delete Local Operation - Mirrors Payload's delete operation

import type { 
  QuickBaseClient, 
  DeleteOptions
} from '../../types/index.js'

import { createLocalReq } from '../../utilities/createLocalReq.js'
import { 
  makeQuickBaseRequest,
  transformWhereToQBQuery
} from '../../utilities/apiRequest.js'

/**
 * Delete documents from a QuickBase table
 * Mirrors Payload's deleteLocal operation
 */
export async function deleteLocal<
  TData extends Record<string, any> = any
>(
  quickbase: QuickBaseClient,
  options: DeleteOptions<TData>
): Promise<TData> {
  const {
    table,
    id,
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

  // Delete by ID
  if (id) {
    // First get the record to return it
    const getRequestBody: any = {
      from: table,
      where: `{3.EX.${id}}`, // Field 3 is typically the Record ID
      options: {
        top: 1,
        compareWithAppLocalTime: false
      }
    }

    try {
      // Get the record before deleting
      const getResponse = await makeQuickBaseRequest('/records/query', {
        method: 'POST',
        req,
        data: getRequestBody
      })

      const recordsToDelete = getResponse.data || []
      
      if (recordsToDelete.length === 0) {
        throw new Error(`Record with ID ${id} not found`)
      }

      const recordToDelete = recordsToDelete[0]

      // Delete the record
      const deleteRequestBody: any = {
        from: table,
        where: `{3.EX.${id}}`
      }

      await makeQuickBaseRequest('/records', {
        method: 'DELETE',
        req,
        data: deleteRequestBody
      })

      // Transform the response back to the expected format
      const result: any = {}
      
      // Convert QuickBase response format back to simple key-value pairs
      if (recordToDelete && typeof recordToDelete === 'object') {
        for (const [fieldId, fieldData] of Object.entries(recordToDelete)) {
          if (fieldData && typeof fieldData === 'object' && 'value' in fieldData) {
            result[fieldId] = (fieldData as any).value
          } else {
            result[fieldId] = fieldData
          }
        }
      }

      return result as TData

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`QuickBase delete operation failed: ${error.message}`)
      }
      throw new Error('QuickBase delete operation failed: Unknown error')
    }
  }

  // Delete by where clause
  if (where) {
    const qbQuery = transformWhereToQBQuery(where)
    
    // First get the records to return them
    const getRequestBody: any = {
      from: table,
      where: qbQuery,
      options: {
        top: 1, // Return only first record for consistency with Payload
        compareWithAppLocalTime: false
      }
    }

    try {
      // Get the records before deleting
      const getResponse = await makeQuickBaseRequest('/records/query', {
        method: 'POST',
        req,
        data: getRequestBody
      })

      const recordsToDelete = getResponse.data || []
      
      if (recordsToDelete.length === 0) {
        throw new Error('No records found matching the where clause')
      }

      const recordToDelete = recordsToDelete[0]

      // Delete the records
      const deleteRequestBody: any = {
        from: table,
        where: qbQuery
      }

      await makeQuickBaseRequest('/records', {
        method: 'DELETE',
        req,
        data: deleteRequestBody
      })

      // Transform the response back to the expected format
      const result: any = {}
      
      // Convert QuickBase response format back to simple key-value pairs
      if (recordToDelete && typeof recordToDelete === 'object') {
        for (const [fieldId, fieldData] of Object.entries(recordToDelete)) {
          if (fieldData && typeof fieldData === 'object' && 'value' in fieldData) {
            result[fieldId] = (fieldData as any).value
          } else {
            result[fieldId] = fieldData
          }
        }
      }

      return result as TData

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`QuickBase delete operation failed: ${error.message}`)
      }
      throw new Error('QuickBase delete operation failed: Unknown error')
    }
  }

  throw new Error('Delete operation requires either id or where clause')
} 