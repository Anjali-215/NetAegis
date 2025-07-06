#!/usr/bin/env python3
"""
Test script to demonstrate threat detection for all 8 threat types
"""

import requests
import json
import time

# API base URL
API_BASE = "http://localhost:8000"

def test_api_health():
    """Test if the API is running"""
    try:
        response = requests.get(f"{API_BASE}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API Status: {data['status']}")
            print(f"📊 Models Loaded: {data['models_loaded']}")
            return True
        else:
            print(f"❌ API Health Check Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to API: {e}")
        return False

def test_single_prediction(threat_type, sample_data):
    """Test prediction for a specific threat type"""
    try:
        print(f"\n🔍 Testing {threat_type.upper()} detection...")
        
        response = requests.post(
            f"{API_BASE}/predict",
            json=sample_data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            print(f"   📊 Predicted Threat Type: {result['threat_type']}")
            print(f"   🚨 Threat Level: {result['threat_level']}")
            print(f"   🎯 Final Prediction: {result['final_prediction']}")
            
            # Show individual model predictions
            print("   🤖 Model Predictions:")
            for model, pred in result['predictions'].items():
                threat_map = {
                    0: "normal", 1: "scanning", 2: "ddos", 3: "injection",
                    4: "backdoor", 5: "xss", 6: "ransomware", 7: "mitm"
                }
                pred_name = threat_map.get(pred, "unknown")
                print(f"      {model}: {pred_name} ({pred})")
            
            return result['threat_type'] == threat_type
        else:
            print(f"   ❌ Prediction failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error testing {threat_type}: {e}")
        return False

def get_sample_data(threat_type):
    """Get sample network data for different threat types"""
    base_data = {
        "duration": 0,
        "protocol_type": "tcp",
        "service": "http",
        "flag": "SF",
        "src_bytes": 181,
        "dst_bytes": 5450,
        "land": 0,
        "wrong_fragment": 0,
        "urgent": 0,
        "hot": 0,
        "num_failed_logins": 0,
        "logged_in": 1,
        "num_compromised": 0,
        "root_shell": 0,
        "su_attempted": 0,
        "num_root": 0,
        "num_file_creations": 0,
        "num_shells": 0,
        "num_access_files": 0,
        "num_outbound_cmds": 0,
        "is_host_login": 0,
        "is_guest_login": 0,
        "count": 8,
        "srv_count": 8,
        "serror_rate": 0.0,
        "srv_serror_rate": 0.0,
        "rerror_rate": 0.0,
        "srv_rerror_rate": 0.0,
        "same_srv_rate": 1.0,
        "diff_srv_rate": 0.0,
        "srv_diff_host_rate": 0.0,
        "dst_host_count": 19,
        "dst_host_srv_count": 19,
        "dst_host_same_srv_rate": 1.0,
        "dst_host_diff_srv_rate": 0.0,
        "dst_host_same_src_port_rate": 0.05,
        "dst_host_srv_diff_host_rate": 0.0,
        "dst_host_serror_rate": 0.0,
        "dst_host_srv_serror_rate": 0.0,
        "dst_host_rerror_rate": 0.0,
        "dst_host_srv_rerror_rate": 0.0
    }
    
    # Modify data based on threat type
    if threat_type == "ddos":
        return {
            **base_data,
            "duration": 0,
            "src_bytes": 0,
            "dst_bytes": 0,
            "count": 100,
            "srv_count": 100,
            "dst_host_count": 100,
            "dst_host_srv_count": 100
        }
    elif threat_type == "scanning":
        return {
            **base_data,
            "duration": 0,
            "src_bytes": 0,
            "dst_bytes": 0,
            "count": 50,
            "srv_count": 50,
            "dst_host_count": 50,
            "dst_host_srv_count": 50
        }
    elif threat_type == "injection":
        return {
            **base_data,
            "duration": 0,
            "src_bytes": 1000,
            "dst_bytes": 1000,
            "num_failed_logins": 5,
            "logged_in": 0
        }
    elif threat_type == "backdoor":
        return {
            **base_data,
            "duration": 1000,
            "src_bytes": 100,
            "dst_bytes": 100,
            "root_shell": 1,
            "num_root": 1,
            "num_shells": 1
        }
    elif threat_type == "xss":
        return {
            **base_data,
            "duration": 0,
            "src_bytes": 500,
            "dst_bytes": 500,
            "service": "http",
            "num_access_files": 1
        }
    elif threat_type == "ransomware":
        return {
            **base_data,
            "duration": 5000,
            "src_bytes": 10000,
            "dst_bytes": 10000,
            "num_file_creations": 10,
            "num_access_files": 10
        }
    elif threat_type == "mitm":
        return {
            **base_data,
            "duration": 100,
            "src_bytes": 2000,
            "dst_bytes": 2000,
            "service": "ssl",
            "num_compromised": 1
        }
    else:  # normal
        return base_data

def main():
    """Main test function"""
    print("🚀 NetAegis Threat Detection Test")
    print("=" * 50)
    
    # Test API health
    if not test_api_health():
        print("\n❌ Cannot proceed - API is not available")
        print("Please start the backend server first:")
        print("cd backend && uvicorn main:app --reload")
        return
    
    # Define all threat types to test
    threat_types = [
        "normal",
        "scanning", 
        "ddos",
        "injection",
        "backdoor",
        "xss",
        "ransomware",
        "mitm"
    ]
    
    print(f"\n🎯 Testing all {len(threat_types)} threat types...")
    
    results = {}
    for threat_type in threat_types:
        sample_data = get_sample_data(threat_type)
        success = test_single_prediction(threat_type, sample_data)
        results[threat_type] = success
        time.sleep(1)  # Small delay between requests
    
    # Summary
    print(f"\n📊 Test Summary:")
    print("=" * 30)
    
    successful = sum(results.values())
    total = len(results)
    
    for threat_type, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{threat_type:12} : {status}")
    
    print(f"\n🎯 Overall: {successful}/{total} threat types detected correctly")
    
    if successful == total:
        print("🎉 All threat types detected successfully!")
    else:
        print("⚠️  Some threat types need attention")

if __name__ == "__main__":
    main() 