import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, ExternalLink, Copy, Check, Briefcase, MapPin, X, Download } from 'lucide-react';
import { MOCK_SPONSORS } from '../../data/mockData';
import { TiltCard } from '../3d/TiltCard';
import { sound } from '../../utils/audio';
import { useToast } from '../ui/Toast';
import type { SponsorItem } from '../../types';

export const SponsorsPage: React.FC = () => {
  const { showToast } = useToast();
  const [selectedSponsor, setSelectedSponsor] = useState<SponsorItem | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isProspectusModalOpen, setIsProspectusModalOpen] = useState(false);
  const [inquiryEmail, setInquiryEmail] = useState('');

  const handleSponsorClick = (sponsor: SponsorItem) => {
    sound.playHover();
    setSelectedSponsor(sponsor);
    setCopiedCode(false);
  };

  const handleCopyPromo = (code: string) => {
    sound.playSuccess();
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    showToast('Promo Code Copied!', `Voucher ${code} copied to clipboard.`, 'success');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleApplySponsorship = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryEmail) return;
    sound.playSuccess();
    showToast('Inquiry Transmitted', 'Partnership prospectus dispatched to your inbox.', 'success');
    setIsProspectusModalOpen(false);
    setInquiryEmail('');
  };

  return (
     <div className="relative min-h-screen">

    {}
    <main className="relative z-10 pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {}
      <div className="text-center max-w-3xl mx-auto">
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-mono mb-4"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span></span>
        </motion.div>


        <h1 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-black uppercase text-slate-100">
          POWERED BY <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-pink-500 bg-clip-text text-transparent">FRONTIER TECH</span>
        </h1>
        <p className="mt-4 text-slate-400 font-space text-sm sm:text-base leading-relaxed">
          Industry labs and tech pioneers funding \$75,000+ in bounties, supplying compute vouchers, and conducting on-site fast-track hiring for collegiate operatives.
        </p>

        {}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => {
              sound.playClick();
              setIsProspectusModalOpen(true);
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-pink-500 text-black font-mono font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-all cursor-pointer"
          >
            BECOME AN ECOSYSTEM PARTNER
          </button>
        </div>
      </div>

      {}
      <div className="space-y-12">
        {}
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold tracking-widest uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SINGULARITY TITLE PARTNERS ($25K+ BOUNTY ESCROW)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_SPONSORS.filter((s) => s.tier === 'singularity').map((sponsor) => (
              <TiltCard
                key={sponsor.id}
                glowColor="cyan"
                className="p-6 cursor-pointer group"
                onClick={() => handleSponsorClick(sponsor)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-xl bg-[#060919] border border-slate-700">
                      {sponsor.logo}
                    </span>
                    <div>
                      <h3 className="font-orbitron font-bold text-xl text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {sponsor.name}
                      </h3>
                      <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-black/60 border ${sponsor.badgeColor}`}>
                        {sponsor.tierLabel}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>EXPLORE BOUNTY</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>

                <p className="mt-4 text-xs sm:text-sm text-slate-300 font-space leading-relaxed">
                  {sponsor.description}
                </p>

                {}
                <div className="mt-4 p-3 rounded-xl bg-[#060b1d] border border-cyan-500/30 flex items-center justify-between font-mono text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">EXCLUSIVE TRACK BOUNTY</div>
                    <div className="text-cyan-300 font-bold truncate max-w-xs">{sponsor.bountyTitle}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase">POOL</div>
                    <div className="font-orbitron font-bold text-emerald-400 text-sm">{sponsor.bountyAmount}</div>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>

        {}
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-bold tracking-widest uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>APEX RESEARCH &amp; CLOUD PARTNERS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_SPONSORS.filter((s) => s.tier === 'apex').map((sponsor) => (
              <TiltCard
                key={sponsor.id}
                glowColor="purple"
                className="p-5 cursor-pointer group flex flex-col justify-between"
                onClick={() => handleSponsorClick(sponsor)}
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl p-1.5 rounded-lg bg-[#060919] border border-slate-700">
                      {sponsor.logo}
                    </span>
                    <div>
                      <h4 className="font-orbitron font-bold text-base text-slate-100 group-hover:text-purple-300 transition-colors">
                        {sponsor.name}
                      </h4>
                      <span className="text-[9px] font-mono text-purple-400 font-bold">
                        {sponsor.tierLabel}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 font-space line-clamp-3 leading-relaxed">
                    {sponsor.tagline}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-400 font-bold">{sponsor.bountyAmount}</span>
                  <span className="text-cyan-400 flex items-center gap-1">
                    <span>VIEW</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>

        {}
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold tracking-widest uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>QUANTUM &amp; HARDWARE ALLIANCE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {MOCK_SPONSORS.filter((s) => s.tier === 'quantum' || s.tier === 'hardware').map((sponsor) => (
              <div
                key={sponsor.id}
                onClick={() => handleSponsorClick(sponsor)}
                className="p-4 rounded-xl bg-[#070b1e] border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{sponsor.logo}</span>
                  <div>
                    <div className="font-orbitron font-bold text-xs text-slate-200 group-hover:text-cyan-300">
                      {sponsor.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">{sponsor.bountyAmount}</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {}
      <AnimatePresence>
        {selectedSponsor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSponsor(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              className="relative w-full max-w-2xl rounded-2xl bg-[#080d24] border border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden z-10 p-6 sm:p-8 space-y-6"
            >
              {}
              <div className="h-1.5 -mx-8 -mt-8 mb-6 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />

              <button
                onClick={() => setSelectedSponsor(null)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-black/60 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {}
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 rounded-xl bg-[#060919] border border-slate-700">
                  {selectedSponsor.logo}
                </span>
                <div>
                  <h3 className="font-orbitron font-extrabold text-2xl text-slate-100">
                    {selectedSponsor.name}
                  </h3>
                  <div className="text-xs font-mono text-cyan-400">{selectedSponsor.tagline}</div>
                </div>
              </div>

              {}
              <div className="p-4 rounded-xl bg-[#060b1e] border border-cyan-500/40 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Trophy className="w-4 h-4" />
                    <span>BOUNTY CHALLENGE DIRECTIVE</span>
                  </span>
                  <span className="font-orbitron text-emerald-400 text-sm">
                    {selectedSponsor.bountyAmount}
                  </span>
                </div>
                <h4 className="font-orbitron font-bold text-slate-100 text-base">
                  {selectedSponsor.bountyTitle}
                </h4>
                <p className="text-xs text-slate-300 font-space leading-relaxed">
                  {selectedSponsor.bountyDetails}
                </p>
              </div>

              {}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#0d163a] to-[#170e2c] border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">EXCLUSIVE COMPUTE VOUCHER CODE</div>
                  <div className="text-cyan-300 font-bold text-sm tracking-wider font-mono">
                    {selectedSponsor.promoCode}
                  </div>
                </div>

                <button
                  onClick={() => handleCopyPromo(selectedSponsor.promoCode)}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>CLAIM CODE</span>
                    </>
                  )}
                </button>
              </div>

              {}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 rounded-lg bg-[#060a1d] border border-slate-800">
                  <div className="text-slate-400 flex items-center gap-1.5 mb-2">
                    <Briefcase className="w-3.5 h-3.5 text-pink-400" />
                    <span>ACTIVE RECRUITMENT TRACKS</span>
                  </div>
                  <ul className="space-y-1 text-slate-300">
                    {selectedSponsor.hiringRoles.map((role, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>{role}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-[#060a1d] border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="text-slate-400 flex items-center gap-1.5 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>CAMPUS BOOTH LOCATION</span>
                    </div>
                    <div className="text-slate-200 font-semibold">{selectedSponsor.boothLocation}</div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-2">
                    Operative mentors on site 10:00 - 18:00 UTC daily.
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {}
      <AnimatePresence>
        {isProspectusModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProspectusModalOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-2xl bg-[#080d24] border border-cyan-500/50 p-6 z-10 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-orbitron font-bold text-lg text-slate-100">
                  PARTNER PROSPECTUS
                </h3>
                <button
                  onClick={() => setIsProspectusModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-400 font-space">
                Join NVIDIA, Anthropic, and Neuralink in sponsoring collegiate engineering talent.
              </p>

              <form onSubmit={handleApplySponsorship} className="space-y-3 font-mono text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">COMPANY / LAB EMAIL *</label>
                  <input
                    type="email"
                    required
                    placeholder="partner@ai-lab.io"
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#06091a] border border-slate-700 text-slate-100 focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-cyan-500 text-black font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer hover:bg-cyan-400 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>DISPATCH 2026 PROSPECTUS</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </main>
    </div>
  );
};
