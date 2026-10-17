import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shield, Radio, Check, Award, X, ExternalLink } from 'lucide-react';
import { MOCK_TEAM } from '../../data/mockData';
import { TiltCard } from '../3d/TiltCard';
import { sound } from '../../utils/audio';
import { useToast } from '../ui/Toast';
import type { TeamMember } from '../../types';

export const TeamPage: React.FC = () => {
  const { showToast } = useToast();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [pinged, setPinged] = useState(false);

  const handleMemberClick = (member: TeamMember) => {
    sound.playDossierOpen();
    setSelectedMember(member);
    setPinged(false);
  };

  const handlePingMember = (member: TeamMember) => {
    sound.playClick();
    setPinged(true);
    showToast(
      'Encrypted Ping Transmitted',
      `Signal received by ${member.callsign}: "Sector channel online. Standing by."`,
      'success'
    );
  };

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono mb-4"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>/// 10 — FESTIVAL ARCHITECTS &amp; EXECUTIVE COUNCIL</span>
        </motion.div>

        <h1 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-black uppercase text-slate-100">
          THE <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">SYNAPSE COUNCIL</span>
        </h1>
        <p className="mt-4 text-slate-400 font-space text-sm sm:text-base leading-relaxed">
          The collegiate engineers, distributed systems architects, and competitive roboticists orchestrating the 48-hour quantum matrix. Click any operative to access their security dossier.
        </p>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_TEAM.map((member) => (
          <TiltCard
            key={member.id}
            glowColor="cyan"
            className="p-6 cursor-pointer group flex flex-col justify-between"
            onClick={() => handleMemberClick(member)}
          >
            <div>
              {/* Member Avatar with Hologram Overlay */}
              <div className="relative h-64 w-full rounded-xl overflow-hidden mb-4 bg-slate-900 border border-slate-700">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full object-cover object-center filter grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f24] via-transparent to-transparent opacity-80" />

                {/* Clearance Tag */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 border border-cyan-500/40 text-[9px] font-mono text-cyan-300 font-bold flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5 text-cyan-400" />
                  <span>{member.clearance.split('//')[0]}</span>
                </div>

                {/* Callsign */}
                <div className="absolute bottom-3 left-3 text-xs font-mono font-bold text-pink-400 bg-black/70 px-2 py-0.5 rounded border border-pink-500/40">
                  // {member.callsign}
                </div>
              </div>

              {/* Name & Role */}
              <h3 className="font-orbitron font-bold text-xl text-slate-100 group-hover:text-cyan-300 transition-colors">
                {member.name}
              </h3>
              <div className="text-xs font-mono text-cyan-400 font-semibold mt-0.5">
                {member.role}
              </div>
              <div className="text-xs font-mono text-slate-500 mb-3">
                {member.division}
              </div>

              <p className="text-xs text-slate-400 font-space line-clamp-2 leading-relaxed">
                {member.bio}
              </p>
            </div>

            {/* Bottom Card Footer */}
            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between font-mono text-xs text-slate-400">
              <span className="text-[10px] text-cyan-400 flex items-center gap-1 group-hover:underline">
                <span>VIEW DOSSIER</span>
                <ExternalLink className="w-3 h-3" />
              </span>
              <span className="text-[10px] text-slate-500">{member.skills.length} SPECIALIZATIONS</span>
            </div>
          </TiltCard>
        ))}
      </div>

      {/* Operative Security Dossier Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              className="relative w-full max-w-2xl rounded-2xl bg-[#080d24] border border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden z-10 p-6 sm:p-8 space-y-6"
            >
              {/* Header stripe */}
              <div className="h-1.5 -mx-8 -mt-8 mb-6 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />

              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-black/60 border border-slate-700 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Dossier Header Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img
                  src={selectedMember.avatar}
                  alt={selectedMember.name}
                  className="w-20 h-20 rounded-xl object-cover border-2 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                />

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-orbitron font-extrabold text-2xl text-slate-100">
                      {selectedMember.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-950/80 border border-pink-500/50 text-pink-300 font-bold">
                      {selectedMember.callsign}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-cyan-300 font-semibold">
                    {selectedMember.role} — {selectedMember.division}
                  </div>
                  <div className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span>SECURITY CLEARANCE: {selectedMember.clearance}</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="text-xs sm:text-sm text-slate-300 font-space leading-relaxed p-3.5 rounded-xl bg-[#060a1d] border border-slate-800">
                {selectedMember.bio}
              </div>

              {/* Specialization / Radar Skills */}
              <div>
                <div className="text-xs font-mono text-slate-400 tracking-wider uppercase mb-2">
                  /// OPERATIVE SPECIALIZATION METRICS
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  {selectedMember.skills.map((skill) => (
                    <div key={skill.name} className="p-2.5 rounded-lg bg-[#060b1e] border border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-300">{skill.name}</span>
                        <span className="text-cyan-300 font-bold">{skill.level}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.level}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Achievements */}
              <div>
                <div className="text-xs font-mono text-slate-400 tracking-wider uppercase mb-2 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>KEY COUNCIL MILESTONES</span>
                </div>
                <ul className="space-y-1.5 text-xs font-mono text-slate-300">
                  {selectedMember.achievements.map((ach, i) => (
                    <li key={i} className="flex items-start gap-2 p-2 rounded bg-[#060919] border border-slate-800">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{ach}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions: Ping Operative */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs font-mono text-slate-500">
                  DISCORD: <strong className="text-slate-300">{selectedMember.discord}</strong>
                </div>

                <button
                  onClick={() => handlePingMember(selectedMember)}
                  className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                    pinged
                      ? 'bg-emerald-500 text-black shadow-[0_0_15px_#10b981]'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  }`}
                >
                  {pinged ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>PING ACKNOWLEDGED</span>
                    </>
                  ) : (
                    <>
                      <Radio className="w-4 h-4" />
                      <span>PING OPERATIVE</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
