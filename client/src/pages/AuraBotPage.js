import React, { useState, useEffect, useRef } from "react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  limit,
} from "firebase/firestore";
import { ArrowLeft, Send, Mic, Trash2, Bot } from "lucide-react";
import { app } from "../services/firebaseConfig";
import "../App.css";

const auth = getAuth(app);
const db = getFirestore(app);

const suggestionChips = [
  { text: "😊 I'm Happy", query: "I'm happy" },
  { text: "😔 I'm Sad", query: "I'm sad" },
  { text: "😰 I'm Stressed", query: "I'm stressed" },
  { text: "😴 I'm Tired", query: "I'm tired" },
  { text: "📚 Help Me Study", query: "Can you give me some study tips?" },
  { text: "💪 Motivate Me", query: "Give me some motivation" },
  { text: "📝 Journal Prompt", query: "Give me a journal prompt" },
  { text: "🌿 Relax Me", query: "Suggest a relaxation exercise" },
];

const quickActions = [
  { label: "🧘 Breathing Exercise", query: "Suggest a breathing exercise" },
  { label: "🎵 Relax Music", query: "Can you recommend some music?" },
  { label: "💧 Drink Water", query: "Give me a hydration reminder" },
  { label: "📚 Study Tips", query: "Give me some study tips" },
  { label: "📝 Journal Prompt", query: "Give me a journal prompt" },
  { label: "💪 Motivation", query: "Give me some motivation" },
  { label: "😴 Sleep Tips", query: "How can I sleep better?" },
  { label: "😊 Mood Booster", query: "Give me a positive affirmation" },
];

