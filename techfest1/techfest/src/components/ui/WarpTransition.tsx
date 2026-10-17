import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Compass } from 'lucide-react';

interface WarpTransitionProps {
  isWarping: boolean;
  targetSector: string;
}

export const WarpTransition: React.FC<WarpTransitionProps> = ({ isWarping, targetSector }) => {
  return (
    <AnimatePresence>
      {isWarping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center overflow-hidden bg-[#030612]/90 backdrop-blur-xl"
        >
          {/* Radial Hyperspace Tunnel Lines */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[800px] h-[800px] rounded-full border border-cyan-400/40 animate-ping opacity-75" />
            <div className="absolute w-[600px] h-[600px] rounded-full border border-pink-500/40 animate-ping opacity-60 [animation-delay:150ms]" />
            <div className="absolute w-[400px] h-[400px] rounded-full border border-purple-500/50 animate-ping opacity-50 [animation-delay:300ms]" />
            <div className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_60px_#00f0ff,0_0_120px_#ec4899] animate-pulse" />
          </div>

          {/* Central Warp Readout Card */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.15, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 px-8 py-6 rounded-2xl bg-[#070b1e]/90 border border-cyan-400/60 shadow-[0_0_50px_rgba(6,182,212,0.4)] text-center max-w-sm w-full mx-4"
          >
            <div className="flex items-center justify-center gap-2 text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase mb-2">
              <Zap className="w-4 h-4 text-cyan-300 animate-bounce" />
              <span>HYPERSPACE WARP ENGAGED</span>
            </div>

            <h3 className="font-orbitron font-black text-2xl text-slate-100 uppercase tracking-wider">
              {targetSector}
            </h3>

            {/* High-speed progress line */}
            <div className="mt-4 h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
                className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 rounded-full"
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Compass className="w-3 h-3 text-pink-400" />
                SECTOR TRANSIT
              </span>
              <span className="text-emerald-400 font-bold">TELEPORTING...</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
