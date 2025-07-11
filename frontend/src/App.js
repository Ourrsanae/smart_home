import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Enroll from "./pages/Enroll";
import CheckWithESP32 from "./pages/CheckWithESP32";

import Navbar from "./components/navbar"; // Mets le bon chemin si besoin
import Home from "./pages/Home";
import GlobalHistory from "./pages/GlobalHistory";
import Dashboard from "./pages/arrosage/Dashboard";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/enroll" element={<Enroll />} />
        <Route path="/check" element={<CheckWithESP32 />} />
        <Route path="/history" element={<GlobalHistory />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
