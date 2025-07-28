// QuickBase Create Local Operation - Mirrors Payload's create operation

import type { 
  QuickBaseClient, 
  CreateOptions
} from '../../types/index.js'

import { createLocalReq } from '../../utilities/createLocalReq.js'
import { makeQuickBaseRequest } from '../../utilities/apiRequest.js'

/**
 * Create a new document in a QuickBase table
 * Mirrors Payload's createLocal operation
 */
export async function createLocal<
  TData extends Record<string, any> = any
>(
  quickbase: QuickBaseClient,
  options: CreateOptions<TData>
): Promise<TData> {
  const {
    table,
    data,
    mergeFieldId,
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

  // Prepare the record data for QuickBase format
  const recordData: any = {}
  
  // Transform data to QuickBase field format
  for (const [key, value] of Object.entries(data)) {
    // In a real implementation, you'd map field names to field IDs
    // For now, assume the key is either a field ID or field name
    const fieldId = parseInt(key) || key
    recordData[fieldId] = { value }
  }

  // Prepare request body
  const requestBody: any = {
    to: table,
    data: [recordData],
    fieldsToReturn: [3] // Return at least the Record ID
  }

  // Add merge field for upsert operations
  if (mergeFieldId) {
    requestBody.mergeFieldId = mergeFieldId
  }

  try {
    // Make the QuickBase API request
    const response = await makeQuickBaseRequest('/records', {
      method: 'POST',
      req,
      data: requestBody
    })

    // Get the created record data
    const createdRecords = response.data || []
    
    if (createdRecords.length === 0) {
      throw new Error('No record was created')
    }

    // Return the created record
    const createdRecord = createdRecords[0]

    // Transform the response back to the expected format
    const result: any = {}
    
    // Convert QuickBase response format back to simple key-value pairs
    if (createdRecord && typeof createdRecord === 'object') {
      for (const [fieldId, fieldData] of Object.entries(createdRecord)) {
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
      throw new Error(`QuickBase create operation failed: ${error.message}`)
    }
    throw new Error('QuickBase create operation failed: Unknown error')
  }
} 