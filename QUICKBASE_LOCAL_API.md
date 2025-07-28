# QuickBase Local API

A Payload CMS-inspired local API wrapper for QuickBase that provides strongly typed, familiar CRUD operations.

## 🚀 Features

- **Payload CMS-like API**: Familiar syntax if you're coming from Payload
- **Strongly Typed**: Full TypeScript support with generated types from your QuickBase schemas
- **Local Operations**: Mirror Payload's local API operations (`find`, `findByID`, `create`, `update`, `delete`, `count`)
- **Query Translation**: Automatically translates Payload-style queries to QuickBase query format
- **Type Safety**: Compile-time type checking for all operations
- **Field Mapping**: Intelligent mapping between field names and QuickBase field IDs

## 📁 Project Structure

```
src/
├── quickbase/
│   ├── index.ts                    # Main QuickBase client
│   ├── types/
│   │   └── index.ts               # Core type definitions
│   ├── utilities/
│   │   ├── createLocalReq.ts      # Request context creation
│   │   └── apiRequest.ts          # QuickBase API communication
│   ├── operations/
│   │   └── local/
│   │       ├── find.ts            # Find operation
│   │       ├── findByID.ts        # Find by ID operation
│   │       ├── create.ts          # Create operation
│   │       ├── update.ts          # Update operation
│   │       ├── delete.ts          # Delete operation
│   │       ├── count.ts           # Count operation
│   │       └── index.ts           # Export all operations
│   └── config/
│       └── withGeneratedTypes.ts  # Type integration utilities
├── index.ts                       # Main entry point
└── types/
    ├── quickbase.ts              # Shared QuickBase types
    └── generated/                # Generated types from schemas
        ├── index.ts
        └── *.types.ts
```

## 🔧 Setup

1. **Install dependencies** (using pnpm as preferred):
```bash
pnpm install
```

2. **Configure your apps** in `quicktypes.config.js`:
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

3. **Generate types**:
```bash
pnpm run generate
```

## 💻 Usage

### Basic Usage

```typescript
import { createQuickBaseClient } from './src/quickbase'
import type { QuickBaseConfig } from './src/quickbase/types'

// Create client with configuration
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

const quickbase = createQuickBaseClient(config)
```

### Find Operations

```typescript
// Find all records
const users = await quickbase.find({
  table: 'users',
  where: {
    status: { CT: 'active' }
  },
  sort: [{ fieldId: 5, order: 'ASC' }],
  limit: 25,
  page: 1
})

// Find with complex queries
const activeUsers = await quickbase.find({
  table: 'users',
  where: {
    AND: [
      { status: { CT: 'active' } },
      { lastLogin: { AF: '2024-01-01' } }
    ]
  }
})

// Find with field selection
const usersWithSelect = await quickbase.find({
  table: 'users',
  select: { name: true, email: true, status: true },
  where: { department: { CT: 'Engineering' } }
})
```

### Find By ID

```typescript
// Find a specific record
const user = await quickbase.findByID({
  table: 'users',
  id: 123,
  select: { name: true, email: true }
})

if (user) {
  console.log(`Found user: ${user.name}`)
} else {
  console.log('User not found')
}
```

### Create Operations

```typescript
// Create a new record
const newUser = await quickbase.create({
  table: 'users',
  data: {
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active',
    department: 'Engineering'
  }
})

console.log(`Created user with ID: ${newUser.id}`)

// Create with upsert (merge)
const upsertUser = await quickbase.create({
  table: 'users',
  data: {
    email: 'jane@example.com',
    name: 'Jane Smith',
    status: 'active'
  },
  mergeFieldId: 7 // Email field for merging
})
```

### Update Operations

```typescript
// Update by ID
const updatedUser = await quickbase.update({
  table: 'users',
  id: 123,
  data: {
    status: 'inactive',
    lastUpdated: new Date().toISOString()
  }
})

// Update by query
const updatedUsers = await quickbase.update({
  table: 'users',
  where: {
    department: { CT: 'Marketing' }
  },
  data: {
    status: 'under_review'
  }
})

// Update with field selection
const user = await quickbase.update({
  table: 'users',
  id: 123,
  data: { status: 'active' },
  select: { id: true, name: true, status: true }
})
```

### Delete Operations

```typescript
// Delete by ID
const deletedUser = await quickbase.delete({
  table: 'users',
  id: 123
})

console.log(`Deleted user: ${deletedUser.name}`)

// Delete by query
const deletedUser = await quickbase.delete({
  table: 'users',
  where: {
    status: { CT: 'inactive' },
    lastLogin: { BF: '2023-01-01' }
  }
})
```

### Count Operations

