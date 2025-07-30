import requests
import json

# Test the prediction endpoint with correct data structure
def test_prediction():
    url = "http://localhost:8000/predict"
    
    # Sample network data
    sample_data = {
        "src_port": 4444,
        "dst_port": 49178,
        "proto": 0,  # tcp
        "service": 0,  # -
        "duration": 290.371539,
        "src_bytes": 101568,
        "dst_bytes": 2592,
        "conn_state": 9,  # OTH
        "missed_bytes": 0,
        "history": "D",
        "orig_pkts": 1,
        "orig_ip_bytes": 0,
        "resp_pkts": 1,
        "resp_ip_bytes": 0,
        "tunnel_parents": 0,
        "dns_query": 0,
        "dns_rcode": 0,
        "dns_AA": 2,  # none
        "dns_RD": 2,  # none
        "dns_RA": 2,  # none
        "dns_rejected": 2,  # none
        "http_request_body_len": 0,
        "http_response_body_len": 0,
        "http_status_code": 0
    }
    
    # Correct request structure that matches PredictionRequest model
    request_body = {
        "data": sample_data,
        "user_email": "test@example.com",
        "user_name": "Test User"
    }
    
    try:
        print("Testing prediction endpoint...")
        print(f"Request URL: {url}")
        print(f"Request body: {json.dumps(request_body, indent=2)}")
        
        response = requests.post(url, json=request_body)
        
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Prediction successful!")
            print(f"Threat type: {result.get('threat_type')}")
            print(f"Threat level: {result.get('threat_level')}")
            print(f"Confidence: {result.get('confidence')}")
        else:
            print("❌ Prediction failed!")
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_prediction() 