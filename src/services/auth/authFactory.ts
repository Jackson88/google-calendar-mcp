/**
 * Factory for creating the appropriate authentication service
 */

import { AuthMethod } from '../../models/auth';
import { env } from '../../config/environment';
import logger from '../../utils/logger';
import googleCalendarService from '../googleCalendarService';
import directAuthService from './directAuthService';

export class AuthFactory {
  /**
   * Get the appropriate authentication service based on configuration
   */
  public static getAuthService(): any {
    const authMethod = env.auth.method as AuthMethod;
    
    logger.info(`Using authentication method: ${authMethod}`);
    
    switch (authMethod) {
      case AuthMethod.GOOGLE_CLOUD:
        return googleCalendarService;
      case AuthMethod.DIRECT:
        return directAuthService;
      default:
        logger.warn(`Unknown auth method: ${authMethod}, falling back to Google Cloud OAuth`);
        return googleCalendarService;
    }
  }
  
  /**
   * Check if Google Cloud OAuth is available and configured
   */
  public static isGoogleCloudConfigured(): boolean {
    return !!(
      env.google.clientId &&
      env.google.clientSecret &&
      env.google.redirectUri
    );
  }

  /**
   * Check if the user is already authenticated based on the current method
   */
  public static async isAuthenticated(): Promise<boolean> {
    const authMethod = env.auth.method as AuthMethod;
    const authService = AuthFactory.getAuthService();
    
    if (authMethod === AuthMethod.DIRECT) {
      // Use the direct auth service method
      if (authService.hasValidAuth) {
        return await authService.hasValidAuth();
      }
    } else {
      // Use the Google Calendar service method
      return authService.isAuthorized();
    }
    
    return false;
  }
}
