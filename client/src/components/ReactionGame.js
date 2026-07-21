import React, { useState, useEffect } from "react";
import "./ReactionGame.css";

function ReactionGame({ onScore }) {

  const [status, setStatus] = useState("idle");
  const [startTime, setStartTime] = useState(null);
  const [reactionTime, setReactionTime] = useState(null);

  useEffect(() => {
    let timer;

    if (status === "waiting") {
      timer = setTimeout(() => {
        setStatus("ready");
        setStartTime(Date.now());
      }, Math.random() * 3000 + 2000);
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

      if (onScore) {
        if (time < 250) onScore(5);
        else onScore(2);
      }
    }
  };

  return (
    <div className="reaction-container">

      {status === "idle" && (
        <button onClick={startGame}>
          Start Reaction Test
        </button>
      )}

      {(status === "waiting" ||
        status === "ready") && (
        <div
          className={`reaction-box ${status}`}
          onClick={handleClick}
        >
          {status === "waiting"
            ? "Wait..."
            : "CLICK NOW!"}
        </div>
      )}

      {status === "tooSoon" && (
        <>
          <p>Too Soon 😅</p>
          <button onClick={startGame}>
            Try Again
          </button>
        </>
      )}

      {status === "result" && (
        <>
          <h3>{reactionTime} ms</h3>
          <button onClick={startGame}>
            Play Again
          </button>
        </>
      )}
    </div>
  );
}

export default ReactionGame;