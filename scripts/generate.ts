#!/usr/bin/env node
// QuickBase Type Builder
// Discovers QuickBase schemas and generates JSON Schema + TypeScript types

import { promises as fs } from 'fs';
import path from 'path';
import { config as dotenvConfig } from 'dotenv';
import { compile } from 'json-schema-to-typescript';
import type { 
    DiscoveryConfig, 
    QuickBaseApiField,
    QuickBaseApiTable,
    QuickBaseApiApp
} from '../types/quickbase';
import type { QuickBaseConfig, QuickBaseAppConfig } from '../types/config';

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
        const configPath = path.join(process.cwd(), 'quickbase.config.ts');
        const configExists = await fs.access(configPath).then(() => true).catch(() => false);
        
        if (!configExists) {
            throw new Error(`Config file not found at ${configPath}. Please create quickbase.config.ts with your app configurations.`);
        }

        // Temporarily use ts-node to load the TypeScript config without a full build
        require('ts-node').register({
            transpileOnly: true,
            compilerOptions: {
                module: 'commonjs'
            }
        });

        const configModule = require(configPath);
        const appsConfig: QuickBaseConfig = configModule.default || configModule;
        
        console.log(`Found ${appsConfig.apps.length} apps in config file`);
        
        const typesDir = path.join(process.cwd(), 'types', 'generated');
        await fs.mkdir(typesDir, { recursive: true });
        
        let successCount = 0;
        let failureCount = 0;
        const discoveredApps: DiscoveredApp[] = [];
        
        for (const app of appsConfig.apps) {
            console.log(`\n--- Processing ${app.slug} ---`);
            try {
                const discoveredApp = await discoverApp(app, appsConfig);
                discoveredApps.push(discoveredApp);
                await generateTypesForApp(discoveredApp, typesDir);
                console.log(`✓ Successfully generated types for ${app.slug}`);
                successCount++;
            } catch (error) {
                console.error(`✗ Failed to process ${app.slug}:`, error instanceof Error ? error.message : error);
                failureCount++;
            }
        }
        
        // Generate index file
        const appSlugs = appsConfig.apps.map(app => app.slug.toLowerCase());
        await generateTypesIndex(typesDir, appSlugs);
        
        // Generate client mappings
        await generateClientMappings(typesDir, discoveredApps);
        
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

