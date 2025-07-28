// QuickBase Configuration
// This file defines your QuickBase apps and connection settings

import { buildConfig } from './types/config'

export default buildConfig({
  // Your QuickBase realm (without .quickbase.com)
  realm: process.env.QUICKBASE_REALM || 'your-realm',
  
  // Your QuickBase user token (global authentication)
  userToken: process.env.QUICKBASE_USER_TOKEN || 'your-user-token',
  
  // Optional: Custom base URL (defaults to QuickBase API v1)
  // baseUrl: 'https://api.quickbase.com/v1',
  
  // Optional: Request timeout in milliseconds (defaults to 30000)
  // timeout: 30000,
  
  // Optional: Enable debug logging (defaults to false)
  // debug: false,
  
  // Define your QuickBase apps
  apps: [
    {
      // Unique slug for this app in your config
      slug: 'bg_software',
      
      // QuickBase App ID
      appId: process.env.BG_SOFTWARE_APP_ID || 'your-app-id',
      
      // QuickBase App Token
      appToken: process.env.BG_SOFTWARE_APP_TOKEN || 'your-app-token',
      
      // Optional: Human-readable name
      name: 'Background Software Management',
      
      // Optional: Description
      description: 'Main application for tracking software projects and users',
    },
    
    // Add more apps as needed
    // {
    //   slug: 'customer_db',
    //   appId: process.env.CUSTOMER_DB_APP_ID || 'your-customer-app-id',
    //   appToken: process.env.CUSTOMER_DB_APP_TOKEN || 'your-customer-app-token',
    //   name: 'Customer Database',
    //   description: 'Customer relationship management',
    // },
  ],
}) 