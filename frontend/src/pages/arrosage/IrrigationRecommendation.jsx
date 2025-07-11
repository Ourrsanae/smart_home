// src/components/IrrigationRecommendation.jsx
import React from 'react';

const IrrigationRecommendation = ({ data }) => {
  const { will_rain_model, soil_moisture } = data;

  return (
    <div>
      <h4>💧 Recommandation d’arrosage</h4>
      {will_rain_model ? (
        <div style={{ backgroundColor: '#ffeeba', padding: '1rem', borderRadius: '8px' }}>
          🌧️ Pluie prévue → Pas besoin d’arrosage
        </div>
      ) : soil_moisture < 30 ? (
        <div style={{ backgroundColor: '#f8d7da', padding: '1rem', borderRadius: '8px' }}>
          🔴 Sol très sec → Arrosage <strong>nécessaire</strong>
        </div>
      ) : soil_moisture < 60 ? (
        <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px' }}>
          🟡 Sol modérément sec → Arrosage <strong>modéré recommandé</strong>
        </div>
      ) : (
        <div style={{ backgroundColor: '#d4edda', padding: '1rem', borderRadius: '8px' }}>
          🟢 Sol bien hydraté → Aucun arrosage requis
        </div>
      )}
    </div>
  );
};

export default IrrigationRecommendation;
