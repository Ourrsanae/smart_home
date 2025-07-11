import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";

const GestionAutoPort = () => {
  const webcamRef = useRef(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const captureAndLogin = async () => {
    setLoading(true);
    setMessage("");
    const imageSrc = webcamRef.current.getScreenshot();
    
    if (!imageSrc) {
      setMessage("⚠️ Impossible de capturer l'image de la webcam.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append("image", blob, "face.jpg");

      const resp = await axios.post("http://localhost:8000/GestionAutoPort", formData);
      console.log("RETOUR whitelist:", resp.data);

      if (resp.data.success) {
        setMessage(`Bienvenue, ${resp.data.username} (score ${resp.data.score.toFixed(2)})`);
      } else {
        setMessage("Accès refusé. " + (resp.data.msg || "Vous n'êtes pas reconnu."));
      }
    } catch (err) {
      setMessage("Erreur lors du whitelist (connexion ou serveur).");
      console.log("ERREUR:", err);
      if (err.response) {
        console.log("RETOUR:", err.response.data);
      }
    } finally { // Correction clé : reset loading dans tous les cas
      setLoading(false);
    }
  }; // Correction: accolade manquante ajoutée ici

  return (
    <div style={{ maxWidth: 600, margin: "auto", textAlign: "center" }}>
      <h2>Login par visage</h2>
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={400}
        height={300}
        style={{ borderRadius: 8, border: "1px solid #ccc", marginBottom: 12 }}
      />
      <br />
      <button
        onClick={captureAndLogin}
        disabled={loading}
        style={{
          padding: "6px 14px",
          borderRadius: 4,
          border: "1px solid #2196F3",
          background: loading ? "#e0e0e0" : "#2196F3",
          color: loading ? "#888" : "#fff",
          cursor: loading ? "wait" : "pointer",
        }}
      >
        {loading ? "Vérification..." : "Ouverture de port"}
      </button>
      <div style={{ marginTop: 18, fontSize: "1.1em", minHeight: 28 }}>
        {message}
      </div>
    </div>
  );
};

export default GestionAutoPort;