import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Modal, Cursor, Footer } from "animal-island-ui";
import { SideNav } from "./SideNav";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import { useStudyDesk } from "../lib/studyDeskContext";
import { useLocale } from "../i18n/LocaleProvider";
import { toast } from "../lib/toast";
import type { ReactNode } from "react";

function renderBold(text: string): ReactNode {
  // Render **bold** segments inside a translated string.
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : p,
  );
}

function AboutModal({ onClose }: { onClose: () => void }) {
  const { t } = useLocale();
  return (
    <Modal
      open={true}
      title={t("about.title")}
      onClose={onClose}
      onOk={onClose}
      width={520}
    >
      <p>{renderBold(t("about.intro"))}</p>

      <h3>{t("about.featuresTitle")}</h3>
      <ul>
        <li>📅 {renderBold(t("about.feature1"))}</li>
        <li>📝 {renderBold(t("about.feature2"))}</li>
        <li>📊 {renderBold(t("about.feature3"))}</li>
        <li>💾 {renderBold(t("about.feature4"))}</li>
        <li>📱 {renderBold(t("about.feature5"))}</li>
      </ul>

      <h3>{t("about.stackTitle")}</h3>
      <p>{t("about.stackBody")}</p>

      <h3>{t("about.openSourceTitle")}</h3>
      <p>
        {t("about.sourceLabel")}：<a href="https://github.com/panda-pig/jlpt-sprint-desk" target="_blank" rel="noopener noreferrer">GitHub</a><br />
        {t("about.licenseLabel")}：MIT License
      </p>

      <h3>{t("about.privacyTitle")}</h3>
      <p>{t("about.privacyBody")}</p>
    </Modal>
  );
}

function LanguageSwitch() {
  const { locale, setLocale, t } = useLocale();
  return (
    <div className="lang-switch" role="group" aria-label={t("layout.language")}>
      <button
        type="button"
        className={locale === "zh" ? "is-active" : ""}
        onClick={() => setLocale("zh")}
      >
        中文
      </button>
      <button
        type="button"
        className={locale === "en" ? "is-active" : ""}
        onClick={() => setLocale("en")}
      >
        EN
      </button>
    </div>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { generateNewPlan } = useStudyDesk();
  const { t } = useLocale();
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
    <Cursor>
      <div className="app-shell">
        <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
          <div className="brand-block">
            <a className="brand" href="#/dashboard" onClick={() => setSidebarOpen(false)}>
              <span className="brand-mark">JL</span>
              <span>
                <strong>JLPT Sprint Desk</strong>
                <small>{t("common.appTagline")}</small>
              </span>
            </a>
          </div>
          <SideNav activeRoute={route} onNavigate={() => setSidebarOpen(false)} />
          <div className="side-footer">
            <LanguageSwitch />
            <Button
              type="default"
              block
              onClick={() => {
                if (window.confirm(t("layout.regenerateConfirm"))) {
                  generateNewPlan();
                  navigate("/plan");
                  setSidebarOpen(false);
                  toast(t("layout.regenerateDone"));
                }
              }}
            >
              {t("layout.regenerate")}
            </Button>
            <Button
              type="dashed"
              block
              onClick={() => setShowAbout(true)}
            >
              {t("layout.about")}
            </Button>
            <a
              className="support-footer-link"
              href="#/support"
              onClick={() => setSidebarOpen(false)}
            >
              ☕ {t("layout.support")}
            </a>
            <p>{t("layout.storageNote")}</p>
          </div>
        </aside>

        <div className="workspace">
          <header className="topbar">
            <button
              className="icon-button menu-button"
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={t("layout.toggleNav")}
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
          <Footer type="sea" seamless />
        </div>

        {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      </div>
    </Cursor>
  );
}
