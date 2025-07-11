// src/pages/Welcome.jsx
import React from "react";
import backgroundImage from '../assets/smarthome.avif';

const Welcome = () => (
  <div
    style={{
      minHeight: "100vh",
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(200, 225, 204, 0.45)",
        zIndex: 1,
      }}
    ></div>
    <div
      style={{
        position: "relative",
        zIndex: 2,
        textAlign: "center",
        color: "var(--green-olive)",
        padding: 36,
        borderRadius: 20,
        background: "rgba(255,255,255,0.65)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        maxWidth: 480,
      }}
    >
      <h1 style={{ fontSize: 40, fontWeight: 800, color: "var(--green-olive)" }}>Bienvenue sur SmartHome AI</h1>
      <p style={{ fontSize: 18 }}>
        Contrôlez, surveillez et optimisez votre maison intelligente avec notre plateforme sécurisée par reconnaissance faciale.
      </p>
      <div style={{ marginTop: 32 }}>
        <a
          href="/enroll"
          style={{
            background: "var(--green-olive)",
            color: "var(--white-soft)",
            borderRadius: 8,
            padding: "12px 36px",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: 20,
            marginRight: 16,
          }}
        >
          S'enrôler
        </a>
        <a
          href="/GestionAutoPort"
          style={{
            background: "var(--green-light)",
            color: "var(--green-olive)",
            borderRadius: 8,
            padding: "12px 36px",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: 20,
          }}
        >
          Ouvrir le port
        </a>
      </div>
    </div>
  </div>
);

export default Welcome;
