# Google Classroom API Client - Documentation

This application provides a comprehensive OAuth 2.0 client for making authenticated requests to the Google Classroom API.

## Features

- ✅ OAuth 2.0 Authorization Code Flow
- ✅ Automatic token refresh
- ✅ Secure token storage (localStorage)
- ✅ Support for all HTTP methods (GET, POST, PUT, DELETE, etc.)
- ✅ Comprehensive error handling
- ✅ CSRF protection with state parameter
- ✅ Token expiry detection and handling

## Setup

### Prerequisites

1. A Google Cloud Project with Google Classroom API enabled
2. OAuth 2.0 credentials (Client ID and Client Secret)

### Configure OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable the Google Classroom API
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Add authorized redirect URI: `http://localhost:5173/oauth/callback` (for development)
   - Note: Update this to your production domain when deploying
5. Copy the Client ID and Client Secret

## Usage

### Basic Usage with UI

1. Start the development server:
   ```bash
   npm install
   npm run dev
   ```

2. Open the application in your browser
3. Enter your Client ID and Client Secret
4. Click "Create Client"
5. Click "Authorize with Google"
6. After authorization, you can make API requests

### Programmatic Usage

#### Import the Client

```javascript
import { GoogleClassroomClient, makeAuthenticatedRequest } from './api/gcr.js';
```

#### Option 1: Using the Simplified API

```javascript
// Simple one-time request
const response = await makeAuthenticatedRequest({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  scopes: 'https://www.googleapis.com/auth/classroom.courses.readonly',
  endpoint: 'https://classroom.googleapis.com/v1/courses',
  method: 'GET'
});

console.log(response);
```

#### Option 2: Using the Client Class (Recommended for Multiple Requests)

```javascript
// Create a client instance
const client = new GoogleClassroomClient('YOUR_CLIENT_ID', 'YOUR_CLIENT_SECRET');

// Check if authenticated
if (!client.isAuthenticated()) {
  // Authorize (will redirect to Google)
  await client.authorize('https://www.googleapis.com/auth/classroom.courses.readonly');
}

// Make authenticated requests
const courses = await client.makeRequest({
  endpoint: 'https://classroom.googleapis.com/v1/courses',
  method: 'GET'
});

console.log('Courses:', courses);
```

### Advanced Usage Examples

#### Making a POST Request

```javascript
const client = new GoogleClassroomClient(clientId, clientSecret);

// Create a new course
const newCourse = await client.makeRequest({
  endpoint: 'https://classroom.googleapis.com/v1/courses',
  method: 'POST',
  body: {
    name: 'New Course',
    section: 'Period 2',
    descriptionHeading: 'Welcome to the course',
    room: '301'
  }
});
```

#### Using Multiple Scopes

```javascript
const scopes = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.profile.emails'
];

await client.authorize(scopes);
```

#### Manual Token Refresh

```javascript
// Check if token is expired
if (client.isTokenExpired()) {
  await client.refreshAccessToken();
}
```

#### Logout / Clear Tokens

```javascript
client.clearTokens();
```

## API Reference

### GoogleClassroomClient Class

#### Constructor

```javascript
new GoogleClassroomClient(clientId, clientSecret)
```

**Parameters:**
- `clientId` (string): OAuth 2.0 Client ID from Google Cloud Console
- `clientSecret` (string): OAuth 2.0 Client Secret

#### Methods

##### `authorize(scopes)`

Initiates the OAuth 2.0 authorization flow. Redirects to Google's authorization page.

**Parameters:**
- `scopes` (string | string[]): OAuth scopes required

**Returns:** Promise<void>

**Example:**
```javascript
await client.authorize('https://www.googleapis.com/auth/classroom.courses.readonly');
```

##### `handleCallback(code, state)`

Handles the OAuth callback and exchanges the authorization code for access tokens.

**Parameters:**
- `code` (string): Authorization code from OAuth redirect
- `state` (string): State parameter for CSRF protection

**Returns:** Promise<Object> - Token response

**Example:**
```javascript
await client.handleCallback(code, state);
```

##### `makeRequest(options)`

Makes an authenticated API request to Google Classroom API.

**Parameters:**
- `options` (Object):
  - `endpoint` (string): API endpoint URL
  - `method` (string): HTTP method (GET, POST, PUT, DELETE, etc.) - Default: 'GET'
  - `body` (Object): Request body for POST/PUT requests - Optional
  - `headers` (Object): Additional headers - Optional

**Returns:** Promise<Object> - API response data

