import React, { useState, useEffect } from 'react';
import { X, Minimize2, Maximize2, Activity, AlertCircle, Zap } from 'lucide-react';
import { PerformanceMetrics, ErrorInfo } from '../utils/types';
import './Widget.css';

interface WidgetProps {
    metrics: PerformanceMetrics;
    errors: ErrorInfo[];
    onClose: () => void;
}

export const Widget: React.FC<WidgetProps> = ({ metrics, errors, onClose }) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
    const [aiSuggestion, setAiSuggestion] = useState<string>('');

    const getScoreColor = (value: number | null, thresholds: { good: number; poor: number }) => {
        if (value === null) return 'gray';
        if (value <= thresholds.good) return 'green';
        if (value <= thresholds.poor) return 'orange';
        return 'red';
    };

    const handleIssueClick = async (issueType: string) => {
        setSelectedIssue(issueType);
        setIsExpanded(true);

        // Request AI suggestion from background script
        chrome.runtime.sendMessage(
            { type: 'GET_AI_SUGGESTION', issue: { type: issueType } },
            (response) => {
                if (response?.suggestion) {
                    setAiSuggestion(response.suggestion);
                }
            }
        );
    };

    if (isMinimized) {
        return (
            <div className="widget widget-minimized">
                <button onClick={() => setIsMinimized(false)} className="widget-restore-btn">
                    <Activity size={20} />
                </button>
            </div>
        );
    }

    return (
        <div className={`widget ${isExpanded ? 'widget-expanded' : ''}`}>
            <div className="widget-header">
                <div className="widget-title">
                    <Activity size={18} />
                    <span>AI Performance Analyzer</span>
                </div>
                <div className="widget-controls">
                    <button onClick={() => setIsMinimized(true)} title="최소화">
                        <Minimize2 size={16} />
                    </button>
                    <button onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? '축소' : '확장'}>
                        <Maximize2 size={16} />
                    </button>
                    <button onClick={onClose} title="닫기">
                        <X size={16} />
                    </button>
                </div>
            </div>

            <div className="widget-content">
                {/* Performance Metrics */}
                <div className="metrics-section">
                    <h3>웹 바이탈</h3>
                    <div className="metrics-grid">
                        <div
                            className="metric-card"
                            onClick={() => handleIssueClick('lcp')}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="metric-label">LCP</div>
                            <div className={`metric-value color-${getScoreColor(metrics.lcp, { good: 2500, poor: 4000 })}`}>
                                {metrics.lcp ? `${(metrics.lcp / 1000).toFixed(2)}s` : '측정중...'}
                            </div>
                        </div>

                        <div
                            className="metric-card"
                            onClick={() => handleIssueClick('cls')}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="metric-label">CLS</div>
                            <div className={`metric-value color-${getScoreColor(metrics.cls, { good: 0.1, poor: 0.25 })}`}>
                                {metrics.cls !== null ? metrics.cls.toFixed(3) : '측정중...'}
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-label">FCP</div>
                            <div className={`metric-value color-${getScoreColor(metrics.fcp, { good: 1800, poor: 3000 })}`}>
                                {metrics.fcp ? `${(metrics.fcp / 1000).toFixed(2)}s` : '측정중...'}
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-label">TTFB</div>
                            <div className={`metric-value color-${getScoreColor(metrics.ttfb, { good: 800, poor: 1800 })}`}>
                                {metrics.ttfb ? `${metrics.ttfb.toFixed(0)}ms` : '측정중...'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Errors Section */}
                {errors.length > 0 && (
                    <div className="errors-section">
                        <h3>
                            <AlertCircle size={16} />
                            감지된 오류 ({errors.length})
                        </h3>
                        <div className="errors-list">
                            {errors.slice(0, 5).map((error, index) => (
                                <div
                                    key={index}
                                    className="error-item"
                                    onClick={() => handleIssueClick('error')}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="error-message">{error.message}</div>
                                    <div className="error-meta">
                                        {error.source && <span>{error.source}:{error.line}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* AI Suggestion Panel */}
                {isExpanded && selectedIssue && (
                    <div className="ai-suggestion-panel">
                        <div className="ai-header">
                            <Zap size={16} />
                            <h3>AI 분석 결과</h3>
                        </div>
                        <div className="ai-content">
                            {aiSuggestion ? (
                                <pre>{aiSuggestion}</pre>
                            ) : (
                                <div className="ai-loading">분석 중...</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
