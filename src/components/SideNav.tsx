import { useLocale } from "../i18n/LocaleProvider";

interface SideNavProps {
  activeRoute: string;
  onNavigate: () => void;
}

const NAV_ITEMS = [
  { key: "dashboard", icon: "D" },
  { key: "setup", icon: "S" },
  { key: "plan", icon: "P" },
  { key: "record", icon: "R" },
  { key: "analysis", icon: "A" },
  { key: "export", icon: "E" },
];

export function SideNav({ activeRoute, onNavigate }: SideNavProps) {
  const { t } = useLocale();
  return (
    <nav className="side-nav" aria-label={t("nav.primaryNav")}>
      {NAV_ITEMS.map((item) => (
        <a
          key={item.key}
          href={`#/${item.key}`}
          className={activeRoute === item.key ? "is-active" : ""}
          aria-current={activeRoute === item.key ? "page" : undefined}
          onClick={onNavigate}
        >
          <span className="nav-icon">{item.icon}</span>
          <span>{t(`nav.${item.key}`)}</span>
        </a>
      ))}
    </nav>
  );
}
