import React, { useEffect, useState } from "react";
import "./AIInsights.css";

const moodMap = {
  5: "Happy",
  4: "Relaxed",
  3: "Neutral",
  2: "Sad",
  1: "Angry",
};

const AIInsights = ({ moods = [] }) => {
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    if (!moods.length) return;

    generateInsights(moods);
  }, [moods]);

  const generateInsights = (entries) => {
    const newInsights = [];

    /* ===== MOST FREQUENT MOOD ===== */
    const moodCount = {};

    entries.forEach((entry) => {
      const label = moodMap[entry.mood] || "Unknown";
      moodCount[label] = (moodCount[label] || 0) + 1;
    });

    const mostFrequentMood = Object.keys(moodCount).reduce((a, b) =>
      moodCount[a] > moodCount[b] ? a : b
    );

    newInsights.push(`Your most frequent mood is ${mostFrequentMood} 😊`);

    /* ===== HAPPIEST DAY ===== */
    const dayHappyCount = {};

    entries.forEach((entry) => {
      if (entry.mood >= 5 && entry.timestamp) {
        const day = entry.timestamp.toLocaleDateString("en-US", {
          weekday: "long",
        });

        dayHappyCount[day] = (dayHappyCount[day] || 0) + 1;
      }
    });

    if (Object.keys(dayHappyCount).length > 0) {
      const happiestDay = Object.keys(dayHappyCount).reduce((a, b) =>
        dayHappyCount[a] > dayHappyCount[b] ? a : b
      );

      newInsights.push(`You usually feel happiest on ${happiestDay} 😄`);
    }

    /* ===== STREAK ===== */
    const sorted = [...entries].sort(
      (a, b) => a.timestamp - b.timestamp
    );

    let streak = 1;
    let maxStreak = 1;

    for (let i = 1; i < sorted.length; i++) {
      const diff =
        (sorted[i].timestamp - sorted[i - 1].timestamp) /
        (1000 * 60 * 60 * 24);

      if (diff <= 1.5) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else {
        streak = 1;
      }
    }

    if (maxStreak >= 3) {
      newInsights.push(`You logged mood ${maxStreak} days in a row 🔥`);
    }

    /* ===== NEGATIVE WARNING ===== */
    const recent = sorted.slice(-3);

    const negativeCount = recent.filter((e) => e.mood <= 2).length;

    if (negativeCount >= 3) {
      newInsights.push(
        `You seem stressed recently. Consider relaxing activities 🌿`
      );
    }

    setInsights(newInsights);
  };

  return (
    <div className="ai-insights-card">
      <h3>🧠 AuraTrack AI Insights</h3>

      {insights.length === 0 ? (
        <p>No insights yet. Add more mood entries!</p>
      ) : (
        <ul>
          {insights.map((insight, index) => (
            <li key={index}>{insight}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AIInsights;
