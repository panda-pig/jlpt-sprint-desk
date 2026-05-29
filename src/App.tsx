import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { FadeTransition } from "./components/FadeTransition";
import { KeyboardShortcuts } from "./components/KeyboardShortcuts";
import { StudyDeskProvider } from "./lib/useStudyDesk";
import { DashboardPage } from "./pages/DashboardPage";
import { SetupPage } from "./pages/SetupPage";
import { PlanPage } from "./pages/PlanPage";
import { RecordPage } from "./pages/RecordPage";
import { AnalysisPage } from "./pages/AnalysisPage";
import { ExportPage } from "./pages/ExportPage";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <FadeTransition>
      <Routes location={location}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/setup" element={<SetupPage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/record" element={<RecordPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/export" element={<ExportPage />} />
      </Routes>
    </FadeTransition>
  );
}

export default function App() {
  return (
    <StudyDeskProvider>
      <HashRouter>
        <KeyboardShortcuts />
        <AppLayout>
          <ErrorBoundary>
            <AnimatedRoutes />
          </ErrorBoundary>
        </AppLayout>
      </HashRouter>
    </StudyDeskProvider>
  );
}
