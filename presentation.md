# VeroFlow AI: Oral Presentation Plan

**Target Duration:** 5 Minutes
**Total Slides:** 10

---

## Slide 1: Title Slide
*   **Visual:** VeroFlow AI logo and project subtitle: "Smart Tax & Profitability Automation for Finnish Couriers".
*   **Talking Points (30s):** 
    *   Introduce yourself.
    *   Briefly introduce VeroFlow AI—a tool built specifically for gig economy couriers (Wolt, Foodora, Uber Eats) operating in Finland.

## Slide 2: The Problem
*   **Visual:** Bullet points highlighting financial pain points (YEL, VAT, Mileage) alongside an image of a frustrated courier.
*   **Talking Points (30s):** 
    *   Couriers face a massive administrative burden. 
    *   They are independent contractors who must track YEL (entrepreneur pension), VAT, and complex mileage deductions. 
    *   Manual data entry is prone to error, stressful, and takes time away from actual earning.

## Slide 3: Why I Chose This Topic
*   **Visual:** A chart showing gig economy growth vs. lack of specialized financial tools.
*   **Talking Points (30s):** 
    *   The gig economy is growing rapidly, but generic accounting tools don't fit the fast-paced, micro-transaction nature of food delivery.
    *   I wanted to build something highly practical that directly solves a real-world pain point, ensuring couriers actually keep the money they earn while staying legally compliant in Finland.

## Slide 4: The Solution: VeroFlow AI
*   **Visual:** High-level app mockup showing the "TaxIntelligence" dashboard.
*   **Talking Points (30s):** 
    *   VeroFlow AI is a specialized application offering real-time tax compliance, expense tracking, and profitability analytics.
    *   It's designed with a "hands-free first" approach and a glanceable UI, so couriers can use it safely while on the job.

## Slide 5: Core Techniques & Architecture
*   **Visual:** Diagram showing Next.js frontend, Firebase Auth, and the central `VeroProvider`.
*   **Talking Points (30s):** 
    *   **Frontend:** Built with Next.js and React.
    *   **State Management:** A global `VeroProvider` ensures background GPS tracking survives tab switches.
    *   **Privacy:** We never log PII in plain text; everything is scoped securely using Firebase Auth UIDs.
    *   **Logic:** A dedicated `tax-engine.ts` handles all the complex, localized Finnish tax math.

## Slide 6: AI Tools - Gemini API for OCR
*   **Visual:** Side-by-side comparison of a Wolt earning screenshot and the extracted JSON data.
*   **Talking Points (30s):** 
    *   To eliminate manual entry, we use the **Gemini API** on the client-side (`@google/genai`).
    *   Couriers upload screenshots of their shift earnings or expense receipts.
    *   Gemini uses a strict `responseSchema` to guarantee structured JSON output, instantly extracting App Name, Gross Pay, Tips, VAT, and Merchant info.

## Slide 7: AI Tools - Voice Command Parsing
*   **Visual:** Icon of a microphone converting speech bubbles into structured commands like `shift_start`.
*   **Talking Points (30s):** 
    *   To keep the app "hands-free first," we integrate Gemini for NLP voice parsing.
    *   Couriers can simply speak into the app. Gemini takes the messy voice transcript and maps it to specific Finnish courier contexts (e.g., logging a fuel expense or starting a shift) and returns a clean JSON command to update the app state.

## Slide 8: UI/UX & The "Glanceable" Interface
*   **Visual:** Screenshots of large, high-contrast metrics and smooth modal transitions.
*   **Talking Points (30s):** 
    *   Because couriers use this while driving or biking, the UI uses large typography and high-contrast colors (via TailwindCSS and `lucide-react` icons).
    *   We use `framer-motion` for smooth transitions so the app feels premium, responsive, and easy to read at a quick glance.

## Slide 9: Current Stage of the Project
*   **Visual:** A simple progress bar or checklist showing completed vs. pending tasks.
*   **Talking Points (30s):** 
    *   **Completed:** The core UI shell, `VeroProvider` state management, and Firebase routing are in place. 
    *   **Completed:** The Gemini API integrations for both OCR schema extraction and Voice Command parsing are implemented.
    *   **In Progress:** We are currently refining the `tax-engine.ts` to handle edge cases in Finnish tax deductions and polishing the data visualization in the AnalyticsHub.

## Slide 10: Next Steps & Q&A
*   **Visual:** "Thank You" text with contact info/GitHub link.
*   **Talking Points (30s):** 
    *   **Next Steps:** Conduct end-to-end field testing of the GPS and voice tracking while actually moving to ensure durability.
    *   Thank the audience and open the floor for any questions.
