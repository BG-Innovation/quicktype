// QuickBase Local Request Creator - Mirrors Payload's createLocalReq utility

import type { 
  QuickBaseRequest,
  QuickBaseRequestContext,
  QuickBaseUser,
  QuickBaseConfig 
} from '../types/index.js'

export interface CreateLocalReqOptions {
  context?: QuickBaseRequestContext
  req?: Partial<QuickBaseRequest>
  user?: QuickBaseUser
  appId?: string
}

/**
 * Creates a local QuickBase request object with proper context
 * Similar to Payload's createLocalReq but for QuickBase operations
 */
export async function createLocalReq(
  options: CreateLocalReqOptions,
  config: QuickBaseConfig
): Promise<QuickBaseRequest> {
  const { context = {}, req = {}, user, appId } = options

  // Get app configuration
  const appConfig = appId 
    ? config.apps.find(app => app.appId === appId)
    : config.apps[0] // Default to first app if no appId specified

  if (!appConfig) {
    throw new Error(`No app configuration found for appId: ${appId}`)
  }

  // Merge contexts
  const mergedContext = req.context ? { ...req.context, ...context } : context

  // Create the request object
  const localReq: QuickBaseRequest = {
    context: mergedContext,
    locale: req.locale,
    fallbackLocale: req.fallbackLocale,
    user: user || req.user || null,
    appId: appConfig.appId,
    userToken: req.userToken || config.global.userToken,
    appToken: req.appToken || appConfig.appToken,
    realm: req.realm || config.global.realm,
    baseUrl: req.baseUrl || config.global.baseUrl || 'https://api.quickbase.com/v1'
  }

  // Validate required tokens
  if (!localReq.userToken) {
    throw new Error('User token is required for QuickBase operations')
  }

  if (!localReq.appToken) {
    throw new Error(`App token is required for app: ${appConfig.appId}`)
  }

  if (!localReq.realm) {
    throw new Error('Realm is required for QuickBase operations')
  }

  return localReq
} 