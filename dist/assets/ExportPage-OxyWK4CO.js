import{t as e}from"./triangle-alert-DSlSfbHD.js";import{$ as t,A as n,F as r,G as i,J as a,K as o,M as s,P as c,Q as l,V as u,X as d,Z as f,at as p,d as m,et as h,j as g,m as _,nt as v,ot as y,p as b,rt as x,v as S,x as C}from"./index-CnRCDsXn.js";var w=c(`calendar-days`,[[`path`,{d:`M8 2v4`,key:`1cmpym`}],[`path`,{d:`M16 2v4`,key:`4m81vk`}],[`rect`,{width:`18`,height:`18`,x:`3`,y:`4`,rx:`2`,key:`1hopcy`}],[`path`,{d:`M3 10h18`,key:`8toen8`}],[`path`,{d:`M8 14h.01`,key:`6423bh`}],[`path`,{d:`M12 14h.01`,key:`1etili`}],[`path`,{d:`M16 14h.01`,key:`1gbofw`}],[`path`,{d:`M8 18h.01`,key:`lrp35t`}],[`path`,{d:`M12 18h.01`,key:`mhygvu`}],[`path`,{d:`M16 18h.01`,key:`kzsmim`}]]),T=c(`check`,[[`path`,{d:`M20 6 9 17l-5-5`,key:`1gmf2c`}]]),E=c(`copy`,[[`rect`,{width:`14`,height:`14`,x:`8`,y:`8`,rx:`2`,ry:`2`,key:`17jyea`}],[`path`,{d:`M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2`,key:`zix9uf`}]]),D=c(`file-output`,[[`path`,{d:`M4.226 20.925A2 2 0 0 0 6 22h12a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v3.127`,key:`wfxp4w`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`,key:`wfsgrz`}],[`path`,{d:`m5 11-3 3`,key:`1dgrs4`}],[`path`,{d:`m5 17-3-3h10`,key:`1mvvaf`}]]),O=c(`file-text`,[[`path`,{d:`M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`,key:`1oefj6`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`,key:`wfsgrz`}],[`path`,{d:`M10 9H8`,key:`b1mrlr`}],[`path`,{d:`M16 13H8`,key:`t4e002`}],[`path`,{d:`M16 17H8`,key:`z1uh3a`}]]),k=c(`printer`,[[`path`,{d:`M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2`,key:`143wyd`}],[`path`,{d:`M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6`,key:`1itne7`}],[`rect`,{x:`6`,y:`14`,width:`12`,height:`8`,rx:`1`,key:`1ue0tg`}]]),A=c(`table`,[[`path`,{d:`M12 3v18`,key:`108xh3`}],[`rect`,{width:`18`,height:`18`,x:`3`,y:`3`,rx:`2`,key:`afitv7`}],[`path`,{d:`M3 9h18`,key:`1pudct`}],[`path`,{d:`M3 15h18`,key:`5xshup`}]]),j=c(`upload`,[[`path`,{d:`M12 3v12`,key:`1x0j5s`}],[`path`,{d:`m17 8-5-5-5 5`,key:`7q97r8`}],[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`,key:`ih7n3h`}]]),M=y(p(),1);function N(e){return e===null?f(`export.docNotSet`):f(`export.docDays`,{n:e})}function P(e,t,n){let r=t.find(e=>e.date===C()),i=[`# ${f(`export.docPlanTitle`,{level:e.level})}`,``,`> ${f(`export.docMeta`,{name:n,date:e.generatedAt.slice(0,10)})}`,``,`## ${f(`export.docOverview`)}`,``,`- ${f(`export.docTargetLevel`)}: ${e.level}`,`- ${f(`export.docExamDate`)}: ${e.examDate||f(`export.docNotSet`)}`,`- ${f(`export.docDaysLeft`)}: ${N(e.daysLeft)}`,`- ${f(`export.docPhase`)}: ${d(e.phase)}`,`- ${f(`export.docHealth`)}: ${l(`budgetStatus`,e.studyBudget.status)} / ${l(`timeStatus`,e.studyBudget.timeStatus)}`,`- ${f(`export.docStrategy`)}: ${e.strategy.summary}`,``,`## ${f(`export.docTodayTasks`)}`,``];return e.todayTasks.forEach((e,t)=>{i.push(`${t+1}. **${a(e.module)}** · ${f(`export.docMinutes`,{n:e.minutes})}`),i.push(`   - ${e.text}`),i.push(``)}),i.push(`## ${f(`export.docMinimumPlan`)}`),i.push(``),e.minimumPlan.forEach(e=>{i.push(`- ${e}`)}),i.push(``,`## ${f(`export.docRoadmap`)}`),i.push(``),e.roadmap.forEach(e=>{i.push(`### ${d(e.title)}（${e.dayRange}）`),i.push(`- ${f(`export.docFocus`)}: ${e.focus}`),i.push(`- ${f(`export.docMethod`)}: ${e.method}`),i.push(``)}),i.push(`## ${f(`export.docDetail14`)}`),i.push(``),e.dailyPlan.slice(0,14).forEach(e=>{i.push(`### ${e.label} · ${e.date} · ${e.weekday}`),i.push(`> ${e.title} · ${d(e.phase)} · ${f(`export.docMinutes`,{n:e.totalMinutes})}`),i.push(``),e.tasks.forEach(e=>{i.push(`- **${a(e.module)}** (${e.minutes}min)：${e.text}`)}),i.push(``),r&&e.date===C()&&(i.push(`> ${f(`export.docTodayRecord`,{status:l(`completion`,r.completion)})}`),i.push(``))}),i.push(`## ${f(`export.docCauseTemplate`)}`),i.push(``),i.push(`| ${f(`export.docColDate`)} | ${f(`export.docColModule`)} | ${f(`export.docColCause`)} | ${f(`export.docColSolution`)} |`),i.push(`|------|------|------|----------|`),t.slice(-7).forEach(e=>{(e.causes||[]).forEach(t=>{let n=e.minutes?Object.entries(e.minutes).filter(([,e])=>e>0).map(([e])=>a(e)).join(`, `):`-`;i.push(`| ${e.date} | ${n} | ${l(`errorCause`,t)} | |`)})}),i.join(`
`)}function F(e){let t=[[`dayIndex`,`date`,`weekday`,`phase`,`module`,`task`,`minutes`,`status`].join(`,`)];return e.dailyPlan.forEach(e=>{e.tasks.forEach(n=>{t.push([e.dayIndex,e.date,e.weekday,e.phase,n.module,`"${(n.title||a(n.module)).replace(/"/g,`""`)}"`,n.minutes,``].join(`,`))})}),t.join(`
`)}function I(e,t,n){let r=t.slice(-7),i=r.reduce((e,t)=>e+S(t),0),s=r.length?Math.round(i/r.length):0,c=r.map(e=>({done:100,partial:60,minimum:30,missed:0})[e.completion]||0),p=c.length?Math.round(c.reduce((e,t)=>e+t,0)/c.length):0,m={};u.forEach(e=>{m[e]=0}),r.forEach(e=>{u.forEach(t=>{m[t]+=Number(e.minutes?.[t]||0)})});let h={};r.forEach(e=>{(e.causes||[]).forEach(e=>{h[e]=(h[e]||0)+1})});let g=Object.entries(h).sort((e,t)=>t[1]-e[1]).slice(0,3),v=o()===`en`,y=new Intl.DateTimeFormat(v?`en-US`:`zh-CN`,{dateStyle:`medium`,timeStyle:`short`}).format(new Date),b=[{label:f(`export.docMStudyDays`),value:f(`export.docDays`,{n:r.length})},{label:f(`export.docMTotalTime`),value:f(`export.docMinutes`,{n:i})},{label:f(`export.docMAvgDay`),value:f(`export.docMinutes`,{n:s})},{label:f(`export.docMAvgCompletion`),value:`${p}%`}].map(e=>`<div class="metric"><span>${e.label}</span><strong>${e.value}</strong></div>`).join(``),x=Object.entries(m).filter(([,e])=>e>0).map(([e,t])=>`<p><strong>${a(e)}</strong>${f(`export.docMinutes`,{n:t})}</p>`).join(``)||`<p>${f(`export.docNoModule`)}</p>`,C=g.length?g.map(([e,t])=>`<span>${_(l(`errorCause`,e))}<b>${t}</b></span>`).join(``):`<span>${_(f(`export.docNoCauseTag`))}<b>0</b></span>`,w=[];p<70&&w.push(f(`export.docSgLowCompletion`)),s<e.studyBudget.dailyMinutes*.7&&w.push(f(`export.docSgLowTime`)),g.length||w.push(f(`export.docSgNoCause`)),p>=70&&s>=e.studyBudget.dailyMinutes*.7&&w.push(f(`export.docSgGood`));let T=w.map(e=>`<li>${_(e)}</li>`).join(``),E=e.todayTasks.map((e,t)=>`
      <article class="task-item">
        <div><small>${String(t+1).padStart(2,`0`)}</small><strong>${e.minutes} min</strong></div>
        <p>${_(a(e.module))}：${_(e.text)}</p>
      </article>
    `).join(``),D=[...t].sort((e,t)=>String(t.date).localeCompare(String(e.date))).slice(0,6).map(e=>{let t=(e.causes||[]).map(e=>l(`errorCause`,e)).join(`、`)||f(`export.docNoCause`),n=e.accuracy||``;return`
        <article class="record-item">
          <time>${_(e.date)}</time>
          <p>${S(e)} min</p>
          <small>${_(n||t)}</small>
          <span>${_(e.tomorrowFocus||f(`export.keepLogging`))}</span>
        </article>
      `}).join(``)||`<article class="record-item empty"><time>--</time><p>${_(f(`export.docNoRecords`))}</p><small>${_(f(`export.docNoRecordsHint`))}</small><span>${_(f(`export.keepLogging`))}</span></article>`,O=(e.roadmap||[]).map((e,t)=>`
      <article>
        <span>${String(t+1).padStart(2,`0`)}</span>
        <strong>${_(d(e.title))}</strong>
        <b>${_(e.dayRange)}</b>
        <p>${_(e.focus)}</p>
      </article>
    `).join(``);return`<!doctype html>
<html lang="${v?`en`:`zh-CN`}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${_(f(`export.docReportTitle`,{name:n,level:e.level}))}</title>
<style>
:root {
  --ink: #182522;
  --muted: #70817a;
  --paper: #f6f7f4;
  --panel: #ffffff;
  --line: rgba(49,95,79,0.16);
  --line-strong: rgba(49,95,79,0.26);
  --brand: #315f4f;
  --accent: #b77a20;
  --display: "Hiragino Mincho ProN", "Yu Mincho", "Songti SC", "Noto Serif CJK SC", serif;
  --body: "Avenir Next", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: linear-gradient(90deg, rgba(49,95,79,0.035) 1px, transparent 1px), linear-gradient(rgba(49,95,79,0.035) 1px, transparent 1px), var(--paper);
  background-size: 34px 34px;
  color: var(--ink);
  font-family: var(--body);
}
main { width: min(1120px, calc(100vw - 32px)); margin: 0 auto; padding: 28px 0 52px; }
.report-cover {
  min-height: 330px;
  padding: 34px;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) 320px;
  gap: 28px;
  border-radius: 10px;
  background: linear-gradient(135deg, #182522, #315f4f 64%, #2f7c75);
  color: #f8faf8;
  box-shadow: 0 26px 70px rgba(34,53,48,0.18);
}
.eyebrow { display: inline-flex; width: max-content; border: 1px solid rgba(248,250,248,0.28); border-radius: 999px; padding: 8px 11px; color: rgba(248,250,248,0.82); font-size: 12px; font-weight: 740; }
h1 { max-width: 780px; margin: 34px 0 18px; font: 800 clamp(42px, 7vw, 82px)/0.96 var(--display); }
.cover-text { max-width: 74ch; margin: 0; color: rgba(248,250,248,0.82); font-size: 15px; line-height: 1.8; }
.cover-meta {
  align-self: end;
  display: grid;
  gap: 10px;
  padding: 18px;
  border: 1px solid rgba(248,250,248,0.18);
  border-radius: 8px;
  background: rgba(248,250,248,0.08);
}
.cover-meta div { display: flex; justify-content: space-between; gap: 16px; border-bottom: 1px solid rgba(248,250,248,0.14); padding-bottom: 9px; }
.cover-meta div:last-child { border-bottom: 0; padding-bottom: 0; }
.cover-meta span { color: rgba(248,250,248,0.64); font-size: 12px; font-weight: 800; }
.cover-meta strong { text-align: right; font-size: 13px; }
.metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-top: 14px; }
.metric { min-height: 132px; padding: 18px; border: 1px solid var(--line-strong); border-radius: 8px; background: var(--panel); }
.metric span, .section-kicker, small { color: var(--muted); font-size: 12px; font-weight: 740; text-transform: uppercase; }
.metric strong { display: block; margin-top: 18px; font: 800 38px/0.95 var(--display); color: var(--brand); }
.metric p { margin: 8px 0 0; color: var(--muted); font-size: 12px; line-height: 1.45; }
.report-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 14px; margin-top: 14px; }
section { padding: 22px; border: 1px solid var(--line-strong); border-radius: 8px; background: rgba(255,255,255,0.94); break-inside: avoid; }
h2 { margin: 0 0 16px; font: 800 24px/1.15 var(--display); }
h3 { margin: 0; font-size: 15px; line-height: 1.35; }
p { line-height: 1.68; }
.risk-copy { margin: 0 0 16px; color: #2d3b37; }
.tags { display: flex; flex-wrap: wrap; gap: 8px; }
.tags span { display: inline-flex; align-items: center; gap: 10px; border: 1px solid rgba(49,95,79,0.18); border-radius: 999px; background: #d9ebe4; color: var(--brand); padding: 8px 11px; font-size: 13px; font-weight: 740; }
.tags b { min-width: 22px; border-radius: 999px; background: rgba(49,95,79,0.12); padding: 2px 7px; text-align: center; }
.task-list, .record-list { display: grid; gap: 10px; }
.task-item { display: grid; grid-template-columns: 90px minmax(0, 1fr); gap: 14px; padding: 13px; border: 1px solid var(--line); border-radius: 7px; background: #fbfbf8; }
.task-item div { display: grid; align-content: start; gap: 5px; }
.task-item strong { color: var(--accent); font-size: 14px; }
.task-item p { margin: 0; font-size: 13px; line-height: 1.58; }
.roadmap { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.roadmap article { min-height: 168px; padding: 15px; border: 1px solid var(--line); border-radius: 8px; background: #fbfbf8; }
.roadmap span { display: grid; place-items: center; width: 32px; height: 32px; margin-bottom: 14px; border-radius: 50%; background: var(--brand); color: #fff; font-size: 12px; font-weight: 800; }
.roadmap strong { display: block; margin-bottom: 7px; font-size: 15px; }
.roadmap b { color: var(--muted); font-size: 12px; }
.roadmap p { margin: 10px 0 0; color: var(--muted); font-size: 13px; line-height: 1.55; }
.record-list { margin-top: 14px; }
.record-item { display: grid; grid-template-columns: 110px 1fr auto auto; gap: 14px; align-items: center; padding: 12px 14px; border: 1px solid var(--line); border-radius: 7px; background: var(--panel); }
.record-item.empty { opacity: 0.7; }
.record-item time { color: var(--muted); font-size: 12px; font-weight: 740; }
.record-item p { margin: 0; font-size: 13px; }
.record-item small { color: var(--muted); font-size: 12px; }
.record-item span { justify-self: end; color: var(--brand); font-size: 12px; font-weight: 740; }
.suggestions { margin: 0; padding: 0 0 0 18px; }
.suggestions li { margin-bottom: 8px; line-height: 1.65; }
@media (max-width: 900px) {
  .report-cover { grid-template-columns: 1fr; }
  .metrics { grid-template-columns: repeat(2, 1fr); }
  .report-grid, .roadmap { grid-template-columns: 1fr; }
  .record-item { grid-template-columns: 1fr; gap: 6px; }
}
</style>
</head>
<body>
<main>
<header class="report-cover">
  <div>
    <span class="eyebrow">${_(f(`export.docReportEyebrow`,{level:e.level}))}</span>
    <h1>${_(f(`export.docReportName`,{name:n}))}</h1>
    <p class="cover-text">${_(e.strategy?.summary||f(`export.docCoverFallback`))}</p>
  </div>
  <div class="cover-meta">
    <div><span>${_(f(`export.docProfile`))}</span><strong>${_(n)}</strong></div>
    <div><span>${_(f(`export.docExamDate`))}</span><strong>${_(e.examDate||f(`export.docNotSet`))}</strong></div>
    <div><span>${_(f(`export.docDaysLeft`))}</span><strong>${_(N(e.daysLeft))}</strong></div>
    <div><span>${_(f(`export.docPhase`))}</span><strong>${_(d(e.phase))}</strong></div>
    <div><span>${_(f(`export.docGeneratedAt`))}</span><strong>${_(y)}</strong></div>
  </div>
</header>

<div class="metrics">
  ${b}
</div>

<div class="report-grid">
  <section>
    <span class="section-kicker">MODULES</span>
    <h2>${_(f(`export.docModulesTitle`))}</h2>
    ${x}
  </section>
  <section>
    <span class="section-kicker">CAUSES</span>
    <h2>${_(f(`export.docCausesTitle`))}</h2>
    <div class="tags">${C}</div>
  </section>
</div>

<section>
  <span class="section-kicker">SUGGESTIONS</span>
  <h2>${_(f(`export.docSuggestTitle`))}</h2>
  <ul class="suggestions">${T}</ul>
</section>

<section>
  <span class="section-kicker">TODAY</span>
  <h2>${_(f(`export.docTodayTasks`))}</h2>
  <div class="task-list">${E}</div>
</section>

<section>
  <span class="section-kicker">RECORDS</span>
  <h2>${_(f(`export.docRecentTitle`))}</h2>
  <div class="record-list">${D}</div>
</section>

<section>
  <span class="section-kicker">ROADMAP</span>
  <h2>${_(f(`export.docRoadmap`))}</h2>
  <div class="roadmap">${O}</div>
</section>

</main>
</body>
</html>`}function L(e){return String(e||``).replace(/\\/g,`\\\\`).replace(/;/g,`\\;`).replace(/,/g,`\\,`).replace(/\r?\n/g,`\\n`)}function R(e){if(e.length<=75)return e;let t=[],n=e;for(t.push(n.slice(0,75)),n=n.slice(75);n.length>74;)t.push(` `+n.slice(0,74)),n=n.slice(74);return n.length&&t.push(` `+n),t.join(`\r
`)}function z(e){return e.replace(/-/g,``)}function B(e){let[t,n,r]=e.split(`-`).map(Number);return new Date(Date.UTC(t,n-1,r+1)).toISOString().slice(0,10).replace(/-/g,``)}function V(e,t){let n=new Date().toISOString().replace(/[-:]/g,``).split(`.`)[0]+`Z`,r=[`BEGIN:VCALENDAR`,`VERSION:2.0`,`PRODID:-//JLPT Sprint Desk//EN`,`CALSCALE:GREGORIAN`,`METHOD:PUBLISH`,R(`X-WR-CALNAME:${L(`JLPT ${e.level} · ${t}`)}`)];return(e.dailyPlan||[]).forEach(e=>{if(!e.date)return;let t=e.title||e.phase||`Day ${e.dayIndex}`,i=Number(e.totalMinutes||0),o=`JLPT Day ${e.dayIndex}: ${t}${i?` (${i}min)`:``}`,s=(e.tasks||[]).map(e=>`• ${e.title||a(e.module)} — ${Number(e.minutes||0)}min`).join(`\\n`);r.push(`BEGIN:VEVENT`,`UID:jlpt-${e.dayIndex}-${z(e.date)}@jlpt-sprint-desk`,`DTSTAMP:${n}`,`DTSTART;VALUE=DATE:${z(e.date)}`,`DTEND;VALUE=DATE:${B(e.date)}`,R(`SUMMARY:${L(o)}`),R(`DESCRIPTION:${s}`),`TRANSP:TRANSPARENT`,`END:VEVENT`)}),r.push(`END:VCALENDAR`),r.join(`\r
`)}function H(e,t,n,r,i){return JSON.stringify({exportedAt:C(),storageVersion:2,profileName:e,planSettings:n,generatedPlan:t,planEdits:r,records:i},null,2)}function U(e){let t=[`<!DOCTYPE html>`,`<html lang="${o()===`en`?`en`:`zh-CN`}">`,`<head>`,`<meta charset="UTF-8">`,`<title>${_(f(`export.docPrintTitle`))}</title>`,`<style>`,`body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #182522; }`,`h1 { font-size: 24px; margin-bottom: 8px; }`,`h2 { font-size: 18px; margin-top: 24px; margin-bottom: 12px; }`,`h3 { font-size: 15px; margin-top: 16px; margin-bottom: 8px; }`,`p, li { font-size: 14px; margin: 4px 0; }`,`ul { padding-left: 20px; }`,`.meta { color: #70817a; font-size: 13px; margin-bottom: 16px; }`,`.task { margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #dbe3df; }`,`.task strong { color: #315f4f; }`,`@media print { body { padding: 20px; } }`,`</style>`,`</head>`,`<body>`,`<h1>${f(`export.docPlanTitle`,{level:_(e.level)})}</h1>`,`<p class="meta">${_(f(`export.docPrintMeta`,{exam:e.examDate||f(`export.docNotSet`),days:N(e.daysLeft),phase:d(e.phase)}))}</p>`,``,`<h2>${f(`export.docTodayTasks`)}</h2>`,`<ul>`];return e.todayTasks.forEach(e=>{t.push(`<li><strong>${_(a(e.module))}</strong> (${e.minutes}min)：${_(e.text)}</li>`)}),t.push(`</ul>`),t.push(``,`<h2>${f(`export.docMinimumPlan`)}</h2>`,`<ul>`),e.minimumPlan.forEach(e=>{t.push(`<li>${_(e)}</li>`)}),t.push(`</ul>`),t.push(``,`<h2>${f(`export.docDetail14`)}</h2>`),e.dailyPlan.slice(0,14).forEach(e=>{t.push(`<h3>${_(e.label)} · ${_(e.date)} · ${_(e.weekday)} · ${_(d(e.phase))}</h3>`),t.push(`<ul>`),e.tasks.forEach(e=>{t.push(`<li><strong>${_(a(e.module))}</strong> (${e.minutes}min)：${_(e.text)}</li>`)}),t.push(`</ul>`)}),t.push(``,`</body>`,`</html>`),t.join(`
`)}var W=x();function G(){let{state:a}=r(),{t:o}=i(),c=a.generatedPlan,l=a.records,[u,d]=(0,M.useState)(`markdown`),[f,p]=(0,M.useState)(``),[_,y]=(0,M.useState)(!1),x=a.profiles.find(e=>e.id===a.activeProfileId)?.name||o(`export.unnamed`),S=e=>{if(!c){p(o(`export.noPlan`));return}switch(e){case`markdown`:p(P(c,l,x));break;case`csv`:p(F(c));break;case`report`:p(I(c,l,x));break;case`backup`:p(H(x,c,a.settings,a.planEdits,l));break;case`print`:p(U(c));break;case`ics`:p(V(c,x));break;default:p(``)}},C=async()=>{if(!f){n(o(`export.genFirst`));return}await m(f),y(!0),n(o(`export.copied2`)),setTimeout(()=>y(!1),2e3)},N=()=>{if(!f){n(o(`export.genFirst`));return}let e={markdown:`jlpt-plan-${x}-${new Date().toISOString().slice(0,10)}.md`,csv:`jlpt-plan-${x}-${new Date().toISOString().slice(0,10)}.csv`,report:`jlpt-report-${x}-${new Date().toISOString().slice(0,10)}.html`,backup:`jlpt-backup-${x}-${new Date().toISOString().slice(0,10)}.json`,print:`jlpt-plan-${x}-${new Date().toISOString().slice(0,10)}.html`,ics:`jlpt-plan-${x}-${new Date().toISOString().slice(0,10)}.ics`};b(e[u]||`export.txt`,f,{markdown:`text/markdown`,csv:`text/csv`,report:`text/html`,backup:`application/json`,print:`text/html`,ics:`text/calendar`}[u]||`text/plain`),n(o(`export.downloaded`,{name:e[u]}))},L=e=>{let t=e.target.files?.[0];if(!t)return;let r=new FileReader;r.onload=()=>{try{let e=JSON.parse(String(r.result));if(e.data&&typeof e.data==`object`)Object.entries(e.data).forEach(([e,t])=>{localStorage.setItem(e,String(t))});else{let t=a.activeProfileId;e.planSettings&&localStorage.setItem(`jlptSprintDesk:${t}:planSettings`,JSON.stringify(e.planSettings)),e.generatedPlan&&localStorage.setItem(`jlptSprintDesk:${t}:generatedPlan`,JSON.stringify(e.generatedPlan)),e.planEdits&&localStorage.setItem(`jlptSprintDesk:${t}:planEdits`,JSON.stringify(e.planEdits)),e.records&&localStorage.setItem(`jlptSprintDesk:${t}:records`,JSON.stringify(e.records))}window.location.reload()}catch{n(o(`export.importError`))}},r.readAsText(t)},R=[{key:`markdown`,label:`Markdown`,desc:o(`export.mdDesc`),icon:O,color:`#315f4f`,ext:`.md`},{key:`csv`,label:o(`export.csvLabel`),desc:o(`export.csvDesc`),icon:A,color:`#35647c`,ext:`.csv`},{key:`report`,label:o(`export.reportLabel`),desc:o(`export.reportDesc`),icon:s,color:`#b77a20`,ext:`.html`},{key:`backup`,label:o(`export.backupLabel`),desc:o(`export.backupDesc`),icon:g,color:`#3d7757`,ext:`.json`},{key:`print`,label:o(`export.printLabel`),desc:o(`export.printDesc`),icon:k,color:`#6d5486`,ext:`.html`},{key:`ics`,label:o(`export.icsLabel`),desc:o(`export.icsDesc`),icon:w,color:`#35647c`,ext:`.ics`}],z=R.find(e=>e.key===u),B=f.length,G=f?f.split(`
`).length:0;return(0,W.jsxs)(`div`,{className:`export-page stack`,children:[(0,W.jsxs)(`section`,{className:`panel export-type-panel`,children:[(0,W.jsx)(`div`,{className:`section-head compact`,children:(0,W.jsxs)(`div`,{children:[(0,W.jsx)(t,{size:`small`,color:`app-teal`,children:o(`export.chooseFormat`)}),(0,W.jsx)(`p`,{children:o(`export.chooseFormatDesc`)})]})}),(0,W.jsx)(`div`,{className:`export-cards`,children:R.map(e=>(0,W.jsxs)(`button`,{type:`button`,className:`export-card ${u===e.key?`active`:``}`,onClick:()=>{d(e.key),S(e.key)},children:[(0,W.jsx)(`span`,{className:`export-card-icon`,style:{background:`${e.color}15`,color:e.color},children:(0,W.jsx)(e.icon,{size:22})}),(0,W.jsx)(`span`,{className:`export-card-label`,children:e.label}),(0,W.jsx)(`span`,{className:`export-card-desc`,children:e.desc}),(0,W.jsx)(`span`,{className:`export-card-ext`,children:e.ext}),u===e.key&&(0,W.jsx)(`span`,{className:`export-card-check`,children:(0,W.jsx)(T,{size:14})})]},e.key))})]}),(0,W.jsx)(h,{type:`line-teal`}),(0,W.jsxs)(`section`,{className:`panel export-preview-panel`,children:[(0,W.jsxs)(`div`,{className:`export-preview-header`,children:[(0,W.jsxs)(`div`,{className:`export-preview-info`,children:[(0,W.jsx)(`span`,{className:`export-preview-icon`,children:(0,W.jsx)(D,{size:18})}),(0,W.jsxs)(`div`,{children:[(0,W.jsx)(`strong`,{children:z?.label||o(`export.exportContent`)}),(0,W.jsx)(`span`,{className:`export-preview-meta`,children:B>0?o(`export.charsLines`,{chars:B.toLocaleString(),lines:G}):o(`export.clickToGen`)})]})]}),(0,W.jsxs)(`div`,{className:`export-preview-actions`,children:[(0,W.jsx)(v,{type:`default`,onClick:C,disabled:!f,icon:(0,W.jsx)(E,{size:15}),children:o(_?`export.copyDone`:`export.copy`)}),(0,W.jsx)(v,{type:`primary`,onClick:N,disabled:!f,icon:(0,W.jsx)(g,{size:15}),children:o(`export.download`)})]})]}),(0,W.jsx)(`textarea`,{className:`export-preview-textarea`,value:f,onChange:e=>p(e.target.value),placeholder:o(`export.outputPlaceholder`),readOnly:!c})]}),(0,W.jsxs)(`section`,{className:`panel import-panel`,children:[(0,W.jsxs)(`div`,{className:`import-header`,children:[(0,W.jsx)(`span`,{className:`import-icon`,children:(0,W.jsx)(e,{size:22})}),(0,W.jsxs)(`div`,{children:[(0,W.jsx)(`h2`,{children:o(`export.importBackup`)}),(0,W.jsx)(`p`,{children:o(`export.importDesc`)})]})]}),(0,W.jsxs)(`div`,{className:`import-body`,children:[(0,W.jsxs)(`div`,{className:`import-upload-zone`,children:[(0,W.jsx)(j,{size:32}),(0,W.jsx)(`span`,{children:o(`export.dropHint`)}),(0,W.jsxs)(`label`,{className:`secondary-button file-button`,children:[o(`export.chooseFile`),(0,W.jsx)(`input`,{type:`file`,accept:`.json`,onChange:L})]})]}),(0,W.jsxs)(`div`,{className:`import-warning`,children:[(0,W.jsx)(e,{size:14}),(0,W.jsx)(`span`,{children:o(`export.irreversible`)})]})]})]})]})}export{G as ExportPage};