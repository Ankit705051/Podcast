import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, X, Send } from 'lucide-react';
import { sound } from '../../utils/audio';
import { useToast } from '../ui/Toast';
import type { PageTab } from '../../types';

interface CommandTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: PageTab) => void;
  onOpenPass: () => void;
  onToggleSound: () => void;
  onToggleScanlines: () => void;
}

interface CommandLog {
  id: string;
  type: 'system' | 'user' | 'error' | 'success';
  text: string;
}

export const CommandTerminal: React.FC<CommandTerminalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenPass,
  onToggleSound,
  onToggleScanlines
}) => {
  const { showToast } = useToast();
  const [inputVal, setInputVal] = useState('');
  const [logs, setLogs] = useState<CommandLog[]>([
    { id: '1', type: 'system', text: '/// SYNAPSE OS v4.2.0-STABLE INITIALIZED' },
    { id: '2', type: 'system', text: 'Type "help" to display operational directives or click quick commands below.' }
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Keyboard shortcut listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const executeCommand = (cmd: string) => {
    const clean = cmd.trim().toLowerCase();
    if (!clean) return;

    sound.playClick();

    // Add user input to log
    setLogs(prev => [...prev, { id: Math.random().toString(), type: 'user', text: `> ${cmd}` }]);
    setInputVal('');

    setTimeout(() => {
      if (clean === 'help') {
        setLogs(prev => [
          ...prev,
          {
            id: Math.random().toString(),
            type: 'system',
            text: `AVAILABLE DIRECTIVES:
  • home           — Warp to festival command hero
  • about          — Warp to campus radar & genesis archives
  • events         — Warp to interactive sector universe
  • workshops      — Warp to neural & hardware masterclasses
  • sponsors       — Warp to frontier ecosystem partners & bounties
  • team           — Warp to council architects & security dossiers
  • register       — Mint or view your personalized CyberPass
  • scanlines      — Toggle CRT retro scanline overlay
  • audio          — Toggle sound synthesizer SFX
  • telemetry      — Display node status and active hackers
  • matrix         — Engage synaptic neural bypass
  • clear          — Purge terminal log buffer
  • exit           — Terminate terminal session`
          }
        ]);
      } else if (clean === 'home') {
        onClose();
        onNavigateTab('home');
      } else if (clean === 'about' || clean === 'lore') {
        onClose();
        onNavigateTab('about');
      } else if (clean === 'events' || clean === 'sectors') {
        onClose();
        onNavigateTab('events');
      } else if (clean === 'workshops' || clean === 'labs') {
        onClose();
        onNavigateTab('workshops');
      } else if (clean === 'sponsors' || clean === 'bounties') {
        onClose();
        onNavigateTab('sponsors');
      } else if (clean === 'team' || clean === 'council') {
        onClose();
        onNavigateTab('team');
      } else if (clean === 'register' || clean === 'pass') {
        onClose();
        onOpenPass();
      } else if (clean === 'scanlines') {
        onToggleScanlines();
        setLogs(prev => [...prev, { id: Math.random().toString(), type: 'success', text: 'Scanlines toggled.' }]);
      } else if (clean === 'audio') {
        onToggleSound();
        setLogs(prev => [...prev, { id: Math.random().toString(), type: 'success', text: 'Audio synthesizer toggled.' }]);
      } else if (clean === 'telemetry' || clean === 'status') {
        setLogs(prev => [
          ...prev,
          {
            id: Math.random().toString(),
            type: 'system',
            text: `TELEMETRY STATUS:
  - NODES ONLINE: 12 / 12
  - LATENCY: 12ms to Sector 07 QPU
  - ACTIVE HACKERS: 1,280 operatives connected
  - PRIZE ESCROW: $75,000 verified in smart contract`
          }
        ]);
      } else if (clean === 'matrix' || clean === 'hack') {
        sound.playSuccess();
        showToast('Neural Matrix Overclocked', 'System bandwidth operating at 100% capacity!', 'success');
        setLogs(prev => [
          ...prev,
          {
            id: Math.random().toString(),
            type: 'success',
            text: 'ACCESS GRANTED: WELCOME TO THE EDGE OF ARTIFICIAL GENERAL INTELLIGENCE.'
          }
        ]);
      } else if (clean === 'clear') {
        setLogs([]);
      } else if (clean === 'exit') {
        onClose();
      } else {
        sound.playGlitch();
        setLogs(prev => [
          ...prev,
          { id: Math.random().toString(), type: 'error', text: `Directive not recognized: "${clean}". Type "help" for syntax.` }
        ]);
      }
    }, 150);
  };

  const quickDirectives = ['help', 'about', 'events', 'workshops', 'sponsors', 'team', 'register', 'matrix'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Terminal Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl rounded-2xl bg-[#060919] border border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden z-10 flex flex-col font-mono text-xs"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#090e24] border-b border-cyan-500/30">
            <div className="flex items-center gap-2">
              <TerminalIcon className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-slate-200">SYNAPSE TERMINAL COMMAND PROMPT</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500">[ESC to Close]</span>
              <button
                onClick={onClose}
                className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Terminal Output Area */}
          <div className="h-72 overflow-y-auto p-4 space-y-2 bg-[#050714] text-slate-300">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`whitespace-pre-wrap leading-relaxed ${
                  log.type === 'user' ? 'text-cyan-400 font-bold' :
                  log.type === 'error' ? 'text-pink-400' :
                  log.type === 'success' ? 'text-emerald-400 font-semibold' :
                  'text-slate-300'
                }`}
              >
                {log.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick Click Directives */}
          <div className="px-4 py-2 bg-[#080d22] border-t border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px]">
            <span className="text-slate-500">QUICK:</span>
            {quickDirectives.map((d) => (
              <button
                key={d}
                onClick={() => executeCommand(d)}
                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 hover:border-cyan-400 transition-colors cursor-pointer"
              >
                {d}
              </button>
            ))}
          </div>

          {/* Terminal Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeCommand(inputVal);
            }}
            className="flex items-center gap-2 p-3 bg-[#090e24] border-t border-slate-800"
          >
            <span className="text-cyan-400 font-bold pl-2">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              placeholder="Enter directive (e.g. workshops, sponsors, team, help)..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-xs"
            />
            <button
              type="submit"
              className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold cursor-pointer transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
