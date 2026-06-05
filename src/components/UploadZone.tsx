import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Upload, FileVideo, FileImage, ShieldAlert, CheckCircle, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface UploadZoneProps {
  onMediaLoaded: (payload: {
    fileData: string;
    fileName: string;
    fileType: string;
    fileSize: string;
    frames?: string[];
  }) => void;
  isLoading: boolean;
  theme?: "dark" | "light";
}

export default function UploadZone({ onMediaLoaded, isLoading, theme = "dark" }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<{ name: string; size: string; type: string } | null>(null);
  const [frameExtractionProgress, setFrameExtractionProgress] = useState<number>(-1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert raw bytes to standard human format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Extract keyframes from a video file
  const extractVideoFrames = (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const videoUrl = URL.createObjectURL(file);
      video.src = videoUrl;
      video.muted = true;
      video.playsInline = true;

      const frames: string[] = [];
      const numFramesToExtract = 4; // Number of evaluation points

      video.onloadedmetadata = () => {
        const duration = video.duration;
        if (!duration || isNaN(duration)) {
          reject(new Error("Unable to read video length"));
          return;
        }

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        // Match source video aspect ratio
        canvas.width = 640;
        canvas.height = 360;

        let currentExtractionIndex = 0;

        const seekAndCapture = () => {
          if (currentExtractionIndex >= numFramesToExtract) {
            URL.revokeObjectURL(videoUrl);
            setFrameExtractionProgress(-1);
            resolve(frames);
            return;
          }

          // Spread extractions equally across video duration
          const seekPercentage = 0.1 + (currentExtractionIndex / (numFramesToExtract - 1)) * 0.8; // between 10% and 90%
          const seekTime = duration * seekPercentage;
          
          setFrameExtractionProgress(Math.round(((currentExtractionIndex + 1) / numFramesToExtract) * 100));
          video.currentTime = seekTime;
        };

        video.onseeked = () => {
          if (ctx) {
            // Draw current frame to hidden canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            // Export as JPG base64
            const frameB64 = canvas.toDataURL("image/jpeg", 0.7);
            frames.push(frameB64);
          }
          currentExtractionIndex++;
          // Chain recursively to wait for next frame render
          setTimeout(seekAndCapture, 150);
        };

        // Start drawing first frame
        seekAndCapture();
      };

      video.onerror = (e) => {
        URL.revokeObjectURL(videoUrl);
        reject(e);
      };
    });
  };

  const processFile = (file: File) => {
    setError(null);
    setPreview(null);
    setFileMeta(null);
    setFrameExtractionProgress(-1);

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setError("Supported formats: Images (PNG, JPEG, WEBP) and Videos (MP4, MOV, WebM)");
      return;
    }

    const fiftyMB = 50 * 1024 * 1024;
    if (file.size > fiftyMB) {
      setError("File exceeds maximum allowance (50MB)");
      return;
    }

    const meta = {
      name: file.name,
      size: formatBytes(file.size),
      type: file.type
    };
    setFileMeta(meta);

    const reader = new FileReader();

    reader.onload = async (e) => {
      const fileData = e.target?.result as string;
      setPreview(fileData);

      if (isVideo) {
        try {
          // Extract frames for analysis
          const extractedFrames = await extractVideoFrames(file);
          onMediaLoaded({
            fileData,
            fileName: file.name,
            fileType: file.type,
            fileSize: meta.size,
            frames: extractedFrames
          });
        } catch (err) {
          console.error("Frame extractor failed, proceeding with file-only mode.", err);
          onMediaLoaded({
            fileData,
            fileName: file.name,
            fileType: file.type,
            fileSize: meta.size
          });
        }
      } else {
        // Image payload
        onMediaLoaded({
          fileData,
          fileName: file.name,
          fileType: file.type,
          fileSize: meta.size
        });
      }
    };

    reader.onerror = () => {
      setError("Could not parse file bytes. Ensure file is readable and try again.");
    };

    reader.readAsDataURL(file);
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setFileMeta(null);
    setError(null);
    setFrameExtractionProgress(-1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div id="upload-media-container" className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept="image/*,video/*"
        className="hidden"
      />

      {!preview ? (
        <div
          id="upload-drag-area"
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={handleBoxClick}
          className={`flex flex-col items-center justify-center p-10 py-16 border-2 border-dashed rounded-3xl transition-all duration-300 cursor-pointer ${
            theme === "dark"
              ? isDragActive
                ? "border-cyan-500 bg-cyan-950/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                : "border-white/10 bg-white/5 hover:border-cyan-500/50 hover:bg-white/10"
              : isDragActive
              ? "border-cyan-500 bg-cyan-50 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
              : "border-slate-300 bg-black/[0.02] hover:border-cyan-500 hover:bg-black/[0.04]"
          }`}
        >
          <div className={`flex items-center justify-center w-16 h-16 mb-5 rounded-full border transition-all duration-300 ${
            theme === "dark"
              ? "bg-black/50 border-white/10 text-slate-300"
              : "bg-white border-slate-200 text-slate-600 shadow-sm"
          }`}>
            <Upload className="w-7 h-7 text-cyan-400" />
          </div>

          <p className={`text-[15px] font-semibold text-center ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>
            Drag and drop media, or <span className="text-cyan-500 underline decoration-cyan-500/50 hover:text-cyan-400">browse files</span>
          </p>
          <p className={`mt-2 text-xs text-center uppercase tracking-normal ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
            Supports MP4, MOV, JPG, PNG (Max 50MB)
          </p>

          {error && (
            <div className={`flex items-center gap-2 mt-6 p-3 px-4 rounded-xl text-xs border ${
              theme === "dark"
                ? "bg-red-950/40 border-red-900/50 text-red-300"
                : "bg-red-50 border-red-200 text-red-800"
            }`}>
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      ) : (
        <div className={`p-4 border rounded-3xl backdrop-blur-md transition-all duration-300 ${
          theme === "dark" ? "border-white/10 bg-black/40" : "border-slate-200 bg-white/80 shadow-sm"
        }`}>
          {/* Media Preview Window */}
          <div className={`relative flex items-center justify-center w-full max-h-[380px] min-h-[220px] rounded-2xl overflow-hidden border ${
            theme === "dark" ? "bg-slate-950/60 border-slate-900" : "bg-slate-100 border-slate-200"
          }`}>
            {fileMeta?.type.startsWith("video/") ? (
              <video
                src={preview}
                controls
                className="w-full max-h-[380px] object-contain text-slate-100"
              />
            ) : (
              <img
                src={preview}
                alt="Upload preview"
                className="w-full max-h-[380px] object-contain"
                referrerPolicy="no-referrer"
              />
            )}

            {/* Overlay Info */}
            <div className={`absolute top-3 left-3 flex items-center gap-2 p-1.5 px-3 border rounded-lg text-xs font-mono backdrop-blur-md ${
              theme === "dark" ? "bg-black/85 border-white/15 text-slate-300" : "bg-white/85 border-slate-200 text-slate-700 shadow-sm"
            }`}>
              {fileMeta?.type.startsWith("video/") ? (
                <FileVideo className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <FileImage className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span className="truncate max-w-[140px] md:max-w-[200px]">{fileMeta?.name}</span>
              <span className={theme === "dark" ? "text-slate-700" : "text-slate-350"}>|</span>
              <span className={theme === "dark" ? "text-slate-400" : "text-slate-500"}>{fileMeta?.size}</span>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              disabled={isLoading || frameExtractionProgress > 0}
              className={`absolute top-3 right-3 p-1.5 border hover:opacity-95 text-xs font-mono flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                theme === "dark" ? "bg-black/85 border-white/15 text-slate-300 hover:bg-slate-900" : "bg-white/85 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change</span>
            </button>
          </div>

          {/* Progress Notification */}
          {frameExtractionProgress > 0 && (
            <div className={`mt-4 p-4 border rounded-xl ${
              theme === "dark" ? "border-indigo-900/40 bg-indigo-950/20" : "border-indigo-100 bg-indigo-50/50"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-mono flex items-center gap-1.5 ${theme === "dark" ? "text-indigo-300" : "text-indigo-850"}`}>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Processing video frames...
                </span>
                <span className={`text-xs font-mono ${theme === "dark" ? "text-indigo-300" : "text-indigo-850"}`}>{frameExtractionProgress}%</span>
              </div>
              <div className="w-full h-1 bg-slate-900/10 dark:bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-150"
                  style={{ width: `${frameExtractionProgress}%` }}
                />
              </div>
            </div>
          )}

          {frameExtractionProgress === -1 && !isLoading && (
            <div className={`mt-4 flex items-center gap-2 text-xs font-mono border p-2.5 px-3 rounded-lg ${
              theme === "dark" ? "text-emerald-400 bg-emerald-950/15 border-emerald-950/40" : "text-emerald-800 bg-emerald-50/50 border-emerald-100"
            }`}>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <span>Media loaded. Ready for analysis.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
