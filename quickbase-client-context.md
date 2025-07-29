# QuickBase Client - LLM Context Guide

## Overview
Type-safe QuickBase client with Payload CMS-inspired API for CRUD operations. Supports field name mapping and automatic type conversion.

## Quick Setup
```typescript
import { getQuickbase } from './src/client/quickbase'

const qb = getQuickbase({
  config: {
    baseUrl: 'https://api.quickbase.com/v1',
    realm: 'your-realm.quickbase.com',
    userToken: 'your-user-token',
    timeout: 30000,
    debug: false,
    apps: [
      {
        name: 'MyApp',
        appToken: 'app-token-here',
        tables: {
          Users: 'table-id-here',
          Projects: 'table-id-here'
        }
      }
    ]
  }
})
```

## Core Methods

### find() - Query multiple records
```typescript
const result = await qb.find({
  app: 'MyApp',
  table: 'Users',
  where: {
    name: { contains: 'John' },
    status: 'active',
    and: [
      { age: { greaterThan: 18 } },
      { department: { in: ['Engineering', 'Sales'] } }
    ]
  },
  sort: ['-created_date', 'name'],
  limit: 20,
  page: 1,
  select: ['name', 'email', 'status']
})

// Returns: PaginatedDocs with docs[], totalDocs, pagination info
```

### findByID() - Get single record
```typescript
const user = await qb.findByID({
  app: 'MyApp',
  table: 'Users',
  id: '123',
  select: ['name', 'email']
})

// Returns: { data: UserRecord, metadata: { recordId } }
```

### create() - Insert new record
```typescript
const newUser = await qb.create({
  app: 'MyApp',
  table: 'Users',
  data: {
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active'
  }
})
```

### update() - Modify existing record
```typescript
const updated = await qb.update({
  app: 'MyApp',
  table: 'Users',
  id: '123',
  data: {
    status: 'inactive',
    last_login: new Date()
  }
})
```

### delete() - Remove record
```typescript
await qb.delete({
  app: 'MyApp',
  table: 'Users',
  id: '123'
})
```

### count() - Get record count
```typescript
const count = await qb.count({
  app: 'MyApp',
  table: 'Users',
  where: { status: 'active' }
})
// Returns: { totalDocs: number }
```

## Where Conditions
```typescript
// Simple equality
where: { name: 'John', status: 'active' }

// Operators
where: {
  age: { greaterThan: 18, lessThan: 65 },
  name: { contains: 'John', startsWith: 'J' },
  status: { in: ['active', 'pending'] },
  email: { isNotEmpty: true }
}

// Logical operators
where: {
  and: [
    { status: 'active' },
    { age: { greaterThan: 18 } }
  ],
  or: [
    { department: 'Engineering' },
    { role: 'Manager' }
  ]
}
```

## Operators Available
- `equals`, `notEquals`
- `greaterThan`, `lessThan`, `greaterThanOrEqual`, `lessThanOrEqual`
- `contains`, `notContains`, `startsWith`, `endsWith`
- `in`, `notIn` (arrays)
- `isEmpty`, `isNotEmpty`

## Sorting
```typescript
sort: 'name'              // ASC by name
sort: '-created_date'     // DESC by created_date
sort: ['name', '-date']   // Multiple fields
```

## Type Safety & Field Mappings

### Generated Types (Recommended)
Run `pnpm generate` to create type-safe field mappings:
```typescript
// Generated files enable:
// - Field name → Field ID mapping
// - Full TypeScript intellisense
// - Runtime field validation
```

### Fallback Mode
Without generated types, uses fallback mappings:
- Field ID 3 → 'id' 
- Other fields → 'field_{id}'

## Error Handling
```typescript
// Disable errors (returns empty results)
const result = await qb.find({
  app: 'MyApp',
  table: 'Users',
  disableErrors: true
})

// Enable debugging
const result = await qb.find({
  app: 'MyApp',
  table: 'Users',
  debug: true
})
```

## Common Patterns

### Pagination
```typescript
const getAllUsers = async () => {
  let page = 1
  let allUsers = []
  
  while (true) {
    const result = await qb.find({
      app: 'MyApp',
      table: 'Users',
      page,
      limit: 100
    })
    
    allUsers.push(...result.docs)
    
    if (!result.hasNextPage) break
    page++
  }
  
  return allUsers
}
```

### Search with filters
```typescript
const searchUsers = async (query: string, filters: any) => {
  return await qb.find({
    app: 'MyApp',
    table: 'Users',
    where: {
      and: [
        {
          or: [
            { name: { contains: query } },
            { email: { contains: query } }
          ]
        },
        filters
      ]
    }
  })
}
```

### Bulk operations
```typescript
// Create multiple records
const users = ['John', 'Jane', 'Bob']
const promises = users.map(name => 
  qb.create({
    app: 'MyApp',
    table: 'Users',
    data: { name }
  })
)
await Promise.all(promises)
```

## Key Features
- **Type Safety**: Full TypeScript support with generated types
- **Field Mapping**: Automatic conversion between field names and IDs
- **Pagination**: Built-in pagination with metadata
- **Error Handling**: Configurable error behavior
- **Debugging**: Request/response logging
- **Timeout**: Configurable request timeouts
- **Payload CMS API**: Familiar API pattern for Payload users 