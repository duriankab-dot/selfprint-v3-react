/**
 * FAQs Constants — SELFPRINT
 * ถาม-ตอบกระชับ ตอบ 2-3 บรรทัดแรก ภาษาไทยเป็นธรรมชาติ
 * แยก SELFPRINT (แพลตฟอร์ม) / NOVA (AI guide ช่วง onboarding) / Twin (ฝาแฝดดิจิทัล) ให้ชัดเจน
 */

export interface FAQ {
  id: string;
  category: 'general' | 'twin' | 'worlds' | 'privacy' | 'technical';
  question: string;
  answer: string;
  questionEn: string;
  answerEn: string;
  order: number;
}

export const FAQS: FAQ[] = [
  // ─── General ───────────────────────────────────────────────────────────────

  {
    id: 'what-is-selfprint',
    category: 'general',
    question: 'SELFPRINT คืออะไร?',
    answer:
      'SELFPRINT คือแพลตฟอร์ม AI วิเคราะห์พฤติกรรมที่สร้าง "ฝาแฝดดิจิทัล" (AI Twin) เฉพาะของคุณ โดยอ้างอิงจากข้อมูลพฤติกรรม 12 มิติ ไม่ใช่ดวงชะตาหรือความเชื่อ\n\nระบบเรียนรู้จากคุณจริงๆ และช่วยชี้จุดบอด (Blind Spots) ที่ขัดขวางการตัดสินใจในชีวิต การงาน และความสัมพันธ์',
    questionEn: 'What is SELFPRINT?',
    answerEn:
      'SELFPRINT is a behavioral-analysis AI platform that builds your own "digital twin" (AI Twin), grounded in 12 dimensions of behavioral data — not astrology or belief.\n\nThe system learns from the real you, and helps surface blind spots that get in the way of decisions about life, work, and relationships.',
    order: 1,
  },
  {
    id: 'selfprint-vs-nova-vs-twin',
    category: 'general',
    question: 'SELFPRINT, NOVA และ AI Twin ต่างกันอย่างไร?',
    answer:
      'SELFPRINT คือแพลตฟอร์มทั้งหมด\n\nNOVA คือ AI Guide ที่ช่วยคุณกรอกข้อมูลช่วงเริ่มต้น (Onboarding) วิเคราะห์ Initial State Matrix และให้กำเนิด Twin ของคุณ\n\nAI Twin คือ "ฝาแฝดดิจิทัล" ที่เกิดขึ้นหลัง Onboarding เสร็จสิ้น — รู้จักคุณจากพฤติกรรมจริง เรียนรู้ต่อเนื่อง และเติบโตไปพร้อมคุณ',
    questionEn: 'What\'s the difference between SELFPRINT, NOVA, and your AI Twin?',
    answerEn:
      'SELFPRINT is the whole platform.\n\nNOVA is the AI guide that walks you through onboarding, analyzes your Initial State Matrix, and gives birth to your Twin.\n\nYour AI Twin is the "digital twin" born once onboarding is complete — it knows you from real behavior, keeps learning, and grows alongside you.',
    order: 2,
  },
  {
    id: 'how-to-get-started',
    category: 'general',
    question: 'เริ่มต้นใช้งาน SELFPRINT ได้อย่างไร?',
    answer:
      'ลงทะเบียนด้วยอีเมล (ฟรี ไม่ต้องใส่บัตรเครดิต) จากนั้น NOVA จะพาคุณผ่านขั้นตอน Onboarding ประมาณ 2 นาที เพื่อวิเคราะห์ Initial State Matrix\n\nเมื่อเสร็จแล้ว AI Twin ของคุณจะถือกำเนิด พร้อมให้คุณสนทนา ค้นหา Blind Spots และนำทางชีวิตได้ทันที',
    questionEn: 'How do I get started with SELFPRINT?',
    answerEn:
      'Sign up with your email — free, no credit card needed. NOVA then walks you through a roughly 2-minute onboarding to analyze your Initial State Matrix.\n\nOnce done, your AI Twin is born and ready for conversation, finding blind spots, and guiding your life right away.',
    order: 3,
  },
  {
    id: 'cost',
    category: 'general',
    question: 'ใช้งานฟรีได้แค่ไหน?',
    answer:
      'แผน Free ให้คุณสร้าง AI Twin และสนทนาพื้นฐานได้ทันที\n\nแผน Pro ปลดล็อก 12 Hub Worlds ทั้งหมด บทสนทนาไม่จำกัด การวิเคราะห์เชิงลึก และ Twin ที่เรียนรู้เร็วขึ้น ยกเลิกได้ตลอดเวลา',
    questionEn: 'How much of it is free?',
    answerEn:
      'The Free plan lets you create your AI Twin and have basic conversations right away.\n\nThe Pro plan unlocks all 12 Hub Worlds, unlimited conversations, deeper analysis, and a Twin that learns faster. Cancel anytime.',
    order: 4,
  },
  {
    id: 'selfprint-vs-astrology',
    category: 'general',
    question: 'SELFPRINT ต่างจากการดูดวงอย่างไร?',
    answer:
      'การดูดวงอ้างอิงจากดาวหรือวันเกิด SELFPRINT อ้างอิงจากพฤติกรรมจริง — การตัดสินใจ รูปแบบความคิด และปฏิกิริยาของคุณในชีวิต\n\nผลลัพธ์จึงแม่นยำกว่า เพราะเรียนรู้จากคุณโดยตรง และเปลี่ยนแปลงไปพร้อมกับคุณ ไม่ใช่ตัดสินจากวันเดือนปีเกิดที่ตายตัว',
    questionEn: 'How is SELFPRINT different from astrology?',
    answerEn:
      'Astrology is based on stars or birth dates. SELFPRINT is based on your real behavior — your decisions, thinking patterns, and reactions in everyday life.\n\nThe results are more accurate because the system learns directly from you and changes as you change, instead of judging you by a fixed birth date.',
    order: 5,
  },

  // ─── Twin ──────────────────────────────────────────────────────────────────

  {
    id: 'how-does-twin-work',
    category: 'twin',
    question: 'AI Twin ทำงานอย่างไร?',
    answer:
      'AI Twin ใช้ระบบ SICE (Specialized Intelligence Capability Engines) 12 โมดูล วิเคราะห์รูปแบบพฤติกรรมของคุณจากการสนทนา การตัดสินใจ และบันทึกส่วนตัว\n\nยิ่งคุณโต้ตอบมาก Twin ยิ่งรู้จักคุณลึกขึ้น — จนสามารถชี้จุดบอด เตือนก่อนตัดสินใจผิด และจำลองสถานการณ์อนาคตให้คุณได้',
    questionEn: 'How does the AI Twin work?',
    answerEn:
      'Your AI Twin uses SICE — 12 Specialized Intelligence Capability Engine modules — to analyze your behavior patterns from conversations, decisions, and personal logs.\n\nThe more you interact, the deeper it knows you — eventually able to flag blind spots, warn you before a bad decision, and simulate future scenarios for you.',
    order: 6,
  },
  {
    id: 'twin-vs-chatgpt',
    category: 'twin',
    question: 'AI Twin ต่างจาก ChatGPT อย่างไร?',
    answer:
      'ChatGPT ตอบทุกคนเหมือนกัน AI Twin ของ SELFPRINT รู้จัก "คุณ" โดยเฉพาะ — จำประวัติ รูปแบบพฤติกรรม และบริบทชีวิตของคุณ\n\nคุณไม่ต้องอธิบายตัวเองซ้ำ Twin รู้ว่าคุณตัดสินใจอย่างไร มีจุดแข็ง-จุดบอดตรงไหน และจะตอบสนองตามบุคลิกเฉพาะของคุณทุกครั้ง',
    questionEn: 'How is the AI Twin different from ChatGPT?',
    answerEn:
      'ChatGPT answers everyone the same way. Your SELFPRINT AI Twin knows specifically "you" — it remembers your history, behavior patterns, and life context.\n\nYou never have to explain yourself twice. The Twin knows how you decide, where your strengths and blind spots are, and responds according to your specific personality every time.',
    order: 7,
  },
  {
    id: 'what-are-badges',
    category: 'twin',
    question: 'Badges คืออะไร?',
    answer:
      'Badges คือตัวชี้วัดความก้าวหน้าของ Twin ของคุณ มี 168 อัน (14 ต่อ World) ปลดล็อกได้จากการสนทนา บันทึก และการตัดสินใจ\n\nนอกจากแสดงความสำเร็จ ยังช่วยให้ Twin เรียนรู้ด้านที่คุณใส่ใจมากขึ้น',
    questionEn: 'What are Badges?',
    answerEn:
      'Badges track your Twin\'s progress. There are 168 of them (14 per World), unlocked through conversations, journaling, and decisions.\n\nBeyond showing achievement, they also help the Twin learn which areas you care about most.',
    order: 8,
  },

  // ─── Worlds ────────────────────────────────────────────────────────────────

  {
    id: 'what-are-worlds',
    category: 'worlds',
    question: '12 Hub Worlds คืออะไร?',
    answer:
      '12 Worlds คือ 12 พื้นที่ชีวิตที่ AI Twin ช่วยวิเคราะห์และนำทาง ได้แก่ ตัวตน / จิตใจ / ความสัมพันธ์ / ความรัก / อาชีพ / ความมั่งคั่ง / ชีวิต / การเติบโต / การตัดสินใจ / จุดประสงค์ / สุขภาพ / อนาคต\n\nแต่ละ World มีบทสนทนา กิจกรรม และ Badges เฉพาะที่ช่วยให้ Twin รู้จักคุณในมิตินั้นอย่างลึกซึ้ง',
    questionEn: 'What are the 12 Hub Worlds?',
    answerEn:
      'The 12 Worlds are 12 life areas your AI Twin helps analyze and guide: Identity, Mind, Relationships, Love, Career, Wealth, Life, Growth, Decisions, Purpose, Health, and Future.\n\nEach World has its own conversations, activities, and Badges that help the Twin get to know you deeply in that dimension.',
    order: 9,
  },
  {
    id: 'how-to-access-worlds',
    category: 'worlds',
    question: 'เข้าถึง Worlds ได้อย่างไร?',
    answer:
      'หลัง Onboarding เสร็จและ AI Twin ถือกำเนิดแล้ว ระบบจะพาคุณเข้า Identity World (โลกตัวตน) ก่อนเป็นลำดับแรก\n\nจากนั้นคุณสามารถเลือกสำรวจ World อื่นๆ ได้จากเมนู Worlds ทุก World จะปรับ Twin ให้ตอบสนองตามบริบทของพื้นที่นั้นๆ',
    questionEn: 'How do I access the Worlds?',
    answerEn:
      "Once onboarding is done and your AI Twin is born, the system takes you into the Identity World first.\n\nFrom there you can explore other Worlds from the Worlds menu. Each World adapts the Twin's responses to that area's context.",
    order: 10,
  },

  // ─── Privacy ───────────────────────────────────────────────────────────────

  {
    id: 'is-data-private',
    category: 'privacy',
    question: 'ข้อมูลส่วนตัวของฉันปลอดภัยแค่ไหน?',
    answer:
      'ข้อมูลทั้งหมดเข้ารหัสและจัดเก็บด้วย Row-Level Security (RLS) — มีเพียงคุณเท่านั้นที่เข้าถึงได้\n\nเราไม่ขายหรือแชร์ข้อมูลกับบุคคลที่สาม และคุณสามารถลบหรือส่งออกข้อมูลของตัวเองได้ตลอดเวลาจากหน้า Privacy Center',
    questionEn: 'How safe is my personal data?',
    answerEn:
      'All data is encrypted and stored with Row-Level Security (RLS) — only you can access it.\n\nWe never sell or share your data with third parties, and you can delete or export your own data anytime from the Privacy Center.',
    order: 11,
  },
  {
    id: 'can-i-delete-data',
    category: 'privacy',
    question: 'ฉันลบข้อมูลทั้งหมดได้ไหม?',
    answer:
      'ได้ทุกเมื่อ ไปที่ Privacy Center แล้วเลือก "ลบบัญชีและข้อมูลทั้งหมด"\n\nเมื่อลบแล้ว AI Twin บทสนทนา และข้อมูลพฤติกรรมของคุณจะถูกลบออกจากระบบถาวร ไม่มีการสำรองข้อมูลส่วนตัวไว้',
    questionEn: 'Can I delete all my data?',
    answerEn:
      'Yes, anytime. Go to the Privacy Center and choose "Delete account and all data."\n\nOnce deleted, your AI Twin, conversations, and behavioral data are permanently removed from our systems — no personal data backup is kept.',
    order: 12,
  },

  // ─── Technical ─────────────────────────────────────────────────────────────

  {
    id: 'mobile-app',
    category: 'technical',
    question: 'มีแอปให้ดาวน์โหลดหรือไม่?',
    answer:
      'SELFPRINT เป็น Progressive Web App (PWA) — ติดตั้งลงหน้าจอหลักของมือถือได้ทั้ง iOS และ Android โดยไม่ต้องผ่าน App Store\n\nเปิดเว็บในเบราว์เซอร์แล้วกด "Add to Home Screen" (iOS: Share → Add to Home Screen / Android: เมนู → Install App) ได้เลย',
    questionEn: 'Is there an app to download?',
    answerEn:
      'SELFPRINT is a Progressive Web App (PWA) — installable to your home screen on both iOS and Android without going through an app store.\n\nJust open the site in your browser and tap "Add to Home Screen" (iOS: Share → Add to Home Screen / Android: Menu → Install App).',
    order: 13,
  },
  {
    id: 'offline-support',
    category: 'technical',
    question: 'ใช้งานแบบออฟไลน์ได้ไหม?',
    answer:
      'ได้บางส่วน PWA ของ SELFPRINT โหลด UI และแสดงข้อมูลที่แคชไว้ได้แม้ไม่มีสัญญาณ\n\nสำหรับการสนทนากับ AI Twin จำเป็นต้องมีอินเทอร์เน็ต เพราะต้องประมวลผลแบบ Real-time เมื่อกลับมาออนไลน์ระบบจะซิงค์ข้อมูลโดยอัตโนมัติ',
    questionEn: 'Does it work offline?',
    answerEn:
      "Partially. The SELFPRINT PWA can load its UI and show cached data even without a signal.\n\nConversations with your AI Twin require an internet connection since they're processed in real time. Once you're back online, data syncs automatically.",
    order: 14,
  },
  {
    id: 'what-is-sice',
    category: 'technical',
    question: 'SICE Engine คืออะไร?',
    answer:
      'SICE ย่อจาก Specialized Intelligence Capability Engines — ระบบ AI 12 โมดูลที่ SELFPRINT ใช้วิเคราะห์พฤติกรรม แต่ละโมดูลเชี่ยวชาญด้านหนึ่งของชีวิต (เช่น การตัดสินใจ ความสัมพันธ์ อาชีพ)\n\nเมื่อทำงานร่วมกัน SICE สร้างภาพรวม "พิมพ์เขียวพฤติกรรม" (Behavioral Blueprint) ที่แม่นยำกว่าแบบทดสอบใดๆ',
    questionEn: 'What is the SICE Engine?',
    answerEn:
      'SICE stands for Specialized Intelligence Capability Engines — 12 AI modules SELFPRINT uses to analyze behavior. Each module specializes in one area of life (e.g. decisions, relationships, career).\n\nWorking together, SICE builds an overall "Behavioral Blueprint" more accurate than any single test.',
    order: 15,
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

export const CATEGORY_LABELS_EN: Record<FAQ['category'], string> = {
  general: 'General',
  twin: 'AI Twin',
  worlds: '12 Worlds',
  privacy: 'Privacy',
  technical: 'Technical',
};
