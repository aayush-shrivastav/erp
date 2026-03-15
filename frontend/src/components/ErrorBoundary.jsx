import React, { Component } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Button from './ui/Button';

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center animate-in fade-in duration-500">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-red-50 text-red-600 flex items-center justify-center mb-6 shadow-xl shadow-red-100/50">
                        <AlertTriangle size={40} />
                    </div>
                    
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                        Circuit Interrupted
                    </h2>
                    
                    <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">
                        An unexpected rendering error occurred in this module. Your other work in the session is safe.
                    </p>
                    
                    <div className="flex gap-4">
                        <Button 
                            variant="secondary" 
                            onClick={() => window.location.href = '/'}
                            className="rounded-2xl h-12 px-6"
                        >
                            <Home size={18} />
                            <span>Return Home</span>
                        </Button>
                        <Button 
                            onClick={() => this.setState({ hasError: false })}
                            className="rounded-2xl h-12 px-6"
                        >
                            <RefreshCcw size={18} />
                            <span>Retry Render</span>
                        </Button>
                    </div>

                    {import.meta.env.DEV && (
                        <div className="mt-12 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left overflow-auto max-w-2xl w-full">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Debug Trace</p>
                            <pre className="text-xs font-mono text-red-600 font-bold whitespace-pre-wrap">
                                {this.state.error?.toString()}
                            </pre>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
