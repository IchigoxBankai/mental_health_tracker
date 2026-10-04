import React, { useState, useEffect } from "react";
import "./ReactionGame.css";

function ReactionGame({ onScore }) {
  const [status, setStatus] = useState("idle"); // idle, waiting, ready, tooSoon, result
  const [startTime, setStartTime] = useState(null);
  const [reactionTime, setReactionTime] = useState(null);
  const [bestTime, setBestTime] = useState(
    Number(localStorage.getItem("bestReactionTime")) || null
  );

  useEffect(() => {
    let timer;

    if (status === "waiting") {
      const delay = Math.random() * 2500 + 1500; // 1.5s - 4s
      timer = setTimeout(() => {
        setStatus("ready");
        setStartTime(Date.now());
      }, delay);
    }

    return () => clearTimeout(timer);
  }, [status]);

  const startGame = () => {
    setReactionTime(null);
    setStatus("waiting");
  };

  const handleClick = () => {
    if (status === "waiting") {
      setStatus("tooSoon");
      return;
    }

    if (status === "ready") {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setStatus("result");

      if (!bestTime || time < bestTime) {
        setBestTime(time);
        localStorage.setItem("bestReactionTime", time);
      }

      if (onScore) {
        if (time < 220) onScore(6);
        else if (time < 300) onScore(4);
        else onScore(2);
      }
    }
  };

  const getRating = (time) => {
    if (time < 200) return { text: "🚀 Lightning Fast Reflexes!", color: "#2ed573" };
    if (time < 260) return { text: "🔥 Excellent Reaction Time!", color: "#2ecc71" };
    if (time < 340) return { text: "👍 Good Reflexes!", color: "#3498db" };
    return { text: "🧘 Relax & Try Again!", color: "#ff9f43" };
  };

  return (
    <div className="reaction-wrapper">
      <div className="reaction-title-block">
        <h3>⚡ Reaction Speed Test</h3>
        <p>Test your brain-eye coordination. When the box turns green, click as fast as possible!</p>
        {bestTime && (
          <span className="reaction-best-pill">
            👑 Best Record: {bestTime} ms
          </span>
        )}
      </div>

      {/* IDLE / START SCREEN */}
      {status === "idle" && (
        <div className="reaction-card">
          <div style={{ fontSize: "44px" }}>🎯</div>
          <p>Click below to begin. Be ready to tap as soon as the screen flashes green!</p>
          <button className="reaction-btn" onClick={startGame}>
            ▶ Start Reaction Test
          </button>
        </div>
      )}

      {/* ACTIVE CLICK ARENA (WAITING OR READY) */}
      {(status === "waiting" || status === "ready") && (
        <div className={`reaction-box ${status}`} onClick={handleClick}>
          <div className="reaction-box-text">
            {status === "waiting" ? "🔴 Wait for Green..." : "⚡ CLICK NOW! ⚡"}
          </div>
          <div className="reaction-box-sub">
            {status === "waiting" ? "Don't click yet!" : "Tap as fast as you can!"}
          </div>
        </div>
      )}

      {/* TOO SOON SCREEN */}
      {status === "tooSoon" && (
        <div className="reaction-card">
          <div style={{ fontSize: "40px" }}>⚠️</div>
          <h3 style={{ margin: "4px 0", color: "#ff4757" }}>Too Early!</h3>
          <p>You clicked before the box turned green. Wait for the green signal.</p>
          <button className="reaction-btn" onClick={startGame}>
            🔄 Try Again
          </button>
        </div>
      )}

      {/* RESULT SCREEN */}
      {status === "result" && (
        <div className="reaction-card">
          <div className="reaction-time-display">{reactionTime} ms</div>
          <div
            className="reaction-rating-badge"
            style={{
              color: getRating(reactionTime).color,
              borderColor: `${getRating(reactionTime).color}50`,
              background: `${getRating(reactionTime).color}15`,
            }}
          >
            {getRating(reactionTime).text}
          </div>
          <button className="reaction-btn" onClick={startGame}>
            🔄 Test Again
          </button>
        </div>
      )}
    </div>
  );
}

export default ReactionGame;