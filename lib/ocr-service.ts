import { GoogleGenAI, Type } from "@google/genai";

function getGeminiClient() {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new GoogleGenAI({ apiKey });
}

export const OCR_SHIFT_PROMPT = `
You are a Finnish Tax Compliance OCR expert. Your task is to extract structured data from screenshots of Wolt or Uber Eats weekly summaries.
Identify:
- Date Range (Start and End)
- App Name (Wolt or Uber Eats)
- Base Fee (Gross earnings excluding tips)
- Tips/Boosts
- Estimated Distance (in KM)

Return ONLY a JSON object matching this schema:
{
  "appName": "Wolt" | "Uber Eats",
  "startDate": "ISO Date",
  "endDate": "ISO Date",
  "grossPay": number,
  "tips": number,
  "distanceKm": number
}
If distance is missing, estimate based on pay (approx 1.5km per €3 base fee).
`;

export const OCR_RECEIPT_PROMPT = `
You are a Finnish Tax Compliance OCR expert. Your task is to extract structured data from expense receipts (fuel, gear, maintenance, phone bills).
Identify:
- Date
- Merchant Name
- Total Amount (€)
- VAT Amount (€) or VAT %
- Category (Work Gear, Vehicle Maintenance, Fuel, Phone Bill, Other)

Return ONLY a JSON object matching this schema:
{
  "date": "ISO Date",
  "merchant": "string",
  "amount": number,
  "vat": number,
  "category": "Work Gear" | "Vehicle Maintenance" | "Fuel" | "Phone Bill" | "Other"
}
If the merchant is a telecom provider (e.g., DNA, Elisa, Telia), categorize as "Phone Bill".
If the merchant is a gas station (e.g., Neste, ABC, Shell), categorize as "Fuel".
If the merchant is a hardware store or bike shop, categorize as "Work Gear" or "Vehicle Maintenance".
`;

import { logApiUsage } from "./admin-logs";

export async function performOCR(base64Image: string, type: 'shift' | 'receipt' = 'shift', uid?: string) {
  const ai = getGeminiClient();
  if (!ai) {
    console.warn('Gemini OCR is disabled because NEXT_PUBLIC_GEMINI_API_KEY is not set.');
    return {};
  }

  const prompt = type === 'shift' ? OCR_SHIFT_PROMPT : OCR_RECEIPT_PROMPT;
  const schema = type === 'shift' ? {
    type: Type.OBJECT,
    properties: {
      appName: { type: Type.STRING },
      startDate: { type: Type.STRING },
      endDate: { type: Type.STRING },
      grossPay: { type: Type.NUMBER },
      tips: { type: Type.NUMBER },
      distanceKm: { type: Type.NUMBER }
    },
    required: ["appName", "grossPay", "tips"]
  } : {
    type: Type.OBJECT,
    properties: {
      date: { type: Type.STRING },
      merchant: { type: Type.STRING },
      amount: { type: Type.NUMBER },
      vat: { type: Type.NUMBER },
      category: { type: Type.STRING }
    },
    required: ["date", "merchant", "amount"]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/png",
                data: base64Image.split(',')[1] || base64Image
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: schema as any
      }
    });

    const text = response.text?.trim();
    if (!text || text === "undefined") {
      logApiUsage(uid, `gemini_ocr_${type}` as any, 'error', { message: 'Empty response' });
      return {};
    }
    
    const data = JSON.parse(text);
    logApiUsage(uid, `gemini_ocr_${type}` as any, 'success');
    return data;
  } catch (e: any) {
    console.error("OCR Service Error:", e);
    logApiUsage(uid, `gemini_ocr_${type}` as any, 'error', { message: e.message });
    return {};
  }
}

export const VOICE_COMMAND_PROMPT = `
You are a Finnish Tax Compliance assistant. Your task is to parse a voice transcript into a structured log entry.
Identify if the user is logging:
1. A Shift (e.g., "Start Wolt shift", "Stop shift")
2. An Expense/Receipt (e.g., "Logged 20 euro fuel at ABC", "Paid 50 euro phone bill")
3. A Tip (e.g., "Got a 5 euro tip on the last Wolt drop")

Return ONLY a JSON object matching this schema:
{
  "type": "shift_start" | "shift_stop" | "expense" | "tip",
  "data": {
    "amount": number (if applicable),
    "merchant": "string" (if applicable),
    "category": "Fuel" | "Phone Bill" | "Work Gear" | "Other" (if applicable),
    "appName": "Wolt" | "Uber Eats" | "Foodora" (if applicable)
  }
}
`;

export async function parseVoiceCommand(transcript: string, uid?: string) {
  const ai = getGeminiClient();
  if (!ai) {
    console.warn('Gemini voice parsing is disabled because NEXT_PUBLIC_GEMINI_API_KEY is not set.');
    return {};
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          parts: [
            { text: VOICE_COMMAND_PROMPT },
            { text: `Transcript: "${transcript}"` }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            data: {
              type: Type.OBJECT,
              properties: {
                amount: { type: Type.NUMBER },
                merchant: { type: Type.STRING },
                category: { type: Type.STRING },
                appName: { type: Type.STRING }
              }
            }
          },
          required: ["type", "data"]
        } as any
      }
    });

    const text = response.text?.trim();
    if (!text || text === "undefined") {
      logApiUsage(uid, 'gemini_voice', 'error', { message: 'Empty response' });
      return {};
    }
    
    const data = JSON.parse(text);
    logApiUsage(uid, 'gemini_voice', 'success');
    return data;
  } catch (e: any) {
    console.error("Voice Command Service Error:", e);
    logApiUsage(uid, 'gemini_voice', 'error', { message: e.message });
    return {};
  }
}
