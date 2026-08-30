from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime
from app.models import DeliveryStatus

class DeliveryCreate(BaseModel):
    customer_name: str = Field(..., min_length=1)
    customer_phone: str = Field(..., min_length=1)
    delivery_address: str = Field(..., min_length=1)
    item_description: str = Field(..., min_length=1)
    pickup_location: str = Field(default="Retail Store Central", min_length=1)

class DeliveryResponse(BaseModel):
    id: int
    customer_name: str
    customer_phone: str
    delivery_address: str
    item_description: str
    pickup_location: Optional[str]
    current_status: DeliveryStatus
    created_at: datetime

class DeliveryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    customer_name: str
    customer_phone: str
    delivery_address: str
    item_description: str
    status: str