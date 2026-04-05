import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/firebase'; // Assuming db exported from firebase.ts
import { doc, updateDoc, setDoc } from 'firebase/firestore';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event;

  try {
    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET is not set. Using raw event data without validation (Testing ONLY).');
      event = JSON.parse(body);
    } else {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle various event types
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.client_reference_id || session.metadata?.userId;
      if (userId) {
        await updateSubscriptionInFirestore(userId, session);
      }
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const userId = subscription.metadata?.userId;
      if (userId) {
        await updateSubscriptionInFirestore(userId, subscription);
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const userId = subscription.metadata?.userId;
      if (userId) {
        await cancelSubscriptionInFirestore(userId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

async function updateSubscriptionInFirestore(userId: string, data: any) {
  const userRef = doc(db, 'users', userId);
  
  // Note: For simplicity, extracting basic info.
  // In production, we'd fetch the actual subscription object to get currentPeriodEnd etc.
  const subscriptionData = {
    subscription: {
      status: 'active',
      stripeId: data.subscription || data.id,
      stripeCustomerId: data.customer,
      // Default to pro, actual logic would verify priceId -> tier mapping
      tier: 'pro', 
      updatedAt: new Date().toISOString()
    }
  };

  try {
    await updateDoc(userRef, subscriptionData);
  } catch (e) {
    // If document doesn't exist, use setDoc instead
    await setDoc(userRef, subscriptionData, { merge: true });
  }
}

async function cancelSubscriptionInFirestore(userId: string) {
  const userRef = doc(db, 'users', userId);
  const data = {
    subscription: {
      status: 'canceled',
      tier: 'free',
      updatedAt: new Date().toISOString()
    }
  };
  await updateDoc(userRef, data);
}
