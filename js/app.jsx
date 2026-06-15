/* ============================================================
   app.jsx â shell, role/lang switch, Excel data binding, router
   ============================================================ */
const { useT:uT, Icon:I3, Avatar:Av3, LangCtx:LCtx,
        Dashboard:V_Dash, Heatmap:V_Heat, Readiness:V_Ready, Risk:V_Risk,
        Training:V_Train, People:V_People, EmployeeDetail:V_Emp, Assessment:V_Assess, Admin:V_Admin,
        Trends:V_Trends, SkillsLibrary:V_Skills,
        EMPLOYEES:E3, subOf:subOf3, SUB_META:SM3 } = window;

const ROLES = ["exec","hr","manager","leader","employee"];
const ROLE_HOME = { exec:"dashboard", hr:"dashboard", manager:"dashboard", leader:"dashboard", employee:"me" };

const NAV = [
  { group:"navOverview", items:[
    { id:"dashboard", ic:"dash", key:"nDash", roles:["exec","hr","manager","leader"] },
  ]},
  { group:"navAnalyze", items:[
    { id:"heatmap",   ic:"heatmap", key:"nHeatmap", roles:["exec","hr","manager"] },
    { id:"readiness", ic:"ready",   key:"nReady",   roles:["exec","hr","manager","leader"] },
    { id:"risk",      ic:"risk",    key:"nRisk",    roles:["exec","hr","manager"] },
    { id:"trends",    ic:"trend",   key:"nTrends",  roles:["exec","hr","manager"] },
  ]},
  { group:"navPlan", items:[
    { id:"training", ic:"train",  key:"nTrain",  roles:["hr","manager"] },
    { id:"people",   ic:"people", key:"nPeople", roles:["hr","manager","leader"] },
    { id:"me",       ic:"me",     key:"nMe",     roles:["employee"] },
  ]},
  { group:"navManage", items:[
    { id:"assess", ic:"assess",  key:"nAssess", roles:["hr","manager","leader","employee"] },
    { id:"skills", ic:"library", key:"nSkills", roles:["hr","manager"] },
    { id:"admin",  ic:"admin",   key:"nAdmin",  roles:["hr"] },
  ]},
];

