# QAD Skill Intelligence — Workforce Skill Management

ระบบบริหารทักษะองค์กร · อ่าน/เขียนข้อมูลจากไฟล์ Excel โดยตรง · รองรับ TH / EN / JA

---

## 📁 โครงสร้างไฟล์

```
index.html              เพจหลัก (โหลด CSS + JS ทั้งหมด)
css/
  styles.css            สไตล์ทั้งหมด (design system + layout)
js/
  bootstrap.js          สร้างโครงข้อมูลว่าง (รันก่อนสุด)
  db.js                 อ่าน/เขียนไฟล์ Excel (SheetJS) + ตรรกะ add/edit/delete/save
  lib.jsx               i18n (TH/EN/JA), สูตรคำนวณ, UI primitives
  views1.jsx            Dashboard, Heatmap, Readiness, Risk
  views2.jsx            Training, People, Employee Detail + Career, Assessment, Admin
  views3.jsx            Quarterly Trends, Skills Library
  forms.jsx             ฟอร์มเพิ่ม พนักงาน / ทักษะ / คอร์ส
  forms2.jsx            ฟอร์มแก้ไข + ยืนยันการลบ
  app.jsx               shell, router, สลับ role / ภาษา, ปุ่มบันทึก
data/
  QAD_Skill_Map_DB.xlsx ไฟล์ฐานข้อมูลตัวอย่าง (source of truth)
```

> **สำคัญ:** แอพ **ไม่เก็บข้อมูลไว้ในโค้ด** — ข้อมูลทั้งหมดอยู่ในไฟล์ Excel
> เปิดแอพ → เลือกไฟล์ `.xlsx` → แก้ไข → กด **บันทึกลง Excel** เพื่อเขียนกลับลงไฟล์

---

## ▶️ วิธีรัน (ต้องเปิดผ่าน web server — ห้ามดับเบิลคลิกเปิดตรงๆ)

เบราว์เซอร์บล็อกการโหลดไฟล์ `.jsx` และ `.xlsx` เมื่อเปิดแบบ `file://` จึงต้องเสิร์ฟผ่าน HTTP ก่อน เลือกวิธีใดวิธีหนึ่ง:

**A) Node.js**
```bash
cd <โฟลเดอร์นี้>
npx serve .
# เปิด http://localhost:3000
```

**B) Python**
```bash
cd <โฟลเดอร์นี้>
python -m http.server 8080
# เปิด http://localhost:8080
```

**C) VS Code** — ติดตั้งส่วนขยาย **Live Server** → คลิกขวาที่ `index.html` → *Open with Live Server*

**D) วางบนเซิร์ฟเวอร์องค์กร / Static host** — อัปโหลดทั้งโฟลเดอร์ขึ้น IIS / nginx / Apache / Netlify / SharePoint (Site Pages) แล้วเปิด `index.html`

> ใช้ **Google Chrome หรือ Microsoft Edge** เพื่อให้บันทึกเขียนทับไฟล์เดิมได้ (File System Access API)

---

## 💾 การบันทึกกลับลงไฟล์ Excel

| เบราว์เซอร์ | พฤติกรรมเมื่อกด "บันทึกลง Excel" |
|---|---|
| **Chrome / Edge** | เขียนทับไฟล์ `.xlsx` เดิมที่เปิดไว้ได้โดยตรง (เหมาะกับไฟล์ที่ sync กับ OneDrive / SharePoint) |
| Firefox / Safari | บันทึกแบบดาวน์โหลดไฟล์ใหม่ แล้วนำไปวางแทนไฟล์เดิมเอง |

ไฟล์ที่บันทึกออกมามีโครงสร้างครบทั้ง 10 sheet เหมือนต้นฉบับ (Employees, Positions, Skills, SkillNeeds, Evaluations, TrainingRecords, EvaluationGuide, SkillTypes, ChangeRecord, README)

---

## 🔌 อนาคต: เชื่อม SharePoint แบบ multi-user

ปัจจุบันรองรับ **"เปิดไฟล์จาก OneDrive/SharePoint ที่ sync ลงเครื่อง → แก้ → เขียนทับ"**
หากต้องการให้หลายคนแก้พร้อมกันบน SharePoint โดยตรง ขั้นต่อไปคือเชื่อม **Microsoft Graph API**:
1. ลงทะเบียน Azure AD App (อนุญาต `Files.ReadWrite.All` / `Sites.ReadWrite.All`)
2. เพิ่ม MSAL login ในแอพ
3. เปลี่ยนฟังก์ชัน `loadBuffer` / `saveToExcel` ใน `js/db.js` ให้เรียก Graph endpoint แทน File System Access API

จุดเชื่อมต่อทั้งหมดรวมอยู่ใน `js/db.js` ที่เดียว

---

## 👥 บทบาทผู้ใช้ (RBAC)

| Role | สิทธิ์ |
|---|---|
| **HR** | เห็นทุกอย่าง + เพิ่ม/แก้/ลบ + Master Data + บันทึกไฟล์ |
| **Manager** | ทั้งแผนก + เพิ่ม/แก้/ลบ |
| **Leader** | ดูทีมตนเอง |
| **Executive** | Dashboard / การวิเคราะห์ |
| **Employee** | โปรไฟล์ตนเอง + ประเมินตนเอง + Career path |

(สลับ role ได้อิสระสำหรับสาธิต — เมื่อ deploy จริงให้ผูกกับระบบ login ขององค์กร)
