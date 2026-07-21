import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db, auth } from "../services/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import "./MoodStreakCard.css";

const MoodStreakCard = () => {
  const [streak, setStreak] = useState(0);
  const [badge, setBadge] = useState("");
  const [user, setUser] = useState(null);

  /* ===== AUTH LISTENER ===== */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, []);

  /* ===== Calculate Streak ===== */

  useEffect(() => {
    if (!user) return;

    const calculateStreak = async () => {
      try {
        const moodQuery = query(
          collection(db, "users", user.uid, "moods"),
          orderBy("timestamp", "desc")
        );

        const snapshot = await getDocs(moodQuery);

        const dates = snapshot.docs
          .map((doc) => doc.data().timestamp?.toDate?.())
          .filter(Boolean)
          .map((date) => new Date(date.toDateString())) // remove time
          .sort((a, b) => b - a);

        if (dates.length === 0) return;

        let currentStreak = 1;

        for (let i = 0; i < dates.length - 1; i++) {
          const diff =
            (dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24);

          if (diff === 1) {
            currentStreak++;
          } else if (diff === 0) {
            continue; // ignore same-day duplicates
          } else {
            break;
          }
        }

        setStreak(currentStreak);

        /* ===== Assign Badge ===== */

        if (currentStreak >= 30) setBadge("👑 Aura Master");
        else if (currentStreak >= 14) setBadge("🌟 Dedicated");
        else if (currentStreak >= 7) setBadge("💪 Consistent");
        else if (currentStreak >= 3) setBadge("🌱 Getting Started");
        else setBadge("✨ Keep Going!");

      } catch (error) {
        console.error("Error calculating streak:", error);
      }
    };

    calculateStreak();
  }, [user]);

  return (
    <div className="streak-card">
      <h3>🔥 Mood Streak</h3>

      <div className="streak-number">{streak} Days</div>

      <div className="streak-badge">{badge}</div>

      <p className="streak-message">
        Consistency builds emotional awareness. Keep tracking your mood daily!
      </p>
    </div>
  );
};

export default MoodStreakCard;