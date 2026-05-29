import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SideNav } from "./SideNav";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import type { ReactNode } from "react";

export function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const route = location.pathname.slice(1) || "dashboard";

  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("sidebar-open");
    } else {
      document.body.classList.remove("sidebar-open");
    }
    return () => {
      document.body.classList.remove("sidebar-open");
    };
  }, [sidebarOpen]);

  return (
    <div className="app-shell">
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="brand-block">
          <a className="brand" href="#/dashboard" onClick={() => setSidebarOpen(false)}>
            <span className="brand-mark">JL</span>
            <span>
              <strong>JLPT Sprint Desk</strong>
              <small>多页面学习计划工作台</small>
            </span>
          </a>
        </div>
        <SideNav activeRoute={route} onNavigate={() => setSidebarOpen(false)} />
        <div className="side-footer">
          <button
            className="secondary-button full"
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("quick-generate"))}
          >
            重新生成计划
          </button>
          <p>数据保存在当前浏览器 localStorage。</p>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <button
            className="icon-button menu-button"
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="切换导航"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <TopBar route={route} />
        </header>

        <main className="page">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
