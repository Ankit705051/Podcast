import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Users, Trophy, Bookmark, BookmarkCheck, ExternalLink, ShieldCheck } from 'lucide-react';
import type { EventItem } from '../../types';
import { sound } from '../../utils/audio';

interface EventQuickViewModalProps {
  event: EventItem | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (eventId: string) => void;
  onRegister: (category: EventItem['category']) => void;
}

export const EventQuickViewModal: React.FC<EventQuickViewModalProps> = ({
  event,
  onClose,
  isBookmarked,
  onToggleBookmark,
  onRegister,
}) => {
  if (!event) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-3xl rounded-2xl bg-[#090d24] border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col"
        >
          {/* Top Decorative Header Strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />

          {/* Close button */}
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-black/60 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Scrollable Content */}
          <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
            {/* Hero Image Banner */}
            <div className="relative h-56 sm:h-64 rounded-xl overflow-hidden border border-slate-700">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090d24] via-[#090d24]/50 to-transparent" />
              
              {/* Category & Status Badge */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-md text-xs font-mono font-bold uppercase bg-cyan-500 text-black shadow-[0_0_10px_#06b6d4]">
                    {event.categoryLabel}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono border border-pink-500/60 bg-pink-950/60 text-pink-300">
                    {event.difficulty}
                  </span>
                </div>

                <div className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-md">
                  {event.slotsRemaining} SLOTS REMAINING
                </div>
              </div>
            </div>

            {/* Title & Tagline */}
            <div>
              <h2 className="font-orbitron text-2xl sm:text-3xl font-black text-slate-100 tracking-wide">
                {event.title}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-cyan-300 font-space font-medium">
                {event.tagline}
              </p>
            </div>

            {/* Key Metadata Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-[#0c1230] border border-slate-800">
                <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  DATE
                </div>
                <div className="text-slate-200 font-semibold">{event.date}</div>
              </div>

              <div className="p-3 rounded-lg bg-[#0c1230] border border-slate-800">
                <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  SCHEDULE
                </div>
                <div className="text-slate-200 font-semibold">{event.time}</div>
              </div>

              <div className="p-3 rounded-lg bg-[#0c1230] border border-slate-800">
                <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                  <Users className="w-3.5 h-3.5 text-pink-400" />
                  SQUAD
                </div>
                <div className="text-slate-200 font-semibold">{event.teamSize}</div>
              </div>

              <div className="p-3 rounded-lg bg-[#0c1230] border border-slate-800">
                <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  SECTOR
                </div>
                <div className="text-slate-200 font-semibold truncate">{event.venue}</div>
              </div>
            </div>

            {/* Detailed Description */}
            <div>
              <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-2">
                /// MISSION DIRECTIVE
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed font-space">
                {event.description}
              </p>
            </div>

            {/* Bounty / Prizes Breakdown */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#0d163d] to-[#1a0f30] border border-cyan-500/30">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300 mb-3">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>BOUNTY DISTRIBUTION POOL ({event.prizes.total})</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded bg-black/40 border border-amber-500/30">
                  <div className="text-amber-400 font-bold">1ST PLACE // CHAMPION</div>
                  <div className="text-slate-200 mt-1">{event.prizes.first}</div>
                </div>
                <div className="p-2.5 rounded bg-black/40 border border-slate-600/30">
                  <div className="text-slate-300 font-bold">2ND PLACE // RUNNER UP</div>
                  <div className="text-slate-200 mt-1">{event.prizes.second}</div>
                </div>
                <div className="p-2.5 rounded bg-black/40 border border-amber-700/30">
                  <div className="text-amber-600 font-bold">3RD PLACE // BRONZE</div>
                  <div className="text-slate-200 mt-1">{event.prizes.third}</div>
                </div>
              </div>

              {event.prizes.perks && event.prizes.perks.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex flex-wrap gap-2 text-[11px] font-mono text-cyan-300">
                  <span className="text-slate-400">ADDITIONAL PERKS:</span>
                  {event.prizes.perks.map((perk, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                      ✓ {perk}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Operational Directives / Rules */}
            <div>
              <h3 className="text-xs font-mono tracking-widest text-slate-400 uppercase mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-pink-400" />
                <span>ENGAGEMENT DIRECTIVES & PROTOCOLS</span>
              </h3>
              <ul className="space-y-2 text-xs font-mono text-slate-300">
                {event.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 p-2 rounded bg-[#0a0f26] border border-slate-800">
                    <span className="text-cyan-400 font-bold">[{String(idx + 1).padStart(2, '0')}]</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tag Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              {event.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md text-xs font-mono bg-[#0c1436] text-cyan-400 border border-cyan-500/20"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 sm:p-6 bg-[#070a1e] border-t border-slate-800 flex items-center justify-between gap-4">
            <button
              onClick={() => {
                onToggleBookmark(event.id);
                sound.playClick();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ${
                isBookmarked
                  ? 'border-pink-500/60 bg-pink-950/40 text-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.3)]'
                  : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40'
              }`}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-pink-400" />
                  <span>SAVED TO SCHEDULE</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>BOOKMARK EVENT</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                onRegister(event.category);
                onClose();
                sound.playSuccess();
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-pink-500 text-black font-mono text-xs font-bold tracking-wider uppercase hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all cursor-pointer"
            >
              <span>REGISTER FOR SECTOR</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
