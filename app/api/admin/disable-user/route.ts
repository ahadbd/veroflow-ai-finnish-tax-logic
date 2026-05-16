/**
 * POST /api/admin/disable-user
 * Disables a Firebase Auth user account.
 * Requires:
 *   - FIREBASE_SERVICE_ACCOUNT_JSON (full service account JSON as a string) in env
 *   - Caller must send their Firebase ID token in Authorization: Bearer <token>
 *   - Caller must have isAdmin: true in their Firestore profile
 */
import { NextRequest, NextResponse } from 'next/server';

// Lazy-load firebase-admin to avoid issues in non-server environments
async function getAdminServices() {
  const { initializeApp, getApps, cert } = await import('firebase-admin/app');
  const { getAuth } = await import('firebase-admin/auth');
  const { getFirestore } = await import('firebase-admin/firestore');

  if (getApps().length === 0) {
    const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!serviceAccountRaw) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not configured');
    }
    const serviceAccount = JSON.parse(serviceAccountRaw);
    initializeApp({ credential: cert(serviceAccount) });
  }

  return { auth: getAuth(), db: getFirestore() };
}

export async function POST(req: NextRequest) {
  try {
    const { auth, db } = await getAdminServices();

    // Verify caller's ID token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized — no token' }, { status: 401 });
    }
    const decoded = await auth.verifyIdToken(authHeader.slice(7));

    // Verify caller has isAdmin: true in Firestore profiles
    const callerSnap = await db.doc(`profiles/${decoded.uid}`).get();
    if (!callerSnap.exists || !callerSnap.data()?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden — not an admin' }, { status: 403 });
    }

    const body = await req.json();
    const { uid } = body;
    if (!uid || typeof uid !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid uid' }, { status: 400 });
    }

    // Prevent self-disable
    if (uid === decoded.uid) {
      return NextResponse.json({ error: 'Cannot disable your own account' }, { status: 400 });
    }

    // Disable the user in Firebase Auth
    await auth.updateUser(uid, { disabled: true });

    // Write audit log to Firestore
    await db.collection('admin_audit_logs').add({
      timestamp: Date.now(),
      level: 'warn',
      message: `[${callerSnap.data()?.displayName ?? 'Admin'}] DISABLED Firebase Auth account — UID: ${uid}`,
      context: 'admin_disable_user',
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error';
    console.error('[disable-user API]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
