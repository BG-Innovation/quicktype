// This file provides a way for consuming projects to augment the GeneratedTypes interface
// with their generated types for full type safety

import type { GeneratedTypes } from './types'

/**
 * Use this function in your consuming project to augment the GeneratedTypes interface
 * with your generated types for full type safety.
 * 
 * Example usage in your project:
 * 
 * ```ts
 * import { augmentTypes } from 'quicktypes/client/generated-augmentation'
 * import type { AppRegistry, AppTableRegistry, TableDataMap, FieldMappings, TableMappings } from './types/generated/client-mappings'
 * 
 * declare module 'quicktypes/client/types' {
 *   interface GeneratedTypes {
 *     AppRegistry: AppRegistry
 *     AppTableRegistry: AppTableRegistry  
 *     TableDataMap: TableDataMap
 *     FieldMappings: FieldMappings
 *     TableMappings: TableMappings
 *   }
 * }
 * ```
 */
export function augmentTypes<T extends Partial<GeneratedTypes>>(types: T): void {
  // This function is purely for type augmentation and doesn't need implementation
  // The magic happens through TypeScript's module augmentation above
} 