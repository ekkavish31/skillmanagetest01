/* ============================================================
   views2: Training, People + Detail + Career, Assessment, Admin
   ============================================================ */
const { useT:useT2, employeesFull:empFull2, skillCoverage:skillCov2, readinessOf:readinessOf2,
        SKILLS:SK2, EMPLOYEES:EMP2, ACTUALS:ACT2, POSITIONS:POS2, DERIVED:DER2, GUIDE:GUIDE2, TRAINING:TRAIN2,
        SUB_META:SUBM2, CATEGORIES:CATS2, Icon:Icon2, Avatar:Av2, StatusBadge:SB2, GapBadge:GB2, ScaleBar:Scale2,
        Donut:Donut2, readinessColor:rcol2, gapCls:gcls2, subOf:subOf2, ladderFor:ladder2, nextPosition:nextPos2,
        statusOf:statusOf2, isAssessed:isAssessed2, PageHead:PH } = window;

/* ====================== TRAINING PLAN ====================== */
function Training({ canAdd, onAddCourse, onDeleteRecord }){
  const t = useT2();
  const cov = skillCov2(EMP2);
  // build topics with cohort
  const topics = SK2.map(sk=>{
    let cands=[]; for(const e of EMP2){ const need=sk.needs[e.position]||0; if(need<=0)continue; const act=(ACT2[e.name]||{})[sk.id]||0; const g=need-act; if(g>=2) cands.push({name:e.name,sub:subOf2(e.position),gap:g}); }
    const c = cov.find(x=>x.id===sk.id);
    return { id:sk.id, name:sk.name, category:sk.category, skillType:sk.skillType, n:cands.length, cands,
             expert:c?c.expertCount:0, avgGap: cands.length? (cands.reduce((a,b)=>a+b.gap,0)/cands.length):0 };
  }).filter(s=>s.n>=2).sort((a,b)=> b.n-a.n || b.avgGap-a.avgGap);

  const [sel, setSel] = React.useState(topics[0]?.id);
  const selTopic = topics.find(s=>s.id===sel) || topics[0];
  const totalSeats = topics.reduce((a,b)=>a+b.n,0);
  function exportPlan(){
    window.exportCSV("training_plan_"+window.Store.current()+".csv",
      ["Priority","Skill","Category","Target attendees","Internal experts","Avg gap"],
      topics.map((s,i)=>[i+1, s.name, s.category, s.n, s.expert, s.avgGap.toFixed(1)]));
  }

  return (
    <div className="page">
      <PH num="03 â DEVELOP" title={t("nTrain")} sub="à¹à¸à¸à¸à¸±à¸à¸à¸²à¸à¸±à¸à¸©à¸° Q3 / 2026 â à¸«à¸±à¸§à¸à¹à¸­à¸à¸µà¹à¸à¸§à¸£à¸à¸±à¸ à¹à¸£à¸µà¸¢à¸à¸à¸²à¸¡à¸à¸³à¸à¸§à¸à¸à¸¹à¹à¹à¸à¹à¸²à¹à¸à¹à¸²à¸«à¸¡à¸²à¸¢à¹à¸¥à¸°à¸à¸§à¸²à¸¡à¹à¸£à¹à¸à¸à¹à¸§à¸">
        {canAdd && <button className="btn btn-primary btn-sm" onClick={onAddCourse}><Icon2 name="plus" size={14}/> à¸à¸±à¸à¸à¸¶à¸à¸à¸­à¸£à¹à¸ª</button>}
        <button className="btn btn-ghost btn-sm" onClick={exportPlan}><Icon2 name="export" size={15}/> Export plan</button>
      </PH>

      <div className="grid" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        <div className="card kpi"><div className="kpi-accent" style={{background:"var(--accent)"}}></div><div className="kpi-label">à¸«à¸±à¸§à¸à¹à¸­à¹à¸à¸°à¸à¸³</div><div className="kpi-val tnum">{topics.length}</div><div className="kpi-sub">gap â¥ 2</div></div>
        <div className="card kpi"><div className="kpi-accent" style={{background:"var(--mid)"}}></div><div className="kpi-label">à¸à¸µà¹à¸à¸±à¹à¸à¸£à¸§à¸¡</div><div className="kpi-val tnum">{totalSeats}</div><div className="kpi-sub">person-topics</div></div>
        <div className="card kpi"><div className="kpi-accent" style={{background:"var(--ready)"}}></div><div className="kpi-label">à¸¡à¸µ trainer à¸ à¸²à¸¢à¹à¸</div><div className="kpi-val tnum">{topics.filter(s=>s.expert>0).length}</div><div className="kpi-sub">à¸à¸²à¸ {topics.length} à¸«à¸±à¸§à¸à¹à¸­</div></div>
        <div className="card kpi"><div className="kpi-accent" style={{background:"var(--crit)"}}></div><div className="kpi-label">à¸à¹à¸­à¸à¸«à¸²à¸ à¸²à¸¢à¸à¸­à¸</div><div className="kpi-val tnum">{topics.filter(s=>s.expert===0).length}</div><div className="kpi-sub">à¹à¸¡à¹à¸¡à¸µà¸à¸¹à¹à¹à¸à¸µà¹à¸¢à¸§à¸à¸²à¸à¹à¸ QAD</div></div>
      </div>

      <div className="grid mt16" style={{gridTemplateColumns:"1.4fr 1fr"}}>
        <div className="card">
          <div className="card-head"><div><h3 className="card-h">à¸«à¸±à¸§à¸à¹à¸­à¸­à¸à¸£à¸¡à¸à¸±à¸à¸¥à¸³à¸à¸±à¸à¸à¸§à¸²à¸¡à¸ªà¸³à¸à¸±à¸</h3><div className="card-h-sub">à¸à¸¥à¸´à¸à¸«à¸±à¸§à¸à¹à¸­à¹à¸à¸·à¹à¸­à¸à¸¹à¸à¸¹à¹à¹à¸à¹à¸²à¹à¸à¹à¸²à¸«à¸¡à¸²à¸¢</div></div></div>
          <table>
            <thead><tr><th style={{width:28}}>#</th><th>{t("skill")}</th><th>{t("category")}</th><th className="th-num">{t("candidates")}</th><th>Trainer</th></tr></thead>
            <tbody>
              {topics.slice(0,14).map((s,i)=>(
                <tr key={s.id} className="clickable" onClick={()=>setSel(s.id)} style={s.id===sel?{background:"var(--accent-soft)"}:null}>
                  <td className="mono" style={{color:"var(--ink-4)"}}>{String(i+1).padStart(2,"0")}</td>
                  <td><b style={{fontWeight:500}}>{s.name}</b></td>
                  <td className="muted" style={{fontSize:12}}>{s.category}</td>
                  <td className="td-num"><span className="badge b-accent">{s.n}</span></td>
                  <td>{s.expert>0 ? <span className="badge b-ready">{s.expert} internal</span> : <span className="badge b-crit">external</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card" style={{alignSelf:"flex-start"}}>
          <div className="card-head"><div><h3 className="card-h">à¸à¸¹à¹à¹à¸à¹à¸²à¹à¸à¹à¸²à¸«à¸¡à¸²à¸¢</h3><div className="card-h-sub">{selTopic?.name}</div></div>
            <span className="badge b-accent">{selTopic?.n} {t("people")}</span></div>
          <div className="card-pad" style={{display:"grid",gap:9}}>
            {selTopic?.cands.sort((a,b)=>b.gap-a.gap).map(c=>(
              <div key={c.name} className="flex center between">
                <span className="flex center gap10"><Av2 name={c.name} sub={c.sub} size={26}/><span style={{fontSize:13}}>{c.name}</span></span>
                <span className="badge b-crit">â{c.gap}</span>
              </div>
            ))}
            {selTopic?.expert>0
              ? <div className="mt8" style={{padding:"10px 12px",background:"var(--ready-soft)",borderRadius:6,fontSize:12.5,color:"oklch(0.4 0.08 158)"}}><Icon2 name="ready" size={13}/> à¸¡à¸µà¸à¸¹à¹à¹à¸à¸µà¹à¸¢à¸§à¸à¸²à¸à¸ à¸²à¸¢à¹à¸ {selTopic.expert} à¸à¸ â à¸à¸±à¸ in-house à¹à¸à¹</div>
              : <div className="mt8" style={{padding:"10px 12px",background:"var(--crit-soft)",borderRadius:6,fontSize:12.5,color:"var(--crit)"}}><Icon2 name="risk" size={13}/> à¹à¸¡à¹à¸¡à¸µà¸à¸¹à¹à¹à¸à¸µà¹à¸¢à¸§à¸à¸²à¸à¸ à¸²à¸¢à¹à¸ â à¸à¸§à¸£à¸à¸±à¸à¸­à¸à¸£à¸¡à¸ à¸²à¸¢à¸à¸­à¸</div>}
          </div>
        </div>
      </div>

      <div className="card mt16">
        <div className="card-head"><div><h3 className="card-h">{t("trainingHist")}</h3><div className="card-h-sub">à¸à¸±à¸à¸à¸¶à¸à¸à¸¥à¸­à¸à¸£à¸¡à¸à¸µà¹à¸à¹à¸²à¸à¸¡à¸² Â· à¸£à¸°à¸à¸±à¸à¸à¹à¸­à¸ â à¸«à¸¥à¸±à¸</div></div></div>
        <table>
          <thead><tr><th>Date</th><th>Trainee</th><th>{t("skill")}</th><th className="th-num">Before</th><th className="th-num">After</th><th>Trainer</th>{canAdd && <th style={{width:40}}></th>}</tr></thead>
          <tbody>
            {TRAIN2.map((r,i)=>(
              <tr key={i}>
                <td className="mono" style={{fontSize:12,color:"var(--ink-3)"}}>{r.date}</td>
                <td><b style={{fontWeight:500}}>{r.trainee}</b></td>
                <td style={{fontSize:12.5}}>{r.item}</td>
                <td className="td-num" style={{color:"var(--ink-3)"}}>{r.before}</td>
                <td className="td-num"><span className="flex center gap6" style={{justifyContent:"flex-end"}}><Icon2 name="trend" size={12} style={{color:"var(--ready)"}}/><b style={{color:"var(--ready)"}}>{r.after}</b></span></td>
                <td className="muted" style={{fontSize:12}}>{r.trainer}</td>
                {canAdd && <td>{r._tid!=null && <button className="icon-btn" title={t("del")} onClick={()=>onDeleteRecord(r._tid)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ====================== PEOPLE LIST ====================== */
function People({ openEmp, canAdd, onAddEmployee }){
  const t = useT2();
  const [fn, setFn] = React.useState("All");
  const emps = empFull2();
  const subs = ["All", ...DER2.subfunctions.filter(s=>emps.some(e=>e.sub===s))];
  const list = emps.filter(e=> fn==="All"||e.sub===fn);
  const byFn = {};
  list.forEach(e=>{ (byFn[e.sub]=byFn[e.sub]||[]).push(e); });

  return (
    <div className="page">
      <PH num="03 â DEVELOP" title={t("nPeople")} sub={`à¸à¸¸à¸à¸¥à¸²à¸à¸£ ${emps.length} à¸à¸à¹à¸à¹à¸à¸à¸ QAD Â· à¸à¸¥à¸´à¸à¹à¸à¸·à¹à¸­à¸à¸¹à¹à¸à¸£à¹à¸à¸¥à¹à¹à¸¥à¸°à¹à¸ªà¹à¸à¸à¸²à¸à¸­à¸²à¸à¸µà¸`}>
        <div className="seg">{subs.map(s=><button key={s} className={fn===s?"on":""} onClick={()=>setFn(s)}>{s}</button>)}</div>
        {canAdd && <button className="btn btn-primary btn-sm" onClick={onAddEmployee}><Icon2 name="plus" size={14}/> à¹à¸à¸´à¹à¸¡à¸à¸à¸±à¸à¸à¸²à¸</button>}
      </PH>
      {Object.keys(byFn).map(sub=>(
        <div key={sub} style={{marginBottom:24}}>
          <div className="flex center gap8" style={{marginBottom:12}}>
            <span className="dot" style={{background:SUBM2[sub].color}}></span>
            <span className="eyebrow" style={{color:"var(--ink-2)"}}>{sub} â {SUBM2[sub].label}</span>
            <span className="tagline">Â· {byFn[sub].length} {t("people")}</span>
          </div>
          <div className="grid" style={{gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))"}}>
            {byFn[sub].sort((a,b)=>b.readiness-a.readiness).map(e=>(
              <div key={e.name} className="card card-pad clickable" onClick={()=>openEmp(e.name)} style={{cursor:"pointer",display:"flex",gap:13,alignItems:"center"}}>
                <div style={{position:"relative",flex:"0 0 auto"}}>
                  <Donut2 pct={e.assessed?e.readiness:0} size={50} sw={6} color={rcol2(e.readiness)}/>
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--mono)",fontSize:12,fontWeight:600}}>{e.assessed?e.readiness:"â"}</div>
                </div>
                <div style={{minWidth:0,flex:1}}>
                  <div style={{fontWeight:600,fontSize:13.5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{e.name}</div>
                  <div className="tagline" style={{marginTop:2}}>{e.position}</div>
                  <div className="mt8"><SB2 status={e.status}/></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ====================== EMPLOYEE DETAIL + CAREER ====================== */
function EmployeeDetail({ name, go, back, canEdit, onEdit, onDelete, onDeleteRecord }){
  const t = useT2();
  const emp = EMP2.find(e=>e.name===name) || EMP2[0];
  const sub = subOf2(emp.position);
  const { pct, rows, crit, gapCount, topGaps, strengths } = readinessOf2(emp.name, emp.position);
  const assessed = isAssessed2(emp.name);
  const status = statusOf2(emp.name, emp.position);
  const [tab, setTab] = React.useState("skills");
  // group skill rows by category
  const byCat = {};
  rows.forEach(r=>{ (byCat[r.category]=byCat[r.category]||[]).push(r); });
  // career ladder + selectable target with ACCUMULATED gap
  const ladder = ladder2(emp.position);
  const curIdx = ladder.indexOf(emp.position);
  const next = nextPos2(emp.position);
  const [targetIdx, setTargetIdx] = React.useState(null);
  React.useEffect(()=>{ setTargetIdx(null); }, [emp.name]);
  const effTarget = (targetIdx!=null && targetIdx>curIdx && targetIdx<ladder.length)
      ? targetIdx : (curIdx<ladder.length-1 ? curIdx+1 : curIdx);
  const targetPos = ladder[effTarget];
  const steps = Math.max(0, effTarget - curIdx);
  const stripPrefix = (p)=> p.replace(/^(QAD|SQA|QA|QC|TQM|PQC|ASSY|MCH|SET|INSP|MAT|PD)\s*/,"");
  // accumulate the highest required level for each skill across every step up to the target
  let promo = [], metT = 0, reqT = 0;
  if(steps>0){
    const acts = ACT2[emp.name] || {};
    for(const sk of SK2){
      let maxNeed = 0, fromStep = 0;
      for(let i=curIdx+1; i<=effTarget; i++){
        const nd = sk.needs[ladder[i]]||0;
        if(nd>maxNeed){ maxNeed = nd; fromStep = i-curIdx; }
      }
      if(maxNeed<=0) continue;
      const act = acts[sk.id]||0;
      reqT += maxNeed; metT += Math.min(act, maxNeed);
      if(maxNeed-act>0) promo.push({ id:sk.id, name:sk.name, category:sk.category, need:maxNeed, act, gap:maxNeed-act, step:fromStep });
    }
    promo.sort((a,b)=> b.gap-a.gap || b.need-a.need);
  }
  const targetReadiness = reqT>0 ? Math.round(metT/reqT*100) : 100;
  const totalGapPts = promo.reduce((a,b)=>a+b.gap,0);
  const promoByCat = {};
  promo.forEach(r=>{ (promoByCat[r.category]=promoByCat[r.category]||0); promoByCat[r.category]+=r.gap; });
  const topPromoCats = Object.entries(promoByCat).sort((a,b)=>b[1]-a[1]).slice(0,4);
  const trainHist = TRAIN2.filter(r=>r.trainee===emp.name);
  function exportProfile(){
    window.exportCSV("profile_"+emp.name.replace(/\s+/g,"_")+".csv",
      ["Skill","Category","Required","Actual","Gap"],
      rows.map(r=>[r.name, r.category, r.need, r.act, Math.max(0,r.gap)]));
  }

  return (
    <div className="page">
      <div className="flex center gap10" style={{marginBottom:16}}>
        <button className="btn btn-ghost btn-sm" onClick={back}><Icon2 name="chev" size={14} style={{transform:"rotate(180deg)"}}/> {t("nPeople")}</button>
        <span className="crumb"><b>{emp.name}</b></span>
      </div>

      <div className="grid" style={{gridTemplateColumns:"1.3fr 1fr 1fr"}}>
        {/* profile */}
        <div className="card card-pad">
          <div className="flex center gap14">
            <Av2 name={emp.name} sub={sub} size={56}/>
            <div>
              <div style={{fontSize:19,fontWeight:600,letterSpacing:"-0.01em"}}>{emp.name}</div>
              <div className="muted" style={{fontSize:13,marginTop:2}}>{emp.position}</div>
              <div className="mt8"><SB2 status={status}/></div>
            </div>
          </div>
          <div className="divider mt16"></div>
          <div className="flex between center mt16">
            <span className="muted" style={{fontSize:12.5}}>{t("department")}</span><b style={{fontSize:13}}>{window.Store.deptMeta[window.Store.current()].code} Â· {SUBM2[sub].label}</b>
          </div>
          <div className="flex between center mt12">
            <span className="muted" style={{fontSize:12.5}}>{t("required")} skills</span><b className="mono">{rows.length}</b>
          </div>
          <div className="flex between center mt12">
            <span className="muted" style={{fontSize:12.5}}>Critical gaps</span><b className="mono" style={{color:crit>0?"var(--crit)":"var(--ink)"}}>{crit}</b>
          </div>
        </div>
        {/* readiness */}
        <div className="card card-pad flex center" style={{justifyContent:"center",gap:18}}>
          <div style={{position:"relative"}}>
            <Donut2 pct={assessed?pct:0} size={104} sw={11} color={rcol2(pct)}/>
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <div className="mono tnum" style={{fontSize:26,fontWeight:600}}>{assessed?pct:"â"}<small style={{fontSize:13}}>{assessed?"%":""}</small></div>
              <div className="eyebrow" style={{fontSize:8}}>{t("readiness")}</div>
            </div>
          </div>
          <div style={{display:"grid",gap:9}}>
            <div><div className="eyebrow" style={{fontSize:9}}>Gap</div><div className="mono" style={{fontSize:17,fontWeight:600}}>{gapCount}</div></div>
            <div><div className="eyebrow" style={{fontSize:9}}>Critical</div><div className="mono" style={{fontSize:17,fontWeight:600,color:crit>0?"var(--crit)":"var(--ink)"}}>{crit}</div></div>
          </div>
        </div>
        {/* quick actions */}
        <div className="card card-pad" style={{display:"grid",gap:9,alignContent:"start"}}>
          <div className="eyebrow">Quick actions</div>
          <button className="btn btn-primary" onClick={()=>go("assess")}><Icon2 name="assess" size={15}/> {t("nAssess")}</button>
          <button className="btn btn-ghost" onClick={()=>setTab("career")}><Icon2 name="trend" size={15}/> {t("career")}</button>
          <button className="btn btn-ghost" onClick={exportProfile}><Icon2 name="export" size={15}/> Export profile</button>
          {canEdit && <div className="flex gap8" style={{marginTop:2}}>
            <button className="btn btn-ghost" style={{flex:1}} onClick={onEdit}><Icon2 name="assess" size={14}/> {t("edit")}</button>
            <button className="btn btn-ghost" style={{flex:1,color:"var(--crit)"}} onClick={onDelete}>{t("del")}</button>
          </div>}
        </div>
      </div>

      {/* insight strip */}
      <div className="grid mt16" style={{gridTemplateColumns:"1fr 1fr"}}>
        <div className="card card-pad">
          <div className="eyebrow" style={{color:"var(--ready)"}}>{t("strengths")}</div>
          <div className="mt12" style={{display:"grid",gap:8}}>
            {strengths.length? strengths.map(s=>(
              <div key={s.id} className="flex between center"><span style={{fontSize:13}}>{s.name}</span><span className="badge b-ready">{s.act}/{s.need}</span></div>
            )) : <span className="muted" style={{fontSize:12.5}}>{assessed?"â":t("sPending")}</span>}
          </div>
        </div>
        <div className="card card-pad">
          <div className="eyebrow" style={{color:"var(--crit)"}}>{t("topGaps")}</div>
          <div className="mt12" style={{display:"grid",gap:8}}>
            {topGaps.length? topGaps.map(s=>(
              <div key={s.id} className="flex between center"><span style={{fontSize:13}}>{s.name}</span><span className="badge b-crit">â{s.gap}</span></div>
            )) : <span className="muted" style={{fontSize:12.5}}>{assessed?"à¹à¸¡à¹à¸¡à¸µ gap":t("sPending")}</span>}
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="flex center gap8 mt24" style={{borderBottom:"1px solid var(--line)",paddingBottom:0}}>
        {[["skills",t("skill")+" assessment"],["career",t("career")],["history",t("trainingHist")]].map(([k,lbl])=>(
          <button key={k} onClick={()=>setTab(k)} style={{border:0,background:"transparent",padding:"9px 14px",fontSize:13,fontWeight:tab===k?600:400,
            color:tab===k?"var(--ink)":"var(--ink-3)",borderBottom:tab===k?"2px solid var(--accent)":"2px solid transparent",marginBottom:-1}}>{lbl}</button>
        ))}
      </div>

      {tab==="skills" && (
        <div className="card mt16">
          <table>
            <thead><tr><th>{t("skill")}</th><th style={{width:130}}>0 â 10</th><th className="th-num">{t("required")}</th><th className="th-num">{t("actual")}</th><th>{t("gap")}</th></tr></thead>
            <tbody>
              {Object.keys(byCat).map(c=>[
                <tr key={"h"+c} style={{background:"var(--paper)"}}><td colSpan={5} style={{padding:"6px 14px"}}><span className="eyebrow" style={{color:"var(--accent)"}}>{c}</span></td></tr>,
                ...byCat[c].sort((a,b)=>b.gap-a.gap).map(r=>(
                  <tr key={r.id}>
                    <td style={{fontSize:13}}>{r.name}</td>
                    <td><Scale2 act={r.act} need={r.need} w={110}/></td>
                    <td className="td-num">{r.need}</td>
                    <td className="td-num"><b>{r.act}</b></td>
                    <td><GB2 gap={r.gap}/></td>
                  </tr>
                ))
              ])}
            </tbody>
          </table>
        </div>
      )}

      {tab==="career" && (
        <div className="mt16">
          <div className="card card-pad">
            <div className="flex between center wrap gap10">
              <div className="eyebrow">{t("career")} Â· {sub} track</div>
              <span className="tagline">à¸à¸¥à¸´à¸à¸à¸³à¹à¸«à¸à¹à¸à¸à¸µà¹à¸ªà¸¹à¸à¸à¸§à¹à¸²à¹à¸à¸·à¹à¸­à¸à¸±à¹à¸à¹à¸à¹à¸²à¸«à¸¡à¸²à¸¢ à¹à¸¥à¹à¸§à¸à¸¹ Gap à¸ªà¸°à¸ªà¸¡à¸à¸µà¹à¸à¹à¸­à¸à¹à¸à¸´à¸¡</span>
            </div>
            <div className="flex center wrap" style={{gap:0,marginTop:18,overflowX:"auto",paddingBottom:8}}>
              {ladder.map((p,i)=>{
                const isCur=i===curIdx, isTarget=i===effTarget, inPath=i>curIdx&&i<=effTarget, clickable=i>curIdx;
                return (
                <React.Fragment key={p}>
                  <div onClick={()=>{ if(clickable) setTargetIdx(i); }}
                    style={{display:"flex",flexDirection:"column",alignItems:"center",gap:7,minWidth:104,cursor:clickable?"pointer":"default"}}>
                    <div style={{width:isCur||isTarget?16:13,height:isCur||isTarget?16:13,borderRadius:"50%",border:"2px solid",
                      borderColor: (i<=curIdx||inPath)?SUBM2[sub].color:"var(--line-2)",
                      background: i<curIdx?SUBM2[sub].color : isCur?"#fff" : isTarget?SUBM2[sub].color : inPath?SUBM2[sub].color+"66":"var(--paper)",
                      boxShadow: (isCur||isTarget)?`0 0 0 4px ${SUBM2[sub].color}33`:"none",transition:".15s"}}></div>
                    <span style={{fontSize:11,textAlign:"center",fontWeight:(isCur||isTarget)?600:400,color:(isCur||isTarget)?"var(--ink)":"var(--ink-3)",lineHeight:1.2}}>{stripPrefix(p)}</span>
                    <div className="flex gap6" style={{height:16}}>
                      {isCur && <span className="badge b-accent" style={{fontSize:9}}>now</span>}
                      {isTarget && steps>0 && <span className="badge b-mid" style={{fontSize:9}}>target</span>}
                    </div>
                  </div>
                  {i<ladder.length-1 && <div style={{height:2,flex:"1 0 24px",background:(i<curIdx||(i>=curIdx&&i<effTarget))?SUBM2[sub].color:"var(--line-2)",marginTop:-30,transition:".15s"}}></div>}
                </React.Fragment>
              );})}
            </div>
          </div>

          {steps>0 ? (
            <>
              {/* accumulated summary */}
              <div className="grid mt16" style={{gridTemplateColumns:"1.1fr 2fr"}}>
                <div className="card card-pad flex center" style={{gap:16}}>
                  <div style={{position:"relative",flex:"0 0 auto"}}>
                    <Donut2 pct={targetReadiness} size={92} sw={10} color={rcol2(targetReadiness)}/>
                    <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                      <div className="mono tnum" style={{fontSize:21,fontWeight:600}}>{targetReadiness}<small style={{fontSize:11}}>%</small></div>
                      <div className="eyebrow" style={{fontSize:7.5}}>à¸à¸£à¹à¸­à¸¡</div>
                    </div>
                  </div>
                  <div style={{minWidth:0}}>
                    <div className="eyebrow">à¹à¸à¹à¸²à¸«à¸¡à¸²à¸¢</div>
                    <div style={{fontSize:15,fontWeight:600,letterSpacing:"-0.01em",lineHeight:1.2,marginTop:3}}>{stripPrefix(targetPos)}</div>
                    <div className="tagline" style={{marginTop:3}}>+{steps} à¸à¸±à¹à¸à¸à¸²à¸à¸à¸±à¸à¸à¸¸à¸à¸±à¸</div>
                  </div>
                </div>
                <div className="card card-pad" style={{display:"flex",alignItems:"center"}}>
                  <div className="grid" style={{gridTemplateColumns:"repeat(3,1fr)",gap:14,width:"100%"}}>
                    <div><div className="eyebrow" style={{fontSize:9}}>à¸à¸±à¸à¸©à¸°à¸à¸µà¹à¸à¹à¸­à¸à¹à¸à¸´à¸¡</div><div className="mono" style={{fontSize:24,fontWeight:600}}>{promo.length}</div></div>
                    <div><div className="eyebrow" style={{fontSize:9}}>Gap à¸ªà¸°à¸ªà¸¡ (à¸à¸¸à¸)</div><div className="mono" style={{fontSize:24,fontWeight:600,color:totalGapPts>0?"var(--crit)":"var(--ink)"}}>{totalGapPts}</div></div>
                    <div><div className="eyebrow" style={{fontSize:9}}>à¹à¸à¹à¸à¸«à¸¡à¸§à¸</div>
                      <div className="flex wrap gap6" style={{marginTop:6}}>
                        {topPromoCats.length? topPromoCats.map(([c,g])=><span key={c} className="badge b-neutral" title={c+" Â· â"+g}>{c.length>16?c.slice(0,15)+"â¦":c}</span>) : <span className="badge b-ready">à¸à¸£à¹à¸­à¸¡ ð¯</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* accumulated gap table */}
              <div className="card mt16">
                <div className="card-head"><div><h3 className="card-h">{t("toPromote")} â Gap à¸ªà¸°à¸ªà¸¡</h3>
                  <div className="card-h-sub">{emp.position} â {targetPos} Â· à¸£à¸°à¸à¸±à¸à¸à¸µà¹à¸à¹à¸­à¸à¸à¸²à¸£à¸à¸·à¸­à¸à¹à¸²à¸ªà¸¹à¸à¸ªà¸¸à¸à¸à¸¥à¸­à¸à¹à¸ªà¹à¸à¸à¸²à¸ {steps} à¸à¸±à¹à¸</div></div>
                  <span className="badge b-mid">{promo.length} skills Â· â{totalGapPts}</span></div>
                {promo.length ? (
                  <table>
                    <thead><tr><th>{t("skill")}</th><th>{t("category")}</th>{steps>1 && <th className="th-num">à¸à¹à¸­à¸à¸à¸²à¸£à¸à¸µà¹à¸à¸±à¹à¸</th>}<th className="th-num">à¸à¹à¸­à¸à¸à¸²à¸£</th><th className="th-num">à¸à¸±à¸à¸à¸¸à¸à¸±à¸</th><th style={{width:120}}>0 â 10</th><th>{t("gap")}</th></tr></thead>
                    <tbody>
                      {promo.slice(0,40).map((r,i)=>(
                        <tr key={i}>
                          <td style={{fontSize:13}}>{r.name}</td>
                          <td className="muted" style={{fontSize:12}}>{r.category}</td>
                          {steps>1 && <td className="td-num"><span className="badge b-neutral">+{r.step}</span></td>}
                          <td className="td-num"><b>{r.need}</b></td>
                          <td className="td-num">{r.act}</td>
                          <td><Scale2 act={r.act} need={r.need} w={104}/></td>
                          <td><GB2 gap={r.gap}/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <div className="card-pad muted" style={{textAlign:"center",padding:24}}>à¸à¹à¸²à¸à¸¡à¸²à¸à¸£à¸à¸²à¸à¸à¸£à¸à¸à¸¸à¸à¸à¸±à¸à¸©à¸°à¸à¸­à¸à¸à¸³à¹à¸«à¸à¹à¸à¹à¸à¹à¸²à¸«à¸¡à¸²à¸¢à¹à¸¥à¹à¸§ ð¯</div>}
              </div>
            </>
          ) : (
            <div className="card mt16 card-pad muted" style={{fontSize:13,textAlign:"center",padding:30}}>à¸à¸³à¹à¸«à¸à¹à¸à¸ªà¸¹à¸à¸ªà¸¸à¸à¹à¸à¸ªà¸²à¸¢à¸à¸²à¸à¹à¸¥à¹à¸§ â à¹à¸¡à¹à¸¡à¸µà¸à¸±à¹à¸à¸à¸±à¸à¹à¸</div>
          )}
        </div>
      )}

      {tab==="history" && (
        <div className="card mt16">
          {trainHist.length ? (
            <table>
              <thead><tr><th>Date</th><th>{t("skill")}</th><th className="th-num">Before</th><th className="th-num">After</th><th>Trainer</th>{canEdit && <th style={{width:40}}></th>}</tr></thead>
              <tbody>{trainHist.map((r,i)=>(
                <tr key={i}><td className="mono" style={{fontSize:12,color:"var(--ink-3)"}}>{r.date}</td><td style={{fontSize:12.5}}>{r.item}</td>
                <td className="td-num" style={{color:"var(--ink-3)"}}>{r.before}</td><td className="td-num"><b style={{color:"var(--ready)"}}>{r.after}</b></td><td className="muted" style={{fontSize:12}}>{r.trainer}</td>
                {canEdit && <td>{r._tid!=null && <button className="icon-btn" title={t("del")} onClick={()=>onDeleteRecord(r._tid)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>}</td>}</tr>
              ))}</tbody>
            </table>
          ) : <div className="card-pad muted" style={{fontSize:13,textAlign:"center",padding:30}}>{t("noData")} â à¸¢à¸±à¸à¹à¸¡à¹à¸¡à¸µà¸à¸£à¸°à¸§à¸±à¸à¸´à¸à¸²à¸£à¸­à¸à¸£à¸¡</div>}
        </div>
      )}
    </div>
  );
}

/* ====================== ASSESSMENT FORM + WORKFLOW ====================== */
function Assessment({ initialName, toast }){
  const t = useT2();
  const [empName, setEmpName] = React.useState(initialName || EMP2[8].name);
  const emp = EMP2.find(e=>e.name===empName) || EMP2[0];
  const baseRows = readinessOf2(emp.name, emp.position).rows;
  const [scores, setScores] = React.useState({});
  const [stage, setStage] = React.useState(0); // 0 self,1 manager,2 hr,3 done
  React.useEffect(()=>{ // reset on employee change
    const init={}; baseRows.forEach(r=>init[r.id]=r.act); setScores(init); setStage(0);
  }, [empName]);
  const [cat, setCat] = React.useState(baseRows[0]?.category || CATS2[0]);
  const cats = [...new Set(baseRows.map(r=>r.category))];
  const rows = baseRows.filter(r=>r.category===cat);

  const stages = [t("wSelf"),t("wManager"),t("wHR"),t("wDone")];
  function advance(){
    if(stage<3){ setStage(stage+1); toast(stage===2 ? t("wDone") : t("submit")+" â"); }
  }
  // overall progress of editing
  const done = baseRows.filter(r=>(scores[r.id]??r.act)>0).length;

  return (
    <div className="page">
      <PH num="04 â ASSESS" title={t("nAssess")} sub="à¹à¸à¸à¸à¸£à¸°à¹à¸¡à¸´à¸à¸à¸±à¸à¸©à¸° â à¸ªà¹à¸à¸¥ 0â10 à¸à¸²à¸¡ Evaluation Guide Â· à¹à¸§à¸´à¸£à¹à¸à¹à¸à¸¥à¸§à¹ Self â Manager â HR">
        <button className="btn btn-ghost btn-sm" onClick={()=>toast(t("saveDraft")+" â")}>{t("saveDraft")}</button>
        <button className="btn btn-primary btn-sm" onClick={advance} disabled={stage>=3}>{stage>=2?t("approve"):t("submit")} <Icon2 name="arrow" size={14}/></button>
      </PH>

      {/* workflow steps */}
      <div className="card card-pad">
        <div className="flex center between wrap gap16">
          <div className="steps">
            {stages.map((s,i)=>(
              <React.Fragment key={s}>
                <div className={"step "+(i<stage?"done":i===stage?"current":"")}>
                  <div className="step-dot">{i<stage?"â":i+1}</div><div className="step-label">{s}</div>
                </div>
                {i<stages.length-1 && <div className="step-bar"></div>}
              </React.Fragment>
            ))}
          </div>
          <div className="flex center gap10">
            <span className="tagline">progress</span>
            <div className="bar" style={{width:120,height:6}}><i style={{width:Math.round(done/baseRows.length*100)+"%",background:"var(--accent)"}}></i></div>
            <span className="mono" style={{fontSize:12}}>{done}/{baseRows.length}</span>
          </div>
        </div>
      </div>

      <div className="grid mt16" style={{gridTemplateColumns:"1fr 3fr"}}>
        <div className="card card-pad" style={{alignSelf:"flex-start"}}>
          <div className="eyebrow">Employee</div>
          <select value={empName} onChange={e=>setEmpName(e.target.value)} style={{width:"100%",marginTop:8,padding:"10px 12px",border:"1px solid var(--line-2)",borderRadius:6,fontFamily:"var(--sans)",fontSize:13,background:"var(--panel)"}}>
            {EMP2.map(e=><option key={e.name} value={e.name}>{e.name}</option>)}
          </select>
          <div className="muted mt8" style={{fontSize:12}}>{emp.position}</div>
          <div className="divider mt16"></div>
          <div className="eyebrow mt16">{t("category")}</div>
          <div className="mt8" style={{display:"grid",gap:3,maxHeight:340,overflowY:"auto"}}>
            {cats.map(c=>(
              <button key={c} onClick={()=>setCat(c)} style={{textAlign:"left",border:0,padding:"7px 9px",borderRadius:5,fontSize:12.5,
                background:c===cat?"var(--accent-soft)":"transparent",color:c===cat?"var(--accent)":"var(--ink-2)",fontWeight:c===cat?600:400}}>
                {c} <span className="mono" style={{float:"right",color:"var(--ink-4)"}}>{baseRows.filter(r=>r.category===c).length}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div><h3 className="card-h">{cat}</h3><div className="card-h-sub">{rows.length} skills Â· {stage===0?t("wSelf"):stage===1?t("wManager"):t("wHR")}</div></div></div>
          <table>
            <thead><tr><th>{t("skill")}</th><th className="th-num">{t("required")}</th><th>{t("actual")} (0â10)</th><th>{t("gap")}</th></tr></thead>
            <tbody>
              {rows.map(r=>{
                const v = scores[r.id]??r.act;
                return (
                  <tr key={r.id}>
                    <td style={{fontSize:13}}>{r.name}</td>
                    <td className="td-num">{r.need}</td>
                    <td>
                      <div className="flex center gap6" style={{flexWrap:"wrap"}}>
                        {Array.from({length:11},(_,i)=>i).map(n=>(
                          <button key={n} onClick={()=>setScores(s=>({...s,[r.id]:n}))}
                            style={{width:25,height:25,borderRadius:4,border:"1px solid",fontSize:11,fontFamily:"var(--mono)",fontWeight:600,
                              borderColor:v===n?"var(--accent)":"var(--line-2)",background:v===n?"var(--accent)":"var(--panel)",color:v===n?"#fff":"var(--ink-3)"}}>{n}</button>
                        ))}
                      </div>
                    </td>
                    <td><GB2 gap={r.need-v}/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ====================== ADMIN ====================== */
function Admin({ onAddSkill, onReset, go, onImport, onSave }){
  const t = useT2();
  const counts = window.Store.counts();
  const curCode = window.Store.current();
  const depts = [
    { code:curCode, name:window.Store.currentName()+" Dept.", emp:counts[curCode].emp, skills:counts[curCode].sk, status:"active" },
    { code:"PD",  name:"Production", emp:0, skills:0, status:"planned" },
    { code:"ENG", name:"Engineering", emp:0, skills:0, status:"planned" },
    { code:"MNT", name:"Maintenance", emp:0, skills:0, status:"planned" },
    { code:"LOG", name:"Logistics & Warehouse", emp:0, skills:0, status:"planned" },
    { code:"HR",  name:"Human Resources", emp:0, skills:0, status:"planned" },
  ];
  const perms = [
    ["Employee","â","à¸à¸à¹à¸­à¸","â","à¸à¹à¸­à¸¡à¸¹à¸¥à¸à¸à¹à¸­à¸"],
    ["Team Leader","â","â","à¸ªà¹à¸","à¸à¸µà¸¡à¸à¸­à¸à¸à¸"],
    ["Manager","â","â","à¸à¸à¸à¸§à¸","à¸à¸±à¹à¸à¹à¸à¸à¸"],
    ["HR","â","â","à¸­à¸à¸¸à¸¡à¸±à¸à¸´","à¸à¸±à¹à¸à¸­à¸à¸à¹à¸à¸£"],
    ["Executive","â","â","â","Dashboard à¹à¸à¹à¸²à¸à¸±à¹à¸"],
  ];
  return (
    <div className="page">
      <PH num="05 â ADMINISTER" title={t("nAdmin")} sub="à¸­à¸­à¸à¹à¸à¸à¹à¸«à¹à¸à¸¢à¸²à¸¢à¹à¸à¹à¸à¸±à¹à¸à¸­à¸à¸à¹à¸à¸£ â à¹à¸à¹à¸¥à¸°à¹à¸à¸à¸à¸¡à¸µà¸à¸¸à¸à¸à¸±à¸à¸©à¸°/à¸à¸³à¹à¸«à¸à¹à¸/à¸¡à¸²à¸à¸£à¸à¸²à¸à¸à¸­à¸à¸à¸±à¸§à¹à¸­à¸"/>
      <div className="card">
        <div className="card-head"><div><h3 className="card-h">{t("department")} â à¸à¸±à¹à¸à¸­à¸à¸à¹à¸à¸£</h3><div className="card-h-sub">à¹à¸à¸´à¹à¸¡à¹à¸à¸à¸à¹à¸«à¸¡à¹à¹à¸¥à¸°à¸à¸³à¹à¸à¹à¸² Skill Map à¹à¸à¹</div></div>
          <button className="btn btn-primary btn-sm"><Icon2 name="plus" size={14}/> à¹à¸à¸´à¹à¸¡à¹à¸à¸à¸</button></div>
        <table>
          <thead><tr><th>Code</th><th>{t("department")}</th><th className="th-num">à¸à¸à¸±à¸à¸à¸²à¸</th><th className="th-num">à¸à¸±à¸à¸©à¸°</th><th>{t("status")}</th></tr></thead>
          <tbody>
            {depts.map(d=>(
              <tr key={d.code} className={d.status==="active"?"clickable":""}>
                <td><span className="badge b-neutral mono">{d.code}</span></td>
                <td><b style={{fontWeight:500}}>{d.name}</b></td>
                <td className="td-num">{d.emp||"â"}</td>
                <td className="td-num">{d.skills||"â"}</td>
                <td>{d.status==="active"?<span className="badge b-ready">active</span>:<span className="badge b-neutral">planned</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid mt16" style={{gridTemplateColumns:"1fr 1fr"}}>
        <div className="card">
          <div className="card-head"><h3 className="card-h">à¸ªà¸´à¸à¸à¸´à¹à¸à¸²à¸£à¹à¸à¹à¸²à¸à¸¶à¸ (RBAC)</h3></div>
          <table>
            <thead><tr><th>Role</th><th>View</th><th>Edit</th><th>Approve</th><th>Scope</th></tr></thead>
            <tbody>{perms.map(p=>(<tr key={p[0]}><td><b style={{fontWeight:500}}>{p[0]}</b></td>{p.slice(1).map((c,i)=><td key={i} style={{fontSize:12.5,color:c==="â"?"var(--ink-4)":"var(--ink-2)"}}>{c}</td>)}</tr>))}</tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-head"><h3 className="card-h">Master data & automation</h3>
            <button className="btn btn-primary btn-sm" onClick={onAddSkill}><Icon2 name="plus" size={14}/> à¹à¸à¸´à¹à¸¡à¸à¸±à¸à¸©à¸°</button></div>
          <div className="card-pad" style={{display:"grid",gap:10}}>
            {[["Positions",POS2.length+" à¸à¸³à¹à¸«à¸à¹à¸",null],["Skills library",SK2.length+" à¸à¸±à¸à¸©à¸° Â· "+CATS2.length+" à¸«à¸¡à¸§à¸","skills"],["Evaluation Guide","à¸ªà¹à¸à¸¥ 0â10 Â· TH/JP",null],["à¸à¸³à¹à¸à¹à¸² / à¹à¸à¸¥à¸µà¹à¸¢à¸à¹à¸à¸¥à¹ Excel","à¹à¸«à¸¥à¸ Skill Map (.xlsx) à¹à¸«à¸¡à¹","import"]].map(([a,b,act])=>(
              <div key={a} className="flex between center" style={{padding:"11px 13px",background:"var(--panel-2)",borderRadius:6,border:"1px solid var(--line)",cursor:act?"pointer":"default"}} onClick={act==="skills"&&go?()=>go("skills"):act==="import"&&onImport?onImport:undefined}>
                <div><div style={{fontSize:13,fontWeight:500}}>{a}</div><div className="tagline">{b}</div></div>
                <Icon2 name="chev" size={15} style={{color:"var(--ink-4)"}}/>
              </div>
            ))}
            <div className="flex between center" style={{padding:"11px 13px",background:"var(--panel-2)",borderRadius:6,border:"1px solid var(--line)"}}>
              <div><div style={{fontSize:13,fontWeight:500}}>à¸à¸±à¸à¸à¸¶à¸à¸à¸¥à¸±à¸à¸¥à¸à¹à¸à¸¥à¹ Excel</div><div className="tagline">à¹à¸à¸µà¸¢à¸à¸à¸±à¸à¹à¸à¸¥à¹à¸à¹à¸à¸à¸à¸±à¸ / à¸à¸²à¸§à¸à¹à¹à¸«à¸¥à¸</div></div>
              <button className="btn btn-primary btn-sm" onClick={onSave}><Icon2 name="export" size={14}/> à¸à¸±à¸à¸à¸¶à¸</button>
            </div>
            <div className="flex between center" style={{padding:"11px 13px",background:"var(--panel-2)",borderRadius:6,border:"1px solid var(--line)"}}>
              <div><div style={{fontSize:13,fontWeight:500}}>à¸¥à¹à¸²à¸à¸à¹à¸­à¸¡à¸¹à¸¥à¸à¸µà¹à¹à¸à¹à¹à¸ (à¸à¸à¸¥à¸­à¸)</div><div className="tagline">à¸à¸¥à¸±à¸à¹à¸à¸«à¸à¹à¸²à¸à¸³à¹à¸à¹à¸²à¹à¸à¸¥à¹à¹à¸«à¸¡à¹</div></div>
              <button className="btn btn-ghost btn-sm" onClick={onReset}>Reset</button>
            </div>
            <div style={{padding:"12px 13px",background:"var(--accent-soft)",borderRadius:6,fontSize:12.5,color:"var(--accent)",lineHeight:1.6}}>
              <b>Automation à¸à¸µà¹à¹à¸à¸°à¸à¸³</b><br/>1) à¸ªà¹à¸à¸à¸£à¸°à¹à¸¡à¸´à¸ â à¹à¸à¹à¸à¸«à¸±à¸§à¸«à¸à¹à¸²/HR à¸­à¸±à¸à¹à¸à¸¡à¸±à¸à¸´<br/>2) à¸à¸ critical gap â à¸ªà¸£à¹à¸²à¸à¸à¸³à¹à¸à¸°à¸à¸³à¸­à¸à¸£à¸¡<br/>3) à¸ªà¸´à¹à¸à¹à¸à¸£à¸¡à¸²à¸ª â à¹à¸à¸·à¸­à¸à¸£à¸²à¸¢à¸à¸²à¸£à¸à¸µà¹à¸¢à¸±à¸à¹à¸¡à¹à¸à¸£à¸°à¹à¸¡à¸´à¸
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Training, People, EmployeeDetail, Assessment, Admin });
