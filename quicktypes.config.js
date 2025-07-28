require('dotenv').config();

// QuickTypes Configuration
// This file can reference environment variables from .env

module.exports = {
  apps: [
    {
      name: "BG_SOFTWARE",
      appId: process.env.BG_SOFTWARE_APP_ID,
      appToken: process.env.BG_SOFTWARE_APP_TOKEN,
      description: "Background Software Management"
    },
  ],
  global: {
    userToken: process.env.QUICKBASE_USER_TOKEN,
    realm: process.env.QUICKBASE_REALM,
    baseUrl: process.env.QUICKBASE_BASE_URL || "https://api.quickbase.com/v1"
  }
}; 