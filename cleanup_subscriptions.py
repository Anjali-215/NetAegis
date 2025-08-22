#!/usr/bin/env python3
"""
Cleanup script to remove all subscription data from the database
This will allow you to start fresh with proper monthly/yearly expiry calculations
"""

import asyncio
import motor.motor_asyncio
from config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def cleanup_subscriptions():
    """Remove all subscription data from the database"""
    
    print("🧹 Starting Subscription Database Cleanup")
    print("=" * 50)
    
    try:
        # Connection options
        connection_options = {
            "serverSelectionTimeoutMS": 30000,
            "connectTimeoutMS": 30000,
            "socketTimeoutMS": 30000,
            "maxPoolSize": 10,
            "retryWrites": True,
            "retryReads": True,
        }
        
        print(f"🔌 Connecting to MongoDB: {settings.mongodb_url}")
        client = motor.motor_asyncio.AsyncIOMotorClient(
            settings.mongodb_url, 
            **connection_options
        )
        
        # Test connection
        await client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        
        # Get database
        db = client[settings.database_name]
        print(f"📊 Using database: {settings.database_name}")
        
        # List collections
        collections = await db.list_collection_names()
        print(f"📁 Available collections: {collections}")
        
        # Clean up subscriptions collection
        if 'subscriptions' in collections:
            print("\n🗑️ Cleaning up subscriptions collection...")
            subscription_count = await db.subscriptions.count_documents({})
            print(f"📊 Found {subscription_count} subscription records")
            
            if subscription_count > 0:
                result = await db.subscriptions.delete_many({})
                print(f"✅ Deleted {result.deleted_count} subscription records")
            else:
                print("ℹ️ No subscription records to delete")
        else:
            print("ℹ️ Subscriptions collection not found")
        
        # Clean up subscription_plans collection (but keep default plans)
        if 'subscription_plans' in collections:
            print("\n🗑️ Cleaning up subscription_plans collection...")
            plans_count = await db.subscription_plans.count_documents({})
            print(f"📊 Found {plans_count} plan records")
            
            if plans_count > 0:
                result = await db.subscription_plans.delete_many({})
                print(f"✅ Deleted {plans_count} plan records")
                print("ℹ️ Default plans will be recreated automatically on first use")
            else:
                print("ℹ️ No plan records to delete")
        else:
            print("ℹ️ Subscription_plans collection not found")
        
        # Verify cleanup
        print("\n🔍 Verifying cleanup...")
        final_subscription_count = await db.subscriptions.count_documents({})
        final_plans_count = await db.subscription_plans.count_documents({})
        
        print(f"📊 Final subscription count: {final_subscription_count}")
        print(f"📊 Final plans count: {final_plans_count}")
        
        if final_subscription_count == 0 and final_plans_count == 0:
            print("✅ Cleanup completed successfully!")
            print("🎯 Database is now clean and ready for fresh subscriptions")
        else:
            print("⚠️ Some records may still exist")
        
        # Close connection
        client.close()
        print("🔌 Database connection closed")
        
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        raise e

if __name__ == "__main__":
    print("🚀 Starting subscription cleanup process...")
    asyncio.run(cleanup_subscriptions())
    print("✨ Cleanup process completed!")