**Example:**
```javascript
const courses = await client.makeRequest({
  endpoint: 'https://classroom.googleapis.com/v1/courses',
  method: 'GET'
});
```

##### `refreshAccessToken()`

Refreshes the access token using the refresh token.

**Returns:** Promise<Object> - Token response

**Example:**
```javascript
await client.refreshAccessToken();
```

##### `isAuthenticated()`

Checks if the user is currently authenticated with a valid token.

**Returns:** boolean

**Example:**
```javascript
if (client.isAuthenticated()) {
  // Make API requests
}
```

##### `isTokenExpired()`

Checks if the current access token is expired.

**Returns:** boolean

##### `clearTokens()`

Clears all stored tokens from localStorage.

**Example:**
```javascript
client.clearTokens(); // Logout
```

### Simplified API Function

##### `makeAuthenticatedRequest(config)`

A simplified function for making one-time authenticated requests.

**Parameters:**
- `config` (Object):
  - `clientId` (string): OAuth Client ID
  - `clientSecret` (string): OAuth Client Secret
  - `scopes` (string | string[]): OAuth scopes
  - `endpoint` (string): API endpoint URL
  - `method` (string): HTTP method - Default: 'GET'
  - `body` (Object): Request body - Optional

**Returns:** Promise<Object> - API response

## Common OAuth Scopes

Here are some commonly used Google Classroom API scopes:

- `https://www.googleapis.com/auth/classroom.courses.readonly` - View courses
- `https://www.googleapis.com/auth/classroom.courses` - Manage courses
- `https://www.googleapis.com/auth/classroom.rosters.readonly` - View rosters
- `https://www.googleapis.com/auth/classroom.rosters` - Manage rosters
- `https://www.googleapis.com/auth/classroom.profile.emails` - View email addresses
- `https://www.googleapis.com/auth/classroom.coursework.students` - Manage coursework

For a complete list, see the [Google Classroom API documentation](https://developers.google.com/classroom/reference/rest).

## Common API Endpoints

### Courses

- **List courses:** `GET https://classroom.googleapis.com/v1/courses`
- **Get course:** `GET https://classroom.googleapis.com/v1/courses/{courseId}`
- **Create course:** `POST https://classroom.googleapis.com/v1/courses`
- **Update course:** `PATCH https://classroom.googleapis.com/v1/courses/{courseId}`

### Students

- **List students:** `GET https://classroom.googleapis.com/v1/courses/{courseId}/students`
- **Get student:** `GET https://classroom.googleapis.com/v1/courses/{courseId}/students/{userId}`

### Coursework

- **List coursework:** `GET https://classroom.googleapis.com/v1/courses/{courseId}/courseWork`
- **Create coursework:** `POST https://classroom.googleapis.com/v1/courses/{courseId}/courseWork`

For complete API reference, visit [Google Classroom API Documentation](https://developers.google.com/classroom/reference/rest).

## Security Best Practices

1. **Never commit credentials:** Keep Client ID and Client Secret in environment variables or secure configuration
2. **Use HTTPS:** Always use HTTPS in production
3. **Validate state parameter:** The client automatically validates the state parameter to prevent CSRF attacks
4. **Token storage:** Tokens are stored in localStorage. For production, consider more secure storage options
5. **Scope minimization:** Only request the scopes you need
6. **Token refresh:** The client automatically refreshes tokens before they expire

## Error Handling

The client provides detailed error messages for common scenarios:

```javascript
try {
  const courses = await client.makeRequest({
    endpoint: 'https://classroom.googleapis.com/v1/courses',
    method: 'GET'
  });
} catch (error) {
  console.error('API Error:', error.message);
  // Error messages include:
  // - Authentication failures
  // - API errors with status codes
  // - Network errors
  // - Token refresh failures
}
```

## Troubleshooting

### "No access token available"
- You need to authorize first by calling `client.authorize()`

### "Token exchange failed"
- Check that your Client ID and Client Secret are correct
- Verify the redirect URI matches the one configured in Google Cloud Console

### "Token refresh failed"
- The refresh token may be invalid or expired
- Re-authorize by calling `client.authorize()` again

### 401 Unauthorized errors
- The client will automatically attempt to refresh the token
- If refresh fails, you'll need to re-authorize

### CORS errors
- Make sure the Google Classroom API is enabled in your project
- Verify your application's origin is authorized in Google Cloud Console

## Development

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Lint Code

```bash
npm run lint
```

## License

This project is provided as-is for educational and development purposes.
