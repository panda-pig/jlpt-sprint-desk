import { Time } from "animal-island-ui";
import { ROUTES } from "../lib/constants";
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
        {state.generatedPlan?.daysLeft !== null && state.generatedPlan?.daysLeft !== undefined && (
          <span>{t("common.daysLeft", { n: state.generatedPlan.daysLeft })}</span>
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
