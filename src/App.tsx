import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Cpu,
  Fingerprint,
  Info,
  Layers,
  Sparkles,
  Sun,
  Moon,
  Github,
  HelpCircle,
  Video,
  Image as ImageIcon,
  CheckCircle,
  HelpCircle as QuestionIcon
} from "lucide-react";

import { PredictionType, AnalysisResult } from "./types";
import UploadZone from "./components/UploadZone";
import ForensicViewer from "./components/ForensicViewer";
import AnalysisPanel from "./components/AnalysisPanel";
import TimelineChart from "./components/TimelineChart";
import HistorySidebar from "./components/HistorySidebar";
import { loadHistory, saveHistoryItem, clearHistory } from "./utils/history";

export default function App() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeMedia, setActiveMedia] = useState<{
    fileData: string;
    fileName: string;
    fileType: string;
    fileSize: string;
    frames?: string[];
  } | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [progressLog, setProgressLog] = useState<string>("");

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleMediaLoaded = (payload: typeof activeMedia) => {
    setActiveMedia(payload);
    setResult(null);
    setProgressLog("");
  };

  const triggerForensicScan = async () => {
    if (!activeMedia) return;

    setIsLoading(true);
    setResult(null);

    const logs = [
      "Establishing connection...",
      "Isolating facial regions...",
      "Analyzing lighting patterns...",
      "Checking compression artifacts...",
      "Evaluating temporal continuity...",
      "Finalizing forensic report..."
    ];

    let currentLogIndex = 0;
    setProgressLog(logs[0]);
    const logInterval = setInterval(() => {
      currentLogIndex++;
      if (currentLogIndex < logs.length) {
        setProgressLog(logs[currentLogIndex]);
      } else {
        clearInterval(logInterval);
      }
    }, 450);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileData: activeMedia.fileData,
          fileName: activeMedia.fileName,
          fileType: activeMedia.fileType,
          fileSize: activeMedia.fileSize,
          frames: activeMedia.frames
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const data: AnalysisResult = await response.json();
      setResult(data);

      const updatedHistory = saveHistoryItem(data);
      setHistory(updatedHistory);
    } catch (error) {
      console.error("Analysis request failed:", error);
    } finally {
      clearInterval(logInterval);
      setIsLoading(false);
    }
  };

  const handleSelectHistoryResult = (historicResult: AnalysisResult) => {
    setResult(historicResult);
    setActiveMedia({
      fileData: historicResult.mediaType === "video" ? "" : "/api/placeholder",
      fileName: historicResult.fileName,
      fileType: historicResult.mediaType === "video" ? "video/mp4" : "image/jpeg",
      fileSize: historicResult.fileSize
    });
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
      theme === "dark" 
        ? "bg-[#05070A] text-slate-100" 
        : "bg-slate-50 text-slate-900"
    }`}>
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none transition-colors duration-500 bg-blue-600/10 dark:bg-blue-600/15" style={{ opacity: theme === "dark" ? 1 : 0.4 }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[150px] pointer-events-none transition-colors duration-500 bg-indigo-900/15 dark:bg-indigo-900/20" style={{ opacity: theme === "dark" ? 1 : 0.4 }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] pointer-events-none transition-colors duration-500 bg-cyan-500/5 dark:bg-cyan-500/5" style={{ opacity: theme === "dark" ? 0.8 : 0.3 }} />

      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        theme === "dark" ? "glass-nav-dark" : "glass-nav-light"
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <Cpu className="w-4.5 h-4.5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-mono text-xs text-slate-500 uppercase tracking-widest leading-none block">System</span>
              <span className="font-bold tracking-tight text-sm uppercase">Deepfake Inspector</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                theme === "dark" 
                  ? "border-white/10 hover:border-white/20 bg-white/5 text-amber-400" 
                  : "border-slate-200 hover:border-slate-300 bg-white text-indigo-600 shadow-sm"
              }`}
            >
              {theme === "dark" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
            
            <a
              href="https://github.com/muhammadabid65421/deepfake-detector-ai"
              target="_blank"
              rel="noreferrer"
              className={`p-2 rounded-xl border transition-colors hidden sm:flex ${
                theme === "dark"
                  ? "border-white/10 hover:border-white/20 bg-white/5 text-slate-300 hover:text-white"
                  : "border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:text-slate-900 shadow-sm"
              }`}
            >
              <Github className="w-4.5 h-4.5" />
            </a>
          </div>
        </div>
      </nav>

      <header className="max-w-4xl mx-auto px-6 text-center pt-12 pb-6 relative z-10">
        <span className={`inline-flex items-center gap-1.5 p-1 px-3 rounded-full text-xs font-mono font-semibold mb-4 uppercase tracking-widest leading-none border transition-colors duration-300 ${
          theme === "dark"
            ? "bg-cyan-950/40 text-cyan-400 border-cyan-800/20"
            : "bg-cyan-50/70 text-cyan-600 border-cyan-200"
        }`}>
          <Sparkles className="w-3.5 h-3.5" />
          Advanced Media Forensics
        </span>
        <h1 className={`text-4xl sm:text-5xl font-black tracking-tight leading-tight transition-colors duration-300 ${
          theme === "dark" ? "text-slate-100" : "text-slate-950"
        }`}>
          Detect Manipulated Content with <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-400 to-rose-400">
            Intelligent Forensic Analysis
          </span>
        </h1>
        <p className={`mt-4 text-sm max-w-2xl mx-auto leading-relaxed transition-colors duration-300 ${
          theme === "dark" ? "text-slate-400" : "text-slate-600"
        }`}>
          Forensically scan images and videos for facial inconsistencies, lighting anomalies, and temporal mismatches.
        </p>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className={`p-6 rounded-3xl transition-all duration-300 ${
            theme === "dark" ? "glass-card-dark text-slate-100" : "glass-card-light text-slate-900"
          }`}>
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest mb-5 pb-3 border-b border-zinc-500/10 text-left flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Upload Terminal
            </h3>

            <UploadZone onMediaLoaded={handleMediaLoaded} isLoading={isLoading} theme={theme} />

            {activeMedia && (
              <button
                onClick={triggerForensicScan}
                disabled={isLoading}
                className="w-full mt-5 py-4 px-5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 text-slate-950 font-black tracking-wide hover:opacity-90 shadow-lg shadow-indigo-500/15 transition-all text-sm uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-slate-950" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4 fill-slate-950 stroke-[2]" />
                    <span>Run Analysis</span>
                  </>
                )}
              </button>
            )}

            {isLoading && progressLog && (
              <div className={`mt-4 p-3.5 rounded-xl text-left font-mono border ${
                theme === "dark" 
                  ? "bg-black/40 border-white/5 text-cyan-400" 
                  : "bg-slate-100 border-slate-200 text-indigo-600"
              }`}>
                <span className="text-[10px] text-slate-500 block uppercase tracking-wider mb-1">Status:</span>
                <span className="text-xs mt-1 block animate-pulse">
                  &gt; {progressLog}
                </span>
              </div>
            )}
          </div>

          <HistorySidebar
            history={history}
            onSelectResult={handleSelectHistoryResult}
            onClear={handleClearHistory}
            activeId={result?.id}
            theme={theme}
          />
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-1 h-full">
              <ForensicViewer
                mediaSrc={activeMedia?.fileData || ""}
                mediaType={activeMedia?.fileType.startsWith("video/") ? "video" : "image"}
                result={result}
                theme={theme}
              />
            </div>

            <div className="md:col-span-1 text-left flex flex-col h-full">
              {result ? (
                <AnalysisPanel result={result} theme={theme} />
              ) : (
                <div className={`h-full min-h-[350px] flex flex-col items-center justify-center p-8 text-center rounded-3xl transition-all duration-300 ${
                  theme === "dark" ? "glass-card-dark text-slate-100" : "glass-card-light text-slate-900"
                }`}>
                  <ShieldAlert className="w-12 h-12 text-slate-500 mb-4 stroke-1 animate-pulse" />
                  <h4 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-400">Awaiting Data</h4>
                  <p className="text-xs text-slate-500 mt-3 max-w-xs leading-relaxed">
                    Upload media to begin the analysis. Our engine will identify anomalies and provide detailed forensic metrics.
                  </p>
                </div>
              )}
            </div>
          </div>

          {result && result.timelinePoints && (
            <TimelineChart points={result.timelinePoints} theme={theme} />
          )}
        </div>
      </main>

      <section className={`border-t py-16 transition-colors duration-300 relative z-10 ${
        theme === "dark" ? "border-zinc-500/10 bg-slate-950/20" : "border-slate-200 bg-slate-100/[0.15]"
      }`}>
        <div className="max-w-6xl mx-auto px-6 text-left">
          <div className="max-w-2xl">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold block">Capabilities</span>
            <h2 className="text-3xl font-black tracking-tight mt-2">Core Analysis Metrics</h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Our system evaluates multiple forensic indicators to identify potential digital manipulations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
            <div className={`p-6 rounded-3xl transition-all duration-300 ${
              theme === "dark" ? "glass-card-dark text-slate-100" : "glass-card-light text-slate-900"
            }`}>
              <div className="p-2.5 bg-cyan-550/10 border border-cyan-500/10 text-cyan-500 rounded-xl w-fit">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm tracking-wide mt-4 uppercase font-mono">Facial Topology</h3>
              <p className={`text-xs mt-2 leading-relaxed ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                Analyzes spatial landmarks and symmetry for structural inconsistencies.
              </p>
            </div>

            <div className={`p-6 rounded-3xl transition-all duration-300 ${
              theme === "dark" ? "glass-card-dark text-slate-100" : "glass-card-light text-slate-900"
            }`}>
              <div className="p-2.5 bg-indigo-550/10 border border-indigo-500/10 text-indigo-500 rounded-xl w-fit">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm tracking-wide mt-4 uppercase font-mono">Signal Analysis</h3>
              <p className={`text-xs mt-2 leading-relaxed ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                Detects noise discrepancies and compression artifacts in the image signal.
              </p>
            </div>

            <div className={`p-6 rounded-3xl transition-all duration-300 ${
              theme === "dark" ? "glass-card-dark text-slate-100" : "glass-card-light text-slate-900"
            }`}>
              <div className="p-2.5 bg-purple-550/10 border border-purple-500/10 text-purple-500 rounded-xl w-fit">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm tracking-wide mt-4 uppercase font-mono">Temporal Continuity</h3>
              <p className={`text-xs mt-2 leading-relaxed ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                Validates frame-to-frame consistency to identify temporal jitters.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`border-t py-16 transition-colors duration-300 relative z-10 ${
        theme === "dark" ? "border-zinc-500/10 bg-[#05070A]/50" : "border-slate-200 bg-white"
      }`}>
        <div className="max-w-6xl mx-auto px-6 text-left">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold block">Workflow</span>
          <h2 className="text-3xl font-black tracking-tight mt-2">Analysis Pipeline</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10 timeline-flow-wrapper">
            <div className="flex flex-col gap-2 relative">
              <div className="font-mono text-3xl font-black text-cyan-500/30">01</div>
              <h4 className={`font-bold text-sm uppercase font-mono tracking-wide ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>Data Loading</h4>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Media is securely loaded and prepared for processing.
              </p>
            </div>

            <div className="flex flex-col gap-2 relative">
              <div className="font-mono text-3xl font-black text-indigo-500/30">02</div>
              <h4 className={`font-bold text-sm uppercase font-mono tracking-wide ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>Feature Extraction</h4>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Identification of key facial regions and visual markers.
              </p>
            </div>

            <div className="flex flex-col gap-2 relative">
              <div className="font-mono text-3xl font-black text-purple-500/30">03</div>
              <h4 className={`font-bold text-sm uppercase font-mono tracking-wide ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>Heuristic Scoring</h4>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Evaluation of anomalies across multiple forensic dimensions.
              </p>
            </div>

            <div className="flex flex-col gap-2 relative">
              <div className="font-mono text-3xl font-black text-rose-500/30">04</div>
              <h4 className={`font-bold text-sm uppercase font-mono tracking-wide ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>Results Rendering</h4>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">
                Generation of interactive diagnostic overlays and reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className={`border-t transition-colors duration-300 py-10 ${
        theme === "dark" ? "border-zinc-500/10 bg-[#020305] text-slate-500" : "border-slate-200 bg-slate-100/50 text-slate-650"
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="font-mono text-[9px] uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Deepfake Detector. All rights reserved.
          </div>
          <div className="flex gap-4 font-mono text-[9px] uppercase tracking-widest">
            <a href="https://github.com/muhammadabid65421/deepfake-detector-ai" target="_blank" rel="noreferrer" className="hover:text-cyan-500 transition-colors">GITHUB</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