/* ====================== IMPORT / ONBOARDING SCREEN ====================== */
function ImportScreen({ lang, setLang, onLoaded }){
  const t = (k)=>window.tr(k,lang);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState(window.__dataError);
  async function pick(){ setBusy(true); setErr(null);
    try{ await window.Store.importPicker(); }catch(e){ setErr(e.message||String(e)); }
    setBusy(false); if(window.DB.error) setErr(window.DB.error);
  }
  async function sample(){ setBusy(true); setErr(null);
    try{ await window.Store.loadSample(); }catch(e){ setErr(e.message||String(e)); }
    setBusy(false); if(window.DB.error) setErr(window.DB.error);
  }
  async function sharepoint(){ setBusy(true); setErr(null);
    try{ await window.Store.loadFromSharePoint(); }catch(e){ setErr(e.message||String(e)); }
    setBusy(false); if(window.DB.error) setErr(window.DB.error);
  }
  const fsa = !!window.showOpenFilePicker;
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--nav)",padding:24}}>
      <div style={{position:"absolute",top:18,right:22}} className="seg">
        {["th","en","ja"].map(l=><button key={l} className={lang===l?"on":""} onClick={()=>setLang(l)}>{l.toUpperCase()}</button>)}
      </div>
      <div className="card" style={{maxWidth:520,width:"100%",overflow:"hidden"}}>
        <div style={{padding:"30px 32px 24px",borderBottom:"1px solid var(--line)"}}>
          <div className="flex center gap12">
            <div className="sb-logo" style={{width:42,height:42,fontSize:18,borderRadius:7}}>Q</div>
            <div>
              <div style={{fontSize:18,fontWeight:600,letterSpacing:"-0.01em"}}>{t("appName")}</div>
              <div className="tagline">{t("appSub")}</div>
            </div>
          </div>
          <h2 style={{fontSize:19,fontWeight:600,margin:"22px 0 8px",letterSpacing:"-0.01em"}}>{t("importTitle")}</h2>
          <p style={{fontSize:13.5,color:"var(--ink-2)",lineHeight:1.65,margin:0}}>{t("importDesc")}</p>
        </div>
        <div style={{padding:"22px 32px 26px",display:"grid",gap:11}}>
          {busy ? (
            <div className="flex center gap10" style={{justifyContent:"center",padding:"14px 0",color:"var(--ink-3)"}}>
              <span className="spin" style={{width:16,height:16,border:"2px solid var(--line-2)",borderTopColor:"var(--accent)",borderRadius:"50%",display:"inline-block"}}></span>
              {t("loading")}
            </div>
          ) : (
            <>
              <button className="btn btn-primary" style={{padding:"12px 16px",fontSize:14}} onClick={pick}>
                <I3 name="export" size={16} style={{transform:"rotate(180deg)"}}/> {t("chooseFile")}
              </button>
              <button className="btn btn-ghost" style={{padding:"11px 16px"}} onClick={sample}>
                <I3 name="library" size={16}/> {t("useSample")}
              </button>
              <button className="btn" style={{padding:"11px 16px",background:"#0078d4",color:"#fff"}} onClick={sharepoint}>
                <I3 name="export" size={16}/> à¹à¸«à¸¥à¸à¸à¸²à¸ SharePoint
              </button>
            </>
          )}
          {err && <div className="note-box" style={{background:"var(--crit-soft)",color:"var(--crit)"}}><b>à¹à¸à¸´à¸à¸à¹à¸­à¸à¸´à¸à¸à¸¥à¸²à¸:</b> {err}</div>}
          <div className="tagline" style={{marginTop:6,lineHeight:1.6}}>
            {fsa
              ? "à¹à¸à¸£à¸²à¸§à¹à¹à¸à¸­à¸£à¹à¸à¸µà¹à¸£à¸­à¸à¸£à¸±à¸à¸à¸²à¸£à¸à¸±à¸à¸à¸¶à¸à¸à¸¥à¸±à¸à¸¥à¸à¹à¸à¸¥à¹à¹à¸à¸´à¸¡à¹à¸à¹à¹à¸à¸¢à¸à¸£à¸ (Chrome / Edge) â à¹à¸«à¸¡à¸²à¸°à¸à¸±à¸à¹à¸à¸¥à¹à¸à¸µà¹ sync à¸à¸±à¸ SharePoint / OneDrive"
              : "à¹à¸à¸£à¸²à¸§à¹à¹à¸à¸­à¸£à¹à¸à¸µà¹à¸à¸±à¸à¸à¸¶à¸à¹à¸à¸à¸à¸²à¸§à¸à¹à¹à¸«à¸¥à¸à¹à¸à¸¥à¹à¹à¸«à¸¡à¹ (à¹à¸à¹ Chrome / Edge à¹à¸à¸·à¹à¸­à¹à¸à¸µà¸¢à¸à¸à¸±à¸à¹à¸à¸¥à¹à¹à¸à¸´à¸¡à¹à¸à¹)"}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====================== MAIN APP ====================== */
