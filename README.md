# 🎄 DBD Gacha Gift Exchange

เว็บจับฉลากแลกของขวัญธีมคริสต์มาส + ปีใหม่ แบบตู้กาชาปอง (Next.js App Router + TypeScript)

## เริ่มใช้งาน

```bash
npm install
npm run dev      # http://localhost:3000 — Dev mode: ตู้เปิดใช้ได้ทันที ไม่ต้องรอวันงาน
npm run build && npm start   # Production: ล็อกนับถอยหลังจนถึงวันงาน
```

## ตั้งค่า
- วันเวลางาน / รายชื่อเริ่มต้น: `lib/config.ts` (หรือ env `NEXT_PUBLIC_EVENT_DATE`)
- แก้รายชื่อ, วันเวลา, ย้อนตา, รีเซ็ต: ปุ่ม 🛠️ บนเว็บ (บันทึกใน localStorage ของเบราว์เซอร์)

## Dev mode
- `npm run dev` → เปิดอัตโนมัติ
- บน production: เติม `?dev=1` ท้าย URL หรือพิมพ์ `d` `e` `v` บนคีย์บอร์ด (`?dev=0` เพื่อปิด)
- ใน 🛠️ มีปุ่ม "จำลองนับถอยหลัง 10 วิ" ไว้ดูแอนิเมชันปลดล็อก

## โครงสร้าง
- `app/` — layout, page, globals.css (ธีม + animation ทั้งหมด)
- `components/GachaApp.tsx` — state หลัก + flow การจับ
- `components/` — GachaMachine (physics ลูกบอล), Wheel, Reveal, LockScreen, DoneOverlay, AdminPanel, Scenery ฯลฯ
- `lib/draw.ts` — logic จับต่อกันเป็นทอด (ไม่ได้ของตัวเอง + กันทางตัน)
- `lib/music.ts` — เพลง/เสียงเอฟเฟกต์ด้วย Web Audio (ไม่มีไฟล์เพลง)
- `lib/effects.ts` — หิมะ, confetti, พลุ
