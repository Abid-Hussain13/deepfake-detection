import { useState, useEffect } from "react";
import { Eye, EyeOff, ShieldAlert, Target, Sparkles, User, Crosshair } from "lucide-react";
import { AnalysisResult, DetectedFace, SuspiciousArea } from "../types";

interface ForensicViewerProps {
  mediaSrc: string; // Base64 or objectUrl
  mediaType: "image" | "video";
  result: AnalysisResult | null;
  theme?: "dark" | "light";
}

// Visual representation of face mapping for placeholders
const FaceMeshFallback = ({ theme }: { theme: "dark" | "light" }) => {
  return (
    <svg
      viewBox="0 0 400 300"
      className="w-full h-full max-h-[380px] object-contain select-none"
    >
      {/* Background coordinate grid */}
      <defs>
        <pattern id="hud-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            className={theme === "dark" ? "stroke-white/[0.02]" : "stroke-slate-900/[0.03]"}
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hud-grid)" />

      {/* Reference target meshes */}
      <circle
        cx="200"
        cy="150"
        r="110"
        className={theme === "dark" ? "stroke-cyan-500/10 fill-none" : "stroke-cyan-500/[0.07] fill-none"}
        strokeWidth="1"
        strokeDasharray="4 8"
      />
      <circle
        cx="200"
        cy="150"
        r="135"
        className={theme === "dark" ? "stroke-indigo-500/10 fill-none" : "stroke-indigo-500/[0.07] fill-none"}
        strokeWidth="1"
        strokeDasharray="40 180"
      />

      {/* Target Crosshairs */}
      <path
        d="M 200 10 L 200 290 M 10 150 L 390 150"
        className={theme === "dark" ? "stroke-white/[0.05]" : "stroke-black/[0.04]"}
        strokeWidth="0.5"
      />

      {/* Facial Contour */}
      <path
        d="M 120 100 Q 120 230 200 245 Q 280 230 280 100"
        fill="none"
        className={theme === "dark" ? "stroke-cyan-500/40" : "stroke-cyan-500/30"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Eye and eyebrow structures */}
      <path
        d="M 138 105 Q 162 96 182 105"
        fill="none"
        className={theme === "dark" ? "stroke-indigo-400/50" : "stroke-indigo-500/40"}
        strokeWidth="2"
      />
      <path
        d="M 218 105 Q 238 96 262 105"
        fill="none"
        className={theme === "dark" ? "stroke-indigo-400/50" : "stroke-indigo-500/40"}
        strokeWidth="2"
      />

      {/* Eye Indicators */}
      <circle
        cx="165"
        cy="125"
        r="12"
        className={theme === "dark" ? "stroke-cyan-400/50 fill-none" : "stroke-cyan-500/45 fill-none"}
        strokeWidth="1.5"
      />
      <circle cx="165" cy="125" r="3" className="fill-cyan-400" />
      
      <circle
        cx="235"
        cy="125"
        r="12"
        className={theme === "dark" ? "stroke-cyan-400/50 fill-none" : "stroke-cyan-500/45 fill-none"}
        strokeWidth="1.5"
      />
      <circle cx="235" cy="125" r="3" className="fill-cyan-400" />

      <line
        x1="165"
        y1="125"
        x2="235"
        y2="125"
        className={theme === "dark" ? "stroke-cyan-400/20" : "stroke-cyan-500/15"}
        strokeWidth="1"
        strokeDasharray="2"
      />

      {/* Nose bridge */}
      <path
        d="M 200 105 L 200 180 Q 200 190 192 195 L 208 195 Q 200 190 200 180"
        fill="none"
        className={theme === "dark" ? "stroke-cyan-500/50" : "stroke-cyan-500/40"}
        strokeWidth="1.5"
      />

      {/* Mouth mapping */}
      <path
        d="M 160 212 C 160 212 180 202 200 202 C 220 202 240 212 240 212 C 240 212 220 226 200 226 C 180 226 160 212 160 212 Z"
        fill="none"
        className={theme === "dark" ? "stroke-indigo-400/50" : "stroke-indigo-500/40"}
        strokeWidth="1.5"
      />

      {/* Wireframe landmarks */}
      <path
        d="M 120 100 L 165 125 L 200 105 L 235 125 L 280 100 M 165 125 L 200 180 L 235 125 M 200 180 L 160 212 L 200 245 L 240 212 L 200 180 M 120 100 L 160 212 L 200 245 M 280 100 L 240 212 L 200 245"
        fill="none"
        className={theme === "dark" ? "stroke-cyan-500/[0.12]" : "stroke-cyan-500/[0.08]"}
        strokeWidth="1"
      />

      {/* Scan bounding frame */}
      <rect
        x="95"
        y="58"
        width="210"
        height="205"
        fill="none"
        className={theme === "dark" ? "stroke-cyan-400/20" : "stroke-cyan-500/25"}
        strokeWidth="1"
        strokeDasharray="6 4"
      />

      {/* Text indicators */}
      <text
        x="200"
        y="45"
        textAnchor="middle"
        className="font-mono text-[9px] uppercase tracking-widest font-bold fill-cyan-400/50 dark:fill-cyan-400/60"
      >
        Analysis Map
      </text>
      <text
        x="200"
        y="280"
        textAnchor="middle"
        className="font-mono text-[7px] uppercase tracking-wider fill-slate-500/50 dark:fill-slate-500/40"
      >
        Source data not available in history
      </text>
    </svg>
  );
};

