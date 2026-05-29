import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Home,
  Calendar,
  PenSquare,
  BarChart3,
  Download,
} from "lucide-react";

const TABS = [
  { key: "dashboard", label: "总览", Icon: Home },
  { key: "plan", label: "计划", Icon: Calendar },
  { key: "record", label: "记录", Icon: PenSquare },
  { key: "analysis", label: "分析", Icon: BarChart3 },
  { key: "export", label: "导出", Icon: Download },
];

export function BottomNav() {
  const [visible, setVisible] = useState(false);
  const location = useLocation();
  const route = location.pathname.slice(1) || "dashboard";

  useEffect(() => {
    const check = () => setVisible(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!visible) return null;

  return (
    <nav className="bottom-nav" aria-label="移动端导航">
      {TABS.map(({ key, label, Icon }) => (
        <a
          key={key}
          href={`#/${key}`}
          className={route === key ? "active" : ""}
        >
          <Icon size={20} />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
