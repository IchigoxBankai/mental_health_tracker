export const predictMood = (moodHistory) => {
  if (moodHistory.length === 0) return "No Data";

  const moodCount = {};

  moodHistory.forEach(entry => {
    const mood = entry.mood;
    moodCount[mood] = (moodCount[mood] || 0) + 1;
  });

  // Find most frequent mood
  let predictedMood = null;
  let maxCount = 0;

  for (let mood in moodCount) {
    if (moodCount[mood] > maxCount) {
      maxCount = moodCount[mood];
      predictedMood = mood;
    }
  }

  return predictedMood;
};
