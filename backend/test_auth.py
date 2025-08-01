#!/usr/bin/env python3
"""
Test script to verify authentication flow and create admin user.
"""

import asyncio
import motor.motor_asyncio
from datetime import datetime, timedelta
from utils.auth import get_password_hash, create_access_token, verify_token
from config import settings

async def test_auth():
    # Connect to MongoDB
    client = motor.motor_asyncio.AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.database_name]
    collection = db.users
    
    print("=== Testing Authentication Flow ===")
    
    # Check if admin user exists
    admin_user = await collection.find_one({"role": "admin"})
    if not admin_user:
        print("Creating admin user...")
        admin_data = {
            "name": "Admin User",
            "company": "NetAegis",
            "email": "admin@netaegis.com",
            "role": "admin",
            "hashed_password": get_password_hash("admin123"),
            "created_at": datetime.utcnow(),
            "is_active": True
        }
        result = await collection.insert_one(admin_data)
        admin_user = admin_data
        admin_user["_id"] = result.inserted_id
        print("Admin user created!")
    else:
        print(f"Admin user exists: {admin_user['email']}")
    
    # Test token creation
    print("\n=== Testing Token Creation ===")
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": admin_user["email"]}, 
        expires_delta=access_token_expires
    )
    print(f"Token created: {access_token[:50]}...")
    
    # Test token verification
    print("\n=== Testing Token Verification ===")
    token_data = verify_token(access_token)
    print(f"Token verification result: {token_data}")
    
    # Test user lookup
    print("\n=== Testing User Lookup ===")
    user = await collection.find_one({"email": token_data.email})
    if user:
        print(f"User found: {user['email']}, role: {user['role']}")
    else:
        print("User not found!")
    
    print("\n=== Test Complete ===")
    print(f"Admin credentials:")
    print(f"Email: {admin_user['email']}")
    print(f"Password: admin123")
    print(f"Role: {admin_user['role']}")

if __name__ == "__main__":
    asyncio.run(test_auth()) 