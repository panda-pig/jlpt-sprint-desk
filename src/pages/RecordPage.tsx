import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useStudyDesk } from "../lib/studyDeskContext";
import { BookOpen } from "lucide-react";
import { COMPLETION_OPTIONS, MODULE_COUNT_PLACEHOLDERS, RECORD_CHOICE_OPTIONS, RECORD_MODULE_KEYS } from "../lib/constants";
import { todayISO, getCompletionPercent, getRecordMinutes, getRecordTotalCount, getRecordAccuracyPercent, normalizeWrongQuestionText, buildRecordRecommendation, buildTomorrowTimePlan } from "../lib/utils";
import { summarizeModuleCounts } from "../lib/planner";
import { useLocale } from "../i18n/LocaleProvider";
import { moduleLabel, moduleShort, phaseLabel } from "../i18n";
import type { StudyRecord } from "../lib/types";

/** Split a single "total minutes" figure across the record modules, weighted by
 *  today's plan (falls back to an even split). Sum is preserved exactly. */
function distributeQuickMinutes(
  total: number,
  todayPlan: { tasks?: { module: string; minutes: number }[] } | null | undefined,
  keys: readonly string[],
): Record<string, number> {
  const out: Record<string, number> = {};
  keys.forEach((k) => { out[k] = 0; });
  if (!total || total <= 0) return out;

  const weights: Record<string, number> = {};
  keys.forEach((k) => { weights[k] = 0; });
  let hasPlan = false;
  (todayPlan?.tasks || []).forEach((task) => {
    if (keys.includes(task.module)) {
      weights[task.module] += Number(task.minutes || 0);
      hasPlan = true;
    }
  });
  if (!hasPlan) keys.forEach((k) => { weights[k] = 1; });

  const sumW = keys.reduce((s, k) => s + weights[k], 0) || 1;
  let acc = 0;
  keys.forEach((k) => { out[k] = Math.round((total * weights[k]) / sumW); acc += out[k]; });
  // Push the rounding drift onto the largest-weight module so the sum is exact.
  const diff = total - acc;
  if (diff !== 0) {
    const maxK = keys.reduce((a, b) => (weights[b] > weights[a] ? b : a), keys[0]);
    out[maxK] = Math.max(0, out[maxK] + diff);
  }
  return out;
}

