// QuickBase Local API - Basic Usage Example
// This example demonstrates how to use the QuickBase wrapper with Payload-like syntax

import { createQuickBaseClient } from '../src/quickbase/index.js'
import type { QuickBaseConfig } from '../src/quickbase/types/index.js'

// Example configuration
const config: QuickBaseConfig = {
  apps: [
    {
      name: "BG_SOFTWARE",
      appId: "your-app-id",
      appToken: "your-app-token",
      description: "Background Software Management"
    }
  ],
  global: {
    userToken: "your-user-token",
    realm: "your-realm.quickbase.com",
    baseUrl: "https://api.quickbase.com/v1"
  }
}

async function demonstrateQuickBaseAPI() {
  // Create the QuickBase client
  const quickbase = createQuickBaseClient(config)

  console.log('🚀 QuickBase Local API Demo\n')

  try {
    // === FIND OPERATIONS ===
    console.log('📋 Finding users...')
    
    // Find all active users
    const activeUsers = await quickbase.find({
      table: 'users',
      where: {
        status: { CT: 'active' }
      },
      limit: 10,
      page: 1
    })
    
    console.log(`Found ${activeUsers.totalDocs} active users`)
    console.log(`Page ${activeUsers.page} of ${activeUsers.totalPages}`)

    // Find with complex query
    const engineeringUsers = await quickbase.find({
      table: 'users',
      where: {
        AND: [
          { status: { CT: 'active' } },
          { department: { CT: 'Engineering' } },
          { lastLogin: { AF: '2024-01-01' } }
        ]
      },
      sort: [{ fieldId: 5, order: 'DESC' }], // Sort by last login
      select: { name: true, email: true, department: true }
    })

    console.log(`Found ${engineeringUsers.totalDocs} active engineering users`)

    // === FIND BY ID ===
    console.log('\n🔍 Finding user by ID...')
    
    const specificUser = await quickbase.findByID({
      table: 'users',
      id: 123,
      select: { name: true, email: true, status: true }
    })

    if (specificUser) {
      console.log(`Found user: ${(specificUser as any).name} (${(specificUser as any).email})`)
    } else {
      console.log('User not found')
    }

    // === CREATE OPERATIONS ===
    console.log('\n➕ Creating new user...')
    
    const newUser = await quickbase.create({
      table: 'users',
      data: {
        name: 'John Doe',
        email: 'john.doe@company.com',
        department: 'Engineering',
        status: 'active',
        startDate: new Date().toISOString().split('T')[0]
      }
    })

    console.log(`Created user with ID: ${(newUser as any).id}`)

    // Create with upsert (merge on email)
    const upsertedUser = await quickbase.create({
      table: 'users',
      data: {
        email: 'jane.smith@company.com',
        name: 'Jane Smith',
        department: 'Marketing',
        status: 'active'
      },
      mergeFieldId: 7 // Assuming field 7 is email
    })

    console.log(`Upserted user: ${(upsertedUser as any).name}`)

    // === UPDATE OPERATIONS ===
    console.log('\n✏️ Updating users...')
    
    // Update by ID
    const updatedUser = await quickbase.update({
      table: 'users',
      id: (newUser as any).id,
      data: {
        status: 'pending_approval',
        lastUpdated: new Date().toISOString()
      },
      select: { id: true, name: true, status: true }
    })

    console.log(`Updated user ${(updatedUser as any).name} to ${(updatedUser as any).status}`)

    // Bulk update by query
    const bulkUpdate = await quickbase.update({
      table: 'users',
      where: {
        department: { CT: 'Marketing' },
        status: { CT: 'pending' }
      },
      data: {
        status: 'active',
        approvedDate: new Date().toISOString().split('T')[0]
      }
    })

    console.log(`Bulk updated users in Marketing department`)

    // === COUNT OPERATIONS ===
    console.log('\n🔢 Counting records...')
    
    // Count all users
    const totalUsers = await quickbase.count({
      table: 'users'
    })

    console.log(`Total users: ${totalUsers.totalDocs}`)

    // Count active users
    const activeUserCount = await quickbase.count({
      table: 'users',
      where: {
        status: { CT: 'active' }
      }
    })

    console.log(`Active users: ${activeUserCount.totalDocs}`)

    // Count by department
    const engineeringCount = await quickbase.count({
      table: 'users',
      where: {
        AND: [
          { status: { CT: 'active' } },
          { department: { CT: 'Engineering' } }
        ]
      }
    })

    console.log(`Active Engineering users: ${engineeringCount.totalDocs}`)

    // === DELETE OPERATIONS ===
    console.log('\n🗑️ Cleaning up...')
    
    // Delete the test user we created
    const deletedUser = await quickbase.delete({
      table: 'users',
      id: (newUser as any).id
    })

    console.log(`Deleted user: ${(deletedUser as any).name}`)

    // Delete inactive users (be careful with this!)
    const deletedInactiveUser = await quickbase.delete({
      table: 'users',
      where: {
        AND: [
          { status: { CT: 'inactive' } },
          { lastLogin: { BF: '2023-01-01' } } // Not logged in since 2023
        ]
      }
    })

    console.log(`Deleted inactive user: ${(deletedInactiveUser as any).name}`)

    // === ADVANCED USAGE ===
    console.log('\n🎯 Advanced usage with context...')
    
    const contextualResults = await quickbase.find({
      table: 'users',
      where: { department: { CT: 'Engineering' } },
      context: {
        operation: 'monthly-report',
        source: 'analytics-dashboard',
        requestId: 'req-' + Date.now()
      },
      user: {
        id: 'admin-123',
        email: 'admin@company.com'
      },
      overrideAccess: false // Respect access controls
    })

    console.log(`Found ${contextualResults.totalDocs} engineering users with context`)

    console.log('\n✅ QuickBase Local API demo completed successfully!')

  } catch (error) {
    console.error('❌ Error occurred:', error)
    
    if (error.status) {
      console.error(`Status: ${error.status}`)
      console.error(`Code: ${error.code}`)
      console.error(`Description: ${error.description}`)
    }
  }
}

