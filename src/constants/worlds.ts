/**
 * worlds.ts
 * The 12 Worlds of Self Print - Life domains for exploration
 *
 * I18N-WORLDS-001 FIX: name/mood/description/tagline/focusAreas (World) and
 * title/excerpt (Article) carry a Thai counterpart (`*Th` suffix) so
 * WorldDetail.tsx/WorldsHub.tsx/WorldSelector.tsx/WorldTabs.tsx can render
 * this data bilingually under /th and /en.
 *
 * WORLDCONTENT-001 FIX: Article.content used to be a single-line English
 * placeholder stub (e.g. "Mental clutter..."), never rendered anywhere in
 * the UI. Replaced with real bilingual long-form content (content/contentTh,
 * each an array of paragraphs) and wired into WorldDetail.tsx as an
 * expandable full-article view.
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
  /** WORLDCONTENT-001: real long-form body, one paragraph per array entry —
   *  same shape as BlogListPage.tsx's static article content. */
  content: string[];
  contentTh: string[];
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
      content: [
        "Most people build their identity from the outside in — a job title, a relationship status, what other people expect of them. That version of you is convenient, but it's borrowed. It works until the situation changes and you're left wondering who you actually are underneath the roles.",
        "Your Twin approaches identity differently: not as a fixed label to discover once, but as a pattern that shows up consistently across contexts — how you make decisions when no one's watching, what you protect even when it costs you, what you keep returning to. That pattern is closer to the truth than any single word could be.",
        "Start small: notice one choice today that felt fully yours, not performed for anyone. Write down what made it feel that way. Do that for a week, and a much clearer picture of your core identity starts to emerge — not a label, but evidence.",
      ],
      contentTh: [
        'คนส่วนใหญ่สร้างตัวตนจากภายนอกเข้ามา — ตำแหน่งงาน สถานะความสัมพันธ์ หรือสิ่งที่คนอื่นคาดหวัง ตัวตนแบบนี้สะดวกแต่เป็นของยืมมา มันใช้ได้จนกว่าสถานการณ์จะเปลี่ยน แล้วคุณจะพบว่าไม่รู้จักตัวเองที่แท้จริงใต้บทบาทเหล่านั้น',
        'ทวินของคุณมองเรื่องอัตลักษณ์ต่างออกไป ไม่ใช่ป้ายกำกับตายตัวที่ค้นพบครั้งเดียวจบ แต่เป็นแพทเทิร์นที่ปรากฏซ้ำๆ ในทุกสถานการณ์ — คุณตัดสินใจอย่างไรตอนไม่มีใครมอง คุณปกป้องอะไรแม้ต้องแลกด้วยราคาบางอย่าง คุณย้อนกลับไปหาอะไรซ้ำๆ แพทเทิร์นนี้ใกล้เคียงความจริงมากกว่าคำนิยามใดคำเดียว',
        'เริ่มจากสิ่งเล็กๆ: สังเกตการตัดสินใจหนึ่งอย่างวันนี้ที่รู้สึกว่าเป็นของคุณจริงๆ ไม่ได้ทำเพื่อใคร แล้วจดไว้ว่าอะไรทำให้มันรู้สึกแบบนั้น ทำแบบนี้ต่อเนื่องหนึ่งสัปดาห์ ภาพของแก่นแท้ตัวตนคุณจะเริ่มชัดขึ้น — ไม่ใช่ป้ายกำกับ แต่เป็นหลักฐาน',
      ],
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
      content: [
        "A values framework isn't a poster on the wall — it's the thing you check against automatically before you've even finished deciding. Most people never build one on purpose, so their values get set by default: whoever spoke loudest growing up, whichever fear got reinforced most often.",
        "Building it deliberately means naming the 3-5 things you actually protect when circumstances force a trade-off — not what sounds admirable, but what you've demonstrably chosen under pressure. Once those are named, decisions that used to take days start taking minutes, because you're no longer negotiating with yourself from scratch each time.",
      ],
      contentTh: [
        'กรอบคุณค่าไม่ใช่โปสเตอร์แปะผนัง แต่คือสิ่งที่คุณเทียบเคียงโดยอัตโนมัติก่อนตัดสินใจเสร็จด้วยซ้ำ คนส่วนใหญ่ไม่เคยสร้างมันขึ้นมาอย่างตั้งใจ คุณค่าของพวกเขาจึงถูกกำหนดโดยปริยาย — จากใครที่พูดเสียงดังที่สุดตอนโต หรือความกลัวไหนที่ถูกตอกย้ำบ่อยที่สุด',
        'การสร้างกรอบคุณค่าอย่างตั้งใจ คือการระบุ 3-5 สิ่งที่คุณปกป้องจริงๆ เมื่อสถานการณ์บังคับให้ต้องเลือก — ไม่ใช่สิ่งที่ฟังดูดี แต่คือสิ่งที่คุณเลือกจริงภายใต้แรงกดดัน เมื่อระบุได้แล้ว การตัดสินใจที่เคยใช้เวลาเป็นวันจะเหลือแค่ไม่กี่นาที เพราะคุณไม่ต้องต่อรองกับตัวเองใหม่ทุกครั้ง',
      ],
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
      content: [
        "Authenticity gets sold as a destination — as if one day you 'arrive' at your true self and stay there. In practice it's closer to a muscle: the more often you choose the honest response over the safe one, the easier that choice becomes, and the harder it gets to keep performing.",
        "The real test isn't how you act around people who already accept you — it's whether you can stay recognizably yourself around the people whose approval you still want. That's where most people quietly edit themselves. Notice where you do it, and you've found your actual growth edge.",
      ],
      contentTh: [
        "ความเป็นตัวของตัวเองมักถูกขายเป็นปลายทาง เหมือนวันหนึ่งคุณจะ 'ไปถึง' ตัวตนที่แท้จริงแล้วอยู่ตรงนั้นตลอดไป แต่ในความเป็นจริงมันเหมือนกล้ามเนื้อมากกว่า — ยิ่งคุณเลือกคำตอบที่ซื่อตรงแทนคำตอบที่ปลอดภัยบ่อยเท่าไหร่ การเลือกแบบนั้นก็ยิ่งง่ายขึ้น และยิ่งฝืนใจแสดงบทบาทต่อไปได้ยากขึ้น",
        'บททดสอบจริงไม่ใช่การที่คุณเป็นตัวเองต่อหน้าคนที่ยอมรับคุณอยู่แล้ว แต่คือคุณยังเป็นตัวเองได้แค่ไหนต่อหน้าคนที่คุณยังอยากได้การยอมรับจากเขา นั่นแหละคือจุดที่คนส่วนใหญ่แอบปรับตัวเองเงียบๆ สังเกตว่าคุณทำแบบนั้นตรงไหน แล้วคุณจะเจอจุดที่ต้องเติบโตจริงๆ',
      ],
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
      content: [
        "Mental clutter isn't usually too many thoughts — it's too many unfinished ones. Every open loop (an email you're avoiding, a decision you're postponing, a conversation you owe someone) keeps a small amount of attention reserved for it, even while you're doing something else entirely.",
        "Clarity comes from closing loops, not from thinking harder. Write down every unfinished thing you're carrying, pick the smallest one, and finish it today. You won't feel calmer because the big problems are solved — you'll feel calmer because your mind has fewer tabs open.",
      ],
      contentTh: [
        'ความยุ่งเหยิงทางความคิดมักไม่ได้มาจากความคิดที่มากเกินไป แต่มาจากเรื่องที่ค้างคาไม่จบมากเกินไป ทุกเรื่องที่ยังไม่จบ (อีเมลที่คุณเลี่ยงตอบ การตัดสินใจที่คุณผัดไป บทสนทนาที่คุณติดค้างใคร) จะกันความสนใจส่วนหนึ่งไว้ให้มันเสมอ แม้คุณกำลังทำอย่างอื่นอยู่ก็ตาม',
        'ความแจ่มชัดมาจากการปิดเรื่องค้างคา ไม่ใช่การคิดให้หนักขึ้น ลองจดทุกเรื่องที่ยังค้างอยู่ในหัว เลือกเรื่องที่เล็กที่สุด แล้วทำให้จบวันนี้ คุณจะรู้สึกสงบขึ้นไม่ใช่เพราะปัญหาใหญ่ถูกแก้ แต่เพราะหัวของคุณมีแท็บที่เปิดค้างน้อยลง',
      ],
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
      content: [
        "Mastering emotions doesn't mean feeling less — it means reacting less automatically. The gap between 'something happens' and 'you respond' is where all the leverage lives. Widen that gap even slightly and the same emotion stops running your decisions for you.",
        "Start by naming the emotion precisely instead of generally. 'Frustrated' covers too much ground; 'frustrated because I feel unheard' points to what actually needs addressing. Precise naming is often the fastest way to take an emotion from overwhelming to workable.",
      ],
      contentTh: [
        "การเชี่ยวชาญด้านอารมณ์ไม่ได้แปลว่ารู้สึกน้อยลง แต่คือการตอบสนองแบบอัตโนมัติน้อยลง ช่องว่างระหว่าง 'เหตุการณ์เกิดขึ้น' กับ 'คุณตอบสนอง' คือจุดที่มีอำนาจต่อรองอยู่ทั้งหมด แค่ขยายช่องว่างนั้นเล็กน้อย อารมณ์เดิมก็จะไม่ครอบงำการตัดสินใจของคุณอีกต่อไป",
        "เริ่มจากการเรียกชื่ออารมณ์ให้เจาะจงแทนที่จะเหมารวม คำว่า 'หงุดหงิด' ครอบคลุมกว้างเกินไป แต่ 'หงุดหงิดเพราะรู้สึกไม่มีใครฟัง' ชี้ไปที่สิ่งที่ต้องจัดการจริงๆ การเรียกชื่ออารมณ์อย่างแม่นยำมักเป็นวิธีที่เร็วที่สุดที่จะเปลี่ยนอารมณ์ท่วมท้นให้กลายเป็นสิ่งที่จัดการได้",
      ],
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
      content: [
        "Deep focus is rarely a willpower problem — it's an environment problem. If your phone, your notifications, and your open tabs are all one glance away, no amount of discipline will out-compete that design. The fix is structural, not motivational.",
        "Build a protocol, not a promise: same time, same place, same first physical action every time (close the laptop lid, put the phone in another room) before you start. After enough repetitions, that sequence itself becomes the cue your brain uses to drop into focus.",
      ],
      contentTh: [
        'สมาธิเชิงลึกแทบไม่ใช่ปัญหาเรื่องความตั้งใจ แต่เป็นปัญหาเรื่องสภาพแวดล้อม ถ้ามือถือ การแจ้งเตือน และแท็บที่เปิดค้างอยู่ห่างแค่เอื้อมมือ ไม่มีวินัยแบบไหนที่จะสู้กับการออกแบบแบบนั้นได้ ทางแก้จึงต้องเป็นเชิงโครงสร้าง ไม่ใช่แค่แรงจูงใจ',
        'สร้างขั้นตอนที่ทำซ้ำได้ ไม่ใช่แค่คำสัญญากับตัวเอง: เวลาเดิม สถานที่เดิม การกระทำแรกแบบเดิมทุกครั้ง (ปิดจอโน้ตบุ๊ก เอามือถือไปไว้อีกห้อง) ก่อนเริ่มงาน เมื่อทำซ้ำมากพอ ลำดับขั้นตอนนั้นเองจะกลายเป็นสัญญาณที่สมองใช้เพื่อดิ่งเข้าสู่โหมดโฟกัส',
      ],
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
      content: [
        "Vulnerable communication gets confused with oversharing. It isn't. It's saying the true, slightly uncomfortable thing — 'I felt hurt when that happened' — instead of the safer, indirect version — 'you always do this.' The first invites a conversation; the second starts a defense.",
        "The skill is separating the observation from the story you built around it. State what happened, state how it landed on you, and stop there. Let the other person respond to the real thing instead of to your interpretation of their intentions.",
      ],
      contentTh: [
        "การสื่อสารอย่างเปิดใจมักถูกเข้าใจผิดว่าคือการเล่าทุกอย่างแบบไม่มีขอบเขต แต่จริงๆ แล้วมันคือการพูดสิ่งที่จริงและอาจอึดอัดเล็กน้อย เช่น 'ฉันรู้สึกเจ็บตอนที่เรื่องนั้นเกิดขึ้น' แทนที่จะพูดแบบอ้อมและปลอดภัยกว่าอย่าง 'เธอทำแบบนี้ตลอด' แบบแรกเปิดบทสนทนา แบบหลังเริ่มการตั้งรับ",
        'ทักษะสำคัญคือการแยกสิ่งที่สังเกตเห็นออกจากเรื่องราวที่คุณสร้างขึ้นเอง บอกว่าเกิดอะไรขึ้น บอกว่ามันกระทบใจคุณอย่างไร แล้วหยุดแค่นั้น ปล่อยให้อีกฝ่ายตอบสนองต่อสิ่งที่เกิดขึ้นจริง แทนที่จะตอบต่อการตีความเจตนาของเขาที่คุณคิดไปเอง',
      ],
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
      content: [
        "A boundary that comes with an apology attached isn't really a boundary yet — it's a request for permission. 'I'm sorry, but I can't this weekend' teaches people your limits are negotiable. 'I can't this weekend' teaches them your limits are simply facts.",
        "The relationships that survive a real boundary were never depending on your lack of one. The ones that end after you set it were quietly relying on that gap the whole time. Both outcomes are information — and neither one means you set the boundary wrong.",
      ],
      contentTh: [
        "ขอบเขตที่มาพร้อมคำขอโทษยังไม่ใช่ขอบเขตจริงๆ แต่เป็นการขออนุญาต การพูดว่า 'ขอโทษนะ แต่สุดสัปดาห์นี้ทำไม่ได้จริงๆ' สอนให้คนอื่นรู้ว่าขอบเขตของคุณต่อรองได้ แต่การพูดว่า 'สุดสัปดาห์นี้ทำไม่ได้' สอนให้เขารู้ว่ามันคือข้อเท็จจริงเฉยๆ",
        'ความสัมพันธ์ที่รอดจากการตั้งขอบเขตจริงๆ คือความสัมพันธ์ที่ไม่เคยพึ่งพาการที่คุณไม่มีขอบเขตตั้งแต่แรก ส่วนความสัมพันธ์ที่จบลงหลังคุณตั้งขอบเขต คือความสัมพันธ์ที่แอบพึ่งพาช่องว่างนั้นมาตลอด ทั้งสองผลลัพธ์คือข้อมูล ไม่ได้แปลว่าคุณตั้งขอบเขตผิด',
      ],
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
      content: [
        "Most conflict isn't really about the dishes, the schedule, or who said what — it's about whether each person feels seen while it's happening. Solve the logistics and skip that part, and the same fight comes back next week wearing a different topic.",
        "Before defending your position, try repeating the other person's point back until they say 'yes, that's it.' It costs you nothing and changes the entire tone of the conversation — because now you're two people solving a problem together, not two people defending separate ones.",
      ],
      contentTh: [
        'ความขัดแย้งส่วนใหญ่ไม่ได้เกี่ยวกับจานที่ยังไม่ล้าง ตารางเวลา หรือใครพูดอะไร แต่เกี่ยวกับว่าแต่ละคนรู้สึกว่าถูกมองเห็นระหว่างนั้นหรือเปล่า ถ้าแก้แค่เรื่องปฏิบัติแต่ข้ามส่วนนี้ไป การทะเลาะแบบเดิมจะกลับมาอีกในสัปดาห์หน้าแค่เปลี่ยนหัวข้อ',
        "ก่อนจะปกป้องจุดยืนของตัวเอง ลองพูดทวนสิ่งที่อีกฝ่ายพูดจนกว่าเขาจะบอกว่า 'ใช่ ประมาณนั้นแหละ' มันไม่เสียอะไรเลยแต่เปลี่ยนบรรยากาศของบทสนทนาทั้งหมด เพราะตอนนี้กลายเป็นสองคนที่ช่วยกันแก้ปัญหา ไม่ใช่สองคนที่ต่างปกป้องจุดยืนของตัวเอง",
      ],
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
      content: [
        "'Preparing for love' sounds like a checklist — fix yourself first, then earn the relationship. That framing sets an impossible bar. Readiness isn't the absence of issues; it's having enough self-awareness to name your patterns before they surprise someone else.",
        "A more honest question than 'am I ready' is 'do I know what I tend to do when I feel insecure in a relationship?' If you can answer that clearly, you're already further along than most people who consider themselves ready.",
      ],
      contentTh: [
        "'เตรียมพร้อมสำหรับความรัก' ฟังดูเหมือนเช็คลิสต์ — แก้ตัวเองให้ดีก่อนแล้วค่อยคู่ควรกับความสัมพันธ์ กรอบคิดแบบนี้ตั้งมาตรฐานที่เป็นไปไม่ได้ ความพร้อมไม่ใช่การไม่มีปัญหาเลย แต่คือการรู้จักตัวเองมากพอที่จะเรียกชื่อแพทเทิร์นของตัวเองได้ก่อนที่มันจะไปทำร้ายใจใครโดยไม่ทันตั้งตัว",
        "คำถามที่ตรงกว่า 'ฉันพร้อมหรือยัง' คือ 'ฉันรู้ไหมว่าตัวเองมักทำอะไรตอนรู้สึกไม่มั่นคงในความสัมพันธ์' ถ้าคุณตอบคำถามนี้ได้ชัดเจน แปลว่าคุณไปไกลกว่าคนส่วนใหญ่ที่คิดว่าตัวเองพร้อมแล้วเสียอีก",
      ],
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
      content: [
        "Physical closeness is easy to measure; emotional closeness is not, which is why couples often mistake one for the other. Real intimacy is built less in big romantic moments and more in the small, unremarkable ones — being fully present while someone tells you an ordinary story about their day.",
        "Try this: the next time your partner talks about something small, resist the urge to fix, advise, or relate it back to yourself. Just stay with what they're saying. That kind of undivided attention is rarer — and more intimate — than most grand gestures.",
      ],
      contentTh: [
        'ความใกล้ชิดทางกายวัดได้ง่าย แต่ความใกล้ชิดทางใจวัดไม่ได้ นั่นคือเหตุผลที่คู่รักมักเข้าใจผิดว่าสองอย่างนี้คือเรื่องเดียวกัน ความใกล้ชิดที่แท้จริงไม่ได้สร้างจากช่วงเวลาโรแมนติกใหญ่ๆ แต่สร้างจากช่วงเวลาเล็กๆ ธรรมดา — การอยู่ตรงนั้นเต็มร้อยตอนที่ใครสักคนเล่าเรื่องธรรมดาในวันของเขาให้ฟัง',
        'ลองทำแบบนี้: ครั้งต่อไปที่คนรักพูดถึงเรื่องเล็กๆ อย่าเพิ่งรีบแก้ปัญหา ให้คำแนะนำ หรือโยงกลับมาที่ตัวเอง แค่อยู่กับสิ่งที่เขาพูดจริงๆ ความสนใจแบบเต็มร้อยแบบนี้หายากกว่า และใกล้ชิดกว่าท่าทีโรแมนติกยิ่งใหญ่ส่วนมากด้วยซ้ำ',
      ],
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
      content: [
        "The love languages idea gets used as a personality label, but it's more useful as a translation problem. You might show love through acts of service while your partner is listening for words of affirmation — you're both giving fully, in a language the other isn't fluent in yet.",
        "The fix isn't to change what love feels natural to you — it's to consciously add a few phrases in the other person's language, even when it feels a little foreign at first. Small, deliberate translation goes further than grand gestures in the wrong dialect.",
      ],
      contentTh: [
        'แนวคิดภาษารักมักถูกใช้เป็นป้ายกำกับบุคลิกภาพ แต่จริงๆ มันมีประโยชน์กว่าถ้ามองเป็นปัญหาเรื่องการแปลภาษา คุณอาจแสดงความรักผ่านการลงมือทำ ในขณะที่คนรักกำลังรอฟังคำพูดยืนยันความรัก ทั้งคู่ให้ความรักเต็มที่ แค่คนละภาษาที่อีกฝ่ายยังไม่คล่อง',
        'ทางแก้ไม่ใช่การเปลี่ยนวิธีแสดงความรักที่เป็นธรรมชาติของคุณ แต่คือการตั้งใจเพิ่มคำพูดหรือท่าทีในภาษาของอีกฝ่ายเข้าไปบ้าง แม้จะรู้สึกแปลกๆ ในตอนแรก การแปลเล็กๆ อย่างตั้งใจไปได้ไกลกว่าท่าทียิ่งใหญ่ที่ผิดภาษา',
      ],
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
      content: [
        "Purpose rarely arrives as a single lightning-bolt realization. It shows up gradually, in the tasks you'd do even without being asked and the ones that drain you no matter how well you're paid for them. Purpose is less discovered than assembled from evidence like that.",
        'Track one week of your work honestly: which hours felt energizing, which felt like a tax you paid to keep your job. That map is a far more reliable guide to your professional purpose than any values statement written in the abstract.',
      ],
      contentTh: [
        "เป้าหมายในสายอาชีพแทบไม่เคยมาแบบสายฟ้าแลบครั้งเดียวแล้วรู้ทันที มันค่อยๆ ปรากฏผ่านงานที่คุณอยากทำแม้ไม่มีใครขอ และงานที่ทำให้คุณหมดแรงไม่ว่าจะได้ค่าตอบแทนดีแค่ไหน เป้าหมายจึงไม่ใช่สิ่งที่ 'ค้นพบ' แต่เป็นสิ่งที่ 'ประกอบขึ้น' จากหลักฐานแบบนั้น",
        'ลองสังเกตงานของคุณอย่างตรงไปตรงมาหนึ่งสัปดาห์: ชั่วโมงไหนที่ทำให้คุณมีพลัง ชั่วโมงไหนที่รู้สึกเหมือนจ่ายภาษีเพื่อรักษางานไว้ แผนที่แบบนี้บอกเป้าหมายในสายอาชีพของคุณได้แม่นยำกว่าคำแถลงคุณค่าที่เขียนแบบเป็นนามธรรมมาก',
      ],
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
      content: [
        "Leadership is often taught as a set of behaviors to perform — speak with confidence, delegate, inspire. Copied without conviction, those behaviors read as hollow, and people notice. Real leadership starts from having something you actually believe, then behavior follows naturally.",
        'Before working on how you lead, get clear on what you\'d stand behind even if it cost you popularity. That clarity is what people are actually following — the specific techniques are secondary, and mostly unnecessary once the conviction is real.',
      ],
      contentTh: [
        'ภาวะผู้นำมักถูกสอนเป็นชุดพฤติกรรมให้แสดงออก — พูดอย่างมั่นใจ มอบหมายงาน สร้างแรงบันดาลใจ แต่เมื่อลอกเลียนแบบโดยไม่มีความเชื่อมั่นจริง พฤติกรรมเหล่านั้นจะดูกลวงเปล่า และคนรอบข้างสัมผัสได้ ภาวะผู้นำที่แท้จริงเริ่มจากการมีสิ่งที่คุณเชื่อจริงๆ แล้วพฤติกรรมจะตามมาเองอย่างเป็นธรรมชาติ',
        'ก่อนจะฝึกวิธีการนำ ให้ชัดเจนก่อนว่าคุณจะยืนหยัดเพื่ออะไรแม้ต้องแลกกับความนิยม ความชัดเจนนั้นแหละคือสิ่งที่คนกำลังเดินตามจริงๆ ส่วนเทคนิคเฉพาะเป็นเรื่องรอง และแทบไม่จำเป็นเลยเมื่อความเชื่อมั่นนั้นเป็นของจริง',
      ],
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
      content: [
        "Competence gets you to 'good enough' quickly, then plateaus — because once a skill stops embarrassing you, most people stop deliberately practicing it. Mastery lives on the other side of that plateau, and it only opens up to people willing to feel like a beginner again on purpose.",
        'The bridge across is deliberate practice: picking the specific sub-skill that\'s currently your weakest link, and drilling only that, uncomfortably, instead of comfortably repeating what you already do well. Trends fade; skills built this way compound.',
      ],
      contentTh: [
        "ความชำนาญพาคุณไปถึงจุด 'ดีพอใช้' ได้เร็ว แล้วก็จะหยุดนิ่ง เพราะเมื่อทักษะนั้นไม่ทำให้คุณอายอีกต่อไป คนส่วนใหญ่ก็เลิกฝึกฝนอย่างตั้งใจ ความเชี่ยวชาญอยู่อีกฝั่งของจุดหยุดนิ่งนั้น และมันจะเปิดให้เฉพาะคนที่ยอมรู้สึกเป็นมือใหม่อีกครั้งอย่างตั้งใจเท่านั้น",
        'สะพานที่พาข้ามไปคือการฝึกฝนอย่างตั้งใจ: เลือกทักษะย่อยที่อ่อนที่สุดของคุณตอนนี้ แล้วฝึกเฉพาะจุดนั้นอย่างไม่สบายตัว แทนที่จะทำซ้ำสิ่งที่ทำได้ดีอยู่แล้วอย่างสบายๆ กระแสจะจางหายไป แต่ทักษะที่สร้างแบบนี้จะสะสมพอกพูนขึ้นเรื่อยๆ',
      ],
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
      content: [
        "Most money beliefs were formed before age ten, absorbed from watching how the adults around you talked about money, not from any decision you consciously made. 'There's never enough' or 'money changes people' can run your financial choices for decades without ever being examined.",
        "You can't argue your way out of an inherited belief with logic alone — but you can test it. Pick one money belief you suspect isn't fully true, and look for one piece of real evidence against it this week. Beliefs built on assumption erode fast once evidence pushes back.",
      ],
      contentTh: [
        "ความเชื่อเรื่องเงินส่วนใหญ่ก่อตัวขึ้นก่อนอายุสิบขวบ ซึมซับมาจากการเห็นผู้ใหญ่รอบตัวพูดถึงเงิน ไม่ใช่จากการตัดสินใจอย่างมีสติของคุณเอง ความเชื่อแบบ 'เงินไม่เคยพอ' หรือ 'เงินเปลี่ยนคน' อาจควบคุมการตัดสินใจทางการเงินของคุณมาหลายสิบปีโดยไม่เคยถูกตรวจสอบเลย",
        'คุณเถียงกับความเชื่อที่รับต่อมาด้วยเหตุผลอย่างเดียวไม่ได้ แต่ทดสอบมันได้ ลองเลือกความเชื่อเรื่องเงินหนึ่งข้อที่คุณสงสัยว่าอาจไม่จริงทั้งหมด แล้วหาหลักฐานจริงสักชิ้นที่ค้านกับมันในสัปดาห์นี้ ความเชื่อที่สร้างจากสมมติฐานจะสลายตัวเร็วมากเมื่อมีหลักฐานค้าน',
      ],
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
      content: [
        'Abundance framed as a mindset alone can drift into wishful thinking. Framed as a system, it\'s practical: sustainable wealth comes from repeatable flows — income streams, habits, and relationships that keep generating value — not from single lucky wins.',
        "Look at your current income sources and ask which ones would keep producing even if you stepped away for a month. If the honest answer is none, that's not a failure — it's simply the next system worth building, one flow at a time.",
      ],
      contentTh: [
        'ความอุดมสมบูรณ์ถ้ามองแค่ในมุมกรอบความคิดอย่างเดียว อาจเลื่อนลอยไปเป็นแค่ความหวังลมๆ แล้งๆ แต่ถ้ามองเป็นระบบ มันจะจับต้องได้จริง — ความมั่งคั่งที่ยั่งยืนมาจากกระแสที่ทำซ้ำได้ เช่น แหล่งรายได้ นิสัย และความสัมพันธ์ที่สร้างคุณค่าต่อเนื่อง ไม่ใช่จากโชคดีครั้งเดียว',
        'ลองดูแหล่งรายได้ปัจจุบันของคุณ แล้วถามว่าอันไหนจะยังสร้างรายได้ต่อแม้คุณหยุดพักไปหนึ่งเดือน ถ้าคำตอบตรงไปตรงมาคือไม่มีเลย นั่นไม่ใช่ความล้มเหลว แต่คือระบบถัดไปที่คุ้มค่าจะสร้าง ทีละกระแส',
      ],
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
      content: [
        "Generosity and scarcity can't occupy the same moment — the act of giving, even in a small amount, requires believing you'll be fine afterward. That belief itself tends to shape behavior in ways that create more opportunity, not less.",
        'This isn\'t a claim that giving magically returns money to you. It\'s simpler: people who give strategically build wider networks, deeper trust, and more referrals than people who hoard quietly — and those things compound into wealth over time, just on a longer timeline than a single transaction.',
      ],
      contentTh: [
        'ความเอื้อเฟื้อกับความรู้สึกขาดแคลนอยู่ร่วมกันในช่วงเวลาเดียวกันไม่ได้ — การให้แม้เพียงเล็กน้อยต้องอาศัยความเชื่อว่าตัวเองจะยังโอเคหลังจากนั้น ความเชื่อนี้เองมักหล่อหลอมพฤติกรรมให้สร้างโอกาสมากขึ้น ไม่ใช่น้อยลง',
        'นี่ไม่ใช่การอ้างว่าการให้จะทำให้เงินย้อนกลับมาหาคุณแบบมหัศจรรย์ แต่ง่ายกว่านั้น: คนที่ให้อย่างมีกลยุทธ์มักสร้างเครือข่ายที่กว้างขึ้น ความไว้วางใจที่ลึกขึ้น และการแนะนำต่อที่มากขึ้น กว่าคนที่กักเก็บไว้เงียบๆ สิ่งเหล่านี้สะสมกลายเป็นความมั่งคั่งในระยะยาว เพียงแต่ใช้เวลานานกว่าธุรกรรมครั้งเดียว',
      ],
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
      content: [
        "Balance gets imagined as a static 50/50 split, which is why it always feels broken — real life isn't evenly divided, it moves in seasons. A demanding work sprint followed by a deliberately slow month is balance measured honestly, over time instead of by the day.",
        "Instead of asking 'am I balanced right now,' ask 'have I been honest with myself about which season I'm in, and did I choose it or just fall into it.' That question does more for lifestyle design than any daily schedule template.",
      ],
      contentTh: [
        'สมดุลมักถูกจินตนาการเป็นการแบ่งครึ่งต่อครึ่งแบบตายตัว นั่นคือเหตุผลที่มันรู้สึกพังอยู่เสมอ — ชีวิตจริงไม่ได้แบ่งเท่ากันขนาดนั้น มันเคลื่อนไหวเป็นฤดูกาล ช่วงงานหนักตามด้วยเดือนที่ตั้งใจให้ช้าลง คือสมดุลที่วัดอย่างตรงไปตรงมาในระยะยาว ไม่ใช่วัดเป็นรายวัน',
        "แทนที่จะถามว่า 'ตอนนี้ฉันสมดุลไหม' ลองถามว่า 'ฉันตรงไปตรงมากับตัวเองไหมว่าตอนนี้อยู่ในฤดูกาลไหน แล้วฉันเลือกมันเองหรือแค่ตกลงไปโดยไม่รู้ตัว' คำถามนี้ช่วยออกแบบไลฟ์สไตล์ได้ดีกว่าตารางเวลารายวันแบบไหนๆ",
      ],
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
      content: [
        "Adventure doesn't require a plane ticket. It requires doing something where the outcome isn't guaranteed and you show up anyway. Most adults quietly stop doing that — everything gets pre-optimized, pre-reviewed, de-risked — and the adventure spirit fades not from age, but from disuse.",
        "Reintroduce it in low-stakes ways first: order the dish you can't pronounce, take the route you've never driven, say yes to the plan with no itinerary. The muscle that says yes to uncertainty gets stronger with small reps, the same as any other.",
      ],
      contentTh: [
        'การผจญภัยไม่จำเป็นต้องใช้ตั๋วเครื่องบิน แค่ทำบางอย่างที่ผลลัพธ์ไม่แน่นอนแล้วยังลงมือทำอยู่ดี ผู้ใหญ่ส่วนมากค่อยๆ เลิกทำแบบนั้นโดยไม่รู้ตัว — ทุกอย่างถูกวางแผนล่วงหน้า รีวิวก่อน ลดความเสี่ยงจนหมด จิตวิญญาณนักผจญภัยจึงจางไป ไม่ใช่เพราะอายุมากขึ้น แต่เพราะไม่ได้ใช้มันนานเกินไป',
        'ลองปลุกมันกลับมาด้วยเรื่องเสี่ยงน้อยๆ ก่อน: สั่งเมนูที่อ่านชื่อไม่ออก ขับรถเส้นทางที่ไม่เคยไป ตอบตกลงแผนที่ไม่มีกำหนดการแน่นอน กล้ามเนื้อที่ตอบรับความไม่แน่นอนจะแข็งแรงขึ้นด้วยการฝึกเล็กๆ เหมือนกล้ามเนื้อส่วนอื่น',
      ],
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
      content: [
        "Health rarely fails all at once — it erodes quietly under everything else you're optimizing for, because it's the one area that doesn't complain immediately when neglected. Sleep debt, skipped meals, and no movement don't send an invoice until months later, and by then the interest has compounded.",
        "Treat health as infrastructure, not a goal to hit once. You don't need a perfect routine — you need three or four non-negotiables (consistent sleep, regular movement, real food, water) that stay in place regardless of how chaotic everything else gets.",
      ],
      contentTh: [
        'สุขภาพแทบไม่เคยพังลงทีเดียว แต่ค่อยๆ กร่อนไปเงียบๆ ใต้ทุกอย่างที่คุณกำลังพยายามทำให้ดีที่สุด เพราะมันเป็นด้านเดียวที่ไม่ส่งสัญญาณทันทีเมื่อถูกละเลย การนอนไม่พอ การข้ามมื้ออาหาร การไม่ขยับร่างกาย จะไม่ส่งใบเรียกเก็บทันที แต่จะมาทีหลังพร้อมดอกเบี้ยที่ทบต้นแล้ว',
        'มองสุขภาพเป็นโครงสร้างพื้นฐาน ไม่ใช่เป้าหมายที่ทำครั้งเดียวจบ คุณไม่ต้องมีกิจวัตรที่สมบูรณ์แบบ แค่มีสามสี่เรื่องที่ต่อรองไม่ได้ (นอนสม่ำเสมอ ขยับร่างกายเป็นประจำ กินอาหารจริง ดื่มน้ำ) ที่ยังคงอยู่ไม่ว่าทุกอย่างรอบตัวจะวุ่นวายแค่ไหน',
      ],
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
      content: [
        'Most people study the way they were taught to in school — read, highlight, reread — which feels productive but produces weak, short-lived recall. The skill that actually compounds isn\'t consuming more information, it\'s learning how your own brain retains it.',
        'Test yourself before you feel ready, not after. Retrieval — forcing your brain to produce the answer from memory instead of recognizing it on a page — is uncomfortable and far more effective than any amount of rereading. Lifelong learning is really lifelong retrieval practice.',
      ],
      contentTh: [
        'คนส่วนใหญ่เรียนรู้ตามแบบที่โรงเรียนสอนไว้ — อ่าน ไฮไลท์ อ่านซ้ำ — ซึ่งรู้สึกเหมือนได้ผลแต่จริงๆ แล้วจดจำได้อ่อนและไม่นาน ทักษะที่สะสมพอกพูนได้จริงไม่ใช่การรับข้อมูลมากขึ้น แต่คือการเรียนรู้ว่าสมองของคุณเองจดจำอย่างไร',
        'ทดสอบตัวเองก่อนที่จะรู้สึกพร้อม ไม่ใช่หลังจากนั้น การดึงความจำ — บังคับให้สมองสร้างคำตอบจากความจำแทนที่จะแค่จำได้เมื่อเห็นบนหน้ากระดาษ — รู้สึกอึดอัดแต่ได้ผลกว่าการอ่านซ้ำมากเท่าไหร่ก็ตาม การเรียนรู้ตลอดชีวิตแท้จริงแล้วคือการฝึกดึงความจำตลอดชีวิต',
      ],
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
      content: [
        "Habit stacking works because it borrows momentum from something already automatic. Attaching a new, small habit right after an existing one ('after I pour my morning coffee, I write one sentence') removes the hardest part of any habit — remembering to start it at all.",
        "Resist the urge to stack five changes at once. One new link at a time, held until it's automatic, then the next. Evolution through habits isn't dramatic — it's boring, compounding, and almost invisible week to week until you look back a year later.",
      ],
      contentTh: [
        "การต่อยอดนิสัยได้ผลเพราะมันยืมแรงส่งจากสิ่งที่ทำเป็นอัตโนมัติอยู่แล้ว การเติมนิสัยใหม่เล็กๆ ต่อจากนิสัยเดิม (เช่น 'หลังชงกาแฟตอนเช้าเสร็จ ฉันจะเขียนหนึ่งประโยค') ตัดส่วนที่ยากที่สุดของนิสัยใดๆ ออกไป นั่นคือการจำให้ได้ว่าต้องเริ่มทำมันตั้งแต่แรก",
        'อย่าใจร้อนต่อยอดห้าอย่างพร้อมกัน ทำทีละจุดเชื่อมจนกลายเป็นอัตโนมัติ แล้วค่อยไปจุดถัดไป การพัฒนาผ่านนิสัยไม่ได้ดูตื่นเต้น มันน่าเบื่อ สะสมทีละนิด และแทบมองไม่เห็นในแต่ละสัปดาห์ จนกว่าคุณจะย้อนมองกลับไปในอีกหนึ่งปีให้หลัง',
      ],
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
      content: [
        "The line between fixed and growth mindset isn't about talent — it's about what a struggle means to you. Fixed mindset reads difficulty as 'proof I'm not cut out for this.' Growth mindset reads the exact same difficulty as 'proof I'm not there yet.'",
        "You can catch the shift in real time: the next time you think 'I'm just not good at this,' add three words — 'yet, and here's what I'd need to practice.' That single addition turns a verdict into a plan.",
      ],
      contentTh: [
        "เส้นแบ่งระหว่าง Fixed Mindset กับ Growth Mindset ไม่ได้อยู่ที่พรสวรรค์ แต่อยู่ที่ความหมายที่คุณให้กับความยากลำบาก Fixed Mindset ตีความความยากว่า 'เป็นหลักฐานว่าฉันไม่เหมาะกับสิ่งนี้' ส่วน Growth Mindset ตีความความยากแบบเดียวกันนั้นว่า 'เป็นหลักฐานว่าฉันยังไปไม่ถึงตรงนั้น'",
        "คุณจับการเปลี่ยนแปลงนี้ได้แบบเรียลไทม์: ครั้งต่อไปที่คิดว่า 'ฉันไม่เก่งเรื่องนี้เลย' ให้เติมคำว่า 'ยัง และนี่คือสิ่งที่ต้องฝึกเพิ่ม' เข้าไป แค่เติมคำนี้ก็เปลี่ยนคำตัดสินให้กลายเป็นแผนการได้ทันที",
      ],
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
      content: [
        "Most bad decisions aren't made from bad information — they're made from unclear priorities under pressure, where whatever feels loudest in the moment wins by default. A framework's real job isn't to make the decision for you; it's to slow down the moment enough for your actual values to catch up.",
        "Before deciding, name what you're actually optimizing for in this specific choice — not in general, in this one. Most people skip this and negotiate with themselves mid-decision instead. Naming the priority first turns a foggy choice into a much simpler comparison.",
      ],
      contentTh: [
        'การตัดสินใจที่ผิดพลาดส่วนใหญ่ไม่ได้มาจากข้อมูลที่แย่ แต่มาจากลำดับความสำคัญที่ไม่ชัดเจนภายใต้แรงกดดัน ซึ่งอะไรก็ตามที่ดังที่สุดในตอนนั้นจะชนะไปโดยปริยาย หน้าที่จริงของกรอบการตัดสินใจไม่ใช่ตัดสินใจแทนคุณ แต่คือชะลอช่วงเวลานั้นให้นานพอที่คุณค่าที่แท้จริงของคุณจะตามทัน',
        'ก่อนตัดสินใจ ให้ระบุก่อนว่าคุณกำลังให้ความสำคัญกับอะไรจริงๆ ในทางเลือกนี้โดยเฉพาะ ไม่ใช่ในภาพรวม แต่ในเรื่องนี้เรื่องเดียว คนส่วนใหญ่ข้ามขั้นตอนนี้ไปแล้วต่อรองกับตัวเองกลางคันแทน การระบุลำดับความสำคัญก่อนจะเปลี่ยนทางเลือกที่มัวๆ ให้กลายเป็นการเปรียบเทียบที่ง่ายขึ้นมาก',
      ],
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
      content: [
        "Most people evaluate a decision by its most obvious, immediate consequence and stop there. Mapping consequences three steps ahead means asking: if this goes as planned, what does it make harder or easier six months from now? And if it doesn't go as planned, what's my actual exposure?",
        "This isn't about predicting the future perfectly — it's impossible to do that. It's about not being surprised by the second-order effects that were, in hindsight, obvious the whole time. A few minutes mapping forward saves months of cleanup later.",
      ],
      contentTh: [
        'คนส่วนใหญ่ประเมินการตัดสินใจจากผลลัพธ์ที่ชัดเจนและใกล้ที่สุดแล้วหยุดแค่นั้น การวางแผนผลลัพธ์ล่วงหน้าสามก้าวคือการถามว่า ถ้าทุกอย่างเป็นไปตามแผน มันจะทำให้เรื่องอะไรง่ายขึ้นหรือยากขึ้นในอีกหกเดือนข้างหน้า และถ้าไม่เป็นไปตามแผน ความเสี่ยงจริงๆ ของฉันคืออะไร',
        'นี่ไม่ใช่การพยายามทำนายอนาคตให้แม่นยำสมบูรณ์แบบ เพราะเป็นไปไม่ได้อยู่แล้ว แต่คือการไม่ต้องแปลกใจกับผลกระทบขั้นที่สองที่ย้อนกลับไปดูแล้วชัดเจนมาตลอด ใช้เวลาไม่กี่นาทีวางแผนล่วงหน้า ช่วยประหยัดเวลาแก้ปัญหาทีหลังได้เป็นเดือน',
      ],
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
      content: [
        "Confidence in decisions doesn't come from certainty — it comes from knowing you decided using the best information and values you had access to at the time. Waiting for certainty before deciding is really just waiting for permission that will never arrive.",
        "A useful test: after deciding, ask 'given what I knew then, was this reasonable?' rather than 'did this turn out perfectly?' The first question you can always answer honestly. The second depends on factors you never controlled in the first place.",
      ],
      contentTh: [
        'ความมั่นใจในการตัดสินใจไม่ได้มาจากความแน่นอน แต่มาจากการรู้ว่าคุณตัดสินใจโดยใช้ข้อมูลและคุณค่าที่ดีที่สุดที่มีอยู่ในตอนนั้น การรอความแน่นอนก่อนตัดสินใจจริงๆ แล้วคือการรออนุญาตที่ไม่มีวันมาถึง',
        "บททดสอบที่ใช้ได้จริง: หลังตัดสินใจแล้ว ให้ถามว่า 'จากสิ่งที่รู้ตอนนั้น การตัดสินใจนี้สมเหตุสมผลไหม' แทนที่จะถามว่า 'ผลลัพธ์ออกมาสมบูรณ์แบบไหม' คำถามแรกคุณตอบได้อย่างตรงไปตรงมาเสมอ ส่วนคำถามที่สองขึ้นอยู่กับปัจจัยที่คุณไม่เคยควบคุมได้ตั้งแต่แรกอยู่แล้ว",
      ],
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
      content: [
        "Life purpose is often searched for like a hidden object — as if it's sitting somewhere waiting to be found intact. More often it's assembled gradually from the intersection of three questions: what do you keep caring about even when no one's watching, what are you unusually capable of, and what does the world actually need from you?",
        "You don't need the full answer to start. Pick the question you can answer most honestly right now, and let the other two stay open. Purpose reveals itself through action far more reliably than through reflection alone.",
      ],
      contentTh: [
        'เป้าหมายชีวิตมักถูกค้นหาเหมือนวัตถุที่ซ่อนอยู่ ราวกับมันวางอยู่ที่ไหนสักแห่งรอให้พบแบบครบถ้วนสมบูรณ์ แต่จริงๆ แล้วมันมักถูกประกอบขึ้นทีละนิดจากจุดตัดของสามคำถาม: คุณยังใส่ใจอะไรแม้ไม่มีใครมอง คุณเก่งอะไรเป็นพิเศษ และโลกต้องการอะไรจากคุณจริงๆ',
        'คุณไม่จำเป็นต้องมีคำตอบครบทั้งหมดก่อนเริ่ม เลือกคำถามที่ตอบได้ตรงไปตรงมาที่สุดตอนนี้ แล้วปล่อยอีกสองข้อไว้เปิดกว้างก่อน เป้าหมายชีวิตมักเผยตัวผ่านการลงมือทำ มากกว่าการครุ่นคิดเพียงอย่างเดียว',
      ],
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
      content: [
        "A personal mission statement fails when it's written to sound impressive rather than to be actually usable. If it can't help you say no to a real opportunity next week, it's decoration, not a mission.",
        "Write it short enough to remember without looking it up, and specific enough that it would exclude some genuinely good options — a mission that fits everything guides nothing. Test it against a real decision you're facing right now; if it doesn't change your answer, revise it.",
      ],
      contentTh: [
        'พันธกิจส่วนตัวมักล้มเหลวเมื่อเขียนขึ้นให้ฟังดูน่าประทับใจแทนที่จะใช้งานได้จริง ถ้ามันช่วยให้คุณปฏิเสธโอกาสจริงๆ ในสัปดาห์หน้าไม่ได้ มันก็แค่เป็นของประดับ ไม่ใช่พันธกิจ',
        'เขียนให้สั้นพอจำได้โดยไม่ต้องเปิดดู และเจาะจงพอที่จะตัดตัวเลือกดีๆ บางอย่างออกไปได้ พันธกิจที่เข้ากับทุกอย่างจะไม่นำทางอะไรเลย ลองทดสอบกับการตัดสินใจจริงที่คุณกำลังเจออยู่ตอนนี้ ถ้ามันไม่เปลี่ยนคำตอบของคุณ ให้แก้ไขใหม่',
      ],
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
      content: [
        "Legacy gets imagined as something built at the end of a life, but it's actually accumulated in the ordinary decisions along the way — who you mentored without being asked to, what you refused to compromise on, how you treated people who couldn't do anything for you.",
        "You don't need a grand plan for impact. You need to notice, this week, one moment where you could leave something better than you found it — a conversation, a piece of work, a relationship — and actually do it. Legacy is a habit, not an event.",
      ],
      contentTh: [
        'มรดกมักถูกจินตนาการว่าเป็นสิ่งที่สร้างขึ้นตอนปลายชีวิต แต่จริงๆ แล้วมันสะสมมาจากการตัดสินใจธรรมดาระหว่างทาง — คุณเป็นพี่เลี้ยงให้ใครโดยไม่มีใครขอ คุณไม่ยอมประนีประนอมกับเรื่องอะไร คุณปฏิบัติกับคนที่ไม่สามารถให้อะไรคุณได้อย่างไร',
        'คุณไม่จำเป็นต้องมีแผนยิ่งใหญ่เพื่อสร้างผลกระทบ แค่สังเกตในสัปดาห์นี้ว่ามีช่วงเวลาไหนบ้างที่คุณทำให้บางสิ่งดีขึ้นกว่าที่เจอมาได้ — บทสนทนา ชิ้นงาน หรือความสัมพันธ์ — แล้วลงมือทำจริงๆ มรดกคือนิสัย ไม่ใช่เหตุการณ์',
      ],
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
      content: [
        "Vitality isn't the absence of tiredness — it's having enough reserve capacity that ordinary demands don't wipe you out. Most people manage energy reactively, reaching for caffeine or willpower after the reserve is already gone, instead of building the reserve in the first place.",
        "Three inputs build that reserve more reliably than any supplement: consistent sleep timing, regular movement (not necessarily intense — just regular), and eating in a way that doesn't crash your energy two hours later. None of them are exciting. All of them compound.",
      ],
      contentTh: [
        'พลังชีวิตไม่ใช่การไม่มีความเหนื่อยเลย แต่คือการมีพลังสำรองมากพอที่ความต้องการปกติในชีวิตจะไม่ทำให้คุณหมดแรง คนส่วนใหญ่จัดการพลังงานแบบตอบสนองทีหลัง คว้ากาแฟหรือใช้แรงใจหลังจากพลังสำรองหมดไปแล้ว แทนที่จะสร้างพลังสำรองไว้ตั้งแต่แรก',
        'สามปัจจัยนี้สร้างพลังสำรองได้น่าเชื่อถือกว่าอาหารเสริมใดๆ: เวลานอนที่สม่ำเสมอ การเคลื่อนไหวร่างกายเป็นประจำ (ไม่จำเป็นต้องหนัก แค่สม่ำเสมอ) และการกินในแบบที่ไม่ทำให้พลังงานร่วงในอีกสองชั่วโมงถัดมา ไม่มีข้อไหนน่าตื่นเต้นเลย แต่ทุกข้อสะสมพอกพูนได้',
      ],
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
      content: [
        "Mental wellness treated as a crisis response — something you address only once things feel unbearable — misses the point. Like physical fitness, it's built through small, unremarkable practice on ordinary days, long before any crisis arrives.",
        "Resilience isn't about eliminating stress; it's about how quickly you return to baseline after it. Notice what actually helps you recover — not what you think should help — and protect ten minutes for it daily, even on days that feel fine.",
      ],
      contentTh: [
        'การมองสุขภาพจิตเป็นแค่การรับมือวิกฤต — สิ่งที่จัดการเฉพาะตอนรู้สึกทนไม่ไหวแล้วเท่านั้น — พลาดประเด็นสำคัญไป เช่นเดียวกับความฟิตทางกาย มันถูกสร้างขึ้นผ่านการฝึกฝนเล็กๆ ธรรมดาในวันปกติ นานก่อนที่วิกฤตใดจะมาถึง',
        'ความยืดหยุ่นทางใจไม่ใช่เรื่องของการกำจัดความเครียดให้หมด แต่คือความเร็วที่คุณกลับมาสู่จุดสมดุลหลังเจอมัน สังเกตว่าอะไรที่ช่วยให้คุณฟื้นตัวได้จริง ไม่ใช่สิ่งที่คุณคิดว่าควรช่วย แล้วกันเวลาสิบนาทีต่อวันไว้ให้มัน แม้ในวันที่รู้สึกโอเคดีอยู่แล้ว',
      ],
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
      content: [
        "Spiritual connection doesn't require a specific belief system — it requires regular contact with something larger than your immediate to-do list. For some that's nature, for others it's music, service, or stillness. The label matters less than the consistency of the practice.",
        "Notice what reliably makes your problems feel smaller without you having solved them. That's usually where your spiritual connection already lives, even if you've never called it that. Return there deliberately, rather than waiting for it to happen by accident.",
      ],
      contentTh: [
        'การเชื่อมโยงทางจิตวิญญาณไม่จำเป็นต้องมีระบบความเชื่อเฉพาะเจาะจง แต่ต้องการการติดต่อสม่ำเสมอกับสิ่งที่ใหญ่กว่ารายการสิ่งที่ต้องทำในแต่ละวัน สำหรับบางคนคือธรรมชาติ บางคนคือดนตรี การช่วยเหลือผู้อื่น หรือความสงบนิ่ง ป้ายกำกับไม่สำคัญเท่าความสม่ำเสมอของการปฏิบัติ',
        'สังเกตว่าอะไรที่ทำให้ปัญหาของคุณรู้สึกเล็กลงได้อย่างน่าเชื่อถือ ทั้งที่คุณยังไม่ได้แก้มันเลย นั่นแหละมักเป็นที่ที่การเชื่อมโยงทางจิตวิญญาณของคุณอยู่แล้ว แม้คุณจะไม่เคยเรียกมันแบบนั้นก็ตาม กลับไปหามันอย่างตั้งใจ แทนที่จะรอให้มันเกิดขึ้นเองโดยบังเอิญ',
      ],
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
      content: [
        "A vague future vision ('I want to be successful and happy') can't actually guide a decision, because almost any choice can be justified by it. A useful vision is specific enough to be uncomfortable — specific enough that you could recognize the day you actually arrived.",
        "Try describing one ordinary Tuesday five years from now in detail — where you wake up, what the first hour looks like, who's around. The specificity is what makes a vision usable; the inspiration is almost a side effect.",
      ],
      contentTh: [
        "วิสัยทัศน์อนาคตที่คลุมเครือ (เช่น 'อยากประสบความสำเร็จและมีความสุข') ไม่สามารถนำทางการตัดสินใจได้จริง เพราะแทบทุกทางเลือกสามารถอ้างเหตุผลด้วยมันได้หมด วิสัยทัศน์ที่ใช้งานได้จริงต้องเจาะจงพอที่จะรู้สึกอึดอัดเล็กน้อย เจาะจงพอที่คุณจะรู้ได้ว่าวันที่มาถึงจริงๆ คือวันไหน",
        'ลองบรรยายวันอังคารธรรมดาวันหนึ่งในอีกห้าปีข้างหน้าอย่างละเอียด — คุณตื่นที่ไหน ชั่วโมงแรกเป็นอย่างไร ใครอยู่รอบตัวคุณ ความเจาะจงแบบนี้แหละที่ทำให้วิสัยทัศน์ใช้งานได้จริง ส่วนแรงบันดาลใจเป็นแค่ผลพลอยได้',
      ],
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
      content: [
        "A goal without a strategy is just a wish with a deadline attached. Strategy is the honest answer to 'given my actual constraints — time, money, energy — what's the smallest next action that moves this forward this week?'",
        'Big goals fail less often from lack of ambition and more often from having no bridge between the vision and Monday morning. Build that bridge first: one milestone, one weekly action, one way to notice if you\'re drifting off course.',
      ],
      contentTh: [
        "เป้าหมายที่ไม่มีกลยุทธ์ก็แค่ความปรารถนาที่มีกำหนดเวลาแปะไว้เฉยๆ กลยุทธ์คือคำตอบที่ตรงไปตรงมาต่อคำถามว่า 'จากข้อจำกัดจริงๆ ของฉัน — เวลา เงิน พลังงาน — การกระทำถัดไปที่เล็กที่สุดที่จะขับเคลื่อนเรื่องนี้ในสัปดาห์นี้คืออะไร'",
        'เป้าหมายใหญ่มักล้มเหลวไม่ใช่เพราะขาดความทะเยอทะยาน แต่เพราะไม่มีสะพานเชื่อมระหว่างวิสัยทัศน์กับเช้าวันจันทร์ สร้างสะพานนั้นก่อน: หนึ่งจุดหมายย่อย หนึ่งการกระทำรายสัปดาห์ และหนึ่งวิธีสังเกตว่ากำลังหลุดออกนอกเส้นทางหรือเปล่า',
      ],
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
      content: [
        "'Full potential' sounds like a fixed ceiling waiting to be reached, which makes it intimidating. It's more useful to think of potential as unlocked through constraints, not the absence of them — most people do their best work with real limits (a deadline, a budget, a specific audience), not with unlimited freedom.",
        "Instead of asking what you could become with no limits, ask what you could build this month with the exact constraints you actually have right now. Potential shows up under pressure far more reliably than it shows up in open-ended daydreaming.",
      ],
      contentTh: [
        "'ศักยภาพเต็มที่' ฟังดูเหมือนเพดานตายตัวที่รอให้ไปถึง ทำให้ฟังดูน่ากลัว แต่จริงๆ แล้วมันมีประโยชน์กว่าถ้ามองว่าศักยภาพถูกปลดล็อกผ่านข้อจำกัด ไม่ใช่การไม่มีข้อจำกัดเลย คนส่วนใหญ่ทำงานได้ดีที่สุดภายใต้ข้อจำกัดจริง (กำหนดเวลา งบประมาณ กลุ่มเป้าหมายเฉพาะ) ไม่ใช่ภายใต้อิสระที่ไม่มีขอบเขต",
        'แทนที่จะถามว่าคุณจะเป็นอะไรได้ถ้าไม่มีข้อจำกัดเลย ให้ถามว่าคุณจะสร้างอะไรได้ในเดือนนี้ ด้วยข้อจำกัดที่มีอยู่จริงตอนนี้พอดี ศักยภาพมักปรากฏขึ้นภายใต้แรงกดดัน ได้น่าเชื่อถือกว่าการฝันกลางวันแบบไม่มีขอบเขตมาก',
      ],
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
