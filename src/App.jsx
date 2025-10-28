import { useState } from 'react'
import './App.css'
import { fetchGCRDetails, getConfigStatus } from './services/gcrService'

function App() {
  const [loading, setLoading] = useState(false)
  const [gcrData, setGcrData] = useState(null)
  const [error, setError] = useState(null)
  const configStatus = getConfigStatus()

  const handleFetchDetails = async () => {
    setLoading(true)
    setError(null)
    setGcrData(null)

    const result = await fetchGCRDetails()
    
    if (result.success) {
      setGcrData(result)
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>GCR API Dashboard</h1>
        <p className="subtitle">Google Container Registry Access</p>
      </header>

      <main className="main-content">
        {/* Configuration Status */}
        <div className="config-status">
          <h2>Configuration Status</h2>
          <div className="status-grid">
            <div className={`status-item ${configStatus.apiUrlConfigured ? 'configured' : 'missing'}`}>
              <span className="status-label">API URL:</span>
              <span className="status-value">{configStatus.apiUrlConfigured ? '✓ Configured' : '✗ Missing'}</span>
            </div>
            <div className={`status-item ${configStatus.projectIdConfigured ? 'configured' : 'missing'}`}>
              <span className="status-label">Project ID:</span>
              <span className="status-value">{configStatus.projectIdConfigured ? '✓ Configured' : '✗ Missing'}</span>
            </div>
            <div className={`status-item ${configStatus.apiKeyConfigured ? 'configured' : 'missing'}`}>
              <span className="status-label">API Key:</span>
              <span className="status-value">{configStatus.apiKeyConfigured ? '✓ Configured' : '✗ Missing'}</span>
            </div>
          </div>
          {!configStatus.allConfigured && (
            <div className="config-warning">
              <p>⚠️ Please configure your environment variables in the <code>.env</code> file.</p>
              <p>Copy <code>.env.example</code> to <code>.env</code> and fill in your GCR API credentials.</p>
            </div>
          )}
        </div>

        {/* Fetch Button */}
        <div className="action-section">
          <button 
            onClick={handleFetchDetails} 
            disabled={loading || !configStatus.allConfigured}
            className="fetch-button"
          >
            {loading ? 'Fetching...' : 'Fetch GCR Details'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}

        {/* Data Display */}
        {gcrData && (
          <div className="data-display">
            <h2>GCR Details</h2>
            <div className="data-content">
              <div className="data-item">
                <strong>Project ID:</strong> {gcrData.projectId}
              </div>
              <div className="data-item">
                <strong>Response Data:</strong>
                <pre className="json-display">{JSON.stringify(gcrData.data, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Secure API access with environment-based configuration</p>
      </footer>
    </div>
  )
}

export default App
