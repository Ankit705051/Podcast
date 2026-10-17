
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  MapPin,
  Shield,
  Zap,
  Terminal,
  Globe,
  Award,
  Users,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

import {
  MOCK_QUADRANTS,
  MOCK_TIMELINE,
  FEST_METADATA,
} from '../../data/mockData';

import { TiltCard } from '../3d/TiltCard';
import { sound } from '../../utils/audio';
import { useToast } from '../ui/Toast';
import type { SectorQuadrant } from '../../types';
    const BackgroundUI: React.FC = () => (
      <div
        aria-hidden="true"
        className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
  >
    {/* Base atmosphere */}
    <div className="absolute inset-0 bg-[#050713]" />

    {/* Technical grid */}
    <div
      className="absolute inset-0 opacity-[0.13]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(34,211,238,0.18) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34,211,238,0.18) 1px, transparent 1px)
        `,
        backgroundSize: '54px 54px',
        maskImage: 'linear-gradient(to bottom, black, transparent 85%)',
      }}
    />

    {/* Cyan ambient glow */}
    <div className="absolute -top-32 -left-32 h-[440px] w-[440px] rounded-full bg-cyan-500/[0.08] blur-[120px] animate-pulse" />

    {/* Purple ambient glow */}
    <div className="absolute top-[35%] -right-40 h-[480px] w-[480px] rounded-full bg-purple-500/[0.08] blur-[140px] animate-pulse" />

    {/* Pink ambient glow */}
    <div className="absolute bottom-0 left-1/3 h-[350px] w-[350px] rounded-full bg-pink-500/[0.05] blur-[120px] animate-pulse" />

    {/* Animated scanning beam */}
    <div className="background-scan absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

    {/* Bottom vignette */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050713]/70" />
  </div>
);

/* =========================================
   ABOUT PAGE
========================================= */

interface AboutPageProps {
  onRegister: () => void;
  onExploreEvents: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onRegister,
  onExploreEvents,
}) => {
  const { showToast } = useToast();

  const [selectedQuadrant, setSelectedQuadrant] =
    useState<SectorQuadrant>(MOCK_QUADRANTS[0]);

  const [isDecrypted, setIsDecrypted] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const handleSelectQuadrant = (q: SectorQuadrant) => {
    setSelectedQuadrant(q);
    sound.playHover();

    showToast(
      'Quadrant Calibrated',
      `${q.sectorCode} // ${q.name} coordinates locked!`,
      'info'
    );
  };

  const handleDecrypt = () => {
    if (isDecrypted || isDecrypting) return;

    setIsDecrypting(true);
    sound.playGlitch();

    window.setTimeout(() => {
      setIsDecrypted(true);
      setIsDecrypting(false);

      sound.playSuccess();

      showToast(
        'Quantum Signal Decrypted',
        'Clearance Level 5 archive unlocked!',
        'success'
      );
    }, 400);
  };

  return (
    <div className="relative isolate min-h-screen bg-[#050713]">
      <BackgroundUI />

      <div className="relative z-10 pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24">

        {/* PAGE HERO HEADER */}
        <section className="relative text-center max-w-4xl mx-auto pt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>/// ARCHIVE 01 — THE QUANTUM SINGULARITY LORE</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-orbitron text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-tight"
          >
            WHERE THE FUTURE OF{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
              SYNTHETIC MINDS
            </span>{' '}
            IS WRITTEN
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-slate-300 font-space text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            SYNAPSE began as a 50-person campus hardware hackathon in 2022.
            Today, it stands as the premier collegiate deep-tech proving
            ground uniting 64 top research universities and frontier AGI
            laboratories across the globe.
          </motion.p>

          {/* FEST METRICS */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs text-left">
            <div className="p-4 rounded-xl bg-[#080d24]/90 border border-cyan-500/30">
              <Globe className="w-5 h-5 text-cyan-400 mb-2" />
              <div className="text-xl sm:text-2xl font-orbitron font-bold text-slate-100">
                64
              </div>
              <div className="text-slate-400 mt-1">
                RESEARCH UNIVERSITIES
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#080d24]/90 border border-pink-500/30">
              <Users className="w-5 h-5 text-pink-400 mb-2" />
              <div className="text-xl sm:text-2xl font-orbitron font-bold text-slate-100">
                1,200+
              </div>
              <div className="text-slate-400 mt-1">
                ACCREDITED OPERATIVES
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#080d24]/90 border border-purple-500/30">
              <Award className="w-5 h-5 text-purple-400 mb-2" />
              <div className="text-xl sm:text-2xl font-orbitron font-bold text-slate-100">
                {FEST_METADATA.totalPrizePool}
              </div>
              <div className="text-slate-400 mt-1">
                BOUNTY &amp; GRANT POOL
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#080d24]/90 border border-emerald-500/30">
              <Zap className="w-5 h-5 text-emerald-400 mb-2" />
              <div className="text-xl sm:text-2xl font-orbitron font-bold text-slate-100">
                48 HOURS
              </div>
              <div className="text-slate-400 mt-1">
                CONTINUOUS PROTOCOL
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE CAMPUS RADAR */}
        <section className="p-6 sm:p-8 rounded-2xl bg-[#080d22]/90 border border-cyan-500/40 backdrop-blur-xl shadow-[0_0_40px_rgba(6,182,212,0.15)]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-pink-400 font-mono text-xs tracking-wider uppercase mb-1">
                <MapPin className="w-4 h-4" />
                <span>INTERACTIVE CAMPUS RADAR</span>
              </div>

              <h2 className="font-orbitron text-2xl sm:text-3xl font-bold uppercase text-slate-100">
                SECTOR <span className="text-cyan-400">07</span> TOPOLOGY
              </h2>
            </div>

            <span className="text-xs font-mono text-slate-400">
              Click any sector below to calibrate security &amp; telemetry feeds.
            </span>
          </div>

          {/* QUADRANT SELECTORS */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono text-xs">
            {MOCK_QUADRANTS.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => handleSelectQuadrant(q)}
                aria-pressed={selectedQuadrant.id === q.id}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedQuadrant.id === q.id
                    ? 'bg-cyan-500 text-black font-bold border-cyan-300 shadow-[0_0_15px_#06b6d4]'
                    : 'bg-[#050818] border-slate-800 text-slate-300 hover:border-cyan-500/50'
                }`}
              >
                <div className="text-[10px] tracking-widest">
                  {q.sectorCode}
                </div>
                <div className="truncate font-bold mt-1">
                  {q.name.split(' ')[0]}
                </div>
              </button>
            ))}
          </div>

          {/* SELECTED QUADRANT */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedQuadrant.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="mt-6 p-6 rounded-xl bg-[#050818] border border-cyan-500/30 grid grid-cols-1 md:grid-cols-3 gap-6 items-center"
            >
              <div className="md:col-span-2 space-y-3 font-space">
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-bold">
                    {selectedQuadrant.sectorCode}
                  </span>

                  <span className="text-slate-400">
                    {selectedQuadrant.zone}
                  </span>

                  <span className="md:ml-auto text-emerald-400 text-[10px] font-bold bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded">
                    {selectedQuadrant.status}
                  </span>
                </div>

                <h3 className="font-orbitron text-xl sm:text-2xl font-bold text-slate-100">
                  {selectedQuadrant.name}
                </h3>

                <p className="text-sm text-cyan-300 font-mono">
                  {selectedQuadrant.type}
                </p>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {selectedQuadrant.description}
                </p>

                <div className="pt-2">
                  <span className="text-xs font-mono text-slate-400 mr-2">
                    HOSTED SESSIONS:
                  </span>

                  <div className="inline-flex flex-wrap gap-1.5 mt-1">
                    {selectedQuadrant.keyEvents.map((ev) => (
                      <span
                        key={ev}
                        className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-[#090e24] text-pink-300 border border-pink-500/30"
                      >
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* CAPACITY MATRIX */}
              <div className="p-4 rounded-xl bg-[#080d24] border border-slate-700 flex flex-col justify-between font-mono text-xs">
                <div className="text-[10px] text-slate-400 tracking-wider">
                  CAPACITY MATRIX
                </div>

                <div className="font-orbitron text-sm font-bold text-cyan-300 my-2">
                  {selectedQuadrant.capacity}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    CLEARANCE:
                  </span>

                  <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                    <Shield className="w-3 h-3 text-amber-400" />
                    OPEN TIER 1
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* GENESIS TIMELINE */}
        <section>
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-wider uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CHRONICLES OF SYNAPSE</span>
            </div>

            <h2 className="font-orbitron text-3xl font-extrabold uppercase text-slate-100">
              THE 4-YEAR{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
                EVOLUTION
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {MOCK_TIMELINE.map((item, idx) => (
              <TiltCard
                key={item.year}
                glowColor={idx === 3 ? 'magenta' : 'cyan'}
                className="p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-slate-800">
                    <span className="font-orbitron font-bold text-xl text-cyan-400">
                      {item.year}
                    </span>
                    <span className="text-pink-400 font-bold">
                      {item.edition}
                    </span>
                  </div>

                  <h4 className="font-orbitron font-bold text-sm text-slate-200 mt-3">
                    {item.tagline}
                  </h4>

                  <p className="text-xs text-slate-400 font-space mt-2 leading-relaxed">
                    {item.breakthrough}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">{item.hackers}</span>
                  <span className="font-bold text-emerald-400">
                    {item.prizePool}
                  </span>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* SECRET ARCHIVE */}
        <section className="p-8 rounded-2xl bg-gradient-to-br from-[#0c1333]/95 via-[#080d24]/95 to-[#1a0f30]/95 border border-cyan-500/40 text-center relative overflow-hidden">
          <div className="max-w-xl mx-auto space-y-4">
            <Terminal className="w-10 h-10 text-cyan-400 mx-auto" />

            <h3 className="font-orbitron text-2xl font-black text-slate-100">
              CONFIDENTIAL ARCHIVE // SIGNAL 0X-99
            </h3>

            <p className="text-xs text-slate-300 font-mono">
              Encrypted developer notes from the Quantum Consortium steering committee.
            </p>

            {!isDecrypted ? (
              <button
                type="button"
                disabled={isDecrypting}
                onClick={handleDecrypt}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-pink-500 text-black font-mono font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all disabled:opacity-60 disabled:cursor-wait"
              >
                {isDecrypting
                  ? 'DECRYPTING SIGNAL...'
                  : 'DECRYPT QUANTUM SIGNAL'}
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-black/60 border border-emerald-500/50 text-emerald-300 font-mono text-xs text-left space-y-2"
              >
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SIGNAL DECRYPTED: WELCOME OPERATIVE</span>
                </div>

                <p className="text-slate-300">
                  &ldquo;We did not build SYNAPSE to replicate traditional
                  college expos. We built an autonomous sandbox where
                  undergraduates can command quantum circuits, deploy
                  multi-agent swarms, and redefine collegiate robotics.&rdquo;
                </p>

                <div className="text-[10px] text-slate-500 pt-1">
                  — Aiden Vance &amp; Seraphina Lin, Consortium Founders
                </div>
              </motion.div>
            )}

            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onExploreEvents();
                }}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <span>GO TO EVENT UNIVERSE</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <span className="text-slate-600">|</span>

              <button
                type="button"
                onClick={() => {
                  sound.playSuccess();
                  onRegister();
                }}
                className="text-xs font-mono text-pink-400 hover:text-pink-300 flex items-center gap-1 cursor-pointer"
              >
                <span>CLAIM PASS</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
