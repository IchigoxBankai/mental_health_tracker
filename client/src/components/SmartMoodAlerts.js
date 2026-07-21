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
    "🙏 Write gratitude journal",
    "📸 Capture this happy moment",
    "💬 Share positivity with someone",
  ],
  Relaxed: [
    "📖 Read a book",
    "🌅 Enjoy nature",
    "🧠 Reflect on your peaceful moments",
  ],
  Neutral: [
    "🎵 Listen to your favourite music",
    "🚶 Take a short mindful walk",
    "📘 Light journaling may help clarity",
  ],
  Sad: [
    "📝 Try journaling your feelings",
    "📞 Talk to someone you trust",
    "🎧 Listen to calming music",
  ],
  Angry: [
    "🏃 Try physical exercise",
    "🎨 Do a creative activity",
    "🌬 Practice deep breathing",
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
    const negativeCount = recentMoods.filter(
      (m) => m.mood <= 2
    ).length;

    let finalSuggestions = [...(suggestionMap[latestMoodLabel] || [])];

    /* ===== Add Smart Adaptive Suggestions ===== */

    // Emotional Risk
    if (negativeCount >= 3) {
      finalSuggestions.unshift(
        "⚠️ You've had several low moods recently. Consider rest or talking to someone supportive."
      );
    }

    // Mood Improving
    if (detectedTrend === "Improving") {
      finalSuggestions.push(
        "📈 Your mood is improving — keep following positive habits!"
      );
    }

    // Mood Declining
    if (detectedTrend === "Declining") {
      finalSuggestions.push(
        "🌿 Your mood seems slightly lower lately. Consider relaxation or mindfulness."
      );
    }

    // Stable Mood
    if (detectedTrend === "Stable") {
      finalSuggestions.push(
        "⚖️ Your mood seems stable. Maintain healthy routines."
      );
    }

    setSuggestions(finalSuggestions);
  }, [moods]);

  return (
    <div className="suggestion-card">
      <h3>💡 Smart Self-Care Suggestions</h3>

      {currentMood && (
        <p className="suggestion-subtitle">
          Based on your recent mood:
          <strong> {currentMood}</strong>
          {trend && (
            <span style={{ marginLeft: "10px" }}>
              ({trend})
            </span>
          )}
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
