import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark p-4">
                    <div className="card max-w-md w-full text-center">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h1 className="text-2xl font-bold mb-2">حدث خطأ</h1>
                        <p className="text-textSecondary dark:text-textSecondary-dark mb-4">
                            عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.
                        </p>
                        {this.state.error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mb-4 text-right">
                                <p className="text-sm text-red-800 dark:text-red-200 font-mono">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}
                        <button onClick={this.handleReset} className="btn-primary">
                            العودة للصفحة الرئيسية
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
