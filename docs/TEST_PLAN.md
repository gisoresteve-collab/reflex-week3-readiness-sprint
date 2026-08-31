# Test Plan — Reflex Rider Workflow

## Test Objectives
Verify end-to-end functionality, lifecycle enforcement, error handling, and state persistence for Issue #14 (Rider Dashboard & Delivery Status Workflow).

## Test Cases Matrix

| Test Case ID | Category | Description | Expected Outcome | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-RD-01** | UI / Load | Load Rider Dashboard UI | Dashboard loads cleanly without errors; displays header & rider selector. | Pass |
| **TC-RD-02** | API / Fetch | Fetch deliveries for assigned rider | Deliveries assigned to selected rider are fetched via `GET /api/riders/:id/deliveries`. | Pass |
| **TC-RD-03** | UI / Display | Display complete delivery detail | ID, customer name, phone, address, item, and current status are accurately displayed. | Pass |
| **TC-RD-04** | Lifecycle | `ASSIGNED` $\rightarrow$ `PICKED_UP` transition | Click "Mark as Picked Up" sends `PATCH` request; status updates to `PICKED_UP`. | Pass |
| **TC-RD-05** | Lifecycle | `PICKED_UP` $\rightarrow$ `DELIVERED` transition | Click "Mark as Delivered" sends `PATCH` request; status updates to `DELIVERED`. | Pass |
| **TC-RD-06** | Validation | Skip lifecycle (`ASSIGNED` $\rightarrow$ `DELIVERED`) | Direct transition button is absent in UI; API request returns `400 Bad Request`. | Pass |
| **TC-RD-07** | Persistence | State persistence on browser refresh | Refreshing page maintains updated state fetched from persistent backend API. | Pass |
| **TC-RD-08** | Error Handling | Backend unreachable / network fail | Friendly error message ("Unable to connect to Reflex backend") rendered. | Pass |
| **TC-RD-09** | Empty State | Rider with 0 assigned deliveries | Friendly informative alert ("No assigned deliveries yet") displayed. | Pass |
