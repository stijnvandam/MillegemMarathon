
import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../supabaseClient.js"; // Make sure this import is correct

export default function RunnerPortal() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sharing, setSharing] = useState(false);
  const watchIdRef = useRef(null);

  // Updated: Send data directly to Supabase
  const sendLocation = async (position) => {
    const { error } = await supabase
      .from("runner_positions") // Use your new table name
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        },
      ]);
    if (error) {
      console.error("Error inserting data:", error);
    }
  };

  const startSharing = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      sendLocation,
      (err) => {
        alert("Error getting location. Please allow location access in your browser.");
        console.error(err);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
    watchIdRef.current = watchId;
    setSharing(true);
  };

  const stopSharing = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setSharing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>Runner Portal</h2>
      {!sharing ? (
        <>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            style={{ margin: "0.5rem" }}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            style={{ margin: "0.5rem" }}
          />
          <button
            onClick={startSharing}
            style={{
              padding: "1rem 2rem",
              fontSize: "1.2rem",
              backgroundColor: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "8px",
            }}
            disabled={!firstName || !lastName}
          >
            Start Sharing Location
          </button>
        </>
      ) : (
        <>
          <p>Sharing your location… make sure GPS is enabled.</p>
          <button
            onClick={stopSharing}
            style={{
              padding: "0.8rem 1.5rem",
              fontSize: "1rem",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "8px",
              marginTop: "1rem",
            }}
          >
            Stop Sharing
          </button>
        </>
      )}
    </div>
  );
}
