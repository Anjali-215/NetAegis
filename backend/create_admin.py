#!/usr/bin/env python3
"""
Script to create an admin user in the database.
Run this script to create an admin user that can access admin endpoints.
"""

import asyncio
import motor.motor_asyncio
from datetime import datetime
from utils.auth import get_password_hash
from config import settings

async def create_admin_user():
    # Connect to MongoDB
    client = motor.motor_asyncio.AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_name]
    collection = db.users
    
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
    
    # Check if admin already exists
    existing_admin = await collection.find_one({"email": admin_data["email"]})
    if existing_admin:
        print("Admin user already exists!")
        return
    
    # Create admin user
    result = await collection.insert_one(admin_data)
    print(f"Admin user created successfully with ID: {result.inserted_id}")
    print("Email: admin@netaegis.com")
    print("Password: admin123")

if __name__ == "__main__":
    asyncio.run(create_admin_user()) 