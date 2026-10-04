import React, { useEffect, useState } from "react";
import "./DailyQuote.css";

const quotes = {
  Happy: [
    "Keep shining! Your positivity is powerful.",
    "Happiness looks good on you. Keep spreading it!",
    "Today is yours — make it amazing!",
  ],
  Sad: [
    "It’s okay to feel sad. Better days are coming.",
    "Storms don’t last forever. Stay strong.",
    "You are stronger than this moment.",
  ],
  Stressed: [
    "Take a deep breath. One step at a time.",
    "You’ve handled tough days before. You can do this.",
    "Pause. Breathe. Reset.",
  ],
  Neutral: [
    "Every day is a fresh start.",
    "Small progress is still progress.",
    "Stay steady. Stay consistent.",
  ],
};

const DailyQuote = ({ latestMood }) => {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const moodQuotes = quotes[latestMood] || quotes["Neutral"];
    const today = new Date().getDate();
    const index = today % moodQuotes.length;
    setQuote(moodQuotes[index]);
  }, [latestMood]);

  return (
    <div className="daily-quote-card">
      <div className="daily-quote-header">
        <h3>✨ Daily Affirmation</h3>
        <span className="daily-quote-tag">Inspiration</span>
      </div>
      <p className="daily-quote-text">"{quote}"</p>
    </div>
  );
};

export default DailyQuote;
