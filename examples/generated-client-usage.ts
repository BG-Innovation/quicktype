// Generated QuickBase Client Usage Example
// This demonstrates the clean, strongly-typed interface you requested

import { createQuickBaseClient } from '../types/generated/client.js'
import type { 
  AppName, 
  TableName,
  SoftwareData,
  EmployeesData 
} from '../types/generated/client-mappings.js'

// Simple configuration - just the secrets needed to connect
const quickbase = createQuickBaseClient({
  userToken: process.env.QUICKBASE_USER_TOKEN!,
  realm: process.env.QUICKBASE_REALM!,
  baseUrl: 'https://api.quickbase.com/v1' // optional
})

async function demonstrateGeneratedClient() {
  console.log('🚀 Generated QuickBase Client Demo\n')

  try {
    // === STRONGLY TYPED OPERATIONS ===
    
    // Find with full type safety - exactly the interface you wanted!
    const activeSoftware = await quickbase.find({
      app: 'bg_software', // ✅ Type-safe app names
      table: 'software',  // ✅ Type-safe table names for this app
      where: {
        status: { CT: 'Active' }, // ✅ Type-safe field names and values
        type: { CT: 'Cloud-Based' } // ✅ Choices are properly typed
      },
      sort: [{ field: 'name', order: 'ASC' }], // ✅ Sort by typed field names
      limit: 10,
      select: { // ✅ Only valid fields can be selected
        name: true,
        status: true,
        vendor: true,
        bgowneremail: true
      }
    })

    console.log(`Found ${activeSoftware.totalDocs} active software items`)
    console.log('First item:', activeSoftware.docs[0]) // ✅ Properly typed result

    // Find employees with complex query
    const engineeringEmployees = await quickbase.find({
      app: 'bg_software',
      table: 'employees', 
      where: {
        AND: [
          { department: { CT: 'Engineering' } },
          { firstName: { SW: 'J' } } // Starts with 'J'
        ]
      },
      sort: [{ field: 'lastName', order: 'ASC' }]
    })

    console.log(`\nFound ${engineeringEmployees.totalDocs} engineering employees`)

    // Find by ID with type safety
    const specificSoftware = await quickbase.findByID({
      app: 'bg_software',
      table: 'software',
      id: 123,
      select: {
        name: true,
        vendor: true,
        status: true,
        notes: true
      }
    })

    if (specificSoftware) {
      console.log(`\nFound software: ${specificSoftware.name} by ${specificSoftware.vendor}`)
    }

    // Create with full type checking
    const newSoftware = await quickbase.create({
      app: 'bg_software',
      table: 'software',
      data: {
        name: 'New Analytics Platform',
        type: 'Cloud-Based', // ✅ Only valid choices allowed
        status: 'Pilot',     // ✅ Only valid choices allowed  
        vendor: 'DataCorp',
        primaryuse: 'Business Intelligence',
        bgownerfullname: 'John Smith',
        bgowneremail: 'john.smith@company.com'
      }
    })

    console.log(`\nCreated software with ID: ${newSoftware.id}`)

    // Update with type safety
    const updatedSoftware = await quickbase.update({
      app: 'bg_software',
      table: 'software',
      id: newSoftware.id,
      data: {
        status: 'Active', // ✅ Type-checked status values
        notes: 'Successfully deployed and tested'
      },
      select: {
        name: true,
        status: true,
        notes: true
      }
    })

    console.log(`\nUpdated ${updatedSoftware.name} to ${updatedSoftware.status}`)

    // Create employee record
    const newEmployee = await quickbase.create({
      app: 'bg_software',
      table: 'employees',
      data: {
        entraid: 'jdoe@company.com',
        firstName: 'Jane',
        lastName: 'Doe', 
        title: 'Software Engineer',
        department: 'Engineering'
      }
    })

    console.log(`\nCreated employee: ${newEmployee.firstName} ${newEmployee.lastName}`)

    // Bulk operations with pagination
    let page = 1
    let allSoftware: SoftwareData[] = []
    
    while (true) {
      const result = await quickbase.find({
        app: 'bg_software',
        table: 'software',
        limit: 25,
        page,
        sort: [{ field: 'name', order: 'ASC' }]
      })
      
      allSoftware.push(...result.docs)
      
      if (!result.pagingInfo.hasNextPage) break
      page++
    }

    console.log(`\nLoaded all ${allSoftware.length} software records`)

    // Count records
    const softwareCount = await quickbase.count({
      app: 'bg_software', 
      table: 'software',
      where: {
        status: { CT: 'Active' }
      }
    })

    console.log(`\nActive software count: ${softwareCount.totalDocs}`)

    // Advanced querying
    const complexQuery = await quickbase.find({
      app: 'bg_software',
      table: 'software',
      where: {
        OR: [
          {
            AND: [
              { status: { CT: 'Active' } },
              { type: { CT: 'Cloud-Based' } }
            ]
          },
          {
            AND: [
              { status: { CT: 'Enterprise' } },
              { vendor: { IR: 'Microsoft' } } // Contains 'Microsoft'
            ]
          }
        ]
      },
      sort: [
        { field: 'status', order: 'ASC' },
        { field: 'name', order: 'ASC' }
      ],
      select: {
        name: true,
        vendor: true,
        status: true,
        type: true
      }
    })

    console.log(`\nComplex query found ${complexQuery.totalDocs} results`)

    // Clean up test data
    await quickbase.delete({
      app: 'bg_software',
      table: 'software', 
      id: newSoftware.id
    })

    await quickbase.delete({
      app: 'bg_software',
      table: 'employees',
      id: newEmployee.id
    })

    console.log('\n✅ Generated client demo completed successfully!')

  } catch (error) {
    console.error('❌ Error occurred:', error)
  }
}

