import React, { useState, useEffect } from "react";

const TimerGame = () => {
  const [selectedTime, setSelectedTime] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [result, setResult] = useState("");

  // Start Game
  const startGame = () => {
    if (!selectedTime) {
      alert("Please select a time first!");
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

    // Allow 1 second margin
    if (difference <= 1) {
      setResult(
        `✅ You Win! You clicked at ${elapsedSeconds.toFixed(2)} seconds`
      );
    } else {
      setResult(
        `❌ You Lost! You clicked at ${elapsedSeconds.toFixed(2)} seconds`
      );
    }

    setGameStarted(false);
  };

  // Reset Game
  const resetGame = () => {
    setGameStarted(false);
    setSelectedTime(null);
    setResult("");
  };

  return (
    <div style={{ textAlign: "center", padding: "30px" }}>
      <h2>⏱ Timer Challenge Game</h2>

      {/* TIME OPTIONS */}
      {!gameStarted && (
        <>
          <h3>Select Time</h3>

          <div style={{ marginBottom: "20px" }}>
            {[10, 20, 30, 60].map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                style={{
                  margin: "10px",
                  padding: "10px 20px",
                  background:
                    selectedTime === time ? "#4CAF50" : "#4f5bcace",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                {time === 60 ? "1 Min" : `${time} Sec`}
              </button>
            ))}
          </div>

          <button
            onClick={startGame}
            style={{
              padding: "12px 25px",
              background: "#1b5381",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Start Game
          </button>
        </>
      )}

      {/* GAME AREA */}
      {gameStarted && (
        <>
          <h3>Wait... and click STOP exactly at {selectedTime}s</h3>

          <button
            onClick={stopGame}
            style={{
              padding: "15px 30px",
              background: "red",
              color: "white",
              border: "none",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            STOP
          </button>
        </>
      )}

      {/* RESULT */}
      {result && (
        <>
          <h3 style={{ marginTop: "20px" }}>{result}</h3>
          <button onClick={resetGame}>Play Again</button>
        </>
      )}
    </div>
  );
};

export default TimerGame;