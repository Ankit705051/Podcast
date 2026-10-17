import React from 'react';
import { motion } from 'framer-motion';
import { HeroSection } from '../hero/HeroSection';
import { TiltCard } from '../3d/TiltCard';
import { sound } from '../../utils/audio';
import { Sparkles, ArrowRight, Swords, Cpu, Trophy, Calendar, Building2, Users } from 'lucide-react';
import type { PageTab } from '../../types';

interface HomePageProps {
  sceneMode: 'core' | 'orb' | 'portal';
  onNavigateTab: (tab: PageTab) => void;
  onOpenPass: () => void;
  onOpenTerminal: () => void;
}

const SECTOR_PORTALS: {
  tab: PageTab;
  title: string;
  code: string;
  desc: string;
  icon: React.ReactNode;
  badge: string;
  glow: 'cyan' | 'magenta' | 'purple' | 'amber';
  image: string;
}[] = [
  {
    tab: 'events',
    title: 'THE BATTLEGROUND MATRIX',
    code: 'SECTOR // 01 - 06',
    desc: '48h AGI Hackathons, Steel Combat Robotics, Tactical Cyber Esports & Speed Coding duels.',
    icon: <Swords className="w-5 h-5 text-cyan-400" />,
    badge: '$75,000 BOUNTY POOL',
    glow: 'cyan',
    image: '/assets/turing_city.png'
  },
  {
    tab: 'workshops',
    title: 'NEURAL & HARDWARE LABS',
    code: 'MASTERCLASSES',
    desc: 'Hands-on cryo-quantum circuits, multi-agent LLM swarms, and take-home robotics kits.',
    icon: <Cpu className="w-5 h-5 text-purple-400" />,
    badge: 'RESERVE TERMINAL SEAT',
    glow: 'purple',
    image: '/assets/quantum_waves.jpg'
  },
  {
    tab: 'leaderboard',
    title: 'LIVE SQUAD STANDINGS',
    code: 'TELEMETRY MATRIX',
    desc: 'Real-time algorithmic scoring and rank tracking across 64 collegiate squadrons.',
    icon: <Trophy className="w-5 h-5 text-amber-400" />,
    badge: 'LIVE POINT FEED',
    glow: 'amber',
    image: '/assets/iridescent_orb.jpg'
  },
  {
    tab: 'schedule',
    title: 'TEMPORAL MATRIX TIMELINE',
    code: 'CHRONO STREAM',
    desc: '3-day interactive timeline with live session broadcasts, keynote reveals, and bookmarks.',
    icon: <Calendar className="w-5 h-5 text-pink-400" />,
    badge: 'DAY 01 — 03',
    glow: 'magenta',
    image: '/assets/portal_tunnel.png'
  },
  {
    tab: 'sponsors',
    title: 'FRONTIER TECH ALLIANCE',
    code: 'ECOSYSTEM BOUNTIES',
    desc: 'NVIDIA, Anthropic, and Neuralink tracks, free GPU credits, and direct hiring interviews.',
    icon: <Building2 className="w-5 h-5 text-cyan-400" />,
    badge: 'H100 COMPUTE PASSES',
    glow: 'cyan',
    image: '/assets/cyber_head.jpg'
  },
  {
    tab: 'about',
    title: 'CAMPUS RADAR & LORE',
    code: 'ARCHIVE // SECTOR 07',
    desc: 'Interactive 3D campus quadrant map, Genesis evolution chronicles, and secret decryptor.',
    icon: <Users className="w-5 h-5 text-purple-400" />,
    badge: '64 UNIVERSITIES',
    glow: 'purple',
    image: '/assets/turing_city.png'
  }
];

export const HomePage: React.FC<HomePageProps> = ({
  sceneMode,
  onNavigateTab,
  onOpenPass,
  onOpenTerminal
}) => {
  return (
    <div className="space-y-24 pb-20">
      {/* 01 — Cinematic 3D Hero Section */}
      <HeroSection
        sceneMode={sceneMode}
        onOpenPass={onOpenPass}
        onOpenTerminal={onOpenTerminal}
      />

      {/* Sector Portals Directory (Direct Gateway to Dedicated Pages) */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-widest uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>/// CHOOSE DESTINATION SECTOR</span>
            </div>
            <h2 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase">
              INTERACTIVE <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">SECTOR PORTALS</span>
            </h2>
            <p className="mt-2 text-slate-400 font-space text-sm sm:text-base max-w-xl">
              Each portal initializes an authenticated quantum transit into a dedicated deep-tech sector. Select a node to jump.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400 hidden sm:block">
            <span>STATUS: ALL 6 GATEWAYS ONLINE</span>
          </div>
        </div>

        {/* Portals Grid with 3D Tilt Cards */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTOR_PORTALS.map((portal) => (
            <TiltCard
              key={portal.tab}
              glowColor={portal.glow}
              className="p-6 cursor-pointer group flex flex-col justify-between"
              onClick={() => {
                sound.playHover();
                onNavigateTab(portal.tab);
              }}
            >
              <div>
                {/* Visual Thumbnail Banner */}
                <div className="relative h-44 w-full rounded-xl overflow-hidden mb-5 bg-slate-900 border border-slate-800">
                  <img
                    src={portal.image}
                    alt={portal.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080d24] via-transparent to-transparent opacity-80" />

                  {/* Top Badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-black/70 backdrop-blur-md border border-cyan-500/40 text-cyan-300">
                    {portal.code}
                  </div>

                  {/* Bottom Highlight */}
                  <div className="absolute bottom-3 right-3 text-[10px] font-mono font-bold text-pink-400 bg-black/70 px-2 py-0.5 rounded border border-pink-500/40">
                    {portal.badge}
                  </div>
                </div>

                {/* Title & Desc */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="p-1.5 rounded-lg bg-[#060919] border border-slate-700">
                    {portal.icon}
                  </span>
                  <h3 className="font-orbitron font-bold text-lg text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {portal.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-400 font-space leading-relaxed">
                  {portal.desc}
                </p>
              </div>

              {/* Action Strip */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between font-mono text-xs text-cyan-400 group-hover:text-cyan-300">
                <span className="font-bold tracking-wider">INITIATE WARP JUMP</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* Fast-Track Registration Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-[#0d163a] via-[#090d24] to-[#1a0a28] border border-cyan-500/40 relative overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.2)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="text-xs font-mono text-pink-400 font-bold uppercase tracking-wider">
              /// CLAIM YOUR DIGITAL CREDENTIALS
            </div>
            <h3 className="font-orbitron font-black text-2xl sm:text-3xl text-slate-100 uppercase">
              REGISTER FOR THE 2026 QUANTUM MATRIX
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 font-space max-w-xl">
              Mint your personalized 3D holographic CyberPass with a scannable QR verification code. 100% free for collegiate hackers and researchers.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onOpenPass();
              sound.playSuccess();
            }}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-pink-500 text-black font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.5)] cursor-pointer shrink-0"
          >
            MINT CYBERPASS NOW
          </motion.button>
        </div>
      </section>
    </div>
  );
};
