import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "../services/firebaseConfig";
import { FaUserAlt, FaLock, FaEnvelope } from "react-icons/fa";
import { GiBrain } from "react-icons/gi";

const SignupPage = () => {
  const auth = getAuth(app);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess("Account created successfully! You can now login.");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("Error creating account. Try again or use a different email.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* Left Illustration Section */}
      <div
        style={{
          flex: 1,
          background: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          textAlign: "center",
          padding: "40px",
          color: "#b3ecf3",
        }}
      >
        <img
          src="/images/mental_health_illustration.png"
          alt="Mental Wellness Illustration"
          style={{
            width: "70%",
            maxWidth: "400px",
            animation: "fadeIn 1.2s ease-in-out",
          }}
        />
        <h2 style={{ marginTop: "20px" }}>Join the Journey 🌿</h2>
        <p style={{ maxWidth: "400px" }}>
          Create your account and start tracking your mental health progress.
        </p>
      </div>

      {/* Right Signup Card */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#a0f5f5",
        }}
      >
        <div
          style={{
            background: "rgba(98, 162, 247, 0.55)",
            padding: "40px 50px",
            borderRadius: "20px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
            width: "380px",
            textAlign: "center",
            animation: "fadeIn 1.5s ease-in-out",
          }}
        >
          <GiBrain size={55} color="#5f72be" style={{ marginBottom: "15px" }} />
          <h2 style={{ color: "#333", marginBottom: "10px" }}>
            Create Account
          </h2>
          <p style={{ color: "#777", marginBottom: "30px" }}>
            Fill in your details to get started.
          </p>

          <form onSubmit={handleSignup}>
            {/* Email Field */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #ccc",
                borderRadius: "8px",
                marginBottom: "15px",
                padding: "10px",
                backgroundColor: "#fff",
              }}
            >
              <FaEnvelope color="#888" style={{ marginRight: "10px" }} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  border: "none",
                  outline: "none",
                  flex: 1,
                  fontSize: "14px",
                  background: "transparent",
                }}
              />
            </div>

            {/* Password Field */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #ccc",
                borderRadius: "8px",
                marginBottom: "15px",
                padding: "10px",
                backgroundColor: "#fff",
              }}
            >
              <FaLock color="#888" style={{ marginRight: "10px" }} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  border: "none",
                  outline: "none",
                  flex: 1,
                  fontSize: "14px",
                  background: "transparent",
                }}
              />
            </div>

            {/* Confirm Password Field */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #ccc",
                borderRadius: "8px",
                marginBottom: "20px",
                padding: "10px",
                backgroundColor: "#fff",
              }}
            >
              <FaLock color="#888" style={{ marginRight: "10px" }} />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  border: "none",
                  outline: "none",
                  flex: 1,
                  fontSize: "14px",
                  background: "transparent",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #5f72be, #9b23ea)",
                color: "#fff",
                padding: "12px",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "15px",
                transition: "0.3s ease",
              }}
            >
              Sign Up
            </button>
          </form>

          {error && <p style={{ color: "red", marginTop: "15px" }}>{error}</p>}
          {success && (
            <p style={{ color: "green", marginTop: "15px" }}>{success}</p>
          )}

          <p style={{ marginTop: "25px", fontSize: "13px" }}>
  Already have an account?{" "}
  <a href="/" style={{ color: "#9b23ea", cursor: "pointer", textDecoration: "none" }}>
    Login
  </a>
</p>

        </div>
      </div>

      <style>
        {`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          div[style*="display: flex"][style*="height: 100vh"] {
            flex-direction: column;
          }
        }
        `}
      </style>
    </div>
  );
};

export default SignupPage;
