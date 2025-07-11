import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

const chartOptions = (title) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: title,
      font: { size: 16 },
      color: "#333",
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
    },
  },
});

const ChartsDisplay = ({ labels, temperature, humidity, soilMoisture }) => {
  const tempData = {
    labels,
    datasets: [
      {
        label: "Température (°C)",
        data: temperature,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const humidityData = {
    labels,
    datasets: [
      {
        label: "Humidité de l’air (%)",
        data: humidity,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const soilData = {
    labels,
    datasets: [
      {
        label: "Humidité du sol (%)",
        data: soilMoisture,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
        fill: false,
      },
    ],
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
      <div style={{ height: "300px" }}>
        <Line data={tempData} options={chartOptions("Température (°C)")} />
      </div>
      <div style={{ height: "300px" }}>
        <Line data={humidityData} options={chartOptions("Humidité de l’air (%)")} />
      </div>
      <div style={{ gridColumn: "1 / span 2", height: "300px" }}>
        <Line data={soilData} options={chartOptions("Humidité du sol (%)")} />
      </div>
    </div>
  );
};

export default ChartsDisplay;
