/**
 * worlds.ts
 * The 12 Worlds of Self Print - Life domains for exploration
 *
 * I18N-WORLDS-001 FIX: name/mood/description/tagline/focusAreas (World) and
 * title/excerpt (Article) now carry a Thai counterpart (`*Th` suffix) so
 * WorldDetail.tsx/WorldsHub.tsx/WorldSelector.tsx/WorldTabs.tsx can render
 * this data bilingually under /th and /en — previously this entire file was
 * English-only with no isTh branch anywhere, so every one of the 12 Worlds
 * showed English name/description/tagline/focus-areas/article list even on
 * /th. Article `content` bodies are still English-only placeholder stub
 * text (e.g. "Mental clutter...") — out of scope here; that's a real
 * content-writing project (36 articles), not a UI-string translation, and
 * is flagged separately to jb_DEV.
 */

export type WorldId =
  | 'self' | 'mind' | 'relationship' | 'love' | 'career' | 'wealth'
  | 'life' | 'growth' | 'decision' | 'purpose' | 'wellbeing' | 'future';

export interface World {
  id: WorldId;
  name: string;
  nameTh: string;
  emoji: string;
  /** Secondary accent per SELFPRINT — 12 HUB WORLDS VISUAL & EXPERIENCE
   *  DIRECTIVE §16 ("Visual Color System"). Contextual color — never
   *  replaces the shared Deep Intelligent Blue brand base (see
   *  DEEP_INTELLIGENT_BLUE below), only accents it per world. */
  color: string;
  /** Mood keyword per directive §4 (one per world, e.g. "Reflective / Introspective"). */
  mood: string;
  moodTh: string;
  /** Procedural background pattern family per directive §4's "Visual" notes
   *  for this world — used by WorldEnvironment.tsx to pick a shape system
   *  since no illustrated 4096×4096 background assets exist yet (directive
   *  §17 target, not yet produced). */
  archetype: WorldArchetype;
  description: string;
  descriptionTh: string;
  tagline: string;
  taglineTh: string;
  focusAreas: string[];
  focusAreasTh: string[];
}

/** Procedural visual pattern families — one per world, loosely derived from
 *  each world's directive §4 "Visual" description. Not a 1:1 replacement for
 *  the spec's illustrated background assets — a same-architecture placeholder
 *  (swap WorldEnvironment.tsx's pattern renderer for real art later without
 *  touching any call site). */
export type WorldArchetype =
  | 'core'          // SELF — crystal core, concentric rings
  | 'network'       // MIND — neural nodes, orbital structures
  | 'constellation' // RELATIONSHIP — luminous nodes + connecting paths
  | 'heart'         // LOVE — soft radial heart-energy glow
  | 'city'          // CAREER — vertical structures, branching paths
  | 'crystal'       // WEALTH — quantum grid, crystalline facets
  | 'path'          // LIFE — cosmic pathway, horizon, energy trails
  | 'organic'       // GROWTH — bioluminescent growth forms
  | 'branch'        // DECISION — origin branching into option paths
  | 'temple'        // PURPOSE — monumental cosmic geometry
  | 'sanctuary'     // WELLBEING — flowing organic/digital curves
  | 'horizon';       // FUTURE — expansive horizon, energy arcs

/** Shared brand foundation color — directive §2 "Brand Foundation": must
 *  stay present in every Hub. Every world's environment layers its accent
 *  on top of this, never replaces it. */
export const DEEP_INTELLIGENT_BLUE = '#0A1A3F';

export interface Article {
  slug: string;
  title: string;
  titleTh: string;
  excerpt: string;
  excerptTh: string;
  /** English-only placeholder stub content — see I18N-WORLDS-001 FIX note
   *  above. Not yet real long-form article content in either language. */
  content: string;
  author: string;
  image?: string;
  publishedAt: string;
  readTime: number; // minutes
  tags: string[];
  world: WorldId;
}

