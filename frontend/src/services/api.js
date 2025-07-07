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

  // Modify data based on threat type for testing
  switch (threatType) {
    case 'ddos':
      return {
        ...baseData,
        duration: 0,
        src_bytes: 0,
        dst_bytes: 0,
        orig_pkts: 100,
        resp_pkts: 100,
        conn_state: 1 // S0
      };
    case 'scanning':
      return {
        ...baseData,
        duration: 0,
        src_bytes: 0,
        dst_bytes: 0,
        orig_pkts: 50,
        resp_pkts: 50,
        conn_state: 2 // REJ
      };
    case 'injection':
      return {
        ...baseData,
        duration: 0,
        src_bytes: 1000,
        dst_bytes: 1000,
        service: 1, // http
        http_request_body_len: 500,
        http_response_body_len: 500
      };
    case 'backdoor':
      return {
        ...baseData,
        duration: 1000,
        src_bytes: 100,
        dst_bytes: 100,
        service: 0, // -
        conn_state: 9 // OTH
      };
    case 'xss':
      return {
        ...baseData,
        duration: 0,
        src_bytes: 500,
        dst_bytes: 500,
        service: 1, // http
        http_request_body_len: 200,
        http_response_body_len: 200
      };
    case 'ransomware':
      return {
        ...baseData,
        duration: 5000,
        src_bytes: 10000,
        dst_bytes: 10000,
        orig_pkts: 10,
        resp_pkts: 10
      };
    case 'mitm':
      return {
        ...baseData,
        duration: 100,
        src_bytes: 2000,
        dst_bytes: 2000,
        service: 3, // ssl
        conn_state: 0 // SF
      };
    case 'password':
      return {
        ...baseData,
        duration: 50,
        src_bytes: 300,
        dst_bytes: 300,
        service: 6, // ssh
        conn_state: 0 // SF
      };
    case 'dos':
      return {
        ...baseData,
        duration: 0,
        src_bytes: 0,
        dst_bytes: 0,
        orig_pkts: 200,
        resp_pkts: 0,
        conn_state: 2 // REJ
      };
    default: // normal
      return baseData;
  }
};

export const testMLPrediction = async () => {
  // Test with DDoS pattern using correct field names
  const testData = {
    src_ip: 3232235777,
    src_port: 80,
    dst_ip: 3232235778,
    dst_port: 80,
    proto: 1, // tcp
    service: 1, // http
    duration: 0, // Short duration typical of DDoS
    src_bytes: 64, // Small packets
    dst_bytes: 0, // No response
    conn_state: 1, // S0 - connection attempt, no reply
    missed_bytes: 0,
    src_pkts: 1000, // High packet count - DDoS characteristic
    src_ip_bytes: 64000,
    dst_pkts: 0, // No response packets
    dst_ip_bytes: 0,
    dns_query: 0,
    dns_qclass: 0,
    dns_qtype: 0,
    dns_rcode: 0,
    dns_AA: 0,
    dns_RD: 0,
    dns_RA: 0,
    dns_rejected: 0,
    http_request_body_len: 0,
    http_response_body_len: 0,
    http_status_code: 0,
    label: 1 // DDoS label
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

export default api; 