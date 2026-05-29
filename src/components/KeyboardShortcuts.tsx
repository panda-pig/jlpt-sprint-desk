import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Keyboard, X } from "lucide-react";

const SHORTCUTS = [
  { key: "g d", label: "转到总览", action: "#/dashboard" },
  { key: "g s", label: "转到设置", action: "#/setup" },
  { key: "g p", label: "转到计划", action: "#/plan" },
  { key: "g r", label: "转到记录", action: "#/record" },
  { key: "g a", label: "转到分析", action: "#/analysis" },
  { key: "g e", label: "转到导出", action: "#/export" },
  { key: "?", label: "显示帮助", action: "help" },
  { key: "Escape", label: "关闭弹窗/返回", action: "escape" },
];

export function KeyboardShortcuts() {
  const navigate = useNavigate();
  const [showHelp, setShowHelp] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // 忽略输入框内的快捷键
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        if (e.key === "Escape") {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      const key = e.key.toLowerCase();
      setPressedKeys((prev) => [...prev.slice(-2), key]);

      // 帮助面板
      if (key === "?" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowHelp(true);
        return;
      }

      // Escape 关闭帮助
      if (key === "escape") {
        setShowHelp(false);
        return;
      }

      // g + 字母导航
      if (key === "g") {
        setPressedKeys(["g"]);
        return;
      }

      if (pressedKeys.includes("g")) {
        const routeMap: Record<string, string> = {
          d: "/dashboard",
          s: "/setup",
          p: "/plan",
          r: "/record",
          a: "/analysis",
          e: "/export",
        };

        if (routeMap[key]) {
          e.preventDefault();
          navigate(routeMap[key]);
          setPressedKeys([]);
        }
      }
    },
    [navigate, pressedKeys]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!showHelp) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(24, 37, 34, 0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={() => setShowHelp(false)}
    >
      <div
        style={{
          background: "var(--surface, #ffffff)",
          borderRadius: "var(--radius, 8px)",
          boxShadow: "var(--shadow, 0 16px 40px rgba(34, 53, 48, 0.08))",
          maxWidth: "480px",
          width: "100%",
          maxHeight: "80vh",
          overflow: "auto",
          padding: "24px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Keyboard size={20} style={{ color: "var(--primary, #315f4f)" }} />
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>键盘快捷键</h3>
          </div>
          <button
            className="ghost-button"
            onClick={() => setShowHelp(false)}
            style={{ padding: "4px" }}
          >
            <X size={18} />
          </button>
        </div>
        <p style={{ color: "var(--muted, #70817a)", fontSize: "13px", marginBottom: "16px" }}>
          在任意页面按 <kbd>?</kbd> 显示此面板。输入框内按 <kbd>Esc</kbd> 可取消聚焦。
        </p>
        <div style={{ display: "grid", gap: "8px" }}>
          {SHORTCUTS.map((shortcut) => (
            <div
              key={shortcut.key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                background: "var(--bg, #f6f7f4)",
                borderRadius: "6px",
              }}
            >
              <span style={{ fontSize: "14px" }}>{shortcut.label}</span>
              <kbd
                style={{
                  fontFamily: "monospace",
                  fontSize: "12px",
                  padding: "2px 8px",
                  background: "var(--surface, #ffffff)",
                  border: "1px solid var(--line, #dbe3df)",
                  borderRadius: "4px",
                  boxShadow: "0 1px 0 var(--line, #dbe3df)",
                }}
              >
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
