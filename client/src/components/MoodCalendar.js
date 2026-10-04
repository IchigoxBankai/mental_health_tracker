import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db, auth } from "../services/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import "./MoodCalendar.css";

/* ================= MOOD MAP ================= */

const moodMap = {
  Happy: { emoji: "😊", color: "#facc15", text: "Happy" },
  Sad: { emoji: "😢", color: "#60a5fa", text: "Sad" },
  Angry: { emoji: "😠", color: "#f87171", text: "Angry" },
  Stressed: { emoji: "😫", color: "#fb923c", text: "Stressed" },
  Relaxed: { emoji: "😌", color: "#34d399", text: "Relaxed" },
  Excited: { emoji: "🤩", color: "#c084fc", text: "Excited" },
  Calm: { emoji: "😌", color: "#34d399", text: "Calm" },
  Anxious: { emoji: "😰", color: "#9775fa", text: "Anxious" },
};

const moodScoreMap = {
  5: { emoji: "😊", color: "#facc15", text: "Happy" },
  4: { emoji: "😌", color: "#34d399", text: "Relaxed" },
  3: { emoji: "😐", color: "#95a5a6", text: "Neutral" },
  2: { emoji: "😢", color: "#60a5fa", text: "Sad" },
  1: { emoji: "😠", color: "#f87171", text: "Angry" },
};

const suggestionsMap = {
  Happy: "Keep shining! Spread your positive energy with someone today ✨",
  Sad: "It's okay to feel sad. Try journaling your thoughts or talking to someone you trust 💙",
  Angry: "Take a few deep, slow breaths. A short walk or physical break can help release tension 🌿",
  Stressed: "Take a pause. Try a short breathing exercise to reset your mind 🧘",
  Relaxed: "Enjoy this peaceful state of mind and savor the moment ☀️",
  Excited: "Channel your creative energy and capture your ideas 🚀",
};

const parseDate = (val) => {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val.toDate === "function") return val.toDate();
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

const getMoodInfo = (entry) => {
  if (entry.emotion && moodMap[entry.emotion]) {
    return moodMap[entry.emotion];
  }
  if (entry.mood && moodScoreMap[entry.mood]) {
    return moodScoreMap[entry.mood];
  }
  return { emoji: "😐", color: "#95a5a6", text: entry.emotion || "Mood Entry" };
};

