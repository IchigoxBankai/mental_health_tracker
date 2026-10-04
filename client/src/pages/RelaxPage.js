import React, { useState, useEffect } from "react";
import "./RelaxPage.css";
import BubbleGame from "../components/BubbleGame";
import MemoryGame from "../components/MemoryGame";
import TimerGame from "../components/TimerGame";
import MusicPlayer from "../components/MusicPlayer";
import ColorMatchGame from "../components/ColorMatchGame";
import ReactionGame from "../components/ReactionGame";

const quotes = [
  "You are stronger than you think.",
  "Take a deep breath. You’ve got this.",
  "Small steps every day lead to big changes.",
  "Your mental health matters.",
  "Progress, not perfection.",
];

const tracks = [
  { name: "Berry Groovy", file: "/music/berry-groovy.mp3" },
  { name: "Lofi Music", file: "/music/lofi music.mp3" },
  { name: "Peace", file: "/music/peace.mp3" },
  { name: "Jumping Bunny", file: "/music/jumpingbunny.mp3" },
  { name: "Chill", file: "/music/Chill.mp3" },
  { name: "OnRyo Rider", file: "/music/onryo rider.mp3" },
  { name: "MoonLight", file: "/music/moonlight.mp3" },
  { name: "S&S", file: "/music/sadness and sorrow.mp3" },
  { name: "Silhouette", file: "/music/Silhouette.mp3" },
];

const GAMES = [
  { id: "bubble", label: "Bubble Pop", icon: "🫧" },
  { id: "memory", label: "Memory Matrix", icon: "🧠" },
  { id: "color", label: "Color Match", icon: "🎨" },
  { id: "reaction", label: "Reaction Test", icon: "⚡" },
  { id: "timer", label: "Focus Timer", icon: "⏱️" },
];

function RelaxPage() {
  const [quote, setQuote] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("");

  // Breathing
  const [phase, setPhase] = useState("Ready");
  const [isRunning, setIsRunning] = useState(false);

  // Games
  const [activeGame, setActiveGame] = useState("bubble");

  // Global Score + Streak
  const [totalScore, setTotalScore] = useState(0);
  const [streak, setStreak] = useState(
    Number(localStorage.getItem("relaxStreak")) || 1
  );

  useEffect(() => {
    const randomQuote =
      quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  // -------------------------
  // Breathing Logic
  // -------------------------
  const startBreathing = () => {
    if (isRunning) return;

    setIsRunning(true);
    const phases = ["Inhale", "Hold", "Exhale"];
    let index = 0;
    setPhase(phases[index]);

    const interval = setInterval(() => {
      index = (index + 1) % phases.length;
      setPhase(phases[index]);
    }, 4000);

    setTimeout(() => {
      clearInterval(interval);
      setIsRunning(false);
      setPhase("Ready");
      increaseScore(5); // reward breathing
    }, 36000);
  };

  // -------------------------
  // Global Score Logic
  // -------------------------
  const increaseScore = (points = 1) => {
    setTotalScore((prev) => prev + points);
    const newStreak = streak + 1;
    setStreak(newStreak);
    localStorage.setItem("relaxStreak", newStreak);
  };

  return (
    <div className="relax-page">
      {/* HEADER WITH SCORE BAR */}
      <div className="relax-header">
        <div className="relax-title-wrap">
          <h2>🌿 Relax & Recharge</h2>
          <p>Unwind your mind with guided breathing, ambient soundscapes, and relaxing games.</p>
        </div>

        <div className="score-bar">
          <div className="score-badge highlight">
            🏆 Relax Score: <strong>{totalScore}</strong>
          </div>
          <div className="score-badge">
            🔥 Streak: <strong>{streak} Days</strong>
          </div>
        </div>
      </div>

      {/* MINDFULNESS QUOTE */}
      <div className="quote-box">
        <p>"{quote}"</p>
      </div>

      {/* TOP 2 FEATURE CARDS */}
      <div className="relax-top-grid">
        {/* Guided Breathing */}
        <div className="relax-card">
          <h3>🧘 Guided Breathing</h3>
          <div className={`breathing-ring ${isRunning ? "active" : ""}`}>
            <span>{phase}</span>
          </div>
          <button className="relax-btn" onClick={startBreathing}>
            {isRunning ? "Session Running..." : "Start 4-4-4 Session"}
          </button>
        </div>

        {/* Relaxing Music */}
        <div className="relax-card">
          <h3>🎵 Relaxing Music & Ambience</h3>
          <select
            className="music-select"
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
          >
            <option value="" disabled>
              🎵 Choose a soundscape...
            </option>
            {tracks.map((track, index) => (
              <option key={index} value={track.file}>
                {track.name}
              </option>
            ))}
          </select>
          <MusicPlayer track={selectedTrack} />
        </div>
      </div>

      {/* GAMES SECTION */}
      <div className="games-section">
        <div className="games-header">
          <h3>🎮 Mindful Mini-Games</h3>

          {/* GAME TAB SELECTORS */}
          <div className="game-tabs">
            {GAMES.map((g) => (
              <button
                key={g.id}
                className={`game-tab-btn ${activeGame === g.id ? "active" : ""}`}
                onClick={() => setActiveGame(g.id)}
              >
                <span>{g.icon}</span>
                <span>{g.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* UNIFIED GAME ARENA */}
        <div className="game-arena">
          {activeGame === "bubble" && (
            <BubbleGame onScore={increaseScore} />
          )}
          {activeGame === "memory" && (
            <MemoryGame onScore={increaseScore} />
          )}
          {activeGame === "color" && (
            <ColorMatchGame onScore={increaseScore} />
          )}
          {activeGame === "reaction" && (
            <ReactionGame onScore={increaseScore} />
          )}
          {activeGame === "timer" && (
            <TimerGame onScore={increaseScore} />
          )}
        </div>
      </div>
    </div>
  );
}

export default RelaxPage;