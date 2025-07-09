import requests
import json
import pickle

def check_label_encoder():
    """Check the actual label encoder classes"""
    try:
        with open('backend/label_encoder.pkl', 'rb') as f:
            le = pickle.load(f)
        print("🔍 Label Encoder Classes:")
        for i, class_name in enumerate(le.classes_):
            print(f"   {i}: {class_name}")
        return le.classes_
    except Exception as e:
        print(f"❌ Error loading label encoder: {e}")
        return None

def test_threat_pattern(name, data):
    """Test a specific threat pattern"""
    try:
        response = requests.post("http://localhost:8000/predict", json=data)
        if response.status_code == 200:
            result = response.json()
            print(f"\n🎯 {name}:")
            print(f"   Prediction: {result['prediction']}")
            print(f"   Threat Type: {result['threat_type']}")
            print(f"   Threat Level: {result['threat_level']}")
            print(f"   Confidence: {result.get('confidence', 'N/A')}")
            return result
        else:
            print(f"❌ {name} failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ {name} error: {e}")
        return None

def main():
    print("🚀 DDoS vs DoS Detection Test")
    print("=" * 50)
    
    # Check label encoder classes
    classes = check_label_encoder()
    
    # Test 1: Classic DDoS pattern (distributed, multiple small packets)
    ddos_pattern = {
        "src_ip": "10.0.0.100",
        "src_port": 443,
        "dst_ip": "192.168.1.200",
        "dst_port": 80,
        "proto": "tcp",
        "service": "http",
        "duration": 0.001,  # Very short duration
        "src_bytes": 40,    # Small packet size
        "dst_bytes": 0,     # No response
        "conn_state": "S0", # SYN flood
        "missed_bytes": 0,
        "src_pkts": 50000,  # Very high packet count (DDoS characteristic)
        "src_ip_bytes": 2000000,  # High volume
        "dst_pkts": 0,
        "dst_ip_bytes": 0,
        "dns_query": 0,
        "dns_qclass": 0,
        "dns_qtype": 0,
        "dns_rcode": 0,
        "dns_AA": "none",
        "dns_RD": "none",
        "dns_RA": "none",
        "dns_rejected": "none",
        "http_request_body_len": 0,
        "http_response_body_len": 0,
        "http_status_code": 0,
        "label": 1
    }
    
    # Test 2: Classic DoS pattern (single source, resource exhaustion)
    dos_pattern = {
        "src_ip": "192.168.1.50",
        "src_port": 8080,
        "dst_ip": "192.168.1.200",
        "dst_port": 80,
        "proto": "tcp",
        "service": "http",
        "duration": 0.1,    # Slightly longer
        "src_bytes": 1024,  # Larger packets
        "dst_bytes": 0,
        "conn_state": "RSTO", # Reset connection
        "missed_bytes": 0,
        "src_pkts": 5000,   # High but lower than DDoS
        "src_ip_bytes": 5120000,
        "dst_pkts": 0,
        "dst_ip_bytes": 0,
        "dns_query": 0,
        "dns_qclass": 0,
        "dns_qtype": 0,
        "dns_rcode": 0,
        "dns_AA": "none",
        "dns_RD": "none",
        "dns_RA": "none",
        "dns_rejected": "none",
        "http_request_body_len": 1024,
        "http_response_body_len": 0,
        "http_status_code": 0,
        "label": 1
    }
    
    # Test 3: High-volume DDoS (amplification attack)
    ddos_amplification = {
        "src_ip": "172.16.0.100",
        "src_port": 53,
        "dst_ip": "192.168.1.200",
        "dst_port": 53,
        "proto": "udp",
        "service": "dns",
        "duration": 0.0001,
        "src_bytes": 64,
        "dst_bytes": 4096,  # DNS amplification
        "conn_state": "SF",
        "missed_bytes": 0,
        "src_pkts": 100000,  # Extremely high
        "src_ip_bytes": 6400000,
        "dst_pkts": 100000,
        "dst_ip_bytes": 409600000,  # Massive amplification
        "dns_query": 1,
        "dns_qclass": 1,
        "dns_qtype": 255,  # ANY query (amplification)
        "dns_rcode": 0,
        "dns_AA": "true",
        "dns_RD": "true",
        "dns_RA": "true",
        "dns_rejected": "false",
        "http_request_body_len": 0,
        "http_response_body_len": 0,
        "http_status_code": 0,
        "label": 1
    }
    
    # Test 4: Normal traffic for comparison
    normal_pattern = {
        "src_ip": "192.168.1.10",
        "src_port": 49152,
        "dst_ip": "8.8.8.8",
        "dst_port": 443,
        "proto": "tcp",
        "service": "http",
        "duration": 2.5,
        "src_bytes": 512,
        "dst_bytes": 1024,
        "conn_state": "SF",
        "missed_bytes": 0,
        "src_pkts": 8,
        "src_ip_bytes": 512,
        "dst_pkts": 6,
        "dst_ip_bytes": 1024,
        "dns_query": 0,
        "dns_qclass": 0,
        "dns_qtype": 0,
        "dns_rcode": 0,
        "dns_AA": "none",
        "dns_RD": "none",
        "dns_RA": "none",
        "dns_rejected": "none",
        "http_request_body_len": 256,
        "http_response_body_len": 512,
        "http_status_code": 200,
        "label": 0
    }
    
    # Run tests
    print("\n🧪 Testing Different Patterns:")
    test_threat_pattern("Classic DDoS Pattern", ddos_pattern)
    test_threat_pattern("Classic DoS Pattern", dos_pattern)
    test_threat_pattern("DDoS Amplification", ddos_amplification)
    test_threat_pattern("Normal Traffic", normal_pattern)
    
    print("\n💡 Analysis:")
    print("If all attacks show 'dos', the model might:")
    print("1. Consider your test pattern more like DoS than DDoS")
    print("2. Have different class mappings than expected")
    print("3. Need different features to distinguish DoS vs DDoS")

if __name__ == "__main__":
    main() 