import sys
import json
import os
import traceback

# Add yeild directory to sys.path so we can import model_service
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.join(BASE_DIR, 'yeild'))

from model_service import load_model, predict_yield

def predict():
    try:
        input_data = json.loads(sys.argv[1])
        moisture = input_data.get('moisture', 50.0)
        temp = input_data.get('temperature', 25.0)
        humidity = input_data.get('humidity', 50.0)
        
        # Mapping to required features:
        farm_data = {
            'Cumulative_Rainfall': input_data.get('rainfall', 100.0), # Default mock if missing
            'Average_Temperature': temp,
            'Average_Soil_Moisture': moisture,
            'Average_Humidity': humidity,
            'Average_Wind_Speed': input_data.get('wind_speed', 10.0) # Default mock if missing
        }
        
        model, feature_columns = load_model()
        predicted_yield = predict_yield(model, feature_columns, farm_data)
        
        if predicted_yield is None:
            # Fallback for errors inside model
            print(json.dumps({"prediction": 0}))
        else:
            print(json.dumps({"prediction": predicted_yield}))
            
    except Exception as e:
        # Print a fallback JSON so the backend AiService doesn't completely crash the Promise.all
        print(json.dumps({"prediction": 0, "error": str(e)}))

if __name__ == "__main__":
    predict()
