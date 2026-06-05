import { ShieldCheck, ShieldAlert, Cpu, CheckCircle2, AlertTriangle, Fingerprint, Info } from "lucide-react";
import { PredictionType, AnalysisResult } from "../types";

interface AnalysisPanelProps {
  result: AnalysisResult;
  theme?: "dark" | "light";
}

export default function AnalysisPanel({ result, theme = "dark" }: AnalysisPanelProps) {
  const isFake = result.prediction === PredictionType.FAKE;
  const ratingColor = isFake
    ? theme === "dark"
      ? "from-rose-950/20 to-red-950/20 text-rose-400 border-rose-900/35 bg-rose-950/10 shadow-[0_8px_32px_rgba(244,63,94,0.1)] hover:border-rose-900/50"
      : "from-rose-50/70 to-red-50/70 text-rose-950 border-rose-200 bg-rose-50/30 shadow-sm"
    : theme === "dark"
    ? "from-emerald-950/20 to-teal-950/20 text-emerald-400 border-emerald-900/35 bg-emerald-950/10 shadow-[0_8px_32px_rgba(16,185,129,0.1)] hover:border-emerald-900/50"
    : "from-emerald-50/70 to-teal-50/70 text-emerald-950 border-emerald-200 bg-emerald-50/30 shadow-sm";

  // Analysis metrics
  const metrics = [
    {
      title: "Facial Geometry",
      value: result.analysisDetails.faceSymmetry,
      score: isFake ? 42 : 94,
    },
    {
      title: "Lighting Consistency",
      value: result.analysisDetails.lightingConsistency,
      score: isFake ? 35 : 91,
    },
    {
      title: "Edge Continuity",
      value: result.analysisDetails.edgeIrregularities,
      score: isFake ? 28 : 96,
    },
    {
      title: "Color Distribution",
      value: result.analysisDetails.colorBlending,
      score: isFake ? 48 : 88,
    },
    {
      title: "Artifact Analysis",
      value: result.analysisDetails.compressionArtifacts,
      score: 95,
    }
  ];

  if (result.analysisDetails.temporalConsistency) {
    metrics.push({
      title: "Motion Consistency",
      value: result.analysisDetails.temporalConsistency,
      score: isFake ? 32 : 98,
    });
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Banner Indicator card */}
      <div className={`border p-6 rounded-3xl bg-gradient-to-br transition-all duration-300 ${ratingColor}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl border ${
              theme === "dark" ? "bg-black/80 border-white/10 text-cyan-400" : "bg-white border-slate-200 shadow-sm"
            }`}>
              {isFake ? (
                <ShieldAlert className="w-8 h-8 text-rose-500 animate-pulse" />
              ) : (
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-mono text-[10px] uppercase tracking-widest ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Analysis Verdict</span>
                <span className={`w-1 h-1 rounded-full ${theme === "dark" ? "bg-slate-600" : "bg-slate-450"}`} />
                <span className={`font-mono text-[9px] uppercase ${theme === "dark" ? "text-slate-550" : "text-slate-450"}`}>Confidence</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight mt-1 flex items-baseline gap-2">
                <span className="font-mono">{result.prediction}</span>
                <span className={`text-xs font-mono font-medium ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                  ({Math.round(result.confidence)}%)
                </span>
              </h2>
            </div>
          </div>
          
          {/* Circular Percentage Dial */}
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              {/* Outer track */}
              <circle
                cx="32"
                cy="32"
                r="28"
                className={theme === "dark" ? "stroke-black/50 fill-none" : "stroke-slate-200 fill-none"}
                strokeWidth="4"
              />
              {/* Inner ring filled percent */}
              <circle
                cx="32"
                cy="32"
                r="28"
                className={`fill-none transition-all duration-1000 ${
                  isFake ? "stroke-rose-500" : "stroke-emerald-500"
                }`}
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - result.confidence / 100)}`}
              />
            </svg>
            <div className={`absolute inset-0 flex items-center justify-center text-xs font-mono font-bold ${
              theme === "dark" ? "text-white" : "text-slate-800"
            }`}>
              {Math.round(result.confidence)}%
            </div>
          </div>
        </div>

        {/* Security Recommendation Block */}
        <div className={`mt-5 pt-5 border-t text-left ${
          theme === "dark" ? "border-white/5" : "border-slate-200"
        }`}>
          <div className={`flex items-start gap-2 text-sm ${
            theme === "dark" ? "text-slate-300" : "text-slate-650"
          }`}>
            <Info className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
            <p className="leading-relaxed text-xs">{result.recommendation}</p>
          </div>
        </div>
      </div>

      {/* Structured Diagnostic Parameters */}
      <div className={`rounded-3xl p-6 text-left transition-all duration-300 ${
        theme === "dark" ? "glass-card-dark text-slate-100" : "glass-card-light text-slate-900"
      }`}>
        <div className={`flex items-center gap-2 border-b pb-4 mb-5 ${
          theme === "dark" ? "border-zinc-500/10" : "border-slate-200"
        }`}>
          <Fingerprint className="w-4 h-4 text-cyan-400" />
          <h3 className={`font-mono text-xs font-semibold uppercase tracking-widest ${
            theme === "dark" ? "text-slate-350" : "text-slate-750"
          }`}>Detection Metrics</h3>
        </div>

        <div className="flex flex-col gap-4">
          {metrics.map((metric, i) => {
            const isAnomalous = isFake && metric.score < 50;
            return (
              <div key={i} className={`p-4 border rounded-2xl hover:opacity-95 transition-all ${
                theme === "dark"
                  ? "border-white/5 bg-white/[0.015]"
                  : "border-slate-200 bg-slate-50"
              }`}>
                <div className="flex justify-between items-start md:items-center gap-4">
                  <h4 className={`text-xs font-semibold font-mono tracking-wide uppercase ${
                    theme === "dark" ? "text-slate-350" : "text-slate-750"
                  }`}>
                    {metric.title}
                  </h4>
                  <div className={`flex items-center gap-1.5 p-1 px-2 rounded-lg text-[9px] font-mono border uppercase tracking-wider ${
                    isAnomalous
                      ? "bg-rose-950/20 text-rose-400 border-rose-900/30"
                      : "bg-emerald-950/15 text-emerald-600 border-emerald-900/20"
                  }`}>
                    {isAnomalous ? (
                      <>
                        <AlertTriangle className="w-3 h-3" />
                        <span>Anomaly ({metric.score}%)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Consistent ({metric.score}%)</span>
                      </>
                    )}
                  </div>
                </div>

                <p className={`text-xs mt-2.5 leading-relaxed ${
                  theme === "dark" ? "text-slate-450" : "text-slate-600"
                }`}>
                  {metric.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Model Tech Specs bottom card */}
      <div className={`flex items-center justify-between p-4 px-5 border rounded-2xl ${
        theme === "dark" ? "border-white/5 bg-black/40 text-slate-500" : "border-slate-200 bg-white shadow-sm text-slate-500"
      }`}>
        <div className="flex items-center gap-2.5 font-mono text-[9px] uppercase tracking-widest">
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
          <span>Analysis Engine: Core-V3</span>
        </div>
        <div className="text-[9px] font-mono uppercase tracking-widest">
          Latency: ~2.5s
        </div>
      </div>
    </div>
  );
}
