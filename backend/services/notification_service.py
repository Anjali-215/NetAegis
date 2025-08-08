from typing import List, Optional
from bson import ObjectId
from datetime import datetime
from database import get_database
from models.notification import NotificationCreate, NotificationResponse

class NotificationService:
    def __init__(self):
        self.collection = None
    
    async def _get_collection(self):
        if self.collection is None:
            try:
                db = await get_database()
                print(f"Database connection successful: {db}")
                self.collection = db["notifications"]
                print(f"Collection retrieved: {self.collection}")
                
                # Check if collection exists, if not create it
                collections = await db.list_collection_names()
                print(f"Available collections: {collections}")
                if "notifications" not in collections:
                    print("Notifications collection doesn't exist, creating it...")
                    # Create a dummy document to ensure collection exists
                    await self.collection.insert_one({
                        "user_email": "dummy@example.com",
                        "user_name": "Dummy User",
                        "company": "Dummy Company",
                        "title": "Dummy Notification",
                        "message": "This is a dummy notification to create the collection",
                        "type": "system",
                        "priority": "low",
                        "read": True,
                        "actionable": False,
                        "created_at": datetime.now()
                    })
                    # Delete the dummy document
                    await self.collection.delete_one({"user_email": "dummy@example.com"})
                    print("Notifications collection created successfully")
                    
            except Exception as e:
                print(f"Error getting database connection: {e}")
                raise e
        return self.collection

    async def create_notification(self, notification: NotificationCreate) -> NotificationResponse:
        """Create a new notification"""
        collection = await self._get_collection()
        notification_dict = notification.model_dump()
        result = await collection.insert_one(notification_dict)
        notification_dict["_id"] = result.inserted_id
        return NotificationResponse(**notification_dict)

    async def get_user_notifications(self, user_email: str, company: str) -> List[NotificationResponse]:
        """Get notifications for a specific user"""
        collection = await self._get_collection()
        cursor = collection.find({
            "user_email": user_email,
            "company": company
        }).sort("created_at", -1)
        
        notifications = []
        async for doc in cursor:
            notifications.append(NotificationResponse(**doc))
        return notifications

    async def get_unread_count(self, user_email: str, company: str) -> int:
        """Get count of unread notifications for a user"""
        collection = await self._get_collection()
        count = await collection.count_documents({
            "user_email": user_email,
            "company": company,
            "read": False
        })
        return count

    async def mark_as_read(self, notification_id: str, user_email: str, company: str) -> bool:
        """Mark a notification as read"""
        collection = await self._get_collection()
        result = await collection.update_one(
            {
                "_id": ObjectId(notification_id),
                "user_email": user_email,
                "company": company
            },
            {"$set": {"read": True}}
        )
        return result.modified_count > 0

    async def mark_all_as_read(self, user_email: str, company: str) -> bool:
        """Mark all notifications as read for a user"""
        collection = await self._get_collection()
        result = await collection.update_many(
            {
                "user_email": user_email,
                "company": company,
                "read": False
            },
            {"$set": {"read": True}}
        )
        return result.modified_count > 0

    async def delete_notification(self, notification_id: str, user_email: str, company: str) -> bool:
        """Delete a notification"""
        collection = await self._get_collection()
        result = await collection.delete_one({
            "_id": ObjectId(notification_id),
            "user_email": user_email,
            "company": company
        })
        return result.deleted_count > 0

    async def clear_all_notifications(self, user_email: str, company: str) -> bool:
        """Clear all notifications for a user"""
        try:
            collection = await self._get_collection()
            print(f"Clearing notifications for user: {user_email}, company: {company}")
            result = await collection.delete_many({
                "user_email": user_email,
                "company": company
            })
            print(f"Delete result: {result.deleted_count} notifications deleted")
            return result.deleted_count > 0
        except Exception as e:
            print(f"Error in clear_all_notifications: {e}")
            raise e

    async def create_threat_notification(self, user_email: str, user_name: str, company: str, threat_data: dict) -> NotificationResponse:
        """Create a threat notification"""
        notification = NotificationCreate(
            user_email=user_email,
            user_name=user_name,
            company=company,
            title=f"Threat Detected: {threat_data.get('threat_type', 'Unknown')}",
            message=f"Security threat detected with {threat_data.get('confidence', 0)}% confidence. Threat level: {threat_data.get('threat_level', 'Unknown')}",
            type="threat",
            priority="high" if threat_data.get('threat_level') in ['Critical', 'High'] else "medium",
            actionable=True,
            action_link="/admin/detection-logs"
        )
        return await self.create_notification(notification)

    async def create_email_notification(self, user_email: str, user_name: str, company: str, email_data: dict) -> NotificationResponse:
        """Create an email notification"""
        notification = NotificationCreate(
            user_email=user_email,
            user_name=user_name,
            company=company,
            title="Email Alert Sent",
            message=f"Email alert sent to {email_data.get('recipient', 'user')} regarding security analysis",
            type="email",
            priority="medium",
            actionable=True,
            action_link="/admin/detection-logs"
        )
        return await self.create_notification(notification)

    async def create_upload_notification(self, user_email: str, user_name: str, company: str, upload_data: dict) -> NotificationResponse:
        """Create an upload notification"""
        notification = NotificationCreate(
            user_email=user_email,
            user_name=user_name,
            company=company,
            title="File Upload Completed",
            message=f"File '{upload_data.get('file_name', 'Unknown')}' uploaded and processed successfully",
            type="upload",
            priority="low",
            actionable=True,
            action_link="/admin/csv-upload"
        )
        return await self.create_notification(notification) 