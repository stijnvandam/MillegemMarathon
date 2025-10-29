import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RunnerPortal from "./components/RunnerPortal.jsx";
import RunnerMap from "./components/RunnerMap.jsx";

function App() {
  return (
    <Router>
      <div style={{ textAlign: "center" }}>
        <h1>Runner Live Tracker Portal</h1>
        <Routes>
          <Route
            path="/runner"
            element={<RunnerPortal bib="001" ingestSecret="ingest-runner-position" />}
          />
          <Route path="/map" element={<RunnerMap />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
