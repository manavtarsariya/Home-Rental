from flask import Flask, jsonify, render_template, request
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)

# ✅ Allow all origins (simple global fix)
CORS(app)

# Load your trained model
model = joblib.load("model.pkl")  # Ensure this file exists in the same directory

@app.route('/')
def home():
    return 'Home Page'
    # return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get form data
        BHK = int(request.form['BHK'])
        Main_Locality = request.form['Main_Locality']
        Sqft = float(request.form['Sqft'])

        # Prepare input for model
        input_df = pd.DataFrame([{
            'BHK': BHK,
            'Main_Locality': Main_Locality,
            'Sqft': Sqft
        }])

        # Predict
        prediction = model.predict(input_df)[0]
        result = round(prediction, 2)

        print(f"Predicted Rent: ₹{result}")
        return jsonify(result)
        # return render_template('index.html', prediction_text=f"Predicted Rent: ₹{result}")

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    port = 5000  # Default Flask port
    print(f"Application is running! Access it at http://127.0.0.1:{port}")
    app.run(debug=True, port=port)
