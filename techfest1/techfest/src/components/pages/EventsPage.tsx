import React from 'react';
import { EventUniverse } from '../events/EventUniverse';
import type { EventCategory } from '../../types';
import { Sparkles, Trophy, Cpu, Swords } from 'lucide-react';


import ParticleWaveBackground  from '../background/particleWaveBackground';
interface EventsPageProps {
  bookmarks: string[];
  onToggleBookmark: (eventId: string) => boolean;
  onRegister: (category?: EventCategory) => void;
}

export const EventsPage: React.FC<EventsPageProps> = ({
  bookmarks,
  onToggleBookmark,
  onRegister
}) => {
  return (
      <div className="relative isolate min-h-screen bg-[#03050b]">
      <ParticleWaveBackground />
    <div className="pt-24 pb-16 space-y-12">
      {/* Sector Directory Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-2xl bg-gradient-to-r from-[#0a1030] via-[#090d24] to-[#1a0a28] border border-cyan-500/40 relative overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.15)]">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-mono mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>/// SECTOR DIRECTORY — 6 MAJOR ARENAS</span>
            </div>
            <h1 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-black uppercase text-slate-100">
              ENGAGE IN THE <span className="bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">QUANTUM ARENA</span>
            </h1>
            <p className="mt-3 text-slate-300 font-space text-sm sm:text-base leading-relaxed">
              Every battleground features real hardware rigs, cloud compute access, cash prize pools, and immediate evaluation by industry jury leads.
            </p>

            <div className="mt-6 flex flex-wrap gap-4 font-mono text-xs">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-slate-300">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>TOTAL BOUNTY: $75,000+</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-slate-300">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>6 SECTOR TRACKS</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-slate-300">
                <Swords className="w-4 h-4 text-pink-400" />
                <span>SOLO &amp; SQUAD DIVISIONS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Event Universe Grid & Filters */}
      <EventUniverse
        bookmarks={bookmarks}
        onToggleBookmark={onToggleBookmark}
        onRegister={onRegister}
      />
    </div>
    </div>
  );
};
