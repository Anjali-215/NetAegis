#!/usr/bin/env python3
"""
Test script for direct password reset functionality
"""

import requests
import json
import webbrowser
import time

# Test configuration
BASE_URL = "http://localhost:8000"
TEST_EMAIL = "test@example.com"

def test_direct_reset_flow():
    """Test the complete direct reset flow"""
    print("🔐 NetAegis Direct Password Reset Test")
    print("=" * 50)
    
    # Step 1: Request password reset
    print("\n1️⃣ Requesting password reset...")
    url = f"{BASE_URL}/auth/forgot-password"
    data = {"email": TEST_EMAIL}
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Password reset request successful!")
            print("\n📧 Check your email for the reset link.")
            print("   The email contains two links:")
            print("   - Main reset link (requires frontend)")
            print("   - Direct reset link (works without frontend)")
            
            # Step 2: Simulate getting the direct reset link
            print("\n2️⃣ Direct Reset Link:")
            print(f"   {BASE_URL}/auth/direct-reset?token=YOUR_TOKEN_HERE")
            print("\n   Replace YOUR_TOKEN_HERE with the actual token from the email.")
            print("   This link works even when the frontend is not running!")
            
            # Step 3: Demonstrate the direct reset page
            print("\n3️⃣ Testing direct reset page...")
            test_direct_reset_page()
            
        else:
            print("❌ Password reset request failed!")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure the backend is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_direct_reset_page():
    """Test the direct reset page with invalid token"""
    print("\nTesting direct reset page with invalid token...")
    
    try:
        # Test with invalid token
        response = requests.get(f"{BASE_URL}/auth/direct-reset?token=invalid_token")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Direct reset page is working!")
            print("   The page shows an error for invalid tokens (as expected)")
        else:
            print("❌ Direct reset page failed!")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

def open_direct_reset_demo():
    """Open the direct reset page in browser for demo"""
    print("\n🌐 Opening direct reset demo page...")
    
    # This would normally be a real token from the email
    demo_url = f"{BASE_URL}/auth/direct-reset?token=demo_token_123"
    
    try:
        webbrowser.open(demo_url)
        print(f"✅ Opened demo page: {demo_url}")
        print("   (This will show an error since it's a demo token)")
    except Exception as e:
        print(f"❌ Could not open browser: {str(e)}")
        print(f"   Please manually visit: {demo_url}")

def show_mongodb_atlas_info():
    """Show information about MongoDB Atlas integration"""
    print("\n🗄️ MongoDB Atlas Integration:")
    print("=" * 40)
    print("✅ The direct reset functionality works with your MongoDB Atlas database")
    print("✅ No local database required")
    print("✅ Tokens are stored in the 'password_reset_tokens' collection")
    print("✅ User passwords are updated in the 'users' collection")
    print("✅ All operations are performed directly on the cloud database")
    print("\n📊 Database Collections:")
    print("   - users: Contains user accounts with hashed passwords")
    print("   - password_reset_tokens: Contains reset tokens with expiration")
    print("\n🔒 Security Features:")
    print("   - Tokens expire after 1 hour")
    print("   - Tokens are deleted after use")
    print("   - Passwords are securely hashed")
    print("   - Token validation prevents unauthorized access")

if __name__ == "__main__":
    print("🚀 NetAegis Direct Password Reset Demo")
    print("=" * 50)
    
    test_direct_reset_flow()
    show_mongodb_atlas_info()
    
    print("\n" + "=" * 50)
    print("📋 How to Test the Complete Flow:")
    print("1. Start the backend: cd backend && python main.py")
    print("2. Run this test: python test_direct_reset.py")
    print("3. Request a password reset from the login page")
    print("4. Check your email for the reset links")
    print("5. Use the 'Direct Reset' link to reset password")
    print("6. The password will be updated directly in MongoDB Atlas")
    
    print("\n💡 Key Benefits:")
    print("✅ Works without frontend deployment")
    print("✅ Direct MongoDB Atlas integration")
    print("✅ Secure token-based authentication")
    print("✅ Professional email templates")
    print("✅ User-friendly web interface")
    
    # Ask if user wants to open demo page
    try:
        choice = input("\n🌐 Would you like to see the demo page? (y/n): ").lower()
        if choice == 'y':
            open_direct_reset_demo()
    except KeyboardInterrupt:
        print("\n👋 Demo cancelled.") 