export const WORLDS: Record<WorldId, World> = {
  self: {
    id: 'self',
    name: 'Self',
    nameTh: 'ตัวตน',
    emoji: '🪞',
    color: '#22D3EE', // Cyan
    mood: 'Reflective / Introspective',
    moodTh: 'ใคร่ครวญ / มองเข้าข้างใน',
    archetype: 'core',
    description: 'Understanding who you are at your core',
    descriptionTh: 'เข้าใจแก่นแท้ของตัวคุณ',
    tagline: 'Know thyself',
    taglineTh: 'รู้จักตัวเอง',
    focusAreas: ['Identity', 'Values', 'Beliefs', 'Self-awareness', 'Authenticity'],
    focusAreasTh: ['อัตลักษณ์', 'คุณค่า', 'ความเชื่อ', 'การรู้จักตนเอง', 'ความเป็นตัวของตัวเอง'],
  },
  mind: {
    id: 'mind',
    name: 'Mind',
    nameTh: 'จิตใจ',
    emoji: '🧠',
    color: '#A855F7', // Electric Violet
    mood: 'Curious / Intelligent',
    moodTh: 'อยากรู้อยากเห็น / เฉียบคม',
    archetype: 'network',
    description: 'Thoughts, emotions, and mental clarity',
    descriptionTh: 'ความคิด อารมณ์ และความแจ่มชัดทางจิตใจ',
    tagline: 'Master your mind',
    taglineTh: 'ควบคุมจิตใจตัวเอง',
    focusAreas: ['Thoughts', 'Emotions', 'Clarity', 'Focus', 'Mental health'],
    focusAreasTh: ['ความคิด', 'อารมณ์', 'ความชัดเจน', 'สมาธิ', 'สุขภาพจิต'],
  },
  relationship: {
    id: 'relationship',
    name: 'Relationships',
    nameTh: 'ความสัมพันธ์',
    emoji: '🤝',
    color: '#67E8F9', // Soft Cyan
    mood: 'Connected / Warm',
    moodTh: 'เชื่อมโยง / อบอุ่น',
    archetype: 'constellation',
    description: 'Connections with others and social bonds',
    descriptionTh: 'การเชื่อมโยงกับผู้อื่นและสายสัมพันธ์ทางสังคม',
    tagline: 'Build meaningful bonds',
    taglineTh: 'สร้างสายสัมพันธ์ที่มีความหมาย',
    focusAreas: ['Communication', 'Boundaries', 'Trust', 'Conflict', 'Connection'],
    focusAreasTh: ['การสื่อสาร', 'ขอบเขต', 'ความไว้วางใจ', 'ความขัดแย้ง', 'การเชื่อมโยง'],
  },
  love: {
    id: 'love',
    name: 'Love',
    nameTh: 'ความรัก',
    emoji: '💕',
    color: '#8B5CF6', // Violet
    mood: 'Deep / Intimate',
    moodTh: 'ลึกซึ้ง / ใกล้ชิด',
    archetype: 'heart',
    description: 'Love, romance, intimacy, and heart connections',
    descriptionTh: 'ความรัก โรแมนติก ความใกล้ชิด และการเชื่อมโยงทางใจ',
    tagline: 'Open your heart',
    taglineTh: 'เปิดใจ',
    focusAreas: ['Romance', 'Intimacy', 'Attachment', 'Vulnerability', 'Partnership'],
    focusAreasTh: ['โรแมนติก', 'ความใกล้ชิด', 'ความผูกพัน', 'การเปิดเผยตัวตน', 'การเป็นคู่ชีวิต'],
  },
  career: {
    id: 'career',
    name: 'Career',
    nameTh: 'อาชีพการงาน',
    emoji: '💼',
    color: '#B8C0CC', // Silver
    mood: 'Focused / Ambitious',
    moodTh: 'มุ่งมั่น / ทะเยอทะยาน',
    archetype: 'city',
    description: 'Work, purpose, and professional growth',
    descriptionTh: 'การงาน เป้าหมาย และการเติบโตในสายอาชีพ',
    tagline: 'Build your legacy',
    taglineTh: 'สร้างมรดกของคุณ',
    focusAreas: ['Purpose', 'Skills', 'Leadership', 'Growth', 'Impact'],
    focusAreasTh: ['เป้าหมาย', 'ทักษะ', 'ภาวะผู้นำ', 'การเติบโต', 'ผลกระทบ'],
  },
  wealth: {
    id: 'wealth',
    name: 'Wealth',
    nameTh: 'ความมั่งคั่ง',
    emoji: '💰',
    color: '#E8B33D', // Gold (used as a limited secondary accent per directive §9)
    mood: 'Strategic / Precise',
    moodTh: 'มีกลยุทธ์ / แม่นยำ',
    archetype: 'crystal',
    description: 'Financial health, abundance, and resources',
    descriptionTh: 'สุขภาพทางการเงิน ความอุดมสมบูรณ์ และทรัพยากร',
    tagline: 'Create prosperity',
    taglineTh: 'สร้างความรุ่งเรือง',
    focusAreas: ['Money', 'Abundance', 'Security', 'Investment', 'Generosity'],
    focusAreasTh: ['เงิน', 'ความอุดมสมบูรณ์', 'ความมั่นคง', 'การลงทุน', 'ความเอื้อเฟื้อ'],
  },
  life: {
    id: 'life',
    name: 'Life',
    nameTh: 'การใช้ชีวิต',
    emoji: '🌍',
    color: '#4A90E2', // Azure
    mood: 'Expansive / Contemplative',
    moodTh: 'กว้างไกล / ครุ่นคิด',
    archetype: 'path',
    description: 'Balance, lifestyle, and life satisfaction',
    descriptionTh: 'สมดุล ไลฟ์สไตล์ และความพึงพอใจในชีวิต',
    tagline: 'Live fully',
    taglineTh: 'ใช้ชีวิตอย่างเต็มที่',
    focusAreas: ['Balance', 'Lifestyle', 'Health', 'Adventure', 'Fulfillment'],
    focusAreasTh: ['สมดุล', 'ไลฟ์สไตล์', 'สุขภาพ', 'การผจญภัย', 'ความเติมเต็ม'],
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    nameTh: 'การเติบโต',
    emoji: '🌱',
    color: '#10B981', // Emerald (restrained, per directive §11)
    mood: 'Inspiring / Evolving',
    moodTh: 'สร้างแรงบันดาลใจ / พัฒนาอยู่เสมอ',
    archetype: 'organic',
    description: 'Learning, development, and transformation',
    descriptionTh: 'การเรียนรู้ การพัฒนา และการเปลี่ยนแปลง',
    tagline: 'Never stop growing',
    taglineTh: 'ไม่หยุดเติบโต',
    focusAreas: ['Learning', 'Skills', 'Habits', 'Mindset', 'Evolution'],
    focusAreasTh: ['การเรียนรู้', 'ทักษะ', 'นิสัย', 'กรอบความคิด', 'วิวัฒนาการ'],
  },
  decision: {
    id: 'decision',
    name: 'Decisions',
    nameTh: 'การตัดสินใจ',
    emoji: '⚖️',
    color: '#B6E3FF', // Ice Blue
    mood: 'Analytical / Strategic',
    moodTh: 'วิเคราะห์เชิงลึก / มีกลยุทธ์',
    archetype: 'branch',
    description: 'Choices, wisdom, and decision-making',
    descriptionTh: 'ทางเลือก ปัญญา และการตัดสินใจ',
    tagline: 'Choose wisely',
    taglineTh: 'เลือกอย่างชาญฉลาด',
    focusAreas: ['Choices', 'Consequences', 'Wisdom', 'Timing', 'Confidence'],
    focusAreasTh: ['ทางเลือก', 'ผลลัพธ์', 'ปัญญา', 'จังหวะเวลา', 'ความมั่นใจ'],
  },
  purpose: {
    id: 'purpose',
    name: 'Purpose',
    nameTh: 'เป้าหมายชีวิต',
    emoji: '✨',
    color: '#6366F1', // Indigo
    mood: 'Profound / Contemplative',
    moodTh: 'ลึกซึ้ง / ครุ่นคิด',
    archetype: 'temple',
    description: 'Meaning, mission, and life direction',
    descriptionTh: 'ความหมาย พันธกิจ และทิศทางชีวิต',
    tagline: 'Find your why',
    taglineTh: 'ค้นหาเหตุผลของคุณ',
    focusAreas: ['Mission', 'Meaning', 'Values', 'Impact', 'Direction'],
    focusAreasTh: ['พันธกิจ', 'ความหมาย', 'คุณค่า', 'ผลกระทบ', 'ทิศทาง'],
  },
  wellbeing: {
    id: 'wellbeing',
    name: 'Wellbeing',
    nameTh: 'สุขภาวะ',
    emoji: '🧘',
    color: '#14B8A6', // Teal (soft accent, per directive §14)
    mood: 'Calm / Restorative',
    moodTh: 'สงบ / ฟื้นฟู',
    archetype: 'sanctuary',
    description: 'Health, wellness, and self-care',
    descriptionTh: 'สุขภาพ ความเป็นอยู่ที่ดี และการดูแลตัวเอง',
    tagline: 'Prioritize yourself',
    taglineTh: 'ให้ความสำคัญกับตัวเอง',
    focusAreas: ['Physical', 'Mental', 'Emotional', 'Spiritual', 'Recovery'],
    focusAreasTh: ['ร่างกาย', 'จิตใจ', 'อารมณ์', 'จิตวิญญาณ', 'การฟื้นฟู'],
  },
  future: {
    id: 'future',
    name: 'Future',
    nameTh: 'อนาคต',
    emoji: '🚀',
    color: '#EAF4FF', // Blue-White
    mood: 'Visionary / Expansive',
    moodTh: 'มีวิสัยทัศน์ / กว้างไกล',
    archetype: 'horizon',
    description: 'Vision, goals, and what\'s ahead',
    descriptionTh: 'วิสัยทัศน์ เป้าหมาย และสิ่งที่รออยู่ข้างหน้า',
    tagline: 'Create your future',
    taglineTh: 'สร้างอนาคตของคุณ',
    focusAreas: ['Vision', 'Goals', 'Planning', 'Potential', 'Legacy'],
    focusAreasTh: ['วิสัยทัศน์', 'เป้าหมาย', 'การวางแผน', 'ศักยภาพ', 'มรดก'],
  },
};

