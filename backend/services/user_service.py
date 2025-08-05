from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime
from models.user import UserCreate, UserResponse, UserInDB
from utils.auth import get_password_hash, verify_password
from typing import Optional

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

    async def list_users(self) -> list[UserResponse]:
        users = []
        cursor = self.collection.find({})
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