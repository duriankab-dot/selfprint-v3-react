/**
 * Translations for SELFPRINT
 * Thai-first localization with English fallback
 */

export const TRANSLATIONS = {
  th: {
    // Pages & Navigation
    analysis: 'ผลการวิเคราะห์',
    settings: 'การตั้งค่า',
    explore: 'สำรวจ',
    dashboard: 'แดชบอร์ด',
    worlds: 'โลก',
    privacy: 'ความเป็นส่วนตัว',
    chat: 'แชท',
    twin: 'ทวิน',
    tarot: 'ทาโรต์',

    // Common Actions
    continue: 'ดำเนินการต่อ',
    back: 'กลับ',
    next: 'ถัดไป',
    submit: 'ส่ง',
    cancel: 'ยกเลิก',
    save: 'บันทึก',
    delete: 'ลบ',
    edit: 'แก้ไข',
    loading: 'กำลังโหลด...',
    error: 'เกิดข้อผิดพลาด',

    // Onboarding
    welcome: 'ยินดีต้อนรับ',
    clickHere: 'คลิกที่นี่',
    startJourney: 'เริ่มต้นการเดินทาง',
    createTwin: 'สร้างทวินของคุณ',
    nameTwin: 'ตั้งชื่อทวินของคุณ',

    // Analysis
    results: 'ผลลัพธ์',
    insights: 'ข้อมูลเชิงลึก',
    patterns: 'รูปแบบ',
    yourProfile: 'โปรไฟล์ของคุณ',

    // Dashboard & Features
    todayBrief: 'สรุปวันนี้',
    badges: 'รางวัล',
    memory: 'ความทรงจำ',
    decisions: 'การตัดสินใจ',
    growth: 'การเติบโต',

    // Messages & Feedback
    processing: 'กำลังประมวลผล...',
    success: 'สำเร็จ',
    tryAgain: 'ลองอีกครั้ง',
    noData: 'ไม่มีข้อมูล',
    selectOption: 'เลือกตัวเลือก',

    // Help Text
    learnMore: 'เรียนรู้เพิ่มเติม',
    readMore: 'อ่านเพิ่มเติม',
    viewAll: 'ดูทั้งหมด',
    showMore: 'แสดงเพิ่มเติม',
    showLess: 'แสดงน้อยลง',

    // Time-related
    today: 'วันนี้',
    yesterday: 'เมื่อวาน',
    week: 'สัปดาห์',
    month: 'เดือน',
    year: 'ปี',
    justNow: 'เพิ่งเลี่ยว',
    minutesAgo: 'นาทีที่แล้ว',
    hoursAgo: 'ชั่วโมงที่แล้ว',
    daysAgo: 'วันที่แล้ว',
  },
  en: {
    // Pages & Navigation
    analysis: 'Analysis Results',
    settings: 'Settings',
    explore: 'Explore',
    dashboard: 'Dashboard',
    worlds: 'Worlds',
    privacy: 'Privacy',
    chat: 'Chat',
    twin: 'Twin',
    tarot: 'Tarot',

    // Common Actions
    continue: 'Continue',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    loading: 'Loading...',
    error: 'Error',

    // Onboarding
    welcome: 'Welcome',
    clickHere: 'Click here',
    startJourney: 'Start your journey',
    createTwin: 'Create your Twin',
    nameTwin: 'Name your Twin',

    // Analysis
    results: 'Results',
    insights: 'Insights',
    patterns: 'Patterns',
    yourProfile: 'Your Profile',

    // Dashboard & Features
    todayBrief: "Today's Brief",
    badges: 'Badges',
    memory: 'Memory',
    decisions: 'Decisions',
    growth: 'Growth',

    // Messages & Feedback
    processing: 'Processing...',
    success: 'Success',
    tryAgain: 'Try Again',
    noData: 'No data available',
    selectOption: 'Select an option',

    // Help Text
    learnMore: 'Learn more',
    readMore: 'Read more',
    viewAll: 'View all',
    showMore: 'Show more',
    showLess: 'Show less',

    // Time-related
    today: 'Today',
    yesterday: 'Yesterday',
    week: 'Week',
    month: 'Month',
    year: 'Year',
    justNow: 'Just now',
    minutesAgo: 'Minutes ago',
    hoursAgo: 'Hours ago',
    daysAgo: 'Days ago',
  },
};

/**
 * Get translation for current language
 * @param key - Translation key
 * @param language - 'th' or 'en'
 * @returns Translated string
 */
export const t = (
  key: keyof typeof TRANSLATIONS['th'],
  language: 'th' | 'en' = 'th'
): string => {
  return TRANSLATIONS[language][key] || TRANSLATIONS['en'][key] || key;
};

/**
 * Batch get translations for array of keys
 */
export const tMany = (
  keys: Array<keyof typeof TRANSLATIONS['th']>,
  language: 'th' | 'en' = 'th'
): Record<string, string> => {
  return keys.reduce(
    (acc, key) => {
      acc[key] = t(key, language);
      return acc;
    },
    {} as Record<string, string>
  );
};
