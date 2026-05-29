import { useState } from "react";
import { FileText, Table, BarChart3, Download, Copy, Printer, Upload } from "lucide-react";
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
    await copyText(output);
    setCopied(true);
    toast("内容已复制。");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filenames: Record<string, string> = {
      markdown: `jlpt-plan-${profileName}-${new Date().toISOString().slice(0, 10)}.md`,
      csv: `jlpt-plan-${profileName}-${new Date().toISOString().slice(0, 10)}.csv`,
      report: `jlpt-report-${profileName}-${new Date().toISOString().slice(0, 10)}.md`,
      backup: `jlpt-backup-${profileName}-${new Date().toISOString().slice(0, 10)}.json`,
      print: `jlpt-plan-${profileName}-${new Date().toISOString().slice(0, 10)}.html`,
    };

    const types: Record<string, string> = {
      markdown: "text/markdown",
      csv: "text/csv",
      report: "text/markdown",
      backup: "application/json",
      print: "text/html",
    };

    downloadText(filenames[activeTab] || "export.txt", output, types[activeTab] || "text/plain");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (data.planSettings) {
          localStorage.setItem(`jlptSprintDesk:${state.activeProfileId}:planSettings`, JSON.stringify(data.planSettings));
        }
        if (data.generatedPlan) {
          localStorage.setItem(`jlptSprintDesk:${state.activeProfileId}:generatedPlan`, JSON.stringify(data.generatedPlan));
        }
        if (data.planEdits) {
          localStorage.setItem(`jlptSprintDesk:${state.activeProfileId}:planEdits`, JSON.stringify(data.planEdits));
        }
        if (data.records) {
          localStorage.setItem(`jlptSprintDesk:${state.activeProfileId}:records`, JSON.stringify(data.records));
        }
        window.location.reload();
      } catch {
        toast("备份文件格式错误");
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { key: "markdown", label: "Notion Markdown", icon: FileText },
    { key: "csv", label: "CSV 导出", icon: Table },
    { key: "report", label: "学习报告", icon: BarChart3 },
    { key: "backup", label: "备份 JSON", icon: Download },
    { key: "print", label: "打印视图", icon: Printer },
  ];

  return (
    <div className="export-page stack">
      <section className="panel">
        <div className="section-head">
          <div>
            <h2>导出类型</h2>
            <p>选择需要的导出格式。</p>
          </div>
        </div>
        <div className="export-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`tab-button ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.key);
                generateOutput(tab.key);
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <h2>导出内容</h2>
            <p>预览和下载导出结果。</p>
          </div>
          <div className="button-row">
            <button className="secondary-button" onClick={handleCopy}>
              <Copy size={16} /> {copied ? "已复制" : "复制"}
            </button>
            <button className="primary-button" onClick={handleDownload}>
              <Download size={16} /> 下载
            </button>
          </div>
        </div>
        <textarea
          className="export-output"
          value={output}
          onChange={(e) => setOutput(e.target.value)}
          placeholder="点击上方导出类型按钮生成内容..."
        />
      </section>

      <section className="panel">
        <div className="section-head">
          <div>
            <h2>导入备份</h2>
            <p>导入备份文件会覆盖当前档案的数据，请谨慎操作。</p>
          </div>
        </div>
        <label className="secondary-button file-button">
          <Upload size={16} /> 选择备份文件
          <input type="file" accept=".json" onChange={handleImport} />
        </label>
      </section>
    </div>
  );
}
