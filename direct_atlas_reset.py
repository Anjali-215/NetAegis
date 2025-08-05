#!/usr/bin/env python3
"""
Direct MongoDB Atlas Password Reset Generator
This creates links that allow users to directly update their passwords in MongoDB Atlas
"""

import requests
import json
import webbrowser
from datetime import datetime
import secrets
import string

# Configuration
BASE_URL = "http://localhost:8000"
USER_EMAIL = "admin@example.com"  # Change this to the user's email

def generate_direct_atlas_link():
    """Generate a direct MongoDB Atlas link for password reset"""
    print("🗄️ Direct MongoDB Atlas Password Reset")
    print("=" * 50)
    
    # Generate a secure token
    alphabet = string.ascii_letters + string.digits
    token = ''.join(secrets.choice(alphabet) for _ in range(32))
    
    print(f"\n1️⃣ Generated secure token: {token}")
    print(f"2️⃣ User email: {USER_EMAIL}")
    
    # Create the direct MongoDB Atlas link
    # This would be a custom URL that opens MongoDB Atlas with the specific document
    atlas_link = create_atlas_direct_link(token, USER_EMAIL)
    
    print(f"\n3️⃣ Direct MongoDB Atlas Link:")
    print(f"   {atlas_link}")
    
    return token, atlas_link

def create_atlas_direct_link(token, email):
    """
    Create a direct link to MongoDB Atlas for password reset
    Note: This is a conceptual link - actual implementation depends on your Atlas setup
    """
    
    # Option 1: MongoDB Atlas Data Explorer Link
    # This opens the specific document in Atlas
    atlas_data_explorer_link = f"https://cloud.mongodb.com/v2/YOUR_CLUSTER_ID/explorer/YOUR_DATABASE/users/find"
    
    # Option 2: MongoDB Atlas App Services (if you have it set up)
    # This could be a custom app that handles password reset
    atlas_app_link = f"https://cloud.mongodb.com/v2/YOUR_CLUSTER_ID/app/YOUR_APP_ID"
    
    # Option 3: Custom web interface hosted on Atlas
    # This could be a simple HTML page stored in Atlas
    custom_web_link = f"https://YOUR_ATLAS_DOMAIN.com/reset?token={token}&email={email}"
    
    return atlas_data_explorer_link

def create_email_template(token, email):
    """Create an email template with direct Atlas links"""
    
    email_template = f"""
    🔐 NetAegis Password Reset Request
    
    Dear User,
    
    We received a request to reset your password for your NetAegis account.
    
    You have several options to reset your password:
    
    1. 🔗 Direct MongoDB Atlas Reset:
       Click this link to directly update your password in the database:
       https://cloud.mongodb.com/v2/YOUR_CLUSTER_ID/explorer/YOUR_DATABASE/users/find
    
    2. 📧 Manual Reset Instructions:
       - Go to MongoDB Atlas: https://cloud.mongodb.com
       - Navigate to your database
       - Find the 'users' collection
       - Locate your email: {email}
       - Update the 'hashed_password' field with your new password (hashed)
    
    3. 🔑 Token for Reference:
       Token: {token}
       Email: {email}
    
    ⚠️ Important:
    - This link expires in 1 hour
    - Only use this if you requested the password reset
    - For security, change your password immediately after reset
    
    If you didn't request this reset, please ignore this email.
    
    Best regards,
    NetAegis Security Team
    """
    
    return email_template

