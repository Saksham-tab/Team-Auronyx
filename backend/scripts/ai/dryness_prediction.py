import sys
import json

def predict():
    # Simulate processing
    input_data = json.loads(sys.argv[1])
    
    moisture = input_data.get('moisture', 50)
    # Formula: lower moisture = fewer days remaining before critical (10% threshold)
    # Simple linear approximation: (current - threshold) / (evaporation rate/day)
    threshold = 10
    evap_rate = 5 # 5% per day
    days_rem = max(0, round((moisture - threshold) / evap_rate, 1))
    
    print(json.dumps({"prediction": days_rem}))

if __name__ == "__main__":
    predict()
