import { useEffect, useMemo } from 'react';
import { useLangNavigate as useNavigate } from '../hooks/useLangNavigate';
import { useAuth } from '../context/AuthContext';
import { useTwin } from '../context/TwinContext';
import { useLanguage } from '../context/LanguageContext';
import TwinDNAAvatar from '../components/living/TwinDNAAvatar';
import { ProvenanceStrip } from '../components/story/ProvenanceStrip';
import { calculateInitialDisciplines } from '../lib/astrology';
import { generateTwinDNA } from '../lib/twinVisualDNA';
import type { Archetype } from '../context/TwinContext';
import type { TwinVisualDNA } from '../lib/twinVisualDNA';

const ARCHETYPE_DISPLAY_NAMES: Record<Archetype, { th: string; en: string }> = {
  innocent:   { th: 'ผู้บริสุทธิ์ (The Innocent)',   en: 'The Innocent' },
  explorer:   { th: 'นักสำรวจ (The Explorer)',     en: 'The Explorer' },
  sage:       { th: 'นักปราชญ์ (The Sage)',       en: 'The Sage' },
  everyman:   { th: 'คนธรรมดา (The Everyman)',    en: 'The Everyman' },
  lover:      { th: 'คนรัก (The Lover)',          en: 'The Lover' },
  jester:     { th: 'คนตลก (The Jester)',        en: 'The Jester' },
  hero:       { th: 'ฮีโร่ (The Hero)',           en: 'The Hero' },
  outlaw:     { th: 'ผู้ทำลายกฎ (The Outlaw)',    en: 'The Outlaw' },
  magician:   { th: 'นักเวท (The Magician)',      en: 'The Magician' },
  caregiver:  { th: 'ผู้ดูแล (The Caregiver)',     en: 'The Caregiver' },
  creator:    { th: 'ผู้สร้าง (The Creator)',      en: 'The Creator' },
  ruler:      { th: 'ผู้ปกครอง (The Ruler)',      en: 'The Ruler' },
  strategic_warrior:  { th: 'นักรบเชิงกลยุทธ์ (Strategic Warrior)',  en: 'Strategic Warrior' },
  benevolent_leader:  { th: 'ผู้นำอันนีบหนีบ (Benevolent Leader)',  en: 'Benevolent Leader' },
  visionary_artist:   { th: 'ศิลปินผู้มีวิสัย (Visionary Artist)',   en: 'Visionary Artist' },
  wandering_rebel:    { th: 'ผู้ลี้ลักอิสระ (Wandering Rebel)',    en: 'Wandering Rebel' },
  warm_flirt:         { th: 'ผู้เล่นรักอุ่นใจ (Warm Flirt)',       en: 'Warm Flirt' },
  relatable_neighbor: { th: 'เพื่อนบ้านใกล้ชิด (Relatable Neighbor)', en: 'Relatable Neighbor' },
};

