import os
from pathlib import Path

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_KEY = os.getenv("ADVISORY_REDIS_KEY", "sensor_data")

LATITUDE = float(os.getenv("ADVISORY_LATITUDE", "22.7196"))
LONGITUDE = float(os.getenv("ADVISORY_LONGITUDE", "75.8577"))
CITY = os.getenv("ADVISORY_CITY", "Indore")
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "")

HF_TOKEN = os.getenv("HF_TOKEN", "")
HF_MODEL = os.getenv("HF_MODEL", "meta-llama/Llama-3.3-70B-Instruct")

BASE_DIR = Path(__file__).resolve().parent
PDF_PATH = str(BASE_DIR / "wheat_guide.pdf")
