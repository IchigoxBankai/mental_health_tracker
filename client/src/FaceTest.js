import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { db, auth } from "./firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const emotionToMood = {
  HAPPY: 5,
  SURPRISED: 4,
  NEUTRAL: 3,
  SAD: 2,
  ANGRY: 1,
  FEARFUL: 2,
  DISGUSTED: 1,
};

function FaceTest() {
  const videoRef = useRef(null);
  const intervalRef = useRef(null);
  const hasSavedRef = useRef(false);

  const [status, setStatus] = useState("Initializing...");
  const [emotion, setEmotion] = useState("");
  const [confidence, setConfidence] = useState(null);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  /* ================= LOAD MODELS ================= */
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";

      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);

      startCamera();
    };

    loadModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= CAMERA ================= */
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;

    videoRef.current.onloadedmetadata = () => {
      videoRef.current.play();
      startDetection();
    };
  };

  /* ================= DETECTION ================= */
  const startDetection = () => {
    setStatus("Detecting...");

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || hasSavedRef.current) return;

      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 224 })
        )
        .withFaceExpressions();

      if (!detection) {
        setStatus("No face detected");
        return;
      }

      const expressions = detection.expressions;
      const [topEmotion, topConfidence] = Object.entries(expressions).reduce(
        (a, b) => (a[1] > b[1] ? a : b)
      );

      const detectedEmotion = topEmotion.toUpperCase();

      if (topConfidence > 0.75) {
        clearInterval(intervalRef.current);

        setEmotion(detectedEmotion);
        setConfidence(Math.round(topConfidence * 100));
        setStatus(`Mood Detected: ${detectedEmotion}`);

        saveMood(detectedEmotion, topConfidence);
      }
    }, 700);
  };

  /* ================= SAVE MOOD ================= */
  const saveMood = async (detectedEmotion, confidenceValue) => {
    if (hasSavedRef.current) return;

    hasSavedRef.current = true;
    setSaving(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in");

      await addDoc(collection(db, "users", user.uid, "moods"), {
        emotion: detectedEmotion,
        mood: emotionToMood[detectedEmotion] ?? 3,
        confidence: Math.round(confidenceValue * 100),
        source: "face-detection",
        timestamp: serverTimestamp(),
      });

      setStatus("Mood saved ✔ Redirecting...");

      setTimeout(() => {
        navigate("/dashboard", {
          replace: true,
          state: {
            mood: detectedEmotion,
            confidence: Math.round(confidenceValue * 100),
          },
        });
      }, 800);
    } catch (err) {
      console.error(err);
      alert("Failed to save mood");
      setSaving(false);
      hasSavedRef.current = false;
    }
  };

  /* ================= UI ================= */
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1f2233",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h2>Face Mood Detection</h2>

      <video
        ref={videoRef}
        width="360"
        height="270"
        autoPlay
        muted
        style={{
          borderRadius: "12px",
          border: "2px solid #6c7ae0",
          marginBottom: "15px",
        }}
      />

      <h3>
        {emotion
          ? `Mood Detected: ${emotion} (${confidence}%)`
          : status}
      </h3>

      {saving && <p>Saving mood...</p>}
    </div>
  );
}

export default FaceTest;
