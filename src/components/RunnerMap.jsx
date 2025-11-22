
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { supabase } from "../supabaseClient.js";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Runner emoji marker
const runnerIcon = new L.DivIcon({
  html: `<div style="
    font-size: 2rem;
    line-height: 2rem;
    text-align: center;
    transform: translate(-50%, -50%);
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    ">
    🏃
  </div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Start and End markers for GPX route
const startIcon = new L.DivIcon({ html: "🏁", className: "", iconSize: [32, 32], iconAnchor: [16, 16] });
const endIcon = new L.DivIcon({ html: "✅", className: "", iconSize: [32, 32], iconAnchor: [16, 16] });

// Component to fit map bounds dynamically
function FitBounds({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 0) {
      map.fitBounds(coords);
    }
  }, [coords, map]);
  return null;
}

export default function RunnerMap() {
  const [runners, setRunners] = useState({});
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  // Load GPX route from public folder
  useEffect(() => {
    fetch("/route.gpx")
      .then((res) => res.text())
      .then((text) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "application/xml");
        const trkpts = xmlDoc.getElementsByTagName("trkpt");
        const coords = [];
        for (let i = 0; i < trkpts.length; i++) {
          const lat = parseFloat(trkpts[i].getAttribute("lat"));
          const lon = parseFloat(trkpts[i].getAttribute("lon"));
          coords.push([lat, lon]);
        }
        setRouteCoordinates(coords);
      });
  }, []);

  useEffect(() => {
    const fetchRunners = async () => {
      const { data, error } = await supabase
        .from("runner_positions")
        .select(`id, first_name, last_name, latitude, longitude, recorded_at`);
      if (error) {
        console.error(error);
      } else {
        const latest = {};
        data.forEach((r) => {
          const key = `${r.first_name} ${r.last_name}`;
          if (!latest[key] || new Date(r.recorded_at) > new Date(latest[key].recorded_at)) {
            latest[key] = r;
          }
        });
        setRunners(latest);
      }
    };
    fetchRunners();

    const channel = supabase.channel("public:runner_positions");
    const upsertRunner = (payload) => {
      setRunners((prev) => {
        const key = `${payload.new.first_name} ${payload.new.last_name}`;
        if (!prev[key] || new Date(payload.new.recorded_at) > new Date(prev[key].recorded_at)) {
          return { ...prev, [key]: payload.new };
        }
        return prev;
      });
    };

    channel.on("postgres_changes", { event: "INSERT", schema: "public", table: "runner_positions" }, upsertRunner);
    channel.on("postgres_changes", { event: "UPDATE", schema: "public", table: "runner_positions" }, upsertRunner);
    channel.on("postgres_changes", { event: "DELETE", schema: "public", table: "runner_positions" }, (payload) => {
      setRunners((prev) => {
        const key = `${payload.old.first_name} ${payload.old.last_name}`;
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    });

    channel.subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <MapContainer center={[51.2020, 4.5700]} zoom={13} style={{ height: "90vh", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Fit map bounds when route is loaded */}
      {routeCoordinates.length > 1 && <FitBounds coords={routeCoordinates} />}

      {/* Show GPX route in blue */}
      {routeCoordinates.length > 1 && (
        <>
          <Polyline positions={routeCoordinates} pathOptions={{ color: "blue", weight: 5 }} />
          <Marker position={routeCoordinates[0]} icon={startIcon} />
          <Marker position={routeCoordinates[routeCoordinates.length - 1]} icon={endIcon} />
        </>
      )}

      {/* Runner markers */}
      {Object.values(runners).map((r) => (
        <Marker key={r.id} position={[r.latitude, r.longitude]} icon={runnerIcon}>
          <Popup>
            <div style={{ textAlign: "center" }}>
              <b style={{ fontSize: "1.1em" }}>{r.first_name} {r.last_name}</b>
              <br />
              <span style={{ color: "#888" }}>
                Last Update: {r.recorded_at ? new Date(r.recorded_at).toLocaleTimeString() : "N/A"}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
