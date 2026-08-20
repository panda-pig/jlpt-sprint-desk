import { Sparkles, Star, Share2, Rocket } from "lucide-react";
import { Button, Title, Divider } from "animal-island-ui";
import { useLocale } from "../i18n/LocaleProvider";
import { toast } from "../lib/toast";

const REPO_URL = "https://github.com/panda-pig/jlpt-sprint-desk";

const ROADMAP = ["r1", "r2", "r3", "r4"] as const;

export function SupportPage() {
  const { t } = useLocale();

  const handleShare = async () => {
    const url = window.location.origin + window.location.pathname;
    try {
      if (navigator.share) {
        await navigator.share({ title: t("common.appName"), url });
        return;
      }
    } catch { /* ignore */ }
    try {
      await navigator.clipboard.writeText(url);
      toast(t("support.shareCopied"));
    } catch {
      toast(url);
    }
  };

  return (
    <div className="support-page">
      <section className="stack">
        <section className="panel support-hero">
          <span className="support-hero-icon"><Sparkles size={22} /></span>
          <div>
            <h2>{t("support.heroTitle")}</h2>
            <p>{t("support.heroBody")}</p>
          </div>
        </section>

        <section className="panel">
          <div className="section-head">
            <div>
              <Title size="small" color="app-teal">{t("support.roadmapTitle")}</Title>
              <p>{t("support.roadmapDesc")}</p>
            </div>
          </div>
          <ul className="support-roadmap">
            {ROADMAP.map((key) => (
              <li key={key} className="support-roadmap-item">
                <span className="support-roadmap-icon"><Rocket size={15} /></span>
                <div className="support-roadmap-text">
                  <strong>{t(`support.${key}Title`)}</strong>
                  <p>{t(`support.${key}Desc`)}</p>
                </div>
                <span className="support-roadmap-badge">{t("support.soon")}</span>
              </li>
            ))}
          </ul>
          <p className="muted support-roadmap-note">{t("support.roadmapNote")}</p>
        </section>

        <Divider type="wave-yellow" />

        <section className="panel">
          <div className="section-head">
            <div>
              <Title size="small" color="app-yellow">{t("support.freeTitle")}</Title>
              <p>{t("support.freeDesc")}</p>
            </div>
          </div>
          <div className="support-free-row">
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
              <Button type="default" icon={<Star size={15} />}>{t("support.star")}</Button>
            </a>
            <Button type="default" onClick={handleShare} icon={<Share2 size={15} />}>
              {t("support.share")}
            </Button>
          </div>
          <p className="support-thanks">{t("support.thanks")}</p>
        </section>
      </section>
    </div>
  );
}
