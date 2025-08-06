#!/usr/bin/env python3
"""
Setup script for direct MongoDB Atlas password reset
"""

import json
import webbrowser
from datetime import datetime

def get_atlas_config():
    """Get MongoDB Atlas configuration from user"""
    print("🗄️ MongoDB Atlas Configuration")
    print("=" * 40)
    
    config = {}
    
    print("\nPlease provide your MongoDB Atlas details:")
    config['cluster_id'] = input("Cluster ID (found in Atlas dashboard): ").strip()
    config['database_name'] = input("Database name: ").strip()
    config['collection_name'] = input("Collection name (default: users): ").strip() or "users"
    config['project_id'] = input("Project ID (optional): ").strip()
    
    return config

def generate_atlas_links(config):
    """Generate direct MongoDB Atlas links"""
    
    cluster_id = config['cluster_id']
    database_name = config['database_name']
    collection_name = config['collection_name']
    
    links = {
        'data_explorer': f"https://cloud.mongodb.com/v2/{cluster_id}/explorer/{database_name}/{collection_name}/find",
        'atlas_dashboard': f"https://cloud.mongodb.com/v2/{cluster_id}",
        'database': f"https://cloud.mongodb.com/v2/{cluster_id}/explorer/{database_name}",
        'collections': f"https://cloud.mongodb.com/v2/{cluster_id}/explorer/{database_name}/{collection_name}"
    }
    
    return links

def create_email_template(config, links):
    """Create email template with Atlas links"""
    
    email_template = f"""
🔐 NetAegis Password Reset Request

Dear [User Name],

We received a request to reset your password for your NetAegis account.

You can reset your password directly in MongoDB Atlas using one of these methods:

1. 🔗 Direct Atlas Link:
   Click this link to go directly to your user document:
   {links['data_explorer']}

2. 📋 Manual Steps:
   - Go to: https://cloud.mongodb.com
   - Log into your Atlas account
   - Navigate to: Database > Collections > {config['collection_name']}
   - Find your document by email: [user@example.com]
   - Update the 'hashed_password' field

3. 🔑 Security Token: [TOKEN]
   Email: [user@example.com]

⚠️ Important:
- This reset link expires in 1 hour
- Only use this if you requested the password reset
- For security, change your password immediately after reset

If you didn't request this reset, please ignore this email.

Best regards,
NetAegis Security Team
"""
    
    return email_template

def create_python_email_function(config, links):
    """Create Python function for sending Atlas reset emails"""
    
    python_code = f"""
def send_atlas_reset_email(user_email, user_name, token):
    \"\"\"
    Send password reset email with direct MongoDB Atlas links
    \"\"\"
    
    atlas_link = "{links['data_explorer']}"
    
    email_content = f\"\"\"
🔐 NetAegis Password Reset Request

Dear {{user_name}},

We received a request to reset your password for your NetAegis account.

You can reset your password directly in MongoDB Atlas:

🔗 Direct Atlas Link:
Click this link to go directly to your user document:
{atlas_link}

📋 Manual Steps:
- Go to: https://cloud.mongodb.com
- Log into your Atlas account
- Navigate to: Database > Collections > {config['collection_name']}
- Find your document by email: {{user_email}}
- Update the 'hashed_password' field

🔑 Security Token: {{token}}
Email: {{user_email}}

⚠️ Important:
- This reset link expires in 1 hour
- Only use this if you requested the password reset
- For security, change your password immediately after reset

If you didn't request this reset, please ignore this email.

Best regards,
NetAegis Security Team
\"\"\"
    
    # Send email using your existing email service
    email_service = EmailService()
    await email_service.send_password_reset_email(
        user_email=user_email,
        user_name=user_name,
        reset_link=atlas_link,
        atlas_link=atlas_link
    )
    
    return email_content
"""
    
    return python_code

def show_atlas_instructions(config, links):
    """Show detailed instructions for Atlas setup"""
    
    print("\n📋 MongoDB Atlas Setup Instructions:")
    print("=" * 50)
    
    print(f"\n1️⃣ Atlas Configuration:")
    print(f"   Cluster ID: {config['cluster_id']}")
    print(f"   Database: {config['database_name']}")
    print(f"   Collection: {config['collection_name']}")
    
    print(f"\n2️⃣ Direct Links:")
    print(f"   Data Explorer: {links['data_explorer']}")
    print(f"   Atlas Dashboard: {links['atlas_dashboard']}")
    print(f"   Database: {links['database']}")
    print(f"   Collections: {links['collections']}")
    
    print(f"\n3️⃣ User Instructions:")
    print("   - User clicks Atlas link in email")
    print("   - Opens MongoDB Atlas Data Explorer")
    print("   - User finds their document by email")
    print("   - User updates the 'hashed_password' field")
    print("   - Password is updated directly in Atlas")

def save_config(config, links):
    """Save configuration to file"""
    
    config_data = {
        'config': config,
        'links': links,
        'created_at': datetime.now().isoformat()
    }
    
    with open('atlas_password_reset_config.json', 'w') as f:
        json.dump(config_data, f, indent=2)
    
    print(f"\n✅ Configuration saved to: atlas_password_reset_config.json")

def test_atlas_links(links):
    """Test Atlas links by opening them in browser"""
    
    print(f"\n🌐 Testing Atlas Links:")
    print("=" * 30)
    
    try:
        # Test main Atlas link
        print("Opening MongoDB Atlas Data Explorer...")
        webbrowser.open(links['data_explorer'])
        print("✅ Atlas Data Explorer opened in browser")
        
        # Test Atlas dashboard
        print("Opening MongoDB Atlas Dashboard...")
        webbrowser.open(links['atlas_dashboard'])
        print("✅ Atlas Dashboard opened in browser")
        
    except Exception as e:
        print(f"❌ Error opening links: {str(e)}")
        print("Please manually test the links in your browser")

def main():
    """Main setup function"""
    
    print("🚀 NetAegis MongoDB Atlas Password Reset Setup")
    print("=" * 60)
    
    # Get Atlas configuration
    config = get_atlas_config()
    
    # Generate Atlas links
    links = generate_atlas_links(config)
    
    # Create email template
    email_template = create_email_template(config, links)
    
    # Create Python function
    python_function = create_python_email_function(config, links)
    
    # Show instructions
    show_atlas_instructions(config, links)
    
    # Save configuration
    save_config(config, links)
    
    # Test links
    test_atlas_links(links)
    
    print(f"\n📧 Email Template:")
    print("=" * 30)
    print(email_template)
    
    print(f"\n🐍 Python Function:")
    print("=" * 30)
    print(python_function)
    
    print(f"\n" + "=" * 60)
    print("💡 Next Steps:")
    print("1. Copy the Python function to your email service")
    print("2. Update your forgot password endpoint to use this function")
    print("3. Test the complete flow")
    print("4. Monitor password reset activities")
    
    print(f"\n🎯 Benefits:")
    print("✅ No backend server required")
    print("✅ Direct MongoDB Atlas integration")
    print("✅ Works with any email client")
    print("✅ No hosting needed")
    print("✅ Real-time database updates")

if __name__ == "__main__":
    main() 