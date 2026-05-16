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
You are a Finnish delivery courier voice assistant. Parse the transcript into a structured JSON action.
The courier speaks a mix of Finnish and English — called "Finglish". Handle all combinations.

## Action Types:
- shift_start: courier starting a delivery shift
- shift_stop: courier ending a delivery shift  
- expense: courier logging a business expense (fuel, phone, gear)
- tip: courier received a cash tip

## Finglish Examples (train on these patterns):
| Transcript | Type | Notes |
|---|---|---|
| "aloita" | shift_start | Finnish: start |
| "aloita wolt" | shift_start | app = Wolt |
| "aloita uber shift" | shift_start | Finglish hybrid |
| "start shift" | shift_start | English |
| "käynnistä vuoro" | shift_start | Finnish: start shift |
| "lopeta" | shift_stop | Finnish: stop |
| "lopeta shift" | shift_stop | Finglish |
| "päätä" | shift_stop | Finnish: end/finish |
| "stop" | shift_stop | English |
| "vuoro loppu" | shift_stop | Finnish: shift over |
| "bensaa kaksikymmentä euroa" | expense | Finnish: fuel 20€ |
| "tankkaan 35 euroa" | expense | Finnish: filling up, amount=35, category=Fuel |
| "tankkasin" | expense | Finnish: fueled up, category=Fuel |
| "log fuel 40" | expense | English: amount=40, category=Fuel |
| "loggaa bensa neljäkymmentä" | expense | Finglish, category=Fuel, amount=40 |
| "puhelinlasku 15" | expense | Finnish: phone bill 15€ |
| "phone bill kaksikymmentäviisi" | expense | Finglish phone bill |
| "tippi viisi" | tip | Finnish: tip 5€ |
| "sain tipin kymmenen euroa" | tip | Finnish: got a tip 10€ |
| "tip 3 euros" | tip | English |
| "ABC kolmekymmentä" | expense | gas station = Fuel |
| "Neste viisikymmentä" | expense | gas station = Fuel |

## Finnish Number Words (use for amount parsing):
nolla=0, yksi=1, kaksi=2, kolme=3, neljä=4, viisi=5, kuusi=6, seitsemän=7, kahdeksan=8, yhdeksän=9,
kymmenen=10, yksitoista=11, kaksitoista=12, kolmetoista=13, neljätoista=14, viisitoista=15,
kuusitoista=16, seitsemäntoista=17, kahdeksantoista=18, yhdeksäntoista=19,
kaksikymmentä=20, kolmekymmentä=30, neljäkymmentä=40, viisikymmentä=50,
kuusikymmentä=60, seitsemänkymmentä=70, kahdeksankymmentä=80, yhdeksänkymmentä=90,
sata=100, tuhat=1000, miljoona=1000000
Compound: "kaksikymmentäviisi" = 25, "kolmekymmentäkaksi" = 32

## Category Rules:
- Fuel: bensa, bensiini, tankkaan, tankkasin, diesel, ABC, Neste, Shell, ST1, Teboil, fuel
- Phone Bill: puhelinlasku, DNA, Elisa, Telia, phone bill, lasku
- Vehicle Maintenance: huolto, renkaat, öljy, maintenance, service
- Work Gear: varusteet, kypärä, gear, helmet

## App Detection:
- Wolt: wolt
- Uber Eats: uber, uberi
- Foodora: foodora

