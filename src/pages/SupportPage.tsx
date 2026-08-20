import { useState } from "react";
import { Coffee, Star, Share2, HeartHandshake } from "lucide-react";
import { Button, Input, Title, Divider, Wallet } from "animal-island-ui";
import { useLocale } from "../i18n/LocaleProvider";
import { toast } from "../lib/toast";

const REPO_URL = "https://github.com/panda-pig/jlpt-sprint-desk";

// 爱发电主页地址，留空时支付按钮保持禁用
const AFDIAN_URL = "";

const PRESETS: { value: number; emoji: string; key: "amtCoffee" | "amtMeal" | "amtBook" }[] = [
  { value: 6, emoji: "☕", key: "amtCoffee" },
  { value: 18, emoji: "🍜", key: "amtMeal" },
  { value: 30, emoji: "📚", key: "amtBook" },
];

export function SupportPage() {
  const { t } = useLocale();
  const [selected, setSelected] = useState<number | "custom" | null>(null);
  const [customValue, setCustomValue] = useState("");

  const amount = selected === "custom" ? Math.floor(Number(customValue) || 0) : selected ?? 0;
  const configured = AFDIAN_URL.trim().length > 0;
  const canPay = configured && amount > 0;

  const handlePay = () => {
    if (!canPay) return;
    const url = `${AFDIAN_URL}${AFDIAN_URL.includes("?") ? "&" : "?"}amount=${amount}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

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
          <span className="support-hero-icon"><Coffee size={22} /></span>
          <div>
            <h2>{t("support.heroTitle")}</h2>
            <p>{t("support.heroBody")}</p>
          </div>
        </section>

        <section className="panel">
          <div className="section-head">
            <div>
              <Title size="small" color="app-teal">{t("support.amountTitle")}</Title>
              <p>{t("support.amountDesc")}</p>
            </div>
          </div>

          <div className="support-amount-grid" role="group" aria-label={t("support.amountTitle")}>
            {PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                className={`support-amount-chip ${selected === p.value ? "is-selected" : ""}`}
                aria-pressed={selected === p.value}
                onClick={() => { setSelected(p.value); setCustomValue(""); }}
              >
                <span className="support-amount-emoji">{p.emoji}</span>
                <strong>¥{p.value}</strong>
                <small>{t(`support.${p.key}`)}</small>
              </button>
            ))}
            <label className={`support-amount-chip support-amount-custom ${selected === "custom" ? "is-selected" : ""}`}>
              <span className="support-amount-emoji">✨</span>
              <span className="support-custom-field">
                <span className="support-custom-prefix">¥</span>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  placeholder={t("support.customPlaceholder")}
                  value={customValue}
                  onFocus={() => setSelected("custom")}
                  onChange={(e) => { setSelected("custom"); setCustomValue(e.target.value); }}
                />
              </span>
              <small>{t("support.custom")}</small>
            </label>
          </div>

          <div className="support-pay-area">
            {amount > 0 && (
              <div className="support-amount-summary">
                <span className="muted">{t("support.youTip")}</span>
                <Wallet value={amount} size="medium" />
              </div>
            )}
            <Button type="primary" block disabled={!canPay} onClick={handlePay} icon={<HeartHandshake size={16} />}>
              {amount > 0 ? t("support.payGo") : t("support.pickAmount")}
            </Button>
            <p className="muted support-pay-hint">{configured ? t("support.payHint") : t("support.setupHint")}</p>
          </div>
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
