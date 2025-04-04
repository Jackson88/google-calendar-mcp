/**
 * Controller for handling MCP HTTP requests
 */

import { Request, Response } from 'express';
import { MCPRequest } from '../models/mcp';
import mcpService from '../services/mcpService';
import logger from '../utils/logger';
import directAuthService from '../services/auth/directAuthService';
import { DirectAuthCredentials } from '../models/auth';

export class McpController {
  /**
   * Get server information
   */
  public async getServerInfo(_req: Request, res: Response): Promise<void> {
    try {
      const serverInfo = mcpService.getServerInfo();
      res.status(200).json(serverInfo);
    } catch (error) {
      logger.error('Error fetching server info', { error });
      res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  /**
   * Handle an MCP request
   */
  public async handleRequest(req: Request, res: Response): Promise<void> {
    try {
      const endpoint = req.params.endpoint;
      const method = req.method;
      const parameters = method === 'GET' ? req.query : req.body;

      const mcpRequest: MCPRequest = {
        endpoint: `/${endpoint}`,
        method,
        parameters,
      };

      const response = await mcpService.processRequest(mcpRequest);
      
      if (response.success) {
        res.status(200).json(response);
      } else {
        // Map error codes to HTTP status codes
        let statusCode;
        
        switch (response.error?.code) {
          case 'BAD_REQUEST':
            statusCode = 400;
            break;
          case 'UNAUTHORIZED':
            statusCode = 401;
            break;
          case 'FORBIDDEN':
            statusCode = 403;
            break;
          case 'NOT_FOUND':
            statusCode = 404;
            break;
          case 'SERVICE_UNAVAILABLE':
            statusCode = 503;
            break;
          default:
            statusCode = 500;
            break;
        }
        
        res.status(statusCode).json(response);
      }
    } catch (error) {
      logger.error('Unexpected error in controller', { error });
      res.status(500).json({
        success: false,
        error: {
          message: 'Internal server error',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }
  
  /**
   * Handle Google OAuth callback
   */
  public async handleAuthCallback(req: Request, res: Response): Promise<void> {
    try {
      const code = req.query.code as string;
      
      if (!code) {
        res.status(400).json({
          success: false,
          error: { message: 'Authorization code is required' },
        });
        return;
      }
      
      const mcpRequest: MCPRequest = {
        endpoint: '/auth/callback',
        method: 'POST',
        parameters: { code },
      };
      
      const response = await mcpService.processRequest(mcpRequest);
      
      if (response.success) {
        res.status(200).json(response);
      } else {
        res.status(400).json(response);
      }
    } catch (error) {
      logger.error('Error handling auth callback', { error });
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to process authorization',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  /**
   * Handle direct authentication
   */
  public async handleDirectAuth(req: Request, res: Response): Promise<void> {
    try {
      const credentials: DirectAuthCredentials = req.body;
      
      if (!credentials.email && !credentials.cookies) {
        res.status(400).json({
          success: false,
          error: { message: 'Email or cookies are required for direct authentication' },
        });
        return;
      }
      
      let success = false;
      
      if (credentials.cookies) {
        success = await directAuthService.authenticateWithCookies(credentials.cookies);
      } else if (credentials.email && credentials.password) {
        success = await directAuthService.authenticateWithCredentials(
          credentials.email,
          credentials.password
        );
      } else {
        res.status(400).json({
          success: false,
          error: { message: 'Invalid authentication parameters' },
        });
        return;
      }
      
      if (success) {
        res.status(200).json({
          success: true,
          message: 'Direct authentication successful',
        });
      } else {
        res.status(401).json({
          success: false,
          error: { message: 'Authentication failed' },
        });
      }
    } catch (error) {
      logger.error('Error handling direct auth', { error });
      res.status(500).json({
        success: false,
        error: {
          message: 'Error processing direct authentication',
          details: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }
}

export default new McpController();
