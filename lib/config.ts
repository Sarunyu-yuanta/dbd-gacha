// ===== ตั้งค่าเริ่มต้นของงาน =====
// แก้ไขได้ที่นี่ หรือในหน้า 🛠️ ตั้งค่า บนเว็บ (ค่าในเว็บจะถูกจำไว้ใน browser)

/** วันเวลาที่ตู้กาชาปองจะเปิดให้ใช้ (เวลาประเทศไทย +07:00) */
export const EVENT_DATE =
  process.env.NEXT_PUBLIC_EVENT_DATE || "2026-12-23T12:00:00+07:00";

/** รายชื่อตัวอย่าง (แก้ในหน้า 🛠️ ได้) */
export const DEFAULT_NAMES = [
  "Max",
  "Tai",
  "Pang",
  "Yim",
  "Few",
  "Khim",
  "Nook",
];

/** true เมื่อรันด้วย `npm run dev` → ข้ามการล็อกอัตโนมัติ */
export const IS_DEV_ENV = process.env.NODE_ENV === "development";

export const AVATARS = [
  "🦌",
  "⛄",
  "🐧",
  "🎅",
  "🧝",
  "🤶",
  "🐻‍❄️",
  "🦊",
  "🐰",
  "🍪",
  "🦉",
  "🐱",
  "🐶",
  "🐼",
  "🐨",
  "🦄",
  "🐹",
  "🐯",
  "🐸",
  "🐙",
  "🦭",
  "🐳",
  "🦔",
  "🐥",
];

export const COLORS = [
  "#ff4d6d",
  "#2ec4b6",
  "#ffbe0b",
  "#8338ec",
  "#3a86ff",
  "#fb5607",
  "#06d6a0",
  "#ff70a6",
  "#4cc9f0",
  "#e63946",
  "#a7c957",
  "#f4a261",
  "#9b5de5",
  "#00bbf9",
  "#f15bb5",
  "#fee440",
];
