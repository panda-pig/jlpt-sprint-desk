import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SideNav } from "./SideNav";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { useStudyDesk } from "../lib/studyDeskContext";
import { toast } from "../lib/toast";
import type { ReactNode } from "react";

function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>关于 JLPT Sprint Desk</h2>
          <button className="modal-close" onClick={onClose} aria-label="关闭">×</button>
        </div>
        <div className="modal-body">
          <p><strong>JLPT Sprint Desk</strong> 是一个专为日语能力测试（JLPT）备考设计的学习计划工作台。</p>
          
          <h3>核心功能</h3>
          <ul>
            <li>📅 <strong>智能计划生成</strong>：基于考试倒计时自动生成个性化学习计划</li>
            <li>📝 <strong>每日学习记录</strong>：追踪各模块用时、数量、完成度与正确率</li>
            <li>📊 <strong>复盘分析</strong>：7天趋势、模块投入、错因统计与计划健康评分</li>
            <li>💾 <strong>数据备份</strong>：支持导出/导入完整备份，多档案隔离管理</li>
            <li>📱 <strong>移动端适配</strong>：响应式设计，支持手机端使用</li>
          </ul>

          <h3>技术栈</h3>
          <p>React 18 + TypeScript + Vite + React Router + Lucide React</p>

          <h3>开源</h3>
          <p>
            源码：<a href="https://github.com/panda-pig/jlpt-sprint-desk" target="_blank" rel="noopener noreferrer">GitHub</a><br />
            协议：MIT License
          </p>

          <h3>隐私</h3>
          <p>所有数据仅存储在浏览器 localStorage 中，不上传任何服务器。</p>
        </div>
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { generateNewPlan } = useStudyDesk();
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
            onClick={() => {
              if (window.confirm("确定要重新生成计划吗？当前计划将被覆盖。")) {
                generateNewPlan();
                navigate("/plan");
                setSidebarOpen(false);
                toast("计划已重新生成");
              }
            }}
          >
            重新生成计划
          </button>
          <button
            className="ghost-button full"
            type="button"
            onClick={() => setShowAbout(true)}
          >
            关于
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

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </div>
  );
}
