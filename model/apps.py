import streamlit as st
import pandas as pd
import joblib

# Load your trained model
model = joblib.load("model.pkl")  # make sure model.pkl is in same folder

# Streamlit app title
st.set_page_config(page_title="House Rent Prediction", page_icon="🏠", layout="centered")

st.title("🏠 House Rent Prediction")

st.write("Fill in the details below to predict the estimated rent.")

# Input fields
col1, col2 = st.columns(2)

with col1:
    BHK = st.number_input("BHK", min_value=1, max_value=10, value=2)

with col2:
    Sqft = st.number_input("Square Feet", min_value=100, max_value=10000, value=1000)

Main_Locality = st.selectbox(
    "Main Locality",
    ["Select Locality", "pal", "palanpur", "vesu", "adajan", "bhatar", "varachha", "udhna", "katargam"]
)

# Predict button
if st.button("🔍 Predict Rent"):
    if Main_Locality == "Select Locality":
        st.warning("⚠️ Please select a valid locality.")
    else:
        # Create input DataFrame
        input_df = pd.DataFrame([{
            "BHK": BHK,
            "Main_Locality": Main_Locality,
            "Sqft": Sqft
        }])

        # Prediction
        try:
            prediction = model.predict(input_df)[0]
            result = round(prediction, 2)
            st.success(f"💰 **Predicted Rent:** ₹{result:,.2f}")
        except Exception as e:
            st.error(f"Error: {e}")
