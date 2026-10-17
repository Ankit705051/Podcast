
import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useId,
} from "react";
import { sound } from "../../utils/audio";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "cyan" | "magenta" | "purple" | "amber";
  maxTilt?: number;
  disabled?: boolean;
  onClick?: () => void;
  showScanBeam?: boolean;
}

const THEMES = {
  cyan: {
    rgb: "6,182,212",
    border: "border-cyan-400/30 hover:border-cyan-300/70",
    led: "bg-cyan-400",
    text: "text-cyan-300",
  },
  magenta: {
    rgb: "236,72,153",
    border: "border-pink-400/30 hover:border-pink-300/70",
    led: "bg-pink-400",
    text: "text-pink-300",
  },
  purple: {
    rgb: "168,85,247",
    border: "border-purple-400/30 hover:border-purple-300/70",
    led: "bg-purple-400",
    text: "text-purple-300",
  },
  amber: {
    rgb: "245,158,11",
    border: "border-amber-400/30 hover:border-amber-300/70",
    led: "bg-amber-400",
    text: "text-amber-300",
  },
};

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = "",
  glowColor = "cyan",
  maxTilt = 10,
  disabled = false,
  onClick,
  showScanBeam = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const scanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [pointer, setPointer] = useState({ x: 50, y: 50 });

  const id = useId();
  const theme = THEMES[glowColor];
  const clickable = Boolean(onClick) && !disabled;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || !cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const rotateX = (0.5 - y) * maxTilt * 2;
      const rotateY = (x - 0.5) * maxTilt * 2;

      setPointer({ x: x * 100, y: y * 100 });

      cardRef.current.style.setProperty(
        "--tilt-x",
        `${rotateX}deg`
      );
      cardRef.current.style.setProperty(
        "--tilt-y",
        `${rotateY}deg`
      );
    },
    [disabled, maxTilt]
  );

  const startScan = useCallback(() => {
    if (!showScanBeam) return;

    setIsScanning(false);

    if (scanTimer.current) {
      clearTimeout(scanTimer.current);
    }

    // Restart the animation on repeated interactions.
    requestAnimationFrame(() => {
      setIsScanning(true);

      scanTimer.current = setTimeout(() => {
        setIsScanning(false);
      }, 850);
    });
  }, [showScanBeam]);

  const handleMouseEnter = useCallback(() => {
    if (disabled) return;

    setIsActive(true);
    sound.playHover();
    startScan();
  }, [disabled, startScan]);

  const handleMouseLeave = useCallback(() => {
    setIsActive(false);

    if (!cardRef.current) return;

    cardRef.current.style.setProperty("--tilt-x", "0deg");
    cardRef.current.style.setProperty("--tilt-y", "0deg");
    setPointer({ x: 50, y: 50 });
  }, []);

  const handleClick = useCallback(() => {
    if (!clickable) return;

    sound.playClick();
    startScan();
    onClick?.();
  }, [clickable, onClick, startScan]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (!clickable || (e.key !== "Enter" && e.key !== " ")) {
      return;
    }

    e.preventDefault();
    handleClick();
  };

  useEffect(() => {
    return () => {
      if (scanTimer.current) {
        clearTimeout(scanTimer.current);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-disabled={clickable ? disabled : undefined}
      data-interactive="true"
      className={[
        "tilt-card group relative isolate",
        "overflow-hidden rounded-2xl border",
        "bg-[#070b19]/90 backdrop-blur-xl",
        "transition-[border-color,box-shadow] duration-300",
        "transform-gpu",
        theme.border,
        disabled ? "cursor-not-allowed opacity-60" : "",
        clickable ? "cursor-pointer" : "",
        className,
      ].join(" ")}
      style={{
        "--card-rgb": theme.rgb,
        "--pointer-x": `${pointer.x}%`,
        "--pointer-y": `${pointer.y}%`,
        "--tilt-x": "0deg",
        "--tilt-y": "0deg",
        transform:
          "perspective(1200px) rotateX(var(--tilt-x)) rotateY(var(--tilt-y))",
        transformStyle: "preserve-3d",
        transition:
          "transform 180ms ease-out, border-color 300ms ease, box-shadow 300ms ease",
        boxShadow: isActive
          ? `0 0 32px rgba(${theme.rgb},0.12), 0 24px 60px rgba(0,0,0,0.3)`
          : "0 12px 32px rgba(0,0,0,0.18)",
      } as React.CSSProperties}
    >
      {/* Animated energy border */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px z-30 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          padding: "1px",
          background: `conic-gradient(from var(--border-angle, 0deg), transparent 0%, rgba(${theme.rgb},0.9) 12%, transparent 28%, rgba(168,85,247,0.6) 50%, transparent 72%)`,
          mask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          animation: isActive
            ? `tilt-card-border-${id.replace(/:/g, "")} 4s linear infinite`
            : "none",
        }}
      />

      {/* Cursor-following holographic light */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(360px circle at var(--pointer-x) var(--pointer-y), rgba(${theme.rgb},0.17), transparent 65%)`,
        }}
      />

      {/* Prismatic holographic film */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 opacity-0 mix-blend-screen transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `
            radial-gradient(ellipse at var(--pointer-x) var(--pointer-y),
              rgba(255,255,255,0.18), transparent 35%),
            linear-gradient(
              125deg,
              rgba(6,182,212,0.10),
              transparent 25%,
              rgba(168,85,247,0.13) 52%,
              transparent 72%,
              rgba(236,72,153,0.12)
            )
          `,
        }}
      />

      {/* Specular reflection */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse 65% 50% at var(--pointer-x) var(--pointer-y), rgba(255,255,255,0.12), transparent 100%)`,
        }}
      />

      {/* Subtle futuristic grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.045]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(103,232,249,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(103,232,249,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px",
          maskImage:
            "linear-gradient(to bottom right, black, transparent 85%)",
        }}
      />

      {/* Laser sweep */}
      {isScanning && (
        <div
          key={`${id}-${isScanning}`}
          aria-hidden="true"
          className="tilt-card-scan pointer-events-none absolute inset-x-0 top-0 z-40 h-16"
          style={{
            background: `linear-gradient(to bottom, transparent, rgba(${theme.rgb},0.20), rgba(255,255,255,0.10), transparent)`,
            borderBottom: `1px solid rgba(${theme.rgb},0.85)`,
            boxShadow: `0 5px 24px rgba(${theme.rgb},0.22)`,
          }}
        />
      )}

      {/* HUD corners */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 z-30 h-5 w-5 border-l-2 border-t-2 ${theme.text.replace("text-", "border-")} transition-all duration-300 group-hover:h-8 group-hover:w-8`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute right-0 top-0 z-30 h-5 w-5 border-r-2 border-t-2 ${theme.text.replace("text-", "border-")} transition-all duration-300 group-hover:h-8 group-hover:w-8`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-0 left-0 z-30 h-5 w-5 border-b-2 border-l-2 ${theme.text.replace("text-", "border-")} transition-all duration-300 group-hover:h-8 group-hover:w-8`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-0 right-0 z-30 h-5 w-5 border-b-2 border-r-2 ${theme.text.replace("text-", "border-")} transition-all duration-300 group-hover:h-8 group-hover:w-8`}
      />

      {/* Telemetry indicator */}
      <div className="pointer-events-none absolute right-4 top-4 z-30 flex items-center gap-2">
        <span
          className={`h-1.5 w-1.5 rounded-full ${theme.led} ${
            isActive ? "animate-ping" : "opacity-60"
          }`}
        />
        <span
          className={`font-mono text-[8px] tracking-[0.2em] ${theme.text} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
        >
          SYS.ONLINE
        </span>
      </div>

      {/* Bottom telemetry line */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 bottom-0 z-20 h-px origin-center scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(${theme.rgb},0.9), transparent)`,
          boxShadow: `0 0 12px rgba(${theme.rgb},0.5)`,
        }}
      />

      {/* Elevated card content */}
      <div
        className="relative z-10 h-full w-full"
        style={{ transform: "translateZ(22px)" }}
      >
        {children}
      </div>

      <style>{`
        @keyframes tilt-card-border-${id.replace(/:/g, "")} {
          from { --border-angle: 0deg; }
          to { --border-angle: 360deg; }
        }

        .tilt-card-scan {
          animation: tilt-card-scan 850ms cubic-bezier(.16,1,.3,1) both;
        }

        @keyframes tilt-card-scan {
          0% { transform: translateY(-100%); opacity: 0; }
          15% { opacity: 1; }
          75% { opacity: .85; }
          100% { transform: translateY(var(--scan-distance, 350px)); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .tilt-card-scan {
            animation-duration: 1ms;
          }
        }
      `}</style>
    </div>
  );
};
