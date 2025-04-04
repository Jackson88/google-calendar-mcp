/**
 * Service for interacting with Google Calendar API
 */

import { OAuth2Client } from 'google-auth-library';
import { google, calendar_v3 } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/environment';
import logger from '../utils/logger';
import {
  Calendar,
  CalendarEvent,
  CalendarEventsList,
  CalendarList,
  EventCreationData,
  EventDeletionData,
  EventQuery,
  EventUpdateData,
} from '../models/calendar';

export class GoogleCalendarService {
  private client: OAuth2Client;
  private calendar: calendar_v3.Calendar;
  private static instance: GoogleCalendarService;
  private tokenPath: string;

  private constructor() {
    this.client = new OAuth2Client(
      env.google.clientId,
      env.google.clientSecret,
      env.google.redirectUri
    );
    this.calendar = google.calendar({ version: 'v3', auth: this.client });
    this.tokenPath = path.join(process.cwd(), 'token.json');
  }

  public static getInstance(): GoogleCalendarService {
    if (!GoogleCalendarService.instance) {
      GoogleCalendarService.instance = new GoogleCalendarService();
    }
    return GoogleCalendarService.instance;
  }

  /**
   * Generate authorization URL for OAuth2 flow
   */
  public getAuthUrl(): string {
    return this.client.generateAuthUrl({
      access_type: 'offline',
      scope: env.google.scopes,
    });
  }

  /**
   * Exchange authorization code for access and refresh tokens
   */
  public async getTokenFromCode(code: string): Promise<void> {
    try {
      const { tokens } = await this.client.getToken(code);
      this.client.setCredentials(tokens);
      await this.saveTokens(tokens);
      logger.info('Authentication successful');
    } catch (error) {
      logger.error('Error getting tokens from code', { error });
      throw new Error('Failed to authenticate with Google');
    }
  }

  /**
   * Save tokens to local file
   */
  private async saveTokens(tokens: any): Promise<void> {
    try {
      await fs.writeFile(this.tokenPath, JSON.stringify(tokens));
      logger.info('Tokens saved to file');
    } catch (error) {
      logger.error('Error saving tokens', { error });
      throw new Error('Failed to save authentication tokens');
    }
  }

  /**
   * Load tokens from local file
   */
  public async loadTokens(): Promise<boolean> {
    try {
      const tokenFile = await fs.readFile(this.tokenPath, 'utf-8');
      const tokens = JSON.parse(tokenFile);
      this.client.setCredentials(tokens);
      logger.info('Tokens loaded from file');
      return true;
    } catch (error) {
      logger.warn('No saved tokens found or error loading tokens');
      return false;
    }
  }

  /**
   * Check if the client is authorized
   */
  public isAuthorized(): boolean {
    const credentials = this.client.credentials;
    return !!(credentials && credentials.access_token);
  }

  /**
   * Get list of calendars
   */
  public async getCalendarList(): Promise<CalendarList> {
    try {
      const response = await this.calendar.calendarList.list();
      return {
        items: (response.data.items || []) as Calendar[],
      };
    } catch (error) {
      logger.error('Error fetching calendar list', { error });
      throw new Error('Failed to fetch calendar list');
    }
  }

  /**
   * Get events from a specific calendar
   */
  public async getEvents(query: EventQuery): Promise<CalendarEventsList> {
    try {
      const response = await this.calendar.events.list({
        calendarId: query.calendarId,
        timeMin: query.timeMin,
        timeMax: query.timeMax,
        maxResults: query.maxResults || 10,
        singleEvents: query.singleEvents !== undefined ? query.singleEvents : true,
        orderBy: query.orderBy || 'startTime',
        pageToken: query.pageToken,
        q: query.q,
      });

      return {
        items: (response.data.items || []) as CalendarEvent[],
        nextPageToken: response.data.nextPageToken,
      };
    } catch (error) {
      logger.error('Error fetching events', { error, query });
      throw new Error('Failed to fetch calendar events');
    }
  }

  /**
   * Get a specific event by ID
   */
  public async getEvent(calendarId: string, eventId: string): Promise<CalendarEvent> {
    try {
      const response = await this.calendar.events.get({
        calendarId,
        eventId,
      });
      return response.data as CalendarEvent;
    } catch (error) {
      logger.error('Error fetching event', { error, calendarId, eventId });
      throw new Error('Failed to fetch calendar event');
    }
  }

  /**
   * Create a new event
   */
  public async createEvent(eventData: EventCreationData): Promise<CalendarEvent> {
    try {
      const response = await this.calendar.events.insert({
        calendarId: eventData.calendarId,
        requestBody: {
          summary: eventData.summary,
          description: eventData.description,
          location: eventData.location,
          start: eventData.start,
          end: eventData.end,
          attendees: eventData.attendees,
          recurrence: eventData.recurrence,
          reminders: eventData.reminders,
          conferenceData: eventData.conferenceData,
        },
      });
      return response.data as CalendarEvent;
    } catch (error) {
      logger.error('Error creating event', { error, eventData });
      throw new Error('Failed to create calendar event');
    }
  }

  /**
   * Update an existing event
   */
  public async updateEvent(eventData: EventUpdateData): Promise<CalendarEvent> {
    try {
      const response = await this.calendar.events.update({
        calendarId: eventData.calendarId,
        eventId: eventData.eventId,
        requestBody: {
          summary: eventData.summary,
          description: eventData.description,
          location: eventData.location,
          start: eventData.start,
          end: eventData.end,
          attendees: eventData.attendees,
          recurrence: eventData.recurrence,
          reminders: eventData.reminders,
          conferenceData: eventData.conferenceData,
        },
      });
      return response.data as CalendarEvent;
    } catch (error) {
      logger.error('Error updating event', { error, eventData });
      throw new Error('Failed to update calendar event');
    }
  }

  /**
   * Delete an event
   */
  public async deleteEvent(deleteData: EventDeletionData): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: deleteData.calendarId,
        eventId: deleteData.eventId,
      });
    } catch (error) {
      logger.error('Error deleting event', { error, deleteData });
      throw new Error('Failed to delete calendar event');
    }
  }

  /**
   * Get upcoming events across all calendars
   */
  public async getUpcomingEvents(maxResults = 10): Promise<CalendarEvent[]> {
    try {
      const calendarList = await this.getCalendarList();
      const now = new Date().toISOString();
      
      // Get events from each calendar in parallel
      const eventsPromises = calendarList.items.map(async (calendar) => {
        try {
          const events = await this.getEvents({
            calendarId: calendar.id,
            timeMin: now,
            maxResults,
            singleEvents: true,
            orderBy: 'startTime',
          });
          return events.items;
        } catch (error) {
          logger.warn(`Error fetching events for calendar ${calendar.id}`, { error });
          return [];
        }
      });

      const allEvents = (await Promise.all(eventsPromises)).flat();
      
      // Sort events by start time
      return allEvents.sort((a, b) => {
        const aStart = a.start.dateTime || a.start.date || '';
        const bStart = b.start.dateTime || b.start.date || '';
        return aStart.localeCompare(bStart);
      }).slice(0, maxResults);
    } catch (error) {
      logger.error('Error fetching upcoming events', { error });
      throw new Error('Failed to fetch upcoming events');
    }
  }
}

export default GoogleCalendarService.getInstance();
