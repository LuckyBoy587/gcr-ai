import { useState, useEffect } from 'react'
import './App.css'
import { GoogleClassroomClient } from './api/gcr.js'

function App() {
  const [client, setClient] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [courses, setCourses] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')

  // Initialize client when credentials are provided
  useEffect(() => {
    // Check if we're returning from OAuth callback
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    
    if (code && state) {
      // We have credentials in localStorage from before redirect
      const savedClientId = localStorage.getItem('gcr_client_id')
      const savedClientSecret = localStorage.getItem('gcr_client_secret')
      
      if (savedClientId && savedClientSecret) {
        const newClient = new GoogleClassroomClient(savedClientId, savedClientSecret)
        setClient(newClient)
        setClientId(savedClientId)
        setClientSecret(savedClientSecret)
        
        // Handle the callback
        handleOAuthCallback(newClient, code, state)
      }
    }
  }, [])

  useEffect(() => {
    if (client) {
      setIsAuthenticated(client.isAuthenticated())
    }
  }, [client])

  const handleOAuthCallback = async (clientInstance, code, state) => {
    setLoading(true)
    setError(null)
    
    try {
      await clientInstance.handleCallback(code, state)
      setIsAuthenticated(true)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClient = () => {
    if (!clientId || !clientSecret) {
      setError('Please provide both Client ID and Client Secret')
      return
    }
    
    // Save credentials for after OAuth redirect
    localStorage.setItem('gcr_client_id', clientId)
    localStorage.setItem('gcr_client_secret', clientSecret)
    
    const newClient = new GoogleClassroomClient(clientId, clientSecret)
    setClient(newClient)
    setError(null)
  }

  const handleAuthorize = async () => {
    if (!client) {
      setError('Please create a client first')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      // This will redirect to Google's OAuth page
      await client.authorize('https://www.googleapis.com/auth/classroom.courses.readonly')
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleFetchCourses = async () => {
    if (!client) {
      setError('Please create a client first')
      return
    }

    setLoading(true)
    setError(null)
    setCourses(null)
    
    try {
      const response = await client.makeRequest({
        endpoint: 'https://classroom.googleapis.com/v1/courses',
        method: 'GET'
      })
      
      setCourses(response)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomRequest = async () => {
    const endpoint = prompt('Enter API endpoint:', 'https://classroom.googleapis.com/v1/courses')
    const method = prompt('Enter HTTP method:', 'GET')
    
    if (!endpoint) return
    
    setLoading(true)
    setError(null)
    setCourses(null)
    
    try {
      const response = await client.makeRequest({
        endpoint,
        method: method || 'GET'
      })
      
      setCourses(response)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    if (client) {
      client.clearTokens()
      setIsAuthenticated(false)
      setCourses(null)
      setError(null)
    }
  }

  return (
    <div className="App">
      <h1>Google Classroom API Client</h1>
      
      {!client ? (
        <div className="card">
          <h2>Setup Client</h2>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Client ID"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              style={{ width: '300px', padding: '8px', marginBottom: '10px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="password"
              placeholder="Client Secret"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              style={{ width: '300px', padding: '8px', marginBottom: '10px' }}
            />
          </div>
          <button onClick={handleCreateClient}>
            Create Client
          </button>
        </div>
      ) : (
        <div className="card">
          <div style={{ marginBottom: '20px' }}>
            <p>Status: {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}</p>
          </div>
          
          {!isAuthenticated ? (
            <button onClick={handleAuthorize} disabled={loading}>
              {loading ? 'Authorizing...' : 'Authorize with Google'}
            </button>
          ) : (
            <div>
              <button onClick={handleFetchCourses} disabled={loading} style={{ marginRight: '10px' }}>
                {loading ? 'Loading...' : 'Fetch Courses'}
              </button>
              <button onClick={handleCustomRequest} disabled={loading} style={{ marginRight: '10px' }}>
                Custom Request
              </button>
              <button onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div style={{ 
          color: 'red', 
          padding: '10px', 
          marginTop: '20px', 
          border: '1px solid red',
          borderRadius: '5px',
          backgroundColor: '#ffebee'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {courses && (
        <div style={{ 
          marginTop: '20px', 
          textAlign: 'left',
          maxWidth: '800px',
          margin: '20px auto'
        }}>
          <h2>API Response:</h2>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '5px',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {JSON.stringify(courses, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '40px', fontSize: '0.9em', color: '#666' }}>
        <h3>Instructions:</h3>
        <ol style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
          <li>Enter your Google Cloud OAuth 2.0 Client ID and Client Secret</li>
          <li>Click "Create Client" to initialize the API client</li>
          <li>Click "Authorize with Google" to start the OAuth flow</li>
          <li>After authorization, click "Fetch Courses" to retrieve your courses</li>
          <li>Use "Custom Request" to make other API calls</li>
        </ol>
      </div>
    </div>
  )
}

export default App