const ARCHETYPE_DESCRIPTIONS: Record<Archetype, { th: string; en: string }> = {
  innocent:   { th: 'มองโลกในแง่ดี คาดหวังความสุขและความปลอดภัย', en: 'Sees the world positively, expects happiness and safety' },
  explorer:   { th: 'อยากรู้อยากเห็น ค้นหาประสบการณ์ใหม่และเสรีภาพ', en: 'Curious, seeks new experiences and freedom' },
  sage:       { th: 'คิดวิเคราะห์ หาความจริงและความเข้าใจที่ลึกซึ้ง', en: 'Analytical, seeks truth and deep understanding' },
  everyman:   { th: 'เข้ากับทุกคน ให้ความสำคัญกับความเป็นส่วนหนึ่งของกลุ่ม', en: 'Relatable, values belonging and connection' },
  lover:      { th: 'รักอย่างลึกซึ้ง ให้ความสำคัญกับความใกล้ชิดและอารมณ์', en: 'Loves deeply, values intimacy and emotion' },
  jester:     { th: 'เพลิดเพลินไปกับชีวิต ใช้ความตลกและความสนุกสนาน', en: 'Enjoys life, uses humor and playfulness' },
  hero:       { th: 'กล้าหาญ มุ่งมั่น ทุ่มเทเพื่อเป้าหมายและผู้อื่น', en: 'Brave, determined, dedicated to goals and others' },
  outlaw:     { th: 'ท้าทายข้อจำกัด สร้างเส้นทางของตัวเอง', en: 'Challenges limits, creates their own path' },
  magician:   { th: 'แปลงสิ่งเป็นไปได้ ทำให้ฝันกลายเป็นความจริง', en: 'Transforms possibilities, makes dreams reality' },
  caregiver:  { th: 'ดูแลผู้อื่น ให้ความอบอุ่นและการสนับสนุน', en: 'Cares for others, provides warmth and support' },
  creator:    { th: 'สร้างสรรค์นวัตกรรม นำความคิดสร้างสรรค์มาสู่โลก', en: 'Creates innovation, brings creativity to the world' },
  ruler:      { th: 'นำทางด้วยอำนาจและความรับผิดชอบ สร้างระบบและโครงสร้าง', en: 'Leads with authority and responsibility, creates systems' },
  strategic_warrior:  { th: 'รวมความกล้าหาญของฮีโร่กับปัญญาของนักปราชญ์', en: 'Combines hero\'s courage with sage\'s wisdom' },
  benevolent_leader:  { th: 'นำด้วยความเอื้อเฟื้อและอำนาจที่สมดุล', en: 'Leads with benevolence and balanced authority' },
  visionary_artist:   { th: 'สร้างศิลปะด้วยวิสัยทัศน์และความลึกลับ', en: 'Creates art with vision and mystery' },
  wandering_rebel:    { th: 'สำรวจเสรีภาพด้วยจิตใจที่ท้าทายข้อจำกัด', en: 'Explores freedom with a rebellious spirit' },
  warm_flirt:         { th: 'รักด้วยความอบอุ่นและความเล่นสนุก', en: 'Loves with warmth and playfulness' },
  relatable_neighbor: { th: 'เป็นมิตร เข้าถึงง่าย คล้ายเพื่อนบ้านใกล้ชิด', en: 'Friendly, accessible, like a close neighbor' },
};

