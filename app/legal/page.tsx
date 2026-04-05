import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale, Building, Mail, MapPin, Globe } from 'lucide-react';

export default function LegalNotice() {
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
            <Building size={14} /> CORPORATE IMPRINT
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black uppercase tracking-tighter italic leading-none">
            Legal Notice
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">
            Information according to § Section 5 of the Finnish TMG (Sähköisen viestinnän palveluista annettu laki)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-y border-white/5 py-16">
            <div className="space-y-6">
                <h3 className="text-brand font-black uppercase tracking-[0.2em] text-xs font-display italic">Operator Details</h3>
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <Building className="text-white/20 shrink-0" size={20} />
                        <div className="space-y-1">
                            <p className="text-sm font-bold uppercase tracking-tight">VeroFlow AI Oy</p>
                            <p className="text-[11px] text-gray-500 font-medium uppercase italic">Reg No: FI334455-6</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <MapPin className="text-white/20 shrink-0" size={20} />
                        <div className="space-y-1">
                            <p className="text-sm font-bold uppercase tracking-tight">Mannerheimintie 12 B</p>
                            <p className="text-[11px] text-gray-500 font-medium uppercase italic">00100 Helsinki, Finland</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="space-y-6">
                <h3 className="text-brand font-black uppercase tracking-[0.2em] text-xs font-display italic">Contact info</h3>
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <Mail className="text-white/20 shrink-0" size={20} />
                        <div className="space-y-1">
                            <p className="text-sm font-bold uppercase tracking-tight">hello@veroflow.fi</p>
                            <p className="text-[11px] text-gray-500 font-medium uppercase italic">General Enquiries</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <Globe className="text-white/20 shrink-0" size={20} />
                        <div className="space-y-1">
                            <p className="text-sm font-bold uppercase tracking-tight">www.veroflow.fi</p>
                            <p className="text-[11px] text-gray-500 font-medium uppercase italic">Official Website</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <article className="prose prose-invert prose-headings:font-display prose-headings:uppercase prose-headings:italic prose-headings:tracking-tighter prose-p:text-gray-400 prose-p:italic prose-p:font-medium prose-p:leading-relaxed max-w-none pb-24">
          <section className="space-y-10">
            <div className="space-y-4">
                <h2 className="text-3xl font-black italic tracking-tighter uppercase border-l-4 border-brand pl-6">Responsible Content</h2>
                <p>
                  Responsible for the content of this website according to § 55 par. 2 RStV: <br/>
                  <strong>Head of Operations, VeroFlow AI Oy</strong><br/>
                  Mannerheimintie 12 B, 00100 Helsinki
                </p>
            </div>

            <div className="space-y-4">
                <h2 className="text-3xl font-black italic tracking-tighter uppercase border-l-4 border-brand pl-6">Dispute Resolution</h2>
                <p>
                  The European Commission provides a platform for online dispute resolution (OS): <br/>
                  <a href="https://ec.europa.eu/consumers/odr" target="_blank" className="text-brand underline decoration-brand/30 hover:decoration-brand transition-all">https://ec.europa.eu/consumers/odr</a><br/>
                  We are neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board.
                </p>
            </div>

            <div className="space-y-4">
                <h2 className="text-3xl font-black italic tracking-tighter uppercase border-l-4 border-brand pl-6">Liability for Content</h2>
                <p>
                  The contents of our pages were created with great care. However, for the correctness, completeness and actuality of the contents we cannot take over any guarantee. As a service provider we are responsible according to § 7 Abs. 1 TMG for own contents on these sides according to the general laws.
                </p>
            </div>

            <div className="space-y-4">
                <h2 className="text-3xl font-black italic tracking-tighter uppercase border-l-4 border-brand pl-6">Copyright</h2>
                <p>
                  The contents and works created by the site operators on these pages are subject to Finnish copyright law. The duplication, processing, distribution and any kind of exploitation outside the limits of copyright require the written consent of the respective author or creator. 
                </p>
            </div>
          </section>
        </article>

        <footer className="pt-24 border-t border-white/5 text-center">
            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em]">© 2026 VeroFlow AI | HELSINKI, FINLAND</p>
        </footer>
      </div>
    </div>
  );
}