async function discoverApp(app: QuickBaseAppConfig, globalConfig: QuickBaseConfig): Promise<DiscoveredApp> {
    const config: DiscoveryConfig = {
        appToken: app.appToken,
        userToken: globalConfig.userToken,
        realm: globalConfig.realm,
        appId: app.appId,
        baseUrl: globalConfig.baseUrl || "https://api.quickbase.com/v1"
    };

    // Validate required config
    if (!config.appToken) {
        throw new Error(`App token not provided for ${app.slug}`);
    }
    if (!config.userToken) {
        throw new Error('User token not found in global config');
    }
    if (!config.appId) {
        throw new Error(`App ID not provided for ${app.slug}`);
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
        name: app.slug,
        appId: config.appId,
        displayName: app.name || appInfo.name || app.slug,
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
            items: field.choices.map(choice => ({ const: choice.replace(/'/g, "\\'") })),
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

async function generateClientMappings(typesDir: string, discoveredApps: DiscoveredApp[]) {
    console.log('Generating client mappings...');
    
    // Build AppRegistry and AppTableRegistry content
    const appRegistry = discoveredApps.map(app => `  ${app.name.toLowerCase()}: ${pascalCase(app.name)}App;`).join('\n');
    const appTableRegistry = discoveredApps.map(app => {
        const tables = Object.keys(app.tables).map(tableName => `    ${tableName}: ${pascalCase(tableName)}Table;`).join('\n');
        return `  ${app.name.toLowerCase()}: {\n${tables}\n  };`;
    }).join('\n');

    // Build data types for each table
    const dataTypes = discoveredApps.flatMap(app => 
        Object.entries(app.tables).map(([tableName, table]) => {
            const fields = Object.entries(table.fields).map(([fieldName, field]) => {
                let fieldType = 'string';
                if (field.type === 'number') fieldType = 'number';
                if (field.type === 'checkbox') fieldType = 'boolean';
                if (field.choices && field.choices.length > 0) {
                    fieldType = field.choices.map(c => `'${c.replace(/'/g, "\\'")}'`).join(' | ');
                }
                return `  ${fieldName}?: ${fieldType};`;
            }).join('\n');
            return `export type ${pascalCase(tableName)}Data = {\n  id?: number | string;\n${fields}\n};`;
        })
    ).join('\n\n');

    // Build TableDataMap
    const tableDataMap = discoveredApps.map(app => {
        const tables = Object.keys(app.tables).map(tableName => `    ${tableName}: ${pascalCase(tableName)}Data;`).join('\n');
        return `  ${app.name.toLowerCase()}: {\n${tables}\n  };`;
    }).join('\n');

    // Build mappings
    const tableMappings: Record<string, Record<string, string>> = {};
    const fieldMappings: Record<string, Record<string, Record<string, number>>> = {};
    
    for (const app of discoveredApps) {
        const appSlug = app.name.toLowerCase();
        tableMappings[appSlug] = {};
        fieldMappings[appSlug] = {};
        for (const [tableName, table] of Object.entries(app.tables)) {
            tableMappings[appSlug][tableName] = table.tableId;
            fieldMappings[appSlug][tableName] = {};
            for (const [fieldName, field] of Object.entries(table.fields)) {
                fieldMappings[appSlug][tableName][fieldName] = field.fieldId;
            }
        }
    }

    const finalContent = `// Auto-generated QuickBase client mappings and types
// Generated from discovered QuickBase schemas

import type { ${discoveredApps.map(app => `${pascalCase(app.name)}App, ${Object.keys(app.tables).map(t => `${pascalCase(t)}Table`).join(', ')}`).join(', ')} } from './${discoveredApps.map(app => app.name.toLowerCase()).join('.types.js\'\nimport type { ... } from \'./')}.types.js';

// App registry - maps app names to their generated types
export interface AppRegistry {
${appRegistry}
}

// Table registry for each app
export interface AppTableRegistry {
${appTableRegistry}
}

// Extract app names from registry
export type AppName = keyof AppRegistry;

// Extract table names for a specific app
export type TableName<TApp extends AppName> = keyof AppTableRegistry[TApp];

// Get table type for specific app and table
export type AppTable<TApp extends AppName, TTable extends TableName<TApp>> = AppTableRegistry[TApp][TTable];

${dataTypes}

// Map table names to their data types
export type TableDataMap = {
${tableDataMap}
}

// Get data type for app/table combination
export type GetTableData<TApp extends AppName, TTable extends TableName<TApp>> = 
  TApp extends keyof TableDataMap ? TableDataMap[TApp][TTable & keyof TableDataMap[TApp]] : Record<string, any>;

// Field ID mappings
export const FieldMappings = ${JSON.stringify(fieldMappings, null, 2)} as const;

// Table ID mappings  
export const TableMappings = ${JSON.stringify(tableMappings, null, 2)} as const;

// Field name to ID mapping utility
export function getFieldId<TApp extends AppName, TTable extends TableName<TApp>>(
  app: TApp,
  table: TTable,
  fieldName: string
): number {
  const fieldId = FieldMappings[app]?.[table as string]?.[fieldName];
  return typeof fieldId === 'number' ? fieldId : 3; // Default to record ID
}

// Table ID mapping
export function getTableId<TApp extends AppName, TTable extends TableName<TApp>>(
  app: TApp,
  table: TTable
): string {
  return TableMappings[app]?.[table as string] || String(table);
}
`;
    
    const clientMappingsPath = path.join(typesDir, 'client-mappings.ts');
    await fs.writeFile(clientMappingsPath, finalContent);
    console.log('Client mappings generated successfully');
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