/**
 * Environment configuration for the application
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  if (!value) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
};

export const env = {
  // Server configuration
  port: parseInt(getEnv('PORT', '3000'), 10),
  nodeEnv: getEnv('NODE_ENV', 'development'),
  isProd: getEnv('NODE_ENV', 'development') === 'production',
  isDev: getEnv('NODE_ENV', 'development') === 'development',
  isTest: getEnv('NODE_ENV', 'development') === 'test',

  // Authentication configuration
  auth: {
    method: getEnv('AUTH_METHOD', 'google_cloud'),
  },

  // Google Calendar API configuration
  google: {
    clientId: getEnv('GOOGLE_CLIENT_ID', ''),
    clientSecret: getEnv('GOOGLE_CLIENT_SECRET', ''),
    redirectUri: getEnv('GOOGLE_REDIRECT_URI', ''),
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  },

  // MCP configuration
  mcp: {
    serverId: getEnv('MCP_SERVER_ID', 'google-calendar-mcp'),
    serverName: getEnv('MCP_SERVER_NAME', 'Google Calendar Integration'),
    serverDescription: getEnv(
      'MCP_SERVER_DESCRIPTION',
      'Retrieves and manages Google Calendar events'
    ),
    serverVersion: '1.0.0',
  },
};
