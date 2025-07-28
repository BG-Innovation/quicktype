# Auto-Generated Strongly-Typed QuickBase Client

Your QuickBase wrapper now **automatically generates** a fully typed client directly from your QuickBase schema! No more manual type definitions or field mappings.

## 🚀 Quick Start

### 1. Generate Types and Client

```bash
pnpm run generate
```

This single command:
- ✅ Discovers your QuickBase schemas
- ✅ Generates TypeScript types
- ✅ Creates field name → ID mappings
- ✅ Creates table name → ID mappings  
- ✅ Generates a strongly-typed client
- ✅ Provides the clean interface you requested!

### 2. Use the Generated Client

```typescript
import { createQuickBaseClient } from './types/generated/client.js'

// Simple config - just the secrets needed
const quickbase = createQuickBaseClient({
  userToken: process.env.QUICKBASE_USER_TOKEN!,
  realm: process.env.QUICKBASE_REALM!
})

// Exactly the interface you wanted! 🎯
const activeUsers = await quickbase.find({
  app: 'bg_software',    // ✅ Fully type-safe app names
  table: 'software',     // ✅ Type-safe table names
  where: {
    status: { CT: 'Active' },     // ✅ Type-safe fields and values
    type: { CT: 'Cloud-Based' }   // ✅ Enum values type-checked
  },
  select: {
    name: true,           // ✅ Only valid fields allowed
    vendor: true,         // ✅ Full autocomplete support
    status: true
  }
})
```

## 📁 Generated Files

After running `pnpm run generate`, you get:

```
types/generated/
├── client-mappings.ts    # Auto-generated field & table mappings
├── client.ts            # Auto-generated strongly-typed client
├── bg_software.types.ts # Your existing generated types
└── index.ts            # Re-exports everything
```

## 💻 Full API

### Find Operations

```typescript
// Find with complex queries
const results = await quickbase.find({
  app: 'bg_software',
  table: 'software',
  where: {
    AND: [
      { status: { CT: 'Active' } },
      { vendor: { SW: 'Microsoft' } }  // Starts with
    ]
  },
  sort: [{ field: 'name', order: 'ASC' }],
  limit: 25,
  page: 1
})

// Find by ID
const software = await quickbase.findByID({
  app: 'bg_software',
  table: 'software', 
  id: 123,
  select: { name: true, vendor: true }
})
```

### Create Operations

```typescript
// Create with full type safety
const newSoftware = await quickbase.create({
  app: 'bg_software',
  table: 'software',
  data: {
    name: 'New Platform',
    type: 'Cloud-Based',    // ✅ Only valid choices allowed
    status: 'Pilot',        // ✅ Enum validation
    vendor: 'TechCorp'
  }
})
```

### Update Operations

```typescript
// Update by ID
const updated = await quickbase.update({
  app: 'bg_software',
  table: 'software',
  id: 123,
  data: {
    status: 'Active',  // ✅ Type-checked values
    notes: 'Deployed successfully'
  }
})

// Update by query
const bulkUpdated = await quickbase.update({
  app: 'bg_software',
  table: 'software',
  where: { status: { CT: 'Pilot' } },
  data: { status: 'Active' }
})
```

### Delete Operations

```typescript
// Delete by ID
const deleted = await quickbase.delete({
  app: 'bg_software',
  table: 'software',
  id: 123
})

// Delete by query  
const deletedRecord = await quickbase.delete({
  app: 'bg_software',
  table: 'software',
  where: { status: { CT: 'Closed' } }
})
```

### Count Operations

```typescript
const count = await quickbase.count({
  app: 'bg_software',
  table: 'software',
  where: { status: { CT: 'Active' } }
})

console.log(`Active software: ${count.totalDocs}`)
```

## 🎯 Type Safety Features

### ✅ What's Type-Safe

- **App names**: Only valid apps from your config
- **Table names**: Only tables that exist in each app
- **Field names**: Only fields that exist in each table  
- **Field values**: Enum choices are validated
- **Query operators**: All QuickBase operators supported
- **Select fields**: Only valid fields can be selected
- **Sort fields**: Only valid fields can be sorted on

### ❌ TypeScript Will Catch These Errors

```typescript
// ❌ Invalid app name
const invalid1 = await quickbase.find({
  app: 'nonexistent_app',  // TypeScript error!
  table: 'software'
})

// ❌ Invalid table for this app  
const invalid2 = await quickbase.find({
  app: 'bg_software',
  table: 'nonexistent_table'  // TypeScript error!
})

// ❌ Invalid field name
const invalid3 = await quickbase.find({
  app: 'bg_software',
  table: 'software',
  where: {
    invalid_field: { CT: 'value' }  // TypeScript error!
  }
})

// ❌ Invalid enum value
const invalid4 = await quickbase.create({
  app: 'bg_software',
  table: 'software',
  data: {
    status: 'InvalidStatus'  // TypeScript error!
  }
})
```

