from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime
from models.user import UserCreate, UserResponse, UserInDB
from utils.auth import get_password_hash, verify_password
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class UserService:
    def __init__(self, database: AsyncIOMotorDatabase):
        self.database = database
        self.collection = database.get_collection("users")

    async def create_user(self, user: UserCreate) -> UserResponse:
        # Check if user already exists
        existing_user = await self.collection.find_one({"email": user.email})
        if existing_user:
            raise ValueError("User with this email already exists")
        
        # Hash password and create user
        hashed_password = get_password_hash(user.password)
        
        # Create user document without password field
        user_dict = {
            "name": user.name,
            "company": user.company,
            "email": user.email,
            "role": user.role,
            "hashed_password": hashed_password,
            "created_at": datetime.utcnow(),
            "is_active": True
        }
        
        result = await self.collection.insert_one(user_dict)
        user_dict["_id"] = result.inserted_id
        
        return UserResponse(**user_dict)

    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        user_dict = await self.collection.find_one({"email": email})
        if user_dict:
            return UserInDB(**user_dict)
        return None

    async def authenticate_user(self, email: str, password: str) -> Optional[UserInDB]:
        user = await self.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    async def get_user_by_id(self, user_id: str) -> Optional[UserResponse]:
        try:
            user_dict = await self.collection.find_one({"_id": ObjectId(user_id)})
            if user_dict:
                return UserResponse(**user_dict)
            return None
        except Exception:
            return None

    async def list_users(self, company: str = None, exclude_user_id: str = None) -> list[UserResponse]:
        users = []
        query = {}
        if company:
            query["company"] = company
        if exclude_user_id:
            query["_id"] = {"$ne": ObjectId(exclude_user_id)}
        cursor = self.collection.find(query)
        async for user_dict in cursor:
            users.append(UserResponse(**user_dict))
        return users

    async def delete_user(self, user_id: str) -> bool:
        try:
            result = await self.collection.delete_one({"_id": ObjectId(user_id)})
            return result.deleted_count > 0
        except Exception:
            return False

    async def update_password(self, email: str, new_password: str) -> bool:
        """Update user password"""
        try:
            hashed_password = get_password_hash(new_password)
            result = await self.collection.update_one(
                {"email": email},
                {"$set": {"hashed_password": hashed_password}}
            )
            return result.modified_count > 0
        except Exception:
            return False 

    async def update_user(self, user_id: str, update_data: dict) -> Optional[UserResponse]:
        """Update user details including name, email, company, role, and password"""
        try:
            # Check if user exists
            user_dict = await self.collection.find_one({"_id": ObjectId(user_id)})
            if not user_dict:
                return None
            
            # Prepare update fields
            update_fields = {}
            
            # Update basic fields if provided
            if "name" in update_data:
                update_fields["name"] = update_data["name"]
            if "email" in update_data:
                # Check if new email already exists (excluding current user)
                existing_user = await self.collection.find_one({
                    "email": update_data["email"],
                    "_id": {"$ne": ObjectId(user_id)}
                })
                if existing_user:
                    raise ValueError("User with this email already exists")
                update_fields["email"] = update_data["email"]
            if "company" in update_data:
                update_fields["company"] = update_data["company"]
            if "role" in update_data:
                update_fields["role"] = update_data["role"]
            
            # Update password if provided
            if "password" in update_data and update_data["password"]:
                hashed_password = get_password_hash(update_data["password"])
                update_fields["hashed_password"] = hashed_password
            
            # Perform update
            if update_fields:
                result = await self.collection.update_one(
                    {"_id": ObjectId(user_id)},
                    {"$set": update_fields}
                )
                
                if result.modified_count > 0:
                    # Return updated user
                    updated_user = await self.collection.find_one({"_id": ObjectId(user_id)})
                    return UserResponse(**updated_user)
            
            return None
        except Exception as e:
            # logger.error(f"Error updating user: {e}") # Assuming logger is defined elsewhere
            return None 