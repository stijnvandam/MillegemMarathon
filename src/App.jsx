import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import RunnerPortal from "./components/RunnerPortal.jsx";
import RunnerMap from "./components/RunnerMap.jsx";

function App() {
  return (
    <Router>
      <div style={{ textAlign: "center" }}>
        <h1>Runner Live Tracker Portal</h1>
        {/* Navigation Links */}
        <nav style={{ marginBottom: "2rem" }}>
          <Link to="/map" style={{ margin: "0 1rem" }}>Map</Link>
          <Link to="/runner" style={{ margin: "0 1rem" }}>Runner Portal</Link>
        </nav>
        <Routes>
          {/* Default route shows the map */}
          <Route path="/" element={<RunnerMap />} />
          <Route path="/map" element={<RunnerMap />} />
          <Route
            path="/runner"
            element={<RunnerPortal bib="001" ingestSecret="ingest-runner-position" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;