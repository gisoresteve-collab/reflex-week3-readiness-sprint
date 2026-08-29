# Rehearsal Session 1 — Mock Panel Feedback & Audit Log

## Rehearsal Overview & Checklist

- [x] 10-minute presentation completed.
- [x] All team presenters participated.
- [x] At least 10 minutes of technical questioning completed.
- [x] Questioning, timing, and handoff weaknesses recorded.

---

## 1. Timing Breakdown

- **Target Presentation Time:** 10:00 minutes max
- **Actual Presentation Time:** 09:45 minutes
- **Target Q&A Duration:** 10:00 minutes min
- **Actual Q&A Duration:** 11:30 minutes
- **Status:** Within target parameters.

---

## 2. Questions Recorded During Mock Session

| #   | Question Asked by Mock Panel                                         | Respondent  | Answer Quality | Notes / Follow-up Action Needed                                           |
| --- | -------------------------------------------------------------------- | ----------- | -------------- | ------------------------------------------------------------------------- |
| 1   | Why did you choose REST short-polling instead of WebSockets?         | Lead / Tech | Strong         | Reference `TRADEOFFS.md` Item #1 directly.                                |
| 2   | What prevents a rider from skipping directly from OPEN to DELIVERED? | Backend Dev | Weak           | Needs stronger emphasis on FastAPI backend validation logic.              |
| 3   | Where is the single source of truth when network drops occur?        | Data/Arch   | Moderate       | Clearly point to relational database atomic logs in `docs/data-model.md`. |
| 4   | How does the system handle concurrent dispatch actions on one rider? | Lead        | Weak           | Clarify database transaction locking mechanisms.                          |

---

## 3. Presentation & Handoff Audit

### Weak Answers Identified

- **Skipping Lifecycle States:** The initial explanation focused on UI disabling rather than API-level enforcement. **Fix:** Reiterate that the backend API throws a `400 Bad Request` if `new_status` is out of sequence.
- **Database Concurrency:** Response lacked specificity on transactional locks. **Fix:** Use explicit State-Context-Evidence formulation from `docs/defense-bank.md`.

### Unclear Slides / Visual Friction

- **Slide 3 (Architecture Diagram):** Text labels for REST endpoints were too small to read during full screen share. **Fix:** Increase font contrast and zoom in on API server node.
- **Slide 6 (Data Model):** Relationship lines between `Delivery` and `Status Update` caused confusion. **Fix:** Simplify to explicit foreign key bullet points.

### Team Handoff Problems

- **Handoff from Retailer Demo to Dispatcher Demo:** 5-second awkward pause while switching screen shares. **Fix:** Speaker 1 introduces Speaker 2 before initiating screen transfer.
- **Q&A Routing:** Two team members started answering Question 3 simultaneously. **Fix:** Team Leader assigns panel questions to specific team leads explicitly.

---

## 4. Required Action Items & Improvements

1. **Slide Adjustments:** Update architecture diagram font sizing in the presentation deck.
2. **Q&A Rehearsal:** Review `docs/defense-bank.md` Q10 (concurrency) and Q12 (invalid state sequence) prior to Session 2.
3. **Transition Cueing:** Practice verbal handoff cues during next dry run.
