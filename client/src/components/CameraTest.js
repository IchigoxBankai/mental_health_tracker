import React, { useEffect, useRef } from "react";

const CameraTest = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        alert("Camera error: " + err.message);
      }
    };

    startCamera();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f1220",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: "420px",
          height: "320px",
          borderRadius: "14px",
          border: "2px solid #9f7aea",
          background: "#000",
        }}
      />
    </div>
  );
};

export default CameraTest;
