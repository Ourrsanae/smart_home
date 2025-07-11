import React, { useEffect, useState } from "react";
import SensorMetrics from "./SensorMetrics";
import IrrigationRecommendation from "./IrrigationRecommendation";
import LastUpdate from "./LastUpdate";
import Notifications from "./Notifications";
import ArrosageButton from "./ArrosageButton";
import ChartsDisplay from "./ChartsDisplay";
import { MDBContainer, MDBRow, MDBCol } from "mdb-react-ui-kit";
import axios from "axios";

const Dashboard = () => {
  const [history, setHistory] = useState([]);
  const [latest, setLatest] = useState(null);
  const [pumpStatus, setPumpStatus] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/iot/latest_data");
        setLatest(res.data);
        setHistory((prev) => [...prev.slice(-9), res.data]);
      } catch (err) {
        console.error("Erreur données capteurs :", err.message);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchPump = async () => {
      try {
        const res = await axios.get("http://localhost:5000/iot/pump_status");
        setPumpStatus(res.data.active);
      } catch (err) {
        console.error("Erreur pompe :", err.message);
      }
    };
    fetchPump();
  }, []);

  useEffect(() => {
    if (!latest) return;
    const alertes = [];
    if (latest.soil_moisture < 30) alertes.push("Humidité du sol très faible !");
    if (latest.rain_probability > 0.7) alertes.push(" Forte probabilité de pluie !");
    setNotifications(alertes);
  }, [latest]);

  const handlePumpActivate = async () => {
    try {
      const res = await axios.post("http://localhost:5000/iot/activate_pump");
      if (res.data.success) {
        setPumpStatus(true);
        alert("Pompe activée !");
      }
    } catch (err) {
      console.error("Erreur activation pompe :", err.message);
    }
  };

  if (!latest) return <div className="text-center mt-5">Chargement...</div>;

  return (
    <>
      <MDBContainer className="mt-4 text-center">
        <h2 className="mb-4">
          <strong>SmartHome AI - Tableau de bord</strong>
        </h2>

        <SensorMetrics data={latest} />

        <h4 className="my-4">
          <i className="fas fa-chart-line me-2"></i>Évolution des capteurs
        </h4>

        <ChartsDisplay
          labels={history.map((d) => new Date(d.timestamp).toLocaleTimeString())}
          temperature={history.map((d) => d.temperature)}
          humidity={history.map((d) => d.humidity)}
          soilMoisture={history.map((d) => d.soil_moisture)}
        />

        <MDBRow className="my-4">
          <MDBCol md="6">
            <IrrigationRecommendation data={latest} />
          </MDBCol>
          <MDBCol md="6">
            <ArrosageButton onActivate={handlePumpActivate} />
          </MDBCol>
        </MDBRow>

        <Notifications items={notifications} />
        <LastUpdate timestamp={latest.timestamp} />
      </MDBContainer>
    </>
  );
};

export default Dashboard;
