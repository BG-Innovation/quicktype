# QuickBase Local API

A **Payload CMS-inspired** QuickBase client with full TypeScript type safety and an intuitive local API interface.

## Features

- **Payload-inspired API**: Familiar interface if you've used Payload CMS
- **Full Type Safety**: Generated types from your QuickBase schemas
- **Intuitive Queries**: Easy-to-use where clauses and sorting
- **Automatic Type Generation**: Discovers your QuickBase apps and generates TypeScript types
- **Pagination Support**: Built-in pagination with metadata
- **Error Handling**: Configurable error handling with `disableErrors` option
- **Debug Mode**: Optional request/response logging

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Your Environment

Create a `.env` file:

```bash
# Global QuickBase settings
QUICKBASE_USER_TOKEN=your-global-user-token
QUICKBASE_REALM=your-realm.quickbase.com

# App-specific settings
BG_SOFTWARE_APP_ID=your-app-id
BG_SOFTWARE_APP_TOKEN=your-app-token
```

### 3. Create Configuration

Create `quickbase.config.ts`:

```typescript
import { buildConfig } from './src'

export default buildConfig({
  realm: process.env.QUICKBASE_REALM,
  userToken: process.env.QUICKBASE_USER_TOKEN,
  apps: [
    {
      slug: 'bg_software',
      appId: process.env.BG_SOFTWARE_APP_ID,
      appToken: process.env.BG_SOFTWARE_APP_TOKEN,
      name: 'Background Software Management',
    }
  ],
})
```

### 4. Generate Types

```bash
npm run generate
```

### 5. Use the API

```typescript
import { getQuickbase } from './src'
import config from './quickbase.config'

const quickbase = getQuickbase({ config })

// Find records with full type safety
const users = await quickbase.find({
  app: 'bg_software', // Type-safe app selection
  table: 'users_table_id',
  where: {
    name: { contains: 'john' },
    status: { equals: 'active' },
    and: [
      { department: { notEquals: 'inactive' } },
      { email: { isNotEmpty: true } }
    ]
  },
  sort: ['-created_date', 'name'],
  limit: 10,
  page: 1,
})
```

## API Reference

### Configuration

#### `buildConfig(config: QuickBaseConfig)`

Creates a QuickBase configuration object similar to Payload's `buildConfig`.

```typescript
export default buildConfig({
  realm: 'your-realm.quickbase.com',
  userToken: 'your-user-token',
  baseUrl: 'https://api.quickbase.com/v1', // optional
  timeout: 30000, // optional
  debug: false, // optional
  apps: [
    {
      slug: 'my_app',
      appId: 'your-app-id',
      appToken: 'your-app-token',
      name: 'My App', // optional
      description: 'App description', // optional
    }
  ],
})
```

#### `getQuickbase({ config })`

Creates a QuickBase client instance.

```typescript
const quickbase = getQuickbase({ config })
```

### Operations

All operations follow the Payload CMS local API pattern with full type safety.

#### `find(options)`

Find multiple records with pagination.

```typescript
const result = await quickbase.find({
  app: 'my_app',           // Required: app slug
  table: 'table_id',       // Required: table ID
  where?: Where,           // Optional: filter conditions
  sort?: Sort,             // Optional: sort order
  limit?: number,          // Optional: max records (default: 20)
  page?: number,           // Optional: page number (default: 1)
  select?: string[],       // Optional: specific fields
  disableErrors?: boolean, // Optional: disable errors (default: false)
  debug?: boolean,         // Optional: enable debug logging
})

// Returns PaginatedDocs<T>
interface PaginatedDocs<T> {
  docs: T[]
  totalDocs: number
  limit: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  nextPage: number | null
  prevPage: number | null
}
```

#### `findByID(options)`

Find a single record by ID.

