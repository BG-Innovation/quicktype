// Example: How to use QuickTypes in a consuming project
// This shows the workflow for generating types and using the client

import { buildConfig, getQuickbase, buildTypes } from './src'

// Step 1: Create your QuickBase configuration
export const config = buildConfig({
  realm: 'your-realm.quickbase.com',
  userToken: process.env.QB_USER_TOKEN!,
  baseUrl: 'https://api.quickbase.com/v1',
  apps: [
    {
      name: 'BgSoftware',
      appId: 'bvba8quak',
      appToken: process.env.QB_APP_TOKEN_BGSOFTWARE!,
      description: 'BG Software Tracking Application'
    }
  ]
})

// Step 2: Generate types (typically run as a script)
async function generateTypes() {
  // This would be run via `pnpm generate` or similar
  await buildTypes()
  console.log('Types generated! Now you can use type-safe operations.')
}

// Step 3: In your consuming project, augment the types after generation
// This would go in a separate type augmentation file:
/*
import type { 
  AppRegistry, 
  AppTableRegistry, 
  TableDataMap, 
  FieldMappings, 
  TableMappings 
} from './types/generated/client-mappings'

declare module 'quicktypes/client/types' {
  interface GeneratedTypes {
    AppRegistry: AppRegistry
    AppTableRegistry: AppTableRegistry
    TableDataMap: TableDataMap
    FieldMappings: FieldMappings
    TableMappings: TableMappings
  }
}
*/

// Step 4: Use the client with full type safety
async function useTypeSafeClient() {
  const quickbase = getQuickbase({ config })

  // Now you get full type safety on app names, table names, and field names!
  const employees = await quickbase.find({
    app: 'BgSoftware', // Type-safe app name
    table: 'employees', // Type-safe table name  
    where: {
      firstName: { contains: 'John' }, // Type-safe field names
      department: { equals: 'Engineering' }
    },
    select: ['firstName', 'lastName', 'email'], // Type-safe field selection
    sort: ['lastName', '-firstName']
  })

  console.log('Found employees:', employees.docs)

  // Create with type safety
  const newEmployee = await quickbase.create({
    app: 'BgSoftware',
    table: 'employees', 
    data: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@company.com',
      department: 'Engineering'
    }
  })

  console.log('Created:', newEmployee.data)
}

// Fallback behavior when types aren't generated yet
async function useWithoutGeneratedTypes() {
  const quickbase = getQuickbase({ config })

  // Still works, but with string-based field names (less type safety)
  const results = await quickbase.find({
    app: 'BgSoftware' as any, // You'd cast to any temporarily
    table: 'employees' as any,
    where: {
      'firstName': { contains: 'John' }, // String field names
    }
  })

  console.log('Results without generated types:', results.docs)
}

export {
  generateTypes,
  useTypeSafeClient,
  useWithoutGeneratedTypes
}

// Example package.json scripts for a consuming project:
/*
{
  "scripts": {
    "generate": "tsx node_modules/quicktypes/scripts/generate.ts",
    "generate:types": "npm run generate",
    "dev": "npm run generate && tsx src/index.ts"
  }
}
*/ 