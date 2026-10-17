import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Radio,
  FastForward,
  Cpu,
  ShieldAlert,
  Orbit,
  Activity,
} from 'lucide-react';
import { sound } from '../../utils/audio';

interface QuantumTransitSequencerProps {
  isWarping: boolean;
  targetSector: string;
  onFastForward?: () => void;
}

const PHASES = [
  'ESTABLISHING EXTRATERRESTRIAL UPLINK...',
  'UNKNOWN LIFEFORM DETECTED // SCANNING...',
  'ROBOTIC CORE ONLINE // WEAPONS DISENGAGED...',
  'DIMENSIONAL BREACH AUTHORIZED...',
  'SECTOR BREACHED // INITIATING LANDING...',
];

export const QuantumTransitSequencer: React.FC<
  QuantumTransitSequencerProps
> = ({ isWarping, targetSector, onFastForward }) => {
  const [percent, setPercent] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (!isWarping) {
      setPercent(0);
      setPhaseIndex(0);
      return;
    }

    sound.playWarp();

    const progressTimer = window.setInterval(() => {
      setPercent((previous) => Math.min(previous + 1, 100));
    }, 30);

    const phaseTimers = PHASES.map((_, index) =>
      window.setTimeout(() => setPhaseIndex(index), index * 600)
    );

    return () => {
      window.clearInterval(progressTimer);
      phaseTimers.forEach(window.clearTimeout);
    };
  }, [isWarping]);

  useEffect(() => {
    if (!isWarping || !onFastForward) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.code === 'Enter') {
        event.preventDefault();
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
          key="alien-transit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.08, filter: 'blur(12px)' }}
          transition={{ duration: 0.35 }}
          onClick={onFastForward}
          className="fixed inset-0 z-[100] overflow-hidden bg-[#02040a] text-cyan-100 cursor-pointer select-none"
          role="dialog"
          aria-label={`Quantum transit to ${targetSector}`}
          aria-live="polite"
        >
          {}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(11,57,78,0.42)_0%,rgba(3,7,18,0.92)_48%,#010208_100%)]" />

          {}
          <div className="absolute inset-0 opacity-50 transit-stars" />

          {}
          <div className="absolute inset-0 flex items-center justify-center">
            {[280, 410, 550, 700].map((size, index) => (
              <motion.div
                key={size}
                className="absolute rounded-full border"
                style={{
                  width: size,
                  height: size,
                  borderColor:
                    index % 2 === 0
                      ? 'rgba(34,211,238,0.28)'
                      : 'rgba(192,38,211,0.25)',
                }}
                animate={{
                  rotate: index % 2 === 0 ? 360 : -360,
                  scale: [0.96, 1.035, 0.96],
                }}
                transition={{
                  rotate: {
                    duration: 12 + index * 4,
                    repeat: Infinity,
                    ease: 'linear',
                  },
                  scale: {
                    duration: 3 + index,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  },
                }}
              >
                <div
                  className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    background: index % 2 === 0 ? '#22d3ee' : '#e879f9',
                    boxShadow: '0 0 14px currentColor',
                  }}
                />
              </motion.div>
            ))}
          </div>

          {}
          <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2">
            {}
            <motion.div
              className="relative flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80"
              animate={{ rotate: 360 }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <svg
                viewBox="0 0 320 320"
                className="absolute inset-0 h-full w-full"
                fill="none"
              >
                <defs>
                  <linearGradient id="alien-metal" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#67e8f9" />
                    <stop offset="45%" stopColor="#164e63" />
                    <stop offset="75%" stopColor="#d946ef" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>

                <circle
                  cx="160"
                  cy="160"
                  r="145"
                  stroke="url(#alien-metal)"
                  strokeWidth="2"
                  strokeDasharray="58 13 8 13"
                />
                <circle
                  cx="160"
                  cy="160"
                  r="130"
                  stroke="#22d3ee"
                  strokeOpacity=".5"
                  strokeWidth="1"
                  strokeDasharray="3 8"
                />

                {Array.from({ length: 12 }).map((_, index) => (
                  <path
                    key={index}
                    d="M160 11 L160 35"
                    stroke="#67e8f9"
                    strokeWidth="3"
                    strokeOpacity={index % 3 === 0 ? 1 : 0.35}
                    transform={`rotate(${index * 30} 160 160)`}
                  />
                ))}

                <path
                  d="M160 40 L175 55 L160 70 L145 55 Z"
                  fill="#22d3ee"
                  fillOpacity=".7"
                />
                <path
                  d="M160 250 L175 265 L160 280 L145 265 Z"
                  fill="#e879f9"
                  fillOpacity=".7"
                />
              </svg>

              {}
              <motion.div
                className="absolute inset-[15%] rounded-full border-2 border-fuchsia-400/70"
                style={{
                  boxShadow:
                    'inset 0 0 30px rgba(217,70,239,.12), 0 0 24px rgba(217,70,239,.2)',
                  borderStyle: 'dashed',
                }}
                animate={{ rotate: -360 }}
                transition={{
                  duration: 9,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </motion.div>

            {}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="relative flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40"
                animate={{
                  scale: [0.94, 1.06, 0.94],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-2xl" />

                <svg viewBox="0 0 180 120" className="relative w-full">
                  <defs>
                    <linearGradient id="eye-gradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#a5f3fc" />
                      <stop offset="50%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#c026d3" />
                    </linearGradient>
                    <radialGradient id="eye-pupil">
                      <stop offset="0%" stopColor="#f0fdff" />
                      <stop offset="20%" stopColor="#22d3ee" />
                      <stop offset="75%" stopColor="#075985" />
                      <stop offset="100%" stopColor="#020617" />
                    </radialGradient>
                  </defs>

                  <path
                    d="M10 60 Q90 -5 170 60 Q90 125 10 60Z"
                    fill="#061827"
                    stroke="url(#eye-gradient)"
                    strokeWidth="3"
                  />
                  <path
                    d="M24 60 Q90 10 156 60 Q90 110 24 60Z"
                    fill="#0e7490"
                    fillOpacity=".28"
                  />
                  <circle
                    cx="90"
                    cy="60"
                    r="29"
                    fill="url(#eye-pupil)"
                    stroke="#67e8f9"
                    strokeWidth="2"
                  />
                  <ellipse
                    cx="90"
                    cy="60"
                    rx="8"
                    ry="22"
                    fill="#020617"
                    stroke="#a5f3fc"
                    strokeWidth="1.5"
                  />
                  <circle cx="95" cy="51" r="5" fill="white" />
                  <path
                    d="M48 60 L35 60 M132 60 L145 60"
                    stroke="#f0abfc"
                    strokeWidth="2"
                  />
                </svg>

                <motion.div
                  className="absolute inset-x-0 h-px bg-cyan-200 shadow-[0_0_12px_#22d3ee]"
                  animate={{ top: ['18%', '82%', '18%'] }}
                  transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </motion.div>
            </div>
          </div>

          {}
          <motion.div
            className="absolute inset-x-0 h-24 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, transparent, rgba(34,211,238,.07), rgba(34,211,238,.16), transparent)',
            }}
            animate={{ top: ['-20%', '120%'] }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {}
          <div className="absolute inset-5 sm:inset-10 pointer-events-none">
            <div className="absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-cyan-400/70" />
            <div className="absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-cyan-400/70" />
            <div className="absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-cyan-400/70" />
            <div className="absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-cyan-400/70" />
          </div>

          {}
          <div className="absolute left-7 right-7 top-7 flex items-center justify-between gap-3 font-mono text-[9px] tracking-[0.18em] sm:left-12 sm:right-12 sm:top-10 sm:text-[10px]">
            <div className="flex items-center gap-2 text-cyan-300">
              <Activity className="h-4 w-4 animate-pulse" />
              <span>EXO-CORE</span>
            </div>
            <div className="hidden items-center gap-2 text-slate-500 sm:flex">
              <span>VOID ENGINE v.07</span>
              <span className="text-cyan-400">●</span>
              <span>LINK ENCRYPTED</span>
            </div>
            <div className="flex items-center gap-2 text-fuchsia-300">
              <Radio className="h-4 w-4 animate-pulse" />
              <span>ALIEN SIGNAL</span>
            </div>
          </div>

          {}
          <div className="absolute inset-x-4 bottom-12 flex justify-center sm:bottom-14">
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-full max-w-xl border border-cyan-400/35 bg-[#030915]/90 p-5 shadow-[0_0_70px_rgba(6,182,212,0.12)] backdrop-blur-xl sm:p-7"
              style={{
                clipPath:
                  'polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))',
              }}
            >
              {}
              <div className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-fuchsia-400" />

              <div className="mb-4 flex items-center justify-between border-b border-cyan-500/20 pb-3">
                <span className="flex items-center gap-2 font-mono text-[9px] tracking-[0.18em] text-cyan-300 sm:text-[10px]">
                  <Cpu className="h-4 w-4" />
                  TRANSIT CONTROL SYSTEM
                </span>
                <span className="flex items-center gap-1 font-mono text-[9px] text-fuchsia-300">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  DIMENSIONAL EVENT
                </span>
              </div>

              <div className="text-center">
                <motion.div
                  key={phaseIndex}
                  initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  className="mb-2 font-mono text-[10px] tracking-[0.24em] text-cyan-400"
                >
                  {PHASES[phaseIndex]}
                </motion.div>

                <h2 className="font-orbitron text-3xl font-black uppercase tracking-wider text-white drop-shadow-[0_0_18px_rgba(34,211,238,.55)] sm:text-5xl">
                  {targetSector}
                </h2>

                <div className="mt-2 flex items-center justify-center gap-2 font-mono text-[10px] text-slate-500">
                  <Orbit className="h-3.5 w-3.5 text-fuchsia-400" />
                  DESTINATION LOCKED
                  <span className="text-cyan-400">SECTOR BREACH</span>
                </div>
              </div>

              {}
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between font-mono text-[10px]">
                  <span className="text-slate-500">
                    WARP REACTOR CHARGE
                  </span>
                  <span className="text-cyan-300">
                    {String(percent).padStart(3, '0')}%
                  </span>
                </div>

                <div className="flex gap-1">
                  {Array.from({ length: 32 }).map((_, index) => (
                    <motion.div
                      key={index}
                      className="h-2 flex-1"
                      animate={{
                        opacity: index < percent / 3.125 ? 1 : 0.15,
                        backgroundColor:
                          index < percent / 3.125
                            ? index > 25
                              ? '#e879f9'
                              : '#22d3ee'
                            : '#164e63',
                        boxShadow:
                          index < percent / 3.125
                            ? '0 0 8px rgba(34,211,238,.5)'
                            : 'none',
                      }}
                      transition={{ duration: 0.12 }}
                    />
                  ))}
                </div>
              </div>

              {}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-3 font-mono text-[9px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-yellow-400" />
                  REACTOR: {percent < 35 ? 'CHARGING' : percent < 75 ? 'OVERDRIVE' : 'CRITICAL'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Radio className="h-3.5 w-3.5 text-cyan-400" />
                  SIGNAL: {Math.max(0, 100 - Math.floor(percent / 2))}%
                </span>
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <FastForward className="h-3.5 w-3.5" />
                  CLICK / SPACE TO BREACH
                </span>
              </div>
            </motion.div>
          </div>

          {}
          <div className="pointer-events-none absolute left-8 top-1/3 hidden font-mono text-[9px] leading-6 text-cyan-500/60 sm:block">
            <div>⌬ 0x7FA2</div>
            <div>⌘ SIGNAL</div>
            <div>◈ TRACKING</div>
            <div>⌬ UNKNOWN</div>
          </div>

          <div className="pointer-events-none absolute right-8 top-1/3 hidden text-right font-mono text-[9px] leading-6 text-fuchsia-400/60 sm:block">
            <div>ENTITY_07</div>
            <div>THREAT: UNKNOWN</div>
            <div>GATE: OPENING</div>
            <div>REALITY: UNSTABLE</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};