from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
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

class SubscriptionPlan(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str = Field(..., description="Plan name (Starter, Pro)")
    max_users: int = Field(..., description="Maximum number of users allowed")
    ml_threat_detection: bool = Field(..., description="ML-based threat detection enabled")
    csv_upload_limit: int = Field(..., description="Maximum CSV records allowed")
    email_alerts: bool = Field(..., description="Email alerts supported")
    storage_limit_gb: int = Field(..., description="Storage limit in GB")
    price: float = Field(..., description="Plan price")
    duration_months: int = Field(default=1, description="Subscription duration in months")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class CompanySubscription(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    company_name: str = Field(..., description="Company name")
    admin_email: str = Field(..., description="Admin email who purchased subscription")
    plan_name: str = Field(..., description="Subscription plan name")
    plan_details: SubscriptionPlan = Field(..., description="Full plan details")
    status: str = Field(default="active", description="Subscription status")
    start_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    end_date: Optional[datetime] = Field(default=None, description="Subscription end date")
    payment_status: str = Field(default="completed", description="Payment status")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class SubscriptionCreate(BaseModel):
    company_name: str
    admin_email: str
    plan_name: str
    billing_period: str = "monthly"  # "monthly" or "yearly"
    payment_status: str = "completed"

class SubscriptionResponse(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    company_name: str
    admin_email: str
    plan_name: str
    plan_details: SubscriptionPlan
    status: str
    start_date: datetime
    end_date: Optional[datetime] = Field(default=None, description="Subscription end date")
    payment_status: str
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
