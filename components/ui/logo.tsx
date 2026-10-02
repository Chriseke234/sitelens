import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

const sizeMap = {
  sm: { icon: "h-6 w-6", text: "text-base" },
  md: { icon: "h-8 w-8", text: "text-lg" },
  lg: { icon: "h-10 w-10", text: "text-xl" },
  xl: { icon: "h-16 w-16", text: "text-3xl" },
};

export function LogoIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Aigenstra Icon"
    >
      <defs>
        {/* Main Brand Linear Gradient */}
        <linearGradient
          id="aigenstra-primary-grad"
          x1="2"
          y1="2"
          x2="38"
          y2="38"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#22d3ee" /> {/* Cyan 400 */}
          <stop offset="50%" stopColor="#6366f1" /> {/* Indigo 500 */}
          <stop offset="100%" stopColor="#a855f7" /> {/* Purple 500 */}
        </linearGradient>

        {/* Highlight Secondary Gradient */}
        <linearGradient
          id="aigenstra-glow-grad"
          x1="20"
          y1="4"
          x2="20"
          y2="36"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
        </linearGradient>

        {/* Subtle Dark Background Gradient */}
        <linearGradient
          id="aigenstra-bg-grad"
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
      </defs>

      {/* Cybernetic Container with rounded geometric bevel */}
      <rect
        width="40"
        height="40"
        rx="10"
        fill="url(#aigenstra-bg-grad)"
        stroke="url(#aigenstra-primary-grad)"
        strokeWidth="1.5"
        strokeOpacity="0.4"
      />

      {/* Stylized Cybernetic Lettermark 'A' with Faceted Geometry */}
      {/* Outer Apex & Left Leg */}
      <path
        d="M20 7L7 32H13.5L16.5 25.5H23.5L26.5 32H33L20 7Z"
        fill="url(#aigenstra-primary-grad)"
      />

      {/* Inner Apex Triangular Negative Space / Core Lens */}
      <path
        d="M20 13.5L17.8 20.5H22.2L20 13.5Z"
        fill="#020617"
      />

      {/* Cybernetic Horizontal Synapse Bar */}
      <path
        d="M15.5 22.5H24.5L23.5 24.5H16.5L15.5 22.5Z"
        fill="url(#aigenstra-glow-grad)"
      />

      {/* Radiant Apex Energy Point */}
      <circle cx="20" cy="7.5" r="1.75" fill="#38bdf8" />
      {/* Left Node */}
      <circle cx="7" cy="32" r="1.25" fill="#22d3ee" opacity="0.8" />
      {/* Right Node */}
      <circle cx="33" cy="32" r="1.25" fill="#a855f7" opacity="0.8" />
    </svg>
  );
}

export function Logo({
  size = "md",
  className = "",
  showText = true,
  textClassName = "",
}: LogoProps) {
  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative flex items-center justify-center shrink-0">
        <LogoIcon className={currentSize.icon} />
      </div>

      {showText && (
        <span
          className={`font-black tracking-tight bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent font-sans ${currentSize.text} ${textClassName}`}
        >
          Aigenstra
        </span>
      )}
    </div>
  );
}
