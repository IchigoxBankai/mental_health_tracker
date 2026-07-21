import React from "react";
import MoodInput from "../components/MoodInput";
import SelfCareSuggestions from "../components/SelfCareSuggestions";
import MoodStreakCard from "../components/MoodStreakCard";
import "./MoodTrackerPage.css";

const MoodTrackerPage = ({ moods = [] }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      <div className="mood-page-layout">
        {/* LEFT SIDE */}
        <div className="mood-left">
          <MoodInput />
        </div>

        {/* RIGHT SIDE */}
        <div className="mood-right">
          <div className="summary-card">
            <h3>Your Mood Summary</h3>
            <p>
              Tracking your mood helps identify emotional patterns and improve
              mental wellness.
            </p>
            <ul>
              <li>✔ Helps detect stress patterns</li>
              <li>✔ Builds emotional awareness</li>
              <li>✔ Supports mental health tracking</li>
            </ul>
            <div className="tip-box">
              💡 Tip: Try logging mood daily for better insights.
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SIDE */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "25px" }}>
        <SelfCareSuggestions moods={moods} />
        <MoodStreakCard moods={moods} />
      </div>
    </div>
  );
};

export default MoodTrackerPage;
