#!/usr/bin/env python3
"""
Test script to verify company-based filtering for admin user management
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def test_company_filtering():
    """Test that admin users can only see and manage users from their own company"""
    
    print("Testing Company-Based User Filtering...")
    print("=" * 50)
    
    # Test 1: Create users from different companies
    print("\n1. Creating test users from different companies...")
    
    # Create admin user for Company A
    admin_a_data = {
        "name": "Admin Company A",
        "email": "admin_a@companya.com",
        "company": "Company A",
        "password": "password123",
        "role": "admin"
    }
    
    # Create regular user for Company A
    user_a_data = {
        "name": "User Company A",
        "email": "user_a@companya.com",
        "company": "Company A",
        "password": "password123",
        "role": "user"
    }
    
    # Create admin user for Company B
    admin_b_data = {
        "name": "Admin Company B",
        "email": "admin_b@companyb.com",
        "company": "Company B",
        "password": "password123",
        "role": "admin"
    }
    
    # Create regular user for Company B
    user_b_data = {
        "name": "User Company B",
        "email": "user_b@companyb.com",
        "company": "Company B",
        "password": "password123",
        "role": "user"
    }
    
    try:
        # Register all users
        users = []
        for user_data in [admin_a_data, user_a_data, admin_b_data, user_b_data]:
            response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
            if response.status_code == 200:
                users.append(response.json())
                print(f"✓ Created user: {user_data['name']} ({user_data['company']})")
            else:
                print(f"✗ Failed to create user: {user_data['name']} - {response.text}")
                return False
    except Exception as e:
        print(f"✗ Error creating users: {e}")
        return False
    
    # Test 2: Login as Admin A and check user list
    print("\n2. Testing Admin A user list (should only see Company A users)...")
    
    try:
        # Login as Admin A
        login_response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": admin_a_data["email"],
            "password": admin_a_data["password"]
        })
        
        if login_response.status_code != 200:
            print(f"✗ Failed to login as Admin A: {login_response.text}")
            return False
        
        admin_a_token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {admin_a_token}"}
        
        # Get user list as Admin A
        users_response = requests.get(f"{BASE_URL}/auth/admin/users", headers=headers)
        
        if users_response.status_code == 200:
            users_list = users_response.json()
            company_a_users = [u for u in users_list if u["company"] == "Company A"]
            company_b_users = [u for u in users_list if u["company"] == "Company B"]
            admin_a_in_list = any(u["email"] == admin_a_data["email"] for u in users_list)
            
            print(f"✓ Admin A can see {len(company_a_users)} Company A users")
            print(f"✓ Admin A cannot see Company B users: {len(company_b_users) == 0}")
            print(f"✓ Admin A is excluded from the list: {not admin_a_in_list}")
            
            if len(company_b_users) > 0:
                print("✗ Admin A can see Company B users - this is a security issue!")
                return False
            if admin_a_in_list:
                print("✗ Admin A can see themselves in the list - this should be excluded!")
                return False
        else:
            print(f"✗ Failed to get users as Admin A: {users_response.text}")
            return False
            
    except Exception as e:
        print(f"✗ Error testing Admin A: {e}")
        return False
    
    # Test 3: Login as Admin B and check user list
    print("\n3. Testing Admin B user list (should only see Company B users)...")
    
    try:
        # Login as Admin B
        login_response = requests.post(f"{BASE_URL}/auth/login", json={
            "email": admin_b_data["email"],
            "password": admin_b_data["password"]
        })
        
        if login_response.status_code != 200:
            print(f"✗ Failed to login as Admin B: {login_response.text}")
            return False
        
        admin_b_token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {admin_b_token}"}
        
        # Get user list as Admin B
        users_response = requests.get(f"{BASE_URL}/auth/admin/users", headers=headers)
        
        if users_response.status_code == 200:
            users_list = users_response.json()
            company_a_users = [u for u in users_list if u["company"] == "Company A"]
            company_b_users = [u for u in users_list if u["company"] == "Company B"]
            admin_b_in_list = any(u["email"] == admin_b_data["email"] for u in users_list)
            
            print(f"✓ Admin B can see {len(company_b_users)} Company B users")
            print(f"✓ Admin B cannot see Company A users: {len(company_a_users) == 0}")
            print(f"✓ Admin B is excluded from the list: {not admin_b_in_list}")
            
            if len(company_a_users) > 0:
                print("✗ Admin B can see Company A users - this is a security issue!")
                return False
            if admin_b_in_list:
                print("✗ Admin B can see themselves in the list - this should be excluded!")
                return False
        else:
            print(f"✗ Failed to get users as Admin B: {users_response.text}")
            return False
            
    except Exception as e:
        print(f"✗ Error testing Admin B: {e}")
        return False
    
    print("\n✓ All company filtering tests passed!")
    return True

if __name__ == "__main__":
    success = test_company_filtering()
    sys.exit(0 if success else 1) 