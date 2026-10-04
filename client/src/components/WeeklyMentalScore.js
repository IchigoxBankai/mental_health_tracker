import React from "react";
import { motion } from "framer-motion";
import "./WeeklyMentalScore.css";

const WeeklyMentalScore = ({ moods = [] }) => {
  /* ===== FILTER LAST 7 DAYS ===== */
  const lastWeek = moods.filter((entry) => {
    if (!entry.timestamp) return false;
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
          lastWeek.reduce((sum, m) => sum + convertToScore(m.mood), 0) /
            lastWeek.length
        )
      : 80; // default healthy baseline when new

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

  const activeColor = getColor();

  return (
    <motion.div
      className="mental-score-card"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="score-header">
        <h3>📊 Wellness Score</h3>
        <span
          className="score-badge"
          style={{
            color: activeColor,
            borderColor: `${activeColor}40`,
            backgroundColor: `${activeColor}15`,
          }}
        >
          {getLabel()}
        </span>
      </div>

      <div className="score-number">
        {averageScore}
        <span> / 100</span>
      </div>

      <div className="score-progress-track">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${averageScore}%` }}
          transition={{ duration: 0.8 }}
          className="score-progress-fill"
          style={{ background: activeColor }}
        />
      </div>

      <p className="score-subtext">
        {lastWeek.length > 0
          ? `Calculated from ${lastWeek.length} entries this week`
          : "Track your moods to update your weekly score"}
      </p>
    </motion.div>
  );
};

export default WeeklyMentalScore;
