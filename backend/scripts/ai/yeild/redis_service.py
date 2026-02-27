# redis_service.py

import redis
import json

REDIS_HOST = "localhost"
REDIS_PORT = 6379
REDIS_DB = 0

INPUT_KEY = "latest_farm_data"
OUTPUT_KEY = "latest_yield_prediction"


def connect():
    return redis.Redis(
        host=REDIS_HOST,
        port=REDIS_PORT,
        db=REDIS_DB,
        decode_responses=True
    )


def get_farm_data(redis_conn):
    data_json = redis_conn.get(INPUT_KEY)
    if data_json:
        return json.loads(data_json)
    return None


def save_prediction(redis_conn, prediction_dict):
    redis_conn.set(OUTPUT_KEY, json.dumps(prediction_dict))