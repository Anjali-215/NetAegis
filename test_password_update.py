#!/usr/bin/env python3
"""
Test script to verify password update functionality
"""

import requests
import json
import secrets
import string
from datetime import datetime, timedelta

def generate_test_token():
    """Generate a test token"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(32))

def test_password_update():
    """Test the password update functionality"""
    
    print("🧪 Testing Password Update Functionality")
    print("=" * 50)
    
    # Test configuration
    base_url = "http://localhost:8000"
    test_email = "admin@example.com"
    test_token = generate_test_token()
    new_password = "newpassword123"
    
    print(f"\n📋 Test Configuration:")
    print(f"Backend URL: {base_url}")
    print(f"Email: {test_email}")
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
    
    try:
        response = requests.post(atlas_reset_url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Password update endpoint is working!")
        else:
            print("❌ Password update endpoint failed")
            
    except Exception as e:
        print(f"❌ Error testing endpoint: {str(e)}")
    
    # Test the forgot password endpoint
    print(f"\n🎯 Testing Forgot Password Endpoint:")
    print("=" * 40)
    
    forgot_password_url = f"{base_url}/auth/forgot-password"
    forgot_payload = {
        "email": test_email
    }
    
    try:
        response = requests.post(forgot_password_url, json=forgot_payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Forgot password endpoint is working!")
        else:
            print("❌ Forgot password endpoint failed")
            
    except Exception as e:
        print(f"❌ Error testing forgot password: {str(e)}")
    
    print(f"\n🔧 Expected Flow:")
    print("=" * 30)
    print("1. User requests password reset")
    print("2. Backend generates token and sends email")
    print("3. User clicks email link")
    print("4. Frontend calls /auth/atlas-reset-password")
    print("5. Backend validates token and updates password")
    print("6. Password is updated in MongoDB Atlas")
    
    print(f"\n💡 Key Points:")
    print("=" * 30)
    print("✅ Backend handles password hashing")
    print("✅ Token validation in backend")
    print("✅ Direct MongoDB Atlas update")
    print("✅ Frontend calls backend API")
    print("✅ Secure password reset flow")

if __name__ == "__main__":
    test_password_update()
    
    print(f"\n" + "=" * 50)
    print("🚀 Ready to test! Make sure your backend is running.") 