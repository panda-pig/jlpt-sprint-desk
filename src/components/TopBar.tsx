import { ROUTES } from "../lib/constants";
import { useStudyDesk } from "../lib/studyDeskContext";
interface TopBarProps {
  route: string;
}

export function TopBar({ route }: TopBarProps) {
  const { state, todayRecord, health } = useStudyDesk();
  const routeInfo = ROUTES[route as keyof typeof ROUTES] || ROUTES.dashboard;
  const activeProfile = state.profiles.find((p) => p.id === state.activeProfileId);

  return (
    <>
      <div>
        <p className="eyebrow">{routeInfo.eyebrow}</p>
        <h1>{routeInfo.title}</h1>
      </div>
      <div className="top-status">
        {activeProfile && (
          <span>{activeProfile.name} · {state.settings.level}</span>
        )}
        {state.generatedPlan?.daysLeft !== null && state.generatedPlan?.daysLeft !== undefined && (
          <span>剩余 {state.generatedPlan.daysLeft} 天</span>
        )}
        <span className={todayRecord ? "health-ok" : "health-warn"}>
          {todayRecord ? "今日已记录" : "今日未记录"}
        </span>
        <span className={`health-${health.level}`}>
          {health.label}
        </span>
      </div>
    </>
  );
}