// === TYPE SAFETY DEMONSTRATIONS ===

// This function shows the compile-time type safety
function demonstrateTypeSafety() {
  // ✅ These will have full autocomplete and type checking:
  
  const validQuery = {
    app: 'bg_software' as const,
    table: 'software' as const,
    where: {
      name: { CT: 'test' },        // ✅ Valid field
      status: { CT: 'Active' },    // ✅ Valid field with valid choice
      vendor: { SW: 'Microsoft' }  // ✅ Valid field with valid operator
    },
    select: {
      name: true,      // ✅ Valid field
      status: true,    // ✅ Valid field  
      vendor: true     // ✅ Valid field
    }
  }

  // ❌ These would cause TypeScript errors:
  
  /*
  const invalidQueries = {
    // ❌ Invalid app name
    invalidApp: {
      app: 'nonexistent_app',
      table: 'software'
    },
    
    // ❌ Invalid table name for this app
    invalidTable: {
      app: 'bg_software',
      table: 'nonexistent_table'
    },
    
    // ❌ Invalid field name
    invalidField: {
      app: 'bg_software',
      table: 'software',
      where: {
        nonexistent_field: { CT: 'value' }
      }
    },
    
    // ❌ Invalid choice value
    invalidChoice: {
      app: 'bg_software', 
      table: 'software',
      where: {
        status: { CT: 'InvalidStatus' }
      }
    },
    
    // ❌ Invalid select field
    invalidSelect: {
      app: 'bg_software',
      table: 'software', 
      select: {
        nonexistent_field: true
      }
    }
  }
  */
}

// === USAGE PATTERNS ===

export const typedUsagePatterns = {
  // Search across multiple fields with type safety
  async searchSoftware(searchTerm: string) {
    return quickbase.find({
      app: 'bg_software',
      table: 'software',
      where: {
        OR: [
          { name: { IR: searchTerm } },
          { vendor: { IR: searchTerm } },
          { notes: { IR: searchTerm } }
        ]
      },
      limit: 50
    })
  },

  // Get software by owner with type safety
  async getSoftwareByOwner(ownerEmail: string) {
    return quickbase.find({
      app: 'bg_software', 
      table: 'software',
      where: {
        bgowneremail: { CT: ownerEmail }
      },
      sort: [{ field: 'name', order: 'ASC' }]
    })
  },

  // Type-safe batch operations
  async createMultipleSoftware(softwareList: Partial<SoftwareData>[]) {
    const results: Array<{ success: boolean; data?: SoftwareData; error?: string }> = []
    
    for (const software of softwareList) {
      try {
        const created = await quickbase.create({
          app: 'bg_software',
          table: 'software',
          data: software // ✅ Fully type-checked
        })
        results.push({ success: true, data: created })
      } catch (error) {
        results.push({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    return results
  },

  // Type-safe reporting
  async getSoftwareReport() {
    const [active, pilot, enterprise] = await Promise.all([
      quickbase.count({
        app: 'bg_software',
        table: 'software', 
        where: { status: { CT: 'Active' } }
      }),
      quickbase.count({
        app: 'bg_software',
        table: 'software',
        where: { status: { CT: 'Pilot' } }
      }),
      quickbase.count({
        app: 'bg_software',
        table: 'software',
        where: { status: { CT: 'Enterprise' } }
      })
    ])

    return {
      active: active.totalDocs,
      pilot: pilot.totalDocs, 
      enterprise: enterprise.totalDocs,
      total: active.totalDocs + pilot.totalDocs + enterprise.totalDocs
    }
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  demonstrateGeneratedClient()
}

export default demonstrateGeneratedClient 