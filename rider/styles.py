import streamlit as st


def load_styles():
    st.markdown(
        """
        <style>

        .main {
            background-color: #f5f7fb;
        }

        .rider-header {
            padding: 1rem 0 1.5rem 0;
        }

        .rider-header h1 {
            margin-bottom: 0.2rem;
        }

        .delivery-card {
            padding: 1.2rem;
            border-radius: 14px;
            background: white;
            border: 1px solid #e4e7ec;
            margin-bottom: 1rem;
            box-shadow: 0 3px 12px rgba(0,0,0,0.04);
        }

        .status {
            display: inline-block;
            padding: 0.35rem 0.7rem;
            border-radius: 999px;
            font-size: 0.8rem;
            font-weight: 700;
        }

        .status-assigned {
            background: #fff4cc;
            color: #8a6200;
        }

        .status-picked {
            background: #dcecff;
            color: #1557a6;
        }

        .status-delivered {
            background: #dff6e8;
            color: #16723d;
        }

        </style>
        """,
        unsafe_allow_html=True
    )