import { AnalysisResult } from "../types";

const HISTORY_KEY = "deepfake_analysis_history";

export function loadHistory(): AnalysisResult[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to parse history from localStorage", error);
    return [];
  }
}

export function saveHistoryItem(item: AnalysisResult): AnalysisResult[] {
  try {
    const history = loadHistory();
    // Prevent duplicates
    const filtered = history.filter((h) => h.id !== item.id);
    const updated = [item, ...filtered].slice(0, 30); // Keep top 30 records
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error("Failed to save history item", error);
    return [];
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear local history", error);
  }
}
