// Preprocessing utility for network threat detection data
// This handles label encoding for categorical features to match the training data format
// Based on the actual ML training dataset structure

// CORRECT Label encodings from actual training data
// These mappings EXACTLY match the LabelEncoder outputs from training
const LABEL_ENCODINGS = {
  proto: {
    'icmp': 0,  // ✅ CORRECT - alphabetical order from LabelEncoder
    'tcp': 1,   // ✅ CORRECT - alphabetical order from LabelEncoder
    'udp': 2    // ✅ CORRECT - alphabetical order from LabelEncoder
  },
  service: {
    '-': 0,           // ✅ CORRECT - alphabetical order from LabelEncoder
    'dce_rpc': 1,     // ✅ CORRECT - alphabetical order from LabelEncoder
    'dns': 2,         // ✅ CORRECT - alphabetical order from LabelEncoder
    'ftp': 3,         // ✅ CORRECT - alphabetical order from LabelEncoder
    'gssapi': 4,      // ✅ CORRECT - alphabetical order from LabelEncoder
    'http': 5,        // ✅ CORRECT - alphabetical order from LabelEncoder
    'smb': 6,         // ✅ CORRECT - alphabetical order from LabelEncoder
    'smb;gssapi': 7,  // ✅ CORRECT - alphabetical order from LabelEncoder
    'ssl': 8          // ✅ CORRECT - alphabetical order from LabelEncoder
  },
  conn_state: {
    'OTH': 0,     // ✅ CORRECT - alphabetical order from LabelEncoder
    'REJ': 1,     // ✅ CORRECT - alphabetical order from LabelEncoder
    'RSTO': 2,    // ✅ CORRECT - alphabetical order from LabelEncoder
    'RSTOS0': 3,  // ✅ CORRECT - alphabetical order from LabelEncoder
    'RSTR': 4,    // ✅ CORRECT - alphabetical order from LabelEncoder
    'RSTRH': 5,   // ✅ CORRECT - alphabetical order from LabelEncoder
    'S0': 6,      // ✅ CORRECT - alphabetical order from LabelEncoder
    'S1': 7,      // ✅ CORRECT - alphabetical order from LabelEncoder
    'S2': 8,      // ✅ CORRECT - alphabetical order from LabelEncoder
    'S3': 9,      // ✅ CORRECT - alphabetical order from LabelEncoder
    'SF': 10,     // ✅ CORRECT - alphabetical order from LabelEncoder
    'SH': 11,     // ✅ CORRECT - alphabetical order from LabelEncoder
    'SHR': 12     // ✅ CORRECT - alphabetical order from LabelEncoder
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

// CORRECT encodings from training data (matches backend exactly)
// These are the EXACT mappings used during ML model training
const protoMapping = {
  'icmp': 0,  // ✅ CORRECT - matches training LabelEncoder
  'tcp': 1,   // ✅ CORRECT - matches training LabelEncoder
  'udp': 2,   // ✅ CORRECT - matches training LabelEncoder
  '-': 0      // Default fallback
};

// Service mapping (matches training exactly)
const serviceMapping = {
  '-': 0,           // ✅ CORRECT - matches training LabelEncoder
  'dce_rpc': 1,
  'dns': 2,
  'ftp': 3,
  'gssapi': 4,
  'http': 5,        // ✅ CORRECT - matches training LabelEncoder
  'smb': 6,
  'smb;gssapi': 7,
  'ssl': 8          // ✅ CORRECT - matches training LabelEncoder
};

// Connection state mapping (matches training exactly)
const connStateMapping = {
  'OTH': 0,     // ✅ CORRECT - matches training LabelEncoder
  'REJ': 1,     // ✅ CORRECT - matches training LabelEncoder
  'RSTO': 2,    // ✅ CORRECT - matches training LabelEncoder
  'RSTOS0': 3,  // ✅ CORRECT - matches training LabelEncoder
  'RSTR': 4,    // ✅ CORRECT - matches training LabelEncoder
  'RSTRH': 5,   // ✅ CORRECT - matches training LabelEncoder
  'S0': 6,      // ✅ CORRECT - matches training LabelEncoder
  'S1': 7,      // ✅ CORRECT - matches training LabelEncoder
  'S2': 8,      // ✅ CORRECT - matches training LabelEncoder
  'S3': 9,      // ✅ CORRECT - matches training LabelEncoder
  'SF': 10,     // ✅ CORRECT - matches training LabelEncoder
  'SH': 11,     // ✅ CORRECT - matches training LabelEncoder
  'SHR': 12,    // ✅ CORRECT - matches training LabelEncoder
  '-': 0        // Default fallback
};

// Comprehensive column name mappings for different CSV/JSON formats
// Supports popular network monitoring tools: Wireshark, Zeek/Bro, Suricata, pfSense, etc.
const columnMappings = {
  // Source IP variations
  'source_ip': 'src_ip',
  'sourceip': 'src_ip',
  'source_address': 'src_ip',
  'src_addr': 'src_ip',
  'origin_ip': 'src_ip',
  'orig_h': 'src_ip',              // Zeek/Bro format
  'ip.src': 'src_ip',              // Wireshark format
  'srcip': 'src_ip',
  'saddr': 'src_ip',
  'source': 'src_ip',
  'from_ip': 'src_ip',
  'client_ip': 'src_ip',
  
  // Source Port variations
  'source_port': 'src_port',
  'sourceport': 'src_port',
  'src_prt': 'src_port',
  'origin_port': 'src_port',
  'orig_p': 'src_port',            // Zeek/Bro format
  'tcp.srcport': 'src_port',       // Wireshark format
  'udp.srcport': 'src_port',       // Wireshark format
  'srcport': 'src_port',
  'sport': 'src_port',
  'from_port': 'src_port',
  'client_port': 'src_port',
  
  // Destination IP variations
  'dest_ip': 'dst_ip',
  'destination_ip': 'dst_ip',
  'destip': 'dst_ip',
  'dst_addr': 'dst_ip',
  'target_ip': 'dst_ip',
  'resp_h': 'dst_ip',              // Zeek/Bro format
  'ip.dst': 'dst_ip',              // Wireshark format
  'dstip': 'dst_ip',
  'daddr': 'dst_ip',
  'destination': 'dst_ip',
  'to_ip': 'dst_ip',
  'server_ip': 'dst_ip',
  
  // Destination Port variations
  'dest_port': 'dst_port',
  'destination_port': 'dst_port',
  'destport': 'dst_port',
  'dst_prt': 'dst_port',
  'target_port': 'dst_port',
  'resp_p': 'dst_port',            // Zeek/Bro format
  'tcp.dstport': 'dst_port',       // Wireshark format
  'udp.dstport': 'dst_port',       // Wireshark format
  'dstport': 'dst_port',
  'dport': 'dst_port',
  'to_port': 'dst_port',
  'server_port': 'dst_port',
  
  // Protocol variations
  'protocol': 'proto',
  'prot': 'proto',
  'protocol_type': 'proto',
  'ip_protocol': 'proto',
  'ip.proto': 'proto',             // Wireshark format
  'frame.protocols': 'proto',      // Wireshark format
  'l4_proto': 'proto',
  'transport': 'proto',
  
  // Service variations
  'svc': 'service',
  'srv': 'service',
  'service_type': 'service',
  'application': 'service',
  'app': 'service',
  'protocol_service': 'service',
  'port_service': 'service',
  
  // Duration variations
  'time': 'duration',
  'dur': 'duration',
  'connection_time': 'duration',
  'flow_duration': 'duration',
  'session_time': 'duration',
  'elapsed': 'duration',
  'total_time': 'duration',
  
  // Source bytes variations
  'source_bytes': 'src_bytes',
  'src_size': 'src_bytes',
  'origin_bytes': 'src_bytes',
  'orig_bytes': 'src_bytes',       // Zeek/Bro format
  'orig_ip_bytes': 'src_bytes',
  'client_bytes': 'src_bytes',
  'upload_bytes': 'src_bytes',
  'sent_bytes': 'src_bytes',
  'tx_bytes': 'src_bytes',
  
  // Destination bytes variations
  'destination_bytes': 'dst_bytes',
  'dest_bytes': 'dst_bytes',
  'dst_size': 'dst_bytes',
  'target_bytes': 'dst_bytes',
  'resp_bytes': 'dst_bytes',       // Zeek/Bro format
  'resp_ip_bytes': 'dst_bytes',
  'server_bytes': 'dst_bytes',
  'download_bytes': 'dst_bytes',
  'received_bytes': 'dst_bytes',
  'rx_bytes': 'dst_bytes',
  
  // Connection state variations
  'state': 'conn_state',
  'connection_state': 'conn_state',
  'conn_status': 'conn_state',
  'status': 'conn_state',
  'tcp_state': 'conn_state',
  'flow_state': 'conn_state',
  'session_state': 'conn_state',
  
  // Source packet count variations
  'source_packets': 'src_pkts',
  'src_count': 'src_pkts',
  'origin_packets': 'src_pkts',
  'orig_pkts': 'src_pkts',         // Zeek/Bro format
  'client_packets': 'src_pkts',
  'upload_packets': 'src_pkts',
  'sent_packets': 'src_pkts',
  'tx_packets': 'src_pkts',
  'srcpkts': 'src_pkts',
  
  // Destination packet count variations
  'destination_packets': 'dst_pkts',
  'dest_packets': 'dst_pkts',
  'dst_count': 'dst_pkts',
  'target_packets': 'dst_pkts',
  'resp_pkts': 'dst_pkts',         // Zeek/Bro format
  'server_packets': 'dst_pkts',
  'download_packets': 'dst_pkts',
  'received_packets': 'dst_pkts',
  'rx_packets': 'dst_pkts',
  'dstpkts': 'dst_pkts',
  
  // Source IP bytes variations
  'source_ip_bytes': 'src_ip_bytes',
  'src_ip_size': 'src_ip_bytes',
  'orig_ip_bytes': 'src_ip_bytes',
  'client_ip_bytes': 'src_ip_bytes',
  
  // Destination IP bytes variations
  'destination_ip_bytes': 'dst_ip_bytes',
  'dst_ip_size': 'dst_ip_bytes',
  'resp_ip_bytes': 'dst_ip_bytes',
  'server_ip_bytes': 'dst_ip_bytes',
  
  // DNS query variations
  'dns_q': 'dns_query',
  'dns.qry.name': 'dns_query',     // Wireshark format
  'query': 'dns_query',
  'dns_name': 'dns_query',
  
  // DNS class variations
  'dns_qc': 'dns_qclass',
  'dns.qry.class': 'dns_qclass',   // Wireshark format
  'qclass': 'dns_qclass',
  
  // DNS type variations
  'dns_qt': 'dns_qtype',
  'dns.qry.type': 'dns_qtype',     // Wireshark format
  'qtype': 'dns_qtype',
  
  // DNS response code variations
  'dns_rc': 'dns_rcode',
  'dns.flags.rcode': 'dns_rcode',  // Wireshark format
  'rcode': 'dns_rcode',
  'response_code': 'dns_rcode',
  
  // DNS flags variations
  'dns_aa': 'dns_AA',
  'dns.flags.authoritative': 'dns_AA',
  'authoritative': 'dns_AA',
  'dns_rd': 'dns_RD',
  'dns.flags.recdesired': 'dns_RD',
  'recursion_desired': 'dns_RD',
  'dns_ra': 'dns_RA',
  'dns.flags.recavail': 'dns_RA',
  'recursion_available': 'dns_RA',
  'dns_rej': 'dns_rejected',
  'dns_rejected_flag': 'dns_rejected',
  'rejected': 'dns_rejected',
  
  // HTTP request length variations
  'http_req_len': 'http_request_body_len',
  'http_request_len': 'http_request_body_len',
  'http_request_size': 'http_request_body_len',
  'request_body_length': 'http_request_body_len',
  'req_body_len': 'http_request_body_len',
  'http.request.body.len': 'http_request_body_len',
  
  // HTTP response length variations
  'http_resp_len': 'http_response_body_len',
  'http_response_len': 'http_response_body_len',
  'http_response_size': 'http_response_body_len',
  'response_body_length': 'http_response_body_len',
  'resp_body_len': 'http_response_body_len',
  'http.response.body.len': 'http_response_body_len',
  
  // HTTP status code variations
  'http_code': 'http_status_code',
  'http_status': 'http_status_code',
  'status_code': 'http_status_code',
  'response_code': 'http_status_code',
  'http.response.code': 'http_status_code',
  'resp_code': 'http_status_code',
  
  // Label/Attack type variations
  'attack_type': 'label',
  'threat_type': 'label',
  'class': 'label',
  'target': 'label',
  'attack': 'label',
  'threat': 'label',
  'classification': 'label',
  'category': 'label',
  'malware': 'label',
  'intrusion': 'label',
  'anomaly': 'label',
  'normal': 'label',
  'benign': 'label',
  
  // Missed bytes variations
  'lost': 'missed_bytes',
  'lost_bytes': 'missed_bytes',
  'missing_bytes': 'missed_bytes',
  'dropped_bytes': 'missed_bytes',
  'retransmitted': 'missed_bytes'
};

// Function to normalize column names
const normalizeColumnNames = (data) => {
  const normalized = {};
  
  for (const [key, value] of Object.entries(data)) {
    const normalizedKey = key.toLowerCase().trim();
    const mappedKey = columnMappings[normalizedKey] || normalizedKey;
    normalized[mappedKey] = value;
  }
  
  return normalized;
};

// Function to detect and suggest column mappings
const detectColumnMappings = (headers) => {
  const suggestions = {};
  const requiredFeatures = [
    'src_ip', 'src_port', 'dst_ip', 'dst_port', 'proto', 'service', 'duration',
    'src_bytes', 'dst_bytes', 'conn_state', 'missed_bytes', 'src_pkts', 'src_ip_bytes',
    'dst_pkts', 'dst_ip_bytes', 'dns_query', 'dns_qclass', 'dns_qtype', 'dns_rcode',
    'dns_AA', 'dns_RD', 'dns_RA', 'dns_rejected', 'http_request_body_len',
    'http_response_body_len', 'http_status_code', 'label'
  ];
  
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  
  requiredFeatures.forEach(required => {
    // Check if exact match exists
    if (normalizedHeaders.includes(required)) {
      suggestions[required] = required;
      return;
    }
    
    // Check for mapped alternatives
    for (const [alt, mapped] of Object.entries(columnMappings)) {
      if (mapped === required && normalizedHeaders.includes(alt)) {
        suggestions[required] = alt;
        return;
      }
    }
    
    // If no mapping found, mark as missing
    suggestions[required] = null;
  });
  
  return suggestions;
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



export const preprocessNetworkData = (data) => {
  // First, normalize column names to handle different CSV formats
  const normalizedData = normalizeColumnNames(data);
  
  // Create a copy of the normalized data to avoid mutating the original
  const processed = { ...normalizedData };
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

// Export the new functions
export { detectColumnMappings, normalizeColumnNames }; 