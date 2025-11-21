import type { ErrorInfo } from './types';

export class ErrorMonitor {
    private errors: ErrorInfo[] = [];
    private maxErrors = 50;

    private onUpdate: (errors: ErrorInfo[]) => void;

    constructor(onUpdate: (errors: ErrorInfo[]) => void) {
        this.onUpdate = onUpdate;
        this.setupErrorListeners();
    }

    private setupErrorListeners() {
        // Capture JavaScript errors
        // Capture JavaScript errors and Resource errors (useCapture: true)
        window.addEventListener('error', (event) => {
            let selector: string | undefined;

            // Check if it's a resource error (target is an element)
            if (event.target && event.target instanceof HTMLElement && event.target !== (window as unknown as EventTarget)) {
                const el = event.target as HTMLElement;
                selector = el.tagName.toLowerCase();
                if (el.id) selector += `#${el.id}`;
                if (el.className && typeof el.className === 'string') selector += `.${el.className.split(' ').join('.')}`;
            }

            const errorInfo: ErrorInfo = {
                message: event.message || 'Resource Loading Error',
                source: event.filename || (event.target instanceof HTMLElement ? (event.target as any).src || (event.target as any).href || 'Unknown Source' : ''),
                line: event.lineno || 0,
                column: event.colno || 0,
                timestamp: Date.now(),
                elementSelector: selector
            };
            this.addError(errorInfo);
        }, true); // Use capture to catch resource errors

        // Capture unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            const errorInfo: ErrorInfo = {
                message: `Unhandled Promise Rejection: ${event.reason}`,
                source: 'Promise',
                line: 0,
                column: 0,
                timestamp: Date.now()
            };
            this.addError(errorInfo);
        });

        // Intercept console.error
        const originalConsoleError = console.error;
        console.error = (...args: any[]) => {
            const errorInfo: ErrorInfo = {
                message: args.join(' '),
                source: 'console.error',
                line: 0,
                column: 0,
                timestamp: Date.now()
            };
            this.addError(errorInfo);
            originalConsoleError.apply(console, args);
        };
    }

    private addError(error: ErrorInfo) {
        this.errors.unshift(error);
        if (this.errors.length > this.maxErrors) {
            this.errors.pop();
        }
        this.onUpdate([...this.errors]);
    }

    getErrors(): ErrorInfo[] {
        return [...this.errors];
    }

    clearErrors() {
        this.errors = [];
        this.onUpdate([]);
    }
}
