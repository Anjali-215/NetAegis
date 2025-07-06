#!/usr/bin/env python3
"""
Script to clean up existing users with both password and hashed_password fields
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

async def cleanup_passwords():
    # Connect to MongoDB
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.database_name]
    collection = db.users
    
    print("Connecting to MongoDB...")
    
    # Find users with both password and hashed_password fields
    users_with_both = await collection.find({"password": {"$exists": True}, "hashed_password": {"$exists": True}}).to_list(length=None)
    
    if not users_with_both:
        print("✅ No users found with both password fields. Database is clean!")
        return
    
    print(f"Found {len(users_with_both)} users with both password fields.")
    
    # Remove password field from each user
    for user in users_with_both:
        user_id = user["_id"]
        email = user.get("email", "unknown")
        
        # Remove the password field
        result = await collection.update_one(
            {"_id": user_id},
            {"$unset": {"password": ""}}
        )
        
        if result.modified_count > 0:
            print(f"✅ Removed password field from user: {email}")
        else:
            print(f"❌ Failed to remove password field from user: {email}")
    
    print(f"\n✅ Cleanup completed! Removed password field from {len(users_with_both)} users.")
    print("Now only hashed_password field will be stored.")

if __name__ == "__main__":
    asyncio.run(cleanup_passwords()) 