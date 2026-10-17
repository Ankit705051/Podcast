import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Radio, FastForward } from 'lucide-react';
import { sound } from '../../utils/audio';

interface QuantumTransitSequencerProps {
  isWarping: boolean;
  targetSector: string;
  onFastForward?: () => void;
}

export const QuantumTransitSequencer: React.FC<QuantumTransitSequencerProps> = ({
  isWarping,
  targetSector,
  onFastForward
}) => {
  const [percent, setPercent] = useState(0);
  const [phaseText, setPhaseText] = useState('LOCKING SPATIAL COORDINATES...');

  useEffect(() => {
    if (!isWarping) {
      setPercent(0);
      return;
    }

    sound.playWarp();

    // Progress percentage ticks
    const interval = setInterval(() => {
      setPercent(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const next = prev + Math.floor(18 + Math.random() * 24);
        return Math.min(100, next);
      });
    }, 60);

    const t1 = setTimeout(() => {
      setPhaseText('SYNCHRONIZING NEURAL LATTICE WITH SECTOR...');
    }, 200);

    const t2 = setTimeout(() => {
      setPhaseText('QUANTUM CONDUIT STABILIZED // ENTERING SECTOR...');
    }, 450);

    return () => {
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isWarping]);

  // Spacebar skip listener
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isWarping && onFastForward) {
        e.preventDefault();
        onFastForward();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isWarping, onFastForward]);

  return (
    <AnimatePresence>
      {isWarping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.25 }}
          onClick={onFastForward}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#030614]/95 backdrop-blur-2xl cursor-pointer select-none"
        >
          {/* Scanlines & Holographic Noise Grid */}
          <div className="absolute inset-0 scanlines opacity-50 pointer-events-none" />
          <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

          {/* Radiating 3D Quantum Tunnel Shockwaves */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{ scale: [0.1, 1.8, 3.2], opacity: [0.8, 0.4, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeOut' }}
              className="absolute w-96 h-96 rounded-full border-2 border-cyan-400"
            />
            <motion.div
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{ scale: [0.1, 1.6, 2.8], opacity: [0.9, 0.5, 0] }}
              transition={{ duration: 0.8, delay: 0.2, repeat: Infinity, ease: 'easeOut' }}
              className="absolute w-80 h-80 rounded-full border border-pink-500"
            />
            <motion.div
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{ scale: [0.1, 1.4, 2.4], opacity: [0.7, 0.3, 0] }}
              transition={{ duration: 0.8, delay: 0.4, repeat: Infinity, ease: 'easeOut' }}
              className="absolute w-64 h-64 rounded-full border border-purple-400"
            />

            {/* Core Singularity Flare */}
            <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_80px_#00f0ff,0_0_140px_#ec4899] animate-ping" />
          </div>

          {/* Central Holographic HUD Card */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.15, opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 px-8 py-7 rounded-2xl bg-[#070c24]/90 border border-cyan-400/60 shadow-[0_0_60px_rgba(6,182,212,0.45)] text-center max-w-md w-full mx-4"
          >
            {/* Decal top status */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-cyan-500/30 text-[10px] font-mono tracking-widest text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
                <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                QUANTUM JUMP IN PROGRESS
              </span>
              <span className="text-pink-400 font-bold">WARP_STABLE</span>
            </div>

            {/* Target Sector Announcement */}
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-1">
              DESTINATION SECTOR
            </div>
            <h2 className="font-orbitron font-black text-2xl sm:text-3xl text-slate-100 uppercase tracking-wider drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
              {targetSector}
            </h2>

            {/* Live Phase Subtitle */}
            <p className="mt-2 text-xs font-mono text-cyan-300 font-medium">
              &gt; {phaseText}
            </p>

            {/* Percentage & Telemetry Progress Bar */}
            <div className="mt-5 space-y-1.5">
              <div className="flex items-center justify-between font-mono text-xs text-slate-400">
                <span>BUFFER: 0x9FA4C1</span>
                <span className="font-orbitron font-bold text-cyan-300 text-sm">
                  {percent}%
                </span>
              </div>

              <div className="h-2 w-full bg-[#050818] rounded-full overflow-hidden border border-cyan-500/40 p-[1px]">
                <motion.div
                  className="h-full rounded-full bg-linear-to-r from-cyan-400 via-purple-400 to-pink-500 shadow-[0_0_12px_#00f0ff]"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {/* Bottom Telemetry & Fast Forward Notice */}
            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-pink-400" />
                LATENCY: 11ms
              </span>
              <span className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors">
                <FastForward className="w-3 h-3 text-cyan-400" />
                <span>CLICK OR [SPACE] TO ENTER</span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
