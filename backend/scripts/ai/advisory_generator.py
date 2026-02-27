import sys
import json

def generate():
    input_data = json.loads(sys.argv[1])
    moisture = input_data.get('moisture', 50)
    
    if moisture < 40:
        recommendation = "Enable Irrigation"
        reasons = ["Low soil moisture ({}%)".format(moisture), "Forecast indicates dry weather"]
    else:
        recommendation = "No Irrigation Needed"
        reasons = ["Soil moisture is sufficient"]

    print(json.dumps({
        "recommendation": recommendation,
        "reasons": reasons
    }))

if __name__ == "__main__":
    generate()
