// Example: How to use QuickBase Local API in a consuming codebase
// This demonstrates the new flow where types are generated in the consumer

// Note: This example shows usage in a consuming codebase where 'quicktype' would be installed
// import { getQuickbase, buildConfig } from 'quicktype'
import { getQuickbase, buildConfig } from './src/index' // Using local import for this example

// After running `pnpm generate`, this file will be created in your project root:
// - quickbase-types.ts (with types, mappings, and module declaration)

// Step 1: Create your QuickBase configuration
const config = buildConfig({
  realm: 'your-realm.quickbase.com',
  userToken: process.env.QB_USER_TOKEN!,
  baseUrl: 'https://api.quickbase.com/v1',
  apps: [
    {
      name: 'BgSoftware',
      appId: 'bvba8quak',
      appToken: process.env.BG_SOFTWARE_TOKEN!,
      description: 'BG Software Tracking App'
    }
  ]
})

async function main() {
  // Step 2: Initialize the QuickBase client
  const quickbase = getQuickbase({ config })
  
  console.log('QuickBase client initialized')

  try {
    // Step 3: Use the client with full type safety
    // After running `pnpm generate`, TypeScript will know:
    // - 'BgSoftware' is a valid app name
    // - 'software' is a valid table name for BgSoftware
    // - All field names and their types
    
    const software = await quickbase.find({
      app: 'BgSoftware',     // ✅ TypeScript autocomplete available
      table: ''
    })
    
    console.log(`Found ${software.totalDocs} software records`)
    
    // The return type is fully typed based on your QuickBase schema
    software.docs.forEach((doc: any) => {
      console.log(`Software: ${doc.name} by ${doc.vendor}`) // ✅ Typed properties (after generation)
    })

    // Create with type safety
    const newSoftware = await quickbase.create({
      app: 'BgSoftware',
      table: 'software',
      data: {
        name: 'New Software',
        vendor: 'Acme Corp',
        type: 'Cloud-Based',     // ✅ TypeScript validates against choices
        status: 'Pilot'          // ✅ TypeScript validates against choices
      }
    })
    
    console.log('Created software:', newSoftware.data.name)

    // Update with type safety
    await quickbase.update({
      app: 'BgSoftware',
      table: 'software',
      id: newSoftware.metadata?.recordId!,
      data: {
        status: 'Active'  // ✅ TypeScript knows valid status values
      }
    })

    // Complex queries with type safety
    const employees = await quickbase.find({
      app: 'BgSoftware',
      table: 'employees',
      where: {
        or: [
          { department: { equals: 'Engineering' } },
          { department: { equals: 'Sales' } }
        ],
        and: [
          { email: { isNotEmpty: true } }
        ]
      },
      sort: ['lastName', 'firstName'],
      limit: 50
    })

    console.log(`Found ${employees.totalDocs} employees`)

  } catch (error) {
    console.error('Error:', error)
  }
}

// Step 4: Without generated types, the system still works but with less type safety
// If you haven't run `pnpm generate` yet, the client will:
// - Use fallback field mappings (field IDs default to 3 for record ID)
// - Log a debug message suggesting to run `pnpm generate`
// - Still provide basic functionality but without field name validation

// To get full type safety:
// 1. Run `pnpm generate` in your project
// 2. This creates quickbase-types.ts in your project root with types and mappings
// 3. The module declaration extends the base GeneratedTypes
// 4. TypeScript now provides full autocomplete and validation

if (require.main === module) {
  main().catch(console.error)
}

export { main } 