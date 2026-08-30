import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

def test_retailer_create_valid_delivery():
    payload = {
        "customer_name": "Mary Kiliku",
        "customer_phone": "0722000111",
        "delivery_address": "Ngong Road, Junction Mall",
        "item_description": "2x Coffee Maker",
        "pickup_location": "Retail Store Central"
    }
    res = client.post("/deliveries", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["customer_name"] == "Mary Kiliku"
    assert data["current_status"] == "OPEN"

def test_retailer_validation_failure():
    payload = {
        "customer_name": "",
        "customer_phone": "",
        "delivery_address": "",
        "item_description": ""
    }
    res = client.post("/deliveries", json=payload)
    assert res.status_code == 422

def test_list_deliveries():
    res = client.get("/deliveries")
    assert res.status_code == 200
    assert isinstance(res.json(), list)