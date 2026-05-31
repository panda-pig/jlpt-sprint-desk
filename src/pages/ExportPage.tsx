import { useState } from "react";
import { FileText, Table, BarChart3, Download, Copy, Printer, Upload, AlertTriangle, Check, FileOutput } from "lucide-react";
import { useStudyDesk } from "../lib/studyDeskContext";
import { buildMarkdown, buildCsv, buildReport, buildBackupJSON, buildPrintView } from "../lib/exporter";
import { downloadText, copyText } from "../lib/utils";
import { toast } from "../lib/toast";

export function ExportPage() {
  const { state } = useStudyDesk();
  const generatedPlan = state.generatedPlan;
  const records = state.records;
  const [activeTab, setActiveTab] = useState("markdown");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const profileName = state.profiles.find((p) => p.id === state.activeProfileId)?.name || "未命名";

  const generateOutput = (type: string) => {
    if (!generatedPlan) {
      setOutput("还没有生成计划，请先去设置页面生成学习计划。");
      return;
    }

    switch (type) {
      case "markdown":
        setOutput(buildMarkdown(generatedPlan, records, profileName));
        break;
      case "csv":
        setOutput(buildCsv(generatedPlan));
        break;
      case "report":
        setOutput(buildReport(generatedPlan, records, profileName));
        break;
      case "backup":
        setOutput(buildBackupJSON(profileName, generatedPlan, state.settings, state.planEdits, records));
        break;
      case "print":
        setOutput(buildPrintView(generatedPlan));
        break;
      default:
        setOutput("");
    }
  };

  const handleCopy = async () => {
    if (!output) {
      toast("请先生成导出内容。");
      return;
    }
    await copyText(output);
    setCopied(true);
    toast("内容已复制到剪贴板。");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) {
      toast("请先生成导出内容。");
      return;
    }

    const filenames: Record<string, string> = {
      markdown: `jlpt-plan-${profileName}-${new Date().toISOString().slice(0, 10)}.md`,
      csv: `jlpt-plan-${profileName}-${new Date().toISOString().slice(0, 10)}.csv`,
      report: `jlpt-report-${profileName}-${new Date().toISOString().slice(0, 10)}.html`,
      backup: `jlpt-backup-${profileName}-${new Date().toISOString().slice(0, 10)}.json`,
      print: `jlpt-plan-${profileName}-${new Date().toISOString().slice(0, 10)}.html`,
    };

    const types: Record<string, string> = {
      markdown: "text/markdown",
      csv: "text/csv",
      report: "text/html",
      backup: "application/json",
      print: "text/html",
    };

    downloadText(filenames[activeTab] || "export.txt", output, types[activeTab] || "text/plain");
    toast(`已下载: ${filenames[activeTab]}`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (data.data && typeof data.data === "object") {
          // Format: { data: { jlptSprintDesk...: "..." } } from SetupPage export
          Object.entries(data.data).forEach(([key, value]) => {
            localStorage.setItem(key, String(value));
          });
        } else {
          // Format: { planSettings, generatedPlan, planEdits, records } from ExportPage
          const profileId = state.activeProfileId;
          if (data.planSettings) localStorage.setItem(`jlptSprintDesk:${profileId}:planSettings`, JSON.stringify(data.planSettings));
          if (data.generatedPlan) localStorage.setItem(`jlptSprintDesk:${profileId}:generatedPlan`, JSON.stringify(data.generatedPlan));
          if (data.planEdits) localStorage.setItem(`jlptSprintDesk:${profileId}:planEdits`, JSON.stringify(data.planEdits));
          if (data.records) localStorage.setItem(`jlptSprintDesk:${profileId}:records`, JSON.stringify(data.records));
        }
        window.location.reload();
      } catch {
        toast("备份文件格式错误，无法导入。");
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    {
      key: "markdown",
      label: "Markdown",
      desc: "Notion 友好格式",
      icon: FileText,
      color: "#315f4f",
      ext: ".md",
    },
    {
      key: "csv",
      label: "CSV 表格",
      desc: "Excel 可直接打开",
      icon: Table,
      color: "#35647c",
      ext: ".csv",
    },
    {
      key: "report",
      label: "学习报告",
      desc: "带统计的完整报告",
      icon: BarChart3,
      color: "#b77a20",
      ext: ".html",
    },
    {
      key: "backup",
      label: "完整备份",
      desc: "JSON 格式全量数据",
      icon: Download,
      color: "#3d7757",
      ext: ".json",
    },
    {
      key: "print",
      label: "打印视图",
      desc: "A4 纸友好排版",
      icon: Printer,
      color: "#6d5486",
      ext: ".html",
    },
  ];

  const activeTabInfo = tabs.find((t) => t.key === activeTab);
  const outputLength = output.length;
  const outputLines = output ? output.split("\n").length : 0;

  return (
    <div className="export-page stack">
      <section className="panel export-type-panel">
        <div className="section-head compact">
          <div>
            <h2>选择导出格式</h2>
            <p>点击卡片生成对应格式的导出内容。</p>
          </div>
        </div>
        <div className="export-cards">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`export-card ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.key);
                generateOutput(tab.key);
              }}
            >
              <span className="export-card-icon" style={{ background: `${tab.color}15`, color: tab.color }}>
                <tab.icon size={22} />
              </span>
              <span className="export-card-label">{tab.label}</span>
              <span className="export-card-desc">{tab.desc}</span>
              <span className="export-card-ext">{tab.ext}</span>
              {activeTab === tab.key && (
                <span className="export-card-check">
                  <Check size={14} />
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="panel export-preview-panel">
        <div className="export-preview-header">
          <div className="export-preview-info">
            <span className="export-preview-icon">
              <FileOutput size={18} />
            </span>
            <div>
              <strong>{activeTabInfo?.label || "导出内容"}</strong>
              <span className="export-preview-meta">
                {outputLength > 0 ? `${outputLength.toLocaleString()} 字符 · ${outputLines} 行` : "点击上方卡片生成内容"}
              </span>
            </div>
          </div>
          <div className="export-preview-actions">
            <button className="secondary-button" onClick={handleCopy} disabled={!output}>
              <Copy size={15} />
              {copied ? "已复制" : "复制"}
            </button>
            <button className="primary-button" onClick={handleDownload} disabled={!output}>
              <Download size={15} />
              下载
            </button>
          </div>
        </div>
        <textarea
          className="export-preview-textarea"
          value={output}
          onChange={(e) => setOutput(e.target.value)}
          placeholder="点击上方导出格式卡片生成内容..."
          readOnly={!generatedPlan}
        />
      </section>

      <section className="panel import-panel">
        <div className="import-header">
          <span className="import-icon">
            <AlertTriangle size={22} />
          </span>
          <div>
            <h2>导入备份</h2>
            <p>从备份文件恢复数据，会覆盖当前档案的所有设置、计划和记录。</p>
          </div>
        </div>
        <div className="import-body">
          <div className="import-upload-zone">
            <Upload size={32} />
            <span>拖放备份文件到此处，或点击选择</span>
            <label className="secondary-button file-button">
              选择备份文件 (.json)
              <input type="file" accept=".json" onChange={handleImport} />
            </label>
          </div>
          <div className="import-warning">
            <AlertTriangle size={14} />
            <span>导入操作不可撤销，建议在导入前先导出一份当前备份。</span>
          </div>
        </div>
      </section>
    </div>
  );
}
