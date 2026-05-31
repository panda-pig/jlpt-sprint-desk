interface SideNavProps {
  activeRoute: string;
  onNavigate: () => void;
}

const NAV_ITEMS = [
  { key: "dashboard", label: "总览", icon: "D" },
  { key: "setup", label: "计划设置", icon: "S" },
  { key: "plan", label: "学习计划", icon: "P" },
  { key: "record", label: "每日记录", icon: "R" },
  { key: "analysis", label: "复盘分析", icon: "A" },
  { key: "export", label: "导出备份", icon: "E" },
];

export function SideNav({ activeRoute, onNavigate }: SideNavProps) {
  return (
    <nav className="side-nav" aria-label="主导航">
      {NAV_ITEMS.map((item) => (
        <a
          key={item.key}
          href={`#/${item.key}`}
          className={activeRoute === item.key ? "is-active" : ""}
          onClick={onNavigate}
        >
          <span className="nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  );
}