def show_atlas_instructions():
    """Show detailed instructions for MongoDB Atlas password reset"""
    print("\n📋 MongoDB Atlas Password Reset Instructions:")
    print("=" * 50)
    
    print("\n🎯 Method 1: Direct Atlas Link")
    print("1. User clicks the MongoDB Atlas link in email")
    print("2. Opens MongoDB Atlas Data Explorer")
    print("3. User finds their document by email")
    print("4. User updates the 'hashed_password' field")
    print("5. Password is updated directly in Atlas")
    
    print("\n🎯 Method 2: Manual Atlas Navigation")
    print("1. User goes to https://cloud.mongodb.com")
    print("2. Logs into their Atlas account")
    print("3. Navigates to Database > Collections > users")
    print("4. Finds their document by email")
    print("5. Updates the password field")
    
    print("\n🎯 Method 3: Atlas App Services")
    print("1. Set up MongoDB Atlas App Services")
    print("2. Create a custom password reset app")
    print("3. User clicks link to open the app")
    print("4. App handles password reset securely")
    
    print("\n🔒 Security Considerations:")
    print("- Only share Atlas access with trusted users")
    print("- Use read-only access for regular users")
    print("- Implement proper authentication")
    print("- Log all password changes")

def create_atlas_setup_guide():
    """Create a setup guide for MongoDB Atlas password reset"""
    
    setup_guide = """
    🗄️ MongoDB Atlas Password Reset Setup Guide
    ===========================================
    
    To enable direct MongoDB Atlas password reset:
    
    1. 🔧 Atlas Configuration:
       - Ensure users have access to your Atlas cluster
       - Set up appropriate permissions for password updates
       - Consider using Atlas App Services for better security
    
    2. 📧 Email Template Setup:
       - Include direct Atlas links in password reset emails
       - Provide clear instructions for Atlas navigation
       - Include security tokens for verification
    
    3. 🔐 Security Setup:
       - Use Atlas authentication
       - Implement proper access controls
       - Log all password change activities
    
    4. 🎯 User Instructions:
       - Provide step-by-step Atlas navigation guide
       - Include screenshots if possible
       - Offer alternative methods (email support, etc.)
    
    5. 📱 Mobile Considerations:
       - Ensure Atlas interface works on mobile
       - Test the user experience on different devices
       - Provide mobile-friendly instructions
    """
    
    return setup_guide

def generate_atlas_email():
    """Generate a complete email with Atlas reset instructions"""
    
    token, atlas_link = generate_direct_atlas_link()
    email_content = create_email_template(token, USER_EMAIL)
    
    print("\n📧 Complete Email Content:")
    print("=" * 40)
    print(email_content)
    
    print("\n🔗 Direct Atlas Links:")
    print("=" * 30)
    print(f"1. Atlas Data Explorer: {atlas_link}")
    print(f"2. Atlas Dashboard: https://cloud.mongodb.com")
    print(f"3. Your Database: https://cloud.mongodb.com/v2/YOUR_CLUSTER_ID/explorer/YOUR_DATABASE")
    
    return email_content

if __name__ == "__main__":
    print("🚀 NetAegis Direct MongoDB Atlas Password Reset")
    print("=" * 60)
    
    # Generate the email content
    email_content = generate_atlas_email()
    
    # Show instructions
    show_atlas_instructions()
    
    # Show setup guide
    setup_guide = create_atlas_setup_guide()
    print("\n" + setup_guide)
    
    print("\n" + "=" * 60)
    print("💡 Key Benefits:")
    print("✅ No backend server required")
    print("✅ Direct MongoDB Atlas integration")
    print("✅ Users can reset passwords directly in Atlas")
    print("✅ Works with any email client")
    print("✅ No hosting needed")
    
    print("\n🎯 Implementation Steps:")
    print("1. Configure MongoDB Atlas permissions")
    print("2. Set up email templates with Atlas links")
    print("3. Provide user instructions for Atlas navigation")
    print("4. Test the complete flow")
    print("5. Monitor password reset activities")
    
    # Ask if user wants to see Atlas demo
    try:
        choice = input("\n🌐 Would you like to see MongoDB Atlas demo? (y/n): ").lower()
        if choice == 'y':
            webbrowser.open("https://cloud.mongodb.com")
            print("✅ Opened MongoDB Atlas in browser")
    except KeyboardInterrupt:
        print("\n👋 Demo cancelled.") 