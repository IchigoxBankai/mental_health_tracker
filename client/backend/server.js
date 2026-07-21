import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generateReply } from "./services/AuraBotService.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// API Endpoint for chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message, mood, history, userContext } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const reply = await generateReply(message, mood, history, userContext);

    res.json({ reply });
  } catch (error) {
    console.error("Error in POST /api/chat:", error);
    res.status(500).json({ error: "Failed to generate AI response." });
  }
});

if (process.env.VERCEL !== "1") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
  );
}

export default app;
