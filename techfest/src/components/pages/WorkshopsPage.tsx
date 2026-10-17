import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Clock, Calendar, MapPin, Users, CheckCircle2, Ticket, Cpu, ChevronDown, Check } from 'lucide-react';
import { MOCK_WORKSHOPS } from '../../data/mockData';
import { TiltCard } from '../3d/TiltCard';
import { sound } from '../../utils/audio';
import { useToast } from '../ui/Toast';
import type { WorkshopItem } from '../../types';


export const WorkshopsPage: React.FC = () => {
  const { showToast } = useToast();
  const [workshops, setWorkshops] = useState<WorkshopItem[]>(MOCK_WORKSHOPS);
  const [reservedWorkshops, setReservedWorkshops] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('synapse_reserved_workshops');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [expandedSyllabus, setExpandedSyllabus] = useState<string | null>(null);

  const handleReserveSeat = (workshop: WorkshopItem) => {
    const isAlreadyReserved = reservedWorkshops.includes(workshop.id);

    if (isAlreadyReserved) {
      
      sound.playClick();
      const updated = reservedWorkshops.filter(id => id !== workshop.id);
      setReservedWorkshops(updated);
      localStorage.setItem('synapse_reserved_workshops', JSON.stringify(updated));

      
      setWorkshops(prev =>
        prev.map(w => (w.id === workshop.id ? { ...w, seatsRemaining: w.seatsRemaining + 1 } : w))
      );
      showToast('Reservation Cancelled', `Seat released for ${workshop.title}`, 'info');
      return;
    }

    if (workshop.seatsRemaining <= 0) {
      sound.playGlitch();
      showToast('Terminal Fully Booked', 'All hardware workstations for this masterclass are reserved.', 'warning');
      return;
    }

    
    sound.playSeatReserved();
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#a855f7', '#ec4899', '#10b981']
      });
    } catch {
      
    }

    const updated = [...reservedWorkshops, workshop.id];
    setReservedWorkshops(updated);
    localStorage.setItem('synapse_reserved_workshops', JSON.stringify(updated));

    
    setWorkshops(prev =>
      prev.map(w => (w.id === workshop.id ? { ...w, seatsRemaining: Math.max(0, w.seatsRemaining - 1) } : w))
    );

    showToast('Workstation Assigned!', `Terminal reserved for ${workshop.title}. Added to pass!`, 'success');
  };

  const toggleSyllabus = (id: string) => {
    sound.playHover();
    setExpandedSyllabus(expandedSyllabus === id ? null : id);
  };

  return (
    <div className="relative min-h-screen">
   <main className="relative z-10 pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {}
      <div className="text-center max-w-3xl mx-auto">
       
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-mono mb-4"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span></span>
        </motion.div>

        <h1 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-black uppercase text-slate-100">
          NEURAL &amp; HARDWARE <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">LABS</span>
        </h1>
        <p className="mt-4 text-slate-400 font-space text-sm sm:text-base leading-relaxed">
          Intensive 3 to 4-hour hands-on build sessions led by keynote researchers. 
          Hardware kits, cloud QPU compute allocations, and take-home electronics provided to all confirmed terminal holders.
        </p>

        {}
        <div className="mt-6 inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-[#090f28] border border-cyan-500/30 text-xs font-mono">
          <Ticket className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300">YOUR RESERVED WORKSTATIONS:</span>
          <span className="font-bold text-cyan-300 font-orbitron">{reservedWorkshops.length} / {workshops.length}</span>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {workshops.map((workshop) => {
          const isReserved = reservedWorkshops.includes(workshop.id);
          const isSyllabusOpen = expandedSyllabus === workshop.id;

          return (
            <motion.div
              key={workshop.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TiltCard
                glowColor={isReserved ? 'magenta' : 'cyan'}
                className="h-full flex flex-col justify-between p-6 sm:p-7"
              >
                <div className="space-y-4">
                  {}
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="px-2.5 py-1 rounded bg-black/60 border border-purple-500/40 text-purple-300 font-bold">
                      {workshop.sector}
                    </span>
                    <span className="text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      LEVEL: {workshop.level}
                    </span>
                  </div>

                  {}
                  <div>
                    <h2 className="font-orbitron font-bold text-xl sm:text-2xl text-slate-100 leading-tight">
                      {workshop.title}
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-cyan-300 font-space">
                      {workshop.tagline}
                    </p>
                  </div>

                  {}
                  <div className="p-3.5 rounded-xl bg-[#06091a] border border-slate-800 flex items-center gap-3">
                    <img
                      src={workshop.instructorAvatar}
                      alt={workshop.instructor}
                      className="w-12 h-12 rounded-lg object-cover border border-cyan-500/40"
                    />
                    <div>
                      <div className="font-orbitron font-bold text-sm text-slate-100">
                        {workshop.instructor}
                      </div>
                      <div className="text-xs font-mono text-slate-400">
                        {workshop.instructorRole}
                      </div>
                    </div>
                  </div>

                  {}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-xs">
                    <div className="p-2.5 rounded-lg bg-[#070b1e] border border-slate-800">
                      <div className="text-slate-500 flex items-center gap-1 text-[10px]">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        DURATION
                      </div>
                      <div className="text-slate-200 font-semibold mt-0.5">{workshop.duration}</div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#070b1e] border border-slate-800">
                      <div className="text-slate-500 flex items-center gap-1 text-[10px]">
                        <Calendar className="w-3 h-3 text-pink-400" />
                        SCHEDULE
                      </div>
                      <div className="text-slate-200 font-semibold mt-0.5">{workshop.date}</div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#070b1e] border border-slate-800 col-span-2 sm:col-span-1">
                      <div className="text-slate-500 flex items-center gap-1 text-[10px]">
                        <Users className="w-3 h-3 text-emerald-400" />
                        CAPACITY
                      </div>
                      <div className="text-emerald-400 font-bold mt-0.5">
                        {workshop.seatsRemaining} / {workshop.capacity} SEATS
                      </div>
                    </div>
                  </div>

                  {}
                  <div className="p-3 rounded-lg bg-[#09102c] border border-cyan-500/20 text-xs font-mono flex items-start gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-cyan-300 font-bold">HARDWARE / COMPUTE ALLOCATED: </span>
                      <span className="text-slate-300">{workshop.hardwareKit}</span>
                    </div>
                  </div>

                  {}
                  <div>
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">
                      PREREQUISITES:
                    </div>
                    <ul className="space-y-1 text-xs font-mono text-slate-300">
                      {workshop.prerequisites.map((req, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-cyan-400" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {}
                  <div>
                    <button
                      onClick={() => toggleSyllabus(workshop.id)}
                      className="w-full flex items-center justify-between py-2 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer border-t border-slate-800/80 pt-3"
                    >
                      <span className="font-bold">VIEW 4-STEP SYLLABUS DIRECTIVES</span>
                      <ChevronDown
                        className={`w-4 h-4 text-cyan-400 transition-transform ${
                          isSyllabusOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isSyllabusOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2 mt-2 pt-2 border-t border-slate-800 text-xs font-mono"
                      >
                        {workshop.syllabus.map((s) => (
                          <div key={s.step} className="p-2.5 rounded bg-[#060a1d] border border-slate-800/80">
                            <div className="flex items-center gap-2 text-cyan-300 font-bold">
                              <span>[{s.step}]</span>
                              <span>{s.title}</span>
                            </div>
                            <div className="text-slate-400 text-[11px] mt-1 font-space">{s.desc}</div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </div>

                {}
                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
                  <div className="text-xs font-mono">
                    <div className="text-slate-500 text-[10px]">VENUE LOCATION</div>
                    <div className="text-slate-300 flex items-center gap-1 font-semibold truncate">
                      <MapPin className="w-3 h-3 text-pink-400 shrink-0" />
                      <span>{workshop.venue}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleReserveSeat(workshop)}
                    className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                      isReserved
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                        : 'bg-gradient-to-r from-cyan-400 to-purple-600 text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]'
                    }`}
                  >
                    {isReserved ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-black" />
                        <span>WORKSTATION SECURED</span>
                      </>
                    ) : (
                      <>
                        <Ticket className="w-4 h-4" />
                        <span>RESERVE TERMINAL SEAT</span>
                      </>
                    )}
                  </button>
                </div>
              </TiltCard>
            </motion.div>
          );
        })}
      </div>
    </main>
    </div>
  );
};
