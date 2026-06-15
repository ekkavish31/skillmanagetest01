/* ============================================================
   bootstrap.js — runs FIRST, before SheetJS / db.js / lib.jsx
   Creates the live, mutable data object that lib.jsx destructures.
   db.js fills these SAME references in place once the Excel loads,
   so the React views see the data without re-importing modules.
   ============================================================ */
window.__fillArr = function(arr, src){ arr.length = 0; for(var i=0;i<src.length;i++) arr.push(src[i]); };
window.__fillObj = function(obj, src){ for(var k in obj) delete obj[k]; for(var k2 in src) obj[k2] = src[k2]; };

window.QAD_DATA = {
  meta:        { department:"", departmentName:"", scaleMax:10, employeeCount:0, skillCount:0 },
  positions:   [],
  employees:   [],
  skills:      [],
  actuals:     {},
  training:    [],
  guide:       [],
  derived:     { ladders:{}, subfunctions:[] },
};

// Data-load lifecycle hooks (App registers __onDataLoaded on mount)
window.__onDataLoaded = function(){};   // replaced by App
window.__dataError = null;
