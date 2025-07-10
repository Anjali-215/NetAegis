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

export const predictThreat = async (data) => {
  try {
    const response = await api.post('/predict', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Prediction failed');
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
  const testData = {
    src_ip: "192.168.1.100",
    src_port: 80,
    dst_ip: "192.168.1.200",
    dst_port: 80,
    proto: "tcp",
    service: "http",
    duration: 0,
    src_bytes: 64,
    dst_bytes: 0,
    conn_state: "S0",
    missed_bytes: 0,
    src_pkts: 1000,
    src_ip_bytes: 64000,
    dst_pkts: 0,
    dst_ip_bytes: 0,
    dns_query: 0,
    dns_qclass: 0,
    dns_qtype: 0,
    dns_rcode: 0,
    dns_AA: "none",
    dns_RD: "none",
    dns_RA: "none",
    dns_rejected: "none",
    http_request_body_len: 0,
    http_response_body_len: 0,
    http_status_code: 0,
    label: 1
  };
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testData),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }
  return await response.json();
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
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
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
