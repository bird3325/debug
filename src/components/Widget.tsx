import React, { useState } from 'react';
import { X, Minimize2, Maximize2, Activity, AlertCircle, Zap, RotateCcw, HelpCircle, Eye, Bug } from 'lucide-react';
import type { PerformanceMetrics, ErrorInfo } from '../utils/types';
import './Widget.css';

interface WidgetProps {
    metrics: PerformanceMetrics;
    errors: ErrorInfo[];
    onClose: () => void;
    onReset: () => void;
}

export const Widget: React.FC<WidgetProps> = ({ metrics, errors, onClose, onReset }) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showGuide, setShowGuide] = useState(false);
    const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
    const [aiSuggestion, setAiSuggestion] = useState<string>('');


    const getScoreColor = (value: number | null, thresholds: { good: number; poor: number }) => {
        if (value === null) return 'gray';
        if (value <= thresholds.good) return 'green';
        if (value <= thresholds.poor) return 'orange';
        return 'red';
    };

    const getInpScoreColor = (value: number | null) => {
        if (value === null) return 'gray';
        if (value <= 200) return 'green';
        if (value <= 500) return 'orange';
        return 'red';
    };

    const getScoreLabel = (color: string) => {
        switch (color) {
            case 'green': return '좋음';
            case 'orange': return '개선 필요';
            case 'red': return '나쁨';
            default: return '';
        }
    };

    const handleIssueClick = async (issueType: string, message?: string) => {
        setSelectedIssue(issueType);
        setIsExpanded(true);
        setAiSuggestion(''); // Clear previous suggestion

        // Request AI suggestion from background script
        chrome.runtime.sendMessage(
            { type: 'GET_AI_SUGGESTION', issue: { type: issueType, message } },
            (response: any) => {
                if (response?.suggestion) {
                    setAiSuggestion(response.suggestion);
                }
            }
        );
    };

    const highlightElement = (selector: string) => {
        const el = document.querySelector(selector);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            (el as HTMLElement).style.outline = '3px solid #f87171';
            (el as HTMLElement).style.boxShadow = '0 0 10px rgba(248, 113, 113, 0.5)';
            setTimeout(() => {
                (el as HTMLElement).style.outline = '';
                (el as HTMLElement).style.boxShadow = '';
            }, 3000);
        }
    };

    const simulateError = () => {
        // Simulate a resource error by trying to load a non-existent image
        const img = document.createElement('img');
        img.src = 'https://non-existent-domain.com/fail.png';
        img.style.display = 'none';
        document.body.appendChild(img);
        setTimeout(() => document.body.removeChild(img), 1000);

        // Also throw a JS error
        setTimeout(() => {
            throw new Error('Simulated JavaScript Error');
        }, 100);
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
                    <button onClick={() => setShowGuide(!showGuide)} title="가이드">
                        <HelpCircle size={16} />
                    </button>
                    <button onClick={onReset} title="초기화">
                        <RotateCcw size={16} />
                    </button>
                    <button onClick={simulateError} title="에러 시뮬레이션">
                        <Bug size={16} />
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
                            <div className="metric-info">
                                <div className="metric-label">LCP</div>
                                <div className={`metric-guide color-${getScoreColor(metrics.lcp, { good: 2500, poor: 4000 })}`}>
                                    {getScoreLabel(getScoreColor(metrics.lcp, { good: 2500, poor: 4000 }))}
                                </div>
                            </div>
                            <div className={`metric-value color-${getScoreColor(metrics.lcp, { good: 2500, poor: 4000 })}`}>
                                {metrics.lcp ? `${(metrics.lcp / 1000).toFixed(2)}s` : '측정중...'}
                            </div>
                        </div>

                        <div
                            className="metric-card"
                            onClick={() => handleIssueClick('cls')}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="metric-info">
                                <div className="metric-label">CLS</div>
                                <div className={`metric-guide color-${getScoreColor(metrics.cls, { good: 0.1, poor: 0.25 })}`}>
                                    {getScoreLabel(getScoreColor(metrics.cls, { good: 0.1, poor: 0.25 }))}
                                </div>
                            </div>
                            <div className={`metric-value color-${getScoreColor(metrics.cls, { good: 0.1, poor: 0.25 })}`}>
                                {metrics.cls !== null ? metrics.cls.toFixed(3) : '측정중...'}
                            </div>
                        </div>

                        <div
                            className="metric-card"
                            onClick={() => handleIssueClick('inp')}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="metric-info">
                                <div className="metric-label">INP</div>
                                <div className={`metric-guide color-${getInpScoreColor(metrics.inp)}`}>
                                    {getScoreLabel(getInpScoreColor(metrics.inp))}
                                </div>
                            </div>
                            <div className={`metric-value color-${getInpScoreColor(metrics.inp)}`}>
                                {metrics.inp ? `${metrics.inp.toFixed(0)}ms` : '측정중...'}
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-info">
                                <div className="metric-label">FCP</div>
                                <div className={`metric-guide color-${getScoreColor(metrics.fcp, { good: 1800, poor: 3000 })}`}>
                                    {getScoreLabel(getScoreColor(metrics.fcp, { good: 1800, poor: 3000 }))}
                                </div>
                            </div>
                            <div className={`metric-value color-${getScoreColor(metrics.fcp, { good: 1800, poor: 3000 })}`}>
                                {metrics.fcp ? `${(metrics.fcp / 1000).toFixed(2)}s` : '측정중...'}
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-info">
                                <div className="metric-label">TTFB</div>
                                <div className={`metric-guide color-${getScoreColor(metrics.ttfb, { good: 800, poor: 1800 })}`}>
                                    {getScoreLabel(getScoreColor(metrics.ttfb, { good: 800, poor: 1800 }))}
                                </div>
                            </div>
                            <div className={`metric-value color-${getScoreColor(metrics.ttfb, { good: 800, poor: 1800 })}`}>
                                {metrics.ttfb ? `${metrics.ttfb.toFixed(0)}ms` : '측정중...'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Guide Overlay */}
                {showGuide && (
                    <div className="guide-overlay">
                        <h4>성능 지표 가이드</h4>
                        <div className="guide-table">
                            <div className="guide-row header">
                                <span>지표</span>
                                <span className="good">좋음</span>
                                <span className="poor">나쁨</span>
                            </div>
                            <div className="guide-row">
                                <span>LCP</span>
                                <span className="good">≤ 2.5s</span>
                                <span className="poor">&gt; 4.0s</span>
                            </div>
                            <div className="guide-row">
                                <span>INP</span>
                                <span className="good">≤ 200ms</span>
                                <span className="poor">&gt; 500ms</span>
                            </div>
                            <div className="guide-row">
                                <span>CLS</span>
                                <span className="good">≤ 0.1</span>
                                <span className="poor">&gt; 0.25</span>
                            </div>
                            <div className="guide-row">
                                <span>FCP</span>
                                <span className="good">≤ 1.8s</span>
                                <span className="poor">&gt; 3.0s</span>
                            </div>
                            <div className="guide-row">
                                <span>TTFB</span>
                                <span className="good">≤ 800ms</span>
                                <span className="poor">&gt; 1800ms</span>
                            </div>
                        </div>
                        <button className="guide-close-btn" onClick={() => setShowGuide(false)}>
                            닫기
                        </button>
                    </div>
                )}

                {/* Errors Section */}
                {errors.length > 0 && (
                    <div className="errors-section">
                        <h3>
                            <AlertCircle size={16} />
                            감지된 오류 ({errors.length})
                        </h3>
                        <div className="errors-list open">
                            {errors.slice(0, 5).map((error, index) => (
                                <div
                                    key={index}
                                    className="error-item"
                                >
                                    <div className="error-header">
                                        <div className="error-message" onClick={() => handleIssueClick('error', error.message)} style={{ cursor: 'pointer' }}>
                                            {error.message}
                                        </div>
                                        {error.elementSelector && (
                                            <button
                                                className="highlight-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    highlightElement(error.elementSelector!);
                                                }}
                                                title="요소 강조"
                                            >
                                                <Eye size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="error-meta">
                                        {error.source && <span>{error.source}:{error.line}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* AI Suggestion Panel */}
                <div className={`ai-suggestion-panel ${isExpanded && selectedIssue ? 'visible' : ''}`}>
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
            </div >
        </div >
    );
};
