/* ============================================================
   QAD Skill Intelligence — shared lib: i18n, compute, primitives
   ============================================================ */
const DATA = window.QAD_DATA;
const { skills: SKILLS, employees: EMPLOYEES, actuals: ACTUALS, positions: POSITIONS, derived: DERIVED, guide: GUIDE, training: TRAINING } = DATA;

/* ---------- i18n ---------- */
const STR = {
  appName:      { th:"QAD Skill Intelligence", en:"QAD Skill Intelligence", ja:"QAD スキルマップ" },
  appSub:       { th:"ระบบบริหารทักษะองค์กร", en:"Workforce Skill System", ja:"スキル管理システム" },
  scope:        { th:"ขอบเขต", en:"Scope", ja:"範囲" },
  loggedAs:     { th:"เข้าใช้งานในบทบาท", en:"Acting as", ja:"ロール" },
  search:       { th:"ค้นหาคน / ทักษะ…", en:"Search people / skills…", ja:"検索…" },
  // roles
  exec:  { th:"ผู้บริหาร", en:"Executive", ja:"経営層" },
  hr:    { th:"ฝ่ายบุคคล", en:"HR", ja:"人事" },
  manager:{ th:"ผู้จัดการ", en:"Manager", ja:"マネージャー" },
  leader:{ th:"หัวหน้าทีม", en:"Team Leader", ja:"リーダー" },
  employee:{ th:"พนักงาน", en:"Employee", ja:"社員" },
  // nav groups
  navOverview:{ th:"ภาพรวม", en:"Overview", ja:"概要" },
  navAnalyze: { th:"วิเคราะห์", en:"Analytics", ja:"分析" },
  navPlan:    { th:"พัฒนา", en:"Develop", ja:"育成" },
  navManage:  { th:"จัดการ", en:"Administer", ja:"管理" },
  // nav items
  nDash:    { th:"แดชบอร์ด", en:"Dashboard", ja:"ダッシュボード" },
  nHeatmap: { th:"Skill Heatmap", en:"Skill Heatmap", ja:"スキルマップ" },
  nReady:   { th:"Readiness ตามตำแหน่ง", en:"Position Readiness", ja:"ポジション充足度" },
  nTrends:  { th:"แนวโน้มรายไตรมาส", en:"Quarterly Trends", ja:"四半期推移" },
  nSkills:  { th:"คลังทักษะ", en:"Skills Library", ja:"スキル一覧" },
  nRisk:    { th:"จุดเสี่ยง & Critical Gap", en:"Risk & Critical Gaps", ja:"リスク・重大ギャップ" },
  nTrain:   { th:"แผนอบรม", en:"Training Plan", ja:"研修計画" },
  nPeople:  { th:"พนักงาน", en:"People", ja:"社員一覧" },
  nMe:      { th:"โปรไฟล์ของฉัน", en:"My Profile", ja:"マイプロフィール" },
  nAssess:  { th:"แบบประเมิน", en:"Assessments", ja:"評価" },
  nAdmin:   { th:"ตั้งค่า & Master Data", en:"Admin & Master Data", ja:"管理・マスタ" },
  // common
  readiness:{ th:"ความพร้อม", en:"Readiness", ja:"充足度" },
  required: { th:"มาตรฐาน", en:"Required", ja:"必要" },
  actual:   { th:"ปัจจุบัน", en:"Actual", ja:"現在" },
  gap:      { th:"Gap", en:"Gap", ja:"ギャップ" },
  skill:    { th:"ทักษะ", en:"Skill", ja:"スキル" },
  category: { th:"หมวด", en:"Category", ja:"カテゴリ" },
  position: { th:"ตำแหน่ง", en:"Position", ja:"役職" },
  department:{ th:"แผนก", en:"Department", ja:"部署" },
  status:   { th:"สถานะ", en:"Status", ja:"状態" },
  name:     { th:"ชื่อ", en:"Name", ja:"氏名" },
  action:   { th:"จัดการ", en:"Action", ja:"操作" },
  viewDetail:{ th:"ดูรายละเอียด", en:"View detail", ja:"詳細" },
  people:   { th:"คน", en:"people", ja:"名" },
  ofTotal:  { th:"จากทั้งหมด", en:"of", ja:"／" },
  // status words
  sReady:   { th:"พร้อม", en:"Ready", ja:"充足" },
  sDevel:   { th:"กำลังพัฒนา", en:"Developing", ja:"育成中" },
  sSupport: { th:"ต้องสนับสนุน", en:"Needs support", ja:"要支援" },
  sPending: { th:"ยังไม่ประเมิน", en:"Not assessed", ja:"未評価" },
  sCritical:{ th:"วิกฤต", en:"Critical", ja:"重大" },
  sMinor:   { th:"เล็กน้อย", en:"Minor", ja:"軽微" },
  sMet:     { th:"ผ่าน", en:"Met", ja:"達成" },
  // KPI
  kEmployees:{ th:"พนักงานในขอบเขต", en:"Employees in scope", ja:"対象社員" },
  kReadiness:{ th:"Readiness เฉลี่ย", en:"Avg. readiness", ja:"平均充足度" },
  kCritical: { th:"จุดเสี่ยงวิกฤต", en:"Critical risk skills", ja:"重大リスク" },
  kPending:  { th:"รอประเมิน", en:"Awaiting assessment", ja:"未評価" },
  kTraining: { th:"หัวข้ออบรมที่ควรจัด", en:"Training topics queued", ja:"研修候補" },
  // workflow
  wSelf:   { th:"ประเมินตนเอง", en:"Self-assessment", ja:"自己評価" },
  wManager:{ th:"หัวหน้าทบทวน", en:"Manager review", ja:"上長レビュー" },
  wHR:     { th:"HR อนุมัติ", en:"HR approval", ja:"人事承認" },
  wDone:   { th:"เสร็จสมบูรณ์", en:"Finalized", ja:"確定" },
  submit:  { th:"ส่งประเมิน", en:"Submit", ja:"提出" },
  saveDraft:{ th:"บันทึกร่าง", en:"Save draft", ja:"下書き保存" },
  approve: { th:"อนุมัติ", en:"Approve", ja:"承認" },
  // career
  career:  { th:"เส้นทางอาชีพ", en:"Career path", ja:"キャリアパス" },
  nextRole:{ th:"ตำแหน่งถัดไป", en:"Next role", ja:"次の役職" },
  toPromote:{ th:"ทักษะที่ต้องเติมเพื่อเลื่อนขั้น", en:"Skills to close for promotion", ja:"昇格に必要なスキル" },
  // misc
  topGaps: { th:"Gap สูงสุด", en:"Top gaps", ja:"主要ギャップ" },
  strengths:{ th:"จุดแข็ง", en:"Strengths", ja:"強み" },
  recommend:{ th:"ข้อเสนอแนะ", en:"Recommended actions", ja:"推奨アクション" },
  coverage:{ th:"ความครอบคลุม", en:"Coverage", ja:"カバレッジ" },
  experts: { th:"ผู้เชี่ยวชาญ", en:"Experts", ja:"熟練者" },
  candidates:{ th:"ผู้เข้าเป้าหมาย", en:"Target attendees", ja:"対象者" },
  byFunction:{ th:"แยกตามสายงาน", en:"By function", ja:"機能別" },
  trainingHist:{ th:"ประวัติการอบรม", en:"Training history", ja:"研修履歴" },
  noData:  { th:"ไม่มีข้อมูล", en:"No data", ja:"データなし" },
  assessed:{ th:"ประเมินแล้ว", en:"Assessed", ja:"評価済" },
  edit:    { th:"แก้ไข", en:"Edit", ja:"編集" },
  del:     { th:"ลบ", en:"Delete", ja:"削除" },
  exportCsv:{ th:"Export CSV", en:"Export CSV", ja:"CSV出力" },
  printPdf:{ th:"Print / PDF", en:"Print / PDF", ja:"印刷 / PDF" },
  // data source / save
  dataSource:{ th:"แหล่งข้อมูล", en:"Data source", ja:"データソース" },
  saveToExcel:{ th:"บันทึกลง Excel", en:"Save to Excel", ja:"Excelに保存" },
  saved:    { th:"บันทึกแล้ว", en:"Saved", ja:"保存済" },
  unsaved:  { th:"มีการแก้ไขที่ยังไม่บันทึก", en:"Unsaved changes", ja:"未保存の変更" },
  changeFile:{ th:"เปลี่ยนไฟล์", en:"Change file", ja:"ファイル変更" },
  importTitle:{ th:"เชื่อมต่อไฟล์ข้อมูล", en:"Connect a data file", ja:"データファイルを接続" },
  importDesc:{ th:"แอพนี้ไม่เก็บข้อมูลไว้ในตัว — ข้อมูลทั้งหมดอยู่ในไฟล์ Excel ของคุณ เลือกไฟล์ฐานข้อมูล Skill Map (.xlsx) เพื่อเริ่มใช้งาน การแก้ไขทุกอย่างจะบันทึกกลับลงไฟล์เดิมได้", en:"This app stores no data itself — everything lives in your Excel file. Pick a Skill Map database (.xlsx) to begin. Edits save back to the same file.", ja:"" },
  chooseFile:{ th:"เลือกไฟล์ Excel", en:"Choose Excel file", ja:"Excelファイルを選択" },
  useSample:{ th:"ใช้ไฟล์ตัวอย่าง QAD", en:"Use QAD sample file", ja:"QADサンプルを使用" },
  loading:  { th:"กำลังโหลดข้อมูล…", en:"Loading…", ja:"読み込み中…" },
};
const LangCtx = React.createContext("th");
function tr(key, lang){ const e = STR[key]; if(!e) return key; return e[lang] || e.en || key; }
function useT(){ const lang = React.useContext(LangCtx); return React.useCallback((k)=>tr(k,lang),[lang]); }

