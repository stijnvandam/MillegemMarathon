import React, { useState, useEffect, useRef } from "react";

export default function RunnerPortal({ bib }) {
  const ingestSecret = "ingest-runner-position";
  const [sharing, setSharing] = useState(false);
  const watchIdRef = useRef(null);

  const sendLocation = async (position) => {
    try {
      await fetch(
        "https://uevrynlpqflpdbuezfep.supabase.co/functions/v1/ingest-runner-position",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ingestSecret}`,
          },
          body: JSON.stringify({
            bib,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            source: "phone",
          }),
        }
      );
      console.log("Location sent:", position.coords);
    } catch (err) {
      console.error("Error sending location:", err);
    }
  };

  const startSharing = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    // Start watching position with high accuracy
    const watchId = navigator.geolocation.watchPosition(
      sendLocation,
      (err) => {
        alert(
          "Error getting location. Please allow location access in your browser."
        );
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h2>Runner {bib}</h2>
      {!sharing ? (
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
        >
          Start Sharing Location
        </button>
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
