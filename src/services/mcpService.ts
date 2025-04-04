/**
 * Service for handling Model Context Protocol (MCP) requests
 */

import { env } from '../config/environment';
import logger from '../utils/logger';
import {
  MCPEndpoint,
  MCPErrorCode,
  MCPRequest,
  MCPResponse,
  MCPServerInfo,
} from '../models/mcp';
import googleCalendarService from './googleCalendarService';
import {
  CalendarEvent,
  CalendarEventsList,
  CalendarList,
  EventCreationData,
  EventDeletionData,
  EventQuery,
  EventUpdateData,
} from '../models/calendar';

export class McpService {
  private static instance: McpService;
  private readonly serverInfo: MCPServerInfo;

  private constructor() {
    this.serverInfo = {
      id: env.mcp.serverId,
      name: env.mcp.serverName,
      description: env.mcp.serverDescription,
      version: env.mcp.serverVersion,
      endpoints: this.getEndpoints(),
    };
  }

  public static getInstance(): McpService {
    if (!McpService.instance) {
      McpService.instance = new McpService();
    }
    return McpService.instance;
  }

  /**
   * Get server information
   */
  public getServerInfo(): MCPServerInfo {
    return this.serverInfo;
  }

  /**
   * Define available endpoints
   */
  private getEndpoints(): MCPEndpoint[] {
    return [
      {
        path: '/auth/url',
        method: 'GET',
        description: 'Get Google OAuth2 authorization URL',
        returns: {
          type: 'string',
          description: 'Authorization URL to redirect the user',
        },
      },
      {
        path: '/auth/callback',
        method: 'POST',
        description: 'Handle OAuth2 callback after authorization',
        parameters: [
          {
            name: 'code',
            type: 'string',
            description: 'Authorization code from Google',
            required: true,
          },
        ],
        returns: {
          type: 'boolean',
          description: 'Whether authentication was successful',
        },
      },
      {
        path: '/calendars',
        method: 'GET',
        description: 'Get list of available calendars',
        returns: {
          type: 'CalendarList',
          description: 'List of available calendars',
        },
      },
      {
        path: '/events',
        method: 'GET',
        description: 'Get events from a specific calendar',
        parameters: [
          {
            name: 'calendarId',
            type: 'string',
            description: 'ID of the calendar to fetch events from',
            required: true,
          },
          {
            name: 'timeMin',
            type: 'string',
            description: 'Start time in ISO format',
            required: false,
          },
          {
            name: 'timeMax',
            type: 'string',
            description: 'End time in ISO format',
            required: false,
          },
          {
            name: 'maxResults',
            type: 'number',
            description: 'Maximum number of events to return',
            required: false,
          },
        ],
        returns: {
          type: 'CalendarEventsList',
          description: 'List of calendar events',
        },
      },
      {
        path: '/events/upcoming',
        method: 'GET',
        description: 'Get upcoming events across all calendars',
        parameters: [
          {
            name: 'maxResults',
            type: 'number',
            description: 'Maximum number of events to return',
            required: false,
          },
        ],
        returns: {
          type: 'CalendarEvent[]',
          description: 'List of upcoming events sorted by start time',
        },
      },
      {
        path: '/events/create',
        method: 'POST',
        description: 'Create a new calendar event',
        parameters: [
          {
            name: 'eventData',
            type: 'EventCreationData',
            description: 'Event data to create',
            required: true,
          },
        ],
        returns: {
          type: 'CalendarEvent',
          description: 'Created event details',
        },
      },
      {
        path: '/events/update',
        method: 'PUT',
        description: 'Update an existing calendar event',
        parameters: [
          {
            name: 'eventData',
            type: 'EventUpdateData',
            description: 'Event data to update',
            required: true,
          },
        ],
        returns: {
          type: 'CalendarEvent',
          description: 'Updated event details',
        },
      },
      {
        path: '/events/delete',
        method: 'DELETE',
        description: 'Delete a calendar event',
        parameters: [
          {
            name: 'deleteData',
            type: 'EventDeletionData',
            description: 'Event data to delete',
            required: true,
          },
        ],
        returns: {
          type: 'boolean',
          description: 'Whether deletion was successful',
        },
      },
      {
        path: '/events/detail',
        method: 'GET',
        description: 'Get details of a specific event',
        parameters: [
          {
            name: 'calendarId',
            type: 'string',
            description: 'ID of the calendar',
            required: true,
          },
          {
            name: 'eventId',
            type: 'string',
            description: 'ID of the event',
            required: true,
          },
        ],
        returns: {
          type: 'CalendarEvent',
          description: 'Detailed event information',
        },
      },
    ];
  }

