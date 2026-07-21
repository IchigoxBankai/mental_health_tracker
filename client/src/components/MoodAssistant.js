import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { auth, db } from "../services/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

/* ================= AI RESPONSE LOGIC ================= */

const adviceMap = {
  Happy: [
    "That's amazing! Keep spreading positivity ✨",
    "Try sharing your happiness with someone today 😊",
    "Celebrate small wins — they matter!",
  ],
  Sad: [
    "It's okay to feel sad sometimes 💙",
    "Try writing your feelings in the journal section",
    "Talking to someone you trust can help",
  ],
  Angry: [
    "Take 5 deep breaths slowly 🌿",
    "Try stepping away from the situation",
    "Physical activity helps release anger",
  ],
  Stressed: [
    "Try a short breathing exercise 🧘",
    "Break tasks into smaller steps",
    "Take a short screen break",
  ],
  Relaxed: [
    "Stay in this calm moment ☀️",
    "Maybe listen to music or meditate",
  ],
  Excited: [
    "Channel your energy into creativity 🚀",
    "Write down your ideas before they disappear",
  ],
};

const MoodAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [latestMood, setLatestMood] = useState(null);

  /* ================= REAL-TIME LISTENER ================= */

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "moods"),
      orderBy("timestamp", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const mood = snap.docs[0].data().emotion;
        setLatestMood(mood);
        generateAIMessage(mood, true);
      }
    });

    return () => unsubscribe();
  }, []);

  /* ================= GENERATE AI MESSAGE ================= */

  const generateAIMessage = (mood, replace = false) => {
    if (!mood) return;

    const responses = adviceMap[mood] || [
      "I'm here to support you 🤝",
    ];

    const randomAdvice =
      responses[Math.floor(Math.random() * responses.length)];

    const newMessages = [
      {
        type: "ai",
        text: `I noticed you're feeling ${mood}.`,
      },
      {
        type: "ai",
        text: randomAdvice,
      },
    ];

    if (replace) {
      setMessages(newMessages);
    } else {
      setMessages((prev) => [...prev, ...newMessages]);
    }
  };

  /* ================= USER ASK BUTTON ================= */

  const askSupport = () => {
    if (!latestMood) return;
    generateAIMessage(latestMood);
  };

  /* ================= UI ================= */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        marginTop: 30,
        padding: 20,
        borderRadius: 18,
        background: "rgba(146, 196, 240, 0.95)",
        backdropFilter: "blur(12px)",
      }}
    >
      <h3>🤖 Aura Assistant</h3>

      {messages.length === 0 && (
        <p className="muted">
          Log a mood to receive personalized support
        </p>
      )}

      {/* CHAT MESSAGES */}
      <div style={{ marginTop: 15 }}>
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: 12,
              marginBottom: 10,
              borderRadius: 12,
              background:
                msg.type === "ai"
                  ? "rgba(107, 139, 197, 0.91)"
                  : "#6366f1",
              color: "white",
            }}
          >
            {msg.text}
          </motion.div>
        ))}
      </div>

      {/* SUPPORT BUTTON */}
      {latestMood && (
        <button
          onClick={askSupport}
          type="button"
          style={{
            marginTop: 10,
            padding: "10px 18px",
            borderRadius: 999,
            border: "none",
            background: "white",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Give me support advice 💬
        </button>
      )}
    </motion.div>
  );
};

export default MoodAssistant;