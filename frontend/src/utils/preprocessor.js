// Preprocessing utility for network threat detection data
// This handles label encoding for categorical features to match the training data format
// Based on the actual ML training dataset structure

// Label encodings based on the actual training data
// These mappings are based on the network traffic dataset features
const LABEL_ENCODINGS = {
  proto: {
    'tcp': 0,
    'udp': 1,
    'icmp': 2
  },
  service: {
    '-': 0,
    'http': 1,
    'dns': 2,
    'ssl': 3,
    'ftp': 4,
    'smtp': 5,
    'ssh': 6,
    'dhcp': 7,
    'ntp': 8,
    'snmp': 9,
    'telnet': 10,
    'pop3': 11,
    'imap': 12,
    'irc': 13,
    'radius': 14,
    'ldap': 15,
    'kerberos': 16,
    'syslog': 17,
    'netbios': 18,
    'rpc': 19,
    'nfs': 20,
    'sip': 21,
    'rtp': 22,
    'rtcp': 23,
    'tftp': 24,
    'bootp': 25,
    'dhcpv6': 26,
    'dns-tcp': 27,
    'http-proxy': 28,
    'smtp-tls': 29,
    'pop3s': 30,
    'imaps': 31,
    'ircs': 32,
    'xmpp': 33,
    'mysql': 34,
    'postgresql': 35,
    'mongodb': 36,
    'redis': 37,
    'memcached': 38,
    'cassandra': 39,
    'elasticsearch': 40,
    'kafka': 41,
    'rabbitmq': 42,
    'activemq': 43,
    'zookeeper': 44,
    'etcd': 45,
    'consul': 46,
    'nomad': 47,
    'vault': 48,
    'nomad': 49,
    'nomad': 50
  },
  conn_state: {
    'SF': 0,
    'S0': 1,
    'REJ': 2,
    'RSTR': 3,
    'RSTO': 4,
    'S1': 5,
    'RSTOS0': 6,
    'S3': 7,
    'S2': 8,
    'OTH': 9,
    'SH': 10,
    'SHR': 11
  },
  history: {
    'D': 0,
    'S': 1,
    'F': 2,
    'R': 3,
    'C': 4,
    'A': 5,
    'P': 6,
    'T': 7,
    'U': 8,
    'I': 9,
    '': 10,
    '-': 11
  },
  dns_AA: {
    'F': 0,
    'T': 1,
    'none': 2
  },
  dns_RD: {
    'F': 0,
    'T': 1,
    'none': 2
  },
  dns_RA: {
    'F': 0,
    'T': 1,
    'none': 2
  },
  dns_rejected: {
    'F': 0,
    'T': 1,
    'none': 2
  },
  dns_qclass: {
    '0': 0,
    '1': 1,
    'none': 2
  },
  dns_qtype: {
    '0': 0,
    '1': 1,
    '2': 2,
    '5': 3,
    '6': 4,
    '12': 5,
    '15': 6,
    '28': 7,
    'none': 8
  }
};

