import React, { useContext } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Smile,
  User,
  LogOut,
  NotebookPen,
  Camera,
  Sun,
  Moon,
  Music,
  Bot,
} from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";
import "../App.css";

const Sidebar = ({ setActivePage, onLogoutClick }) => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const sidebarItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={22} />, key: "dashboard" },
    { name: "Mood", icon: <Smile size={22} />, key: "mood" },
    {
      name: "Mood Detection",
      icon: <Camera size={22} />,
      key: "mood-detection",
    },
    { name: "AuraBot", icon: <Bot size={22} />, key: "aurabot" },
    { name: "Journal", icon: <NotebookPen size={22} />, key: "journal" },
    {
  name: "Relax",
  icon: <Music size={22} />,
  key: "relax",
},
    { name: "Profile", icon: <User size={22} />, key: "profile" },
    { name: "Logout", icon: <LogOut size={22} />, key: "logout" },
  ];

  const handleClick = (key) => {
    if (key === "logout") {
      onLogoutClick(); // 🔥 IMPORTANT FIX
    } else {
      setActivePage(key);
    }
  };

  return (
    <motion.div
      className="sidebar"
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
    >
      <div className="sidebar-header">
        <h2 className="sidebar-title">🧠 AuraTrack</h2>

        <button
          onClick={toggleTheme}
          style={{
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
          }}
        >
          {theme === "light" ? <Moon /> : <Sun />}
        </button>
      </div>

      <ul className="sidebar-menu">
        {sidebarItems.map((item) => (
          <motion.li
            key={item.key}
            className="sidebar-item"
            whileHover={{ scale: 1.05 }}
            onClick={() => handleClick(item.key)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.name}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

export default Sidebar;
