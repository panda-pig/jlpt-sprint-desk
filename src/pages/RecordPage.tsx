import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useStudyDesk } from "../lib/studyDeskContext";
import { BookOpen } from "lucide-react";
import { COMPLETION_OPTIONS, MODULE_COUNT_PLACEHOLDERS, MODULE_LABELS, MODULE_SHORTS, RECORD_CHOICE_OPTIONS, RECORD_MODULE_KEYS } from "../lib/constants";
import { todayISO, completionLabel, getCompletionPercent, getRecordMinutes, getRecordTotalCount, getRecordAccuracyPercent, normalizeWrongQuestionText, buildRecordRecommendation, buildTomorrowTimePlan } from "../lib/utils";
import { summarizeModuleCounts } from "../lib/planner";
import type { StudyRecord } from "../lib/types";

export function RecordPage() {
  const navigate = useNavigate();
  const { state, todayRecord, todayPlan, saveRecord, deleteRecord } = useStudyDesk();

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
    <div className="page-grid">
      <section className="stack">
        {!state.generatedPlan && (
          <div className="notice" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BookOpen size={16} />
            <span>还没有学习计划——记录可以先填，<a href="#/setup" onClick={(e) => { e.preventDefault(); navigate("/setup"); }}>去设置页生成计划</a>后与任务关联会更精准。</span>
          </div>
        )}
        <section className="panel">
          <div className="section-head">
            <div>
              <h2>{form.date && form.date !== todayISO() ? `编辑历史记录（${form.date}）` : todayRecord ? "编辑学习记录" : "今日记录"}</h2>
              <p>{form.date && form.date !== todayISO() ? "正在修改历史日期的记录，保存后不影响今日数据。" : todayRecord ? "今天已经记录过，可以继续修正。" : "记录真实用时、错因和明日第一步。"} 日期：{form.date || todayISO()}</p>
            </div>
            <span className="metric-chip">
              <strong>{todayPlan ? `Day ${todayPlan.dayIndex}` : "今日"}</strong>
              {todayPlan ? todayPlan.phase : "计划外"}
            </span>
          </div>

          <div className="record-form stack">
            <fieldset className="record-fieldset">
              <legend>模块实际用时与数量</legend>
              <div className="module-record-grid">
                {RECORD_MODULE_KEYS.map((key) => (
                  <article key={key} className="module-record-card">
                    <div className="module-record-head">
                      <span className={`module-dot ${key}`}>{MODULE_SHORTS[key]}</span>
                      <strong>{MODULE_LABELS[key]}</strong>
                    </div>
                    <div className="module-record-inputs">
                      <div className="field">
                        <label htmlFor={`${key}Minutes`}>用时 min</label>
                        <input
                          id={`${key}Minutes`}
                          type="number"
                          min={0}
                          placeholder="例：30"
                          value={form.minutes?.[key] || 0}
                          onChange={(e) => setModuleMinutes(key, Number(e.target.value))}
                        />
                      </div>
                      <div className="field">
                        <label htmlFor={`${key}Count`}>数量 {key === "kanji" ? "字" : key === "vocab" ? "词" : key === "grammar" ? "条" : key === "reading" ? "篇" : "题"}</label>
                        <input
                          id={`${key}Count`}
                          type="number"
                          min={0}
                          placeholder={MODULE_COUNT_PLACEHOLDERS[key] || "例：10"}
                          value={form.moduleCounts?.[key] || 0}
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
                <legend>超时原因</legend>
                <div className="record-option-grid">
                  {RECORD_CHOICE_OPTIONS.overtimeReason.map((option) => (
                    <label key={option} className="record-option">
                      <input
                        type="checkbox"
                        checked={(form.overtimeReason || "").includes(option)}
                        onChange={() => toggleStringField("overtimeReason", option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                <div className="field record-custom-field">
                  <label htmlFor="overtimeReasonCustom">自定义输入</label>
                  <input
                    id="overtimeReasonCustom"
                    type="text"
                    placeholder="也可以写自己的超时原因"
                    value={form.overtimeReason || ""}
                    onChange={(e) => setFormField("overtimeReason", e.target.value)}
                  />
                </div>
              </fieldset>

              <fieldset className="record-choice-field">
                <legend>做题正确率记录</legend>
                <div className="record-option-grid">
                  {RECORD_CHOICE_OPTIONS.accuracyText.map((option) => (
                    <label key={option} className="record-option">
                      <input
                        type="checkbox"
                        checked={(form.accuracy || "").includes(option)}
                        onChange={() => toggleStringField("accuracy", option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                <div className="field record-custom-field">
                  <label htmlFor="accuracyCustom">自定义输入</label>
                  <input
                    id="accuracyCustom"
                    type="text"
                    placeholder="例：词汇 18/30，文法 12/20"
                    value={form.accuracy || ""}
                    onChange={(e) => setFormField("accuracy", e.target.value)}
                  />
                </div>
              </fieldset>

              <fieldset className="record-choice-field">
                <legend>做题耗时/卡点</legend>
                <div className="record-option-grid">
                  {RECORD_CHOICE_OPTIONS.timeNote.map((option) => (
                    <label key={option} className="record-option">
                      <input
                        type="checkbox"
                        checked={(form.timeNote || "").includes(option)}
                        onChange={() => toggleStringField("timeNote", option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                <div className="field record-custom-field">
                  <label htmlFor="timeNoteCustom">自定义输入</label>
                  <input
                    id="timeNoteCustom"
                    type="text"
                    placeholder="例：阅读第 2 篇定位慢"
                    value={form.timeNote || ""}
                    onChange={(e) => setFormField("timeNote", e.target.value)}
                  />
                </div>
              </fieldset>

              <fieldset className="record-choice-field">
                <legend>明日第一步</legend>
                <div className="record-option-grid">
                  {RECORD_CHOICE_OPTIONS.tomorrowFocus.map((option) => (
                    <label key={option} className="record-option">
                      <input
                        type="checkbox"
                        checked={(form.tomorrowFocus || "").includes(option)}
                        onChange={() => toggleStringField("tomorrowFocus", option)}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                <div className="field record-custom-field">
                  <label htmlFor="tomorrowFocusCustom">自定义输入</label>
                  <input
                    id="tomorrowFocusCustom"
                    type="text"
                    placeholder="例：先做 10 分钟听力错题"
                    value={form.tomorrowFocus || ""}
                    onChange={(e) => setFormField("tomorrowFocus", e.target.value)}
                  />
                </div>
              </fieldset>
            </div>

            <div className="form-grid">
              <div className="field">
                <label htmlFor="completion">今日完成度</label>
                <select
                  id="completion"
                  value={form.completion}
                  onChange={(e) => setFormField("completion", e.target.value as StudyRecord["completion"])}
                >
                  {COMPLETION_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <fieldset className="record-choice-field">
              <legend>今日错题</legend>
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
                    <span>{option}</span>
                  </label>
                ))}
              </div>
              <div className="field record-custom-field">
                <label htmlFor="wrongQuestionCustom">自定义输入</label>
                <textarea
                  id="wrongQuestionCustom"
                  rows={3}
                  placeholder="例：文法第 8 题：接续误判&#10;读解第 2 篇：主旨题误选"
                  value={form.wrongQuestionText || ""}
                  onChange={(e) => setFormField("wrongQuestionText", e.target.value)}
                />
              </div>
            </fieldset>

            <div className="field">
              <span className="choice-label">主要错因</span>
              <div className="choice-grid">
                {["词义差别", "固定搭配", "接续形式", "定位慢", "听漏关键词", "时间不够", "复盘不足", "任务过量"].map((cause) => (
                  <label key={cause} className="choice">
                    <input
                      type="checkbox"
                      checked={(form.causes || []).includes(cause)}
                      onChange={() => toggleCause(cause)}
                    />
                    <span>{cause}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="button-row">
              <button className="primary-button" type="button" onClick={handleSubmit}>
                {todayRecord ? "更新记录并推荐明日目标" : "保存记录并推荐明日目标"}
              </button>
              <a className="secondary-button" href="#/analysis" onClick={(e) => { e.preventDefault(); navigate("/analysis"); }}>
                查看复盘
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
                      <strong>{todayRecord.date} 已记录</strong>
                    </div>
                    <span className="metric-chip">
                      <strong>{completionLabel(todayRecord.completion)}</strong>
                      {getCompletionPercent(todayRecord.completion)}%
                    </span>
                  </div>
                  <div className="record-facts">
                    <span>实际用时：{getRecordMinutes(todayRecord)} min</span>
                    <span>完成数量：{getRecordTotalCount(todayRecord) > 0 ? getRecordTotalCount(todayRecord) + " 项" : summarizeModuleCounts(todayRecord.moduleCounts || {})}</span>
                    <span>正确率：{getRecordAccuracyPercent(todayRecord) > 0 ? getRecordAccuracyPercent(todayRecord) + "%" : (todayRecord.accuracy || "未填写")}</span>
                    <span>错题：{normalizeWrongQuestionText(todayRecord).split(/\n/).filter(Boolean).length} 条</span>
                    <span>错因：{(todayRecord.causes || []).length ? (todayRecord.causes || []).join("、") : "未选择"}</span>
                  </div>
                </div>

                <div className="record-result">
                  <strong>明日时间安排</strong>
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
                        <p className="muted" style={{ marginTop: 8 }}>{timePlan.status} · 合计 {timePlan.total} / 目标 {timePlan.target} min</p>
                      </>
                    );
                  })()}
                </div>

                <div className="record-result">
                  <strong>明日推荐目标</strong>
                  <ul>
                    {buildRecordRecommendation(todayRecord).map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="record-result">
                <strong>记录后会自动生成明日建议</strong>
                <p className="muted">保存后会根据实际用时、错因、错题和明日第一步，输出时间安排与复盘目标。</p>
              </div>
            )}
          </div>
        </section>
      </section>

      <aside className="stack">
        <section className="card">
          <div className="section-head">
            <div>
              <h3>今日计划</h3>
              <p>{todayPlan ? `${todayPlan.totalMinutes} 分钟 · ${todayPlan.phase}` : "今日无计划"}</p>
            </div>
          </div>
          {todayPlan ? (
            <div className="task-list">
              {todayPlan.tasks.map((task) => (
                <div key={task.id} className="task-item">
                  <span className={`module-dot ${task.module}`}>{MODULE_SHORTS[task.module] || "项"}</span>
                  <div className="task-main">
                    <strong>{task.title || task.label}</strong>
                  </div>
                  <span className="time-pill">{task.minutes} min</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>今日没有计划</h3>
              <p>你可以回到计划设置重新生成。</p>
              <a className="primary-button" href="#/setup" onClick={(e) => { e.preventDefault(); navigate("/setup"); }}>重新设置</a>
            </div>
          )}
        </section>

        <section className="card">
          <div className="section-head">
            <div>
              <h3>最近记录</h3>
              <p>最多显示最近 5 条。</p>
            </div>
          </div>
          {recentRecords.length > 0 ? (
            <ul className="list record-history-list">
              {recentRecords.map((record) => {
                const accuracy = record.accuracy || "未填正确率";
                const causes = record.causes || [];
                const mins = Object.values(record.minutes || {}).reduce((a, b) => a + Number(b || 0), 0);
                return (
                  <li key={record.id} className="list-item history-card">
                    <div className="history-main">
                      <strong>{record.date}</strong>
                      <p className="muted">{mins} 分钟 · {completionLabel(record.completion)} · {accuracy}</p>
                      {causes.length > 0 && (
                        <div className="tag-row">
                          {causes.slice(0, 3).map((cause) => (
                            <span key={cause} className="tag">{cause}</span>
                          ))}
                        </div>
                      )}
                      {record.tomorrowFocus && <small>明日第一步：{record.tomorrowFocus}</small>}
                    </div>
                    <div className="history-actions">
                      <button className="text-button" type="button" onClick={() => setForm({ ...record })}>编辑</button>
                      <button className="text-button danger" type="button" onClick={() => { if (confirm("确定要删除这条记录吗？")) deleteRecord(record.id); }}>删除</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="muted">暂无记录。</p>
          )}
        </section>
      </aside>
    </div>
  );
}
