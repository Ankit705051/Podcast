import React, { useRef, useState, useEffect } from 'react';
import QRCode from 'qrcode';
import type { GeneratedPass } from '../../types';
import { Download, Share2, Shield, CheckCircle2, RotateCcw } from 'lucide-react';
import { sound } from '../../utils/audio';
import { useToast } from '../ui/Toast';

interface DigitalPassCardProps {
  pass: GeneratedPass;
  onReset: () => void;
}

export const DigitalPassCard: React.FC<DigitalPassCardProps> = ({ pass, onReset }) => {
  const { showToast } = useToast();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Generate Scannable QR Code
    const verifyPayload = JSON.stringify({
      id: pass.passId,
      name: pass.participant.fullName,
      clearance: pass.clearanceLevel,
      track: pass.participant.track,
      issued: pass.issueDate
    });

    QRCode.toDataURL(verifyPayload, {
      margin: 1,
      width: 180,
      color: {
        dark: '#00f0ff',
        light: '#060819'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR code error', err));
  }, [pass]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    setRotate({
      x: ((y - cy) / cy) * -12,
      y: ((x - cx) / cx) * 12
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  const handleDownload = () => {
    sound.playClick();
    window.print();
    showToast('Pass Printed / Saved', 'Pass print dialog initialized.', 'success');
  };

  const handleShare = () => {
    sound.playClick();
    navigator.clipboard?.writeText(window.location.href);
    showToast('Matrix Link Copied', 'Festival & Pass link copied to clipboard.', 'success');
  };

  return (
    <div className="flex flex-col items-center max-w-md w-full mx-auto">
      {/* 3D Holographic Pass Card */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.15s ease-out'
        }}
        className="relative w-full rounded-2xl p-6 overflow-hidden border border-cyan-400/60 bg-linear-to-br from-[#0c1333] via-[#080d24] to-[#1a0f30] shadow-[0_0_40px_rgba(6,182,212,0.35)] select-none"
      >
        {/* Holographic Shimmer Sheen Layer */}
        <div className="pointer-events-none absolute inset-0 opacity-40 hologram-shimmer" />

        {/* Cyber Watermark Logo Background */}
        <div className="pointer-events-none absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-cyan-500/10 blur-2xl" />
        <div className="pointer-events-none absolute -left-12 -top-12 w-64 h-64 rounded-full bg-pink-500/10 blur-2xl" />

        {/* Card Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-cyan-500/30 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-cyan-400 to-pink-500 flex items-center justify-center font-orbitron font-black text-black text-xs">
              Ω
            </div>
            <div>
              <div className="font-orbitron font-extrabold text-sm text-cyan-300 tracking-wider">
                techFest 2026
              </div>
              <div className="text-[9px] font-mono text-slate-400">
                CYBERNETIC ACCESS CREDENTIAL
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>VERIFIED</span>
          </div>
        </div>

        {/* Operative Info & QR Grid */}
        <div className="relative z-10 mt-5 grid grid-cols-5 gap-4 items-center">
          {/* Details (3 cols) */}
          <div className="col-span-3 space-y-3 font-mono">
            <div>
              <div className="text-[10px] text-slate-400 tracking-wider uppercase">OPERATIVE NAME</div>
              <div className="font-orbitron font-bold text-base text-slate-100 truncate">
                {pass.participant.fullName}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 tracking-wider uppercase">ORGANIZATION / UNIV</div>
              <div className="text-xs text-cyan-300 font-semibold truncate">
                {pass.participant.university}
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 tracking-wider uppercase">PRIMARY SECTOR</div>
              <div className="text-xs text-pink-400 font-semibold uppercase">
                {pass.participant.track}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
                {pass.participant.teamSize}
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-purple-950 border border-purple-500/40 text-purple-300">
                {pass.participant.experience}
              </span>
            </div>
          </div>

          {/* Dynamic QR Code (2 cols) */}
          <div className="col-span-2 flex flex-col items-center justify-center p-2 rounded-xl bg-[#06091c] border border-cyan-500/30 shadow-inner">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Verification QR Code"
                className="w-24 h-24 object-contain rounded-lg"
              />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center text-xs font-mono text-slate-500">
                GENERATING...
              </div>
            )}
            <span className="text-[8px] font-mono text-cyan-400 mt-1 tracking-widest uppercase">
              SCAN TO ENTER
            </span>
          </div>
        </div>

        {/* Security Clearance & Pass ID Footer */}
        <div className="relative z-10 mt-5 pt-4 border-t border-slate-800 flex items-center justify-between font-mono text-xs">
          <div>
            <div className="text-[9px] text-slate-400">CLEARANCE LEVEL</div>
            <div className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
              <Shield className="w-3 h-3 text-amber-400" />
              <span>{pass.clearanceLevel}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[9px] text-slate-400">DEMO PASS ID</div>
            <div className="font-orbitron font-bold text-cyan-400 text-xs tracking-wider">
              {pass.passId}
            </div>
          </div>
        </div>

        {/* Simulated Barcode at Bottom */}
        <div className="relative z-10 mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center space-x-1 h-5 opacity-70">
            {Array.from({ length: 32 }).map((_, i) => (
              <div
                key={i}
                className="bg-cyan-400 h-full"
                style={{
                  width: `${(i % 3) + 1}px`,
                  opacity: i % 4 === 0 ? 0.3 : 0.9
                }}
              />
            ))}
          </div>
          <span className="text-[8px] font-mono text-slate-500">
            SEC-HASH: 9A-4F-2E
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 flex items-center justify-center gap-3 w-full font-mono text-xs">
        <button
          onClick={handleDownload}
          className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 text-black font-bold flex items-center justify-center gap-2 hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>PRINT / SAVE PASS</span>
        </button>

        <button
          onClick={handleShare}
          className="p-2.5 rounded-xl bg-[#090e24] border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
          title="Share Pass Link"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            sound.playClick();
            onReset();
          }}
          className="p-2.5 rounded-xl bg-[#090e24] border border-slate-700 hover:border-pink-500 text-slate-400 hover:text-pink-400 transition-colors cursor-pointer"
          title="Regenerate Credentials"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
