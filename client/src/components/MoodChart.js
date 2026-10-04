import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
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

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MOOD_TYPES = [
  { label: "Happy", emoji: "😄", score: 5, color: "#00d2d3" },
  { label: "Relaxed", emoji: "😌", score: 4, color: "#1dd1a1" },
  { label: "Neutral", emoji: "😐", score: 3, color: "#95a5a6" },
  { label: "Sad", emoji: "😢", score: 2, color: "#54a0ff" },
  { label: "Angry", emoji: "😡", score: 1, color: "#ff7675" },
];

/* ===== Mood Details ===== */
const getMoodDetails = (value) => {
  if (value >= 8) return { text: "Amazing", emoji: "😄" };
  if (value >= 6) return { text: "Good", emoji: "🙂" };
  if (value >= 4) return { text: "Okay", emoji: "😐" };
  return { text: "Low", emoji: "😔" };
};

/* ===== Tooltip ===== */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length && payload[0].value !== null) {
    const moodValue = payload[0].value;
    const { text, emoji } = getMoodDetails(moodValue);

    return (
      <div className="tooltip-card">
        <strong>{label}</strong>
        <p>Mood: {moodValue} / 10</p>
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
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  /* ================= GROUP MOODS ================= */
  const chartData = useMemo(() => {
    if (view === "weekly") {
      const dayMap = {
        Mon: [],
        Tue: [],
        Wed: [],
        Thu: [],
        Fri: [],
        Sat: [],
        Sun: [],
      };

      moods.forEach((entry) => {
        if (!entry.timestamp) return;
        const date =
          entry.timestamp instanceof Date
            ? entry.timestamp
            : entry.timestamp.toDate
            ? entry.timestamp.toDate()
            : new Date(entry.timestamp);

        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        if (dayMap[dayName]) {
          dayMap[dayName].push(normalizeMood(entry.mood));
        }
      });

      return WEEKDAYS.map((day) => {
        const vals = dayMap[day];
        return {
          day,
          mood: vals.length
            ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
            : null,
        };
      });
    } else {
      /* Monthly View sorted chronologically */
      const grouped = {};

      moods.forEach((entry) => {
        if (!entry.timestamp) return;
        const date =
          entry.timestamp instanceof Date
            ? entry.timestamp
            : entry.timestamp.toDate
            ? entry.timestamp.toDate()
            : new Date(entry.timestamp);

        const key = date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        });
        const sortKey = date.getTime();

        if (!grouped[key]) {
          grouped[key] = { key, sortKey, vals: [] };
        }
        grouped[key].vals.push(normalizeMood(entry.mood));
      });

      const list = Object.values(grouped).sort((a, b) => a.sortKey - b.sortKey);

      if (!list.length) {
        return [{ day: "No Data", mood: null }];
      }

      return list.map((g) => ({
        day: g.key,
        mood:
          Math.round((g.vals.reduce((a, b) => a + b, 0) / g.vals.length) * 10) / 10,
      }));
    }
  }, [moods, view]);

  /* ===== Average Mood ===== */
  const avgMood = useMemo(() => {
    const valid = chartData.filter((d) => d.mood !== null);
    if (!valid.length) return "0.0";
    return (
      valid.reduce((sum, d) => sum + d.mood, 0) / valid.length
    ).toFixed(1);
  }, [chartData]);

  /* ===== Detailed Analytics Calculation ===== */
  const detailedStats = useMemo(() => {
    const total = moods.length;
    if (!total) {
      return {
        total: 0,
        avgScore: "0.0",
        positiveRatio: "0%",
        happiestDay: "N/A",
        distribution: MOOD_TYPES.map((m) => ({ ...m, count: 0, pct: 0 })),
      };
    }

    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const dayCounts = {};

    moods.forEach((entry) => {
      const score = entry.mood;
      if (counts[score] !== undefined) counts[score]++;

      if (score >= 4 && entry.timestamp) {
        const date =
          entry.timestamp instanceof Date
            ? entry.timestamp
            : entry.timestamp.toDate
            ? entry.timestamp.toDate()
            : new Date(entry.timestamp);
        const day = date.toLocaleDateString("en-US", { weekday: "long" });
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      }
    });

    const positiveTotal = (counts[5] || 0) + (counts[4] || 0);
    const positiveRatio = `${Math.round((positiveTotal / total) * 100)}%`;

    let happiestDay = "Friday";
    if (Object.keys(dayCounts).length > 0) {
      happiestDay = Object.keys(dayCounts).reduce((a, b) =>
        dayCounts[a] > dayCounts[b] ? a : b
      );
    }

    const avgScore = (
      moods.reduce((sum, m) => sum + normalizeMood(m.mood), 0) / total
    ).toFixed(1);

    const distribution = MOOD_TYPES.map((m) => {
      const count = counts[m.score] || 0;
      const pct = Math.round((count / total) * 100);
      return { ...m, count, pct };
    });

    return { total, avgScore, positiveRatio, happiestDay, distribution };
  }, [moods]);

  const handleDetailsClick = () => {
    if (onViewDetails) {
      onViewDetails();
    } else {
      setShowAnalyticsModal(true);
    }
  };

  return (
    <div className="mood-chart-card">
      {/* HEADER */}
      <div className="mood-header">
        <div className="mood-header-info">
          <h2>Mood Trends</h2>
          <p>Track how your mood changes over time</p>
          <div className="avg-row">
            <span className="avg-label">Average Mood</span>
            <span className="avg-value">{avgMood} / 10</span>
          </div>
        </div>

        {/* TOGGLE */}
        <div className="toggle-container">
          <button
            className={`toggle-btn ${view === "weekly" ? "active" : ""}`}
            onClick={() => setView("weekly")}
          >
            Weekly (Mon - Sun)
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
      <div className="chart-section">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="day" tickLine={false} />
            <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="mood"
              stroke="var(--accent, #6c5ce7)"
              strokeWidth={3.5}
              dot={{ r: 5, fill: "#ffffff", stroke: "var(--accent, #6c5ce7)", strokeWidth: 2 }}
              activeDot={{ r: 8, fill: "var(--accent-glow, #a55eea)" }}
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* BUTTONS */}
      <div className="mood-actions">
        <button
          className="action-btn secondary"
          onClick={() => setShowAnalyticsModal(true)}
        >
          📊 View Details
        </button>

        <button
          className="action-btn primary"
          onClick={onAddMood}
        >
          + Add Mood
        </button>
      </div>

      {/* ===== IN-DEPTH MOOD ANALYTICS MODAL ===== */}
      {showAnalyticsModal &&
        createPortal(
          <div
            className="modal-overlay"
            style={{ zIndex: 100000 }}
            onClick={() => setShowAnalyticsModal(false)}
          >
            <div
              className="analytics-modal-box"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="analytics-modal-header">
                <h2>📊 In-Depth Mood Analytics</h2>
                <button
                  className="modal-close-icon"
                  onClick={() => setShowAnalyticsModal(false)}
                >
                  ✕
                </button>
              </div>

              {/* 3 TOP STAT BOXES */}
              <div className="analytics-stat-row">
                <div className="analytics-metric-box">
                  <div className="analytics-metric-title">Average Mood</div>
                  <div className="analytics-metric-val">{detailedStats.avgScore} / 10</div>
                </div>

                <div className="analytics-metric-box">
                  <div className="analytics-metric-title">Positive Rate</div>
                  <div className="analytics-metric-val" style={{ color: "#2ecc71" }}>
                    {detailedStats.positiveRatio}
                  </div>
                </div>

                <div className="analytics-metric-box">
                  <div className="analytics-metric-title">Happiest Day</div>
                  <div className="analytics-metric-val" style={{ fontSize: "16px", color: "var(--accent)" }}>
                    {detailedStats.happiestDay}
                  </div>
                </div>
              </div>

              {/* MOOD DISTRIBUTION BARS */}
              <h3 className="analytics-section-title">Emotion Distribution</h3>
              <div className="analytics-distribution">
                {detailedStats.distribution.map((item) => (
                  <div key={item.label} className="distribution-row">
                    <div className="distribution-label">
                      {item.emoji} {item.label}
                    </div>

                    <div className="distribution-bar-track">
                      <div
                        className="distribution-bar-fill"
                        style={{
                          width: `${item.pct}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>

                    <div className="distribution-percent">
                      {item.pct}% ({item.count})
                    </div>
                  </div>
                ))}
              </div>

              {/* AI TAKEAWAY */}
              <div className="analytics-insights-box">
                <p>
                  💡 <strong>Aura Health Summary:</strong> You have logged{" "}
                  <strong>{detailedStats.total} total mood check-ins</strong>. Your
                  highest emotional resilience is recorded around{" "}
                  <strong>{detailedStats.happiestDay}</strong> with a{" "}
                  <strong>{detailedStats.positiveRatio}</strong> overall positivity
                  rate. Keep tracking consistently to identify and balance emotional triggers!
                </p>
              </div>

              <button
                className="btn primary-btn"
                style={{ width: "100%", marginTop: "24px" }}
                onClick={() => setShowAnalyticsModal(false)}
              >
                Done
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default MoodChart;
