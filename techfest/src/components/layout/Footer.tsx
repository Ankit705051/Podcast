import React, { useState } from 'react';
import { ArrowUp, Sparkles, ChevronDown } from 'lucide-react';
import { FEST_METADATA, MOCK_FAQS } from '../../data/mockData';
import { sound } from '../../utils/audio';
import type { PageTab } from '../../types';

interface FooterProps {
  onNavigateTab?: (tab: PageTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const scrollToTop = () => {
    sound.playClick();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFaq = (index: number) => {
    sound.playClick();
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleLink = (tab: PageTab) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    }
  };

  return (
    <footer className="relative bg-[#03050e] border-t border-slate-800/80 text-slate-400 font-mono text-xs overflow-hidden">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none" />

      {/* FAQ Section */}
      <div id="faq" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center mb-12">
          
          <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-widest uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>/// 07 — OPERATIONAL INTELLIGENCE</span>
          </div>

          <h2 className="font-orbitron text-3xl sm:text-4xl font-extrabold text-slate-100 uppercase">
            FREQUENTLY ASKED <span className="bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">QUESTIONS</span>
          </h2>
          <p className="mt-2 text-slate-400 font-space text-sm">
            Everything you need to know about participating in the SYNAPSE 2026 collegiate hackathon.
          </p>
        </div>

        <div className="space-y-3">
          {MOCK_FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-[#070b1c] border border-slate-800 overflow-hidden transition-colors hover:border-cyan-500/40"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-space font-semibold text-slate-200 text-sm sm:text-base cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-xs text-cyan-400 font-bold">[{String(idx + 1).padStart(2, '0')}]</span>
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-cyan-400 transition-transform duration-200 shrink-0 ml-2 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-slate-400 font-space text-xs sm:text-sm border-t border-slate-800/60 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sponsors & Lab Partners Strip */}
      <div className="relative z-10 border-y border-slate-800/80 bg-[#040714]/80 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="text-[10px] tracking-widest uppercase text-slate-500 font-bold">
              INDUSTRY LAB & RESEARCH PARTNERS
            </div>
            <div className="text-slate-300 font-orbitron font-semibold text-xs mt-0.5">
              Providing GPU Clusters, Micro-Grants & Compute
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
            {FEST_METADATA.sponsorPartners.map((partner) => (
              <button
                key={partner}
                onClick={() => handleLink('sponsors')}
                className="px-3.5 py-1.5 rounded-lg bg-[#070c22] border border-slate-800 hover:border-cyan-500/40 hover:text-cyan-300 transition-all cursor-pointer"
              >
                {partner}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-pink-500 flex items-center justify-center font-orbitron font-black text-black text-xs">
                Ω
              </div>
              <span className="font-orbitron font-extrabold text-lg text-slate-100 tracking-wider">
                techFesT 2026
              </span>
            </div>
            <p className="text-slate-400 font-space text-xs max-w-sm leading-relaxed">
              The premier collegiate cybernetics tournament and deep-tech hackathon exploring the frontiers of artificial general intelligence, autonomous robotics, and quantum computing.
            </p>
            <div className="flex items-center gap-3 text-cyan-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>SERVER PROTOCOL: ALL NODES ONLINE</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div className="text-xs font-bold text-slate-200 tracking-wider uppercase mb-3">
              SECTORS &amp; PAGES
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><button onClick={() => handleLink('about')} className="hover:text-cyan-400 transition-colors cursor-pointer">// About &amp; Campus Radar</button></li>
              <li><button onClick={() => handleLink('events')} className="hover:text-cyan-400 transition-colors cursor-pointer">// Sector Directory</button></li>
              <li><button onClick={() => handleLink('workshops')} className="hover:text-cyan-400 transition-colors cursor-pointer">// Neural Masterclasses</button></li>
              <li><button onClick={() => handleLink('sponsors')} className="hover:text-cyan-400 transition-colors cursor-pointer">// Frontier Sponsors &amp; Bounties</button></li>
              <li><button onClick={() => handleLink('team')} className="hover:text-cyan-400 transition-colors cursor-pointer">// Executive Council</button></li>
            </ul>
          </div>

          {/* Legal / Social */}
          <div>
            <div className="text-xs font-bold text-slate-200 tracking-wider uppercase mb-3">
              INTELLIGENCE
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><button onClick={() => handleLink('home')} className="hover:text-cyan-400 transition-colors cursor-pointer">// Live Leaderboard Matrix</button></li>
              <li><button onClick={() => handleLink('home')} className="hover:text-cyan-400 transition-colors cursor-pointer">// Festival Timeline</button></li>
              <li><button onClick={() => handleLink('home')} className="hover:text-cyan-400 transition-colors cursor-pointer">// Keynote Operatives</button></li>
              <li><a href="#faq" className="hover:text-cyan-400 transition-colors">// Code of Conduct &amp; FAQ</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & back to top */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        
          <div>
            © 2026 techFest QUANTUM CONSORTIUM. All collegiate protocols reserved.
          </div>

          <div className="flex items-center gap-4">
            <span>COORDINATES: SECTOR 07</span>
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>RETURN TO TOP</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
