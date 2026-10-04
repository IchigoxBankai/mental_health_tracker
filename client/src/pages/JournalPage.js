import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import "./JournalPage.css";

/* ================= MOOD MAP ================= */

const moodMap = {
  Happy: "😄",
  Sad: "😢",
  Angry: "😡",
  Anxious: "😰",
  Calm: "😌",
  Stressed: "😫",
  Relaxed: "😌",
  Excited: "🤩",
};

/* ================= SENTIMENT DETECTION ================= */

const detectSentiment = (text) => {
  const positiveWords = [
    "happy",
    "good",
    "great",
    "love",
    "excited",
    "relaxed",
    "calm",
    "amazing",
  ];

  const negativeWords = [
    "sad",
    "angry",
    "stressed",
    "bad",
    "upset",
    "depressed",
    "tired",
    "worried",
  ];

  let score = 0;

  text.toLowerCase().split(" ").forEach((word) => {
    if (positiveWords.includes(word)) score++;
    if (negativeWords.includes(word)) score--;
  });

  if (score > 0) return "Positive 😊";
  if (score < 0) return "Negative 😟";
  return "Neutral 😐";
};

/* ================= FORMAT DATE ================= */

const formatDate = (timestamp) => {
  if (!timestamp) return "";

  try {
    return timestamp.toDate().toLocaleString();
  } catch {
    return "";
  }
};

/* ================= GROUP ENTRIES BY DATE ⭐ NEW ================= */

const groupEntriesByDate = (entries) => {
  const groups = {};

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  entries.forEach((entry) => {
    if (!entry.createdAt) return;

    const entryDate = entry.createdAt.toDate();

    let label;

    if (entryDate.toDateString() === today.toDateString()) {
      label = "Today";
    } else if (entryDate.toDateString() === yesterday.toDateString()) {
      label = "Yesterday";
    } else {
      label = entryDate.toLocaleDateString();
    }

    if (!groups[label]) groups[label] = [];
    groups[label].push(entry);
  });

  return groups;
};

/* ================= COMPONENT ================= */

