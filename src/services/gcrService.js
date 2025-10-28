// GCR API Service
// This service handles API calls to Google Container Registry

const API_URL = import.meta.env.VITE_GCR_API_URL || '';
const PROJECT_ID = import.meta.env.VITE_GCR_PROJECT_ID || '';
const API_KEY = import.meta.env.VITE_GCR_API_KEY || '';

/**
 * Fetch user/project details from GCR API
 * @returns {Promise<Object>} User details from GCR
 */
export const fetchGCRDetails = async () => {
  try {
    // Check if environment variables are set
    if (!API_URL || !PROJECT_ID || !API_KEY) {
      throw new Error('Missing required environment variables. Please check your .env file.');
    }

    // Construct the API endpoint
    const endpoint = `${API_URL}/${PROJECT_ID}/tags/list`;
    
    // Make API request with authentication
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
      projectId: PROJECT_ID,
    };
  } catch (error) {
    console.error('Error fetching GCR details:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get configuration status
 * @returns {Object} Configuration status
 */
export const getConfigStatus = () => {
  return {
    apiUrlConfigured: !!API_URL,
    projectIdConfigured: !!PROJECT_ID,
    apiKeyConfigured: !!API_KEY,
    allConfigured: !!(API_URL && PROJECT_ID && API_KEY),
  };
};
