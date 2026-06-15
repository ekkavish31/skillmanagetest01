/* ============================================================
   db.js — Excel-backed data layer (no hard-coded data)
   • Parses QAD_Skill_Map_DB.xlsx (SheetJS) into the live model
   • Mutations (add/edit/delete) update the model + cache
   • Serializes the model back to .xlsx and writes to the SAME file
     via the File System Access API (OneDrive / SharePoint-synced),
     or downloads a fresh file as a fallback.
   ============================================================ */
(function(){
  "use strict";
  var D = window.QAD_DATA;                 // live object the views read
  var CACHE = "qad_db_cache_v2";
  var HKEY  = "qad_file_handle";           // IndexedDB key for the file handle

  var DB = {
    loaded:false, dirty:false, fileName:null, fileHandle:null,
    source:null,                            // 'file' | 'sample' | 'cache' | 'sharepoint'
    spDriveId:null, spItemId:null, spName:null,   // SharePoint driveItem refs
    raw:{ readme:[], guide:[], skillTypes:[], change:[], posRemark:{} },
    empIdByName:{},
    error:null,
    loadedAt:null,
    changeLog:[],
  };
  window.DB = DB;

  /* ---------- small utils ---------- */
  function pad(n,w){ n=String(n); while(n.length<w) n="0"+n; return n; }
  function num(v){ if(v===""||v==null) return null; var n=Number(v); return isNaN(n)?null:n; }
  function toDateStr(v){
    if(v==null||v==="") return "";
    if(typeof v==="number"){ // excel serial
      var d=new Date(Date.UTC(1899,11,30)+v*86400000); return d.toISOString().slice(0,10);
    }
    return String(v);
  }
  function todayStr(){ return new Date().toISOString().slice(0,10); }

  /* ---------- subfunction + ladder derivation ---------- */
  function subOfPos(pos){
    if(!pos) return "Other";
    if(/^PD\s/.test(pos)) return "PDM";
    var known=["QAD","SQA","QA","QC","TQM","PQC","ASSY","MCH","SET","INSP","MAT","PDM"];
    for(var i=0;i<known.length;i++){ if(pos.indexOf(known[i])===0) return known[i]; }
    return "Other";
  }
  function computeDerived(positions){
    var subs={};
    positions.forEach(function(p){ var s=subOfPos(p); (subs[s]=subs[s]||[]).push(p); });
    var rankOrder=["Staff","Engineer","Leader","Asst.S/V","Asst. S/V","S/V","Sr. S/V","Asst. Manager","Manager"];
    function rankIdx(p){
      var r=p.replace(/^(QAD|SQA|QA|QC|TQM|PQC)\s*/,"").replace(/\(.*\)/,"").trim();
      var best=99; rankOrder.forEach(function(ro,i){ if(r.indexOf(ro)>=0) best=Math.min(best,i); });
      return best;
    }
    for(var s in subs) subs[s].sort(function(a,b){ return rankIdx(a)-rankIdx(b); });
    var order=["QAD","QA","SQA","QC","TQM","PQC"].filter(function(x){ return subs[x]; });
    var rest=Object.keys(subs).filter(function(x){ return order.indexOf(x)<0; });
    return { ladders:subs, subfunctions:order.concat(rest) };
  }

  /* ---------- parse workbook → model ---------- */
  function buildModel(wb){
    function J(name){ var ws=wb.Sheets[name]; return ws ? XLSX.utils.sheet_to_json(ws,{defval:""}) : []; }
    function A(name){ var ws=wb.Sheets[name]; return ws ? XLSX.utils.sheet_to_json(ws,{header:1,defval:""}) : []; }

    var empRows = J("Employees");      // EmpID, FullName, Position, Status
    var posRows = J("Positions");      // Position, Remark
    var skRows  = J("Skills");         // SkillID, Category, ItemType, SkillType, Detail
    var ndRows  = J("SkillNeeds");     // SkillID, SkillDetail, Position, NeedLevel
    var evRows  = J("Evaluations");    // EmpID, Employee, Position, SkillID, SkillDetail, NeedLevel, ActualLevel, Gap
    var trRows  = J("TrainingRecords");// Date, Trainee, SkillDetail, LvBefore, LvAfter, Trainer, TrainerLevel
    var stRows  = J("SkillTypes");     // SkillType, Group

    // raw carry-over (written back unchanged on save)
    DB.raw.readme     = A("README");
    DB.raw.guide      = A("EvaluationGuide");
    DB.raw.skillTypes = A("SkillTypes");
    DB.raw.change     = A("ChangeRecord");
    DB.raw.posRemark  = {};
    posRows.forEach(function(r){ if(r.Position) DB.raw.posRemark[r.Position]=r.Remark||""; });

    // positions
    var positions = posRows.map(function(r){ return r.Position; }).filter(Boolean);
    var posSet = {}; positions.forEach(function(p){ posSet[p]=1; });

    // skills + needs
    var skillById={};
    var skills = skRows.map(function(r){
      var o={ id:String(r.SkillID), category:r.Category||"", type:r.ItemType||"",
              skillType:r.SkillType||"", name:r.Detail||"", needs:{} };
      skillById[o.id]=o; return o;
    });
    ndRows.forEach(function(n){
      var o=skillById[String(n.SkillID)]; if(!o) return;
      if(!posSet[n.Position]) return;            // ignore junk columns (e.g. "Duplicate Count")
      var lv=num(n.NeedLevel); if(lv==null) return;
      o.needs[n.Position]=lv;
    });

    // skill-type → IQ/EQ group
    var stGroup={}; stRows.forEach(function(r){ if(r.SkillType) stGroup[r.SkillType]=r.Group||"IQ"; });

    // employees (active)
    var empIdByName={};
    var employees = empRows.filter(function(r){
      return r.FullName && String(r.Status||"Active").toLowerCase()!=="inactive";
    }).map(function(r){
      empIdByName[r.FullName]=r.EmpID||"";
      return { name:r.FullName, position:r.Position||"", empId:r.EmpID||"", status:r.Status||"Active" };
    });
    DB.empIdByName=empIdByName;

    // actuals  {name:{skillId:level}}
    var actuals={};
    employees.forEach(function(e){ actuals[e.name]={}; });
    evRows.forEach(function(r){
      var nm=r.Employee; if(!nm) return;
      if(!actuals[nm]) actuals[nm]={};
      var a=num(r.ActualLevel); if(a==null) return;
      actuals[nm][String(r.SkillID)]=a;
    });

    // training
    var idByDetail={}; skills.forEach(function(s){ idByDetail[s.name]=s.id; });
    var tcount=0;
    var training = trRows.filter(function(r){ return r.Trainee; }).map(function(r){
      return { _tid:++tcount, date:toDateStr(r.Date), trainee:r.Trainee, item:r.SkillDetail||"",
               before:num(r.LvBefore)||0, after:num(r.LvAfter)||0, trainer:r.Trainer||"",
               trainerLevel:num(r.TrainerLevel)||0, skillId:idByDetail[r.SkillDetail]||null };
    });
    DB._tcount=tcount;

    // guide (TH columns)
    var guide = J("EvaluationGuide").map(function(r){
      return { level:num(r["Detailed Eva."]), skill:r["Condition (TH): Skill"]||"",
               knowledge:r["Condition (TH): Knowledge"]||"", language:r["Condition (TH): Language"]||"" };
    }).filter(function(g){ return g.level!=null; });

    var derived = computeDerived(positions);
    var deptCode = "QAD";
    var meta = { department:deptCode, departmentName:"Quality Assurance", scaleMax:10,
                 employeeCount:employees.length, skillCount:skills.length };

    return { meta:meta, positions:positions, employees:employees, skills:skills,
             actuals:actuals, training:training, guide:guide, derived:derived, skillTypeGroup:stGroup };
  }

  /* ---------- push a model into the live object (keep references) ---------- */
  function setLive(m){
    window.__fillArr(D.skills, m.skills);
    window.__fillArr(D.employees, m.employees);
    window.__fillArr(D.training, m.training);
    window.__fillArr(D.positions, m.positions);
    window.__fillArr(D.guide, m.guide||[]);
    window.__fillObj(D.actuals, m.actuals);
    window.__fillObj(D.meta, m.meta);
    window.__fillObj(D.derived.ladders, m.derived.ladders);
    D.derived.subfunctions.length=0; m.derived.subfunctions.forEach(function(s){ D.derived.subfunctions.push(s); });
    if(window.recomputeCategories) window.recomputeCategories();
  }
  function recomputeDerived(){
    var dv=computeDerived(D.positions);
    window.__fillObj(D.derived.ladders, dv.ladders);
    D.derived.subfunctions.length=0; dv.subfunctions.forEach(function(s){ D.derived.subfunctions.push(s); });
  }

  /* ---------- cache to localStorage ---------- */
  function snapshot(){
    return { meta:D.meta, positions:D.positions, employees:D.employees, skills:D.skills,
             actuals:D.actuals, training:D.training, guide:D.guide, derived:D.derived,
             raw:DB.raw, empIdByName:DB.empIdByName, fileName:DB.fileName, dirty:DB.dirty,
             tcount:DB._tcount, source:DB.source };
  }
  function cache(){ try{ localStorage.setItem(CACHE, JSON.stringify(snapshot())); }catch(e){} }
  function afterChange(auditMsg){
    DB.dirty=true; D.meta.employeeCount=D.employees.length; D.meta.skillCount=D.skills.length;
    if(auditMsg) DB.changeLog.push({ date:todayStr(), item:auditMsg, responsible:"Web App" });
    cache();
    if(window.recomputeCategories) window.recomputeCategories();
  }

  /* ---------- IndexedDB: persist the file handle across reloads ---------- */
  function idb(){ return new Promise(function(res,rej){ var r=indexedDB.open("qad_fs",1);
    r.onupgradeneeded=function(){ r.result.createObjectStore("h"); };
    r.onsuccess=function(){ res(r.result); }; r.onerror=function(){ rej(r.error); }; }); }
  function idbSet(k,v){ return idb().then(function(db){ return new Promise(function(res){
    var t=db.transaction("h","readwrite"); t.objectStore("h").put(v,k); t.oncomplete=function(){ res(); }; t.onerror=function(){ res(); }; }); }).catch(function(){}); }
  function idbGet(k){ return idb().then(function(db){ return new Promise(function(res){
    var t=db.transaction("h","readonly"); var g=t.objectStore("h").get(k); g.onsuccess=function(){ res(g.result); }; g.onerror=function(){ res(null); }; }); }).catch(function(){ return null; }); }

  async function persistHandle(h){ if(h) try{ await idbSet(HKEY,h); }catch(e){} }
  async function ensurePerm(h, mode){
    if(!h||!h.queryPermission) return false;
    var opt={mode:mode||"readwrite"};
    if((await h.queryPermission(opt))==="granted") return true;
    if((await h.requestPermission(opt))==="granted") return true;
    return false;
  }

  /* ---------- load entry points ---------- */
  async function loadBuffer(buf, fname, source){
    try{
      var wb = XLSX.read(new Uint8Array(buf), { type:"array" });
      var model = buildModel(wb);
      DB.fileName = fname || DB.fileName || "QAD_Skill_Map_DB.xlsx";
      DB.source = source || "file";
      DB.dirty = false; DB.error=null; DB.loadedAt=Date.now(); DB.changeLog=[];
      setLive(model); DB.loaded=true; cache();
      window.__onDataLoaded();
      return true;
    }catch(e){
      DB.error = e.message || String(e); window.__dataError = DB.error;
      window.__onDataLoaded(); return false;
    }
  }

  function download(blob, name){
    var url=URL.createObjectURL(blob); var a=document.createElement("a");
    a.href=url; a.download=name; document.body.appendChild(a); a.click();
    setTimeout(function(){ document.body.removeChild(a); URL.revokeObjectURL(url); },200);
  }

  /* ---------- serialize model → workbook blob ---------- */
  function serializeBlob(){
    var wb = XLSX.utils.book_new();
    var aoa = XLSX.utils.aoa_to_sheet;

    // README (carry over, or default)
    var readme = DB.raw.readme && DB.raw.readme.length ? DB.raw.readme
      : [["QAD Skill Map — Database (edited in Web App)"],[ "Last saved: "+todayStr() ]];
    XLSX.utils.book_append_sheet(wb, aoa(readme), "README");

    // Employees
    var emp=[["EmpID","FullName","Position","Status"]];
    D.employees.forEach(function(e){ emp.push([ e.empId||DB.empIdByName[e.name]||"", e.name, e.position, e.status||"Active" ]); });
    XLSX.utils.book_append_sheet(wb, aoa(emp), "Employees");

    // Positions
    var pos=[["Position","Remark"]];
    D.positions.forEach(function(p){ pos.push([ p, DB.raw.posRemark[p]||"" ]); });
    XLSX.utils.book_append_sheet(wb, aoa(pos), "Positions");

    // Skills
    var sk=[["SkillID","Category","ItemType","SkillType","Detail"]];
    D.skills.forEach(function(s){ sk.push([ s.id, s.category, s.type, s.skillType, s.name ]); });
    XLSX.utils.book_append_sheet(wb, aoa(sk), "Skills");

    // SkillNeeds
    var nd=[["SkillID","SkillDetail","Position","NeedLevel"]];
    D.skills.forEach(function(s){ Object.keys(s.needs).forEach(function(p){ nd.push([ s.id, s.name, p, s.needs[p] ]); }); });
    XLSX.utils.book_append_sheet(wb, aoa(nd), "SkillNeeds");

    // Evaluations (employee × applicable skill)
    var ev=[["EmpID","Employee","Position","SkillID","SkillDetail","NeedLevel","ActualLevel","Gap"]];
    D.employees.forEach(function(e){
      var acts=D.actuals[e.name]||{};
      D.skills.forEach(function(s){
        var need=s.needs[e.position]; if(need==null) return;
        var act=acts[s.id]; var actOut=(act==null?"":act);
        var gap=(act==null?"":Math.max(0,need-act));
        ev.push([ e.empId||DB.empIdByName[e.name]||"", e.name, e.position, s.id, s.name, need, actOut, gap ]);
      });
    });
    XLSX.utils.book_append_sheet(wb, aoa(ev), "Evaluations");

    // TrainingRecords
    var tr=[["Date","Trainee","SkillDetail","LvBefore","LvAfter","Trainer","TrainerLevel"]];
    D.training.forEach(function(r){ tr.push([ r.date, r.trainee, r.item, r.before, r.after, r.trainer, r.trainerLevel ]); });
    XLSX.utils.book_append_sheet(wb, aoa(tr), "TrainingRecords");

    // EvaluationGuide (carry over)
    if(DB.raw.guide && DB.raw.guide.length) XLSX.utils.book_append_sheet(wb, aoa(DB.raw.guide), "EvaluationGuide");
    // SkillTypes (carry over)
    if(DB.raw.skillTypes && DB.raw.skillTypes.length) XLSX.utils.book_append_sheet(wb, aoa(DB.raw.skillTypes), "SkillTypes");
    // ChangeRecord (carry over + appended with audit trail)
    var ch = (DB.raw.change && DB.raw.change.length) ? DB.raw.change.slice() : [["Date","Item","Reason","Responsible"]];
    if(DB.changeLog && DB.changeLog.length){
      DB.changeLog.forEach(function(entry){ ch.push([entry.date, entry.item, entry.reason||"", entry.responsible||"Web App"]); });
      DB.raw.change = ch.slice(); DB.changeLog = [];
    }
    XLSX.utils.book_append_sheet(wb, aoa(ch), "ChangeRecord");

    var out = XLSX.write(wb, { bookType:"xlsx", type:"array" });
    return new Blob([out], { type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  }

  /* ---------- public Store API (consumed by views/app) ---------- */
  function nextSkillId(){
    var max=0; D.skills.forEach(function(s){ var m=/^S(\d+)$/.exec(s.id); if(m) max=Math.max(max,+m[1]); });
    return "S"+pad(max+1,3);
  }
  function nextEmpId(){
    var max=0; D.employees.forEach(function(e){ var m=/^E(\d+)$/.exec(e.empId||""); if(m) max=Math.max(max,+m[1]); });
    Object.keys(DB.empIdByName).forEach(function(n){ var m=/^E(\d+)$/.exec(DB.empIdByName[n]||""); if(m) max=Math.max(max,+m[1]); });
    return "E"+pad(max+1,2);
  }

  var DEPT_NAME={ QAD:"Quality Assurance", PD:"Production" };

  var Store = {
    // ---- meta / compatibility with existing views ----
    current:    function(){ return D.meta.department||"QAD"; },
    currentName:function(){ return D.meta.departmentName || DEPT_NAME[D.meta.department] || D.meta.department || "—"; },
    list:       function(){ return [ D.meta.department||"QAD" ]; },
    counts:     function(){ var o={}; o[D.meta.department||"QAD"]={ emp:D.employees.length, sk:D.skills.length }; return o; },
    get deptMeta(){ var c=D.meta.department||"QAD"; var o={}; o[c]={ code:c, name:this.currentName(), full:this.currentName()+" Dept." }; return o; },
    switchDept: function(){ /* single-file dataset — no-op */ },

    fileName:   function(){ return DB.fileName; },
    isDirty:    function(){ return DB.dirty; },
    isLoaded:   function(){ return DB.loaded; },
    hasHandle:  function(){ return !!DB.fileHandle; },

    // ---- load ----
    loadSample: async function(){
      var r = await fetch("data/QAD_Skill_Map_DB.xlsx");
      if(!r.ok) throw new Error("ไม่พบไฟล์ตัวอย่าง");
      var buf = await r.arrayBuffer();
      DB.fileHandle=null;
      return loadBuffer(buf, "QAD_Skill_Map_DB.xlsx", "sample");
    },
    loadFromSharePoint: async function(){
      if(!window.msalInstance) throw new Error("ยังไม่ได้ตั้งค่า MSAL (ตรวจ index.html)");
      if(!window.SP_FILE_LINK || window.SP_FILE_LINK.indexOf("PUT_")===0)
        throw new Error("ยังไม่ได้ใส่ลิงก์ไฟล์ SharePoint (window.SP_FILE_LINK ใน index.html)");

      var scopes = ["Files.Read.All","Sites.Read.All"];
      // 1) login (popup) — reuse account if already signed in
      var acct = window.msalInstance.getActiveAccount();
      if(!acct){
        var login = await window.msalInstance.loginPopup({ scopes: scopes });
        acct = login.account;
        window.msalInstance.setActiveAccount(acct);
      }
      // 2) token — silent first, fall back to popup
      var token;
      try{
        var s = await window.msalInstance.acquireTokenSilent({ scopes: scopes, account: acct });
        token = s.accessToken;
      }catch(e){
        var p = await window.msalInstance.acquireTokenPopup({ scopes: scopes });
        token = p.accessToken;
      }
      // 3) encode sharing link -> Graph share id
      var enc = btoa(window.SP_FILE_LINK).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
      var shareId = "u!" + enc;
      var graphUrl = "https://graph.microsoft.com/v1.0/shares/" + shareId + "/driveItem/content";
      // 4) download
      var res = await fetch(graphUrl, { headers:{ Authorization:"Bearer "+token } });
      if(!res.ok) throw new Error("โหลดไฟล์จาก SharePoint ไม่สำเร็จ ("+res.status+")");
      var buf = await res.arrayBuffer();
      // 5) feed into the same entry point as local/sample
      DB.fileHandle=null; DB.fileName="QAD_Skill_Map_DB.xlsx (SharePoint)";
      return loadBuffer(buf, "QAD_Skill_Map_DB.xlsx", "sharepoint");
    },
    _spToken: async function(){
      // รอให้ MSAL v3 initialize() เสร็จก่อน
      if(!window.msalInstance && window.initMsal){
        var p = window.initMsal();
        if(p) { try{ await p; }catch(e){} }
      }
      if(window.msalReady){ try{ await window.msalReady; }catch(e){} }
      if(!window.msalInstance) throw new Error("MSAL ยังไม่พร้อม — รอสักครู่แล้วลองใหม่ (ตรวจการเชื่อมต่อ CDN)");
      var scopes = ["User.Read","Files.ReadWrite.All"];
      var account = msalInstance.getAllAccounts()[0];
      if(!account){
        var lr = await msalInstance.loginPopup({ scopes: scopes });
        account = lr.account;
      }
      try{
        return await msalInstance.acquireTokenSilent({ scopes: scopes, account: account });
      }catch(e){
        return await msalInstance.acquireTokenPopup({ scopes: scopes });
      }
    },
    loadFromSharePoint: async function(){
      var tok = await Store._spToken();
      // 3) แปลง sharing link เป็น share ID
      var sharingUrl = window.SP_FILE_URL;
      var encoded = btoa(sharingUrl).replace(/=+$/,"").replace(/\//g,"_").replace(/\+/g,"-");
      var shareId = "u!" + encoded;
      // 3a) ขอ metadata ก่อน เพื่อเก็บ driveId + itemId ไว้ใช้ตอน save
      var metaUrl = "https://graph.microsoft.com/v1.0/shares/" + shareId + "/driveItem?$select=id,name,parentReference";
      var metaRes = await fetch(metaUrl, { headers:{ Authorization:"Bearer " + tok.accessToken } });
      if(!metaRes.ok){
        var mmsg = await metaRes.text().catch(function(){ return ""; });
        throw new Error("เข้าถึงไฟล์ SharePoint ไม่ได้ ("+metaRes.status+") " + mmsg);
      }
      var meta = await metaRes.json();
      DB.spDriveId = meta.parentReference && meta.parentReference.driveId;
      DB.spItemId  = meta.id;
      DB.spName    = meta.name || "QAD_Skill_Map_DB.xlsx";
      // 3b) โหลดเนื้อไฟล์
      var graphUrl = "https://graph.microsoft.com/v1.0/shares/" + shareId + "/driveItem/content";
      var res = await fetch(graphUrl, { headers:{ Authorization:"Bearer " + tok.accessToken } });
      if(!res.ok){
        var msg = await res.text().catch(function(){ return ""; });
        throw new Error("โหลดไฟล์จาก SharePoint ไม่สำเร็จ ("+res.status+") " + msg);
      }
      // 4) ส่ง arrayBuffer เข้า loadBuffer (จุดเชื่อมต่อเดียวกับ local/sample)
      var buf = await res.arrayBuffer();
      DB.fileHandle = null;
      DB.fileName = DB.spName;
      return loadBuffer(buf, DB.spName, "sharepoint");
    },
    saveToSharePoint: async function(){
      if(!DB.spDriveId || !DB.spItemId) throw new Error("ยังไม่ได้โหลดไฟล์จาก SharePoint");
      var tok = await Store._spToken();
      var blob = serializeBlob();
      var buf = await blob.arrayBuffer();
      // เขียนทับไฟล์เดิมด้วย driveId + itemId (เสถียรกว่า encode ลิงก์ซ้ำ)
      var putUrl = "https://graph.microsoft.com/v1.0/drives/" + DB.spDriveId
        + "/items/" + DB.spItemId + "/content";
      var res = await fetch(putUrl, {
        method:"PUT",
        headers:{
          Authorization:"Bearer " + tok.accessToken,
          "Content-Type":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        },
        body: buf
      });
      if(!res.ok){
        var msg = await res.text().catch(function(){ return ""; });
        throw new Error("บันทึกขึ้น SharePoint ไม่สำเร็จ ("+res.status+") " + msg);
      }
      DB.dirty=false; cache();
      return { ok:true, mode:"sharepoint", name:DB.spName };
    },
    importPicker: async function(){
      if(window.showOpenFilePicker){
        try{
          var hs = await window.showOpenFilePicker({ types:[{ description:"Excel", accept:{ "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":[".xlsx"] } }] });
          var h=hs[0]; var f=await h.getFile(); var buf=await f.arrayBuffer();
          DB.fileHandle=h; DB.fileName=h.name; await persistHandle(h);
          return loadBuffer(buf, h.name, "file");
        }catch(e){ if(e && e.name==="AbortError") return false; throw e; }
      }
      return Store._inputPick();
    },
    _inputPick: function(){
      return new Promise(function(res){
        var inp=document.createElement("input"); inp.type="file"; inp.accept=".xlsx,.xls";
        inp.onchange=async function(){ var f=inp.files&&inp.files[0]; if(!f){ res(false); return; }
          var buf=await f.arrayBuffer(); DB.fileHandle=null; DB.fileName=f.name; res(await loadBuffer(buf, f.name, "file")); };
        inp.click();
      });
    },

    // ---- save back to Excel ----
    saveToExcel: async function(){
      // --- Data validation ---
      var vErrors = Store._validate();
      if(vErrors.length > 0){
        var msg = "⚠️ พบปัญหา " + vErrors.length + " รายการ:\n" + vErrors.slice(0,5).join("\n");
        if(!window.confirm(msg + "\n\nบันทึกต่อ?")) return { ok:false, mode:"validation_error" };
      }
      // 0) ถ้าโหลดมาจาก SharePoint → เขียนกลับขึ้น SharePoint
      if(DB.source==="sharepoint" && DB.spItemId){
        return Store.saveToSharePoint();
      }
      var blob = serializeBlob();
      // 1) write to the SAME file we opened (SharePoint/OneDrive synced)
      if(DB.fileHandle && await ensurePerm(DB.fileHandle,"readwrite")){
        try{ var bk=(DB.fileName||"bak").replace(/\.xlsx$/i,"")+"_bak_"+new Date().toISOString().slice(0,16).replace(/[:-]/g,"")+".xlsx"; var of=await DB.fileHandle.getFile(); download(new Blob([await of.arrayBuffer()],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),bk); }catch(be){}
        try{ var cf=await DB.fileHandle.getFile(); if(DB.loadedAt&&cf.lastModified>DB.loadedAt){ if(!window.confirm("⚠️ ไฟล์ถูกแก้ไขจากที่อื่น — เขียนทับ?")) return {ok:false,mode:"conflict"}; } }catch(me){}
        var w=await DB.fileHandle.createWritable(); await w.write(blob); await w.close();
        DB.dirty=false; DB.loadedAt=Date.now(); cache(); return { ok:true, mode:"file", name:DB.fileName };
      }
      // 2) let the user choose a location (and keep the handle for next time)
      if(window.showSaveFilePicker){
        try{
          var h=await window.showSaveFilePicker({ suggestedName:DB.fileName||"QAD_Skill_Map_DB.xlsx",
            types:[{ description:"Excel", accept:{ "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":[".xlsx"] } }] });
          DB.fileHandle=h; DB.fileName=h.name; await persistHandle(h);
          var w2=await h.createWritable(); await w2.write(blob); await w2.close();
          DB.dirty=false; cache(); return { ok:true, mode:"file", name:h.name };
        }catch(e){ if(!(e&&e.name==="AbortError")) { /* fall through to download */ } else { return { ok:false, mode:"cancel" }; } }
      }
      // 3) fallback: download
      download(blob, DB.fileName||"QAD_Skill_Map_DB.xlsx");
      DB.dirty=false; cache(); return { ok:true, mode:"download", name:DB.fileName||"QAD_Skill_Map_DB.xlsx" };
    },
    exportCopy: function(){ download(serializeBlob(), (DB.fileName||"QAD_Skill_Map_DB").replace(/\.xlsx$/i,"")+"_copy.xlsx"); },
    serializeBlob: serializeBlob,   // exposed for round-trip verification / reuse

    // ---- SKILLS ----
    addSkill: function(p){
      var sk={ id:nextSkillId(), category:p.category, type:p.skillType, skillType:p.skillType, name:p.name, needs:p.needs||{} };
      D.skills.push(sk);
      if(window.CATEGORIES && window.CATEGORIES.indexOf(sk.category)<0) window.CATEGORIES.push(sk.category);
      afterChange("Added skill: "+sk.name); return sk;
    },
    updateSkill: function(id,p){
      var sk=D.skills.find(function(s){ return s.id===id; }); if(!sk) return;
      if(p.name!=null) sk.name=p.name;
      if(p.category!=null) sk.category=p.category;
      if(p.skillType!=null){ sk.skillType=p.skillType; sk.type=p.skillType; }
      if(p.needs!=null) sk.needs=p.needs;
      afterChange("Updated skill: "+sk.name);
    },
    deleteSkill: function(id){
      var i=D.skills.findIndex(function(s){ return s.id===id; }); if(i<0) return;
      var skN=D.skills[i].name; D.skills.splice(i,1);
      for(var nm in D.actuals){ if(D.actuals[nm]&&D.actuals[nm][id]!=null) delete D.actuals[nm][id]; }
      for(var j=D.training.length-1;j>=0;j--){ if(D.training[j].skillId===id||D.training[j].item===skN) D.training.splice(j,1); }
      afterChange("Deleted skill: "+skN+" ("+id+")");
    },

    // ---- EMPLOYEES ----
    addEmployee: function(p){
      if(D.employees.some(function(e){ return e.name===p.name; })) return null;
      var id=nextEmpId();
      D.employees.push({ name:p.name, position:p.position, empId:id, status:"Active" });
      D.actuals[p.name]={}; DB.empIdByName[p.name]=id;
      recomputeDerived(); afterChange("Added employee: "+p.name); return p;
    },
    updateEmployee: function(orig,p){
      var e=D.employees.find(function(x){ return x.name===orig; }); if(!e) return;
      var nn=p.name!=null?p.name:orig;
      if(p.position!=null) e.position=p.position;
      if(nn!==orig){
        e.name=nn; D.actuals[nn]=D.actuals[orig]||{}; delete D.actuals[orig];
        DB.empIdByName[nn]=e.empId||DB.empIdByName[orig]||""; delete DB.empIdByName[orig];
        D.training.forEach(function(t){ if(t.trainee===orig) t.trainee=nn; });
      }
      afterChange("Updated employee: "+orig);
    },
    deleteEmployee: function(name){
      var i=D.employees.findIndex(function(e){ return e.name===name; }); if(i<0) return;
      D.employees.splice(i,1); delete D.actuals[name];
      for(var j=D.training.length-1;j>=0;j--){ if(D.training[j].trainee===name) D.training.splice(j,1); }
      afterChange("Deleted employee: "+name);
    },

    // ---- TRAINING ----
    addTraining: function(rec){
      rec._tid=++DB._tcount; D.training.push(rec);
      if(rec.applyScore && rec.skillId!=null){
        D.actuals[rec.trainee]=D.actuals[rec.trainee]||{}; D.actuals[rec.trainee][rec.skillId]=rec.after;
      }
      afterChange("Training: "+rec.trainee+" — "+rec.item); return rec;
    },
    deleteTraining: function(tid){
      var i=D.training.findIndex(function(t){ return t._tid===tid; }); if(i<0) return;
      D.training.splice(i,1); afterChange();
    },
    // ---- ASSESSMENT ----
    updateActual: function(empName, skillId, score){
      if(!D.actuals[empName]) D.actuals[empName]={};
      D.actuals[empName][skillId] = score;
      afterChange("Score update: "+empName+" / "+skillId+" = "+score);
    },
    batchUpdateActuals: function(empName, scoreMap){
      if(!D.actuals[empName]) D.actuals[empName]={};
      var changed=0;
      for(var sid in scoreMap){ if(scoreMap[sid]!=null){ D.actuals[empName][sid] = scoreMap[sid]; changed++; } }
      afterChange("Assessment: "+empName+" ("+changed+" skills updated)");
    },

    // ---- Data validation ----
    _validate: function(){
      var e=[];
      D.employees.forEach(function(x,i){ if(!x.name||!x.name.trim()) e.push("Emp "+(i+1)+": no name"); if(!x.position) e.push(x.name+": no position"); });
      D.skills.forEach(function(s,i){ if(!s.id) e.push("Skill "+(i+1)+": no ID"); if(!s.name) e.push(s.id+": no name"); });
      var ns={}; D.employees.forEach(function(x){ if(ns[x.name]) e.push("Dup name: "+x.name); ns[x.name]=1; });
      var is2={}; D.skills.forEach(function(s){ if(is2[s.id]) e.push("Dup ID: "+s.id); is2[s.id]=1; });
      for(var nm in D.actuals){ for(var sid in D.actuals[nm]){ var v=D.actuals[nm][sid]; if(v!=null&&(v<0||v>10)) e.push(nm+"/"+sid+": score "+v); }}
      return e;
    },
    // ---- reset (clear working copy → back to import) ----
    reset: function(){ try{ localStorage.removeItem(CACHE); }catch(e){} idbSet(HKEY,null); location.reload(); },

    // ---- startup: restore cached working copy + file handle ----
    init: async function(){
      // restore handle (for silent save-back) — best-effort
      try{ var h=await idbGet(HKEY); if(h){ DB.fileHandle=h; } }catch(e){}
      // restore cached model
      try{
        var raw=localStorage.getItem(CACHE);
        if(raw){
          var s=JSON.parse(raw);
          if(s && s.skills && s.skills.length){
            DB.raw=s.raw||DB.raw; DB.empIdByName=s.empIdByName||{}; DB.fileName=s.fileName||"QAD_Skill_Map_DB.xlsx";
            DB._tcount=s.tcount||0; DB.source=s.source||"cache"; DB.dirty=!!s.dirty;
            setLive({ meta:s.meta, positions:s.positions, employees:s.employees, skills:s.skills,
                      actuals:s.actuals, training:s.training, guide:s.guide, derived:s.derived });
            DB.loaded=true; window.__onDataLoaded(); return true;
          }
        }
      }catch(e){}
      return false;
    },
  };

  window.Store = Store;
})();