/* ---------- compute helpers ---------- */
const SUB_META = {
  QAD:{ label:"QAD Management", color:"oklch(0.46 0.105 256)" },
  QA: { label:"Quality Assurance", color:"oklch(0.50 0.10 200)" },
  SQA:{ label:"Supplier QA", color:"oklch(0.52 0.09 145)" },
  QC: { label:"Quality Control", color:"oklch(0.55 0.11 60)" },
  TQM:{ label:"Total Quality Mgmt", color:"oklch(0.50 0.10 300)" },
  PQC:{ label:"Process QC", color:"oklch(0.55 0.13 30)" },
  // Production dept subfunctions
  ASSY:{ label:"Assembly", color:"oklch(0.50 0.10 256)" },
  MCH:{ label:"Machining", color:"oklch(0.52 0.10 200)" },
  SET:{ label:"Setup / Tooling", color:"oklch(0.55 0.11 60)" },
  INSP:{ label:"In-line Inspection", color:"oklch(0.52 0.09 145)" },
  MAT:{ label:"Material & Logistics", color:"oklch(0.50 0.10 300)" },
  PDM:{ label:"PD Management", color:"oklch(0.55 0.13 30)" },
  Other:{ label:"Other", color:"oklch(0.55 0.01 262)" },
};
function subOf(pos){
  if(!pos) return "Other";
  const known = ["QAD","SQA","QA","QC","TQM","PQC","ASSY","MCH","SET","INSP","MAT","PDM"];
  // PD positions like "PD Asst. Manager" / "PD Manager" -> PDM
  if(/^PD\s/.test(pos)) return "PDM";
  for(const k of known){ if(pos.startsWith(k)) return k; }
  return "Other";
}
function ladderFor(pos){
  const sub = subOf(pos);
  return (DERIVED.ladders[sub]||[]).slice();
}
function nextPosition(pos){
  const l = ladderFor(pos);
  const i = l.indexOf(pos);
  if(i<0 || i>=l.length-1) return null;
  return l[i+1];
}
// skill rows for an employee given a position (needs>0)
function skillRows(empName, position){
  const acts = ACTUALS[empName] || {};
  const rows = [];
  for(const sk of SKILLS){
    const need = sk.needs[position] || 0;
    if(need<=0) continue;
    const act = acts[sk.id] || 0;
    rows.push({ id:sk.id, name:sk.name, category:sk.category, type:sk.type, skillType:sk.skillType, need, act, gap: need-act });
  }
  return rows;
}
function isAssessed(empName){
  const acts = ACTUALS[empName] || {};
  let n=0; for(const k in acts){ if(acts[k]>0) n++; }
  return n >= 5;
}
function readinessOf(empName, position){
  const rows = skillRows(empName, position);
  let met=0, req=0, crit=0, minor=0;
  for(const r of rows){ req += r.need; met += Math.min(r.act, r.need); if(r.gap>=3) crit++; else if(r.gap>=1) minor++; }
  const pct = req>0 ? Math.round(met/req*100) : 0;
  rows.sort((a,b)=> b.gap-a.gap || b.need-a.need);
  return { pct, rows, crit, minor, gapCount: crit+minor, topGaps: rows.filter(r=>r.gap>0).slice(0,5),
           strengths: rows.filter(r=>r.act>=r.need && r.act>=6).sort((a,b)=>b.act-a.act).slice(0,4) };
}
function statusOf(empName, position){
  if(!isAssessed(empName)) return "pending";
  const { pct } = readinessOf(empName, position);
  if(pct>=80) return "ready";
  if(pct>=60) return "develop";
  return "support";
}
const STATUS_META = {
  ready:  { key:"sReady",   cls:"b-ready", dot:"dot-ready" },
  develop:{ key:"sDevel",   cls:"b-mid",   dot:"dot-mid" },
  support:{ key:"sSupport", cls:"b-crit",  dot:"dot-crit" },
  pending:{ key:"sPending", cls:"b-neutral",dot:"dot-neutral" },
};
// gap → heatmap color
function gapColor(need, act){
  if(need<=0) return "var(--paper-2)";
  const g = need - act;
  if(g<=0)  return "oklch(0.62 0.085 158)";      // met — green
  if(g===1) return "oklch(0.80 0.07 150)";       // close
  if(g===2) return "oklch(0.86 0.075 95)";       // minor
  if(g===3) return "oklch(0.78 0.11 70)";        // moderate
  if(g===4) return "oklch(0.68 0.14 45)";        // sizeable
  return "oklch(0.56 0.16 26)";                  // critical >=5
}
function gapCls(gap){ if(gap<=0) return "ready"; if(gap<=2) return "mid"; return "crit"; }
// category order (recomputable when skills change / dept switches)
const CATEGORIES = [];
function recomputeCategories(){
  const seen = []; SKILLS.forEach(s=>{ if(seen.indexOf(s.category)<0) seen.push(s.category); });
  CATEGORIES.length = 0; seen.forEach(c=>CATEGORIES.push(c));
}
recomputeCategories();
window.recomputeCategories = recomputeCategories;
const SKILLTYPE_META = {
  "Specific standard":{ tag:"IQ" }, "Working operation":{ tag:"IQ" }, "Working Operation":{ tag:"IQ" },
  "General knowledge":{ tag:"IQ" }, "IT/DX":{ tag:"IQ" }, "Mind set/Attitude":{ tag:"EQ" },
};
function initials(name){ return name.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase(); }

