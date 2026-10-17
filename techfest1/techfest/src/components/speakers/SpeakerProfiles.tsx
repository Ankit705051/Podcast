import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ExternalLink } from 'lucide-react';
import { MOCK_SPEAKERS } from '../../data/mockData';
import { TiltCard } from '../3d/TiltCard';
import { sound } from '../../utils/audio';

export const SpeakerProfiles: React.FC = () => {
  return (
    <section id="speakers" className="relative py-24 bg-[#050713] text-slate-100 overflow-hidden border-t border-slate-800">
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs tracking-widest uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>/// 06 — QUANTUM KEYNOTE OPERATIVES</span>
          </div>
          <h2 className="font-orbitron text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase">
            SYNAPSE <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">VISIONARIES</span>
          </h2>
          <p className="mt-3 text-slate-400 font-space text-sm sm:text-base">
            Frontier researchers in autonomous AGI agents, cryo-quantum processors, combat robotics, and neuro-spatial interfaces.
          </p>
        </div>

        {/* Speakers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_SPEAKERS.map((speaker, idx) => (
            <motion.div
              key={speaker.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <TiltCard
                glowColor={idx % 2 === 0 ? 'cyan' : 'magenta'}
                className="h-full flex flex-col justify-between p-5 group"
              >
                <div>
                  {/* Holographic Avatar Box */}
                  <div className="relative h-60 w-full rounded-xl overflow-hidden mb-4 bg-slate-900 border border-slate-700">
                    <img
                      src={speaker.avatar}
                      alt={speaker.name}
                      className="w-full h-full object-cover object-center filter grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f24] via-transparent to-transparent opacity-80" />
                    
                    {/* Corner Cyber Mark */}
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/70 border border-cyan-500/40 text-[9px] font-mono text-cyan-300">
                      KEYNOTE
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 text-[10px] font-mono text-pink-400 bg-black/60 px-2 py-0.5 rounded">
                      {speaker.time}
                    </div>
                  </div>

                  {/* Speaker Info */}
                  <h3 className="font-orbitron font-bold text-lg text-slate-100 group-hover:text-cyan-300 transition-colors">
                    {speaker.name}
                  </h3>
                  <div className="text-xs font-mono text-cyan-400 font-semibold mt-0.5">
                    {speaker.role}
                  </div>
                  <div className="text-xs font-mono text-slate-500 mb-3">
                    {speaker.organization}
                  </div>

                  {/* Keynote Topic Box */}
                  <div className="p-3 rounded-lg bg-[#070b1e] border border-cyan-500/20 text-xs font-mono text-slate-300 mb-3">
                    <div className="text-[10px] text-pink-400 font-bold mb-1">KEYNOTE TOPIC:</div>
                    <div className="leading-snug">{speaker.topic}</div>
                  </div>

                  <p className="text-xs text-slate-400 font-space line-clamp-3 leading-relaxed">
                    {speaker.bio}
                  </p>
                </div>

                {/* Social Links */}
                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {speaker.social.github && (
                      <a
                        href={speaker.social.github}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => sound.playHover()}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-cyan-400 transition-colors"
                        title="GitHub Profile"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                      </a>
                    )}
                    {speaker.social.twitter && (
                      <a
                        href={speaker.social.twitter}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => sound.playHover()}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-400 transition-colors"
                        title="X / Twitter"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </a>
                    )}
                    {speaker.social.linkedin && (
                      <a
                        href={speaker.social.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => sound.playHover()}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-purple-400 hover:border-purple-400 transition-colors"
                        title="LinkedIn"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </a>
                    )}
                  </div>

                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <span>SPEAKER PASS</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
