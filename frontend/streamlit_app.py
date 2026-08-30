import streamlit as st
import requests
import time
from datetime import datetime

# Configure page metadata
st.set_page_config(
    page_title="Reflex Delivery Telemetry",
    page_icon="🚚",
    layout="wide"
)

API_BASE_URL = "http://127.0.0.1:8000"

st.title("🚚 Reflex Delivery Telemetry Dashboard")
st.caption("Live REST Short-Polling Dashboard & Sequential State Transition Engine")

# Sidebar - Settings & Auto-refresh controls
st.sidebar.header("🕹️ Controls & Settings")
role = st.sidebar.radio("Select View Role:", ["Dispatcher View", "Rider / Field Agent View"])

auto_refresh = st.sidebar.checkbox("Enable Auto-Refresh (Short-Polling)", value=True)
refresh_interval = st.sidebar.slider("Polling Interval (seconds)", min_value=1, max_value=10, value=3)

# Helper function to fetch deliveries from FastAPI
def fetch_deliveries():
    try:
        res = requests.get(f"{API_BASE_URL}/deliveries", timeout=3)
        if res.status_code == 200:
            return res.json()
        st.error(f"Failed to fetch data: HTTP {res.status_code}")
        return []
    except requests.exceptions.ConnectionError:
        st.error("⚠️ Cannot connect to FastAPI backend. Ensure server is running at http://127.0.0.1:8000")
        return []

# Status badge formatting helper
def get_status_badge(status_str):
    colors = {
        "OPEN": "🟦 OPEN",
        "ASSIGNED": "🟨 ASSIGNED",
        "IN_TRANSIT": "🟧 IN_TRANSIT",
        "DELIVERED": "🟩 DELIVERED",
        "CANCELLED": "🟥 CANCELLED"
    }
    return colors.get(status_str, status_str)

# Main layout logic
deliveries = fetch_deliveries()

if role == "Dispatcher View":
    st.subheader("📋 Dispatcher Control Center")
    
    # 1. Create New Delivery Form
    with st.expander("➕ Create New Delivery Order", expanded=False):
        with st.form("create_delivery_form"):
            col1, col2 = st.columns(2)
            with col1:
                item_desc = st.text_input("Item Description", placeholder="e.g. Medical Supplies Box #A4")
                pickup = st.text_input("Pickup Location", placeholder="e.g. Warehouse 3, Westlands")
            with col2:
                dropoff = st.text_input("Dropoff Location", placeholder="e.g. Clinic B, Kilimani")
            
            submitted = st.form_submit_button("Dispatch Order")
            if submitted:
                if item_desc and pickup and dropoff:
                    payload = {
                        "item_description": item_desc,
                        "pickup_location": pickup,
                        "dropoff_location": dropoff
                    }
                    res = requests.post(f"{API_BASE_URL}/deliveries", json=payload)
                    if res.status_code == 201:
                        st.success("✅ Delivery order created successfully!")
                        st.rerun()
                    else:
                        st.error(f"Error creating delivery: {res.text}")
                else:
                    st.warning("Please fill in all fields.")

    st.divider()

    # 2. Live Deliveries Grid
    st.markdown(f"### Active Deliveries ({len(deliveries)})")
    if not deliveries:
        st.info("No active deliveries found.")
    else:
        for d in deliveries:
            with st.container(border=True):
                col1, col2, col3, col4 = st.columns([1, 3, 2, 2])
                with col1:
                    st.markdown(f"**ID:** #{d['id']}")
                with col2:
                    st.markdown(f"**Item:** {d['item_description']}")
                    st.caption(f"📍 {d['pickup_location']} ➔ 🎯 {d['dropoff_location']}")
                with col3:
                    st.markdown(f"**Status:** {get_status_badge(d['current_status'])}")
                with col4:
                    with st.popover("📜 Audit Log"):
                        st.write("Transition History:")
                        for log in d.get("status_logs", []):
                            st.text(f"[{log['timestamp'][:19]}]\n{log['previous_status']} ➔ {log['new_status']}")

elif role == "Rider / Field Agent View":
    st.subheader("🏍️ Rider Status Updater")
    st.caption("Perform status transitions. Backend will reject invalid skips with HTTP 400 Bad Request.")

    if not deliveries:
        st.info("No deliveries available to update.")
    else:
        # Select delivery to update
        delivery_options = {f"ID #{d['id']} - {d['item_description']} ({d['current_status']})": d for d in deliveries}
        selected_key = st.selectbox("Select Delivery Order to Update:", list(delivery_options.keys()))
        selected_delivery = delivery_options[selected_key]

        st.info(f"**Current Status:** {get_status_badge(selected_delivery['current_status'])}")

        col1, col2, col3 = st.columns(3)
        
        with col1:
            if st.button("Mark ASSIGNED 🟨", use_container_width=True):
                res = requests.patch(f"{API_BASE_URL}/deliveries/{selected_delivery['id']}/status", json={"new_status": "ASSIGNED"})
                if res.status_code == 200:
                    st.success("Status updated to ASSIGNED")
                    st.rerun()
                else:
                    st.error(f"❌ Rejected: {res.json().get('detail')}")

        with col2:
            if st.button("Mark IN_TRANSIT 🟧", use_container_width=True):
                res = requests.patch(f"{API_BASE_URL}/deliveries/{selected_delivery['id']}/status", json={"new_status": "IN_TRANSIT"})
                if res.status_code == 200:
                    st.success("Status updated to IN_TRANSIT")
                    st.rerun()
                else:
                    st.error(f"❌ Rejected: {res.json().get('detail')}")

        with col3:
            if st.button("Mark DELIVERED 🟩", use_container_width=True):
                res = requests.patch(f"{API_BASE_URL}/deliveries/{selected_delivery['id']}/status", json={"new_status": "DELIVERED"})
                if res.status_code == 200:
                    st.success("Status updated to DELIVERED")
                    st.rerun()
                else:
                    st.error(f"❌ Rejected: {res.json().get('detail')}")

        st.divider()
        st.markdown("##### 🚨 Test Illegal State Transition Guard")
        if st.button("Attempt Direct Skip to DELIVERED (Should Fail if OPEN)"):
            res = requests.patch(f"{API_BASE_URL}/deliveries/{selected_delivery['id']}/status", json={"new_status": "DELIVERED"})
            if res.status_code == 400:
                st.error(f"✅ Backend correctly blocked illegal transition!\n\n**HTTP 400 Response:** {res.json().get('detail')}")
            else:
                st.write(res.json())

# Auto-refresh loop for short-polling simulation
if auto_refresh:
    time.sleep(refresh_interval)
    st.rerun()