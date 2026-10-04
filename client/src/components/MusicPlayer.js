import React, { useRef, useState, useEffect } from "react";
import "./MusicPlayer.css";

function MusicPlayer({ track }) {
  const audioRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);

  /* ===========================
     LOAD NEW TRACK (NO AUTOPLAY)
  =========================== */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    audio.pause();        // stop previous music
    audio.src = track;    // load new song
    audio.currentTime = 0;
    audio.load();

    setPlaying(false);    // reset play button
  }, [track]);

  /* ===========================
     TIME + DURATION TRACKING
  =========================== */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const loadMetadata = () => {
      setDuration(audio.duration || 0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", loadMetadata);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", loadMetadata);
    };
  }, []);

  /* ===========================
     PLAY / PAUSE
  =========================== */
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play()
        .then(() => setPlaying(true))
        .catch(() => {});
    }
  };

  /* ===========================
     SEEK MUSIC
  =========================== */
  const seekMusic = (e) => {
    const audio = audioRef.current;
    if (!audio || !isFinite(audio.duration)) return;

    const seekTime = (e.target.value / 100) * audio.duration;
    audio.currentTime = seekTime;
  };

  /* ===========================
     VOLUME
  =========================== */
  const changeVolume = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);

    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  /* ===========================
     FORMAT TIME
  =========================== */
  const formatTime = (time) => {
    if (!time) return "0:00";

    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");

    return `${mins}:${secs}`;
  };

  return (
    <div className="audio-wrapper">
      {/* Hidden Audio */}
      <audio ref={audioRef} />

      {/* ROW 1: Controls & Visualizer */}
      <div className="player-controls-row">
        <button className="play-btn" onClick={togglePlay}>
          {playing ? "⏸" : "▶"}
        </button>

        <div className={`visualizer ${playing ? "active" : ""}`}>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      {/* ROW 2: Progress timeline with current and total times */}
      <div className="timeline-container">
        <span className="time">{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max="100"
          value={duration ? (currentTime / duration) * 100 : 0}
          onChange={seekMusic}
          className="progress-bar"
        />
        <span className="time">{formatTime(duration)}</span>
      </div>

      {/* ROW 3: Volume Controller */}
      <div className="volume-container">
        <span className="volume-icon">🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={changeVolume}
          className="volume-slider"
        />
      </div>
    </div>
  );
}

export default MusicPlayer;