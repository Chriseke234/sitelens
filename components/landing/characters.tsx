"use client";

import React from "react";

// 1. Vibecoder Character: Headphone-wearing builder typing at laptop with floating ideas
export function VibecoderCharacter({ className = "w-44 h-44" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[4px_4px_0px_#080808]"
      >
        {/* Floating Idea Sparkle Bulb */}
        <g className="animate-pulse">
          <circle cx="120" cy="30" r="14" fill="#FFE500" stroke="#080808" strokeWidth="2.5" />
          <path d="M120 18V24M120 36V42M108 30H114M126 30H132" stroke="#080808" strokeWidth="2" strokeLinecap="round" />
          <text x="120" y="34" textAnchor="middle" fill="#080808" fontFamily="monospace" fontWeight="900" fontSize="12">!</text>
        </g>

        {/* Headphone Band */}
        <path
          d="M50 70 C50 40, 110 40, 110 70"
          stroke="#080808"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Head */}
        <rect
          x="55"
          y="48"
          width="50"
          height="45"
          rx="12"
          fill="#F8F6EC"
          stroke="#080808"
          strokeWidth="3"
        />

        {/* Headphone Earcups */}
        <rect x="44" y="60" width="10" height="20" rx="4" fill="#FF4F9A" stroke="#080808" strokeWidth="2.5" />
        <rect x="106" y="60" width="10" height="20" rx="4" fill="#FF4F9A" stroke="#080808" strokeWidth="2.5" />

        {/* Eyes (Stylized Cool Glasses / Shades) */}
        <rect x="62" y="62" width="14" height="10" rx="2" fill="#080808" />
        <rect x="84" y="62" width="14" height="10" rx="2" fill="#080808" />
        <line x1="76" y1="67" x2="84" y2="67" stroke="#080808" strokeWidth="3" />
        {/* Shades Reflections */}
        <line x1="64" y1="64" x2="70" y2="70" stroke="#B7FF6A" strokeWidth="2" strokeLinecap="round" />
        <line x1="86" y1="64" x2="92" y2="70" stroke="#B7FF6A" strokeWidth="2" strokeLinecap="round" />

        {/* Confident Smile */}
        <path d="M72 82 Q80 88 88 82" stroke="#080808" strokeWidth="2.5" strokeLinecap="round" />

        {/* Torso / Hoodie */}
        <path
          d="M40 145 L48 98 C50 93 55 90 60 90 L100 90 C105 90 110 93 112 98 L120 145 Z"
          fill="#FFE500"
          stroke="#080808"
          strokeWidth="3"
        />
        {/* Hoodie Strings */}
        <line x1="74" y1="92" x2="74" y2="108" stroke="#080808" strokeWidth="2" strokeLinecap="round" />
        <line x1="86" y1="92" x2="86" y2="108" stroke="#080808" strokeWidth="2" strokeLinecap="round" />

        {/* Laptop Base & Screen */}
        <polygon points="50,140 110,140 118,150 42,150" fill="#080808" stroke="#080808" strokeWidth="2" />
        <rect x="52" y="115" width="56" height="25" rx="3" fill="#B7FF6A" stroke="#080808" strokeWidth="2.5" />
        {/* Glowing Logo on Laptop Lid */}
        <path d="M76 130L80 120L84 130H76Z" fill="#080808" />

        {/* Active typing hands */}
        <circle cx="54" cy="138" r="6" fill="#F8F6EC" stroke="#080808" strokeWidth="2" />
        <circle cx="106" cy="138" r="6" fill="#F8F6EC" stroke="#080808" strokeWidth="2" />
      </svg>
    </div>
  );
}

// 2. Confused Agent Character: Overwhelmed by vague prompt instructions
export function ConfusedAgentCharacter({ className = "w-36 h-36" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 140 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[4px_4px_0px_#080808]"
      >
        {/* Floating question mark bubbles */}
        <g className="animate-bounce">
          <circle cx="105" cy="25" r="10" fill="#FF4F9A" stroke="#080808" strokeWidth="2" />
          <text x="105" y="29" textAnchor="middle" fill="white" fontFamily="monospace" fontWeight="900" fontSize="12">?</text>
        </g>
        <g className="animate-pulse">
          <circle cx="35" cy="35" r="8" fill="#FFE500" stroke="#080808" strokeWidth="2" />
          <text x="35" y="39" textAnchor="middle" fill="#080808" fontFamily="monospace" fontWeight="900" fontSize="10">?</text>
        </g>

        {/* Robot Head */}
        <rect x="35" y="45" width="70" height="55" rx="8" fill="#F8F6EC" stroke="#080808" strokeWidth="3" />
        {/* Antenna with sparking warning */}
        <line x1="70" y1="45" x2="70" y2="30" stroke="#080808" strokeWidth="3" strokeLinecap="round" />
        <circle cx="70" cy="27" r="5" fill="#FF4F9A" stroke="#080808" strokeWidth="2" />

        {/* Dizzy Swirl Eyes */}
        <g className="animate-spin duration-1000 origin-center" style={{ transformOrigin: "52px 68px" }}>
          <circle cx="52" cy="68" r="8" stroke="#080808" strokeWidth="2.5" strokeDasharray="4 2" />
          <circle cx="52" cy="68" r="2.5" fill="#FF4F9A" />
        </g>
        <g className="animate-spin duration-1000 origin-center" style={{ transformOrigin: "88px 68px" }}>
          <circle cx="88" cy="68" r="8" stroke="#080808" strokeWidth="2.5" strokeDasharray="4 2" />
          <circle cx="88" cy="68" r="2.5" fill="#FF4F9A" />
        </g>

        {/* Wobbly confused mouth */}
        <path d="M54 88 Q62 82 70 88 T86 88" stroke="#080808" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Robot Body with error glitch */}
        <rect x="42" y="100" width="56" height="35" rx="6" fill="#FF4F9A" stroke="#080808" strokeWidth="3" />
        <rect x="52" y="110" width="36" height="15" rx="3" fill="#080808" />
        <text x="70" y="121" textAnchor="middle" fill="#FFE500" fontFamily="monospace" fontWeight="900" fontSize="8">ERR 404</text>
      </svg>
    </div>
  );
}

