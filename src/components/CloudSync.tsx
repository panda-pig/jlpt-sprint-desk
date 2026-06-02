import { useEffect, useState, useCallback } from "react";
import { Cloud, CloudCheck, LogOut, Mail } from "lucide-react";
import { supabase, isCloudEnabled } from "../lib/supabase";
import { sendMagicLink, signOut, reconcileOnSignIn, pushCloud } from "../lib/cloudSync";
import { toast } from "../lib/toast";

export function CloudSync() {
  const [email, setEmail] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const runReconcile = useCallback(async () => {
    const outcome = await reconcileOnSignIn();
    if (outcome === "pulled") {
      toast("已从云端恢复最新数据。");
      setTimeout(() => window.location.reload(), 600);
    } else if (outcome === "pushed") {
      toast("本地数据已同步到云端。");
    }
  }, []);

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
      toast("请先输入邮箱。");
      return;
    }
    setBusy(true);
    const { error } = await sendMagicLink(email.trim());
    setBusy(false);
    if (error) {
      toast(`发送失败：${error}`);
    } else {
      setSent(true);
      toast("登录链接已发送，请查收邮箱。");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUserEmail(null);
    setSent(false);
    toast("已退出登录（本地数据保留）。");
  };

  const handleManualSync = async () => {
    setBusy(true);
    const { error } = await pushCloud();
    setBusy(false);
    toast(error ? `同步失败：${error}` : "已同步到云端。");
  };

  return (
    <section className="panel cloud-sync-panel">
      <div className="section-head compact">
        <div className="cloud-sync-head">
          <span className="cloud-sync-icon">
            {userEmail ? <CloudCheck size={20} /> : <Cloud size={20} />}
          </span>
          <div>
            <h2>云同步</h2>
            <p>{userEmail ? "已登录，数据会自动跨设备同步。" : "登录后，学习计划和记录会自动备份并跨设备同步。"}</p>
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
              立即同步
            </button>
            <button className="ghost-button" type="button" onClick={handleSignOut}>
              <LogOut size={15} /> 退出
            </button>
          </div>
        </div>
      ) : sent ? (
        <div className="cloud-sync-sent">
          <p>登录链接已发送到 <strong>{email}</strong>，点击邮件中的链接即可登录。</p>
          <button className="text-button" type="button" onClick={() => setSent(false)}>换个邮箱</button>
        </div>
      ) : (
        <div className="cloud-sync-form">
          <input
            type="email"
            inputMode="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
          />
          <button className="primary-button" type="button" onClick={handleSend} disabled={busy}>
            {busy ? "发送中…" : "发送登录链接"}
          </button>
        </div>
      )}
    </section>
  );
}
