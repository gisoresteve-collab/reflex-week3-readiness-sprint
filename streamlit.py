import streamlit as st
import requests
import pandas as pd

st.set_page_config(
    page_title="Retailer Order Operations",
    page_icon="🛍️",
    layout="wide"
)

API_URL = "http://127.0.0.1:8000/api/retailer/orders"

st.title("🛍️ Retailer Delivery Operations Hub")
st.caption("Standalone Retail Store Dispatch Management System")

# Tab navigation designed for store staff
tab_new_order, tab_live_orders, tab_analytics = st.tabs([
    "➕ New Delivery Request", 
    "📋 Live Store Manifest", 
    "📊 Retail Analytics"
])

# ---------------------------------------------------------
# TAB 1: NEW DELIVERY REQUEST FORM
# ---------------------------------------------------------
with tab_new_order:
    st.subheader("Book New Outbound Delivery")
    
    with st.form("create_order_form", clear_on_submit=True):
        col1, col2 = st.columns(2)
        with col1:
            customer_name = st.text_input("Customer Full Name *", placeholder="e.g. Jane Wambui")
            customer_phone = st.text_input("Phone Number *", placeholder="e.g. 0712345678")
            store_branch = st.selectbox("Origin Store Branch", ["Nairobi Hub - Westlands", "CBD Outlet", "Kilimani Branch", "Mombasa Main"])
        
        with col2:
            delivery_address = st.text_input("Delivery Address / Landmark *", placeholder="e.g. Kilimani, Argwings Kodhek Rd, Apt 4B")
            item_description = st.text_input("Items Description *", placeholder="e.g. 1x HP Laptop + Accessories")
            package_notes = st.text_area("Handling Instructions / Notes", placeholder="e.g. Fragile glass item. Handle with care.")

        submit_btn = st.form_submit_button("🚀 Submit Delivery Request")

        if submit_btn:
            missing = []
            if not customer_name.strip(): missing.append("Customer Name")
            if not customer_phone.strip(): missing.append("Phone Number")
            if not delivery_address.strip(): missing.append("Delivery Address")
            if not item_description.strip(): missing.append("Item Description")

            if missing:
                st.error(f"⚠️ Missing required fields: {', '.join(missing)}")
            else:
                payload = {
                    "customer_name": customer_name.strip(),
                    "customer_phone": customer_phone.strip(),
                    "delivery_address": delivery_address.strip(),
                    "item_description": item_description.strip(),
                    "store_branch": store_branch,
                    "package_notes": package_notes.strip() if package_notes else None
                }

                try:
                    res = requests.post(API_URL, json=payload, timeout=5)
                    if res.status_code == 201:
                        data = res.json()
                        st.success(f"✅ Order #{data['id']} successfully logged in OPEN status!")
                    else:
                        st.error(f"❌ Server Error ({res.status_code}): {res.text}")
                except Exception as e:
                    st.error(f"❌ Connection error: {e}")

# ---------------------------------------------------------
# TAB 2: LIVE STORE MANIFEST & SEARCH
# ---------------------------------------------------------
with tab_live_orders:
    st.subheader("Active Delivery Manifest")
    
    col_filter, col_refresh = st.columns([3, 1])
    with col_filter:
        status_filter = st.selectbox("Filter by Status", ["ALL", "OPEN", "PROCESSING", "DISPATCHED", "DELIVERED", "CANCELLED"])
    with col_refresh:
        if st.button("🔄 Refresh Data"):
            st.rerun()

    try:
        url = API_URL if status_filter == "ALL" else f"{API_URL}?status_filter={status_filter}"
        res = requests.get(url, timeout=5)
        
        if res.status_code == 200:
            orders = res.json()
            if not orders:
                st.info("No delivery orders match the current criteria.")
            else:
                for order in orders:
                    with st.container(border=True):
                        c1, c2, c3, c4 = st.columns([1, 3, 3, 2])
                        with c1:
                            st.markdown(f"### #{order['id']}")
                            st.caption(f"Status: **{order['current_status']}**")
                        with c2:
                            st.markdown(f"👤 **{order['customer_name']}** (`{order['customer_phone']}`)")
                            st.markdown(f"📦 {order['item_description']}")
                        with c3:
                            st.markdown(f"🏢 **From:** {order['store_branch']}")
                            st.markdown(f"📍 **To:** {order['delivery_address']}")
                        with c4:
                            st.caption(f"Created: {order['created_at'][:19]}")
                            if order['current_status'] == "OPEN":
                                if st.button(f"Cancel #{order['id']}", key=f"cancel_{order['id']}"):
                                    patch_res = requests.patch(f"{API_URL}/{order['id']}/status", json={"current_status": "CANCELLED"})
                                    if patch_res.status_code == 200:
                                        st.toast(f"Order #{order['id']} Cancelled")
                                        st.rerun()
        else:
            st.error(f"Failed to load orders (HTTP {res.status_code})")
    except Exception as e:
        st.error(f"Unable to connect to backend engine: {e}")

# ---------------------------------------------------------
# TAB 3: RETAIL ANALYTICS SUMMARY
# ---------------------------------------------------------
with tab_analytics:
    st.subheader("Retailer Performance Metrics")
    try:
        res = requests.get(API_URL, timeout=5)
        if res.status_code == 200:
            orders = res.json()
            if orders:
                df = pd.DataFrame(orders)
                m1, m2, m3, m4 = st.columns(4)
                m1.metric("Total Bookings", len(df))
                m2.metric("Pending (OPEN)", len(df[df['current_status'] == 'OPEN']))
                m3.metric("Delivered", len(df[df['current_status'] == 'DELIVERED']))
                m4.metric("Cancelled", len(df[df['current_status'] == 'CANCELLED']))
                
                st.markdown("### Bookings by Store Branch")
                st.bar_chart(df['store_branch'].value_counts())
            else:
                st.info("No data available for analytics.")
    except Exception as e:
        st.error(f"Analytics unavailable: {e}")