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
    const command = process.argv[2];

    if (command === 'generate:types' || process.env.npm_lifecycle_event === 'generate') {
        console.log('QuickBase Type Builder - Generating JSON Schema + TypeScript Types');
        await discoverAndGenerateTypes();
    } else if (!command) {
        // If no command is provided (e.g., just `npx quicktype`), run generate by default
        console.log('QuickBase Type Builder - Generating JSON Schema + TypeScript Types');
        await discoverAndGenerateTypes();
    } else {
        console.log(`Unknown command: ${command}`);
        console.log('Available commands: generate:types');
        process.exit(1);
    }
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
        
        // Create types in current working directory (consumer's codebase)
        const typesOutputPath = path.join(process.cwd(), 'quickbase-types.ts');
        
        let successCount = 0;
        let failureCount = 0;
        const discoveredApps: DiscoveredApp[] = [];
        
        for (const app of appsConfig.apps) {
            console.log(`\n--- Processing ${app.name} ---`);
            try {
                const discoveredApp = await discoverApp(app, appsConfig);
                discoveredApps.push(discoveredApp);
                console.log(`✓ Successfully discovered ${app.name}`);
                successCount++;
            } catch (error) {
                console.error(`✗ Failed to process ${app.name}:`, error instanceof Error ? error.message : error);
                failureCount++;
            }
        }
        
        if (discoveredApps.length > 0) {
            // Generate unified types file with mappings and module declaration
            await generateUnifiedTypesWithMappings(discoveredApps, typesOutputPath);
        }
        
        console.log(`\n--- Summary ---`);
        console.log(`Successful: ${successCount}`);
        console.log(`Failed: ${failureCount}`);
        console.log(`Total: ${appsConfig.apps.length}`);
        
        if (failureCount > 0) {
            process.exit(1);
        }
        
        console.log('\n🎉 Type generation complete!');
        console.log(`Generated file:`);
        console.log(`  - ${typesOutputPath}`);
    } catch (error) {
        console.error('Type generation failed:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

async function generateUnifiedTypesWithMappings(discoveredApps: DiscoveredApp[], outputPath: string) {
    console.log('Generating unified TypeScript types with mappings and module declaration...');
    
    // Generate individual app interfaces
    const appInterfaces: string[] = [];
    const tableInterfaces: string[] = [];
    
    for (const app of discoveredApps) {
        // Generate app interface
        const appSchema = generateAppSchema(app);
        const appInterface = await compile(appSchema as any, `${app.name}App`, {
            bannerComment: `// App: ${app.displayName} (${app.appId})`,
            style: {
                semi: true,
                singleQuote: false,
                tabWidth: 2,
                printWidth: 100
            }
        });
        appInterfaces.push(appInterface);
        
        // Generate table interfaces
        for (const [tableName, table] of Object.entries(app.tables)) {
            const tableSchema = generateTableSchema(table);
            const tableInterface = await compile(tableSchema as any, `${app.name}${pascalCase(tableName)}Table`, {
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
    }
    
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
            return `export interface ${app.name}${pascalCase(tableName)}Data {\n  id?: number | string;\n${fields}\n}`;
        })
    );
    
    // Build mappings
    const tableMappings: Record<string, Record<string, string>> = {};
    const fieldMappings: Record<string, Record<string, Record<string, number>>> = {};
    
    for (const app of discoveredApps) {
        const appName = app.name;
        tableMappings[appName] = {};
        fieldMappings[appName] = {};
        for (const [tableName, table] of Object.entries(app.tables)) {
            tableMappings[appName][tableName] = table.tableId;
            fieldMappings[appName][tableName] = {};
            for (const [fieldName, field] of Object.entries(table.fields)) {
                fieldMappings[appName][tableName][fieldName] = field.fieldId;
            }
        }
    }
    
    // Create the main config interface
    const appsConfig = discoveredApps.map(app => `  ${app.name}: ${app.name}App;`).join('\n');
    const tablesConfig = discoveredApps.map(app => {
        const tables = Object.keys(app.tables).map(tableName => `    ${tableName}: ${app.name}${pascalCase(tableName)}Table;`).join('\n');
        return `  ${app.name}: {\n${tables}\n  };`;
    }).join('\n');
    const tableDataConfig = discoveredApps.map(app => {
        const tables = Object.keys(app.tables).map(tableName => `    ${tableName}: ${app.name}${pascalCase(tableName)}Data;`).join('\n');
        return `  ${app.name}: {\n${tables}\n  };`;
    }).join('\n');
    
    // Check if we're in the quicktype package itself by looking for our package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    let isQuicktypePackage = false;
    
    try {
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
        isQuicktypePackage = packageJson.name === 'quicktype';
    } catch {
        // If we can't read package.json, assume we're in a consuming codebase
        isQuicktypePackage = false;
    }
    
    const moduleDeclaration = isQuicktypePackage 
        ? '// Module declaration omitted when running in the quicktype package itself'
        : `// Module declaration to extend QuickBase's GeneratedTypes
declare module 'quicktype' {
  export interface GeneratedTypes extends Config {}
}`;

    const finalContent = `/* tslint:disable */
/* eslint-disable */
/**
 * This file was automatically generated by QuickBase Type Builder.
 * DO NOT MODIFY IT BY HAND. Instead, modify your QuickBase config,
 * and re-run \`pnpm generate\` to regenerate this file.
 */

${appInterfaces.join('\n\n')}

${tableInterfaces.join('\n\n')}

${dataTypes.join('\n\n')}

// Main configuration interface
export interface Config {
  apps: {
${appsConfig}
  };
  tables: {
${tablesConfig}
  };
  tableData: {
${tableDataConfig}
  };
}

// =============================================================================
// FIELD AND TABLE ID MAPPINGS
// =============================================================================

// Field ID mappings
export const FieldMappings: Record<string, Record<string, Record<string, number>>> = ${JSON.stringify(fieldMappings, null, 2)};

// Table ID mappings  
export const TableMappings: Record<string, Record<string, string>> = ${JSON.stringify(tableMappings, null, 2)};

// Field name to ID mapping utility
export function getFieldId(
  app: string,
  table: string,
  fieldName: string
): number {
  const appMappings = FieldMappings[app];
  if (!appMappings) return 3; // Default to record ID
  
  const tableMappings = appMappings[table];
  if (!tableMappings) return 3; // Default to record ID
  
  const fieldId = tableMappings[fieldName];
  return typeof fieldId === 'number' ? fieldId : 3; // Default to record ID
}

// Table ID mapping
export function getTableId(
  app: string,
  table: string
): string {
  const appMappings = TableMappings[app];
  if (!appMappings) return String(table);
  
  const tableId = appMappings[table];
  return typeof tableId === 'string' ? tableId : String(table);
}

${moduleDeclaration}
`;
    
    await fs.writeFile(outputPath, finalContent);
    console.log('Unified types with mappings generated successfully');
}

// Re-use existing utility functions from the original script
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
        title: `${app.name} App`,
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
                        { $ref: `#/definitions/${app.name}${pascalCase(name)}Table` }
                    ])
                ),
                additionalProperties: false
            }
        },
        required: ["name", "appId", "displayName", "generatedAt", "tables"],
        additionalProperties: false,
        definitions: Object.fromEntries(
            Object.entries(app.tables).map(([name, table]) => [
                `${app.name}${pascalCase(name)}Table`,
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