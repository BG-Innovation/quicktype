// QuickBase API Request Utility - Handles all API communication

import type { 
  QuickBaseRequest,
  QuickBaseResponse,
  QuickBaseWhere,
  QuickBaseSort
} from '../types/index.js'

export interface QuickBaseAPIError extends Error {
  status?: number
  code?: string
  description?: string
}

/**
 * Makes a request to the QuickBase API
 */
export async function makeQuickBaseRequest<T = any>(
  endpoint: string,
  options: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    req: QuickBaseRequest
    data?: any
    headers?: Record<string, string>
  }
): Promise<QuickBaseResponse<T>> {
  const { method, req, data, headers = {} } = options
  
  const url = `${req.baseUrl}${endpoint}`
  
  const requestHeaders: Record<string, string> = {
    'QB-Realm-Hostname': req.realm!,
    'Authorization': `QB-USER-TOKEN ${req.userToken}`,
    'QB-App-Token': req.appToken!,
    'Content-Type': 'application/json',
    ...headers
  }

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders
  }

  if (data && (method === 'POST' || method === 'PUT')) {
    requestOptions.body = JSON.stringify(data)
  }

  try {
    const response = await fetch(url, requestOptions)
    
    if (!response.ok) {
      const errorText = await response.text()
      let errorData: any = {}
      
      try {
        errorData = JSON.parse(errorText)
      } catch {
        // Error text is not JSON
      }

      const error = new Error(
        errorData.description || errorData.message || `QuickBase API Error: ${response.status}`
      ) as QuickBaseAPIError
      
      error.status = response.status
      error.code = errorData.code
      error.description = errorData.description
      
      throw error
    }

    const responseData = await response.json()
    
    return {
      data: responseData.data || responseData,
      fields: responseData.fields,
      metadata: responseData.metadata
    }
    
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`Network error: ${error}`)
  }
}

/**
 * Transforms QuickBase WHERE clause to QB query format
 */
export function transformWhereToQBQuery(where?: QuickBaseWhere): string {
  if (!where) {
    return ''
  }

  const buildCondition = (condition: QuickBaseWhere): string => {
    const conditions: string[] = []

    for (const [key, value] of Object.entries(condition)) {
      if (key === 'AND' && Array.isArray(value)) {
        const andConditions = value.map(buildCondition).filter(Boolean)
        if (andConditions.length > 0) {
          conditions.push(`(${andConditions.join(' AND ')})`)
        }
      } else if (key === 'OR' && Array.isArray(value)) {
        const orConditions = value.map(buildCondition).filter(Boolean)
        if (orConditions.length > 0) {
          conditions.push(`(${orConditions.join(' OR ')})`)
        }
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Handle operator-based conditions like { fieldId: { CT: 'value' } }
        for (const [operator, operatorValue] of Object.entries(value)) {
          if (operatorValue !== undefined) {
            conditions.push(`{${key}.${operator}.'${operatorValue}'}`)
          }
        }
      } else if (value !== undefined) {
        // Simple equality condition
        conditions.push(`{${key}.CT.'${value}'}`)
      }
    }

    return conditions.join(' AND ')
  }

  return buildCondition(where)
}

/**
 * Transforms QuickBase SORT to QB sort format
 */
export function transformSortToQBFormat(sort?: QuickBaseSort): Array<{ fieldId: number; order: 'ASC' | 'DESC' }> {
  if (!sort) {
    return []
  }

  if (typeof sort === 'string') {
    // Handle string format like '-createdAt' or 'fieldId'
    const isDesc = sort.startsWith('-')
    const fieldName = isDesc ? sort.substring(1) : sort
    
    // For string sorts, we'd need field mapping - for now assume numeric field IDs
    const fieldId = parseInt(fieldName) || 3 // Default to record ID field
    
    return [{ fieldId, order: isDesc ? 'DESC' : 'ASC' }]
  }

  if (Array.isArray(sort)) {
    return sort.map(item => ({
      fieldId: item.fieldId,
      order: item.order || 'ASC'
    }))
  }

  return []
}

/**
 * Transforms select fields to QuickBase select format
 */
export function transformSelectToQBFormat(select?: any): number[] | undefined {
  if (!select) {
    return undefined
  }

  if (Array.isArray(select)) {
    // Convert field names to field IDs (would need field mapping in real implementation)
    return select.map(field => {
      const fieldId = parseInt(field)
      return isNaN(fieldId) ? 3 : fieldId // Default to record ID if not a number
    })
  }

  if (typeof select === 'object') {
    // Extract field names that are set to true
    const selectedFields = Object.entries(select)
      .filter(([_, included]) => included === true)
      .map(([fieldName]) => {
        const fieldId = parseInt(fieldName)
        return isNaN(fieldId) ? 3 : fieldId
      })
    
    return selectedFields.length > 0 ? selectedFields : undefined
  }

  return undefined
}

/**
 * Calculate pagination info
 */
export function calculatePagination(
  page: number = 1,
  limit: number = 10,
  totalRecords: number = 0
) {
  const totalPages = Math.ceil(totalRecords / limit)
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  return {
    totalPages,
    hasNextPage,
    hasPrevPage,
    nextPage: hasNextPage ? page + 1 : null,
    prevPage: hasPrevPage ? page - 1 : null
  }
} 