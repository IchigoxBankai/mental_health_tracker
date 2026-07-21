export const getAIResponse = (message) => {
  const text = message.toLowerCase();

  if (text.includes("sad") || text.includes("depressed")) {
    return "I'm really sorry you're feeling this way 💙 You are not alone. Maybe try journaling or talking to someone you trust.";
  }

  if (text.includes("stress") || text.includes("pressure")) {
    return "Stress can feel overwhelming 😔 Try deep breathing or taking a short break.";
  }

  if (text.includes("happy") || text.includes("good")) {
    return "That’s wonderful to hear 😊 Keep doing what makes you happy!";
  }

  if (text.includes("tired")) {
    return "You sound tired 😴 Getting proper rest might help.";
  }

  return "I'm here to listen 💫 Tell me more.";
};
