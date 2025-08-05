#!/usr/bin/env python3
"""
Test script to generate Atlas reset email with updated links
"""

import secrets
import string
from datetime import datetime, timedelta

def generate_reset_token():
    """Generate a secure random token for password reset"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(32))

def test_updated_atlas_email():
    """Test the updated Atlas reset email"""
    
    print("🧪 Testing Updated Atlas Reset Email")
    print("=" * 50)
    
    # Generate test data
    test_email = "admin@example.com"
    test_name = "Admin User"
    test_token = generate_reset_token()
    
    # Create the updated Atlas reset link
    atlas_reset_link = f"http://localhost:5173/atlas-reset?token={test_token}&email={test_email}"
    
    print(f"\n📋 Test Configuration:")
    print(f"Email: {test_email}")
    print(f"Name: {test_name}")
    print(f"Token: {test_token}")
    print(f"Atlas Reset Link: {atlas_reset_link}")
    
    print(f"\n📧 Email Content Preview:")
    print("=" * 40)
    
    email_content = f"""
🔐 NetAegis Atlas Password Reset Request

Dear {test_name},

We received a request to reset your password for your NetAegis account.

🗄️ Atlas Password Reset Request
This link will take you to our secure password reset page where you can update your password directly in MongoDB Atlas.

🔗 Reset Password Link:
{atlas_reset_link}

This link will take you to our secure password reset page where you can:
1. Enter your new password
2. Confirm your new password
3. Update your password directly in MongoDB Atlas

🔑 Security Information:
- Token: {test_token}
- Email: {test_email}
- Expires: 1 hour from now

⚠️ Important:
- This link expires in 1 hour
- Only use this if you requested the password reset
- For security, change your password immediately after reset
- The password will be updated directly in MongoDB Atlas

If you didn't request this reset, please ignore this email.

Best regards,
NetAegis Security Team
"""
    
    print(email_content)
    
    print(f"\n🎯 Test Instructions:")
    print("=" * 30)
    print("1. Start your frontend: npm run dev")
    print("2. Start your backend: python main.py")
    print("3. Copy the Atlas Reset Link above")
    print("4. Paste it in your browser")
    print("5. Test the password reset flow")
    print("6. Check MongoDB Atlas for updates")
    
    print(f"\n🔧 What's Changed:")
    print("=" * 30)
    print("✅ Reset link now points to: http://localhost:5173/atlas-reset")
    print("✅ Email includes both token and email parameters")
    print("✅ Updated email template mentions Atlas integration")
    print("✅ Direct MongoDB Atlas password update")
    
    print(f"\n💡 Key Benefits:")
    print("=" * 30)
    print("✅ Points to your local frontend (http://localhost:5173/)")
    print("✅ Updates password directly in MongoDB Atlas")
    print("✅ No backend server required for the reset page")
    print("✅ Secure token-based authentication")
    print("✅ Professional user experience")
    
    return atlas_reset_link, test_token, test_email

if __name__ == "__main__":
    atlas_link, token, email = test_updated_atlas_email()
    
    print(f"\n" + "=" * 50)
    print("🚀 Ready to test! The email links now point to your local frontend.")
    print(f"Test Link: {atlas_link}") 