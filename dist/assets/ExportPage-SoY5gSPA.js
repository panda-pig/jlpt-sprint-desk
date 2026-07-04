import{t as e}from"./triangle-alert-BQzZTJqW.js";import{$ as t,E as n,H as r,K as i,Q as a,S as o,Y as s,Z as c,et as l,f as u,h as d,it as f,k as p,l as m,m as h,ot as g,q as _,rt as v,st as y,tt as b,u as x,x as S,y as C}from"./index-YAZmQnjc.js";var w=h(`calendar-days`,[[`path`,{d:`M8 2v4`,key:`1cmpym`}],[`path`,{d:`M16 2v4`,key:`4m81vk`}],[`rect`,{width:`18`,height:`18`,x:`3`,y:`4`,rx:`2`,key:`1hopcy`}],[`path`,{d:`M3 10h18`,key:`8toen8`}],[`path`,{d:`M8 14h.01`,key:`6423bh`}],[`path`,{d:`M12 14h.01`,key:`1etili`}],[`path`,{d:`M16 14h.01`,key:`1gbofw`}],[`path`,{d:`M8 18h.01`,key:`lrp35t`}],[`path`,{d:`M12 18h.01`,key:`mhygvu`}],[`path`,{d:`M16 18h.01`,key:`kzsmim`}]]),T=h(`check`,[[`path`,{d:`M20 6 9 17l-5-5`,key:`1gmf2c`}]]),E=h(`copy`,[[`rect`,{width:`14`,height:`14`,x:`8`,y:`8`,rx:`2`,ry:`2`,key:`17jyea`}],[`path`,{d:`M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2`,key:`zix9uf`}]]),D=h(`file-output`,[[`path`,{d:`M4.226 20.925A2 2 0 0 0 6 22h12a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v3.127`,key:`wfxp4w`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`,key:`wfsgrz`}],[`path`,{d:`m5 11-3 3`,key:`1dgrs4`}],[`path`,{d:`m5 17-3-3h10`,key:`1mvvaf`}]]),O=h(`file-text`,[[`path`,{d:`M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`,key:`1oefj6`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`,key:`wfsgrz`}],[`path`,{d:`M10 9H8`,key:`b1mrlr`}],[`path`,{d:`M16 13H8`,key:`t4e002`}],[`path`,{d:`M16 17H8`,key:`z1uh3a`}]]),k=h(`printer`,[[`path`,{d:`M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2`,key:`143wyd`}],[`path`,{d:`M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6`,key:`1itne7`}],[`rect`,{x:`6`,y:`14`,width:`12`,height:`8`,rx:`1`,key:`1ue0tg`}]]),A=h(`table`,[[`path`,{d:`M12 3v18`,key:`108xh3`}],[`rect`,{width:`18`,height:`18`,x:`3`,y:`3`,rx:`2`,key:`afitv7`}],[`path`,{d:`M3 9h18`,key:`1pudct`}],[`path`,{d:`M3 15h18`,key:`5xshup`}]]),j=h(`upload`,[[`path`,{d:`M12 3v12`,key:`1x0j5s`}],[`path`,{d:`m17 8-5-5-5 5`,key:`7q97r8`}],[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`,key:`ih7n3h`}]]),M=y(g(),1);function N(e){return e===null?a(`export.docNotSet`):a(`export.docDays`,{n:e})}function P(e,n,r){let i=n.find(e=>e.date===p()),o=[`# ${a(`export.docPlanTitle`,{level:e.level})}`,``,`> ${a(`export.docMeta`,{name:r,date:e.generatedAt.slice(0,10)})}`,``,`## ${a(`export.docOverview`)}`,``,`- ${a(`export.docTargetLevel`)}: ${e.level}`,`- ${a(`export.docExamDate`)}: ${e.examDate||a(`export.docNotSet`)}`,`- ${a(`export.docDaysLeft`)}: ${N(e.daysLeft)}`,`- ${a(`export.docPhase`)}: ${c(e.phase)}`,`- ${a(`export.docHealth`)}: ${t(`budgetStatus`,e.studyBudget.status)} / ${t(`timeStatus`,e.studyBudget.timeStatus)}`,`- ${a(`export.docStrategy`)}: ${e.strategy.summary}`,``,`## ${a(`export.docTodayTasks`)}`,``];return e.todayTasks.forEach((e,t)=>{o.push(`${t+1}. **${s(e.module)}** · ${a(`export.docMinutes`,{n:e.minutes})}`),o.push(`   - ${e.text}`),o.push(``)}),o.push(`## ${a(`export.docMinimumPlan`)}`),o.push(``),e.minimumPlan.forEach(e=>{o.push(`- ${e}`)}),o.push(``,`## ${a(`export.docRoadmap`)}`),o.push(``),e.roadmap.forEach(e=>{o.push(`### ${c(e.title)}（${e.dayRange}）`),o.push(`- ${a(`export.docFocus`)}: ${e.focus}`),o.push(`- ${a(`export.docMethod`)}: ${e.method}`),o.push(``)}),o.push(`## ${a(`export.docDetail14`)}`),o.push(``),e.dailyPlan.slice(0,14).forEach(e=>{o.push(`### ${e.label} · ${e.date} · ${e.weekday}`),o.push(`> ${e.title} · ${c(e.phase)} · ${a(`export.docMinutes`,{n:e.totalMinutes})}`),o.push(``),e.tasks.forEach(e=>{o.push(`- **${s(e.module)}** (${e.minutes}min)：${e.text}`)}),o.push(``),i&&e.date===p()&&(o.push(`> ${a(`export.docTodayRecord`,{status:t(`completion`,i.completion)})}`),o.push(``))}),o.push(`## ${a(`export.docCauseTemplate`)}`),o.push(``),o.push(`| ${a(`export.docColDate`)} | ${a(`export.docColModule`)} | ${a(`export.docColCause`)} | ${a(`export.docColSolution`)} |`),o.push(`|------|------|------|----------|`),n.slice(-7).forEach(e=>{(e.causes||[]).forEach(n=>{let r=e.minutes?Object.entries(e.minutes).filter(([,e])=>e>0).map(([e])=>s(e)).join(`, `):`-`;o.push(`| ${e.date} | ${r} | ${t(`errorCause`,n)} | |`)})}),o.join(`
`)}function F(e){let t=[[`dayIndex`,`date`,`weekday`,`phase`,`module`,`task`,`minutes`,`status`].join(`,`)];return e.dailyPlan.forEach(e=>{e.tasks.forEach(n=>{t.push([e.dayIndex,e.date,e.weekday,e.phase,n.module,`"${(n.title||s(n.module)).replace(/"/g,`""`)}"`,n.minutes,``].join(`,`))})}),t.join(`
`)}function I(e,i,l){let u=i.slice(-7),d=u.reduce((e,t)=>e+n(t),0),f=u.length?Math.round(d/u.length):0,p=u.map(e=>({done:100,partial:60,minimum:30,missed:0})[e.completion]||0),m=p.length?Math.round(p.reduce((e,t)=>e+t,0)/p.length):0,h={};r.forEach(e=>{h[e]=0}),u.forEach(e=>{r.forEach(t=>{h[t]+=Number(e.minutes?.[t]||0)})});let g={};u.forEach(e=>{(e.causes||[]).forEach(e=>{g[e]=(g[e]||0)+1})});let v=Object.entries(g).sort((e,t)=>t[1]-e[1]).slice(0,3),y=_()===`en`,b=new Intl.DateTimeFormat(y?`en-US`:`zh-CN`,{dateStyle:`medium`,timeStyle:`short`}).format(new Date),x=[{label:a(`export.docMStudyDays`),value:a(`export.docDays`,{n:u.length})},{label:a(`export.docMTotalTime`),value:a(`export.docMinutes`,{n:d})},{label:a(`export.docMAvgDay`),value:a(`export.docMinutes`,{n:f})},{label:a(`export.docMAvgCompletion`),value:`${m}%`}].map(e=>`<div class="metric"><span>${e.label}</span><strong>${e.value}</strong></div>`).join(``),S=Object.entries(h).filter(([,e])=>e>0).map(([e,t])=>`<p><strong>${s(e)}</strong>${a(`export.docMinutes`,{n:t})}</p>`).join(``)||`<p>${a(`export.docNoModule`)}</p>`,C=v.length?v.map(([e,n])=>`<span>${o(t(`errorCause`,e))}<b>${n}</b></span>`).join(``):`<span>${o(a(`export.docNoCauseTag`))}<b>0</b></span>`,w=[];m<70&&w.push(a(`export.docSgLowCompletion`)),f<e.studyBudget.dailyMinutes*.7&&w.push(a(`export.docSgLowTime`)),v.length||w.push(a(`export.docSgNoCause`)),m>=70&&f>=e.studyBudget.dailyMinutes*.7&&w.push(a(`export.docSgGood`));let T=w.map(e=>`<li>${o(e)}</li>`).join(``),E=e.todayTasks.map((e,t)=>`
      <article class="task-item">
        <div><small>${String(t+1).padStart(2,`0`)}</small><strong>${e.minutes} min</strong></div>
        <p>${o(s(e.module))}：${o(e.text)}</p>
      </article>
    `).join(``),D=[...i].sort((e,t)=>String(t.date).localeCompare(String(e.date))).slice(0,6).map(e=>{let r=(e.causes||[]).map(e=>t(`errorCause`,e)).join(`、`)||a(`export.docNoCause`),i=e.accuracy||``;return`
        <article class="record-item">
          <time>${o(e.date)}</time>
          <p>${n(e)} min</p>
          <small>${o(i||r)}</small>
          <span>${o(e.tomorrowFocus||a(`export.keepLogging`))}</span>
        </article>
      `}).join(``)||`<article class="record-item empty"><time>--</time><p>${o(a(`export.docNoRecords`))}</p><small>${o(a(`export.docNoRecordsHint`))}</small><span>${o(a(`export.keepLogging`))}</span></article>`,O=(e.roadmap||[]).map((e,t)=>`
      <article>
        <span>${String(t+1).padStart(2,`0`)}</span>
        <strong>${o(c(e.title))}</strong>
        <b>${o(e.dayRange)}</b>
        <p>${o(e.focus)}</p>
      </article>
    `).join(``);return`<!doctype html>
<html lang="${y?`en`:`zh-CN`}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${o(a(`export.docReportTitle`,{name:l,level:e.level}))}</title>
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
    <span class="eyebrow">${o(a(`export.docReportEyebrow`,{level:e.level}))}</span>
    <h1>${o(a(`export.docReportName`,{name:l}))}</h1>
    <p class="cover-text">${o(e.strategy?.summary||a(`export.docCoverFallback`))}</p>
  </div>
  <div class="cover-meta">
    <div><span>${o(a(`export.docProfile`))}</span><strong>${o(l)}</strong></div>
    <div><span>${o(a(`export.docExamDate`))}</span><strong>${o(e.examDate||a(`export.docNotSet`))}</strong></div>
    <div><span>${o(a(`export.docDaysLeft`))}</span><strong>${o(N(e.daysLeft))}</strong></div>
    <div><span>${o(a(`export.docPhase`))}</span><strong>${o(c(e.phase))}</strong></div>
    <div><span>${o(a(`export.docGeneratedAt`))}</span><strong>${o(b)}</strong></div>
  </div>
</header>

<div class="metrics">
  ${x}
</div>

<div class="report-grid">
  <section>
    <span class="section-kicker">MODULES</span>
    <h2>${o(a(`export.docModulesTitle`))}</h2>
    ${S}
  </section>
  <section>
    <span class="section-kicker">CAUSES</span>
    <h2>${o(a(`export.docCausesTitle`))}</h2>
    <div class="tags">${C}</div>
  </section>
</div>

<section>
  <span class="section-kicker">SUGGESTIONS</span>
  <h2>${o(a(`export.docSuggestTitle`))}</h2>
  <ul class="suggestions">${T}</ul>
</section>

<section>
  <span class="section-kicker">TODAY</span>
  <h2>${o(a(`export.docTodayTasks`))}</h2>
  <div class="task-list">${E}</div>
</section>

<section>
  <span class="section-kicker">RECORDS</span>
  <h2>${o(a(`export.docRecentTitle`))}</h2>
  <div class="record-list">${D}</div>
</section>

<section>
  <span class="section-kicker">ROADMAP</span>
  <h2>${o(a(`export.docRoadmap`))}</h2>
  <div class="roadmap">${O}</div>
</section>

</main>
</body>
</html>`}function L(e){return String(e||``).replace(/\\/g,`\\\\`).replace(/;/g,`\\;`).replace(/,/g,`\\,`).replace(/\r?\n/g,`\\n`)}function R(e){if(e.length<=75)return e;let t=[],n=e;for(t.push(n.slice(0,75)),n=n.slice(75);n.length>74;)t.push(` `+n.slice(0,74)),n=n.slice(74);return n.length&&t.push(` `+n),t.join(`\r
`)}function z(e){return e.replace(/-/g,``)}function B(e){let[t,n,r]=e.split(`-`).map(Number);return new Date(Date.UTC(t,n-1,r+1)).toISOString().slice(0,10).replace(/-/g,``)}function V(e,t){let n=new Date().toISOString().replace(/[-:]/g,``).split(`.`)[0]+`Z`,r=[`BEGIN:VCALENDAR`,`VERSION:2.0`,`PRODID:-//JLPT Sprint Desk//EN`,`CALSCALE:GREGORIAN`,`METHOD:PUBLISH`,R(`X-WR-CALNAME:${L(`JLPT ${e.level} · ${t}`)}`)];return(e.dailyPlan||[]).forEach(e=>{if(!e.date)return;let t=e.title||e.phase||`Day ${e.dayIndex}`,i=Number(e.totalMinutes||0),a=`JLPT Day ${e.dayIndex}: ${t}${i?` (${i}min)`:``}`,o=(e.tasks||[]).map(e=>`• ${e.title||s(e.module)} — ${Number(e.minutes||0)}min`).join(`\\n`);r.push(`BEGIN:VEVENT`,`UID:jlpt-${e.dayIndex}-${z(e.date)}@jlpt-sprint-desk`,`DTSTAMP:${n}`,`DTSTART;VALUE=DATE:${z(e.date)}`,`DTEND;VALUE=DATE:${B(e.date)}`,R(`SUMMARY:${L(a)}`),R(`DESCRIPTION:${o}`),`TRANSP:TRANSPARENT`,`END:VEVENT`)}),r.push(`END:VCALENDAR`),r.join(`\r
`)}function H(e,t,n,r,i){return JSON.stringify({exportedAt:p(),storageVersion:2,profileName:e,planSettings:n,generatedPlan:t,planEdits:r,records:i},null,2)}function U(e){let t=[`<!DOCTYPE html>`,`<html lang="${_()===`en`?`en`:`zh-CN`}">`,`<head>`,`<meta charset="UTF-8">`,`<title>${o(a(`export.docPrintTitle`))}</title>`,`<style>`,`body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #182522; }`,`h1 { font-size: 24px; margin-bottom: 8px; }`,`h2 { font-size: 18px; margin-top: 24px; margin-bottom: 12px; }`,`h3 { font-size: 15px; margin-top: 16px; margin-bottom: 8px; }`,`p, li { font-size: 14px; margin: 4px 0; }`,`ul { padding-left: 20px; }`,`.meta { color: #70817a; font-size: 13px; margin-bottom: 16px; }`,`.task { margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #dbe3df; }`,`.task strong { color: #315f4f; }`,`@media print { body { padding: 20px; } }`,`</style>`,`</head>`,`<body>`,`<h1>${a(`export.docPlanTitle`,{level:o(e.level)})}</h1>`,`<p class="meta">${o(a(`export.docPrintMeta`,{exam:e.examDate||a(`export.docNotSet`),days:N(e.daysLeft),phase:c(e.phase)}))}</p>`,``,`<h2>${a(`export.docTodayTasks`)}</h2>`,`<ul>`];return e.todayTasks.forEach(e=>{t.push(`<li><strong>${o(s(e.module))}</strong> (${e.minutes}min)：${o(e.text)}</li>`)}),t.push(`</ul>`),t.push(``,`<h2>${a(`export.docMinimumPlan`)}</h2>`,`<ul>`),e.minimumPlan.forEach(e=>{t.push(`<li>${o(e)}</li>`)}),t.push(`</ul>`),t.push(``,`<h2>${a(`export.docDetail14`)}</h2>`),e.dailyPlan.slice(0,14).forEach(e=>{t.push(`<h3>${o(e.label)} · ${o(e.date)} · ${o(e.weekday)} · ${o(c(e.phase))}</h3>`),t.push(`<ul>`),e.tasks.forEach(e=>{t.push(`<li><strong>${o(s(e.module))}</strong> (${e.minutes}min)：${o(e.text)}</li>`)}),t.push(`</ul>`)}),t.push(``,`</body>`,`</html>`),t.join(`
`)}var W=f();function G(){let{state:t}=d(),{t:n}=i(),r=t.generatedPlan,a=t.records,[o,s]=(0,M.useState)(`markdown`),[c,f]=(0,M.useState)(``),[p,h]=(0,M.useState)(!1),g=(0,M.useRef)(null),_=t.profiles.find(e=>e.id===t.activeProfileId)?.name||n(`export.unnamed`),y=e=>{if(!r){f(n(`export.noPlan`));return}switch(e){case`markdown`:f(P(r,a,_));break;case`csv`:f(F(r));break;case`report`:f(I(r,a,_));break;case`backup`:f(H(_,r,t.settings,t.planEdits,a));break;case`print`:f(U(r));break;case`ics`:f(V(r,_));break;default:f(``)}},N=async()=>{if(!c){m(n(`export.genFirst`));return}await C(c),h(!0),m(n(`export.copied2`)),setTimeout(()=>h(!1),2e3)},L=()=>{if(!c){m(n(`export.genFirst`));return}let e={markdown:`jlpt-plan-${_}-${new Date().toISOString().slice(0,10)}.md`,csv:`jlpt-plan-${_}-${new Date().toISOString().slice(0,10)}.csv`,report:`jlpt-report-${_}-${new Date().toISOString().slice(0,10)}.html`,backup:`jlpt-backup-${_}-${new Date().toISOString().slice(0,10)}.json`,print:`jlpt-plan-${_}-${new Date().toISOString().slice(0,10)}.html`,ics:`jlpt-plan-${_}-${new Date().toISOString().slice(0,10)}.ics`};S(e[o]||`export.txt`,c,{markdown:`text/markdown`,csv:`text/csv`,report:`text/html`,backup:`application/json`,print:`text/html`,ics:`text/calendar`}[o]||`text/plain`),m(n(`export.downloaded`,{name:e[o]}))},R=e=>{let r=e.target.files?.[0];if(!r)return;let i=new FileReader;i.onload=()=>{try{let e=JSON.parse(String(i.result));if(e.data&&typeof e.data==`object`)Object.entries(e.data).forEach(([e,t])=>{localStorage.setItem(e,String(t))});else{let n=t.activeProfileId;e.planSettings&&localStorage.setItem(`jlptSprintDesk:${n}:planSettings`,JSON.stringify(e.planSettings)),e.generatedPlan&&localStorage.setItem(`jlptSprintDesk:${n}:generatedPlan`,JSON.stringify(e.generatedPlan)),e.planEdits&&localStorage.setItem(`jlptSprintDesk:${n}:planEdits`,JSON.stringify(e.planEdits)),e.records&&localStorage.setItem(`jlptSprintDesk:${n}:records`,JSON.stringify(e.records))}window.location.reload()}catch{m(n(`export.importError`))}},i.readAsText(r)},z=[{key:`markdown`,label:`Markdown`,desc:n(`export.mdDesc`),icon:O,color:`#315f4f`,ext:`.md`},{key:`csv`,label:n(`export.csvLabel`),desc:n(`export.csvDesc`),icon:A,color:`#35647c`,ext:`.csv`},{key:`report`,label:n(`export.reportLabel`),desc:n(`export.reportDesc`),icon:u,color:`#b77a20`,ext:`.html`},{key:`backup`,label:n(`export.backupLabel`),desc:n(`export.backupDesc`),icon:x,color:`#3d7757`,ext:`.json`},{key:`print`,label:n(`export.printLabel`),desc:n(`export.printDesc`),icon:k,color:`#6d5486`,ext:`.html`},{key:`ics`,label:n(`export.icsLabel`),desc:n(`export.icsDesc`),icon:w,color:`#35647c`,ext:`.ics`}],B=z.find(e=>e.key===o),G=c.length,K=c?c.split(`
`).length:0;return(0,W.jsxs)(`div`,{className:`export-page stack`,children:[(0,W.jsxs)(`section`,{className:`panel export-type-panel`,children:[(0,W.jsx)(`div`,{className:`section-head compact`,children:(0,W.jsxs)(`div`,{children:[(0,W.jsx)(l,{size:`small`,color:`app-teal`,children:n(`export.chooseFormat`)}),(0,W.jsx)(`p`,{children:n(`export.chooseFormatDesc`)})]})}),(0,W.jsx)(`div`,{className:`export-cards`,children:z.map(e=>(0,W.jsxs)(`button`,{type:`button`,className:`export-card ${o===e.key?`active`:``}`,onClick:()=>{s(e.key),y(e.key)},children:[(0,W.jsx)(`span`,{className:`export-card-icon`,style:{background:`${e.color}15`,color:e.color},children:(0,W.jsx)(e.icon,{size:22})}),(0,W.jsx)(`span`,{className:`export-card-label`,children:e.label}),(0,W.jsx)(`span`,{className:`export-card-desc`,children:e.desc}),(0,W.jsx)(`span`,{className:`export-card-ext`,children:e.ext}),o===e.key&&(0,W.jsx)(`span`,{className:`export-card-check`,children:(0,W.jsx)(T,{size:14})})]},e.key))})]}),(0,W.jsx)(b,{type:`line-teal`}),(0,W.jsxs)(`section`,{className:`panel export-preview-panel`,children:[(0,W.jsxs)(`div`,{className:`export-preview-header`,children:[(0,W.jsxs)(`div`,{className:`export-preview-info`,children:[(0,W.jsx)(`span`,{className:`export-preview-icon`,children:(0,W.jsx)(D,{size:18})}),(0,W.jsxs)(`div`,{children:[(0,W.jsx)(`strong`,{children:B?.label||n(`export.exportContent`)}),(0,W.jsx)(`span`,{className:`export-preview-meta`,children:G>0?n(`export.charsLines`,{chars:G.toLocaleString(),lines:K}):n(`export.clickToGen`)})]})]}),(0,W.jsxs)(`div`,{className:`export-preview-actions`,children:[(0,W.jsx)(v,{type:`default`,onClick:N,disabled:!c,icon:(0,W.jsx)(E,{size:15}),children:n(p?`export.copyDone`:`export.copy`)}),(0,W.jsx)(v,{type:`primary`,onClick:L,disabled:!c,icon:(0,W.jsx)(x,{size:15}),children:n(`export.download`)})]})]}),(0,W.jsx)(`textarea`,{className:`export-preview-textarea`,value:c,onChange:e=>f(e.target.value),placeholder:n(`export.outputPlaceholder`),readOnly:!r})]}),(0,W.jsxs)(`section`,{className:`panel import-panel`,children:[(0,W.jsxs)(`div`,{className:`import-header`,children:[(0,W.jsx)(`span`,{className:`import-icon`,children:(0,W.jsx)(e,{size:22})}),(0,W.jsxs)(`div`,{children:[(0,W.jsx)(`h2`,{children:n(`export.importBackup`)}),(0,W.jsx)(`p`,{children:n(`export.importDesc`)})]})]}),(0,W.jsxs)(`div`,{className:`import-body`,children:[(0,W.jsxs)(`div`,{className:`import-upload-zone`,children:[(0,W.jsx)(j,{size:32}),(0,W.jsx)(`span`,{children:n(`export.dropHint`)}),(0,W.jsx)(`input`,{ref:g,type:`file`,accept:`.json`,style:{display:`none`},onChange:R}),(0,W.jsx)(v,{type:`default`,onClick:()=>g.current?.click(),children:n(`export.chooseFile`)})]}),(0,W.jsxs)(`div`,{className:`import-warning`,children:[(0,W.jsx)(e,{size:14}),(0,W.jsx)(`span`,{children:n(`export.irreversible`)})]})]})]})]})}export{G as ExportPage};