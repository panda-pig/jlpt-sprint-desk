import { Time } from "animal-island-ui";
import { ROUTES } from "../lib/constants";
import { daysUntil } from "../lib/utils";
import { isExamPast } from "../lib/planner";
import { useStudyDesk } from "../lib/studyDeskContext";
import { useLocale } from "../i18n/LocaleProvider";

interface TopBarProps {
  route: string;
}

export function TopBar({ route }: TopBarProps) {
  const { state, todayRecord, health } = useStudyDesk();
  const { t } = useLocale();
  const routeInfo = ROUTES[route as keyof typeof ROUTES] || ROUTES.dashboard;
  const navKey = (route in ROUTES ? route : "dashboard");
  const activeProfile = state.profiles.find((p) => p.id === state.activeProfileId);
  const daysLeft = daysUntil(state.settings.examDate);
  const examPast = isExamPast(state.settings.examDate);

  return (
    <>
      <div>
        <p className="eyebrow">{routeInfo.eyebrow}</p>
        <h1>{t(`nav.${navKey}`)}</h1>
      </div>
      <div className="top-status">
        <Time />
        {activeProfile && (
          <span>{activeProfile.name} · {state.settings.level}</span>
        )}
        {daysLeft !== null && !examPast && (
          <span>{daysLeft === 0 ? t("common.examToday") : t("common.daysLeft", { n: daysLeft })}</span>
        )}
        <span className={todayRecord ? "health-ok" : "health-warn"}>
          {todayRecord ? t("layout.todayRecorded") : t("layout.todayNotRecorded")}
        </span>
        <span className={`health-${health.level}`}>
          {health.label}
        </span>
      </div>
    </>
  );
}
