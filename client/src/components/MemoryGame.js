import React, { useState, useEffect } from "react";
import "./MemoryGame.css";

const colors = ["#6C5CE7", "#00B894", "#0984E3", "#FD79A8"];

function MemoryGame() {
  const [sequence, setSequence] = useState([]);
  const [userInput, setUserInput] = useState([]);
  const [activeTile, setActiveTile] = useState(null);
  const [level, setLevel] = useState(0);
  const [isUserTurn, setIsUserTurn] = useState(false);
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (sequence.length > 0) {
      playSequence();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sequence]);

  // -------------------------
  // START GAME
  // -------------------------
  const startGame = () => {
    setSequence([]);
    setUserInput([]);
    setLevel(1);
    setGameOver(false);
    setMessage("Watch the pattern...");
    addNewStep([]);
  };

  // -------------------------
  // ADD STEP
  // -------------------------
  const addNewStep = (currentSeq) => {
    const next = Math.floor(Math.random() * 4);
    const newSeq = [...currentSeq, next];
    setSequence(newSeq);
  };

  // -------------------------
  // PLAY PATTERN
  // -------------------------
  const playSequence = async () => {
    setIsUserTurn(false);

    for (let i = 0; i < sequence.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setActiveTile(sequence[i]);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setActiveTile(null);
    }

    setMessage("Your turn!");
    setIsUserTurn(true);
  };

  // -------------------------
  // USER CLICK
  // -------------------------
  const handleClick = (index) => {
    if (!isUserTurn || gameOver) return;

    const newInput = [...userInput, index];
    setUserInput(newInput);

    // ❌ WRONG PATTERN
    if (sequence[newInput.length - 1] !== index) {
      setMessage("❌ Game Over! Wrong Pattern");
      setGameOver(true);
      setIsUserTurn(false);
      return;
    }

    // ✅ LEVEL COMPLETE
    if (newInput.length === sequence.length) {
      setMessage("✅ Correct!");
      setLevel((prev) => prev + 1);
      setUserInput([]);

      setTimeout(() => {
        addNewStep(sequence);
      }, 800);
    }
  };

  return (
    <div className="memory-container">
      <h4>Level: {level}</h4>

      <p className="memory-message">{message}</p>

      <div className="grid">
        {colors.map((color, index) => (
          <div
            key={index}
            className={`tile ${
              activeTile === index ? "active" : ""
            }`}
            style={{ backgroundColor: color }}
            onClick={() => handleClick(index)}
          />
        ))}
      </div>

      <button className="memory-btn" onClick={startGame}>
        {gameOver || level === 0 ? "Start Game" : "Restart"}
      </button>
    </div>
  );
}

export default MemoryGame;