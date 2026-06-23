import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Home,
  Calendar,
  PenSquare,
  BarChart3,
  Download,
  Coffee,
} from "lucide-react";
import { useLocale } from "../i18n/LocaleProvider";

const TABS = [
  { key: "dashboard", labelKey: "nav.dashboardShort", Icon: Home },
  { key: "plan", labelKey: "nav.planShort", Icon: Calendar },
  { key: "record", labelKey: "nav.recordShort", Icon: PenSquare },
  { key: "analysis", labelKey: "nav.analysisShort", Icon: BarChart3 },
  { key: "export", labelKey: "nav.exportShort", Icon: Download },
  { key: "support", labelKey: "nav.supportShort", Icon: Coffee },
];

export function BottomNav() {
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const { t } = useLocale();
  const route = location.pathname.slice(1) || "dashboard";

  useEffect(() => {
    const check = () => setVisible(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!visible) return null;

  return (
    <nav className="bottom-nav" aria-label={t("nav.mobileNav")}>
      {TABS.map(({ key, labelKey, Icon }) => (
        <a
          key={key}
          href={`#/${key}`}
          className={route === key ? "active" : ""}
          aria-current={route === key ? "page" : undefined}
        >
          <Icon size={20} />
          <span>{t(labelKey)}</span>
        </a>
      ))}
    </nav>
  );
}
