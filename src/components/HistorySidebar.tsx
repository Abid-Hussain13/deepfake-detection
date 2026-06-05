import { History, ShieldAlert, ShieldCheck, Trash, FileVideo, FileImage } from "lucide-react";
import { PredictionType, AnalysisResult } from "../types";

interface HistorySidebarProps {
  history: AnalysisResult[];
  onSelectResult: (result: AnalysisResult) => void;
  onClear: () => void;
  activeId?: string;
  theme?: "dark" | "light";
}

export default function HistorySidebar({ history, onSelectResult, onClear, activeId, theme = "dark" }: HistorySidebarProps) {
  return (
    <div className={`flex flex-col h-full rounded-3xl overflow-hidden p-5 text-left transition-all duration-300 ${
      theme === "dark" ? "glass-card-dark text-slate-100" : "glass-card-light text-slate-900"
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between border-b pb-4 mb-4 ${
        theme === "dark" ? "border-zinc-500/10" : "border-slate-200"
      }`}>
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h3 className={`font-mono text-sm uppercase tracking-wider ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>Recent Analysis</h3>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClear}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              theme === "dark" ? "hover:bg-white/5 text-slate-500 hover:text-rose-400" : "hover:bg-slate-150 text-slate-400 hover:text-rose-600"
            }`}
            title="Clear all local logs"
          >
            <Trash className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Recs list */}
      <div className="flex-1 overflow-y-auto space-y-3 max-h-[350px] md:max-h-none pr-1">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-10 text-center">
            <History className={`w-10 h-10 stroke-1 mb-3 ${theme === "dark" ? "text-slate-700" : "text-slate-300"}`} />
            <p className={`text-sm font-mono uppercase tracking-wider text-[10px] ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>No local logs</p>
            <p className={`text-xs mt-1 max-w-[150px] ${theme === "dark" ? "text-slate-600" : "text-slate-500"}`}>Your completed analysis cards will show up here.</p>
          </div>
        ) : (
          history.map((record) => {
            const isFake = record.prediction === PredictionType.FAKE;
            const isActive = activeId === record.id;
            
            return (
              <div
                key={record.id}
                onClick={() => onSelectResult(record)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isActive
                    ? theme === "dark"
                      ? "bg-slate-950/80 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.15)] text-slate-100"
                      : "bg-white border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.08)] text-slate-900 font-medium"
                    : theme === "dark"
                    ? "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04] text-slate-300"
                    : "bg-black/[0.015] border-slate-200/60 hover:border-slate-300 hover:bg-white text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="mt-0.5 shrink-0">
                      {record.mediaType === "video" ? (
                        <FileVideo className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <FileImage className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>
                    <div>
                      <h4 className={`text-xs font-semibold truncate max-w-[120px] md:max-w-none ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>
                        {record.fileName}
                      </h4>
                      <p className={`text-[10px] font-mono mt-0.5 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
                        {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <span className="mx-1">·</span>
                        {record.fileSize}
                      </p>
                    </div>
                  </div>

                  {/* Badge status */}
                  <div className={`p-1 px-2 rounded-md border text-[9px] font-mono leading-none flex items-center gap-1 ${
                    isFake
                      ? "bg-rose-950/20 text-rose-400 border-rose-900/30"
                      : "bg-emerald-950/20 text-emerald-400 border-emerald-900/30"
                  }`}>
                    {isFake ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                    <span>{record.prediction}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
