import React, { useState, useEffect, useRef } from "react";
import "./BubbleGame.css";
import popSoundFile from "../assets/pop.mp3";

function BubbleGame({ onScore }) {
  const [bubbles, setBubbles] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [difficulty, setDifficulty] = useState("medium");
  const [combo, setCombo] = useState(0);
  const [floatingScores, setFloatingScores] = useState([]);
  const [gameActive, setGameActive] = useState(false);
  const [highScore, setHighScore] = useState(
    Number(localStorage.getItem("bubbleHighScore")) || 0
  );

  const lastPopTime = useRef(null);
  const popSound = useRef(new Audio(popSoundFile));

  const difficultySettings = {
    easy: 1100,
    medium: 650,
    hard: 380,
  };

  const animationSpeed = {
    easy: "4.5s",
    medium: "2.8s",
    hard: "1.8s",
  };

  /* ================= TIMER ================= */
  useEffect(() => {
    if (!gameStarted || !gameActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameActive]);

  /* ================= BUBBLE GENERATOR ================= */
  useEffect(() => {
    if (!gameStarted || !gameActive) return;

    const interval = setInterval(() => {
      const size = Math.random() * 35 + 45;
      const rand = Math.random();

      let type = "normal";
      if (rand < 0.1) type = "gold";
      else if (rand < 0.22) type = "red";
      else if (rand < 0.28) type = "black";

      const newBubble = {
        id: Date.now() + Math.random(),
        left: Math.random() * 82 + 5,
        size,
        type,
      };

      setBubbles((prev) => [...prev, newBubble]);

      setTimeout(() => {
        setBubbles((prev) => prev.filter((b) => b.id !== newBubble.id));
      }, 5500);
    }, difficultySettings[difficulty]);

    return () => clearInterval(interval);
  }, [difficulty, gameStarted, gameActive]);

  /* ================= SAVE HIGH SCORE ================= */
  useEffect(() => {
    if (!gameActive && gameStarted) {
      if (score > highScore) {
        localStorage.setItem("bubbleHighScore", score);
        setHighScore(score);
      }
    }
  }, [gameActive, gameStarted, score, highScore]);

  /* ================= POP ================= */
  const popBubble = (bubble) => {
    if (!gameActive || !gameStarted) return;

    try {
      popSound.current.currentTime = 0;
      popSound.current.play().catch(() => {});
    } catch {}

    const now = Date.now();
    let currentCombo = combo;

    if (lastPopTime.current && now - lastPopTime.current < 1200) {
      currentCombo += 1;
    } else {
      currentCombo = 1;
    }

    lastPopTime.current = now;
    setCombo(currentCombo);

    let points = 1;
    if (bubble.type === "gold") points = 5;
    if (bubble.type === "red") points = -2;
    if (bubble.type === "black") points = 0;

    const totalPoints = points * (currentCombo > 2 ? 2 : 1);

    setScore((prev) => Math.max(0, prev + totalPoints));
    onScore && onScore(totalPoints);

    setBubbles((prev) => prev.filter((b) => b.id !== bubble.id));

    const float = {
      id: Date.now() + Math.random(),
      left: bubble.left,
      value: totalPoints,
    };

    setFloatingScores((prev) => [...prev, float]);

    setTimeout(() => {
      setFloatingScores((prev) => prev.filter((f) => f.id !== float.id));
    }, 800);
  };

  /* ================= START GAME ================= */
  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setCombo(0);
    setBubbles([]);
    setFloatingScores([]);
    setGameStarted(true);
    setGameActive(true);
  };

  /* ================= RESTART ================= */
  const restartGame = () => {
    setGameStarted(false);
    setGameActive(false);
  };

  return (
    <div className="bubble-wrapper">
      {/* STATS BAR */}
      <div className="bubble-header">
        <div className="bubble-stat-pill">⏳ {timeLeft}s</div>
        <div className="bubble-stat-pill">🏆 Score: {score}</div>
        <div className="bubble-stat-pill">🔥 Combo: x{combo}</div>
        <div className="bubble-stat-pill">👑 Best: {highScore}</div>
      </div>

      {/* START SCREEN */}
      {!gameStarted && (
        <div className="bubble-center-card">
          <h3>🫧 Bubble Pop Challenge</h3>
          <p>Pop glowing bubbles to relieve stress and earn calm score points!</p>

          <div className="difficulty-selector">
            <button
              className={`diff-btn ${difficulty === "easy" ? "active" : ""}`}
              onClick={() => setDifficulty("easy")}
            >
              🟢 Easy
            </button>
            <button
              className={`diff-btn ${difficulty === "medium" ? "active" : ""}`}
              onClick={() => setDifficulty("medium")}
            >
              🟡 Medium
            </button>
            <button
              className={`diff-btn ${difficulty === "hard" ? "active" : ""}`}
              onClick={() => setDifficulty("hard")}
            >
              🔴 Hard
            </button>
          </div>

          <button className="bubble-play-btn" onClick={startGame}>
            ▶ Start Game
          </button>
        </div>
      )}

      {/* END SCREEN */}
      {gameStarted && !gameActive && (
        <div className="bubble-center-card">
          <h3>🎉 Game Finished!</h3>
          <p>You scored <strong>{score} points</strong> this round.</p>
          <p>👑 Personal Record: <strong>{highScore}</strong></p>

          <button className="bubble-play-btn" onClick={restartGame}>
            🔄 Play Again
          </button>
        </div>
      )}

      {/* ACTIVE PLAY CANVAS */}
      <div className="bubble-container">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className={`bubble ${bubble.type}`}
            style={{
              left: `${bubble.left}%`,
              width: bubble.size,
              height: bubble.size,
              animationDuration: animationSpeed[difficulty],
            }}
            onClick={() => popBubble(bubble)}
          />
        ))}

        {floatingScores.map((f) => (
          <div
            key={f.id}
            className="floating-score"
            style={{ left: `${f.left}%` }}
          >
            {f.value > 0 ? `+${f.value}` : f.value}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BubbleGame;