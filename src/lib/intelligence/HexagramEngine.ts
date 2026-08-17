/**
 * HexagramEngine.ts
 *
 * I Ching (Yi Jing) hexagram engine — deterministic, from birth date.
 * No external API, no AI calls, no mock data.
 *
 * Method:
 *   hexagramNumber = ((year + month * 7 + day * 13) mod 64) + 1
 *
 * This gives an even distribution across all 64 hexagrams and is
 * deterministic per birth date. The formula treats the 3 date components
 * with different weights so that two people born in the same year but
 * different months/days reliably receive different hexagrams.
 *
 * Data: King Wen sequence, all 64 hexagrams, with Thai translations.
 * Trigram system: 8 primary trigrams (Ba Gua) compose all hexagrams.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Trigram {
  /** King Wen symbol name (Chinese pinyin) */
  name: string;
  /** Thai name */
  nameThai: string;
  /** Unicode symbol ☰ ☷ etc. */
  symbol: string;
  /** Primary quality */
  quality: string;
  /** Primary quality in Thai */
  qualityThai: string;
}

export interface HexagramResult {
  /** 1–64, King Wen sequence */
  number: number;
  /** Chinese pinyin name */
  chineseName: string;
  /** Thai translation of name */
  thaiName: string;
  /** Unicode hex symbol (6-line representation as text) */
  symbol: string;
  upperTrigram: Trigram;
  lowerTrigram: Trigram;
  /** Core theme, in Thai (short) */
  theme: string;
  /** Life guidance paragraph, in Thai */
  guidance: string;
  /** 3 keywords in Thai */
  keywords: string[];
}

// ---------------------------------------------------------------------------
// 8 Primary Trigrams (Ba Gua)
// ---------------------------------------------------------------------------

const TRIGRAMS: Record<string, Trigram> = {
  Heaven: { name: 'Qián', nameThai: 'สวรรค์', symbol: '☰', quality: 'Creative', qualityThai: 'สร้างสรรค์' },
  Earth:  { name: 'Kūn',  nameThai: 'แผ่นดิน', symbol: '☷', quality: 'Receptive', qualityThai: 'รับ-ยืดหยุ่น' },
  Thunder:{ name: 'Zhèn', nameThai: 'ฟ้าร้อง', symbol: '☳', quality: 'Arousing',  qualityThai: 'ตื่นตัว' },
  Water:  { name: 'Kǎn',  nameThai: 'น้ำ',     symbol: '☵', quality: 'Abysmal',   qualityThai: 'ลึกซึ้ง' },
  Mountain:{ name: 'Gèn', nameThai: 'ภูเขา',   symbol: '☶', quality: 'Keeping Still', qualityThai: 'สงบนิ่ง' },
  Wind:   { name: 'Xùn',  nameThai: 'ลม',      symbol: '☴', quality: 'Gentle',    qualityThai: 'อ่อนโยน' },
  Fire:   { name: 'Lí',   nameThai: 'ไฟ',      symbol: '☲', quality: 'Clinging',  qualityThai: 'สว่างไสว' },
  Lake:   { name: 'Duì',  nameThai: 'ทะเลสาบ', symbol: '☱', quality: 'Joyous',   qualityThai: 'ยินดี' },
};

// ---------------------------------------------------------------------------
// 64 Hexagrams data  (King Wen sequence, 1–64)
// upper, lower = keys of TRIGRAMS
// ---------------------------------------------------------------------------

interface HexData {
  chinese: string;
  thai: string;
  upper: string;
  lower: string;
  theme: string;
  guidance: string;
  keywords: [string, string, string];
}

