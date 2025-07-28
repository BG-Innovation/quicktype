# QuickBase Local API

A Payload CMS-inspired local API for QuickBase with full TypeScript type safety and graceful degradation.

## Features

- **Type-Safe API**: Full TypeScript autocomplete and validation for app names, table names, and field names
- **Graceful Degradation**: Works without generated types, gains full type safety when types are generated
- **Module Declaration Merging**: Extends base types through TypeScript's module system (like Payload)
- **Field Name Mapping**: Use friendly field names instead of QuickBase field IDs
- **Payload-Inspired**: Familiar API design if you've used Payload CMS

## Quick Start

### 1. Installation

```bash
npm install quicktype
# or
pnpm add quicktype
```

### 2. Create Configuration

Create `quickbase.config.ts` in your project root:

```typescript
import { buildConfig } from 'quicktype'

export default buildConfig({
  realm: 'your-realm.quickbase.com',
  userToken: process.env.QB_USER_TOKEN!,
  baseUrl: 'https://api.quickbase.com/v1',
  apps: [
    {
      name: 'BgSoftware',
      appId: 'bvba8quak', 
      appToken: process.env.BG_SOFTWARE_TOKEN!,
      description: 'BG Software Tracking App'
    }
  ]
})
```

### 3. Generate Types (Optional but Recommended)

```bash
pnpm generate
```

This creates a single file in your project root:
- `quickbase-types.ts` - TypeScript interfaces, field mappings, and module declaration

### 4. Use the Client

```typescript
import { getQuickbase } from 'quicktype'
import config from './quickbase.config'

const quickbase = getQuickbase({ config })

// Full type safety after running `pnpm generate`
const software = await quickbase.find({
  app: 'BgSoftware',           // ✅ Autocomplete available
  table: 'software',           // ✅ Validates table exists  
  where: {
    name: { contains: 'Adobe' }, // ✅ Validates field exists
    status: { equals: 'Active' } // ✅ Validates against choices
  },
  sort: ['name'],              // ✅ Type-safe field names
  select: ['name', 'vendor']   // ✅ Type-safe field selection
})

// Return data is fully typed
console.log(software.docs[0].name) // ✅ TypeScript knows this exists
```

## How It Works

### Type Resolution System

Following Payload's pattern, this system uses conditional type resolution:

```typescript
// Base interface with fallbacks
export interface GeneratedTypes {
  appsUntyped: { [appName: string]: any }
  tablesUntyped: { [appName: string]: { [tableName: string]: any } }
  // ...other fallbacks
}

// Conditional resolution - use generated types if available, fallback otherwise
type ResolveAppType<T> = 'apps' extends keyof T ? T['apps'] : T['appsUntyped']
export type AppName = keyof ResolveAppType<GeneratedTypes>
```

### Module Declaration Merging

Generated types extend the base interface:

```typescript
// In generated quickbase-types.ts
declare module 'quicktype' {
  export interface GeneratedTypes extends Config {}
}
```

This provides:
- ✅ **Type safety when types exist**: Full autocomplete and validation
- ✅ **Graceful fallback**: Works without generated types using fallback types
- ✅ **Zero configuration**: Types are automatically discovered and applied

### Field Mapping Translation

The system automatically translates between friendly field names and QuickBase field IDs:

```typescript
// You write
where: { name: { contains: 'Adobe' } }

// Translated to QuickBase API
where: '{6.CT.Adobe}'  // Field ID 6 = name field
```

## API Reference

### Client Methods

All methods support full type safety when types are generated:

#### `find<TApp, TTable>(options)`
Find multiple records with pagination.

```typescript
const results = await quickbase.find({
  app: 'MyApp',
  table: 'users', 
  where: { email: { contains: '@company.com' } },
  sort: ['lastName', 'firstName'],
  limit: 50,
  page: 1,
  select: ['firstName', 'lastName', 'email']
})
```

#### `findByID<TApp, TTable>(options)`
Find a single record by ID.

```typescript
const user = await quickbase.findByID({
  app: 'MyApp',
  table: 'users',
  id: 123,
  select: ['firstName', 'lastName']
})
```

#### `create<TApp, TTable>(options)`
Create a new record.

```typescript
const newUser = await quickbase.create({
  app: 'MyApp',
  table: 'users',
  data: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@company.com'
  }
})
```

#### `update<TApp, TTable>(options)`
Update an existing record.

```typescript
const updated = await quickbase.update({
  app: 'MyApp', 
  table: 'users',
  id: 123,
  data: { email: 'newemail@company.com' }
})
```