// 3. Agent Architect Character: Drafting the build blueprint with ruler & specs
export function AgentArchitectCharacter({ className = "w-40 h-40" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 150 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[4px_4px_0px_#080808]"
      >
        {/* Hard Hat */}
        <path d="M40 55 C40 32, 110 32, 110 55 Z" fill="#FFE500" stroke="#080808" strokeWidth="3" />
        <rect x="34" y="53" width="82" height="6" rx="3" fill="#FFE500" stroke="#080808" strokeWidth="2.5" />

        {/* Head */}
        <rect x="48" y="58" width="54" height="42" rx="10" fill="#F8F6EC" stroke="#080808" strokeWidth="3" />

        {/* Architect Glasses */}
        <circle cx="62" cy="74" r="8" fill="white" stroke="#080808" strokeWidth="2.5" />
        <circle cx="88" cy="74" r="8" fill="white" stroke="#080808" strokeWidth="2.5" />
        <line x1="70" y1="74" x2="80" y2="74" stroke="#080808" strokeWidth="3" />
        <circle cx="62" cy="74" r="2.5" fill="#080808" />
        <circle cx="88" cy="74" r="2.5" fill="#080808" />

        {/* Smile */}
        <path d="M68 89 Q75 94 82 89" stroke="#080808" strokeWidth="2.5" strokeLinecap="round" />

        {/* Coat / Jumper */}
        <path
          d="M35 145 L42 100 C45 96 50 94 55 94 L95 94 C100 94 105 96 108 100 L115 145 Z"
          fill="#B7FF6A"
          stroke="#080808"
          strokeWidth="3"
        />

        {/* Drafting Blueprint in Hands */}
        <rect
          x="45"
          y="112"
          width="60"
          height="32"
          rx="4"
          fill="#080808"
          stroke="#080808"
          strokeWidth="2.5"
          className="shadow-[2px_2px_0px_#FFE500]"
        />
        {/* Blueprint Lines */}
        <line x1="52" y1="120" x2="98" y2="120" stroke="#B7FF6A" strokeWidth="2" strokeDasharray="3 2" />
        <line x1="52" y1="128" x2="85" y2="128" stroke="#FFE500" strokeWidth="2" />
        <line x1="52" y1="136" x2="92" y2="136" stroke="#FF4F9A" strokeWidth="2" />

        {/* Hands holding blueprint */}
        <circle cx="45" cy="126" r="5" fill="#F8F6EC" stroke="#080808" strokeWidth="2" />
        <circle cx="105" cy="126" r="5" fill="#F8F6EC" stroke="#080808" strokeWidth="2" />
      </svg>
    </div>
  );
}

// 4. QA Auditor Character: Inspecting code with big magnifying lens
export function AuditorCharacter({ className = "w-40 h-40" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 150 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[4px_4px_0px_#080808]"
      >
        {/* Magnifying Glass Outer Halo Glow */}
        <g className="animate-pulse">
          <circle cx="100" cy="65" r="28" fill="#B7FF6A" fillOpacity="0.3" />
        </g>

        {/* Head */}
        <circle cx="55" cy="60" r="26" fill="#F8F6EC" stroke="#080808" strokeWidth="3" />
        {/* Hair */}
        <path d="M35 55 C35 35, 75 35, 75 55 Z" fill="#080808" />

        {/* Keen Eyes */}
        <circle cx="48" cy="62" r="3" fill="#080808" />
        <circle cx="64" cy="62" r="3" fill="#080808" />
        {/* Eyebrows */}
        <line x1="44" y1="56" x2="52" y2="58" stroke="#080808" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="58" x2="68" y2="56" stroke="#080808" strokeWidth="2" strokeLinecap="round" />
        <path d="M52 74 Q56 77 60 74" stroke="#080808" strokeWidth="2" strokeLinecap="round" />

        {/* Body */}
        <path
          d="M25 140 L34 86 C37 84 42 82 48 82 L70 82 C76 82 81 84 84 86 L95 140 Z"
          fill="#FF4F9A"
          stroke="#080808"
          strokeWidth="3"
        />

        {/* Magnifying Glass (Holding out) */}
        <g className="transition-transform duration-500 hover:scale-105 origin-center">
          <circle cx="100" cy="65" r="22" fill="#FFE500" stroke="#080808" strokeWidth="3.5" />
          <circle cx="100" cy="65" r="16" fill="white" fillOpacity="0.8" />
          {/* Checkmark inside the lens */}
          <path d="M93 65 L98 70 L107 60" stroke="#080808" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Lens Handle */}
          <line x1="86" y1="81" x2="72" y2="95" stroke="#080808" strokeWidth="6" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
