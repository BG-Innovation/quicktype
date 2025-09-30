"use strict";
// QuickBase Configuration Types
// Inspired by Payload CMS Local API pattern
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildConfig = void 0;
/**
 * Build a QuickBase configuration
 * Similar to Payload's buildConfig function
 */
function buildConfig(config) {
    return {
        baseUrl: 'https://api.quickbase.com/v1',
        timeout: 30000,
        debug: false,
        ...config,
    };
}
exports.buildConfig = buildConfig;
//# sourceMappingURL=config.js.map