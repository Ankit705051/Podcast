
import React, { useEffect, useRef, useState } from 'react';

type Point = {
  x: number;
  y: number;
};

export const CursorFollower: React.FC = () => {
  const [position, setPosition] = useState<Point>({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [label, setLabel] = useState('');

  const targetRef = useRef<HTMLElement | null>(null);
  const positionRef = useRef<Point>({ x: -100, y: -100 });
  const frameRef = useRef<number | null>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    let targetX = -100;
    let targetY = -100;
    let trailX = -100;
    let trailY = -100;
    let lastX = -100;
    let lastY = -100;

    const onMouseMove = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;

      positionRef.current = { x: targetX, y: targetY };
      setPosition(positionRef.current);
      setIsVisible(true);

      
      const target = event.target as HTMLElement | null;
      const interactive = target?.closest<HTMLElement>(
        'button, a, input, select, textarea, [role="button"], [data-interactive="true"]'
      );

      targetRef.current = interactive ?? null;

      setIsHovered(Boolean(interactive));

      const customLabel = interactive?.dataset.cursor;
      setLabel(
        customLabel ||
          (interactive?.matches('a') ? 'OPEN' : interactive ? 'SELECT' : '')
      );
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onWindowLeave = () => setIsVisible(false);
    const onWindowEnter = () => {
      if (document.hasFocus()) setIsVisible(true);
    };

    const animate = () => {
      
      trailX += (targetX - trailX) * 0.14;
      trailY += (targetY - trailY) * 0.14;

      const dx = targetX - lastX;
      const dy = targetY - lastY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      if (trailRef.current) {
        trailRef.current.style.transform =
          `translate3d(${trailX}px, ${trailY}px, 0) ` +
          `rotate(${angle}deg) scale(${isClicking ? 0.82 : isHovered ? 1.12 : 1})`;
      }

      if (coreRef.current) {
        coreRef.current.style.transform =
          `translate3d(${targetX}px, ${targetY}px, 0) ` +
          `scale(${isClicking ? 0.65 : isHovered ? 1.3 : 1})`;
      }

      lastX = targetX;
      lastY = targetY;

      frameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('blur', onWindowLeave);
    window.addEventListener('focus', onWindowEnter);

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('blur', onWindowLeave);
      window.removeEventListener('focus', onWindowEnter);

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isClicking, isHovered]);

  if (!isVisible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
    >
      {}
      <div
        ref={trailRef}
        className="fixed left-0 top-0"
        style={{
          width: 42,
          height: 42,
          marginLeft: -21,
          marginTop: -21,
          willChange: 'transform',
        }}
      >
        {}
        <span
          className={`absolute left-0 top-0 h-[11px] w-[11px] border-l-2 border-t-2 ${
            isHovered ? 'border-pink-400' : 'border-cyan-300'
          }`}
          style={{ filter: 'drop-shadow(0 0 5px currentColor)' }}
        />

        <span
          className={`absolute right-0 top-0 h-[11px] w-[11px] border-r-2 border-t-2 ${
            isHovered ? 'border-pink-400' : 'border-cyan-300'
          }`}
        />

        <span
          className={`absolute bottom-0 left-0 h-[11px] w-[11px] border-b-2 border-l-2 ${
            isHovered ? 'border-pink-400' : 'border-cyan-300'
          }`}
        />

        <span
          className={`absolute bottom-0 right-0 h-[11px] w-[11px] border-b-2 border-r-2 ${
            isHovered ? 'border-pink-400' : 'border-cyan-300'
          }`}
        />

        {}
        <span
          className={`absolute left-1/2 top-0 h-1 w-px -translate-x-1/2 ${
            isHovered ? 'bg-pink-300' : 'bg-cyan-200'
          }`}
        />

        <span
          className={`absolute bottom-0 left-1/2 h-1 w-px -translate-x-1/2 ${
            isHovered ? 'bg-pink-300' : 'bg-cyan-200'
          }`}
        />

        {}
        <span
          className={`absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 ${
            isHovered ? 'bg-pink-400/80' : 'bg-cyan-400/80'
          }`}
        />

        <span
          className={`absolute left-1/2 top-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 ${
            isHovered ? 'bg-pink-400/80' : 'bg-cyan-400/80'
          }`}
        />
      </div>

      {}
      <div
        ref={coreRef}
        className="fixed left-0 top-0"
        style={{
          marginLeft: -3,
          marginTop: -3,
          width: 6,
          height: 6,
          background: isHovered ? '#ff4bd8' : '#8ffaff',
          boxShadow: isHovered
            ? '0 0 8px #ff4bd8, 0 0 18px #ff4bd8'
            : '0 0 8px #00eaff, 0 0 18px #00eaff',
          clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
          willChange: 'transform',
        }}
      />

      {}
      {isHovered && label && (
        <div
          className="fixed font-mono text-[9px] font-bold tracking-[0.2em] text-pink-300"
          style={{
            left: Math.min(position.x + 24, window.innerWidth - 85),
            top: Math.min(position.y + 20, window.innerHeight - 24),
            textShadow: '0 0 8px rgba(236,72,153,0.8)',
          }}
        >
          {`[ ${label} ]`}
        </div>
      )}

      {}
      <div
        className="fixed bottom-5 left-5 hidden font-mono text-[9px] tracking-widest text-cyan-400/60 md:block"
      >
        SYS.TRACK 
        {String(Math.round(position.y)).padStart(4, '0')}
      </div>
    </div>
  );
};
