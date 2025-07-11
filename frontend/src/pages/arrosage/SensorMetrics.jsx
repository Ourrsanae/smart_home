import React from 'react';
import './SensorMetrics.css'; // on va styliser proprement

const SensorMetrics = ({ data }) => {
  const { temperature, humidity, soil_moisture, rain_probability, will_rain_model } = data;

  const metrics = [
    {
      icon: 'fas fa-temperature-high',
      label: 'Température',
      value: `${temperature} °C`,
      color: '#ff6b6b',
      bg: '#ffecec',
    },
    {
      icon: 'fas fa-tint',
      label: "Humidité de l'air",
      value: `${humidity} %`,
      color: '#36a2eb',
      bg: '#e6f3fb',
    },
    {
      icon: 'fas fa-seedling',
      label: 'Humidité du sol',
      value: `${soil_moisture} %`,
      color: '#38c172',
      bg: '#e2f7ea',
    },
    {
      icon: 'fas fa-cloud-rain',
      label: 'Pluie prévue ?',
      value: `${will_rain_model ? "Oui" : "Non"} (${Math.round(rain_probability * 100)} %)`,
      color: '#6f42c1',
      bg: '#f3e8ff',
    }
  ];

  return (
    <div>
      <h4 className="mb-4">
        <i className="fas fa-microchip me-2 text-primary"></i>
        Données instantanées
      </h4>

      <div className="sensor-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="sensor-card" style={{ backgroundColor: metric.bg }}>
            <i className={`${metric.icon} sensor-icon`} style={{ color: metric.color }}></i>
            <div className="sensor-info">
              <div className="sensor-label">{metric.label}</div>
              <div className="sensor-value">{metric.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SensorMetrics;
