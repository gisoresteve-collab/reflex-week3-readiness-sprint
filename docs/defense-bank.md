# Reflex System — State-Context-Evidence Defense Framework Bank

This document serves as the team's unified Q&A defense bank for technical evaluation panels. Every response strictly adheres to the **State $\rightarrow$ Context $\rightarrow$ Evidence** structure.

---

## 1. Architectural Panel Questions

### Q1: Why did you choose this architecture?

- **STATE:** We chose a decoupled, REST-based architecture separating persona-specific user interfaces (Retailer, Dispatcher, Rider) from a central Python FastAPI backend.
- **CONTEXT:** Local delivery operations require clear operational role separation and light network footprints across heterogeneous mobile hardware and web browsers.
- **EVIDENCE:** Our implementation in `docs/architecture.md` demonstrates dedicated API endpoints (`POST /deliveries`, `PUT /deliveries/{id}/assign`, `PATCH /deliveries/{id}/status`) enforcing distinct role access and isolated responsibilities.

### Q2: Why not use another approach (e.g., Event-Driven / Microservices / Native Mobile App)?

- **STATE:** We rejected microservice and native mobile app architectures in favor of a monolithic REST API and web-client model.
- **CONTEXT:** A short sprint timeline demands minimizing infrastructure overhead, complex deployment pipelines, and cross-platform native SDK integration hurdles.
- **EVIDENCE:** See `TRADEOFFS.md` Trade-off #1 & #3, showing how a single FastAPI service reduced deployment failure points and accelerated core state-machine validation.

### Q3: Where is the source of truth?

- **STATE:** The central relational database (PostgreSQL/SQLite) managed behind FastAPI serves as the single immutable source of truth.
- **CONTEXT:** Distributed clients cannot maintain independent state buffers during active delivery assignments without risking inconsistent order status views.
- **EVIDENCE:** All status transitions append a record to the `Status Update` table (`docs/data-model.md`), ensuring state changes are validated and audited in database transactions.

### Q4: How does synchronization work?

- **STATE:** Client applications synchronize state using REST API short-polling at 5-second intervals.
- **CONTEXT:** Continuous bi-directional connections (WebSockets) introduce connection-state overhead and complex reconnect logic on unstable mobile data networks.
- **EVIDENCE:** Interface components initiate GET requests on interval loops, retrieving the latest persistent record from the database without keeping server sockets open.

### Q5: How does rider status reach the retailer?

- **STATE:** Rider updates propagate through the database to the retailer via polling fetch requests.
- **CONTEXT:** When a rider transitions an order (e.g., `PICKED UP`), the change must reflect on the retailer dashboard without direct peer-to-peer client connections.
- **EVIDENCE:** The rider client issues `PATCH /deliveries/{id}/status`, updating the delivery record. On the next 5-second poll cycle, the retailer client fetches `GET /deliveries/{id}` and updates the UI.

---

## 2. Trade-Off Panel Questions

### Q6: What is the weakest part of Reflex?

- **STATE:** The primary system weakness is reliance on REST short-polling instead of real-time push events.
- **CONTEXT:** High-frequency polling under heavy concurrent user scaling creates repetitive database queries even when no state changes occur.
- **EVIDENCE:** Documented in `TRADEOFFS.md` Item #1, outlining the sprint trade-off and specifying a future roadmap transition to WebSockets/SSE.

### Q7: What did you deliberately simplify?

- **STATE:** We deliberately simplified rider assignment to manual dispatcher selection and order confirmation to numeric OTP strings.
- **CONTEXT:** Building automated geo-routing algorithms or native hardware QR-scanning libraries would introduce external point-of-failure risks during rapid iteration.
- **EVIDENCE:** Documented in `TRADEOFFS.md` Items #2 & #3, prioritizing system stability and deterministic state execution over automated routing heuristics.

### Q8: What happens when the system scales?

- **STATE:** Database query load will increase linearly with active polling clients, leading to API latency bottlenecks.
- **CONTEXT:** As hundreds of retailers and riders poll every 5 seconds, database read operations become the primary constraint.
- **EVIDENCE:** Identified in `docs/architecture.md` roadmap: scaling mitigation requires introducing Redis caching layers for GET requests and transitioning to Server-Sent Events (SSE).

### Q9: What would you change with another month?

- **STATE:** With an additional month, we would implement event-driven push streaming, automated rider geo-assignment, and digital signature/QR confirmation.
- **CONTEXT:** Broadening system capability from core state management to operational automation requires dedicated testing of WebSocket state and geospatial indexing.
- **EVIDENCE:** Roadmap progression items outlined in `TRADEOFFS.md` Future Roadmap column across items #1, #2, and #3.

---

## 3. Edge Cases & Resilience Questions

### Q10: What happens if two dispatchers assign the same rider or delivery simultaneously?

- **STATE:** The database enforces atomic locking during assignment requests, rejecting concurrent duplicate writes.
- **CONTEXT:** Race conditions occur if two dispatchers attempt to assign an unallocated `OPEN` order at the exact same moment.
- **EVIDENCE:** FastAPI updates check the current state within a transactional database block; the second operation fails validation because the order is no longer in `OPEN` state.

### Q11: What happens if the rider loses connectivity?

- **STATE:** The rider interface retains local pending actions and retries API status updates once connectivity returns.
- **CONTEXT:** Mobile networks drop in field conditions; state transitions executed offline must not be lost or pollute historical sequence.
- **EVIDENCE:** API timestamps capture the server processing time while audit logs reflect the transition sequence once received.

### Q12: What happens if the rider sends an invalid status update (e.g., OPEN -> DELIVERED directly)?

- **STATE:** The backend API rejects out-of-sequence state changes and returns a `400 Bad Request` validation error.
- **CONTEXT:** Deliveries must follow strict linear progression (`OPEN` -> `ASSIGNED` -> `PICKED UP` -> `DELIVERED`) to maintain system integrity.
- **EVIDENCE:** State machine rules in `docs/architecture.md` Section 3 enforce validation checks on `new_status` against `previous_status`.

### Q13: What happens if the same order confirmation is scanned/submitted twice?

- **STATE:** Duplicate confirmation attempts are caught by idempotency checks and return a success notification showing existing `DELIVERED` status.
- **CONTEXT:** Network re-transmissions or double-clicking by riders can cause duplicate `DELIVERED` status submission calls.
- **EVIDENCE:** Database status updates check if `status == DELIVERED`. If already set, the transaction safely returns without writing duplicate audit logs.

---

## 4. Candor & System Limits Questions

### Q14: What doesn't your system currently solve?

- **STATE:** Reflex does not solve real-time rider route optimization, live turn-by-turn GPS tracking, or automated payment settlement.
- **CONTEXT:** We prioritized core operational state tracking and audit visibility over complex third-party API integrations during this sprint phase.
- **EVIDENCE:** Explicitly demarcated under the "Proposed / Future Enhancements" section of `docs/data-model.md`.

### Q15: What don't you know about the system?

- **STATE:** We do not yet know the exact database connection limits and performance degradation points under high-concurrency peak load testing (e.g., >10,000 active riders).
- **CONTEXT:** Production benchmarking requires full load testing tools (e.g., Locust) under simulated network latency across distributed geographies.
- **EVIDENCE:** Identified as an active technical testing milestone for phase 2 staging prior to production deployment.
