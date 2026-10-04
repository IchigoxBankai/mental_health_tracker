import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "@vladmandic/face-api";
import { db, auth } from "../services/firebaseConfig";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const emotionToMood = {
  HAPPY: 5,
  SURPRISED: 4,
  NEUTRAL: 3,
  SAD: 2,
  ANGRY: 1,
  FEARFUL: 2,
  DISGUSTED: 1,
};

const FaceMoodDetector = () => {
  const videoRef = useRef(null);
  const intervalRef = useRef(null);
  const streamRef = useRef(null);

  const [status, setStatus] = useState("Loading models...");
  const [emotion, setEmotion] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [saved, setSaved] = useState(false);

  /* ================= LOAD MODELS ================= */
  useEffect(() => {
    loadModels();

    return () => {
      stopCamera();
      clearInterval(intervalRef.current);
    };
  }, []);

  const loadModels = async () => {
    try {
      const MODEL_URL = "/models";

      setStatus("Loading models...");

      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);

      setStatus("Starting camera...");
      startCamera();
    } catch (error) {
      console.error(error);
      setStatus("Error loading models");
    }
  };

  /* ================= START CAMERA ================= */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        startDetection();
      };
    } catch (error) {
      console.error(error);
      setStatus("Camera permission denied");
    }
  };

  /* ================= STOP CAMERA ================= */
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  /* ================= START DETECTION ================= */
  const startDetection = () => {
    setStatus("Scanning face...");

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || saved) return;

      try {
        const detection = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 416,
              scoreThreshold: 0.5,
            })
          )
          .withFaceExpressions();

        if (!detection) return;

        const topEmotion = Object.entries(detection.expressions).reduce(
          (a, b) => (a[1] > b[1] ? a : b)
        );

        const emo = topEmotion[0].toUpperCase();
        const conf = Math.round(topEmotion[1] * 100);

        if (conf > 70) {
          clearInterval(intervalRef.current);

          setEmotion(emo);
          setConfidence(conf);
          setStatus("Mood detected");

          await saveMood(emo, conf);
        }
      } catch (error) {
        console.error(error);
      }
    }, 800);
  };

  /* ================= SAVE MOOD ================= */
  const saveMood = async (emo, conf) => {
    if (saved) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      await addDoc(collection(db, "users", user.uid, "moods"), {
        mood: emotionToMood[emo],
        emotion: emo,
        source: "face",
        confidence: conf,
        timestamp: serverTimestamp(),
      });

      setSaved(true);
      setStatus("Mood saved ✔");

      // Stop camera after saving
      stopCamera();
    } catch (error) {
      console.error(error);
      setStatus("Error saving mood");
    }
  };

  /* ================= RESCAN BUTTON ================= */
  const rescanMood = () => {
    setEmotion(null);
    setConfidence(null);
    setSaved(false);
    setStatus("Restarting camera...");

    startCamera();
  };

  /* ================= UI ================= */
  return (
    <div style={{ textAlign: "center" }}>
      <video
        ref={videoRef}
        width="320"
        height="240"
        muted
        style={{ borderRadius: "12px" }}
      />

      <h3>{status}</h3>

      {emotion && <p>Your Mood: {emotion}</p>}
      {confidence && <p>Confidence: {confidence}%</p>}

      {saved && (
        <button
          onClick={rescanMood}
          style={{
            marginTop: "10px",
            padding: "8px 15px",
            borderRadius: "8px",
            border: "none",
            background: "#431B63",
            color: "white",
            cursor: "pointer"
          }}
        >
          Scan Again
        </button>
      )}
    </div>
  );
};

export default FaceMoodDetector;
