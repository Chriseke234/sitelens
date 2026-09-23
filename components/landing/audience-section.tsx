import React from "react";
import { Building2, Briefcase, UserCheck2, LineChart } from "lucide-react";

export function AudienceSection() {
  const audiences = [
    {
      title: "Business owners",
      description: "Understand where your website may be creating friction.",
      icon: Building2,
    },
    {
      title: "Agencies",
      description: "Create professional website audits for clients and prospects.",
      icon: Briefcase,
    },
    {
      title: "Freelancers",
      description: "Use evidence-based audits to identify opportunities before proposing a project.",
      icon: UserCheck2,
    },
    {
      title: "Marketing teams",
      description: "Monitor website quality and turn findings into practical improvements.",
      icon: LineChart,
    },
  ];

  return (
    <section id="audience" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Target Use Cases
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl md:text-4xl">
            Built for professionals who care about website performance.
          </h2>
          <p className="mt-3 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Whether managing your own site or advising clients, SiteLens provides structured insights.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map((audience, index) => {
            const Icon = audience.icon;
            return (
              <div
                key={index}
                className="flex flex-col rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm card-hover-effect dark:border-slate-800 dark:bg-slate-900 group"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm dark:bg-blue-950/60 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-sans">
                  {audience.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {audience.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
