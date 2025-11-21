import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Widget } from '../components/Widget';
import { PerformanceMonitor } from '../utils/performanceMonitor';
import { ErrorMonitor } from '../utils/errorMonitor';
import { PerformanceMetrics, ErrorInfo } from '../utils/types';

console.log('AI Web Performance Analyzer - Content Script loaded');

// Create widget container
const createWidgetContainer = (): HTMLDivElement => {
    const container = document.createElement('div');
    container.id = 'ai-perf-analyzer-widget-root';
    document.body.appendChild(container);
    return container;
};

// Main App Component
const App: React.FC = () => {
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        lcp: null,
        fid: null,
        cls: null,
        fcp: null,
        ttfb: null
    });
    const [errors, setErrors] = useState<ErrorInfo[]>([]);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Initialize performance monitoring
        const perfMonitor = new PerformanceMonitor((updatedMetrics) => {
            setMetrics(updatedMetrics);
        });

        // Initialize error monitoring
        const errorMonitor = new ErrorMonitor((updatedErrors) => {
            setErrors(updatedErrors);
        });

        // Send initial data to background script
        const sendPerformanceData = () => {
            chrome.runtime.sendMessage({
                type: 'PERFORMANCE_DATA',
                data: {
                    metrics: perfMonitor.getMetrics(),
                    errors: errorMonitor.getErrors(),
                    url: window.location.href,
                    timestamp: Date.now()
                }
            });
        };

        // Send data periodically
        const interval = setInterval(sendPerformanceData, 5000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    if (!isVisible) {
        return null;
    }

    return (
        <Widget
            metrics={metrics}
            errors={errors}
            onClose={() => setIsVisible(false)}
        />
    );
};

// Initialize the widget
const init = () => {
    // Wait for page to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
        return;
    }

    // Create container and render
    const container = createWidgetContainer();
    const root = ReactDOM.createRoot(container);
    root.render(<App />);
};

init();
