/* ============================================================
   forms.jsx — Add Employee / Add Skill / Add Course modals
   ============================================================ */
const { useT:uTf, Icon:ICf, Avatar:AvF, SKILLS:SKf, EMPLOYEES:EMPf, ACTUALS:ACTf,
        POSITIONS:POSf, DERIVED:DERf, CATEGORIES:CATf, SUB_META:SMf, subOf:subOff } = window;

const SKILLTYPES = ["Specific standard","Working operation","General knowledge","IT/DX","Mind set/Attitude"];

function Modal({ title, sub, onClose, children, foot, wide }){
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={wide?{maxWidth:640}:null} onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <div><h3 className="modal-title">{title}</h3>{sub && <div className="modal-sub">{sub}</div>}</div>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-foot">{foot}</div>
      </div>
    </div>
  );
}
function Field({ label, children }){
  return <div className="field"><label>{label}</label>{children}</div>;
}
function LevelPick({ value, onChange, max=10 }){
  return (
    <div className="lvl-pick">
      {Array.from({length:max+1},(_,i)=>i).map(n=>(
        <button key={n} type="button" className={value===n?"on":""} onClick={()=>onChange(n)}>{n}</button>
      ))}
    </div>
  );
}

/* ---------------- Add Employee ---------------- */
function AddEmployeeModal({ onClose, onDone, toast }){
  const t = uTf;
  const subs = DERf.subfunctions.filter(s=> (DERf.ladders[s]||[]).length);
  const [name, setName] = React.useState("");
  const [sub, setSub] = React.useState(subs[0]);
  const posList = (DERf.ladders[sub]||[]);
  const [pos, setPos] = React.useState(posList[0]);
  React.useEffect(()=>{ setPos((DERf.ladders[sub]||[])[0]); }, [sub]);

  const reqCount = pos ? SKf.filter(s=>(s.needs[pos]||0)>0).length : 0;
  const dup = EMPf.some(e=>e.name.toLowerCase()===name.trim().toLowerCase());
  const valid = name.trim().length>=2 && pos && !dup;

  function save(){
    window.Store.addEmployee({ name:name.trim(), position:pos });
    toast("เพิ่มพนักงาน " + name.trim() + " ✓");
    onDone();
  }
  return (
    <Modal title="เพิ่มพนักงาน" sub="พนักงานใหม่จะรับมาตรฐานทักษะของตำแหน่งอัตโนมัติ และเข้าคิวรอประเมิน"
      onClose={onClose}
      foot={<><button className="btn btn-ghost" onClick={onClose}>ยกเลิก</button>
            <button className="btn btn-primary" disabled={!valid} onClick={save}><ICf name="plus" size={14}/> เพิ่มพนักงาน</button></>}>
      <Field label="ชื่อ–นามสกุล">
        <input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="เช่น Somchai Jaidee" autoFocus/>
        {dup && <div style={{color:"var(--crit)",fontSize:11.5,marginTop:5}}>มีชื่อนี้อยู่แล้ว</div>}
      </Field>
      <div className="grid" style={{gridTemplateColumns:"1fr 1.4fr"}}>
        <Field label="สายงาน">
          <select className="inp" value={sub} onChange={e=>setSub(e.target.value)}>
            {subs.map(s=><option key={s} value={s}>{s} — {SMf[s].label}</option>)}
          </select>
        </Field>
        <Field label="ตำแหน่ง">
          <select className="inp" value={pos} onChange={e=>setPos(e.target.value)}>
            {posList.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
      </div>
      <div className="note-box" style={{background:"var(--accent-soft)",color:"var(--accent)"}}>
        <ICf name="ready" size={13}/> ระบบจะดึงมาตรฐาน <b>{reqCount} ทักษะ</b> ของตำแหน่งนี้มาให้อัตโนมัติ — สถานะเริ่มต้น “ยังไม่ประเมิน”
      </div>
    </Modal>
  );
}

/* ---------------- Add Skill ---------------- */
function AddSkillModal({ onClose, onDone, toast }){
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState(CATf[0]);
  const [customCat, setCustomCat] = React.useState("");
  const [skillType, setSkillType] = React.useState(SKILLTYPES[0]);
  const [reqs, setReqs] = React.useState([]); // [{position, level}]
  const [pickSub, setPickSub] = React.useState(DERf.subfunctions[0]);

  const usedCat = category==="__new" ? customCat.trim() : category;
  const subPositions = (DERf.ladders[pickSub]||[]).filter(p=>!reqs.some(r=>r.position===p));
  const valid = name.trim().length>=2 && usedCat && reqs.length>=1;

  function addReq(p){ if(p) setReqs(r=>[...r,{position:p, level:5}]); }
  function setLevel(i,v){ setReqs(r=>r.map((x,j)=>j===i?{...x,level:v}:x)); }
  function rmReq(i){ setReqs(r=>r.filter((_,j)=>j!==i)); }

  function save(){
    const needs = {}; reqs.forEach(r=>{ needs[r.position]=r.level; });
    window.Store.addSkill({ name:name.trim(), category:usedCat, skillType, needs });
    toast("เพิ่มทักษะ " + name.trim() + " ✓");
    onDone();
  }
  return (
    <Modal wide title="เพิ่มหัวข้อทักษะ" sub="Master data — กำหนดมาตรฐาน 0–10 เฉพาะตำแหน่งที่ต้องใช้ มีผลกับทุกคนในตำแหน่งนั้นทันที"
      onClose={onClose}
      foot={<><span className="tagline" style={{marginRight:"auto"}}>{reqs.length} ตำแหน่งที่กำหนดมาตรฐาน</span>
            <button className="btn btn-ghost" onClick={onClose}>ยกเลิก</button>
            <button className="btn btn-primary" disabled={!valid} onClick={save}><ICf name="plus" size={14}/> เพิ่มทักษะ</button></>}>
      <div className="grid" style={{gridTemplateColumns:"1.5fr 1fr"}}>
        <Field label="ชื่อทักษะ">
          <input className="inp" value={name} onChange={e=>setName(e.target.value)} placeholder="เช่น FMEA Analysis" autoFocus/>
        </Field>
        <Field label="ประเภท (IQ / EQ)">
          <select className="inp" value={skillType} onChange={e=>setSkillType(e.target.value)}>
            {SKILLTYPES.map(s=><option key={s} value={s}>{s}{s==="Mind set/Attitude"?" (EQ)":" (IQ)"}</option>)}
          </select>
        </Field>
      </div>
      <Field label="หมวด">
        <select className="inp" value={category} onChange={e=>setCategory(e.target.value)}>
          {CATf.map(c=><option key={c} value={c}>{c}</option>)}
          <option value="__new">+ หมวดใหม่…</option>
        </select>
        {category==="__new" && <input className="inp" style={{marginTop:8}} value={customCat} onChange={e=>setCustomCat(e.target.value)} placeholder="ชื่อหมวดใหม่"/>}
      </Field>

      <div className="field">
        <label>มาตรฐานต่อตำแหน่ง (Required)</label>
        <div className="flex center gap8" style={{marginBottom:6}}>
          <select className="inp" style={{flex:"0 0 150px"}} value={pickSub} onChange={e=>setPickSub(e.target.value)}>
            {DERf.subfunctions.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <select className="inp" id="__posPick" defaultValue="" onChange={e=>{ addReq(e.target.value); e.target.value=""; }}>
            <option value="" disabled>+ เลือกตำแหน่งเพื่อกำหนด…</option>
            {subPositions.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        {reqs.length===0 && <div className="note-box" style={{background:"var(--paper-2)",color:"var(--ink-3)"}}>ยังไม่ได้เลือกตำแหน่ง — เลือกอย่างน้อย 1 ตำแหน่งที่ทักษะนี้จำเป็น</div>}
        {reqs.map((r,i)=>(
          <div className="req-row" key={r.position}>
            <div style={{flex:1,fontSize:12.5,minWidth:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.position}</div>
            <LevelPick value={r.level} onChange={v=>setLevel(i,v)}/>
            <button className="modal-x" style={{width:24,height:24,flex:"0 0 24px",fontSize:13}} onClick={()=>rmReq(i)}>✕</button>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ---------------- Add Course (record completed training) ---------------- */
function AddCourseModal({ onClose, onDone, toast, presetSkillId }){
  // suggest skills that have candidates with gap >=2
  function candidatesFor(skillId){
    const sk = SKf.find(s=>s.id===skillId); if(!sk) return [];
    const out=[];
    for(const e of EMPf){
      const need = sk.needs[e.position]||0; if(need<=0) continue;
      const act = (ACTf[e.name]||{})[sk.id]||0;
      if(need-act>=1) out.push({ name:e.name, sub:subOff(e.position), before:act, need });
    }
    return out.sort((a,b)=>(b.need-b.before)-(a.need-a.before));
  }
  const skillsWithGap = SKf.filter(s=>candidatesFor(s.id).length>0);
  const [skillId, setSkillId] = React.useState(presetSkillId || (skillsWithGap[0]||SKf[0]).id);
  const sk = SKf.find(s=>s.id===skillId);
  const cands = candidatesFor(skillId);
  const [sel, setSel] = React.useState(()=>new Set(cands.map(c=>c.name)));
  React.useEffect(()=>{ setSel(new Set(candidatesFor(skillId).map(c=>c.name))); }, [skillId]);
  const today = new Date().toISOString().slice(0,10);
  const [date, setDate] = React.useState(today);
  const [trainer, setTrainer] = React.useState("");
  const [target, setTarget] = React.useState(8);

  // internal experts (>=8) to suggest as trainer
  const experts = EMPf.filter(e=>((ACTf[e.name]||{})[skillId]||0)>=8).map(e=>e.name);
  const valid = sk && sel.size>=1 && trainer.trim().length>=2;

  function toggle(name){ setSel(s=>{ const n=new Set(s); n.has(name)?n.delete(name):n.add(name); return n; }); }
  function save(){
    let n=0;
    cands.filter(c=>sel.has(c.name)).forEach(c=>{
      const after = Math.max(c.before, Math.min(10, target));
      window.Store.addTraining({ date, trainee:c.name, item:sk.name, skillId:sk.id,
        before:c.before, after, trainer:trainer.trim(), trainerLevel:0, applyScore:true });
      n++;
    });
    toast("บันทึกคอร์ส " + sk.name + " — อัปเดต " + n + " คน ✓");
    onDone();
  }
  return (
    <Modal wide title="บันทึกคอร์สอบรม" sub="เลือกหัวข้อ → ระบบแนะนำผู้เข้าจาก gap จริง → บันทึกผล before/after และอัปเดตคะแนนอัตโนมัติ"
      onClose={onClose}
      foot={<><span className="tagline" style={{marginRight:"auto"}}>{sel.size} ผู้เข้าอบรม</span>
            <button className="btn btn-ghost" onClick={onClose}>ยกเลิก</button>
            <button className="btn btn-primary" disabled={!valid} onClick={save}><ICf name="plus" size={14}/> บันทึกผลอบรม</button></>}>
      <Field label="หัวข้อ (ทักษะ)">
        <select className="inp" value={skillId} onChange={e=>setSkillId(e.target.value)}>
          {skillsWithGap.map(s=><option key={s.id} value={s.id}>{s.name} — {s.category} ({candidatesFor(s.id).length} เป้าหมาย)</option>)}
        </select>
      </Field>
      <div className="grid" style={{gridTemplateColumns:"1fr 1fr 0.8fr"}}>
        <Field label="วันที่">
          <input className="inp" type="date" value={date} onChange={e=>setDate(e.target.value)}/>
        </Field>
        <Field label="ผู้สอน (Trainer)">
          <input className="inp" list="__experts" value={trainer} onChange={e=>setTrainer(e.target.value)} placeholder={experts.length?experts[0]:"ชื่อผู้สอน / ภายนอก"}/>
          <datalist id="__experts">{experts.map(x=><option key={x} value={x}/>)}</datalist>
        </Field>
        <Field label="เป้าหมายหลังอบรม">
          <select className="inp" value={target} onChange={e=>setTarget(+e.target.value)}>
            {[5,6,7,8,9,10].map(n=><option key={n} value={n}>ระดับ {n}</option>)}
          </select>
        </Field>
      </div>
      {experts.length===0
        ? <div className="note-box" style={{background:"var(--crit-soft)",color:"var(--crit)",marginBottom:14}}><ICf name="risk" size={13}/> ไม่มีผู้เชี่ยวชาญภายใน (≥8) — แนะนำจัดอบรมภายนอก</div>
        : <div className="note-box" style={{background:"var(--ready-soft)",color:"oklch(0.4 0.08 158)",marginBottom:14}}><ICf name="ready" size={13}/> ผู้เชี่ยวชาญภายใน: {experts.join(", ")}</div>}

      <div className="field">
        <label>ผู้เข้าอบรม — เลือกจากผู้ที่มี gap (before → เป้าหมาย {target})</label>
        <div style={{display:"grid",gap:5,maxHeight:200,overflowY:"auto",border:"1px solid var(--line)",borderRadius:6,padding:8}}>
          {cands.map(c=>{
            const after = Math.max(c.before, Math.min(10,target));
            const on = sel.has(c.name);
            return (
              <div key={c.name} onClick={()=>toggle(c.name)} className="flex center between"
                style={{padding:"7px 9px",borderRadius:5,cursor:"pointer",background:on?"var(--accent-soft)":"transparent"}}>
                <span className="flex center gap10">
                  <span style={{width:16,height:16,borderRadius:4,border:"1.5px solid",borderColor:on?"var(--accent)":"var(--line-2)",
                    background:on?"var(--accent)":"transparent",color:"#fff",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center"}}>{on?"✓":""}</span>
                  <AvF name={c.name} sub={c.sub} size={24}/>
                  <span style={{fontSize:13}}>{c.name}</span>
                </span>
                <span className="flex center gap8 mono" style={{fontSize:12}}>
                  <span style={{color:"var(--ink-3)"}}>{c.before}</span>
                  <ICf name="arrow" size={12} style={{color:"var(--ink-4)"}}/>
                  <b style={{color:"var(--ready)"}}>{after}</b>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

Object.assign(window, { AddEmployeeModal, AddSkillModal, AddCourseModal, Modal, Field, LevelPick, SKILLTYPES });
