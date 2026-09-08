/**
 * thailandProvinces.ts
 *
 * All 77 Thai administrative provinces (76 provinces + Bangkok), each with
 * an approximate provincial-capital centroid (lat/lng) and IANA timezone.
 *
 * Coordinates are provincial-capital centroids, not property-level geocodes —
 * accurate enough for a behavioral-analysis baseline (SELFPRINT does not cast
 * a natal chart; see birthPlace.types.ts scope note). Refine per-district if a
 * future feature needs finer precision.
 */

import type { BirthPlace } from './birthPlace.types';

const TH = 'TH';
const TZ = 'Asia/Bangkok';

const p = (id: string, nameTh: string, nameEn: string, lat: number, lng: number): BirthPlace => ({
  id: `TH-${id}`,
  nameTh,
  nameEn,
  countryCode: TH,
  admin1: nameEn,
  lat,
  lng,
  timezone: TZ,
});

export const THAILAND_PROVINCES: BirthPlace[] = [
  p('AMNAT_CHAROEN', 'อำนาจเจริญ', 'Amnat Charoen', 15.87, 104.63),
  p('ANG_THONG', 'อ่างทอง', 'Ang Thong', 14.59, 100.45),
  p('BANGKOK', 'กรุงเทพมหานคร', 'Bangkok', 13.7563, 100.5018),
  p('BUENG_KAN', 'บึงกาฬ', 'Bueng Kan', 18.36, 103.65),
  p('BURI_RAM', 'บุรีรัมย์', 'Buriram', 14.99, 103.10),
  p('CHACHOENGSAO', 'ฉะเชิงเทรา', 'Chachoengsao', 13.69, 101.07),
  p('CHAI_NAT', 'ชัยนาท', 'Chai Nat', 15.19, 100.13),
  p('CHAIYAPHUM', 'ชัยภูมิ', 'Chaiyaphum', 15.81, 102.03),
  p('CHANTHABURI', 'จันทบุรี', 'Chanthaburi', 12.61, 102.10),
  p('CHIANG_MAI', 'เชียงใหม่', 'Chiang Mai', 18.7883, 98.9853),
  p('CHIANG_RAI', 'เชียงราย', 'Chiang Rai', 19.9105, 99.8406),
  p('CHONBURI', 'ชลบุรี', 'Chonburi', 13.3611, 100.9847),
  p('CHUMPHON', 'ชุมพร', 'Chumphon', 10.4930, 99.1800),
  p('KALASIN', 'กาฬสินธุ์', 'Kalasin', 16.4322, 103.5060),
  p('KAMPHAENG_PHET', 'กำแพงเพชร', 'Kamphaeng Phet', 16.4827, 99.5226),
  p('KANCHANABURI', 'กาญจนบุรี', 'Kanchanaburi', 14.0227, 99.5328),
  p('KHON_KAEN', 'ขอนแก่น', 'Khon Kaen', 16.4419, 102.8360),
  p('KRABI', 'กระบี่', 'Krabi', 8.0863, 98.9063),
  p('LAMPANG', 'ลำปาง', 'Lampang', 18.2888, 99.4909),
  p('LAMPHUN', 'ลำพูน', 'Lamphun', 18.5744, 99.0087),
  p('LOEI', 'เลย', 'Loei', 17.4860, 101.7223),
  p('LOPBURI', 'ลพบุรี', 'Lopburi', 14.7995, 100.6534),
  p('MAE_HONG_SON', 'แม่ฮ่องสอน', 'Mae Hong Son', 19.3020, 97.9654),
  p('MAHA_SARAKHAM', 'มหาสารคาม', 'Maha Sarakham', 16.1850, 103.3000),
  p('MUKDAHAN', 'มุกดาหาร', 'Mukdahan', 16.5450, 104.7220),
  p('NAKHON_NAYOK', 'นครนายก', 'Nakhon Nayok', 14.2069, 101.2130),
  p('NAKHON_PATHOM', 'นครปฐม', 'Nakhon Pathom', 13.8199, 100.0621),
  p('NAKHON_PHANOM', 'นครพนม', 'Nakhon Phanom', 17.4110, 104.7790),
  p('NAKHON_RATCHASIMA', 'นครราชสีมา', 'Nakhon Ratchasima', 14.9799, 102.0977),
  p('NAKHON_SAWAN', 'นครสวรรค์', 'Nakhon Sawan', 15.7030, 100.1370),
  p('NAKHON_SI_THAMMARAT', 'นครศรีธรรมราช', 'Nakhon Si Thammarat', 8.4304, 99.9631),
  p('NAN', 'น่าน', 'Nan', 18.7756, 100.7730),
  p('NARATHIWAT', 'นราธิวาส', 'Narathiwat', 6.4264, 101.8230),
  p('NONG_BUA_LAMPHU', 'หนองบัวลำภู', 'Nong Bua Lamphu', 17.2216, 102.4260),
  p('NONG_KHAI', 'หนองคาย', 'Nong Khai', 17.8783, 102.7420),
  p('NONTHABURI', 'นนทบุรี', 'Nonthaburi', 13.8622, 100.5136),
  p('PATHUM_THANI', 'ปทุมธานี', 'Pathum Thani', 14.0208, 100.5250),
  p('PATTANI', 'ปัตตานี', 'Pattani', 6.8690, 101.2500),
  p('PHANG_NGA', 'พังงา', 'Phang Nga', 8.4510, 98.5310),
  p('PHATTHALUNG', 'พัทลุง', 'Phatthalung', 7.6167, 100.0770),
  p('PHAYAO', 'พะเยา', 'Phayao', 19.1670, 99.9010),
  p('PHETCHABUN', 'เพชรบูรณ์', 'Phetchabun', 16.4190, 101.1590),
  p('PHETCHABURI', 'เพชรบุรี', 'Phetchaburi', 13.1110, 99.9450),
  p('PHICHIT', 'พิจิตร', 'Phichit', 16.4390, 100.3480),
  p('PHITSANULOK', 'พิษณุโลก', 'Phitsanulok', 16.8210, 100.2650),
  p('PHRA_NAKHON_SI_AYUTTHAYA', 'พระนครศรีอยุธยา', 'Phra Nakhon Si Ayutthaya', 14.3532, 100.5680),
  p('PHRAE', 'แพร่', 'Phrae', 18.1450, 100.1400),
  p('PHUKET', 'ภูเก็ต', 'Phuket', 7.8804, 98.3923),
  p('PRACHINBURI', 'ปราจีนบุรี', 'Prachinburi', 14.0500, 101.3660),
  p('PRACHUAP_KHIRI_KHAN', 'ประจวบคีรีขันธ์', 'Prachuap Khiri Khan', 11.8130, 99.7970),
  p('RANONG', 'ระนอง', 'Ranong', 9.9670, 98.6360),
  p('RATCHABURI', 'ราชบุรี', 'Ratchaburi', 13.5360, 99.8170),
  p('RAYONG', 'ระยอง', 'Rayong', 12.6810, 101.2760),
  p('ROI_ET', 'ร้อยเอ็ด', 'Roi Et', 16.0540, 103.6520),
  p('SA_KAEO', 'สระแก้ว', 'Sa Kaeo', 13.8140, 102.0650),
  p('SAKON_NAKHON', 'สกลนคร', 'Sakon Nakhon', 17.1550, 104.1450),
  p('SAMUT_PRAKAN', 'สมุทรปราการ', 'Samut Prakan', 13.5990, 100.5990),
  p('SAMUT_SAKHON', 'สมุทรสาคร', 'Samut Sakhon', 13.5470, 100.2740),
  p('SAMUT_SONGKHRAM', 'สมุทรสงคราม', 'Samut Songkhram', 13.4090, 100.0020),
  p('SARABURI', 'สระบุรี', 'Saraburi', 14.5290, 100.9100),
  p('SATUN', 'สตูล', 'Satun', 6.6230, 100.0670),
  p('SING_BURI', 'สิงห์บุรี', 'Sing Buri', 14.8900, 100.4000),
  p('SISAKET', 'ศรีสะเกษ', 'Sisaket', 15.1190, 104.3220),
  p('SONGKHLA', 'สงขลา', 'Songkhla', 7.1890, 100.5950),
  p('SUKHOTHAI', 'สุโขทัย', 'Sukhothai', 17.0070, 99.8260),
  p('SUPHAN_BURI', 'สุพรรณบุรี', 'Suphan Buri', 14.4720, 100.1180),
  p('SURAT_THANI', 'สุราษฎร์ธานี', 'Surat Thani', 9.1400, 99.3300),
  p('SURIN', 'สุรินทร์', 'Surin', 14.8820, 103.4940),
  p('TAK', 'ตาก', 'Tak', 16.8840, 99.1260),
  p('TRANG', 'ตรัง', 'Trang', 7.5590, 99.6110),
  p('TRAT', 'ตราด', 'Trat', 12.2430, 102.5170),
  p('UBON_RATCHATHANI', 'อุบลราชธานี', 'Ubon Ratchathani', 15.2287, 104.8590),
  p('UDON_THANI', 'อุดรธานี', 'Udon Thani', 17.4140, 102.7870),
  p('UTHAI_THANI', 'อุทัยธานี', 'Uthai Thani', 15.3790, 100.0250),
  p('UTTARADIT', 'อุตรดิตถ์', 'Uttaradit', 17.6200, 100.0990),
  p('YALA', 'ยะลา', 'Yala', 6.5410, 101.2800),
  p('YASOTHON', 'ยโสธร', 'Yasothon', 15.7920, 104.1450),
];

// Sanity: keep this in sync with Thailand's official 77-province count.
if (THAILAND_PROVINCES.length !== 77) {
  throw new Error(`THAILAND_PROVINCES expected 77 entries, got ${THAILAND_PROVINCES.length}`);
}
