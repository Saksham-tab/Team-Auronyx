import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib

# Load dataset
df = pd.read_csv("/content/wheat_irrigation_dataset.csv")

# Encode crop stage
le = LabelEncoder()
df["crop_stage"] = le.fit_transform(df["crop_stage"])

# Features & Target
X = df[["crop_stage", "temperature", "humidity", "soil_moisture"]]
y = df["recommended_irrigation_minutes"]

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Model
model = RandomForestRegressor(
    n_estimators=100,
    max_depth=8,
    random_state=42
)

model.fit(X_train, y_train)

# Accuracy
score = model.score(X_test, y_test)
print("Model R2 Score:", score)

# Save model & encoder
joblib.dump(model, "irrigation_model.pkl")
joblib.dump(le, "stage_encoder.pkl")

print("Model saved successfully!")