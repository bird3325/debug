export interface PerformanceMetrics {
    lcp: number | null;
    fid: number | null;
    cls: number | null;
    fcp: number | null;
    ttfb: number | null;
}

export interface ErrorInfo {
    message: string;
    source: string;
    line: number;
    column: number;
    timestamp: number;
}

export interface AnalysisResult {
    metrics: PerformanceMetrics;
    errors: ErrorInfo[];
    timestamp: number;
    url: string;
}
