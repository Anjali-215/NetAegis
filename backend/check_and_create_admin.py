#!/usr/bin/env python3
"""
Script to check existing users and create an admin user if needed.
"""

import asyncio
import motor.motor_asyncio
from datetime import datetime
from utils.auth import get_password_hash
from config import settings

async def check_and_create_admin():
    # Connect to MongoDB
    client = motor.motor_asyncio.AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.database_name]
    collection = db.users
    
    print("Checking existing users...")
    
    # Check all users
    all_users = []
    async for user in collection.find({}):
        all_users.append({
            "email": user.get("email"),
            "role": user.get("role"),
            "name": user.get("name")
        })
    
    print(f"Found {len(all_users)} users:")
    for user in all_users:
        print(f"  - {user['email']} (role: {user['role']}, name: {user['name']})")
    
    # Check if admin exists
    admin_user = await collection.find_one({"role": "admin"})
    if admin_user:
        print(f"\nAdmin user already exists: {admin_user['email']}")
        return
    
    print("\nNo admin user found. Creating admin user...")
    
    # Admin user data
    admin_data = {
        "name": "Admin User",
        "company": "NetAegis",
        "email": "admin@netaegis.com",
        "role": "admin",
        "hashed_password": get_password_hash("admin123"),
        "created_at": datetime.utcnow(),
        "is_active": True
    }
    
    # Create admin user
    result = await collection.insert_one(admin_data)
    print(f"Admin user created successfully!")
    print(f"Email: admin@netaegis.com")
    print(f"Password: admin123")
    print(f"User ID: {result.inserted_id}")

if __name__ == "__main__":
    asyncio.run(check_and_create_admin()) 