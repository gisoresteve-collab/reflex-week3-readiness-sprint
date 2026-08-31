# Rider Dashboard & Workflow Component

## Overview
The **Rider Dashboard** allows assigned delivery riders to view their allocated delivery tasks, view details (customer name, phone number, address, item details), and advance deliveries through their core lifecycle:

$$\text{OPEN} \longrightarrow \text{ASSIGNED} \longrightarrow \text{PICKED\_UP} \longrightarrow \text{DELIVERED}$$

## Project Structure
- `streamlit_app.py`: Main interactive web dashboard built with Streamlit.
- `api.py`: HTTP client communicating with the shared Reflex Node.js/Express backend API.
- `styles.py`: Custom CSS styling for delivery cards, status pills, and layout aesthetics.

## How to Run

1. Ensure the Reflex Backend API is running at `http://localhost:3000` (or set `REFLEX_API_URL` environment variable).
2. Activate your Python environment:
   ```cmd
   .venv\Scripts\activate
   ```
3. Run the Streamlit application:
   ```cmd
   streamlit run streamlit_app.py
   ```
