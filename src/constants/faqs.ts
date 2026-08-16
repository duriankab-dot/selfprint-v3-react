/**
 * FAQs Constants
 * Frequently Asked Questions organized by category
 */

export interface FAQ {
  id: string;
  category: 'general' | 'twin' | 'worlds' | 'privacy' | 'technical';
  question: string;
  answer: string;
  order: number;
}

export const FAQS: FAQ[] = [
  // General
  {
    id: 'what-is-selfprint',
    category: 'general',
    question: 'Selfprint คืออะไร?',
    answer: 'Selfprint เป็นแพลตฟอร์ม AI ที่ช่วยให้คุณเข้าใจตัวเองได้ลึกขึ้น โดยใช้ AI Twin ที่เรียนรู้จากการสนทนา วารสารส่วนตัว และการตัดสินใจของคุณ ช่วยให้คุณมีความชัดเจนมากขึ้นในชีวิต',
    order: 1,
  },
  {
    id: 'how-does-twin-work',
    category: 'twin',
    question: 'AI Twin ของฉันทำงานอย่างไร?',
    answer: 'AI Twin ของคุณเรียนรู้จากทุกการโต้ตอบ จดบันทึก และการตัดสินใจที่คุณทำ มันใช้ SICE (Specialized Intelligence Capability Engines) ซึ่งเป็น 12 โมดูลอัจฉริยะที่วิเคราะห์รูปแบบ สร้างข้อมูลเชิงลึก และปรับตัวให้เหมาะสมกับบุคลิกภาพของคุณ',
    order: 2,
  },
  {
    id: 'what-are-worlds',
    category: 'worlds',
    question: '12 Worlds คืออะไร?',
    answer: 'Worlds ขอ 12 พื้นที่ของชีวิตคุณ: Self (ตัวตน), Mind (จิตใจ), Relationship (ความสัมพันธ์), Love (ความรัก), Career (อาชีพ), Wealth (ความมั่งคั่ง), Life (ชีวิต), Growth (การเติบโต), Decision (การตัดสินใจ), Purpose (จุดประสงค์), Wellbeing (สุขภาพ), และ Future (อนาคต) Twin ของคุณปรับตัวตามแต่ละ World',
    order: 3,
  },
  {
    id: 'is-data-private',
    category: 'privacy',
    question: 'ข้อมูลของฉันปลอดภัยไหม?',
    answer: 'ใช่ ข้อมูลทั้งหมดของคุณถูกเข้ารหัสและจัดเก็บใน Supabase ด้วย Row-Level Security (RLS) คุณเป็นคนเดียวที่เห็นข้อมูลของคุณ เราไม่แชร์หรือขายข้อมูล และคุณสามารถลบหรือส่งออกข้อมูลได้ตลอดเวลา',
    order: 4,
  },
  {
    id: 'what-are-badges',
    category: 'twin',
    question: 'Badges คืออะไรและมีประโยชน์ไหม?',
    answer: 'Badges ตัวแสดงความสำเร็จ 168 อัน (14 ต่อ World) ที่คุณปลดล็อกได้โดยการสนทนา จดบันทึก และการตัดสินใจ พวกมันติดตามความก้าวหน้าของคุณ และแสดงความสำเร็จในแต่ละพื้นที่ของชีวิต',
    order: 5,
  },
  {
    id: 'how-to-get-started',
    category: 'general',
    question: 'ฉันเริ่มต้นยังไง?',
    answer: '1. สมัครสมาชิกด้วยอีเมล 2. ตั้งชื่อ Twin 3. ไปที่ Onboarding เพื่อเลือก World 4. เริ่มสนทนากับ Twin ของคุณ 5. จดบันทึกความรู้สึกและตัดสินใจ ยิ่งโต้ตอบมากเท่าไหร่ Twin ก็เข้าใจคุณมากเท่านั้น',
    order: 6,
  },
  {
    id: 'cost',
    category: 'general',
    question: 'มีค่าใช้งานหรือไม่?',
    answer: 'Selfprint มีแผน Free เพื่อให้คุณลองใช้ได้ แผน Pro ให้คุณเข้าถึง Twin ขั้นสูง บทสนทนาไม่จำกัด และ 12 Worlds ทั้งหมด ราคาถูก และคุณสามารถยกเลิกได้ตลอดเวลา',
    order: 7,
  },
  {
    id: 'mobile-app',
    category: 'technical',
    question: 'มี Mobile App หรือไม่?',
    answer: 'Selfprint ทำงานได้บน iOS, Android และ Web ด้วยการออกแบบ Responsive ลงชื่อเข้าใช้บนอุปกรณ์ใดก็ได้ และข้อมูลของคุณจะซิงค์ข้ามทั้งหมด',
    order: 8,
  },
  {
    id: 'offline-support',
    category: 'technical',
    question: 'ฉันใช้ได้แม้ไม่มีอินเทอร์เน็ตหรือไม่?',
    answer: 'ใช่ Selfprint เป็น Progressive Web App (PWA) ที่ทำงานแบบออฟไลน์ ข้อความและการจดบันทึกของคุณจะจัดเก็บไว้ ดีบ้างนี้เชื่อมต่อโปรแกรมจะซิงค์โดยอัตโนมัติ',
    order: 9,
  },
];

/**
 * Get FAQs by category
 */
export function getFAQsByCategory(category: FAQ['category']): FAQ[] {
  return FAQS.filter((faq) => faq.category === category).sort((a, b) => a.order - b.order);
}

/**
 * Get all unique categories
 */
export function getFAQCategories(): FAQ['category'][] {
  const categories = new Set(FAQS.map((faq) => faq.category));
  return Array.from(categories) as FAQ['category'][];
}

/**
 * Category labels for UI
 */
export const CATEGORY_LABELS: Record<FAQ['category'], string> = {
  general: 'ทั่วไป',
  twin: 'AI Twin',
  worlds: '12 Worlds',
  privacy: 'ความเป็นส่วนตัว',
  technical: 'เทคนิค',
};
