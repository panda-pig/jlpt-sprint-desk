import { useEffect, useState, useCallback } from "react";
import { Cloud, CloudCheck, LogOut, Mail } from "lucide-react";
import { supabase, isCloudEnabled } from "../lib/supabase";
import { sendMagicLink, signOut, reconcileOnSignIn, pushCloud } from "../lib/cloudSync";
import { toast } from "../lib/toast";
import { useLocale } from "../i18n/LocaleProvider";

export function CloudSync() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const runReconcile = useCallback(async () => {
    const outcome = await reconcileOnSignIn();
    if (outcome === "pulled") {
      toast(t("cloud.restored"));
      setTimeout(() => window.location.reload(), 600);
    } else if (outcome === "pushed") {
      toast(t("cloud.pushed"));
    }
  }, [t]);

  useEffect(() => {
    if (!supabase) return;
    // Pick up an existing session on load.
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setUserEmail(data.user.email);
        runReconcile();
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const mail = session?.user?.email || null;
      setUserEmail(mail);
      if (event === "SIGNED_IN" && mail) runReconcile();
      if (event === "SIGNED_OUT") setUserEmail(null);
    });
    return () => sub.subscription.unsubscribe();
  }, [runReconcile]);

  if (!isCloudEnabled()) return null;

  const handleSend = async () => {
    if (!email.trim()) {
      toast(t("cloud.enterEmail"));
      return;
    }
    setBusy(true);
    const { error } = await sendMagicLink(email.trim());
    setBusy(false);
    if (error) {
      toast(t("cloud.sendFailed", { error }));
    } else {
      setSent(true);
      toast(t("cloud.linkSent"));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUserEmail(null);
    setSent(false);
    toast(t("cloud.signedOut"));
  };

  const handleManualSync = async () => {
    setBusy(true);
    const { error } = await pushCloud();
    setBusy(false);
    toast(error ? t("cloud.syncFailed", { error }) : t("cloud.syncedOk"));
  };

  return (
    <section className="panel cloud-sync-panel">
      <div className="section-head compact">
        <div className="cloud-sync-head">
          <span className="cloud-sync-icon">
            {userEmail ? <CloudCheck size={20} /> : <Cloud size={20} />}
          </span>
          <div>
            <h2>{t("cloud.title")}</h2>
            <p>{userEmail ? t("cloud.descLoggedIn") : t("cloud.descLoggedOut")}</p>
          </div>
        </div>
      </div>

      {userEmail ? (
        <div className="cloud-sync-account">
          <div className="cloud-sync-user">
            <Mail size={15} />
            <strong>{userEmail}</strong>
          </div>
          <div className="button-row">
            <button className="secondary-button" type="button" onClick={handleManualSync} disabled={busy}>
              {t("cloud.syncNow")}
            </button>
            <button className="ghost-button" type="button" onClick={handleSignOut}>
              <LogOut size={15} /> {t("cloud.signOut")}
            </button>
          </div>
        </div>
      ) : sent ? (
        <div className="cloud-sync-sent">
          <p>{t("cloud.sentNote", { email })}</p>
          <button className="text-button" type="button" onClick={() => setSent(false)}>{t("cloud.changeEmail")}</button>
        </div>
      ) : (
        <div className="cloud-sync-form">
          <input
            type="email"
            inputMode="email"
            placeholder={t("cloud.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
          />
          <button className="primary-button" type="button" onClick={handleSend} disabled={busy}>
            {busy ? t("cloud.sending") : t("cloud.sendLink")}
          </button>
        </div>
      )}
    </section>
  );
}
