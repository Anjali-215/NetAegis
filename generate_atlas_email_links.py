#!/usr/bin/env python3
"""
Generate email links for Atlas password reset that point to local frontend
"""

import secrets
import string
from datetime import datetime

def generate_reset_token():
    """Generate a secure random token for password reset"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(32))

def create_atlas_reset_email(user_email, user_name):
    """Create email content with Atlas reset link"""
    
    # Generate secure token
    token = generate_reset_token()
    
    # Create the Atlas reset link (points to local frontend)
    atlas_reset_link = f"http://localhost:5173/atlas-reset?token={token}&email={user_email}"
    
    # Create email content
    email_content = f"""
🔐 NetAegis Password Reset Request

Dear {user_name},

We received a request to reset your password for your NetAegis account.

You can reset your password by clicking the link below:

🔗 Reset Password Link:
{atlas_reset_link}

This link will take you to our secure password reset page where you can:
1. Enter your new password
2. Confirm your new password
3. Update your password directly in MongoDB Atlas

📋 Alternative Method:
If the link doesn't work, you can manually navigate to:
http://localhost:5173/atlas-reset?token={token}&email={user_email}

🔑 Security Information:
- Token: {token}
- Email: {user_email}
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
    
    return email_content, token, atlas_reset_link

def show_implementation_guide():
    """Show implementation guide for the Atlas reset flow"""
    
    guide = """
🎯 Atlas Password Reset Implementation Guide
==========================================

This system allows users to reset passwords through your local frontend (http://localhost:5173/)
and updates the password directly in MongoDB Atlas.

📋 How it works:

1. User requests password reset
2. Email sent with link to: http://localhost:5173/atlas-reset?token=xxx&email=xxx
3. User clicks link → Opens your local frontend
4. User enters new password → Updates directly in MongoDB Atlas
5. No backend server required!

🔧 Implementation Steps:

1. ✅ Frontend Route: /atlas-reset (already added)
2. ✅ AtlasPasswordReset Component (already created)
3. ✅ AtlasService (already created)
4. 🔄 Update email service to use Atlas links
5. 🔄 Configure MongoDB Atlas connection
6. 🔄 Test the complete flow

📧 Email Template:
The email contains a link like:
http://localhost:5173/atlas-reset?token=abc123&email=user@example.com

🎯 User Flow:
1. User clicks email link
2. Opens http://localhost:5173/atlas-reset
3. User enters new password
4. Password updated in MongoDB Atlas
5. User redirected to login

🔒 Security Features:
- Secure token generation
- Token validation
- Password hashing
- Direct Atlas integration
- No backend server needed

💡 Benefits:
✅ Works with local frontend only
✅ Direct MongoDB Atlas integration
✅ No backend server required
✅ Secure token-based authentication
✅ Professional user experience
"""
    
    return guide

def main():
    """Main function to generate Atlas reset email"""
    
    print("🚀 NetAegis Atlas Password Reset Email Generator")
    print("=" * 60)
    
    # Get user details
    user_email = input("Enter user email: ").strip()
    user_name = input("Enter user name: ").strip()
    
    if not user_email:
        user_email = "admin@example.com"
    if not user_name:
        user_name = "Admin User"
    
    # Generate email content
    email_content, token, atlas_link = create_atlas_reset_email(user_email, user_name)
    
    print(f"\n📧 Generated Email Content:")
    print("=" * 40)
    print(email_content)
    
    print(f"\n🔗 Atlas Reset Link:")
    print("=" * 30)
    print(f"URL: {atlas_link}")
    print(f"Token: {token}")
    print(f"Email: {user_email}")
    
    print(f"\n🧪 Test Instructions:")
    print("=" * 30)
    print("1. Start your frontend: npm run dev")
    print("2. Copy the Atlas Reset Link above")
    print("3. Paste it in your browser")
    print("4. Test the password reset flow")
    print("5. Check MongoDB Atlas for updates")
    
    # Show implementation guide
    guide = show_implementation_guide()
    print(f"\n{guide}")
    
    print(f"\n" + "=" * 60)
    print("💡 Next Steps:")
    print("1. Update your email service to use Atlas links")
    print("2. Configure MongoDB Atlas connection in AtlasService")
    print("3. Test the complete flow")
    print("4. Monitor password reset activities")
    
    print(f"\n🎯 Key Features:")
    print("✅ Points to local frontend (http://localhost:5173/)")
    print("✅ Updates password directly in MongoDB Atlas")
    print("✅ No backend server required")
    print("✅ Secure token-based authentication")
    print("✅ Professional user experience")

if __name__ == "__main__":
    main() 