# VeroFlow AI - Master Application Context

This document is specifically designed to provide LLMs with deep contextual knowledge about "VeroFlow AI". It can be used as a grounding source for generating marketing copy, technical documentation, feature ideation, or strategic presentations.

---

## 🚀 1. Overview & Core Purpose
**App Name**: VeroFlow AI
**Target Audience**: Finnish Gig Economy Couriers (primarily Wolt and Uber Eats delivery partners).
**Primary Mission**: To automate and simplify complex Finnish tax laws, mileage deductions, and expense tracking so couriers can maximize profitability while driving safely.

Unlike generic bookkeeping software, VeroFlow AI is hyper-specialized for delivery drivers in Finland. It understands the exact tax thresholds (like YEL entrepreneur pensions), specific kilometer deduction rates, and the on-the-road reality of delivery workers.

---

## 🎨 2. UX/UI Philosophy ("The Courier-First Design")
Because users interact with the app while operating vehicles, the UI adheres to strict design principles:
- **Glanceability**: Metrics are massive, typography is high-contrast (neon green on dark backgrounds), and data is instantly readable at a stoplight.
- **Hands-Free First**: Deep integration of Voice Commands allows drivers to track shifts and log expenses without typing.
- **Night Mode Optimized**: A deep, dark UI to ensure the app isn't blinding during evening shifts.
- **Fluid & Premium**: Uses `framer-motion` for buttery smooth transitions, micro-animations, and instant feedback.

---

## ⚙️ 3. Core Modules & Features

### A. Tax Intelligence (The Brain)
- Estimates real-time tax liabilities based on strict **Finnish 2026 Tax Rules**.
- Deducts the standard tax-free mileage allowance dynamically.
- Tracks **YEL (Yrittäjän eläkelaki)** income limits, warning users if their real profit triggers mandatory pension contributions.
- Distinguishes carefully between Gross Pay, Net Pay, and tips.

### B. Shift Tracker (The Engine)
- Real-time GPS tracking to automatically measure exact distances driven during trips.
- Couriers can select their App (Wolt, Uber Eats) and Trip Purpose.
- Supports **Shift OCR**: Users can upload a screenshot of their weekly earnings from the Wolt/Uber app, and the system extracts Start/End dates, Gross Pay, distance, and tips.

### C. Receipt Vault (Expense Management)
- Couriers can track business-related expenses like Fuel, Work Gear, Vehicle Maintenance, and Phone Bills.
- **Receipt OCR**: Users snap a photo of a receipt (e.g., Gas station), and AI instantly extracts the Merchant, Total Amount, VAT, and Date.

### D. Voice Command Center
- AI-powered voice parser. A user can simply tap the microphone and say: *"Start a Wolt shift"* or *"I just bought 45 euros of fuel at Next"*.
- The system translates spoken words into structured JSON logs for the database.

### E. Vehicle Center
- Tracks vehicle health (e.g., "Next Oil Change", "Tire Swap").
- Auto-decrements the distance remaining until the next required vehicle maintenance based on GPS shifts driven.

### F. Analytics Hub & Vero Export
- Visualizes efficiency metrics (Earnings per KM, Earnings per Hour).
- **One-Click Export**: Compiles data into accountant-ready PDF/CSV reports exactly formatted for the Finnish Tax Administration (Vero).

---

## 🧠 4. Artificial Intelligence Integrations
The app leans heavily on the **Google Gemini 2.5 Flash API**:
1. **Vision/OCR**: Parses both complex digital screenshots (delivery apps) and physical crumpled receipts (gas stations), dynamically handling image format variations.
2. **NLP/Voice**: Parses raw, unstructured transcripts into highly structured actions (Starting shifts, logging expenses).

---

## 🏗 5. Tech Stack & Architecture
- **Frontend**: Next.js (App Router), React, Tailwind CSS (Vanilla utilities, no generic overriding themes).
- **Icons & Animations**: `lucide-react` for iconography, `canvas-confetti` for gamification, and `framer-motion` for layout animations.
- **Backend/State**: Firebase Firestore (NoSQL realtime database), Firebase Authentication (Google Auth / Anonymous).
- **State Management**: Built on a centralized React Context (`VeroProvider`) to prevent data loss across tabs and maintain continuous GPS tracking.
- **Offline Reliability**: Implements localized saving to `localStorage`/`IndexedDB` so if a courier drops out of cellular range in an elevator or rural area, tracking and receipts are caught locally and synced when connection restores.
- **Security & Privacy**: Zero PII logged in plaintext. All data heavily scoped by Firebase Auth `uid` logic to guarantee privacy.

---

## 💡 6. Marketing & Messaging Angles (For LLMs generating content)
When writing about VeroFlow AI, use these psychological triggers:
- **Peace of Mind**: "Never fear a Vero tax audit again."
- **Financial Maximization**: "Stop leaving mileage deductions on the table. Every KM tracked is cash in your pocket."
- **Safety**: "Keep your eyes on the road. Let your voice do the bookkeeping."
- **Niche Exclusivity**: "Built exclusively for the Finnish delivery ecosystem."
