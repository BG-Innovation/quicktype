// Example Usage of QuickBase Local API
// This demonstrates how to use the Payload-inspired QuickBase client

import { getQuickbase } from './src'
import config from './quickbase.config'

async function main() {
  // Initialize the QuickBase client with your config
  const quickbase = getQuickbase({ config })
  
  console.log('QuickBase client initialized with apps:', config.apps.map(app => app.slug))

  try {
    // Example 1: Find records with type-safe app and table selection
    console.log('\n--- Finding records ---')
    const software = await quickbase.find({
      app: 'bg_software',
      table: 'software',
      where: {
        name: { contains: 'Adobe' },
      },
      sort: ['name'],
    })
    
    console.log(`Found ${software.totalDocs} software records, showing ${software.docs.length}`)
    console.log('First software:', software.docs[0])

    // Example 2: Find a specific record by ID
    console.log('\n--- Finding record by ID ---')
    const employee = await quickbase.findByID({
      app: 'bg_software',
      table: 'employees',
      id: 123, // Replace with actual record ID
      select: ['firstName', 'lastName', 'email'], // Only return specific fields
    })
    
    console.log('Employee found:', employee.data)
    console.log('Metadata:', employee.metadata)

    // Example 3: Create a new record
    console.log('\n--- Creating a new record ---')
    const newEmployee = await quickbase.create({
      app: 'bg_software',
      table: 'employees',
      data: {
        firstName: 'Jane',
        lastName: 'Doe', 
        email: 'jane@example.com',
        department: 'Engineering',
      },
    })
    
    console.log('Created employee:', newEmployee.data)
    console.log('New record ID:', newEmployee.metadata?.recordId)

    // Example 4: Update an existing record
    console.log('\n--- Updating a record ---')
    const updatedEmployee = await quickbase.update({
      app: 'bg_software',
      table: 'employees',
      id: newEmployee.metadata?.recordId || 123,
      data: {
        department: 'Former Employee', // Update department
        title: 'Ex-Engineer', // Update title
      },
    })
    
    console.log('Updated employee:', updatedEmployee.data)

    // Example 5: Count records
    console.log('\n--- Counting records ---')
    const engineeringCount = await quickbase.count({
      app: 'bg_software',
      table: 'employees',
      where: {
        department: { equals: 'Engineering' } // Count only Engineering employees
      },
    })
    
    console.log(`Engineering employees count: ${engineeringCount.totalDocs}`)

    // Example 6: Complex queries with OR conditions
    console.log('\n--- Complex query with OR conditions ---')
    const complexResults = await quickbase.find({
      app: 'bg_software',
      table: 'employees',
      where: {
        or: [
          { department: { equals: 'Engineering' } },
          { department: { equals: 'Marketing' } },
          { department: { equals: 'Sales' } }
        ],
        and: [
          { email: { isNotEmpty: true } }
        ]
      },
      sort: ['department', 'lastName'], // Sort by department, then last name
      limit: 50,
    })
    
    console.log(`Found ${complexResults.totalDocs} employees in specified departments`)

    // Example 7: Pagination
    console.log('\n--- Pagination example ---')
    for (let page = 1; page <= 3; page++) {
      const pageResults = await quickbase.find({
        app: 'bg_software',
        table: 'employees',
        limit: 5,
        page,
        sort: ['lastName'], // Sort by last name
      })
      
      console.log(`Page ${page}: ${pageResults.docs.length} records`)
      console.log(`  Has next page: ${pageResults.hasNextPage}`)
      console.log(`  Total pages: ${pageResults.totalPages}`)
    }

    // Example 8: Error handling with disableErrors
    console.log('\n--- Error handling example ---')
    const safeResult = await quickbase.findByID({
      app: 'bg_software',
      table: 'employees',
      id: 99999, // Non-existent ID
      disableErrors: true, // Won't throw, returns null instead
    })
    
    if (safeResult.data === null) {
      console.log('Record not found, but no error thrown')
    }

    // Example 9: Delete a record (uncomment to use)
    // console.log('\n--- Deleting a record ---')
    // const deleteResult = await quickbase.delete({
    //   app: 'bg_software',
    //   table: 'employees',
    //   id: newEmployee.metadata?.recordId || 123,
    // })
    // console.log('Deleted record ID:', deleteResult.id)

  } catch (error) {
    console.error('Error:', error)
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error)
}

export { main } 