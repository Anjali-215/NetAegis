from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from typing import Optional, Any
from datetime import datetime, timezone
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

class NotificationPreferences(BaseModel):
    emailNotifications: bool = Field(default=True, description="Receive alerts via email")
    pushNotifications: bool = Field(default=True, description="Receive in-app notifications")
    reportAlerts: bool = Field(default=False, description="Receive report notifications")

class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    company: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    role: str = Field(default="user", pattern="^(admin|user|teamlead)$")
    notificationPreferences: NotificationPreferences = Field(default_factory=NotificationPreferences)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)
    
    @field_validator('password')
    @classmethod
    def validate_password_complexity(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        
        has_uppercase = any(c.isupper() for c in v)
        has_number = any(c.isdigit() for c in v)
        has_special = any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in v)
        
        if not (has_uppercase and has_number and has_special):
            raise ValueError('Password must contain at least one uppercase letter, one number, and one special character')
        
        return v

class AdminUserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    role: str = Field(default="user", pattern="^(user|teamlead)$")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = Field(default=True)
    last_login: Optional[datetime] = Field(default=None)

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        str_strip_whitespace=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class UserInDB(UserResponse):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None

# New models for password reset functionality
class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6, max_length=100, description="Password must be at least 6 characters long and contain uppercase, number, and special character")
    
    @field_validator('new_password')
    @classmethod
    def validate_password_complexity(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        
        has_uppercase = any(c.isupper() for c in v)
        has_number = any(c.isdigit() for c in v)
        has_special = any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in v)
        
        if not (has_uppercase and has_number and has_special):
            raise ValueError('Password must contain at least one uppercase letter, one number, and one special character')
        
        return v

class PasswordResetToken(BaseModel):
    email: str
    token: str
    expires_at: datetime 