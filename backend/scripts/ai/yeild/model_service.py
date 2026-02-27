# model_service.py

import joblib
import pandas as pd
from datetime import datetime
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "mp_yield_model.pkl")
FEATURE_PATH = os.path.join(BASE_DIR, "mp_yield_features.pkl")

def load_model():
    model = joblib.load(MODEL_PATH)
    features = joblib.load(FEATURE_PATH)
    return model, features


def predict_yield(model, feature_columns, input_data):
    try:
        df = pd.DataFrame([input_data])
        df = df[feature_columns]  # maintain correct order
        prediction = model.predict(df)
        return round(float(prediction[0]), 2)
    except Exception as e:
        print("Prediction Error:", e)
        return None


def format_prediction(predicted_value):
    return {
        "predicted_yield_ton_per_hectare": predicted_value,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }