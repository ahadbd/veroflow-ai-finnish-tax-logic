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
      const headers = ["Date", "App", "Gross Pay", "Tips", "Distance KM", "Fuel Cost", "Net Profit", "Tax Debt", "YEL Cost", "VAT Debt", "Deduction"];
      const rows = shifts.map(s => [
        new Date(s.date).toLocaleDateString('en-GB'),
        s.app,
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
    const doc = new jsPDF();
    const now = new Date().toLocaleDateString('en-GB');
    
    doc.setFontSize(20);
    doc.text("VEROFLOW AI - AUDIT REPORT", 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated: ${now} | User: ${profile?.displayName}`, 14, 30);
    
    doc.text("1. TAX & PROFIT SUMMARY", 14, 45);
    const totalGross = shifts.reduce((acc, s) => acc + s.grossPay, 0);
    const totalNet = shifts.reduce((acc, s) => acc + s.netProfit, 0);
    const totalTax = shifts.reduce((acc, s) => acc + s.taxDebt, 0);
    const totalYel = shifts.reduce((acc, s) => acc + s.yelCost, 0);
    const totalVat = shifts.reduce((acc, s) => acc + (s.vatDebt || 0), 0);
    const totalExpenses = receipts.reduce((acc, r) => acc + r.amount, 0);

    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Value']],
      body: [
        ['Total Annual Gross', `€${totalGross.toFixed(2)}`],
        ['Total Expenses', `€${totalExpenses.toFixed(2)}`],
        ['Total Net Profit', `€${(totalNet - totalExpenses).toFixed(2)}`],
        ['Estimated Tax Debt', `€${totalTax.toFixed(2)}`],
        ['Estimated YEL Cost', `€${totalYel.toFixed(2)}`],
        ['Estimated VAT Debt', `€${totalVat.toFixed(2)}`],
        ['VAT Registered', profile?.isVatRegistered ? 'YES' : 'NO'],
      ],
    });

    doc.text("2. INCOME LOG", 14, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Date', 'App', 'Gross', 'Tips', 'Net Profit', 'Tax Debt']],
      body: shifts.map(s => [
        new Date(s.date).toLocaleDateString('en-GB'),
        s.app,
        `€${s.grossPay.toFixed(2)}`,
        `€${s.tips.toFixed(2)}`,
        `€${s.netProfit.toFixed(2)}`,
        `€${s.taxDebt.toFixed(2)}`
      ]),
    });

    doc.text("3. EXPENSE LOG", 14, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Date', 'Merchant', 'Category', 'Amount', 'VAT']],
      body: receipts.map(r => [
        new Date(r.date).toLocaleDateString('en-GB'),
        r.merchant,
        r.category,
        `€${r.amount.toFixed(2)}`,
        `€${r.vat.toFixed(2)}`
      ]),
    });

    doc.text("4. MILEAGE LOG (GPS AUDIT)", 14, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Date', 'Distance', 'Start Address', 'End Address']],
      body: shifts.map(s => [
        new Date(s.date).toLocaleDateString('en-GB'),
        `${s.distanceKm.toFixed(2)} km`,
        s.startAddress || "N/A",
        s.endAddress || "N/A"
      ]),
    });

    doc.save(`VeroFlow_Audit_${now.replace(/\//g, '-')}.pdf`);
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
              <p className="text-sm font-black text-white uppercase tracking-tight">Audit PDF</p>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Full GPS & Receipt Audit Trail</p>
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
