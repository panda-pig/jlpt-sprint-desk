import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStudyDesk } from "../lib/studyDeskContext";
import { LEVEL_CONFIG, STATIC_SELECT_OPTIONS, STATIC_WEAKNESS_OPTIONS, STATIC_BLOCKER_OPTIONS } from "../lib/constants";
import { formatDate } from "../lib/utils";
import { toast } from "../lib/toast";
import type { Level, PlanSettings } from "../lib/types";

const WEAKNESS_ICONS: Record<string, string> = {
  vocab: "📚",
  grammar: "📝",
  reading: "📖",
  listening: "🎧",
};

const BLOCKER_ICONS: Record<string, string> = {
  procrastination: "😴",
  confused: "🤔",
  review: "🔄",
  time: "⏱️",
};

export function SetupPage() {
  const navigate = useNavigate();
  const {
    state,
    createProfile,
    deleteProfile,
    setActiveProfile,
    updateSettings,
    generateNewPlan,
  } = useStudyDesk();

  const [newProfileName, setNewProfileName] = useState("");

  const targetScoreRef = useRef<HTMLInputElement>(null);
  const dailyVocabGoalRef = useRef<HTMLInputElement>(null);
  const dailyGrammarGoalRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (targetScoreRef.current) {
      targetScoreRef.current.value = String(state.settings.targetScore || "");
    }
  }, [state.settings.targetScore]);

  useEffect(() => {
    if (dailyVocabGoalRef.current) {
      dailyVocabGoalRef.current.value = String(state.settings.dailyVocabGoal || "");
    }
  }, [state.settings.dailyVocabGoal]);

  useEffect(() => {
    if (dailyGrammarGoalRef.current) {
      dailyGrammarGoalRef.current.value = String(state.settings.dailyGrammarGoal || "");
    }
  }, [state.settings.dailyGrammarGoal]);

  const handleCreateProfile = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) {
      toast("请先输入档案名称。");
      return;
    }
    createProfile(newProfileName.trim());
    setNewProfileName("");
  }, [newProfileName, createProfile]);

  const handleGeneratePlan = useCallback(() => {
    generateNewPlan();
    navigate("/plan");
  }, [generateNewPlan, navigate]);

  const setField = useCallback(<K extends keyof PlanSettings>(key: K, value: PlanSettings[K]) => {
    updateSettings({ [key]: value } as Partial<PlanSettings>);
  }, [updateSettings]);

  const toggleWeakness = useCallback((key: string) => {
    const current = state.settings.weaknesses || [];
    const next = current.includes(key) ? current.filter((w) => w !== key) : [...current, key];
    setField("weaknesses", next);
  }, [state.settings.weaknesses, setField]);

  const toggleBlocker = useCallback((key: string) => {
    const current = state.settings.blockers || [];
    const next = current.includes(key) ? current.filter((b) => b !== key) : [...current, key];
    setField("blockers", next);
  }, [state.settings.blockers, setField]);

  const activeProfile = state.profiles.find((p) => p.id === state.activeProfileId);

  return (
    <div className="setup-page stack">
      <section className="panel setup-document-panel">
        <div className="setup-title-row">
          <span className="setup-step-badge">1</span>
          <div>
            <h2>本地档案</h2>
            <p>先确定当前学习档案。计划设置、每日微调和学习记录都会按档案分别保存。</p>
          </div>
          {activeProfile && <span className="setup-profile-pill">{activeProfile.name}</span>}
        </div>
        <div className="setup-document-grid">
          <div className="field">
            <label htmlFor="profileSelect">当前档案</label>
            <select
              id="profileSelect"
              value={state.activeProfileId || ""}
              onChange={(e) => setActiveProfile(e.target.value)}
            >
              {state.profiles.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <div className="button-row setup-actions">
              <button className="secondary-button" type="button" onClick={() => {
                const backup: Record<string, string> = {};
                Object.keys(localStorage).forEach((key) => {
                  if (key.startsWith("jlptSprintDesk")) {
                    backup[key] = localStorage.getItem(key) || "";
                  }
                });
                const json = JSON.stringify({
                  exportedAt: new Date().toISOString(),
                  data: backup,
                });
                const blob = new Blob([json], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "jlpt-backup.json";
                a.click();
              }}>
                导出备份
              </button>
              <label className="secondary-button file-button">
                导入备份
                <input
                  id="setupBackupInput"
                  type="file"
                  accept="application/json,.json"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      try {
                        const data = JSON.parse(String(reader.result));
                        if (data.data && typeof data.data === "object") {
                          Object.entries(data.data).forEach(([key, value]) => {
                            localStorage.setItem(key, String(value));
                          });
                          window.location.reload();
                        } else {
                          toast("备份文件格式错误");
                        }
                      } catch {
                        toast("备份文件格式错误");
                      }
                    };
                    reader.readAsText(file);
                  }}
                />
              </label>
              <button
                className="ghost-button"
                type="button"
                onClick={() => {
                  if (activeProfile && confirm(`确定要删除档案「${activeProfile.name}」吗？`)) {
                    deleteProfile(activeProfile.id);
                  }
                }}
              >
                删除当前档案
              </button>
            </div>
          </div>
          <form onSubmit={handleCreateProfile} className="field">
            <label htmlFor="profileName">新建档案</label>
            <input
              id="profileName"
              name="profileName"
              aria-label="新档案名称"
              placeholder="例：Panda 的 N1 冲刺档案"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
            />
            <button className="primary-button fit" type="submit">新建档案</button>
          </form>
        </div>
        {activeProfile && (
          <p className="setup-status">
            {activeProfile.name} 已载入。当前档案更新时间：<span className="nowrap-text">{formatDate(activeProfile.updatedAt || activeProfile.createdAt)}</span>。
          </p>
        )}
      </section>

      <div className="stack">
        <section className="panel setup-form-panel">
          <div className="setup-title-row compact">
            <span className="setup-step-badge">2</span>
            <div>
              <h2>目标与节奏</h2>
              <p>决定倒计时、每日分钟数和阶段切换。</p>
            </div>
          </div>
          <div className="form-grid three setup-grid">
            <div className="field">
              <label htmlFor="level">目标等级</label>
              <select id="level" value={state.settings.level} onChange={(e) => setField("level", e.target.value as Level)}>
                {Object.keys(LEVEL_CONFIG).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="currentLevel">当前水平</label>
              <select id="currentLevel" value={state.settings.currentLevel} onChange={(e) => setField("currentLevel", e.target.value)}>
                {STATIC_SELECT_OPTIONS.currentLevel.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="examDate">考试日期</label>
              <input id="examDate" type="date" value={state.settings.examDate} onChange={(e) => setField("examDate", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="weekdayMinutes">工作日时间</label>
              <input id="weekdayMinutes" type="number" min={20} max={600} value={state.settings.weekdayMinutes || ''} placeholder="例：120" onChange={(e) => {
  const val = e.target.value;
  setField("weekdayMinutes", val === '' ? 0 : Number(val));
}} />
            </div>
            <div className="field">
              <label htmlFor="weekendMinutes">周末时间</label>
              <input id="weekendMinutes" type="number" min={20} max={720} value={state.settings.weekendMinutes || ''} placeholder="例：240" onChange={(e) => {
  const val = e.target.value;
  setField("weekendMinutes", val === '' ? 0 : Number(val));
}} />
            </div>
            <div className="field">
              <label htmlFor="state">当前状态</label>
              <select id="state" value={state.settings.state} onChange={(e) => setField("state", e.target.value as PlanSettings["state"])}>
                {STATIC_SELECT_OPTIONS.state.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="studyDay">备考进度</label>
              <select id="studyDay" value={state.settings.studyDay} onChange={(e) => setField("studyDay", e.target.value)}>
                {STATIC_SELECT_OPTIONS.studyDay.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="targetScore">目标分数</label>
              <input
                ref={targetScoreRef}
                id="targetScore"
                type="text"
                inputMode="numeric"
                defaultValue={state.settings.targetScore || ""}
                placeholder="例：115"
                onBlur={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setField("targetScore", 0);
                  } else {
                    const num = Number(val);
                    if (!Number.isNaN(num)) {
                      setField("targetScore", num);
                    }
                  }
                }}
              />
            </div>
          </div>
        </section>

        <section className="panel setup-form-panel">
          <div className="setup-title-row compact">
            <span className="setup-step-badge">3</span>
            <div>
              <h2>教材与学习量预算</h2>
              <p>用于估算新词、新文法完成天数和复习预留窗口。</p>
            </div>
          </div>
          <div className="form-grid three setup-grid">
            <div className="field">
              <label htmlFor="vocabBook">词汇书偏好</label>
              <select id="vocabBook" value={state.settings.vocabBook} onChange={(e) => setField("vocabBook", e.target.value)}>
                {STATIC_SELECT_OPTIONS.vocabBook.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="grammarBook">文法书偏好</label>
              <select id="grammarBook" value={state.settings.grammarBook} onChange={(e) => setField("grammarBook", e.target.value)}>
                {STATIC_SELECT_OPTIONS.grammarBook.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="kanjiBook">汉字书偏好</label>
              <select id="kanjiBook" value={state.settings.kanjiBook} onChange={(e) => setField("kanjiBook", e.target.value)}>
                {STATIC_SELECT_OPTIONS.kanjiBook.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="learnedVocab">已学词汇</label>
              <input id="learnedVocab" type="number" min={0} value={state.settings.learnedVocab || ''} onChange={(e) => {
  const val = e.target.value;
  setField("learnedVocab", val === '' ? 0 : Number(val));
}} />
            </div>
            <div className="field">
              <label htmlFor="dailyVocabGoal">每天新词</label>
              <input
                id="dailyVocabGoal"
                type="text"
                inputMode="numeric"
                defaultValue={state.settings.dailyVocabGoal || ""}
                ref={dailyVocabGoalRef}
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  const num = val === "" ? 0 : Number(val);
                  setField("dailyVocabGoal", Number.isNaN(num) ? 0 : num);
                }}
              />
            </div>
            <div className="field">
              <label htmlFor="learnedGrammar">已学文法</label>
              <input id="learnedGrammar" type="number" min={0} value={state.settings.learnedGrammar || ''} onChange={(e) => {
  const val = e.target.value;
  setField("learnedGrammar", val === '' ? 0 : Number(val));
}} />
            </div>
            <div className="field">
              <label htmlFor="dailyGrammarGoal">每天新文法</label>
              <input
                id="dailyGrammarGoal"
                type="text"
                inputMode="numeric"
                defaultValue={state.settings.dailyGrammarGoal || ""}
                ref={dailyGrammarGoalRef}
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  const num = val === "" ? 0 : Number(val);
                  setField("dailyGrammarGoal", Number.isNaN(num) ? 0 : num);
                }}
              />
            </div>
            <div className="field">
              <label htmlFor="reviewReserve">复习预留</label>
              <select id="reviewReserve" value={String(state.settings.reviewReserve)} onChange={(e) => setField("reviewReserve", Number(e.target.value))}>
                {STATIC_SELECT_OPTIONS.reviewReserve.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="panel setup-form-panel">
          <div className="setup-title-row compact">
            <span className="setup-step-badge">4</span>
            <div>
              <h2>弱项与阻碍</h2>
              <p>选择你的薄弱模块和学习阻碍，计划生成会针对性调整。</p>
            </div>
          </div>
          <div className="setup-choice-grid">
            <div className="field">
              <span className="choice-label">最薄弱模块</span>
              <div className="choice-grid weakness-grid">
                {STATIC_WEAKNESS_OPTIONS.map(([value, label]) => {
                  const checked = (state.settings.weaknesses || []).includes(value);
                  return (
                    <label
                      key={value}
                      className={`choice-card ${checked ? "selected" : ""}`}
                    >
                      <span className="choice-icon">{WEAKNESS_ICONS[value]}</span>
                      <span className="choice-text">{label}</span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleWeakness(value)}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="field">
              <span className="choice-label">学习阻碍</span>
              <div className="choice-grid blocker-grid">
                {STATIC_BLOCKER_OPTIONS.map(([value, label]) => {
                  const checked = (state.settings.blockers || []).includes(value);
                  return (
                    <label
                      key={value}
                      className={`choice-card ${checked ? "selected" : ""}`}
                    >
                      <span className="choice-icon">{BLOCKER_ICONS[value]}</span>
                      <span className="choice-text">{label}</span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleBlocker(value)}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="panel setup-form-panel">
          <div className="setup-title-row compact">
            <span className="setup-step-badge">5</span>
            <div>
              <h2>自定义计划想法</h2>
              <p>有什么特别想纳入计划的想法？</p>
            </div>
          </div>
          <div className="field">
            <textarea
              placeholder="例如：每天先复习昨天错题 10 分钟；周末增加一套真题..."
              value={state.settings.customPlanInput || ""}
              onChange={(e) => setField("customPlanInput", e.target.value)}
            />
          </div>
        </section>
      </div>

      <div className="sticky-generate">
        <button className="primary-button full" onClick={handleGeneratePlan}>
          生成学习计划
        </button>
      </div>
    </div>
  );
}