```typescript
const result = await quickbase.findByID({
  app: 'my_app',           // Required: app slug  
  table: 'table_id',       // Required: table ID
  id: 123,                 // Required: record ID
  select?: string[],       // Optional: specific fields
  disableErrors?: boolean, // Optional: disable errors
  debug?: boolean,         // Optional: enable debug logging
})

// Returns RecordResponse<T>
interface RecordResponse<T> {
  data: T
  metadata?: {
    recordId: number
    dateCreated?: string
    dateModified?: string
  }
}
```

#### `create(options)`

Create a new record.

```typescript
const result = await quickbase.create({
  app: 'my_app',           // Required: app slug
  table: 'table_id',       // Required: table ID  
  data: {                  // Required: record data
    field_6: 'John Doe',
    field_7: 'john@example.com',
  },
  select?: string[],       // Optional: fields to return
  disableErrors?: boolean, // Optional: disable errors
  debug?: boolean,         // Optional: enable debug logging
})
```

#### `update(options)`

Update an existing record.

```typescript
const result = await quickbase.update({
  app: 'my_app',           // Required: app slug
  table: 'table_id',       // Required: table ID
  id: 123,                 // Required: record ID
  data: {                  // Required: updated data
    field_6: 'Jane Doe',
    field_8: 'inactive',
  },
  select?: string[],       // Optional: fields to return  
  disableErrors?: boolean, // Optional: disable errors
  debug?: boolean,         // Optional: enable debug logging
})
```

#### `delete(options)`

Delete a record.

```typescript
const result = await quickbase.delete({
  app: 'my_app',           // Required: app slug
  table: 'table_id',       // Required: table ID
  id: 123,                 // Required: record ID
  disableErrors?: boolean, // Optional: disable errors
  debug?: boolean,         // Optional: enable debug logging
})

// Returns { id: number | string }
```

#### `count(options)`

Count records matching criteria.

```typescript
const result = await quickbase.count({
  app: 'my_app',           // Required: app slug
  table: 'table_id',       // Required: table ID
  where?: Where,           // Optional: filter conditions
  disableErrors?: boolean, // Optional: disable errors
  debug?: boolean,         // Optional: enable debug logging
})

// Returns { totalDocs: number }
```

### Query Syntax

#### Where Clauses

Flexible filtering similar to Payload's where syntax:

```typescript
// Simple equality
where: {
  field_6: 'John Doe'
}

// Operators
where: {
  field_6: { contains: 'john' },
  field_7: { greaterThan: 100 },
  field_8: { notEquals: 'inactive' },
  field_9: { isNotEmpty: true },
  field_10: { in: ['value1', 'value2'] }
}

// Complex conditions with AND/OR
where: {
  field_6: { contains: 'john' },
  and: [
    { field_7: { greaterThan: 0 } },
    { field_8: { equals: 'active' } }
  ],
  or: [
    { field_9: { equals: 'Engineering' } },
    { field_9: { equals: 'Marketing' } }
  ]
}
```

**Available operators:**
- `equals` / `notEquals`
- `greaterThan` / `lessThan` / `greaterThanOrEqual` / `lessThanOrEqual`
- `contains` / `notContains`
- `startsWith` / `endsWith`
- `isEmpty` / `isNotEmpty`
- `in` / `notIn`

#### Sorting

```typescript
// Single field
sort: 'field_6'           // Ascending
sort: '-field_6'          // Descending

// Multiple fields  
sort: ['field_6', '-field_7'] // field_6 asc, field_7 desc
```

## Type Generation

The system automatically discovers your QuickBase schemas and generates TypeScript types:

```bash
npm run generate
```

This creates:
- JSON schemas in `schemas/`
- TypeScript types in `types/generated/`
- Strongly typed interfaces for all apps, tables, and fields
- Table and field ID mappings for the client
- Full IntelliSense support with autocomplete

## 🎯 Full Type Safety & Autocomplete

After running `npm run generate`, you get **complete type safety** with IntelliSense:

