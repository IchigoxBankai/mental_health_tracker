import { useEffect, useState } from "react";
import InAppNotification from "./InAppNotification";

export default function ReminderListener() {

  const [showPopup, setShowPopup] = useState(false);
  const [lastTriggered, setLastTriggered] = useState(null);
  const [message, setMessage] = useState("");

  // 🌿 AuraTrack Dynamic Messages
  const reminderMessages = [
    "🌿 Quick mood check? AuraTrack is ready.",
    "✨ Take a moment — how are you feeling today?",
    "🧠 Let’s track today’s emotional vibe.",
    "💚 Your feelings matter. Log your mood.",
    "🌈 Every emotion tells a story — record yours.",
    "⚡ 10-second mental check-in time!",
    "🌙 Pause and reflect with AuraTrack.",
    "🚀 Your daily mood insight awaits.",
    "😊 How has your day been feeling?",
    "🌱 Small check-ins create big self-awareness."
  ];

  // ✅ Random Message Generator
  const getRandomMessage = () => {
    const index = Math.floor(
      Math.random() * reminderMessages.length
    );
    return reminderMessages[index];
  };

  // ✅ Trigger Reminder
  const triggerReminder = () => {

    setMessage(getRandomMessage()); // ⭐ dynamic message
    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
    }, 5000);
  };

  useEffect(() => {

    const interval = setInterval(() => {

      const enabled =
        localStorage.getItem("reminderEnabled") === "true";

      const reminderTime =
        localStorage.getItem("reminderTime");

      if (!enabled || !reminderTime) return;

      const now = new Date();

      const currentTime =
        now.getHours().toString().padStart(2, "0") +
        ":" +
        now.getMinutes().toString().padStart(2, "0");

      // ✅ Prevent repeat trigger
      if (
        currentTime === reminderTime &&
        lastTriggered !== currentTime
      ) {
        triggerReminder();
        setLastTriggered(currentTime);
      }

    }, 1000);

    return () => clearInterval(interval);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastTriggered]);

  return (
    <InAppNotification
      show={showPopup}
      message={message}
    />
  );
}