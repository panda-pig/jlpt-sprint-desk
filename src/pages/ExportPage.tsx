import { useState, useRef } from "react";
import { FileText, Table, BarChart3, Download, Copy, Printer, Upload, AlertTriangle, Check, FileOutput, CalendarDays } from "lucide-react";
import { Button, Title, Divider } from "animal-island-ui";
import { useStudyDesk } from "../lib/studyDeskContext";
import { buildMarkdown, buildCsv, buildReport, buildBackupJSON, buildPrintView, buildICS } from "../lib/exporter";
import { downloadText, copyText } from "../lib/utils";
import { toast } from "../lib/toast";
import { useLocale } from "../i18n/LocaleProvider";

export function ExportPage() {
  const { state } = useStudyDesk();
  const { t } = useLocale();
  const generatedPlan = state.generatedPlan;
  const records = state.records;
  const [activeTab, setActiveTab] = useState("markdown");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const profileName = state.profiles.find((p) => p.id === state.activeProfileId)?.name || t("export.unnamed");

  const generateOutput = (type: string) => {
    if (!generatedPlan) {
      setOutput(t("export.noPlan"));
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
      case "ics":
        setOutput(buildICS(generatedPlan, profileName));
        break;
      default:
        setOutput("");
    }
  };

  const handleCopy = async () => {
    if (!output) {
      toast(t("export.genFirst"));
      return;
    }
    await copyText(output);
    setCopied(true);
    toast(t("export.copied2"));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) {
      toast(t("export.genFirst"));
      return;
    }

    const filenames: Record<string, string> = {
      markdown: `jlpt-plan-${profileName}-${new Date().toISOString().slice(0, 10)}.md`,
      csv: `jlpt-plan-${profileName}-${new Date().toISOString().slice(0, 10)}.csv`,
      report: `jlpt-report-${profileName}-${new Date().toISOString().slice(0, 10)}.html`,
      backup: `jlpt-backup-${profileName}-${new Date().toISOString().slice(0, 10)}.json`,
      print: `jlpt-plan-${profileName}-${new Date().toISOString().slice(0, 10)}.html`,
      ics: `jlpt-plan-${profileName}-${new Date().toISOString().slice(0, 10)}.ics`,
    };

    const types: Record<string, string> = {
      markdown: "text/markdown",
      csv: "text/csv",
      report: "text/html",
      backup: "application/json",
      print: "text/html",
      ics: "text/calendar",
    };

    downloadText(filenames[activeTab] || "export.txt", output, types[activeTab] || "text/plain");
    toast(t("export.downloaded", { name: filenames[activeTab] }));
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
        toast(t("export.importError"));
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { key: "markdown", label: "Markdown", desc: t("export.mdDesc"), icon: FileText, color: "#315f4f", ext: ".md" },
    { key: "csv", label: t("export.csvLabel"), desc: t("export.csvDesc"), icon: Table, color: "#35647c", ext: ".csv" },
    { key: "report", label: t("export.reportLabel"), desc: t("export.reportDesc"), icon: BarChart3, color: "#b77a20", ext: ".html" },
    { key: "backup", label: t("export.backupLabel"), desc: t("export.backupDesc"), icon: Download, color: "#3d7757", ext: ".json" },
    { key: "print", label: t("export.printLabel"), desc: t("export.printDesc"), icon: Printer, color: "#6d5486", ext: ".html" },
    { key: "ics", label: t("export.icsLabel"), desc: t("export.icsDesc"), icon: CalendarDays, color: "#35647c", ext: ".ics" },
  ];

  const activeTabInfo = tabs.find((t) => t.key === activeTab);
  const outputLength = output.length;
  const outputLines = output ? output.split("\n").length : 0;

  return (
    <div className="export-page stack">
      <section className="panel export-type-panel">
        <div className="section-head compact">
          <div>
            <Title size="small" color="app-teal">{t("export.chooseFormat")}</Title>
            <p>{t("export.chooseFormatDesc")}</p>
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

      <Divider type="line-teal" />

      <section className="panel export-preview-panel">
        <div className="export-preview-header">
          <div className="export-preview-info">
            <span className="export-preview-icon">
              <FileOutput size={18} />
            </span>
            <div>
              <strong>{activeTabInfo?.label || t("export.exportContent")}</strong>
              <span className="export-preview-meta">
                {outputLength > 0 ? t("export.charsLines", { chars: outputLength.toLocaleString(), lines: outputLines }) : t("export.clickToGen")}
              </span>
            </div>
          </div>
          <div className="export-preview-actions">
            <Button type="default" onClick={handleCopy} disabled={!output} icon={<Copy size={15} />}>
              {copied ? t("export.copyDone") : t("export.copy")}
            </Button>
            <Button type="primary" onClick={handleDownload} disabled={!output} icon={<Download size={15} />}>
              {t("export.download")}
            </Button>
          </div>
        </div>
        <textarea
          className="export-preview-textarea"
          value={output}
          onChange={(e) => setOutput(e.target.value)}
          placeholder={t("export.outputPlaceholder")}
          readOnly={!generatedPlan}
        />
      </section>

      <section className="panel import-panel">
        <div className="import-header">
          <span className="import-icon">
            <AlertTriangle size={22} />
          </span>
          <div>
            <h2>{t("export.importBackup")}</h2>
            <p>{t("export.importDesc")}</p>
          </div>
        </div>
        <div className="import-body">
          <div className="import-upload-zone">
            <Upload size={32} />
            <span>{t("export.dropHint")}</span>
            <input ref={importInputRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleImport} />
            <Button type="default" onClick={() => importInputRef.current?.click()}>
              {t("export.chooseFile")}
            </Button>
          </div>
          <div className="import-warning">
            <AlertTriangle size={14} />
            <span>{t("export.irreversible")}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
