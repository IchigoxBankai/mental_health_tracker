import React, { useState, useEffect } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { app } from "../services/firebaseConfig";
import {
  FaUserAlt,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { GiBrain } from "react-icons/gi";

const quotes = [
  "Your mind matters 🌿",
  "Every day is a step forward ✨",
  "Breathe. Relax. Heal. 💜",
  "Mental health is just as important as physical health 🧘‍♂️",
   "Push through the pain. Giving up hurts more.",
  "You’ve got two legs and a heartbeat. What’s stopping you?",
  "Life is not a game of luck. If you wanna win, work hard.",
  "Knowing what it feels to be in pain is exactly why we try to be kind to others",
  "Human beings are strong because we can change ourselves",
];

const LoginPage = () => {
  const auth = getAuth(app);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);

  /* Quote rotation */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  /* LOGIN */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await setPersistence(
        auth,
        rememberMe
          ? browserLocalPersistence
          : browserSessionPersistence
      );

      await signInWithEmailAndPassword(auth, email, password);

      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    } catch (err) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  /* FORGOT PASSWORD */
  const handleForgotPassword = async () => {
    if (!email) {
      setError("Enter your email first.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent ✅");
      setError("");
    } catch {
      setError("Failed to send reset email.");
    }
  };
const leftBackground =
  "linear-gradient(135deg, #80e3f5ea 0%, #5f3677 100%)";
  const rightBackground =
  "linear-gradient(135deg, #60c1eeea 0%, #230446 100%)";
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "Poppins",
        overflow: "hidden",
      }}
    >
      {/* LEFT SIDE */}
      <div
        style={{
          flex: 1,
          background: leftBackground,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "40px",
        }}
      >
        <img
          src="/images/mht-logo.png"
          alt="brain"
          style={{  width: "95%",
  maxWidth: "620px",
  background: "transparent",
  mixBlendMode: "multiply",
  animation: "floatImage 5s ease-in-out infinite", }}
        />
        
        <br></br>

        <h2 style={{  marginTop: "25px",
    color: "#2d2d2d",
    fontWeight: "600",
    fontSize: "22px",
    maxWidth: "420px",
    lineHeight: "1.4",
    animation: "fadeIn 1s ease",}}>
          {quotes[currentQuote]}
        </h2>
      </div>

      {/* LOGIN BOX */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: rightBackground,
        }}
      >
        <div
          style={{
            background: "#bed5f8ec",
            padding: "40px 50px",
            borderRadius: "20px",
            backdropFilter: "blur(12px)",
            width: "360px",
            textAlign: "center",
            boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
          }}
        >
          <GiBrain size={55} color="#5f72be" />

          <h2 style={{ color: "#2d2d2d", fontWeight: "600" }}>
  Mental Health Tracker
</h2>

<p style={{ color: "#555", marginBottom: "25px" }}>
  Welcome back! Please login to continue.
</p>

          <form onSubmit={handleLogin}>
            {/* EMAIL */}
            <div className="inputBox">
              <FaUserAlt color="#444" size={14} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="inputBox">
              <FaLock color="#444" size={14} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

              <span
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="eye"
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </span>
            </div>

            {/* REMEMBER + FORGOT */}
            <div className="options">
              <label>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() =>
                    setRememberMe(!rememberMe)
                  }
                />
                Remember Me
              </label>

              <span
                onClick={handleForgotPassword}
                className="forgot"
              >
                Forgot Password?
              </span>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className={loading ? "loadingBtn" : ""}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {error && (
            <p style={{ color: "red" }}>{error}</p>
          )}
          {message && (
            <p style={{ color: "green" }}>
              {message}
            </p>
          )}

          <p style={{ marginTop: "20px", color: "purple"}}>
            Don’t have an account?
            <a href="/signup"> Sign Up</a>
          </p>
        </div>
      </div>

      {/* STYLES */}
      <style>{`
        .inputBox{
          display:flex;
          align-items:center;
           background:#f8f8f8;
          padding:10px;
          margin-bottom:15px;
          border-radius:8px;
          border:1px solid #ccc;
@keyframes floatImage {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
  100% { transform: translateY(0px); }
}
        }

        .inputBox input{
          border:none;
          outline:none;
          flex:1;
          margin-left:10px;
        }

        .eye{
  cursor:pointer;
  color:#444;
  transition:0.2s;
}

.eye:hover{
  color:#9b23ea;
}

        .options{
  display:flex;
  justify-content:space-between;
  align-items:center;
  font-size:13px;
  margin-bottom:18px;
  
}

.options label{
  display:flex;
  align-items:center;
  gap:8px;   /* ✅ spacing fix */
  cursor:pointer;
color: purple;
}

.options input[type="checkbox"]{
  width:14px;
  height:14px;
  cursor:pointer;
  transform: scale(1.1);
}

        .forgot{
  color:#7a1fe0;
  font-weight:500;
}

        button{
          width:100%;
          padding:12px;
          border:none;
          border-radius:10px;
          color:white;
          font-weight:bold;
          background:linear-gradient(135deg,#5f72be,#9b23ea);
          transition:0.3s;
        }

        .loadingBtn{
          transform:scale(0.95);
          opacity:0.8;
        }
          
      `}</style>
    </div>
  );
};

export default LoginPage;