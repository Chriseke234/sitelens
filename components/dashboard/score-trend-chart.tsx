"use client";

import React from "react";

export interface TrendPoint {
  label: string;
  date: string;
  score: number;
}

interface ScoreTrendChartProps {
  title?: string;
  points: TrendPoint[];
  color?: string;
}

export function ScoreTrendChart({
  title = "Audit Score Over Time",
  points,
  color = "#2563eb", // Primary blue
}: ScoreTrendChartProps) {
  if (!points || points.length === 0) {
    return null;
  }

  if (points.length === 1) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">{title}</h4>
        <p className="text-xs text-slate-500">
          Single audit recorded ({points[0].score}/100 on {new Date(points[0].date).toLocaleDateString()}). Run another audit of this domain to track changes over time.
        </p>
      </div>
    );
  }

  // Calculate SVG dimensions
  const width = 500;
  const height = 180;
  const paddingX = 40;
  const paddingY = 30;

  const minScore = 0;
  const maxScore = 100;

  const stepX = (width - paddingX * 2) / (points.length - 1);

  const coords = points.map((p, idx) => {
    const x = paddingX + idx * stepX;
    const y = height - paddingY - ((p.score - minScore) / (maxScore - minScore)) * (height - paddingY * 2);
    return { x, y, point: p };
  });

  const pathD = coords.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, "");

  // Area under path
  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${height - paddingY} L ${coords[0].x} ${height - paddingY} Z`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h4>
          <p className="text-xs text-slate-500">Recorded audit score history over time</p>
        </div>
        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
          Latest: {points[points.length - 1].score}/100
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-h-48 overflow-visible">
          <defs>
            <linearGradient id="scoreTrendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#e2e8f0" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#e2e8f0" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#e2e8f0" />

          {/* Area fill */}
          <path d={areaD} fill="url(#scoreTrendGrad)" />

          {/* Line path */}
          <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {coords.map((c, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle cx={c.x} cy={c.y} r="4" fill="#ffffff" stroke={color} strokeWidth="2.5" />
              <text
                x={c.x}
                y={c.y - 10}
                textAnchor="middle"
                className="text-[10px] font-bold fill-slate-700 dark:fill-slate-200"
              >
                {c.point.score}
              </text>
              <text
                x={c.x}
                y={height - 10}
                textAnchor="middle"
                className="text-[9px] fill-slate-400"
              >
                {new Date(c.point.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
