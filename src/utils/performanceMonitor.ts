import { PerformanceMetrics } from './types';

export class PerformanceMonitor {
    private metrics: PerformanceMetrics = {
        lcp: null,
        fid: null,
        cls: null,
        fcp: null,
        ttfb: null
    };

    private clsValue = 0;
    private clsEntries: PerformanceEntry[] = [];

    constructor(private onUpdate: (metrics: PerformanceMetrics) => void) {
        this.observeLCP();
        this.observeFID();
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

    private observeFID() {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry: any) => {
                    this.metrics.fid = entry.processingStart - entry.startTime;
                    this.onUpdate(this.metrics);
                });
            });
            observer.observe({ type: 'first-input', buffered: true });
        } catch (e) {
            console.warn('FID observation not supported');
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
