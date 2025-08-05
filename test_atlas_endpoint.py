#!/usr/bin/env python3
"""
Test script to debug the atlas reset password endpoint
"""

import requests
import json
import secrets
import string

def generate_test_token():
    """Generate a test token"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(32))

def test_atlas_endpoint():
    """Test the atlas reset password endpoint"""
    
    print("🧪 Testing Atlas Reset Password Endpoint")
    print("=" * 50)
    
    # Test configuration
    base_url = "http://localhost:8000"
    test_token = generate_test_token()
    new_password = "newpassword123"
    
    print(f"\n📋 Test Configuration:")
    print(f"Backend URL: {base_url}")
    print(f"Token: {test_token}")
    print(f"New Password: {new_password}")
    
    # Test the atlas reset password endpoint
    print(f"\n🎯 Testing Atlas Reset Password Endpoint:")
    print("=" * 40)
    
    atlas_reset_url = f"{base_url}/auth/atlas-reset-password"
    payload = {
        "token": test_token,
        "new_password": new_password
    }
    
    print(f"URL: {atlas_reset_url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(atlas_reset_url, json=payload)
        print(f"\nStatus Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 200:
            print("✅ Password update endpoint is working!")
        elif response.status_code == 400:
            print("❌ Bad request - likely invalid token")
        elif response.status_code == 500:
            print("❌ Internal server error - check backend logs")
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - make sure backend is running")
    except Exception as e:
        print(f"❌ Error testing endpoint: {str(e)}")
    
    # Test the forgot password endpoint to generate a real token
    print(f"\n🎯 Testing Forgot Password Endpoint:")
    print("=" * 40)
    
    forgot_password_url = f"{base_url}/auth/forgot-password"
    forgot_payload = {
        "email": "admin@example.com"
    }
    
    try:
        response = requests.post(forgot_password_url, json=forgot_payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Forgot password endpoint is working!")
            print("📧 Check your email for a real reset token")
        else:
            print("❌ Forgot password endpoint failed")
            
    except Exception as e:
        print(f"❌ Error testing forgot password: {str(e)}")

if __name__ == "__main__":
    test_atlas_endpoint()
    
    print(f"\n" + "=" * 50)
    print("🔧 Debugging Steps:")
    print("1. Make sure backend is running")
    print("2. Check backend logs for error details")
    print("3. Verify MongoDB connection")
    print("4. Check if password_reset_tokens collection exists")
    print("5. Test with a real token from forgot password") 