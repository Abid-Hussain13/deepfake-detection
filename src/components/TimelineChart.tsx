import { useState } from "react";
import { AreaChart, TrendingUp } from "lucide-react";
import { TimelinePoint } from "../types";

interface TimelineChartProps {
  points: TimelinePoint[];
  theme?: "dark" | "light";
}

export default function TimelineChart({ points, theme = "dark" }: TimelineChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<TimelinePoint | null>(null);

  if (!points || points.length === 0) return null;

  // Calculate SVG line coordinates
  const chartHeight = 80;
  const chartWidth = 500;
  const padding = 20;

  const pointsCount = points.length;
  const xMultiplier = (chartWidth - padding * 2) / (pointsCount - 1);
  const yScale = (chartHeight - padding * 2) / 100; // 0-100% probability

  const svgPoints = points.map((p, index) => {
    const x = padding + index * xMultiplier;
    const y = chartHeight - padding - p.fakeProbability * yScale;
    return { x, y, p };
  });

  // Construct SVG path string for lines and fills
  let pathStr = "";
  let areaStr = `M ${padding} ${chartHeight - padding} `;

  svgPoints.forEach((pt, idx) => {
    if (idx === 0) {
      pathStr += `M ${pt.x} ${pt.y} `;
    } else {
      pathStr += `L ${pt.x} ${pt.y} `;
    }
    areaStr += `L ${pt.x} ${pt.y} `;
  });

  areaStr += `L ${svgPoints[svgPoints.length - 1].x} ${chartHeight - padding} Z`;

  return (
    <div className={`p-6 rounded-3xl text-left transition-all duration-300 ${
      theme === "dark" ? "glass-card-dark text-slate-100" : "glass-card-light text-slate-900"
    }`}>
      <div className={`flex items-center justify-between border-b pb-3 mb-4 ${
        theme === "dark" ? "border-zinc-500/10" : "border-slate-200"
      }`}>
        <div className="flex items-center gap-2">
          <AreaChart className="w-4 h-4 text-indigo-400" />
          <h4 className={`font-mono text-xs uppercase tracking-widest ${
            theme === "dark" ? "text-slate-300" : "text-slate-700"
          }`}>
            Video Timeline Analysis
          </h4>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-mono uppercase tracking-widest">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            Authentic
          </span>
          <span className="flex items-center gap-1.5 text-amber-500 font-semibold">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            Warning
          </span>
          <span className="flex items-center gap-1.5 text-rose-500 font-semibold">
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
            Manipulated
          </span>
        </div>
      </div>

      {/* Graph Display */}
      <div className={`relative w-full h-[120px] rounded-2xl p-4 pb-6 flex items-center justify-center border transition-all ${
        theme === "dark" ? "bg-slate-950/60 border-white/5" : "bg-slate-50 border-slate-200 shadow-sm"
      }`}>
        {/* Horizontal grid lines */}
        <div className={`absolute inset-x-4 top-[30px] border-t pointer-events-none ${theme === "dark" ? "border-white/5" : "border-slate-200/40"}`} />
        <div className={`absolute inset-x-4 top-[60px] border-t pointer-events-none ${theme === "dark" ? "border-white/5" : "border-slate-200/40"}`} />
        <div className={`absolute inset-x-4 top-[90px] border-t pointer-events-none ${theme === "dark" ? "border-white/5" : "border-slate-200/40"}`} />

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full overflow-visible"
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>

          {/* Fill Area Chart */}
          <path d={areaStr} fill="url(#areaGrad)" />

          {/* Connection line path */}
          <path
            d={pathStr}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Coordinate Nodes */}
          {svgPoints.map((pt, idx) => {
            const isHovered = hoveredPoint?.seconds === pt.p.seconds;
            let dotColor = "fill-emerald-400 stroke-slate-950";
            if (pt.p.fakeProbability > 70) dotColor = "fill-rose-500 stroke-slate-950";
            else if (pt.p.fakeProbability > 40) dotColor = "fill-amber-500 stroke-slate-950";

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredPoint(pt.p)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer pointer-events-auto"
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  className={`${dotColor} transition-all duration-150`}
                  strokeWidth="1.5"
                />
                
                {/* Timeline labels */}
                <text
                  x={pt.x}
                  y={chartHeight - 2}
                  textAnchor="middle"
                  className={`font-mono text-[8px] tracking-tighter ${
                    theme === "dark" ? "fill-slate-650" : "fill-slate-400"
                  }`}
                >
                  {pt.p.time}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredPoint && (
          <div className={`absolute top-2 left-1/2 -translate-x-1/2 p-2 px-3 border rounded-lg text-xs font-mono backdrop-blur-md flex items-center gap-2 shadow-md ${
            theme === "dark" ? "bg-black/90 border-white/10 text-slate-300" : "bg-white/95 border-slate-200 text-slate-750"
          }`}>
            <span className={theme === "dark" ? "text-slate-500" : "text-slate-400"}>{hoveredPoint.time}</span>
            <span className={theme === "dark" ? "text-slate-700" : "text-slate-300"}>|</span>
            <span>
              Probability:{" "}
              <span
                className={
                  hoveredPoint.fakeProbability > 60
                    ? "text-rose-500 font-semibold"
                    : hoveredPoint.fakeProbability > 30
                    ? "text-amber-500 font-semibold"
                    : "text-emerald-500"
                }
              >
                {hoveredPoint.fakeProbability}%
              </span>
            </span>
            <span className={theme === "dark" ? "text-slate-700" : "text-slate-300"}>|</span>
            <span
              className={`text-[9px] font-bold ${
                hoveredPoint.status === "FAKE"
                  ? "text-rose-500"
                  : hoveredPoint.status === "SUSPICIOUS"
                  ? "text-amber-500"
                  : "text-emerald-500"
              }`}
            >
              {hoveredPoint.status === "FAKE" ? "MANIPULATED" : hoveredPoint.status}
            </span>
          </div>
        )}
      </div>

      <div className={`mt-4 flex items-center gap-2 text-xs p-2.5 rounded-lg border font-mono ${
        theme === "dark" ? "text-slate-500 bg-white/[0.015] border-white/5" : "text-slate-650 bg-slate-100/50 border-slate-200"
      }`}>
        <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
        <span>Analysis of frame transitions and pixel consistency across the sequence.</span>
      </div>
    </div>
  );
}
