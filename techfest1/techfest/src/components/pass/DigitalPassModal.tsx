import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { X, Sparkles, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import type { EventCategory, GeneratedPass, RegistrationData } from '../../types';
import { DigitalPassCard } from './DigitalPassCard';
import { sound } from '../../utils/audio';
import { useToast } from '../ui/Toast';

interface DigitalPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedPass: GeneratedPass | null;
  onSavePass: (pass: GeneratedPass) => void;
  onClearPass: () => void;
  defaultCategory?: EventCategory;
  registeredEvents: string[];
}

export const DigitalPassModal: React.FC<DigitalPassModalProps> = ({
  isOpen,
  onClose,
  savedPass,
  onSavePass,
  onClearPass,
  defaultCategory = 'hackathon',
  registeredEvents
}) => {
  const { showToast } = useToast();

  const [formData, setFormData] = useState<RegistrationData>({
    fullName: '',
    email: '',
    university: '',
    github: '',
    discord: '',
    track: defaultCategory,
    teamName: '',
    teamSize: 'Squad (3-4)',
    experience: 'Undergrad'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultCategory) {
      setFormData(prev => ({ ...prev, track: defaultCategory }));
    }
  }, [defaultCategory]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Operative full name must be at least 3 characters.';
    }

    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Valid institutional or personal email required.';
    }

    if (!formData.university.trim() || formData.university.trim().length < 2) {
      newErrors.university = 'University or organization name is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#00f0ff', '#ff007f', '#a855f7', '#38bdf8', '#fbbf24']
      });
    } catch {
      // Ignore
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();

    if (!validateForm()) {
      sound.playGlitch();
      showToast('Validation Failed', 'Please verify your credentials in the form.', 'warning');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const newPass: GeneratedPass = {
        passId: `SYN-${randomSuffix}-Ω`,
        participant: formData,
        issueDate: new Date().toISOString(),
        qrCodeUrl: '',
        clearanceLevel: 'ALPHA OPERATIVE // TIER 1',
        registeredEvents: registeredEvents.length > 0 ? registeredEvents : ['evt-edge-agi']
      };

      onSavePass(newPass);
      setIsSubmitting(false);
      sound.playSuccess();
      triggerConfetti();
      showToast('Pass Minted!', 'Your holographic digital pass has been activated.', 'success');
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-xl rounded-2xl bg-[#090e24] border border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.25)] overflow-hidden z-10 my-8 flex flex-col"
        >
          {/* Top Gradient Stripe */}
          <div className="h-1.5 w-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />

          {/* Close button */}
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-black/60 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-8">
            {savedPass ? (
              // Display Minted Pass Card
              <div>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-xs font-mono font-bold mb-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>CREDENTIALS ENCRYPTED & PERSISTED</span>
                  </div>
                  <h3 className="font-orbitron font-extrabold text-2xl text-slate-100">
                    YOUR HOLO-PASS IS READY
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Present this pass at physical or metaverse checkpoints.
                  </p>
                </div>

                <DigitalPassCard
                  pass={savedPass}
                  onReset={() => {
                    onClearPass();
                  }}
                />
              </div>
            ) : (
              // Registration Form
              <div>
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold tracking-widest uppercase mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>03 — DIGITAL PASS MINTING</span>
                  </div>
                  <h3 className="font-orbitron text-2xl font-black text-slate-100">
                    REGISTER OPERATIVE
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Generate your authenticated 3D holographic festival pass and unique ID.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
                  {/* Full Name */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      FULL OPERATIVE NAME *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Maya Chen"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#06091b] border border-slate-700 focus:border-cyan-400 focus:outline-none text-slate-100 placeholder-slate-500 transition-colors"
                    />
                    {errors.fullName && (
                      <p className="text-pink-400 text-[11px] mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email & University */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        INSTITUTION EMAIL *
                      </label>
                      <input
                        type="email"
                        placeholder="mchen@stanford.edu"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06091b] border border-slate-700 focus:border-cyan-400 focus:outline-none text-slate-100 placeholder-slate-500 transition-colors"
                      />
                      {errors.email && (
                        <p className="text-pink-400 text-[11px] mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        UNIVERSITY / LAB *
                      </label>
                      <input
                        type="text"
                        placeholder="Stanford / MIT / IIT"
                        value={formData.university}
                        onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06091b] border border-slate-700 focus:border-cyan-400 focus:outline-none text-slate-100 placeholder-slate-500 transition-colors"
                      />
                      {errors.university && (
                        <p className="text-pink-400 text-[11px] mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.university}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Track & Team Size */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        PRIMARY SECTOR TRACK *
                      </label>
                      <select
                        value={formData.track}
                        onChange={(e) => setFormData({ ...formData, track: e.target.value as EventCategory })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06091b] border border-slate-700 focus:border-cyan-400 focus:outline-none text-slate-100 cursor-pointer"
                      >
                        <option value="hackathon">Hackathon // Turing City AGI</option>
                        <option value="robotics">Robotics // CyberSwarm Bots</option>
                        <option value="esports">Esports // Valorant Matrix</option>
                        <option value="coding">Coding // Singularity Speed Duel</option>
                        <option value="ai-quantum">Deep Tech // Quantum Protocol</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        SQUAD FORMATION *
                      </label>
                      <select
                        value={formData.teamSize}
                        onChange={(e) => setFormData({ ...formData, teamSize: e.target.value as RegistrationData['teamSize'] })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06091b] border border-slate-700 focus:border-cyan-400 focus:outline-none text-slate-100 cursor-pointer"
                      >
                        <option value="Solo">Solo Operative</option>
                        <option value="Duo (2)">Duo (2 Operatives)</option>
                        <option value="Squad (3-4)">Squad (3-4 Operatives)</option>
                      </select>
                    </div>
                  </div>

                  {/* Optional GitHub & Discord */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        GITHUB / PORTFOLIO
                      </label>
                      <input
                        type="text"
                        placeholder="github.com/operative"
                        value={formData.github}
                        onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06091b] border border-slate-700 focus:border-cyan-400 focus:outline-none text-slate-100 placeholder-slate-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        DISCORD HANDLE
                      </label>
                      <input
                        type="text"
                        placeholder="cyber_hacker#0001"
                        value={formData.discord}
                        onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#06091b] border border-slate-700 focus:border-cyan-400 focus:outline-none text-slate-100 placeholder-slate-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-pink-400 text-black font-mono font-bold tracking-wider uppercase text-sm shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:shadow-[0_0_35px_rgba(236,72,153,0.7)] transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span>SYNTHESIZING PROTOCOL PASS...</span>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-black" />
                          <span>CONFIRM & GENERATE DIGITAL PASS</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