export default function AuraBotPage({ setActivePage }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [typing, setTyping] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState([]);
  const [todayMood, setTodayMood] = useState(null);
  const threadEndRef = useRef(null);

  const user = auth.currentUser;

  // 1. Live Sync Chat History & Load Today's Mood
  useEffect(() => {
    if (!user) return;

    // Load today's mood (get latest logged mood)
    const moodQuery = query(
      collection(db, "users", user.uid, "moods"),
      orderBy("timestamp", "desc"),
      limit(1)
    );
    const unsubMood = onSnapshot(moodQuery, (snap) => {
      if (!snap.empty) {
        const latest = snap.docs[0].data();
        setTodayMood(latest.emotion || null);
      }
    });

    // Live Sync Chat Logs
    const chatQuery = query(
      collection(db, "users", user.uid, "auraBotChats"),
      orderBy("timestamp", "asc")
    );
    const unsubChats = onSnapshot(chatQuery, (snap) => {
      const logs = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(logs);
    });

    return () => {
      unsubMood();
      unsubChats();
    };
  }, [user]);

  // 2. Auto-scroll Thread
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // 3. Send Message Handler
  const sendMessage = async (textToSend) => {
    if (!textToSend.trim() || !user) return;

    const userMessage = textToSend.trim();
    setInputText("");
    setSuggestedReplies([]);

    const userDocRef = collection(db, "users", user.uid, "auraBotChats");

    try {
      // Save User Message to Firestore
      await addDoc(userDocRef, {
        sender: "user",
        message: userMessage,
        timestamp: serverTimestamp(),
      });

      // Show typing spinner
      setTyping(true);

      // Format previous history for the API payload
      const formattedHistory = messages.map((m) => ({
        sender: m.sender,
        message: m.message,
      }));

      // Resolve dynamic API endpoint: prefer localhost when developing locally, with fallback to remote
      const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      const candidateEndpoints = [];
      if (isLocal) {
        candidateEndpoints.push("http://localhost:5000/api/chat");
        if (process.env.REACT_APP_API_URL) {
          candidateEndpoints.push(`${process.env.REACT_APP_API_URL}/api/chat`);
        }
      } else {
        if (process.env.REACT_APP_API_URL) {
          candidateEndpoints.push(`${process.env.REACT_APP_API_URL}/api/chat`);
        }
        candidateEndpoints.push("/api/chat");
      }

      let response = null;
      let lastError = null;

      for (const endpoint of candidateEndpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);

          const res = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: userMessage,
              mood: todayMood || "",
              history: formattedHistory,
              userContext: {
                displayName: user.displayName || "User",
              },
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (res.ok) {
            response = res;
            break;
          }
        } catch (fetchErr) {
          lastError = fetchErr;
          console.warn(`Endpoint ${endpoint} failed, checking next option...`, fetchErr);
        }
      }

      if (!response) {
        throw lastError || new Error("Failed to connect to AuraBot server");
      }

      const data = await response.json();
      const replyText = data.reply || "I'm sorry, I didn't get a proper reply.";

      // Determine dynamic action navigation buttons based on keywords
      let action = null;
      const botTextLower = replyText.toLowerCase();
      if (botTextLower.includes("journal")) {
        action = { type: "journal", text: "📝 Open Journal" };
      } else if (
        botTextLower.includes("relax") ||
        botTextLower.includes("breathing") ||
        botTextLower.includes("music")
      ) {
        action = { type: "relax", text: "🌿 Open Relax" };
      }

      // Generate suggested replies based on response content
      const suggested = ["Tell me more", "Thanks", "What should I do next?"];
      if (action) {
        suggested.unshift(action.text);
      }

      // Save AuraBot response to Firestore
      await addDoc(userDocRef, {
        sender: "aurabot",
        message: replyText,
        timestamp: serverTimestamp(),
        action: action,
      });

      setSuggestedReplies(suggested);
      setTyping(false);
    } catch (err) {
      console.error("Error calling AuraBot API:", err);
      
      // Save graceful error message in chat logs
      await addDoc(userDocRef, {
        sender: "aurabot",
        message: "I'm sorry, I had trouble connecting to the wellness center server. Please make sure the backend server is running on port 5000.",
        timestamp: serverTimestamp(),
      });
      
      setTyping(false);
    }
  };

  // 4. Clear Chat History
  const clearChat = async () => {
    if (!user) return;
    try {
      const chatQuery = query(collection(db, "users", user.uid, "auraBotChats"));
      const snap = await getDocs(chatQuery);
      const batchPromises = snap.docs.map((d) =>
        deleteDoc(doc(db, "users", user.uid, "auraBotChats", d.id))
      );
      await Promise.all(batchPromises);
      setSuggestedReplies([]);
    } catch (err) {
      console.error("Error clearing chat:", err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", gap: "20px" }}>
      <style>{`
        .aurabot-avatar-pulsing {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-glow) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 0 15px var(--accent-glow);
          animation: avatarGlow 2.5s ease-in-out infinite;
        }

        @keyframes avatarGlow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 15px var(--accent-glow); }
          50% { transform: scale(1.08); box-shadow: 0 0 25px var(--accent-glow); }
        }

        .bot-bubble {
          max-width: 80%;
          align-self: flex-start;
          background: var(--card-bg);
          border: var(--card-border);
          border-radius: 18px 18px 18px 2px;
          padding: 14px 18px;
          color: var(--text-color);
          box-shadow: var(--card-shadow);
          line-height: 1.5;
        }

        .user-bubble {
          max-width: 80%;
          align-self: flex-end;
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-glow) 100%);
          color: white;
          border-radius: 18px 18px 2px 18px;
          padding: 14px 18px;
          box-shadow: 0 4px 12px rgba(165, 94, 234, 0.2);
          line-height: 1.5;
        }

        .chip-button {
          background: rgba(255, 255, 255, 0.05);
          border: var(--card-border);
          color: var(--text-color);
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.25s ease;
        }

        body.light .chip-button {
          background: rgba(0, 0, 0, 0.03);
        }

        .chip-button:hover {
          background: var(--accent);
          color: white;
          border-color: transparent;
          transform: translateY(-1px);
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          background-color: var(--accent-glow);
          border-radius: 50%;
          display: inline-block;
          animation: dotBounce 1.4s infinite ease-in-out both;
        }

        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        .action-link-btn {
          margin-top: 10px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-glow) 100%);
          color: white;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .action-link-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(165, 94, 234, 0.3);
        }
      `}</style>

      {/* Header section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--card-bg)",
          border: "var(--card-border)",
          padding: "16px 24px",
          borderRadius: "20px",
          boxShadow: "var(--card-shadow)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button
            onClick={() => setActivePage("dashboard")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-color)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, margin: 0 }}>🤖 AuraBot</h2>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: 0 }}>
              Your AI Wellness Companion
            </p>
          </div>
        </div>

        <div className="aurabot-avatar-pulsing">
          <Bot size={28} />
        </div>
      </div>

      {/* Main chat window wrapper */}
      <div
        style={{
          flex: 1,
          minHeight: "450px",
          background: "var(--card-bg)",
          border: "var(--card-border)",
          borderRadius: "24px",
          padding: "24px",
          boxShadow: "var(--card-shadow)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Chat Thread */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            paddingRight: "6px",
            marginBottom: "20px",
          }}
        >
          {messages.length === 0 ? (
            /* Empty State Welcome Card */
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "20px",
                gap: "20px",
              }}
            >
              <div
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  background: "rgba(165, 94, 234, 0.1)",
                  border: "1px dashed var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent)",
                }}
              >
                <Bot size={48} />
              </div>
              <div>
                <h3 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
                  Hi! I'm AuraBot 👋
                </h3>
                <p style={{ maxWidth: "480px", color: "var(--text-muted)", fontSize: "15px", lineHeight: 1.6, margin: "0 auto" }}>
                  I'm here to chat, answer questions, help you manage stress, build healthy habits, and support your wellbeing.
                  {todayMood ? (
                    <span style={{ display: "block", marginTop: "15px", fontWeight: 600, color: "var(--accent)" }}>
                      I noticed you logged feeling "{todayMood}" today. Would you like to chat about it?
                    </span>
                  ) : (
                    " How are you feeling today?"
                  )}
                </p>
              </div>

              {/* Suggestion Chips */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "10px",
                  maxWidth: "550px",
                  marginTop: "10px",
                }}
              >
                {suggestionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    className="chip-button"
                    onClick={() => sendMessage(chip.query)}
                  >
                    {chip.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages list */
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{ display: "flex", flexDirection: "column", width: "100%" }}
                >
                  <div
                    className={msg.sender === "user" ? "user-bubble" : "bot-bubble"}
                  >
                    <div>{msg.message}</div>
                    
                    {/* Action Navigation Buttons */}
                    {msg.action && (
                      <div>
                        <button
                          onClick={() => setActivePage(msg.action.type)}
                          className="action-link-btn"
                        >
                          {msg.action.text}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Animation */}
              {typing && (
                <div className="bot-bubble" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "14px", color: "var(--text-muted)", marginRight: "8px" }}>
                    AuraBot is typing
                  </span>
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              )}
              <div ref={threadEndRef} />
            </div>
          )}
        </div>

        {/* Suggested Replies */}
        {suggestedReplies.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              padding: "10px 0",
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {suggestedReplies.map((reply, idx) => (
              <button
                key={idx}
                className="chip-button"
                style={{ fontSize: "13px" }}
                onClick={() => {
                  if (reply.includes("Open Journal")) {
                    setActivePage("journal");
                  } else if (reply.includes("Open Relax")) {
                    setActivePage("relax");
                  } else {
                    sendMessage(reply);
                  }
                }}
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: "15px",
          }}
        >
          <button
            onClick={clearChat}
            title="Clear Chat History"
            style={{
              background: "rgba(255, 77, 77, 0.1)",
              border: "1px solid rgba(255, 77, 77, 0.2)",
              color: "#ff4d4d",
              padding: "12px",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trash2 size={20} />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(inputText)}
            placeholder="Ask AuraBot anything..."
            style={{
              flex: 1,
              padding: "14px 18px",
              borderRadius: "14px",
              border: "var(--input-border)",
              background: "var(--input-bg)",
              color: "var(--text-color)",
              outline: "none",
              fontSize: "15px",
            }}
          />

          <button
            title="Voice input (UI only)"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "var(--card-border)",
              color: "var(--text-muted)",
              padding: "12px",
              borderRadius: "12px",
              cursor: "default",
            }}
          >
            <Mic size={20} />
          </button>

          <button
            onClick={() => sendMessage(inputText)}
            style={{
              background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-glow) 100%)",
              border: "none",
              color: "white",
              padding: "14px 22px",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 600,
              boxShadow: "0 4px 15px rgba(165, 94, 234, 0.2)",
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div
        style={{
          background: "var(--card-bg)",
          border: "var(--card-border)",
          borderRadius: "24px",
          padding: "24px",
          boxShadow: "var(--card-shadow)",
          color: "var(--text-color)",
        }}
      >
        <h4 style={{ margin: "0 0 15px 0", fontWeight: 700 }}>⚡ Quick Actions</h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "12px",
          }}
        >
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              className="chip-button"
              style={{
                textAlign: "left",
                padding: "12px 16px",
                borderRadius: "12px",
                fontSize: "14px",
                width: "100%",
              }}
              onClick={() => sendMessage(action.query)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
