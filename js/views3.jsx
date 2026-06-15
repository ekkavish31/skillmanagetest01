/* ============================================================
   views3: Trends (quarter comparison) + Skills Library
   ============================================================ */
const { useT:useT3, employeesFull:empFull3, readinessAt:readinessAt3, QUARTERS:QS3,
        SKILLS:SK3, EMPLOYEES:EMP3, isAssessed:isAssessed3, subOf:subOf3, SUB_META:SM3,
        DERIVED:DER3, exportCSV:csv3, Icon:Ic3, Avatar:Av3, PageHead:PH3, statusOf:statusOf3,
        readinessColor:rcol3, skillCoverage:cov3, SKILLTYPE_META:STM3 } = window;

/* ---- tiny SVG line chart (0..100) ---- */
function LineChart({ series, labels, w=560, h=210, pad=34 }){
  const max=100, min=0;
  const innerW = w-pad*2, innerH = h-pad*1.4;
  const x = i => pad + (i/(labels.length-1))*innerW;
  const y = v => pad*0.5 + innerH - ((v-min)/(max-min))*innerH;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{display:"block"}}>
      {[0,25,50,75,100].map(g=>(
        <g key={g}>
          <line x1={pad} x2={w-pad} y1={y(g)} y2={y(g)} stroke="var(--line)" strokeWidth="1"/>
          <text x={pad-8} y={y(g)+3} textAnchor="end" fontSize="9" fontFamily="var(--mono)" fill="var(--ink-4)">{g}</text>
        </g>
      ))}
      {labels.map((l,i)=>(
        <text key={l} x={x(i)} y={h-8} textAnchor="middle" fontSize="10" fontFamily="var(--mono)" fill="var(--ink-3)">{l}</text>
      ))}
      {series.map(s=>(
        <g key={s.name}>
          <polyline fill="none" stroke={s.color} strokeWidth={s.width||2.2} strokeLinejoin="round" strokeLinecap="round"
            points={s.values.map((v,i)=>`${x(i)},${y(v)}`).join(" ")} opacity={s.dim?0.4:1}/>
          {s.values.map((v,i)=><circle key={i} cx={x(i)} cy={y(v)} r={s.width?3.5:2.6} fill={s.color} opacity={s.dim?0.4:1}/>)}
          {!s.dim && <text x={x(s.values.length-1)+6} y={y(s.values[s.values.length-1])+3} fontSize="10" fontWeight="600" fill={s.color} fontFamily="var(--mono)">{s.values[s.values.length-1]}%</text>}
        </g>
      ))}
    </svg>
  );
}
function Delta({ from, to }){
  const d = to-from;
  const cls = d>0?"up":d<0?"down":"flat";
  const ar = d>0?"▲":d<0?"▼":"–";
  return <span className={"delta "+cls}>{ar} {d>0?"+":""}{d}</span>;
}

