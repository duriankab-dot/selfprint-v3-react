/**
 * internationalPlaces.ts
 *
 * Starter set of non-Thai countries, each mapped to one representative city
 * (usually the capital) with lat/lng + IANA timezone. This is deliberately
 * NOT exhaustive — it is a curated first pass covering SELFPRINT's most
 * likely non-Thai user origins (SE Asia neighbors, East Asia, South Asia,
 * Middle East, Europe, Americas, Oceania, Africa).
 *
 * Extending this list (more countries, or multiple cities per country) is
 * additive — just append more entries, `id`/`countryCode` must stay unique.
 * A country not yet listed here falls through to the "ต่างประเทศ/ไม่พบสถานที่"
 * fallback in the UI (BirthPlaceSelect) — that fallback UX is intentionally
 * left for a later pass.
 */

import type { BirthPlace, Country } from './birthPlace.types';

interface Row {
  countryCode: string;
  countryEn: string;
  countryTh: string;
  cityEn: string;
  cityTh: string;
  lat: number;
  lng: number;
  timezone: string;
}

const ROWS: Row[] = [
  // ── Southeast Asia ──
  { countryCode: 'LA', countryEn: 'Laos', countryTh: 'ลาว', cityEn: 'Vientiane', cityTh: 'เวียงจันทน์', lat: 17.9757, lng: 102.6331, timezone: 'Asia/Vientiane' },
  { countryCode: 'MM', countryEn: 'Myanmar', countryTh: 'เมียนมา', cityEn: 'Naypyidaw', cityTh: 'เนปยีดอ', lat: 19.7633, lng: 96.0785, timezone: 'Asia/Yangon' },
  { countryCode: 'KH', countryEn: 'Cambodia', countryTh: 'กัมพูชา', cityEn: 'Phnom Penh', cityTh: 'พนมเปญ', lat: 11.5564, lng: 104.9282, timezone: 'Asia/Phnom_Penh' },
  { countryCode: 'VN', countryEn: 'Vietnam', countryTh: 'เวียดนาม', cityEn: 'Hanoi', cityTh: 'ฮานอย', lat: 21.0278, lng: 105.8342, timezone: 'Asia/Ho_Chi_Minh' },
  { countryCode: 'MY', countryEn: 'Malaysia', countryTh: 'มาเลเซีย', cityEn: 'Kuala Lumpur', cityTh: 'กัวลาลัมเปอร์', lat: 3.1390, lng: 101.6869, timezone: 'Asia/Kuala_Lumpur' },
  { countryCode: 'SG', countryEn: 'Singapore', countryTh: 'สิงคโปร์', cityEn: 'Singapore', cityTh: 'สิงคโปร์', lat: 1.3521, lng: 103.8198, timezone: 'Asia/Singapore' },
  { countryCode: 'ID', countryEn: 'Indonesia', countryTh: 'อินโดนีเซีย', cityEn: 'Jakarta', cityTh: 'จาการ์ตา', lat: -6.2088, lng: 106.8456, timezone: 'Asia/Jakarta' },
  { countryCode: 'PH', countryEn: 'Philippines', countryTh: 'ฟิลิปปินส์', cityEn: 'Manila', cityTh: 'มะนิลา', lat: 14.5995, lng: 120.9842, timezone: 'Asia/Manila' },
  { countryCode: 'BN', countryEn: 'Brunei', countryTh: 'บรูไน', cityEn: 'Bandar Seri Begawan', cityTh: 'บันดาร์เสรีเบกาวัน', lat: 4.9031, lng: 114.9398, timezone: 'Asia/Brunei' },
  // ── East Asia ──
  { countryCode: 'CN', countryEn: 'China', countryTh: 'จีน', cityEn: 'Beijing', cityTh: 'ปักกิ่ง', lat: 39.9042, lng: 116.4074, timezone: 'Asia/Shanghai' },
  { countryCode: 'JP', countryEn: 'Japan', countryTh: 'ญี่ปุ่น', cityEn: 'Tokyo', cityTh: 'โตเกียว', lat: 35.6762, lng: 139.6503, timezone: 'Asia/Tokyo' },
  { countryCode: 'KR', countryEn: 'South Korea', countryTh: 'เกาหลีใต้', cityEn: 'Seoul', cityTh: 'โซล', lat: 37.5665, lng: 126.9780, timezone: 'Asia/Seoul' },
  { countryCode: 'TW', countryEn: 'Taiwan', countryTh: 'ไต้หวัน', cityEn: 'Taipei', cityTh: 'ไทเป', lat: 25.0330, lng: 121.5654, timezone: 'Asia/Taipei' },
  { countryCode: 'HK', countryEn: 'Hong Kong', countryTh: 'ฮ่องกง', cityEn: 'Hong Kong', cityTh: 'ฮ่องกง', lat: 22.3193, lng: 114.1694, timezone: 'Asia/Hong_Kong' },
  // ── South Asia ──
  { countryCode: 'IN', countryEn: 'India', countryTh: 'อินเดีย', cityEn: 'New Delhi', cityTh: 'นิวเดลี', lat: 28.6139, lng: 77.2090, timezone: 'Asia/Kolkata' },
  { countryCode: 'NP', countryEn: 'Nepal', countryTh: 'เนปาล', cityEn: 'Kathmandu', cityTh: 'กาฐมาณฑุ', lat: 27.7172, lng: 85.3240, timezone: 'Asia/Kathmandu' },
  { countryCode: 'BD', countryEn: 'Bangladesh', countryTh: 'บังกลาเทศ', cityEn: 'Dhaka', cityTh: 'ธากา', lat: 23.8103, lng: 90.4125, timezone: 'Asia/Dhaka' },
  { countryCode: 'LK', countryEn: 'Sri Lanka', countryTh: 'ศรีลังกา', cityEn: 'Colombo', cityTh: 'โคลัมโบ', lat: 6.9271, lng: 79.8612, timezone: 'Asia/Colombo' },
  { countryCode: 'PK', countryEn: 'Pakistan', countryTh: 'ปากีสถาน', cityEn: 'Islamabad', cityTh: 'อิสลามาบัด', lat: 33.6844, lng: 73.0479, timezone: 'Asia/Karachi' },
  // ── Middle East ──
  { countryCode: 'AE', countryEn: 'United Arab Emirates', countryTh: 'สหรัฐอาหรับเอมิเรตส์', cityEn: 'Abu Dhabi', cityTh: 'อาบูดาบี', lat: 24.4539, lng: 54.3773, timezone: 'Asia/Dubai' },
  { countryCode: 'SA', countryEn: 'Saudi Arabia', countryTh: 'ซาอุดีอาระเบีย', cityEn: 'Riyadh', cityTh: 'ริยาด', lat: 24.7136, lng: 46.6753, timezone: 'Asia/Riyadh' },
  { countryCode: 'QA', countryEn: 'Qatar', countryTh: 'กาตาร์', cityEn: 'Doha', cityTh: 'โดฮา', lat: 25.2854, lng: 51.5310, timezone: 'Asia/Qatar' },
  { countryCode: 'IL', countryEn: 'Israel', countryTh: 'อิสราเอล', cityEn: 'Jerusalem', cityTh: 'เยรูซาเล็ม', lat: 31.7683, lng: 35.2137, timezone: 'Asia/Jerusalem' },
  { countryCode: 'TR', countryEn: 'Turkey', countryTh: 'ตุรกี', cityEn: 'Ankara', cityTh: 'อังการา', lat: 39.9334, lng: 32.8597, timezone: 'Europe/Istanbul' },
  // ── Europe ──
  { countryCode: 'RU', countryEn: 'Russia', countryTh: 'รัสเซีย', cityEn: 'Moscow', cityTh: 'มอสโก', lat: 55.7558, lng: 37.6173, timezone: 'Europe/Moscow' },
  { countryCode: 'GB', countryEn: 'United Kingdom', countryTh: 'สหราชอาณาจักร', cityEn: 'London', cityTh: 'ลอนดอน', lat: 51.5072, lng: -0.1276, timezone: 'Europe/London' },
  { countryCode: 'IE', countryEn: 'Ireland', countryTh: 'ไอร์แลนด์', cityEn: 'Dublin', cityTh: 'ดับลิน', lat: 53.3498, lng: -6.2603, timezone: 'Europe/Dublin' },
  { countryCode: 'FR', countryEn: 'France', countryTh: 'ฝรั่งเศส', cityEn: 'Paris', cityTh: 'ปารีส', lat: 48.8566, lng: 2.3522, timezone: 'Europe/Paris' },
  { countryCode: 'DE', countryEn: 'Germany', countryTh: 'เยอรมนี', cityEn: 'Berlin', cityTh: 'เบอร์ลิน', lat: 52.5200, lng: 13.4050, timezone: 'Europe/Berlin' },
  { countryCode: 'NL', countryEn: 'Netherlands', countryTh: 'เนเธอร์แลนด์', cityEn: 'Amsterdam', cityTh: 'อัมสเตอร์ดัม', lat: 52.3676, lng: 4.9041, timezone: 'Europe/Amsterdam' },
  { countryCode: 'CH', countryEn: 'Switzerland', countryTh: 'สวิตเซอร์แลนด์', cityEn: 'Bern', cityTh: 'เบิร์น', lat: 46.9480, lng: 7.4474, timezone: 'Europe/Zurich' },
  { countryCode: 'IT', countryEn: 'Italy', countryTh: 'อิตาลี', cityEn: 'Rome', cityTh: 'โรม', lat: 41.9028, lng: 12.4964, timezone: 'Europe/Rome' },
  { countryCode: 'ES', countryEn: 'Spain', countryTh: 'สเปน', cityEn: 'Madrid', cityTh: 'มาดริด', lat: 40.4168, lng: -3.7038, timezone: 'Europe/Madrid' },
  { countryCode: 'PT', countryEn: 'Portugal', countryTh: 'โปรตุเกส', cityEn: 'Lisbon', cityTh: 'ลิสบอน', lat: 38.7223, lng: -9.1393, timezone: 'Europe/Lisbon' },
  { countryCode: 'SE', countryEn: 'Sweden', countryTh: 'สวีเดน', cityEn: 'Stockholm', cityTh: 'สตอกโฮล์ม', lat: 59.3293, lng: 18.0686, timezone: 'Europe/Stockholm' },
  { countryCode: 'NO', countryEn: 'Norway', countryTh: 'นอร์เวย์', cityEn: 'Oslo', cityTh: 'ออสโล', lat: 59.9139, lng: 10.7522, timezone: 'Europe/Oslo' },
  { countryCode: 'DK', countryEn: 'Denmark', countryTh: 'เดนมาร์ก', cityEn: 'Copenhagen', cityTh: 'โคเปนเฮเกน', lat: 55.6761, lng: 12.5683, timezone: 'Europe/Copenhagen' },
  { countryCode: 'FI', countryEn: 'Finland', countryTh: 'ฟินแลนด์', cityEn: 'Helsinki', cityTh: 'เฮลซิงกิ', lat: 60.1699, lng: 24.9384, timezone: 'Europe/Helsinki' },
  { countryCode: 'PL', countryEn: 'Poland', countryTh: 'โปแลนด์', cityEn: 'Warsaw', cityTh: 'วอร์ซอ', lat: 52.2297, lng: 21.0122, timezone: 'Europe/Warsaw' },
  { countryCode: 'GR', countryEn: 'Greece', countryTh: 'กรีซ', cityEn: 'Athens', cityTh: 'เอเธนส์', lat: 37.9838, lng: 23.7275, timezone: 'Europe/Athens' },
  // ── Americas ──
  { countryCode: 'US', countryEn: 'United States', countryTh: 'สหรัฐอเมริกา', cityEn: 'Washington, D.C.', cityTh: 'วอชิงตัน ดี.ซี.', lat: 38.9072, lng: -77.0369, timezone: 'America/New_York' },
  { countryCode: 'CA', countryEn: 'Canada', countryTh: 'แคนาดา', cityEn: 'Ottawa', cityTh: 'ออตตาวา', lat: 45.4215, lng: -75.6972, timezone: 'America/Toronto' },
  { countryCode: 'MX', countryEn: 'Mexico', countryTh: 'เม็กซิโก', cityEn: 'Mexico City', cityTh: 'เม็กซิโกซิตี้', lat: 19.4326, lng: -99.1332, timezone: 'America/Mexico_City' },
  { countryCode: 'BR', countryEn: 'Brazil', countryTh: 'บราซิล', cityEn: 'Brasília', cityTh: 'บราซิเลีย', lat: -15.7975, lng: -47.8919, timezone: 'America/Sao_Paulo' },
  { countryCode: 'AR', countryEn: 'Argentina', countryTh: 'อาร์เจนตินา', cityEn: 'Buenos Aires', cityTh: 'บัวโนสไอเรส', lat: -34.6037, lng: -58.3816, timezone: 'America/Argentina/Buenos_Aires' },
  // ── Oceania ──
  { countryCode: 'AU', countryEn: 'Australia', countryTh: 'ออสเตรเลีย', cityEn: 'Canberra', cityTh: 'แคนเบอร์รา', lat: -35.2809, lng: 149.1300, timezone: 'Australia/Sydney' },
  { countryCode: 'NZ', countryEn: 'New Zealand', countryTh: 'นิวซีแลนด์', cityEn: 'Wellington', cityTh: 'เวลลิงตัน', lat: -41.2865, lng: 174.7762, timezone: 'Pacific/Auckland' },
  // ── Africa ──
  { countryCode: 'ZA', countryEn: 'South Africa', countryTh: 'แอฟริกาใต้', cityEn: 'Pretoria', cityTh: 'พริทอเรีย', lat: -25.7479, lng: 28.2293, timezone: 'Africa/Johannesburg' },
  { countryCode: 'EG', countryEn: 'Egypt', countryTh: 'อียิปต์', cityEn: 'Cairo', cityTh: 'ไคโร', lat: 30.0444, lng: 31.2357, timezone: 'Africa/Cairo' },
  { countryCode: 'NG', countryEn: 'Nigeria', countryTh: 'ไนจีเรีย', cityEn: 'Abuja', cityTh: 'อาบูจา', lat: 9.0765, lng: 7.3986, timezone: 'Africa/Lagos' },
];

export const INTERNATIONAL_PLACES: BirthPlace[] = ROWS.map((r) => ({
  id: `INTL-${r.countryCode}`,
  nameTh: r.cityTh,
  nameEn: r.cityEn,
  countryCode: r.countryCode,
  admin1: r.countryEn,
  lat: r.lat,
  lng: r.lng,
  timezone: r.timezone,
}));

export const INTERNATIONAL_COUNTRIES: Country[] = ROWS.map((r) => ({
  code: r.countryCode,
  nameTh: r.countryTh,
  nameEn: r.countryEn,
})).sort((a, b) => a.nameEn.localeCompare(b.nameEn));
