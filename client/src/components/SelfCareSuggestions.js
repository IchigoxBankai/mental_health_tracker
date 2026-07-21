import React, { useEffect, useState } from "react";
import "./SelfCareSuggestions.css";

const suggestionMap = {
  Happy: [
    "🙏 Write gratitude journal",
    "📸 Capture this moment",
    "💬 Share positivity with someone",
  ],
  Relaxed: [
    "📖 Read a book",
    "🌅 Enjoy nature",
    "🧠 Reflect on your day",
  ],
  Neutral: [
    "🎵 Listen to music",
    "🚶 Take a short walk",
    "📘 Do light journaling",
  ],
  Sad: [
    "📝 Try journaling your thoughts",
    "📞 Talk to someone you trust",
    "🎧 Listen to calming music",
  ],
  Angry: [
    "🏃 Physical activity helps release anger",
    "🎨 Try creative activity",
    "🌬 Deep breathing exercise",
  ],
  Stressed: [
    "🧘 Try meditation",
    "🌿 Step outside for fresh air",
    "📓 Write what's stressing you",
  ],
  Excited: [
    "🚀 Channel energy into something productive",
    "📸 Capture the moment",
    "🎉 Share your excitement with someone",
  ],
};

const moodMap = {
  5: "Happy",
  4: "Relaxed",
  3: "Neutral",
  2: "Sad",
  1: "Angry",
};

const SelfCareSuggestions = ({ moods = [] }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [currentMood, setCurrentMood] = useState(null);

  useEffect(() => {
    if (!moods.length) return;

    // ✅ Get latest mood (most recent one)
    const latestMood = moods[0]; 

    // If emotion exists use it, otherwise map from numeric mood
    const moodLabel =
      latestMood.emotion || moodMap[latestMood.mood] || "Neutral";

    setCurrentMood(moodLabel);
    setSuggestions(suggestionMap[moodLabel] || []);
  }, [moods]);

  return (
    <div className="suggestion-card">
      <h3>💡 Smart Self-Care Suggestions</h3>

      {currentMood && (
        <p className="suggestion-subtitle">
          Based on your latest mood:
          <strong> {currentMood}</strong>
        </p>
      )}

      <ul>
        {suggestions.map((s, index) => (
          <li key={index}>{s}</li>
        ))}
      </ul>
    </div>
  );
};

export default SelfCareSuggestions;