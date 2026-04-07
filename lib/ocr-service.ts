import { GoogleGenAI, Type } from "@google/genai";

function getGeminiClient() {
  const apiKey = (process.env.NEXT_PUBLIC_GEMINI_API_KEY || "").trim();

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
You are a Finnish tax expert. Extract data from this receipt.
Return a JSON object:
- date: ISO format
- merchant: store name
- amount: total final amount (number, ignore $)
- vat: tax amount (number)
- category: "Fuel", "Phone Bill", "Vehicle Maintenance", "Work Gear", or "Other"

If gas station (Neste, ABC, Shell), category is Fuel.
If telco (DNA, Elisa, Telia), category is Phone Bill.
Ignore currency symbols, return only numbers.
`;

import { logApiUsage } from "./admin-logs";

export async function performOCR(base64Image: string, type: 'shift' | 'receipt' = 'shift', uid?: string) {
  const ai = getGeminiClient();
  if (!ai) {
    console.warn('Gemini OCR API key missing.');
    return {};
  }

  // Extract clean base64 and mimeType
  let mimeType = "image/png";
  let imageData = base64Image;
  if (base64Image.startsWith('data:')) {
    const parts = base64Image.split(',');
    mimeType = parts[0].split(':')[1].split(';')[0];
    imageData = parts[1];
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
      model: "gemini-2.5-flash",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: imageData
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

    const cleanText = response.text?.trim() || "";
    if (!cleanText || cleanText === "undefined" || cleanText === "null") throw new Error("Empty response");

    const data = JSON.parse(cleanText.replace(/```json/g, '').replace(/```/g, '').trim());
    logApiUsage(uid, `gemini_ocr_${type}` as any, 'success');
    return data;
  } catch (e: any) {
    console.error("OCR Service Critical Error:", e);
    // If it's a model not found error, it might be due to regional restrictions or versioning.
    // We will attempt one silent retry with a generic model string if needed, 
    // but for now, we'll log the specific API error.
    logApiUsage(uid, `gemini_ocr_${type}` as any, 'error', { message: e.message });
    return {};
  }
}

export const VOICE_COMMAND_PROMPT = `
You are a Finnish Tax Compliance assistant. Your task is to parse a voice transcript into a structured log entry for delivery couriers (Wolt, Uber Eats, Foodora).
The transcript may be in Finnish or English.

Mappings:
- "Aloita" / "Start" -> shift_start
- "Lopeta" / "Stop" / "Päätä" -> shift_stop
- "Bensaa" / "Fuel" / "Tankkaus" -> expense (category: Fuel)
- "Tippi" / "Tip" -> tip

Identify:
1. type: "shift_start" | "shift_stop" | "expense" | "tip"
2. amount: numeric value (e.g. "20 euroa" -> 20)
3. merchant: "ABC", "Neste", "Shell" etc.
4. category: "Fuel", "Phone Bill", "Work Gear", "Other"
5. appName: "Wolt", "Uber Eats", "Foodora"

Return ONLY a JSON object:
{
  "type": "string",
  "data": {
    "amount": number,
    "merchant": "string",
    "category": "string",
    "appName": "string"
  }
}
`;

export async function parseVoiceCommand(transcript: string, uid?: string) {
  const ai = getGeminiClient();
  if (!ai) {
    console.warn('Gemini voice parsing is disabled because NEXT_PUBLIC_GEMINI_API_KEY is not set.');
    return {};
  }

  const schema = {
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
  };

  try {
    const response = await ai.models.generateContent({ 
      model: "gemini-2.5-flash",
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
        responseSchema: schema as any
      }
    });

    const cleanText = response.text?.trim() || "";

    if (!cleanText || cleanText === "undefined" || cleanText === "null") {
      throw new Error('Empty or invalid response string');
    }
    
    const data = JSON.parse(cleanText.replace(/```json/g, '').replace(/```/g, '').trim());
    logApiUsage(uid, 'gemini_voice', 'success');
    return data;
  } catch (e: any) {
    console.error("Voice Command Service Error, attempting fallback:", e);
    // Robust Fallback for Voice
    const result: any = { type: 'unknown', data: {} };
    const lower = transcript.toLowerCase();
    
    if (lower.includes('aloita') || lower.includes('start')) result.type = 'shift_start';
    if (lower.includes('lopeta') || lower.includes('stop') || lower.includes('päätä')) result.type = 'shift_stop';
    if (lower.includes('bensa') || lower.includes('polttoaine') || lower.includes('fuel')) {
       result.type = 'expense';
       result.data.category = 'Fuel';
    }
    if (lower.includes('tippi') || lower.includes('tip')) result.type = 'tip';

    // Extract amount
    const amountMatch = lower.match(/(\d+([.,]\d+)?)/);
    if (amountMatch) result.data.amount = parseFloat(amountMatch[1].replace(',', '.'));

    // Extract app
    if (lower.includes('wolt')) result.data.appName = 'Wolt';
    if (lower.includes('uber')) result.data.appName = 'Uber Eats';
    if (lower.includes('foodora')) result.data.appName = 'Foodora';

    logApiUsage(uid, 'gemini_voice', 'fallback', { originalError: e.message, fallbackType: result.type });
    return result;
  }
}
