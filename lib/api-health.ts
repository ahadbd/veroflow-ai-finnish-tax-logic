import { db } from '@/firebase';
import { getDocFromServer, doc } from 'firebase/firestore';

export interface ApiServiceStatus {
  service: string;
  configured: boolean;
  status: 'ONLINE' | 'OFFLINE' | 'UNCONFIGURED' | 'TESTING';
  latencyMs?: number;
  message?: string;
  metadata?: Record<string, string>;
  envKey?: string;
}

/**
 * Pings Firebase to verify read connectivity.
 */
export async function checkFirebaseHealth(): Promise<ApiServiceStatus> {
  const start = performance.now();
  try {
    // Attempt to read from a designated public/healthcheck path or just check config
    // Even if permission is denied, it proves the DB is reachable.
    await getDocFromServer(doc(db, '__healthcheck__', 'ping'));
    return {
      service: 'Firebase Cloud Firestore',
      configured: true,
      status: 'ONLINE',
      latencyMs: Math.round(performance.now() - start),
      envKey: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      metadata: {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Unknown',
        domain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Unknown'
      }
    };
  } catch (e: any) {
    // If we get permission-denied, we actually connected to Firebase successfully!
    if (e.code === 'permission-denied') {
      return {
        service: 'Firebase Cloud Firestore',
        configured: true,
        status: 'ONLINE',
        latencyMs: Math.round(performance.now() - start),
        message: 'Connected (Read Restricted)',
        envKey: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
        metadata: {
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Unknown',
        }
      };
    }
    
    return {
      service: 'Firebase Cloud Firestore',
      configured: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      status: 'OFFLINE',
      envKey: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      message: e.message
    };
  }
}

/**
 * Validates if the Gemini API is configured and responds to a tiny test prompt.
 */
export async function checkGeminiHealth(model: string = 'gemini-1.5-flash'): Promise<ApiServiceStatus> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return {
      service: 'Google Gemini AI',
      configured: false,
      status: 'UNCONFIGURED',
      envKey: 'NEXT_PUBLIC_GEMINI_API_KEY',
      message: 'Missing or Default API Key'
    };
  }

  const start = performance.now();
  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    
    // Tiny lightweight generation to ensure key is active
    await ai.models.generateContent({
      model,
      contents: "Respond with exactly '1'"
    });

    return {
      service: 'Google Gemini AI',
      configured: true,
      status: 'ONLINE',
      latencyMs: Math.round(performance.now() - start),
      envKey: 'NEXT_PUBLIC_GEMINI_API_KEY',
      metadata: { model }
    };
  } catch (e: any) {
    return {
      service: 'Google Gemini AI',
      configured: true,
      status: 'OFFLINE',
      envKey: 'NEXT_PUBLIC_GEMINI_API_KEY',
      message: e.message
    };
  }
}

/**
 * Returns the environment context URL (Applet URL).
 */
export function getAppEnvironmentStatus(): ApiServiceStatus {
  const appUrl = process.env.APP_URL;
  return {
    service: 'Host Environment URL',
    configured: !!appUrl && appUrl !== 'MY_APP_URL',
    status: (appUrl && appUrl !== 'MY_APP_URL') ? 'ONLINE' : 'UNCONFIGURED',
    envKey: 'APP_URL',
    metadata: {
      url: appUrl || 'Not Configured (localhost)'
    }
  };
}
