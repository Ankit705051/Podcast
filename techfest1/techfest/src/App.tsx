import React, { useState } from 'react';
import { ToastProvider } from './components/ui/Toast';
import { CursorFollower } from './components/3d/CursorFollower';
import { QuantumTransitSequencer } from './components/ui/QuantumTransitSequencer';
import { Navbar } from './components/layout/Navbar';
import { HomePage } from './components/pages/HomePage';
import { AboutPage } from './components/pages/AboutPage';
import { EventsPage } from './components/pages/EventsPage';
import { WorkshopsPage } from './components/pages/WorkshopsPage';
import { LeaderboardPage } from './components/pages/LeaderboardPage';
import { SchedulePage } from './components/pages/SchedulePage';
import { SponsorsPage } from './components/pages/SponsorsPage';
import { TeamPage } from './components/pages/TeamPage';
import { Footer } from './components/layout/Footer';
import { DigitalPassModal } from './components/pass/DigitalPassModal';
import { CommandTerminal } from './components/terminal/CommandTerminal';
import { useStorage } from './hooks/useStorage';
import { sound } from './utils/audio';
import type { EventCategory, PageTab } from './types';

export const AppContent: React.FC = () => {
  const {
    bookmarks,
    toggleBookmark,
    digitalPass,
    savePass,
    clearPass,
    soundMuted,
    toggleSound,
    scanlines,
    toggleScanlines
  } = useStorage();

  const [currentTab, setCurrentTab] = useState<PageTab>('home');
  const [homeVisit, setHomeVisit] = useState(0);
  const [isWarping, setIsWarping] = useState(false);
  const [warpTarget, setWarpTarget] = useState('HYPERSPACE');

  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [selectedPassCategory, setSelectedPassCategory] = useState<EventCategory>('hackathon');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  // Cinematic Sci-Fi Pre-Page Animated Transit Event
  const handleTabNavigation = (newTab: PageTab) => {
    if (newTab === currentTab) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const sectorLabels: Record<PageTab, string> = {
      home: 'SECTOR // COMMAND NEXUS',
      about: 'SECTOR // LORE & CAMPUS RADAR',
      events: 'SECTOR // BATTLEGROUND DIRECTORY',
      workshops: 'SECTOR // NEURAL MASTERCLASSES',
      leaderboard: 'SECTOR // LIVE MATRIX SCORING',
      schedule: 'SECTOR // 48H TEMPORAL MATRIX',
      sponsors: 'SECTOR // FRONTIER ALLIANCE',
      team: 'SECTOR // COUNCIL ARCHITECTS',
    };

    setWarpTarget(sectorLabels[newTab] || newTab.toUpperCase());
    setIsWarping(true);

    setTimeout(() => {
      if (newTab === 'home') {
        setHomeVisit((visit) => visit + 1);
        sound.playSuccess();
      }
      setCurrentTab(newTab);
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      setTimeout(() => {
        setIsWarping(false);
      }, 350);
    }, 750);
  };

  const handleFastForwardTransit = () => {
    setIsWarping(false);
  };

  const handleOpenPassWithCategory = (category: EventCategory = 'hackathon') => {
    setSelectedPassCategory(category);
    setIsPassModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[#050713] text-slate-100 selection:bg-cyan-500 selection:text-black">
      {/* Ambient holographic background */}
      <div className="hologram-background" aria-hidden="true">
        <div className="hologram-background__glow" />
        <div className="hologram-background__grid" />
        <div className="hologram-background__scan" />
      </div>

      {/* Interactive 3D Cursor Follower */}
      <CursorFollower />

      {/* Cinematic Sci-Fi Quantum Transit Event Overlay */}
      <QuantumTransitSequencer
        isWarping={isWarping}
        targetSector={warpTarget}
        onFastForward={handleFastForwardTransit}
      />

      {/* CRT Scanline Visual Effect Layer */}
      {scanlines && (
        <div className="fixed inset-0 z-50 pointer-events-none scanlines opacity-60" />
      )}

      {/* Futuristic Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={handleTabNavigation}
        onOpenPass={() => handleOpenPassWithCategory()}
        onOpenTerminal={() => setIsTerminalOpen(true)}
        soundMuted={soundMuted}
        onToggleSound={toggleSound}
        scanlines={scanlines}
        onToggleScanlines={toggleScanlines}
        hasPass={!!digitalPass}
        bookmarkCount={bookmarks.length}
      />

      {/* Dedicated Dynamic Page Views (Not dumped all in one page!) */}
      <main className="min-h-screen">
        {currentTab === 'home' && (
          <HomePage
            sceneMode={(['core', 'orb', 'portal'] as const)[homeVisit % 3]}
            onNavigateTab={handleTabNavigation}
            onOpenPass={() => handleOpenPassWithCategory()}
            onOpenTerminal={() => setIsTerminalOpen(true)}
          />
        )}

        {currentTab === 'about' && (
          <AboutPage
            onRegister={() => handleOpenPassWithCategory()}
            onExploreEvents={() => handleTabNavigation('events')}
          />
        )}

        {currentTab === 'events' && (
          <EventsPage
            bookmarks={bookmarks}
            onToggleBookmark={toggleBookmark}
            onRegister={(cat) => handleOpenPassWithCategory(cat || 'hackathon')}
          />
        )}

        {currentTab === 'workshops' && (
          <WorkshopsPage />
        )}

        {currentTab === 'leaderboard' && (
          <LeaderboardPage />
        )}

        {currentTab === 'schedule' && (
          <SchedulePage
            bookmarks={bookmarks}
            onToggleBookmark={toggleBookmark}
          />
        )}

        {currentTab === 'sponsors' && (
          <SponsorsPage />
        )}

        {currentTab === 'team' && (
          <TeamPage />
        )}
      </main>

      {/* Footer & FAQ with Tab Navigation */}
      <Footer onNavigateTab={handleTabNavigation} />

      {/* 03 — Personalized Digital Pass Modal */}
      <DigitalPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        savedPass={digitalPass}
        onSavePass={savePass}
        onClearPass={clearPass}
        defaultCategory={selectedPassCategory}
        registeredEvents={bookmarks}
      />

      {/* Interactive Command Terminal (Ctrl + K) */}
      <CommandTerminal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        onNavigateTab={handleTabNavigation}
        onOpenPass={() => handleOpenPassWithCategory()}
        onToggleSound={toggleSound}
        onToggleScanlines={toggleScanlines}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
