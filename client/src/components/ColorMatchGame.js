import React, { useState, useEffect } from "react";
import "./ColorMatchGame.css";

const COLOR_MAP = [
  { name: "Red", value: "#ff4757", classKey: "red" },
  { name: "Blue", value: "#2e86de", classKey: "blue" },
  { name: "Green", value: "#10ac84", classKey: "green" },
  { name: "Yellow", value: "#ffa502", classKey: "yellow" },
];

function ColorMatchGame({ onScore }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [targetWord, setTargetWord] = useState("Red");
  const [textColorObj, setTextColorObj] = useState(COLOR_MAP[0]);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(
    Number(localStorage.getItem("colorMatchHighScore")) || 0
  );

  /* ---------- TIMER ---------- */
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  /* ---------- HIGH SCORE ---------- */
  useEffect(() => {
    if (gameOver && score > highScore) {
      setHighScore(score);
      localStorage.setItem("colorMatchHighScore", score);
    }
  }, [gameOver, score, highScore]);

  /* ---------- NEW ROUND ---------- */
  const generateRound = () => {
    const randomWordObj =
      COLOR_MAP[Math.floor(Math.random() * COLOR_MAP.length)];
    const randomColorObj =
      COLOR_MAP[Math.floor(Math.random() * COLOR_MAP.length)];

    setTargetWord(randomWordObj.name);
    setTextColorObj(randomColorObj);
  };

  const handleStart = () => {
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setGameStarted(true);
    generateRound();
  };

  /* ---------- ANSWER ---------- */
  const handleAnswer = (selectedColorName) => {
    if (gameOver || !gameStarted) return;

    if (selectedColorName.toLowerCase() === textColorObj.name.toLowerCase()) {
      setScore((prev) => prev + 1);
      onScore && onScore(2);
    } else {
      setScore((prev) => Math.max(0, prev - 1));
    }

    generateRound();
  };

  return (
    <div className="color-game-wrapper">
      <div className="color-game-header">
        <div>⏳ Time: {timeLeft}s</div>
        <div>🏆 Score: {score}</div>
        <div>👑 Record: {highScore}</div>
      </div>

      {/* START SCREEN */}
      {!gameStarted && (
        <div className="color-card">
          <div style={{ fontSize: "40px" }}>🎨</div>
          <h3 style={{ fontSize: "22px", fontWeight: 800, margin: "4px 0" }}>
            Color Reflex Challenge
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "4px 0 16px" }}>
            Train your brain with the Stroop effect! Select the <strong>font color</strong> of the text, not what the word says!
          </p>
          <button className="color-play-btn" onClick={handleStart}>
            ▶ Start Challenge
          </button>
        </div>
      )}

      {/* ACTIVE PLAY SCREEN */}
      {gameStarted && !gameOver && (
        <div className="color-card">
          <div className="color-prompt-box">
            <span className="color-instruction">Select the Font Color:</span>
            <div
              className="color-target-word"
              style={{ color: textColorObj.value }}
            >
              {targetWord}
            </div>
          </div>

          <div className="color-options-grid">
            {COLOR_MAP.map((c) => (
              <button
                key={c.name}
                className={`color-choice-btn ${c.classKey}`}
                onClick={() => handleAnswer(c.name)}
              >
                ● {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* GAME OVER SCREEN */}
      {gameOver && (
        <div className="color-card">
          <div style={{ fontSize: "42px" }}>🎉</div>
          <h3 style={{ fontSize: "22px", fontWeight: 800, margin: "4px 0" }}>
            Time's Up!
          </h3>
          <p style={{ fontSize: "16px", margin: "4px 0" }}>
            Final Score: <strong>{score}</strong>
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "0 0 12px" }}>
            👑 Personal Record: {highScore}
          </p>
          <button className="color-play-btn" onClick={handleStart}>
            🔄 Play Again
          </button>
        </div>
      )}
    </div>
  );
}

export default ColorMatchGame;