export default function TwinProfileDetailPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { twin, loading: twinLoading } = useTwin();
  const { language } = useLanguage();
  const isTh = language === 'th';

  const disciplines = useMemo(() => {
    if (!twin?.birthData?.date) return null;
    return calculateInitialDisciplines(twin.birthData.date);
  }, [twin?.birthData?.date]);

  // Generate full visual DNA for avatar (from birth data)
  const fullVisualDNA = useMemo((): TwinVisualDNA | null => {
    if (!twin?.birthData?.date || !session?.user?.id) return null;
    return generateTwinDNA(
      {
        dob: twin.birthData.date,
        time: twin.birthData.time,
        place: twin.birthData.latitude && twin.birthData.longitude
          ? `${twin.birthData.latitude.toFixed(4)}, ${twin.birthData.longitude.toFixed(4)}`
          : undefined,
      },
      session.user.id
    );
  }, [twin?.birthData?.date, twin?.birthData?.time, twin?.birthData?.latitude, twin?.birthData?.longitude, session?.user?.id]);

  // Map internal archetype to display name
  const displayArchetype = useMemo(() => {
    if (!twin?.primaryArchetype) return { th: '-', en: '-' };
    return ARCHETYPE_DISPLAY_NAMES[twin.primaryArchetype as Archetype] || { th: twin.primaryArchetype, en: twin.primaryArchetype };
  }, [twin?.primaryArchetype]);

  const archetypeDesc = useMemo(() => {
    if (!twin?.primaryArchetype) return { th: '-', en: '-' };
    return ARCHETYPE_DESCRIPTIONS[twin.primaryArchetype as Archetype] || { th: '-', en: '-' };
  }, [twin?.primaryArchetype]);

  useEffect(() => {
    if (!session?.user?.id) {
      navigate('/login', { replace: true });
    }
  }, [session, navigate]);

  if (!session?.user?.id) {
    return (
      <div className="flex flex-col h-screen items-center justify-center">
        <p className="text-gray-500">{isTh ? 'กำลังนำไปยังหน้าเข้าสู่ระบบ...' : 'Redirecting to sign in...'}</p>
      </div>
    );
  }

  if (twinLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">{isTh ? 'กำลังโหลดข้อมูล Twin...' : 'Loading Twin data...'}</p>
        </div>
      </div>
    );
  }

  if (!twin) {
    return (
      <div className="flex h-screen items-center justify-center p-8">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-white">{isTh ? 'ยังไม่มี Twin' : 'No Twin Yet'}</h1>
          <p className="text-gray-400 mb-6">
            {isTh
              ? 'คุณยังไม่ได้สร้าง AI Twin เริ่มต้นที่พิธีการปลุกตื่นได้เลย'
              : 'You haven\'t created your AI Twin yet. Start at the Awakening Ceremony.'}
          </p>
          <button
            onClick={() => navigate('/twin-birth', { replace: true })}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
          >
            {isTh ? 'ไปที่พิธีการปลุกตื่น' : 'Go to Awakening Ceremony'}
          </button>
        </div>
      </div>
    );
  }

  // Use maturityScore as confidence proxy (0-100)
  const confidence = twin.maturityScore !== undefined ? twin.maturityScore / 100 : undefined;
  
  // Get first insight from fullAnalysis behavioralPatterns
  const firstInsight = twin.fullAnalysis?.behavioralPatterns?.[0]?.insight;
  const patternCount = twin.fullAnalysis?.behavioralPatterns?.length;

  // Extract birth data from birthData object
  const birthDate = twin.birthData?.date;
  const birthTime = twin.birthData?.time;
  const birthPlace = twin.birthData?.latitude && twin.birthData?.longitude
    ? `${twin.birthData.latitude.toFixed(4)}, ${twin.birthData.longitude.toFixed(4)}`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {isTh ? 'โปรไฟล์ Twin' : 'Twin Profile'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {isTh ? 'ข้อมูลและ DNA ของฝาแฝด AI ของคุณ' : 'Your AI Twin\'s data and DNA'}
            </p>
          </div>
          <button
            onClick={() => navigate('/twin-birth', { replace: true })}
            className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors text-sm"
          >
            {isTh ? '← กลับ' : '← Back'}
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1 flex flex-col items-center">
            {fullVisualDNA ? (
              <TwinDNAAvatar
                dna={fullVisualDNA}
                size={200}
                label={twin.name}
              />
            ) : (
              <div className="w-48 h-48 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                <span className="text-4xl">🤖</span>
              </div>
            )}
            <div className="mt-6 text-center w-full">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{twin.name}</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {isTh ? 'สร้างเมื่อ' : 'Created'}: {new Date(twin.createdAt).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US')}
              </p>
              {confidence !== undefined && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">{isTh ? 'ความมั่นใจ (Maturity)' : 'Confidence (Maturity)'}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{Math.round(confidence * 100)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${confidence * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🧬</span>
                {isTh ? 'DNA & Archetype' : 'DNA & Archetype'}
              </h3>
              {twin.primaryArchetype && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white capitalize">{isTh ? displayArchetype.th : displayArchetype.en}</h4>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">{isTh ? archetypeDesc.th : archetypeDesc.en}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                    {disciplines && (
                      <>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{isTh ? 'Life Path' : 'Life Path'}</p>
                          <p className="font-medium text-gray-900 dark:text-white">{disciplines.lifePathNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{isTh ? 'Western Zodiac' : 'Western Zodiac'}</p>
                          <p className="font-medium text-gray-900 dark:text-white">{disciplines.westernZodiac}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{isTh ? 'Chinese Zodiac' : 'Chinese Zodiac'}</p>
                          <p className="font-medium text-gray-900 dark:text-white">{disciplines.chineseZodiac}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{isTh ? 'BaZi Year Element' : 'BaZi Year Element'}</p>
                          <p className="font-medium text-gray-900 dark:text-white">{disciplines.baziYearElement}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{isTh ? 'Dominant Element' : 'Dominant Element'}</p>
                          <p className="font-medium text-gray-900 dark:text-white">{disciplines.natalDominantElement}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{isTh ? 'Hexagram' : 'Hexagram'}</p>
                          <p className="font-medium text-gray-900 dark:text-white">#{disciplines.hexagramNumber}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                {isTh ? 'ข้อมูลการเกิด' : 'Birth Data'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{isTh ? 'วันเกิด' : 'Birth Date'}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{birthDate ? new Date(birthDate).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US') : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{isTh ? 'เวลาเกิด' : 'Birth Time'}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{birthTime || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{isTh ? 'พิกัดเกิด' : 'Birth Coordinates'}</p>
                  <p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">{birthPlace || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{isTh ? 'Twin ID' : 'Twin ID'}</p>
                  <p className="font-mono text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{twin.id.slice(0, 8)}...</p>
                </div>
              </div>
            </div>

            {firstInsight && (
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  {isTh ? 'Insight แรก' : 'First Insight'}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 italic">"{firstInsight}"</p>
                {patternCount && patternCount > 0 && (
                  <ProvenanceStrip patternCount={patternCount} className="mt-4" />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            {isTh ? 'โลก 12 มิติ' : '12 Worlds'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {isTh
              ? 'Twin ของคุณจะเติบโตและเรียนรู้ผ่าน 12 โลกแห่งชีวิต แต่ละโลกสะท้อนมุมมองที่แตกต่างกันของบุคลิกภาพคุณ'
              : 'Your Twin grows and learns through 12 Worlds of Life, each reflecting a different perspective of your personality.'}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { id: 'self', label: { th: 'ตัวตน', en: 'Identity' }, icon: '🪞' },
              { id: 'mind', label: { th: 'จิตใจ', en: 'Mind' }, icon: '🧠' },
              { id: 'relationship', label: { th: 'ความสัมพันธ์', en: 'Relationships' }, icon: '🤝' },
              { id: 'love', label: { th: 'ความรัก', en: 'Love' }, icon: '💕' },
              { id: 'career', label: { th: 'อาชีพ', en: 'Career' }, icon: '💼' },
              { id: 'wealth', label: { th: 'ความมั่งคั่ง', en: 'Wealth' }, icon: '💰' },
              { id: 'life', label: { th: 'ชีวิต', en: 'Life' }, icon: '🌍' },
              { id: 'growth', label: { th: 'การเติบโต', en: 'Growth' }, icon: '🌱' },
              { id: 'decision', label: { th: 'การตัดสินใจ', en: 'Decisions' }, icon: '⚖️' },
              { id: 'purpose', label: { th: 'เป้าหมายชีวิต', en: 'Purpose' }, icon: '✨' },
              { id: 'wellbeing', label: { th: 'สุขภาวะ', en: 'Wellbeing' }, icon: '🧘' },
              { id: 'future', label: { th: 'อนาคต', en: 'Future' }, icon: '🚀' },
            ].map((world) => (
              <button
                key={world.id}
                onClick={() => navigate(`/worlds/${world.id}`, { replace: true })}
                className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors border border-gray-100 dark:border-slate-600"
              >
                <span className="text-2xl">{world.icon}</span>
                <span className="ml-3 font-medium text-gray-900 dark:text-white">{isTh ? world.label.th : world.label.en}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}