# backend3_router.py

from fastapi import APIRouter, Request, Body
from fastapi.responses import JSONResponse
import torch
import torch.nn as nn
import numpy as np
import pandas as pd
from joblib import load
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

# Modèle LSTM
class RainLSTM(nn.Module):
    def __init__(self, input_size, hidden_size=64, num_layers=1):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.dropout = nn.Dropout(0.3)
        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x):
        out, _ = self.lstm(x)
        out = self.dropout(out[:, -1, :])
        return self.fc(out).squeeze()

model = RainLSTM(input_size=7)
model.load_state_dict(torch.load("lstm_rain_model.pt", map_location=torch.device("cpu")))
model.eval()
scaler = load("scaler.pkl")

latest_data = {}
pump_state = {"on": False}

class SensorData(BaseModel):
    temperature: Optional[float]
    humidity: Optional[float]
    soil_moisture: Optional[float]

# Données météo simulées
def get_api_weather(lat: float, lon: float) -> dict:
    return {
        "temperature_2m": 24.5,
        "relative_humidity_2m": 65.0,
        "dew_point_2m": 17.0,
        "cloud_cover": 50.0,
        "surface_pressure": 1012.0,
        "wind_speed_10m": 3.2,
        "previous_rain": 0.0
    }

def check_precipitation_forecast(lat: float, lon: float) -> bool:
    return False

@router.get("/predict")
def predict_rain(lat: float = 33.0017, lon: float = -7.6186):
    try:
        raw_data = get_api_weather(lat, lon)
        features = [
            "previous_rain", "relative_humidity_2m", "wind_speed_10m",
            "temperature_2m", "dew_point_2m", "cloud_cover", "surface_pressure"
        ]
        df = pd.DataFrame([raw_data])
        X_scaled = scaler.transform(df[features])
        X_tensor = torch.tensor(np.expand_dims(X_scaled, axis=0), dtype=torch.float32)

        with torch.no_grad():
            output = model(X_tensor)
            prob = torch.sigmoid(output).item()
            prediction_model = int(prob > 0.5)

        prediction_api = check_precipitation_forecast(lat, lon)

        return {
            "latitude": lat,
            "longitude": lon,
            "probability_model": round(prob, 4),
            "will_rain_model": bool(prediction_model),
            "will_rain_api": prediction_api
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.post("/sensor")
def receive_sensor_data(data: SensorData = Body(...)):
    global latest_data
    try:
        temperature = data.temperature
        humidity = data.humidity
        soil_moisture_raw = data.soil_moisture
        soil_percent = max(0, min(100, int((4095 - soil_moisture_raw) / 4095 * 100)))
        dew_point = temperature - ((100 - humidity) / 5)
        lat, lon = 33.0017, -7.6186

        api_data = get_api_weather(lat, lon)
        api_data.update({
            "temperature_2m": temperature,
            "relative_humidity_2m": humidity,
            "dew_point_2m": dew_point
        })

        features = [
            "previous_rain", "relative_humidity_2m", "wind_speed_10m",
            "temperature_2m", "dew_point_2m", "cloud_cover", "surface_pressure"
        ]

        df = pd.DataFrame([api_data])
        X_scaled = scaler.transform(df[features])
        X_tensor = torch.tensor(X_scaled, dtype=torch.float32).unsqueeze(0)

        with torch.no_grad():
            output = model(X_tensor)
            prob = torch.sigmoid(output).item()
            will_rain = int(prob > 0.5)

        latest_data = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "temperature": temperature,
            "humidity": humidity,
            "soil_moisture": soil_percent,
            "cloud_cover": api_data["cloud_cover"],
            "wind_speed": api_data["wind_speed_10m"],
            "surface_pressure": api_data["surface_pressure"],
            "will_rain_model": bool(will_rain),
            "rain_probability": round(prob, 4)
        }

        return {"message": "Données reçues", **latest_data}

    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})

@router.get("/latest_data")
def get_latest_sensor_data():
    if latest_data:
        return latest_data
    else:
        return JSONResponse(status_code=404, content={"message": "Aucune donnée reçue"})

@router.get("/pump_status")
def get_pump_status():
    return {"status": "on" if pump_state["on"] else "off"}

@router.post("/pump_status")
async def set_pump_status(request: Request):
    try:
        payload = await request.json()
        pump_state["on"] = payload.get("on", False)
        return {"message": f"Pompe {'activée' if pump_state['on'] else 'désactivée'}"}
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})
