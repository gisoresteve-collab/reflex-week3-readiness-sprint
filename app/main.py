from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import engine, Base, get_db
from app.models import Delivery, DeliveryStatus, StatusLog
from app.schemas import DeliveryCreate, DeliveryResponse

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Reflex Delivery Telemetry API", version="1.0.0")

@app.post("/deliveries", response_model=DeliveryResponse, status_code=status.HTTP_201_CREATED)
def create_delivery(delivery_data: DeliveryCreate, db: Session = Depends(get_db)):
    new_delivery = Delivery(
        customer_name=delivery_data.customer_name,
        customer_phone=delivery_data.customer_phone,
        delivery_address=delivery_data.delivery_address,
        item_description=delivery_data.item_description,
        pickup_location=delivery_data.pickup_location or "Retail Store Central",
        current_status=DeliveryStatus.OPEN
    )
    db.add(new_delivery)
    db.commit()
    db.refresh(new_delivery)

    # Initial Status Log entry
    initial_log = StatusLog(
        delivery_id=new_delivery.id,
        previous_status="NONE",
        new_status=DeliveryStatus.OPEN.value
    )
    db.add(initial_log)
    db.commit()
    db.refresh(new_delivery)

    return new_delivery

@app.get("/deliveries", response_model=List[DeliveryResponse])
def list_deliveries(db: Session = Depends(get_db)):
    return db.query(Delivery).order_by(Delivery.created_at.desc()).all()