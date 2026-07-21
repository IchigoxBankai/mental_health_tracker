import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./ReminderSettings.css";

export default function ReminderSettings() {

  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("09:00");
  const [saved, setSaved] = useState(false);
  const [showClock, setShowClock] = useState(false);

  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("00");

  /* ======================================
     ✅ LOAD SAVED SETTINGS (ADD THIS)
  ====================================== */
  useEffect(() => {
    const savedTime = localStorage.getItem("reminderTime");
    const savedEnabled =
      localStorage.getItem("reminderEnabled") === "true";

    if (savedTime) {
      setTime(savedTime);

      const [h, m] = savedTime.split(":");
      setHour(h);
      setMinute(m);
    }

    if (savedEnabled) setEnabled(true);
  }, []);

  /* ======================================
     APPLY SELECTED TIME
  ====================================== */
  const applyTime = () => {
    const newTime = `${hour}:${minute}`;
    setTime(newTime);
    setShowClock(false);
  };

  /* ======================================
     SHOW NOTIFICATION
  ====================================== */
  const showReminderNotification = () => {
    if (Notification.permission === "granted") {
      new Notification("AuraTrack Reminder 🌿", {
        body: "Time to log your mood!",
        icon: "/logo192.png",
      });
    }
  };

  /* ======================================
     SAVE REMINDER
  ====================================== */
  const handleSave = async () => {
    await Notification.requestPermission();

    localStorage.setItem("reminderTime", time);
    localStorage.setItem("reminderEnabled", enabled);

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  /* ======================================
     REMINDER CHECKER
  ====================================== */
  useEffect(() => {

    let lastTriggeredDate = null;

    const interval = setInterval(() => {

      const enabledStored =
        localStorage.getItem("reminderEnabled") === "true";

      const reminderTime =
        localStorage.getItem("reminderTime");

      if (!enabledStored || !reminderTime) return;

      const now = new Date();
      const [rh, rm] = reminderTime.split(":");

      const reminderDate = new Date();
      reminderDate.setHours(rh);
      reminderDate.setMinutes(rm);
      reminderDate.setSeconds(0);

      const diff = Math.abs(now - reminderDate);
      const today = now.toDateString();

      if (diff < 30000 && lastTriggeredDate !== today) {
        showReminderNotification();
        lastTriggeredDate = today;
      }

    }, 15000);

    return () => clearInterval(interval);

  }, []);

  /* ======================================
     OPTIONS
  ====================================== */
  const hours =
    Array.from({ length: 24 }, (_, i) =>
      String(i).padStart(2, "0")
    );

  const minutes =
    Array.from({ length: 60 }, (_, i) =>
      String(i).padStart(2, "0")
    );

  return (
    <div className="reminder-card">

      {/* HEADER */}
      <div className="reminder-top">

        <div className="reminder-text">
          <h3>Daily Reminder</h3>
          <p>Mood check notification</p>
        </div>

        {/* ✅ TOGGLE SWITCH */}
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => {
              setEnabled(e.target.checked);
              localStorage.setItem(
                "reminderEnabled",
                e.target.checked
              );
            }}
          />
          <span className="toggle-slider"></span>
        </label>

      </div>

      <AnimatePresence>
        {enabled && (
          <motion.div
            className="reminder-expand"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >

            {/* TIME DISPLAY */}
            <div
              className="time-display"
              onClick={() => setShowClock(true)}
            >
              ⏰ {time}
            </div>

           <div className="reminder-info">
  <span className="reminder-icon">🔔</span>
  Daily reminder at <strong>{time}</strong>
</div>

            <button
              className={`save-btn ${saved ? "saved" : ""}`}
              onClick={handleSave}
            >
              {saved ? "Saved ✅" : "Save Reminder"}
            </button>

          </motion.div>
        )}
      </AnimatePresence>

      {/* DIGITAL CLOCK */}
      <AnimatePresence>
        {showClock && (
          <motion.div
            className="digital-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="digital-clock"
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
            >

              <h3>Select Time</h3>

              <div className="picker-row">

                <select
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                >
                  {hours.map(h =>
                    <option key={h}>{h}</option>
                  )}
                </select>

                <span>:</span>

                <select
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                >
                  {minutes.map(m =>
                    <option key={m}>{m}</option>
                  )}
                </select>

              </div>

              <button
                className="done-btn"
                onClick={applyTime}
              >
                Done
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}