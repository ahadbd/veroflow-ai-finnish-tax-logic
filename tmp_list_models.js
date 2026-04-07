import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

async function listModels() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const models = await ai.models.list();
    console.log("Available models:", JSON.stringify(models, null, 2));
  } catch (e) {
    console.error("Error listing models:", e);
  }
}

listModels();
