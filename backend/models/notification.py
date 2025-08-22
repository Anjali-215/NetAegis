from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")
        return field_schema

    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        from pydantic_core import core_schema
        return core_schema.no_info_plain_validator_function(cls.validate)

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

class NotificationBase(BaseModel):
    user_email: str = Field(..., description="Email of the user who should receive the notification")
    user_name: str = Field(..., description="Name of the user")
    company: str = Field(..., description="Company of the user")
    title: str = Field(..., description="Notification title")
    message: str = Field(..., description="Notification message")
    type: str = Field(..., description="Type of notification (threat, email, upload, system)")
    priority: str = Field(..., description="Priority level (high, medium, low)")
    read: bool = Field(default=False, description="Whether the notification has been read")
    actionable: bool = Field(default=False, description="Whether the notification has an action")
    action_link: Optional[str] = Field(None, description="Link for actionable notifications")
    created_at: datetime = Field(default_factory=datetime.now)

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class NotificationInDB(NotificationResponse):
    pass 