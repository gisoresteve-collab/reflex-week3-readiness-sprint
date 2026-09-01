# Rider Workflow & Dashboard Specification

## Persona Overview
The **Rider** persona receives assigned orders from dispatchers, picks up items from local retail stores, and delivers them to customers across designated delivery routes.

## User Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Select Active Rider Profile                             │
│    (e.g., Linah Ombeki - R001)                              │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Fetch Assigned Deliveries                                │
│    API Call: GET /api/riders/R001/deliveries                │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. View Delivery Details & Status                           │
│    - Delivery ID, Customer Name, Phone, Address, Items      │
│    - Status Badge: ASSIGNED                                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Transition to PICKED_UP                                  │
│    Action: Click "Mark as Picked Up"                        │
│    API Call: PATCH /api/deliveries/D001/status              │
│    Payload: { "status": "PICKED_UP" }                       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Transition to DELIVERED                                  │
│    Action: Click "Mark as Delivered"                        │
│    API Call: PATCH /api/deliveries/D001/status              │
│    Payload: { "status": "DELIVERED" }                       │
└─────────────────────────────────────────────────────────────┘
```

## Dashboard Features & Layout

1. **Rider Selector Header**: Allows selecting the active rider context.
2. **Metrics Bar**: Displays total assigned, to pick up, picked up, and delivered counters.
3. **Delivery Cards**:
   - Clean card-based visual design.
   - Status color indicators:
     - `ASSIGNED`: Amber (`#fff4cc` / `#8a6200`)
     - `PICKED_UP`: Blue (`#dcecff` / `#1557a6`)
     - `DELIVERED`: Green (`#dff6e8` / `#16723d`)
   - Action buttons strictly constrained by lifecycle rules.