// Helper function to convert IP address to numeric value
const ipToNumeric = (ip) => {
  if (!ip || typeof ip !== 'string') return 0;
  
  // Simple hash function for IP addresses
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Protocol mapping
const protoMapping = {
  'tcp': 1,
  'udp': 2,
  'icmp': 3,
  'igmp': 4,
  'ipv6': 5,
  'ipv6-icmp': 6,
  '-': 0
};

// Service mapping
const serviceMapping = {
  'http': 1,
  'https': 2,
  'ftp': 3,
  'ssh': 4,
  'telnet': 5,
  'smtp': 6,
  'dns': 7,
  'dhcp': 8,
  'ssl': 9,
  'pop3': 10,
  'imap': 11,
  'snmp': 12,
  'ntp': 13,
  'ldap': 14,
  'mysql': 15,
  'postgresql': 16,
  'mongodb': 17,
  'redis': 18,
  'memcached': 19,
  'elasticsearch': 20,
  '-': 0
};

// Connection state mapping
const connStateMapping = {
  'SF': 0,    // Normal establishment and termination
  'S0': 1,    // Connection attempt seen, no reply
  'REJ': 2,   // Connection attempt rejected
  'RSTR': 3,  // Connection established, originator aborted
  'RSTO': 4,  // Connection established, responder aborted
  'RSTOS0': 5, // Originator sent a SYN followed by a RST
  'RSTRH': 6,  // Responder sent a SYN ACK followed by a RST
  'SH': 7,     // Originator sent a SYN followed by a FIN
  'SHR': 8,    // Responder sent a SYN ACK followed by a FIN
  'OTH': 9,    // Other
  '-': 0
};

/**
 * Preprocess a single data row by applying label encoding to categorical features
 * @param {Object} data - Raw data object with string values
 * @returns {Object} - Preprocessed data with numeric values
 */
export const preprocessData = (data) => {
  const processed = { ...data };
  
  // Apply label encoding to categorical features
  if (data.proto !== undefined) {
    const encoded = LABEL_ENCODINGS.proto[data.proto];
    if (encoded === undefined) {
      console.warn(`Unknown proto: ${data.proto}, using default: tcp`);
      processed.proto = LABEL_ENCODINGS.proto['tcp'];
    } else {
      processed.proto = encoded;
    }
  }
  
  if (data.service !== undefined) {
    const encoded = LABEL_ENCODINGS.service[data.service];
    if (encoded === undefined) {
      console.warn(`Unknown service: ${data.service}, using default: -`);
      processed.service = LABEL_ENCODINGS.service['-'];
    } else {
      processed.service = encoded;
    }
  }
  
  if (data.conn_state !== undefined) {
    const encoded = LABEL_ENCODINGS.conn_state[data.conn_state];
    if (encoded === undefined) {
      console.warn(`Unknown conn_state: ${data.conn_state}, using default: SF`);
      processed.conn_state = LABEL_ENCODINGS.conn_state['SF'];
    } else {
      processed.conn_state = encoded;
    }
  }
  
  if (data.history !== undefined) {
    const encoded = LABEL_ENCODINGS.history[data.history];
    if (encoded === undefined) {
      console.warn(`Unknown history: ${data.history}, using default: ''`);
      processed.history = LABEL_ENCODINGS.history[''];
    } else {
      processed.history = encoded;
    }
  }
  
  // Handle DNS-related fields
  if (data.dns_AA !== undefined) {
    const encoded = LABEL_ENCODINGS.dns_AA[data.dns_AA];
    if (encoded === undefined) {
      console.warn(`Unknown dns_AA: ${data.dns_AA}, using default: none`);
      processed.dns_AA = LABEL_ENCODINGS.dns_AA['none'];
    } else {
      processed.dns_AA = encoded;
    }
  }
  
  if (data.dns_RD !== undefined) {
    const encoded = LABEL_ENCODINGS.dns_RD[data.dns_RD];
    if (encoded === undefined) {
      console.warn(`Unknown dns_RD: ${data.dns_RD}, using default: none`);
      processed.dns_RD = LABEL_ENCODINGS.dns_RD['none'];
    } else {
      processed.dns_RD = encoded;
    }
  }
  
  if (data.dns_RA !== undefined) {
    const encoded = LABEL_ENCODINGS.dns_RA[data.dns_RA];
    if (encoded === undefined) {
      console.warn(`Unknown dns_RA: ${data.dns_RA}, using default: none`);
      processed.dns_RA = LABEL_ENCODINGS.dns_RA['none'];
    } else {
      processed.dns_RA = encoded;
    }
  }
  
  if (data.dns_rejected !== undefined) {
    const encoded = LABEL_ENCODINGS.dns_rejected[data.dns_rejected];
    if (encoded === undefined) {
      console.warn(`Unknown dns_rejected: ${data.dns_rejected}, using default: none`);
      processed.dns_rejected = LABEL_ENCODINGS.dns_rejected['none'];
    } else {
      processed.dns_rejected = encoded;
    }
  }
  
  if (data.dns_qclass !== undefined) {
    const encoded = LABEL_ENCODINGS.dns_qclass[data.dns_qclass];
    if (encoded === undefined) {
      console.warn(`Unknown dns_qclass: ${data.dns_qclass}, using default: none`);
      processed.dns_qclass = LABEL_ENCODINGS.dns_qclass['none'];
    } else {
      processed.dns_qclass = encoded;
    }
  }
  
  if (data.dns_qtype !== undefined) {
    const encoded = LABEL_ENCODINGS.dns_qtype[data.dns_qtype];
    if (encoded === undefined) {
      console.warn(`Unknown dns_qtype: ${data.dns_qtype}, using default: none`);
      processed.dns_qtype = LABEL_ENCODINGS.dns_qtype['none'];
    } else {
      processed.dns_qtype = encoded;
    }
  }
  
  // Handle IP addresses - convert to hash or simple encoding
  if (data.src_ip !== undefined) {
    // Simple hash of IP address for categorical encoding
    let hash = 0;
    const str = data.src_ip.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    processed.src_ip = Math.abs(hash) % 1000; // Limit to reasonable range
  }
  
  if (data.dst_ip !== undefined) {
    // Simple hash of IP address for categorical encoding
    let hash = 0;
    const str = data.dst_ip.toString();
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    processed.dst_ip = Math.abs(hash) % 1000; // Limit to reasonable range
  }
  
  // Ensure all numeric features are properly converted
  const numericFeatures = [
    'src_ip', 'src_port', 'dst_ip', 'dst_port', 'duration', 'src_bytes', 'dst_bytes', 'missed_bytes', 
    'src_pkts', 'src_ip_bytes', 'dst_pkts', 'dst_ip_bytes', 'dns_query', 'dns_qclass', 
    'dns_qtype', 'dns_rcode', 'http_request_body_len', 'http_response_body_len', 'http_status_code', 'label'
  ];
  
  numericFeatures.forEach(feature => {
    if (processed[feature] !== undefined) {
      const value = parseFloat(processed[feature]);
      processed[feature] = isNaN(value) ? 0 : value;
    }
  });
  
  return processed;
};

/**
 * Preprocess multiple data rows
 * @param {Array} dataRows - Array of raw data objects
 * @returns {Array} - Array of preprocessed data objects
 */
export const preprocessBatch = (dataRows) => {
  return dataRows.map((row, index) => {
    try {
      return preprocessData(row);
    } catch (error) {
      console.error(`Error preprocessing row ${index + 1}:`, error);
      // Return a default safe row
      return {
        src_port: 0,
        dst_port: 0,
        proto: LABEL_ENCODINGS.proto['tcp'],
        service: LABEL_ENCODINGS.service['-'],
        duration: 0,
        src_bytes: 0,
        dst_bytes: 0,
        conn_state: LABEL_ENCODINGS.conn_state['SF'],
        missed_bytes: 0,
        history: '',
        orig_pkts: 0,
        orig_ip_bytes: 0,
        resp_pkts: 0,
        resp_ip_bytes: 0,
        tunnel_parents: 0,
        dns_query: 0,
        dns_rcode: 0,
        dns_AA: LABEL_ENCODINGS.dns_AA['none'],
        dns_RD: LABEL_ENCODINGS.dns_RD['none'],
        dns_RA: LABEL_ENCODINGS.dns_RA['none'],
        dns_rejected: LABEL_ENCODINGS.dns_rejected['none'],
        http_request_body_len: 0,
        http_response_body_len: 0,
        http_status_code: 0,
        label: 1
      };
    }
  });
};

/**
 * Get available categories for each categorical feature
 * @returns {Object} - Available categories for each feature
 */
export const getAvailableCategories = () => {
  return {
    proto: Object.keys(LABEL_ENCODINGS.proto),
    service: Object.keys(LABEL_ENCODINGS.service),
    conn_state: Object.keys(LABEL_ENCODINGS.conn_state),
    history: Object.keys(LABEL_ENCODINGS.history),
    dns_AA: Object.keys(LABEL_ENCODINGS.dns_AA),
    dns_RD: Object.keys(LABEL_ENCODINGS.dns_RD),
    dns_RA: Object.keys(LABEL_ENCODINGS.dns_RA),
    dns_rejected: Object.keys(LABEL_ENCODINGS.dns_rejected),
    dns_qclass: Object.keys(LABEL_ENCODINGS.dns_qclass),
    dns_qtype: Object.keys(LABEL_ENCODINGS.dns_qtype)
  };
};

/**
 * Validate if a data row has all required features
 * @param {Object} data - Data row to validate
 * @returns {Object} - Validation result with isValid boolean and errors array
 */
export const validateData = (data) => {
  const requiredFeatures = [
    'src_ip', 'src_port', 'dst_ip', 'dst_port', 'proto', 'service', 'duration', 'src_bytes', 'dst_bytes',
    'conn_state', 'missed_bytes', 'src_pkts', 'src_ip_bytes', 'dst_pkts', 'dst_ip_bytes', 'dns_query', 
    'dns_qclass', 'dns_qtype', 'dns_rcode', 'dns_AA', 'dns_RD', 'dns_RA', 'dns_rejected', 
    'http_request_body_len', 'http_response_body_len', 'http_status_code', 'label'
  ];
  
  const errors = [];
  
  requiredFeatures.forEach(feature => {
    if (data[feature] === undefined || data[feature] === null || data[feature] === '') {
      errors.push(`Missing required feature: ${feature}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get sample data structure for testing
 * @returns {Object} - Sample data with all required features
 */
export const getSampleData = () => {
  return {
    src_ip: '192.168.1.37',
    src_port: 4444,
    dst_ip: '192.168.1.193',
    dst_port: 49178,
    proto: 'tcp',
    service: '-',
    duration: 290.371539,
    src_bytes: 101568,
    dst_bytes: 2592,
    conn_state: 'OTH',
    missed_bytes: 0,
    src_pkts: 1,
    src_ip_bytes: 0,
    dst_pkts: 1,
    dst_ip_bytes: 0,
    dns_query: 0,
    dns_qclass: 0,
    dns_qtype: 0,
    dns_rcode: 0,
    dns_AA: 'none',
    dns_RD: 'none',
    dns_RA: 'none',
    dns_rejected: 'none',
    http_request_body_len: 0,
    http_response_body_len: 0,
    http_status_code: 0,
    label: 1
  };
};

export const preprocessNetworkData = (data) => {
  // Create a copy of the data to avoid mutating the original
  const processed = { ...data };
  const errors = [];
  
  // Required features for the model (27 features)
  const requiredFeatures = [
    'src_ip', 'src_port', 'dst_ip', 'dst_port', 'proto', 'service', 'duration',
    'src_bytes', 'dst_bytes', 'conn_state', 'missed_bytes', 'src_pkts', 'src_ip_bytes',
    'dst_pkts', 'dst_ip_bytes', 'dns_query', 'dns_qclass', 'dns_qtype', 'dns_rcode',
    'dns_AA', 'dns_RD', 'dns_RA', 'dns_rejected', 'http_request_body_len',
    'http_response_body_len', 'http_status_code', 'label'
  ];
  
  // Check for missing required features
  for (const feature of requiredFeatures) {
    if (!(feature in processed) || processed[feature] === undefined || processed[feature] === null || processed[feature] === '') {
      errors.push(`Missing required feature: ${feature}`);
    }
  }
  
  // If there are missing features, return validation error
  if (errors.length > 0) {
    return {
      isValid: false,
      errors: errors,
      processedData: null
    };
  }
  
  // IP address preprocessing (convert to numeric hash)
  if (processed.src_ip && typeof processed.src_ip === 'string') {
    processed.src_ip = ipToNumeric(processed.src_ip);
  }
  if (processed.dst_ip && typeof processed.dst_ip === 'string') {
    processed.dst_ip = ipToNumeric(processed.dst_ip);
  }
  
  // Protocol encoding
  if (processed.proto && typeof processed.proto === 'string') {
    processed.proto = protoMapping[processed.proto.toLowerCase()] || 0;
  }
  
  // Service encoding
  if (processed.service && typeof processed.service === 'string') {
    processed.service = serviceMapping[processed.service.toLowerCase()] || 0;
  }
  
  // Connection state encoding
  if (processed.conn_state && typeof processed.conn_state === 'string') {
    processed.conn_state = connStateMapping[processed.conn_state.toUpperCase()] || 0;
  }
  
  // DNS field encoding
  const dnsFields = ['dns_AA', 'dns_RD', 'dns_RA', 'dns_rejected'];
  dnsFields.forEach(field => {
    if (processed[field] && typeof processed[field] === 'string') {
      const value = processed[field].toLowerCase();
      if (value === 'true' || value === 't' || value === '1') {
        processed[field] = 1;
      } else if (value === 'false' || value === 'f' || value === '0') {
        processed[field] = 0;
      } else if (value === 'none' || value === '-') {
        processed[field] = 2;
      } else {
        processed[field] = 0; // default
      }
    }
  });
  
  // Ensure all numeric features are properly converted
  const numericFeatures = [
    'src_ip', 'src_port', 'dst_ip', 'dst_port', 'duration', 'src_bytes', 'dst_bytes', 'missed_bytes', 
    'src_pkts', 'src_ip_bytes', 'dst_pkts', 'dst_ip_bytes', 'dns_query', 'dns_qclass', 
    'dns_qtype', 'dns_rcode', 'http_request_body_len', 'http_response_body_len', 'http_status_code', 'label'
  ];
  
  numericFeatures.forEach(feature => {
    if (processed[feature] !== undefined) {
      const value = parseFloat(processed[feature]);
      processed[feature] = isNaN(value) ? 0 : value;
    }
  });
  
  // Ensure all 27 features are present with default values
  const modelFeatures = [
    'src_ip', 'src_port', 'dst_ip', 'dst_port', 'proto', 'service', 'duration',
    'src_bytes', 'dst_bytes', 'conn_state', 'missed_bytes', 'src_pkts', 'src_ip_bytes',
    'dst_pkts', 'dst_ip_bytes', 'dns_query', 'dns_qclass', 'dns_qtype', 'dns_rcode',
    'dns_AA', 'dns_RD', 'dns_RA', 'dns_rejected', 'http_request_body_len',
    'http_response_body_len', 'http_status_code', 'label'
  ];
  
  // Create final processed data with only the required features in the correct order
  const finalProcessed = {};
  modelFeatures.forEach(feature => {
    finalProcessed[feature] = processed[feature] || 0;
  });
  
  return {
    isValid: true,
    errors: [],
    processedData: finalProcessed
  };
}; 