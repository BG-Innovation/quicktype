// Generated Types Integration - Maps your generated types to the client

import type { CopyOfBGSoftwareTrackingApp, SoftwareTable, EmployeesTable, ConversationsTable, ProjectsTable, ProjectdeploymentsTable } from '../../../types/generated/index.js'

// App registry - maps app names to their generated types
export interface AppRegistry {
  bg_software: CopyOfBGSoftwareTrackingApp
}

// Table registry for each app
export interface AppTableRegistry {
  bg_software: {
    software: SoftwareTable
    employees: EmployeesTable  
    conversations: ConversationsTable
    projects: ProjectsTable
    projectdeployments: ProjectdeploymentsTable
  }
}

// Extract app names from registry
export type AppName = keyof AppRegistry

// Extract table names for a specific app
export type TableName<TApp extends AppName> = keyof AppTableRegistry[TApp]

// Get table type for specific app and table
export type AppTable<TApp extends AppName, TTable extends TableName<TApp>> = AppTableRegistry[TApp][TTable]

// Extract field types from a table
export type TableFields<TTable extends { fields: any }> = TTable['fields']

// Simplified data types for operations
export type SoftwareData = {
  id?: number | string
  name?: string
  type?: 'Cloud-Based' | 'Networked'
  status?: 'Enterprise' | 'Active' | 'Pilot' | 'Tracking' | 'Closed'
  primaryuse?: string
  bgownerfullname?: string
  bgowneremail?: string
  bgownerdepartment?: string
  vendor?: string
  vendorcontactname?: string
  vendorcontactemail?: string
  website?: string
  notes?: string
  bgowner?: string
}

export type EmployeeData = {
  id?: number | string
  entraid?: string
  firstName?: string
  lastName?: string
  fullname?: string
  title?: string
  department?: string
}

export type ConversationData = {
  id?: number | string
  [key: string]: any
}

export type ProjectData = {
  id?: number | string
  [key: string]: any
}

export type ProjectDeploymentData = {
  id?: number | string
  [key: string]: any
}

// Map table names to their data types
export type TableDataMap = {
  bg_software: {
    software: SoftwareData
    employees: EmployeeData
    conversations: ConversationData
    projects: ProjectData
    projectdeployments: ProjectDeploymentData
  }
}

// Get data type for app/table combination  
export type GetTableData<TApp extends AppName, TTable extends TableName<TApp>> = 
  TApp extends 'bg_software' 
    ? TTable extends keyof TableDataMap['bg_software']
      ? TableDataMap['bg_software'][TTable]
      : Record<string, any>
    : Record<string, any>

// App configuration mapping
export const AppConfig: Record<AppName, { appId: string; name: string }> = {
  bg_software: {
    appId: 'bvba8quak',
    name: 'BG_SOFTWARE'
  }
}

// Field mappings for each app/table combination
const FieldMappings = {
  bg_software: {
    software: {
      name: 6,
      type: 7,
      status: 15,
      primaryuse: 10,
      bgownerfullname: 16,
      bgowneremail: 17,
      bgownerdepartment: 18,
      vendor: 8,
      vendorcontactname: 11,
      vendorcontactemail: 12,
      website: 14,
      notes: 13,
      bgowner: 9
    },
    employees: {
      entraid: 6,
      firstName: 7,
      lastName: 8,
      fullname: 9,
      title: 10,
      department: 11
    },
    conversations: {},
    projects: {},
    projectdeployments: {}
  }
} as const

// Table ID mappings
const TableMappings = {
  bg_software: {
    software: 'bvba8quam',
    employees: 'bvba8quan',
    conversations: 'bvba8quao',
    projects: 'bvba8quap',
    projectdeployments: 'bvba8quaq'
  }
} as const

// Field name to ID mapping utility
export function getFieldId<TApp extends AppName, TTable extends TableName<TApp>>(
  app: TApp,
  table: TTable,
  fieldName: string
): number {
  const appMappings = FieldMappings[app]
  if (appMappings) {
    const tableMappings = appMappings[table as keyof typeof appMappings]
    if (tableMappings && typeof tableMappings === 'object') {
      const fieldId = (tableMappings as Record<string, number>)[fieldName]
      if (typeof fieldId === 'number') {
        return fieldId
      }
    }
  }
  
  // Fallback - try to parse as number
  const fieldId = parseInt(fieldName)
  return isNaN(fieldId) ? 3 : fieldId // Default to record ID field
}

// Table ID mapping
export function getTableId<TApp extends AppName, TTable extends TableName<TApp>>(
  app: TApp,
  table: TTable
): string {
  if (app === 'bg_software') {
    const bgMappings = TableMappings.bg_software
    const tableId = bgMappings[table as keyof typeof bgMappings]
    if (typeof tableId === 'string') {
      return tableId
    }
  }
  
  return String(table)
} 