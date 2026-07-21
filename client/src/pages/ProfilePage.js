// src/pages/ProfilePage.js
import React, { useState, useEffect, useContext, useRef } from "react";
import { motion } from "framer-motion";
import ReminderSettings from "../components/ReminderSettings";
import { getAuth, updateProfile } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { ThemeContext } from "../context/ThemeContext";
import { app } from "../services/firebaseConfig";
import "../App.css";


const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const ProfilePage = () => {
  const { theme, colorTheme, setColorTheme } = useContext(ThemeContext || { theme: "light", colorTheme: "lavender", setColorTheme: () => {} });
  const user = auth.currentUser;

  const colorPresets = [
    { id: "lavender", name: "Lavender", color: "#a55eea" },
    { id: "emerald", name: "Emerald", color: "#1dd1a1" },
    { id: "ocean", name: "Ocean", color: "#2e86de" },
    { id: "rose", name: "Rose", color: "#ff7675" },
    { id: "amber", name: "Amber", color: "#f0932b" },
    { id: "cyberpunk", name: "Cyberpunk", color: "#ff007f" },
    { id: "forest", name: "Forest", color: "#27ae60" },
    { id: "sunset", name: "Sunset", color: "#e17055" },
    { id: "crimson", name: "Crimson", color: "#d63031" },
    { id: "midnight", name: "Midnight", color: "#4a5568" },
  ];

  // Local editable fields
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState([]);
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [savedAt, setSavedAt] = useState(null);
  const [daysLogged, setDaysLogged] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
const [positiveDays, setPositiveDays] = useState(0);
  // Load user data from Firestore on mount
  useEffect(() => {
  let mounted = true;

  async function loadProfile() {
    if (!user) return;

    try {
      // ---------------------------
      // Load user profile
      // ---------------------------
      const userDocRef = doc(db, "users", user.uid);
      const snap = await getDoc(userDocRef);

      if (snap.exists() && mounted) {
        const data = snap.data();
        setStatus(data.status || "");
        setSavedAt(
          data.updatedAt
            ? data.updatedAt.toDate().toLocaleString()
            : null
        );

        if (data.photoURL) {
          setPhotoURL(data.photoURL);
        }
      }

      // ---------------------------
      // Fetch journal entries
      // ---------------------------
      const entriesQuery = query(
        collection(db, "entries"),
        where("userId", "==", user.uid)
      );

      const entriesSnap = await getDocs(entriesQuery);

      let total = 0;
      let positive = 0;
      let uniqueDates = new Set();

      entriesSnap.forEach((doc) => {
        total++;
        const entry = doc.data();

        // Count positive moods
        if (
          entry.mood === "happy" ||
          entry.mood === "calm" ||
          entry.mood === "excited"
        ) {
          positive++;
        }

        // Count unique days logged
        if (entry.createdAt) {
          const date = entry.createdAt
            .toDate()
            .toDateString();
          uniqueDates.add(date);
        }
      });

      const daysLogged = uniqueDates.size;

      // ---------------------------
      // AUTO BADGE SYSTEM
      // ---------------------------
      let earnedBadges = [];

// Consistency
if (uniqueDates.size >= 7) earnedBadges.push("🌱 7 Day Starter");
if (uniqueDates.size >= 15) earnedBadges.push("🔥 Consistency Builder");
if (uniqueDates.size >= 30) earnedBadges.push("💪 30 Day Warrior");
if (uniqueDates.size >= 90) earnedBadges.push("👑 Mental Strength Master");

// Positivity
if (positive >= 10) earnedBadges.push("😊 Positive Thinker");
if (positive >= 25) earnedBadges.push("🌞 Bright Soul");
if (positive >= 50) earnedBadges.push("✨ Happiness Champion");

// Writing
if (total >= 5) earnedBadges.push("✍️ First Steps");
if (total >= 20) earnedBadges.push("📖 Journaling Explorer");
if (total >= 50) earnedBadges.push("🧠 Reflection Pro");
if (total >= 100) earnedBadges.push("🏆 Aura Master");

setBadges(earnedBadges);
      // ---------------------------
      // Set All States
      // ---------------------------
      setTotalEntries(total);
      setPositiveDays(positive);
      setDaysLogged(daysLogged);
      setBadges(earnedBadges);
      

    } catch (err) {
      console.error("Load profile error:", err);
    }
  }

  loadProfile();

  return () => {
    mounted = false;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [user]);
  // handle image selection -> preview
  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilePreview(URL.createObjectURL(file));
  };

  // Timeout wrapper helper
  const promiseWithTimeout = (promise, ms) => {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Storage Timeout")), ms)
      ),
    ]);
  };

  // Convert file to Base64 data URL
  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  // upload image to Firebase Storage and return downloadURL
  const uploadImageAndGetURL = async (file) => {
    if (!file || !user) return null;
    const path = `profiles/${user.uid}/${Date.now()}_${file.name}`;
    const storageReference = storageRef(storage, path);
    await uploadBytes(storageReference, file);
    const url = await getDownloadURL(storageReference);
    return url;
  };

  // Save profile to Auth and Firestore
  const handleSave = async (e) => {
    e?.preventDefault();
    if (!user) return setError("No user signed in.");
    setError("");
    setLoading(true);
    setUploadProgress(null);

    try {
      // if a new file selected, upload it
      const file = fileInputRef.current?.files?.[0];
      let uploadedUrl = photoURL;

      if (file) {
        setUploadProgress("uploading");
        try {
          // Attempt Storage upload with 5-second timeout
          uploadedUrl = await promiseWithTimeout(uploadImageAndGetURL(file), 5000);
        } catch (uploadErr) {
          console.warn("Storage upload failed/timed out, using Base64 fallback:", uploadErr);
          // Fallback to local Base64 string in Firestore
          uploadedUrl = await readFileAsDataURL(file);
        }
        setUploadProgress(null);
        setPhotoURL(uploadedUrl);
      }

      // update firebase auth profile (displayName, photoURL)
      // Note: Firebase Auth photoURL is capped at 2048 chars. We avoid passing large Base64 strings to updateProfile.
      const isBase64 = uploadedUrl && uploadedUrl.startsWith("data:image");
      await updateProfile(user, {
        displayName: displayName || user.displayName,
        photoURL: isBase64 ? null : (uploadedUrl || user.photoURL || null),
      });

      // save to Firestore user doc
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        {
          displayName: displayName || user.displayName,
          status: status || "",
          photoURL: uploadedUrl || user.photoURL || "",
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setSavedAt(new Date().toLocaleString());
      setError("");
      // optionally reload local state
      // small success animation (we'll set loading false after)
    } catch (err) {
      console.error("Save profile error:", err);
      setError("Could not save profile. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // small helper: formatted streak percent for progress ring (max goal 30 days)
  const streakPercent = Math.min(100, Math.round((streak / 30) * 100));

  // SVG progress ring component
  const ProgressRing = ({ radius = 48, stroke = 8, progress = 0 }) => {
    const normalizedRadius = radius - stroke * 0.5;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    return (
      <svg height={radius * 2} width={radius * 2}>
        <defs>
          <linearGradient id="gradStreak" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7f5af0" />
            <stop offset="100%" stopColor="#5f72be" />
          </linearGradient>
        </defs>
        <g transform={`rotate(-90 ${radius} ${radius})`}>
          <circle
            stroke={theme === "dark" ? "#222" : "#13041fff"}
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="url(#gradStreak)"
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </g>
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="14"
          fill={theme === "dark" ? "#1e0430ff" : "#222"}
        >
          {progress}%
        </text>#
      </svg>
    );
  };

  return (
    <motion.div
      className="profile-modern"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      style={{
        minHeight: "100vh",
        padding: "28px",
        background:
          theme === "dark"
            ? "linear-gradient(145deg,#0e0f12,#17171b)"
            : "linear-gradient(145deg,#f7f8fc,#eef2fb)",
        color: "var(--text-color)",
      }}
    >
      <div
        style={{
          maxWidth: 1300,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: 28,
          alignItems: "start",
        }}
      >
        {/* Left column: profile card */}
        <motion.div
          className="profile-card-left"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: "var(--card-bg)",
            border: "var(--card-border)",
            borderRadius: 18,
            padding: 22,
            boxShadow: "var(--card-shadow)",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            color: "var(--text-color)",
          }}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
  <div
  className={`avatar-ring ${
    streak >= 30 ? "aura-master" : ""
  }`}
>
  <img
    src={
      filePreview ||
      photoURL ||
      "https://i.pinimg.com/736x/10/ce/2e/10ce2e36b0cbd827a6f45b3d187ade87.jpg"
    }
    alt="avatar"
    className="profile-pic"
  />
              <label
                htmlFor="profileFile"
                style={{
                  position: "absolute",
                  right: -6,
                  bottom: -6,
                  background: "rgb(233, 174, 243)",
                  color: "#360a53ff",
                  borderRadius: 12,
                  padding: "6px 8px",
                  fontSize: 12,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(241, 218, 241, 0.91)",
                }}
                title="Change photo"
              >
                Change
              </label>
              <input
                id="profileFile"
                ref={fileInputRef}
                type="file"
                
                accept="image/*"
                onChange={onFileChange}
                style={{ display: "none" }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: 20 }}>
                {user?.displayName || displayName || "AuraTrack User"}
              </h3>
              <p
  style={{
    margin: "6px 0 0 0",
    color: "var(--text-muted)",
    wordBreak: "break-all",
    overflowWrap: "anywhere",
    fontSize: 13,
  }}
>
  {user?.email}
</p>

              <p style={{ marginTop: 10, color: "var(--text-muted)" }}>
                {status || "No status set — add a short mood note!"}
              </p>
            </div>
          </div>

          {/* streak / progress ring */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 96, height: 96 }}>
              <ProgressRing progress={streakPercent} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{streak} day streak</div>
              <div style={{ color: "var(--text-muted)", marginTop: 6 }}>
                Keep logging daily to grow your streak 🌱
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 10,
                border: "none",
                background: "#431B63",
color: "#ffffff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Upload Photo
            </button>

            <button
              onClick={() => {
                // quick reset preview
                setFilePreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.06)",
                background: theme === "dark" ? "#232326" : "#fff",
                cursor: "pointer",
                color: theme === "dark" ? "#fff" : "#333",
                fontWeight: 600,
              }}
            >
              Reset
            </button>
          </div>

          {uploadProgress === "uploading" && (
            <div style={{ color: "#4a1469ff", fontWeight: 700 }}>Uploading image…</div>
          )}

          <div style={{ color: "red" }}>{error}</div>
          {savedAt && (
            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
              Last saved: {savedAt}
            </div>
          )}
        </motion.div>

        {/* Right column: editable form + stats + badges */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <motion.form
            onSubmit={handleSave}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            style={{
              background: "var(--card-bg)",
              border: "var(--card-border)",
              borderRadius: 16,
              padding: 20,
              boxShadow: "var(--card-shadow)",
              color: "var(--text-color)",
            }}
          >
            <h3 style={{ margin: 0, marginBottom: 12 }}>Edit profile</h3>

            <label style={{ display: "block", marginBottom: 8, fontSize: 13, color: "var(--text-muted)" }}>
              Display name
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "var(--input-border)",
                marginBottom: 12,
                background: "var(--input-bg)",
                color: "var(--text-color)",
              }}
            />

            <label style={{ display: "block", marginBottom: 8, fontSize: 13, color: "var(--text-muted)" }}>
              Status / Mood note
            </label>
            <input
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="How are you feeling? (e.g. feeling calm today ✨)"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "var(--input-border)",
                marginBottom: 12,
                background: "var(--input-bg)",
                color: "var(--text-color)",
              }}
            />

            <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: "#431B63",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {loading ? "Saving..." : "Save changes"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setDisplayName(user?.displayName || "");
                  setStatus("");
                }}
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(0,0,0,0.08)",
                  background: theme === "dark" ? "rgb(68, 22, 90)" : "#f2c7f8ff",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </motion.form>

          {/* Accent Color Switcher */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
            style={{
              background: "var(--card-bg)",
              border: "var(--card-border)",
              borderRadius: 16,
              padding: 20,
              boxShadow: "var(--card-shadow)",
              color: "var(--text-color)",
            }}
          >
            <h4 style={{ margin: 0, marginBottom: 15 }}>App Accent Color</h4>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {colorPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setColorTheme(preset.id)}
                  title={preset.name}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    backgroundColor: preset.color,
                    border: colorTheme === preset.id ? "3px solid var(--text-color)" : "1px solid rgba(0,0,0,0.1)",
                    cursor: "pointer",
                    transform: colorTheme === preset.id ? "scale(1.15)" : "scale(1)",
                    boxShadow: colorTheme === preset.id ? `0 0 15px ${preset.color}` : "none",
                    transition: "all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Stats cards row */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 14,
            }}
          >
            <StatCard title="Days Logged" value={daysLogged} theme={theme} />
            <StatCard title="Badges Earned" value={badges?.length || 0} theme={theme} />
            <StatCard title="Total Entries" value={120} theme={theme} /> {/* placeholder */}
            <StatCard title="Positive Days" value={15} theme={theme} /> {/* placeholder */}
          </motion.div>

          {/* Badges list */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            style={{
              background: "var(--card-bg)",
              border: "var(--card-border)",
              borderRadius: 12,
              padding: 16,
              boxShadow: "var(--card-shadow)",
            }}
          >
            <h4 style={{ margin: 0, marginBottom: 12 }}>Badges</h4>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {(badges && badges.length > 0 ? badges : ["🏅 Consistency Star", "🌱 Beginner"]).map((b, i) => (
                <div
                  key={i}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 12,
                    background: "rgba(165, 94, 234, 0.15)",
                    border: "1px solid rgba(165, 94, 234, 0.3)",
                    color: "var(--text-color)",
                    fontWeight: 600,
                  }}
                >
                  {b}
                </div>
              ))}
            </div>
          </motion.div>
          {/* Reminder Settings */}
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.45, delay: 0.15 }}
  style={{
    background: "var(--card-bg)",
    border: "var(--card-border)",
    borderRadius: 12,
    padding: 16,
    boxShadow: "var(--card-shadow)",
    color: "var(--text-color)",
  }}
>
  <h4 style={{ marginBottom: 12 }}>
    ⏰ Daily Mood Reminder
  </h4>

  <ReminderSettings />
</motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// small StatCard component
function StatCard({ title, value, theme }) {
  return (
    <div
      style={{
        background: "var(--card-bg)",
        border: "var(--card-border)",
        borderRadius: 12,
        padding: 16,
        boxShadow: "var(--card-shadow)",
        textAlign: "left",
      }}
    >
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 24, color: "var(--text-color)", fontWeight: 700 }}>{value}</div>
    </div>
  );
}

export default ProfilePage;