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
  xl: { icon: "h-14 w-14", text: "text-3xl" },
};

export function LogoIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Aigenstra Brand Icon"
    >
      {/* Brand Yellow Container with Solid Black Border */}
      <rect
        width="40"
        height="40"
        rx="9"
        fill="#FFE500"
        stroke="#080808"
        strokeWidth="2.5"
      />

      {/* Stylized Neo-Brutalist Lettermark 'A' */}
      <path
        d="M7 33L20 8L33 33H26.5L23.5 26.5H16.5L13.5 33H7Z"
        fill="#080808"
      />

      {/* Inner Apex Triangular Negative Space / Core Lens */}
      <path
        d="M20 14L17.5 21H22.5L20 14Z"
        fill="#FFE500"
      />

      {/* Hot Pink Accent Horizontal Bar */}
      <rect
        x="15"
        y="23"
        width="10"
        height="2"
        rx="0.5"
        fill="#FF4F9A"
      />

      {/* Radiant Apex Energy Point in Lime Green */}
      <circle
        cx="20"
        cy="8.5"
        r="1.75"
        fill="#B7FF6A"
        stroke="#080808"
        strokeWidth="0.75"
      />

      {/* Base Foundation Nodes */}
      <circle cx="7" cy="33" r="1.25" fill="#FF4F9A" />
      <circle cx="33" cy="33" r="1.25" fill="#B7FF6A" />
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
      <div className="relative flex items-center justify-center shrink-0 transition-transform hover:scale-105">
        <LogoIcon className={currentSize.icon} />
      </div>

      {showText && (
        <span
          className={`font-mono font-black tracking-tight text-[#080808] dark:text-white uppercase ${currentSize.text} ${textClassName}`}
        >
          Aigenstra
        </span>
      )}
    </div>
  );
}
