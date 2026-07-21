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
    easy: 1200,
    medium: 700,
    hard: 400
  };

  const animationSpeed = {
    easy: "5s",
    medium: "3s",
    hard: "2s"
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
      const size = Math.random() * 40 + 40;
      const rand = Math.random();

      let type = "normal";
      if (rand < 0.08) type = "gold";
      else if (rand < 0.18) type = "red";
      else if (rand < 0.23) type = "black";

      const newBubble = {
        id: Date.now() + Math.random(),
        left: Math.random() * 85,
        size,
        type
      };

      setBubbles((prev) => [...prev, newBubble]);

      setTimeout(() => {
        setBubbles((prev) =>
          prev.filter((b) => b.id !== newBubble.id)
        );
      }, 6000);
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
    } catch (err) {}

    setBubbles((prev) => prev.filter((b) => b.id !== bubble.id));

    // 💀 Black bubble = instant game over
    if (bubble.type === "black") {
      setGameActive(false);
      return;
    }

    let points = 1;
    if (bubble.type === "gold") points = 5;
    if (bubble.type === "red") points = -1;

    const now = Date.now();
    if (lastPopTime.current && now - lastPopTime.current < 700) {
      points += 2;
      setCombo((prev) => prev + 1);
    } else {
      setCombo(1);
    }

    lastPopTime.current = now;

    setScore((prev) => Math.max(0, prev + points));
    if (onScore) onScore(points);

    const float = {
      id: Date.now() + Math.random(),
      left: bubble.left,
      value: points
    };

    setFloatingScores((prev) => [...prev, float]);

    setTimeout(() => {
      setFloatingScores((prev) =>
        prev.filter((f) => f.id !== float.id)
      );
    }, 1000);
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

      <div className="game-header">
        <div>⏳ {timeLeft}s</div>
        <div>🏆 Score: {score}</div>
        <div>🔥 Combo: {combo}</div>
      </div>

      <div className="difficulty-select">
        <button disabled={gameStarted} onClick={() => setDifficulty("easy")}>Easy</button>
        <button disabled={gameStarted} onClick={() => setDifficulty("medium")}>Medium</button>
        <button disabled={gameStarted} onClick={() => setDifficulty("hard")}>Hard</button>
      </div>

      {!gameStarted && (
        <div className="start-screen">
          <h3>Bubble Challenge</h3>
          <p>Select Difficulty & Start</p>
          <button onClick={startGame}>Start Game</button>
        </div>
      )}

      {gameStarted && !gameActive && (
        <div className="end-screen">
          <h3>Game Over!</h3>
          <p>Your Score: {score}</p>
          <p>🏆 Record: {highScore}</p>
          <button onClick={restartGame}>Play Again</button>
        </div>
      )}

      <div className="bubble-container">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className={`bubble ${bubble.type}`}
            style={{
              left: `${bubble.left}%`,
              width: bubble.size,
              height: bubble.size,
              animationDuration: animationSpeed[difficulty]
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