
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { supabase } from "../supabaseClient.js";
import "leaflet/dist/leaflet.css";

export default function RunnerMap() {
  const [runners, setRunners] = useState({});

  useEffect(() => {
    const fetchRunners = async () => {
      const { data, error } = await supabase
        .from("runner_positions") // updated table name
        .select(`
          id,
          first_name,
          last_name,
          latitude,
          longitude,
          accuracy,
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

    // Optional: subscribe to changes if you want live updates (requires Supabase Realtime enabled)
    // Remove or update this if you don't have Realtime enabled for runner_positions
    const subscription = supabase
      .channel("public:runner_positions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "runner_positions" },
        (payload) =>
          setRunners((prev) => ({
            ...prev,
            [payload.new.id]: payload.new,
          }))
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  return (
    <MapContainer
      center={[51.2194, 4.4025]} // Antwerp coordinates
      zoom={13}
      style={{ height: "90vh", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {Object.values(runners).map((r) => (
        <Marker key={r.id} position={[r.latitude, r.longitude]}>
          <Popup>
            <b>
              {r.first_name} {r.last_name}
            </b>
            <br />
            Accuracy: {r.accuracy ?? "N/A"}
            <br />
            Last Update:{" "}
            {r.recorded_at
              ? new Date(r.recorded_at).toLocaleTimeString()
              : "N/A"}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