const MoodCalendar = ({ moods: propsMoods = [] }) => {
  const [date, setDate] = useState(new Date());
  const [firestoreMoods, setFirestoreMoods] = useState([]);
  const [user, setUser] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState(null);

  /* ===== AUTH & REAL-TIME LISTENER ===== */
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const q = query(
          collection(db, "users", currentUser.uid, "moods"),
          orderBy("timestamp", "desc")
        );
        const unsubMoods = onSnapshot(q, (snapshot) => {
          const loaded = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            parsedDate: parseDate(doc.data().timestamp),
          }));
          setFirestoreMoods(loaded);
        });
        return () => unsubMoods();
      }
    });

    return () => unsubAuth();
  }, []);

  /* ===== COMBINED ALL MOOD ENTRIES ===== */
  const allEntries = useMemo(() => {
    const list = [...firestoreMoods];

    // Merge any propsMoods if not already included
    propsMoods.forEach((pm) => {
      const pmDate = parseDate(pm.timestamp);
      if (pmDate && !list.some((item) => item.id && item.id === pm.id)) {
        list.push({
          ...pm,
          parsedDate: pmDate,
        });
      }
    });

    return list;
  }, [firestoreMoods, propsMoods]);

  /* ===== GET MOOD ENTRIES FOR DATE ===== */
  const getMoodsForDate = (checkDate) => {
    const dateStr = checkDate.toDateString();
    return allEntries.filter(
      (entry) => entry.parsedDate && entry.parsedDate.toDateString() === dateStr
    );
  };

  /* ===== TILE CONTENT (Emoji below date number) ===== */
  const tileContent = ({ date: tileDate, view }) => {
    if (view === "month") {
      const entries = getMoodsForDate(tileDate);
      if (entries.length > 0) {
        const latestEntry = entries[0];
        const info = getMoodInfo(latestEntry);
        return (
          <div className="calendar-mood-dot-wrap">
            <span
              className="calendar-mood-emoji"
              title={`${info.text} (${entries.length} log${entries.length > 1 ? "s" : ""})`}
            >
              {info.emoji}
            </span>
          </div>
        );
      }
    }
    return null;
  };

  /* ===== TILE CLASSNAME ===== */
  const tileClassName = ({ date: tileDate, view }) => {
    if (view === "month") {
      const entries = getMoodsForDate(tileDate);
      if (entries.length > 0) {
        return "has-mood-entry";
      }
    }
    return "";
  };

  /* ===== HANDLE CLICKING A CALENDAR DAY ===== */
  const handleDateClick = (newDate) => {
    setDate(newDate);
    const entries = getMoodsForDate(newDate);
    if (entries.length > 0) {
      setSelectedDayData({ date: newDate, entries });
    }
  };

  /* ===== MONTH ANALYTICS ===== */
  const monthEntries = allEntries.filter(
    (entry) =>
      entry.parsedDate &&
      entry.parsedDate.getMonth() === date.getMonth() &&
      entry.parsedDate.getFullYear() === date.getFullYear()
  );

  const moodStats = {};
  monthEntries.forEach((entry) => {
    const info = getMoodInfo(entry);
    moodStats[info.text] = (moodStats[info.text] || 0) + 1;
  });

  const mostFrequentMood =
    Object.keys(moodStats).length > 0
      ? Object.keys(moodStats).reduce((a, b) =>
          moodStats[a] > moodStats[b] ? a : b
        )
      : null;

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
        onClickDay={handleDateClick}
        tileContent={tileContent}
        tileClassName={tileClassName}
      />

      {/* ================= DAY MOOD DETAIL POPUP MODAL ================= */}
      {selectedDayData &&
        createPortal(
          <div
            className="modal-overlay"
            style={{ zIndex: 100000 }}
            onClick={() => setSelectedDayData(null)}
          >
            <div
              className="day-mood-modal-box"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="day-mood-modal-header">
                <div>
                  <h3>
                    📅{" "}
                    {selectedDayData.date.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </h3>
                  <span className="day-mood-subtitle">
                    Recorded Mood Logs ({selectedDayData.entries.length})
                  </span>
                </div>
                <button
                  className="modal-close-icon"
                  onClick={() => setSelectedDayData(null)}
                >
                  ✕
                </button>
              </div>

              <div className="day-mood-entries-list">
                {selectedDayData.entries.map((entry, idx) => {
                  const info = getMoodInfo(entry);
                  const timeStr = entry.parsedDate
                    ? entry.parsedDate.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "";

                  return (
                    <div key={idx} className="day-mood-card">
                      <div className="day-mood-card-top">
                        <div
                          className="day-mood-badge"
                          style={{
                            background: `${info.color}20`,
                            borderColor: `${info.color}60`,
                            color: info.color,
                          }}
                        >
                          <span style={{ fontSize: "20px" }}>{info.emoji}</span>
                          <strong>{info.text}</strong>
                        </div>

                        {entry.intensity !== undefined && (
                          <span className="day-mood-intensity">
                            Intensity: {entry.intensity}%
                          </span>
                        )}

                        {timeStr && (
                          <span className="day-mood-time">⏰ {timeStr}</span>
                        )}
                      </div>

                      {/* WHY YOU WERE FEELING THAT WAY */}
                      {entry.note ? (
                        <div className="day-mood-note-box">
                          <div className="note-label">
                            💬 What was on your mind:
                          </div>
                          <p className="note-text">"{entry.note}"</p>
                        </div>
                      ) : (
                        <div className="day-mood-note-box empty">
                          <p className="note-text muted" style={{ fontStyle: "italic", fontSize: "13px" }}>
                            No written note attached to this entry.
                          </p>
                        </div>
                      )}

                      {/* GUIDANCE RECOMMENDATION */}
                      {suggestionsMap[info.text] && (
                        <div className="day-mood-advice-box">
                          <div className="advice-label">💡 Reflection Tip:</div>
                          <p className="advice-text">
                            {suggestionsMap[info.text]}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                className="btn primary-btn"
                style={{ width: "100%", marginTop: "20px" }}
                onClick={() => setSelectedDayData(null)}
              >
                Close
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* ================= MONTHLY ANALYTICS MODAL ================= */}
      {showAnalytics &&
        createPortal(
          <div
            className="modal-overlay"
            style={{ zIndex: 100000 }}
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
                    {moodMap[mostFrequentMood]?.emoji || "😊"}{" "}
                    {mostFrequentMood}
                  </p>
                )}
              </div>

              <div className="analytics-bars">
                {Object.keys(moodStats).map((moodName) => {
                  const count = moodStats[moodName];
                  const percentage =
                    monthEntries.length > 0
                      ? Math.round((count / monthEntries.length) * 100)
                      : 0;
                  const color = moodMap[moodName]?.color || "var(--accent)";
                  const emoji = moodMap[moodName]?.emoji || "😐";

                  return (
                    <div key={moodName} className="bar-row">
                      <span className="bar-label">
                        {emoji} {moodName}
                      </span>

                      <div className="bar-container">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${percentage}%`,
                            background: color,
                          }}
                        />
                      </div>

                      <span className="bar-count">{count}</span>
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
          </div>,
          document.body
        )}
    </div>
  );
};

export default MoodCalendar;
