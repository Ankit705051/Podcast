import React from 'react';
import { LeaderboardSection } from '../leaderboard/LeaderboardSection';
import { Sparkles, Trophy, Zap, ShieldCheck } from 'lucide-react';
import ParticleWaveBackground  from '../background/particleWaveBackground';

export const LeaderboardPage: React.FC = () => {
  return (
    <div className="relative isolate min-h-screen bg-[#03050b]">
      <ParticleWaveBackground />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_15%,rgba(3,5,11,0.4)_70%,#03050b_110%)]" />
    <div className="pt-24 pb-16 space-y-12">
      {/* Page Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-2xl bg-gradient-to-r from-[#170e2c] via-[#090d24] to-[#0a1533] border border-pink-500/40 relative overflow-hidden shadow-[0_0_40px_rgba(236,72,153,0.15)]">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-950/80 border border-pink-500/50 text-pink-300 text-xs font-mono mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>/// LIVE TELEMETRY MATRIX — SQUAD RANKINGS</span>
            </div>
            <h1 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-black uppercase text-slate-100">
              COLLEGIATE <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">BATTLEGROUND MATRIX</span>
            </h1>
            <p className="mt-3 text-slate-300 font-space text-sm sm:text-base leading-relaxed">
              Real-time point feeds tracking hackathon commits, combat bot elimination bouts, and speed coding algorithmic duels. Engage the live scoring simulation to observe dynamic rank swaps.
            </p>

            <div className="mt-6 flex flex-wrap gap-4 font-mono text-xs">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-slate-300">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>TOP 3 SQUADS QUALIFY FOR HELSINKI</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-slate-300">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>DYNAMIC RANK SWAPS ENABLED</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ZERO-LATENCY TELEMETRY VERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Leaderboard Section Component */}
      <LeaderboardSection />
    </div>
    </div>
  );
};
