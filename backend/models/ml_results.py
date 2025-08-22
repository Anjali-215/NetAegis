from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any, List
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

class MLResultBase(BaseModel):
    user_email: str = Field(..., description="Email of the user who processed the data")
    user_name: str = Field(..., description="Name of the user who processed the data")
    company: Optional[str] = Field(None, description="Company of the user who processed the data")
    file_name: str = Field(..., description="Name of the uploaded file")
    total_records: int = Field(..., description="Total number of records processed")
    processed_records: int = Field(..., description="Number of records successfully processed")
    failed_records: int = Field(..., description="Number of records that failed processing")
    threat_summary: Dict[str, int] = Field(..., description="Summary of threat types detected")
    processing_duration: float = Field(..., description="Time taken to process in seconds")
    created_at: datetime = Field(default_factory=datetime.now)

class MLResultCreate(MLResultBase):
    results: List[Dict[str, Any]] = Field(..., description="Detailed results for each record")

class MLResultResponse(MLResultBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    results: List[Dict[str, Any]] = Field(..., description="Detailed results for each record")

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )

class MLResultInDB(MLResultResponse):
    pass

class MLResultSummary(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_email: str
    user_name: str
    company: Optional[str] = None
    file_name: str
    total_records: int
    processed_records: int
    failed_records: int
    threat_summary: Dict[str, int]
    processing_duration: float
    created_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        from_attributes=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    ) 