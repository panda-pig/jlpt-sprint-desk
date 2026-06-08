import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStudyDesk } from "../lib/studyDeskContext";
import { LEVEL_CONFIG, STATIC_SELECT_OPTIONS, STATIC_WEAKNESS_OPTIONS, STATIC_BLOCKER_OPTIONS } from "../lib/constants";
import { formatDate } from "../lib/utils";
import { toast } from "../lib/toast";
import { CloudSync } from "../components/CloudSync";
import { ReminderSettings } from "../components/Reminder";
import { useLocale } from "../i18n/LocaleProvider";
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
  const { t, tOption } = useLocale();

  const [newProfileName, setNewProfileName] = useState("");

  const targetScoreRef = useRef<HTMLInputElement>(null);
  const dailyVocabGoalRef = useRef<HTMLInputElement>(null);
  const dailyGrammarGoalRef = useRef<HTMLInputElement>(null);
  const weekdayMinutesRef = useRef<HTMLInputElement>(null);
  const weekendMinutesRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (weekdayMinutesRef.current) {
      weekdayMinutesRef.current.value = String(state.settings.weekdayMinutes || "");
    }
  }, [state.settings.weekdayMinutes]);

  useEffect(() => {
    if (weekendMinutesRef.current) {
      weekendMinutesRef.current.value = String(state.settings.weekendMinutes || "");
    }
  }, [state.settings.weekendMinutes]);

  const handleCreateProfile = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) {
      toast(t("setup.enterProfileName"));
      return;
    }
    createProfile(newProfileName.trim());
    setNewProfileName("");
  }, [newProfileName, createProfile, t]);

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
      <CloudSync />
      <ReminderSettings />
      <section className="panel setup-document-panel">
        <div className="setup-title-row">
          <span className="setup-step-badge">1</span>
          <div>
            <h2>{t("setup.step1Title")}</h2>
            <p>{t("setup.step1Desc")}</p>
          </div>
          {activeProfile && <span className="setup-profile-pill">{activeProfile.name}</span>}
        </div>
        <div className="setup-document-grid">
          <div className="field">
            <label htmlFor="profileSelect">{t("setup.currentProfile")}</label>
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
                {t("setup.exportBackup")}
              </button>
              <label className="secondary-button file-button">
                {t("setup.importBackup")}
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
                        const profileId = state.activeProfileId;
                        if (data.data && typeof data.data === "object") {
                          // Format: { data: { jlptSprintDesk...: "..." } }
                          Object.entries(data.data).forEach(([key, value]) => {
                            localStorage.setItem(key, String(value));
                          });
                          window.location.reload();
                        } else if (profileId && (data.planSettings || data.generatedPlan || data.records)) {
                          // Format: { planSettings, generatedPlan, planEdits, records }
                          if (data.planSettings) localStorage.setItem(`jlptSprintDesk:${profileId}:planSettings`, JSON.stringify(data.planSettings));
                          if (data.generatedPlan) localStorage.setItem(`jlptSprintDesk:${profileId}:generatedPlan`, JSON.stringify(data.generatedPlan));
                          if (data.planEdits) localStorage.setItem(`jlptSprintDesk:${profileId}:planEdits`, JSON.stringify(data.planEdits));
                          if (data.records) localStorage.setItem(`jlptSprintDesk:${profileId}:records`, JSON.stringify(data.records));
                          window.location.reload();
                        } else {
                          toast(t("setup.backupFormatError"));
                        }
                      } catch {
                        toast(t("setup.backupFormatError"));
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
                  if (activeProfile && confirm(t("setup.deleteProfileConfirm", { name: activeProfile.name }))) {
                    deleteProfile(activeProfile.id);
                  }
                }}
              >
                {t("setup.deleteProfile")}
              </button>
            </div>
          </div>
          <form onSubmit={handleCreateProfile} className="field">
            <label htmlFor="profileName">{t("setup.newProfile")}</label>
            <input
              id="profileName"
              name="profileName"
              aria-label={t("setup.newProfileName")}
              placeholder={t("setup.newProfilePlaceholder")}
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
            />
            <button className="primary-button fit" type="submit">{t("setup.create")}</button>
          </form>
        </div>
        {activeProfile && (
          <p className="setup-status">
            {t("setup.profileLoaded", { name: activeProfile.name })}<span className="nowrap-text">{formatDate(activeProfile.updatedAt || activeProfile.createdAt)}</span>
          </p>
        )}
      </section>

      <div className="stack">
        <section className="panel setup-form-panel">
          <div className="setup-title-row compact">
            <span className="setup-step-badge">2</span>
            <div>
              <h2>{t("setup.step2Title")}</h2>
              <p>{t("setup.step2Desc")}</p>
            </div>
          </div>
          <div className="form-grid three setup-grid">
            <div className="field">
              <label htmlFor="level">{t("setup.targetLevel")}</label>
              <select id="level" value={state.settings.level} onChange={(e) => setField("level", e.target.value as Level)}>
                {Object.keys(LEVEL_CONFIG).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="currentLevel">{t("setup.currentLevel")}</label>
              <select id="currentLevel" value={state.settings.currentLevel} onChange={(e) => setField("currentLevel", e.target.value)}>
                {STATIC_SELECT_OPTIONS.currentLevel.map(([value]) => (
                  <option key={value} value={value}>{tOption("currentLevel", value)}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="examDate">{t("setup.examDate")}</label>
              <input id="examDate" type="date" value={state.settings.examDate} onChange={(e) => setField("examDate", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="weekdayMinutes">{t("setup.weekdayMinutes")}</label>
              <input
                ref={weekdayMinutesRef}
                id="weekdayMinutes"
                type="number"
                min={20}
                max={600}
                defaultValue={state.settings.weekdayMinutes || ""}
                placeholder="例：120"
                onBlur={(e) => {
                  const val = e.target.value;
                  if (val === "") { setField("weekdayMinutes", 0); }
                  else { const num = Number(val); if (!Number.isNaN(num)) setField("weekdayMinutes", num); }
                }}
              />
            </div>
            <div className="field">
              <label htmlFor="weekendMinutes">{t("setup.weekendMinutes")}</label>
              <input
                ref={weekendMinutesRef}
                id="weekendMinutes"
                type="number"
                min={20}
                max={720}
                defaultValue={state.settings.weekendMinutes || ""}
                placeholder="例：240"
                onBlur={(e) => {
                  const val = e.target.value;
                  if (val === "") { setField("weekendMinutes", 0); }
                  else { const num = Number(val); if (!Number.isNaN(num)) setField("weekendMinutes", num); }
                }}
              />
            </div>
            <div className="field">
              <label htmlFor="state">{t("setup.currentState")}</label>
              <select id="state" value={state.settings.state} onChange={(e) => setField("state", e.target.value as PlanSettings["state"])}>
                {STATIC_SELECT_OPTIONS.state.map(([value]) => (
                  <option key={value} value={value}>{tOption("state", value)}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="studyDay">{t("setup.studyProgress")}</label>
              <select id="studyDay" value={state.settings.studyDay} onChange={(e) => setField("studyDay", e.target.value)}>
                {STATIC_SELECT_OPTIONS.studyDay.map(([value]) => (
                  <option key={value} value={value}>{tOption("studyDay", value)}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="targetScore">{t("setup.targetScore")}</label>
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
              <h2>{t("setup.step3Title")}</h2>
              <p>{t("setup.step3Desc")}</p>
            </div>
          </div>
          <div className="form-grid three setup-grid">
            <div className="field">
              <label htmlFor="vocabBook">{t("setup.vocabBook")}</label>
              <select id="vocabBook" value={state.settings.vocabBook} onChange={(e) => setField("vocabBook", e.target.value)}>
                {STATIC_SELECT_OPTIONS.vocabBook.map(([value]) => (
                  <option key={value} value={value}>{tOption("vocabBook", value)}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="grammarBook">{t("setup.grammarBook")}</label>
              <select id="grammarBook" value={state.settings.grammarBook} onChange={(e) => setField("grammarBook", e.target.value)}>
                {STATIC_SELECT_OPTIONS.grammarBook.map(([value]) => (
                  <option key={value} value={value}>{tOption("grammarBook", value)}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="kanjiBook">{t("setup.kanjiBook")}</label>
              <select id="kanjiBook" value={state.settings.kanjiBook} onChange={(e) => setField("kanjiBook", e.target.value)}>
                {STATIC_SELECT_OPTIONS.kanjiBook.map(([value]) => (
                  <option key={value} value={value}>{tOption("kanjiBook", value)}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="learnedVocab">{t("setup.learnedVocab")}</label>
              <input id="learnedVocab" type="number" min={0} value={state.settings.learnedVocab || ''} onChange={(e) => {
  const val = e.target.value;
  setField("learnedVocab", val === '' ? 0 : Number(val));
}} />
            </div>
            <div className="field">
              <label htmlFor="dailyVocabGoal">{t("setup.dailyVocabGoal")}</label>
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
              <label htmlFor="learnedGrammar">{t("setup.learnedGrammar")}</label>
              <input id="learnedGrammar" type="number" min={0} value={state.settings.learnedGrammar || ''} onChange={(e) => {
  const val = e.target.value;
  setField("learnedGrammar", val === '' ? 0 : Number(val));
}} />
            </div>
            <div className="field">
              <label htmlFor="dailyGrammarGoal">{t("setup.dailyGrammarGoal")}</label>
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
              <label htmlFor="reviewReserve">{t("setup.reviewReserve")}</label>
              <select id="reviewReserve" value={String(state.settings.reviewReserve)} onChange={(e) => setField("reviewReserve", Number(e.target.value))}>
                {STATIC_SELECT_OPTIONS.reviewReserve.map(([value]) => (
                  <option key={value} value={value}>{tOption("reviewReserve", value)}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="panel setup-form-panel">
          <div className="setup-title-row compact">
            <span className="setup-step-badge">4</span>
            <div>
              <h2>{t("setup.step4Title")}</h2>
              <p>{t("setup.step4Desc")}</p>
            </div>
          </div>
          <div className="setup-choice-grid">
            <div className="field">
              <span className="choice-label">{t("setup.weakestModule")}</span>
              <div className="choice-grid weakness-grid">
                {STATIC_WEAKNESS_OPTIONS.map(([value]) => {
                  const checked = (state.settings.weaknesses || []).includes(value);
                  return (
                    <label
                      key={value}
                      className={`choice-card ${checked ? "selected" : ""}`}
                    >
                      <span className="choice-icon">{WEAKNESS_ICONS[value]}</span>
                      <span className="choice-text">{tOption("weakness", value)}</span>
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
              <span className="choice-label">{t("setup.blockers")}</span>
              <div className="choice-grid blocker-grid">
                {STATIC_BLOCKER_OPTIONS.map(([value]) => {
                  const checked = (state.settings.blockers || []).includes(value);
                  return (
                    <label
                      key={value}
                      className={`choice-card ${checked ? "selected" : ""}`}
                    >
                      <span className="choice-icon">{BLOCKER_ICONS[value]}</span>
                      <span className="choice-text">{tOption("blocker", value)}</span>
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
              <h2>{t("setup.step5Title")}</h2>
              <p>{t("setup.step5Desc")}</p>
            </div>
          </div>
          <div className="field">
            <textarea
              placeholder={t("setup.customPlaceholder")}
              value={state.settings.customPlanInput || ""}
              onChange={(e) => setField("customPlanInput", e.target.value)}
            />
          </div>
        </section>
      </div>

      <div className="sticky-generate">
        <button className="primary-button full" onClick={handleGeneratePlan}>
          {t("setup.generatePlan")}
        </button>
      </div>
    </div>
  );
}
