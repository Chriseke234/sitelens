import React from "react";
import {
  TrendingUp,
  Gauge,
  UserCheck,
  Layout,
  Target,
  ShieldCheck,
} from "lucide-react";

export function FeaturesGrid() {
  const features = [
    {
      title: "SEO",
      description: "Identify technical and on-page issues affecting search visibility.",
      icon: TrendingUp,
    },
    {
      title: "Performance",
      description: "Surface measurable performance problems and opportunities.",
      icon: Gauge,
    },
    {
      title: "Accessibility",
      description: "Identify accessibility issues that can make websites harder to use.",
      icon: UserCheck,
    },
    {
      title: "UX",
      description: "Analyze structure, clarity, hierarchy, and user experience.",
      icon: Layout,
    },
    {
      title: "Conversion",
      description: "Identify friction and opportunities to make important actions clearer.",
      icon: Target,
    },
    {
      title: "Trust",
      description: "Review signals that influence how credible and trustworthy a digital presence appears.",
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="capabilities" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Comprehensive Analysis
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl md:text-4xl">
            One audit. Multiple layers of intelligence.
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            SiteLens inspects key technical, visual, and user-experience dimensions to provide a complete evaluation of digital presence.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex flex-col rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm card-hover-effect dark:border-slate-800 dark:bg-slate-900 group"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-950/60 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-sans">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
