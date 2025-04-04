# Google Calendar MCP Server

A TypeScript-based Model Context Protocol (MCP) server that allows Claude Desktop to connect to and interact with Google Calendar.

## Features

- Connect Claude Desktop AI to Google Calendar data
- Authorization with Google OAuth2
- Retrieve calendar lists and events
- Create, update, and delete calendar events
- Get upcoming events across all calendars
- Secure token handling
- TypeScript with strong typing

## Requirements

- Node.js (v16 or higher)
- npm or yarn
- Google account with Calendar access
- Google OAuth2 credentials (for Cloud OAuth method)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/google-calendar-mcp.git
cd google-calendar-mcp
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure environment variables

Create a `.env` file based on the `.env.example`:

```bash
cp .env.example .env
```

Then edit the `.env` file with your configuration:

```
# Authentication Method (google_cloud or direct)
AUTH_METHOD=google_cloud

# Server Configuration
PORT=3000
NODE_ENV=development

# Google Calendar API
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# MCP Configuration
MCP_SERVER_ID=google-calendar-mcp
MCP_SERVER_NAME=Google Calendar Integration
MCP_SERVER_DESCRIPTION=Retrieves and manages Google Calendar events
```

## Authentication Methods

This MCP server supports two authentication methods:

### 1. Google Cloud OAuth (Recommended)

This is the recommended and most secure method. It requires creating a Google Cloud project and OAuth credentials, but provides the best security and user experience.

- Follows OAuth 2.0 best practices
- No direct handling of user credentials
- Most reliable for production use

To set up Google Cloud OAuth:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Google Calendar API
4. Create OAuth2 credentials (Web application type)
5. Add authorized redirect URIs:
   - For development: `http://localhost:3000/auth/callback`
   - For production: Your production callback URL

### 2. Direct Authentication (Simplified)

For personal or development use, you can use a simplified direct authentication method that doesn't require Google Cloud setup.

- Uses direct Google Account authentication
- Simpler setup but with security and reliability limitations
- Best for personal or development use

To use direct authentication, set the following in your `.env` file:

```
AUTH_METHOD=direct
```

Note: Direct authentication may be subject to Google's security policies and could stop working if Google changes their authentication requirements.

## Running the Server

### Development Mode

```bash
# Start the development server with hot reloading
npm run dev
# or
yarn dev
```

### Production Mode

```bash
# Build the TypeScript code
npm run build
# or
yarn build

# Start the production server
npm run start
# or
yarn start
```

## Testing

```bash
# Run tests
npm test
# or
yarn test
```

## API Endpoints

The server exposes the following MCP endpoints:

### Authentication

- `GET /mcp/auth/url` - Get Google OAuth2 authorization URL
- `POST /mcp/auth/callback` - Handle OAuth2 callback after authorization
- `POST /auth/direct` - Direct authentication with Google account (when using direct auth method)

### Calendars

- `GET /mcp/calendars` - Get list of available calendars

### Events

- `GET /mcp/events` - Get events from a specific calendar
- `GET /mcp/events/upcoming` - Get upcoming events across all calendars
- `POST /mcp/events/create` - Create a new calendar event
- `PUT /mcp/events/update` - Update an existing calendar event
- `DELETE /mcp/events/delete` - Delete a calendar event
- `GET /mcp/events/detail` - Get details of a specific event

### Server Info

- `GET /mcp/info` - Get server information and available endpoints
- `GET /health` - Health check endpoint

## Example Usage with Claude Desktop

Here are some examples of how to use this MCP server with Claude Desktop:

### 1. Authentication

When connecting Claude Desktop to this MCP server for the first time, you need to authenticate with Google:

```
Claude, connect to my Google Calendar using the MCP server at http://localhost:3000/mcp.
```

Claude will provide a link to authorize access to your Google Calendar.

### 2. Getting upcoming events

```
Claude, what are my upcoming calendar events for the next week?
```

Claude will query the MCP server and return a list of your upcoming events.

### 3. Creating a new event

```
Claude, please schedule a meeting with John Doe about the project proposal for tomorrow at 2:00 PM, lasting for 1 hour.
```

Claude will create a new calendar event based on your request.

### 4. Finding conflicts in your schedule

```
Claude, do I have any scheduling conflicts next Monday between 10 AM and 3 PM?
```

Claude will check your calendar for that time period and inform you of any existing events.

### 5. Rescheduling an event

```
Claude, I need to reschedule my doctor's appointment on Thursday to Friday at the same time.
```

Claude will locate the event and update it with the new date.

### 6. Setting up a recurring meeting

```
Claude, please create a weekly team standup meeting every Monday at 9:00 AM starting next week.
```

Claude will create a recurring calendar event.

### 7. Finding free time slots

```
Claude, when am I free for a 2-hour meeting with the design team this week?
```

Claude will analyze your calendar and suggest available time slots.

## Docker Deployment

The project includes Docker configuration for easy deployment:

```bash
# Build and run with Docker Compose
docker-compose up -d
```

## Security Considerations

- This MCP server stores authentication tokens locally in files. Make sure these files are secure and not committed to version control.
- In production environments, consider implementing more secure token storage methods.
- The server uses HTTPS by default in production mode for secure communication.
- Token refresh is handled automatically when tokens expire.

## Troubleshooting

### Authentication Issues

If you encounter authentication problems:

1. Make sure your credentials are correctly configured in the `.env` file
2. Check that the redirect URI matches exactly what is configured in Google Cloud Console (for Cloud OAuth)
3. Ensure the Google Calendar API is enabled in your Google Cloud project (for Cloud OAuth)
4. Try clearing the token files and re-authenticating

### Connection Issues

If Claude Desktop can't connect to the MCP server:

1. Verify the server is running and accessible at the specified URL
2. Check firewall settings to ensure the port is open
3. Make sure the server's port matches what Claude Desktop is trying to connect to

### Calendar Access Issues

If you're having trouble accessing calendars or events:

1. Ensure you've granted the necessary permissions during the authentication flow
2. Check that your Google account has access to the calendars you're trying to view
3. Verify that the calendar IDs being used are correct

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
