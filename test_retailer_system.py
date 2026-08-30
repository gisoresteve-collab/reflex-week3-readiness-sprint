import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

def test_retailer_create_valid_order():
    payload = {
        "customer_name": "Mary Kiliku",
        "customer_phone": "0722000111",
        "delivery_address": "Ngong Road, Junction Mall",
        "item_description": "2x Coffee Maker",
        "store_branch": "CBD Outlet"
    }
    res = client.post("/api/retailer/orders", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["customer_name"] == "Mary Kiliku"
    assert data["current_status"] == "OPEN"

def test_retailer_validation_failure():
    payload = {
        "customer_name": "", # invalid short name
        "customer_phone": "123", # invalid phone length
        "delivery_address": "Nrb",
        "item_description": "Item"
    }
    res = client.post("/api/retailer/orders", json=payload)
    assert res.status_code == 422

def test_retailer_cancel_order():
    # 1. Create order
    payload = {
        "customer_name": "David Mwangi",
        "customer_phone": "0733444555",
        "delivery_address": "Parklands 4th Avenue",
        "item_description": "Desktop Monitor"
    }
    create_res = client.post("/api/retailer/orders", json=payload)
    order_id = create_res.json()["id"]

    # 2. Cancel order
    cancel_res = client.patch(f"/api/retailer/orders/{order_id}/status", json={"current_status": "CANCELLED"})
    assert cancel_res.status_code == 200
    assert cancel_res.json()["current_status"] == "CANCELLED"