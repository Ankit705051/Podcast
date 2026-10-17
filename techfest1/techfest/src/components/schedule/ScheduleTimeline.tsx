import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Bookmark, BookmarkCheck, Radio, Sparkles, Filter } from 'lucide-react';
import { MOCK_SCHEDULE } from '../../data/mockData';
import { sound } from '../../utils/audio';
import { useToast } from '../ui/Toast';

interface ScheduleTimelineProps {
  bookmarks: string[];
  onToggleBookmark: (eventId: string) => boolean;
}

export const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({
  bookmarks,
  onToggleBookmark
}) => {
  const { showToast } = useToast();
  const [selectedDay, setSelectedDay] = useState<1 | 2 | 3>(1);
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);

  const dayDates = {
    1: 'DAY 01 // OCTOBER 24, 2026',
    2: 'DAY 02 // OCTOBER 25, 2026',
    3: 'DAY 03 // OCTOBER 26, 2026',
  };

  const filteredSchedule = MOCK_SCHEDULE.filter(item => {
    const matchesDay = item.day === selectedDay;
    const matchesBookmark = onlyBookmarks ? (item.eventId ? bookmarks.includes(item.eventId) : false) : true;
    return matchesDay && matchesBookmark;
  });

  return (
    <section id="schedule" className="relative py-24 bg-[#050713] text-slate-100 overflow-hidden border-t border-slate-800/80">
      <div className="absolute top-1/2 right-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-widest uppercase mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>/// 05 — TEMPORAL EVENT MATRIX</span>
            </div>
            <h2 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase">
              FESTIVAL <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">TIMELINE</span>
            </h2>
            <p className="mt-2 text-slate-400 font-space text-sm sm:text-base max-w-xl">
              Chronological schedule of keynotes, hackathon check-ins, arena matches, and award ceremonies.
            </p>
          </div>

          {/* Bookmarks Filter Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setOnlyBookmarks(!onlyBookmarks);
                sound.playClick();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer ${
                onlyBookmarks
                  ? 'bg-pink-600 text-white shadow-[0_0_15px_#ec4899]'
                  : 'bg-[#090e24] border border-slate-700 text-slate-300 hover:border-pink-500 hover:text-pink-300'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{onlyBookmarks ? 'SHOWING SAVED EVENTS' : 'FILTER MY SAVED EVENTS'}</span>
              {bookmarks.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-black/40 text-pink-300 text-[10px] flex items-center justify-center">
                  {bookmarks.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Day Switcher Tabs */}
        <div className="mt-8 flex items-center gap-3 font-mono text-xs">
          {([1, 2, 3] as (1 | 2 | 3)[]).map((day) => (
            <button
              key={day}
              onClick={() => {
                setSelectedDay(day);
                sound.playHover();
              }}
              className={`flex-1 sm:flex-initial px-5 py-3 rounded-xl border text-center transition-all cursor-pointer ${
                selectedDay === day
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 border-cyan-400 text-white font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                  : 'bg-[#090e24] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="font-orbitron text-sm">DAY 0{day}</div>
              <div className="text-[10px] opacity-80 mt-0.5">{dayDates[day].split('//')[1]}</div>
            </button>
          ))}
        </div>

        {/* Timeline Stream */}
        <div className="mt-10 relative">
          {/* Vertical Glowing Timeline Line */}
          <div className="absolute top-0 bottom-0 left-4 sm:left-6 w-0.5 bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500 opacity-40" />

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {filteredSchedule.map((item, idx) => {
                const isBookmarked = item.eventId ? bookmarks.includes(item.eventId) : false;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 0.25, delay: idx * 0.05 }}
                    className="relative pl-12 sm:pl-16"
                  >
                    {/* Node on Timeline */}
                    <div className="absolute left-2.5 sm:left-4.5 top-5 -translate-x-1/2 w-4 h-4 rounded-full bg-[#050713] border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_10px_#06b6d4]">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
                    </div>

                    {/* Timeline Item Card */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-[#090e24]/80 border border-slate-800 hover:border-cyan-500/40 backdrop-blur-md transition-all duration-300 group">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                            <span className="flex items-center gap-1 text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
                              <Clock className="w-3 h-3" />
                              {item.time}
                            </span>

                            <span className="flex items-center gap-1 text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                              <MapPin className="w-3 h-3 text-pink-400" />
                              {item.location}
                            </span>

                            {item.isLive && (
                              <span className="flex items-center gap-1 text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 animate-pulse font-bold">
                                <Radio className="w-3 h-3" />
                                LIVE BROADCAST
                              </span>
                            )}
                          </div>

                          <h3 className="font-orbitron font-bold text-lg sm:text-xl text-slate-100 group-hover:text-cyan-300 transition-colors">
                            {item.title}
                          </h3>

                          {item.speaker && (
                            <div className="text-xs font-mono text-purple-300 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                              <span>Keynote Speaker: <strong className="text-white">{item.speaker}</strong></span>
                            </div>
                          )}

                          <p className="text-xs sm:text-sm text-slate-400 font-space leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {/* Quick Bookmark Action if associated with an event */}
                        {item.eventId && (
                          <div className="sm:self-center">
                            <button
                              onClick={() => {
                                const added = onToggleBookmark(item.eventId!);
                                sound.playClick();
                                if (added) {
                                  showToast('Timeline Event Saved', `${item.title} bookmarked!`, 'success');
                                } else {
                                  showToast('Bookmark Removed', `${item.title} removed from schedule.`, 'info');
                                }
                              }}
                              className={`p-2.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                                isBookmarked
                                  ? 'bg-pink-950/80 border-pink-500 text-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.3)]'
                                  : 'bg-[#06091a] border-slate-700 text-slate-400 hover:text-cyan-300 hover:border-cyan-400'
                              }`}
                            >
                              {isBookmarked ? (
                                <>
                                  <BookmarkCheck className="w-4 h-4 text-pink-400" />
                                  <span className="hidden sm:inline">BOOKMARKED</span>
                                </>
                              ) : (
                                <>
                                  <Bookmark className="w-4 h-4" />
                                  <span className="hidden sm:inline">BOOKMARK</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredSchedule.length === 0 && (
              <div className="pl-12 text-center py-12 bg-[#090e24] rounded-xl border border-dashed border-slate-800">
                <Filter className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="font-mono text-xs text-slate-400">
                  No bookmarked events found for Day 0{selectedDay}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
