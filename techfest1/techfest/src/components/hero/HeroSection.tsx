import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HeroScene } from '../3d/HeroScene';
import { Sparkles, ArrowDown, ChevronRight, Terminal, Award, MapPin, Calendar, Clock, Users } from 'lucide-react';
import { sound } from '../../utils/audio';
import { FEST_METADATA } from '../../data/mockData';

interface HeroSectionProps {
  sceneMode: 'core' | 'orb' | 'portal';
  onOpenPass: () => void;
  onOpenTerminal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ sceneMode, onOpenPass, onOpenTerminal }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 10,
    hours: 15,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    const target = new Date(FEST_METADATA.startDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 10, hours: 8, minutes: 24, seconds: 51 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToEvents = () => {
    sound.playClick();
    const elem = document.getElementById('events');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen w-full flex flex-col justify-between pt-24 pb-12 overflow-hidden bg-[#050713]">
      {/* Dynamic 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 z-0 opacity-90">
        <HeroScene sceneMode={sceneMode} />
      </div>

      {/* Ambient Radial Vignette & Glow */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-[#050713]/40 to-[#050713] z-10" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[400px] bg-pink-500/10 rounded-full blur-[130px] pointer-events-none z-0" />

      {/* Main Hero UI Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center items-center text-center">
        {/* Status Callout Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)]"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-semibold tracking-wider">/// PROTOCOL 2026 // SECTOR 07 INITIALIZED</span>
          <span className="text-slate-500">|</span>
          <span className="text-pink-400 font-bold">{FEST_METADATA.edition}</span>
        </motion.div>

        {/* Hero Title with Sci-Fi Glitch & Hologram Effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="max-w-4xl"
        >
      
        <h1 className="font-orbitron text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-none">
        <span className="block bg-gradient-to-r from-white via-cyan-100 to-slate-300 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(6,182,212,0.6)]">
        techFest
        </span>

        <span className="block mt-2  bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(236,72,153,0.5)]">
        singuLarity 2026
        </span>
        </h1>


          <p className="mt-6 text-sm sm:text-base md:text-lg text-slate-300 font-space max-w-2xl mx-auto leading-relaxed">
            The ultimate inter-university collegiate hackathon and cybernetics tournament. 
            48 hours of autonomous AGI, combat robotics, zero-latency esports, and quantum algorithms.
          </p>
        </motion.div>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          {/* Main Register Button */}
          <button
            onClick={() => {
              onOpenPass();
              sound.playSuccess();
            }}
            onMouseEnter={() => sound.playHover()}
            className="group relative px-7 py-3.5 rounded-xl font-mono text-xs sm:text-sm font-bold tracking-wider uppercase text-black bg-gradient-to-r from-cyan-400 via-cyan-300 to-pink-400 shadow-[0_0_25px_rgba(6,182,212,0.6)] hover:shadow-[0_0_40px_rgba(236,72,153,0.8)] transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-black group-hover:rotate-12 transition-transform" />
              <span>INITIALIZE ACCESS PASS</span>
              <ChevronRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Explore Sectors Button */}
          <button
            onClick={scrollToEvents}
            onMouseEnter={() => sound.playHover()}
            className="px-6 py-3.5 rounded-xl font-mono text-xs sm:text-sm font-semibold tracking-wider uppercase text-slate-200 border border-cyan-500/40 hover:border-cyan-400 bg-[#090e24]/80 backdrop-blur-md hover:text-cyan-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 cursor-pointer flex items-center gap-2"
          >
            <span>EXPLORE SECTORS</span>
            <ArrowDown className="w-4 h-4 text-cyan-400 group-hover:translate-y-0.5" />
          </button>

          {/* Terminal Command Quick Launch */}
          <button
            onClick={() => {
              onOpenTerminal();
              sound.playClick();
            }}
            onMouseEnter={() => sound.playHover()}
            className="px-4 py-3.5 rounded-xl font-mono text-xs text-slate-400 hover:text-slate-100 border border-slate-800 hover:border-slate-600 bg-[#070b1d]/70 backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5"
            title="Launch Command Terminal"
          >
            <Terminal className="w-4 h-4 text-pink-400" />
            <span className="hidden sm:inline">TERMINAL [^K]</span>
          </button>
        </motion.div>

        {/* Live Countdown Timer (Directly inspired by JunctionX & Turing City screenshots) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-12 w-full max-w-2xl"
        >
          <div className="relative p-5 sm:p-6 rounded-2xl bg-[#080d22]/90 backdrop-blur-xl border border-pink-500/30 shadow-[0_0_35px_rgba(236,72,153,0.2)]">
            {/* Glowing HUD Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-[11px] font-mono tracking-widest text-slate-400">
              <span className="text-cyan-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                SYSTEM INITIALIZATION COUNTDOWN
              </span>
              <span className="text-pink-400 font-semibold">T-MINUS</span>
            </div>

            {/* Countdown Grid */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 font-orbitron">
              {/* Days */}
              <div className="flex flex-col items-center p-3 sm:p-4 rounded-xl bg-[#050818] border border-cyan-500/20 shadow-inner">
                <span className="text-2xl sm:text-4xl md:text-5xl font-black text-pink-400 drop-shadow-[0_0_12px_rgba(236,72,153,0.7)]">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs font-mono font-medium tracking-widest text-slate-400 mt-1">
                  DAYS
                </span>
              </div>

              {/* Hours */}
              <div className="flex flex-col items-center p-3 sm:p-4 rounded-xl bg-[#050818] border border-cyan-500/20 shadow-inner">
                <span className="text-2xl sm:text-4xl md:text-5xl font-black text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.7)]">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs font-mono font-medium tracking-widest text-slate-400 mt-1">
                  HOURS
                </span>
              </div>

              {/* Minutes */}
              <div className="flex flex-col items-center p-3 sm:p-4 rounded-xl bg-[#050818] border border-cyan-500/20 shadow-inner">
                <span className="text-2xl sm:text-4xl md:text-5xl font-black text-pink-400 drop-shadow-[0_0_12px_rgba(236,72,153,0.7)]">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs font-mono font-medium tracking-widest text-slate-400 mt-1">
                  MINUTES
                </span>
              </div>

              {/* Seconds */}
              <div className="flex flex-col items-center p-3 sm:p-4 rounded-xl bg-[#050818] border border-cyan-500/20 shadow-inner">
                <span className="text-2xl sm:text-4xl md:text-5xl font-black text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.7)]">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs font-mono font-medium tracking-widest text-slate-400 mt-1">
                  SECONDS
                </span>
              </div>
            </div>

            {/* Prize Pool Highlight inside Timer */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">TOTAL BOUNTY & GRANT POOL:</span>
              <span className="font-orbitron font-bold text-emerald-400 text-sm tracking-wider drop-shadow-[0_0_10px_rgba(52,211,153,0.6)]">
                {FEST_METADATA.totalPrizePool} USD
              </span>
            </div>
          </div>
        </motion.div>

        {/* 4 Metadata Badges (Turing City reference) */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-4xl text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-[#070c20]/60 border border-slate-800 flex items-center gap-2.5 text-left">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-slate-400 text-[10px]">COORDINATES</div>
              <div className="text-slate-200 font-semibold truncate">Sector 07 // Silicon Bay</div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#070c20]/60 border border-slate-800 flex items-center gap-2.5 text-left">
            <Calendar className="w-4 h-4 text-pink-400 shrink-0" />
            <div>
              <div className="text-slate-400 text-[10px]">DATE & DURATION</div>
              <div className="text-slate-200 font-semibold">OCT 24 - 26, 2026</div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#070c20]/60 border border-slate-800 flex items-center gap-2.5 text-left">
            <Clock className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <div className="text-slate-400 text-[10px]">TIME MATRIX</div>
              <div className="text-slate-200 font-semibold">48H Continuous</div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#070c20]/60 border border-slate-800 flex items-center gap-2.5 text-left">
            <Users className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-slate-400 text-[10px]">ATTENDEES</div>
              <div className="text-slate-200 font-semibold">1,200+ Operatives</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Telemetry Ticker */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-10 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 gap-4">
        <div className="flex items-center gap-3">
          <span className="text-cyan-400">/// SYNAPSE TELEMETRY</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">LATENCY: 14ms</span>
          <span className="hidden sm:inline">|</span>
          <span>CLUSTER: US-WEST-QUANTUM-01</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>TOP PRIZE + GOLDEN TICKET TO HELSINKI</span>
          </span>
          <button
            onClick={scrollToEvents}
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>SCROLL DOWN</span>
            <ArrowDown className="w-3 h-3 animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
};
