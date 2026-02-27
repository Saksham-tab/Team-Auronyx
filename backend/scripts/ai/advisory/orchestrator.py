import json
from rag_service import retrieve
from llm_service import generate_advisory
from weather_service import get_rain_forecast


def _normalize_sensor(sensor):
    return {
        "soil_moisture": sensor.get("moisture", sensor.get("soil_moisture", 0)),
        "humidity": sensor.get("humidity", 0),
        "tds": sensor.get("tds", 0),
        "temperature": sensor.get("temperature", 0),
    }


def run_pipeline(sensor):
    normalized = _normalize_sensor(sensor)
    rain_data = get_rain_forecast()

    query = (
        f"Soil Moisture: {normalized['soil_moisture']}%, "
        f"TDS: {normalized['tds']} ppm, "
        f"Temperature: {normalized['temperature']}C, "
        f"Today Rain: {rain_data['today_rain_mm']}mm"
    )

    retrieved_docs = retrieve(query)
    advice_text = generate_advisory(normalized, rain_data, retrieved_docs)

    return {
        "sensor_data": normalized,
        "rain_forecast": rain_data,
        "advisory": advice_text,
    }


if __name__ == "__main__":
    import sys
    payload = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
    print(json.dumps(run_pipeline(payload)))

