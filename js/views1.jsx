/* ============================================================
   views1: Dashboard, Heatmap, Readiness, Risk
   ============================================================ */
const { useT, employeesFull, skillCoverage, readinessOf, statusOf, isAssessed,
        SUB_META, STATUS_META, SKILLS, EMPLOYEES, ACTUALS, CATEGORIES, DERIVED, POSITIONS,
        Icon, Avatar, StatusBadge, GapBadge, ScaleBar, Donut, readinessColor, gapColor, gapCls,
        subOf, ladderFor } = window;

/* ---------- shared section header ---------- */
function PageHead({ num, title, sub, children }){
  return (
    <div className="page-head">
      <div>
        <div className="eyebrow">{num}</div>
        <h1 className="page-title" style={{marginTop:6}}>{title}</h1>
        {sub && <div className="page-sub">{sub}</div>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </div>
  );
}

/* ====================== DASHBOARD ====================== */
function Dashboard({ go, showToast }){
  const t = useT();
  const emps = employeesFull();
  const cov = skillCoverage(EMPLOYEES);
  function exportSummary(){
    window.exportCSV("readiness_"+window.Store.current()+".csv",
      ["Name","Position","Function","Readiness %","Gaps","Critical","Status"],
      emps.map(e=>[e.name, e.position, e.sub, e.assessed?e.readiness:"", e.assessed?e.gapCount:"", e.assessed?e.crit:"", e.status]));
  }
  const avgReadiness = Math.round(emps.reduce((a,b)=>a+b.readiness,0)/emps.length);
  const pending = emps.filter(e=>!e.assessed).length;
  // critical risk skills: needed by >=3, met by <=1  (single point of failure)
  const riskSkills = cov.filter(s=> s.needCount>=4 && s.metCount<=1).sort((a,b)=> a.metCount-b.metCount || b.needCount-a.needCount);
  // training topics: skill where >=4 people have gap>=2
  const topics = SKILLS.map(sk=>{
    let cands=[]; for(const e of EMPLOYEES){ const need=sk.needs[e.position]||0; if(need<=0)continue; const act=(ACTUALS[e.name]||{})[sk.id]||0; if(need-act>=2) cands.push(e.name); }
    return { name:sk.name, category:sk.category, n:cands.length, expert: cov.find(c=>c.id===sk.id)?.expertCount||0 };
  }).filter(s=>s.n>=4).sort((a,b)=>b.n-a.n);

  // readiness by function
  const subs = DERIVED.subfunctions.filter(s=> emps.some(e=>e.sub===s));
  const byFn = subs.map(s=>{
    const list = emps.filter(e=>e.sub===s);
    const r = Math.round(list.reduce((a,b)=>a+b.readiness,0)/list.length);
    return { sub:s, n:list.length, r };
  });
  // status distribution
  const dist = ["ready","develop","support","pending"].map(k=>({ k, n: emps.filter(e=>e.status===k).length }));

  const KPI = ({ accent, label, val, unit, sub }) => (
    <div className="card kpi">
      <div className="kpi-accent" style={{background:accent}}></div>
      <div className="kpi-top"><div className="kpi-label">{label}</div></div>
      <div className="kpi-val tnum">{val}{unit && <small>{unit}</small>}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
  );

  return (
    <div className="page">
      <PageHead num="01 — OVERVIEW" title={t("nDash")} sub={"ภาพรวมความพร้อมด้านทักษะ — แผนก "+window.Store.currentName()+" · ไตรมาส Q2 / 2026"}>
        <button className="btn btn-ghost btn-sm" onClick={exportSummary}><Icon name="export" size={15}/> Export</button>
        <button className="btn btn-primary btn-sm" onClick={()=>go("training")}><Icon name="train" size={15}/> {t("nTrain")}</button>
      </PageHead>

      <div className="grid" style={{gridTemplateColumns:"repeat(5,1fr)"}}>
        <KPI accent="var(--accent)" label={t("kEmployees")} val={emps.length} sub={`6 ${t("byFunction")}`}/>
        <KPI accent={readinessColor(avgReadiness)} label={t("kReadiness")} val={avgReadiness} unit="%" sub={`${SKILLS.length} skills tracked`}/>
        <KPI accent="var(--crit)" label={t("kCritical")} val={riskSkills.length} sub="single point of failure" />
        <KPI accent="var(--mid)" label={t("kTraining")} val={topics.length} sub={`gap ≥ 2 · ≥4 ${t("people")}`}/>
        <KPI accent="var(--ink-3)" label={t("kPending")} val={pending} sub={t("sPending")}/>
      </div>

      <div className="grid mt16" style={{gridTemplateColumns:"1.5fr 1fr"}}>
        {/* readiness by function */}
        <div className="card">
          <div className="card-head"><div><h3 className="card-h">{t("readiness")} {t("byFunction")}</h3><div className="card-h-sub">{window.Store.currentName()} · functions</div></div>
            <span className="tagline">Actual ÷ Required</span></div>
          <div className="card-pad" style={{display:"grid",gap:14}}>
            {byFn.map(f=>(
              <div key={f.sub} className="flex center gap12">
                <div style={{width:128,flex:"0 0 128px"}}>
                  <div className="flex center gap8"><span className="dot" style={{background:SUB_META[f.sub].color}}></span>
                    <b style={{fontSize:13}}>{f.sub}</b></div>
                  <div className="tagline" style={{marginLeft:15}}>{f.n} {t("people")}</div>
                </div>
                <div style={{flex:1}}>
                  <div className="bar" style={{height:9}}><i style={{width:f.r+"%",background:readinessColor(f.r)}}></i></div>
                </div>
                <div className="mono tnum" style={{width:42,textAlign:"right",fontWeight:600,fontSize:14}}>{f.r}%</div>
              </div>
            ))}
          </div>
        </div>
        {/* workforce status */}
        <div className="card">
          <div className="card-head"><h3 className="card-h">Workforce status</h3></div>
          <div className="card-pad">
            <div className="flex center gap16">
              <div style={{position:"relative"}}>
                <Donut pct={Math.round((dist[0].n)/emps.length*100)} size={104} sw={11} color="var(--ready)"/>
                <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                  <div className="mono tnum" style={{fontSize:22,fontWeight:600}}>{dist[0].n}</div>
                  <div className="eyebrow" style={{fontSize:8}}>{t("sReady")}</div>
                </div>
              </div>
              <div style={{flex:1,display:"grid",gap:9}}>
                {dist.map(d=>(
                  <div key={d.k} className="flex center between">
                    <span className="flex center gap8"><i className={"dot "+STATUS_META[d.k].dot}></i><span style={{fontSize:12.5}}>{t(STATUS_META[d.k].key)}</span></span>
                    <span className="mono tnum" style={{fontWeight:600}}>{d.n}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid mt16" style={{gridTemplateColumns:"1fr 1fr"}}>
        {/* critical risk skills */}
        <div className="card">
          <div className="card-head"><div><h3 className="card-h">{t("kCritical")}</h3><div className="card-h-sub">ทักษะที่มีคนทำได้ ≤1 คน — ความเสี่ยงสูง</div></div>
            <button className="btn btn-link btn-sm" onClick={()=>go("risk")}>{t("viewDetail")} <Icon name="arrow" size={13}/></button></div>
          <table>
            <thead><tr><th>{t("skill")}</th><th>{t("category")}</th><th className="th-num">Need</th><th className="th-num">Met</th><th></th></tr></thead>
            <tbody>
              {riskSkills.slice(0,6).map(s=>(
                <tr key={s.id}>
                  <td><b style={{fontWeight:500}}>{s.name}</b></td>
                  <td className="muted" style={{fontSize:12}}>{s.category}</td>
                  <td className="td-num">{s.needCount}</td>
                  <td className="td-num"><b style={{color:s.metCount===0?"var(--crit)":"var(--mid)"}}>{s.metCount}</b></td>
                  <td><span className={"badge "+(s.metCount===0?"b-crit":"b-mid")}>{s.metCount===0?"0 cover":"low"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* recommended training topics */}
        <div className="card">
          <div className="card-head"><div><h3 className="card-h">{t("nTrain")} — Q3 candidates</h3><div className="card-h-sub">หัวข้อที่ควรจัดอบรม · เรียงตามจำนวนผู้เข้าเป้าหมาย</div></div>
            <button className="btn btn-link btn-sm" onClick={()=>go("training")}>{t("viewDetail")} <Icon name="arrow" size={13}/></button></div>
          <div className="card-pad" style={{display:"grid",gap:11}}>
            {topics.slice(0,6).map((s,i)=>(
              <div key={i} className="flex center gap12">
                <div className="mono" style={{width:18,color:"var(--ink-4)",fontSize:12}}>{String(i+1).padStart(2,"0")}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:500,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.name}</div>
                  <div className="tagline">{s.category}{s.expert>0?` · ${s.expert} expert`:" · no internal trainer"}</div>
                </div>
                <div className="flex center gap6" style={{flex:"0 0 auto"}}>
                  <span className="badge b-accent"><Icon name="people" size={11}/> {s.n}</span>
                  {s.expert===0 && <span className="badge b-crit" title="no internal trainer">ext.</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====================== HEATMAP ====================== */
function Heatmap({ go, openEmp }){
  const t = useT();
  const subs = ["All", ...DERIVED.subfunctions.filter(s=>EMPLOYEES.some(e=>subOf(e.position)===s))];
  const [fnFilter, setFn] = React.useState("All");
  const [onlyGaps, setOnlyGaps] = React.useState(false);
  const [cat, setCat] = React.useState("All");

  const emps = EMPLOYEES.filter(e=> fnFilter==="All" || subOf(e.position)===fnFilter);
  let cats = cat==="All" ? CATEGORIES : [cat];
  // build rows grouped by category
  const CELL = 22;
  const rows = [];
  for(const c of cats){
    const sklist = SKILLS.filter(s=>s.category===c);
    const filtered = sklist.filter(sk=>{
      if(!onlyGaps) return true;
      return emps.some(e=>{ const need=sk.needs[e.position]||0; if(need<=0)return false; const act=(ACTUALS[e.name]||{})[sk.id]||0; return need-act>0; });
    });
    if(filtered.length) rows.push({ cat:c, skills:filtered });
  }

  return (
    <div className="page" style={{maxWidth:"none"}}>
      <PageHead num="02 — ANALYTICS" title={t("nHeatmap")} sub="ทักษะ × พนักงาน — สีแสดงระดับ Gap เทียบมาตรฐานของตำแหน่ง">
        <div className="flex center gap8">
          <span className="tagline">Filter</span>
          <div className="seg">{subs.map(s=><button key={s} className={fnFilter===s?"on":""} onClick={()=>setFn(s)}>{s}</button>)}</div>
          <button className={"chip"+(onlyGaps?" on":"")} onClick={()=>setOnlyGaps(v=>!v)}>Gaps only</button>
        </div>
      </PageHead>

      {/* legend */}
      <div className="flex center gap16 wrap" style={{marginBottom:14}}>
        <span className="tagline">Gap legend</span>
        {[["Met / better",0],["−1",1],["−2",2],["−3",3],["−4",4],["−5+",5]].map(([lbl,g])=>(
          <span key={lbl} className="flex center gap6"><i style={{width:16,height:16,borderRadius:3,background:gapColor(10,10-g)}}></i><span style={{fontSize:11.5,color:"var(--ink-2)"}}>{lbl}</span></span>
        ))}
        <span className="flex center gap6"><i style={{width:16,height:16,borderRadius:3,background:"var(--paper-2)",border:"1px solid var(--line)"}}></i><span style={{fontSize:11.5,color:"var(--ink-2)"}}>not required</span></span>
      </div>

      <div className="card" style={{overflow:"hidden"}}>
        <div className="scroll-x" style={{overflowX:"auto"}}>
          <div style={{minWidth: 250 + emps.length*CELL + 20}}>
            {/* header row */}
            <div style={{display:"flex",position:"sticky",top:0,zIndex:3,background:"var(--panel-2)",borderBottom:"1px solid var(--line-2)"}}>
              <div style={{width:250,flex:"0 0 250px",padding:"10px 14px",position:"sticky",left:0,background:"var(--panel-2)",zIndex:4}}>
                <span className="eyebrow">{t("skill")} ({SKILLS.length})</span>
              </div>
              <div style={{display:"flex"}}>
                {emps.map(e=>(
                  <div key={e.name} title={e.name+" · "+e.position} onClick={()=>openEmp(e.name)}
                    style={{width:CELL,flex:`0 0 ${CELL}px`,height:118,display:"flex",alignItems:"flex-end",justifyContent:"center",cursor:"pointer",borderLeft:"1px solid var(--line)"}}>
                    <span style={{writingMode:"vertical-rl",transform:"rotate(180deg)",fontSize:10.5,padding:"6px 0",color:"var(--ink-2)",whiteSpace:"nowrap",fontFamily:"var(--mono)",letterSpacing:"0.02em"}}>
                      {e.name.split(" ")[0]} <span style={{color:"var(--ink-4)"}}>· {subOf(e.position)}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* body */}
            {rows.map(grp=>(
              <div key={grp.cat}>
                <div style={{display:"flex",background:"var(--paper)",borderBottom:"1px solid var(--line)",borderTop:"1px solid var(--line)"}}>
                  <div style={{padding:"6px 14px",position:"sticky",left:0,background:"var(--paper)",zIndex:2,width:"100%"}}>
                    <span className="eyebrow" style={{color:"var(--accent)"}}>{grp.cat}</span>
                    <span className="tagline" style={{marginLeft:8}}>· {grp.skills.length}</span>
                  </div>
                </div>
                {grp.skills.map(sk=>(
                  <div key={sk.id} style={{display:"flex",borderBottom:"1px solid var(--line)"}} className="hm-row">
                    <div style={{width:250,flex:"0 0 250px",padding:"0 14px",position:"sticky",left:0,background:"var(--panel)",zIndex:1,display:"flex",alignItems:"center",height:CELL+4,fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",borderRight:"1px solid var(--line-2)"}} title={sk.name}>
                      <span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{sk.name}</span>
                    </div>
                    <div style={{display:"flex"}}>
                      {emps.map(e=>{
                        const need=sk.needs[e.position]||0;
                        const act=(ACTUALS[e.name]||{})[sk.id]||0;
                        const g=need-act;
                        return <div key={e.name} title={`${e.name}\n${sk.name}\nReq ${need} · Act ${act} · Gap ${g>0?g:0}`}
                          className="hm-cell" style={{width:CELL-3,height:CELL-3,margin:1.5,background:gapColor(need,act),flex:`0 0 ${CELL-3}px`}}></div>;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="tagline mt12">คลิกชื่อพนักงานด้านบนเพื่อดูโปรไฟล์รายบุคคล · ครอบคลุม {SKILLS.length} ทักษะ × {emps.length} คน</div>
    </div>
  );
}

/* ====================== READINESS BY POSITION ====================== */
function Readiness({ openEmp }){
  const t = useT();
  const emps = employeesFull().sort((a,b)=> a.sub.localeCompare(b.sub) || b.readiness-a.readiness);
  function exportReadiness(){
    window.exportCSV("position_readiness_"+window.Store.current()+".csv",
      ["Name","Position","Readiness %","Gaps","Critical","Status"],
      emps.map(e=>[e.name, e.position, e.assessed?e.readiness:"", e.assessed?e.gapCount:"", e.assessed?e.crit:"", e.status]));
  }
  // group by position
  const byPos = {};
  emps.forEach(e=>{ (byPos[e.position]=byPos[e.position]||[]).push(e); });
  const posOrder = POSITIONS.filter(p=>byPos[p]);

  return (
    <div className="page">
      <PageHead num="02 — ANALYTICS" title={t("nReady")} sub="เทียบทักษะปัจจุบันกับมาตรฐานของแต่ละตำแหน่ง — ใครพร้อม ใครยังไม่พร้อม">
        <button className="btn btn-ghost btn-sm" onClick={exportReadiness}><Icon name="export" size={15}/> Export CSV</button>
      </PageHead>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>{t("name")}</th><th>{t("position")}</th><th style={{width:200}}>{t("readiness")}</th>
              <th className="th-num">Gap</th><th className="th-num">Critical</th><th>{t("status")}</th><th></th>
            </tr>
          </thead>
          <tbody>
            {posOrder.map(pos=>{
              const list = byPos[pos];
              return [
                <tr key={"h"+pos} style={{background:"var(--paper)"}}>
                  <td colSpan={7} style={{padding:"7px 14px"}}>
                    <span className="flex center gap8"><span className="dot" style={{background:SUB_META[subOf(pos)].color}}></span>
                    <span className="eyebrow" style={{color:"var(--ink-2)"}}>{pos}</span>
                    <span className="tagline">· {list.length} {t("people")}</span></span>
                  </td>
                </tr>,
                ...list.map(e=>(
                  <tr key={e.name} className="clickable" onClick={()=>openEmp(e.name)}>
                    <td><span className="flex center gap10"><Avatar name={e.name} sub={e.sub} size={28}/><b style={{fontWeight:500}}>{e.name}</b></span></td>
                    <td className="muted" style={{fontSize:12}}>{e.position}</td>
                    <td>
                      <div className="flex center gap10">
                        <div style={{flex:1}}><div className="bar" style={{height:7}}><i style={{width:e.readiness+"%",background:readinessColor(e.readiness)}}></i></div></div>
                        <span className="mono tnum" style={{width:38,textAlign:"right",fontWeight:600,fontSize:12.5}}>{e.assessed?e.readiness+"%":"—"}</span>
                      </div>
                    </td>
                    <td className="td-num">{e.assessed?e.gapCount:"—"}</td>
                    <td className="td-num"><b style={{color:e.crit>0?"var(--crit)":"var(--ink-3)"}}>{e.assessed?e.crit:"—"}</b></td>
                    <td><StatusBadge status={e.status}/></td>
                    <td><Icon name="chev" size={14} style={{color:"var(--ink-4)"}}/></td>
                  </tr>
                ))
              ];
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ====================== RISK / CRITICAL GAPS ====================== */
function Risk({ go }){
  const t = useT();
  const cov = skillCoverage(EMPLOYEES);
  // single point of failure: needed by many, met by few
  const spof = cov.filter(s=>s.needCount>=3).map(s=>({...s, risk: s.needCount - s.metCount, ratio: s.metCount/s.needCount}))
    .sort((a,b)=> a.metCount-b.metCount || b.needCount-a.needCount);
  const noCover = spof.filter(s=>s.metCount===0);
  const lowCover = spof.filter(s=>s.metCount>=1 && s.ratio<=0.34);
  const noTrainer = cov.filter(s=>s.needCount>=2 && s.expertCount===0).length;

  const RiskRow = ({s})=>(
    <tr>
      <td><b style={{fontWeight:500}}>{s.name}</b><div className="tagline">{s.category}</div></td>
      <td className="td-num">{s.needCount}</td>
      <td className="td-num"><b style={{color:s.metCount===0?"var(--crit)":"var(--mid)"}}>{s.metCount}</b></td>
      <td className="td-num">{s.expertCount}</td>
      <td style={{width:140}}>
        <div className="flex center gap8">
          <div style={{flex:1}}><div className="bar" style={{height:6}}><i style={{width:Math.round(s.ratio*100)+"%",background:s.metCount===0?"var(--crit)":"var(--mid)"}}></i></div></div>
          <span className="mono tnum" style={{fontSize:11,color:"var(--ink-3)"}}>{Math.round(s.ratio*100)}%</span>
        </div>
      </td>
      <td>{s.expertCount===0 ? <span className="badge b-crit">no trainer</span> : <span className="badge b-neutral">{s.expertCount} trainer</span>}</td>
    </tr>
  );

  return (
    <div className="page">
      <PageHead num="02 — ANALYTICS" title={t("nRisk")} sub="ทักษะที่เป็น single point of failure — มีคนทำได้น้อย เสี่ยงเมื่อมีการลา/ลาออก/โยกย้าย"/>
      <div className="grid" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
        <div className="card kpi"><div className="kpi-accent" style={{background:"var(--crit)"}}></div>
          <div className="kpi-label">ไม่มีคนทำได้</div><div className="kpi-val tnum">{noCover.length}</div>
          <div className="kpi-sub">ทักษะที่ต้องใช้ แต่ยังไม่มีใครถึงมาตรฐาน</div></div>
        <div className="card kpi"><div className="kpi-accent" style={{background:"var(--mid)"}}></div>
          <div className="kpi-label">ครอบคลุมต่ำ (≤⅓)</div><div className="kpi-val tnum">{lowCover.length}</div>
          <div className="kpi-sub">มีคนทำได้ แต่กระจุกตัวน้อยราย</div></div>
        <div className="card kpi"><div className="kpi-accent" style={{background:"var(--ink-3)"}}></div>
          <div className="kpi-label">ไม่มี trainer ภายใน</div><div className="kpi-val tnum">{noTrainer}</div>
          <div className="kpi-sub">ทักษะที่ไม่มีผู้เชี่ยวชาญ (≥8) สอนได้</div></div>
      </div>

      <div className="card mt16">
        <div className="card-head"><div><h3 className="card-h">ไม่มีใครถึงมาตรฐาน — เร่งด่วน</h3><div className="card-h-sub">No coverage · ต้องจ้าง/อบรมภายนอกหรือสร้างคนทดแทน</div></div>
          <span className="badge b-crit">{noCover.length} skills</span></div>
        <table>
          <thead><tr><th>{t("skill")}</th><th className="th-num">ต้องการ</th><th className="th-num">ถึงมาตรฐาน</th><th className="th-num">{t("experts")}</th><th>{t("coverage")}</th><th>Trainer</th></tr></thead>
          <tbody>{noCover.slice(0,10).map(s=><RiskRow key={s.id} s={s}/>)}</tbody>
        </table>
      </div>

      <div className="card mt16">
        <div className="card-head"><div><h3 className="card-h">ครอบคลุมต่ำ — กระจุกตัว</h3><div className="card-h-sub">Low coverage · พึ่งพาคนไม่กี่คน</div></div>
          <span className="badge b-mid">{lowCover.length} skills</span></div>
        <table>
          <thead><tr><th>{t("skill")}</th><th className="th-num">ต้องการ</th><th className="th-num">ถึงมาตรฐาน</th><th className="th-num">{t("experts")}</th><th>{t("coverage")}</th><th>Trainer</th></tr></thead>
          <tbody>{lowCover.slice(0,10).map(s=><RiskRow key={s.id} s={s}/>)}</tbody>
        </table>
      </div>
    </div>
  );
}

Object.assign(window, { PageHead, Dashboard, Heatmap, Readiness, Risk });
