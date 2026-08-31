# Live Presentation & Demo Script — Reflex Sprint

## Presentation Outline & Executive Story

1. **Problem Statement (Slide 1)**: Small Kenyan retailers coordinate deliveries over WhatsApp and calls — no record, no assignment, zero status visibility.
2. **Solution Overview (Slide 2)**: Reflex introduces a single unified platform connecting Retailers, Dispatchers, and Riders with persistent tracking.
3. **System Architecture (Slide 3)**: Decoupled frontend components communicating via REST API to a centralized lifecycle validator engine.
4. **Rider Workflow & Lifecycle (Slide 4)**: Strictly guarded state machine: `OPEN` $\rightarrow$ `ASSIGNED` $\rightarrow$ `PICKED_UP` $\rightarrow$ `DELIVERED`.
5. **Trade-offs & Engineering Decisions (Slide 5)**: Explicit trade-off log (In-memory storage, Rider selector, REST polling).
6. **Roadmap & Future Enhancements (Slide 6)**: DB persistence, real-time WebSockets, automated proof-of-delivery (PoD).

---

## Step-by-Step Live Demo Script

| Step | Persona | Action | Visual / Outcome |
| :--- | :--- | :--- | :--- |
| **1** | Retailer | Create new delivery request `D001` (Customer: Mary Kiliku, Item: 2x Coffee Maker) | Delivery created with status `OPEN`. |
| **2** | Dispatcher | Open Dispatcher Dashboard, view `D001`, assign to Rider `R001` (Linah Ombeki) | Delivery status updates to `ASSIGNED`. |
| **3** | Rider | Select `Linah Ombeki (R001)` in Rider Dashboard | `D001` appears in Rider list under `ASSIGNED` state. |
| **4** | Rider | Click **"📦 Mark as Picked Up"** | API update succeeds; status changes to `PICKED_UP` with blue pill badge. |
| **5** | Rider | Click **"✅ Mark as Delivered"** | API update succeeds; status changes to `DELIVERED` with green pill badge. |
| **6** | Dispatcher | Refresh / View Dispatcher Dashboard | `D001` reflects `DELIVERED` status across the entire system. |

---

## Cross-Examination Defense Bank (State $\rightarrow$ Context $\rightarrow$ Evidence)

### Question 1: "Why did you use HTTP REST instead of WebSockets for real-time tracking?"
- **State**: REST HTTP provides predictable, robust state management for MVP requirements.
- **Context**: Introducing WebSockets adds connection state overhead and sync edge cases that add risk without changing the underlying lifecycle core.
- **Evidence**: Status updates persist reliably across component requests via `GET /api/riders/:id/deliveries` and `PATCH /api/deliveries/:id/status`.

### Question 2: "What happens if a rider tries to skip pickup and mark a delivery as DELIVERED directly?"
- **State**: The backend lifecycle validator explicitly rejects direct transitions from `ASSIGNED` to `DELIVERED`.
- **Context**: Enforcement is handled at the server level, preventing client-side UI tampering.
- **Evidence**: Sending `PATCH` with `{"status": "DELIVERED"}` when status is `ASSIGNED` returns `400 Bad Request`.
