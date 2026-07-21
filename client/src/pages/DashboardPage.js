import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import MoodChart from "../components/MoodChart";
import MoodInput from "../components/MoodInput";
import MoodAssistant from "../components/MoodAssistant";
import ProfilePage from "./ProfilePage";
import JournalPage from "./JournalPage";
import AIInsights from "../components/AIInsights";
import MoodStreakCard from "../components/MoodStreakCard";
import SelfCareSuggestions from "../components/SelfCareSuggestions";
import MoodReminder from "../components/MoodReminder";
import WeeklyMentalScore from "../components/WeeklyMentalScore";
import MoodCalendar from "../components/MoodCalendar";
import SmartMoodAlerts from "../components/SmartMoodAlerts";
import MoodDetectionPage from "./MoodDetectionPage";
import MoodTrackerPage from "./MoodTrackerPage";
import AuraBotPage from "./AuraBotPage";
import DailyQuote from "../components/DailyQuote";
import RelaxPage from "./RelaxPage";
import { generateMentalHealthReport } from "../utils/generateReport";
import { motion, AnimatePresence } from "framer-motion";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
} from "firebase/firestore";

import { app } from "../services/firebaseConfig";
import "../App.css";

const auth = getAuth(app);
const db = getFirestore(app);

/* ================= MOOD LABEL ================= */
function moodLabel(mood) {
  if (mood >= 5) return "Amazing 😊";
  if (mood >= 4) return "Happy 🙂";
  if (mood === 3) return "Okay 😐";
  if (mood === 2) return "Low 😕";
  return "Down 😔";
}

/* ================= MOOD THEME ================= */
const getMoodTheme = (moodValue, emotionValue) => {
  if (typeof moodValue === "number") {
    if (moodValue >= 5) return "theme-happy";
    if (moodValue >= 4) return "theme-good";
    if (moodValue === 3) return "theme-neutral";
    if (moodValue === 2) return "theme-low";
    return "theme-sad";
  }

  const emotion = emotionValue?.toLowerCase();
  if (!emotion) return "theme-default";

  if (["happy", "surprised"].includes(emotion)) return "theme-happy";
  if (["neutral"].includes(emotion)) return "theme-neutral";
  if (["sad"].includes(emotion)) return "theme-sad";
  if (["angry", "fearful", "disgusted"].includes(emotion)) return "theme-low";

  return "theme-default";
};

const DashboardPage = () => {
  const [activePage, setActivePage] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [dbPhotoURL, setDbPhotoURL] = useState("");
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigate = useNavigate();

  /* ================= AUTH & USER DATA ================= */
  useEffect(() => {
    let unsubUserDoc = () => {};

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!u) {
        navigate("/");
      } else {
        setUser(u);
        
        // Listen to live changes in user document (for instant PFP updates)
        const userDocRef = doc(db, "users", u.uid);
        unsubUserDoc = onSnapshot(userDocRef, (snap) => {
          if (snap.exists() && snap.data().photoURL) {
            setDbPhotoURL(snap.data().photoURL);
          } else {
            setDbPhotoURL(u.photoURL || "");
          }
        });
      }
    });

    return () => {
      unsubAuth();
      unsubUserDoc();
    };
  }, [navigate]);

  /* ================= REALTIME MOODS ================= */
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "moods"),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const moodData = snapshot.docs.map((doc) => ({
        mood: doc.data().mood,
        emotion: doc.data().emotion,
        source: doc.data().source,
        confidence: doc.data().confidence,
        timestamp: doc.data().timestamp?.toDate?.() || new Date(),
      }));

      setMoods(moodData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const latestMoodObj = moods[0];

  const latestMoodText = latestMoodObj
    ? latestMoodObj.emotion ||
      (latestMoodObj.mood >= 4
        ? "Happy"
        : latestMoodObj.mood === 3
        ? "Neutral"
        : "Sad")
    : "Neutral";

  /* ================= STREAK & BADGES ================= */

  const calculateStreak = () => {
    let streak = 0;
    for (let i = 0; i < moods.length; i++) {
      if (moods[i]?.mood) streak++;
    }
    return streak;
  };

  const calculateBadges = () => {
    const badges = [];
    if (moods.length >= 7) badges.push("7 Day Consistency");
    if (moods.length >= 30) badges.push("30 Day Warrior");
    if (calculateStreak() >= 10) badges.push("Streak Master");
    return badges;
  };

  /* ================= LOGOUT ================= */
  const handleLogoutClick = () => setShowLogoutConfirm(true);

  const confirmLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  /* ================= PAGE CONTENT ================= */

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <motion.div
            className="dashboard-content"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* HEADER */}
            <div className="dashboard-header">
              <div className="welcome-container">
                <img
                  src={dbPhotoURL || user?.photoURL || "https://i.imgur.com/HeIi0wU.png"}
                  alt="profile"
                  className="profile-pic"
                  onClick={() => setActivePage("profile")}
                />
                <div>
                  <h1>Welcome back, {user?.displayName || "User"} 👋</h1>
                  <p className="subtext">
                    Here’s a quick look at your mental well-being today
                  </p>
                </div>
              </div>
            </div>

            {/* DOWNLOAD REPORT BUTTON */}
           <div className="dashboard-top-bar">
  <button
    className="report-btn"
    onClick={() =>
      generateMentalHealthReport({
        user,
        moods,
        streak: calculateStreak(),
        badges: calculateBadges(),
      })
    }
  >
    📄 Generate Full Report
  </button>
</div>

            {/* TODAY MOOD */}
            <div className="dashboard-cards">
              <div className="panel">
                <h3>Today's Mood</h3>
                <strong>
                  {latestMoodObj
                    ? moodLabel(latestMoodObj.mood)
                    : "No entry today"}
                </strong>
              </div>
            </div>

            <DailyQuote latestMood={latestMoodText} />

            <MoodChart
              moods={moods}
              onViewDetails={() => setActivePage("journal")}
              onAddMood={() => setActivePage("mood")}
            />

            <WeeklyMentalScore moods={moods} />
            <MoodAssistant />
            <SmartMoodAlerts moods={moods} />
            <AIInsights moods={moods} />
            <MoodStreakCard moods={moods} />
            
            <MoodCalendar moods={moods} />
          </motion.div>
        );

      case "mood":
        return <MoodTrackerPage moods={moods} />;

      case "journal":
        return <JournalPage user={user} />;

      case "relax":
        return <RelaxPage />;

      case "profile":
        return <ProfilePage user={user} />;

      case "mood-detection":
        return <MoodDetectionPage />;

      case "aurabot":
        return <AuraBotPage setActivePage={setActivePage} />;

      default:
        return null;
    }
  };

  return (
    <>
      <div
        className={`dashboard-container ${getMoodTheme(
          latestMoodObj?.mood,
          latestMoodObj?.emotion
        )}`}
      >
        <MoodReminder />

        <Sidebar
          setActivePage={setActivePage}
          onLogoutClick={handleLogoutClick}
        />

        <div className="main-content">
          {loading ? "Loading…" : renderContent()}
        </div>
      </div>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div className="modal-overlay">
            <motion.div className="modal-box">
              <h3>Are you sure?</h3>
              <p>Do you really want to logout?</p>

              <div className="modal-actions">
                <button className="btn danger" onClick={confirmLogout}>
                  Yes, Logout
                </button>

                <button
                  className="btn"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  No, Stay
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DashboardPage;