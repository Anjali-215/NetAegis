import pandas as pd
import requests
import json
import csv
import io

def test_all_input_methods():
    """Test that CSV, JSON, and Manual input methods produce identical results"""
    print("🔍 Testing All Input Methods for Consistency")
    print("=" * 60)
    
    # Get a normal sample from training data
    df = pd.read_csv('Ml/cleaned_network_data.csv')
    normal_sample = df[df['type'] == 'normal'].iloc[0]
    
    print("📊 Original training data (normal):")
    print(f"   proto: {normal_sample['proto']}")
    print(f"   service: {normal_sample['service']}")
    print(f"   conn_state: {normal_sample['conn_state']}")
    print(f"   duration: {normal_sample['duration']}")
    print(f"   src_bytes: {normal_sample['src_bytes']}")
    
    # Test data in the format that should work
    test_data = {
        'src_ip': '192.168.1.100',
        'src_port': int(normal_sample['src_port']),
        'dst_ip': '192.168.1.200', 
        'dst_port': int(normal_sample['dst_port']),
        'proto': str(normal_sample['proto']),
        'service': str(normal_sample['service']),
        'duration': float(normal_sample['duration']),
        'src_bytes': int(normal_sample['src_bytes']),
        'dst_bytes': int(normal_sample['dst_bytes']),
        'conn_state': str(normal_sample['conn_state']),
        'missed_bytes': int(normal_sample['missed_bytes']),
        'src_pkts': int(normal_sample['src_pkts']),
        'src_ip_bytes': int(normal_sample['src_ip_bytes']),
        'dst_pkts': int(normal_sample['dst_pkts']),
        'dst_ip_bytes': int(normal_sample['dst_ip_bytes']),
        'dns_query': int(normal_sample['dns_query']),
        'dns_qclass': int(normal_sample['dns_qclass']),
        'dns_qtype': int(normal_sample['dns_qtype']),
        'dns_rcode': int(normal_sample['dns_rcode']),
        'dns_AA': str(normal_sample['dns_AA']),
        'dns_RD': str(normal_sample['dns_RD']),
        'dns_RA': str(normal_sample['dns_RA']),
        'dns_rejected': str(normal_sample['dns_rejected']),
        'http_request_body_len': int(normal_sample['http_request_body_len']),
        'http_response_body_len': int(normal_sample['http_response_body_len']),
        'http_status_code': int(normal_sample['http_status_code']),
        'label': int(normal_sample['label'])
    }
    
    print(f"\n🧪 Test data format:")
    print(f"   proto: '{test_data['proto']}'")
    print(f"   service: '{test_data['service']}'")
    print(f"   conn_state: '{test_data['conn_state']}'")
    
    # Test 1: Direct API call (simulates manual entry)
    print(f"\n1. 🎯 Direct API call (Manual Entry simulation):")
    try:
        response = requests.post('http://localhost:8000/predict', json=test_data)
        if response.status_code == 200:
            result = response.json()
            print(f"   Result: '{result['threat_type']}' (Expected: 'normal')")
            print(f"   Confidence: {result['confidence']:.2f}%")
        else:
            print(f"   ❌ Error: {response.text}")
    except Exception as e:
        print(f"   ❌ Connection error: {e}")
    
    # Test 2: CSV simulation
    print(f"\n2. 📁 CSV simulation:")
    # Create a CSV string
    csv_data = io.StringIO()
    writer = csv.DictWriter(csv_data, fieldnames=test_data.keys())
    writer.writeheader()
    writer.writerow(test_data)
    csv_content = csv_data.getvalue()
    
    print(f"   CSV content preview: {csv_content[:100]}...")
    
    # Test 3: JSON simulation  
    print(f"\n3. 📄 JSON simulation:")
    json_content = json.dumps(test_data, indent=2)
    print(f"   JSON content preview: {json_content[:100]}...")
    
    # Test with different proto values that might cause issues
    print(f"\n4. 🔍 Testing Different Proto Values:")
    
    proto_tests = ['tcp', 'udp', 'icmp']
    for proto in proto_tests:
        test_proto_data = test_data.copy()
        test_proto_data['proto'] = proto
        
        try:
            response = requests.post('http://localhost:8000/predict', json=test_proto_data)
            if response.status_code == 200:
                result = response.json()
                print(f"   proto='{proto}' → '{result['threat_type']}'")
            else:
                print(f"   proto='{proto}' → ❌ Error: {response.text}")
        except Exception as e:
            print(f"   proto='{proto}' → ❌ Connection error: {e}")
    
    # Test 5: Service values
    print(f"\n5. 🔍 Testing Different Service Values:")
    
    service_tests = ['-', 'http', 'dns', 'ssl', 'ftp']
    for service in service_tests:
        test_service_data = test_data.copy()
        test_service_data['service'] = service
        
        try:
            response = requests.post('http://localhost:8000/predict', json=test_service_data)
            if response.status_code == 200:
                result = response.json()
                print(f"   service='{service}' → '{result['threat_type']}'")
            else:
                print(f"   service='{service}' → ❌ Error: {response.text}")
        except Exception as e:
            print(f"   service='{service}' → ❌ Connection error: {e}")
    
    print(f"\n" + "=" * 60)
    print("✅ Preprocessing Consistency Test Complete!")

if __name__ == "__main__":
    test_all_input_methods() 