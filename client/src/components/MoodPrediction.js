import React, { useEffect, useState } from "react";
import { getMoodHistory } from "../services/moodService";
import { predictMood } from "../utils/moodPredictor";

const MoodPrediction = () => {
  const [prediction, setPrediction] = useState("");

  useEffect(() => {
    const fetchPrediction = async () => {
      const history = await getMoodHistory();
      const result = predictMood(history);
      setPrediction(result);
    };

    fetchPrediction();
  }, []);

  return (
    <div className="prediction-card">
      <h3>AI Mood Prediction</h3>
      <p>Tomorrow you might feel:</p>
      <h2>{prediction}</h2>
    </div>
  );
};

export default MoodPrediction;
