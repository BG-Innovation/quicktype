#!/usr/bin/env node
// QuickBase Type Builder
// Discovers QuickBase schemas and generates JSON Schema + TypeScript types

import { promises as fs } from 'fs';
import path from 'path';
import { config as dotenvConfig } from 'dotenv';
import { compile } from 'json-schema-to-typescript';
import type { 
    DiscoveryConfig, 
    AppConfigEntry, 
    AppsConfig, 
    QuickBaseApiField,
    QuickBaseApiTable,
    QuickBaseApiApp
} from '../types';

// Load environment variables
dotenvConfig();

// Use node built-in fetch for Node 18+
const fetch = globalThis.fetch;

interface DiscoveredApp {
    name: string;
    appId: string;
    displayName: string;
    description?: string;
    generatedAt: string;
    tables: Record<string, DiscoveredTable>;
}

interface DiscoveredTable {
    tableId: string;
    displayName: string;
    friendlyName: string;
    fields: Record<string, DiscoveredField>;
}

interface DiscoveredField {
    fieldId: number;
    type: 'text' | 'email' | 'number' | 'date' | 'checkbox' | 'list' | 'file' | 'url';
    displayName: string;
    friendlyName: string;
    required: boolean;
    choices?: string[];
}

async function main() {
    console.log('QuickBase Type Builder - Generating JSON Schema + TypeScript Types');
    await discoverAndGenerateTypes();
}

