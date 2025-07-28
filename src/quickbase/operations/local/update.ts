// QuickBase Update Local Operation - Mirrors Payload's update operation

import type { 
  QuickBaseClient, 
  UpdateOptions,
  TransformQuickBaseWithSelect,
  QuickBaseSelectType
} from '../../types/index.js'

import { createLocalReq } from '../../utilities/createLocalReq.js'
import { 
  makeQuickBaseRequest,
  transformWhereToQBQuery,
  transformSelectToQBFormat
} from '../../utilities/apiRequest.js'

/**
 * Update documents in a QuickBase table
 * Mirrors Payload's updateLocal operation
 */
export async function updateLocal<
  TData extends Record<string, any> = any,
  TSelect extends QuickBaseSelectType = never
>(
  quickbase: QuickBaseClient,
  options: UpdateOptions<TData, TSelect>
): Promise<TransformQuickBaseWithSelect<TData, TSelect>> {
  const {
    table,
    id,
    where,
    data,
    select,
    upsert = false,
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

  // Prepare the record data for QuickBase format
  const recordData: any = {}
  
  // Add Record ID if updating by ID
  if (id) {
    recordData['3'] = { value: id } // Field 3 is typically the Record ID
  }

  // Transform data to QuickBase field format
  for (const [key, value] of Object.entries(data)) {
    // In a real implementation, you'd map field names to field IDs
    // For now, assume the key is either a field ID or field name
    const fieldId = parseInt(key) || key
    recordData[fieldId] = { value }
  }

  // Prepare request body for updating by ID
  if (id) {
    const requestBody: any = {
      to: table,
      data: [recordData],
      fieldsToReturn: qbSelect || [3] // Return selected fields or at least Record ID
    }

    // Add upsert option if specified
    if (upsert) {
      requestBody.mergeFieldId = 3 // Use Record ID for merge
    }

    try {
      // Make the QuickBase API request
      const response = await makeQuickBaseRequest('/records', {
        method: 'POST',
        req,
        data: requestBody
      })

      // Get the updated record data
      const updatedRecords = response.data || []
      
      if (updatedRecords.length === 0) {
        throw new Error('No record was updated')
      }

      // Transform the response back to the expected format
      const updatedRecord = updatedRecords[0]
      const result: any = {}
      
      // Convert QuickBase response format back to simple key-value pairs
      if (updatedRecord && typeof updatedRecord === 'object') {
        for (const [fieldId, fieldData] of Object.entries(updatedRecord)) {
          if (fieldData && typeof fieldData === 'object' && 'value' in fieldData) {
            result[fieldId] = (fieldData as any).value
          } else {
            result[fieldId] = fieldData
          }
        }
      }

      return result as TransformQuickBaseWithSelect<TData, TSelect>

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`QuickBase update operation failed: ${error.message}`)
      }
      throw new Error('QuickBase update operation failed: Unknown error')
    }
  }

  // Update by where clause - requires finding records first
  if (where) {
    // First, find the records to update
    const qbQuery = transformWhereToQBQuery(where)
    
    const findRequestBody: any = {
      from: table,
      where: qbQuery,
      select: [3], // Get only Record IDs
      options: {
        compareWithAppLocalTime: false
      }
    }

    try {
      // Find records matching the where clause
      const findResponse = await makeQuickBaseRequest('/records/query', {
        method: 'POST',
        req,
        data: findRequestBody
      })

      const recordsToUpdate = findResponse.data || []
      
      if (recordsToUpdate.length === 0) {
        throw new Error('No records found matching the where clause')
      }

      // Prepare update data for each record
      const updateData = recordsToUpdate.map((record: any) => {
        const updateRecord = { ...recordData }
        updateRecord['3'] = { value: record['3']?.value || record['3'] } // Preserve Record ID
        return updateRecord
      })

      const updateRequestBody: any = {
        to: table,
        data: updateData,
        fieldsToReturn: qbSelect || [3]
      }

      // Make the update request
      const updateResponse = await makeQuickBaseRequest('/records', {
        method: 'POST',
        req,
        data: updateRequestBody
      })

      // Return the first updated record (matching Payload's behavior for single update)
      const updatedRecords = updateResponse.data || []
      
      if (updatedRecords.length === 0) {
        throw new Error('No records were updated')
      }

      // Transform the response back to the expected format
      const updatedRecord = updatedRecords[0]
      const result: any = {}
      
      // Convert QuickBase response format back to simple key-value pairs
      if (updatedRecord && typeof updatedRecord === 'object') {
        for (const [fieldId, fieldData] of Object.entries(updatedRecord)) {
          if (fieldData && typeof fieldData === 'object' && 'value' in fieldData) {
            result[fieldId] = (fieldData as any).value
          } else {
            result[fieldId] = fieldData
          }
        }
      }

      return result as TransformQuickBaseWithSelect<TData, TSelect>

    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`QuickBase update operation failed: ${error.message}`)
      }
      throw new Error('QuickBase update operation failed: Unknown error')
    }
  }

  throw new Error('Update operation requires either id or where clause')
} 