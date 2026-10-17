import { useState, useEffect } from 'react';
import type { GeneratedPass } from '../types';
import { sound } from '../utils/audio';

const STORAGE_KEYS = {
  BOOKMARKS: 'synapse_fest_bookmarks_v1',
  DIGITAL_PASS: 'synapse_fest_pass_v1',
  SOUND_MUTED: 'synapse_fest_sound_muted_v1',
  SCANLINES: 'synapse_fest_scanlines_v1',
};

export function useStorage() {
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return stored ? JSON.parse(stored) : ['evt-edge-agi'];
    } catch {
      return ['evt-edge-agi'];
    }
  });

  const [digitalPass, setDigitalPass] = useState<GeneratedPass | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DIGITAL_PASS);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [soundMuted, setSoundMuted] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SOUND_MUTED);
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  const [scanlines, setScanlines] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SCANLINES);
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    sound.setMuted(soundMuted);
  }, [soundMuted]);

  const toggleBookmark = (eventId: string): boolean => {
    setBookmarks(prev => {
      const exists = prev.includes(eventId);
      const updated = exists ? prev.filter(id => id !== eventId) : [...prev, eventId];
      try {
        localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
    return !bookmarks.includes(eventId);
  };

  const savePass = (pass: GeneratedPass) => {
    setDigitalPass(pass);
    try {
      localStorage.setItem(STORAGE_KEYS.DIGITAL_PASS, JSON.stringify(pass));
    } catch {
      // Ignore
    }
  };

  const clearPass = () => {
    setDigitalPass(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.DIGITAL_PASS);
    } catch {
      // Ignore
    }
  };

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    sound.setMuted(next);
    try {
      localStorage.setItem(STORAGE_KEYS.SOUND_MUTED, JSON.stringify(next));
    } catch {
      // Ignore
    }
  };

  const toggleScanlines = () => {
    const next = !scanlines;
    setScanlines(next);
    try {
      localStorage.setItem(STORAGE_KEYS.SCANLINES, JSON.stringify(next));
    } catch {
      // Ignore
    }
  };

  return {
    bookmarks,
    toggleBookmark,
    digitalPass,
    savePass,
    clearPass,
    soundMuted,
    toggleSound,
    scanlines,
    toggleScanlines
  };
}