  /**
   * Process an MCP request
   */
  public async processRequest<T>(request: MCPRequest): Promise<MCPResponse<T>> {
    try {
      // Check if we need to load authentication tokens
      if (!googleCalendarService.isAuthorized()) {
        await googleCalendarService.loadTokens();
      }

      switch (request.endpoint) {
        case '/auth/url':
          return this.handleGetAuthUrl() as MCPResponse<T>;
        case '/auth/callback':
          return this.handleAuthCallback(request) as MCPResponse<T>;
        case '/calendars':
          return this.handleGetCalendars() as MCPResponse<T>;
        case '/events':
          return this.handleGetEvents(request) as MCPResponse<T>;
        case '/events/upcoming':
          return this.handleGetUpcomingEvents(request) as MCPResponse<T>;
        case '/events/create':
          return this.handleCreateEvent(request) as MCPResponse<T>;
        case '/events/update':
          return this.handleUpdateEvent(request) as MCPResponse<T>;
        case '/events/delete':
          return this.handleDeleteEvent(request) as MCPResponse<T>;
        case '/events/detail':
          return this.handleGetEventDetail(request) as MCPResponse<T>;
        default:
          return {
            success: false,
            error: {
              code: MCPErrorCode.NOT_FOUND,
              message: `Endpoint ${request.endpoint} not found`,
            },
          };
      }
    } catch (error) {
      logger.error('Error processing MCP request', { error, request });
      return {
        success: false,
        error: {
          code: MCPErrorCode.INTERNAL_ERROR,
          message: 'Internal server error',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  private handleGetAuthUrl(): MCPResponse<string> {
    try {
      const authUrl = googleCalendarService.getAuthUrl();
      return {
        success: true,
        data: authUrl,
      };
    } catch (error) {
      logger.error('Error generating auth URL', { error });
      return {
        success: false,
        error: {
          code: MCPErrorCode.INTERNAL_ERROR,
          message: 'Failed to generate authentication URL',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  private async handleAuthCallback(request: MCPRequest): Promise<MCPResponse<boolean>> {
    try {
      const code = request.parameters?.code as string;
      if (!code) {
        return {
          success: false,
          error: {
            code: MCPErrorCode.BAD_REQUEST,
            message: 'Authorization code is required',
          },
        };
      }

      await googleCalendarService.getTokenFromCode(code);
      return {
        success: true,
        data: true,
      };
    } catch (error) {
      logger.error('Error handling auth callback', { error });
      return {
        success: false,
        error: {
          code: MCPErrorCode.INTERNAL_ERROR,
          message: 'Failed to authenticate with Google',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  private async handleGetCalendars(): Promise<MCPResponse<CalendarList>> {
    try {
      if (!googleCalendarService.isAuthorized()) {
        return {
          success: false,
          error: {
            code: MCPErrorCode.UNAUTHORIZED,
            message: 'Not authenticated with Google Calendar',
          },
        };
      }

      const calendars = await googleCalendarService.getCalendarList();
      return {
        success: true,
        data: calendars,
      };
    } catch (error) {
      logger.error('Error fetching calendars', { error });
      return {
        success: false,
        error: {
          code: MCPErrorCode.INTERNAL_ERROR,
          message: 'Failed to fetch calendar list',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  private async handleGetEvents(request: MCPRequest): Promise<MCPResponse<CalendarEventsList>> {
    try {
      if (!googleCalendarService.isAuthorized()) {
        return {
          success: false,
          error: {
            code: MCPErrorCode.UNAUTHORIZED,
            message: 'Not authenticated with Google Calendar',
          },
        };
      }

      const calendarId = request.parameters?.calendarId as string;
      if (!calendarId) {
        return {
          success: false,
          error: {
            code: MCPErrorCode.BAD_REQUEST,
            message: 'Calendar ID is required',
          },
        };
      }

      const query: EventQuery = {
        calendarId,
        timeMin: request.parameters?.timeMin as string | undefined,
        timeMax: request.parameters?.timeMax as string | undefined,
        maxResults: request.parameters?.maxResults as number | undefined,
      };

      const events = await googleCalendarService.getEvents(query);
      return {
        success: true,
        data: events,
      };
    } catch (error) {
      logger.error('Error fetching events', { error });
      return {
        success: false,
        error: {
          code: MCPErrorCode.INTERNAL_ERROR,
          message: 'Failed to fetch calendar events',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  private async handleGetUpcomingEvents(request: MCPRequest): Promise<MCPResponse<CalendarEvent[]>> {
    try {
      if (!googleCalendarService.isAuthorized()) {
        return {
          success: false,
          error: {
            code: MCPErrorCode.UNAUTHORIZED,
            message: 'Not authenticated with Google Calendar',
          },
        };
      }

      const maxResults = request.parameters?.maxResults as number | undefined || 10;
      const events = await googleCalendarService.getUpcomingEvents(maxResults);

      return {
        success: true,
        data: events,
      };
    } catch (error) {
      logger.error('Error fetching upcoming events', { error });
      return {
        success: false,
        error: {
          code: MCPErrorCode.INTERNAL_ERROR,
          message: 'Failed to fetch upcoming events',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  private async handleCreateEvent(request: MCPRequest): Promise<MCPResponse<CalendarEvent>> {
    try {
      if (!googleCalendarService.isAuthorized()) {
        return {
          success: false,
          error: {
            code: MCPErrorCode.UNAUTHORIZED,
            message: 'Not authenticated with Google Calendar',
          },
        };
      }

      const eventData = request.parameters?.eventData as EventCreationData;
      if (!eventData || !eventData.calendarId || !eventData.summary) {
        return {
          success: false,
          error: {
            code: MCPErrorCode.BAD_REQUEST,
            message: 'Invalid event data. Calendar ID and summary are required',
          },
        };
      }

      const createdEvent = await googleCalendarService.createEvent(eventData);
      return {
        success: true,
        data: createdEvent,
      };
    } catch (error) {
      logger.error('Error creating event', { error });
      return {
        success: false,
        error: {
          code: MCPErrorCode.INTERNAL_ERROR,
          message: 'Failed to create calendar event',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  private async handleUpdateEvent(request: MCPRequest): Promise<MCPResponse<CalendarEvent>> {
    try {
      if (!googleCalendarService.isAuthorized()) {
        return {
          success: false,
          error: {
            code: MCPErrorCode.UNAUTHORIZED,
            message: 'Not authenticated with Google Calendar',
          },
        };
      }

      const eventData = request.parameters?.eventData as EventUpdateData;
      if (!eventData || !eventData.calendarId || !eventData.eventId) {
        return {
          success: false,
          error: {
            code: MCPErrorCode.BAD_REQUEST,
            message: 'Invalid event data. Calendar ID and event ID are required',
          },
        };
      }

      const updatedEvent = await googleCalendarService.updateEvent(eventData);
      return {
        success: true,
        data: updatedEvent,
      };
    } catch (error) {
      logger.error('Error updating event', { error });
      return {
        success: false,
        error: {
          code: MCPErrorCode.INTERNAL_ERROR,
          message: 'Failed to update calendar event',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  private async handleDeleteEvent(request: MCPRequest): Promise<MCPResponse<boolean>> {
    try {
      if (!googleCalendarService.isAuthorized()) {
        return {
          success: false,
          error: {
            code: MCPErrorCode.UNAUTHORIZED,
            message: 'Not authenticated with Google Calendar',
          },
        };
      }

      const deleteData = request.parameters?.deleteData as EventDeletionData;
      if (!deleteData || !deleteData.calendarId || !deleteData.eventId) {
        return {
          success: false,
          error: {
            code: MCPErrorCode.BAD_REQUEST,
            message: 'Invalid delete data. Calendar ID and event ID are required',
          },
        };
      }

      await googleCalendarService.deleteEvent(deleteData);
      return {
        success: true,
        data: true,
      };
    } catch (error) {
      logger.error('Error deleting event', { error });
      return {
        success: false,
        error: {
          code: MCPErrorCode.INTERNAL_ERROR,
          message: 'Failed to delete calendar event',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  private async handleGetEventDetail(request: MCPRequest): Promise<MCPResponse<CalendarEvent>> {
    try {
      if (!googleCalendarService.isAuthorized()) {
        return {
          success: false,
          error: {
            code: MCPErrorCode.UNAUTHORIZED,
            message: 'Not authenticated with Google Calendar',
          },
        };
      }

      const calendarId = request.parameters?.calendarId as string;
      const eventId = request.parameters?.eventId as string;

      if (!calendarId || !eventId) {
        return {
          success: false,
          error: {
            code: MCPErrorCode.BAD_REQUEST,
            message: 'Calendar ID and event ID are required',
          },
        };
      }

      const event = await googleCalendarService.getEvent(calendarId, eventId);
      return {
        success: true,
        data: event,
      };
    } catch (error) {
      logger.error('Error fetching event detail', { error });
      return {
        success: false,
        error: {
          code: MCPErrorCode.INTERNAL_ERROR,
          message: 'Failed to fetch event details',
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }
}

export default McpService.getInstance();
