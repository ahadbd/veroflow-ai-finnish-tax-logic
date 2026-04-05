import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, increment } from 'firebase/firestore';

export type ApiService = 'gemini_ocr_shift' | 'gemini_ocr_receipt' | 'gemini_voice' | 'firebase_auth' | 'firestore_query';

export async function logApiUsage(uid: string | undefined, service: ApiService, status: 'success' | 'error' = 'success', metadata: any = {}) {
  try {
    const logRef = collection(db, 'api_usage_logs');
    await addDoc(logRef, {
      uid: uid || 'anonymous',
      service,
      status,
      timestamp: serverTimestamp(),
      ...metadata
    });

    // Also update an aggregate counter for the current day to make admin charts faster
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const aggregateRef = doc(db, 'system_stats', `usage_${today}`);
    
    await setDoc(aggregateRef, {
      [service]: increment(1),
      [`${service}_${status}`]: increment(1),
      lastUpdated: serverTimestamp()
    }, { merge: true });

  } catch (e) {
    console.warn('Failed to log API usage:', e);
  }
}

export async function logAdminAction(adminUid: string, action: string, details: any = {}) {
  try {
    const logRef = collection(db, 'admin_audit_logs');
    await addDoc(logRef, {
      adminUid,
      action,
      timestamp: serverTimestamp(),
      ...details
    });
  } catch (e) {
    console.warn('Failed to log admin action:', e);
  }
}
