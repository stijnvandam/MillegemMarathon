
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { supabase } from "../supabaseClient.js";
import "leaflet/dist/leaflet.css";

export default function RunnerMap() {
  const [runners, setRunners] = useState({});

  useEffect(() => {
    // Fetch all runners initially
    const fetchRunners = async () => {
      const { data, error } = await supabase
        .from("runner_positions")
        .select(`
          id,
          first_name,
          last_name,
          latitude,
          longitude,
          accuracy,
          recorded_at
        `);
      if (error) {
        console.error(error);
      } else {
        const obj = {};
        data.forEach((r) => (obj[r.id] = r));
        setRunners(obj);
      }
    };
    fetchRunners();

    // Set up Realtime subscription for INSERT, UPDATE, DELETE
    const channel = supabase.channel("public:runner_positions");

    // INSERT event
    channel.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "runner_positions" },
      (payload) =>
        setRunners((prev) => ({
          ...prev,
          [payload.new.id]: payload.new,
        }))
    );

    // UPDATE event
    channel.on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "runner_positions" },
      (payload) =>
        setRunners((prev) => ({
          ...prev,
          [payload.new.id]: payload.new,
        }))
    );

    // DELETE event
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

    // Cleanup on unmount
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
