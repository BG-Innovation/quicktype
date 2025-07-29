#!/usr/bin/env node
"use strict";
// QuickBase Type Builder
// Discovers QuickBase schemas and generates JSON Schema + TypeScript types
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildTypes = main;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const dotenv_1 = require("dotenv");
const json_schema_to_typescript_1 = require("json-schema-to-typescript");
// Load environment variables
(0, dotenv_1.config)();
// Use node built-in fetch for Node 18+
const fetch = globalThis.fetch;
async function loadConfig(configPath, configType) {
    try {
        switch (configType) {
            case 'json': {
                const content = await fs_1.promises.readFile(configPath, 'utf8');
                return JSON.parse(content);
            }
            case 'js': {
                // For .js files, use dynamic import which works with both CommonJS and ES modules
                const configModule = await Promise.resolve(`${`file://${path_1.default.resolve(configPath)}`}`).then(s => __importStar(require(s)));
                return configModule.default || configModule;
            }
            case 'ts': {
                // For .ts files, use tsx to compile and execute
                return new Promise((resolve, reject) => {
                    const tsx = (0, child_process_1.spawn)('npx', ['tsx', '--eval', `
                        import config from '${configPath}';
                        console.log('___CONFIG_START___');
                        console.log(JSON.stringify(config.default || config, null, 2));
                        console.log('___CONFIG_END___');
                    `], {
                        cwd: process.cwd(),
                        stdio: ['pipe', 'pipe', 'pipe']
                    });
                    let stdout = '';
                    let stderr = '';
                    tsx.stdout.on('data', (data) => stdout += data.toString());
                    tsx.stderr.on('data', (data) => stderr += data.toString());
                    tsx.on('close', (code) => {
                        if (code !== 0) {
                            reject(new Error(`Failed to load TypeScript config: ${stderr}`));
                            return;
                        }
                        try {
                            const startMarker = '___CONFIG_START___';
                            const endMarker = '___CONFIG_END___';
                            const startIndex = stdout.indexOf(startMarker);
                            const endIndex = stdout.indexOf(endMarker);
                            if (startIndex === -1 || endIndex === -1) {
                                reject(new Error(`Could not extract config from output: ${stdout}`));
                                return;
                            }
                            const jsonStr = stdout.substring(startIndex + startMarker.length, endIndex).trim();
                            const config = JSON.parse(jsonStr);
                            resolve(config);
                        }
                        catch (error) {
                            reject(new Error(`Failed to parse TypeScript config: ${error instanceof Error ? error.message : error}`));
                        }
                    });
                });
            }
            default:
                throw new Error(`Unsupported config file type: ${configType}`);
        }
    }
    catch (error) {
        throw new Error(`Failed to load config from ${configPath}: ${error instanceof Error ? error.message : error}`);
    }
}
async function main() {
    const command = process.argv[2];
    if (command === 'generate:types' || process.env.npm_lifecycle_event === 'generate') {
        console.log('QuickBase Type Builder - Generating JSON Schema + TypeScript Types');
        await discoverAndGenerateTypes();
    }
    else if (!command) {
        // If no command is provided (e.g., just `npx quicktype`), run generate by default
        console.log('QuickBase Type Builder - Generating JSON Schema + TypeScript Types');
        await discoverAndGenerateTypes();
    }
    else {
        console.log(`Unknown command: ${command}`);
        console.log('Available commands: generate:types');
        process.exit(1);
    }
}
async function discoverAndGenerateTypes() {
    try {
        // Look for config files in order of preference: .js, .json, .ts
        const configOptions = [
            { path: path_1.default.join(process.cwd(), 'quickbase.config.js'), type: 'js' },
            { path: path_1.default.join(process.cwd(), 'quickbase.config.json'), type: 'json' },
            { path: path_1.default.join(process.cwd(), 'quickbase.config.ts'), type: 'ts' }
        ];
        let configPath = null;
        let configType = null;
        for (const option of configOptions) {
            const exists = await fs_1.promises.access(option.path).then(() => true).catch(() => false);
            if (exists) {
                configPath = option.path;
                configType = option.type;
                break;
            }
        }
        if (!configPath || !configType) {
            throw new Error(`Config file not found. Please create one of:\n  - quickbase.config.js (recommended)\n  - quickbase.config.json\n  - quickbase.config.ts`);
        }
        console.log(`Using config file: ${path_1.default.basename(configPath)}`);
        // Load config based on type
        const appsConfig = await loadConfig(configPath, configType);
        console.log(`Found ${appsConfig.apps.length} apps in config file`);
        // Create types in current working directory (consumer's codebase)
        const typesOutputPath = path_1.default.join(process.cwd(), 'quickbase-types.ts');
        let successCount = 0;
        let failureCount = 0;
        const discoveredApps = [];
        for (const app of appsConfig.apps) {
            console.log(`\n--- Processing ${app.name} ---`);
            try {
                const discoveredApp = await discoverApp(app, appsConfig);
                discoveredApps.push(discoveredApp);
                console.log(`✓ Successfully discovered ${app.name}`);
                successCount++;
            }
            catch (error) {
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
    }
    catch (error) {
        console.error('Type generation failed:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}
async function generateUnifiedTypesWithMappings(discoveredApps, outputPath) {
    console.log('Generating unified TypeScript types with mappings and module declaration...');
    // Generate individual app interfaces
    const appInterfaces = [];
    const tableInterfaces = [];
    for (const app of discoveredApps) {
        // Generate app interface
        const appSchema = generateAppSchema(app);
        const appInterface = await (0, json_schema_to_typescript_1.compile)(appSchema, `${app.name}App`, {
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
            const tableInterface = await (0, json_schema_to_typescript_1.compile)(tableSchema, `${app.name}${pascalCase(tableName)}Table`, {
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
    const dataTypes = discoveredApps.flatMap(app => Object.entries(app.tables).map(([tableName, table]) => {
        // Generate all fields (read-only and writable)
        const allFields = Object.entries(table.fields).map(([fieldName, field]) => {
            let fieldType = 'string';
            if (field.type === 'number')
                fieldType = 'number';
            if (field.type === 'checkbox')
                fieldType = 'boolean';
            if (field.choices && field.choices.length > 0) {
                fieldType = field.choices.map(c => `'${c.replace(/'/g, "\\'")}'`).join(' | ');
            }
            return `  ${fieldName}?: ${fieldType};`;
        }).join('\n');
        // Generate only writable fields (exclude read-only)
        const writableFields = Object.entries(table.fields)
            .filter(([fieldName, field]) => !field.readOnly)
            .map(([fieldName, field]) => {
            let fieldType = 'string';
            if (field.type === 'number')
                fieldType = 'number';
            if (field.type === 'checkbox')
                fieldType = 'boolean';
            if (field.choices && field.choices.length > 0) {
                fieldType = field.choices.map(c => `'${c.replace(/'/g, "\\'")}'`).join(' | ');
            }
            return `  ${fieldName}?: ${fieldType};`;
        }).join('\n');
        const fullInterface = `export interface ${app.name}${pascalCase(tableName)}Data {\n  id?: number | string;\n${allFields}\n}`;
        const writableInterface = `export interface ${app.name}${pascalCase(tableName)}WritableData {\n  id?: number | string;\n${writableFields}\n}`;
        return [fullInterface, writableInterface];
    }).flat());
    // Build mappings
    const tableMappings = {};
    const fieldMappings = {};
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
    const tableWritableDataConfig = discoveredApps.map(app => {
        const tables = Object.keys(app.tables).map(tableName => `    ${tableName}: ${app.name}${pascalCase(tableName)}WritableData;`).join('\n');
        return `  ${app.name}: {\n${tables}\n  };`;
    }).join('\n');
    // Check if we're in the quicktype package itself by looking for our package.json
    const packageJsonPath = path_1.default.join(process.cwd(), 'package.json');
    let isQuicktypePackage = false;
    try {
        const packageJson = JSON.parse(await fs_1.promises.readFile(packageJsonPath, 'utf8'));
        isQuicktypePackage = packageJson.name === 'quicktype';
    }
    catch {
        // If we can't read package.json, assume we're in a consuming codebase
        isQuicktypePackage = false;
    }
    // Always include module declaration (like Payload does)
    const moduleDeclaration = `// Module declaration to extend QuickBase's GeneratedTypes (Payload-style)
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

                                                        // Main configuration interface for module merging
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
  tableWritableData: {
${tableWritableDataConfig}
  };
}

// =============================================================================
// RUNTIME MAPPINGS
// =============================================================================
// Import this object into your QuickBase config file.
export const RuntimeMappings = {
  fieldMappings: ${JSON.stringify(fieldMappings, null, 2)},
  tableMappings: ${JSON.stringify(tableMappings, null, 2)}
} as const;



${moduleDeclaration}
`;
    await fs_1.promises.writeFile(outputPath, finalContent);
    console.log('Unified types with mappings generated successfully');
}
// Re-use existing utility functions from the original script
async function discoverApp(app, globalConfig) {
    const config = {
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
    const appConfig = {
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
                readOnly: isReadOnlyField(field.type),
                choices: field.properties?.choices
            };
        }
    }
    console.log(`   App: ${appConfig.displayName} (${appConfig.appId})`);
    console.log(`   Tables: ${Object.keys(appConfig.tables).length}`);
    console.log(`   Fields: ${Object.values(appConfig.tables).reduce((sum, table) => sum + Object.keys(table.fields).length, 0)}`);
    return appConfig;
}
// Re-use existing utility functions
async function getAppInfo(config) {
    const response = await makeQuickBaseRequest(config, `/apps/${config.appId}`, 'GET');
    return { name: response.name || response.description || config.appId };
}
async function getTables(config) {
    const response = await makeQuickBaseRequest(config, `/tables?appId=${config.appId}`, 'GET');
    return response.map((table) => ({
        id: table.id,
        name: table.name || `Table ${table.id}`
    }));
}
async function getTableFields(config, tableId) {
    const response = await makeQuickBaseRequest(config, `/fields?tableId=${tableId}`, 'GET');
    return response
        .filter((field) => !field.noWrap && field.fieldType !== 'summary')
        .map((field) => ({
        id: field.id,
        label: field.label,
        type: field.fieldType || 'text',
        required: field.required || false,
        properties: field.properties || null
    }));
}
async function makeQuickBaseRequest(config, endpoint, method) {
    const url = `${config.baseUrl}${endpoint}`;
    const headers = {
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
function generateFriendlyTableName(tableName) {
    return tableName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '');
}
function generateFriendlyFieldName(fieldLabel) {
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
function mapQuickBaseType(qbType) {
    const typeMap = {
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
function isReadOnlyField(qbType) {
    const readOnlyTypes = new Set([
        // Lookup fields - populated from related records
        'lookup',
        // Calculated fields - computed values
        'formula',
        'summary',
        'snapshot',
        'predecessor',
        // Auto-generated fields
        'autoincrement',
        'autonumber',
        // System fields that are typically read-only
        'reportlink',
        'icalendarbutton',
        // Some formula-based URL fields
        'formula-url'
    ]);
    return readOnlyTypes.has(qbType.toLowerCase());
}
// Schema generation functions (reused from generate-types.ts)
function generateAppSchema(app) {
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
                properties: Object.fromEntries(Object.entries(app.tables).map(([name, table]) => [
                    name,
                    { $ref: `#/definitions/${app.name}${pascalCase(name)}Table` }
                ])),
                additionalProperties: false
            }
        },
        required: ["name", "appId", "displayName", "generatedAt", "tables"],
        additionalProperties: false,
        definitions: Object.fromEntries(Object.entries(app.tables).map(([name, table]) => [
            `${app.name}${pascalCase(name)}Table`,
            generateTableSchemaDefinition(table)
        ]))
    };
}
function generateTableSchema(table) {
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
                properties: Object.fromEntries(Object.entries(table.fields).map(([name, field]) => [
                    name,
                    generateFieldSchema(field)
                ])),
                additionalProperties: false
            }
        },
        required: ["tableId", "displayName", "friendlyName", "fields"],
        additionalProperties: false
    };
}
function generateTableSchemaDefinition(table) {
    return {
        type: "object",
        properties: {
            tableId: { type: "string" },
            displayName: { type: "string" },
            friendlyName: { type: "string" },
            fields: {
                type: "object",
                properties: Object.fromEntries(Object.entries(table.fields).map(([name, field]) => [
                    name,
                    generateFieldSchema(field)
                ])),
                additionalProperties: false
            }
        },
        required: ["tableId", "displayName", "friendlyName", "fields"],
        additionalProperties: false
    };
}
function generateFieldSchema(field) {
    const properties = {
        fieldId: { type: "number", const: field.fieldId },
        type: {
            type: "string",
            enum: ["text", "email", "number", "date", "checkbox", "list", "file", "url"],
            const: field.type
        },
        displayName: { type: "string", const: field.displayName },
        friendlyName: { type: "string", const: field.friendlyName },
        required: { type: "boolean", const: field.required },
        readOnly: { type: "boolean", const: field.readOnly }
    };
    const required = ["fieldId", "type", "displayName", "friendlyName", "required", "readOnly"];
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
function pascalCase(str) {
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
//# sourceMappingURL=generate.js.map