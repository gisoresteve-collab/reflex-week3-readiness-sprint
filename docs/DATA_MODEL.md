# Data Model Specification — Reflex

## Core Entities

### 1. Delivery Schema (`Delivery`)

| Field | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String | Yes | Unique delivery identifier | `"D001"` |
| `customerName` | String | Yes | Recipient full name | `"Mary Kiliku"` |
| `customerPhone` | String | Yes | Recipient contact phone number | `"0722000111"` |
| `deliveryAddress` | String | Yes | Dropoff address or location | `"Ngong Road, Junction Mall"` |
| `itemDescription` | String | Yes | Package contents / order detail | `"2x Coffee Maker"` |
| `status` | Enum | Yes | Current lifecycle state | `"ASSIGNED"` |
| `assignedRider` | String / Null | No | ID of assigned rider | `"R001"` |
| `createdAt` | ISO Timestamp | Yes | Creation timestamp | `"2026-08-31T10:00:00Z"` |
| `updatedAt` | ISO Timestamp | Yes | Last state update timestamp | `"2026-08-31T10:15:00Z"` |

### 2. Rider Schema (`Rider`)

| Field | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `id` | String | Yes | Unique rider ID | `"R001"` |
| `name` | String | Yes | Rider full name | `"Linah Ombeki"` |
| `phone` | String | Yes | Rider contact number | `"0711223344"` |
| `active` | Boolean | Yes | Availability status | `true` |

## Allowed Lifecycle States (`DeliveryStatus`)

- `OPEN`: Created by Retailer, awaiting assignment.
- `ASSIGNED`: Dispatched to a specific Rider.
- `PICKED_UP`: Rider has collected item from retailer.
- `DELIVERED`: Item successfully handed to recipient.