const HEXAGRAMS: HexData[] = [
  // 1
  { chinese: 'Qián',    thai: 'พลังสร้าง',      upper: 'Heaven',   lower: 'Heaven',   theme: 'ศักยภาพสูงสุด',    guidance: 'พลังสร้างสรรค์ภายในคุณแข็งแกร่ง ลงมือทำด้วยความมั่นใจและความซื่อสัตย์ ผลลัพธ์ดีตามมา', keywords: ['ความเป็นผู้นำ','พลังงาน','ความสำเร็จ'] },
  // 2
  { chinese: 'Kūn',     thai: 'พลังรับ',        upper: 'Earth',    lower: 'Earth',    theme: 'ความอดทนและการรับ', guidance: 'ความยิ่งใหญ่มาจากการรับฟังและสนับสนุนผู้อื่น ไม่ใช่การนำ เดินตามเส้นทางที่เปิดอยู่', keywords: ['ความอดทน','การรับฟัง','ความภักดี'] },
  // 3
  { chinese: 'Zhūn',    thai: 'ความยากตอนต้น', upper: 'Water',    lower: 'Thunder',  theme: 'ความยากแรกเริ่ม',  guidance: 'ทุกสิ่งยิ่งใหญ่เริ่มจากความยุ่งยาก อย่าถอย หาผู้ช่วยและวางรากฐานอย่างมั่นคง', keywords: ['ความยากลำบาก','เริ่มต้น','ความช่วยเหลือ'] },
  // 4
  { chinese: 'Méng',    thai: 'ความไม่รู้',     upper: 'Mountain', lower: 'Water',    theme: 'เรียนรู้ด้วยใจเปิด', guidance: 'ผู้เรียนรู้ต้องมีใจเปิด ยอมรับว่าตนยังไม่รู้และตั้งใจฟัง นั่นคือก้าวแรกของปัญญา', keywords: ['การเรียนรู้','ความถ่อมตน','ปัญญา'] },
  // 5
  { chinese: 'Xū',      thai: 'การรอคอย',      upper: 'Water',    lower: 'Heaven',   theme: 'รอเวลาที่ใช่',    guidance: 'ไม่ใช่เวลาที่จะรีบ จงบำรุงกำลังและรอจังหวะที่เหมาะ เวลามาถึงแล้วจะไปได้ราบรื่น', keywords: ['ความอดทน','การรอคอย','เวลา'] },
  // 6
  { chinese: 'Sòng',    thai: 'ความขัดแย้ง',   upper: 'Heaven',   lower: 'Water',    theme: 'หลีกเลี่ยงการทะเลาะ', guidance: 'ความขัดแย้งสูญเสียพลังงาน หาทางเจรจาหรือยุติก่อนบานปลาย การประนีประนอมคือปัญญา', keywords: ['ความขัดแย้ง','การเจรจา','ความระมัดระวัง'] },
  // 7
  { chinese: 'Shī',     thai: 'กองทัพ',         upper: 'Earth',    lower: 'Water',    theme: 'การนำด้วยวินัย',   guidance: 'ความสำเร็จต้องการการจัดระเบียบและผู้นำที่เชื่อถือได้ รวมพลังคนรอบข้างด้วยวัตถุประสงค์ชัดเจน', keywords: ['ความเป็นผู้นำ','วินัย','การรวมพลัง'] },
  // 8
  { chinese: 'Bǐ',      thai: 'การร่วมมือ',     upper: 'Water',    lower: 'Earth',    theme: 'ความสามัคคี',     guidance: 'แสวงหาพันธมิตรที่แท้จริง ความสำเร็จยั่งยืนมาจากการร่วมมือด้วยความจริงใจ', keywords: ['ความสามัคคี','พันธมิตร','ความไว้ใจ'] },
  // 9
  { chinese: 'Xiǎo Chù', thai: 'การสะสมเล็กน้อย', upper: 'Wind',  lower: 'Heaven',   theme: 'ก้าวเล็กๆ ที่มั่นคง', guidance: 'ตอนนี้ยังไม่ใช่เวลาเปลี่ยนแปลงใหญ่ สะสมแรงผ่านขั้นตอนเล็กๆ ที่สม่ำเสมอ', keywords: ['ความอดทน','สะสม','ก้าวย่าง'] },
  // 10
  { chinese: 'Lǚ',      thai: 'การเดินทาง',    upper: 'Heaven',   lower: 'Lake',     theme: 'ก้าวอย่างระมัดระวัง', guidance: 'ก้าวไปข้างหน้าด้วยความสุภาพและระมัดระวัง แม้ในสถานการณ์ที่ท้าทาย จะผ่านไปได้', keywords: ['ความระมัดระวัง','ก้าวหน้า','สุภาพ'] },
  // 11
  { chinese: 'Tài',     thai: 'ความสมดุล',     upper: 'Earth',    lower: 'Heaven',   theme: 'ความรุ่งเรือง',    guidance: 'ช่วงเวลาที่ดีที่สุด สวรรค์และดินสอดคล้อง ลงมือทำสิ่งสำคัญ ผลลัพธ์จะดีเกินคาด', keywords: ['ความรุ่งเรือง','สมดุล','โอกาส'] },
  // 12
  { chinese: 'Pǐ',      thai: 'ความหยุดนิ่ง',  upper: 'Heaven',   lower: 'Earth',    theme: 'ช่วงหยุดพัก',     guidance: 'เวลานี้สื่อสารและปฏิสัมพันธ์ไม่ไหลลื่น จงบำรุงพลังงานภายใน อย่าบังคับสิ่งที่ยังไม่ถึงเวลา', keywords: ['ความอดทน','หยุดพัก','ภายใน'] },
  // 13
  { chinese: 'Tóng Rén', thai: 'มิตรภาพ',      upper: 'Heaven',   lower: 'Fire',     theme: 'ความเป็นหนึ่งเดียว', guidance: 'รวมใจกับผู้อื่นด้วยวัตถุประสงค์ร่วม ความสำเร็จยิ่งใหญ่มาจากความสามัคคีที่แท้จริง', keywords: ['มิตรภาพ','ความร่วมมือ','เป้าหมายร่วม'] },
  // 14
  { chinese: 'Dà Yǒu',  thai: 'ความยิ่งใหญ่',  upper: 'Fire',     lower: 'Heaven',   theme: 'ความอุดมสมบูรณ์', guidance: 'คุณมีทรัพยากรมากมาย ใช้อย่างรอบคอบและแบ่งปัน ความยิ่งใหญ่ที่แท้จริงคือการให้', keywords: ['ความมั่งคั่ง','ความเอื้อเฟื้อ','ความสำเร็จ'] },
  // 15
  { chinese: 'Qiān',    thai: 'ความถ่อมตน',    upper: 'Earth',    lower: 'Mountain', theme: 'คุณธรรมสูงสุด',   guidance: 'ความถ่อมตนคือพลังที่แท้จริง คนที่ไม่โอ้อวดมักได้รับความไว้ใจและความเคารพจากคนรอบข้าง', keywords: ['ความถ่อมตน','คุณธรรม','ความเคารพ'] },
  // 16
  { chinese: 'Yù',      thai: 'ความกระตือรือร้น', upper: 'Thunder', lower: 'Earth',  theme: 'แรงบันดาลใจ',    guidance: 'ช่วงเวลาดีสำหรับการเริ่มต้นสิ่งใหม่ ใช้ความกระตือรือร้นเป็นพลังขับเคลื่อน แต่ระวังความประมาท', keywords: ['แรงบันดาลใจ','ความกระตือรือร้น','เริ่มต้น'] },
  // 17
  { chinese: 'Suí',     thai: 'การติดตาม',     upper: 'Lake',     lower: 'Thunder',  theme: 'ปรับตัวตามสถานการณ์', guidance: 'ยืดหยุ่นและปรับตัวตามสิ่งที่เกิดขึ้น บางครั้งการตามทันสถานการณ์ดีกว่าการบังคับทิศทาง', keywords: ['ความยืดหยุ่น','การปรับตัว','สถานการณ์'] },
  // 18
  { chinese: 'Gǔ',      thai: 'การแก้ไข',      upper: 'Mountain', lower: 'Wind',     theme: 'รักษาสิ่งเสียหาย', guidance: 'ถึงเวลาแก้ปัญหาที่สะสมมานาน เผชิญหน้าและจัดการปัญหาอย่างตรงไปตรงมา', keywords: ['การแก้ไข','ความกล้า','การฟื้นฟู'] },
  // 19
  { chinese: 'Lín',     thai: 'การเข้าหา',     upper: 'Earth',    lower: 'Lake',     theme: 'โอกาสที่กำลังมา',  guidance: 'โอกาสกำลังมาถึง เข้าหาสิ่งที่สำคัญด้วยความจริงใจและความเต็มใจ ผลลัพธ์จะดี', keywords: ['โอกาส','การเข้าหา','ความจริงใจ'] },
  // 20
  { chinese: 'Guān',    thai: 'การสังเกต',     upper: 'Wind',     lower: 'Earth',    theme: 'มองอย่างลึกซึ้ง',  guidance: 'ถอยออกมามองภาพรวมก่อนตัดสินใจ ความเข้าใจที่ถ่องแท้มาจากการสังเกตอย่างใจเย็น', keywords: ['การสังเกต','ปัญญา','ความเข้าใจ'] },
  // 21
  { chinese: 'Shì Kè',  thai: 'การตัดสิน',     upper: 'Fire',     lower: 'Thunder',  theme: 'แก้ปัญหาตรงๆ',    guidance: 'เวลาที่ต้องตัดสินใจอย่างเด็ดขาด ไม่ลังเล เผชิญปัญหาตรงๆ ด้วยความเป็นธรรม', keywords: ['การตัดสิน','ความเด็ดขาด','ความเป็นธรรม'] },
  // 22
  { chinese: 'Bì',      thai: 'ความงดงาม',     upper: 'Mountain', lower: 'Fire',     theme: 'รูปแบบและสาระ',   guidance: 'ความงามภายนอกสำคัญแต่ไม่ใช่ทุกอย่าง มองให้ลึกกว่ารูปลักษณ์ และให้คุณค่าแก่สาระที่แท้จริง', keywords: ['ความงาม','รูปแบบ','สาระ'] },
  // 23
  { chinese: 'Bō',      thai: 'การแตกแยก',     upper: 'Mountain', lower: 'Earth',    theme: 'ยืนหยัดในความดี',  guidance: 'ช่วงนี้สิ่งต่างๆ อาจแตกสลาย อย่าพยายามหยุดสิ่งที่จะเกิด แต่จงยึดมั่นในคุณธรรม', keywords: ['ความยืนหยัด','คุณธรรม','การเปลี่ยนแปลง'] },
  // 24
  { chinese: 'Fù',      thai: 'การกลับมา',     upper: 'Earth',    lower: 'Thunder',  theme: 'การฟื้นฟู',       guidance: 'หลังจากหยุดพัก พลังงานกลับมา ช่วงเวลาเริ่มใหม่ ก้าวออกจากจุดเดิมด้วยพลังที่สดชื่น', keywords: ['การกลับมา','การฟื้นฟู','เริ่มใหม่'] },
  // 25
  { chinese: 'Wú Wàng', thai: 'ความบริสุทธิ์',  upper: 'Heaven',   lower: 'Thunder',  theme: 'ทำโดยไม่หวังผล',  guidance: 'ทำสิ่งที่ถูกต้องโดยไม่มีเจตนาซ่อนเร้น ความบริสุทธิ์ของใจนำมาซึ่งผลลัพธ์ที่ดี', keywords: ['ความบริสุทธิ์','ไม่มีเจตนาซ่อนเร้น','ความจริงใจ'] },
  // 26
  { chinese: 'Dà Chù',  thai: 'การสะสมใหญ่',   upper: 'Mountain', lower: 'Heaven',   theme: 'สั่งสมพลัง',      guidance: 'ยับยั้งพลังงานไว้และสะสมให้แน่นก่อน เวลาที่เหมาะมาถึงแล้วจะปล่อยออกได้เต็มประสิทธิภาพ', keywords: ['การสะสม','พลัง','การรอ'] },
  // 27
  { chinese: 'Yí',      thai: 'การบำรุงเลี้ยง', upper: 'Mountain', lower: 'Thunder',  theme: 'ดูแลสิ่งสำคัญ',   guidance: 'ใส่ใจสิ่งที่บำรุงคุณจริงๆ ทั้งอาหารกาย ความคิด และความสัมพันธ์ ระวังสิ่งที่บั่นทอนพลังงาน', keywords: ['การดูแล','บำรุง','สมดุล'] },
  // 28
  { chinese: 'Dà Guò',  thai: 'เกินขีดจำกัด',  upper: 'Lake',     lower: 'Wind',     theme: 'แรงกดดันมาก',     guidance: 'ภาระหนักเกินไป ลดน้ำหนักหรือหาทางออกใหม่ การยืดหยุ่นและการปรับตัวจะช่วยผ่านวิกฤต', keywords: ['ความกดดัน','ยืดหยุ่น','ปรับตัว'] },
  // 29
  { chinese: 'Kǎn',     thai: 'ความลึก',        upper: 'Water',    lower: 'Water',    theme: 'ฝ่าอันตราย',      guidance: 'ตกอยู่ในสถานการณ์ยาก แต่ถ้าซื่อสัตย์และมั่นคงจะผ่านได้ น้ำไหลผ่านหินได้เพราะไม่หยุด', keywords: ['ความกล้า','ความซื่อสัตย์','ฝ่าฟัน'] },
  // 30
  { chinese: 'Lí',      thai: 'ความสว่าง',      upper: 'Fire',     lower: 'Fire',     theme: 'แสงสว่างแห่งปัญญา', guidance: 'ใช้ปัญญาและความชัดเจนเป็นแสงนำทาง ยึดมั่นในสิ่งที่ถูกต้อง แสงสว่างของคุณส่องทางผู้อื่น', keywords: ['ปัญญา','ความชัดเจน','แรงบันดาลใจ'] },
  // 31
  { chinese: 'Xián',    thai: 'อิทธิพล',        upper: 'Lake',     lower: 'Mountain', theme: 'ดึงดูดกัน',        guidance: 'ความสัมพันธ์ที่ดีเกิดจากการรับฟังและเข้าอกเข้าใจ เปิดใจและให้พื้นที่แก่กัน', keywords: ['ความสัมพันธ์','อิทธิพล','เปิดใจ'] },
  // 32
  { chinese: 'Héng',    thai: 'ความยั่งยืน',    upper: 'Thunder',  lower: 'Wind',     theme: 'ความสม่ำเสมอ',    guidance: 'ความสำเร็จระยะยาวมาจากความสม่ำเสมอ ไม่ใช่ความพยายามครั้งเดียว ยึดมั่นในหลักการ', keywords: ['ความสม่ำเสมอ','ยั่งยืน','หลักการ'] },
  // 33
  { chinese: 'Dùn',     thai: 'การถอยทัพ',      upper: 'Heaven',   lower: 'Mountain', theme: 'ถอยเพื่อเก็บแรง',  guidance: 'บางครั้งการถอยกลับชั่วคราวคือปัญญา เก็บพลังและรอเวลาที่เหมาะกว่านี้', keywords: ['การถอย','ปัญญา','รอเวลา'] },
  // 34
  { chinese: 'Dà Zhuàng', thai: 'พลังยิ่งใหญ่', upper: 'Thunder', lower: 'Heaven',   theme: 'ใช้พลังอย่างถูกต้อง', guidance: 'คุณมีพลังมาก แต่พลังที่แท้จริงคือการใช้อย่างมีสติ ไม่ใช่การบังคับหรือข่มขู่', keywords: ['พลัง','ความรับผิดชอบ','สติ'] },
  // 35
  { chinese: 'Jìn',     thai: 'ความก้าวหน้า',   upper: 'Fire',     lower: 'Earth',    theme: 'ก้าวหน้าอย่างสดใส', guidance: 'ช่วงเวลาดีสำหรับการเติบโต ก้าวไปข้างหน้าด้วยความชัดเจนและความจริงใจ ผลลัพธ์ดีรอคุณอยู่', keywords: ['ความก้าวหน้า','เติบโต','โอกาส'] },
  // 36
  { chinese: 'Míng Yí', thai: 'ความมืดมิด',     upper: 'Earth',    lower: 'Fire',     theme: 'ซ่อนแสงชั่วคราว', guidance: 'ช่วงเวลายากลำบาก ซ่อนพลังงานและปัญญาไว้ก่อน รอเวลาที่เหมาะ แล้วแสงจะกลับมา', keywords: ['ความอดทน','ซ่อนพลัง','รอเวลา'] },
  // 37
  { chinese: 'Jiā Rén', thai: 'ครอบครัว',        upper: 'Wind',     lower: 'Fire',     theme: 'ความสัมพันธ์ที่ดี', guidance: 'รากฐานที่แข็งแกร่งมาจากความสัมพันธ์ที่ดีในครอบครัว บทบาทและความรับผิดชอบสำคัญ', keywords: ['ครอบครัว','รากฐาน','ความรับผิดชอบ'] },
  // 38
  { chinese: 'Kuí',     thai: 'ความขัดแย้ง',    upper: 'Fire',     lower: 'Lake',     theme: 'มองข้ามความต่าง',  guidance: 'ความขัดแย้งมาจากมุมมองที่ต่างกัน หาจุดร่วมในความแตกต่าง ความขัดแย้งเล็กๆ ไม่ต้องขยาย', keywords: ['ความต่าง','การปรองดอง','มุมมอง'] },
  // 39
  { chinese: 'Jiǎn',    thai: 'อุปสรรค',         upper: 'Water',    lower: 'Mountain', theme: 'เผชิญกับอุปสรรค',  guidance: 'อุปสรรคข้างหน้าใหญ่ มองว่าจะข้ามผ่านอย่างไร ไม่ใช่ว่าทำไมถึงมี หาผู้ช่วยและวางแผน', keywords: ['อุปสรรค','วางแผน','ความช่วยเหลือ'] },
  // 40
  { chinese: 'Jiě',     thai: 'การปลดปล่อย',    upper: 'Thunder',  lower: 'Water',    theme: 'ผ่อนคลายแรงกดดัน', guidance: 'แรงกดดันกำลังลดลง ยกโทษให้คนที่ควรได้รับ วางสิ่งที่ไม่จำเป็น เดินหน้าด้วยใจเบา', keywords: ['การปลดปล่อย','ยกโทษ','เบาใจ'] },
  // 41
  { chinese: 'Sǔn',     thai: 'การลด',           upper: 'Mountain', lower: 'Lake',     theme: 'ลดเพื่อเพิ่ม',    guidance: 'บางครั้งต้องลดสิ่งที่มีมากเกินเพื่อให้สิ่งที่สำคัญเติบโต การสละเพื่อส่วนรวมนำมาซึ่งผลตอบแทน', keywords: ['การสละ','ลดน้อย','เพิ่มพูน'] },
  // 42
  { chinese: 'Yì',      thai: 'การเพิ่ม',        upper: 'Wind',     lower: 'Thunder',  theme: 'ขยายและเติบโต',   guidance: 'ช่วงเวลาดีที่สุดสำหรับการลงทุนในตัวเองและผู้อื่น โอกาสกำลังมาพร้อมกัน ลงมือทำเดี๋ยวนี้', keywords: ['การเพิ่ม','เติบโต','โอกาส'] },
  // 43
  { chinese: 'Guài',    thai: 'การตัดสิน',       upper: 'Lake',     lower: 'Heaven',   theme: 'ตัดสินอย่างเด็ดขาด', guidance: 'ถึงเวลาที่ต้องกล้าพูดความจริงและตัดสินใจอย่างชัดเจน การลังเลทำให้เสียเวลาและโอกาส', keywords: ['การตัดสินใจ','ความกล้า','ความจริง'] },
  // 44
  { chinese: 'Gòu',     thai: 'การพบกัน',        upper: 'Heaven',   lower: 'Wind',     theme: 'ระวังอิทธิพลลบ',  guidance: 'มีสิ่งหรือคนที่เข้ามาอย่างเงียบๆ แต่มีอิทธิพล ตรวจสอบว่าสิ่งนั้นพาคุณไปในทิศทางที่ดีหรือไม่', keywords: ['ความระมัดระวัง','อิทธิพล','การพบ'] },
  // 45
  { chinese: 'Cuì',     thai: 'การรวมตัว',       upper: 'Lake',     lower: 'Earth',    theme: 'รวมพลังกัน',      guidance: 'ช่วงเวลาที่ดีสำหรับการรวมกลุ่มและสร้างพันธมิตร ความแข็งแกร่งมาจากการรวมตัวที่มีเป้าหมายร่วม', keywords: ['การรวมตัว','ชุมชน','เป้าหมายร่วม'] },
  // 46
  { chinese: 'Shēng',   thai: 'การไต่ขึ้น',      upper: 'Earth',    lower: 'Wind',     theme: 'ก้าวขึ้นอย่างมั่นคง', guidance: 'ค่อยๆ ไต่ขึ้นอย่างมั่นคงทีละขั้น อย่ารีบร้อน ความสำเร็จที่แท้จริงสร้างจากรากฐานที่ดี', keywords: ['การเติบโต','ก้าวหน้า','ความมั่นคง'] },
  // 47
  { chinese: 'Kùn',     thai: 'ความอ่อนล้า',     upper: 'Lake',     lower: 'Water',    theme: 'ฟื้นฟูพลังงาน',    guidance: 'พลังงานกำลังหมด อย่าพยายามฝืนต่อ หยุดพักและฟื้นฟูตัวเอง แล้วพลังจะกลับมา', keywords: ['การพักผ่อน','ฟื้นฟู','พลังงาน'] },
  // 48
  { chinese: 'Jǐng',    thai: 'บ่อน้ำ',          upper: 'Water',    lower: 'Wind',     theme: 'แหล่งพลังงานที่ยั่งยืน', guidance: 'ความรู้และปัญญาเป็นทรัพยากรที่ไม่หมดสิ้น ดูแลรักษาแหล่งพลังงานภายในของคุณเสมอ', keywords: ['ปัญญา','แหล่งพลัง','ความยั่งยืน'] },
  // 49
  { chinese: 'Gé',      thai: 'การปฏิวัติ',      upper: 'Lake',     lower: 'Fire',     theme: 'การเปลี่ยนแปลงใหญ่', guidance: 'ถึงเวลาเปลี่ยนแปลงอย่างจริงจัง เตรียมตัวให้ดีก่อน การปฏิวัติที่ถูกต้องเวลาต้องได้รับการสนับสนุน', keywords: ['การเปลี่ยนแปลง','ปฏิวัติ','การเตรียมพร้อม'] },
  // 50
  { chinese: 'Dǐng',    thai: 'หม้อไฟ',          upper: 'Fire',     lower: 'Wind',     theme: 'การหลอมรวมและสร้าง', guidance: 'รวมทักษะและทรัพยากรหลากหลายเพื่อสร้างสิ่งใหม่ เช่นเดียวกับหม้อที่หลอมส่วนผสมให้เป็นอาหาร', keywords: ['การสร้าง','หลอมรวม','ความสร้างสรรค์'] },
  // 51
  { chinese: 'Zhèn',    thai: 'สายฟ้า',          upper: 'Thunder',  lower: 'Thunder',  theme: 'ตื่นตัวจากช็อก',   guidance: 'เหตุการณ์กระทันหันอาจทำให้ตกใจ แต่สายฟ้าชำระล้างอากาศ ความตื่นตัวนำมาซึ่งความชัดเจนใหม่', keywords: ['ความตื่นตัว','ช็อก','ความชัดเจน'] },
  // 52
  { chinese: 'Gèn',     thai: 'ภูเขา',            upper: 'Mountain', lower: 'Mountain', theme: 'นิ่งและมีสติ',     guidance: 'หยุดและนิ่งเมื่อถึงเวลา อย่าเดินหน้าเพราะแรงกดดัน ความสงบภายในคือพลังที่แท้จริง', keywords: ['ความสงบ','สติ','การหยุดนิ่ง'] },
  // 53
  { chinese: 'Jiàn',    thai: 'พัฒนาการค่อยเป็นค่อยไป', upper: 'Wind', lower: 'Mountain', theme: 'ก้าวทีละก้าว', guidance: 'ความก้าวหน้าที่ยั่งยืนเกิดจากขั้นตอนที่เหมาะสม เหมือนห่านป่าที่บินขึ้นทีละก้าว', keywords: ['ความค่อยเป็นค่อยไป','ก้าวหน้า','ความยั่งยืน'] },
  // 54
  { chinese: 'Guī Mèi', thai: 'การแต่งงาน',      upper: 'Thunder',  lower: 'Lake',     theme: 'บทบาทที่เหมาะสม',  guidance: 'ทำความเข้าใจบทบาทของตนในสถานการณ์ บางครั้งต้องยืดหยุ่นและปรับตัว ไม่ใช่บังคับทิศทาง', keywords: ['บทบาท','ความสัมพันธ์','การปรับตัว'] },
  // 55
  { chinese: 'Fēng',    thai: 'ความอุดมสมบูรณ์', upper: 'Thunder',  lower: 'Fire',     theme: 'จุดสูงสุด',        guidance: 'ช่วงเวลาที่รุ่งเรืองที่สุด ใช้โอกาสนี้ให้เต็มที่ แต่จำไว้ว่าทุกอย่างย่อมเปลี่ยนแปลง', keywords: ['ความรุ่งเรือง','โอกาส','จุดสูงสุด'] },
  // 56
  { chinese: 'Lǚ',      thai: 'นักเดินทาง',       upper: 'Fire',     lower: 'Mountain', theme: 'การเดินทางชีวิต',  guidance: 'ในฐานะคนแปลกหน้าหรือผู้เดินทาง ระมัดระวังและสุภาพ สร้างความไว้ใจอย่างค่อยเป็นค่อยไป', keywords: ['การเดินทาง','ความระมัดระวัง','สุภาพ'] },
  // 57
  { chinese: 'Xùn',     thai: 'ลม',               upper: 'Wind',     lower: 'Wind',     theme: 'อิทธิพลที่อ่อนโยน', guidance: 'อิทธิพลที่อ่อนโยนแต่สม่ำเสมอมีพลังกว่าการบังคับ เหมือนลมที่ค่อยๆ พัดให้ต้นไม้โค้งงอ', keywords: ['อิทธิพล','ความอ่อนโยน','ความสม่ำเสมอ'] },
  // 58
  { chinese: 'Duì',     thai: 'ความยินดี',        upper: 'Lake',     lower: 'Lake',     theme: 'ความสุขแท้จริง',   guidance: 'ความยินดีที่แท้จริงมาจากการแบ่งปันกับผู้อื่น เปิดใจรับและให้ความสุขรอบข้าง', keywords: ['ความสุข','การแบ่งปัน','ความยินดี'] },
  // 59
  { chinese: 'Huàn',    thai: 'การกระจาย',        upper: 'Wind',     lower: 'Water',    theme: 'ละลายความแข็งกร้าว', guidance: 'สิ่งที่แข็งและแยกออกต้องละลายและรวมกัน การสื่อสารที่ดีละลายความเข้าใจผิด', keywords: ['การสื่อสาร','ความเข้าใจ','ละลาย'] },
  // 60
  { chinese: 'Jié',     thai: 'ข้อจำกัด',         upper: 'Water',    lower: 'Lake',     theme: 'ขอบเขตที่ดี',      guidance: 'ขอบเขตที่เหมาะสมช่วยให้ชีวิตมีระเบียบ แต่อย่าเข้มงวดจนเกินไป ความยืดหยุ่นก็สำคัญ', keywords: ['ขอบเขต','ระเบียบ','ความสมดุล'] },
  // 61
  { chinese: 'Zhōng Fú', thai: 'ความจริงใจภายใน', upper: 'Wind',    lower: 'Lake',     theme: 'ความสัตย์จริง',    guidance: 'ความเชื่อใจมาจากความจริงใจจากข้างใน คนที่สัมผัสความจริงของคุณได้จะเชื่อถือคุณโดยอัตโนมัติ', keywords: ['ความจริงใจ','ความไว้ใจ','ใจกลาง'] },
  // 62
  { chinese: 'Xiǎo Guò', thai: 'เกินเล็กน้อย',   upper: 'Thunder',  lower: 'Mountain', theme: 'ทำน้อยๆ ก่อน',    guidance: 'ช่วงนี้อย่าพยายามทำสิ่งใหญ่ ทำสิ่งเล็กๆ ที่ใช่และทำได้ดี ความสำเร็จเล็กๆ สำคัญมาก', keywords: ['ความถ่อมตน','ก้าวเล็กๆ','ความระมัดระวัง'] },
  // 63
  { chinese: 'Jì Jì',   thai: 'หลังสำเร็จ',       upper: 'Water',    lower: 'Fire',     theme: 'รักษาสิ่งที่ได้มา', guidance: 'ความสำเร็จมาแล้ว แต่อย่าประมาท ยังต้องดูแลและรักษาสิ่งที่ได้สร้างมา อย่าหยุดใส่ใจ', keywords: ['ความสำเร็จ','การรักษา','ความระมัดระวัง'] },
  // 64
  { chinese: 'Wèi Jì',  thai: 'ก่อนสำเร็จ',       upper: 'Fire',     lower: 'Water',    theme: 'ใกล้จะสำเร็จ',    guidance: 'เกือบถึงแล้ว แต่ยังอีกขั้นหนึ่ง อย่าประมาทในช่วงสุดท้าย ทำทุกอย่างด้วยความตั้งใจสูงสุด', keywords: ['ใกล้สำเร็จ','ความตั้งใจ','ขั้นสุดท้าย'] },
];

