import React, { useState, useEffect } from "react";
import "./ColorMatchGame.css";

const colors = ["Red", "Blue", "Green", "Yellow"];

function ColorMatchGame({ onScore }) {

  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [word, setWord] = useState("");
  const [color, setColor] = useState("");
  const [gameOver, setGameOver] = useState(false);

  /* ---------- TIMER ---------- */
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  /* ---------- NEW QUESTION ---------- */
  const generateRound = () => {
    const randomWord =
      colors[Math.floor(Math.random() * colors.length)];

    const randomColor =
      colors[Math.floor(Math.random() * colors.length)];

    setWord(randomWord);
    setColor(randomColor.toLowerCase());
  };

  useEffect(() => {
    if (gameStarted) generateRound();
  }, [gameStarted]);

  /* ---------- ANSWER ---------- */
  const handleAnswer = (selected) => {
    if (gameOver) return;

    if (selected === color) {
      setScore(prev => prev + 1);
      onScore && onScore(2);
    }

    generateRound();
  };

  const restartGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setGameStarted(false);
  };

  return (
    <div className="color-game">

      {!gameStarted && (
        <button onClick={() => setGameStarted(true)}>
          Start Color Match
        </button>
      )}

      {gameStarted && !gameOver && (
        <>
          <h3>Time: {timeLeft}s</h3>

          <div
            className="color-word"
            style={{ color: color }}
          >
            {word}
          </div>

          <p>Select TEXT COLOR</p>

          <div className="color-options">
            {colors.map(c => (
              <button
                key={c}
                onClick={() =>
                  handleAnswer(c.toLowerCase())
                }
              >
                {c}
              </button>
            ))}
          </div>

          <h4>Score: {score}</h4>
        </>
      )}

      {gameOver && (
        <div className="result-box">
          <h3>Game Over</h3>
          <p>Score: {score}</p>
          <button onClick={restartGame}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

export default ColorMatchGame;