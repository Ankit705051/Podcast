import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus, Play, Pause, Zap, Award, Search } from 'lucide-react';
import type { LeaderboardTeam } from '../../types';
import { MOCK_LEADERBOARD } from '../../data/mockData';
import { sound } from '../../utils/audio';
import { useToast } from '../ui/Toast';

type LeaderboardCategory = 'hackathon' | 'robotics' | 'esports' | 'coding';

export const LeaderboardSection: React.FC = () => {
  const { showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>('hackathon');
  const [teams, setTeams] = useState<LeaderboardTeam[]>(MOCK_LEADERBOARD);
  const [isSimulating, setIsSimulating] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Live simulation tick to randomly add points and update rank indicators!
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setTeams(prevTeams => {
        // Pick a random team from the active category
        const currentCatTeams = prevTeams.filter(t => t.category === activeCategory);
        if (currentCatTeams.length === 0) return prevTeams;

        const randomTeam = currentCatTeams[Math.floor(Math.random() * currentCatTeams.length)];
        const pointBoost = Math.floor(10 + Math.random() * 25);

        sound.playHover();

        const updatedTeams = prevTeams.map(team => {
          if (team.id === randomTeam.id) {
            const newScore = Math.min(team.maxScore, team.score + pointBoost);
            return {
              ...team,
              score: newScore,
              solved: team.solved + 1,
              prevRank: team.rank
            };
          }
          return team;
        });

        // Re-sort within category to recalculate ranks
        const sortedCategory = updatedTeams
          .filter(t => t.category === activeCategory)
          .sort((a, b) => b.score - a.score);

        const rankMap = new Map<string, number>();
        sortedCategory.forEach((t, idx) => {
          rankMap.set(t.id, idx + 1);
        });

        return updatedTeams.map(t => {
          if (t.category === activeCategory) {
            return {
              ...t,
              prevRank: t.rank,
              rank: rankMap.get(t.id) || t.rank
            };
          }
          return t;
        });
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [isSimulating, activeCategory]);

  const categoryTeams = teams
    .filter(t => t.category === activeCategory)
    .filter(t => 
      t.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
      t.university.toLowerCase().includes(searchFilter.toLowerCase())
    )
    .sort((a, b) => a.rank - b.rank);

  const toggleSimulation = () => {
    const nextState = !isSimulating;
    setIsSimulating(nextState);
    sound.playClick();
    if (nextState) {
      showToast('Live Matrix Scoring Engaged', 'Real-time points feed & telemetry active!', 'success');
    } else {
      showToast('Scoring Paused', 'Simulation paused at current standings.', 'info');
    }
  };

  return (
    <section id="leaderboard" className="relative py-24 bg-[#050713] text-slate-100 overflow-hidden">
      {/* Background Neon ambient blobs */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-pink-400 font-mono text-xs tracking-widest uppercase mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>/// 04 — COMPETITION MATRIX LEADERBOARD</span>
            </div>
            <h2 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase">
              LIVE SQUAD <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">STANDINGS</span>
            </h2>
            <p className="mt-2 text-slate-400 font-space text-sm sm:text-base max-w-xl">
              Live algorithmic scoring telemetry across 64 collegiate squads fighting for the Golden Tickets.
            </p>
          </div>

          {/* Live Simulation Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSimulation}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                isSimulating
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                  : 'bg-[#080d22] border-slate-700 text-slate-300 hover:border-cyan-400 hover:text-cyan-300'
              }`}
            >
              {isSimulating ? (
                <>
                  <Pause className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>SIMULATION ACTIVE</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-cyan-400" />
                  <span>SIMULATE LIVE SCORING</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Category Selector Tabs & Filter */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {(['hackathon', 'robotics', 'esports', 'coding'] as LeaderboardCategory[]).map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  sound.playHover();
                }}
                className={`px-4 py-2 rounded-xl uppercase font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                    : 'bg-[#090e24] border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat === 'hackathon' && '💻 HACKATHON MATRIX'}
                {cat === 'robotics' && '🤖 ROBO-WARS'}
                {cat === 'esports' && '🎮 CYBER ESPORTS'}
                {cat === 'coding' && '⚡ SPEED CODING'}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search team or university..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-[#080d22] border border-slate-800 focus:border-cyan-400 focus:outline-none text-xs text-slate-200 placeholder-slate-500 w-full sm:w-64"
            />
          </div>
        </div>

        {/* Leaderboard Table / Cards */}
        <div className="mt-8 space-y-3">
          <AnimatePresence>
            {categoryTeams.map((team) => {
              const rankDelta = team.prevRank - team.rank;
              const isTop3 = team.rank <= 3;
              const percent = Math.round((team.score / team.maxScore) * 100);

              return (
                <motion.div
                  key={team.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`relative overflow-hidden rounded-xl border p-4 sm:p-5 transition-all duration-300 ${
                    team.rank === 1
                      ? 'bg-gradient-to-r from-[#17122b] to-[#0a1226] border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                      : team.rank === 2
                      ? 'bg-[#0a0f26] border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : team.rank === 3
                      ? 'bg-[#0a0f26] border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.1)]'
                      : 'bg-[#080d22] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Rank & Team Identity */}
                    <div className="flex items-center gap-4">
                      {/* Rank Badge */}
                      <div className="flex flex-col items-center justify-center w-10 sm:w-12">
                        {team.rank === 1 ? (
                          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-amber-400" />
                          </div>
                        ) : team.rank === 2 ? (
                          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
                            <Award className="w-5 h-5 text-cyan-300" />
                          </div>
                        ) : team.rank === 3 ? (
                          <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-400 flex items-center justify-center">
                            <Award className="w-5 h-5 text-pink-400" />
                          </div>
                        ) : (
                          <span className="font-orbitron font-bold text-slate-400 text-lg">
                            #{team.rank}
                          </span>
                        )}

                        {/* Rank Delta Indicator */}
                        <div className="mt-1 flex items-center text-[10px] font-mono">
                          {rankDelta > 0 ? (
                            <span className="text-emerald-400 flex items-center">
                              <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> +{rankDelta}
                            </span>
                          ) : rankDelta < 0 ? (
                            <span className="text-rose-400 flex items-center">
                              <TrendingDown className="w-2.5 h-2.5 mr-0.5" /> {rankDelta}
                            </span>
                          ) : (
                            <span className="text-slate-500 flex items-center">
                              <Minus className="w-2.5 h-2.5" /> 0
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Team Avatar & Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#060919] border border-slate-700 flex items-center justify-center text-xl shadow-inner">
                          {team.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-orbitron font-bold text-sm sm:text-base text-slate-100">
                              {team.name}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 border border-slate-700 text-slate-300 uppercase">
                              {team.badge}
                            </span>
                          </div>
                          <div className="text-xs font-mono text-cyan-400 mt-0.5">
                            {team.university}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Score Bar & Telemetry Stats */}
                    <div className="flex-1 max-w-md sm:mx-6">
                      <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                        <span className="text-slate-400">SCORE: {team.score} / {team.maxScore} PTS</span>
                        <span className={`font-orbitron font-bold ${isTop3 ? 'text-cyan-300' : 'text-slate-300'}`}>
                          {percent}%
                        </span>
                      </div>
                      
                      {/* Animated Score Progress Bar */}
                      <div className="h-2 w-full bg-[#050818] rounded-full overflow-hidden border border-slate-800">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${percent}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                      </div>
                    </div>

                    {/* Solved Tasks & Win Streak */}
                    <div className="flex items-center gap-4 text-xs font-mono justify-end">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500">SOLVED</div>
                        <div className="text-slate-200 font-bold">{team.solved} TASKS</div>
                      </div>

                      {team.winStreak && (
                        <div className="text-right">
                          <div className="text-[10px] text-slate-500">STREAK</div>
                          <div className="text-pink-400 font-bold flex items-center gap-0.5 justify-end">
                            <span>🔥 {team.winStreak}W</span>
                          </div>
                        </div>
                      )}

                      <div className="pl-2">
                        <span className={`w-2.5 h-2.5 rounded-full inline-block ${
                          team.status === 'online' ? 'bg-emerald-400 animate-pulse' :
                          team.status === 'deploying' ? 'bg-cyan-400 animate-spin' :
                          'bg-amber-400'
                        }`} title={`Status: ${team.status}`} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
