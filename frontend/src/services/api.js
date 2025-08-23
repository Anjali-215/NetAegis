import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// --- ML API FUNCTIONS ---
// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for ML predictions
  headers: {
    'Content-Type': 'application/json',
  },
});

// Single request interceptor for auth token and logging
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Single response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    // Don't handle auth errors here - let the components handle them
    return Promise.reject(error);
  }
);

export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('API is not available');
  }
};

export const getModels = async () => {
  try {
    const response = await api.get('/models');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch models');
  }
};

export const predictThreat = async (data, userEmail = null, userName = null) => {
  try {
    const requestBody = {
      data: data,
      user_email: userEmail,
      user_name: userName
    };
    const response = await api.post('/predict', requestBody);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Prediction failed');
  }
};

export const predictThreatNoEmail = async (data) => {
  try {
    const requestBody = {
      data: data,
      user_email: null, // Don't send individual emails
      user_name: null
    };
    const response = await api.post('/predict', requestBody);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Prediction failed');
  }
};

export const sendCSVSummaryEmail = async (summaryData) => {
  try {
    const response = await api.post('/send-csv-summary', summaryData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to send summary email');
  }
};

// --- ML Results Database Functions ---

export const saveMLResults = async (resultData) => {
  try {
    const response = await api.post('/ml-results', resultData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to save ML results');
  }
};

export const getMLResults = async (userEmail = null, limit = 50) => {
  try {
    const params = new URLSearchParams();
    if (userEmail) params.append('user_email', userEmail);
    if (limit) params.append('limit', limit.toString());
    
    const response = await api.get(`/ml-results?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to retrieve ML results');
  }
};

export const getMLResultDetail = async (resultId) => {
  try {
    const response = await api.get(`/ml-results/${resultId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to retrieve ML result detail');
  }
};

export const deleteMLResult = async (resultId) => {
  try {
    const response = await api.delete(`/ml-results/${resultId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to delete ML result');
  }
};

export const getModelPerformance = async () => {
  try {
    const response = await api.get('/performance');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch model performance');
  }
};

export const getSampleNetworkData = (threatType = 'normal') => {
  const baseData = {
    src_port: 4444,
    dst_port: 49178,
    proto: 0, // tcp
    service: 0, // -
    duration: 290.371539,
    src_bytes: 101568,
    dst_bytes: 2592,
    conn_state: 9, // OTH
    missed_bytes: 0,
    history: 'D',
    orig_pkts: 1,
    orig_ip_bytes: 0,
    resp_pkts: 1,
    resp_ip_bytes: 0,
    tunnel_parents: 0,
    dns_query: 0,
    dns_rcode: 0,
    dns_AA: 2, // none
    dns_RD: 2, // none
    dns_RA: 2, // none
    dns_rejected: 2, // none
    http_request_body_len: 0,
    http_response_body_len: 0,
    http_status_code: 0
  };
  switch (threatType) {
    case 'ddos':
      return { ...baseData, duration: 0, src_bytes: 0, dst_bytes: 0, orig_pkts: 100, resp_pkts: 100, conn_state: 1 };
    case 'scanning':
      return { ...baseData, duration: 0, src_bytes: 0, dst_bytes: 0, orig_pkts: 50, resp_pkts: 50, conn_state: 2 };
    case 'injection':
      return { ...baseData, duration: 0, src_bytes: 1000, dst_bytes: 1000, service: 1, http_request_body_len: 500, http_response_body_len: 500 };
    case 'backdoor':
      return { ...baseData, duration: 1000, src_bytes: 100, dst_bytes: 100, service: 0, conn_state: 9 };
    case 'xss':
      return { ...baseData, duration: 0, src_bytes: 500, dst_bytes: 500, service: 1, http_request_body_len: 200, http_response_body_len: 200 };
    case 'ransomware':
      return { ...baseData, duration: 5000, src_bytes: 10000, dst_bytes: 10000, orig_pkts: 10, resp_pkts: 10 };
    case 'mitm':
      return { ...baseData, duration: 100, src_bytes: 2000, dst_bytes: 2000, service: 3, conn_state: 0 };
    case 'password':
      return { ...baseData, duration: 50, src_bytes: 300, dst_bytes: 300, service: 6, conn_state: 0 };
    case 'dos':
      return { ...baseData, duration: 0, src_bytes: 0, dst_bytes: 0, orig_pkts: 200, resp_pkts: 0, conn_state: 2 };
    default:
      return baseData;
  }
};

export const testMLPrediction = async () => {
  try {
    const response = await api.post('/test-prediction');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Test prediction failed');
  }
};

// --- CSV File Management Functions ---
export const saveCSVFile = async (fileData) => {
  try {
    const response = await api.post('/api/save-csv-file', fileData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to save CSV file');
  }
};

export const getSavedCSVFiles = async () => {
  try {
    const response = await api.get('/api/saved-csv-files');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch saved CSV files');
  }
};

export const deleteSavedCSVFile = async (fileId) => {
  try {
    const response = await api.delete(`/api/saved-csv-files/${fileId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to delete saved CSV file');
  }
};

// --- Visualization Management Functions ---
export const saveVisualization = async (visualizationData) => {
  try {
    const response = await api.post('/api/save-visualization', visualizationData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to save visualization');
  }
};

export const getSavedVisualizations = async (userId) => {
  try {
    const response = await api.get(`/api/saved-visualizations/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch saved visualizations');
  }
};

export const deleteSavedVisualization = async (visualizationId) => {
  try {
    const response = await api.delete(`/api/saved-visualizations/${visualizationId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to delete saved visualization');
  }
};

// --- AUTH & USER SERVICE ---
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };
    console.log('Making API request to:', url);
    console.log('Request config:', config);
    try {
      const response = await fetch(url, config);
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      if (!response.ok) {
        throw new Error(data.detail || 'Something went wrong');
      }
      return data;
    } catch (error) {
      console.error('API Error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
  async register(userData) {
    console.log('ApiService - Register called with:', userData);
    console.log('ApiService - Register data type:', typeof userData);
    console.log('ApiService - Register data stringified:', JSON.stringify(userData));
    
    try {
      const response = await api.post('/auth/register', userData);
      console.log('ApiService - Register success:', response.data);
      return response.data;
    } catch (error) {
      console.error('ApiService - Register error:', error);
      console.error('ApiService - Register error response:', error.response?.data);
      console.error('ApiService - Register error status:', error.response?.status);
      throw error;
    }
  }
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('API Service - Login error:', error);
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const detail = error.response.data?.detail;
        
        if (status === 401) {
          // Authentication failed
          if (detail && detail.includes('Incorrect email or password')) {
            throw new Error('Incorrect email or password. Please check your credentials and try again.');
          } else {
            throw new Error('Authentication failed. Please check your email and password.');
          }
        } else if (status === 422) {
          // Validation error
          throw new Error(detail || 'Invalid input. Please check your email format.');
        } else if (status === 500) {
          // Server error
          throw new Error('Server error. Please try again later.');
        } else {
          // Other errors
          throw new Error(detail || 'Login failed. Please try again.');
        }
      } else if (error.request) {
        // Network error
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        // Other errors
        throw new Error('Login failed. Please try again.');
      }
    }
  }
  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }
  async resetPassword(token, newPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword })
    });
  }
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }
  async getCurrentUser() {
    return this.request('/auth/me');
  }
  setToken(token) {
    localStorage.setItem('token', token);
  }
  getToken() {
    return localStorage.getItem('token');
  }
  removeToken() {
    localStorage.removeItem('token');
  }
  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new ApiService();

export const adminAddUser = async (userData) => {
  const response = await api.post('/auth/admin/add_user', userData);
  return response.data;
};

export const adminListUsers = async () => {
  const response = await api.get('/auth/admin/users');
  return response.data;
};

export const adminDeleteUser = async (userId) => {
  const response = await api.delete(`/auth/admin/users/${userId}`);
  return response.data;
};

export const adminUpdateUser = async (userId, userData) => {
  const response = await api.put(`/auth/admin/users/${userId}`, userData);
  return response.data;
};

export const adminResetUserPassword = async (userId) => {
  const response = await api.post(`/auth/admin/users/${userId}/reset-password`, {});
  return response.data;
};
