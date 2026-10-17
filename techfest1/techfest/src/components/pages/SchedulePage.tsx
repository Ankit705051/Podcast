import React from 'react';
import { ScheduleTimeline } from '../schedule/ScheduleTimeline';
import { SpeakerProfiles } from '../speakers/SpeakerProfiles';
import { Sparkles, Calendar, Clock, Radio } from 'lucide-react';

interface SchedulePageProps {
  bookmarks: string[];
  onToggleBookmark: (eventId: string) => boolean;
}

export const SchedulePage: React.FC<SchedulePageProps> = ({
  bookmarks,
  onToggleBookmark
}) => {
  return (
    <div className="pt-24 pb-16 space-y-12">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-2xl bg-gradient-to-r from-[#0d163a] via-[#080d24] to-[#1a0f30] border border-cyan-500/40 relative overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.15)]">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-mono mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>/// 48-HOUR CHRONO MATRIX — DAY 01 TO 03</span>
            </div>
            <h1 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-black uppercase text-slate-100">
              TEMPORAL <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">EVENT STREAM</span>
            </h1>
            <p className="mt-3 text-slate-300 font-space text-sm sm:text-base leading-relaxed">
              Explore the hour-by-hour operational timeline. Bookmark events to filter your personal cyber schedule, and discover keynote sessions from global researchers.
            </p>

            <div className="mt-6 flex flex-wrap gap-4 font-mono text-xs">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-slate-300">
                <Calendar className="w-4 h-4 text-pink-400" />
                <span>OCT 24 - 26, 2026</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-slate-300">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>48H CONTINUOUS OPS</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-slate-300">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>METAVERSE STREAM ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Component */}
      <ScheduleTimeline
        bookmarks={bookmarks}
        onToggleBookmark={onToggleBookmark}
      />

      {/* Keynote Speakers Section */}
      <SpeakerProfiles />
    </div>
  );
};
