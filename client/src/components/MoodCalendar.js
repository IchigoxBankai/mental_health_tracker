import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import "./MoodCalendar.css";

/* ================= MOOD MAP ================= */

const moodMap = {
  Angry: { emoji: "😡", color: "#ff6b6b" },
  Sad: { emoji: "😢", color: "#5c7cfa" },
  Happy: { emoji: "😄", color: "#ffd43b" },
  Anxious: { emoji: "😰", color: "#9775fa" },
  Calm: { emoji: "😌", color: "#63e6be" },
  Relaxed: { emoji: "😌", color: "#63e6be" },
  Stressed: { emoji: "😫", color: "#ff922b" },
  Excited: { emoji: "🤩", color: "#f06595" },
};

const MoodCalendar = () => {
  const [date, setDate] = useState(new Date());
  const [moodEntries, setMoodEntries] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(false);

  /* ================= LOAD MOODS ================= */

  useEffect(() => {
    const loadMoods = async () => {
      try {
        const snapshot = await getDocs(collection(db, "journalEntries"));

        const moods = snapshot.docs.map((doc) => ({
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.(),
        }));

        setMoodEntries(moods);
      } catch (error) {
        console.error("Error loading moods:", error);
      }
    };

    loadMoods();
  }, []);

  /* ================= GET MOOD FOR DAY ================= */

  const getMoodForDate = (date) => {
    return moodEntries.find(
      (entry) =>
        entry.createdAt &&
        entry.createdAt.toDateString() === date.toDateString()
    );
  };

  /* ================= MONTH ANALYTICS ================= */

  const monthEntries = moodEntries.filter(
    (entry) =>
      entry.createdAt &&
      entry.createdAt.getMonth() === date.getMonth() &&
      entry.createdAt.getFullYear() === date.getFullYear()
  );

  const moodStats = {};
  monthEntries.forEach((entry) => {
    moodStats[entry.mood] = (moodStats[entry.mood] || 0) + 1;
  });

  const mostFrequentMood =
    Object.keys(moodStats).length > 0
      ? Object.keys(moodStats).reduce((a, b) =>
          moodStats[a] > moodStats[b] ? a : b
        )
      : null;

  /* ================= CALENDAR TILE ================= */

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const entry = getMoodForDate(date);
      if (entry && moodMap[entry.mood]) {
        return (
          <div style={{ fontSize: "18px" }}>
            {moodMap[entry.mood].emoji}
          </div>
        );
      }
    }
    return null;
  };

  /* ================= UI ================= */

  return (
    <div className="mood-calendar-wrapper">

      <div className="calendar-header">
        <h3>📅 Mood Calendar</h3>
        <button
          className="analytics-btn"
          onClick={() => setShowAnalytics(true)}
        >
          View Monthly Insights
        </button>
      </div>

      <Calendar
        value={date}
        onChange={setDate}
        tileContent={tileContent}
      />

      {/* ================= ANALYTICS MODAL ================= */}

      {showAnalytics && (
        <div
          className="modal-overlay"
          onClick={() => setShowAnalytics(false)}
        >
          <div
            className="analytics-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="analytics-title">
              📊 Monthly Mood Insights
            </h2>

            <div className="analytics-summary">
              <p>
                <strong>Total Entries:</strong> {monthEntries.length}
              </p>

              {mostFrequentMood && (
                <p>
                  <strong>Most Frequent Mood:</strong>{" "}
                  {moodMap[mostFrequentMood]?.emoji}{" "}
                  {mostFrequentMood}
                </p>
              )}
            </div>

            <div className="analytics-bars">
              {Object.keys(moodStats).map((mood) => {
                const count = moodStats[mood];
                const percentage =
                  (count / monthEntries.length) * 100;

                return (
                  <div key={mood} className="bar-row">
                    <span className="bar-label">
                      {moodMap[mood]?.emoji} {mood}
                    </span>

                    <div className="bar-container">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${percentage}%`,
                          background:
                            moodMap[mood]?.color,
                        }}
                      />
                    </div>

                    <span className="bar-count">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              className="analytics-close"
              onClick={() => setShowAnalytics(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodCalendar;
