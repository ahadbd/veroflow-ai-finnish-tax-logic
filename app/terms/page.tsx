import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale, Mail, MapPin } from 'lucide-react';

export default function TermsOfService() {
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
            <Scale size={14} /> LEGAL COMPLIANCE
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter italic leading-none">
            Terms of Service
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">
            Last updated: May 16, 2026
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-y border-white/5 py-16">
            <div className="space-y-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                    <Mail className="text-white/30" />
                </div>
                <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase tracking-widest">Enquiries</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">legal@veroflow.fi</p>
                </div>
            </div>
            <div className="space-y-4">
                <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                    <Scale size={18} className="text-white/30" />
                </div>
                <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase tracking-widest">Jurisdiction</h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">Helsinki, Finland High Court</p>
                </div>
            </div>
        </div>

        <article className="prose prose-invert prose-headings:font-display prose-headings:uppercase prose-headings:italic prose-headings:tracking-tighter prose-p:text-gray-400 prose-p:italic prose-p:font-medium prose-p:leading-relaxed max-w-none pb-24">
          <section className="space-y-8">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase border-l-4 border-brand pl-6">1. Agreement to Terms</h2>
            <p>
              By accessing or using VeroFlow AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the service. 
              VeroFlow provides automated accounting assistance and financial tracking tools specifically for self-employed individuals (toiminimi) and light entrepreneurs in Finland.
            </p>

            <h2 className="text-3xl font-black italic tracking-tighter uppercase border-l-4 border-brand pl-6">2. Subscription Model</h2>
            <p>
              VeroFlow operates on a tiered subscription model (Starter, Pro, Elite). 
              Payments are processed through Stripe. Subscriptions renew automatically until canceled by the user via the billing portal. 
              Cancellations take effect at the end of the current billing cycle.
            </p>

            <h2 className="text-3xl font-black italic tracking-tighter uppercase border-l-4 border-brand pl-6">3. Professional Disclaimer</h2>
            <p>
              <strong>VeroFlow AI is not a licensed tax advisor or certified public accountant.</strong> 
              While our tax calculations (VAT, earnings tracking, mileage deductions) are built using real-world Finnish tax engine logic, users are responsible for verifying their own tax filings with Vero (Finnish Tax Administration). 
              We are not liable for any discrepancies result of user-provided data or external tax rule changes.
            </p>

            <h2 className="text-3xl font-black italic tracking-tighter uppercase border-l-4 border-brand pl-6">4. Prohibited Usage</h2>
            <p>
              Users may not use VeroFlow for any illegal activities under Finnish law. 
              This includes, but is not limited to, fraudulent mileage claims, falsifying shift screenshots, or attempting to evade tax obligations. 
              We reserve the right to terminate accounts that violate these principles.
            </p>

            <h2 className="text-3xl font-black italic tracking-tighter uppercase border-l-4 border-brand pl-6">5. System Availability</h2>
            <p>
              While we aim for 99.9% uptime, we do not guarantee uninterrupted service. 
              VeroFlow provides tools to assist with tracking; it is the user&apos;s ultimate responsibility to maintain backup records of their professional activities.
            </p>

            <h2 className="text-3xl font-black italic tracking-tighter uppercase border-l-4 border-brand pl-6">6. Data Privacy & Consent Withdrawal</h2>
            <p>
              Your privacy is governed by our Privacy Policy. Where we process your personal data based on consent (e.g., analytics cookies, OCR processing), 
              <strong>you have the right to withdraw your consent at any time</strong> without detriment. Withdrawing consent does not affect the lawfulness of processing based on consent before its withdrawal.
              You may manage your consent preferences via the in-app Settings or the Cookie Management banner.
            </p>
          </section>
        </article>

        <footer className="pt-24 border-t border-white/5 text-center">
            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em]">© 2026 VeroFlow AI | HELSINKI, FINLAND</p>
        </footer>
      </div>
    </div>
  );
}
