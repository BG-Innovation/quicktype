// Simple usage example for the auto-generated QuickBase client
import { createQuickBaseClient } from '../types/generated/client.js'

// Create client with just the connection secrets
const quickbase = createQuickBaseClient({
  userToken: process.env.QUICKBASE_USER_TOKEN!,
  realm: process.env.QUICKBASE_REALM!,
  baseUrl: 'https://api.quickbase.com/v1'
})

async function example() {
  // ✅ Find with full type safety - exactly what you wanted!
  const activeSoftware = await quickbase.find({
    app: 'bg_software',              // ✅ Type-safe app names
    table: 'software',               // ✅ Type-safe table names  
    where: {
      status: { CT: 'Active' },      // ✅ Enum values are type-checked
      type: { CT: 'Cloud-Based' }    // ✅ Only valid choices allowed
    },
    select: {
      name: true,                    // ✅ Only valid fields allowed
      vendor: true,
      status: true
    },
    limit: 10
  })

  console.log(`Found ${activeSoftware.totalDocs} active software items`)
  
  // ✅ Results are properly typed with selected fields
  activeSoftware.docs.forEach(software => {
    console.log(`${software.name} by ${software.vendor} - ${software.status}`)
  })

  // ✅ Create with type validation
  const newSoftware = await quickbase.create({
    app: 'bg_software',
    table: 'software',
    data: {
      name: 'New Analytics Tool',
      type: 'Cloud-Based',           // ✅ Only 'Cloud-Based' | 'Networked' allowed
      status: 'Pilot',               // ✅ Only valid status choices allowed
      vendor: 'DataCorp',
      primaryuse: 'Business Intelligence'
    }
  })

  console.log(`Created software with ID: ${newSoftware.id}`)

  // ✅ Update with type safety
  await quickbase.update({
    app: 'bg_software',
    table: 'software',
    id: newSoftware.id,
    data: {
      status: 'Active'               // ✅ Type-checked enum value
    }
  })

  // ✅ Count records
  const count = await quickbase.count({
    app: 'bg_software',
    table: 'software',
    where: { status: { CT: 'Active' } }
  })

  console.log(`Total active software: ${count.totalDocs}`)
}

export default example 