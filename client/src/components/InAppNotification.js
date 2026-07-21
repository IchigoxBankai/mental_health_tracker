import { useEffect, useRef } from "react";
import "./InAppNotification.css";
import notificationSound from "../assets/fahhhhh.mp3";

export default function InAppNotification({ show, message }) {

  const audioRef = useRef(null);

  // 🔔 Play sound when notification appears
  useEffect(() => {
    if (show && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, [show]);

  return (
    <>
      <audio ref={audioRef} src={notificationSound} />

      <div className={`notification-bar ${show ? "show" : ""}`}>
        <span className="logo"> 🧠 AuraTrack</span>
        <p>{message}</p>
      </div>
    </>
  );
}