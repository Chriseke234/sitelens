import { EyeOff, Compass, ShieldAlert } from "lucide-react";

export function ProblemSection() {
  return (
    <section className="border-t border-slate-200/80 bg-white py-16 dark:border-slate-800 dark:bg-slate-950 md:py-24 animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl md:text-5xl font-sans">
            Your website can look good and still lose customers.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            A website can have traffic, beautiful visuals, and a polished design while still creating subtle friction for the people who visit it.
          </p>
        </div>

        {/* 3 Problem Cards with Animated Character SVG Illustrations */}
        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Card 1: Hidden Website Problems */}
          <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 dark:border-slate-800 dark:bg-slate-900">
            <div>
              {/* Animated Character Vector Illustration 1 */}
              <div className="relative mb-6 flex h-44 w-full items-center justify-center overflow-hidden rounded-xl bg-slate-50 p-4 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
                <svg viewBox="0 0 200 140" className="h-full w-auto transition-transform duration-500 group-hover:scale-105">
                  {/* Background Screen Grid */}
                  <rect x="25" y="15" width="150" height="100" rx="8" className="fill-slate-100 dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700" strokeWidth="2" />
                  <circle cx="37" cy="27" r="3" className="fill-rose-400" />
                  <circle cx="47" cy="27" r="3" className="fill-amber-400" />
                  <circle cx="57" cy="27" r="3" className="fill-emerald-400" />
                  <line x1="25" y1="37" x2="175" y2="37" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="2" />

                  {/* Code Block Elements */}
                  <rect x="37" y="48" width="55" height="6" rx="2" className="fill-blue-500/30 dark:fill-blue-500/40" />
                  <rect x="37" y="60" width="75" height="6" rx="2" className="fill-slate-300 dark:fill-slate-700" />
                  <rect x="37" y="72" width="45" height="6" rx="2" className="fill-slate-300 dark:fill-slate-700" />
                  <rect x="37" y="84" width="65" height="6" rx="2" className="fill-rose-400/40" />

                  {/* Auditor Character Vector */}
                  <g className="animate-float-soft">
                    {/* Character Body & Head */}
                    <path d="M 125 105 C 125 85, 155 85, 155 105" className="fill-blue-600" />
                    <circle cx="140" cy="72" r="14" className="fill-amber-200 dark:fill-amber-300" />
                    {/* Hair */}
                    <path d="M 127 68 C 127 55, 153 55, 153 68 C 145 60, 135 60, 127 68 Z" className="fill-slate-800 dark:fill-slate-900" />
                    {/* Glasses */}
                    <circle cx="135" cy="71" r="4" fill="none" className="stroke-slate-800" strokeWidth="1.5" />
                    <circle cx="145" cy="71" r="4" fill="none" className="stroke-slate-800" strokeWidth="1.5" />
                    <line x1="139" y1="71" x2="141" y2="71" className="stroke-slate-800" strokeWidth="1.5" />
                  </g>

                  {/* Magnifying Scanner Lens */}
                  <g className="transition-transform duration-500 group-hover:translate-x-[-10px]">
                    <circle cx="105" cy="70" r="22" fill="none" className="stroke-blue-600" strokeWidth="3.5" />
                    <circle cx="105" cy="70" r="18" className="fill-blue-500/20" />
                    <line x1="91" y1="84" x2="75" y2="100" className="stroke-blue-600" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 98 62 L 112 62 M 98 70 L 108 70 M 98 78 L 115 78" className="stroke-blue-600" strokeWidth="2" strokeLinecap="round" />
                  </g>

                  {/* Pulsing Warning Badge */}
                  <g className="animate-pulse">
                    <circle cx="105" cy="50" r="8" className="fill-rose-500" />
                    <text x="105" y="53" textAnchor="middle" className="fill-white font-bold text-[10px]">!</text>
                  </g>
                </svg>

                {/* Floating Icon Badge */}
                <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/30">
                  <EyeOff className="h-4 w-4" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-sans">
                Hidden website problems
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Technical, UX, accessibility, and performance issues can be difficult to identify manually without multi-layer evidence inspection.
              </p>
            </div>
          </div>

          {/* Card 2: Unclear Customer Journeys */}
          <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 dark:border-slate-800 dark:bg-slate-900">
            <div>
              {/* Animated Character Vector Illustration 2 */}
              <div className="relative mb-6 flex h-44 w-full items-center justify-center overflow-hidden rounded-xl bg-slate-50 p-4 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
                <svg viewBox="0 0 200 140" className="h-full w-auto transition-transform duration-500 group-hover:scale-105">
                  {/* Journey Pathway Nodes */}
                  <path d="M 30 110 Q 70 40, 110 80 T 170 30" fill="none" className="stroke-blue-300 dark:stroke-blue-800" strokeWidth="3" strokeDasharray="6 4" />

                  {/* Pathway Checkpoints */}
                  <circle cx="30" cy="110" r="7" className="fill-blue-600" />
                  <circle cx="78" cy="62" r="7" className="fill-amber-400" />
                  <circle cx="110" cy="80" r="7" className="fill-blue-600" />
                  <circle cx="170" cy="30" r="9" className="fill-emerald-500" />
                  <polyline points="166,30 169,33 174,27" fill="none" className="stroke-white" strokeWidth="2" />

                  {/* Visitor Character Vector */}
                  <g className="animate-float-soft">
                    {/* Character Body */}
                    <path d="M 68 115 C 68 95, 92 95, 92 115" className="fill-emerald-600" />
                    {/* Head */}
                    <circle cx="80" cy="82" r="13" className="fill-amber-200 dark:fill-amber-300" />
                    {/* Hair */}
                    <path d="M 68 80 C 68 67, 92 67, 92 80 Z" className="fill-slate-800 dark:fill-slate-900" />
                    {/* Raised Arm Holding Map/Compass */}
                    <path d="M 90 98 L 105 92" className="stroke-amber-200 dark:stroke-amber-300" strokeWidth="3.5" strokeLinecap="round" />
                  </g>

                  {/* Compass / Question Indicator */}
                  <g className="transition-transform duration-500 group-hover:rotate-12 transform-origin-center">
                    <circle cx="115" cy="88" r="14" className="fill-white dark:fill-slate-900 stroke-blue-600" strokeWidth="2.5" />
                    <polygon points="115,78 119,88 115,86 111,88" className="fill-rose-500" />
                    <polygon points="115,98 119,88 115,90 111,88" className="fill-slate-400" />
                  </g>

                  {/* Pulsing Friction Alert */}
                  <g className="animate-pulse">
                    <circle cx="78" cy="42" r="10" className="fill-amber-500/20" />
                    <circle cx="78" cy="42" r="6" className="fill-amber-500" />
                    <text x="78" y="45" textAnchor="middle" className="fill-white font-bold text-[9px]">?</text>
                  </g>
                </svg>

                {/* Floating Icon Badge */}
                <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/30">
                  <Compass className="h-4 w-4" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-sans">
                Unclear customer journeys
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Visitors may not understand what a business offers or what action they should take next due to unclear CTAs or confusing navigation flow.
              </p>
            </div>
          </div>

          {/* Card 3: Uncertain Digital Media */}
          <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-md transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 dark:border-slate-800 dark:bg-slate-900">
            <div>
              {/* Animated Character Vector Illustration 3 */}
              <div className="relative mb-6 flex h-44 w-full items-center justify-center overflow-hidden rounded-xl bg-slate-50 p-4 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
                <svg viewBox="0 0 200 140" className="h-full w-auto transition-transform duration-500 group-hover:scale-105">
                  {/* Digital Image Media Frame */}
                  <rect x="35" y="20" width="130" height="90" rx="8" className="fill-slate-100 dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-700" strokeWidth="2" />

                  {/* Image Graphic Elements */}
                  <path d="M 45 90 L 75 55 L 105 85 L 130 65 L 155 90 Z" className="fill-blue-500/20 dark:fill-blue-500/30" />
                  <circle cx="65" cy="45" r="8" className="fill-amber-400/70" />

                  {/* Forensic Scan Wave Lines */}
                  <line x1="35" y1="55" x2="165" y2="55" className="stroke-blue-500/40" strokeWidth="1.5" strokeDasharray="4 2" />
                  <line x1="35" y1="75" x2="165" y2="75" className="stroke-blue-500/40" strokeWidth="1.5" strokeDasharray="4 2" />

                  {/* Media Inspector Character Vector */}
                  <g className="animate-float-soft">
                    {/* Character Body */}
                    <path d="M 130 115 C 130 95, 160 95, 160 115" className="fill-indigo-600" />
                    {/* Head */}
                    <circle cx="145" cy="80" r="13" className="fill-amber-200 dark:fill-amber-300" />
                    {/* Hair */}
                    <path d="M 133 78 C 133 65, 157 65, 157 78 Z" className="fill-slate-800 dark:fill-slate-900" />
                  </g>

                  {/* Authenticity Verification Shield Badge */}
                  <g className="transition-transform duration-500 group-hover:scale-110 transform-origin-center">
                    <path d="M 100 35 L 118 43 V 60 C 118 73, 100 83, 100 83 C 100 83, 82 73, 82 60 V 43 Z" className="fill-blue-600 stroke-white" strokeWidth="2" />
                    <polyline points="93,57 98,62 107,51" fill="none" className="stroke-white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </g>

                  {/* C2PA Provenance Tag */}
                  <g className="animate-pulse">
                    <rect x="42" y="27" width="48" height="14" rx="4" className="fill-blue-500" />
                    <text x="66" y="37" textAnchor="middle" className="fill-white font-mono font-bold text-[8px]">C2PA VERIFIED</text>
                  </g>
                </svg>

                {/* Floating Icon Badge */}
                <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/30">
                  <ShieldAlert className="h-4 w-4" />
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-sans">
                Uncertain digital media
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                AI-generated and manipulated synthetic media is becoming increasingly difficult to assess by visual inspection alone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
