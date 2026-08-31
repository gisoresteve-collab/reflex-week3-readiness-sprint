# One-Page Trade-off Log — Reflex System

As required by the Readiness Sprint guidelines, below is the explicit log of engineering and design trade-offs made during the build of the Reflex MVP.

---

### Trade-off 1: In-Memory Data Store vs. Persistent Database (PostgreSQL/MongoDB)

- **What it is**: The current MVP backend retains delivery records and rider data in Node.js in-memory JavaScript objects/arrays rather than a relational database.
- **Why we accepted it anyway**: The sprint prioritizes demonstrating a working end-to-end integration and executive story. Eliminating external database setup allowed zero-friction execution and instant local deployment during evaluation.
- **What we'd do differently with more time**: Migrate to PostgreSQL with Prisma ORM to ensure ACID compliance, persistent storage across service restarts, and relational constraints between Retailers, Dispatchers, and Riders.

---

### Trade-off 2: Simplified Rider Selector vs. Full Authentication & JWT Sessions

- **What it is**: The Rider Dashboard uses a dropdown selection of active rider IDs rather than secure authentication (login/password/OAuth) and session tokens.
- **Why we accepted it anyway**: Avoids authentication friction during live panel evaluation while demonstrating full multi-rider isolation and API filtering by Rider ID.
- **What we'd do differently with more time**: Implement JWT-based user authentication, role-based access control (RBAC), and secure mobile/web session management so riders automatically view only their assigned orders.

---

### Trade-off 3: Polling & State Rerun vs. Real-Time WebSockets (Socket.io)

- **What it is**: Status updates trigger page reruns and HTTP REST queries rather than persistent WebSocket or Server-Sent Events (SSE) connections across Retailer, Dispatcher, and Rider dashboards.
- **Why we accepted it anyway**: HTTP REST endpoints provide reliable, predictable, and clean lifecycle management for an MVP without handling WebSocket reconnects, state sync edge cases, or web socket infrastructure overhead.
- **What we'd do differently with more time**: Integrate Socket.io / WebSockets for instantaneous, push-based delivery status updates across all connected user dashboards.
