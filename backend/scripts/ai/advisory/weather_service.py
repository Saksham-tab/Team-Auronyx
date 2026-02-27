import requests
from config import WEATHER_API_KEY, CITY


def get_rain_forecast():
    # Fallback for local runs when weather API key is not configured.
    if not WEATHER_API_KEY:
        return {"today_rain_mm": 0.0, "rain_prob": 0.0}

    url = (
        f"https://api.openweathermap.org/data/2.5/forecast?"
        f"q={CITY}&appid={WEATHER_API_KEY}&units=metric"
    )

    try:
        data = requests.get(url, timeout=6).json()
        samples = data.get("list", [])[:8]
        if not samples:
            return {"today_rain_mm": 0.0, "rain_prob": 0.0}

        today_rain = sum(item.get("rain", {}).get("3h", 0.0) for item in samples)
        rain_prob = max(item.get("pop", 0.0) * 100 for item in samples)
        return {
            "today_rain_mm": round(float(today_rain), 2),
            "rain_prob": round(float(rain_prob), 1),
        }
    except Exception:
        return {"today_rain_mm": 0.0, "rain_prob": 0.0}