```typescript
// Count all records
const total = await quickbase.count({
  table: 'users'
})

console.log(`Total users: ${total.totalDocs}`)

// Count with query
const activeCount = await quickbase.count({
  table: 'users',
  where: {
    status: { CT: 'active' }
  }
})

console.log(`Active users: ${activeCount.totalDocs}`)
```

### Advanced Usage with Context

```typescript
// Operations with context and user
const results = await quickbase.find({
  table: 'users',
  where: { department: { CT: 'Engineering' } },
  context: {
    operation: 'user-sync',
    source: 'admin-panel'
  },
  user: {
    id: 'admin-123',
    email: 'admin@company.com'
  },
  overrideAccess: false // Respect access controls
})
```

## 🔍 Query Operators

QuickBase operators supported in where clauses:

```typescript
const whereClause = {
  // Equality
  fieldName: { CT: 'value' },           // Contains/Equal to
  fieldName: { XCT: 'value' },          // Not equal to
  
  // Comparison
  fieldName: { GT: 100 },               // Greater than
  fieldName: { GTE: 100 },              // Greater than or equal
  fieldName: { LT: 100 },               // Less than
  fieldName: { LTE: 100 },              // Less than or equal
  
  // Text
  fieldName: { SW: 'prefix' },          // Starts with
  fieldName: { EW: 'suffix' },          // Ends with
  fieldName: { IR: 'contains' },        // Contains
  
  // Date
  fieldName: { BF: '2024-01-01' },      // Before
  fieldName: { AF: '2024-01-01' },      // After
  fieldName: { OBF: '2024-01-01' },     // On or before
  fieldName: { OAF: '2024-01-01' },     // On or after
  
  // Existence
  fieldName: { EX: true },              // Exists
  fieldName: { TV: true },              // True/False
  
  // Logical
  AND: [
    { field1: { CT: 'value1' } },
    { field2: { GT: 50 } }
  ],
  OR: [
    { status: { CT: 'active' } },
    { status: { CT: 'pending' } }
  ]
}
```

## 🎯 Type Safety with Generated Types

When you run `pnpm run generate`, the system creates strongly typed interfaces:

```typescript
import { createTypedQuickBaseClient } from './src/quickbase/config/withGeneratedTypes'
import type { BgSoftwareApp } from './types/generated'

// Strongly typed client
const typedClient = createTypedQuickBaseClient<{
  bgSoftware: BgSoftwareApp
}>(config)

// Type-safe operations (future enhancement)
// const users = await typedClient.bgSoftware.users.find({
//   where: { status: 'active' }, // Autocomplete and type checking
//   select: { name: true, email: true } // Only valid fields allowed
// })
```

## 🔄 Migration from Payload

If you're familiar with Payload CMS, the transition is seamless:

```typescript
// Payload syntax
const users = await payload.find({
  collection: 'users',
  where: { status: { equals: 'active' } }
})

// QuickBase equivalent
const users = await quickbase.find({
  table: 'users',
  where: { status: { CT: 'active' } }
})
```

## 🛠 Error Handling

```typescript
try {
  const user = await quickbase.findByID({
    table: 'users',
    id: 123
  })
} catch (error) {
  if (error.status === 404) {
    console.log('User not found')
  } else if (error.status === 403) {
    console.log('Access denied')
  } else {
    console.error('QuickBase error:', error.message)
  }
}
```

## 📝 Configuration Options

### QuickBase Config

```typescript
interface QuickBaseConfig {
  apps: Array<{
    name: string
    appId: string
    appToken: string
    description?: string
  }>
  global: {
    userToken: string
    realm: string
    baseUrl: string
  }
}
```

### Operation Options

All operations support these common options:

- `table`: QuickBase table ID or name
- `appId`: Override default app ID
- `context`: Additional context data
- `req`: Partial request object
- `user`: User making the request
- `overrideAccess`: Skip access control (default: true)

## 🚀 Next Steps

1. **Generate your types**: Run `pnpm run generate` to create typed interfaces
2. **Implement field mapping**: Enhance the type generation to include field name → ID mapping
3. **Add more operations**: Extend with additional QuickBase-specific operations
4. **Enhance error handling**: Add retry logic and better error messages
5. **Add caching**: Implement intelligent caching for better performance

## 🔗 Related Files

- [`scripts/generate.ts`](./scripts/generate.ts) - Type generation script
- [`types/quickbase.ts`](./types/quickbase.ts) - Core QuickBase types
- [`QUICKTYPES_USAGE.md`](./QUICKTYPES_USAGE.md) - Type generation documentation

This QuickBase Local API provides a powerful, type-safe way to interact with QuickBase using familiar Payload CMS patterns! 