/* ====================== TRENDS ====================== */
function Trends(){
  const t = useT3();
  const emps = empFull3().filter(e=>e.assessed);
  const orgPerQ = QS3.map(q=> Math.round(emps.reduce((a,e)=>a+readinessAt3(e.name,e.position,q.back),0)/emps.length));
  // by function
  const subs = DER3.subfunctions.filter(s=>emps.some(e=>e.sub===s));
  const fnSeries = subs.map(s=>{
    const list = emps.filter(e=>e.sub===s);
    return { sub:s, color:SM3[s].color,
      values: QS3.map(q=>Math.round(list.reduce((a,e)=>a+readinessAt3(e.name,e.position,q.back),0)/list.length)) };
  });
  // top movers (gain from earliest to current)
  const movers = emps.map(e=>{
    const past = readinessAt3(e.name,e.position,QS3[0].back);
    const now = readinessAt3(e.name,e.position,0);
    return { name:e.name, sub:e.sub, position:e.position, past, now, gain:now-past };
  }).sort((a,b)=>b.gain-a.gain);
  const gained = movers.filter(m=>m.gain>0).slice(0,6);
  const dropped = movers.filter(m=>m.gain<0).slice(-4).reverse();

  const orgGain = orgPerQ[2]-orgPerQ[0];

  return (
    <div className="page">
      <PH3 num="02 — ANALYTICS" title={t("nTrends")||"แนวโน้มรายไตรมาส"} sub="เปรียบเทียบ Readiness ของแผนกย้อนหลัง 3 ไตรมาส — ภาพรวม สายงาน และผู้ที่พัฒนาขึ้น/ถดถอย">
        <button className="btn btn-ghost btn-sm" onClick={()=>window.print()}><Ic3 name="export" size={15}/> Print / PDF</button>
      </PH3>

      <div className="grid" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        {QS3.map((q,i)=>(
          <div key={q.key} className="card kpi">
            <div className="kpi-accent" style={{background:i===2?rcol3(orgPerQ[i]):"var(--ink-4)"}}></div>
            <div className="kpi-label">{q.label}{i===2?" · ปัจจุบัน":""}</div>
            <div className="kpi-val tnum">{orgPerQ[i]}<small>%</small></div>
            <div className="kpi-sub">{i>0 ? <Delta from={orgPerQ[i-1]} to={orgPerQ[i]}/> : <span className="muted">baseline</span>}</div>
          </div>
        ))}
        <div className="card kpi">
          <div className="kpi-accent" style={{background:orgGain>=0?"var(--ready)":"var(--crit)"}}></div>
          <div className="kpi-label">รวมทั้งช่วง</div>
          <div className="kpi-val tnum" style={{color:orgGain>=0?"var(--ready)":"var(--crit)"}}>{orgGain>0?"+":""}{orgGain}<small>pt</small></div>
          <div className="kpi-sub">{QS3[0].label} → {QS3[2].label}</div>
        </div>
      </div>

      <div className="grid mt16" style={{gridTemplateColumns:"1.5fr 1fr"}}>
        <div className="card">
          <div className="card-head"><div><h3 className="card-h">Readiness แยกตามสายงาน</h3><div className="card-h-sub">เส้นหนา = ภาพรวมแผนก</div></div></div>
          <div className="card-pad">
            <LineChart labels={QS3.map(q=>q.label)}
              series={[{name:"Org",color:"var(--ink)",width:3,values:orgPerQ}, ...fnSeries.map(f=>({name:f.sub,color:f.color,values:f.values}))]}/>
            <div className="flex wrap gap12 mt12" style={{justifyContent:"center"}}>
              <span className="flex center gap6"><i style={{width:14,height:3,background:"var(--ink)",borderRadius:2}}></i><span style={{fontSize:11.5}}>ภาพรวม</span></span>
              {fnSeries.map(f=><span key={f.sub} className="flex center gap6"><i style={{width:14,height:3,background:f.color,borderRadius:2}}></i><span style={{fontSize:11.5}}>{f.sub}</span></span>)}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3 className="card-h">การเปลี่ยนแปลงรายสายงาน</h3></div>
          <table>
            <thead><tr><th>สายงาน</th>{QS3.map(q=><th key={q.key} className="th-num">{q.label.split(" ")[0]}</th>)}<th className="th-num">Δ</th></tr></thead>
            <tbody>
              {fnSeries.map(f=>(
                <tr key={f.sub}>
                  <td><span className="flex center gap8"><span className="dot" style={{background:f.color}}></span><b style={{fontWeight:500}}>{f.sub}</b></span></td>
                  {f.values.map((v,i)=><td key={i} className="td-num" style={{color:i===2?"var(--ink)":"var(--ink-3)"}}>{v}%</td>)}
                  <td className="td-num"><Delta from={f.values[0]} to={f.values[2]}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid mt16" style={{gridTemplateColumns:"1fr 1fr"}}>
        <div className="card">
          <div className="card-head"><div><h3 className="card-h">พัฒนาขึ้นมากที่สุด</h3><div className="card-h-sub">Top movers · {QS3[0].label} → {QS3[2].label}</div></div>
            <span className="badge b-ready">improving</span></div>
          <table>
            <thead><tr><th>{t("name")}</th><th className="th-num">{QS3[0].label.split(" ")[0]}</th><th className="th-num">{t("readiness")}</th><th className="th-num">Δ</th></tr></thead>
            <tbody>
              {gained.map(m=>(
                <tr key={m.name}>
                  <td><span className="flex center gap10"><Av3 name={m.name} sub={m.sub} size={26}/><div><div style={{fontSize:12.5,fontWeight:500}}>{m.name}</div><div className="tagline">{m.position}</div></div></span></td>
                  <td className="td-num muted">{m.past}%</td>
                  <td className="td-num"><b>{m.now}%</b></td>
                  <td className="td-num"><Delta from={m.past} to={m.now}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-head"><div><h3 className="card-h">ควรติดตาม</h3><div className="card-h-sub">Readiness ลดลง — ตรวจสอบสาเหตุ</div></div>
            <span className="badge b-crit">watch</span></div>
          {dropped.length ? (
            <table>
              <thead><tr><th>{t("name")}</th><th className="th-num">{QS3[0].label.split(" ")[0]}</th><th className="th-num">{t("readiness")}</th><th className="th-num">Δ</th></tr></thead>
              <tbody>
                {dropped.map(m=>(
                  <tr key={m.name}>
                    <td><span className="flex center gap10"><Av3 name={m.name} sub={m.sub} size={26}/><div><div style={{fontSize:12.5,fontWeight:500}}>{m.name}</div><div className="tagline">{m.position}</div></div></span></td>
                    <td className="td-num muted">{m.past}%</td>
                    <td className="td-num"><b>{m.now}%</b></td>
                    <td className="td-num"><Delta from={m.past} to={m.now}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="card-pad muted" style={{fontSize:13,textAlign:"center",padding:30}}>ไม่มีผู้ที่ readiness ลดลง 🎉</div>}
        </div>
      </div>
      <div className="tagline mt12 no-print">* ข้อมูลย้อนหลังเป็นการจำลองแนวโน้มเพื่อสาธิต — เมื่อใช้งานจริงระบบจะบันทึก snapshot ทุกสิ้นไตรมาส</div>
    </div>
  );
}

/* ====================== SKILLS LIBRARY ====================== */
function SkillsLibrary({ canAdd, onAdd, onEdit, onDelete }){
  const t = useT3();
  const [q, setQ] = React.useState("");
  const [cat, setCat] = React.useState("All");
  const cov = cov3(EMP3);
  const cats = ["All", ...window.CATEGORIES];
  const ql = q.trim().toLowerCase();
  const list = SK3.filter(s=>
    (cat==="All"||s.category===cat) &&
    (!ql || s.name.toLowerCase().includes(ql) || s.category.toLowerCase().includes(ql))
  );
  function doExport(){
    const rows = SK3.map(s=>{
      const c = cov.find(x=>x.id===s.id)||{};
      return [s.id, s.name, s.category, s.skillType, Object.keys(s.needs).length, c.metCount||0, c.expertCount||0];
    });
    csv3("skills_library_"+window.Store.current()+".csv",
      ["ID","Skill","Category","Type","Positions required","Met","Experts"], rows);
  }
  return (
    <div className="page">
      <PH3 num="05 — ADMINISTER" title="คลังทักษะ (Skills Library)" sub={`Master data ทักษะของแผนก ${window.Store.currentName()} · ${SK3.length} ทักษะ · ${window.CATEGORIES.length} หมวด`}>
        <button className="btn btn-ghost btn-sm" onClick={doExport}><Ic3 name="export" size={15}/> Export CSV</button>
        {canAdd && <button className="btn btn-primary btn-sm" onClick={onAdd}><Ic3 name="plus" size={14}/> เพิ่มทักษะ</button>}
      </PH3>
      <div className="flex center gap10 wrap" style={{marginBottom:14}}>
        <div className="search" style={{width:280}}>
          <Ic3 name="search" size={15}/>
          <input placeholder="ค้นหาทักษะ / หมวด…" value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
        <select className="inp" style={{width:200}} value={cat} onChange={e=>setCat(e.target.value)}>
          {cats.map(c=><option key={c} value={c}>{c==="All"?"ทุกหมวด":c}</option>)}
        </select>
        <span className="tagline">{list.length} รายการ</span>
      </div>
      <div className="card">
        <table>
          <thead><tr><th style={{width:34}}>#</th><th>{t("skill")}</th><th>{t("category")}</th><th>Type</th><th className="th-num">ตำแหน่งที่ใช้</th><th className="th-num">ถึงมาตรฐาน</th><th className="th-num">Expert</th>{canAdd && <th style={{width:80}}></th>}</tr></thead>
          <tbody>
            {list.map((s,i)=>{
              const c = cov.find(x=>x.id===s.id)||{};
              const tag = (STM3[s.skillType]||{}).tag || "IQ";
              return (
                <tr key={s.id}>
                  <td className="mono" style={{color:"var(--ink-4)"}}>{String(i+1).padStart(2,"0")}</td>
                  <td><b style={{fontWeight:500}}>{s.name}</b></td>
                  <td className="muted" style={{fontSize:12}}>{s.category}</td>
                  <td><span className={"badge "+(tag==="EQ"?"b-accent":"b-neutral")}>{tag}</span></td>
                  <td className="td-num">{Object.keys(s.needs).length}</td>
                  <td className="td-num">{c.metCount||0}/{c.needCount||0}</td>
                  <td className="td-num"><b style={{color:(c.expertCount||0)===0?"var(--crit)":"var(--ink)"}}>{c.expertCount||0}</b></td>
                  {canAdd && <td>
                    <div className="flex gap6">
                      <button className="icon-btn" title="แก้ไข" onClick={()=>onEdit(s)}><Ic3 name="assess" size={15}/></button>
                      <button className="icon-btn" title="ลบ" onClick={()=>onDelete(s)}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                    </div>
                  </td>}
                </tr>
              );
            })}
            {!list.length && <tr><td colSpan={canAdd?8:7} className="muted" style={{textAlign:"center",padding:28}}>ไม่พบทักษะที่ตรงกับการค้นหา</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

Object.assign(window, { Trends, SkillsLibrary, LineChart, Delta });
