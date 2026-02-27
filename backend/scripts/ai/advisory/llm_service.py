from config import HF_TOKEN, HF_MODEL

try:
    from huggingface_hub import InferenceClient
except Exception:
    InferenceClient = None


def _local_fallback(sensor, rain_data):
    moisture = sensor.get("soil_moisture", 0)
    humidity = sensor.get("humidity", 0)
    temp = sensor.get("temperature", 0)
    rain_mm = rain_data.get("today_rain_mm", 0)

    lines = []
    if moisture < 35:
        lines.append(f"Soil moisture {moisture}% hai, controlled irrigation start karo.")
    else:
        lines.append(f"Soil moisture {moisture}% stable hai, immediate irrigation avoid karo.")
    lines.append(f"Humidity {humidity}% recorded hai, airflow monitoring active rakho.")
    lines.append(f"Field temperature {temp}C hai, midday water stress observe karo.")
    lines.append(f"Aaj rainfall {rain_mm}mm hai, irrigation schedule ko accordingly adjust karo.")
    return "\n".join(f"- {line}" for line in lines)


def generate_advisory(sensor, rain_data, retrieved_docs):
    if not InferenceClient or not HF_TOKEN:
        return _local_fallback(sensor, rain_data)

    client = InferenceClient(model=HF_MODEL, token=HF_TOKEN)
    notes = "\n".join(retrieved_docs[:3]) if retrieved_docs else "N/A"

    system_message = (
        "Aap ek practical irrigation advisor ho. "
        "Sirf concise bullet points me actionable advisory do."
    )

    user_message = f"""
Live Field Data:
- Soil Moisture: {sensor.get('soil_moisture', 0)} %
- Humidity: {sensor.get('humidity', 0)} %
- TDS Level: {sensor.get('tds', 0)} ppm
- Field Temperature: {sensor.get('temperature', 0)} C
- Aaj ka total rainfall: {rain_data.get('today_rain_mm', 0)} mm

Reference Notes:
{notes}
"""

    response = client.chat_completion(
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": user_message},
        ],
        max_tokens=280,
        temperature=0.2,
    )
    return response.choices[0].message.content