// === QUERY EXAMPLES ===
export const queryExamples = {
  // Simple equality
  simpleWhere: {
    status: { CT: 'active' }
  },

  // Multiple conditions with AND
  andConditions: {
    AND: [
      { status: { CT: 'active' } },
      { department: { CT: 'Engineering' } }
    ]
  },

  // OR conditions
  orConditions: {
    OR: [
      { status: { CT: 'active' } },
      { status: { CT: 'pending' } }
    ]
  },

  // Comparison operators
  comparisons: {
    salary: { GT: 50000 },
    experience: { GTE: 5 },
    age: { LT: 65 }
  },

  // Text operators
  textSearch: {
    name: { SW: 'John' },        // Starts with
    email: { EW: '@company.com' }, // Ends with
    notes: { IR: 'important' }    // Contains
  },

  // Date operators
  dateFilters: {
    startDate: { AF: '2024-01-01' },    // After
    endDate: { BF: '2024-12-31' },      // Before
    lastLogin: { OAF: '2024-06-01' }    // On or after
  },

  // Complex nested query
  complexQuery: {
    AND: [
      {
        OR: [
          { department: { CT: 'Engineering' } },
          { department: { CT: 'Product' } }
        ]
      },
      { status: { CT: 'active' } },
      { startDate: { AF: '2023-01-01' } }
    ]
  }
}

// === USAGE PATTERNS ===
export const usagePatterns = {
  // Pagination pattern
  async paginateUsers(quickbase: any, pageSize = 25) {
    let page = 1
    let hasMore = true
    const allUsers: any[] = []

    while (hasMore) {
      const result = await quickbase.find({
        table: 'users',
        limit: pageSize,
        page,
        sort: [{ fieldId: 3, order: 'ASC' }] // Sort by record ID
      })

      allUsers.push(...result.docs)
      hasMore = result.pagingInfo.hasNextPage
      page++
    }

    return allUsers
  },

  // Batch operations pattern
  async batchCreateUsers(quickbase: any, users: any[]) {
    const results: any[] = []
    
    for (const userData of users) {
      try {
        const created = await quickbase.create({
          table: 'users',
          data: userData
        })
        results.push({ success: true, user: created })
      } catch (error) {
        results.push({ success: false, error: (error as Error).message, data: userData })
      }
    }

    return results
  },

  // Search pattern
  async searchUsers(quickbase: any, searchTerm: string) {
    return quickbase.find({
      table: 'users',
      where: {
        OR: [
          { name: { IR: searchTerm } },
          { email: { IR: searchTerm } },
          { department: { IR: searchTerm } }
        ]
      },
      limit: 50
    })
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  demonstrateQuickBaseAPI()
}

export default demonstrateQuickBaseAPI 