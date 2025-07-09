import requests
import json

# API endpoint
API_URL = "http://localhost:8000/predict"

def test_ddos_prediction():
    """Test DDoS detection with JSON data"""
    ddos_data = {
        "src_ip": "192.168.1.100",
        "src_port": 80,
        "dst_ip": "192.168.1.200", 
        "dst_port": 80,
        "proto": "tcp",
        "service": "-",
        "duration": 0,
        "src_bytes": 64,
        "dst_bytes": 0,
        "conn_state": "S0",
        "missed_bytes": 0,
        "src_pkts": 10000,
        "src_ip_bytes": 640000,
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
    
    print("🎯 Testing DDoS Detection...")
    print(f"Input data: {json.dumps(ddos_data, indent=2)}")
    
    try:
        response = requests.post(API_URL, json=ddos_data)
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ SUCCESS!")
            print(f"🔍 Threat Type: {result['threat_type']}")
            print(f"⚠️  Threat Level: {result['threat_level']}")
            print(f"🎯 Prediction: {result['prediction']}")
            print(f"📊 Confidence: {result.get('confidence', 'N/A')}")
            
            if result['threat_type'] == 'ddos':
                print("\n🎉 DDoS detection is working correctly!")
            else:
                print(f"\n⚠️  Expected 'ddos' but got '{result['threat_type']}'")
                
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Connection error: {e}")

def test_normal_traffic():
    """Test normal traffic detection"""
    normal_data = {
        "src_ip": "192.168.1.10",
        "src_port": 443,
        "dst_ip": "8.8.8.8", 
        "dst_port": 443,
        "proto": "tcp",
        "service": "http",
        "duration": 120.5,
        "src_bytes": 2048,
        "dst_bytes": 4096,
        "conn_state": "SF",
        "missed_bytes": 0,
        "src_pkts": 10,
        "src_ip_bytes": 2048,
        "dst_pkts": 12,
        "dst_ip_bytes": 4096,
        "dns_query": 0,
        "dns_qclass": 0,
        "dns_qtype": 0,
        "dns_rcode": 0,
        "dns_AA": "none",
        "dns_RD": "none", 
        "dns_RA": "none",
        "dns_rejected": "none",
        "http_request_body_len": 512,
        "http_response_body_len": 1024,
        "http_status_code": 200,
        "label": 0
    }
    
    print("\n🌐 Testing Normal Traffic Detection...")
    
    try:
        response = requests.post(API_URL, json=normal_data)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Threat Type: {result['threat_type']}")
            print(f"✅ Threat Level: {result['threat_level']}")
        else:
            print(f"❌ Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Connection error: {e}")

def test_api_health():
    """Test if API is running"""
    try:
        response = requests.get("http://localhost:8000/health")
        if response.status_code == 200:
            result = response.json()
            print(f"✅ API is healthy: {result['models_loaded']} models loaded")
            return True
        else:
            print(f"❌ API health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to API: {e}")
        return False

if __name__ == "__main__":
    print("🚀 JSON Prediction Test")
    print("=" * 50)
    
    # Test API health first
    if test_api_health():
        # Test DDoS detection
        test_ddos_prediction()
        
        # Test normal traffic
        test_normal_traffic()
        
        print("\n🎯 Test complete!")
    else:
        print("\n❌ Please start the backend API first:")
        print("cd backend && python main.py") 