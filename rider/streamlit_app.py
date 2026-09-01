import os
import streamlit as st

from api import RiderAPI
from styles import load_styles


API_URL = os.getenv(
    "REFLEX_API_URL",
    "http://localhost:3000"
)


st.set_page_config(
    page_title="Reflex Rider",
    page_icon="🚴",
    layout="wide"
)

load_styles()

api = RiderAPI(API_URL)


st.markdown(
    """
    <div class="rider-header">
        <h1>🚴 Rider Dashboard</h1>
        <p>Manage your assigned deliveries and update their delivery status.</p>
    </div>
    """,
    unsafe_allow_html=True
)


# ---------------------------------------------------------
# LOAD RIDERS
# ---------------------------------------------------------

try:
    riders = api.get_riders()

except Exception as error:
    st.error(
        "Unable to connect to the Reflex backend. "
        "Please make sure the backend is running."
    )
    st.caption(str(error))
    st.stop()


if not riders:
    st.warning("No riders are currently available.")
    st.stop()


rider_options = {
    f"{rider['name']} ({rider['id']})": rider["id"]
    for rider in riders
}


selected_rider_label = st.selectbox(
    "Current Rider",
    list(rider_options.keys())
)

rider_id = rider_options[selected_rider_label]


# ---------------------------------------------------------
# LOAD ASSIGNED DELIVERIES
# ---------------------------------------------------------

try:
    deliveries = api.get_assigned_deliveries(rider_id)

except Exception as error:
    st.error("Unable to retrieve assigned deliveries.")
    st.caption(str(error))
    st.stop()


# ---------------------------------------------------------
# SUMMARY
# ---------------------------------------------------------

total = len(deliveries)
assigned = len(
    [d for d in deliveries if d["status"] == "ASSIGNED"]
)
picked_up = len(
    [d for d in deliveries if d["status"] == "PICKED_UP"]
)
delivered = len(
    [d for d in deliveries if d["status"] == "DELIVERED"]
)


col1, col2, col3, col4 = st.columns(4)

col1.metric("Assigned", total)
col2.metric("To Pick Up", assigned)
col3.metric("Picked Up", picked_up)
col4.metric("Delivered", delivered)


st.divider()


# ---------------------------------------------------------
# EMPTY STATE
# ---------------------------------------------------------

if not deliveries:
    st.info(
        "No assigned deliveries yet. "
        "The Dispatcher will assign deliveries to you."
    )
    st.stop()


# ---------------------------------------------------------
# DELIVERY CARDS
# ---------------------------------------------------------

st.subheader("My Deliveries")


for delivery in deliveries:

    delivery_id = delivery["id"]
    status = delivery["status"]

    if status == "ASSIGNED":
        status_class = "status-assigned"
        status_text = "ASSIGNED"

    elif status == "PICKED_UP":
        status_class = "status-picked"
        status_text = "PICKED UP"

    else:
        status_class = "status-delivered"
        status_text = "DELIVERED"


    st.markdown(
        f"""
        <div class="delivery-card">

            <h3>{delivery_id}</h3>

            <span class="status {status_class}">
                {status_text}
            </span>

            <br><br>

            <strong>Customer</strong><br>
            {delivery["customerName"]}

            <br><br>

            <strong>Phone</strong><br>
            {delivery["customerPhone"]}

            <br><br>

            <strong>Delivery Address</strong><br>
            {delivery["deliveryAddress"]}

            <br><br>

            <strong>Item</strong><br>
            {delivery["itemDescription"]}

        </div>
        """,
        unsafe_allow_html=True
    )


    # -----------------------------------------------------
    # ACTIONS
    # -----------------------------------------------------

    if status == "ASSIGNED":

        if st.button(
            "📦 Mark as Picked Up",
            key=f"pickup_{delivery_id}"
        ):

            try:

                updated = api.update_status(
                    delivery_id,
                    "PICKED_UP"
                )

                st.success(
                    f"{delivery_id} is now marked as PICKED_UP."
                )

                st.rerun()

            except Exception as error:

                st.error(
                    "The delivery could not be marked as picked up."
                )

                st.caption(str(error))


    elif status == "PICKED_UP":

        if st.button(
            "✅ Mark as Delivered",
            key=f"deliver_{delivery_id}"
        ):

            try:

                updated = api.update_status(
                    delivery_id,
                    "DELIVERED"
                )

                st.success(
                    f"{delivery_id} is now marked as DELIVERED."
                )

                st.rerun()

            except Exception as error:

                st.error(
                    "The delivery could not be marked as delivered."
                )

                st.caption(str(error))


    elif status == "DELIVERED":

        st.success(
            "Delivery completed. No further action is required."
        )


    st.divider()