#!/usr/bin/env python3
"""
Script to add notification preferences to existing users
Run this script to ensure all existing users have notification preferences set
"""

import asyncio
import motor.motor_asyncio
from datetime import datetime, timezone

# MongoDB connection string - update this to match your setup
MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "netaegis"

async def add_notification_preferences():
    """Add notification preferences to all existing users"""
    
    # Connect to MongoDB
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    users_collection = db["users"]
    
    try:
        print("Connecting to MongoDB...")
        
        # Find all users without notification preferences
        users_without_prefs = users_collection.find({
            "$or": [
                {"notificationPreferences": {"$exists": False}},
                {"notificationPreferences": None}
            ]
        })
        
        count = 0
        async for user in users_without_prefs:
            # Set default notification preferences
            default_prefs = {
                "emailNotifications": True,
                "pushNotifications": True,
                "reportAlerts": False
            }
            
            # Update the user
            result = await users_collection.update_one(
                {"_id": user["_id"]},
                {"$set": {"notificationPreferences": default_prefs}}
            )
            
            if result.modified_count > 0:
                count += 1
                print(f"Updated user: {user.get('email', 'Unknown')}")
        
        print(f"\n✅ Successfully updated {count} users with notification preferences")
        
        # Verify the update
        total_users = await users_collection.count_documents({})
        users_with_prefs = await users_collection.count_documents({
            "notificationPreferences": {"$exists": True, "$ne": None}
        })
        
        print(f"Total users: {total_users}")
        print(f"Users with preferences: {users_with_prefs}")
        
        if total_users == users_with_prefs:
            print("🎉 All users now have notification preferences!")
        else:
            print(f"⚠️  {total_users - users_with_prefs} users still missing preferences")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    print("🚀 Starting notification preferences update...")
    asyncio.run(add_notification_preferences())
    print("✨ Script completed!")
