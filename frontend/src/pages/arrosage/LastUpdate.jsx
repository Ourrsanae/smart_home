// src/components/LastUpdate.jsx
import React, { useEffect, useState } from 'react';

const LastUpdate = ({ timestamp }) => {
  const [location, setLocation] = useState("Localisation inconnue");

  useEffect(() => {
    const fetchLocation = async (lat, lon) => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
        const data = await response.json();
        setLocation(data.address.city || data.address.town || data.address.village || "Position détectée");
      } catch (err) {
        console.error("Erreur localisation :", err);
        setLocation("Erreur de localisation");
      }
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchLocation(latitude, longitude);
      },
      (err) => {
        console.error("Géolocalisation refusée :", err);
        setLocation("Permission refusée");
      }
    );
  }, []);

  return (
    <div>
      <h3> Dernière mise à jour : <code>{timestamp}</code></h3>
      <p>📍 <strong>Localisation :</strong> {location}</p>
    </div>
  );
};

export default LastUpdate;
