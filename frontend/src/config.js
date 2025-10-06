// API Configuration
const getApiUrl = () => {
  // Check for environment-specific API URL
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Default to localhost for development
  return 'http://localhost:5000';
};

const API_URL = getApiUrl();

export default API_URL;

// Export both for compatibility
export { API_URL, getApiUrl };

// Helper function to construct full API endpoint
export const apiEndpoint = (path) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_URL}/${cleanPath}`;
};

// Export for use in fetch calls
export const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};
