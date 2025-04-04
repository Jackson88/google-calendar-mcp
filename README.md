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
git clone https://github.com/Jackson88/google-calendar-mcp
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
# Authentication Method Configuration
# -----------------------------
# Two authentication methods are available:
# 1. google_cloud - Uses Google Cloud OAuth (requires Google Cloud project setup)
# 2. direct - Uses direct authentication (simpler, doesn't require Google Cloud project)

# Choose one of the following authentication methods:
# AUTH_METHOD=google_cloud
AUTH_METHOD=direct

# Server Configuration
# -------------------
PORT=3000
NODE_ENV=development

# Google Calendar API (required only if AUTH_METHOD=google_cloud)
# --------------------------------------------------------------
# These credentials require a Google Cloud Platform project with Google Calendar API enabled
# You'll need to create OAuth credentials and configure the redirect URI in Google Cloud Console
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# MCP Configuration
# ----------------
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

## Configuring Claude for MCP Integration

### Important Note on Claude Compatibility

**⚠️ Current Limitations**: As of April 2025, Claude Desktop may have limited or no support for MCP connections. Testing has shown that the current version of Claude Desktop does not connect to external MCP servers, regardless of the authentication method used. The instructions below are for future reference when/if Claude Desktop fully supports MCP server connections.

If you receive an error message stating "I'm unable to connect to any external servers," this indicates that your version of Claude Desktop does not currently support external MCP connections. This is a limitation of the current Claude Desktop implementation, not an issue with this MCP server.

### Prerequisites

1. You must have Claude Desktop installed on your computer
2. The Google Calendar MCP server must be running and accessible
3. Your version of Claude Desktop must support MCP connections

### Running the Server

You need to manually start the MCP server **before** asking Claude to connect to it. Claude Desktop will not run the server for you using npx or any other command.

Follow these steps to set up the integration:

1. **Start the MCP server:**
   ```bash
   # Development mode
   npm run dev
   
   # OR Production mode (after building)
   npm run build
   npm run start
   ```

2. **Authenticate with Google (first time only):**
   - For Google Cloud OAuth: Visit http://localhost:3000/mcp/auth/url in your browser and complete the authorization flow
   - For Direct Authentication: Use a tool like Postman or curl to send a POST request to http://localhost:3000/auth/direct with your credentials

### Direct Authentication Methods

This server supports two authentication methods with Google Calendar. Both can be used with the server API directly, even if Claude Desktop connection is not yet supported.

#### 1. Google Cloud OAuth (Recommended)

This is the more secure method using standard OAuth flow:

1. Visit http://localhost:3000/mcp/auth/url in your browser
2. Complete the Google authorization process
3. You'll be redirected back to the callback URL

#### 2. Direct Authentication

For development/testing without setting up Google Cloud:

```bash
# Using curl
curl -X POST http://localhost:3000/auth/direct \
  -H "Content-Type: application/json" \
  -d '{"email":"your.email@gmail.com","password":"your_password"}'  

# Or with cookies
curl -X POST http://localhost:3000/auth/direct \
  -H "Content-Type: application/json" \
  -d '{"cookies":"your_google_cookies"}'  
```

These methods allow you to test the server functionality directly, even if Claude Desktop connection is not yet supported.

### Configuring Claude Desktop Settings

Claude Desktop needs to be configured to recognize and access your MCP server:

1. **Locate your Claude Desktop settings file:**
   - On macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - On Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Add the MCP server configuration to the settings file:**
   - Open the settings.json file in a text editor
   - Find or create the `mcpServers` section
   - Add the following configuration (adjust as needed):


   ```json
    {
      "mcpServers": {
        "google-calendar": {
          "command": "npx",
          "args": ["-y", "google-calendar-mcp"],
          "env": {
            "GOOGLE_CLIENT_ID": "<your-client-id>",
            "GOOGLE_CLIENT_SECRET": "<your-client-secret>",
            "GOOGLE_REDIRECT_URI": "http://localhost:3000/auth/callback"
          },
          "description": "Google Calendar MCP server using npx"
        }
      }
    }
   ```

3. **Save the file and restart Claude Desktop**

Note: This method requires manual editing of configuration files and should be used with caution. Always backup the settings file before making changes.

### Verifying the Connection

- Ask Claude a simple calendar-related question like "What events do I have today?"
- If it responds with your calendar information, the connection is working

### Troubleshooting Claude Connection

If Claude cannot connect to your MCP server:

1. **Check Claude's response:** Claude will typically tell you if there's a problem with the connection

2. **Verify the server URL:** Make sure you've specified the correct URL including the /mcp path

3. **Check server logs:** Look at the console where your MCP server is running for any error messages

4. **Restart both applications:** Sometimes restarting both Claude Desktop and the MCP server can resolve connection issues

5. **Authentication status:** Ensure you've successfully authenticated with Google before trying to use the connection

6. **Contact Anthropic Support:** If you receive a message that Claude cannot connect to external servers, you may need to contact Anthropic support about MCP feature availability for your version of Claude Desktop

### Claude Commands Reference

Once connected, you can ask Claude to perform various calendar operations:

```
# View your schedule
What events do I have today?
What's on my calendar for next week?
Show me my meetings for tomorrow afternoon.

# Create events
Schedule a team meeting next Monday at 10 AM for 1 hour.
Add a doctor's appointment on Friday at 2 PM.
Create a recurring weekly check-in every Wednesday at 9 AM.

# Modify events
Reschedule my 3 PM meeting to 4 PM.
Move tomorrow's lunch meeting to Thursday.
Cancel my dentist appointment.

# Find available times
When am I free tomorrow for a 2-hour meeting?
Do I have any conflicts next Tuesday morning?
Find me an open 30-minute slot this week for a quick call.
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

### 1. Getting upcoming events

```
Claude, what are my upcoming calendar events for the next week?
```

Claude will query the MCP server and return a list of your upcoming events.

### 2. Creating a new event

```
Claude, please schedule a meeting with John Doe about the project proposal for tomorrow at 2:00 PM, lasting for 1 hour.
```

Claude will create a new calendar event based on your request.

### 3. Finding conflicts in your schedule

```
Claude, do I have any scheduling conflicts next Monday between 10 AM and 3 PM?
```

Claude will check your calendar for that time period and inform you of any existing events.

### 4. Rescheduling an event

```
Claude, I need to reschedule my doctor's appointment on Thursday to Friday at the same time.
```

Claude will locate the event and update it with the new date.

### 5. Setting up a recurring meeting

```
Claude, please create a weekly team standup meeting every Monday at 9:00 AM starting next week.
```

Claude will create a recurring calendar event.

### 6. Finding free time slots

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