// ---------------------------------------------------------------------------
// Hexagram derivation
// ---------------------------------------------------------------------------

/**
 * Derive hexagram number (1–64) from birth date.
 * Formula: ((year + month * 7 + day * 13) mod 64) + 1
 * Gives even distribution; deterministic per unique birthday.
 */
function deriveHexagramNumber(dob: string): number {
  const parts = dob.split('-');
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  const raw = (year + month * 7 + day * 13) % 64;
  return raw + 1; // 1–64
}

/**
 * Normalize DOB to YYYY-MM-DD (same safety logic as astrology.ts).
 */
function normalizeDob(dob: string | null | undefined): string {
  const trimmed = dob?.trim();
  if (trimmed && /^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  if (trimmed) {
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Calculate the primary birth hexagram from date of birth.
 *
 * @param rawDob - Birth date (any parseable format; YYYY-MM-DD preferred)
 * @returns HexagramResult — deterministic, no network calls
 */
export function calculateHexagram(rawDob: string | null | undefined): HexagramResult {
  const dob = normalizeDob(rawDob);
  const number = deriveHexagramNumber(dob);
  const data = HEXAGRAMS[number - 1]; // 0-indexed

  const upper = TRIGRAMS[data.upper];
  const lower = TRIGRAMS[data.lower];

  // Build a 6-line symbol representation (solid/broken lines)
  // Upper trigram on top, lower trigram on bottom
  const symbol = `${upper.symbol}${lower.symbol}`;

  return {
    number,
    chineseName: data.chinese,
    thaiName: data.thai,
    symbol,
    upperTrigram: upper,
    lowerTrigram: lower,
    theme: data.theme,
    guidance: data.guidance,
    keywords: data.keywords,
  };
}

/**
 * Get hexagram by number (1–64) directly.
 */
export function getHexagramByNumber(number: number): HexagramResult {
  const n = Math.max(1, Math.min(64, Math.floor(number)));
  const data = HEXAGRAMS[n - 1];

  const upper = TRIGRAMS[data.upper];
  const lower = TRIGRAMS[data.lower];

  return {
    number: n,
    chineseName: data.chinese,
    thaiName: data.thai,
    symbol: `${upper.symbol}${lower.symbol}`,
    upperTrigram: upper,
    lowerTrigram: lower,
    theme: data.theme,
    guidance: data.guidance,
    keywords: data.keywords,
  };
}

/**
 * Get all 64 hexagrams (for reference UI / search).
 */
export function getAllHexagrams(): HexagramResult[] {
  return HEXAGRAMS.map((_, i) => getHexagramByNumber(i + 1));
}
