import redis
import json
from config import REDIS_HOST, REDIS_PORT, REDIS_KEY

def get_sensor_data():
    r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, decode_responses=True)
    data = r.get(REDIS_KEY)

    if not data:
        raise Exception("No sensor data found in Redis")

    return json.loads(data)