# QuickTypes

A Payload CMS-inspired QuickBase client with full type safety and code generation.

## Features

- **Type-safe QuickBase operations** - Full TypeScript support for apps, tables, and fields
- **Payload CMS-inspired API** - Familiar syntax for CRUD operations
- **Automatic type generation** - Generate types from your QuickBase schema
- **Graceful fallbacks** - Works with or without generated types
- **Modern TypeScript** - Built with the latest TypeScript features

## Installation

```bash
npm install quicktypes
# or
pnpm add quicktypes
# or  
yarn add quicktypes
```

## Quick Start

### 1. Create QuickBase Configuration

Create `quickbase.config.ts` in your project root:

```typescript
import { buildConfig } from 'quicktypes'

export default buildConfig({
  realm: 'your-realm.quickbase.com',
  userToken: process.env.QB_USER_TOKEN!,
  apps: [
    {
      name: 'MyApp',
      appId: 'your-app-id',
      appToken: process.env.QB_APP_TOKEN!,
      description: 'My QuickBase Application'
    }
  ]
})
```

### 2. Generate Types

Add to your `package.json`:

```json
{
  "scripts": {
    "generate": "quicktypes-generate",
    "dev": "npm run generate && tsx src/index.ts"
  }
}
```

Run type generation:

```bash
npm run generate
```

This creates:
- `types/generated/` - Generated TypeScript types
- `schemas/` - JSON schemas of your QuickBase apps

### 3. Enable Type Safety

Import the generated type augmentation:

```typescript
// At the top of your main file or in a types setup file
import './types/generated/augment-quicktypes'
```

### 4. Use the Client

```typescript
import { getQuickbase } from 'quicktypes'
import config from './quickbase.config'

const quickbase = getQuickbase({ config })

// Type-safe operations!
const employees = await quickbase.find({
  app: 'MyApp',        // ✅ Type-safe app name
  table: 'employees',  // ✅ Type-safe table name  
  where: {
    firstName: { contains: 'John' },  // ✅ Type-safe field names
    department: { equals: 'Engineering' }
  },
  select: ['firstName', 'lastName', 'email'],  // ✅ Type-safe field selection
  sort: ['lastName', '-firstName']
})

// Create records
const newEmployee = await quickbase.create({
  app: 'MyApp',
  table: 'employees',
  data: {
    firstName: 'Jane',
    lastName: 'Smith', 
    email: 'jane@company.com',
    department: 'Engineering'
  }
})

// Update records  
await quickbase.update({
  app: 'MyApp',
  table: 'employees',
  id: newEmployee.metadata?.recordId,
  data: {
    department: 'Senior Engineering'
  }
})

// Delete records
await quickbase.delete({
  app: 'MyApp', 
  table: 'employees',
  id: employeeId
})
```

## API Reference

### Client Operations

#### `find(options)`
Find multiple records with pagination.

```typescript
const result = await quickbase.find({
  app: 'MyApp',
  table: 'employees', 
  where: {
    department: { equals: 'Engineering' },
    salary: { greaterThan: 50000 }
  },
  sort: ['lastName', '-salary'],
  limit: 20,
  page: 1,
  select: ['firstName', 'lastName', 'salary']
})
```

#### `findByID(options)`
Find a single record by ID.

```typescript
const employee = await quickbase.findByID({
  app: 'MyApp',
  table: 'employees',
  id: 123,
  select: ['firstName', 'lastName', 'email']
})
```

#### `create(options)`
Create a new record.

```typescript
const newRecord = await quickbase.create({
  app: 'MyApp', 
  table: 'employees',
  data: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@company.com'
  }
})
```

#### `update(options)`
Update an existing record.

```typescript
const updated = await quickbase.update({
  app: 'MyApp',
  table: 'employees', 
  id: 123,
  data: {
    department: 'Management'
  }
})
```

#### `delete(options)`
Delete a record.

```typescript
await quickbase.delete({
  app: 'MyApp',
  table: 'employees',
  id: 123
})
```

#### `count(options)`
Count records matching criteria.

```typescript
const count = await quickbase.count({
  app: 'MyApp',
  table: 'employees',
  where: {
    department: { equals: 'Engineering' }
  }
})
```

### Query Operators

- `equals` - Exact match
- `notEquals` - Not equal
- `contains` - Contains text
- `notContains` - Does not contain text  
- `startsWith` - Starts with text
- `endsWith` - Ends with text
- `greaterThan` - Greater than (numbers/dates)
- `lessThan` - Less than (numbers/dates)
- `greaterThanOrEqual` - Greater than or equal
- `lessThanOrEqual` - Less than or equal
- `isEmpty` - Field is empty
- `isNotEmpty` - Field is not empty
- `in` - Value in array
- `notIn` - Value not in array

### Complex Queries

```typescript
const results = await quickbase.find({
  app: 'MyApp',
  table: 'employees',
  where: {
    and: [
      { department: { equals: 'Engineering' } },
      { salary: { greaterThan: 75000 } }
    ],
    or: [
      { title: { contains: 'Senior' } },
      { yearsExperience: { greaterThan: 5 } }
    ]
  }
})
```

## Working Without Generated Types

The client gracefully falls back to string-based operations when types aren't generated:

```typescript
// Works, but with less type safety
const results = await quickbase.find({
  app: 'MyApp' as any,
  table: 'employees' as any, 
  where: {
    'firstName': { contains: 'John' }  // String field names
  }
})
```

## Environment Variables

```bash
QB_USER_TOKEN=your_quickbase_user_token
QB_APP_TOKEN_MYAPP=your_app_specific_token
```

## Contributing

Contributions welcome! Please read our contributing guidelines.

## License

ISC 