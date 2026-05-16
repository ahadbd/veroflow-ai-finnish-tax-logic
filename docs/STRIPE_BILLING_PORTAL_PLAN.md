# VeroFlow AI: Stripe Billing & Customer Portal Plan (2026)

## 🎯 Objective
Enable secure, self-serve subscription management for VeroFlow users. Registered users must be able to upgrade (VeroPro -> Elite), downgrade, cancel, and update payment methods seamlessly directly from their dashboard.

By offloading this entirely to the **Stripe Customer Portal**, we ensure PCI compliance, zero support overhead for billing queries, and automatic App Store / Google Play policy compliance regarding self-service cancellations.

---

## 🛠️ Implementation Phases

### Phase 1: Backend Infrastructure (Stripe API Integration)
1. **Create the Billing Portal Route (`/api/billing/route.ts`)**
   - Create a new POST endpoint that accepts a `userId`.
   - Retrieve the user's `stripeCustomerId` from the Firebase `profiles` or `users` collection.
   - Use `stripe.billingPortal.sessions.create({ customer: customerId, return_url: dashboardUrl })`.
   - Return the generated Stripe hosted URL to the client.

2. **Refine Checkout Session Creation (`/api/checkout/route.ts`)**
   - Ensure that during the initial checkout creation, `stripe.checkout.sessions.create` stores the generated `customer` ID back to the Firebase user document. This is critical because the Billing Portal requires a Stripe Customer ID.

3. **Validate Webhooks (`/api/webhooks/route.ts`)**
   - Confirm `customer.subscription.updated` accurately parses the new `priceId` and updates the Firebase tier to `pro` or `elite`.
   - Confirm `customer.subscription.deleted` correctly downgrades the user to `free` and revokes premium features in real-time.

### Phase 2: Frontend UI (Settings Modal)
1. **Update `components/SettingsModal.tsx`**
   - Add a new "Billing & Subscription" tab or section within the modal.
   - Display the user's current active plan (e.g., "Current Plan: VeroPro").
   - Display a highly visible "Manage Billing" button.
2. **Handle Loading States**
   - When the user clicks "Manage Billing", show a loading spinner while the app fetches the secure URL from `/api/billing`.
   - Redirect the user's window to the provided Stripe Portal URL.

### Phase 3: Stripe Dashboard Configuration (Manual Admin Step)
1. **Enable the Customer Portal in Stripe**
   - Navigate to the Stripe Dashboard -> Settings -> Customer Portal.
   - Enable allowing customers to update their plans, cancel subscriptions, and update payment methods.
   - Add the specific Products/Prices (VeroPro €29.99, Elite €44.99) that users are allowed to switch between.

### Phase 4: Testing & Edge Cases
1. **Proration Testing**
   - Test a mid-month upgrade from VeroPro to Elite to ensure Stripe successfully calculates the proration difference without manual code.
2. **Cancellation Flow**
   - Test canceling a subscription and verify that Stripe sets it to cancel *at the end of the billing period*.
   - Ensure Firebase reflects `cancel_at_period_end` so the user keeps access until the month they paid for is over.
3. **Database Consistency**
   - Ensure the Firebase `onSnapshot` listener automatically unlocks/locks UI elements (like multi-vehicle fleet management for Elite) the moment the webhook fires.

---

## 🚀 Definition of Done
- A user can click "Manage Subscription" inside `SettingsModal`.
- They are routed to a secure Stripe UI.
- They can switch from Free -> VeroPro -> Elite or downgrade securely.
- Their VeroFlow dashboard updates automatically based on Stripe Webhooks without a manual page refresh.
