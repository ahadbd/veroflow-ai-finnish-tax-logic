# VeroFlow AI - OCR Test Assets

To verify the recently pushed fixes for the **Receipt Vault** and **Shift Tracker**, you can use these two highly-realistic Finnish assets. These are specifically generated with high contrast and sharp typography to be ideal for testing AI vision.

---

## ⛽ 1. Receipt Vault Test (Gas Receipt)
This image tests the OCR's ability to:
- Identify **Neste** as a "Fuel" category automatically.
- Extract **75.40 €** as the total amount.
- Correct parse the Finnish **ALV** (VAT) labels.
- Handle the **07.04.2026** date format.

![Neste Gas Receipt](file:///d:/Vibe%20coding/veroflow%20ai/artifacts/test_receipt.png)

---

## 🚲 2. Shift Tracker Test (Wolt Screenshot)
This image tests the **Digital OCR** specifically for delivery app Summaries:
- Extracting the **Viikko-yhteenveto** (Weekly summary) dates.
- Detecting **450.50 €** as the gross earnings.
- Correctly identifying the separate **Tips (Tippejä)** field.
- Pulling the precise **Kilometers (120.4 km)** to calculate mileage deductions.

![Wolt Mobile Screenshot](file:///d:/Vibe%20coding/veroflow%20ai/artifacts/test_shift.png)

---

### How to use these for testing:
1.  **Download** these images directly here.
2.  **Upload** to the app's scanner.
3.  **Verify** if the fields populate exactly as listed above.