/* ---------- quarter history (synthetic, deterministic) ---------- */
const QUARTERS = [
  { key:"Q4-2025", label:"Q4 2025", back:2 },
  { key:"Q1-2026", label:"Q1 2026", back:1 },
  { key:"Q2-2026", label:"Q2 2026", back:0 },
];
function hashStr(s){ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619);} return (h>>>0); }
// actual score for an employee/skill `back` quarters ago (0 = current).
// older quarters trend lower so progress reads upward toward today.
function actualAt(name, id, back){
  const cur = (ACTUALS[name]||{})[id]||0;
  if(back<=0 || cur===0) return cur;
  const h = hashStr(name+"_"+id);
  let v = cur;
  for(let q=1;q<=back;q++){ v -= ((h>>(q*3)) % 3); }   // subtract 0/1/2 each step back
  return Math.max(0, v);
}
function readinessAt(name, position, back){
  let met=0, req=0;
  for(const sk of SKILLS){
    const need = sk.needs[position]||0; if(need<=0) continue;
    req += need; met += Math.min(actualAt(name, sk.id, back), need);
  }
  return req>0 ? Math.round(met/req*100) : 0;
}

/* ---------- CSV export ---------- */
function exportCSV(filename, headers, rows){
  const esc = (v)=>{ v = v==null ? "" : String(v); return /[",\n]/.test(v) ? '"'+v.replace(/"/g,'""')+'"' : v; };
  const lines = [headers.map(esc).join(",")].concat(rows.map(r=>r.map(esc).join(",")));
  const blob = new Blob(["\uFEFF"+lines.join("\n")], { type:"text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download=filename; document.body.appendChild(a); a.click();
  setTimeout(()=>{ document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
}

// employees in scope (currently all are QAD) with derived
function employeesFull(){
  return EMPLOYEES.map(e=>{
    const sub = subOf(e.position);
    const st = statusOf(e.name, e.position);
    const r = readinessOf(e.name, e.position);
    return { ...e, sub, status:st, readiness:r.pct, crit:r.crit, gapCount:r.gapCount, assessed:isAssessed(e.name) };
  });
}
// skill coverage across a set of employees
function skillCoverage(empList){
  return SKILLS.map(sk=>{
    let needCount=0, metCount=0, expertCount=0, totGap=0, atRisk=[];
    for(const e of empList){
      const need = sk.needs[e.position]||0;
      if(need<=0) continue;
      needCount++;
      const act = (ACTUALS[e.name]||{})[sk.id]||0;
      if(act>=need) metCount++;
      if(act>=8) expertCount++;
      const g = need-act; if(g>0){ totGap+=g; }
      if(act>=Math.max(need,8) || act>=8) {/* expert */}
    }
    return { id:sk.id, name:sk.name, category:sk.category, skillType:sk.skillType, type:sk.type,
             needCount, metCount, expertCount, totGap,
             coverage: needCount>0 ? Math.round(metCount/needCount*100) : null };
  });
}

/* ---------- icons ---------- */
const IC = {
  dash:'M3 3h7v7H3zM14 3h7v4h-7zM14 10h7v11h-7zM3 14h7v7H3z',
  heatmap:'M3 3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18',
  ready:'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3',
  risk:'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  train:'M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c0 1 2.5 3 6 3s6-2 6-3v-5',
  people:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  me:'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  assess:'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
  admin:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z',
  search:'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
  chev:'M9 18l6-6-6-6',
  chevD:'M6 9l6 6 6-6',
  arrow:'M5 12h14M12 5l7 7-7 7',
  export:'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  plus:'M12 5v14M5 12h14',
  trend:'M23 6l-9.5 9.5-5-5L1 18',
  library:'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5zM8 7h8M8 11h5',
};
function Icon({ name, size=17, sw=1.6, style }){
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style} className="nav-ic-svg">
      <path d={IC[name]||""} />
    </svg>
  );
}

/* ---------- primitives ---------- */
function StatusBadge({ status }){
  const t = useT(); const m = STATUS_META[status];
  return <span className={"badge "+m.cls}><i className={"dot "+m.dot}></i>{t(m.key)}</span>;
}
function GapBadge({ gap }){
  const t = useT();
  if(gap<=0) return <span className="badge b-ready">{t("sMet")}</span>;
  const cls = gap<=2 ? "b-mid" : "b-crit";
  return <span className={"badge "+cls}>−{gap}</span>;
}
function Avatar({ name, sub, size=34 }){
  const color = sub ? SUB_META[sub]?.color : "var(--accent)";
  return <div style={{width:size,height:size,flex:`0 0 ${size}px`,borderRadius:5,background:color,color:"#fff",
    display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--mono)",fontWeight:600,
    fontSize:size*0.36}}>{initials(name)}</div>;
}
// 0-10 scale bar with required marker
function ScaleBar({ act, need, max=10, w=110, h=7 }){
  const pct = Math.max(0,Math.min(1, act/max));
  const reqPct = Math.max(0,Math.min(1, need/max));
  const g = need-act;
  const col = g<=0 ? "var(--ready)" : g<=2 ? "var(--mid)" : "var(--crit)";
  return (
    <div className="bar-track" style={{width:w}}>
      <div className="bar" style={{height:h}}>
        <i style={{width:(pct*100)+"%",background:col}}></i>
      </div>
      {need>0 && <span className="bar-req" style={{left:`calc(${reqPct*100}% - 1px)`}} title={"Required "+need}></span>}
    </div>
  );
}
function Donut({ pct, size=58, sw=7, color="var(--accent)" }){
  const r=(size-sw)/2, c=2*Math.PI*r, off=c*(1-pct/100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--paper-2)" strokeWidth={sw}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" style={{transition:"stroke-dashoffset .6s ease"}}/>
    </svg>
  );
}
function readinessColor(pct){
  if(pct>=80) return "var(--ready)";
  if(pct>=60) return "var(--mid)";
  if(pct>=40) return "oklch(0.62 0.14 45)";
  return "var(--crit)";
}

Object.assign(window, {
  DATA, SKILLS, EMPLOYEES, ACTUALS, POSITIONS, DERIVED, GUIDE, TRAINING,
  STR, LangCtx, tr, useT,
  subOf, SUB_META, ladderFor, nextPosition, skillRows, isAssessed, readinessOf, statusOf,
  STATUS_META, gapColor, gapCls, CATEGORIES, SKILLTYPE_META, initials, employeesFull,
  skillCoverage, IC, Icon, StatusBadge, GapBadge, Avatar, ScaleBar, Donut, readinessColor,
  recomputeCategories, QUARTERS, actualAt, readinessAt, exportCSV, hashStr,
});
