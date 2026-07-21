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
  "Progress, not perfection."
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
  { name: "Silhouette", file: "/music/Silhouette.mp3" }
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
      <h2 className="main-title">🌿 Relax & Recharge</h2>

      {/* Score Bar */}
      <div className="score-bar">
        <div>🏆 Relax Score: {totalScore}</div>
        <br></br>
        <div>🔥 Streak: {streak} days</div>
      </div>
<br></br>
      {/* Quote */}
      <div className="quote-box">
        <p>"{quote}"</p>
      </div>

      <div className="top-row">

        {/* Breathing Card */}
        <div className="card">
          <h3>🧘 Guided Breathing</h3>

          <div className={`breathing-ring ${isRunning ? "active" : ""}`}>
            <span>{phase}</span>
          </div>

          <button onClick={startBreathing}>
            {isRunning ? "Session Running..." : "Start Session"}
          </button>
        </div>

        {/* Music Card */}
        <div className="card">
          <h3>🎵 Relaxing Music</h3>

         <select
  className="music-select"
  value={selectedTrack}
  onChange={(e) => setSelectedTrack(e.target.value)}
>
  <option value="" disabled>
    🎵 Select a Song
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

      {/* Games Section */}
      <div className="games-section">
        <h3>🎮 Relax Games</h3>

        <div className="game-tabs">
          <button
            className={activeGame === "bubble" ? "active-tab" : ""}
            onClick={() => setActiveGame("bubble")}
          >
            Bubble
          </button>

          <button
            className={activeGame === "memory" ? "active-tab" : ""}
            onClick={() => setActiveGame("memory")}
          >
            Memory
          </button>

          <button
            className={activeGame === "color" ? "active-tab" : ""}
            onClick={() => setActiveGame("color")}
          >
            Color
          </button>
<button onClick={() => setActiveGame("reaction")}>Reaction</button>
          <button
            className={activeGame === "timer" ? "active-tab" : ""}
            onClick={() => setActiveGame("timer")}
          >
            Timer
          </button>
        </div>

        <div className="game-display">
          <div key={activeGame} className="game-wrapper">
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
    </div>
  );
}

export default RelaxPage;