export function RecordPage() {
  const navigate = useNavigate();
  const { state, todayRecord, todayPlan, saveRecord, deleteRecord } = useStudyDesk();
  const { t, tOption } = useLocale();

  const [form, setForm] = useState<Partial<StudyRecord>>(() => {
    if (todayRecord) return { ...todayRecord };
    return {
      minutes: { kanji: 0, vocab: 0, grammar: 0, reading: 0, listening: 0 },
      moduleCounts: { kanji: 0, vocab: 0, grammar: 0, reading: 0, listening: 0 },
      completion: "done",
      completionNote: "",
      accuracy: "",
      accuracyNote: "",
      wrongQuestionText: "",
      overtimeReason: "",
      timeNote: "",
      tomorrowFocus: "",
      causes: [],
      notes: "",
    };
  });

  // Quick log = completion + total minutes only (≈30s). Full log = every field.
  // New today-record defaults to quick; an existing record opens in full so its
  // detailed breakdown is visible and not silently overwritten.
  const sumMinutes = (rec?: Partial<StudyRecord> | null) =>
    rec?.minutes ? Object.values(rec.minutes).reduce((a, b) => a + Number(b || 0), 0) : 0;
  const [mode, setMode] = useState<"quick" | "full">(todayRecord ? "full" : "quick");
  const [quickMinutes, setQuickMinutes] = useState<number>(sumMinutes(todayRecord));

  const setFormField = useCallback(<K extends keyof StudyRecord>(key: K, value: StudyRecord[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Load a past/other record into the form for editing (always full mode).
  const loadRecord = useCallback((record: StudyRecord) => {
    setForm({ ...record });
    setQuickMinutes(sumMinutes(record));
    setMode("full");
  }, []);

  const setModuleMinutes = useCallback((module: string, value: number) => {
    setForm((prev) => ({
      ...prev,
      minutes: { ...prev.minutes, [module]: value },
    }));
  }, []);

  const setModuleCount = useCallback((module: string, value: number) => {
    setForm((prev) => ({
      ...prev,
      moduleCounts: { ...prev.moduleCounts, [module]: value },
    }));
  }, []);

  const toggleCause = useCallback((cause: string) => {
    setForm((prev) => {
      const current = prev.causes || [];
      const next = current.includes(cause) ? current.filter((c) => c !== cause) : [...current, cause];
      return { ...prev, causes: next };
    });
  }, []);

  const toggleStringField = useCallback((field: keyof StudyRecord, option: string) => {
    setForm((prev) => {
      const current = String((prev as Record<string, unknown>)[field] || "");
      const parts = current.split(/；\s*/).map((s) => s.trim()).filter(Boolean);
      if (parts.includes(option)) {
        const next = parts.filter((p) => p !== option).join("；");
        return { ...prev, [field]: next };
      } else {
        const next = current ? `${current}；${option}` : option;
        return { ...prev, [field]: next };
      }
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (mode === "quick") {
      const minutes = distributeQuickMinutes(quickMinutes, todayPlan, RECORD_MODULE_KEYS);
      saveRecord({ ...form, minutes });
      return;
    }
    saveRecord(form);
  }, [mode, quickMinutes, todayPlan, form, saveRecord]);

  const recentRecords = [...state.records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  // The summary/recommendations must reflect the record currently being edited
  // (which may be a past date), not always today's record.
  const editingDate = form.date || todayISO();
  const summaryRecord = state.records.find((r) => r.date === editingDate) || null;

  return (
    <div className="page-grid record-page-root">
      <section className="stack">
        {!state.generatedPlan && (
          <div className="notice" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BookOpen size={16} />
            <span>{t("record.noPlanNotice")}<a href="#/setup" onClick={(e) => { e.preventDefault(); navigate("/setup"); }}>{t("record.noPlanNoticeLink")}</a>{t("record.noPlanNoticeTail")}</span>
          </div>
        )}
        <section className="panel">
          <div className="section-head">
            <div>
              <h2>{form.date && form.date !== todayISO() ? t("record.editHistory", { date: form.date }) : todayRecord ? t("record.editToday") : t("record.todayTitle")}</h2>
              <p>{form.date && form.date !== todayISO() ? t("record.editHistoryDesc") : todayRecord ? t("record.editTodayDesc") : t("record.todayDesc")} {t("record.dateLabel")}{form.date || todayISO()}</p>
            </div>
            <span className="metric-chip">
              <strong>{todayPlan ? t("record.dayBadge", { n: todayPlan.dayIndex }) : t("record.todayBadge")}</strong>
              {todayPlan ? phaseLabel(todayPlan.phase) : t("record.offPlan")}
            </span>
          </div>

          <div className="record-form stack">
            <div className="record-mode-switch" role="group" aria-label={t("record.modeQuick")}>
              <button type="button" className={mode === "quick" ? "is-active" : ""} onClick={() => setMode("quick")}>
                {t("record.modeQuick")}
              </button>
              <button type="button" className={mode === "full" ? "is-active" : ""} onClick={() => setMode("full")}>
                {t("record.modeFull")}
              </button>
            </div>

            {mode === "quick" && (
              <div className="quick-record stack">
                <p className="muted quick-record-hint">{t("record.quickHint")}</p>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="quickCompletion">{t("record.completionLabel")}</label>
                    <select
                      id="quickCompletion"
                      value={form.completion}
                      onChange={(e) => setFormField("completion", e.target.value as StudyRecord["completion"])}
                    >
                      {COMPLETION_OPTIONS.map(([value]) => (
                        <option key={value} value={value}>{tOption("completion", value)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="quickMinutes">{t("record.quickMinutes")}</label>
                    <input
                      id="quickMinutes"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      placeholder={t("record.quickMinutesPlaceholder")}
                      value={quickMinutes || ""}
                      onChange={(e) => setQuickMinutes(Math.max(0, Number(e.target.value)))}
                    />
                  </div>
                </div>
                <p className="muted quick-record-note">{t("record.quickSplitNote")}</p>
              </div>
            )}

            {mode === "full" && (<>
            <fieldset className="record-fieldset">
              <legend>{t("record.moduleTimeCount")}</legend>
              <div className="module-record-grid">
                {RECORD_MODULE_KEYS.map((key) => (
                  <article key={key} className="module-record-card">
                    <div className="module-record-head">
                      <span className={`module-dot ${key}`}>{moduleShort(key)}</span>
                      <strong>{moduleLabel(key)}</strong>
                    </div>
                    <div className="module-record-inputs">
                      <div className="field">
                        <label htmlFor={`${key}Minutes`}>{t("record.timeMin")}</label>
                        <input
                          id={`${key}Minutes`}
                          type="number"
                          inputMode="numeric"
                          min={0}
                          placeholder={t("record.minPlaceholder")}
                          value={form.minutes?.[key] || ""}
                          onChange={(e) => setModuleMinutes(key, Number(e.target.value))}
                        />
                      </div>
                      <div className="field">
                        <label htmlFor={`${key}Count`}>{t("record.countLabel", { unit: tOption("countUnit", key) })}</label>
                        <input
                          id={`${key}Count`}
                          type="number"
                          inputMode="numeric"
                          min={0}
                          placeholder={t("record.countPlaceholder", { n: MODULE_COUNT_PLACEHOLDERS[key] || "10" })}
                          value={form.moduleCounts?.[key] || ""}
                          onChange={(e) => setModuleCount(key, Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </fieldset>

            <div className="record-choice-grid">
              <fieldset className="record-choice-field">
                <legend>{t("record.overtimeReason")}</legend>
                <div className="record-option-grid">
                  {RECORD_CHOICE_OPTIONS.overtimeReason.map((option) => (
                    <label key={option} className="record-option">
                      <input
                        type="checkbox"
                        checked={(form.overtimeReason || "").includes(option)}
                        onChange={() => toggleStringField("overtimeReason", option)}
                      />
                      <span>{tOption("overtimeReason", option)}</span>
                    </label>
                  ))}
                </div>
                <div className="field record-custom-field">
                  <label htmlFor="overtimeReasonCustom">{t("record.customInput")}</label>
                  <input
                    id="overtimeReasonCustom"
                    type="text"
                    placeholder={t("record.overtimePlaceholder")}
                    value={form.overtimeReason || ""}
                    onChange={(e) => setFormField("overtimeReason", e.target.value)}
                  />
                </div>
              </fieldset>

              <fieldset className="record-choice-field">
                <legend>{t("record.accuracyTitle")}</legend>
                <div className="record-option-grid">
                  {RECORD_CHOICE_OPTIONS.accuracyText.map((option) => (
                    <label key={option} className="record-option">
                      <input
                        type="checkbox"
                        checked={(form.accuracy || "").includes(option)}
                        onChange={() => toggleStringField("accuracy", option)}
                      />
                      <span>{tOption("accuracyText", option)}</span>
                    </label>
                  ))}
                </div>
                <div className="field record-custom-field">
                  <label htmlFor="accuracyCustom">{t("record.customInput")}</label>
                  <input
                    id="accuracyCustom"
                    type="text"
                    placeholder={t("record.accuracyPlaceholder")}
                    value={form.accuracy || ""}
                    onChange={(e) => setFormField("accuracy", e.target.value)}
                  />
                </div>
              </fieldset>

              <fieldset className="record-choice-field">
                <legend>{t("record.timeNoteTitle")}</legend>
                <div className="record-option-grid">
                  {RECORD_CHOICE_OPTIONS.timeNote.map((option) => (
                    <label key={option} className="record-option">
                      <input
                        type="checkbox"
                        checked={(form.timeNote || "").includes(option)}
                        onChange={() => toggleStringField("timeNote", option)}
                      />
                      <span>{tOption("timeNote", option)}</span>
                    </label>
                  ))}
                </div>
                <div className="field record-custom-field">
                  <label htmlFor="timeNoteCustom">{t("record.customInput")}</label>
                  <input
                    id="timeNoteCustom"
                    type="text"
                    placeholder={t("record.timeNotePlaceholder")}
                    value={form.timeNote || ""}
                    onChange={(e) => setFormField("timeNote", e.target.value)}
                  />
                </div>
              </fieldset>

              <fieldset className="record-choice-field">
                <legend>{t("record.tomorrowFocusTitle")}</legend>
                <div className="record-option-grid">
                  {RECORD_CHOICE_OPTIONS.tomorrowFocus.map((option) => (
                    <label key={option} className="record-option">
                      <input
                        type="checkbox"
                        checked={(form.tomorrowFocus || "").includes(option)}
                        onChange={() => toggleStringField("tomorrowFocus", option)}
                      />
                      <span>{tOption("tomorrowFocus", option)}</span>
                    </label>
                  ))}
                </div>
                <div className="field record-custom-field">
                  <label htmlFor="tomorrowFocusCustom">{t("record.customInput")}</label>
                  <input
                    id="tomorrowFocusCustom"
                    type="text"
                    placeholder={t("record.tomorrowFocusPlaceholder")}
                    value={form.tomorrowFocus || ""}
                    onChange={(e) => setFormField("tomorrowFocus", e.target.value)}
                  />
                </div>
              </fieldset>
            </div>

            <div className="form-grid">
              <div className="field">
                <label htmlFor="completion">{t("record.completionLabel")}</label>
                <select
                  id="completion"
                  value={form.completion}
                  onChange={(e) => setFormField("completion", e.target.value as StudyRecord["completion"])}
                >
                  {COMPLETION_OPTIONS.map(([value]) => (
                    <option key={value} value={value}>{tOption("completion", value)}</option>
                  ))}
                </select>
              </div>
            </div>

            <fieldset className="record-choice-field">
              <legend>{t("record.wrongTitle")}</legend>
              <div className="record-option-grid">
                {RECORD_CHOICE_OPTIONS.wrongQuestionDetails.map((option) => (
                  <label key={option} className="record-option">
                    <input
                      type="checkbox"
                      checked={(form.wrongQuestionText || "").includes(option)}
                      onChange={() => {
                        setForm((prev) => {
                          const current = prev.wrongQuestionText || "";
                          const lines = current.split("\n").map((s) => s.trim()).filter(Boolean);
                          if (lines.includes(option)) {
                            const next = lines.filter((l) => l !== option).join("\n");
                            return { ...prev, wrongQuestionText: next };
                          } else {
                            const next = current ? `${current}\n${option}` : option;
                            return { ...prev, wrongQuestionText: next };
                          }
                        });
                      }}
                    />
                    <span>{tOption("wrongQuestionDetails", option)}</span>
                  </label>
                ))}
              </div>
              <div className="field record-custom-field">
                <label htmlFor="wrongQuestionCustom">{t("record.customInput")}</label>
                <textarea
                  id="wrongQuestionCustom"
                  rows={3}
                  placeholder={t("record.wrongPlaceholder")}
                  value={form.wrongQuestionText || ""}
                  onChange={(e) => setFormField("wrongQuestionText", e.target.value)}
                />
              </div>
            </fieldset>

            <div className="field">
              <span className="choice-label">{t("record.mainCause")}</span>
              <div className="choice-grid">
                {["词义差别", "固定搭配", "接续形式", "定位慢", "听漏关键词", "时间不够", "复盘不足", "任务过量"].map((cause) => (
                  <label key={cause} className="choice">
                    <input
                      type="checkbox"
                      checked={(form.causes || []).includes(cause)}
                      onChange={() => toggleCause(cause)}
                    />
                    <span>{tOption("errorCause", cause)}</span>
                  </label>
                ))}
              </div>
            </div>
            </>)}

            <div className="button-row">
              <button className="primary-button" type="button" onClick={handleSubmit}>
                {summaryRecord ? t("record.submitUpdate") : t("record.submitSave")}
              </button>
              <a className="secondary-button" href="#/analysis" onClick={(e) => { e.preventDefault(); navigate("/analysis"); }}>
                {t("record.viewReview")}
              </a>
            </div>
          </div>

          <div className="record-summary">
            {summaryRecord ? (
              <>
                <div className="record-result">
                  <div className="record-summary-head">
                    <div>
                      <span className="eyebrow">Saved Record</span>
                      <strong>{t("record.recordedOn", { date: summaryRecord.date })}</strong>
                    </div>
                    <span className="metric-chip">
                      <strong>{tOption("completion", summaryRecord.completion)}</strong>
                      {getCompletionPercent(summaryRecord.completion)}%
                    </span>
                  </div>
                  <div className="record-facts">
                    <span>{t("record.actualTime", { n: getRecordMinutes(summaryRecord) })}</span>
                    <span>{t("record.countDone")}{getRecordTotalCount(summaryRecord) > 0 ? t("record.itemsUnit", { n: getRecordTotalCount(summaryRecord) }) : summarizeModuleCounts(summaryRecord.moduleCounts || {})}</span>
                    <span>{t("record.accuracyRate")}{getRecordAccuracyPercent(summaryRecord) > 0 ? getRecordAccuracyPercent(summaryRecord) + "%" : (summaryRecord.accuracy || t("record.notFilled"))}</span>
                    <span>{t("record.wrongCount", { n: normalizeWrongQuestionText(summaryRecord).split(/\n/).filter(Boolean).length })}</span>
                    <span>{t("record.causes")}{(summaryRecord.causes || []).length ? (summaryRecord.causes || []).map((c) => tOption("errorCause", c)).join(t("common.listSep")) : t("record.noneSelected")}</span>
                  </div>
                </div>

                <div className="record-result">
                  <strong>{t("record.tomorrowTime")}</strong>
                  {(() => {
                    const timePlan = buildTomorrowTimePlan(summaryRecord, state.generatedPlan);
                    return (
                      <>
                        <div className="mini-plan">
                          {timePlan.rows.map((row, i) => (
                            <div key={i} className="mini-plan-row">
                              <span>{row.label}</span>
                              <strong>{row.minutes} min</strong>
                              <small>{row.note}</small>
                            </div>
                          ))}
                        </div>
                        <p className="muted" style={{ marginTop: 8 }}>{t("record.timePlanStatus", { status: timePlan.status, total: timePlan.total, target: timePlan.target })}</p>
                      </>
                    );
                  })()}
                </div>

                <div className="record-result">
                  <strong>{t("record.tomorrowGoals")}</strong>
                  <ul>
                    {buildRecordRecommendation(summaryRecord).map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="record-result">
                <strong>{t("record.autoSummary")}</strong>
                <p className="muted">{t("record.autoSummaryDesc")}</p>
              </div>
            )}
          </div>
        </section>
      </section>

      <aside className="stack">
        <section className="card">
          <div className="section-head">
            <div>
              <h3>{t("record.todayPlanTitle")}</h3>
              <p>{todayPlan ? t("record.planMinPhase", { n: todayPlan.totalMinutes, phase: phaseLabel(todayPlan.phase) }) : t("record.noPlanToday")}</p>
            </div>
          </div>
          {todayPlan ? (
            <div className="task-list">
              {todayPlan.tasks.map((task) => (
                <div key={task.id} className="task-item">
                  <span className={`module-dot ${task.module}`}>{moduleShort(task.module)}</span>
                  <div className="task-main">
                    <strong>{task.title || task.label}</strong>
                  </div>
                  <span className="time-pill">{task.minutes} min</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>{t("record.noPlanTodayTitle")}</h3>
              <p>{t("record.noPlanTodayDesc")}</p>
              <a className="primary-button" href="#/setup" onClick={(e) => { e.preventDefault(); navigate("/setup"); }}>{t("record.resetPlan")}</a>
            </div>
          )}
        </section>

        <section className="card">
          <div className="section-head">
            <div>
              <h3>{t("record.recentRecords")}</h3>
              <p>{t("record.recentDesc")}</p>
            </div>
          </div>
          {recentRecords.length > 0 ? (
            <ul className="list record-history-list">
              {recentRecords.map((record) => {
                const accuracy = record.accuracy || t("record.noAccuracy");
                const causes = record.causes || [];
                const mins = Object.values(record.minutes || {}).reduce((a, b) => a + Number(b || 0), 0);
                return (
                  <li key={record.id} className="list-item history-card">
                    <div className="history-main">
                      <strong>{record.date}</strong>
                      <p className="muted">{t("record.minPhaseShort", { n: mins })}{tOption("completion", record.completion)} · {accuracy}</p>
                      {causes.length > 0 && (
                        <div className="tag-row">
                          {causes.slice(0, 3).map((cause) => (
                            <span key={cause} className="tag">{tOption("errorCause", cause)}</span>
                          ))}
                        </div>
                      )}
                      {record.tomorrowFocus && <small>{t("record.tomorrowFirst", { focus: record.tomorrowFocus })}</small>}
                    </div>
                    <div className="history-actions">
                      <button className="text-button" type="button" onClick={() => loadRecord(record)}>{t("common.edit")}</button>
                      <button className="text-button danger" type="button" onClick={() => { if (confirm(t("record.deleteConfirm"))) deleteRecord(record.id); }}>{t("common.delete")}</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="muted">{t("record.noRecords")}</p>
          )}
        </section>
      </aside>

      <div className="record-mobile-save">
        <button className="primary-button full" type="button" onClick={handleSubmit}>
          {summaryRecord ? t("record.submitUpdate") : t("record.submitSave")}
        </button>
      </div>
    </div>
  );
}
