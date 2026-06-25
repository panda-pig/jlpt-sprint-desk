import { Component, type ReactNode } from "react";
import { Button } from "animal-island-ui";
import { t } from "../i18n";

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
          <h3>{t("error.title")}</h3>
          <p>{t("error.body")}</p>
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
            <Button type="primary" onClick={this.handleReload}>
              {t("error.refresh")}
            </Button>
            <Button type="default" onClick={this.handleGoHome}>
              {t("error.home")}
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
