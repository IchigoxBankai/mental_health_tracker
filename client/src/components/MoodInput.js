import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { auth, db } from "../services/firebaseConfig";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

/* ================= MOODS ================= */

const moods = [
  { name: "Happy", emoji: "😊", moodValue: 5, color: "#facc15" },
  { name: "Sad", emoji: "😢", moodValue: 2, color: "#60a5fa" },
  { name: "Angry", emoji: "😠", moodValue: 1, color: "#f87171" },
  { name: "Stressed", emoji: "😫", moodValue: 2, color: "#fb923c" },
  { name: "Relaxed", emoji: "😌", moodValue: 4, color: "#34d399" },
  { name: "Excited", emoji: "🤩", moodValue: 5, color: "#c084fc" },
];

const suggestions = {
  Happy: "That's wonderful! Keep spreading positivity ✨",
  Sad: "It's okay to feel sad. Try journaling or talking to someone 💙",
  Angry: "Take a deep breath. A short walk might help 🌿",
  Stressed: "Try relaxation or breathing exercises 🧘",
  Relaxed: "Stay calm and enjoy the moment ☀️",
  Excited: "Amazing energy! Channel it into something creative 🚀",
};

const MoodInput = () => {
  const [user, setUser] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [intensity, setIntensity] = useState(50);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [smartAlert, setSmartAlert] = useState("");

  /* ================= AUTH LISTENER ================= */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadStreak(currentUser);
      }
    });

    return () => unsubscribe();
  }, []);

  /* ================= LOAD STREAK ================= */

  const loadStreak = async (currentUser) => {
    const ref = doc(db, "users", currentUser.uid, "stats", "streak");
    const snap = await getDoc(ref);

    if (snap.exists()) {
      setStreak(snap.data().count || 0);
    }
  };

  /* ================= UPDATE STREAK ================= */

  const updateStreak = async () => {
    if (!user) return;

    const ref = doc(db, "users", user.uid, "stats", "streak");
    const snap = await getDoc(ref);

    const today = new Date().toDateString();
    let newStreak = 1;

    if (snap.exists()) {
      const lastDate = snap.data().lastDate;
      const lastCount = snap.data().count || 0;

      if (lastDate === today) {
        newStreak = lastCount;
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastDate === yesterday.toDateString()) {
          newStreak = lastCount + 1;
        }
      }
    }

    await setDoc(ref, {
      count: newStreak,
      lastDate: today,
    });

    setStreak(newStreak);
  };

  /* ================= SMART ALERT ================= */

  const checkSmartAlerts = async () => {
    if (!user) return;

    const moodQuery = query(
      collection(db, "users", user.uid, "moods"),
      orderBy("timestamp", "desc"),
      limit(5)
    );

    const snapshot = await getDocs(moodQuery);

    let lowMoodCount = 0;

    snapshot.forEach((doc) => {
      const mood = doc.data().mood;
      if (mood <= 2) lowMoodCount++;
    });

    if (lowMoodCount >= 3) {
      setSmartAlert(
        "⚠️ You've logged multiple low moods recently. Consider talking to someone 💙"
      );
    } else {
      setSmartAlert("");
    }
  };

  /* ================= SAVE MOOD ================= */

  const saveMood = async () => {
    if (!selectedMood) return;

    if (!user) {
      setStatus("User not authenticated ❌");
      return;
    }

    try {
      setSaving(true);
      setStatus("Saving mood...");

      await addDoc(collection(db, "users", user.uid, "moods"), {
        mood: selectedMood.moodValue,
        emotion: selectedMood.name,
        intensity: Number(intensity),
        note,
        source: "manual",
        timestamp: serverTimestamp(),
      });

      await updateStreak();
      await checkSmartAlerts();

      setShowConfetti(true);
      setStatus("Mood saved successfully ✔");

      setTimeout(() => setShowConfetti(false), 2500);

      setTimeout(() => {
        setSelectedMood(null);
        setNote("");
        setIntensity(50);
        setSaving(false);
        setStatus("");
      }, 1500);
    } catch (err) {
      console.error("Error saving mood:", err);
      setStatus("Failed to save mood ❌");
      setSaving(false);
    }
  };

  /* ================= UI ================= */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        width: "100%",
        padding: "10px 0",
        background: "transparent",
      }}
    >
      {showConfetti && <Confetti />}

      <div
        style={{
          width: "100%",
          maxWidth: 700,
          margin: "0 auto",
          background: "var(--card-bg)",
          border: "var(--card-border)",
          backdropFilter: "blur(18px)",
          borderRadius: 24,
          padding: 28,
          boxShadow: "var(--card-shadow)",
          color: "var(--text-color)",
        }}
      >
        <h2 style={{ textAlign: "center" }}>
          How are you feeling today?
        </h2>

        <p style={{ textAlign: "center" }}>
          🔥 Mood Streak: {streak} days
        </p>

        {smartAlert && (
          <div
            style={{
              marginTop: 15,
              padding: 15,
              background: "rgba(255,0,0,0.25)",
              borderRadius: 12,
              textAlign: "center",
            }}
          >
            {smartAlert}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 20,
            marginTop: 30,
          }}
        >
          {moods.map((mood) => (
            <motion.div
              key={mood.name}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMood(mood)}
              style={{
                width: 110,
                height: 110,
                borderRadius: 16,
                cursor: "pointer",
                background:
                  selectedMood?.name === mood.name
                    ? `linear-gradient(135deg, var(--accent) 0%, var(--accent-glow) 100%)`
                    : "rgba(255,255,255,0.06)",
                border: selectedMood?.name === mood.name ? "none" : "var(--card-border)",
                color: selectedMood?.name === mood.name ? "white" : "var(--text-color)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                boxShadow: selectedMood?.name === mood.name ? "0 8px 25px rgba(165, 94, 234, 0.4)" : "var(--card-shadow)",
              }}
            >
              <span style={{ fontSize: 36 }}>{mood.emoji}</span>
              {mood.name}
            </motion.div>
          ))}
        </div>

        {selectedMood && (
          <>
            <div style={{ marginTop: 30 }}>
              <h4>Intensity: {intensity}%</h4>
              <input
                type="range"
                min="0"
                max="100"
                value={intensity}
                onChange={(e) =>
                  setIntensity(Number(e.target.value))
                }
                style={{ width: "100%" }}
              />
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write your thoughts..."
              style={{
                width: "100%",
                height: 90,
                borderRadius: 12,
                border: "var(--input-border)",
                background: "var(--input-bg)",
                color: "var(--text-color)",
                padding: 12,
                marginTop: 20,
                outline: "none",
              }}
            />

            <div
              style={{
                marginTop: 20,
                padding: 14,
                background: "rgba(165, 94, 234, 0.12)",
                border: "1px dashed var(--accent)",
                color: "var(--text-color)",
                borderRadius: 12,
              }}
            >
              {suggestions[selectedMood.name]}
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={saveMood}
              disabled={saving}
              style={{
                marginTop: 25,
                width: "100%",
                padding: 14,
                borderRadius: 999,
                border: "none",
                fontWeight: "bold",
                background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-glow) 100%)",
                color: "white",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(165, 94, 234, 0.25)",
              }}
            >
              {saving ? "Saving..." : "Save Mood"}
            </motion.button>
          </>
        )}

        {status && (
          <p style={{ textAlign: "center", marginTop: 15 }}>
            {status}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default MoodInput;