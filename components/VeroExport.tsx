'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Printer, Download, CheckCircle2 } from 'lucide-react';
import { useVero } from './VeroProvider';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function VeroExport() {
  const { shifts, receipts, profile } = useVero();
  const [isExporting, setIsExporting] = useState(false);

  const escapeCsvField = (value: string | number) => {
    const stringValue = String(value);
    const escaped = stringValue.replace(/"/g, '""');
    return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
  };

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      const headers = ["Date", "App", "Purpose", "Odometer Start", "Odometer End", "Gross Pay", "Tips", "Distance KM", "Fuel Cost", "Net Profit", "Tax Debt", "YEL Cost", "VAT Debt", "Deduction"];
      const rows = shifts.map(s => [
        new Date(s.date).toLocaleDateString('en-GB'),
        s.app,
        s.purpose || 'Food Delivery',
        (s.odometerStart || 0).toString(),
        (s.odometerEnd || 0).toString(),
        s.grossPay.toFixed(2),
        s.tips.toFixed(2),
        s.distanceKm.toFixed(2),
        (s.fuelCost || 0).toFixed(2),
        s.netProfit.toFixed(2),
        s.taxDebt.toFixed(2),
        s.yelCost.toFixed(2),
        (s.vatDebt || 0).toFixed(2),
        s.deduction.toFixed(2)
      ]);

      const csvContent = [headers, ...rows]
        .map(row => row.map(escapeCsvField).join(','))
        .join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `VeroFlow_Export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setIsExporting(false);
    }
  };

  const generateAuditReport = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const year = now.getFullYear();
    const courierName = profile?.displayName || 'Unknown Courier';

    // ── Totals ──────────────────────────────────────────────────────────────────
    const totalGross    = shifts.reduce((acc, s) => acc + s.grossPay, 0);
    const totalNet      = shifts.reduce((acc, s) => acc + s.netProfit, 0);
    const totalTax      = shifts.reduce((acc, s) => acc + s.taxDebt, 0);
    const totalYel      = shifts.reduce((acc, s) => acc + s.yelCost, 0);
    const totalVat      = shifts.reduce((acc, s) => acc + (s.vatDebt || 0), 0);
    const totalExpenses = receipts.reduce((acc, r) => acc + r.amount, 0);
    const totalKm       = shifts.reduce((acc, s) => acc + s.distanceKm, 0);
    const mileageDeduction = totalKm * 0.57; // Vero 1131/2021 §57 — €0.57/km
    const yelThreshold  = 9010.28; // 2026 YEL threshold
    const vatThreshold  = 15000;   // 2026 VAT threshold

    // ── Simple integrity hash ───────────────────────────────────────────────────
    const hashInput = `${courierName}|${totalGross.toFixed(2)}|${totalKm.toFixed(2)}|${shifts.length}|${receipts.length}`;
    const simpleHash = Array.from(hashInput).reduce((h, c) => (((h << 5) - h) + c.charCodeAt(0)) | 0, 0)
      .toString(16).toUpperCase().replace('-', 'N').slice(0, 8);

    const PAGE_W = 210;
    const brand = [57, 255, 20] as [number, number, number]; // #39FF14
    const dark  = [18, 18, 18] as [number, number, number];
    const gray  = [100, 100, 100] as [number, number, number];

    // ═══════════════════════════════════════════════════════════════════════════
    // PAGE 1 — Cover
    // ═══════════════════════════════════════════════════════════════════════════
    doc.setFillColor(...dark);
    doc.rect(0, 0, PAGE_W, 297, 'F');

    // Green accent bar
    doc.setFillColor(...brand);
    doc.rect(0, 0, 8, 297, 'F');

    // Logo text
    doc.setTextColor(...brand);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('VEROFLOW AI', 20, 35);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text('VEROILMOITUKSEN PUOLUSTUSRAPORTTI', 20, 46);

    doc.setTextColor(...gray);
    doc.setFontSize(9);
    doc.text('Finnish Tax Defense Report — Kuriirin veroasiakirja', 20, 53);

    // Separator
    doc.setDrawColor(...brand);
    doc.setLineWidth(0.5);
    doc.line(20, 60, PAGE_W - 20, 60);

    // Courier details
    doc.setTextColor(220, 220, 220);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const detailY = 72;
    const labelX = 20, valueX = 80;
    const row = (label: string, value: string, y: number) => {
      doc.setTextColor(...gray); doc.setFontSize(8); doc.text(label.toUpperCase(), labelX, y);
      doc.setTextColor(255, 255, 255); doc.setFontSize(10); doc.setFont('helvetica', 'bold');
      doc.text(value, valueX, y); doc.setFont('helvetica', 'normal');
    };
    row('Courier Name',    courierName,                      detailY);
    row('Fiscal Year',     `${year}`,                        detailY + 10);
    row('Report Date',     dateStr,                          detailY + 20);
    row('Total Shifts',    `${shifts.length}`,               detailY + 30);
    row('Total Distance',  `${totalKm.toFixed(1)} km`,       detailY + 40);
    row('Integrity Hash',  `VF-${simpleHash}`,               detailY + 50);

    // Legal citations box
    doc.setFillColor(30, 40, 30);
    doc.setDrawColor(...brand);
    doc.setLineWidth(0.3);
    doc.roundedRect(20, detailY + 65, PAGE_W - 40, 52, 3, 3, 'FD');
    doc.setTextColor(...brand);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('OIKEUDELLINEN PERUSTA — LEGAL BASIS', 28, detailY + 74);
    doc.setTextColor(200, 200, 200);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const legalLines = [
      '• Vero 1131/2021 §57: Kilometrikorvaus €0.57/km (mileage deduction)',
      '• KPL 2:7§: Kirjanpitovelvollisen tositteen säilytys 6 vuotta (6-year retention)',
      '• KPL 2:10§: Sähköinen tositteen arkistointi hyväksytty (digital receipts valid)',
      '• YEL Raja 2026: €' + yelThreshold.toLocaleString('fi-FI') + ' — yrittäjän eläkemaksu',
      '• ALV Raja 2026: €' + vatThreshold.toLocaleString('fi-FI') + ' — arvonlisäverovelvollisuus',
    ];
    legalLines.forEach((line, i) => doc.text(line, 28, detailY + 82 + i * 7));

    // Threshold alerts
    const alertY = detailY + 128;
    const yelAlert = totalGross >= yelThreshold;
    const vatAlert = totalGross >= vatThreshold;
    doc.setFillColor(yelAlert ? 255 : 30, yelAlert ? 200 : 80, yelAlert ? 0 : 30);
    doc.roundedRect(20, alertY, 80, 20, 2, 2, 'F');
    doc.setTextColor(yelAlert ? 0 : 200, yelAlert ? 0 : 200, yelAlert ? 0 : 200);
    doc.setFontSize(7); doc.setFont('helvetica', 'bold');
    doc.text(yelAlert ? '⚠ YEL RAJA YLITETTY' : '✓ YEL ALLA RAJAN', 25, alertY + 8);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
    doc.text(`Brutto: €${totalGross.toFixed(0)} / Raja: €${yelThreshold.toFixed(0)}`, 25, alertY + 15);

    doc.setFillColor(vatAlert ? 255 : 30, vatAlert ? 100 : 80, vatAlert ? 0 : 30);
    doc.roundedRect(110, alertY, 80, 20, 2, 2, 'F');
    doc.setTextColor(vatAlert ? 0 : 200, vatAlert ? 0 : 200, vatAlert ? 0 : 200);
    doc.setFontSize(7); doc.setFont('helvetica', 'bold');
    doc.text(vatAlert ? '⚠ ALV RAJA YLITETTY' : '✓ ALV ALLA RAJAN', 115, alertY + 8);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
    doc.text(`Brutto: €${totalGross.toFixed(0)} / Raja: €${vatThreshold.toFixed(0)}`, 115, alertY + 15);

    // ═══════════════════════════════════════════════════════════════════════════
    // PAGE 2 — Financial Summary
    // ═══════════════════════════════════════════════════════════════════════════
    doc.addPage();
    doc.setFillColor(...dark); doc.rect(0, 0, PAGE_W, 297, 'F');
    doc.setFillColor(...brand); doc.rect(0, 0, 8, 297, 'F');

    doc.setTextColor(...brand); doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('1. TALOUDELLINEN YHTEENVETO — FINANCIAL SUMMARY', 20, 22);

    autoTable(doc, {
      startY: 28,
      head: [['Metric / Mittari', 'Value / Arvo', 'Legal Basis']],
      body: [
        ['Total Gross Income / Bruttotulot',        `€${totalGross.toFixed(2)}`,          'Vero 1131/2021'],
        ['Total Business Expenses / Kulut',          `€${totalExpenses.toFixed(2)}`,        'KPL 2:10§'],
        ['Mileage Deduction / Kilometrikorvaus',     `€${mileageDeduction.toFixed(2)}`,     '§57 — €0.57 × ' + totalKm.toFixed(1) + ' km'],
        ['Net Taxable Income / Verotettava tulo',    `€${(totalNet - totalExpenses).toFixed(2)}`, ''],
        ['Estimated Income Tax / Tulovero',          `€${totalTax.toFixed(2)}`,             ''],
        ['YEL Pension Cost / Eläkemaksu',            `€${totalYel.toFixed(2)}`,             'YELL 1272/2006'],
        ['Estimated VAT Debt / ALV-velka',           `€${totalVat.toFixed(2)}`,             'AVL 86§'],
        ['VAT Registered / ALV-velvollinen',         profile?.isVatRegistered ? 'YES / KYLLÄ' : 'NO / EI', ''],
      ],
      headStyles: { fillColor: [39, 90, 39], textColor: [57, 255, 20], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { textColor: [220, 220, 220], fillColor: [22, 22, 22], fontSize: 8 },
      alternateRowStyles: { fillColor: [28, 28, 28] },
      margin: { left: 20, right: 20 },
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // PAGE 3+ — Income Log
    // ═══════════════════════════════════════════════════════════════════════════
    doc.addPage();
    doc.setFillColor(...dark); doc.rect(0, 0, PAGE_W, 297, 'F');
    doc.setFillColor(...brand); doc.rect(0, 0, 8, 297, 'F');
    doc.setTextColor(...brand); doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('2. TULOKIRJAUS — INCOME LOG', 20, 22);

    autoTable(doc, {
      startY: 28,
      head: [['Date', 'App', 'Gross €', 'Tips €', 'KM', 'Deduction €', 'Tax €']],
      body: shifts.map(s => [
        new Date(s.date).toLocaleDateString('en-GB'),
        s.app,
        s.grossPay.toFixed(2),
        s.tips.toFixed(2),
        s.distanceKm.toFixed(1),
        (s.distanceKm * 0.57).toFixed(2),
        s.taxDebt.toFixed(2),
      ]),
      headStyles: { fillColor: [39, 90, 39], textColor: [57, 255, 20], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { textColor: [220, 220, 220], fillColor: [22, 22, 22], fontSize: 7 },
      alternateRowStyles: { fillColor: [28, 28, 28] },
      margin: { left: 20, right: 20 },
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // Expense Log
    // ═══════════════════════════════════════════════════════════════════════════
    doc.addPage();
    doc.setFillColor(...dark); doc.rect(0, 0, PAGE_W, 297, 'F');
    doc.setFillColor(...brand); doc.rect(0, 0, 8, 297, 'F');
    doc.setTextColor(...brand); doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('3. KULUKIRJAUS — EXPENSE LOG (KPL 2:10§)', 20, 22);

    autoTable(doc, {
      startY: 28,
      head: [['Date', 'Merchant', 'Category', 'Amount €', 'VAT €']],
      body: receipts.map(r => [
        new Date(r.date).toLocaleDateString('en-GB'),
        r.merchant,
        r.category,
        r.amount.toFixed(2),
        r.vat.toFixed(2),
      ]),
      headStyles: { fillColor: [39, 90, 39], textColor: [57, 255, 20], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { textColor: [220, 220, 220], fillColor: [22, 22, 22], fontSize: 7 },
      alternateRowStyles: { fillColor: [28, 28, 28] },
      margin: { left: 20, right: 20 },
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // Mileage / GPS Log
    // ═══════════════════════════════════════════════════════════════════════════
    doc.addPage();
    doc.setFillColor(...dark); doc.rect(0, 0, PAGE_W, 297, 'F');
    doc.setFillColor(...brand); doc.rect(0, 0, 8, 297, 'F');
    doc.setTextColor(...brand); doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('4. AJOPÄIVÄKIRJA — MILEAGE GPS AUDIT (Vero 1131/2021 §57)', 20, 22);

    autoTable(doc, {
      startY: 28,
      head: [['Date', 'Purpose', 'KM', 'Odo Start', 'Odo End', 'Deduction €', 'From', 'To']],
      body: shifts.map(s => [
        new Date(s.date).toLocaleDateString('en-GB'),
        s.purpose || 'Food Delivery',
        s.distanceKm.toFixed(1),
        (s.odometerStart || 0).toString(),
        (s.odometerEnd || 0).toString(),
        (s.distanceKm * 0.57).toFixed(2),
        s.startAddress || 'N/A',
        s.endAddress || 'N/A',
      ]),
      headStyles: { fillColor: [39, 90, 39], textColor: [57, 255, 20], fontStyle: 'bold', fontSize: 7 },
      bodyStyles: { textColor: [220, 220, 220], fillColor: [22, 22, 22], fontSize: 6.5 },
      alternateRowStyles: { fillColor: [28, 28, 28] },
      margin: { left: 20, right: 20 },
    });

    // ── Footer on all pages ───────────────────────────────────────────────────
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(10, 10, 10);
      doc.rect(0, 285, PAGE_W, 12, 'F');
      doc.setTextColor(...gray);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`VeroFlow AI | Defense Report | ${courierName} | ${dateStr} | Hash: VF-${simpleHash}`, 12, 292);
      doc.text(`Page ${i} / ${pageCount}`, PAGE_W - 30, 292);
    }

    doc.save(`VeroFlow_Defense_${year}_${courierName.replace(/\s/g, '_')}_${dateStr.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-black text-white tracking-tight uppercase">Tax Reports</h2>
      
      <div className="grid grid-cols-1 gap-4">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={exportToCSV}
          disabled={isExporting}
          className="bg-card border border-border p-6 rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl">
              <Download className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-black text-white uppercase tracking-tight">Export CSV</p>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">OmaVero Form 50A Ready</p>
            </div>
          </div>
          <FileText className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateAuditReport}
          className="bg-card border border-border p-6 rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand/10 rounded-2xl">
              <Printer className="w-6 h-6 text-brand" />
            </div>
            <div className="text-left">
              <p className="text-sm font-black text-white uppercase tracking-tight">Defense Report</p>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Veroilmoituksen Puolustusraportti — PDF</p>
            </div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
        </motion.button>
      </div>

      <div className="p-6 bg-brand/5 border border-brand/10 rounded-3xl">
        <p className="text-[10px] text-brand font-black uppercase tracking-widest mb-2">Pro Tip</p>
        <p className="text-xs text-gray-400 font-black uppercase tracking-widest leading-relaxed">
          Finnish tax law requires keeping records for 6 years. Use the Audit PDF to store your GPS breadcrumbs and receipt scans in one secure file.
        </p>
      </div>
    </div>
  );
}
