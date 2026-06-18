import { useState } from "react";
import { Coffee, Star, Share2, QrCode } from "lucide-react";
import { useLocale } from "../i18n/LocaleProvider";
import { toast } from "../lib/toast";

const REPO_URL = "https://github.com/panda-pig/jlpt-sprint-desk";

// ── Owner config ────────────────────────────────────────────────────────────
// Drop your own QR images into /public (e.g. public/qr-wechat.png) and fill in
// your tip links below. Empty links are hidden automatically.
const QR_METHODS: { id: "wechat" | "alipay"; img: string; accent: string }[] = [
  { id: "wechat", img: "/qr-wechat.png", accent: "#07c160" },
  { id: "alipay", img: "/qr-alipay.png", accent: "#1677ff" },
];
const LINK_METHODS: { id: "kofi" | "afdian"; url: string; accent: string }[] = [
  { id: "kofi", url: "" /* e.g. https://ko-fi.com/yourname */, accent: "#ff5e5b" },
  { id: "afdian", url: "" /* e.g. https://afdian.com/a/yourname */, accent: "#946ce6" },
];
// ─────────────────────────────────────────────────────────────────────────────

function QrCard({ id, img, accent }: { id: string; img: string; accent: string }) {
  const { t } = useLocale();
  const [broken, setBroken] = useState(false);
  return (
    <div className="support-qr-card">
      <span className="support-qr-tag" style={{ ["--accent" as string]: accent }}>{t(`support.${id}`)}</span>
      <div className="support-qr-frame">
        {broken ? (
          <div className="support-qr-placeholder">
            <QrCode size={28} />
            <small>{t("support.qrHint", { path: img })}</small>
          </div>
        ) : (
          <img src={img} alt={t(`support.${id}`)} onError={() => setBroken(true)} />
        )}
      </div>
    </div>
  );
}

export function SupportPage() {
  const { t } = useLocale();
  const links = LINK_METHODS.filter((m) => m.url.trim().length > 0);

  const handleShare = async () => {
    const url = window.location.origin + window.location.pathname;
    try {
      if (navigator.share) {
        await navigator.share({ title: t("common.appName"), url });
        return;
      }
    } catch {
      /* user cancelled — fall through to copy */
    }
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
          <span className="support-hero-icon"><Coffee size={22} /></span>
          <div>
            <h2>{t("support.heroTitle")}</h2>
            <p>{t("support.heroBody")}</p>
          </div>
        </section>

        <section className="panel">
          <div className="section-head">
            <div>
              <h2>{t("support.qrTitle")}</h2>
              <p>{t("support.qrDesc")}</p>
            </div>
          </div>
          <div className="support-qr-grid">
            {QR_METHODS.map((m) => (
              <QrCard key={m.id} id={m.id} img={m.img} accent={m.accent} />
            ))}
          </div>

          {links.length > 0 && (
            <div className="support-links">
              {links.map((m) => (
                <a
                  key={m.id}
                  className="support-link-btn"
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ["--accent" as string]: m.accent }}
                >
                  {t(`support.${m.id}`)}
                </a>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="section-head">
            <div>
              <h2>{t("support.freeTitle")}</h2>
              <p>{t("support.freeDesc")}</p>
            </div>
          </div>
          <div className="support-free-row">
            <a className="secondary-button" href={REPO_URL} target="_blank" rel="noopener noreferrer">
              <Star size={15} /> {t("support.star")}
            </a>
            <button className="secondary-button" type="button" onClick={handleShare}>
              <Share2 size={15} /> {t("support.share")}
            </button>
          </div>
          <p className="support-thanks">{t("support.thanks")}</p>
        </section>
      </section>
    </div>
  );
}
