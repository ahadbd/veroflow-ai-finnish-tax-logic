<div align="center">
  <img src="./public/banner.png" width="1200" alt="VeroFlow AI Banner" />
</div>

# 🇫🇮 VeroFlow AI - Finnish Courier Tax Perfection

**Automated 2026 Profitability & Tax Compliance for Wolt, Uber Eats, and Foodora Couriers.**

VeroFlow AI is a high-performance workspace designed specifically for freelancers (Light Entrepreneurs) operating in Finland. It bridges the gap between chaotic shift reports and professional tax auditing, ensuring every kilometer is deductible and every Euro is accounted for.

---

## 🔥 Key 2026 Features

### ⚖️ Finnish Tax Engine (`lib/tax-engine.ts`)
*   **YEL Threshold Tracking**: Live monitoring of the **€9,423.09 (2026)** YEL pension threshold. Proactive alerts when a breach is imminent.
*   **ALV (VAT) Sync**: Automated calculation of 25.5% standard output VAT and deductible input VAT for fuel/equipment (Threshold: **€20,000** for 2026).
*   **Mileage Deduction**: Precise €0.55/km (2026) tax deduction engine based on real-time GPS tracking.

### 🚗 Hands-Free Driving Mode
*   **Voice Assistant**: Start/Stop shifts and log fuel costs via voice commands while driving.
*   **Glanceable UI**: High-contrast, large-metric dashboard designed for phone mounts and driver visibility.
*   **Background GPS Persistence**: Tracking survives tab switches and phone locks via the `VeroProvider`.

### 🧠 Gemini OCR Intelligence
*   **Shift Scanning**: Extract App name (Wolt/Uber), Gross Pay, Tips, and Distance automatically from delivery app screenshots.
*   **Receipt Vault**: Instant extraction of Merchant, Date, Amount, and Category from Finnish fuel and maintenance receipts.

### 📊 Peak Performance Engine
*   **Efficiency Heatmaps**: Identify your best earning hours (Net Profit/Hour).
*   **Platform Comparison**: Real-time net efficiency comparison between food delivery providers.

---

## 🛠 Technical Stack

*   **Framework**: Next.js 15 (App Router) + React 19
*   **Styling**: Vanilla CSS with Tailwind CSS (Premium Glassmorphism Design System)
*   **State Management**: `VeroProvider` Context Hub
*   **Backend**: Firebase Firestore & Auth (Live Mirroring)
*   **AI**: Google Gemini Pro & Flash (OCR + Command Parsing)
*   **Animations**: Framer Motion (State Transitions)
*   **Icons**: Lucide React

---

## 🚀 Getting Started

### 1. Prerequisites
*   Node.js 18+
*   Firebase Project (Web)
*   Google Gemini API Key

### 2. Environment Setup
Create a `.env.local` file:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
```

### 3. Installation
```powershell
npm install
npm run dev
```

### 4. Seed 2026 Data
Once logged in (Anonymous Auth enabled), use the **DATA DEBUGGER** button on the bottom right of the main dashboard to instantly populate your workspace with compliant 2026 delivery data for testing.

---

## 🏢 Architectural Overview

*   **/components**: Premium React components following the **VeroFlow UI Guidelines**.
*   **/lib**: Core logic engines, including the `tax-engine.ts` and `ocr-service.ts`.
*   **/types**: Unified TypeScript definitions for Shifts, Profiles, and Receipts.
*   **/firebase**: Optimized client-side config with error-handling middleware.

---

## 📎 Compliance Disclaimer
VeroFlow AI calculations are based on general 2024-2026 Finnish Tax Administration (Vero) guidelines for freelancers. Always consult with a professional accountant (Kirjanpitäjä) for final filing.

<div align="center">
  <p>Built for the Finish Courier Community with ❤️ and ☕</p>
</div>
