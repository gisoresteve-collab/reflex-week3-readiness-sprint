import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class DeliveryStatus(str, enum.Enum):
    OPEN = "OPEN"
    ASSIGNED = "ASSIGNED"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

# Alias for backward compatibility if schemas use OrderStatus
OrderStatus = DeliveryStatus

class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    customer_phone = Column(String, nullable=False)
    delivery_address = Column(String, nullable=False)
    item_description = Column(String, nullable=False)
    pickup_location = Column(String, nullable=True)
    current_status = Column(Enum(DeliveryStatus), default=DeliveryStatus.OPEN)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    status_logs = relationship("StatusLog", back_populates="delivery")

class StatusLog(Base):
    __tablename__ = "status_logs"

    id = Column(Integer, primary_key=True, index=True)
    delivery_id = Column(Integer, ForeignKey("deliveries.id"), nullable=False)
    previous_status = Column(String, nullable=False)
    new_status = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    notes = Column(String, nullable=True)

    delivery = relationship("Delivery", back_populates="status_logs")

    