async function discoverAndGenerateTypes(): Promise<void> {
    try {
        const configPath = path.join(process.cwd(), 'quicktypes.config.js');
        const configExists = await fs.access(configPath).then(() => true).catch(() => false);
        
        if (!configExists) {
            throw new Error(`Config file not found at ${configPath}. Please create quicktypes.config.js with your app configurations.`);
        }

        const appsConfig: AppsConfig = require(configPath);
        
        console.log(`Found ${appsConfig.apps.length} apps in config file`);
        
        const typesDir = path.join(process.cwd(), 'types', 'generated');
        await fs.mkdir(typesDir, { recursive: true });
        
        let successCount = 0;
        let failureCount = 0;
        
        for (const app of appsConfig.apps) {
            console.log(`\n--- Processing ${app.name} ---`);
            try {
                const discoveredApp = await discoverApp(app, appsConfig.global);
                await generateTypesForApp(discoveredApp, typesDir);
                console.log(`✓ Successfully generated types for ${app.name}`);
                successCount++;
            } catch (error) {
                console.error(`✗ Failed to process ${app.name}:`, error instanceof Error ? error.message : error);
                failureCount++;
            }
        }
        
        // Generate index file
        const appNames = appsConfig.apps.map(app => app.name.toLowerCase());
        await generateTypesIndex(typesDir, appNames);
        
        // Generate QuickBase client mappings and types
        const discoveredApps: DiscoveredApp[] = [];
        for (const app of appsConfig.apps) {
            try {
                const discoveredApp = await discoverApp(app, appsConfig.global);
                discoveredApps.push(discoveredApp);
            } catch (error) {
                // Skip failed apps for client generation
            }
        }
        
        if (discoveredApps.length > 0) {
            console.log('\n--- Generating QuickBase Client ---');
            await generateQuickBaseClient(discoveredApps, typesDir);
            console.log('✓ Generated QuickBase client with mappings');
        }
        
        console.log(`\n--- Summary ---`);
        console.log(`Successful: ${successCount}`);
        console.log(`Failed: ${failureCount}`);
        console.log(`Total: ${appsConfig.apps.length}`);
        
        if (failureCount > 0) {
            process.exit(1);
        }
        
        console.log('\n🎉 Type generation complete!');
    } catch (error) {
        console.error('Type generation failed:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

async function discoverApp(app: AppConfigEntry, globalConfig: AppsConfig['global']): Promise<DiscoveredApp> {
    const config: DiscoveryConfig = {
        appToken: app.appToken,
        userToken: globalConfig.userToken,
        realm: globalConfig.realm,
        appId: app.appId,
        baseUrl: globalConfig.baseUrl
    };

    // Validate required config
    if (!config.appToken) {
        throw new Error(`App token not provided for ${app.name}`);
    }
    if (!config.userToken) {
        throw new Error('User token not found in global config');
    }
    if (!config.appId) {
        throw new Error(`App ID not provided for ${app.name}`);
    }
    if (!config.realm) {
        throw new Error('Realm not found in global config');
    }

    console.log('Connecting to QuickBase API...');
    
    // Discover app information
    const appInfo = await getAppInfo(config);
    
    // Discover tables
    console.log('Discovering tables...');
    const tables = await getTables(config);
    
    // Build app configuration
    const appConfig: DiscoveredApp = {
        name: app.name,
        appId: config.appId,
        displayName: appInfo.name || app.name,
        description: app.description,
        generatedAt: new Date().toISOString(),
        tables: {}
    };

    // Discover fields for each table
    for (const table of tables) {
        console.log(`  Discovering fields for table: ${table.name}`);
        const fields = await getTableFields(config, table.id);
        
        const friendlyTableName = generateFriendlyTableName(table.name);
        
        appConfig.tables[friendlyTableName] = {
            tableId: table.id,
            displayName: table.name,
            friendlyName: friendlyTableName,
            fields: {}
        };

        // Process fields
        for (const field of fields) {
            const friendlyFieldName = generateFriendlyFieldName(field.label);
            
            appConfig.tables[friendlyTableName].fields[friendlyFieldName] = {
                fieldId: field.id,
                type: mapQuickBaseType(field.type),
                displayName: field.label,
                friendlyName: friendlyFieldName,
                required: field.required || false,
                choices: field.properties?.choices
            };
        }
    }

    console.log(`   App: ${appConfig.displayName} (${appConfig.appId})`);
    console.log(`   Tables: ${Object.keys(appConfig.tables).length}`);
    console.log(`   Fields: ${Object.values(appConfig.tables).reduce((sum: number, table: any) => sum + Object.keys(table.fields).length, 0)}`);
    
    return appConfig;
}

async function generateTypesForApp(app: DiscoveredApp, typesDir: string) {
    console.log('Generating JSON Schema and TypeScript types...');
    
    // Generate JSON Schema for the app
    const appSchema = generateAppSchema(app);
    
    // Save JSON Schema
    const schemasDir = path.join(process.cwd(), 'schemas');
    await fs.mkdir(schemasDir, { recursive: true });
    const schemaPath = path.join(schemasDir, `${app.name.toLowerCase()}.schema.json`);
    await fs.writeFile(schemaPath, JSON.stringify(appSchema, null, 2));
    
    // Generate TypeScript types
    const appInterface = await compile(appSchema as any, `${pascalCase(app.name)}App`, {
        bannerComment: `/**\n * Auto-generated types for ${app.displayName}\n * Generated from QuickBase app: ${app.appId}\n * Last updated: ${app.generatedAt}\n */`,
        style: {
            semi: true,
            singleQuote: false,
            tabWidth: 2,
            printWidth: 100
        }
    });
    
    // Generate table interface schemas
    const tableInterfaces: string[] = [];
    
    for (const [tableName, table] of Object.entries(app.tables)) {
        const tableSchema = generateTableSchema(table);
        const tableInterface = await compile(tableSchema as any, `${pascalCase(tableName)}Table`, {
            bannerComment: `// Table: ${table.displayName} (${table.tableId})`,
            style: {
                semi: true,
                singleQuote: false,
                tabWidth: 2,
                printWidth: 100
            }
        });
        
        tableInterfaces.push(tableInterface);
    }
    
    // Combine all interfaces
    const allTypes = [appInterface, ...tableInterfaces].join('\n\n');
    
    // Save TypeScript file
    const typesPath = path.join(typesDir, `${app.name.toLowerCase()}.types.ts`);
    await fs.writeFile(typesPath, allTypes);
}

// Re-use existing utility functions
async function getAppInfo(config: DiscoveryConfig): Promise<QuickBaseApiApp> {
    const response = await makeQuickBaseRequest(config, `/apps/${config.appId}`, 'GET');
    return { name: response.name || response.description || config.appId };
}

async function getTables(config: DiscoveryConfig): Promise<QuickBaseApiTable[]> {
    const response = await makeQuickBaseRequest(config, `/tables?appId=${config.appId}`, 'GET');
    return response.map((table: any) => ({
        id: table.id,
        name: table.name || `Table ${table.id}`
    }));
}

async function getTableFields(config: DiscoveryConfig, tableId: string): Promise<QuickBaseApiField[]> {
    const response = await makeQuickBaseRequest(config, `/fields?tableId=${tableId}`, 'GET');
    
    return response
        .filter((field: any) => !field.noWrap && field.fieldType !== 'summary')
        .map((field: any) => ({
            id: field.id,
            label: field.label,
            type: field.fieldType || 'text',
            required: field.required || false,
            properties: field.properties || null
        }));
}

async function makeQuickBaseRequest(config: DiscoveryConfig, endpoint: string, method: string): Promise<any> {
    const url = `${config.baseUrl}${endpoint}`;
    
    const headers: any = {
        'QB-Realm-Hostname': config.realm,
        'Authorization': `QB-USER-TOKEN ${config.userToken}`,
        'QB-App-Token': config.appToken,
        'Content-Type': 'application/json'
    };

    const response = await fetch(url, {
        method,
        headers
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`QuickBase API request failed: ${response.status} ${response.statusText}\n${errorText}`);
    }

    return await response.json();
}

function generateFriendlyTableName(tableName: string): string {
    return tableName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '');
}

function generateFriendlyFieldName(fieldLabel: string): string {
    let normalized = fieldLabel
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '');

    // Apply intelligent naming patterns
    const patterns = [
        { regex: /^record.*id.*$/i, replacement: 'id' },
        { regex: /^(first|fname).*name$/i, replacement: 'firstName' },
        { regex: /^(last|lname).*name$/i, replacement: 'lastName' },
        { regex: /^(project|proj).*name$/i, replacement: 'projectName' },
        { regex: /^(company|comp).*name$/i, replacement: 'companyName' },
        { regex: /^created.*date$/i, replacement: 'createdDate' },
        { regex: /^modified.*date$/i, replacement: 'modifiedDate' },
        { regex: /^date.*created$/i, replacement: 'createdDate' },
        { regex: /^date.*modified$/i, replacement: 'modifiedDate' },
        { regex: /^email.*address$/i, replacement: 'email' },
        { regex: /^phone.*number$/i, replacement: 'phoneNumber' },
        { regex: /^job.*title$/i, replacement: 'title' },
        { regex: /^employee.*id$/i, replacement: 'employeeId' },
        { regex: /^customer.*id$/i, replacement: 'customerId' }
    ];

    for (const pattern of patterns) {
        if (pattern.regex.test(normalized)) {
            return pattern.replacement;
        }
    }

    return normalized || 'unknownField';
}

function mapQuickBaseType(qbType: string): 'text' | 'email' | 'number' | 'date' | 'checkbox' | 'list' | 'file' | 'url' {
    const typeMap: { [key: string]: 'text' | 'email' | 'number' | 'date' | 'checkbox' | 'list' | 'file' | 'url' } = {
        // Text-based fields
        'text': 'text',
        'richtext': 'text',
        'textarea': 'text',
        'multilinetext': 'text',
        'textmultiline': 'text',
        
        // Contact fields
        'email': 'email',
        'phone': 'text',
        'phoneNumber': 'text',
        'fax': 'text',
        
        // Number-based fields
        'numeric': 'number',
        'currency': 'number',
        'percent': 'number',
        'rating': 'number',
        'duration': 'number',
        'timeofday': 'text',
        'iaddress': 'text',
        
        // Date/Time fields
        'date': 'date',
        'datetime': 'date',
        'timestamp': 'date',
        'time': 'text',
        
        // Choice fields
        'checkbox': 'checkbox',
        'multipleChoice': 'list',
        'multichoice': 'list',
        'list': 'list',
        'dropdown': 'list',
        
        // File and URL fields
        'file': 'file',
        'url': 'url',
        'dblink': 'url',
        'formula-url': 'url',
        
        // Relationship and reference fields
        'recordid': 'number',
        'lookup': 'text',
        'userid': 'text',
        'user': 'text',
        
        // Calculated fields
        'formula': 'text',
        'summary': 'text',
        'snapshot': 'text',
        'predecessor': 'text',
        
        // Special system fields
        'autoincrement': 'number',
        'autonumber': 'number',
        'icalendarbutton': 'text',
        'reportlink': 'url',
        'address': 'text'
    };

    return typeMap[qbType.toLowerCase()] || 'text';
}

// Schema generation functions (reused from generate-types.ts)
function generateAppSchema(app: DiscoveredApp) {
    return {
        $schema: "http://json-schema.org/draft-07/schema#",
        type: "object",
        title: `${app.displayName} App`,
        description: app.description || `QuickBase app: ${app.displayName}`,
        properties: {
            name: { type: "string", const: app.name },
            appId: { type: "string", const: app.appId },
            displayName: { type: "string", const: app.displayName },
            description: { type: "string" },
            generatedAt: { type: "string", format: "date-time" },
            tables: {
                type: "object",
                properties: Object.fromEntries(
                    Object.entries(app.tables).map(([name, table]) => [
                        name,
                        { $ref: `#/definitions/${pascalCase(name)}Table` }
                    ])
                ),
                additionalProperties: false
            }
        },
        required: ["name", "appId", "displayName", "generatedAt", "tables"],
        additionalProperties: false,
        definitions: Object.fromEntries(
            Object.entries(app.tables).map(([name, table]) => [
                `${pascalCase(name)}Table`,
                generateTableSchemaDefinition(table)
            ])
        )
    };
}

function generateTableSchema(table: DiscoveredTable) {
    return {
        $schema: "http://json-schema.org/draft-07/schema#",
        type: "object",
        title: table.displayName,
        description: `QuickBase table: ${table.displayName} (${table.tableId})`,
        properties: {
            tableId: { type: "string", const: table.tableId },
            displayName: { type: "string", const: table.displayName },
            friendlyName: { type: "string", const: table.friendlyName },
            fields: {
                type: "object",
                properties: Object.fromEntries(
                    Object.entries(table.fields).map(([name, field]) => [
                        name,
                        generateFieldSchema(field)
                    ])
                ),
                additionalProperties: false
            }
        },
        required: ["tableId", "displayName", "friendlyName", "fields"],
        additionalProperties: false
    };
}

function generateTableSchemaDefinition(table: DiscoveredTable) {
    return {
        type: "object",
        properties: {
            tableId: { type: "string" },
            displayName: { type: "string" },
            friendlyName: { type: "string" },
            fields: {
                type: "object",
                properties: Object.fromEntries(
                    Object.entries(table.fields).map(([name, field]) => [
                        name,
                        generateFieldSchema(field)
                    ])
                ),
                additionalProperties: false
            }
        },
        required: ["tableId", "displayName", "friendlyName", "fields"],
        additionalProperties: false
    };
}

function generateFieldSchema(field: DiscoveredField) {
    const properties: any = {
        fieldId: { type: "number", const: field.fieldId },
        type: { 
            type: "string", 
            enum: ["text", "email", "number", "date", "checkbox", "list", "file", "url"],
            const: field.type 
        },
        displayName: { type: "string", const: field.displayName },
        friendlyName: { type: "string", const: field.friendlyName },
        required: { type: "boolean", const: field.required }
    };

    const required = ["fieldId", "type", "displayName", "friendlyName", "required"];

    if (field.choices && field.choices.length > 0) {
        properties.choices = {
            type: "array",
            items: field.choices.map(choice => ({ const: choice })),
            minItems: field.choices.length,
            maxItems: field.choices.length
        };
        required.push("choices");
    }

    return {
        type: "object",
        properties,
        required,
        additionalProperties: false
    };
}

async function generateTypesIndex(typesDir: string, appNames: string[]) {
    const indexContent = `// Auto-generated index file for QuickBase types
// This file exports all generated app types

${appNames.map(name => `export * from './${name}.types';`).join('\n')}

// Re-export common interfaces
export interface QuickBaseField {
    fieldId: number;
    type: 'text' | 'email' | 'number' | 'date' | 'checkbox' | 'list' | 'file' | 'url';
    displayName: string;
    friendlyName: string;
    required: boolean;
    choices?: string[];
}

export interface QuickBaseTable {
    tableId: string;
    displayName: string;
    friendlyName: string;
    fields: Record<string, QuickBaseField>;
}

export interface QuickBaseApp {
    name: string;
    appId: string;
    displayName: string;
    description?: string;
    generatedAt: string;
    tables: Record<string, QuickBaseTable>;
}
`;

    await fs.writeFile(path.join(typesDir, 'index.ts'), indexContent);
}

function generateFieldMappings(discoveredApps: DiscoveredApp[]) {
    const mappings: any = {};
    
    for (const app of discoveredApps) {
        const appKey = app.name.toLowerCase();
        mappings[appKey] = {};
        
        for (const [tableName, table] of Object.entries(app.tables)) {
            mappings[appKey][tableName] = {};
            
            for (const [fieldName, field] of Object.entries(table.fields)) {
                mappings[appKey][tableName][fieldName] = field.fieldId;
            }
        }
    }
    
    return mappings;
}

function generateTableMappings(discoveredApps: DiscoveredApp[]) {
    const mappings: any = {};
    
    for (const app of discoveredApps) {
        const appKey = app.name.toLowerCase();
        mappings[appKey] = {};
        
        for (const [tableName, table] of Object.entries(app.tables)) {
            mappings[appKey][tableName] = table.tableId;
        }
    }
    
    return mappings;
}

function generateAppConfig(discoveredApps: DiscoveredApp[]) {
    const config: any = {};
    
    for (const app of discoveredApps) {
        const appKey = app.name.toLowerCase();
        config[appKey] = {
            appId: app.appId,
            name: app.name
        };
    }
    
    return config;
}

// Convert title to interface name the same way json-schema-to-typescript does
function titleToInterfaceName(title: string): string {
    return title
        .replace(/[^a-zA-Z0-9]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map(word => {
            // Preserve all-caps acronyms like "BG"
            if (word.toUpperCase() === word && word.length <= 3) {
                return word.toUpperCase();
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join('');
}

function generateImports(discoveredApps: DiscoveredApp[]): string {
    const imports = discoveredApps.map(app => {
        // Use the same naming logic as json-schema-to-typescript
        const appInterfaceName = titleToInterfaceName(`${app.displayName} App`);
        const tableImports = Object.keys(app.tables).map(table => pascalCase(table) + 'Table').join(', ');
        return `import type { ${appInterfaceName}, ${tableImports} } from './${app.name.toLowerCase()}.types.js';`;
    });
    
    return imports.join('\n');
}

function generateAppRegistry(discoveredApps: DiscoveredApp[]): string {
    const registryEntries = discoveredApps.map(app => {
        const appKey = app.name.toLowerCase();
        // Use the same naming logic as json-schema-to-typescript
        const appInterfaceName = titleToInterfaceName(`${app.displayName} App`);
        return `  ${appKey}: ${appInterfaceName}`;
    });
    
    const tableRegistryEntries = discoveredApps.map(app => {
        const appKey = app.name.toLowerCase();
        const tableEntries = Object.keys(app.tables).map(tableName => 
            `    ${tableName}: ${pascalCase(tableName)}Table`
        );
        
        return `  ${appKey}: {\n${tableEntries.join('\n')}\n  }`;
    });
    
    return `// App registry - maps app names to their generated types
export interface AppRegistry {
${registryEntries.join('\n')}
}

// Table registry for each app
export interface AppTableRegistry {
${tableRegistryEntries.join('\n')}
}

// Extract app names from registry
export type AppName = keyof AppRegistry;

// Extract table names for a specific app
export type TableName<TApp extends AppName> = keyof AppTableRegistry[TApp];

// Get table type for specific app and table
export type AppTable<TApp extends AppName, TTable extends TableName<TApp>> = AppTableRegistry[TApp][TTable];`;
}

function generateDataTypes(discoveredApps: DiscoveredApp[]): string {
    const dataTypes: string[] = [];
    
    for (const app of discoveredApps) {
        for (const [tableName, table] of Object.entries(app.tables)) {
            const typeName = `${pascalCase(tableName)}Data`;
            const fields: string[] = ['  id?: number | string'];
            
            for (const [fieldName, field] of Object.entries(table.fields)) {
                let typeStr = 'string'; // default
                
                switch (field.type) {
                    case 'number':
                        typeStr = 'number';
                        break;
                    case 'checkbox':
                        typeStr = 'boolean';
                        break;
                    case 'date':
                        typeStr = 'string';
                        break;
                    case 'text':
                    case 'email':
                    case 'url':
                    default:
                        if (field.choices && field.choices.length > 0 && field.choices.length <= 10) {
                            // Only create union types for reasonable number of choices
                            typeStr = field.choices.map(choice => `'${choice}'`).join(' | ');
                        } else {
                            typeStr = 'string';
                        }
                        break;
                }
                
                fields.push(`  ${fieldName}?: ${typeStr}`);
            }
            
            dataTypes.push(`export type ${typeName} = {\n${fields.join('\n')}\n}`);
        }
    }
    
    // Generate table data map
    const tableDataMaps = discoveredApps.map(app => {
        const appKey = app.name.toLowerCase();
        const tableEntries = Object.keys(app.tables).map(tableName => 
            `    ${tableName}: ${pascalCase(tableName)}Data`
        );
        
        return `  ${appKey}: {\n${tableEntries.join('\n')}\n  }`;
    });
    
    dataTypes.push(`
// Map table names to their data types
export type TableDataMap = {
${tableDataMaps.join('\n')}
}`);
    
    // Generate GetTableData type with proper constraints
    const getTableDataCases = discoveredApps.map(app => {
        const appKey = app.name.toLowerCase();
        return `TApp extends '${appKey}' ? TTable extends keyof TableDataMap['${appKey}'] ? TableDataMap['${appKey}'][TTable] : Record<string, any>`;
    });
    
    dataTypes.push(`
// Get data type for app/table combination
export type GetTableData<TApp extends AppName, TTable extends TableName<TApp>> = 
  ${getTableDataCases.join(' : ')} : Record<string, any>;`);
    
    return dataTypes.join('\n\n');
}

async function generateQuickBaseClient(discoveredApps: DiscoveredApp[], typesDir: string) {
    // Generate field mappings
    const fieldMappings = generateFieldMappings(discoveredApps);
    
    // Generate table mappings
    const tableMappings = generateTableMappings(discoveredApps);
    
    // Generate data type definitions
    const dataTypes = generateDataTypes(discoveredApps);
    
    // Generate app registry
    const appRegistry = generateAppRegistry(discoveredApps);
    
    // Create the client mappings file
    const clientMappingsContent = `// Auto-generated QuickBase client mappings and types
// Generated from discovered QuickBase schemas

${generateImports(discoveredApps)}

${appRegistry}

${dataTypes}

// Field ID mappings
const FieldMappings = ${JSON.stringify(fieldMappings, null, 2)} as const;

// Table ID mappings  
const TableMappings = ${JSON.stringify(tableMappings, null, 2)} as const;

// App configuration mapping
export const AppConfig = ${JSON.stringify(generateAppConfig(discoveredApps), null, 2)} as const;

// Field name to ID mapping utility
export function getFieldId<TApp extends AppName, TTable extends TableName<TApp>>(
  app: TApp,
  table: TTable,
  fieldName: string
): number {
  const appMappings = FieldMappings[app as keyof typeof FieldMappings];
  if (appMappings) {
    const tableMappings = appMappings[table as keyof typeof appMappings];
    if (tableMappings && typeof tableMappings === 'object') {
      const fieldId = (tableMappings as Record<string, number>)[fieldName];
      if (typeof fieldId === 'number') {
        return fieldId;
      }
    }
  }
  
  // Fallback - try to parse as number or default to record ID field
  const fieldId = parseInt(fieldName);
  return isNaN(fieldId) ? 3 : fieldId;
}

// Table ID mapping
export function getTableId<TApp extends AppName, TTable extends TableName<TApp>>(
  app: TApp,
  table: TTable
): string {
  const appMappings = TableMappings[app as keyof typeof TableMappings];
  if (appMappings) {
    const tableId = appMappings[table as keyof typeof appMappings];
    if (typeof tableId === 'string') {
      return tableId;
    }
  }
  
  return String(table);
}
`;

    await fs.writeFile(path.join(typesDir, 'client-mappings.ts'), clientMappingsContent);
    
    // Generate the main client interface
    await generateTypedClient(discoveredApps, typesDir);
}

async function generateTypedClient(discoveredApps: DiscoveredApp[], typesDir: string) {
    const clientContent = `// Auto-generated strongly-typed QuickBase client
// This provides the clean, Payload-like interface you requested

import type { 
  AppName, 
  TableName, 
  GetTableData
} from './client-mappings.js';
import { getFieldId, getTableId, AppConfig } from './client-mappings.js';

// Base client configuration - only needs secrets, not full config
export interface QuickBaseClientConfig {
  userToken: string;
  realm: string;
  baseUrl?: string;
}

// Query operators for where clauses
export type QuickBaseOperator = 
  | 'EX' // exists
  | 'TV' // true/false
  | 'IR' // contains
  | 'SW' // starts with
  | 'EW' // ends with
  | 'CT' // equal to
  | 'XCT' // not equal to
  | 'GT' // greater than
  | 'GTE' // greater than or equal
  | 'LT' // less than
  | 'LTE' // less than or equal
  | 'BF' // before (date)
  | 'AF' // after (date)
  | 'OBF' // on or before (date)
  | 'OAF' // on or after (date)

export type QuickBaseWhereField = {
  [key in QuickBaseOperator]?: any
}

export type QuickBaseWhere = {
  [fieldName: string]: QuickBaseWhere[] | QuickBaseWhereField | any
  AND?: QuickBaseWhere[]
  OR?: QuickBaseWhere[]
}

export type QuickBaseSort<TApp extends AppName, TTable extends TableName<TApp>> = Array<{
  field: keyof GetTableData<TApp, TTable>
  order?: 'ASC' | 'DESC'
}> | string

export type QuickBaseSelect<TApp extends AppName, TTable extends TableName<TApp>> = Partial<{
  [K in keyof GetTableData<TApp, TTable>]: boolean
}>

// Paginated response
export interface PaginatedResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingInfo: {
    hasNextPage: boolean
    hasPrevPage: boolean
    nextPage: number | null
    prevPage: number | null
  }
}

// Transform type based on select - extracts only selected fields
export type TransformWithSelect<
  TData extends Record<string, any>,
  TSelect extends Partial<Record<string, boolean>>
> = {
  [K in keyof TData as K extends keyof TSelect
    ? TSelect[K] extends true
      ? K
      : never
    : K extends 'id'
      ? K  // Always include ID field
      : never
  ]: TData[K]
}

// Operation options
export interface FindOptions<TApp extends AppName, TTable extends TableName<TApp>, TSelect extends QuickBaseSelect<TApp, TTable> = never> {
  app: TApp
  table: TTable
  where?: QuickBaseWhere
  sort?: QuickBaseSort<TApp, TTable>
  limit?: number
  page?: number
  select?: TSelect
}

export interface FindByIDOptions<TApp extends AppName, TTable extends TableName<TApp>, TSelect extends QuickBaseSelect<TApp, TTable> = never> {
  app: TApp
  table: TTable
  id: string | number
  select?: TSelect
}

export interface CreateOptions<TApp extends AppName, TTable extends TableName<TApp>> {
  app: TApp
  table: TTable
  data: Partial<GetTableData<TApp, TTable>>
  mergeFieldId?: number
}

export interface UpdateOptions<TApp extends AppName, TTable extends TableName<TApp>, TSelect extends QuickBaseSelect<TApp, TTable> = never> {
  app: TApp
  table: TTable
  id?: string | number
  where?: QuickBaseWhere
  data: Partial<GetTableData<TApp, TTable>>
  select?: TSelect
  upsert?: boolean
}

export interface DeleteOptions<TApp extends AppName, TTable extends TableName<TApp>> {
  app: TApp
  table: TTable
  id?: string | number
  where?: QuickBaseWhere
}

export interface CountOptions<TApp extends AppName, TTable extends TableName<TApp>> {
  app: TApp
  table: TTable
  where?: QuickBaseWhere
}

// Main QuickBase client class
export class QuickBaseClient {
  private config: QuickBaseClientConfig

  constructor(config: QuickBaseClientConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || 'https://api.quickbase.com/v1'
    }
  }

  async find<
    TApp extends AppName,
    TTable extends TableName<TApp>,
    TSelect extends QuickBaseSelect<TApp, TTable> = never
  >(
    options: FindOptions<TApp, TTable, TSelect>
  ): Promise<PaginatedResponse<GetTableData<TApp, TTable>>> {
    const { app, table, where, sort, limit = 25, page = 1, select } = options
    
    const appConfig = AppConfig[app]
    const tableId = getTableId(app, table)
    
    // Build QuickBase query
    const qbQuery = this.transformWhereToQBQuery(app, table, where)
    const qbSort = this.transformSortToQBFormat(app, table, sort)
    const qbSelect = this.transformSelectToQBFormat(app, table, select)
    
    const skip = (page - 1) * limit
    
    const requestBody: any = {
      from: tableId,
      options: {
        skip,
        top: limit,
        compareWithAppLocalTime: false
      }
    }
    
    if (qbQuery) requestBody.where = qbQuery
    if (qbSort.length > 0) requestBody.sortBy = qbSort
    if (qbSelect && qbSelect.length > 0) requestBody.select = qbSelect
    
    const response = await this.makeRequest('/records/query', {
      method: 'POST',
      data: requestBody,
      appToken: this.getAppToken(app)
    })
    
    const docs = response.data || []
    const totalRecords = response.metadata?.totalRecords || docs.length
    const totalPages = Math.ceil(totalRecords / limit)
    
    return {
      docs: docs.map((doc: any) => this.transformRecord(app, table, doc)),
      totalDocs: totalRecords,
      limit,
      totalPages,
      page,
      pagingInfo: {
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
      }
    }
  }

  async findByID<
    TApp extends AppName,
    TTable extends TableName<TApp>,
    TSelect extends QuickBaseSelect<TApp, TTable> = never
  >(
    options: FindByIDOptions<TApp, TTable, TSelect>
  ): Promise<GetTableData<TApp, TTable> | null> {
    const { app, table, id, select } = options
    
    const result = await this.find({
      app,
      table,
      where: { id: { CT: id } },
      limit: 1,
      ...(select && { select })
    })
    
    return result.docs[0] || null
  }

  async create<TApp extends AppName, TTable extends TableName<TApp>>(
    options: CreateOptions<TApp, TTable>
  ): Promise<GetTableData<TApp, TTable>> {
    const { app, table, data, mergeFieldId } = options
    
    const appConfig = AppConfig[app]
    const tableId = getTableId(app, table)
    
    const recordData: any = {}
    for (const [fieldName, value] of Object.entries(data)) {
      if (fieldName === 'id') continue // Skip ID field for create
      const fieldId = getFieldId(app, table, fieldName)
      recordData[fieldId] = { value }
    }
    
    const requestBody: any = {
      to: tableId,
      data: [recordData],
      fieldsToReturn: [3] // Return at least the Record ID
    }
    
    if (mergeFieldId) requestBody.mergeFieldId = mergeFieldId
    
    const response = await this.makeRequest('/records', {
      method: 'POST',
      data: requestBody,
      appToken: this.getAppToken(app)
    })
    
    const created = response.data[0]
    return this.transformRecord(app, table, created)
  }

  async update<
    TApp extends AppName,
    TTable extends TableName<TApp>,
    TSelect extends QuickBaseSelect<TApp, TTable> = never
  >(
    options: UpdateOptions<TApp, TTable, TSelect>
  ): Promise<GetTableData<TApp, TTable>> {
    const { app, table, id, where, data, select, upsert = false } = options
    
    const appConfig = AppConfig[app]
    const tableId = getTableId(app, table)
    
    const recordData: any = {}
    
    if (id) {
      recordData['3'] = { value: id } // Record ID field
    }
    
    for (const [fieldName, value] of Object.entries(data)) {
      if (fieldName === 'id') continue
      const fieldId = getFieldId(app, table, fieldName)
      recordData[fieldId] = { value }
    }
    
    const qbSelect = this.transformSelectToQBFormat(app, table, select)
    
    const requestBody: any = {
      to: tableId,
      data: [recordData],
      fieldsToReturn: qbSelect || [3]
    }
    
    if (upsert) requestBody.mergeFieldId = 3
    
    const response = await this.makeRequest('/records', {
      method: 'POST',
      data: requestBody,
      appToken: this.getAppToken(app)
    })
    
    const updated = response.data[0]
    return this.transformRecord(app, table, updated)
  }

  async delete<TApp extends AppName, TTable extends TableName<TApp>>(
    options: DeleteOptions<TApp, TTable>
  ): Promise<GetTableData<TApp, TTable>> {
    const { app, table, id, where } = options
    
    // First get the record to return it
    let recordToDelete
    if (id) {
      recordToDelete = await this.findByID({ app, table, id })
    } else if (where) {
      const result = await this.find({ app, table, where, limit: 1 })
      recordToDelete = result.docs[0]
    }
    
    if (!recordToDelete) {
      throw new Error('Record not found')
    }
    
    const appConfig = AppConfig[app]
    const tableId = getTableId(app, table)
    
    let qbQuery = ''
    if (id) {
      qbQuery = \`{3.EX.\${id}}\`
    } else if (where) {
      qbQuery = this.transformWhereToQBQuery(app, table, where)
    }
    
    await this.makeRequest('/records', {
      method: 'DELETE',
      data: { from: tableId, where: qbQuery },
      appToken: this.getAppToken(app)
    })
    
    return recordToDelete
  }

  async count<TApp extends AppName, TTable extends TableName<TApp>>(
    options: CountOptions<TApp, TTable>
  ): Promise<{ totalDocs: number }> {
    const { app, table, where } = options
    
    const result = await this.find({
      app,
      table,
      where,
      limit: 1
    })
    
    return { totalDocs: result.totalDocs }
  }

  // Helper methods
  private transformWhereToQBQuery<TApp extends AppName, TTable extends TableName<TApp>>(
    app: TApp,
    table: TTable,
    where?: QuickBaseWhere
  ): string {
    if (!where) return ''
    
    const buildCondition = (condition: QuickBaseWhere): string => {
      const conditions: string[] = []

      for (const [key, value] of Object.entries(condition)) {
        if (key === 'AND' && Array.isArray(value)) {
          const andConditions = value.map(buildCondition).filter(Boolean)
          if (andConditions.length > 0) {
            conditions.push(\`(\${andConditions.join(' AND ')})\`)
          }
        } else if (key === 'OR' && Array.isArray(value)) {
          const orConditions = value.map(buildCondition).filter(Boolean)
          if (orConditions.length > 0) {
            conditions.push(\`(\${orConditions.join(' OR ')})\`)
          }
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          for (const [operator, operatorValue] of Object.entries(value)) {
            if (operatorValue !== undefined) {
              const fieldId = getFieldId(app, table, key)
              conditions.push(\`{\${fieldId}.\${operator}.'\${operatorValue}'}\`)
            }
          }
        } else if (value !== undefined) {
          const fieldId = getFieldId(app, table, key)
          conditions.push(\`{\${fieldId}.CT.'\${value}'}\`)
        }
      }

      return conditions.join(' AND ')
    }

    return buildCondition(where)
  }

  private transformSortToQBFormat<TApp extends AppName, TTable extends TableName<TApp>>(
    app: TApp,
    table: TTable,
    sort?: QuickBaseSort<TApp, TTable>
  ): Array<{ fieldId: number; order: 'ASC' | 'DESC' }> {
    if (!sort) return []

    if (typeof sort === 'string') {
      const isDesc = sort.startsWith('-')
      const fieldName = isDesc ? sort.substring(1) : sort
      const fieldId = getFieldId(app, table, fieldName)
      return [{ fieldId, order: isDesc ? 'DESC' : 'ASC' }]
    }

    if (Array.isArray(sort)) {
      return sort.map(item => ({
        fieldId: getFieldId(app, table, String(item.field)),
        order: item.order || 'ASC'
      }))
    }

    return []
  }

  private transformSelectToQBFormat<TApp extends AppName, TTable extends TableName<TApp>>(
    app: TApp,
    table: TTable,
    select?: QuickBaseSelect<TApp, TTable>
  ): number[] | undefined {
    if (!select) return undefined

    const selectedFields = Object.entries(select)
      .filter(([_, included]) => included === true)
      .map(([fieldName]) => getFieldId(app, table, fieldName))

    return selectedFields.length > 0 ? selectedFields : undefined
  }

  private transformRecord<TApp extends AppName, TTable extends TableName<TApp>>(
    app: TApp,
    table: TTable,
    record: any
  ): GetTableData<TApp, TTable> {
    const result: any = {}

    for (const [fieldId, fieldData] of Object.entries(record)) {
      if (fieldData && typeof fieldData === 'object' && 'value' in fieldData) {
        result[fieldId] = (fieldData as { value: any }).value
      } else {
        result[fieldId] = fieldData
      }
    }

    return result
  }

  private async makeRequest(endpoint: string, options: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    data?: any
    appToken: string
  }) {
    const url = \`\${this.config.baseUrl}\${endpoint}\`

    const headers: Record<string, string> = {
      'QB-Realm-Hostname': this.config.realm,
      'Authorization': \`QB-USER-TOKEN \${this.config.userToken}\`,
      'QB-App-Token': options.appToken,
      'Content-Type': 'application/json'
    }

    const requestOptions: RequestInit = {
      method: options.method,
      headers
    }

    if (options.data && (options.method === 'POST' || options.method === 'PUT')) {
      requestOptions.body = JSON.stringify(options.data)
    }

    const response = await fetch(url, requestOptions)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(\`QuickBase API Error: \${response.status} \${response.statusText}\\n\${errorText}\`)
    }

    return await response.json()
  }

  private getAppToken(app: AppName): string {
    // This would be enhanced to get app tokens from environment or config
    // For now, this is a placeholder that should be filled by the user
    const envVar = \`\${app.toUpperCase()}_APP_TOKEN\`
    return process.env[envVar] || ''
  }
}

// Factory function to create client
export function createQuickBaseClient(config: QuickBaseClientConfig): QuickBaseClient {
  return new QuickBaseClient(config)
}

export default QuickBaseClient
`;

    await fs.writeFile(path.join(typesDir, 'client.ts'), clientContent);
}

function pascalCase(str: string): string {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]/g, ' ')
        .replace(/(?:^|\s)([a-z])/g, (_, char) => char.toUpperCase())
        .replace(/\s/g, '');
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

export { main as buildTypes }; 