/**
 * Get world by ID
 */
export function getWorld(id: WorldId): World {
  return WORLDS[id];
}

/**
 * Get all worlds
 */
export function getAllWorlds(): World[] {
  return Object.values(WORLDS);
}

/**
 * Map articles to worlds
 */
export const WORLD_ARTICLES: Record<WorldId, Article[]> = {
  self: [
    {
      slug: 'identity-exploration',
      title: 'Finding Your Core Identity',
      titleTh: 'ค้นหาแก่นแท้ของตัวตน',
      excerpt: 'Go beyond surface-level labels to discover who you truly are.',
      excerptTh: 'มองข้ามป้ายกำกับผิวเผิน เพื่อค้นพบว่าคุณเป็นใครกันแน่',
      content: 'Your identity is not fixed...',
      author: 'Twin',
      publishedAt: '2026-01-15',
      readTime: 5,
      tags: ['identity', 'self-discovery'],
      world: 'self',
    },
    {
      slug: 'values-framework',
      title: 'Building Your Values Framework',
      titleTh: 'สร้างกรอบคุณค่าของตัวเอง',
      excerpt: 'Create a personal philosophy that guides every decision.',
      excerptTh: 'สร้างปรัชญาส่วนตัวที่นำทางทุกการตัดสินใจ',
      content: 'Values are...',
      author: 'Twin',
      publishedAt: '2026-01-20',
      readTime: 6,
      tags: ['values', 'philosophy'],
      world: 'self',
    },
    {
      slug: 'authenticity-journey',
      title: 'The Authenticity Journey',
      titleTh: 'เส้นทางสู่ความเป็นตัวของตัวเอง',
      excerpt: 'Learn to show up as your true self in all areas of life.',
      excerptTh: 'เรียนรู้ที่จะเป็นตัวเองอย่างแท้จริงในทุกด้านของชีวิต',
      content: 'Authenticity is...',
      author: 'Twin',
      publishedAt: '2026-01-25',
      readTime: 5,
      tags: ['authenticity', 'self-expression'],
      world: 'self',
    },
  ],
  mind: [
    {
      slug: 'mental-clarity',
      title: 'Mental Clarity Through Simplification',
      titleTh: 'ความแจ่มชัดทางความคิดผ่านการทำให้เรียบง่าย',
      excerpt: 'Declutter your mind and access your best thinking.',
      excerptTh: 'จัดระเบียบความคิดให้โล่ง เพื่อเข้าถึงการคิดที่ดีที่สุดของคุณ',
      content: 'Mental clutter...',
      author: 'Twin',
      publishedAt: '2026-01-10',
      readTime: 6,
      tags: ['clarity', 'mindfulness'],
      world: 'mind',
    },
    {
      slug: 'emotion-mastery',
      title: 'Mastering Your Emotions',
      titleTh: 'เชี่ยวชาญในการจัดการอารมณ์',
      excerpt: 'Understand and work with your emotional landscape.',
      excerptTh: 'เข้าใจและทำงานร่วมกับภูมิทัศน์ทางอารมณ์ของคุณ',
      content: 'Emotions are...',
      author: 'Twin',
      publishedAt: '2026-01-18',
      readTime: 7,
      tags: ['emotions', 'self-regulation'],
      world: 'mind',
    },
    {
      slug: 'focus-protocol',
      title: 'Building Deep Focus',
      titleTh: 'สร้างสมาธิเชิงลึก',
      excerpt: 'Create environments and habits that support concentration.',
      excerptTh: 'สร้างสภาพแวดล้อมและนิสัยที่ส่งเสริมสมาธิ',
      content: 'Focus is...',
      author: 'Twin',
      publishedAt: '2026-01-22',
      readTime: 5,
      tags: ['focus', 'productivity'],
      world: 'mind',
    },
  ],
  relationship: [
    {
      slug: 'communication-skills',
      title: 'Mastering Vulnerable Communication',
      titleTh: 'เชี่ยวชาญการสื่อสารอย่างเปิดใจ',
      excerpt: 'Speak your truth while honoring others.',
      excerptTh: 'พูดความจริงของคุณโดยให้เกียรติผู้อื่น',
      content: 'True communication...',
      author: 'Twin',
      publishedAt: '2026-01-12',
      readTime: 6,
      tags: ['communication', 'vulnerability'],
      world: 'relationship',
    },
    {
      slug: 'boundary-setting',
      title: 'Healthy Boundaries: A Love Language',
      titleTh: 'ขอบเขตที่ดีต่อใจ: ภาษารักอีกแบบหนึ่ง',
      excerpt: 'Set limits that strengthen, not damage, relationships.',
      excerptTh: 'ตั้งขอบเขตที่เสริมสร้าง ไม่ใช่ทำลายความสัมพันธ์',
      content: 'Boundaries are...',
      author: 'Twin',
      publishedAt: '2026-01-19',
      readTime: 5,
      tags: ['boundaries', 'relationships'],
      world: 'relationship',
    },
    {
      slug: 'conflict-resolution',
      title: 'Turning Conflict Into Connection',
      titleTh: 'เปลี่ยนความขัดแย้งให้เป็นการเชื่อมโยง',
      excerpt: 'Use disagreements as opportunities to deepen bonds.',
      excerptTh: 'ใช้ความไม่ลงรอยกันเป็นโอกาสกระชับสายสัมพันธ์',
      content: 'Conflict is...',
      author: 'Twin',
      publishedAt: '2026-01-26',
      readTime: 7,
      tags: ['conflict', 'resolution'],
      world: 'relationship',
    },
  ],
  love: [
    {
      slug: 'romantic-readiness',
      title: 'Preparing for Love',
      titleTh: 'เตรียมพร้อมสำหรับความรัก',
      excerpt: 'Become the partner you wish to find.',
      excerptTh: 'เป็นคนรักในแบบที่คุณอยากพบเจอ',
      content: 'Romantic love...',
      author: 'Twin',
      publishedAt: '2026-01-14',
      readTime: 6,
      tags: ['love', 'partnership'],
      world: 'love',
    },
    {
      slug: 'intimacy-depth',
      title: 'Building Intimacy Beyond Physical',
      titleTh: 'สร้างความใกล้ชิดที่ลึกกว่าทางกาย',
      excerpt: 'Create deep connection through vulnerability and presence.',
      excerptTh: 'สร้างการเชื่อมโยงลึกซึ้งผ่านการเปิดใจและการอยู่ตรงหน้า',
      content: 'True intimacy...',
      author: 'Twin',
      publishedAt: '2026-01-21',
      readTime: 6,
      tags: ['intimacy', 'connection'],
      world: 'love',
    },
    {
      slug: 'love-languages',
      title: 'Speaking Your Love Language',
      titleTh: 'พูดภาษารักของคุณ',
      excerpt: 'Give and receive love in ways that matter most.',
      excerptTh: 'ให้และรับความรักในแบบที่สำคัญที่สุดสำหรับคุณ',
      content: 'Love languages...',
      author: 'Twin',
      publishedAt: '2026-01-28',
      readTime: 5,
      tags: ['love', 'communication'],
      world: 'love',
    },
  ],
  career: [
    {
      slug: 'purpose-discovery',
      title: 'Finding Your Professional Purpose',
      titleTh: 'ค้นหาเป้าหมายในสายอาชีพ',
      excerpt: 'Move beyond paychecks to meaningful work.',
      excerptTh: 'ก้าวข้ามเงินเดือนไปสู่งานที่มีความหมาย',
      content: 'Purpose in work...',
      author: 'Twin',
      publishedAt: '2026-01-11',
      readTime: 7,
      tags: ['purpose', 'career'],
      world: 'career',
    },
    {
      slug: 'leadership-journey',
      title: 'The Leadership Journey Within',
      titleTh: 'เส้นทางความเป็นผู้นำจากภายใน',
      excerpt: 'Lead from authenticity and vision.',
      excerptTh: 'นำทีมด้วยความจริงใจและวิสัยทัศน์',
      content: 'Real leadership...',
      author: 'Twin',
      publishedAt: '2026-01-17',
      readTime: 8,
      tags: ['leadership', 'growth'],
      world: 'career',
    },
    {
      slug: 'skill-mastery',
      title: 'From Competence to Mastery',
      titleTh: 'จากความชำนาญสู่ความเชี่ยวชาญ',
      excerpt: 'Build skills that outlast trends.',
      excerptTh: 'สร้างทักษะที่อยู่ยั่งยืนกว่ากระแส',
      content: 'Mastery is...',
      author: 'Twin',
      publishedAt: '2026-01-24',
      readTime: 6,
      tags: ['skills', 'mastery'],
      world: 'career',
    },
  ],
  wealth: [
    {
      slug: 'money-mindset',
      title: 'Healing Your Money Beliefs',
      titleTh: 'เยียวยาความเชื่อเรื่องเงินของคุณ',
      excerpt: 'Transform limiting thoughts about wealth.',
      excerptTh: 'เปลี่ยนความคิดที่จำกัดตัวเองเรื่องความมั่งคั่ง',
      content: 'Money mindset...',
      author: 'Twin',
      publishedAt: '2026-01-13',
      readTime: 6,
      tags: ['money', 'mindset'],
      world: 'wealth',
    },
    {
      slug: 'abundance-flow',
      title: 'Creating Abundance Flows',
      titleTh: 'สร้างกระแสความอุดมสมบูรณ์',
      excerpt: 'Build systems that generate sustainable wealth.',
      excerptTh: 'สร้างระบบที่สร้างความมั่งคั่งอย่างยั่งยืน',
      content: 'Abundance...',
      author: 'Twin',
      publishedAt: '2026-01-23',
      readTime: 7,
      tags: ['abundance', 'wealth'],
      world: 'wealth',
    },
    {
      slug: 'generosity-wealth',
      title: 'Wealth Through Generosity',
      titleTh: 'ความมั่งคั่งผ่านความเอื้อเฟื้อ',
      excerpt: 'Discover how giving amplifies abundance.',
      excerptTh: 'ค้นพบว่าการให้ช่วยขยายความอุดมสมบูรณ์ได้อย่างไร',
      content: 'Generosity...',
      author: 'Twin',
      publishedAt: '2026-01-29',
      readTime: 5,
      tags: ['generosity', 'wealth'],
      world: 'wealth',
    },
  ],
  life: [
    {
      slug: 'life-balance',
      title: 'Designing Your Ideal Lifestyle',
      titleTh: 'ออกแบบไลฟ์สไตล์ในฝัน',
      excerpt: 'Balance ambition with presence and joy.',
      excerptTh: 'สร้างสมดุลระหว่างความทะเยอทะยานกับการอยู่กับปัจจุบันและความสุข',
      content: 'Balance is...',
      author: 'Twin',
      publishedAt: '2026-01-16',
      readTime: 7,
      tags: ['balance', 'lifestyle'],
      world: 'life',
    },
    {
      slug: 'adventure-spirit',
      title: 'Awakening Your Adventure Spirit',
      titleTh: 'ปลุกจิตวิญญาณนักผจญภัยในตัวคุณ',
      excerpt: 'Live boldly and embrace new experiences.',
      excerptTh: 'ใช้ชีวิตอย่างกล้าหาญและเปิดรับประสบการณ์ใหม่',
      content: 'Adventure...',
      author: 'Twin',
      publishedAt: '2026-01-27',
      readTime: 6,
      tags: ['adventure', 'fulfillment'],
      world: 'life',
    },
    {
      slug: 'health-foundation',
      title: 'Health as Your Foundation',
      titleTh: 'สุขภาพคือรากฐานของคุณ',
      excerpt: 'Build vitality that supports all other pursuits.',
      excerptTh: 'สร้างพลังชีวิตที่หนุนทุกเป้าหมายอื่นๆ',
      content: 'Health is...',
      author: 'Twin',
      publishedAt: '2026-01-30',
      readTime: 6,
      tags: ['health', 'wellness'],
      world: 'life',
    },
  ],
  growth: [
    {
      slug: 'learning-mastery',
      title: 'Learning How to Learn',
      titleTh: 'เรียนรู้วิธีการเรียนรู้',
      excerpt: 'Develop a lifelong learning practice.',
      excerptTh: 'สร้างนิสัยการเรียนรู้ตลอดชีวิต',
      content: 'Learning...',
      author: 'Twin',
      publishedAt: '2026-01-09',
      readTime: 7,
      tags: ['learning', 'growth'],
      world: 'growth',
    },
    {
      slug: 'habit-evolution',
      title: 'Evolving Through Habit Stacking',
      titleTh: 'พัฒนาตัวเองผ่านการต่อยอดนิสัย',
      excerpt: 'Build momentum through small, consistent changes.',
      excerptTh: 'สร้างแรงส่งผ่านการเปลี่ยนแปลงเล็กๆ อย่างสม่ำเสมอ',
      content: 'Habits...',
      author: 'Twin',
      publishedAt: '2026-01-20',
      readTime: 6,
      tags: ['habits', 'evolution'],
      world: 'growth',
    },
    {
      slug: 'mindset-transformation',
      title: 'From Fixed to Growth Mindset',
      titleTh: 'จาก Fixed Mindset สู่ Growth Mindset',
      excerpt: 'Embrace challenges as opportunities.',
      excerptTh: 'มองความท้าทายเป็นโอกาส',
      content: 'Mindset...',
      author: 'Twin',
      publishedAt: '2026-01-31',
      readTime: 5,
      tags: ['mindset', 'growth'],
      world: 'growth',
    },
  ],
  decision: [
    {
      slug: 'decision-framework',
      title: 'The SICE Decision Framework',
      titleTh: 'กรอบการตัดสินใจแบบ SICE',
      excerpt: 'Make confident choices aligned with your values.',
      excerptTh: 'ตัดสินใจอย่างมั่นใจสอดคล้องกับคุณค่าของคุณ',
      content: 'Decisions...',
      author: 'Twin',
      publishedAt: '2026-01-08',
      readTime: 8,
      tags: ['decisions', 'wisdom'],
      world: 'decision',
    },
    {
      slug: 'consequence-mapping',
      title: 'Mapping Consequences Before Deciding',
      titleTh: 'วางแผนผลลัพธ์ก่อนตัดสินใจ',
      excerpt: 'Think three steps ahead.',
      excerptTh: 'คิดล่วงหน้าสามก้าว',
      content: 'Consequences...',
      author: 'Twin',
      publishedAt: '2026-01-19',
      readTime: 6,
      tags: ['consequences', 'planning'],
      world: 'decision',
    },
    {
      slug: 'decision-confidence',
      title: 'Building Confidence in Your Choices',
      titleTh: 'สร้างความมั่นใจในทางเลือกของคุณ',
      excerpt: 'Trust yourself even when uncertain.',
      excerptTh: 'เชื่อมั่นในตัวเองแม้ในยามไม่แน่ใจ',
      content: 'Confidence...',
      author: 'Twin',
      publishedAt: '2026-02-01',
      readTime: 5,
      tags: ['confidence', 'trust'],
      world: 'decision',
    },
  ],
  purpose: [
    {
      slug: 'purpose-finding',
      title: 'Discovering Your Life Purpose',
      titleTh: 'ค้นพบเป้าหมายชีวิตของคุณ',
      excerpt: 'Find the "why" that drives everything.',
      excerptTh: 'ค้นหา "เหตุผล" ที่ขับเคลื่อนทุกสิ่ง',
      content: 'Purpose...',
      author: 'Twin',
      publishedAt: '2026-01-07',
      readTime: 8,
      tags: ['purpose', 'meaning'],
      world: 'purpose',
    },
    {
      slug: 'mission-statement',
      title: 'Crafting Your Personal Mission',
      titleTh: 'สร้างพันธกิจส่วนตัวของคุณ',
      excerpt: 'Write the story you want to live.',
      excerptTh: 'เขียนเรื่องราวชีวิตที่คุณอยากใช้',
      content: 'Mission...',
      author: 'Twin',
      publishedAt: '2026-01-18',
      readTime: 6,
      tags: ['mission', 'vision'],
      world: 'purpose',
    },
    {
      slug: 'impact-legacy',
      title: 'Creating Your Impact and Legacy',
      titleTh: 'สร้างผลกระทบและมรดกของคุณ',
      excerpt: 'Live in a way that outlasts you.',
      excerptTh: 'ใช้ชีวิตในแบบที่คงอยู่ยาวนานกว่าตัวคุณ',
      content: 'Impact...',
      author: 'Twin',
      publishedAt: '2026-02-02',
      readTime: 7,
      tags: ['impact', 'legacy'],
      world: 'purpose',
    },
  ],
  wellbeing: [
    {
      slug: 'physical-vitality',
      title: 'Reclaiming Physical Vitality',
      titleTh: 'ฟื้นฟูพลังกายของคุณ',
      excerpt: 'Move, nourish, and strengthen your body.',
      excerptTh: 'เคลื่อนไหว บำรุง และเสริมสร้างร่างกาย',
      content: 'Physical health...',
      author: 'Twin',
      publishedAt: '2026-01-06',
      readTime: 6,
      tags: ['physical', 'health'],
      world: 'wellbeing',
    },
    {
      slug: 'mental-wellness',
      title: 'Mental Wellness as Practice',
      titleTh: 'สุขภาพจิตที่ต้องฝึกฝน',
      excerpt: 'Build resilience and inner peace.',
      excerptTh: 'สร้างความยืดหยุ่นทางใจและความสงบภายใน',
      content: 'Mental wellness...',
      author: 'Twin',
      publishedAt: '2026-01-17',
      readTime: 7,
      tags: ['mental', 'wellness'],
      world: 'wellbeing',
    },
    {
      slug: 'spiritual-connection',
      title: 'Finding Your Spiritual Connection',
      titleTh: 'ค้นหาการเชื่อมโยงทางจิตวิญญาณ',
      excerpt: 'Tap into meaning beyond the material.',
      excerptTh: 'เข้าถึงความหมายที่ลึกกว่าวัตถุ',
      content: 'Spiritual...',
      author: 'Twin',
      publishedAt: '2026-02-03',
      readTime: 6,
      tags: ['spiritual', 'connection'],
      world: 'wellbeing',
    },
  ],
  future: [
    {
      slug: 'vision-creation',
      title: 'Crafting Your Future Vision',
      titleTh: 'สร้างวิสัยทัศน์แห่งอนาคตของคุณ',
      excerpt: 'Paint a compelling picture of what\'s possible.',
      excerptTh: 'วาดภาพที่ชัดเจนของสิ่งที่เป็นไปได้',
      content: 'Vision...',
      author: 'Twin',
      publishedAt: '2026-01-05',
      readTime: 7,
      tags: ['vision', 'future'],
      world: 'future',
    },
    {
      slug: 'goal-strategy',
      title: 'Strategic Goal Setting',
      titleTh: 'ตั้งเป้าหมายเชิงกลยุทธ์',
      excerpt: 'Turn vision into actionable milestones.',
      excerptTh: 'เปลี่ยนวิสัยทัศน์ให้เป็นเป้าหมายที่ลงมือทำได้',
      content: 'Goals...',
      author: 'Twin',
      publishedAt: '2026-01-16',
      readTime: 6,
      tags: ['goals', 'strategy'],
      world: 'future',
    },
    {
      slug: 'potential-unlock',
      title: 'Unlocking Your Full Potential',
      titleTh: 'ปลดล็อกศักยภาพเต็มที่ของคุณ',
      excerpt: 'Become the highest version of yourself.',
      excerptTh: 'เป็นตัวคุณในเวอร์ชันที่ดีที่สุด',
      content: 'Potential...',
      author: 'Twin',
      publishedAt: '2026-02-04',
      readTime: 8,
      tags: ['potential', 'growth'],
      world: 'future',
    },
  ],
};

/**
 * Get articles for a world
 */
export function getWorldArticles(worldId: WorldId): Article[] {
  return WORLD_ARTICLES[worldId] || [];
}
