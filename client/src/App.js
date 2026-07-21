import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import SplashScreen from "./components/SplashScreen";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import JournalPage from "./pages/JournalPage";
import ProfilePage from "./pages/ProfilePage";
import MoodTrackerPage from "./pages/MoodTrackerPage";
import FaceTest from "./FaceTest";
import RelaxPage from "./pages/RelaxPage";
import ReminderListener from "./components/ReminderListener";
function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 7500);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    
    <BrowserRouter>
     
        <ReminderListener />

      <Routes>

        {/* Auth */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Main Pages */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/mood" element={<MoodTrackerPage />} />
        <Route path="/journal" element={<JournalPage />} />
        <Route path="/relax" element={<RelaxPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        <Route path="/face-test" element={<FaceTest />} />

        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
      
    </BrowserRouter>
   
  );
}

export default App;
