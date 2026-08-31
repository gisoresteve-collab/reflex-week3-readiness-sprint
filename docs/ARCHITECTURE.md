# System Architecture — Reflex Delivery Coordination System

## Executive Overview
Reflex is a light, decoupled delivery coordination platform designed for small Kenyan retailers. It replaces informal and untracked WhatsApp/phone communication with a single, synchronized source of truth across Retailers, Dispatchers, and Riders.

## System Topology

```
                  ┌─────────────────────────────────────┐
                  │          Reflex Frontend           │
                  │                                     │
         ┌────────┴─────────────┬───────────────────────┴────────┐
         │                      │                                │
         ▼                      ▼                                ▼
┌─────────────────┐   ┌───────────────────┐   ┌────────────────────┐
│ Retailer Portal │   │ Dispatcher Portal │   │   Rider Dashboard  │
│  (Creation UI)  │   │  (Assignment UI)  │   │  (Status Progress) │
└────────┬────────┘   └─────────┬─────────┘   └──────────┬─────────┘
         │                      │                        │
         └──────────────────────┼────────────────────────┘
                                │ HTTP / REST API (JSON)
                                ▼
                  ┌───────────────────────────┐
                  │    Express/Node.js API    │
                  │    - Shared API Core      │
                  │    - Lifecycle Validator  │
                  │    - State Persistence    │
                  └─────────────┬─────────────┘
                                │
                                ▼
                  ┌───────────────────────────┐
                  │      Shared Data Layer    │
                  │   (Deliveries & Riders)   │
                  └───────────────────────────┘
```

## Architectural Decoupling & Component Roles

1. **Retailer UI**: Creates delivery requests (`OPEN` state) specifying customer details, phone number, address, and item description.
2. **Dispatcher UI**: Reviews `OPEN` requests and assigns a rider (`ASSIGNED` state).
3. **Rider Dashboard (Issue #14)**: Retrieves assigned orders for a given rider, allows progressive status updates (`ASSIGNED` $\rightarrow$ `PICKED_UP` $\rightarrow$ `DELIVERED`).
4. **Backend API Core**: Enforces status lifecycle rules, persistence, and invalid state transition rejections.

## Status Lifecycle & Transition Rules

$$\text{OPEN} \xrightarrow{\text{Assign Rider}} \text{ASSIGNED} \xrightarrow{\text{Rider Pickup}} \text{PICKED\_UP} \xrightarrow{\text{Rider Deliver}} \text{DELIVERED}$$

- Transitions outside this sequence (e.g. `ASSIGNED` $\rightarrow$ `DELIVERED` or `OPEN` $\rightarrow$ `DELIVERED`) are strictly rejected by backend validation logic.
