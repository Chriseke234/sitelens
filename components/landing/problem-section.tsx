import React from "react";
import { EyeOff, Compass, ShieldAlert } from "lucide-react";

export function ProblemSection() {
  const problems = [
    {
      title: "Hidden website problems",
      description:
        "Technical, UX, accessibility, and performance issues can be difficult to identify manually.",
      icon: EyeOff,
    },
    {
      title: "Unclear customer journeys",
      description:
        "Visitors may not understand what a business offers or what they should do next.",
      icon: Compass,
    },
    {
      title: "Uncertain digital media",
      description:
        "AI-generated and manipulated media is becoming increasingly difficult to assess by looking at it alone.",
      icon: ShieldAlert,
    },
  ];

  return (
    <section className="border-t border-slate-200/80 bg-white py-16 dark:border-slate-800 dark:bg-slate-900/40 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl md:text-4xl">
            Your website can look good and still lose customers.
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            A website can have traffic, beautiful visuals, and a polished design while still creating friction for the people who visit it.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {problems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 p-6 shadow-sm transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >
                <div>
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
