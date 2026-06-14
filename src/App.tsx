import { lazy, Suspense } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { FadeTransition } from "./components/FadeTransition";
import { KeyboardShortcuts } from "./components/KeyboardShortcuts";
import { ReminderNotifier } from "./components/Reminder";
import { LocaleProvider } from "./i18n/LocaleProvider";
import { StudyDeskProvider } from "./lib/useStudyDesk";
// Dashboard is the landing route → keep it eager for instant first paint.
import { DashboardPage } from "./pages/DashboardPage";
// The rest are code-split so heavy bits (export HTML builder, charts) stay out
// of the initial bundle — matters most on mobile first load.
const SetupPage = lazy(() => import("./pages/SetupPage").then((m) => ({ default: m.SetupPage })));
const PlanPage = lazy(() => import("./pages/PlanPage").then((m) => ({ default: m.PlanPage })));
const RecordPage = lazy(() => import("./pages/RecordPage").then((m) => ({ default: m.RecordPage })));
const AnalysisPage = lazy(() => import("./pages/AnalysisPage").then((m) => ({ default: m.AnalysisPage })));
const ExportPage = lazy(() => import("./pages/ExportPage").then((m) => ({ default: m.ExportPage })));

function PageFallback() {
  return (
    <div className="page-loading" aria-busy="true" aria-live="polite">
      <div className="page-loading-block" />
      <div className="page-loading-block short" />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <FadeTransition>
      <Suspense fallback={<PageFallback />}>
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/record" element={<RecordPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/export" element={<ExportPage />} />
        </Routes>
      </Suspense>
    </FadeTransition>
  );
}

export default function App() {
  return (
    <LocaleProvider>
    <StudyDeskProvider>
      <HashRouter>
        <KeyboardShortcuts />
        <ReminderNotifier />
        <AppLayout>
          <ErrorBoundary>
            <AnimatedRoutes />
          </ErrorBoundary>
        </AppLayout>
      </HashRouter>
    </StudyDeskProvider>
    </LocaleProvider>
  );
}
