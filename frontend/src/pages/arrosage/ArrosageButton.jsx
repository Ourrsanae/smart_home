import React, { useState, useEffect } from 'react';
import { MDBBtn, MDBIcon, MDBCardText } from 'mdb-react-ui-kit';
import axios from 'axios';

const ArrosageButton = () => {
  const [arrosageActif, setArrosageActif] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get("http://localhost:5000/iot/pump_status");
        setArrosageActif(res.data.status === "on");
      } catch (err) {
        console.error("Erreur statut pompe :", err.message);
      }
    };

    fetchStatus();
  }, []);

  const toggleArrosage = async () => {
    try {
      const newStatus = !arrosageActif;
      const res = await axios.post("http://localhost:5000/iot/pump_status", {
        on: newStatus
      });

      setArrosageActif(newStatus);
      setMessage(res.data.message || (newStatus ? "Pompe activée " : "Pompe arrêtée "));
    } catch (err) {
      console.error(err.message);
      setMessage(" Erreur réseau");
    } finally {
      setTimeout(() => setMessage(''), 4000);
    }
  };

  return (
    <div className="mt-4">
      <MDBCardText>
        <strong>Pompe d’arrosage :</strong>{" "}
        <span className={arrosageActif ? "text-success" : "text-danger"}>
          {arrosageActif ? "Activée " : "Désactivée "}
        </span>
      </MDBCardText>
      <MDBBtn
        color={arrosageActif ? "danger" : "success"}
        onClick={toggleArrosage}
      >
        <MDBIcon fas icon="power-off" className="me-2" />
        {arrosageActif ? "Arrêter l’arrosage" : "Lancer l’arrosage"}
      </MDBBtn>
      {message && <p className="mt-2 text-info">{message}</p>}
    </div>
  );
};

export default ArrosageButton;

