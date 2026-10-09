"use client";

import React from "react";

// 1. Vibecoder Character: Headphone-wearing builder typing at laptop with floating ideas
export function VibecoderCharacter({ className = "w-44 h-44" }: { className?: string }) {
  return (
    <div className={`group relative flex items-center justify-center cursor-pointer select-none transition-transform duration-300 hover:scale-105 hover:-rotate-1 ${className}`}>
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[4px_4px_0px_#080808]"
      >
        {/* Floating Idea Sparkle Bulb with hover bounce */}
        <g className="animate-pulse transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110">
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
        <rect x="44" y="60" width="10" height="20" rx="4" fill="#FF4F9A" stroke="#080808" strokeWidth="2.5" className="transition-colors group-hover:fill-[#FFE500]" />
        <rect x="106" y="60" width="10" height="20" rx="4" fill="#FF4F9A" stroke="#080808" strokeWidth="2.5" className="transition-colors group-hover:fill-[#FFE500]" />

        {/* Eyes (Stylized Cool Glasses / Shades) */}
        <rect x="62" y="62" width="14" height="10" rx="2" fill="#080808" />
        <rect x="84" y="62" width="14" height="10" rx="2" fill="#080808" />
        <line x1="76" y1="67" x2="84" y2="67" stroke="#080808" strokeWidth="3" />
        {/* Shades Reflections that glow on hover */}
        <line x1="64" y1="64" x2="70" y2="70" stroke="#B7FF6A" strokeWidth="2" strokeLinecap="round" className="transition-all group-hover:stroke-[#FFE500]" />
        <line x1="86" y1="64" x2="92" y2="70" stroke="#B7FF6A" strokeWidth="2" strokeLinecap="round" className="transition-all group-hover:stroke-[#FFE500]" />

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

        {/* Active typing hands with hover wiggle */}
        <circle cx="54" cy="138" r="6" fill="#F8F6EC" stroke="#080808" strokeWidth="2" className="transition-transform group-hover:translate-x-0.5" />
        <circle cx="106" cy="138" r="6" fill="#F8F6EC" stroke="#080808" strokeWidth="2" className="transition-transform group-hover:-translate-x-0.5" />
      </svg>
    </div>
  );
}

// 2. Confused Agent Character: Overwhelmed by vague prompt instructions
export function ConfusedAgentCharacter({ className = "w-36 h-36" }: { className?: string }) {
  return (
    <div className={`group relative flex items-center justify-center cursor-pointer select-none transition-transform duration-300 hover:rotate-3 hover:scale-105 ${className}`}>
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
        <circle cx="70" cy="27" r="5" fill="#FF4F9A" stroke="#080808" strokeWidth="2" className="group-hover:animate-ping" />

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
    <div className={`group relative flex items-center justify-center cursor-pointer select-none transition-transform duration-300 hover:scale-105 hover:-translate-y-1 ${className}`}>
      <svg
        viewBox="0 0 150 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[4px_4px_0px_#080808]"
      >
        {/* Hard Hat */}
        <path d="M45 50 C45 32, 105 32, 105 50 Z" fill="#FFE500" stroke="#080808" strokeWidth="3" />
        <rect x="40" y="48" width="70" height="6" rx="3" fill="#FFE500" stroke="#080808" strokeWidth="2.5" />
        <circle cx="75" cy="40" r="4" fill="#080808" />

        {/* Head */}
        <rect x="48" y="54" width="54" height="42" rx="8" fill="#F8F6EC" stroke="#080808" strokeWidth="3" />

        {/* Clear Focused Eyes with Blueprint Grid Reflection */}
        <circle cx="62" cy="70" r="6" fill="#080808" />
        <circle cx="88" cy="70" r="6" fill="#080808" />
        <circle cx="64" cy="68" r="2" fill="#B7FF6A" className="group-hover:fill-[#FFE500]" />
        <circle cx="90" cy="68" r="2" fill="#B7FF6A" className="group-hover:fill-[#FFE500]" />

        {/* Determined mouth */}
        <line x1="68" y1="84" x2="82" y2="84" stroke="#080808" strokeWidth="2.5" strokeLinecap="round" />

        {/* Architect Ruler in Hand */}
        <g className="transition-transform duration-300 group-hover:rotate-6 origin-bottom-left">
          <rect x="18" y="70" width="12" height="65" rx="2" fill="#FFE500" stroke="#080808" strokeWidth="2" transform="rotate(-20 18 70)" />
          <line x1="26" y1="80" x2="30" y2="80" stroke="#080808" strokeWidth="1.5" />
          <line x1="28" y1="90" x2="33" y2="90" stroke="#080808" strokeWidth="1.5" />
          <line x1="30" y1="100" x2="35" y2="100" stroke="#080808" strokeWidth="1.5" />
        </g>

        {/* Torso with Safety Vest */}
        <path d="M42 145 L48 96 L102 96 L108 145 Z" fill="#080808" stroke="#080808" strokeWidth="3" />
        {/* Safety Vest Neon Stripes */}
        <polygon points="56,96 66,96 64,145 54,145" fill="#B7FF6A" />
        <polygon points="84,96 94,96 96,145 86,145" fill="#B7FF6A" />

        {/* Blueprint Scroll Rolled under arm */}
        <rect x="90" y="105" width="40" height="14" rx="4" fill="#B7FF6A" stroke="#080808" strokeWidth="2.5" />
        <circle cx="130" cy="112" r="7" fill="#F8F6EC" stroke="#080808" strokeWidth="2" />
        <circle cx="130" cy="112" r="3" fill="#080808" />
      </svg>
    </div>
  );
}

// 4. Auditor Character: Inspector with magnifying glass verifying code
export function AuditorCharacter({ className = "w-36 h-36" }: { className?: string }) {
  return (
    <div className={`group relative flex items-center justify-center cursor-pointer select-none transition-transform duration-300 hover:scale-105 hover:rotate-1 ${className}`}>
      <svg
        viewBox="0 0 140 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[4px_4px_0px_#080808]"
      >
        {/* Floating Checkmark Pill */}
        <g className="animate-bounce">
          <rect x="88" y="16" width="38" height="18" rx="4" fill="#B7FF6A" stroke="#080808" strokeWidth="2" />
          <text x="107" y="29" textAnchor="middle" fill="#080808" fontFamily="monospace" fontWeight="900" fontSize="9">PASS</text>
        </g>

        {/* Head */}
        <rect x="42" y="44" width="56" height="46" rx="10" fill="#F8F6EC" stroke="#080808" strokeWidth="3" />

        {/* Sleek Inspector Eyes */}
        <line x1="52" y1="62" x2="64" y2="62" stroke="#080808" strokeWidth="3" strokeLinecap="round" />
        <circle cx="58" cy="68" r="4" fill="#080808" />
        <line x1="76" y1="62" x2="88" y2="62" stroke="#080808" strokeWidth="3" strokeLinecap="round" />
        <circle cx="82" cy="68" r="4" fill="#080808" />

        {/* Stern nod mouth */}
        <path d="M62 80 Q70 82 78 80" stroke="#080808" strokeWidth="2.5" strokeLinecap="round" />

        {/* Inspector Body / Coat */}
        <path d="M34 140 L44 90 L96 90 L106 140 Z" fill="#FF4F9A" stroke="#080808" strokeWidth="3" />
        <line x1="70" y1="90" x2="70" y2="140" stroke="#080808" strokeWidth="2.5" />

        {/* Big Magnifying Glass in front with hover pulse */}
        <g className="transition-transform duration-300 group-hover:scale-110 origin-center" style={{ transformOrigin: "85px 85px" }}>
          <circle cx="85" cy="85" r="22" fill="#B7FF6A" fillOpacity="0.4" stroke="#080808" strokeWidth="3" />
          <line x1="102" y1="102" x2="124" y2="124" stroke="#080808" strokeWidth="5" strokeLinecap="round" />
          {/* Magnifying lens glint */}
          <path d="M72 75 Q85 68 95 78" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

// 5. Prompt Pilot Character (NEW): AI Navigator holding precision flight prompt scroll
export function PromptPilotCharacter({ className = "w-40 h-40" }: { className?: string }) {
  return (
    <div className={`group relative flex items-center justify-center cursor-pointer select-none transition-transform duration-300 hover:scale-105 hover:-rotate-2 ${className}`}>
      <svg
        viewBox="0 0 150 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[4px_4px_0px_#080808]"
      >
        {/* Propeller Beanie / Navigator Cap */}
        <g className="origin-top transition-transform duration-300 group-hover:rotate-180" style={{ transformOrigin: "75px 30px" }}>
          <ellipse cx="75" cy="30" rx="22" ry="5" fill="#FF4F9A" stroke="#080808" strokeWidth="2" />
          <circle cx="75" cy="30" r="3" fill="#FFE500" stroke="#080808" strokeWidth="2" />
        </g>
        <line x1="75" y1="30" x2="75" y2="40" stroke="#080808" strokeWidth="2.5" />
        <path d="M50 48 C50 36, 100 36, 100 48 Z" fill="#FFE500" stroke="#080808" strokeWidth="3" />

        {/* Aviator Goggles */}
        <rect x="52" y="46" width="20" height="14" rx="4" fill="#080808" />
        <rect x="78" y="46" width="20" height="14" rx="4" fill="#080808" />
        <line x1="72" y1="52" x2="78" y2="52" stroke="#080808" strokeWidth="2" />
        <rect x="55" y="49" width="14" height="8" rx="2" fill="#B7FF6A" className="group-hover:fill-[#FFE500]" />
        <rect x="81" y="49" width="14" height="8" rx="2" fill="#B7FF6A" className="group-hover:fill-[#FFE500]" />

        {/* Pilot Face */}
        <rect x="52" y="60" width="46" height="34" rx="6" fill="#F8F6EC" stroke="#080808" strokeWidth="3" />
        <circle cx="64" cy="72" r="3.5" fill="#080808" />
        <circle cx="86" cy="72" r="3.5" fill="#080808" />
        <path d="M70 82 Q75 86 80 82" stroke="#080808" strokeWidth="2.5" strokeLinecap="round" />

        {/* Pilot Flight Jacket */}
        <path d="M42 142 L48 94 L102 94 L108 142 Z" fill="#FFE500" stroke="#080808" strokeWidth="3" />
        <path d="M60 94 L75 116 L90 94 Z" fill="#080808" />

        {/* Prompt Terminal Tablet held in hands */}
        <g className="transition-transform duration-300 group-hover:-translate-y-1">
          <rect x="45" y="112" width="60" height="32" rx="4" fill="#080808" stroke="#080808" strokeWidth="2" />
          <text x="52" y="125" fill="#B7FF6A" fontFamily="monospace" fontWeight="900" fontSize="8">&gt; PROMPT</text>
          <text x="52" y="136" fill="#FFE500" fontFamily="monospace" fontWeight="900" fontSize="7">100% CONTEXT</text>
        </g>
      </svg>
    </div>
  );
}

// 6. Rocket Shipper Character (NEW): Rocket launch countdown for shipping
export function RocketShipperCharacter({ className = "w-40 h-40" }: { className?: string }) {
  return (
    <div className={`group relative flex items-center justify-center cursor-pointer select-none transition-transform duration-300 hover:scale-110 hover:-translate-y-2 ${className}`}>
      <svg
        viewBox="0 0 150 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[5px_5px_0px_#080808]"
      >
        {/* Rocket Nose Cone */}
        <path d="M75 15 C60 40, 56 60, 56 95 L94 95 C94 60, 90 40, 75 15 Z" fill="#F8F6EC" stroke="#080808" strokeWidth="3" />
        <path d="M75 15 C68 28, 64 42, 62 55 L88 55 C86 42, 82 28, 75 15 Z" fill="#FF4F9A" stroke="#080808" strokeWidth="2.5" />

        {/* Porthole Window with Winking Mascot inside */}
        <circle cx="75" cy="72" r="14" fill="#080808" stroke="#080808" strokeWidth="2.5" />
        <circle cx="75" cy="72" r="10" fill="#B7FF6A" className="group-hover:fill-[#FFE500]" />
        {/* Wink Eyes inside window */}
        <path d="M70 72 L73 70 L76 72" stroke="#080808" strokeWidth="2" strokeLinecap="round" />
        <circle cx="79" cy="71" r="1.5" fill="#080808" />

        {/* Side Fins */}
        <polygon points="56,75 32,105 56,100" fill="#FFE500" stroke="#080808" strokeWidth="2.5" />
        <polygon points="94,75 118,105 94,100" fill="#FFE500" stroke="#080808" strokeWidth="2.5" />

        {/* Rocket Engine Base */}
        <rect x="62" y="95" width="26" height="10" rx="2" fill="#080808" />

        {/* Blazing Rocket Exhaust Flames with hover blast */}
        <g className="animate-pulse origin-top transition-transform duration-300 group-hover:scale-y-125">
          <polygon points="64,105 75,145 86,105" fill="#FFE500" stroke="#080808" strokeWidth="2" />
          <polygon points="68,105 75,130 82,105" fill="#FF4F9A" />
        </g>
      </svg>
    </div>
  );
}
