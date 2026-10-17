import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Bookmark, BookmarkCheck, Trophy, Users, Calendar, ArrowRight, Eye, Sparkles } from 'lucide-react';
import type { EventCategory, EventItem } from '../../types';
import { MOCK_EVENTS } from '../../data/mockData';
import { TiltCard } from '../3d/TiltCard';
import { EventQuickViewModal } from './EventQuickViewModal';
import { sound } from '../../utils/audio';
import { useToast } from '../ui/Toast';

interface EventUniverseProps {
  bookmarks: string[];
  onToggleBookmark: (eventId: string) => boolean;
  onRegister: (category?: EventCategory) => void;
}

const CATEGORIES: { id: EventCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'ALL SECTORS', icon: '🌌' },
  { id: 'hackathon', label: 'HACKATHONS', icon: '💻' },
  { id: 'robotics', label: 'ROBOTICS', icon: '🤖' },
  { id: 'esports', label: 'CYBER ESPORTS', icon: '🎮' },
  { id: 'coding', label: 'SPEED CODING', icon: '⚡' },
  { id: 'ai-quantum', label: 'AI & QUANTUM', icon: '🔮' },
];

export const EventUniverse: React.FC<EventUniverseProps> = ({
  bookmarks,
  onToggleBookmark,
  onRegister,
}) => {
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const filteredEvents = useMemo(() => {
    return MOCK_EVENTS.filter((evt) => {
      const matchesCategory = selectedCategory === 'all' || evt.category === selectedCategory;
      const matchesSearch =
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        evt.venue.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleBookmarkClick = (e: React.MouseEvent, event: EventItem) => {
    e.stopPropagation();
    const wasAdded = onToggleBookmark(event.id);
    sound.playClick();
    if (wasAdded) {
      showToast('Event Bookmarked', `${event.title} added to your personal schedule!`, 'success');
    } else {
      showToast('Event Removed', `${event.title} removed from bookmarks.`, 'info');
    }
  };

  return (
    <section id="events" className="relative py-24 bg-[#050713] text-slate-100 overflow-hidden">
      {/* Background Cyber Glow & Grid Lines */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-widest uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>/// 02 — INTERACTIVE EVENT UNIVERSE</span>
            </div>
            <h2 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase">
              CHOOSE YOUR <span className="bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">BATTLEGROUND</span>
            </h2>
            <p className="mt-2 text-slate-400 font-space text-sm sm:text-base max-w-xl">
              From continuous AGI hackathons and combat robotics to high-stakes esports and quantum circuit sprints.
            </p>
          </div>

          {/* Quick Counter */}
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-[#090e24] border border-cyan-500/30 text-cyan-300">
              <span className="font-orbitron font-bold text-lg mr-1 text-white">{filteredEvents.length}</span>
              SECTORS ACTIVE
            </div>
            <div className="p-3 rounded-xl bg-[#090e24] border border-pink-500/30 text-pink-300">
              <span className="font-orbitron font-bold text-lg mr-1 text-white">{bookmarks.length}</span>
              BOOKMARKED
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none font-mono text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  sound.playHover();
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'bg-[#080d22] border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[280px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search sectors, technologies, prizes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#080d22] border border-slate-800 focus:border-cyan-400 focus:outline-none text-xs font-mono text-slate-100 placeholder-slate-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs font-mono"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>

        {/* Events Grid */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredEvents.map((event) => {
              const isBookmarked = bookmarks.includes(event.id);
              return (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <TiltCard
                    glowColor={event.category === 'hackathon' ? 'cyan' : event.category === 'robotics' ? 'magenta' : 'purple'}
                    className="h-full flex flex-col group cursor-pointer"
                    onClick={() => {
                      setSelectedEvent(event);
                      sound.playClick();
                    }}
                  >
                    {/* Event Image Banner */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f24] via-transparent to-transparent opacity-90" />

                      {/* Category Badge & Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase bg-black/70 backdrop-blur-md border border-cyan-500/40 text-cyan-300">
                          {event.categoryLabel}
                        </span>

                        {/* Bookmark Button */}
                        <button
                          onClick={(e) => handleBookmarkClick(e, event)}
                          title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Event'}
                          className={`p-2 rounded-lg backdrop-blur-md transition-all cursor-pointer ${
                            isBookmarked
                              ? 'bg-pink-600/80 text-white shadow-[0_0_10px_#ec4899]'
                              : 'bg-black/60 text-slate-400 hover:text-white border border-slate-700/80 hover:border-cyan-400'
                          }`}
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="w-4 h-4 text-white" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Difficulty & Slots Badge */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono z-20">
                        <span className="text-slate-300 bg-black/60 px-2 py-0.5 rounded border border-slate-700">
                          {event.difficulty}
                        </span>
                        <span className="text-emerald-400 font-bold bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/40">
                          {event.slotsRemaining} SLOTS LEFT
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-orbitron font-bold text-lg text-slate-100 group-hover:text-cyan-300 transition-colors">
                          {event.title}
                        </h3>
                        <p className="mt-2 text-xs text-slate-400 font-space line-clamp-2 leading-relaxed">
                          {event.tagline}
                        </p>
                      </div>

                      {/* Details Strip */}
                      <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2.5 text-xs font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-amber-400" />
                            BOUNTY
                          </span>
                          <span className="font-orbitron font-bold text-cyan-300">
                            {event.prizes.total}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-pink-400" />
                            TEAM
                          </span>
                          <span className="text-slate-300">{event.teamSize}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-purple-400" />
                            TIMELINE
                          </span>
                          <span className="text-slate-300">{event.date}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {event.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Quick View CTA */}
                      <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setSelectedEvent(event);
                            sound.playClick();
                          }}
                          className="text-xs font-mono font-bold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>QUICK VIEW</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRegister(event.category);
                            sound.playSuccess();
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-950/80 hover:bg-cyan-500 text-cyan-300 hover:text-black border border-cyan-500/40 hover:border-cyan-400 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>REGISTER</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty Search State */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-16 bg-[#080d22] rounded-2xl border border-dashed border-slate-800 max-w-lg mx-auto mt-8 p-8">
            <Filter className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="font-orbitron text-lg font-bold text-slate-300">NO SECTORS LOCATED</h3>
            <p className="text-xs text-slate-500 font-mono mt-1">
              No battlegrounds match &quot;{searchQuery}&quot; in category &quot;{selectedCategory}&quot;.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                sound.playClick();
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-cyan-500 text-black text-xs font-mono font-bold cursor-pointer"
            >
              RESET SCAN FILTERS
            </button>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      <EventQuickViewModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        isBookmarked={selectedEvent ? bookmarks.includes(selectedEvent.id) : false}
        onToggleBookmark={(id) => onToggleBookmark(id)}
        onRegister={(cat) => onRegister(cat)}
      />
    </section>
  );
};
