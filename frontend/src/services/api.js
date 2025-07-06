import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for ML predictions
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Health check
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('API is not available');
  }
};

// Get available models
export const getModels = async () => {
  try {
    const response = await api.get('/models');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch models');
  }
};

// Make single prediction
export const predictThreat = async (data) => {
  try {
    const response = await api.post('/predict', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Prediction failed');
  }
};

// Batch prediction removed - CSV uploads handled in frontend CSV upload page

// Get model performance metrics
export const getModelPerformance = async () => {
  try {
    const response = await api.get('/performance');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch model performance');
  }
};

// Sample network data for testing different threat types
export const getSampleNetworkData = (threatType = 'normal') => {
  const baseData = {
    duration: 0,
    protocol_type: 'tcp',
    service: 'http',
    flag: 'SF',
    src_bytes: 181,
    dst_bytes: 5450,
    land: 0,
    wrong_fragment: 0,
    urgent: 0,
    hot: 0,
    num_failed_logins: 0,
    logged_in: 1,
    num_compromised: 0,
    root_shell: 0,
    su_attempted: 0,
    num_root: 0,
    num_file_creations: 0,
    num_shells: 0,
    num_access_files: 0,
    num_outbound_cmds: 0,
    is_host_login: 0,
    is_guest_login: 0,
    count: 8,
    srv_count: 8,
    serror_rate: 0.0,
    srv_serror_rate: 0.0,
    rerror_rate: 0.0,
    srv_rerror_rate: 0.0,
    same_srv_rate: 1.0,
    diff_srv_rate: 0.0,
    srv_diff_host_rate: 0.0,
    dst_host_count: 19,
    dst_host_srv_count: 19,
    dst_host_same_srv_rate: 1.0,
    dst_host_diff_srv_rate: 0.0,
    dst_host_same_src_port_rate: 0.05,
    dst_host_srv_diff_host_rate: 0.0,
    dst_host_serror_rate: 0.0,
    dst_host_srv_serror_rate: 0.0,
    dst_host_rerror_rate: 0.0,
    dst_host_srv_rerror_rate: 0.0
  };

  // Modify data based on threat type for testing
  switch (threatType) {
    case 'ddos':
      return {
        ...baseData,
        duration: 0,
        src_bytes: 0,
        dst_bytes: 0,
        count: 100,
        srv_count: 100,
        dst_host_count: 100,
        dst_host_srv_count: 100
      };
    case 'scanning':
      return {
        ...baseData,
        duration: 0,
        src_bytes: 0,
        dst_bytes: 0,
        count: 50,
        srv_count: 50,
        dst_host_count: 50,
        dst_host_srv_count: 50
      };
    case 'injection':
      return {
        ...baseData,
        duration: 0,
        src_bytes: 1000,
        dst_bytes: 1000,
        num_failed_logins: 5,
        logged_in: 0
      };
    case 'backdoor':
      return {
        ...baseData,
        duration: 1000,
        src_bytes: 100,
        dst_bytes: 100,
        root_shell: 1,
        num_root: 1,
        num_shells: 1
      };
    case 'xss':
      return {
        ...baseData,
        duration: 0,
        src_bytes: 500,
        dst_bytes: 500,
        service: 'http',
        num_access_files: 1
      };
    case 'ransomware':
      return {
        ...baseData,
        duration: 5000,
        src_bytes: 10000,
        dst_bytes: 10000,
        num_file_creations: 10,
        num_access_files: 10
      };
    case 'mitm':
      return {
        ...baseData,
        duration: 100,
        src_bytes: 2000,
        dst_bytes: 2000,
        service: 'ssl',
        num_compromised: 1
      };
    default: // normal
      return baseData;
  }
};

export default api; 