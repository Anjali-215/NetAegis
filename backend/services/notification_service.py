from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, Dict, Any
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self, database: AsyncIOMotorDatabase):
        self.database = database
        self.collection = database.get_collection("users")

    async def should_send_email_notification(self, user_email: str) -> bool:
        """Check if email notifications should be sent for a user"""
        try:
            user = await self.collection.find_one({"email": user_email})
            if user and "notificationPreferences" in user:
                return user["notificationPreferences"].get("emailNotifications", True)
            return True  # Default to True if no preferences set
        except Exception as e:
            logger.error(f"Error checking email notification preference: {e}")
            return True

    async def should_send_push_notification(self, user_email: str) -> bool:
        """Check if push notifications should be sent for a user"""
        try:
            user = await self.collection.find_one({"email": user_email})
            if user and "notificationPreferences" in user:
                return user["notificationPreferences"].get("pushNotifications", True)
            return True  # Default to True if no preferences set
        except Exception as e:
            logger.error(f"Error checking push notification preference: {e}")
            return True

    async def should_send_report_notification(self, user_email: str) -> bool:
        """Check if report notifications should be sent for a user"""
        try:
            user = await self.collection.find_one({"email": user_email})
            if user and "notificationPreferences" in user:
                return user["notificationPreferences"].get("reportAlerts", False)
            return False  # Default to False if no preferences set
        except Exception as e:
            logger.error(f"Error checking report notification preference: {e}")
            return False

    async def can_send_threat_notification(self, user_email: str) -> Dict[str, bool]:
        """Check what types of threat notifications can be sent for a user"""
        try:
            user = await self.collection.find_one({"email": user_email})
            if not user:
                return {"email": False, "push": False, "report": False}
            
            prefs = user.get("notificationPreferences", {})
            
            return {
                "email": prefs.get("emailNotifications", True),
                "push": prefs.get("pushNotifications", True),
                "report": prefs.get("reportAlerts", False)
            }
        except Exception as e:
            logger.error(f"Error checking threat notification preferences: {e}")
            return {"email": True, "push": True, "report": False}

    async def can_send_file_upload_notification(self, user_email: str) -> Dict[str, bool]:
        """Check what types of file upload notifications can be sent for a user"""
        try:
            user = await self.collection.find_one({"email": user_email})
            if not user:
                return {"email": False, "push": False}
            
            prefs = user.get("notificationPreferences", {})
            
            return {
                "email": prefs.get("emailNotifications", True),
                "push": prefs.get("pushNotifications", True)
            }
        except Exception as e:
            logger.error(f"Error checking file upload notification preferences: {e}")
            return {"email": True, "push": True}

    async def log_notification_attempt(self, user_email: str, notification_type: str, sent: bool, reason: str = ""):
        """Log notification attempts for debugging"""
        try:
            log_entry = {
                "user_email": user_email,
                "notification_type": notification_type,
                "sent": sent,
                "reason": reason,
                "timestamp": datetime.now(timezone.utc)
            }
            await self.database.get_collection("notification_logs").insert_one(log_entry)
        except Exception as e:
            logger.error(f"Error logging notification attempt: {e}")

    async def create_threat_notification(self, user_email: str, user_name: str, company: str, threat_details: dict):
        """Create a threat notification in the database"""
        try:
            notification = {
                "user_email": user_email,
                "user_name": user_name,
                "company": company,
                "title": f"Threat Detected: {threat_details.get('threat_type', 'Unknown')}",
                "message": f"Security threat detected with {threat_details.get('confidence', 0)}% confidence. Threat level: {threat_details.get('threat_level', 'Unknown')}",
                "type": "threat",
                "priority": "high" if threat_details.get('threat_level') in ['Critical', 'High'] else "medium",
                "read": False,
                "actionable": True,
                "action_link": "/admin/detection-logs",
                "created_at": datetime.now(timezone.utc)
            }
            await self.database.get_collection("notifications").insert_one(notification)
            return True
        except Exception as e:
            logger.error(f"Error creating threat notification: {e}")
            return False

    async def create_threat_report_notification(self, user_email: str, user_name: str, company: str, threat_details: dict):
        """Create a threat report notification in the database"""
        try:
            notification = {
                "user_email": user_email,
                "user_name": user_name,
                "company": company,
                "title": f"Threat Report: {threat_details.get('threat_type', 'Unknown')}",
                "message": f"Threat report generated for {threat_details.get('threat_type', 'Unknown')} with {threat_details.get('confidence', 0)}% confidence",
                "type": "report",
                "priority": "medium",
                "read": False,
                "actionable": True,
                "action_link": "/admin/reports",
                "created_at": datetime.now(timezone.utc)
            }
            await self.database.get_collection("notifications").insert_one(notification)
            return True
        except Exception as e:
            logger.error(f"Error creating threat report notification: {e}")
            return False

    async def create_file_upload_notification(self, user_email: str, user_name: str, company: str, upload_data: dict):
        """Create a file upload notification in the database"""
        try:
            notification = {
                "user_email": user_email,
                "user_name": user_name,
                "company": company,
                "title": "File Upload Completed",
                "message": f"File processing completed successfully. {upload_data.get('message', 'Upload processed')}",
                "type": "upload",
                "priority": "low",
                "read": False,
                "actionable": True,
                "action_link": "/admin/csv-upload",
                "created_at": datetime.now(timezone.utc)
            }
            await self.database.get_collection("notifications").insert_one(notification)
            return True
        except Exception as e:
            logger.error(f"Error creating file upload notification: {e}")
            return False

    async def get_user_notifications(self, user_email: str, company: str):
        """Get notifications for a specific user"""
        try:
            collection = self.database.get_collection("notifications")
            cursor = collection.find({
                "user_email": user_email,
                "company": company
            }).sort("created_at", -1)
            
            notifications = []
            async for doc in cursor:
                notifications.append(doc)
            return notifications
        except Exception as e:
            logger.error(f"Error getting user notifications: {e}")
            return []

    async def get_unread_count(self, user_email: str, company: str) -> int:
        """Get count of unread notifications for a user"""
        try:
            collection = self.database.get_collection("notifications")
            count = await collection.count_documents({
                "user_email": user_email,
                "company": company,
                "read": False
            })
            return count
        except Exception as e:
            logger.error(f"Error getting unread count: {e}")
            return 0

    async def mark_as_read(self, notification_id: str, user_email: str, company: str) -> bool:
        """Mark a notification as read"""
        try:
            from bson import ObjectId
            collection = self.database.get_collection("notifications")
            result = await collection.update_one(
                {
                    "_id": ObjectId(notification_id),
                    "user_email": user_email,
                    "company": company
                },
                {"$set": {"read": True}}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error marking notification as read: {e}")
            return False

    async def mark_all_as_read(self, user_email: str, company: str) -> bool:
        """Mark all notifications as read for a user"""
        try:
            collection = self.database.get_collection("notifications")
            result = await collection.update_many(
                {
                    "user_email": user_email,
                    "company": company,
                    "read": False
                },
                {"$set": {"read": True}}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error marking all notifications as read: {e}")
            return False

    async def clear_all_notifications(self, user_email: str, company: str) -> bool:
        """Clear all notifications for a user"""
        try:
            collection = self.database.get_collection("notifications")
            result = await collection.delete_many({
                "user_email": user_email,
                "company": company
            })
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error clearing all notifications: {e}")
            return False

    async def delete_notification(self, notification_id: str, user_email: str, company: str) -> bool:
        """Delete a specific notification"""
        try:
            from bson import ObjectId
            collection = self.database.get_collection("notifications")
            result = await collection.delete_one({
                "_id": ObjectId(notification_id),
                "user_email": user_email,
                "company": company
            })
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting notification: {e}")
            return False 