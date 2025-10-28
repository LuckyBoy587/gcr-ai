import axios from 'axios';

// OAuth 2.0 Configuration
const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const OAUTH_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const REDIRECT_URI = `${window.location.origin}/oauth/callback`;

// Token storage keys
// SECURITY NOTE: For production applications, consider using more secure storage
// mechanisms such as encrypted storage or server-side session management.
// localStorage is used here for simplicity but stores data in clear text.
const TOKEN_STORAGE_KEY = 'gcr_access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'gcr_refresh_token';
const TOKEN_EXPIRY_STORAGE_KEY = 'gcr_token_expiry';

/**
 * Class to handle Google Classroom API authentication and requests
 * 
 * SECURITY CONSIDERATIONS:
 * - Tokens are stored in localStorage which is clear text storage
 * - For production, implement encrypted storage or secure HTTP-only cookies
 * - Client secrets should ideally be kept server-side in production
 * - This implementation is suitable for development and demonstration purposes
 */
class GoogleClassroomClient {
  constructor(clientId, clientSecret) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    
    // Load tokens from storage if available
    this.loadTokensFromStorage();
  }

  /**
   * Load stored tokens from localStorage
   */
  loadTokensFromStorage() {
    try {
      this.accessToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      this.refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
      const expiry = localStorage.getItem(TOKEN_EXPIRY_STORAGE_KEY);
      this.tokenExpiry = expiry ? parseInt(expiry, 10) : null;
    } catch (error) {
      console.error('Error loading tokens from storage:', error);
    }
  }

  /**
   * Save tokens to localStorage
   */
  saveTokensToStorage(accessToken, refreshToken, expiresIn) {
    try {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.tokenExpiry = Date.now() + (expiresIn * 1000);

      localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
      }
      localStorage.setItem(TOKEN_EXPIRY_STORAGE_KEY, this.tokenExpiry.toString());
    } catch (error) {
      console.error('Error saving tokens to storage:', error);
    }
  }

  /**
   * Clear stored tokens
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  /**
   * Check if the current access token is expired
   */
  isTokenExpired() {
    if (!this.tokenExpiry) {
      return true;
    }
    // Add 60 second buffer to refresh before actual expiry
    return Date.now() >= (this.tokenExpiry - 60000);
  }

  /**
   * Generate a random state parameter for OAuth security
   */
  generateState() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Initiate OAuth 2.0 authorization code flow
   * @param {string|string[]} scopes - OAuth scopes required
   * @returns {Promise<void>}
   */
  async authorize(scopes) {
    const scopeString = Array.isArray(scopes) ? scopes.join(' ') : scopes;
    const state = this.generateState();
    
    // Store state for verification after redirect
    sessionStorage.setItem('oauth_state', state);
    
    // Build authorization URL
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: scopeString,
      state: state,
      access_type: 'offline', // Request refresh token
      prompt: 'consent' // Force consent to get refresh token
    });

    const authUrl = `${OAUTH_AUTH_URL}?${params.toString()}`;
    
    // Redirect user to Google's authorization page
    window.location.href = authUrl;
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   * @param {string} code - Authorization code from OAuth redirect
   * @param {string} state - State parameter from OAuth redirect
   * @returns {Promise<Object>} Token response
   */
  async handleCallback(code, state) {
    // Verify state parameter
    const savedState = sessionStorage.getItem('oauth_state');
    if (state !== savedState) {
      throw new Error('Invalid state parameter - possible CSRF attack');
    }
    
    sessionStorage.removeItem('oauth_state');

    try {
      const response = await axios.post(OAUTH_TOKEN_URL, {
        code: code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { access_token, refresh_token, expires_in } = response.data;
      
      // Save tokens
      this.saveTokensToStorage(access_token, refresh_token, expires_in);

      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.error_description || 
                      error.response?.data?.error || 
                      error.message;
      throw new Error(`Token exchange failed: ${errorMsg}`);
    }
  }

  /**
   * Refresh the access token using the refresh token
   * @returns {Promise<Object>} Token response
   */
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available. Please re-authorize.');
    }

    try {
      const response = await axios.post(OAUTH_TOKEN_URL, {
        refresh_token: this.refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token'
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const { access_token, expires_in, refresh_token } = response.data;
      
      // Save new tokens (use existing refresh token if new one not provided)
      this.saveTokensToStorage(
        access_token, 
        refresh_token || this.refreshToken, 
        expires_in
      );

      return response.data;
    } catch (error) {
      // If refresh fails, clear tokens and require re-authorization
      this.clearTokens();
      const errorMsg = error.response?.data?.error_description || 
                      error.response?.data?.error || 
                      error.message;
      throw new Error(`Token refresh failed: ${errorMsg}. Please re-authorize.`);
    }
  }

  /**
   * Ensure we have a valid access token, refreshing if necessary
   * @returns {Promise<string>} Valid access token
   */
  async ensureValidToken() {
    if (!this.accessToken) {
      throw new Error('No access token available. Please authorize first.');
    }

    if (this.isTokenExpired()) {
      await this.refreshAccessToken();
    }

    return this.accessToken;
  }

  /**
   * Make an authenticated API request to Google Classroom API
   * @param {Object} options - Request options
   * @param {string} options.endpoint - API endpoint URL
   * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE, etc.)
   * @param {Object} [options.body] - Request body for POST/PUT requests
   * @param {Object} [options.headers] - Additional headers
   * @returns {Promise<Object>} API response data
   */
  async makeRequest({ endpoint, method = 'GET', body = null, headers = {} }) {
    try {
      // Ensure we have a valid token
      const token = await this.ensureValidToken();

      // Prepare request configuration
      const config = {
        url: endpoint,
        method: method.toUpperCase(),
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...headers
        }
      };

      // Add body if present
      if (body && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
        config.data = body;
      }

      // Make the request
      const response = await axios(config);
      
      return response.data;
    } catch (error) {
      // Handle token expiry errors
      if (error.response?.status === 401) {
        // Token might be invalid, try to refresh once
        try {
          await this.refreshAccessToken();
          // Retry the request with new token
          const token = this.accessToken;
          const config = {
            url: endpoint,
            method: method.toUpperCase(),
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              ...headers
            }
          };

          if (body && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
            config.data = body;
          }

          const response = await axios(config);
          return response.data;
        } catch {
          throw new Error('Authentication failed. Please re-authorize.');
        }
      }

      // Handle other errors
      const errorMsg = error.response?.data?.error?.message || 
                      error.response?.data?.message || 
                      error.message;
      const statusCode = error.response?.status;
      
      throw new Error(
        `API request failed${statusCode ? ` (${statusCode})` : ''}: ${errorMsg}`
      );
    }
  }

  /**
   * Check if user is currently authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!(this.accessToken && !this.isTokenExpired());
  }
}

/**
 * Simplified API for making authenticated requests
 * @param {Object} config - Configuration object
 * @param {string} config.clientId - OAuth client ID
 * @param {string} config.clientSecret - OAuth client secret
 * @param {string|string[]} config.scopes - OAuth scopes
 * @param {string} config.endpoint - API endpoint URL
 * @param {string} [config.method='GET'] - HTTP method
 * @param {Object} [config.body] - Request body (optional)
 * @returns {Promise<Object>} API response
 */
export async function makeAuthenticatedRequest({
  clientId,
  clientSecret,
  scopes,
  endpoint,
  method = 'GET',
  body = null
}) {
  const client = new GoogleClassroomClient(clientId, clientSecret);
  
  // Check if we need to authorize
  if (!client.isAuthenticated()) {
    // Check if we're on the callback URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      // Handle callback
      await client.handleCallback(code, state);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      // Need to authorize - will redirect
      await client.authorize(scopes);
      return; // Won't reach here due to redirect
    }
  }

  // Make the authenticated request
  return await client.makeRequest({ endpoint, method, body });
}

// Export the client class for advanced usage
export { GoogleClassroomClient };

// Export default instance creator
export default function createClient(clientId, clientSecret) {
  return new GoogleClassroomClient(clientId, clientSecret);
}