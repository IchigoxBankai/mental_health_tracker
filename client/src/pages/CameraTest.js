import React, { useEffect, useRef } from "react";

const CameraTest = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera error:", err);
        alert("Camera access denied or not available");
      }
    };

    startCamera();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        color: "white",
      }}
    >
      <h2>Camera Test</h2>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: "400px",
          height: "300px",
          borderRadius: "12px",
          background: "black",
        }}
      />
    </div>
  );
};

export default CameraTest;
