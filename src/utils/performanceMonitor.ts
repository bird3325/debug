import type { PerformanceMetrics } from './types';

export class PerformanceMonitor {
    private metrics: PerformanceMetrics = {
        lcp: null,
        inp: null,
        cls: null,
        fcp: null,
        ttfb: null
    };

    private clsValue = 0;
    private clsEntries: PerformanceEntry[] = [];

    private onUpdate: (metrics: PerformanceMetrics) => void;

    constructor(onUpdate: (metrics: PerformanceMetrics) => void) {
        this.onUpdate = onUpdate;
        this.observeLCP();
        this.observeINP();
        this.observeCLS();
        this.observeFCP();
        this.measureTTFB();
    }

    private observeLCP() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1] as any;
                this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
                this.onUpdate(this.metrics);
            });
            observer.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (e) {
            console.warn('LCP observation not supported');
        }
    }

    private observeINP() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                // INP is usually the maximum duration of all interactions
                // But for simplicity in this monitor, we'll track the latest interaction
                // Ideally, we should track the max duration over the page life
                entries.forEach((entry: any) => {
                    // Use duration or processingEnd - startTime
                    // entry.duration is the most reliable for INP
                    if (entry.interactionId) {
                        // Simple logic: keep the max duration seen so far as a rough INP approximation
                        // or just report the latest interaction latency.
                        // Standard INP is the p98 of all interactions.
                        // For this widget, let's show the max interaction latency observed.
                        const duration = entry.duration;
                        if (this.metrics.inp === null || duration > this.metrics.inp) {
                            this.metrics.inp = duration;
                            this.onUpdate(this.metrics);
                        }
                    }
                });
            });
            observer.observe({ type: 'event', buffered: true, durationThreshold: 16 } as any);
        } catch (e) {
            console.warn('INP observation not supported');
        }
    }

    private observeCLS() {
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries() as any[]) {
                    if (!entry.hadRecentInput) {
                        this.clsValue += entry.value;
                        this.clsEntries.push(entry);
                    }
                }
                this.metrics.cls = this.clsValue;
                this.onUpdate(this.metrics);
            });
            observer.observe({ type: 'layout-shift', buffered: true });
        } catch (e) {
            console.warn('CLS observation not supported');
        }
    }

    private observeFCP() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (entry.name === 'first-contentful-paint') {
                        this.metrics.fcp = entry.startTime;
                        this.onUpdate(this.metrics);
                    }
                });
            });
            observer.observe({ type: 'paint', buffered: true });
        } catch (e) {
            console.warn('FCP observation not supported');
        }
    }

    private measureTTFB() {
        try {
            const navigationTiming = performance.getEntriesByType('navigation')[0] as any;
            if (navigationTiming) {
                this.metrics.ttfb = navigationTiming.responseStart - navigationTiming.requestStart;
                this.onUpdate(this.metrics);
            }
        } catch (e) {
            console.warn('TTFB measurement not supported');
        }
    }

    getMetrics(): PerformanceMetrics {
        return { ...this.metrics };
    }
}
