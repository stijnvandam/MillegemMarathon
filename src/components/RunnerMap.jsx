import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { supabase } from "../supabaseClient.js";
import "leaflet/dist/leaflet.css";

export default function RunnerMap() {
  const [runners, setRunners] = useState({});

  useEffect(() => {
    // Initial fetch
    const fetchRunners = async () => {
      const { data, error } = await supabase
        .from("current_positions")
        .select(`
          runner_id,
          latitude,
          longitude,
          recorded_at,
          runners(name, bib, team)
        `);
      if (error) console.error(error);
      else {
        const obj = {};
        data.forEach((r) => (obj[r.runner_id] = r));
        setRunners(obj);
      }
    };
    fetchRunners();

    // Realtime subscription
    const subscription = supabase
      .channel("public:current_positions")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "current_positions" },
        (payload) =>
          setRunners((prev) => ({ ...prev, [payload.new.runner_id]: payload.new }))
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  return (
    <MapContainer
      center={[40.7128, -74.0060]}
      zoom={13}
      style={{ height: "90vh", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {Object.values(runners).map((r) => (
        <Marker key={r.runner_id} position={[r.latitude, r.longitude]}>
          <Popup>
            <b>{r.runners.name}</b> <br />
            Bib: {r.runners.bib} <br />
            Team: {r.runners.team || "N/A"} <br />
            Last Update: {new Date(r.recorded_at).toLocaleTimeString()}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
