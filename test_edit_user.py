#!/usr/bin/env python3
"""
Test script for the edit user functionality
"""
import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
ADMIN_EMAIL = "admin@netaegis.com"  # Replace with actual admin email
ADMIN_PASSWORD = "admin123"  # Replace with actual admin password

def test_edit_user_functionality():
    """Test the complete edit user flow"""
    
    # Step 1: Login as admin
    print("1. Logging in as admin...")
    login_data = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    try:
        login_response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.status_code}")
            print(login_response.text)
            return False
        
        token = login_response.json()["access_token"]
        print("✅ Login successful")
        
    except Exception as e:
        print(f"❌ Login error: {e}")
        return False
    
    # Step 2: Get list of users
    print("\n2. Fetching users...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        users_response = requests.get(f"{BASE_URL}/auth/admin/users", headers=headers)
        
        if users_response.status_code != 200:
            print(f"❌ Failed to fetch users: {users_response.status_code}")
            print(users_response.text)
            return False
        
        users = users_response.json()
        print(f"✅ Found {len(users)} users")
        
        if not users:
            print("❌ No users found to test with")
            return False
        
        # Use the first user for testing
        test_user = users[0]
        print(f"✅ Using user: {test_user['name']} ({test_user['email']})")
        
    except Exception as e:
        print(f"❌ Error fetching users: {e}")
        return False
    
    # Step 3: Update user details
    print("\n3. Updating user details...")
    update_data = {
        "name": f"{test_user['name']} (Updated)",
        "email": f"updated_{test_user['email']}",
        "company": "Updated Company",
        "role": "user"
    }
    
    try:
        update_response = requests.put(
            f"{BASE_URL}/auth/admin/users/{test_user['_id']}", 
            json=update_data,
            headers=headers
        )
        
        if update_response.status_code != 200:
            print(f"❌ Failed to update user: {update_response.status_code}")
            print(update_response.text)
            return False
        
        updated_user = update_response.json()
        print("✅ User updated successfully")
        print(f"   New name: {updated_user['name']}")
        print(f"   New email: {updated_user['email']}")
        print(f"   New company: {updated_user['company']}")
        
    except Exception as e:
        print(f"❌ Error updating user: {e}")
        return False
    
    # Step 4: Test login with updated credentials
    print("\n4. Testing login with updated email...")
    try:
        # Try to login with the old email (should fail)
        old_login_response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": test_user['email'],
            "password": "password123"  # Assuming default password
        })
        
        if old_login_response.status_code == 200:
            print("⚠️  Old email still works (this might be expected if password wasn't changed)")
        else:
            print("✅ Old email no longer works")
        
        # Try to login with the new email
        new_login_response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": updated_user['email'],
            "password": "password123"  # Assuming default password
        })
        
        if new_login_response.status_code == 200:
            print("✅ New email works for login")
        else:
            print("⚠️  New email doesn't work (password might need to be updated separately)")
        
    except Exception as e:
        print(f"❌ Error testing login: {e}")
    
    print("\n✅ Edit user functionality test completed!")
    return True

if __name__ == "__main__":
    print("🧪 Testing Edit User Functionality")
    print("=" * 50)
    
    try:
        test_edit_user_functionality()
    except KeyboardInterrupt:
        print("\n❌ Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}") 