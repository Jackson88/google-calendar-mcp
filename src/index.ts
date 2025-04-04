/**
 * Main application entry point
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/environment';
import { errorHandler, notFoundHandler } from './utils/errorHandler';
import mcpController from './controllers/mcpController';
import logger from './utils/logger';
import { AuthFactory } from './services/auth/authFactory';
import { AuthMethod } from './models/auth';

// Create Express application
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log requests in development mode
if (env.isDev) {
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.url}`);
    next();
  });
}

// MCP API routes
app.get('/mcp/info', mcpController.getServerInfo.bind(mcpController));
app.get('/auth/callback', mcpController.handleAuthCallback.bind(mcpController));

// Direct authentication endpoint (when using direct authentication method)
app.post('/auth/direct', mcpController.handleDirectAuth.bind(mcpController));

// Generic endpoint handler for MCP requests
app.all('/mcp/:endpoint(*)', mcpController.handleRequest.bind(mcpController));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: env.mcp.serverVersion,
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize the server
const server = app.listen(env.port, () => {
  logger.info(`🚀 MCP server started on port ${env.port} in ${env.nodeEnv} mode`);
  logger.info(`Server ID: ${env.mcp.serverId}`);
  logger.info(`Server Name: ${env.mcp.serverName}`);
  
  // Check authentication method and provide appropriate startup info
  if (env.auth.method === AuthMethod.DIRECT) {
    logger.info('Using direct authentication method');
    logger.info('Direct authentication endpoint available at /auth/direct');
    
    // Check if already authenticated with direct method
    AuthFactory.isAuthenticated()
      .then((isAuth) => {
        if (isAuth) {
          logger.info('User is already authenticated with direct method');
        } else {
          logger.info('No authentication found. User needs to authenticate.');
        }
      })
      .catch((error) => {
        logger.error('Error checking authentication status', { error });
      });
  } else {
    logger.info('Using Google Cloud OAuth authentication method');
    
    // Check if Google Cloud is properly configured
    if (!AuthFactory.isGoogleCloudConfigured()) {
      logger.warn('Google Cloud OAuth not fully configured. Check your environment variables.');
    }
    
    // Check if already authenticated with Google
    AuthFactory.isAuthenticated()
      .then((isAuth) => {
        if (isAuth) {
          logger.info('User is already authenticated with Google');
        } else {
          logger.info('No authentication found. User needs to authenticate.');
        }
      })
      .catch((error) => {
        logger.error('Error checking authentication status', { error });
      });
  }
});

// Handle graceful shutdown
const shutdown = (): void => {
  logger.info('Shutting down MCP server...');
  server.close(() => {
    logger.info('MCP server stopped');
    process.exit(0);
  });

  // Force close after 10 seconds if server hasn't closed gracefully
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