#### `delete<TApp, TTable>(options)`
Delete a record.

```typescript
await quickbase.delete({
  app: 'MyApp',
  table: 'users', 
  id: 123
})
```

#### `count<TApp, TTable>(options)`
Count records matching criteria.

```typescript
const count = await quickbase.count({
  app: 'MyApp',
  table: 'users',
  where: { status: { equals: 'Active' } }
})
```

### Where Conditions

Rich filtering with type safety:

```typescript
where: {
  // Simple equality
  name: 'John Doe',
  
  // Operators
  age: { greaterThan: 18 },
  email: { contains: '@company.com' },
  status: { in: ['Active', 'Pending'] },
  
  // Boolean checks
  description: { isNotEmpty: true },
  
  // Logical operators
  and: [
    { department: { equals: 'Engineering' } },
    { startDate: { lessThan: '2023-01-01' } }
  ],
  or: [
    { role: { equals: 'Admin' } },
    { role: { equals: 'Manager' } }
  ]
}
```

### Sort Options

Type-safe sorting:

```typescript
// Single field
sort: 'lastName'

// Multiple fields  
sort: ['department', 'lastName', 'firstName']

// Descending (prefix with -)
sort: ['-createdDate', 'name']
```

## Type Generation Deep Dive

### Generated Files

#### `quickbase-types.ts`
Contains TypeScript interfaces for your QuickBase schema:

```typescript
export interface BgSoftwareSoftwareData {
  id?: number | string;
  name?: string;
  vendor?: string;
  type?: 'Cloud-Based' | 'Networked';
  status?: 'Enterprise' | 'Active' | 'Pilot' | 'Tracking' | 'Closed';
}

export interface Config {
  apps: { BgSoftware: BgSoftwareApp };
  tables: { BgSoftware: { software: BgSoftwareSoftwareTable } };
  tableData: { BgSoftware: { software: BgSoftwareSoftwareData } };
}

declare module 'quicktype' {
  export interface GeneratedTypes extends Config {}
}
```

#### `quickbase-mappings.ts` 
Contains field ID mappings for API translation:

```typescript
export const FieldMappings = {
  "BgSoftware": {
    "software": {
      "name": 6,
      "vendor": 8, 
      "type": 7,
      "status": 15
    }
  }
}
```

### Regenerating Types

Run type generation when your QuickBase schema changes:

```bash
pnpm generate
```

The generator will:
1. Connect to QuickBase APIs using your config
2. Discover all tables and fields in your apps
3. Generate TypeScript interfaces with proper types
4. Create field ID mappings for runtime translation
5. Add module declarations to extend the base types

## Graceful Degradation

### Without Generated Types

The system works immediately without type generation:

```typescript
// Works but with limited type safety
const results = await quickbase.find({
  app: 'MyApp',      // string (no validation)
  table: 'users',    // string (no validation) 
  where: { name: 'John' } // Record<string, any>
})
// results.docs is any[]
```

Field mapping falls back to QuickBase record ID (field 3).

### With Generated Types

After running `pnpm generate`:

```typescript
// Full type safety and validation
const results = await quickbase.find({
  app: 'MyApp',      // Only valid app names allowed
  table: 'users',    // Only valid table names for MyApp
  where: { name: 'John' } // Only valid field names, proper types
})
// results.docs is MyAppUsersData[]
```

## Comparison to Payload CMS

This system closely follows Payload's local API pattern:

| Feature | Payload | QuickBase Local API |
|---------|---------|-------------------|
| **Type Resolution** | `collections` → `collectionsUntyped` | `apps` → `appsUntyped` |
| **Module Declaration** | `declare module 'payload'` | `declare module 'quicktype'` |
| **Generated Types** | `payload-types.ts` | `quickbase-types.ts` |
| **Graceful Fallback** | ✅ Works without types | ✅ Works without types |
| **Type Safety** | ✅ Full when generated | ✅ Full when generated |
| **Local API** | `payload.find({ collection })` | `quickbase.find({ app, table })` |

## Environment Variables

```bash
# Required
QB_USER_TOKEN=your_quickbase_user_token

# App-specific tokens
BG_SOFTWARE_TOKEN=your_app_token
```

## Package Scripts

```json
{
  "scripts": {
    "generate": "quicktype-generate",
    "dev": "npm run generate && your-dev-command",
    "build": "npm run generate && your-build-command"
  }
}
```

## License

MIT 