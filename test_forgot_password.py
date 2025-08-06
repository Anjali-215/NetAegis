#!/usr/bin/env python3
"""
Test script for forgot password functionality
"""

import requests
import json

# Test configuration
BASE_URL = "http://localhost:8000"
TEST_EMAIL = "test@example.com"

def test_forgot_password():
    """Test the forgot password endpoint"""
    print("Testing forgot password functionality...")
    
    # Test forgot password request
    url = f"{BASE_URL}/auth/forgot-password"
    data = {"email": TEST_EMAIL}
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Forgot password request successful!")
        else:
            print("❌ Forgot password request failed!")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure the backend is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_reset_password():
    """Test the reset password endpoint with a dummy token"""
    print("\nTesting reset password functionality...")
    
    # Test reset password with dummy token
    url = f"{BASE_URL}/auth/reset-password"
    data = {
        "token": "dummy_token_123",
        "new_password": "newpassword123"
    }
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 400:
            print("✅ Reset password validation working (correctly rejected invalid token)")
        else:
            print("❌ Reset password validation failed!")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure the backend is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("🔐 NetAegis Forgot Password Test")
    print("=" * 40)
    
    test_forgot_password()
    test_reset_password()
    
    print("\n" + "=" * 40)
    print("Test completed!")
    print("\nTo test the full flow:")
    print("1. Start the backend: cd backend && python main.py")
    print("2. Start the frontend: cd frontend && npm run dev")
    print("3. Go to http://localhost:3000/login")
    print("4. Click 'Forgot Password?' and test the flow") 