import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";

// --- Composant principal de gestion de la whitelist ---
const WhitelistManager = () => {
  const webcamRef = useRef(null);
  const [whitelist, setWhitelist] = useState([]);
  const [history, setHistory] = useState([]);
  const [showEnroll, setShowEnroll] = useState(false);
  const [username, setUsername] = useState("");
  const [enrollMsg, setEnrollMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Charger la whitelist et l'historique à l'ouverture
  useEffect(() => {
    fetchWhitelist();
    fetchHistory();
  }, []);

  // Charger les users whitelist
  const fetchWhitelist = async () => {
    try {
      const resp = await axios.get("http://localhost:8000/whitelist");
      setWhitelist(resp.data.users);
    } catch (err) {
      setWhitelist([]);
    }
  };

  // Charger l'historique global
  const fetchHistory = async () => {
    try {
      const resp = await axios.get("http://localhost:8000/history");
      setHistory(resp.data.logs);
    } catch (err) {
      setHistory([]);
    }
  };

  // Ajouter une personne (afficher la webcam + champ nom)
  const handleShowEnroll = () => {
    setShowEnroll(true);
    setEnrollMsg("");
    setUsername("");
  };

  const handleEnroll = async () => {
    setLoading(true);
    setEnrollMsg("");
    if (!username.trim()) {
      setEnrollMsg("Nom obligatoire.");
      setLoading(false);
      return;
    }
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setEnrollMsg("Capture webcam impossible.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append("image", blob, "face.jpg");
      formData.append("username", username);

      const resp = await axios.post("http://localhost:8000/enroll", formData);
      if (resp.data.success) {
        setEnrollMsg("Utilisateur enrôlé : " + resp.data.username);
        setShowEnroll(false);
        fetchWhitelist(); // recharge la liste
      } else {
        setEnrollMsg( (resp.data.msg || "Erreur lors de l'enrôlement."));
      }
    } catch (err) {
      setEnrollMsg("Erreur lors de l'enrôlement (connexion ou serveur)");
    }
    setLoading(false);
  };

  // Supprimer un user de la whitelist (tu peux l'adapter à ton backend)
  const handleDelete = async (userId) => {
    if (!window.confirm("Confirmer la suppression ?")) return;
    await axios.delete(`http://localhost:8000/whitelist/${userId}`);
    fetchWhitelist();
  };

  // Afficher l'historique pour un user
  const showUserHistory = (userName) => {
    const userLogs = history.filter((log) => log.user === userName);
    alert(
      userLogs.length
        ? userLogs.map((log) => `> ${log.timestamp} - ${log.status} (${log.similarity?.toFixed(2) ?? ""})`).join("\n")
        : "Aucun historique pour cet utilisateur."
    );
  };

  return (
    <div style={{ maxWidth: 850, margin: "auto", padding: 16, background: "#fff", borderRadius: 12 }}>
      <h2>Gestion de la Whitelist</h2>

      {/* Liste des users */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {whitelist.map((user) => (
          <div key={user._id} style={{
            display: "flex", alignItems: "center", background: "#f9f9f9",
            borderRadius: 8, boxShadow: "0 1px 3px #eee", padding: 8
          }}>
            <span style={{ marginRight: 12, fontSize: 22 }}>👤</span>
            <b style={{ flex: 1 }}>{user.name || "(Sans nom)"}</b>
            <button onClick={() => showUserHistory(user.name)} title="Historique" style={{ marginRight: 8 }}>📋</button>
            {/* Bouton "Supprimer" */}
            <button onClick={() => handleDelete(user._id)} style={{ color: "red", marginLeft: 8 }} title="Supprimer">❌</button>
          </div>
        ))}
      </div>

      {/* Bouton pour ajouter une personne */}
      {!showEnroll && (
        <div style={{ margin: "28px 0 0 0" }}>
          <button onClick={handleShowEnroll} style={{
            fontSize: 32, padding: "10px 24px", borderRadius: "50%", border: "2px solid #2196F3", color: "#2196F3", background: "#fff"
          }}>
            +
          </button>
          <span style={{ marginLeft: 10 }}>Ajouter une personne à la whitelist</span>
        </div>
      )}

      {/* Bloc webcam et formulaire nom */}
      {showEnroll && (
        <div style={{ margin: "22px auto 0 auto", width: 450, background: "#f5f6fb", borderRadius: 12, padding: 18 }}>
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={320}
            height={240}
            style={{ borderRadius: 8, border: "1px solid #aaa" }}
          /><br />
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ margin: "18px 0 8px 0", padding: 6, minWidth: 180, borderRadius: 4, border: "1px solid #ccc" }}
          />
          <button onClick={handleEnroll} disabled={loading}
            style={{ padding: "6px 18px", marginLeft: 14, borderRadius: 4, background: "#2196F3", color: "#fff", border: "none" }}>
            {loading ? "Ajout..." : "Ajouter"}
          </button>
          <div style={{ marginTop: 10 }}>{enrollMsg}</div>
        </div>
      )}

      {/* Historique global (résumé en dessous) */}
      <h3 style={{ marginTop: 32 }}>Historique global</h3>
      <div style={{
        background: "#f7f7fa", borderRadius: 8, padding: 14, maxHeight: 220, overflowY: "auto", fontSize: 14
      }}>
        {history.length === 0 && <div>Aucun accès enregistré.</div>}
        {history.slice(0, 30).map((log, idx) => (
          <div key={idx}>
            <b>{log.timestamp}</b> : {log.user} — {log.status} {log.similarity !== undefined ? ` (score: ${log.similarity.toFixed(2)})` : ""}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhitelistManager;
