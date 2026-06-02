import { t } from "../i18n";

export function Loading() {
  return (
    <div className="empty-state" style={{ padding: "60px 20px", textAlign: "center" }}>
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid #dbe3df",
          borderTopColor: "#315f4f",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 16px",
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <p className="muted">{t("loading.text")}</p>
    </div>
  );
}
