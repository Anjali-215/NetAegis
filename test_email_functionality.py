#!/usr/bin/env python3
"""
Test script for email functionality
"""
import asyncio
import os
from backend.utils.email_service import EmailService

async def test_email_service():
    """Test the email service functionality"""
    
    print("🧪 Testing Email Service")
    print("=" * 50)
    
    # Check if email configuration is set
    email_service = EmailService()
    
    # Test configuration
    print("1. Checking email configuration...")
    config = email_service.conf
    
    print(f"   Mail Server: {config.MAIL_SERVER}")
    print(f"   Mail Port: {config.MAIL_PORT}")
    print(f"   Mail Username: {config.MAIL_USERNAME}")
    print(f"   Mail From: {config.MAIL_FROM}")
    print(f"   Mail From Name: {config.MAIL_FROM_NAME}")
    
    # Check if using placeholder values
    if config.MAIL_USERNAME == "your-email@gmail.com":
        print("\n❌ Email configuration not set up!")
        print("\n📧 To set up email functionality:")
        print("1. Create a .env file in the backend directory")
        print("2. Add the following variables:")
        print("   MAIL_USERNAME=your-gmail@gmail.com")
        print("   MAIL_PASSWORD=your-app-password")
        print("   MAIL_FROM=your-gmail@gmail.com")
        print("   MAIL_SERVER=smtp.gmail.com")
        print("   MAIL_PORT=587")
        print("   MAIL_FROM_NAME=NetAegis Security")
        print("\n3. For Gmail, you need to:")
        print("   - Enable 2-factor authentication")
        print("   - Generate an App Password")
        print("   - Use the App Password as MAIL_PASSWORD")
        return False
    
    print("\n✅ Email configuration looks good!")
    
    # Test sending email
    print("\n2. Testing email sending...")
    try:
        test_email = "test@example.com"  # Replace with actual test email
        success = await email_service.send_password_reset_email(
            user_email=test_email,
            user_name="Test User",
            reset_link="http://localhost:5173/reset?token=test123",
            atlas_link="http://localhost:8000/direct-reset?token=test123"
        )
        
        if success:
            print("✅ Email sent successfully!")
            print(f"   Check {test_email} for the test email")
        else:
            print("❌ Failed to send email")
            
    except Exception as e:
        print(f"❌ Email test failed: {str(e)}")
        print("\n🔧 Troubleshooting:")
        print("1. Check your email credentials")
        print("2. Make sure your email provider allows SMTP")
        print("3. Check if firewall/antivirus is blocking SMTP")
        print("4. For Gmail, ensure App Password is correct")
    
    return True

if __name__ == "__main__":
    print("Email Service Test")
    print("=" * 50)
    
    try:
        asyncio.run(test_email_service())
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}") 