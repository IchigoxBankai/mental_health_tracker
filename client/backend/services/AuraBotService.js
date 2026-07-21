import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize the Gemini API client using the environment variable key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("WARNING: GEMINI_API_KEY is not defined in the environment variables.");
}

const ai = new GoogleGenAI({ apiKey });

/**
 * Generates an AI response text using the Google Gemini API (gemini-flash-latest model).
 * 
 * @param {string} message - Current user message.
 * @param {string} mood - Today's mood.
 * @param {Array} history - Previous chat history array.
 * @param {Object} [userContext] - Optional user context.
 * @returns {Promise<string>} AI response text.
 */
export async function generateReply(message, mood, history = [], userContext = {}) {
  try {
    if (!apiKey) {
      throw new Error("Gemini API key is not configured.");
    }

    const systemPrompt = `You are AuraBot, the AI wellness companion inside AuraTrack.

Your personality:
- Friendly
- Calm
- Supportive
- Emotionally intelligent
- Like a trusted friend
- Never judgmental
- Never robotic
- Keep responses short (2–5 sentences).
- Ask follow-up questions whenever appropriate.
- Do not immediately give advice before understanding the situation.
- Never diagnose mental illnesses.
- Never prescribe medication.
- Never claim to be a therapist.
- Encourage healthy habits.
- Answer general questions naturally.
- If the user is stressed, anxious, overwhelmed, or sad, respond with empathy first before suggesting solutions.
- Use simple English.
- Remember previous messages provided in the chat history.`;

    // Format the conversation history array into a readable string
    const formattedHistory = history
      .map((h) => {
        const senderName = h.sender === "user" ? "User" : "AuraBot";
        return `${senderName}: ${h.message}`;
      })
      .join("\n");

    // Construct the formatted prompt according to requirements
    const prompt = `Today's Mood:
${mood || "None logged today"}

Conversation History:
${formattedHistory || "No previous messages"}

Current User Message:
${message}

Generate a natural reply.`;

    // Call the Google Gemini API with gemini-flash-latest model
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const replyText = response.text || "";
    return replyText.trim();
  } catch (error) {
  console.error("Error in AuraBotService.generateReply:", error);

  if (error?.status === 503 || error?.message?.includes("UNAVAILABLE")) {
    return "I'm experiencing high demand from the AI service right now. Please try again in a minute.";
  }

  return "Sorry, something went wrong while generating a response. Please try again later.";
}
}
