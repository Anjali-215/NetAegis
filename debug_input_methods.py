import requests
import json
import time
import pandas as pd

def test_identical_data_all_methods():
    """Test identical data through all three input methods to find preprocessing differences"""
    print("🔍 DEBUG: Testing Identical Data Through All Input Methods")
    print("=" * 70)
    
    # Wait for server to start
    time.sleep(3)
    
    # Load a real sample from training data
    df = pd.read_csv('Ml/cleaned_network_data.csv')
    
    # Test with normal traffic
    print("\n📋 Testing NORMAL traffic:")
    normal_sample = df[df['type'] == 'normal'].iloc[0]
    print(f"   Training data: proto={normal_sample['proto']}, service={normal_sample['service']}, conn_state={normal_sample['conn_state']}")
    
    # Test with DDoS traffic
    print("\n📋 Testing DDOS traffic:")
    ddos_sample = df[df['type'] == 'ddos'].iloc[0]
    print(f"   Training data: proto={ddos_sample['proto']}, service={ddos_sample['service']}, conn_state={ddos_sample['conn_state']}")
    
    # Test with DoS traffic
    print("\n📋 Testing DOS traffic:")
    dos_sample = df[df['type'] == 'dos'].iloc[0]
    print(f"   Training data: proto={dos_sample['proto']}, service={dos_sample['service']}, conn_state={dos_sample['conn_state']}")
    
    # Test with Backdoor traffic
    print("\n📋 Testing BACKDOOR traffic:")
    backdoor_sample = df[df['type'] == 'backdoor'].iloc[0]
    print(f"   Training data: proto={backdoor_sample['proto']}, service={backdoor_sample['service']}, conn_state={backdoor_sample['conn_state']}")
    
    # Test samples
    test_samples = [
        ('normal', normal_sample),
        ('ddos', ddos_sample),
        ('dos', dos_sample),
        ('backdoor', backdoor_sample)
    ]
    
    print("\n🧪 Testing API Direct Calls:")
    print("-" * 50)
    
    for expected_type, sample in test_samples:
        # Convert training sample to API format
        api_data = {
            'src_ip': str(sample['src_ip']),
            'src_port': int(sample['src_port']),
            'dst_ip': str(sample['dst_ip']),
            'dst_port': int(sample['dst_port']),
            'proto': str(sample['proto']),
            'service': str(sample['service']),
            'duration': float(sample['duration']),
            'src_bytes': int(sample['src_bytes']),
            'dst_bytes': int(sample['dst_bytes']),
            'conn_state': str(sample['conn_state']),
            'missed_bytes': int(sample['missed_bytes']),
            'src_pkts': int(sample['src_pkts']),
            'src_ip_bytes': int(sample['src_ip_bytes']),
            'dst_pkts': int(sample['dst_pkts']),
            'dst_ip_bytes': int(sample['dst_ip_bytes']),
            'dns_query': int(sample['dns_query']),
            'dns_qclass': int(sample['dns_qclass']),
            'dns_qtype': int(sample['dns_qtype']),
            'dns_rcode': int(sample['dns_rcode']),
            'dns_AA': str(sample['dns_AA']),
            'dns_RD': str(sample['dns_RD']),
            'dns_RA': str(sample['dns_RA']),
            'dns_rejected': str(sample['dns_rejected']),
            'http_request_body_len': int(sample['http_request_body_len']),
            'http_response_body_len': int(sample['http_response_body_len']),
            'http_status_code': int(sample['http_status_code']),
            'label': int(sample['label'])
        }
        
        try:
            response = requests.post('http://localhost:8000/predict', json=api_data, timeout=10)
            if response.status_code == 200:
                result = response.json()
                status = "✅" if result['threat_type'] == expected_type else "❌"
                print(f"   {status} {expected_type.upper()} → '{result['threat_type']}' (confidence: {result['confidence']:.1f}%)")
            else:
                print(f"   ❌ {expected_type.upper()} → Error: {response.text}")
        except Exception as e:
            print(f"   ❌ {expected_type.upper()} → Connection error: {e}")
    
    print("\n🔍 KEY FINDINGS:")
    print("-" * 50)
    print("• If normal traffic shows as 'normal' = ✅ Backend preprocessing is correct")
    print("• If normal traffic shows as 'scanning' = ❌ Backend preprocessing is wrong")
    print("• If ddos traffic shows as 'ddos' = ✅ Backend preprocessing is correct")
    print("• If ddos traffic shows as 'dos' = ❌ Backend preprocessing is wrong")
    
    # Test specific encoding issues
    print("\n🔬 Testing Specific Encoding Issues:")
    print("-" * 50)
    
    # Test different protocol encodings
    test_protocols = [
        {'proto': 'tcp', 'expected_encoding': 1},
        {'proto': 'udp', 'expected_encoding': 2},
        {'proto': 'icmp', 'expected_encoding': 0}
    ]
    
    for proto_test in test_protocols:
        test_data = {
            'src_ip': '192.168.1.100',
            'src_port': 80,
            'dst_ip': '192.168.1.200',
            'dst_port': 443,
            'proto': proto_test['proto'],
            'service': 'http',
            'duration': 5.0,
            'src_bytes': 1024,
            'dst_bytes': 512,
            'conn_state': 'SF',
            'missed_bytes': 0,
            'src_pkts': 10,
            'src_ip_bytes': 1024,
            'dst_pkts': 8,
            'dst_ip_bytes': 512,
            'dns_query': 0,
            'dns_qclass': 0,
            'dns_qtype': 0,
            'dns_rcode': 0,
            'dns_AA': 'none',
            'dns_RD': 'none',
            'dns_RA': 'none',
            'dns_rejected': 'none',
            'http_request_body_len': 0,
            'http_response_body_len': 0,
            'http_status_code': 200,
            'label': 1
        }
        
        try:
            response = requests.post('http://localhost:8000/predict', json=test_data, timeout=10)
            if response.status_code == 200:
                result = response.json()
                print(f"   proto='{proto_test['proto']}' → '{result['threat_type']}'")
            else:
                print(f"   proto='{proto_test['proto']}' → Error: {response.text}")
        except Exception as e:
            print(f"   proto='{proto_test['proto']}' → Connection error: {e}")
    
    print("\n" + "=" * 70)
    print("🎯 CONCLUSION:")
    print("If results are inconsistent, the preprocessing pipeline needs further fixes!")

if __name__ == "__main__":
    test_identical_data_all_methods() 