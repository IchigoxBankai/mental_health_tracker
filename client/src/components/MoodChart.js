import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./MoodChart.css";

/* ===== Convert Mood (1-5) → Chart Scale (0-10) ===== */
const normalizeMood = (value) => value * 2;

/* ===== Mood Details ===== */
const getMoodDetails = (value) => {
  if (value >= 8) return { text: "Amazing", emoji: "😄" };
  if (value >= 6) return { text: "Good", emoji: "🙂" };
  if (value >= 4) return { text: "Okay", emoji: "😐" };
  return { text: "Low", emoji: "😔" };
};

/* ===== Tooltip ===== */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const moodValue = payload[0].value;
    const { text, emoji } = getMoodDetails(moodValue);

    return (
      <div className="tooltip-card">
        <strong>{label}</strong>
        <p>Mood: {moodValue}/10</p>
        <p>
          {text} {emoji}
        </p>
      </div>
    );
  }
  return null;
};

const MoodChart = ({ moods = [], onViewDetails, onAddMood }) => {
  const [view, setView] = useState("weekly");

  /* ================= GROUP MOODS ================= */
  const chartData = useMemo(() => {
    if (!moods.length) return [];

    const grouped = {};

    moods.forEach((entry) => {
      const date = new Date(entry.timestamp);

      let key;

      if (view === "weekly") {
        key = date.toLocaleDateString(undefined, { weekday: "short" });
      } else {
        key = date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
      }

      if (!grouped[key]) grouped[key] = [];

      grouped[key].push(normalizeMood(entry.mood));
    });

    /* ===== Average moods per group ===== */
    return Object.entries(grouped).map(([key, values]) => ({
      day: key,
      mood:
        values.reduce((sum, v) => sum + v, 0) / values.length,
    }));
  }, [moods, view]);

  /* ===== Average mood ===== */
  const avgMood = useMemo(() => {
    if (!chartData.length) return 0;
    return (
      chartData.reduce((sum, d) => sum + d.mood, 0) /
      chartData.length
    ).toFixed(1);
  }, [chartData]);

  return (
    <div className="mood-chart-card">
      {/* HEADER */}
      <div className="mood-header">
        <div>
          <h2>Mood Trends</h2>
          <p>Track how your mood changes over time</p>
          <span className="avg-text">Avg {avgMood} / 10</span>
        </div>

        {/* TOGGLE */}
        <div className="toggle-container">
          <button
            className={`toggle-btn ${view === "weekly" ? "active" : ""}`}
            onClick={() => setView("weekly")}
          >
            Weekly
          </button>

          <button
            className={`toggle-btn ${view === "monthly" ? "active" : ""}`}
            onClick={() => setView("monthly")}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* CHART */}
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="day" />
          <YAxis domain={[0, 10]} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="mood"
            stroke="#6366f1"
            strokeWidth={3}
            dot={{ r: 6, fill: "#fff" }}
            activeDot={{ r: 9 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* BUTTONS */}
      <div className="mood-actions">
        <button
          className="action-btn secondary"
          onClick={onViewDetails}
        >
          View Details
        </button>

        <button
          className="action-btn primary"
          onClick={onAddMood}
        >
          + Add Mood
        </button>
      </div>
    </div>
  );
};

export default MoodChart;
