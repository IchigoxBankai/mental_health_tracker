import React, { useState, useRef, useEffect } from "react";
import "./AIChat.css";
import { saveChatMessage } from "../services/chatService";

const AICompanionChat = () => {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hi 👋 I'm Aura, your AI companion. How are you feeling today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;

    const userMessage = {
      sender: "user",
      text: userText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      /* ⭐ CALL BACKEND AI */
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();

      const aiReply = {
        sender: "ai",
        text: data.reply || "I'm here for you 💙",
      };

      setMessages((prev) => [...prev, aiReply]);

      /* ⭐ Save to Firestore */
      await saveChatMessage(userText, "user");
      await saveChatMessage(aiReply.text, "ai");
    } catch (error) {
      console.error("AI Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "⚠️ AI is currently unavailable. Please try again later.",
        },
      ]);
    }

    setLoading(false);
  };

  /* ================= ENTER KEY ================= */
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  /* ================= UI ================= */
  return (
    <div className="chat-container">
      <h2 className="chat-title">🤖 Aura AI Companion</h2>

      {/* CHAT BOX */}
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sender === "user" ? "user-msg" : "ai-msg"}
          >
            {msg.text}
          </div>
        ))}

        {loading && <div className="ai-msg">Aura is typing...</div>}

        <div ref={chatEndRef} />
      </div>

      {/* INPUT */}
      <div className="chat-input">
        <input
          type="text"
          placeholder="Type how you're feeling..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />

        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
};

export default AICompanionChat;
