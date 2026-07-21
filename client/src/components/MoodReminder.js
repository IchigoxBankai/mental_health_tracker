import { useEffect } from "react";
import { auth, db } from "../services/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const MoodReminder = () => {

  useEffect(() => {

    // ⭐ Ask Notification Permission
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    let lastTriggered = null;

    const checkReminder = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const reminderRef = doc(
          db,
          "users",
          user.uid,
          "settings",
          "reminder"
        );

        const snap = await getDoc(reminderRef);

        if (!snap.exists()) return;

        const reminderTime = snap.data().time;
        if (!reminderTime) return;

        const now = new Date();

        const currentTime =
          now.getHours().toString().padStart(2, "0") +
          ":" +
          now.getMinutes().toString().padStart(2, "0");

        // ⭐ Prevent multiple notifications same minute
        if (
          currentTime === reminderTime &&
          lastTriggered !== currentTime
        ) {
         if (Notification.permission === "granted") {
  new Notification("AuraTrack Reminder 💙", {
    body: "Don't forget to log your mood today 🌿",
    icon: "/logo192.png"
  });
}

          lastTriggered = currentTime;
        }

      } catch (error) {
        console.log("Reminder error:", error);
      }
    };

    // ⭐ Run every 30 seconds
    const interval = setInterval(checkReminder, 30000);

    return () => clearInterval(interval);

  }, []);

  return null;
};

export default MoodReminder;
