#!/usr/bin/env python3
"""
Test script to verify the authentication fix for ML results saving
"""

import requests
import json
import time

# Test configuration
BASE_URL = "http://localhost:8000"
LOGIN_URL = f"{BASE_URL}/auth/login"
ML_RESULTS_URL = f"{BASE_URL}/ml-results"
REFRESH_URL = f"{BASE_URL}/auth/refresh"

def test_authentication_fix():
    """Test the authentication fix for ML results saving"""
    
    print("Testing authentication fix for ML results saving...")
    
    # Test 1: Login and get token
    print("\n1. Testing login...")
    login_data = {
        "email": "admin@netaegis.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(LOGIN_URL, json=login_data)
        if response.status_code == 200:
            token_data = response.json()
            token = token_data.get('access_token')
            print(f"✅ Login successful, token received: {token[:20]}...")
        else:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Login error: {e}")
        return False
    
    # Test 2: Test token refresh
    print("\n2. Testing token refresh...")
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.post(REFRESH_URL, headers=headers)
        if response.status_code == 200:
            refresh_data = response.json()
            new_token = refresh_data.get('access_token')
            print(f"✅ Token refresh successful, new token: {new_token[:20]}...")
        else:
            print(f"❌ Token refresh failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Token refresh error: {e}")
        return False
    
    # Test 3: Test ML results saving with authentication
    print("\n3. Testing ML results saving with authentication...")
    
    test_ml_data = {
        "user_email": "admin@netaegis.com",
        "user_name": "Admin User",
        "file_name": "test_dataset.csv",
        "total_records": 100,
        "processed_records": 95,
        "failed_records": 5,
        "threat_summary": {
            "normal": 80,
            "ddos": 10,
            "scanning": 5
        },
        "processing_duration": 2.5,
        "results": [
            {
                "record_id": 1,
                "prediction": "normal",
                "confidence": 0.95,
                "threat_level": "Normal"
            }
        ]
    }
    
    try:
        response = requests.post(ML_RESULTS_URL, json=test_ml_data, headers=headers)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ ML results saved successfully with ID: {result.get('id', 'N/A')}")
        else:
            print(f"❌ ML results saving failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ ML results saving error: {e}")
        return False
    
    # Test 4: Test ML results saving without authentication (should still work)
    print("\n4. Testing ML results saving without authentication...")
    
    try:
        response = requests.post(ML_RESULTS_URL, json=test_ml_data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ ML results saved successfully without auth with ID: {result.get('id', 'N/A')}")
        else:
            print(f"❌ ML results saving without auth failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ ML results saving without auth error: {e}")
        return False
    
    print("\n✅ All authentication tests passed!")
    print("\nSummary of fixes:")
    print("1. Extended token expiration to 7 days")
    print("2. Added token refresh endpoint")
    print("3. Added automatic token refresh mechanism")
    print("4. Improved error handling for authentication issues")
    print("5. ML results saving works with or without authentication")
    
    return True

if __name__ == "__main__":
    test_authentication_fix() 