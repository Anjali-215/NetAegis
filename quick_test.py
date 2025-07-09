import requests

def test_threat_types():
    # Test normal traffic
    normal_data = {
        'src_ip': '192.168.1.100', 'src_port': 80, 'dst_ip': '192.168.1.200', 'dst_port': 443,
        'proto': 'tcp', 'service': 'http', 'duration': 5.0, 'src_bytes': 1024, 'dst_bytes': 512,
        'conn_state': 'SF', 'missed_bytes': 0, 'src_pkts': 10, 'src_ip_bytes': 1024, 'dst_pkts': 8,
        'dst_ip_bytes': 512, 'dns_query': 0, 'dns_qclass': 0, 'dns_qtype': 0, 'dns_rcode': 0,
        'dns_AA': 'none', 'dns_RD': 'none', 'dns_RA': 'none', 'dns_rejected': 'none',
        'http_request_body_len': 0, 'http_response_body_len': 0, 'http_status_code': 200, 'label': 1
    }
    
    # Test DDoS traffic
    ddos_data = {
        'src_ip': '10.0.0.1', 'src_port': 80, 'dst_ip': '10.0.0.100', 'dst_port': 80,
        'proto': 'tcp', 'service': 'http', 'duration': 0.0, 'src_bytes': 64, 'dst_bytes': 0,
        'conn_state': 'S0', 'missed_bytes': 0, 'src_pkts': 1000, 'src_ip_bytes': 64000, 'dst_pkts': 0,
        'dst_ip_bytes': 0, 'dns_query': 0, 'dns_qclass': 0, 'dns_qtype': 0, 'dns_rcode': 0,
        'dns_AA': 'none', 'dns_RD': 'none', 'dns_RA': 'none', 'dns_rejected': 'none',
        'http_request_body_len': 0, 'http_response_body_len': 0, 'http_status_code': 0, 'label': 1
    }
    
    # Test DoS traffic
    dos_data = {
        'src_ip': '10.0.0.5', 'src_port': 80, 'dst_ip': '10.0.0.100', 'dst_port': 80,
        'proto': 'tcp', 'service': 'http', 'duration': 0.0, 'src_bytes': 0, 'dst_bytes': 0,
        'conn_state': 'REJ', 'missed_bytes': 0, 'src_pkts': 200, 'src_ip_bytes': 0, 'dst_pkts': 0,
        'dst_ip_bytes': 0, 'dns_query': 0, 'dns_qclass': 0, 'dns_qtype': 0, 'dns_rcode': 0,
        'dns_AA': 'none', 'dns_RD': 'none', 'dns_RA': 'none', 'dns_rejected': 'none',
        'http_request_body_len': 0, 'http_response_body_len': 0, 'http_status_code': 0, 'label': 1
    }
    
    # Test backdoor traffic
    backdoor_data = {
        'src_ip': '172.16.0.1', 'src_port': 4444, 'dst_ip': '172.16.0.100', 'dst_port': 49178,
        'proto': 'tcp', 'service': '-', 'duration': 290.371539, 'src_bytes': 101568, 'dst_bytes': 2592,
        'conn_state': 'OTH', 'missed_bytes': 0, 'src_pkts': 1, 'src_ip_bytes': 0, 'dst_pkts': 1,
        'dst_ip_bytes': 0, 'dns_query': 0, 'dns_qclass': 0, 'dns_qtype': 0, 'dns_rcode': 0,
        'dns_AA': 'none', 'dns_RD': 'none', 'dns_RA': 'none', 'dns_rejected': 'none',
        'http_request_body_len': 0, 'http_response_body_len': 0, 'http_status_code': 0, 'label': 1
    }
    
    tests = [
        ('normal', normal_data),
        ('ddos', ddos_data),
        ('dos', dos_data),
        ('backdoor', backdoor_data)
    ]
    
    print("🧪 Testing All Threat Types:")
    print("=" * 40)
    
    for expected, data in tests:
        try:
            r = requests.post('http://localhost:8000/predict', json=data)
            if r.status_code == 200:
                result = r.json()['threat_type']
                status = "✅" if result == expected else "❌"
                print(f"{status} {expected.upper()} → '{result}'")
            else:
                print(f"❌ {expected.upper()} → Error: {r.text}")
        except Exception as e:
            print(f"❌ {expected.upper()} → Connection error: {e}")
    
    print("\n" + "=" * 40)
    print("Pipeline Status: All input methods should give these same results!")

if __name__ == "__main__":
    test_threat_types() 