Return ONLY valid JSON:
{
  "type": "shift_start" | "shift_stop" | "expense" | "tip",
  "data": {
    "amount": number | null,
    "merchant": string | null,
    "category": "Fuel" | "Phone Bill" | "Vehicle Maintenance" | "Work Gear" | "Other" | null,
    "appName": "Wolt" | "Uber Eats" | "Foodora" | null
  }
}
`;

// ─── Finnish Number Word Parser ────────────────────────────────────────────────

const FINNISH_ONES: Record<string, number> = {
  nolla: 0, yksi: 1, kaksi: 2, kolme: 3, neljä: 4, viisi: 5,
  kuusi: 6, seitsemän: 7, kahdeksan: 8, yhdeksän: 9,
  yksitoista: 11, kaksitoista: 12, kolmetoista: 13, neljätoista: 14,
  viisitoista: 15, kuusitoista: 16, seitsemäntoista: 17, kahdeksantoista: 18, yhdeksäntoista: 19,
};
const FINNISH_TENS: Record<string, number> = {
  kymmenen: 10, kaksikymmentä: 20, kolmekymmentä: 30, neljäkymmentä: 40,
  viisikymmentä: 50, kuusikymmentä: 60, seitsemänkymmentä: 70,
  kahdeksankymmentä: 80, yhdeksänkymmentä: 90,
};
const FINNISH_LARGE: Record<string, number> = { sata: 100, tuhat: 1000, miljoona: 1000000 };

/**
 * Parses Finnish number words from a transcript string.
 * e.g. "kaksikymmentäviisi" → 25, "kolmekymmentä kaksi" → 32
 * Also handles digit strings: "35.50" → 35.5
 */
function parseFinnishAmount(text: string): number | null {
  // Prefer plain digit first
  const digitMatch = text.match(/(\d+([.,]\d+)?)/);
  if (digitMatch) return parseFloat(digitMatch[1].replace(',', '.'));

  const lower = text.toLowerCase().replace(/-/g, '');
  let total = 0;
  let found = false;

  // Check compound tens+ones like "kaksikymmentäviisi"
  for (const [tens, tval] of Object.entries(FINNISH_TENS)) {
    if (lower.includes(tens)) {
      total += tval;
      found = true;
      const rest = lower.replace(tens, '').trim();
      for (const [one, oval] of Object.entries(FINNISH_ONES)) {
        if (rest.includes(one)) { total += oval; break; }
      }
      return total;
    }
  }
  for (const [word, val] of Object.entries(FINNISH_ONES)) {
    if (lower.includes(word)) { total += val; found = true; }
  }
  for (const [word, val] of Object.entries(FINNISH_LARGE)) {
    if (lower.includes(word)) { total = total === 0 ? val : total * val; found = true; }
  }

  return found ? total : null;
}

// ─── Finglish Fallback Parser ──────────────────────────────────────────────────

function finglishFallback(transcript: string): any {
  const lower = transcript.toLowerCase();
  const result: any = { type: 'unknown', data: { amount: null, merchant: null, category: null, appName: null } };

  // ── Action detection ─────────────────────────────────────────────────────────
  const isStart = /\b(aloita|aloitan|käynnistä|start|begin|alkaa)\b/.test(lower);
  const isStop  = /\b(lopeta|lopetan|päätä|päätän|stop|finish|end|valmis|vuoro\s*loppu|shift\s*over)\b/.test(lower);
  const isTip   = /\b(tippi|tipin|tip|juomaraha|sain\s*tipin|got\s*a\s*tip)\b/.test(lower);
  const isFuel  = /\b(bensa|bensiini|tankka[ai]n|tankkasin|diesel|fuel|huoltamo|abc|neste|shell|st1|teboil)\b/.test(lower);
  const isPhone = /\b(puhelinlasku|puhelilasku|dna|elisa|telia|phone\s*bill|lasku)\b/.test(lower);
  const isGear  = /\b(varusteet|kypärä|gear|helmet|reppu|backpack)\b/.test(lower);
  const isMaint = /\b(huolto|renkaat|öljy|maintenance|service|rengas)\b/.test(lower);
  const isExpense = isFuel || isPhone || isGear || isMaint ||
    /\b(log|loggaa|kulut?|expense|osto|ostin|maksoin)\b/.test(lower);

  if (isStop)         result.type = 'shift_stop';
  else if (isStart)   result.type = 'shift_start';
  else if (isTip)     result.type = 'tip';
  else if (isExpense) result.type = 'expense';

  // ── App detection ─────────────────────────────────────────────────────────────
  if (/\bwolt\b/.test(lower))              result.data.appName = 'Wolt';
  else if (/\b(uber|uberi)\b/.test(lower)) result.data.appName = 'Uber Eats';
  else if (/\bfoodora\b/.test(lower))      result.data.appName = 'Foodora';

  // ── Merchant detection (gas stations) ─────────────────────────────────────────
  const merchantMatch = lower.match(/\b(abc|neste|shell|st1|teboil|dna|elisa|telia)\b/);
  if (merchantMatch) result.data.merchant = merchantMatch[1].toUpperCase();

  // ── Category ──────────────────────────────────────────────────────────────────
  if (isFuel)        result.data.category = 'Fuel';
  else if (isPhone)  result.data.category = 'Phone Bill';
  else if (isMaint)  result.data.category = 'Vehicle Maintenance';
  else if (isGear)   result.data.category = 'Work Gear';

  // ── Amount parsing (Finnish words + digits) ────────────────────────────────────
  result.data.amount = parseFinnishAmount(lower);

  return result;
}

export async function parseVoiceCommand(transcript: string, uid?: string) {
  const ai = getGeminiClient();
  if (!ai) {
    console.warn('Gemini unavailable — using Finglish fallback parser.');
    return finglishFallback(transcript);
  }

  const schema = {
    type: Type.OBJECT,
    properties: {
      type: { type: Type.STRING },
      data: {
        type: Type.OBJECT,
        properties: {
          amount:   { type: Type.NUMBER },
          merchant: { type: Type.STRING },
          category: { type: Type.STRING },
          appName:  { type: Type.STRING }
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
    console.warn("Gemini voice parse failed — using Finglish fallback:", e.message);
    const fallback = finglishFallback(transcript);
    logApiUsage(uid, 'gemini_voice', 'fallback', { originalError: e.message, fallbackType: fallback.type });
    return fallback;
  }
}

