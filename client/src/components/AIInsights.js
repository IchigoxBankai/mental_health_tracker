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
        const dateObj =
          entry.timestamp instanceof Date
            ? entry.timestamp
            : entry.timestamp.toDate
            ? entry.timestamp.toDate()
            : new Date(entry.timestamp);

        const day = dateObj.toLocaleDateString("en-US", {
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
    const validEntries = entries
      .filter((e) => e.timestamp)
      .map((e) => ({
        ...e,
        date:
          e.timestamp instanceof Date
            ? e.timestamp
            : e.timestamp.toDate
            ? e.timestamp.toDate()
            : new Date(e.timestamp),
      }))
      .sort((a, b) => a.date - b.date);

    let streak = 1;
    let maxStreak = 1;

    for (let i = 1; i < validEntries.length; i++) {
      const diff =
        (validEntries[i].date - validEntries[i - 1].date) /
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
    const recent = validEntries.slice(-3);
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
      <div className="ai-insights-header">
        <h3>🧠 Emotional Patterns</h3>
      </div>

      {insights.length === 0 ? (
        <p className="ai-insights-empty">
          No patterns detected yet. Log more mood entries to unlock AI insights!
        </p>
      ) : (
        <ul className="ai-insights-list">
          {insights.map((insight, index) => (
            <li key={index} className="ai-insight-item">
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AIInsights;
