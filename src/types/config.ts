// QuickBase Configuration Types
// Inspired by Payload CMS Local API pattern

/**
 * Configuration for a single QuickBase application.
 * The 'name' property is used as a unique identifier.
 */
export interface QuickBaseAppConfig {
  name: string; // Unique name, used for file generation and as an identifier
  appId: string;
  appToken: string;
  description?: string;
}

/**
 * Main QuickBase configuration object.
 */
export interface QuickBaseConfig {
  /**
   * QuickBase realm (your-realm.quickbase.com)
   */
  realm: string
  /**
   * QuickBase User Token (global authentication)
   */
  userToken: string
  /**
   * QuickBase API base URL
   * @default "https://api.quickbase.com/v1"
   */
  baseUrl?: string
  /**
   * Array of QuickBase apps to include in this instance
   */
  apps: QuickBaseAppConfig[]
  /**
   * Runtime mappings for field and table IDs.
   * Import this from your generated `quickbase-types.ts` file.
   * @example
   * ```ts
   * import { RuntimeMappings } from './quickbase-types'
   * ```
   */
  mappings: {
    fieldMappings: Record<string, Record<string, Record<string, number>>>
    tableMappings: Record<string, Record<string, string>>
  }
  /**
   * Default request timeout in milliseconds
   * @default 30000
   */
  timeout?: number
  /**
   * Enable request logging for debugging
   * @default false
   */
  debug?: boolean
}

/**
 * Build a QuickBase configuration
 * Similar to Payload's buildConfig function
 */
export function buildConfig(config: QuickBaseConfig): QuickBaseConfig {
  return {
    baseUrl: 'https://api.quickbase.com/v1',
    timeout: 30000,
    debug: false,
    ...config,
  }
}

/**
 * Extract app names for type safety
 */
export type ExtractAppNames<TConfig extends QuickBaseConfig> = TConfig['apps'][number]['name'];

/**
 * Utility type to retrieve a specific app's configuration by its name.
 */
export type GetAppByName<
  TConfig extends QuickBaseConfig,
  TName extends ExtractAppNames<TConfig>
> = Extract<TConfig['apps'][number], { name: TName }>; 