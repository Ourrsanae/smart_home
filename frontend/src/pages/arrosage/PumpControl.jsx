// src/components/PumpControl.jsx
import React from 'react';

const PumpControl = ({ pumpStatus, onActivate }) => {
  return (
    <div>
      <h4>🚰 Contrôle de la pompe jl</h4>

      <button
        onClick={onActivate}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          borderRadius: '8px',
          border: '1px solid black',
          backgroundColor: '#f1f1f1',
        }}
      >
        💧 Activer la pompe maintenant JKFEKFHEHFDKHFDHFKDHFDJHKJFHKF 
      </button>
    </div>
  );
};

export default PumpControl;
