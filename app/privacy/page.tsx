import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Mail, MapPin } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="bg-[#050505] min-h-screen text-white font-sans py-24 px-6 md:px-12 selection:bg-brand/30 selection:text-brand">
      <div className="max-w-4xl mx-auto space-y-16">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-all mb-8"
        >
          <ArrowLeft size={14} /> BACK TO HOME
        </Link>

        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-[10px] font-black uppercase tracking-widest text-brand">
            <ShieldCheck size={14} /> PRIVACY COMPLIANCE
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter italic leading-none">
            Privacy Policy
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">
            Last updated: April 5, 2026
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-y border-white/5 py-16">
            <div className="space-y-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                    <Mail className="text-white/30" />
                </div>
                <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase tracking-widest">Contact Us</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">privacy@veroflow.fi</p>
                </div>
            </div>
            <div className="space-y-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                    <MapPin className="text-white/30" />
                </div>
                <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase tracking-widest">HQ Location</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Helsinki, Finland</p>
                </div>
            </div>
            <div className="space-y-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                    <ShieldCheck className="text-white/30" />
                </div>
                <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase tracking-widest">Data Protection</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">EU GDPR Compliant</p>
                </div>
            </div>
        </div>

        <article className="prose prose-invert prose-headings:font-display prose-headings:uppercase prose-headings:italic prose-headings:tracking-tighter prose-p:text-gray-400 prose-p:italic prose-p:font-medium prose-p:leading-relaxed max-w-none">
          <section className="space-y-8">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase border-l-4 border-brand pl-6">1. Information We Collect</h2>
            <p>
              VeroFlow AI ("we," "our," or "us") collects information to provide better services and a premium user experience for delivery entrepreneurs. 
              We collect:
            </p>
            <ul>
                <li><strong>Account Information:</strong> Name, email, and authentication data provided via Firebase Auth (Google).</li>
                <li><strong>Professional Data:</strong> Tracking of gross earnings, tips, distances, and app-specific meta-data (Wolt, Foodora, Uber Eats).</li>
                <li><strong>OCR Data:</strong> Images of receipts and shift summaries processed via Gemini AI. Images are discarded after successful extraction of textual data.</li>
                <li><strong>Location Data:</strong> GPS tracking data during active "Shifts" only, used for automated mileage deduction calculation.</li>
            </ul>

            <h2 className="text-3xl font-black italic tracking-tighter uppercase border-l-4 border-brand pl-6">2. Data Sovereignty (GDPR)</h2>
            <p>
              As a Finnish-based company, we adhere strictly to the General Data Protection Regulation (GDPR). 
              All financial data is stored securely in the Google Cloud (EU-North1) region. 
              You retain full ownership of your data and can request deletion or export at any time via the user dashboard.
            </p>

            <h2 className="text-3xl font-black italic tracking-tighter uppercase border-l-4 border-brand pl-6">3. Use of Information</h2>
            <p>
              We use the collected data for:
            </p>
            <ul>
              <li>Calculating real-time tax debt (VAT and income tax).</li>
              <li>Monitoring YEL insurance thresholds.</li>
              <li>Providing automated mileage and expense reports.</li>
              <li>Generating high-precision profitability analytics.</li>
            </ul>

            <h2 className="text-3xl font-black italic tracking-tighter uppercase border-l-4 border-brand pl-6">4. Safety and Security</h2>
            <p>
              We use industry-standard encryption for both data at rest and data in transit. 
              Authentication is handled exclusively by Firebase (Google), ensuring enterprise-grade security for your credentials.
            </p>
          </section>
        </article>

        <footer className="pt-24 border-t border-white/5 text-center">
            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em]">© 2026 VeroFlow AI | Helsinki, Finland</p>
        </footer>
      </div>
    </div>
  );
}
