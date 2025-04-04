import { McpService } from '../services/mcpService';
import { env } from '../config/environment';

// Mock environment
jest.mock('../config/environment', () => ({
  env: {
    mcp: {
      serverId: 'test-server',
      serverName: 'Test Server',
      serverDescription: 'Test Description',
      serverVersion: '1.0.0',
    },
  },
}));

// Mock Google Calendar Service
jest.mock('../services/googleCalendarService', () => ({
  __esModule: true,
  default: {
    getAuthUrl: jest.fn().mockReturnValue('https://auth.example.com'),
    isAuthorized: jest.fn().mockReturnValue(false),
    loadTokens: jest.fn().mockResolvedValue(false),
  },
}));

describe('MCP Service', () => {
  let service: any;

  beforeEach(() => {
    // Clear module cache to reset singleton
    jest.resetModules();
    const mcpServiceModule = require('../services/mcpService');
    service = mcpServiceModule.default;
  });

  describe('getServerInfo', () => {
    it('should return server information with expected values', () => {
      const info = service.getServerInfo();
      
      expect(info).toBeDefined();
      expect(info.id).toBe('test-server');
      expect(info.name).toBe('Test Server');
      expect(info.description).toBe('Test Description');
      expect(info.version).toBe('1.0.0');
      expect(Array.isArray(info.endpoints)).toBe(true);
      expect(info.endpoints.length).toBeGreaterThan(0);
    });

    it('should include required endpoints', () => {
      const info = service.getServerInfo();
      
      // Check for a few specific endpoints
      const endpoints = info.endpoints.map((e: any) => e.path);
      expect(endpoints).toContain('/auth/url');
      expect(endpoints).toContain('/auth/callback');
      expect(endpoints).toContain('/calendars');
      expect(endpoints).toContain('/events');
    });
  });

  describe('processRequest', () => {
    it('should handle auth/url endpoint correctly', async () => {
      const request = {
        endpoint: '/auth/url',
        method: 'GET',
      };
      
      const response = await service.processRequest(request);
      
      expect(response.success).toBe(true);
      expect(response.data).toBe('https://auth.example.com');
    });

    it('should return error for unknown endpoint', async () => {
      const request = {
        endpoint: '/unknown',
        method: 'GET',
      };
      
      const response = await service.processRequest(request);
      
      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.error.code).toBe('NOT_FOUND');
    });
  });
});
