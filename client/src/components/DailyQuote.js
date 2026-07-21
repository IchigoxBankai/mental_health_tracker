import React, { useEffect, useState } from "react";

const quotes = {
  Happy: [
    "Keep shining! Your positivity is powerful.",
    "Happiness looks good on you. Keep spreading it!",
    "Today is yours — make it amazing!"
  ],
  Sad: [
    "It’s okay to feel sad. Better days are coming.",
    "Storms don’t last forever. Stay strong.",
    "You are stronger than this moment."
  ],
  Stressed: [
    "Take a deep breath. One step at a time.",
    "You’ve handled tough days before. You can do this.",
    "Pause. Breathe. Reset."
  ],
  Neutral: [
    "Every day is a fresh start.",
    "Small progress is still progress.",
    "Stay steady. Stay consistent."
  ]
};

const DailyQuote = ({ latestMood }) => {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const moodQuotes = quotes[latestMood] || quotes["Neutral"];
    
    // Change quote daily using date
    const today = new Date().getDate();
    const index = today % moodQuotes.length;

    setQuote(moodQuotes[index]);
  }, [latestMood]);

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>🌞 Today’s Motivation</h3>
      <p style={styles.quote}>{quote}</p>
    </div>
  );
};

const styles = {
  card: {
    background: "var(--card-bg)",
    padding: "20px",
    borderRadius: "12px",
    marginTop: "20px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
  },
  title: {
    marginBottom: "10px"
  },
  quote: {
    fontStyle: "italic",
    fontSize: "16px"
  }
};

export default DailyQuote;