## 🔄 Query Operators

All QuickBase operators are supported with full type safety:

```typescript
const complexQuery = await quickbase.find({
  app: 'bg_software',
  table: 'software',
  where: {
    // Text operators
    name: { SW: 'Microsoft' },        // Starts with
    vendor: { EW: 'Corp' },           // Ends with  
    notes: { IR: 'important' },       // Contains
    
    // Comparison operators
    priority: { GT: 5 },              // Greater than
    score: { LTE: 100 },              // Less than or equal
    
    // Date operators
    created: { AF: '2024-01-01' },    // After
    updated: { BF: '2024-12-31' },    // Before
    
    // Logical operators
    AND: [
      { status: { CT: 'Active' } },
      { type: { CT: 'Cloud-Based' } }
    ],
    OR: [
      { vendor: { CT: 'Microsoft' } },
      { vendor: { CT: 'Google' } }
    ]
  }
})
```

## 🔧 Configuration

### Environment Variables

Set up your `.env` file:

```bash
# Global QuickBase settings
QUICKBASE_USER_TOKEN=your-user-token
QUICKBASE_REALM=your-realm.quickbase.com

# App-specific tokens (auto-detected by naming convention)
BG_SOFTWARE_APP_TOKEN=your-app-token
```

### QuickTypes Config

Your existing `quicktypes.config.js` works as-is:

```javascript
module.exports = {
  apps: [
    {
      name: "BG_SOFTWARE",
      appId: process.env.BG_SOFTWARE_APP_ID,
      appToken: process.env.BG_SOFTWARE_APP_TOKEN,
      description: "Background Software Management"
    }
  ],
  global: {
    userToken: process.env.QUICKBASE_USER_TOKEN,
    realm: process.env.QUICKBASE_REALM,
    baseUrl: process.env.QUICKBASE_BASE_URL || "https://api.quickbase.com/v1"
  }
}
```

## 🚀 Advanced Usage

### Pagination

```typescript
// Load all records with pagination
let page = 1
let allRecords = []

while (true) {
  const result = await quickbase.find({
    app: 'bg_software',
    table: 'software',
    limit: 100,
    page,
    sort: [{ field: 'name', order: 'ASC' }]
  })
  
  allRecords.push(...result.docs)
  
  if (!result.pagingInfo.hasNextPage) break
  page++
}
```

### Batch Operations

```typescript
// Type-safe batch creation
const softwareList = [
  { name: 'App 1', type: 'Cloud-Based', status: 'Active' },
  { name: 'App 2', type: 'Networked', status: 'Pilot' }
]

const results = []
for (const software of softwareList) {
  try {
    const created = await quickbase.create({
      app: 'bg_software',
      table: 'software',
      data: software  // ✅ Fully type-checked
    })
    results.push({ success: true, data: created })
  } catch (error) {
    results.push({ success: false, error: error.message })
  }
}
```

### Field Selection with Type Safety

```typescript
// Select specific fields
const software = await quickbase.find({
  app: 'bg_software',
  table: 'software',
  select: {
    name: true,
    vendor: true,
    status: true
    // TypeScript ensures only valid fields can be selected
  }
})

// Result is properly typed with only selected fields
software.docs[0].name    // ✅ Available
software.docs[0].vendor  // ✅ Available  
software.docs[0].notes   // ❌ TypeScript error - not selected
```

## 🔄 Regeneration

When your QuickBase schema changes:

1. **Run regeneration**: `pnpm run generate`
2. **Types update automatically**: Field mappings, table mappings, and types all stay in sync
3. **Compile-time safety**: TypeScript will catch any breaking changes

## 📝 Key Benefits

- **🎯 Exact Interface**: Clean `app`/`table` syntax you requested
- **🚀 Zero Manual Work**: Everything auto-generated from your actual schema
- **💻 Full Type Safety**: Compile-time checking for all operations
- **🔄 Always Current**: Regenerate when schema changes
- **🧠 Perfect IntelliSense**: Full autocomplete for all fields and operations
- **⚡ Performance**: Direct field ID mapping for optimal QuickBase API calls

Your QuickBase operations are now as type-safe and clean as Payload CMS, but automatically generated from your actual QuickBase schema! 🎉 