function App(){
  const [lang, setLang] = React.useState("th");
  const [loaded, setLoaded] = React.useState(window.DB.loaded);
  const [booting, setBooting] = React.useState(true);
  const [role, setRole] = React.useState("hr");
  const [route, setRoute] = React.useState("dashboard");
  const [selEmp, setSelEmp] = React.useState(null);
  const [prevRoute, setPrev] = React.useState("people");
  const [toast, setToast] = React.useState(null);
  const [roleOpen, setRoleOpen] = React.useState(false);
  const [modal, setModal] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [, setVersion] = React.useState(0);

  const SELF = E3[0] ? E3[0].name : "";   // first employee = the logged-in persona

  // data-load lifecycle
  React.useEffect(()=>{
    window.__onDataLoaded = ()=>{ setLoaded(window.DB.loaded); setVersion(v=>v+1); };
    (async()=>{ await window.Store.init(); setBooting(false); setLoaded(window.DB.loaded); })();
  }, []);

  const t = (k)=>window.tr(k,lang);
  const canAdd = role==="hr" || role==="manager";
  const refresh = ()=>setVersion(v=>v+1);
  function openModal(type, ctx){ setModal({ type, ctx }); }
  function modalDone(){ setModal(null); refresh(); }
  function showToast(msg){ setToast(msg); clearTimeout(window.__tt); window.__tt=setTimeout(()=>setToast(null),2600); }
  function go(r){ setRoute(r); window.scrollTo({top:0}); }
  function openEmp(name){ setSelEmp(name); setPrev(route); go("employee"); }
  function changeRole(r){ setRole(r); setRoleOpen(false); go(ROLE_HOME[r]); if(r==="employee") setSelEmp(SELF); }

  async function doSave(){
    setSaving(true);
    try{
      const r = await window.Store.saveToExcel();
      if(r.mode==="sharepoint") showToast("à¸à¸±à¸à¸à¸¶à¸à¸à¸¶à¹à¸ SharePoint à¹à¸¥à¹à¸§ â");
      else if(r.mode==="download") showToast("à¸à¸²à¸§à¸à¹à¹à¸«à¸¥à¸à¹à¸à¸¥à¹ Excel à¹à¸¥à¹à¸§ â à¸­à¸±à¸à¹à¸«à¸¥à¸à¸à¸¥à¸±à¸ SharePoint à¹à¸à¹à¹à¸¥à¸¢");
      else if(r.mode==="file") showToast("à¸à¸±à¸à¸à¸¶à¸à¸¥à¸à¹à¸à¸¥à¹ "+(r.name||"")+" à¹à¸¥à¹à¸§ â");
      else if(r.mode==="cancel"){ /* user cancelled */ }
    }catch(e){ showToast("à¸à¸±à¸à¸à¸¶à¸à¹à¸¡à¹à¸ªà¸³à¹à¸£à¹à¸: "+(e.message||e)); }
    setSaving(false); refresh();
  }
  async function reimport(){ try{ await window.Store.importPicker(); }catch(e){ showToast("à¸à¸³à¹à¸à¹à¸²à¹à¸¡à¹à¸ªà¸³à¹à¸£à¹à¸: "+(e.message||e)); } setSelEmp(null); go("dashboard"); }

  // edit / delete handlers
  function confirmDelete(opts){ openModal("confirm", opts); }
  function editEmp(name){ const e=E3.find(x=>x.name===name); if(e) openModal("editEmployee",{emp:e}); }
  function deleteEmp(name){ confirmDelete({ title:"à¸¥à¸à¸à¸à¸±à¸à¸à¸²à¸", danger:true, confirmLabel:"à¸¥à¸à¸à¸à¸±à¸à¸à¸²à¸",
    message:`à¸à¹à¸­à¸à¸à¸²à¸£à¸¥à¸ â${name}â à¸­à¸­à¸à¸à¸²à¸à¸£à¸°à¸à¸à¹à¸à¹à¸«à¸£à¸·à¸­à¹à¸¡à¹? à¸à¹à¸­à¸¡à¸¹à¸¥à¸à¸²à¸£à¸à¸£à¸°à¹à¸¡à¸´à¸à¹à¸¥à¸°à¸à¸£à¸°à¸§à¸±à¸à¸´à¸­à¸à¸£à¸¡à¸à¸­à¸à¸à¸¸à¸à¸à¸¥à¸à¸µà¹à¸à¸°à¸à¸¹à¸à¸¥à¸à¸à¹à¸§à¸¢`,
    onConfirm:()=>{ window.Store.deleteEmployee(name); setModal(null); refresh(); go(role==="employee"?"me":"people"); showToast("à¸¥à¸à¸à¸à¸±à¸à¸à¸²à¸à¹à¸¥à¹à¸§"); } }); }
  function editSkill(sk){ openModal("editSkill",{skill:sk}); }
  function deleteSkill(sk){ confirmDelete({ title:"à¸¥à¸à¸à¸±à¸à¸©à¸°", danger:true, confirmLabel:"à¸¥à¸à¸à¸±à¸à¸©à¸°",
    message:`à¸à¹à¸­à¸à¸à¸²à¸£à¸¥à¸à¸à¸±à¸à¸©à¸° â${sk.name}â à¹à¸à¹à¸«à¸£à¸·à¸­à¹à¸¡à¹? à¸à¸°à¹à¸à¸à¸à¸­à¸à¸à¸¸à¸à¸à¸à¹à¸à¸à¸±à¸à¸©à¸°à¸à¸µà¹à¸à¸°à¸à¸¹à¸à¸¥à¸ à¹à¸¥à¸°à¸à¸²à¸£à¸à¸³à¸à¸§à¸ Gap à¸à¸°à¸à¸£à¸±à¸à¹à¸«à¸¡à¹`,
    onConfirm:()=>{ window.Store.deleteSkill(sk.id); setModal(null); refresh(); showToast("à¸¥à¸à¸à¸±à¸à¸©à¸°à¹à¸¥à¹à¸§"); } }); }
  function deleteRecord(tid){ confirmDelete({ title:"à¸¥à¸à¸à¸±à¸à¸à¸¶à¸à¸­à¸à¸£à¸¡", danger:true, confirmLabel:"à¸¥à¸",
    message:"à¸à¹à¸­à¸à¸à¸²à¸£à¸¥à¸à¸£à¸²à¸¢à¸à¸²à¸£à¸­à¸à¸£à¸¡à¸à¸µà¹à¸­à¸­à¸à¸à¸²à¸à¸à¸£à¸°à¸§à¸±à¸à¸´à¹à¸à¹à¸«à¸£à¸·à¸­à¹à¸¡à¹?",
    onConfirm:()=>{ window.Store.deleteTraining(tid); setModal(null); refresh(); showToast("à¸¥à¸à¸£à¸²à¸¢à¸à¸²à¸£à¹à¸¥à¹à¸§"); } }); }

  // ----- gating: boot / import -----
  if(booting){
    return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--nav)",color:"var(--nav-text)"}}>
      <span className="spin" style={{width:22,height:22,border:"2.5px solid oklch(0.4 0.01 264)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block"}}></span>
    </div>;
  }
  if(!loaded){ return <ImportScreen lang={lang} setLang={setLang}/>; }

  // allowed nav for role
  const groups = NAV.map(g=>({ ...g, items:g.items.filter(it=>it.roles.includes(role)) })).filter(g=>g.items.length);
  const findItem = (id)=>{ for(const g of NAV) for(const it of g.items) if(it.id===id) return { g:g.group, it }; return null; };

  let view, crumbGroup, crumbPage;
  if(route==="employee"){
    const ex = E3.find(e=>e.name===selEmp);
    if(!ex){ crumbGroup=t("navPlan"); crumbPage=t("nPeople"); view = <V_People openEmp={openEmp} canAdd={canAdd} onAddEmployee={()=>openModal("employee")} onEdit={editEmp} onDelete={deleteEmp}/>; }
    else { crumbGroup=t("navPlan"); crumbPage=ex.name;
      view = <V_Emp name={selEmp} go={(r)=>go(r)} back={()=>go(role==="employee"?"me":prevRoute)} canEdit={canAdd} onEdit={()=>editEmp(selEmp)} onDelete={()=>deleteEmp(selEmp)} onDeleteRecord={deleteRecord}/>; }
  } else if(route==="me"){
    crumbGroup=t("navPlan"); crumbPage=t("nMe");
    view = <V_Emp name={SELF} go={(r)=>go(r)} back={()=>go("me")} canEdit={false} onDeleteRecord={deleteRecord}/>;
  } else {
    const f = findItem(route);
    crumbGroup = f ? t(f.g) : ""; crumbPage = f ? t(f.it.key) : "";
    switch(route){
      case "dashboard": view = <V_Dash go={go} showToast={showToast}/>; break;
      case "heatmap":   view = <V_Heat go={go} openEmp={openEmp}/>; break;
      case "readiness": view = <V_Ready openEmp={openEmp}/>; break;
      case "risk":      view = <V_Risk go={go}/>; break;
      case "trends":    view = <V_Trends/>; break;
      case "training":  view = <V_Train canAdd={canAdd} onAddCourse={()=>openModal("course")} onDeleteRecord={deleteRecord}/>; break;
      case "people":    view = <V_People openEmp={openEmp} canAdd={canAdd} onAddEmployee={()=>openModal("employee")} onEdit={editEmp} onDelete={deleteEmp}/>; break;
      case "skills":    view = <V_Skills canAdd={canAdd} onAdd={()=>openModal("skill")} onEdit={editSkill} onDelete={deleteSkill}/>; break;
      case "assess":    view = <V_Assess initialName={selEmp||(role==="employee"?SELF:null)} toast={showToast}/>; break;
      case "admin":     view = <V_Admin onAddSkill={()=>openModal("skill")} onReset={()=>window.Store.reset()} go={go} onImport={reimport} onSave={doSave}/>; break;
      default:          view = <V_Dash go={go} showToast={showToast}/>;
    }
  }

  const dirty = window.DB.dirty;
  const fileName = window.Store.fileName() || "â";

  return (
    <LCtx.Provider value={lang}>
      <div className="app">
        {/* ---------- Sidebar ---------- */}
        <aside className="sidebar">
          <div className="sb-brand">
            <div className="sb-mark">
              <div className="sb-logo">Q</div>
              <div className="sb-title">{t("appName")}<small>{t("appSub")}</small></div>
            </div>
          </div>
          <div className="sb-scope">
            <div className="scope-card">
              <div className="flex between center">
                <div className="scope-label">{t("dataSource")}</div>
                <button onClick={reimport} title={t("changeFile")} style={{border:0,background:"transparent",color:"var(--nav-mut)",fontSize:10,fontFamily:"var(--mono)",cursor:"pointer",letterSpacing:"0.04em"}}>{t("changeFile")} â</button>
              </div>
              <div className="scope-row" style={{cursor:"default"}}>
                <span className="scope-val" style={{fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:150}} title={fileName}>{fileName}</span>
                <span title={dirty?t("unsaved"):t("saved")} style={{width:8,height:8,borderRadius:"50%",flex:"0 0 8px",background:dirty?"var(--mid)":"var(--ready)"}}></span>
              </div>
            </div>
          </div>
          <nav className="sb-nav">
            {groups.map(g=>(
              <div className="nav-group" key={g.group}>
                <div className="nav-group-label">{t(g.group)}</div>
                {g.items.map(it=>{
                  const active = route===it.id || (route==="employee"&&it.id==="people") || (route==="me"&&it.id==="me");
                  return (
                    <button key={it.id} className={"nav-item"+(active?" active":"")} onClick={()=>go(it.id)}>
                      <span className="nav-ic" style={{display:"flex"}}><I3 name={it.ic} size={17}/></span>
                      <span className="txt">{t(it.key)}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
          <div className="sb-user">
            <div className="user-card">
              <div className="user-av">{role==="employee"?window.initials(SELF||"E"):role.slice(0,2).toUpperCase()}</div>
              <div className="user-meta">
                <div className="user-name">{role==="employee"?SELF:t("appSub")}</div>
                <div className="user-role">{t(role)}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ---------- Content ---------- */}
        <div className="content">
          <header className="topbar">
            <span className="crumb"><b>{window.Store.current()}</b> Â· {crumbGroup} / <b>{crumbPage}</b></span>
            <div className="topbar-spacer"></div>
            {/* Save to Excel */}
            <button className={"btn btn-sm "+(dirty?"btn-primary":"btn-ghost")} onClick={doSave} disabled={saving} title={t("saveToExcel")}>
              {saving ? <span className="spin" style={{width:13,height:13,border:"2px solid currentColor",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block"}}></span>
                      : <I3 name="export" size={15}/>}
              {t("saveToExcel")}{dirty && <span style={{width:6,height:6,borderRadius:"50%",background:"#fff",display:"inline-block",marginLeft:2}}></span>}
            </button>
            <div className="search" style={{width:200}}>
              <I3 name="search" size={15}/>
              <input placeholder={t("search")} />
            </div>
            <div className="seg">
              {["th","en","ja"].map(l=>(<button key={l} className={lang===l?"on":""} onClick={()=>setLang(l)}>{l.toUpperCase()}</button>))}
            </div>
            {/* role switcher */}
            <div style={{position:"relative"}}>
              <div className="role-pill" onClick={()=>setRoleOpen(v=>!v)}>
                <span className="role-dot" style={{background:"var(--accent)"}}></span>
                <span style={{fontSize:11,fontFamily:"var(--mono)",color:"var(--ink-3)",textTransform:"uppercase",letterSpacing:"0.08em"}}>{t("loggedAs")}</span>
                <b style={{fontSize:12.5}}>{t(role)}</b>
                <I3 name="chevD" size={13} style={{color:"var(--ink-4)"}}/>
              </div>
              {roleOpen && (
                <>
                  <div style={{position:"fixed",inset:0,zIndex:40}} onClick={()=>setRoleOpen(false)}></div>
                  <div className="menu" style={{right:0,top:"calc(100% + 6px)",minWidth:200}}>
                    <div className="eyebrow" style={{padding:"8px 11px 6px"}}>{t("loggedAs")}</div>
                    {ROLES.map(r=>(
                      <button key={r} onClick={()=>changeRole(r)} style={r===role?{background:"var(--accent-soft)",color:"var(--accent)",fontWeight:600}:null}>
                        <span className="role-dot" style={{background:r===role?"var(--accent)":"var(--ink-4)"}}></span>{t(r)}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </header>
          <main>{view}</main>
        </div>
      </div>

      {/* ---------- modal hosts ---------- */}
      {modal && modal.type==="employee" && <window.AddEmployeeModal onClose={()=>setModal(null)} onDone={modalDone} toast={showToast}/>}
      {modal && modal.type==="skill" && <window.AddSkillModal onClose={()=>setModal(null)} onDone={modalDone} toast={showToast}/>}
      {modal && modal.type==="course" && <window.AddCourseModal onClose={()=>setModal(null)} onDone={modalDone} toast={showToast} presetSkillId={modal.ctx&&modal.ctx.skillId}/>}
      {modal && modal.type==="editEmployee" && <window.EditEmployeeModal emp={modal.ctx.emp} onClose={()=>setModal(null)} onDone={(nn)=>{ if(nn)setSelEmp(nn); modalDone(); }} toast={showToast}/>}
      {modal && modal.type==="editSkill" && <window.EditSkillModal skill={modal.ctx.skill} onClose={()=>setModal(null)} onDone={modalDone} toast={showToast}/>}
      {modal && modal.type==="confirm" && <window.ConfirmModal {...modal.ctx} onClose={()=>setModal(null)}/>}

      {toast && <div className="toast"><I3 name="ready" size={16}/> {toast}</div>}
    </LCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
