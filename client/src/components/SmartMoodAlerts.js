import React, { useEffect, useState } from "react";
import "./SelfCareSuggestions.css";

/* ================= MOOD LABEL MAP ================= */
const moodMap = {
  5: "Happy",
  4: "Relaxed",
  3: "Neutral",
  2: "Sad",
  1: "Angry",
};

/* ================= BASE SUGGESTIONS ================= */
const suggestionMap = {
  Happy: [
    "🙏 Write a gratitude journal note",
    "📸 Capture this happy moment in memory",
    "💬 Share positivity with a friend or loved one",
  ],
  Relaxed: [
    "📖 Enjoy a chapter of an inspiring book",
    "🌅 Take in the present moment calmly",
    "🧠 Reflect on what brought you peace today",
  ],
  Neutral: [
    "🎵 Tune into your favorite uplifting playlist",
    "🚶 Take a short 10-minute mindful walk",
    "📘 Quick journaling to clarify your thoughts",
  ],
  Sad: [
    "📝 Write down your thoughts to release tension",
    "📞 Reach out to someone you trust",
    "🎧 Put on gentle, comforting music",
  ],
  Angry: [
    "🏃 Release physical energy with a workout",
    "🎨 Channel focus into a creative outlet",
    "🌬 Practice 4-7-8 deep relaxation breathing",
  ],
};

const SelfCareSuggestions = ({ moods = [] }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [currentMood, setCurrentMood] = useState(null);
  const [trend, setTrend] = useState(null);

  useEffect(() => {
    if (!moods.length) return;

    /* ===== Get Last 5 Mood Entries ===== */
    const recentMoods = moods.slice(0, 5);

    /* ===== Latest Mood ===== */
    const latestMoodValue = recentMoods[0].mood;
    const latestMoodLabel = moodMap[latestMoodValue];

    setCurrentMood(latestMoodLabel);

    /* ===== Calculate Trend ===== */
    const moodValues = recentMoods.map((m) => m.mood);
    const avg =
      moodValues.reduce((sum, m) => sum + m, 0) / moodValues.length;

    let detectedTrend = "Stable";
    if (latestMoodValue > avg) detectedTrend = "Improving";
    else if (latestMoodValue < avg) detectedTrend = "Declining";

    setTrend(detectedTrend);

    /* ===== Negative Streak Detection ===== */
    const negativeCount = recentMoods.filter((m) => m.mood <= 2).length;
    let finalSuggestions = [...(suggestionMap[latestMoodLabel] || [])];

    /* ===== Add Smart Adaptive Suggestions ===== */
    if (negativeCount >= 3) {
      finalSuggestions.unshift(
        "⚠️ You've had low moods recently. Consider extra rest or gentle relaxation."
      );
    } else if (detectedTrend === "Improving") {
      finalSuggestions.push(
        "📈 Your mood is improving — keep following your positive habits!"
      );
    } else if (detectedTrend === "Declining") {
      finalSuggestions.push(
        "🌿 Your mood seems slightly lower lately. Take a short mindful pause."
      );
    } else {
      finalSuggestions.push(
        "⚖️ Your mood is balanced. Maintain your healthy daily rhythm."
      );
    }

    setSuggestions(finalSuggestions);
  }, [moods]);

  return (
    <div className="suggestion-card">
      <div className="suggestion-header">
        <h3>💡 Smart Self-Care</h3>
        {trend && (
          <span className="suggestion-trend-badge">{trend}</span>
        )}
      </div>

      {currentMood && (
        <p className="suggestion-subtitle">
          Based on recent mood: <strong>{currentMood}</strong>
        </p>
      )}

      <ul className="suggestion-list">
        {suggestions.map((s, index) => (
          <li key={index} className="suggestion-item">
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SelfCareSuggestions;
