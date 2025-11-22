
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { supabase } from "../supabaseClient.js";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Custom emoji marker icon using DivIcon
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
  className: "", // Remove default styles
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

export default function RunnerMap() {
  const [runners, setRunners] = useState({});

  useEffect(() => {
    const fetchRunners = async () => {
      const { data, error } = await supabase
        .from("runner_positions")
        .select(`
          id,
          first_name,
          last_name,
          latitude,
          longitude,
          recorded_at
        `);
      if (error) console.error(error);
      else {
        const obj = {};
        data.forEach((r) => (obj[r.id] = r));
        setRunners(obj);
      }
    };
    fetchRunners();

    const channel = supabase.channel("public:runner_positions");

    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "runner_positions" },
      (payload) =>
        setRunners((prev) => ({
          ...prev,
          [payload.new.id]: payload.new,
        }))
    );
    channel.on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "runner_positions" },
      (payload) =>
        setRunners((prev) => ({
          ...prev,
          [payload.new.id]: payload.new,
        }))
    );
    channel.on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "runner_positions" },
      (payload) => {
        setRunners((prev) => {
          const updated = { ...prev };
          delete updated[payload.old.id];
          return updated;
        });
      }
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <MapContainer
      center={[51.2194, 4.4025]} // Antwerp coordinates
      zoom={13}
      style={{ height: "90vh", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {Object.values(runners).map((r) => (
        <Marker key={r.id} position={[r.latitude, r.longitude]} icon={runnerIcon}>
          <Popup>
            <div style={{ textAlign: "center" }}>
              <b style={{ fontSize: "1.1em" }}>
                {r.first_name} {r.last_name}
              </b>
              <br />
              <span style={{ color: "#888" }}>
                Last Update:{" "}
                {r.recorded_at
                  ? new Date(r.recorded_at).toLocaleTimeString()
                  : "N/A"}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
