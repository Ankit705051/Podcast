import React, { useEffect, useState } from 'react';

export const CursorFollower: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable custom cursor on non-touch pointer devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let targetX = -100;
    let targetY = -100;
    let currentTrailX = -100;
    let currentTrailY = -100;
    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setPosition({ x: targetX, y: targetY });
      if (!isVisible) setIsVisible(true);

      // Check if hovering over clickable or interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = !!target.closest('button, a, input, select, textarea, [data-interactive="true"]');
        setIsHovered(isInteractive);
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);

    // Smooth lag loop for trailing ring
    const loop = () => {
      currentTrailX += (targetX - currentTrailX) * 0.18;
      currentTrailY += (targetY - currentTrailY) * 0.18;
      setTrailingPos({ x: currentTrailX, y: currentTrailY });
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Outer Spring Follower Ring */}
      <div
        className="fixed top-0 left-0 transition-transform duration-75 ease-out rounded-full border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
        style={{
          transform: `translate3d(${trailingPos.x - 22}px, ${trailingPos.y - 22}px, 0) scale(${
            isClicking ? 0.8 : isHovered ? 1.5 : 1
          })`,
          width: '44px',
          height: '44px',
          borderColor: isHovered ? '#ec4899' : '#06b6d4',
          boxShadow: isHovered ? '0 0 15px rgba(236, 72, 153, 0.6)' : '0 0 12px rgba(6, 182, 212, 0.4)',
        }}
      >
        {/* Subtle crosshair marks */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-[4px] bg-cyan-300" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-[4px] bg-cyan-300" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] w-[4px] bg-cyan-300" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1px] w-[4px] bg-cyan-300" />
      </div>

      {/* Center Precise Dot */}
      <div
        className="fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none"
        style={{
          transform: `translate3d(${position.x - 4}px, ${position.y - 4}px, 0)`,
          backgroundColor: isHovered ? '#ec4899' : '#00f0ff',
          boxShadow: isHovered
            ? '0 0 10px #ec4899, 0 0 20px #ec4899'
            : '0 0 10px #00f0ff, 0 0 20px #00f0ff',
        }}
      />
    </div>
  );
};
