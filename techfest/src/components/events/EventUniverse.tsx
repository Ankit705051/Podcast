import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  Trophy,
  Users,
  Calendar,
  ArrowRight,
  Eye,
  Sparkles,
  MapPin,
  Radio,
} from 'lucide-react';
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
      const matchesCategory =
        selectedCategory === 'all' || evt.category === selectedCategory;

      const matchesSearch =
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        evt.venue.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleBookmarkClick = (e: React.MouseEvent, event: EventItem) => {
    e.stopPropagation();

    const wasAdded = onToggleBookmark(event.id);
    sound.playClick();

    if (wasAdded) {
      showToast(
        'Event Bookmarked',
        `${event.title} added to your personal schedule!`,
        'success'
      );
    } else {
      showToast(
        'Event Removed',
        `${event.title} removed from bookmarks.`,
        'info'
      );
    }
  };

  return (
    <section
      id="events"
      className="relative py-24 bg-transparent text-slate-100 overflow-hidden"
    >
      {}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-widest uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span></span>
            </div>

            <h2 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase">
              CHOOSE YOUR{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent">
                BATTLEGROUND
              </span>
            </h2>

            <p className="mt-2 text-slate-400 font-space text-sm sm:text-base max-w-xl">
              From continuous AGI hackathons and combat robotics to high-stakes
              esports and quantum circuit sprints.
            </p>
          </div>

          {}
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-[#090e24] border border-cyan-500/30 text-cyan-300">
              <span className="font-orbitron font-bold text-lg mr-1 text-white">
                {filteredEvents.length}
              </span>
              SECTORS ACTIVE
            </div>

            <div className="p-3 rounded-xl bg-[#090e24] border border-pink-500/30 text-pink-300">
              <span className="font-orbitron font-bold text-lg mr-1 text-white">
                {bookmarks.length}
              </span>
              BOOKMARKED
            </div>
          </div>
        </div>

        {}
        <div className="mt-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {}
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

          {}
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

        {}
        <div className="event-editorial-grid mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
          <AnimatePresence>
            {filteredEvents.map((event, index) => {
              const isBookmarked = bookmarks.includes(event.id);
              const isFeatured = index === 0;

              return (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={
                    isFeatured
                      ? 'md:col-span-2 lg:col-span-6 lg:row-span-2'
                      : 'lg:col-span-3'
                  }
                >
                  <TiltCard
                    glowColor={
                      event.category === 'hackathon'
                        ? 'cyan'
                        : event.category === 'robotics'
                          ? 'magenta'
                          : 'purple'
                    }
                    contentInteractions
                    maxTilt={6}
                    className={`event-mission-card h-full min-h-[320px] flex flex-col group cursor-pointer ${
                      isFeatured ? 'lg:min-h-[510px]' : 'lg:min-h-[247px]'
                    }`}
                    onClick={() => {
                      setSelectedEvent(event);
                    }}
                  >
                    <div className="absolute inset-0 overflow-hidden bg-slate-950">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="event-mission-card__image h-full w-full object-cover"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-[#030711] via-[#030711]/15 to-[#030711]/15" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#030711]/65 via-transparent to-transparent" />
                      <div
                        className="event-mission-card__scan"
                        aria-hidden="true"
                      />
                      <div
                        className="event-mission-card__ufo"
                        aria-hidden="true"
                      >
                        <span />
                      </div>
                    </div>

                    <div className="relative z-20 flex h-full min-h-[320px] flex-col justify-between p-5 sm:p-6 lg:min-h-0">
                      <div className="flex items-start justify-between gap-3">
                        <span className="inline-flex items-center gap-2 border border-cyan-300/35 bg-[#06111d]/80 px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-cyan-100 backdrop-blur-sm">
                          <Radio className="h-3 w-3 text-cyan-300" />
                          {event.categoryLabel}
                        </span>

                        <button
                          onClick={(e) => handleBookmarkClick(e, event)}
                          title={
                            isBookmarked
                              ? 'Remove Bookmark'
                              : 'Bookmark Event'
                          }
                          aria-label={
                            isBookmarked
                              ? `Remove ${event.title} bookmark`
                              : `Bookmark ${event.title}`
                          }
                          className={`p-2 transition-all cursor-pointer border ${
                            isBookmarked
                              ? 'bg-pink-600/80 text-white shadow-[0_0_10px_#ec4899] border-pink-300'
                              : 'bg-black/70 text-slate-300 border-white/20 hover:text-white hover:border-cyan-300'
                          }`}
                        >
                          {isBookmarked ? (
                            <BookmarkCheck className="w-4 h-4 text-white" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      <div className="max-w-2xl">
                        <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em]">
                          <span className="inline-flex items-center gap-1.5 text-cyan-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_9px_#67e8f9]" />
                            {event.difficulty}
                          </span>

                          <span className="text-white/35">/</span>

                          <span className="text-rose-300">
                            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-rose-500" />
                            {event.slotsRemaining} SLOTS LEFT
                          </span>

                          {isFeatured && (
                            <span className="border border-rose-400/35 bg-rose-950/60 px-2 py-1 text-rose-200">
                              PRIORITY MISSION
                            </span>
                          )}
                        </div>

                        <h3
                          className={`font-orbitron font-black leading-tight text-white transition-colors group-hover:text-cyan-100 ${
                            isFeatured
                              ? 'text-2xl sm:text-3xl lg:text-4xl'
                              : 'text-xl lg:text-2xl'
                          }`}
                        >
                          {event.title}
                        </h3>

                        <p
                          className={`mt-2 text-sm text-slate-200/85 font-space leading-relaxed ${
                            isFeatured ? 'max-w-xl' : 'line-clamp-2'
                          }`}
                        >
                          {event.tagline}
                        </p>

                        <div className="event-mission-card__intel mt-4 grid grid-cols-2 gap-x-6 gap-y-2 border-l border-cyan-300/40 pl-3 text-[11px] font-mono text-slate-200 sm:grid-cols-3">
                          <span className="flex items-center gap-1.5">
                            <Trophy className="h-3.5 w-3.5 text-cyan-300" />
                            {event.prizes.total}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-cyan-300" />
                            {event.teamSize}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-cyan-300" />
                            {event.date}
                          </span>

                          <span className="col-span-2 flex items-center gap-1.5 sm:col-span-3">
                            <MapPin className="h-3.5 w-3.5 text-cyan-300" />
                            {event.venue}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div className="hidden flex-wrap gap-1.5 sm:flex">
                          {event.tags
                            .slice(0, isFeatured ? 3 : 2)
                            .map((tag) => (
                              <span
                                key={tag}
                                className="border border-white/15 bg-black/40 px-2 py-1 text-[9px] font-mono text-slate-200"
                              >
                                {tag}
                              </span>
                            ))}
                        </div>

                        <div className="ml-auto flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(event);
                              sound.playClick();
                            }}
                            className="inline-flex items-center gap-1.5 border border-cyan-300/60 bg-cyan-950/70 px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-100 transition-colors hover:bg-cyan-400 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            EXPLORE SECTOR
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRegister(event.category);
                              sound.playSuccess();
                            }}
                            className="inline-flex items-center gap-1 border border-rose-400/60 bg-rose-950/75 px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-rose-100 transition-colors hover:bg-rose-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-200"
                            aria-label={`Register for ${event.title}`}
                          >
                            <span>INITIATE MISSION</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {}
        {filteredEvents.length === 0 && (
          <div className="text-center py-16 bg-[#080d22] rounded-2xl border border-dashed border-slate-800 max-w-lg mx-auto mt-8 p-8">
            <Filter className="w-10 h-10 text-slate-600 mx-auto mb-3" />

            <h3 className="font-orbitron text-lg font-bold text-slate-300">
              NO SECTORS LOCATED
            </h3>

            <p className="text-xs text-slate-500 font-mono mt-1">
              No battlegrounds match &quot;{searchQuery}&quot; in category
              &quot;{selectedCategory}&quot;.
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

      {}
      <EventQuickViewModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        isBookmarked={
          selectedEvent ? bookmarks.includes(selectedEvent.id) : false
        }
        onToggleBookmark={(id) => onToggleBookmark(id)}
        onRegister={(cat) => onRegister(cat)}
      />
    </section>
  );
};