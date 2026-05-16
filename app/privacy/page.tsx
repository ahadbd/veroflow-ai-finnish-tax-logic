import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Mail, MapPin, Scale, Database, Download, Trash2, AlertCircle } from 'lucide-react';

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
            <ShieldCheck size={14} /> PRIVACY & GDPR COMPLIANCE
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter italic leading-none">
            Privacy Policy
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">
            Last updated: May 16, 2026 · Applies to: veroflow-ai.vercel.app
          </p>
        </div>

        {/* Controller + Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-y border-white/5 py-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
              <Scale className="text-white/30" size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-widest">Data Controller</h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase">VeroFlow AI</p>
              <p className="text-[10px] text-gray-500 font-medium">Helsinki, Finland</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
              <Mail className="text-white/30" size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-widest">Privacy Contact</h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase">privacy@veroflow.fi</p>
              <p className="text-[10px] text-gray-500 font-medium">Response within 30 days</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
              <ShieldCheck className="text-white/30" size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-widest">Supervisory Authority</h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Tietosuojavaltuutettu</p>
              <a href="https://tietosuoja.fi" target="_blank" rel="noopener noreferrer" className="text-[10px] text-brand font-medium hover:underline">tietosuoja.fi</a>
            </div>
          </div>
        </div>

        {/* Your Rights Summary */}
        <div className="bg-brand/5 border border-brand/20 rounded-3xl p-8 space-y-4">
          <h2 className="text-lg font-black uppercase tracking-widest text-brand">Your GDPR Rights at a Glance</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { right: 'Access (Art. 15)', desc: 'Request a copy of your data' },
              { right: 'Rectification (Art. 16)', desc: 'Correct inaccurate data' },
              { right: 'Erasure (Art. 17)', desc: 'Delete your account and all data' },
              { right: 'Portability (Art. 20)', desc: 'Download your data as JSON' },
              { right: 'Object (Art. 21)', desc: 'Opt out of analytics processing' },
              { right: 'Withdraw Consent (Art. 7)', desc: 'Change cookie settings anytime' },
            ].map(({ right, desc }) => (
              <div key={right} className="bg-white/5 rounded-2xl p-3 border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-brand mb-1">{right}</p>
                <p className="text-[10px] text-white/50 font-medium">{desc}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-white/40 font-medium">
            Exercise these rights via Settings → Data Rights, or email privacy@veroflow.fi. You also have the right to lodge a complaint with the Finnish Data Protection Ombudsman at{' '}
            <a href="https://tietosuoja.fi" target="_blank" rel="noopener noreferrer" className="text-brand underline">tietosuoja.fi</a>.
          </p>
        </div>

        <article className="prose prose-invert prose-headings:font-display prose-headings:uppercase prose-headings:italic prose-headings:tracking-tighter prose-p:text-gray-400 prose-p:font-medium prose-p:leading-relaxed max-w-none space-y-12">

          <section className="space-y-6">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase border-l-4 border-brand pl-6">1. Data We Collect & Legal Basis</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 pr-4 font-black uppercase tracking-widest text-white/60">Data Category</th>
                    <th className="text-left py-3 pr-4 font-black uppercase tracking-widest text-white/60">What We Store</th>
                    <th className="text-left py-3 pr-4 font-black uppercase tracking-widest text-white/60">Legal Basis (Art. 6)</th>
                    <th className="text-left py-3 font-black uppercase tracking-widest text-white/60">Retention</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="py-3 pr-4 text-brand font-bold">Account</td>
                    <td className="py-3 pr-4 text-white/60">Name, email (Google Auth UID scoped)</td>
                    <td className="py-3 pr-4 text-white/60">Contract (6(1)(b))</td>
                    <td className="py-3 text-white/60">Until account deletion</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-brand font-bold">Shift Data</td>
                    <td className="py-3 pr-4 text-white/60">Gross pay, distance, app, timestamp</td>
                    <td className="py-3 pr-4 text-white/60">Contract (6(1)(b))</td>
                    <td className="py-3 text-white/60">Until deletion request</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-brand font-bold">Location (GPS)</td>
                    <td className="py-3 pr-4 text-white/60">Lat/lng during active shifts only</td>
                    <td className="py-3 pr-4 text-white/60">Legitimate interest (6(1)(f))</td>
                    <td className="py-3 text-white/60">Session only, then shift record</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-brand font-bold">OCR Images</td>
                    <td className="py-3 pr-4 text-white/60">Receipt photos sent to Gemini AI</td>
                    <td className="py-3 pr-4 text-white/60">Consent (6(1)(a))</td>
                    <td className="py-3 text-white/60">Discarded immediately after extraction</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-brand font-bold">Receipts</td>
                    <td className="py-3 pr-4 text-white/60">Merchant, amount, VAT, category</td>
                    <td className="py-3 pr-4 text-white/60">Contract (6(1)(b))</td>
                    <td className="py-3 text-white/60">Until deletion request</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-brand font-bold">Analytics</td>
                    <td className="py-3 pr-4 text-white/60">Anonymous page views (Vercel)</td>
                    <td className="py-3 pr-4 text-white/60">Consent (6(1)(a))</td>
                    <td className="py-3 text-white/60">90 days (Vercel policy)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-brand font-bold">Local Cache</td>
                    <td className="py-3 pr-4 text-white/60">Shifts/receipts in browser localStorage (UID-keyed)</td>
                    <td className="py-3 pr-4 text-white/60">Legitimate interest (6(1)(f))</td>
                    <td className="py-3 text-white/60">Cleared on data wipe or logout</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase border-l-4 border-brand pl-6">2. Data Processors (Third Parties)</h2>
            <p className="text-gray-400">We use the following sub-processors. All are EU-compliant or have Standard Contractual Clauses in place:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Google Firebase (Auth + Firestore)', purpose: 'Authentication, real-time database', region: 'EU-North1 (Finland)', link: 'https://firebase.google.com/support/privacy' },
                { name: 'Google Gemini AI', purpose: 'OCR processing of receipts & shift screenshots', region: 'Images not retained', link: 'https://ai.google.dev/terms' },
                { name: 'Vercel', purpose: 'Web hosting, anonymous analytics (if consented)', region: 'EU edge network', link: 'https://vercel.com/legal/privacy-policy' },
                { name: 'Stripe', purpose: 'Payment processing (subscription billing)', region: 'EU', link: 'https://stripe.com/en-fi/privacy' },
              ].map(({ name, purpose, region, link }) => (
                <div key={name} className="bg-white/3 border border-white/5 rounded-2xl p-4">
                  <p className="text-[11px] font-black text-white mb-1">{name}</p>
                  <p className="text-[10px] text-white/40 font-medium">{purpose}</p>
                  <p className="text-[10px] text-white/30 font-medium mt-1">Region: {region}</p>
                  <a href={link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-brand hover:underline mt-1 block">Privacy policy →</a>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase border-l-4 border-brand pl-6">3. Cookies & Local Storage</h2>
            <p className="text-gray-400">We use browser storage in two ways:</p>
            <div className="space-y-3">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-[11px] font-black text-white mb-1">Strictly Necessary (no consent required)</p>
                <p className="text-[10px] text-white/50 font-medium"><code className="text-brand">veroflow-gdpr-consent-v1</code> — your cookie preference. <code className="text-brand">shifts_UID_*</code>, <code className="text-brand">receipts_UID_*</code> — offline cache for performance. <code className="text-brand">pwa-banner-dismissed</code> — remembers install banner state.</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-[11px] font-black text-white mb-1">Analytics (consent required)</p>
                <p className="text-[10px] text-white/50 font-medium">Vercel Analytics sets anonymous cookies to measure page performance. Only activated after you accept analytics cookies.</p>
              </div>
            </div>
            <p className="text-[11px] text-white/40 font-medium">You can withdraw analytics consent at any time by clicking &quot;Manage Cookies&quot; in the footer or Settings.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase border-l-4 border-brand pl-6">4. Data Storage & Security</h2>
            <p className="text-gray-400">
              All Firestore data is stored in the <strong className="text-white">EU-North1 (Finland)</strong> Google Cloud region and never transferred outside the EEA without appropriate safeguards. We use industry-standard TLS encryption in transit and AES-256 at rest. Authentication is handled exclusively by Firebase Auth (Google Sign-In) — we never store passwords.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase border-l-4 border-brand pl-6">5. Exercising Your Rights</h2>
            <p className="text-gray-400">You can exercise all GDPR rights directly in the app:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 bg-white/5 rounded-2xl p-4 border border-white/5">
                <Download size={16} className="text-brand flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-black text-white">Export Data (Art. 20)</p>
                  <p className="text-[10px] text-white/40 mt-1">Settings → Export My Data → Downloads all shifts and receipts as JSON.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/5 rounded-2xl p-4 border border-white/5">
                <Trash2 size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-black text-white">Delete Account (Art. 17)</p>
                  <p className="text-[10px] text-white/40 mt-1">Settings → Delete Account → Wipes all Firestore data and removes your Firebase Auth account.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/5 rounded-2xl p-4 border border-white/5">
                <AlertCircle size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-black text-white">Manage Cookies (Art. 7)</p>
                  <p className="text-[10px] text-white/40 mt-1">Cookie banner (bottom of page) → Manage → toggle analytics on/off at any time.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/5 rounded-2xl p-4 border border-white/5">
                <Mail size={16} className="text-white/30 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-black text-white">Email Request (Any Right)</p>
                  <p className="text-[10px] text-white/40 mt-1">Email privacy@veroflow.fi. We respond within 30 days as required by GDPR.</p>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4">
              <MapPin size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-white/50 font-medium">
                <strong className="text-white">Finnish DPA:</strong> If you believe your data rights have been violated, you may lodge a complaint with the Finnish Data Protection Ombudsman (Tietosuojavaltuutettu) at{' '}
                <a href="https://tietosuoja.fi" target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">tietosuoja.fi</a> or call +358 29 566 6700.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase border-l-4 border-brand pl-6">6. Children&apos;s Data</h2>
            <p className="text-gray-400">VeroFlow AI is a professional tool for self-employed individuals. We do not knowingly collect data from persons under 18. If you believe a minor has registered, contact privacy@veroflow.fi immediately.</p>
          </section>

          <section className="space-y-4">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase border-l-4 border-brand pl-6">7. Policy Updates</h2>
            <p className="text-gray-400">We may update this policy. Material changes will be notified via in-app notification at least 14 days before they take effect. Continued use after the effective date constitutes acceptance.</p>
          </section>
        </article>

        <footer className="pt-24 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em]">© 2026 VeroFlow AI | Helsinki, Finland</p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-[10px] text-gray-600 hover:text-white font-bold uppercase tracking-widest transition-colors">Terms</Link>
            <Link href="/cookies" className="text-[10px] text-gray-600 hover:text-white font-bold uppercase tracking-widest transition-colors">Cookies</Link>
            <Link href="/contact" className="text-[10px] text-gray-600 hover:text-white font-bold uppercase tracking-widest transition-colors">Contact</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
