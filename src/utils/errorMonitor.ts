import { ErrorInfo } from './types';

export class ErrorMonitor {
    private errors: ErrorInfo[] = [];
    private maxErrors = 50;

    constructor(private onUpdate: (errors: ErrorInfo[]) => void) {
        this.setupErrorListeners();
    }

    private setupErrorListeners() {
        // Capture JavaScript errors
        window.addEventListener('error', (event) => {
            const errorInfo: ErrorInfo = {
                message: event.message,
                source: event.filename || '',
                line: event.lineno || 0,
                column: event.colno || 0,
                timestamp: Date.now()
            };
            this.addError(errorInfo);
        });

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
