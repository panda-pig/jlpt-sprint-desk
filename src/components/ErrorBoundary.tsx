import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.hash = "#/dashboard";
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="empty-state" style={{ padding: "40px 20px", textAlign: "center" }}>
          <h3>页面出现了一些问题</h3>
          <p>抱歉，系统遇到了意外错误。你可以选择刷新页面或返回首页。</p>
          {this.state.error && (
            <pre
              style={{
                margin: "16px 0",
                padding: "12px",
                background: "#f8faf8",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#70817a",
                overflow: "auto",
                maxHeight: "120px",
                textAlign: "left",
              }}
            >
              {this.state.error.message}
            </pre>
          )}
          <div className="button-row" style={{ justifyContent: "center" }}>
            <button className="primary-button" onClick={this.handleReload}>
              刷新页面
            </button>
            <button className="secondary-button" onClick={this.handleGoHome}>
              返回首页
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
