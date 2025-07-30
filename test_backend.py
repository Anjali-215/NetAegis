import requests
import json

# Test the backend prediction endpoint
def test_prediction():
    url = "http://localhost:8000/predict"
    
    # Sample data that should work
    test_data = {
        "data": {
            "src_ip": 192168001001,
            "src_port": 80,
            "dst_ip": 10000001,
            "dst_port": 443,
            "proto": 1,
            "service": 0,
            "duration": 1.0,
            "src_bytes": 0,
            "dst_bytes": 0,
            "conn_state": 10,
            "missed_bytes": 0,
            "src_pkts": 1,
            "src_ip_bytes": 0,
            "dst_pkts": 1,
            "dst_ip_bytes": 0,
            "dns_query": 0,
            "dns_qclass": 0,
            "dns_qtype": 0,
            "dns_rcode": 0,
            "dns_AA": 2,
            "dns_RD": 2,
            "dns_RA": 2,
            "dns_rejected": 2,
            "http_request_body_len": 0,
            "http_response_body_len": 0,
            "http_status_code": 0,
            "label": 1
        },
        "user_email": None,
        "user_name": None
    }
    
    try:
        print("Testing backend prediction endpoint...")
        response = requests.post(url, json=test_data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Backend is working correctly!")
            print(f"Prediction: {result.get('prediction')}")
            print(f"Threat Type: {result.get('threat_type')}")
            print(f"Threat Level: {result.get('threat_level')}")
            print(f"Confidence: {result.get('confidence')}")
            return True
        else:
            print(f"❌ Backend returned status code: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Backend request timed out")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Make sure it's running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Error testing backend: {e}")
        return False

if __name__ == "__main__":
    test_prediction() 