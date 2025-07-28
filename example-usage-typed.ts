// Type-Safe QuickBase Local API Example
// This demonstrates the full type safety with generated types

import { getQuickbase } from './src'
import config from './quickbase.config'

// Import the generated types for full type safety
import type { AppName, TableName } from './types/generated/client-mappings'

async function typeSafeExample() {
  // Initialize the QuickBase client with your config
  const quickbase = getQuickbase({ config })

  console.log('QuickBase client initialized with type-safe operations')
  console.log('Available apps:', ['bg_software'] as AppName[])

  try {
    // Example 1: Type-safe app and table selection
    console.log('\n--- Type-Safe Find Example ---')
    
    // The app parameter will only accept valid app names from your config
    // The table parameter will only accept valid table names for that app
    // TypeScript will show autocomplete for: 'software', 'employees', 'conversations', 'projects', 'projectdeployments'
    
    const software = await quickbase.find({
      app: 'bg_software', // ✅ Type-safe: only valid app names
      table: 'software',  // ✅ Type-safe: only valid table names for bg_software app
      where: {
        // ✅ Type-safe field names with autocomplete
        name: { contains: 'adobe' },
        status: { equals: 'Active' }, // ✅ Type-safe: will suggest actual choice values
        type: { equals: 'Cloud-Based' }, // ✅ Type-safe: enum values from QuickBase
      },
      sort: ['name', '-status'], // ✅ Type-safe field names
      limit: 5,
    })
    
    console.log(`Found ${software.totalDocs} software records`)
    console.log('First software:', software.docs[0])

    // Example 2: Type-safe field selection
    console.log('\n--- Type-Safe Field Selection ---')
    
    const employees = await quickbase.find({
      app: 'bg_software',
      table: 'employees',
      select: ['firstName', 'lastName', 'email', 'department'], // ✅ Autocomplete available
      where: {
        department: { contains: 'Engineering' }
      },
      limit: 10,
    })
    
    console.log(`Found ${employees.totalDocs} employees`)
    
    // ✅ Return type is strongly typed based on selected fields
    employees.docs.forEach(emp => {
      console.log(`${emp.firstName} ${emp.lastName} - ${emp.email}`)
    })

    // Example 3: Type-safe create with validated data
    console.log('\n--- Type-Safe Create Example ---')
    
    const newSoftware = await quickbase.create({
      app: 'bg_software',
      table: 'software',
      data: {
        // ✅ TypeScript will validate field names and types
        name: 'New Software Tool',
        type: 'Cloud-Based', // ✅ Only accepts valid choice values
        status: 'Pilot',     // ✅ Only accepts valid choice values  
        vendor: 'ACME Corp',
        primaryuse: 'Development',
        // TypeScript will catch typos in field names!
      }
    })
    
    console.log('Created software:', newSoftware.data.name)

    // Example 4: Complex type-safe queries
    console.log('\n--- Complex Type-Safe Query ---')
    
    const complexQuery = await quickbase.find({
      app: 'bg_software',
      table: 'projects',
      where: {
        // ✅ All field names are type-safe with autocomplete
        projectName: { contains: 'web' },
        country: { equals: 'United States' }, // ✅ Type-safe country choices
        and: [
          { stateregion: { notEquals: 'California' } },
          { city: { isNotEmpty: true } }
        ],
        or: [
          { divisionname: { equals: 'Technology' } },
          { marketsectorname: { equals: 'Software' } }
        ]
      },
      sort: ['projectName', '-country'],
      limit: 20
    })
    
    console.log(`Found ${complexQuery.totalDocs} matching projects`)

    // Example 5: Type-safe updates
    console.log('\n--- Type-Safe Update Example ---')
    
    if (newSoftware.metadata?.recordId) {
      const updatedSoftware = await quickbase.update({
        app: 'bg_software',
        table: 'software',
        id: newSoftware.metadata.recordId,
        data: {
          status: 'Active', // ✅ Type-safe status choices
          notes: 'Updated via type-safe API'
        }
      })
      
      console.log('Updated software status:', updatedSoftware.data.status)
    }

    // Example 6: Working with specific table types
    console.log('\n--- Working with Specific Table Types ---')
    
    // You can also work with specific table types
    type SoftwareTable = TableName<'bg_software'> & 'software'
    type EmployeesTable = TableName<'bg_software'> & 'employees'
    
    const specificSoftwareQuery = await quickbase.count({
      app: 'bg_software',
      table: 'software' as SoftwareTable,
      where: {
        status: { equals: 'Active' }
      }
    })
    
    console.log(`Active software count: ${specificSoftwareQuery.totalDocs}`)

    console.log('\n✅ All operations completed with full type safety!')
    
  } catch (error) {
    console.error('Error in type-safe operations:', error)
    
    // Show what kind of errors TypeScript prevents:
    console.log('\n--- TypeScript prevents these errors at compile time: ---')
    console.log('❌ quickbase.find({ app: "invalid_app" })        // Invalid app name')
    console.log('❌ quickbase.find({ app: "bg_software", table: "invalid_table" }) // Invalid table')
    console.log('❌ where: { invalidField: "value" }             // Invalid field name')
    console.log('❌ data: { status: "InvalidStatus" }            // Invalid choice value')
    console.log('❌ select: ["nonExistentField"]                 // Invalid field in select')
  }
}

// Demonstration of what TypeScript autocomplete shows
function autocompleteDemo() {
  console.log('\n--- TypeScript Autocomplete Demonstrations ---')
  
  // When you type this in your IDE:
  // quickbase.find({ app: '|' })
  // TypeScript will show: 'bg_software'
  
  // When you type this in your IDE:
  // quickbase.find({ app: 'bg_software', table: '|' })
  // TypeScript will show: 'software' | 'employees' | 'conversations' | 'projects' | 'projectdeployments'
  
  // When you type this in your IDE:
  // quickbase.find({ app: 'bg_software', table: 'software', where: { |
  // TypeScript will show all available field names: name, type, status, vendor, etc.
  
  // When you type this in your IDE:
  // quickbase.find({ app: 'bg_software', table: 'software', where: { status: '|'
  // TypeScript will show: 'Enterprise' | 'Active' | 'Pilot' | 'Tracking' | 'Closed'
  
  console.log('🎯 Full IntelliSense support for all apps, tables, fields, and choice values!')
}

// Run the type-safe example
if (require.main === module) {
  typeSafeExample()
    .then(() => autocompleteDemo())
    .catch(console.error)
}

export { typeSafeExample, autocompleteDemo } 