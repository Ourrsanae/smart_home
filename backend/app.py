from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
import cv2
import uuid
import requests
import serial
from utils.face_processing import detect_face, get_embedding
from utils.database import insert_user, get_all_users
from utils.similarity import compute_similarity
from utils.logger import log_access_attempt
from config import MONGODB_URI, DB_NAME
import time  

# --- ESP32 et Arduino config ---
ARDUINO_PORT = "COM11"   # '/dev/ttyACM3' sur Linux
BAUD_RATE = 9600

# --- Arduino Serial ---
try:
    arduino = serial.Serial(ARDUINO_PORT, BAUD_RATE, timeout=2)
except Exception as e:
    print("[WARN] Arduino non connecté :", e)
    arduino = None
ESP32_STREAM_URL = "http://192.168.137.168/capture"  # remplace par l'IP réelle de ton ESP32-CAM si elle a changé

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Votre application React
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
THRESHOLD = 0.65

# ----------- ENROLLEMENT via Webcam PC (PC seulement) -----------
@app.post("/enroll")
async def enroll(image: UploadFile = File(...), username: str = Form(...)):
    file_bytes = await image.read()
    nparr = np.frombuffer(file_bytes, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if frame is None:
        return {"success": False, "msg": "Image non valide"}
    img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    face, bbox = detect_face(img_rgb)
    if face is not None:
        embedding = get_embedding(face)
        user_id = str(uuid.uuid4())
        insert_user(user_id, username, embedding.flatten().tolist())
        return {"success": True, "username": username}
    else:
        return {"success": False, "msg": "Aucun visage détecté"}

# ----------- CAPTURE DEPUIS ESP32-CAM -----------
def capture_frame_from_esp32():
    try:
        # First check if we can reach the ESP32
        ping_response = requests.get(ESP32_STREAM_URL.replace('/stream', ''), timeout=2)
        if ping_response.status_code != 200:
            print(f"[ERROR] ESP32 base URL not reachable. Status: {ping_response.status_code}")
            return None

        # Now try to get the stream
        stream_resp = requests.get(ESP32_STREAM_URL, stream=True, timeout=5)
        if stream_resp.status_code != 200:
            print(f"[ERROR] ESP32 stream returned status {stream_resp.status_code}")
            return None

        bytes_buffer = b''
        start_time = time.time()
        
        for chunk in stream_resp.iter_content(chunk_size=1024):
            # Timeout after 5 seconds of trying to read
            if time.time() - start_time > 5:
                print("[WARN] ESP32 stream read timeout")
                return None
                
            bytes_buffer += chunk
            a = bytes_buffer.find(b'\xff\xd8')  # JPEG start
            b = bytes_buffer.find(b'\xff\xd9')  # JPEG end
            if a != -1 and b != -1:
                jpg = bytes_buffer[a:b+2]
                img_np = np.frombuffer(jpg, dtype=np.uint8)
                frame = cv2.imdecode(img_np, cv2.IMREAD_COLOR)
                if frame is not None:
                    return frame
        return None
        
    except requests.exceptions.RequestException as ex:
        print(f"[ERROR] ESP32 Connection failed: {str(ex)}")
        return None
    except Exception as ex:
        print(f"[ERROR] Unexpected error capturing frame: {str(ex)}")
        return None
@app.get("/debug/esp32_status")
async def debug_esp32_status():
    try:
        resp = requests.get(ESP32_STREAM_URL.replace('/stream', ''), timeout=2)
        return {
            "online": resp.status_code == 200,
            "ip_address": ESP32_STREAM_URL,
            "arduino_connected": arduino is not None
        }
    except:
        return {"online": False}
# ----------- VERIFICATION & COMMANDE ARDUINO -----------
@app.post("/check_face_and_open")
async def check_face_and_open():
    frame = capture_frame_from_esp32()
    if frame is None:
        if arduino:
            arduino.write(b'0')
        return {"success": False, "msg": "Impossible de capturer depuis l'ESP32-CAM"}
    img_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    face, bbox = detect_face(img_rgb)
    if face is None:
        if arduino:
            arduino.write(b'0')
        return {"success": False, "msg": "Aucun visage détecté"}
    embedding = get_embedding(face)
    users = get_all_users()
    max_sim = 0
    matched_user = "unknown"
    for user in users:
        sim = compute_similarity(embedding.flatten(), user["embedding"])
        if sim > max_sim:
            max_sim = sim
            matched_user = user["name"]
    status = "granted" if max_sim >= THRESHOLD else "denied"
    log_access_attempt(matched_user, status, max_sim)
    # ENVOI ARDUINO
    if arduino:
        if status == "granted":
            arduino.write(b'1')
            print("Accès accordé : signal '1' envoyé à Arduino")
            time.sleep(1)  #attendre 30 secondes
            arduino.write(b'0')  # désactiver après 30s
            print("1 secondes écoulées : signal '0' envoyé à Arduino")
        else:
            arduino.write(b'0')
            print(" Accès refusé : signal '0' envoyé à Arduino")
    if status == "granted":
        return {
            "success": True,
            "username": matched_user,
            "score": round(max_sim, 4),
            "msg": f"Bienvenue {matched_user} !"
        }
    else:
        return {
            "success": False,
            "username": "unknown",
            "score": round(max_sim, 4),
            "msg": "Accès refusé. Utilisateur non reconnu."
        }


from pymongo import MongoClient

client = MongoClient(MONGODB_URI)
db = client[DB_NAME]

@app.get("/whitelist")
async def get_whitelist():
    users = list(db.authorized_users.find({}, {"_id": 1, "name": 1}))
    for user in users:
        user["_id"] = str(user["_id"])
    return {"users": users}

@app.get("/history")
async def get_history():
    logs = list(db.access_logs.find({}))
    for log in logs:
        log["_id"] = str(log["_id"])
        if "timestamp" in log and hasattr(log["timestamp"], "strftime"):
            log["timestamp"] = log["timestamp"].strftime("%Y-%m-%d %H:%M:%S")
    return {"logs": logs}

from fastapi import HTTPException
@app.delete("/whitelist/{user_id}")
async def delete_user(user_id: str):
    result = db.authorized_users.delete_one({"_id": user_id})
    if result.deleted_count == 1:
        return {"success": True, "message": "Utilisateur supprimé"}
    else:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")


from backend3_router import router as iot_router
app.include_router(iot_router, prefix="/iot")





