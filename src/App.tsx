import { lazy, Suspense } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Loading } from "./components/Loading";
import { FadeTransition } from "./components/FadeTransition";
import { KeyboardShortcuts } from "./components/KeyboardShortcuts";
import { StudyDeskProvider } from "./lib/useStudyDesk";
import { DashboardPage } from "./pages/DashboardPage";

const SetupPage = lazy(() => import("./pages/SetupPage").then((m) => ({ default: m.SetupPage })));
const PlanPage = lazy(() => import("./pages/PlanPage").then((m) => ({ default: m.PlanPage })));
const RecordPage = lazy(() => import("./pages/RecordPage").then((m) => ({ default: m.RecordPage })));
const AnalysisPage = lazy(() => import("./pages/AnalysisPage").then((m) => ({ default: m.AnalysisPage })));
const ExportPage = lazy(() => import("./pages/ExportPage").then((m) => ({ default: m.ExportPage })));

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
            <Suspense fallback={<Loading />}>
              <AnimatedRoutes />
            </Suspense>
          </ErrorBoundary>
        </AppLayout>
      </HashRouter>
    </StudyDeskProvider>
  );
}
