// Test file for the preprocessor utility
import { preprocessData, getAvailableCategories, getSampleData } from './preprocessor';

// Test data based on actual network traffic features
const testData = {
  src_port: '4444',
  dst_port: '49178',
  proto: 'tcp',
  service: '-',
  duration: '290.371539',
  src_bytes: '101568',
  dst_bytes: '2592',
  conn_state: 'OTH',
  missed_bytes: '0',
  history: 'D',
  orig_pkts: '1',
  orig_ip_bytes: '0',
  resp_pkts: '1',
  resp_ip_bytes: '0',
  tunnel_parents: '0',
  dns_query: '0',
  dns_rcode: '0',
  dns_AA: 'none',
  dns_RD: 'none',
  dns_RA: 'none',
  dns_rejected: 'none',
  http_request_body_len: '0',
  http_response_body_len: '0',
  http_status_code: '0'
};

// Test the preprocessor
console.log('Testing preprocessor...');

// Test 1: Normal data
console.log('Test 1: Normal data');
const processed = preprocessData(testData);
console.log('Original proto:', testData.proto);
console.log('Processed proto:', processed.proto);
console.log('Original service:', testData.service);
console.log('Processed service:', processed.service);
console.log('Original conn_state:', testData.conn_state);
console.log('Processed conn_state:', processed.conn_state);
console.log('All numeric features converted:', typeof processed.duration === 'number');

// Test 2: Unknown categories
console.log('\nTest 2: Unknown categories');
const unknownData = {
  ...testData,
  proto: 'unknown_protocol',
  service: 'unknown_service',
  conn_state: 'unknown_state'
};
const processedUnknown = preprocessData(unknownData);
console.log('Unknown proto -> default:', processedUnknown.proto);
console.log('Unknown service -> default:', processedUnknown.service);
console.log('Unknown conn_state -> default:', processedUnknown.conn_state);

// Test 3: Available categories
console.log('\nTest 3: Available categories');
const categories = getAvailableCategories();
console.log('Available protos:', categories.proto);
console.log('Available services:', categories.service.slice(0, 10), '...'); // Show first 10
console.log('Available conn_states:', categories.conn_state);

// Test 4: Sample data
console.log('\nTest 4: Sample data');
const sampleData = getSampleData();
console.log('Sample data structure:', Object.keys(sampleData));
console.log('Sample proto:', sampleData.proto);
console.log('Sample service:', sampleData.service);

console.log('\nPreprocessor test completed successfully!'); 