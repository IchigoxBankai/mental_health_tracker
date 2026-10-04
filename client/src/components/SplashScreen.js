import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Splash.css";

// 14 Starlight fireflies/particles
const PARTICLES = [
  { id: 1, size: 2.5, top: "18%", left: "14%", delay: 0.2, dur: 3.2 },
  { id: 2, size: 3.5, top: "28%", left: "22%", delay: 0.8, dur: 4.1 },
  { id: 3, size: 2, top: "12%", left: "75%", delay: 0.5, dur: 3.6 },
  { id: 4, size: 3, top: "25%", left: "84%", delay: 1.2, dur: 4.5 },
  { id: 5, size: 2, top: "68%", left: "12%", delay: 0.3, dur: 3.8 },
  { id: 6, size: 3.5, top: "78%", left: "24%", delay: 1.5, dur: 4.0 },
  { id: 7, size: 2.5, top: "62%", left: "82%", delay: 0.7, dur: 3.5 },
  { id: 8, size: 3, top: "82%", left: "72%", delay: 1.1, dur: 4.2 },
  { id: 9, size: 2, top: "45%", left: "8%", delay: 1.8, dur: 3.7 },
  { id: 10, size: 2.5, top: "52%", left: "92%", delay: 0.4, dur: 4.4 },
  { id: 11, size: 1.8, top: "8%", left: "42%", delay: 0.9, dur: 3.9 },
  { id: 12, size: 2.2, top: "90%", left: "48%", delay: 1.4, dur: 3.3 },
  { id: 13, size: 2.8, top: "35%", left: "68%", delay: 0.6, dur: 4.3 },
  { id: 14, size: 2, top: "60%", left: "35%", delay: 1.0, dur: 3.8 },
];

const MINDFUL_CUES = [
  "Inhale peace...",
  "Exhale tension...",
  "Welcome to your sanctuary",
];

const SplashScreen = ({ onFinish }) => {
  const [hide, setHide] = useState(false);
  const [cueIndex, setCueIndex] = useState(0);

  // Cycle mindful prompt in tune with a breathing cycle
  useEffect(() => {
    const cueTimer1 = setTimeout(() => setCueIndex(1), 1600);
    const cueTimer2 = setTimeout(() => setCueIndex(2), 3000);

    // Trigger exit transition
    const exitTimer = setTimeout(() => {
      setHide(true);
      setTimeout(() => {
        if (onFinish) onFinish();
      }, 700);
    }, 4200);

    return () => {
      clearTimeout(cueTimer1);
      clearTimeout(cueTimer2);
      clearTimeout(exitTimer);
    };
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: hide ? 0 : 1, scale: hide ? 1.03 : 1 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      className="splash-container"
    >
      {/* Subtle Dark Vignette */}
      <div className="splash-vignette" />

      {/* Ambient Aurora Glow 1 (Top Left Violet) */}
      <motion.div
        className="splash-aurora violet"
        style={{ top: "10%", left: "15%" }}
        animate={{
          x: ["-8%", "8%", "-8%"],
          y: ["-6%", "10%", "-6%"],
          scale: [1, 1.18, 1],
          opacity: [0.4, 0.55, 0.4],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Ambient Aurora Glow 2 (Bottom Center Cyan / Teal) */}
      <motion.div
        className="splash-aurora cyan"
        style={{ bottom: "5%", left: "38%" }}
        animate={{
          x: ["10%", "-10%", "10%"],
          y: ["6%", "-8%", "6%"],
          scale: [1, 1.25, 1],
          opacity: [0.25, 0.42, 0.25],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Ambient Aurora Glow 3 (Top Right Magenta) */}
      <motion.div
        className="splash-aurora magenta"
        style={{ top: "15%", right: "12%" }}
        animate={{
          x: ["-6%", "6%", "-6%"],
          y: ["10%", "-6%", "10%"],
          scale: [1, 1.2, 1],
          opacity: [0.18, 0.32, 0.18],
        }}
        transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Twinkling Starlight Fireflies */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="splash-particle"
          style={{
            width: p.size,
            height: p.size,
            top: p.top,
            left: p.left,
          }}
          animate={{
            opacity: [0.2, 0.95, 0.2],
            scale: [0.8, 1.35, 0.8],
            y: ["0px", "-14px", "0px"],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* MAIN HERO CONTENT */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="splash-content"
      >
        {/* AURA HERO BADGE */}
        <div className="aura-hero-wrapper">
          {/* Layer 1: Breathing Halo Glow */}
          <motion.div
            className="aura-halo-bloom"
            animate={{
              scale: [1, 1.28, 1],
              opacity: [0.45, 0.75, 0.45],
            }}
            transition={{
              duration: 3.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Layer 2: Concentric Expanding Breathing Wave 1 */}
          <motion.div
            className="aura-ripple"
            animate={{
              scale: [1, 1.45, 1],
              opacity: [0.6, 0.15, 0.6],
            }}
            transition={{
              duration: 3.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Layer 3: Concentric Expanding Breathing Wave 2 */}
          <motion.div
            className="aura-ripple secondary"
            animate={{
              scale: [1.15, 1.65, 1.15],
              opacity: [0.4, 0.05, 0.4],
            }}
            transition={{
              duration: 3.4,
              repeat: Infinity,
              delay: 0.4,
              ease: "easeInOut",
            }}
          />

          {/* Layer 4: Orbital Celestial Ring with Satellite */}
          <motion.div
            className="aura-orbital-ring"
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          >
            <div className="aura-orbit-satellite" />
          </motion.div>

          {/* Layer 5: Frosted Glass Disc Shield */}
          <motion.div
            className="aura-glass-disc"
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 3.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.img
              src="/AuraTrack.png"
              alt="AuraTrack Logo"
              className="splash-logo-image"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.2 }}
            />
          </motion.div>
        </div>

        {/* APP TITLE */}
        <motion.h1
          className="splash-title"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35 }}
        >
          AuraTrack
        </motion.h1>

        {/* TAGLINE */}
        <motion.p
          className="splash-tagline"
          initial={{ opacity: 0, letterSpacing: "5px" }}
          animate={{ opacity: 0.85, letterSpacing: "3.5px" }}
          transition={{ duration: 1, delay: 0.55 }}
        >
          Level Up Your Mental Game
        </motion.p>

        {/* MINDFUL BREATHING CUE */}
        <div className="splash-mindful-cue">
          <span className="splash-cue-dot" />
          <AnimatePresence mode="wait">
            <motion.span
              key={cueIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.45 }}
            >
              {MINDFUL_CUES[cueIndex]}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* SLEEK LOADING PROGRESS BAR */}
        <div className="splash-progress-track">
          <motion.div
            className="splash-progress-fill"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4.1, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