const JournalPage = () => {
  const [title, setTitle] = useState("");

  const [mood, setMood] = useState(
    () => localStorage.getItem("lastMood") || ""
  );

  const [content, setContent] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState("");

  /* ===== LIVE DATE WHILE WRITING ===== */

  useEffect(() => {
    const updateTime = () =>
      setCurrentDateTime(new Date().toLocaleString());

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  /* ================= FETCH ENTRIES ================= */

  useEffect(() => {
    const q = query(
      collection(db, "journalEntries"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setEntries(data);
    });

    return () => unsubscribe();
  }, []);

  /* ================= AUTO SENTIMENT ================= */

  useEffect(() => {
    if (content.trim()) {
      setSentiment(detectSentiment(content));
    } else {
      setSentiment("");
    }
  }, [content]);

  /* ================= SAVE ENTRY ================= */

  const handleSave = async () => {
    if (!title || !mood || !content) {
      alert("Please fill all fields");
      return;
    }

    await addDoc(collection(db, "journalEntries"), {
      title,
      mood,
      content,
      sentiment,
      createdAt: serverTimestamp(),
    });

    localStorage.removeItem("lastMood");

    setTitle("");
    setMood("");
    setContent("");
    setSentiment("");
  };

  /* ================= DELETE ENTRY ================= */

  const confirmDelete = async () => {
    if (!selectedEntry) return;
    try {
      await deleteDoc(doc(db, "journalEntries", selectedEntry.id));
      setShowDeleteConfirm(false);
      setSelectedEntry(null);
    } catch (err) {
      console.error("Error deleting entry:", err);
    }
  };

  /* ================= SEARCH ================= */

  const filteredEntries = entries.filter(
    (e) =>
      e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.mood?.toLowerCase().includes(search.toLowerCase()) ||
      e.content?.toLowerCase().includes(search.toLowerCase()) ||
      e.sentiment?.toLowerCase().includes(search.toLowerCase())
  );

  /* ⭐ GROUPED ENTRIES */
  const groupedEntries = groupEntriesByDate(filteredEntries);

  /* ================= UI ================= */

  return (
    <div className="page-container">
      <h2 className="journal-title">Journal</h2>

      {/* ===== CREATE ENTRY ===== */}

      <div className="journal-create-box">
        <h3>Create New Entry</h3>

        <p style={{ fontSize: "13px", color: "gray" }}>
          {currentDateTime}
        </p>

        <input
          type="text"
          placeholder="Entry Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select value={mood} onChange={(e) => setMood(e.target.value)}>
          <option value="">Select Mood</option>
          {Object.keys(moodMap).map((m) => (
            <option key={m} value={m}>
              {moodMap[m]} {m}
            </option>
          ))}
        </select>

        {localStorage.getItem("lastMood") && (
          <p style={{ fontSize: "12px", color: "gray" }}>
            Mood auto-filled from latest mood entry
          </p>
        )}

        <textarea
          placeholder="Write your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {sentiment && (
          <p style={{ marginTop: 10 }}>
            AI Sentiment: <strong>{sentiment}</strong>
          </p>
        )}

        <button onClick={handleSave}>Save Entry</button>
      </div>

      {/* ===== SEARCH ===== */}

      <div className="journal-filters">
        <input
          type="text"
          placeholder="Search entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ===== ENTRIES TIMELINE ⭐ ===== */}

      <h3>Your Entries</h3>

      {Object.keys(groupedEntries).map((dateLabel) => (
        <div key={dateLabel} style={{ marginBottom: 30 }}>
          <h4 style={{ color: "#666", marginBottom: 10 }}>
            📅 {dateLabel}
          </h4>

          <div className="journal-grid">
            {groupedEntries[dateLabel].map((entry) => (
              <div
                key={entry.id}
                className={`journal-card mood-${entry.mood?.toLowerCase()}`}
                onClick={() => setSelectedEntry(entry)}
                style={{ cursor: "pointer" }}
              >
                <h3>
                  {moodMap[entry.mood]} {entry.title}
                </h3>

                <p style={{ fontSize: 12, color: "gray" }}>
                  {formatDate(entry.createdAt)}
                </p>

                <p>{entry.content?.slice(0, 80)}...</p>

                {entry.sentiment && (
                  <p style={{ fontSize: 12 }}>{entry.sentiment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* ===== MODAL ===== */}

      {selectedEntry &&
        createPortal(
          <div className="modal-overlay" onClick={() => setSelectedEntry(null)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <h3>
                {moodMap[selectedEntry.mood]} {selectedEntry.title}
              </h3>

              <p style={{ fontSize: 13, color: "gray" }}>
                {formatDate(selectedEntry.createdAt)}
              </p>

              <p style={{ margin: "15px 0", whiteSpace: "pre-wrap" }}>
                {selectedEntry.content}
              </p>

              {selectedEntry.sentiment && (
                <p style={{ marginBottom: 15 }}>
                  <strong>AI Sentiment:</strong> {selectedEntry.sentiment}
                </p>
              )}

              <button
                style={{
                  background: "#b00020",
                  color: "white",
                  padding: 12,
                  borderRadius: 10,
                  border: "none",
                  marginBottom: 10,
                  cursor: "pointer",
                  width: "100%",
                  fontWeight: 600,
                  fontSize: 14,
                }}
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Entry
              </button>

              <button
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  fontWeight: 600,
                  fontSize: 14,
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "inherit",
                }}
                onClick={() => {
                  setSelectedEntry(null);
                  setShowDeleteConfirm(false);
                }}
              >
                Close
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* ===== CUSTOM ONSCREEN DELETE CONFIRMATION MODAL ===== */}
      {showDeleteConfirm &&
        createPortal(
          <div
            className="modal-overlay"
            style={{ zIndex: 100000 }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <div
              className="modal-box"
              style={{
                maxWidth: "380px",
                padding: "32px 24px",
                textAlign: "center",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🗑️</div>
              <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>
                Delete this entry?
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--text-muted)",
                  marginBottom: "24px",
                }}
              >
                Do you want to delete this entry?
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "center",
                }}
              >
                <button
                  style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #ff4d4d, #ff3333)",
                    color: "white",
                    padding: "12px 18px",
                    borderRadius: "10px",
                    border: "none",
                    fontWeight: "600",
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(255, 77, 77, 0.3)",
                    transition: "0.2s ease",
                  }}
                  onClick={confirmDelete}
                >
                  Yes, Delete
                </button>
                <button
                  style={{
                    flex: 1,
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "var(--text-color)",
                    padding: "12px 18px",
                    borderRadius: "10px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "0.2s ease",
                  }}
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  No, Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default JournalPage;
