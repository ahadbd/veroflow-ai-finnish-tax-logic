# VeroFlow AI - Gemini API Guidelines

This project uses the Gemini API for OCR (Shift/Receipt scanning) and Voice Command parsing.

## OCR Prompts
- **Shift OCR**: Extract App Name, Date Range, Gross Pay, Tips, and Distance from Wolt/Uber Eats screenshots.
- **Receipt OCR**: Extract Merchant, Date, Amount, VAT, and Category from expense receipts.

## Voice Command Prompts
- **Parsing**: Convert voice transcripts into structured JSON for `shift_start`, `shift_stop`, `expense`, or `tip`.
- **Context**: Finnish delivery courier context (Wolt, Uber Eats, Fuel, Phone Bill).

## Implementation Rules
- **Client-Side**: All Gemini calls must be made from the client using `@google/genai`.
- **Schema**: Always use `responseSchema` to ensure structured JSON output.
- **Error Handling**: Gracefully handle empty or malformed responses.
- **API Key**: Use `process.env.NEXT_PUBLIC_GEMINI_API_KEY`.
