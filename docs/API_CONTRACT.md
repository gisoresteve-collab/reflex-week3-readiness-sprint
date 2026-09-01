# API Contract Specification — Reflex Backend

## Endpoints Summary

### 1. Get All Riders
- **Method**: `GET`
- **Path**: `/api/riders`
- **Description**: Returns list of registered riders.
- **Response 200 OK**:
  ```json
  [
    { "id": "R001", "name": "Linah Ombeki", "phone": "0711223344" },
    { "id": "R002", "name": "Brian Otieno", "phone": "0722334455" }
  ]
  ```

---

### 2. Get Deliveries Assigned to Rider
- **Method**: `GET`
- **Path**: `/api/riders/:riderId/deliveries`
- **Description**: Retrieves all deliveries assigned to the specified rider ID.
- **Response 200 OK**:
  ```json
  [
    {
      "id": "D001",
      "customerName": "Mary Kiliku",
      "customerPhone": "0722000111",
      "deliveryAddress": "Ngong Road, Junction Mall",
      "itemDescription": "2x Coffee Maker",
      "status": "ASSIGNED",
      "assignedRider": "R001"
    }
  ]
  ```

---

### 3. Update Delivery Status
- **Method**: `PATCH`
- **Path**: `/api/deliveries/:id/status`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "status": "PICKED_UP"
  }
  ```
- **Response 200 OK**:
  ```json
  {
    "id": "D001",
    "status": "PICKED_UP",
    "updatedAt": "2026-08-31T10:15:00Z"
  }
  ```
- **Response 400 Bad Request** (Invalid State Transition):
  ```json
  {
    "error": "Invalid state transition from ASSIGNED to DELIVERED"
  }
  ```
