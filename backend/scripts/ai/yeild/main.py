# main.py

from model_service import load_model, predict_yield, format_prediction
from redis_service import connect, get_farm_data, save_prediction


def main():

    # Connect to Redis
    redis_conn = connect()
    print("Connected to Redis")

    # Load model
    model, feature_columns = load_model()
    print("Model Loaded Successfully")

    # Fetch farm data
    farm_data = get_farm_data(redis_conn)

    if not farm_data:
        print("No farm data found in Redis")
        return

    print("Received Data:", farm_data)

    # Predict
    predicted_value = predict_yield(model, feature_columns, farm_data)

    if predicted_value is None:
        return

    print("Predicted Yield (ton/hectare):", predicted_value)

    # Save prediction
    result = format_prediction(predicted_value)
    save_prediction(redis_conn, result)

    print("Prediction saved to Redis successfully")


if __name__ == "__main__":
    main()