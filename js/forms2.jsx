/* ============================================================
   forms2.jsx — Edit Employee / Edit Skill / Confirm Delete
   ============================================================ */
const { Modal:M2, Field:F2, LevelPick:LP2, SKILLTYPES:STy2, Icon:Ic2f,
        DERIVED:DER2f, SUB_META:SM2f, CATEGORIES:CAT2f, subOf:subOf2f } = window;

/* ---------------- Confirm Delete ---------------- */
function ConfirmModal({ title, message, confirmLabel, danger, onConfirm, onClose }){
  return (
    <M2 title={title} onClose={onClose}
      foot={<><button className="btn btn-ghost" onClick={onClose}>ยกเลิก</button>
            <button className={"btn "+(danger?"":"btn-primary")} style={danger?{background:"var(--crit)",color:"#fff"}:null} onClick={onConfirm}>{confirmLabel}</button></>}>
      <div style={{fontSize:13.5,lineHeight:1.6,color:"var(--ink-2)"}}>{message}</div>
    </M2>
  );
}

/* ---------------- Edit Employee ---------------- */
function EditEmployeeModal({ emp, onClose, onDone, toast }){
  const subs = DER2f.subfunctions.filter(s=> (DER2f.ladders[s]||[]).length);
  const [name, setName] = React.useState(emp.name);
  const [sub, setSub] = React.useState(subOf2f(emp.position));
  const posList = (DER2f.ladders[sub]||[]);
  const [pos, setPos] = React.useState(emp.position);
  React.useEffect(()=>{ if(!(DER2f.ladders[sub]||[]).includes(pos)) setPos((DER2f.ladders[sub]||[])[0]); }, [sub]);

  const dup = window.EMPLOYEES.some(e=>e.name!==emp.name && e.name.toLowerCase()===name.trim().toLowerCase());
  const valid = name.trim().length>=2 && pos && !dup;
  const moved = pos!==emp.position;

  function save(){
    window.Store.updateEmployee(emp.name, { name:name.trim(), position:pos });
    toast("อัปเดต " + name.trim() + " ✓");
    onDone(name.trim());
  }
  return (
    <M2 title="แก้ไขข้อมูลพนักงาน" sub={emp.name}
      onClose={onClose}
      foot={<><button className="btn btn-ghost" onClick={onClose}>ยกเลิก</button>
            <button className="btn btn-primary" disabled={!valid} onClick={save}>บันทึก</button></>}>
      <F2 label="ชื่อ–นามสกุล">
        <input className="inp" value={name} onChange={e=>setName(e.target.value)} autoFocus/>
        {dup && <div style={{color:"var(--crit)",fontSize:11.5,marginTop:5}}>มีชื่อนี้อยู่แล้ว</div>}
      </F2>
      <div className="grid" style={{gridTemplateColumns:"1fr 1.4fr"}}>
        <F2 label="สายงาน">
          <select className="inp" value={sub} onChange={e=>setSub(e.target.value)}>
            {subs.map(s=><option key={s} value={s}>{s} — {SM2f[s].label}</option>)}
          </select>
        </F2>
        <F2 label="ตำแหน่ง">
          <select className="inp" value={pos} onChange={e=>setPos(e.target.value)}>
            {posList.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
        </F2>
      </div>
      {moved && <div className="note-box" style={{background:"var(--mid-soft)",color:"oklch(0.45 0.10 60)"}}>
        <Ic2f name="risk" size={13}/> เปลี่ยนตำแหน่ง — มาตรฐานทักษะจะอิงตำแหน่งใหม่ คะแนนเดิมคงไว้ ระบบจะคำนวณ Gap ใหม่
      </div>}
    </M2>
  );
}

/* ---------------- Edit Skill ---------------- */
function EditSkillModal({ skill, onClose, onDone, toast }){
  const [name, setName] = React.useState(skill.name);
  const [category, setCategory] = React.useState(window.CATEGORIES.includes(skill.category)?skill.category:"__new");
  const [customCat, setCustomCat] = React.useState(window.CATEGORIES.includes(skill.category)?"":skill.category);
  const [skillType, setSkillType] = React.useState(skill.skillType||STy2[0]);
  const [reqs, setReqs] = React.useState(Object.keys(skill.needs).map(p=>({position:p,level:skill.needs[p]})));
  const [pickSub, setPickSub] = React.useState(DER2f.subfunctions[0]);

  const usedCat = category==="__new" ? customCat.trim() : category;
  const subPositions = (DER2f.ladders[pickSub]||[]).filter(p=>!reqs.some(r=>r.position===p));
  const valid = name.trim().length>=2 && usedCat && reqs.length>=1;

  function addReq(p){ if(p) setReqs(r=>[...r,{position:p,level:5}]); }
  function setLevel(i,v){ setReqs(r=>r.map((x,j)=>j===i?{...x,level:v}:x)); }
  function rmReq(i){ setReqs(r=>r.filter((_,j)=>j!==i)); }
  function save(){
    const needs={}; reqs.forEach(r=>{ needs[r.position]=r.level; });
    window.Store.updateSkill(skill.id, { name:name.trim(), category:usedCat, skillType, needs });
    toast("อัปเดตทักษะ " + name.trim() + " ✓");
    onDone();
  }
  return (
    <M2 wide title="แก้ไขทักษะ" sub={skill.name}
      onClose={onClose}
      foot={<><span className="tagline" style={{marginRight:"auto"}}>{reqs.length} ตำแหน่ง</span>
            <button className="btn btn-ghost" onClick={onClose}>ยกเลิก</button>
            <button className="btn btn-primary" disabled={!valid} onClick={save}>บันทึก</button></>}>
      <div className="grid" style={{gridTemplateColumns:"1.5fr 1fr"}}>
        <F2 label="ชื่อทักษะ"><input className="inp" value={name} onChange={e=>setName(e.target.value)} autoFocus/></F2>
        <F2 label="ประเภท (IQ / EQ)">
          <select className="inp" value={skillType} onChange={e=>setSkillType(e.target.value)}>
            {STy2.map(s=><option key={s} value={s}>{s}{s==="Mind set/Attitude"?" (EQ)":" (IQ)"}</option>)}
          </select>
        </F2>
      </div>
      <F2 label="หมวด">
        <select className="inp" value={category} onChange={e=>setCategory(e.target.value)}>
          {window.CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
          <option value="__new">+ หมวดใหม่…</option>
        </select>
        {category==="__new" && <input className="inp" style={{marginTop:8}} value={customCat} onChange={e=>setCustomCat(e.target.value)} placeholder="ชื่อหมวดใหม่"/>}
      </F2>
      <div className="field">
        <label>มาตรฐานต่อตำแหน่ง (Required)</label>
        <div className="flex center gap8" style={{marginBottom:6}}>
          <select className="inp" style={{flex:"0 0 150px"}} value={pickSub} onChange={e=>setPickSub(e.target.value)}>
            {DER2f.subfunctions.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <select className="inp" defaultValue="" onChange={e=>{ addReq(e.target.value); e.target.value=""; }}>
            <option value="" disabled>+ เลือกตำแหน่งเพื่อกำหนด…</option>
            {subPositions.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        {reqs.map((r,i)=>(
          <div className="req-row" key={r.position}>
            <div style={{flex:1,fontSize:12.5,minWidth:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.position}</div>
            <LP2 value={r.level} onChange={v=>setLevel(i,v)}/>
            <button className="modal-x" style={{width:24,height:24,flex:"0 0 24px",fontSize:13}} onClick={()=>rmReq(i)}>✕</button>
          </div>
        ))}
      </div>
    </M2>
  );
}

Object.assign(window, { ConfirmModal, EditEmployeeModal, EditSkillModal });
