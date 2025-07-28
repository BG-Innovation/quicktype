import { buildConfig } from './types/config'

export default buildConfig({
  realm: process.env.QUICKBASE_REALM!,
  userToken: process.env.QUICKBASE_USER_TOKEN!,
  apps: [
    {
      name: 'BgSoftware',
      appId: process.env.BG_SOFTWARE_APP_ID!,
      appToken: process.env.BG_SOFTWARE_APP_TOKEN!,
      description: 'Main application for tracking software projects and users',
    },

  ],
}) 