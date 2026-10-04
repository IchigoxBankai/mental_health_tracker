import React, { useState } from "react";
import "./TimerGame.css";

const TimerGame = ({ onScore }) => {
  const [selectedTime, setSelectedTime] = useState(10);
  const [gameStarted, setGameStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [result, setResult] = useState("");
  const [isWin, setIsWin] = useState(false);

  // Start Game
  const startGame = () => {
    if (!selectedTime) {
      alert("Please select a target time first!");
      return;
    }

    setGameStarted(true);
    setResult("");
    setStartTime(Date.now());
  };

  // Stop Button Click
  const stopGame = () => {
    const endTime = Date.now();
    const elapsedSeconds = (endTime - startTime) / 1000;
    const difference = Math.abs(elapsedSeconds - selectedTime);

    // Allow 1 second margin for win
    if (difference <= 1) {
      setIsWin(true);
      setResult(
        `🎉 Perfect! You stopped at ${elapsedSeconds.toFixed(2)}s (Target: ${selectedTime}s)`
      );
      onScore && onScore(5);
    } else {
      setIsWin(false);
      setResult(
        `❌ You missed! You stopped at ${elapsedSeconds.toFixed(2)}s (Target: ${selectedTime}s)`
      );
    }

    setGameStarted(false);
  };

  // Reset Game
  const resetGame = () => {
    setGameStarted(false);
    setResult("");
  };

  return (
    <div className="timer-container">
      <h3>⏱️ Focus Timer Challenge</h3>
      <p>Test your internal clock. Click Stop as close to the target time as possible!</p>

      {/* TIME OPTIONS */}
      {!gameStarted && !result && (
        <>
          <div className="timer-time-options">
            {[5, 10, 15, 30].map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`timer-option-btn ${selectedTime === time ? "selected" : ""}`}
              >
                {time} Seconds
              </button>
            ))}
          </div>

          <button
            onClick={startGame}
            className="timer-action-btn start"
          >
            ▶ Start Focus Test
          </button>
        </>
      )}

      {/* GAME AREA */}
      {gameStarted && (
        <>
          <div className="focus-circle active">
            <span>⏱️ ...</span>
          </div>

          <p style={{ fontWeight: 600, fontSize: "16px", color: "var(--text-color)" }}>
            Count in your head and click STOP at <strong>{selectedTime}s</strong>!
          </p>

          <button onClick={stopGame} className="timer-action-btn stop">
            🛑 STOP NOW
          </button>
        </>
      )}

      {/* RESULT */}
      {result && (
        <div className={`timer-result-box ${isWin ? "win" : "lose"}`}>
          <p style={{ margin: 0, fontWeight: 700 }}>{result}</p>
          <button onClick={resetGame} className="timer-action-btn reset">
            🔄 Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default TimerGame;