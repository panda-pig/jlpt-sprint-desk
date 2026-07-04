import{t as e}from"./triangle-alert-ZWRSSeA2.js";import{$ as t,A as n,F as r,H as i,I as a,K as o,N as s,Q as c,Y as l,Z as u,d,et as f,it as p,j as m,m as h,ot as g,p as _,q as v,rt as y,st as b,tt as x,v as S,x as C}from"./index-CfYyZbgw.js";var w=r(`calendar-days`,[[`path`,{d:`M8 2v4`,key:`1cmpym`}],[`path`,{d:`M16 2v4`,key:`4m81vk`}],[`rect`,{width:`18`,height:`18`,x:`3`,y:`4`,rx:`2`,key:`1hopcy`}],[`path`,{d:`M3 10h18`,key:`8toen8`}],[`path`,{d:`M8 14h.01`,key:`6423bh`}],[`path`,{d:`M12 14h.01`,key:`1etili`}],[`path`,{d:`M16 14h.01`,key:`1gbofw`}],[`path`,{d:`M8 18h.01`,key:`lrp35t`}],[`path`,{d:`M12 18h.01`,key:`mhygvu`}],[`path`,{d:`M16 18h.01`,key:`kzsmim`}]]),T=r(`check`,[[`path`,{d:`M20 6 9 17l-5-5`,key:`1gmf2c`}]]),E=r(`copy`,[[`rect`,{width:`14`,height:`14`,x:`8`,y:`8`,rx:`2`,ry:`2`,key:`17jyea`}],[`path`,{d:`M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2`,key:`zix9uf`}]]),D=r(`file-output`,[[`path`,{d:`M4.226 20.925A2 2 0 0 0 6 22h12a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v3.127`,key:`wfxp4w`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`,key:`wfsgrz`}],[`path`,{d:`m5 11-3 3`,key:`1dgrs4`}],[`path`,{d:`m5 17-3-3h10`,key:`1mvvaf`}]]),O=r(`file-text`,[[`path`,{d:`M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z`,key:`1oefj6`}],[`path`,{d:`M14 2v5a1 1 0 0 0 1 1h5`,key:`wfsgrz`}],[`path`,{d:`M10 9H8`,key:`b1mrlr`}],[`path`,{d:`M16 13H8`,key:`t4e002`}],[`path`,{d:`M16 17H8`,key:`z1uh3a`}]]),k=r(`printer`,[[`path`,{d:`M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2`,key:`143wyd`}],[`path`,{d:`M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6`,key:`1itne7`}],[`rect`,{x:`6`,y:`14`,width:`12`,height:`8`,rx:`1`,key:`1ue0tg`}]]),A=r(`table`,[[`path`,{d:`M12 3v18`,key:`108xh3`}],[`rect`,{width:`18`,height:`18`,x:`3`,y:`3`,rx:`2`,key:`afitv7`}],[`path`,{d:`M3 9h18`,key:`1pudct`}],[`path`,{d:`M3 15h18`,key:`5xshup`}]]),j=r(`upload`,[[`path`,{d:`M12 3v12`,key:`1x0j5s`}],[`path`,{d:`m17 8-5-5-5 5`,key:`7q97r8`}],[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`,key:`ih7n3h`}]]),M=b(g(),1);function N(e){return e===null?c(`export.docNotSet`):c(`export.docDays`,{n:e})}function P(e,n,r){let i=n.find(e=>e.date===C()),a=[`# ${c(`export.docPlanTitle`,{level:e.level})}`,``,`> ${c(`export.docMeta`,{name:r,date:e.generatedAt.slice(0,10)})}`,``,`## ${c(`export.docOverview`)}`,``,`- ${c(`export.docTargetLevel`)}: ${e.level}`,`- ${c(`export.docExamDate`)}: ${e.examDate||c(`export.docNotSet`)}`,`- ${c(`export.docDaysLeft`)}: ${N(e.daysLeft)}`,`- ${c(`export.docPhase`)}: ${u(e.phase)}`,`- ${c(`export.docHealth`)}: ${t(`budgetStatus`,e.studyBudget.status)} / ${t(`timeStatus`,e.studyBudget.timeStatus)}`,`- ${c(`export.docStrategy`)}: ${e.strategy.summary}`,``,`## ${c(`export.docTodayTasks`)}`,``];return e.todayTasks.forEach((e,t)=>{a.push(`${t+1}. **${l(e.module)}** · ${c(`export.docMinutes`,{n:e.minutes})}`),a.push(`   - ${e.text}`),a.push(``)}),a.push(`## ${c(`export.docMinimumPlan`)}`),a.push(``),e.minimumPlan.forEach(e=>{a.push(`- ${e}`)}),a.push(``,`## ${c(`export.docRoadmap`)}`),a.push(``),e.roadmap.forEach(e=>{a.push(`### ${u(e.title)}（${e.dayRange}）`),a.push(`- ${c(`export.docFocus`)}: ${e.focus}`),a.push(`- ${c(`export.docMethod`)}: ${e.method}`),a.push(``)}),a.push(`## ${c(`export.docDetail14`)}`),a.push(``),e.dailyPlan.slice(0,14).forEach(e=>{a.push(`### ${e.label} · ${e.date} · ${e.weekday}`),a.push(`> ${e.title} · ${u(e.phase)} · ${c(`export.docMinutes`,{n:e.totalMinutes})}`),a.push(``),e.tasks.forEach(e=>{a.push(`- **${l(e.module)}** (${e.minutes}min)：${e.text}`)}),a.push(``),i&&e.date===C()&&(a.push(`> ${c(`export.docTodayRecord`,{status:t(`completion`,i.completion)})}`),a.push(``))}),a.push(`## ${c(`export.docCauseTemplate`)}`),a.push(``),a.push(`| ${c(`export.docColDate`)} | ${c(`export.docColModule`)} | ${c(`export.docColCause`)} | ${c(`export.docColSolution`)} |`),a.push(`|------|------|------|----------|`),n.slice(-7).forEach(e=>{(e.causes||[]).forEach(n=>{let r=e.minutes?Object.entries(e.minutes).filter(([,e])=>e>0).map(([e])=>l(e)).join(`, `):`-`;a.push(`| ${e.date} | ${r} | ${t(`errorCause`,n)} | |`)})}),a.join(`
`)}function F(e){let t=[[`dayIndex`,`date`,`weekday`,`phase`,`module`,`task`,`minutes`,`status`].join(`,`)];return e.dailyPlan.forEach(e=>{e.tasks.forEach(n=>{t.push([e.dayIndex,e.date,e.weekday,e.phase,n.module,`"${(n.title||l(n.module)).replace(/"/g,`""`)}"`,n.minutes,``].join(`,`))})}),t.join(`
`)}function I(e,n,r){let a=n.slice(-7),o=a.reduce((e,t)=>e+S(t),0),s=a.length?Math.round(o/a.length):0,d=a.map(e=>({done:100,partial:60,minimum:30,missed:0})[e.completion]||0),f=d.length?Math.round(d.reduce((e,t)=>e+t,0)/d.length):0,p={};i.forEach(e=>{p[e]=0}),a.forEach(e=>{i.forEach(t=>{p[t]+=Number(e.minutes?.[t]||0)})});let m={};a.forEach(e=>{(e.causes||[]).forEach(e=>{m[e]=(m[e]||0)+1})});let g=Object.entries(m).sort((e,t)=>t[1]-e[1]).slice(0,3),_=v()===`en`,y=new Intl.DateTimeFormat(_?`en-US`:`zh-CN`,{dateStyle:`medium`,timeStyle:`short`}).format(new Date),b=[{label:c(`export.docMStudyDays`),value:c(`export.docDays`,{n:a.length})},{label:c(`export.docMTotalTime`),value:c(`export.docMinutes`,{n:o})},{label:c(`export.docMAvgDay`),value:c(`export.docMinutes`,{n:s})},{label:c(`export.docMAvgCompletion`),value:`${f}%`}].map(e=>`<div class="metric"><span>${e.label}</span><strong>${e.value}</strong></div>`).join(``),x=Object.entries(p).filter(([,e])=>e>0).map(([e,t])=>`<p><strong>${l(e)}</strong>${c(`export.docMinutes`,{n:t})}</p>`).join(``)||`<p>${c(`export.docNoModule`)}</p>`,C=g.length?g.map(([e,n])=>`<span>${h(t(`errorCause`,e))}<b>${n}</b></span>`).join(``):`<span>${h(c(`export.docNoCauseTag`))}<b>0</b></span>`,w=[];f<70&&w.push(c(`export.docSgLowCompletion`)),s<e.studyBudget.dailyMinutes*.7&&w.push(c(`export.docSgLowTime`)),g.length||w.push(c(`export.docSgNoCause`)),f>=70&&s>=e.studyBudget.dailyMinutes*.7&&w.push(c(`export.docSgGood`));let T=w.map(e=>`<li>${h(e)}</li>`).join(``),E=e.todayTasks.map((e,t)=>`
      <article class="task-item">
        <div><small>${String(t+1).padStart(2,`0`)}</small><strong>${e.minutes} min</strong></div>
        <p>${h(l(e.module))}：${h(e.text)}</p>
      </article>
    `).join(``),D=[...n].sort((e,t)=>String(t.date).localeCompare(String(e.date))).slice(0,6).map(e=>{let n=(e.causes||[]).map(e=>t(`errorCause`,e)).join(`、`)||c(`export.docNoCause`),r=e.accuracy||``;return`
        <article class="record-item">
          <time>${h(e.date)}</time>
          <p>${S(e)} min</p>
          <small>${h(r||n)}</small>
          <span>${h(e.tomorrowFocus||c(`export.keepLogging`))}</span>
        </article>
      `}).join(``)||`<article class="record-item empty"><time>--</time><p>${h(c(`export.docNoRecords`))}</p><small>${h(c(`export.docNoRecordsHint`))}</small><span>${h(c(`export.keepLogging`))}</span></article>`,O=(e.roadmap||[]).map((e,t)=>`
      <article>
        <span>${String(t+1).padStart(2,`0`)}</span>
        <strong>${h(u(e.title))}</strong>
        <b>${h(e.dayRange)}</b>
        <p>${h(e.focus)}</p>
      </article>
    `).join(``);return`<!doctype html>
<html lang="${_?`en`:`zh-CN`}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${h(c(`export.docReportTitle`,{name:r,level:e.level}))}</title>
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
    <span class="eyebrow">${h(c(`export.docReportEyebrow`,{level:e.level}))}</span>
    <h1>${h(c(`export.docReportName`,{name:r}))}</h1>
    <p class="cover-text">${h(e.strategy?.summary||c(`export.docCoverFallback`))}</p>
  </div>
  <div class="cover-meta">
    <div><span>${h(c(`export.docProfile`))}</span><strong>${h(r)}</strong></div>
    <div><span>${h(c(`export.docExamDate`))}</span><strong>${h(e.examDate||c(`export.docNotSet`))}</strong></div>
    <div><span>${h(c(`export.docDaysLeft`))}</span><strong>${h(N(e.daysLeft))}</strong></div>
    <div><span>${h(c(`export.docPhase`))}</span><strong>${h(u(e.phase))}</strong></div>
    <div><span>${h(c(`export.docGeneratedAt`))}</span><strong>${h(y)}</strong></div>
  </div>
</header>

<div class="metrics">
  ${b}
</div>

<div class="report-grid">
  <section>
    <span class="section-kicker">MODULES</span>
    <h2>${h(c(`export.docModulesTitle`))}</h2>
    ${x}
  </section>
  <section>
    <span class="section-kicker">CAUSES</span>
    <h2>${h(c(`export.docCausesTitle`))}</h2>
    <div class="tags">${C}</div>
  </section>
</div>

<section>
  <span class="section-kicker">SUGGESTIONS</span>
  <h2>${h(c(`export.docSuggestTitle`))}</h2>
  <ul class="suggestions">${T}</ul>
</section>

<section>
  <span class="section-kicker">TODAY</span>
  <h2>${h(c(`export.docTodayTasks`))}</h2>
  <div class="task-list">${E}</div>
</section>

<section>
  <span class="section-kicker">RECORDS</span>
  <h2>${h(c(`export.docRecentTitle`))}</h2>
  <div class="record-list">${D}</div>
</section>

<section>
  <span class="section-kicker">ROADMAP</span>
  <h2>${h(c(`export.docRoadmap`))}</h2>
  <div class="roadmap">${O}</div>
</section>

</main>
</body>
</html>`}function L(e){return String(e||``).replace(/\\/g,`\\\\`).replace(/;/g,`\\;`).replace(/,/g,`\\,`).replace(/\r?\n/g,`\\n`)}function R(e){if(e.length<=75)return e;let t=[],n=e;for(t.push(n.slice(0,75)),n=n.slice(75);n.length>74;)t.push(` `+n.slice(0,74)),n=n.slice(74);return n.length&&t.push(` `+n),t.join(`\r
`)}function z(e){return e.replace(/-/g,``)}function B(e){let[t,n,r]=e.split(`-`).map(Number);return new Date(Date.UTC(t,n-1,r+1)).toISOString().slice(0,10).replace(/-/g,``)}function V(e,t){let n=new Date().toISOString().replace(/[-:]/g,``).split(`.`)[0]+`Z`,r=[`BEGIN:VCALENDAR`,`VERSION:2.0`,`PRODID:-//JLPT Sprint Desk//EN`,`CALSCALE:GREGORIAN`,`METHOD:PUBLISH`,R(`X-WR-CALNAME:${L(`JLPT ${e.level} · ${t}`)}`)];return(e.dailyPlan||[]).forEach(e=>{if(!e.date)return;let t=e.title||e.phase||`Day ${e.dayIndex}`,i=Number(e.totalMinutes||0),a=`JLPT Day ${e.dayIndex}: ${t}${i?` (${i}min)`:``}`,o=(e.tasks||[]).map(e=>`• ${e.title||l(e.module)} — ${Number(e.minutes||0)}min`).join(`\\n`);r.push(`BEGIN:VEVENT`,`UID:jlpt-${e.dayIndex}-${z(e.date)}@jlpt-sprint-desk`,`DTSTAMP:${n}`,`DTSTART;VALUE=DATE:${z(e.date)}`,`DTEND;VALUE=DATE:${B(e.date)}`,R(`SUMMARY:${L(a)}`),R(`DESCRIPTION:${o}`),`TRANSP:TRANSPARENT`,`END:VEVENT`)}),r.push(`END:VCALENDAR`),r.join(`\r
`)}function H(e,t,n,r,i){return JSON.stringify({exportedAt:C(),storageVersion:2,profileName:e,planSettings:n,generatedPlan:t,planEdits:r,records:i},null,2)}function U(e){let t=[`<!DOCTYPE html>`,`<html lang="${v()===`en`?`en`:`zh-CN`}">`,`<head>`,`<meta charset="UTF-8">`,`<title>${h(c(`export.docPrintTitle`))}</title>`,`<style>`,`body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #182522; }`,`h1 { font-size: 24px; margin-bottom: 8px; }`,`h2 { font-size: 18px; margin-top: 24px; margin-bottom: 12px; }`,`h3 { font-size: 15px; margin-top: 16px; margin-bottom: 8px; }`,`p, li { font-size: 14px; margin: 4px 0; }`,`ul { padding-left: 20px; }`,`.meta { color: #70817a; font-size: 13px; margin-bottom: 16px; }`,`.task { margin: 8px 0; padding: 8px 0; border-bottom: 1px solid #dbe3df; }`,`.task strong { color: #315f4f; }`,`@media print { body { padding: 20px; } }`,`</style>`,`</head>`,`<body>`,`<h1>${c(`export.docPlanTitle`,{level:h(e.level)})}</h1>`,`<p class="meta">${h(c(`export.docPrintMeta`,{exam:e.examDate||c(`export.docNotSet`),days:N(e.daysLeft),phase:u(e.phase)}))}</p>`,``,`<h2>${c(`export.docTodayTasks`)}</h2>`,`<ul>`];return e.todayTasks.forEach(e=>{t.push(`<li><strong>${h(l(e.module))}</strong> (${e.minutes}min)：${h(e.text)}</li>`)}),t.push(`</ul>`),t.push(``,`<h2>${c(`export.docMinimumPlan`)}</h2>`,`<ul>`),e.minimumPlan.forEach(e=>{t.push(`<li>${h(e)}</li>`)}),t.push(`</ul>`),t.push(``,`<h2>${c(`export.docDetail14`)}</h2>`),e.dailyPlan.slice(0,14).forEach(e=>{t.push(`<h3>${h(e.label)} · ${h(e.date)} · ${h(e.weekday)} · ${h(u(e.phase))}</h3>`),t.push(`<ul>`),e.tasks.forEach(e=>{t.push(`<li><strong>${h(l(e.module))}</strong> (${e.minutes}min)：${h(e.text)}</li>`)}),t.push(`</ul>`)}),t.push(``,`</body>`,`</html>`),t.join(`
`)}var W=p();function G(){let{state:t}=a(),{t:r}=o(),i=t.generatedPlan,c=t.records,[l,u]=(0,M.useState)(`markdown`),[p,h]=(0,M.useState)(``),[g,v]=(0,M.useState)(!1),b=(0,M.useRef)(null),S=t.profiles.find(e=>e.id===t.activeProfileId)?.name||r(`export.unnamed`),C=e=>{if(!i){h(r(`export.noPlan`));return}switch(e){case`markdown`:h(P(i,c,S));break;case`csv`:h(F(i));break;case`report`:h(I(i,c,S));break;case`backup`:h(H(S,i,t.settings,t.planEdits,c));break;case`print`:h(U(i));break;case`ics`:h(V(i,S));break;default:h(``)}},N=async()=>{if(!p){n(r(`export.genFirst`));return}await d(p),v(!0),n(r(`export.copied2`)),setTimeout(()=>v(!1),2e3)},L=()=>{if(!p){n(r(`export.genFirst`));return}let e={markdown:`jlpt-plan-${S}-${new Date().toISOString().slice(0,10)}.md`,csv:`jlpt-plan-${S}-${new Date().toISOString().slice(0,10)}.csv`,report:`jlpt-report-${S}-${new Date().toISOString().slice(0,10)}.html`,backup:`jlpt-backup-${S}-${new Date().toISOString().slice(0,10)}.json`,print:`jlpt-plan-${S}-${new Date().toISOString().slice(0,10)}.html`,ics:`jlpt-plan-${S}-${new Date().toISOString().slice(0,10)}.ics`};_(e[l]||`export.txt`,p,{markdown:`text/markdown`,csv:`text/csv`,report:`text/html`,backup:`application/json`,print:`text/html`,ics:`text/calendar`}[l]||`text/plain`),n(r(`export.downloaded`,{name:e[l]}))},R=e=>{let i=e.target.files?.[0];if(!i)return;let a=new FileReader;a.onload=()=>{try{let e=JSON.parse(String(a.result));if(e.data&&typeof e.data==`object`)Object.entries(e.data).forEach(([e,t])=>{localStorage.setItem(e,String(t))});else{let n=t.activeProfileId;e.planSettings&&localStorage.setItem(`jlptSprintDesk:${n}:planSettings`,JSON.stringify(e.planSettings)),e.generatedPlan&&localStorage.setItem(`jlptSprintDesk:${n}:generatedPlan`,JSON.stringify(e.generatedPlan)),e.planEdits&&localStorage.setItem(`jlptSprintDesk:${n}:planEdits`,JSON.stringify(e.planEdits)),e.records&&localStorage.setItem(`jlptSprintDesk:${n}:records`,JSON.stringify(e.records))}window.location.reload()}catch{n(r(`export.importError`))}},a.readAsText(i)},z=[{key:`markdown`,label:`Markdown`,desc:r(`export.mdDesc`),icon:O,color:`#315f4f`,ext:`.md`},{key:`csv`,label:r(`export.csvLabel`),desc:r(`export.csvDesc`),icon:A,color:`#35647c`,ext:`.csv`},{key:`report`,label:r(`export.reportLabel`),desc:r(`export.reportDesc`),icon:s,color:`#b77a20`,ext:`.html`},{key:`backup`,label:r(`export.backupLabel`),desc:r(`export.backupDesc`),icon:m,color:`#3d7757`,ext:`.json`},{key:`print`,label:r(`export.printLabel`),desc:r(`export.printDesc`),icon:k,color:`#6d5486`,ext:`.html`},{key:`ics`,label:r(`export.icsLabel`),desc:r(`export.icsDesc`),icon:w,color:`#35647c`,ext:`.ics`}],B=z.find(e=>e.key===l),G=p.length,K=p?p.split(`
`).length:0;return(0,W.jsxs)(`div`,{className:`export-page stack`,children:[(0,W.jsxs)(`section`,{className:`panel export-type-panel`,children:[(0,W.jsx)(`div`,{className:`section-head compact`,children:(0,W.jsxs)(`div`,{children:[(0,W.jsx)(f,{size:`small`,color:`app-teal`,children:r(`export.chooseFormat`)}),(0,W.jsx)(`p`,{children:r(`export.chooseFormatDesc`)})]})}),(0,W.jsx)(`div`,{className:`export-cards`,children:z.map(e=>(0,W.jsxs)(`button`,{type:`button`,className:`export-card ${l===e.key?`active`:``}`,onClick:()=>{u(e.key),C(e.key)},children:[(0,W.jsx)(`span`,{className:`export-card-icon`,style:{background:`${e.color}15`,color:e.color},children:(0,W.jsx)(e.icon,{size:22})}),(0,W.jsx)(`span`,{className:`export-card-label`,children:e.label}),(0,W.jsx)(`span`,{className:`export-card-desc`,children:e.desc}),(0,W.jsx)(`span`,{className:`export-card-ext`,children:e.ext}),l===e.key&&(0,W.jsx)(`span`,{className:`export-card-check`,children:(0,W.jsx)(T,{size:14})})]},e.key))})]}),(0,W.jsx)(x,{type:`line-teal`}),(0,W.jsxs)(`section`,{className:`panel export-preview-panel`,children:[(0,W.jsxs)(`div`,{className:`export-preview-header`,children:[(0,W.jsxs)(`div`,{className:`export-preview-info`,children:[(0,W.jsx)(`span`,{className:`export-preview-icon`,children:(0,W.jsx)(D,{size:18})}),(0,W.jsxs)(`div`,{children:[(0,W.jsx)(`strong`,{children:B?.label||r(`export.exportContent`)}),(0,W.jsx)(`span`,{className:`export-preview-meta`,children:G>0?r(`export.charsLines`,{chars:G.toLocaleString(),lines:K}):r(`export.clickToGen`)})]})]}),(0,W.jsxs)(`div`,{className:`export-preview-actions`,children:[(0,W.jsx)(y,{type:`default`,onClick:N,disabled:!p,icon:(0,W.jsx)(E,{size:15}),children:r(g?`export.copyDone`:`export.copy`)}),(0,W.jsx)(y,{type:`primary`,onClick:L,disabled:!p,icon:(0,W.jsx)(m,{size:15}),children:r(`export.download`)})]})]}),(0,W.jsx)(`textarea`,{className:`export-preview-textarea`,value:p,onChange:e=>h(e.target.value),placeholder:r(`export.outputPlaceholder`),readOnly:!i})]}),(0,W.jsxs)(`section`,{className:`panel import-panel`,children:[(0,W.jsxs)(`div`,{className:`import-header`,children:[(0,W.jsx)(`span`,{className:`import-icon`,children:(0,W.jsx)(e,{size:22})}),(0,W.jsxs)(`div`,{children:[(0,W.jsx)(`h2`,{children:r(`export.importBackup`)}),(0,W.jsx)(`p`,{children:r(`export.importDesc`)})]})]}),(0,W.jsxs)(`div`,{className:`import-body`,children:[(0,W.jsxs)(`div`,{className:`import-upload-zone`,children:[(0,W.jsx)(j,{size:32}),(0,W.jsx)(`span`,{children:r(`export.dropHint`)}),(0,W.jsx)(`input`,{ref:b,type:`file`,accept:`.json`,style:{display:`none`},onChange:R}),(0,W.jsx)(y,{type:`default`,onClick:()=>b.current?.click(),children:r(`export.chooseFile`)})]}),(0,W.jsxs)(`div`,{className:`import-warning`,children:[(0,W.jsx)(e,{size:14}),(0,W.jsx)(`span`,{children:r(`export.irreversible`)})]})]})]})]})}export{G as ExportPage};