export default function ForensicViewer({ mediaSrc, mediaType, result, theme = "dark" }: ForensicViewerProps) {
  const [showFaceBoxes, setShowFaceBoxes] = useState(true);
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [activeArea, setActiveArea] = useState<SuspiciousArea | null>(null);
  const [activeFace, setActiveFace] = useState<DetectedFace | null>(null);
  const [hasImageError, setHasImageError] = useState(false);

  // Reset image error state when source flips
  useEffect(() => {
    setHasImageError(false);
  }, [mediaSrc]);

  // Determine whether we should display the wireframe fallback representation
  const showFallback = 
    !mediaSrc || 
    mediaSrc === "/api/placeholder" || 
    hasImageError || 
    (mediaType === "video" && mediaSrc.trim() === "");

  return (
    <div className={`flex flex-col h-full rounded-3xl overflow-hidden p-5 transition-all duration-300 ${
      theme === "dark" ? "glass-card-dark text-slate-100" : "glass-card-light text-slate-900"
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between border-b pb-4 mb-4 ${
        theme === "dark" ? "border-zinc-500/10" : "border-slate-200"
      }`}>
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-cyan-400" />
          <h3 className={`font-mono text-sm uppercase tracking-wider ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>Analysis Overlays</h3>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFaceBoxes(!showFaceBoxes)}
            className={`flex items-center gap-1.5 p-1 px-2.5 rounded-md text-xs font-mono border transition-all cursor-pointer ${
              showFaceBoxes
                ? "bg-cyan-550/10 border-cyan-500/40 text-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.1)] font-semibold"
                : theme === "dark"
                ? "bg-white/[0.02] border-white/5 text-slate-500 hover:text-slate-400"
                : "bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-700"
            }`}
          >
            {showFaceBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Face Zones</span>
          </button>

          <button
            onClick={() => setShowAnomalies(!showAnomalies)}
            className={`flex items-center gap-1.5 p-1 px-2.5 rounded-md text-xs font-mono border transition-all cursor-pointer ${
              showAnomalies
                ? "bg-rose-550/10 border-rose-500/40 text-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.1)] font-semibold"
                : theme === "dark"
                ? "bg-white/[0.02] border-white/5 text-slate-500 hover:text-slate-400"
                : "bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-700"
            }`}
          >
            {showAnomalies ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Anomalies</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Display */}
      <div className={`relative flex-1 flex items-center justify-center rounded-2xl overflow-hidden min-h-[300px] border transition-all duration-300 ${
        theme === "dark" ? "bg-slate-950/60 border-slate-900" : "bg-slate-150/60 border-slate-200"
      }`}>
        {showFallback ? (
          <FaceMeshFallback theme={theme} />
        ) : mediaType === "video" ? (
          <video
            src={mediaSrc}
            controls
            className="w-full max-h-[420px] object-contain text-slate-100"
          />
        ) : (
          <img
            src={mediaSrc}
            alt="Analysis viewport"
            className="w-full max-h-[420px] object-contain select-none"
            referrerPolicy="no-referrer"
            onError={() => setHasImageError(true)}
          />
        )}

        {/* Scanning Overlay */}
        {result === null && mediaSrc && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-cyan-400/60 shadow-[0_0_12px_#06b6d4] animate-scan-line" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.03),transparent)]" />
            <div className={`absolute top-4 left-4 font-mono text-[10px] p-1.5 px-2 border rounded uppercase tracking-widest flex items-center gap-1.5 animate-pulse ${
              theme === "dark" ? "bg-black/80 border-white/10 text-cyan-400" : "bg-white/90 border-slate-200 text-cyan-600 shadow-sm"
            }`}>
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
              Analyzing...
            </div>
          </div>
        )}

        {/* Overlay Markers */}
        {result && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            {/* Face Bounding Boxes */}
            {showFaceBoxes &&
              result.detectedFaces.map((face) => (
                <div
                  key={face.id}
                  className="absolute border border-cyan-400/80 shadow-[0_0_10px_rgba(6,182,212,0.3)] bg-cyan-950/5 pointer-events-auto cursor-pointer transition-all hover:bg-cyan-950/20 hover:border-cyan-300"
                  style={{
                    left: `${face.box.x}%`,
                    top: `${face.box.y}%`,
                    width: `${face.box.width}%`,
                    height: `${face.box.height}%`,
                  }}
                  onMouseEnter={() => setActiveFace(face)}
                  onMouseLeave={() => setActiveFace(null)}
                >
                  {/* Face Corners */}
                  <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400 -mt-[1px] -ml-[1px]" />
                  <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400 -mt-[1px] -mr-[1px]" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400 -mb-[1px] -ml-[1px]" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400 -mb-[1px] -mr-[1px]" />

                  {/* Rating Badge */}
                  <div className="absolute -top-6 left-0 bg-slate-950/90 border border-cyan-400/40 text-[10px] font-mono p-0.5 px-2 rounded backdrop-blur-md text-cyan-400 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>
                      {face.label}: {Math.round(face.score)}% Authenticity
                    </span>
                  </div>
                </div>
              ))}

            {/* Suspicious Areas */}
            {showAnomalies &&
              result.suspiciousAreas.map((area) => (
                <div
                  key={area.id}
                  className={`absolute border-2 border-dashed pointer-events-auto cursor-pointer transition-all ${
                    area.severity === "high"
                      ? "border-rose-500/80 bg-rose-950/10 shadow-[0_0_8px_rgba(244,63,94,0.3)] hover:bg-rose-950/20 hover:border-rose-400"
                      : area.severity === "medium"
                      ? "border-amber-500/80 bg-amber-950/5 shadow-[0_0_8px_rgba(245,158,11,0.2)] hover:bg-amber-950/15 hover:border-amber-400"
                      : "border-cyan-500/60 bg-cyan-950/5 shadow-[0_0_8px_rgba(6,182,212,0.1)] hover:bg-cyan-950/15 hover:border-cyan-400"
                  }`}
                  style={{
                    left: `${area.x}%`,
                    top: `${area.y}%`,
                    width: `${area.width}%`,
                    height: `${area.height}%`,
                  }}
                  onMouseEnter={() => setActiveArea(area)}
                  onMouseLeave={() => setActiveArea(null)}
                >
                  {/* Warning Dot */}
                  <div className="absolute -top-2.5 -right-2.5 flex h-5 w-5 pointer-events-none">
                    <span
                      className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        area.severity === "high"
                          ? "bg-rose-400"
                          : area.severity === "medium"
                          ? "bg-amber-400"
                          : "bg-cyan-400"
                      }`}
                    />
                    <span
                      className={`relative inline-flex rounded-full h-5 w-5 items-center justify-center border text-[9px] font-black text-slate-950 ${
                        area.severity === "high"
                          ? "bg-rose-500 border-rose-300"
                          : area.severity === "medium"
                          ? "bg-amber-500 border-amber-300"
                          : "bg-cyan-500 border-cyan-300"
                      }`}
                    >
                      !
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Interactive Info HUD */}
      <div className="mt-4 p-4 border border-slate-900 bg-slate-950/75 rounded-xl min-h-[76px] flex items-center">
        {activeArea ? (
          <div className="flex gap-3 text-left">
            <div
              className={`p-2 rounded-lg shrink-0 ${
                activeArea.severity === "high"
                  ? "bg-rose-950/40 text-rose-400 border border-rose-900/40"
                  : activeArea.severity === "medium"
                  ? "bg-amber-950/40 text-amber-400 border border-amber-900/40"
                  : "bg-cyan-950/40 text-cyan-400 border border-cyan-900/40"
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold capitalize font-mono text-slate-200">
                  Anomaly Detected ({activeArea.severity} Severity)
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{activeArea.description}</p>
            </div>
          </div>
        ) : activeFace ? (
          <div className="flex gap-3 text-left">
            <div className="p-2 bg-cyan-950/40 border border-cyan-900/40 text-cyan-400 rounded-lg shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold font-mono text-slate-200 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                Face Details
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                <span className="font-mono text-cyan-400">{activeFace.label}: </span>
                {activeFace.reason}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 font-mono text-center w-full uppercase tracking-widest text-[10px]">
            {result
              ? "Hover over boundary markers to inspect details"
              : "Upload and analyze media to view interactive overlays"}
          </p>
        )}
      </div>
    </div>
  );
}
