export enum PredictionType {
  REAL = "REAL",
  FAKE = "FAKE"
}

export interface AnalysisDetails {
  faceSymmetry: string;
  lightingConsistency: string;
  edgeIrregularities: string;
  compressionArtifacts: string;
  temporalConsistency?: string; // for videos
  colorBlending: string;
}

export interface SuspiciousArea {
  id: string;
  x: number; // percentage coordinate (0-100)
  y: number; // percentage coordinate (0-100)
  width: number;
  height: number;
  description: string;
  severity: "low" | "medium" | "high";
}

export interface DetectedFace {
  id: string;
  box: {
    x: number; // percentage (0-100)
    y: number; // percentage (0-100)
    width: number;
    height: number;
  };
  score: number; // 0-100
  label: "REAL" | "FAKE";
  reason: string;
}

export interface TimelinePoint {
  time: string; // "00:01"
  seconds: number;
  fakeProbability: number;
  status: "REAL" | "SUSPICIOUS" | "FAKE";
}

export interface AnalysisResult {
  id: string;
  prediction: PredictionType;
  confidence: number; // 0-100
  mediaType: "image" | "video";
  fileName: string;
  fileSize: string;
  timestamp: string;
  analysisDetails: AnalysisDetails;
  suspiciousAreas: SuspiciousArea[];
  detectedFaces: DetectedFace[];
  timelinePoints?: TimelinePoint[];
  recommendation: string;
}
