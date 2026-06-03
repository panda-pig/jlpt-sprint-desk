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

  const setFormField = useCallback(<K extends keyof StudyRecord>(key: K, value: StudyRecord[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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
    saveRecord(form);
  }, [form, saveRecord]);

  const recentRecords = [...state.records].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

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
                          placeholder={MODULE_COUNT_PLACEHOLDERS[key] || "10"}
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

            <div className="button-row">
              <button className="primary-button" type="button" onClick={handleSubmit}>
                {todayRecord ? t("record.submitUpdate") : t("record.submitSave")}
              </button>
              <a className="secondary-button" href="#/analysis" onClick={(e) => { e.preventDefault(); navigate("/analysis"); }}>
                {t("record.viewReview")}
              </a>
            </div>
          </div>

          <div className="record-summary">
            {todayRecord ? (
              <>
                <div className="record-result">
                  <div className="record-summary-head">
                    <div>
                      <span className="eyebrow">Saved Record</span>
                      <strong>{t("record.recordedOn", { date: todayRecord.date })}</strong>
                    </div>
                    <span className="metric-chip">
                      <strong>{tOption("completion", todayRecord.completion)}</strong>
                      {getCompletionPercent(todayRecord.completion)}%
                    </span>
                  </div>
                  <div className="record-facts">
                    <span>{t("record.actualTime", { n: getRecordMinutes(todayRecord) })}</span>
                    <span>{t("record.countDone")}{getRecordTotalCount(todayRecord) > 0 ? t("record.itemsUnit", { n: getRecordTotalCount(todayRecord) }) : summarizeModuleCounts(todayRecord.moduleCounts || {})}</span>
                    <span>{t("record.accuracyRate")}{getRecordAccuracyPercent(todayRecord) > 0 ? getRecordAccuracyPercent(todayRecord) + "%" : (todayRecord.accuracy || t("record.notFilled"))}</span>
                    <span>{t("record.wrongCount", { n: normalizeWrongQuestionText(todayRecord).split(/\n/).filter(Boolean).length })}</span>
                    <span>{t("record.causes")}{(todayRecord.causes || []).length ? (todayRecord.causes || []).map((c) => tOption("errorCause", c)).join(t("common.listSep")) : t("record.noneSelected")}</span>
                  </div>
                </div>

                <div className="record-result">
                  <strong>{t("record.tomorrowTime")}</strong>
                  {(() => {
                    const timePlan = buildTomorrowTimePlan(todayRecord, state.generatedPlan);
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
                    {buildRecordRecommendation(todayRecord).map((action, i) => (
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
                      <button className="text-button" type="button" onClick={() => setForm({ ...record })}>{t("common.edit")}</button>
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
          {todayRecord ? t("record.submitUpdate") : t("record.submitSave")}
        </button>
      </div>
    </div>
  );
}
