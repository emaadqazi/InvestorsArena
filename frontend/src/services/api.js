// API utility for making authenticated requests to the backend
import { auth } from '../firebase/config';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get the current user's ID token
const getAuthToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    return await user.getIdToken();
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Make authenticated API requests
export const apiRequest = async (endpoint, options = {}) => {
  const token = await getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const url = `${API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Specific API functions
export const api = {
  // Health check
  health: () => apiRequest('/health'),
  
  // Protected route example
  getProtectedData: () => apiRequest('/protected'),
  
  // Add more API endpoints as needed
};
