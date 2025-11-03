"use client";

import React, { Component, ReactNode, ErrorInfo } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center"
          dir="rtl"
        >
          <div className="flex flex-col items-center gap-4 max-w-md">
            <div className="p-4 rounded-full bg-red-100 dark:bg-red-950">
              <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">
              משהו השתבש
            </h2>
            <p className="text-muted-foreground">
              אירעה שגיאה בלתי צפויה. אנא נסה לרענן את הדף או לחזור למסך הבית.
            </p>
            {this.state.error && (
              <details className="w-full mt-4">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  פרטי שגיאה טכניים
                </summary>
                <pre className="mt-2 p-3 bg-muted rounded-md text-xs text-right overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex gap-2 mt-4">
              <Button onClick={this.handleReset} variant="outline">
                נסה שוב
              </Button>
              <Button onClick={() => (window.location.href = "/dashboard")}>
                חזור לדף הבית
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
