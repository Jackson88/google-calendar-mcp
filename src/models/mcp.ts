/**
 * Types and interfaces for Model Context Protocol
 */

export interface MCPServerInfo {
  id: string;
  name: string;
  description: string;
  version: string;
  endpoints: MCPEndpoint[];
}

export interface MCPEndpoint {
  path: string;
  method: string;
  description: string;
  parameters?: MCPParameter[];
  returns?: MCPReturnType;
}

export interface MCPParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

export interface MCPReturnType {
  type: string;
  description: string;
}

export interface MCPRequest {
  endpoint: string;
  method: string;
  parameters?: Record<string, unknown>;
}

export interface MCPResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: MCPError;
}

export interface MCPError {
  code: string;
  message: string;
  details?: unknown;
}

export enum MCPErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  BAD_REQUEST = 'BAD_REQUEST',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}
