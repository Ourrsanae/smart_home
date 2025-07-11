// src/components/GlobalHistory.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const GlobalHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const resp = await axios.get("http://localhost:8000/history");
      setHistory(resp.data.logs);
    } catch {
      setHistory([]);
    }
  };

  return (
    <div style={{
      background: "#f7f7fa", borderRadius: 8, padding: 14, maxWidth: 480, margin: "auto", fontSize: 14
    }}>
      <h3 style={{ fontWeight: 600, color: "#4a6b57" }}>Historique global</h3>
      {history.length === 0 && <div>Aucun accès enregistré.</div>}
      {history.slice(0, 20).map((log, idx) => (
        <div key={idx} style={{ padding: "2px 0" }}>
          <b>{log.timestamp}</b> : {log.user} — {log.status} 
          {log.similarity !== undefined ? ` (score: ${log.similarity.toFixed(2)})` : ""}
        </div>
      ))}
    </div>
  );
};

export default GlobalHistory;
