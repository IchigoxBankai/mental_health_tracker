import React from "react";
import { motion } from "framer-motion";

const WeeklyMentalScore = ({ moods }) => {

  /* ===== FILTER LAST 7 DAYS ===== */
  const lastWeek = moods.filter((entry) => {
    const moodDate = new Date(entry.timestamp);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return moodDate >= sevenDaysAgo;
  });

  /* ===== CALCULATE SCORE ===== */
  const convertToScore = (mood) => mood * 20;

  const averageScore =
    lastWeek.length > 0
      ? Math.round(
          lastWeek.reduce(
            (sum, m) => sum + convertToScore(m.mood),
            0
          ) / lastWeek.length
        )
      : 0;

  /* ===== SCORE LABEL ===== */
  const getLabel = () => {
    if (averageScore >= 80) return "Excellent 🌟";
    if (averageScore >= 60) return "Good 🙂";
    if (averageScore >= 40) return "Needs Attention ⚠️";
    return "Critical 🚨";
  };

  /* ===== PROGRESS COLOR ===== */
  const getColor = () => {
    if (averageScore >= 80) return "#34d399";
    if (averageScore >= 60) return "#60a5fa";
    if (averageScore >= 40) return "#facc15";
    return "#f87171";
  };

  return (
    <motion.div
      className="panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h3>📊 Weekly Mental Health Score</h3>

      {lastWeek.length === 0 ? (
        <p>No mood data this week</p>
      ) : (
        <>
          <h2 style={{ marginTop: 10 }}>
            {averageScore}/100
          </h2>

          <p>{getLabel()}</p>

          {/* Progress Bar */}
          <div
            style={{
              height: 12,
              width: "100%",
              background: "#ddd",
              borderRadius: 20,
              marginTop: 12,
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${averageScore}%` }}
              transition={{ duration: 0.8 }}
              style={{
                height: "100%",
                background: getColor(),
                borderRadius: 20,
              }}
            />
          </div>

          <p style={{ marginTop: 10, fontSize: 13 }}>
            Based on last 7 days mood entries
          </p>
        </>
      )}
    </motion.div>
  );
};

export default WeeklyMentalScore;
