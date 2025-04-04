/**
 * Types and interfaces for authentication methods
 */

export enum AuthMethod {
  GOOGLE_CLOUD = 'google_cloud',  // Using Google Cloud OAuth
  DIRECT = 'direct',              // Using direct user authentication
}

export interface AuthConfig {
  method: AuthMethod;
  enabled: boolean;
}

export interface DirectAuthCredentials {
  email: string;
  password?: string;  // Not recommended for production
  cookies?: string;   // Alternative authentication method
}
