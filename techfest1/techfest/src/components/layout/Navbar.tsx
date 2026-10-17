import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Monitor, Terminal, Ticket, Menu, X } from 'lucide-react';
import { sound } from '../../utils/audio';
import type { PageTab } from '../../types';

interface NavbarProps {
  currentTab: PageTab;
  onSelectTab: (tab: PageTab) => void;
  onOpenPass: () => void;
  onOpenTerminal: () => void;
  soundMuted: boolean;
  onToggleSound: () => void;
  scanlines: boolean;
  onToggleScanlines: () => void;
  hasPass: boolean;
  bookmarkCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenPass,
  onOpenTerminal,
  soundMuted,
  onToggleSound,
  scanlines,
  onToggleScanlines,
  hasPass,
  bookmarkCount
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navTabs: { id: PageTab; label: string }[] = [
    { id: 'home', label: '// HOME' },
    { id: 'about', label: '// ABOUT' },
    { id: 'events', label: '// EVENTS' },
    { id: 'workshops', label: '// WORKSHOPS' },
    { id: 'leaderboard', label: '// LEADERBOARD' },
    { id: 'schedule', label: '// TIMELINE' },
    { id: 'sponsors', label: '// SPONSORS' },
    { id: 'team', label: '// TEAM' },
  ];

  const handleTabClick = (tab: PageTab) => {
    setMobileMenuOpen(false);
    onSelectTab(tab);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#050713]/90 backdrop-blur-md border-b border-cyan-500/20 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.7)]'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand / Logo */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleTabClick('home');
          }}
          className="flex items-center gap-3 group cursor-pointer"
        >
          <div className="relative w-9 h-9 rounded-lg bg-linear-to-tr from-cyan-500 via-purple-600 to-pink-500 p-[1.5px] shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <img
              src="../../public/assets/download.jpeg"
              alt="techFest logo"
              className="w-full h-full rounded-[7px] object-cover group-hover:scale-110 transition-transform"
            />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-orbitron font-extrabold tracking-wider text-base sm:text-lg bg-gradient-to-r from-cyan-400 via-purple-300 to-pink-400 bg-clip-text text-transparent group-hover:neon-glow-cyan transition-all">
                techFest
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/50 text-cyan-300">
                2026
              </span>
            </div>
            <span className="text-[9px] font-mono tracking-widest text-slate-400">
              QUANTUM MATRIX // PROTOCOL
            </span>
          </div>
        </a>

        {/* Desktop Nav Tabs with Glowing Active Pill */}
        <nav className="hidden lg:flex items-center gap-2 p-1 rounded-xl bg-[#080d24]/70 border border-slate-800/80 backdrop-blur-md text-xs font-mono tracking-wider">
          {navTabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                onMouseEnter={() => sound.playHover()}
                className={`relative px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'text-cyan-300 bg-cyan-950/80 border border-cyan-500/50 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right Controls & Pass Button */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Audio Synthesizer Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              sound.playClick();
            }}
            title={soundMuted ? 'Unmute Audio & Sci-Fi SFX' : 'Mute Audio & Sci-Fi SFX'}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              soundMuted
                ? 'border-slate-800 text-slate-500 hover:text-slate-300'
                : 'border-cyan-500/40 text-cyan-400 bg-cyan-950/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
            }`}
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* CRT Scanline Toggle */}
          <button
            onClick={() => {
              onToggleScanlines();
              sound.playClick();
            }}
            title={scanlines ? 'Disable CRT Scanlines' : 'Enable CRT Cyber Scanlines'}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              scanlines
                ? 'border-pink-500/50 text-pink-400 bg-pink-950/30 shadow-[0_0_10px_rgba(236,72,153,0.3)]'
                : 'border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>

          {/* Terminal Command Palette (Ctrl+K) */}
          <button
            onClick={() => {
              onOpenTerminal();
              sound.playClick();
            }}
            title="Open Cyber Terminal [Ctrl + K]"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-600 bg-[#090e24] text-[11px] font-mono text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>TERMINAL</span>
            <kbd className="text-[9px] bg-slate-800/80 px-1 py-0.5 rounded border border-slate-700 text-slate-400">
              ^K
            </kbd>
          </button>

          {/* Digital Pass Button */}
          <button
            onClick={() => {
              onOpenPass();
              sound.playSuccess();
            }}
            onMouseEnter={() => sound.playHover()}
            className={`relative group flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold tracking-wider transition-all duration-300 overflow-hidden cursor-pointer ${
              hasPass
                ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-gradient-to-r from-cyan-500 to-pink-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)]'
            }`}
          >
            <Ticket className={`w-4 h-4 ${hasPass ? 'text-emerald-400' : 'text-black'}`} />
            <span>{hasPass ? 'VIEW MY PASS' : 'GET ACCESS PASS'}</span>
            {bookmarkCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-black/40 text-cyan-300 text-[10px] flex items-center justify-center font-bold">
                {bookmarkCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => {
              onOpenPass();
              sound.playClick();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-500 text-black text-xs font-mono font-bold"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>PASS</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              sound.playClick();
            }}
            className="p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-cyan-400 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#06091a]/95 backdrop-blur-xl border-b border-cyan-500/20 px-4 py-6 mt-3 space-y-4 font-mono text-sm">
          <div className="flex flex-col space-y-2">
            {navTabs.map((tab) => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`text-left py-2 px-3 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'text-cyan-300 bg-cyan-950/80 font-bold border border-cyan-500/40'
                      : 'text-slate-300 hover:text-cyan-400'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleSound}
                className="p-2 rounded border border-slate-700 text-slate-300"
              >
                {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              </button>
              <button
                onClick={onToggleScanlines}
                className="p-2 rounded border border-slate-700 text-slate-300"
              >
                <Monitor className={`w-4 h-4 ${scanlines ? 'text-pink-400' : ''}`} />
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTerminal();
                }}
                className="p-2 rounded border border-slate-700 text-slate-300"
              >
                <Terminal className="w-4 h-4 text-cyan-400" />
              </button>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPass();
              }}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-pink-500 text-black font-bold text-xs"
            >
              {hasPass ? 'VIEW MY PASS' : 'REGISTER NOW'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