### App & Table Autocomplete
```typescript
const data = await quickbase.find({
  app: 'bg_software',  // ✅ Only shows your configured apps
  table: 'software',   // ✅ Only shows tables for selected app
  // ...
})
```

### Field Name Autocomplete
```typescript
const data = await quickbase.find({
  app: 'bg_software',
  table: 'software',
  where: {
    name: { contains: 'adobe' },     // ✅ Field name autocomplete
    status: { equals: 'Active' },    // ✅ Choice value autocomplete  
    type: { equals: 'Cloud-Based' }  // ✅ Enum value autocomplete
  },
  select: ['name', 'vendor', 'status'], // ✅ Field name autocomplete
  sort: ['name', '-status']              // ✅ Field name autocomplete
})
```

### Type-Safe Data Operations
```typescript
const newRecord = await quickbase.create({
  app: 'bg_software',
  table: 'employees', 
  data: {
    firstName: 'John',           // ✅ TypeScript validates field names
    lastName: 'Doe',             // ✅ TypeScript validates field types
    department: 'Engineering',   // ✅ Only accepts valid values
    // invalidField: 'value'     // ❌ TypeScript error: field doesn't exist
  }
})

// ✅ Return type is strongly typed based on the table
console.log(newRecord.data.firstName) // TypeScript knows this exists
```

### What TypeScript Prevents
- ❌ Invalid app names: `app: 'nonexistent_app'`
- ❌ Invalid table names: `table: 'invalid_table'`  
- ❌ Typos in field names: `where: { naem: 'John' }`
- ❌ Invalid choice values: `status: 'InvalidStatus'`
- ❌ Wrong field types: `fieldId: 'string_instead_of_number'`

Try the fully typed example:
```bash
npm run example:typed
```

## Advanced Usage

### Error Handling

```typescript
// Throw errors (default)
try {
  const user = await quickbase.findByID({ app: 'my_app', table: 'users', id: 123 })
} catch (error) {
  console.error('User not found:', error)
}

// Disable errors - returns null instead
const user = await quickbase.findByID({ 
  app: 'my_app', 
  table: 'users', 
  id: 123,
  disableErrors: true 
})

if (user.data === null) {
  console.log('User not found, but no error thrown')
}
```

### Pagination

```typescript
// Manual pagination
const page1 = await quickbase.find({ app: 'my_app', table: 'users', page: 1, limit: 10 })
const page2 = await quickbase.find({ app: 'my_app', table: 'users', page: 2, limit: 10 })

// Using pagination metadata
let currentPage = 1
let results

do {
  results = await quickbase.find({ 
    app: 'my_app', 
    table: 'users', 
    page: currentPage, 
    limit: 20 
  })
  
  console.log(`Page ${currentPage}: ${results.docs.length} records`)
  currentPage++
} while (results.hasNextPage)
```

### Debug Mode

```typescript
// Enable debug for specific requests
await quickbase.find({ 
  app: 'my_app', 
  table: 'users', 
  debug: true  // Logs request/response
})

// Or globally in config
export default buildConfig({
  // ... other config
  debug: true // Enables debug for all requests
})
```

## Scripts

- `npm run generate` - Discover schemas and generate types
- `npm run example` - Run the basic example usage file
- `npm run example:typed` - Run the fully type-safe example (shows autocomplete features)
- `npm run build` - Build TypeScript
- `npm run test` - Run example as test

## Comparison with Payload CMS

This library brings Payload's excellent local API design to QuickBase:

```typescript
// Payload CMS
const posts = await payload.find({
  collection: 'posts',
  where: { title: { contains: 'hello' } },
  limit: 10
})

// QuickBase Local API
const records = await quickbase.find({
  app: 'my_app',
  table: 'posts_table',
  where: { title_field: { contains: 'hello' } },
  limit: 10
})
```

Both provide:
- Type safety
- Intuitive query syntax  
- Pagination
- Error handling
- Consistent API patterns

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC 