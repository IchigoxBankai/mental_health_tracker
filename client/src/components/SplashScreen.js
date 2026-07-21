import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./Splash.css";

const SplashScreen = ({ onFinish }) => {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHide(true);
      setTimeout(onFinish, 800);
    }, 4500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  const spheres = [
    { size: 180, left: "10%", top: "25%", delay: 0 },
    { size: 230, left: "70%", top: "20%", delay: 0.5 },
    { size: 140, left: "30%", top: "70%", delay: 0.8 },
    { size: 200, left: "50%", top: "50%", delay: 1.1 },
    { size: 160, left: "80%", top: "65%", delay: 1.5 },
  ];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: hide ? 0 : 1 }}
      transition={{ duration: 0.8 }}
      className="splash-container"
    >
      {/* Glowing Floating Spheres */}
      {spheres.map((s, i) => (
        <motion.div
          key={i}
          className="splash-sphere"
          style={{
            width: s.size,
            height: s.size,
            left: s.left,
            top: s.top,
            filter: "blur(18px)",
          }}
          animate={{
            y: ["-12%", "12%", "-12%"],
            rotate: [0, 20, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            delay: s.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* LOGO + APP NAME */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.12, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="splash-content"
      >
        {/* 🔮 Glowing Rotating Ring */}
        <motion.div
          className="logo-ring"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
        ></motion.div>

        <img src="/AuraTrack.png" alt="Logo" className="splash-logo" />

        {/* APP NAME */}
        <h1 className="splash-title">AuraTrack</h1>

        {/* TAGLINE */}
        <h4 className="splash-tagline">Level Up Your Mental Game</h4>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
