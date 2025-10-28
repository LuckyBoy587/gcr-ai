# Google Classroom API Client

A comprehensive OAuth 2.0 client for making authenticated requests to the Google Classroom API.

![Google Classroom API Client](https://github.com/user-attachments/assets/85455872-550b-4901-880b-1539cf014a70)

## Features

- ✅ **OAuth 2.0 Authorization Code Flow** - Complete implementation with Google's OAuth 2.0
- ✅ **Automatic Token Refresh** - Tokens automatically refresh before expiry
- ✅ **Multiple HTTP Methods** - Support for GET, POST, PUT, DELETE, and more
- ✅ **Error Handling** - Comprehensive error messages for debugging
- ✅ **CSRF Protection** - Secure state parameter validation
- ✅ **Interactive Demo UI** - React-based demo application included

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Get Google Cloud Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable the **Google Classroom API**
4. Create OAuth 2.0 credentials:
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Add authorized redirect URI: `http://localhost:5173/oauth/callback`
   - Save your **Client ID** and **Client Secret**

### 3. Run the Application

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### 4. Use the Application

1. Enter your Client ID and Client Secret
2. Click "Create Client"
3. Click "Authorize with Google"
4. After authorization, click "Fetch Courses" or make custom API requests

## Usage

### Basic Example

```javascript
import { GoogleClassroomClient } from './src/api/gcr.js';

// Create a client
const client = new GoogleClassroomClient(clientId, clientSecret);

// Authorize (redirects to Google)
await client.authorize('https://www.googleapis.com/auth/classroom.courses.readonly');

// After redirect, make authenticated requests
const courses = await client.makeRequest({
  endpoint: 'https://classroom.googleapis.com/v1/courses',
  method: 'GET'
});

console.log('Courses:', courses);
```

### Making Different Types of Requests

```javascript
// GET request
const students = await client.makeRequest({
  endpoint: 'https://classroom.googleapis.com/v1/courses/12345/students',
  method: 'GET'
});

// POST request with body
const newCourse = await client.makeRequest({
  endpoint: 'https://classroom.googleapis.com/v1/courses',
  method: 'POST',
  body: {
    name: 'New Course',
    section: 'Period 2',
    description: 'Course description'
  }
});
```

## Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference and usage guide
- **[Examples](./EXAMPLES.js)** - 10 practical examples covering different use cases
- **[Security Guide](./SECURITY.md)** - Security considerations and production recommendations

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Common OAuth Scopes

- `https://www.googleapis.com/auth/classroom.courses.readonly` - View courses
- `https://www.googleapis.com/auth/classroom.courses` - Manage courses
- `https://www.googleapis.com/auth/classroom.rosters.readonly` - View rosters
- `https://www.googleapis.com/auth/classroom.rosters` - Manage rosters

See the [API Documentation](./API_DOCUMENTATION.md) for a complete list.

## Security Considerations

⚠️ **Important**: This implementation uses localStorage for token storage, which is suitable for development and demonstration purposes. For production applications:

- Move OAuth flow to backend/server-side
- Use HTTP-only cookies instead of localStorage
- Never expose client secrets in frontend code
- Implement encrypted storage for sensitive data

See [SECURITY.md](./SECURITY.md) for detailed production recommendations.

## Architecture

```
src/
├── api/
│   └── gcr.js              # OAuth client implementation
├── App.jsx                 # Demo React application
└── main.jsx               # React entry point

Root files:
├── API_DOCUMENTATION.md    # Complete API reference
├── EXAMPLES.js            # Usage examples
├── SECURITY.md            # Security guidelines
└── README.md              # This file
```

## Troubleshooting

### "No access token available"
- Click "Authorize with Google" to start the OAuth flow

### "Token exchange failed"
- Verify your Client ID and Client Secret are correct
- Check that the redirect URI matches: `http://localhost:5173/oauth/callback`

### "Invalid state parameter"
- Clear your browser's localStorage and try again
- This protects against CSRF attacks

### CORS errors
- Ensure Google Classroom API is enabled in Google Cloud Console
- Verify your application origin is authorized

## Contributing

This project was created as a demonstration of OAuth 2.0 implementation with Google Classroom API. Feel free to use it as a reference or starting point for your own projects.

## License

This project is provided as-is for educational and development purposes.

## Resources

- [Google Classroom API Documentation](https://developers.google.com/classroom)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
