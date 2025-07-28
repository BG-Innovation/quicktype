// Example using the main package entry point
import { 
  createQuickBaseClient, 
  type SoftwareData, 
  type QuickBaseWhere 
} from '../src/index.js'

// Create client - simple configuration, fully typed
const qb = createQuickBaseClient({
  userToken: process.env.QUICKBASE_USER_TOKEN!,
  realm: process.env.QUICKBASE_REALM!
})

async function mainEntryExample() {
  // Complex search with full type safety
  const searchCriteria: QuickBaseWhere = {
    OR: [
      { 
        AND: [
          { status: { CT: 'Active' } },
          { type: { CT: 'Cloud-Based' } }
        ]
      },
      { vendor: { SW: 'Microsoft' } }
    ]
  }

  const results = await qb.find({
    app: 'bg_software',
    table: 'software',
    where: searchCriteria,
    sort: [{ field: 'name', order: 'ASC' }],
    select: {
      name: true,
      vendor: true,
      status: true,
      type: true
    }
  })

  console.log(`Found ${results.totalDocs} software matching criteria`)

  // Type-safe data operations
  const softwareData: Partial<SoftwareData> = {
    name: 'Enterprise Platform',
    type: 'Cloud-Based',        // ✅ Enum validated
    status: 'Enterprise',       // ✅ Enum validated
    vendor: 'TechCorp'
  }

  const created = await qb.create({
    app: 'bg_software',
    table: 'software',
    data: softwareData
  })

  console.log('Created:', created.name)
}

export default mainEntryExample 