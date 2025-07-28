// QuickBase Configuration Types
// Inspired by Payload CMS Local API pattern

export interface QuickBaseAppConfig {
  /**
   * The unique identifier for this app in your config
   */
  slug: string
  /**
   * QuickBase App ID
   */
  appId: string
  /**
   * QuickBase App Token
   */
  appToken: string
  /**
   * Human-readable name for this app
   */
  name?: string
  /**
   * Description of what this app contains
   */
  description?: string
}

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

// Extract app slugs for type safety
export type ExtractAppSlugs<T extends QuickBaseConfig> = T['apps'][number]['slug']

// Helper type to get app config by slug
export type GetAppBySlug<T extends QuickBaseConfig, TSlug extends string> = Extract<
  T['apps'][number],
  { slug: TSlug }
> 