#!/usr/bin/env python3
"""
Debug script for atlas reset password endpoint
"""

import requests
import json
import secrets
import string

def generate_test_token():
    """Generate a test token"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(32))

def debug_atlas_endpoint():
    """Debug the atlas reset password endpoint"""
    
    print("🔍 Debugging Atlas Reset Password Endpoint")
    print("=" * 50)
    
    # Test configuration
    base_url = "http://localhost:8000"
    test_token = generate_test_token()
    new_password = "newpassword123"
    
    print(f"\n📋 Test Configuration:")
    print(f"Backend URL: {base_url}")
    print(f"Token: {test_token}")
    print(f"New Password: {new_password}")
    
    # Test 1: Check if backend is running
    print(f"\n🎯 Test 1: Backend Health Check")
    print("=" * 40)
    
    try:
        response = requests.get(f"{base_url}/docs")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("✅ Backend is running")
        else:
            print("❌ Backend might not be running properly")
    except Exception as e:
        print(f"❌ Backend connection failed: {e}")
        return
    
    # Test 2: Test forgot password to generate a real token
    print(f"\n🎯 Test 2: Generate Real Token")
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
    
    # Test 3: Test atlas reset with fake token (should fail with 400)
    print(f"\n🎯 Test 3: Test with Fake Token")
    print("=" * 40)
    
    atlas_reset_url = f"{base_url}/auth/atlas-reset-password"
    payload = {
        "token": test_token,
        "new_password": new_password
    }
    
    try:
        response = requests.post(atlas_reset_url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 400:
            print("✅ Endpoint is working - correctly rejected fake token")
        elif response.status_code == 500:
            print("❌ Internal server error - check backend logs")
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error testing endpoint: {str(e)}")
    
    print(f"\n🔧 Next Steps:")
    print("=" * 30)
    print("1. Check backend logs for detailed error messages")
    print("2. Try with a real token from forgot password email")
    print("3. Verify MongoDB connection")
    print("4. Check if password_reset_tokens collection exists")

if __name__ == "__main__":
    debug_atlas_endpoint() 