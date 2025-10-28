# Security Considerations

This document outlines the security considerations and recommendations for the Google Classroom API Client.

## Current Implementation

This implementation is designed for **development and demonstration purposes**. It includes the following security measures:

### ✅ Implemented Security Features

1. **CSRF Protection**: Uses state parameter validation in OAuth flow to prevent CSRF attacks
2. **Automatic Token Refresh**: Tokens are automatically refreshed before expiry
3. **HTTPS for API Calls**: All API requests use HTTPS
4. **Token Expiry Handling**: Tokens are validated and refreshed as needed
5. **Error Handling**: Comprehensive error handling for authentication failures

### ⚠️ Known Security Limitations

The following security concerns are present in the current implementation:

#### 1. Clear Text Storage of Sensitive Data

**Issue**: OAuth tokens and client secrets are stored in browser localStorage without encryption.

**Impact**: Tokens and credentials can be accessed by:
- JavaScript running in the same origin
- Browser extensions
- Anyone with physical access to the device

**CodeQL Alerts**:
- `js/clear-text-storage-of-sensitive-data` in `src/api/gcr.js`
- `js/clear-text-storage-of-sensitive-data` in `src/App.jsx`

**Recommendation for Production**:
```javascript
// DO NOT use localStorage for production
// localStorage.setItem('token', accessToken); // ❌ Insecure

// INSTEAD, use HTTP-only cookies via server-side OAuth
// Set-Cookie: access_token=xxx; HttpOnly; Secure; SameSite=Strict
```

#### 2. Client Secret in Frontend

**Issue**: The OAuth client secret is exposed in the frontend application.

**Impact**: Anyone can view the client secret by inspecting the browser's storage or network requests.

**Recommendation for Production**:
- Move OAuth flow to the backend
- Use a backend proxy server to handle token exchange
- Only store access tokens in the frontend (preferably in HTTP-only cookies)

```
Client → Backend → Google OAuth → Backend → Client
         (with secret)         (returns token)
```

## Production Recommendations

### 1. Use Server-Side OAuth Flow

Implement a backend service to handle OAuth:

```javascript
// Backend (Node.js example)
app.get('/auth/google', (req, res) => {
  const authUrl = generateGoogleAuthUrl();
  res.redirect(authUrl);
});

app.get('/auth/callback', async (req, res) => {
  const { code } = req.query;
  const tokens = await exchangeCodeForTokens(code, CLIENT_SECRET);
  
  // Store in HTTP-only cookie
  res.cookie('access_token', tokens.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: tokens.expires_in * 1000
  });
  
  res.redirect('/dashboard');
});
```

### 2. Use HTTP-Only Cookies

Instead of localStorage, use HTTP-only cookies:

```javascript
// Frontend makes request to your backend
fetch('/api/courses', {
  credentials: 'include' // Include cookies
});

// Backend
app.get('/api/courses', async (req, res) => {
  const accessToken = req.cookies.access_token;
  const courses = await fetchGoogleClassroomCourses(accessToken);
  res.json(courses);
});
```

### 3. Implement Token Encryption

If you must use localStorage, encrypt the tokens:

```javascript
import CryptoJS from 'crypto-js';

// Encrypt before storing
const encrypted = CryptoJS.AES.encrypt(
  accessToken, 
  encryptionKey
).toString();
localStorage.setItem('token', encrypted);

// Decrypt when retrieving
const decrypted = CryptoJS.AES.decrypt(
  localStorage.getItem('token'),
  encryptionKey
).toString(CryptoJS.enc.Utf8);
```

**Note**: Even with encryption, localStorage is vulnerable to XSS attacks.

### 4. Use Environment Variables

Never hardcode credentials:

```javascript
// ❌ Bad - Hardcoded
const CLIENT_ID = '123456.apps.googleusercontent.com';

// ✅ Good - Environment variable
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
```

Create a `.env.local` file:
```
VITE_GOOGLE_CLIENT_ID=your-client-id
# Never store client secret in .env for frontend!
```

### 5. Implement Content Security Policy (CSP)

Add CSP headers to prevent XSS:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
               connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://classroom.googleapis.com">
```

### 6. Use Secure Redirect URIs

Configure OAuth redirect URIs properly:
- Use HTTPS in production
- Whitelist specific URIs in Google Cloud Console
- Never use wildcards in redirect URIs

### 7. Implement Rate Limiting

Add rate limiting to prevent abuse:

```javascript
// Backend example
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', apiLimiter);
```

### 8. Regular Security Audits

- Run `npm audit` regularly
- Keep dependencies updated
- Monitor for security advisories
- Use tools like Snyk or Dependabot

## Testing Security

### Check for Vulnerabilities

```bash
# Check npm dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Run CodeQL analysis
# (Requires GitHub Actions or CodeQL CLI)
```

### Verify Token Storage

1. Open Browser DevTools → Application → Local Storage
2. Check what data is stored
3. Verify no sensitive data in clear text

### Test OAuth Flow

1. Verify state parameter is validated
2. Test with invalid state parameter (should fail)
3. Check that tokens expire properly
4. Verify refresh token flow works

## Security Checklist for Production

Before deploying to production, ensure:

- [ ] OAuth flow is handled server-side
- [ ] Client secret is not in frontend code
- [ ] Tokens stored in HTTP-only cookies (not localStorage)
- [ ] HTTPS is enforced everywhere
- [ ] CSP headers are configured
- [ ] Rate limiting is implemented
- [ ] Environment variables used for configuration
- [ ] Regular security audits scheduled
- [ ] Error messages don't leak sensitive information
- [ ] Logging excludes sensitive data
- [ ] CORS is properly configured
- [ ] Dependencies are up to date
- [ ] Two-factor authentication enabled for critical operations

## Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do not** open a public issue
2. Email the security contact (if applicable)
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be addressed before public disclosure

## Additional Resources

- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Web Storage Security](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#local-storage)

## Disclaimer

This implementation is provided for educational and demonstration purposes. It is not intended for production use without implementing the security recommendations outlined in this document. Use at your own risk.
