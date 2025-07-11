import React, { useState } from "react";
import axios from "axios";

const CheckWithESP32 = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
  setLoading(true);
  setMessage("");
  try {
    const resp = await axios.post("http://localhost:8000/check_face_and_open");
    if (resp.data.success) {
      setMessage(`Bienvenue, ${resp.data.username} (score ${resp.data.score})`);
    } else {
      // Handle different error types specifically
      if (resp.data.error_type === "camera_unavailable") {
        setMessage(" Caméra ESP32 non connectée");
      } else {
        setMessage( resp.data.msg);
      }
    }
  } catch (err) {
    if (err.response) {
      // The request was made and the server responded with a status code
      if (err.response.status === 503) {
        setMessage("Serveur ESP32 indisponible");
      } else {
        setMessage("Erreur serveur: " + err.response.data.detail);
      }
    } else if (err.request) {
      // The request was made but no response was received
      setMessage("Pas de réponse du serveur FastAPI");
    } else {
      // Something happened in setting up the request
      setMessage("Erreur de configuration");
    }
  }
  setLoading(false);
};

  return (
    <div style={{textAlign: "center"}}>
      <h3>Authentification par ESP32-CAM</h3>
      <button
        onClick={handleCheck}
        disabled={loading}
        style={{ padding: 16, fontSize: 22, borderRadius: 8, background: "#28c", color: "#fff", marginTop: 20 }}
      >
        {loading ? "Vérification..." : "Scanner visage (ESP32-CAM)"}
      </button>
      <div style={{marginTop: 24, fontSize: 18, minHeight: 30}}>{message}</div>
    </div>
  );
};

export default CheckWithESP32;
