// src/pages/ViewJournalEntry.js
import React from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../services/firebaseConfig";

export default function ViewJournalEntry({
  entry,
  onBack,
  onEdit,
  onDeleted,
}) {
  if (!entry) return null;

  const deleteEntry = async () => {
    if (!window.confirm("Delete this journal entry?")) return;

    try {
      await deleteDoc(doc(db, "journalEntries", entry.id));
      onDeleted();
    } catch (err) {
      console.error("delete entry:", err);
      alert("Error deleting entry");
    }
  };

  return (
    <div>
      <button className="ghost" onClick={onBack}>
        ← Back
      </button>

      <h2>{entry.title}</h2>
      <div className="muted">{entry.createdAt?.toLocaleString()}</div>

      <div style={{ marginTop: 10, fontWeight: "bold" }}>
        Mood: {entry.mood}
      </div>
      <div style={{ marginBottom: 10 }}>Category: {entry.category}</div>

      {entry.imageURL && (
        <img
          src={entry.imageURL}
          alt="Entry"
          style={{
            width: "100%",
            borderRadius: 10,
            margin: "12px 0",
            objectFit: "cover",
          }}
        />
      )}

      <p style={{ whiteSpace: "pre-wrap", marginTop: 20 }}>{entry.content}</p>

      {/* AI Summary */}
      {entry.summary && (
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            padding: 12,
            borderRadius: 10,
            marginTop: 20,
          }}
        >
          <strong>AI Reflection Summary:</strong>
          <p style={{ marginTop: 5 }}>{entry.summary}</p>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button className="primary" onClick={() => onEdit(entry)}>
          Edit
        </button>
        <button className="danger" onClick={deleteEntry}>
          Delete
        </button>
      </div>
    </div>
  );
}
