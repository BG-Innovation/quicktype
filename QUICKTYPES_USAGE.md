# QuickTypes Usage

**Automatic type generation** from QuickBase schemas using JSON Schema and TypeScript.

## 🚀 Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Set up your `.env` file:**
```bash
# Global QuickBase settings
QUICKBASE_USER_TOKEN=your-global-user-token
QUICKBASE_REALM=your-realm.quickbase.com
QUICKBASE_BASE_URL=https://api.quickbase.com/v1

# App-specific tokens and IDs
BG_SOFTWARE_APP_ID=your-app-id-1
BG_SOFTWARE_APP_TOKEN=your-app-token-1

CUSTOMER_DB_APP_ID=your-app-id-2
CUSTOMER_DB_APP_TOKEN=your-app-token-2
```

3. **Configure your apps in `quicktypes.config.js`:**
```javascript
module.exports = {
  apps: [
    {
      name: "BG_SOFTWARE",
      appId: process.env.BG_SOFTWARE_APP_ID,
      appToken: process.env.BG_SOFTWARE_APP_TOKEN,
      description: "Background Software Management"
    }
    // Add more apps...
  ],
  global: {
    userToken: process.env.QUICKBASE_USER_TOKEN,
    realm: process.env.QUICKBASE_REALM,
    baseUrl: process.env.QUICKBASE_BASE_URL || "https://api.quickbase.com/v1"
  }
};
```

4. **Generate everything:**
```bash
npm run generate
```

## 🔄 The Pipeline

```
QuickBase Apps → Discovery → JSON Schema → TypeScript Types
```

**Single command:**
- `npm run generate` - Discovers QuickBase schemas, generates JSON Schema, and creates TypeScript types

## 📁 Generated Structure

```
├── quicktypes.config.js    # App configuration
├── scripts/
│   └── generate.ts         # QuickBase discovery & type generation
├── schemas/                # JSON Schemas (gitignored)
│   ├── bg_software.schema.json
│   └── customer_db.schema.json
├── types/
│   ├── index.ts           # Manual types
│   └── generated/         # Auto-generated types (gitignored)
│       ├── index.ts       # Re-exports all app types
│       ├── bg_software.types.ts
│       └── customer_db.types.ts
└── .env                   # Environment variables (gitignored)
```

## 💻 Using Generated Types

**Perfect IntelliSense and type safety:**

```typescript
import type { BgSoftwareApp, UsersTable } from './types/generated';

// Load your app data with full type safety
const appData: BgSoftwareApp = require('./generated/bg_software.json');

// Type-safe field access with autocomplete
const usersTable = appData.tables.users;
const emailField = usersTable.fields.email; // TypeScript knows this exists!

// Field properties are strongly typed
console.log(emailField.fieldId);      // number
console.log(emailField.type);         // 'email'
console.log(emailField.required);     // boolean
console.log(emailField.displayName);  // string
```

**Query with confidence:**
```typescript
// TypeScript will catch typos and missing fields
const userName = appData.tables.users.fields.firstName.displayName;
//                                    ^^^^^^^^^ 
//                                    Auto-complete works perfectly!
```

## 🔧 Scripts

- `npm run generate` - Discover QuickBase schemas and generate types
- `npm run types` - Alias for generate
- `npm run dev` - Alias for generate

## ✨ Benefits

### 🎯 **Automatic Type Safety**
- No manual type definition
- Types automatically reflect your QuickBase schema
- Catch schema mismatches at compile time

### 🔄 **Always Up-to-Date**  
- Run `npm run generate` when QuickBase changes
- Types automatically regenerate to match current schema
- Never worry about drift between code and database

### 🧠 **Perfect DX**
- Full IntelliSense for all fields, tables, and apps
- Autocomplete shows only fields that actually exist  
- TypeScript catches typos and missing properties

### 🏗️ **Scalable Architecture**
- JSON Schema as intermediate format
- Easy to extend with additional generators
- Clean separation of concerns

## 🔍 Advanced Usage

**Custom field type mapping:**
The discovery script handles all QuickBase field types and maps them to:
- `text` | `email` | `number` | `date` | `checkbox` | `list` | `file` | `url`

**Schema validation:**
Generated JSON Schemas can validate your QuickBase data structure for runtime safety.

**Multiple apps:**
Add any number of apps to `quicktypes.config.js` and they'll all be processed automatically. 