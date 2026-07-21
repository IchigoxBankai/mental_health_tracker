import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("WARNING: GEMINI_API_KEY is not defined.");
}

const ai = new GoogleGenAI({ apiKey });

// Retry helper
async function generateWithRetry(prompt, systemPrompt, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      return response.text?.trim() || "";
    } catch (error) {
      console.error(`Gemini Attempt ${attempt} Failed:`, error);

      const isTemporary =
        error?.status === 503 ||
        error?.status === 429 ||
        error?.message?.includes("UNAVAILABLE") ||
        error?.message?.includes("RESOURCE_EXHAUSTED");

      if (isTemporary && attempt < retries) {
        console.log(`Retrying in ${attempt * 2000}ms...`);
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
        continue;
      }

      throw error;
    }
  }
}

export async function generateReply(
  message,
  mood,
  history = [],
  userContext = {}
) {
  try {
    if (!apiKey) {
      return "AuraBot is not configured correctly. Please contact the administrator.";
    }

    const systemPrompt = `
You are AuraBot, the AI wellness companion inside AuraTrack.

Your personality:
- Friendly
- Calm
- Supportive
- Emotionally intelligent
- Like a trusted friend
- Never judgmental
- Never robotic
- Keep responses between 2 and 5 sentences.
- Ask follow-up questions naturally.
- Never diagnose mental illness.
- Never prescribe medication.
- Never claim to be a therapist.
- Encourage healthy habits.
- Respond naturally to general questions.
- If the user is sad, anxious, lonely or overwhelmed, first acknowledge their feelings before giving suggestions.
- Use simple English.
- Remember previous conversation history.
`;

    const formattedHistory =
      history.length > 0
        ? history
            .map((chat) => {
              const sender =
                chat.sender === "user" ? "User" : "AuraBot";
              return `${sender}: ${chat.message}`;
            })
            .join("\n")
        : "No previous conversation.";

    const prompt = `
Today's Mood:
${mood || "No mood logged today"}

Conversation History:
${formattedHistory}

Current User Message:
${message}

Respond naturally as AuraBot.
`;

    const reply = await generateWithRetry(prompt, systemPrompt);

    return reply;
  } catch (error) {
    console.error("AuraBot Error:", error);

    if (
      error?.status === 503 ||
      error?.message?.includes("UNAVAILABLE")
    ) {
      return "AuraBot is currently experiencing high demand from the AI service. Please try again in a minute.";
    }

    if (
      error?.status === 429 ||
      error?.message?.includes("RESOURCE_EXHAUSTED")
    ) {
      return "AuraBot has reached the current request limit. Please wait a moment before trying again.";
    }

    return "Sorry, I'm having trouble generating a response right now. Please try again in a little while.";
  }
}