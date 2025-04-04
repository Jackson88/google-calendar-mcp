/**
 * Types and interfaces for Google Calendar integration
 */

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: EventDateTime;
  end: EventDateTime;
  attendees?: EventAttendee[];
  creator?: EventPerson;
  organizer?: EventPerson;
  status: string;
  recurrence?: string[];
  recurringEventId?: string;
  visibility?: string;
  reminders?: EventReminders;
  conferenceData?: ConferenceData;
}

export interface EventDateTime {
  dateTime?: string;
  date?: string;
  timeZone?: string;
}

export interface EventAttendee {
  id?: string;
  email: string;
  displayName?: string;
  responseStatus?: string;
  optional?: boolean;
  comment?: string;
  additionalGuests?: number;
}

export interface EventPerson {
  id?: string;
  email: string;
  displayName?: string;
  self?: boolean;
}

export interface EventReminders {
  useDefault: boolean;
  overrides?: EventReminder[];
}

export interface EventReminder {
  method: string;
  minutes: number;
}

export interface ConferenceData {
  conferenceId?: string;
  conferenceSolution?: {
    key: {
      type: string;
    };
    name: string;
    iconUri?: string;
  };
  entryPoints?: {
    entryPointType: string;
    uri: string;
    label?: string;
    pin?: string;
    accessCode?: string;
  }[];
}

export interface CalendarList {
  items: Calendar[];
}

export interface Calendar {
  id: string;
  summary: string;
  description?: string;
  timeZone?: string;
  colorId?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  selected?: boolean;
  primary?: boolean;
  accessRole: string;
}

export interface CalendarEventsList {
  items: CalendarEvent[];
  nextPageToken?: string | null;
}

export interface EventQuery {
  calendarId: string;
  timeMin?: string;
  timeMax?: string;
  maxResults?: number;
  singleEvents?: boolean;
  orderBy?: string;
  pageToken?: string;
  q?: string;
}

export interface EventCreationData {
  calendarId: string;
  summary: string;
  description?: string;
  location?: string;
  start: EventDateTime;
  end: EventDateTime;
  attendees?: EventAttendee[];
  recurrence?: string[];
  reminders?: EventReminders;
  conferenceData?: ConferenceData;
}

export interface EventUpdateData extends EventCreationData {
  eventId: string;
}

export interface EventDeletionData {
  calendarId: string;
  eventId: string;
}
