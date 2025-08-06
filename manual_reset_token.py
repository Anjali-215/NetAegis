#!/usr/bin/env python3
"""
Manual reset token generator for direct password reset
"""

import requests
import json
import webbrowser
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
USER_EMAIL = "admin@example.com"  # Change this to the user's email

def generate_manual_reset_token():
    """Generate a reset token manually and show the direct reset link"""
    print("🔐 Manual Reset Token Generator")
    print("=" * 40)
    
    # Step 1: Request password reset
    print(f"\n1️⃣ Requesting password reset for: {USER_EMAIL}")
    url = f"{BASE_URL}/auth/forgot-password"
    data = {"email": USER_EMAIL}
    
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            print("✅ Password reset request successful!")
            print("\n📧 Check your email for the reset link.")
            print("   The email contains the direct reset link.")
            
            # Step 2: Show the direct reset URL format
            print("\n2️⃣ Direct Reset URL Format:")
            print(f"   {BASE_URL}/auth/direct-reset?token=YOUR_TOKEN_HERE")
            print("\n   Replace YOUR_TOKEN_HERE with the actual token from the email.")
            
            # Step 3: Instructions for manual token lookup
            print("\n3️⃣ To find the token manually:")
            print("   - Check your email for the reset link")
            print("   - Copy the token from the URL")
            print("   - Or check the MongoDB Atlas 'password_reset_tokens' collection")
            
            return True
        else:
            print("❌ Password reset request failed!")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure the backend is running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def show_direct_reset_demo():
    """Show how to use the direct reset page"""
    print("\n🌐 Direct Reset Demo:")
    print("=" * 30)
    
    # Show demo URL
    demo_url = f"{BASE_URL}/auth/direct-reset?token=demo_token_123"
    print(f"Demo URL: {demo_url}")
    print("(This will show an error since it's a demo token)")
    
    # Ask if user wants to open it
    try:
        choice = input("\n🌐 Would you like to see the demo page? (y/n): ").lower()
        if choice == 'y':
            webbrowser.open(demo_url)
            print("✅ Opened demo page in browser")
    except KeyboardInterrupt:
        print("\n👋 Demo cancelled.")

def show_mongodb_atlas_instructions():
    """Show instructions for manual token lookup in MongoDB Atlas"""
    print("\n🗄️ MongoDB Atlas Token Lookup:")
    print("=" * 40)
    print("If you need to find a token manually:")
    print("\n1. Go to MongoDB Atlas dashboard")
    print("2. Navigate to your database")
    print("3. Find the 'password_reset_tokens' collection")
    print("4. Look for the token associated with the user's email")
    print("5. Copy the token value")
    print("6. Use it in the direct reset URL:")
    print(f"   {BASE_URL}/auth/direct-reset?token=COPIED_TOKEN")

def show_complete_workflow():
    """Show the complete workflow without hosting"""
    print("\n📋 Complete Workflow (No Hosting Required):")
    print("=" * 50)
    print("1. Start backend: cd backend && python main.py")
    print("2. Run this script: python manual_reset_token.py")
    print("3. Check email for reset link")
    print("4. Copy token from email or MongoDB Atlas")
    print("5. Visit: http://localhost:8000/auth/direct-reset?token=YOUR_TOKEN")
    print("6. Reset password directly in MongoDB Atlas")
    print("7. Done! No frontend hosting required.")

if __name__ == "__main__":
    print("🚀 NetAegis Manual Reset Token Generator")
    print("=" * 50)
    
    # Generate reset token
    success = generate_manual_reset_token()
    
    if success:
        show_direct_reset_demo()
        show_mongodb_atlas_instructions()
        show_complete_workflow()
        
        print("\n" + "=" * 50)
        print("💡 Key Benefits:")
        print("✅ No frontend hosting required")
        print("✅ Works with just backend running")
        print("✅ Direct MongoDB Atlas integration")
        print("✅ Secure token-based authentication")
        print("✅ Professional web interface")
        
        print("\n🎯 Usage:")
        print("1. Backend runs on http://localhost:8000")
        print("2. Direct reset works at: http://localhost:8000/auth/direct-reset?token=xxx")
        print("3. Password updated directly in MongoDB Atlas")
        print("4. No React frontend needed!")
    else:
        print("\n❌ Failed to generate reset token. Please check your backend server.") 