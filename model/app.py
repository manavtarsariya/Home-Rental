from flask import Flask, render_template, request
import joblib
import pandas as pd

app = Flask(__name__)

# Load your trained model
model = joblib.load("model.pkl")  # Ensure this file exists in the same directory

@app.route('/')
def home():
    return render_template('index.html')

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

        return render_template('index.html', prediction_text=f"Predicted Rent: ₹{result}")

    except Exception as e:
        return render_template('index.html', prediction_text=f"Error: {str(e)}")

if __name__ == '__main__':
    app.run(debug=True)
