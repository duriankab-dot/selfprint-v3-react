/**
 * SciencePage — Science & Methodology
 * เบื้องหลังอัลกอริทึม: วิทยาศาสตร์พฤติกรรม + AI
 * SEO: ตัดภาพหมอดูออก แสดงหลักการทางวิทยาศาสตร์
 */

import { MetaTagManager } from '@/components/MetaTagManager';
import { useLangNavigate as useNavigate } from '@/hooks/useLangNavigate';
import { useLanguage } from '@/context/LanguageContext';

const SICE_DIMENSIONS = [
  { id: '01', nameTh: 'ตัวตน', en: 'Identity Core', descTh: 'รูปแบบการรับรู้และนิยามตัวเองของคุณ — เสาหลักที่ทุกมิติอื่นอ้างอิง', descEn: 'How you perceive and define yourself — the anchor every other dimension refers back to' },
  { id: '02', nameTh: 'จิตใจ', en: 'Emotional Architecture', descTh: 'วิธีที่คุณประมวลผลและตอบสนองต่ออารมณ์ — ทั้งของตัวเองและผู้อื่น', descEn: 'How you process and respond to emotion — both your own and others\'' },
  { id: '03', nameTh: 'ความสัมพันธ์', en: 'Relational Patterns', descTh: 'รูปแบบการเชื่อมต่อกับคนรอบข้าง ขอบเขตส่วนตัว และการไว้วางใจ', descEn: 'How you connect with people, set boundaries, and build trust' },
  { id: '04', nameTh: 'ความรัก', en: 'Attachment Style', descTh: 'สไตล์การผูกพันและภาษาความรักที่ฝังอยู่ในระบบความคิดของคุณ', descEn: 'Your attachment style and love language, wired into how you think' },
  { id: '05', nameTh: 'อาชีพ', en: 'Career Drive', descTh: 'แรงจูงใจเชิงลึก ค่านิยมในการทำงาน และแนวทางการสร้างอาชีพ', descEn: 'Your deeper motivations, work values, and approach to building a career' },
  { id: '06', nameTh: 'ความมั่งคั่ง', en: 'Financial Behavior', descTh: 'ความสัมพันธ์ของคุณกับเงิน การตัดสินใจทางการเงิน และรูปแบบการใช้จ่าย', descEn: 'Your relationship with money, financial decisions, and spending patterns' },
  { id: '07', nameTh: 'ชีวิต', en: 'Lifestyle Blueprint', descTh: 'จังหวะชีวิต นิสัยประจำวัน และสภาพแวดล้อมที่คุณเจริญเติบโตได้ดีที่สุด', descEn: 'Your life rhythm, daily habits, and the environments where you thrive' },
  { id: '08', nameTh: 'การเติบโต', en: 'Growth Mindset', descTh: 'วิธีที่คุณเรียนรู้ รับมือกับความล้มเหลว และขยายขอบเขตความสามารถ', descEn: 'How you learn, handle failure, and expand what you\'re capable of' },
  { id: '09', nameTh: 'การตัดสินใจ', en: 'Decision Logic', descTh: 'กระบวนการตัดสินใจ — ใช้เหตุผลหรืออารมณ์ ช้าหรือเร็ว และปัจจัยไหนที่มักบิดเบือน', descEn: 'Your decision process — reason or emotion, slow or fast, and what tends to distort it' },
  { id: '10', nameTh: 'จุดประสงค์', en: 'Purpose Map', descTh: 'สิ่งที่ขับเคลื่อนคุณในระดับลึก ทั้งคุณค่าส่วนตัวและสิ่งที่ทำให้ชีวิตมีความหมาย', descEn: 'What drives you at a deep level — your personal values and what makes life meaningful' },
  { id: '11', nameTh: 'สุขภาพ', en: 'Wellbeing Patterns', descTh: 'พฤติกรรมด้านสุขภาพกาย สุขภาพจิต และวิธีที่คุณจัดการกับความเครียด', descEn: 'Your physical and mental health behaviors, and how you manage stress' },
  { id: '12', nameTh: 'อนาคต', en: 'Future Orientation', descTh: 'มุมมองต่ออนาคต การวางแผนระยะยาว และความสามารถในการรับมือความไม่แน่นอน', descEn: 'Your outlook on the future, long-term planning, and how you handle uncertainty' },
];

export default function SciencePage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isTh = language === 'th';

  return (
    <>
      <MetaTagManager
        title={isTh
          ? 'วิทยาศาสตร์เบื้องหลัง SELFPRINT — 12 SICE Engines & Behavioral AI'
          : 'The Science Behind SELFPRINT — 12 SICE Engines & Behavioral AI'}
        description={isTh
          ? 'ค้นพบว่า SELFPRINT ใช้วิทยาศาสตร์พฤติกรรม Behavioral Economics และ 12 SICE Engines อย่างไรเพื่อวิเคราะห์ตัวตนได้แม่นยำกว่าการดูดวง'
          : 'Discover how SELFPRINT uses behavioral science, behavioral economics, and 12 SICE Engines to analyze who you are more accurately than a horoscope'}
        canonicalUrl={isTh ? '/th/science' : '/en/science'}
      />
      <main style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', padding: '0 0 80px' }}>
        <style>{`
          .sci-hero { background: linear-gradient(135deg, #0f172a 0%, var(--color-bg-secondary) 100%); padding: 80px 24px 60px; text-align: center; border-bottom: 1px solid var(--color-border); }
          .sci-hero h1 { font-size: clamp(26px,4.5vw,44px); font-weight: 900; letter-spacing: -0.02em; margin: 0 0 16px; }
          .sci-hero p { font-size: 17px; color: var(--color-text-secondary); max-width: 600px; margin: 0 auto; line-height: 1.7; }
          .sci-section { max-width: 860px; margin: 0 auto; padding: 56px 24px 0; }
          .sci-section h2 { font-size: 22px; font-weight: 800; margin: 0 0 8px; color: var(--color-accent-primary); }
          .sci-section h3 { font-size: 18px; font-weight: 700; margin: 24px 0 8px; }
          .sci-section p { font-size: 15.5px; line-height: 1.8; color: var(--color-text-secondary); margin: 0 0 14px; }
          .sci-badge { display: inline-block; background: color-mix(in srgb,var(--color-accent-primary) 12%,transparent); border: 1px solid color-mix(in srgb,var(--color-accent-primary) 30%,transparent); color: var(--color-accent-primary); border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 700; margin-bottom: 20px; }
          .sci-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(240px,1fr)); gap: 16px; margin-top: 24px; }
          .sci-dim-card { background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: 14px; padding: 20px; transition: border-color 0.2s; }
          .sci-dim-card:hover { border-color: var(--color-accent-primary); }
          .sci-dim-num { font-size: 11px; font-weight: 700; color: var(--color-accent-primary); opacity: 0.7; letter-spacing: 0.06em; margin-bottom: 4px; }
          .sci-dim-name { font-size: 16px; font-weight: 800; margin: 0 0 2px; }
          .sci-dim-en { font-size: 12px; color: var(--color-text-tertiary); margin-bottom: 8px; }
          .sci-dim-desc { font-size: 13px; line-height: 1.6; color: var(--color-text-secondary); margin: 0; }
          .sci-timeline { border-left: 2px solid var(--color-accent-primary); padding-left: 24px; margin-top: 24px; }
          .sci-timeline-item { margin-bottom: 28px; position: relative; }
          .sci-timeline-item::before { content:''; position:absolute; left:-30px; top:4px; width:10px; height:10px; border-radius:50%; background:var(--color-accent-primary); }
          .sci-timeline-item h4 { font-size: 15px; font-weight: 700; margin: 0 0 6px; }
          .sci-timeline-item p { font-size: 14px; color: var(--color-text-secondary); margin: 0; line-height: 1.6; }
          .sci-cta { text-align: center; margin-top: 60px; }
          .sci-cta-btn { display: inline-block; padding: 14px 32px; background: var(--color-accent-primary); color: #fff; border: none; border-radius: 12px; font-size: 16px; font-weight: 800; cursor: pointer; transition: opacity 0.2s; }
          .sci-cta-btn:hover { opacity: 0.88; }
        `}</style>

        <div className="sci-hero">
          <div style={{ fontSize: '44px', marginBottom: '16px' }}>⚗️</div>
          <h1>{isTh ? 'เบื้องหลังอัลกอริทึม' : 'Behind the algorithm'}</h1>
          <p>
            {isTh
              ? 'เมื่อวิทยาศาสตร์พฤติกรรมผสานพลังกับ AI — ทำไม SELFPRINT จึงอ่านคุณออกได้แม่นกว่าดวงชะตา'
              : 'When behavioral science joins forces with AI — why SELFPRINT reads you more accurately than a horoscope'}
          </p>
        </div>

        {/* Origin */}
        <div className="sci-section">
          <span className="sci-badge">The Origin</span>
          <h2>{isTh ? 'รากฐานทางวิทยาศาสตร์' : 'Scientific foundations'}</h2>
          <p>
            {isTh
              ? 'SELFPRINT พัฒนาบนรากฐานของ Behavioral Economics (เศรษฐศาสตร์พฤติกรรม) ตามแนวทางของ Kahneman & Tversky, Big Five Personality Traits (OCEAN Model) จากงานวิจัยมหาวิทยาลัย Cambridge และ Cognitive Behavioral Patterns จากจิตวิทยาคลินิก'
              : "SELFPRINT is built on the foundations of Behavioral Economics in the tradition of Kahneman & Tversky, the Big Five Personality Traits (OCEAN Model) from Cambridge University research, and Cognitive Behavioral Patterns from clinical psychology."}
          </p>
          <p>
            {isTh
              ? 'แทนที่จะใช้วันเดือนปีเกิดหรือตำแหน่งดาว ระบบของเราวัดสิ่งที่วัดได้จริง — รูปแบบการตัดสินใจ การตอบสนองต่อสถานการณ์ และพฤติกรรมที่แสดงออกในชีวิตประจำวัน'
              : 'Instead of birth date or star position, our system measures things that are actually measurable — decision patterns, how you respond to situations, and the behavior you show in daily life.'}
          </p>

          <h3>{isTh ? 'Initial State Matrix คืออะไร?' : 'What is the Initial State Matrix?'}</h3>
          <p>
            {isTh
              ? 'ทันทีที่คุณเริ่มโต้ตอบกับ SELFPRINT ระบบ Initial State Matrix จะคำนวณ Behavioral Baseline ของคุณจาก Digital Interaction Patterns เบื้องต้น ก่อนที่คุณจะเริ่มตอบคำถามแม้แต่ข้อเดียว ทำให้ NOVA สามารถวิเคราะห์ได้ตรงจุดตั้งแต่แรก'
              : 'The moment you start interacting with SELFPRINT, the Initial State Matrix calculates your Behavioral Baseline from early digital interaction patterns — before you\'ve even answered a single question. That lets NOVA analyze accurately from the very start.'}
          </p>
        </div>

        {/* 12 SICE */}
        <div className="sci-section">
          <span className="sci-badge">12 SICE Engines</span>
          <h2>{isTh ? '12 มิติที่เปลี่ยนข้อมูลให้เป็นความเข้าใจ' : '12 dimensions that turn data into understanding'}</h2>
          <p>
            {isTh
              ? 'SICE ย่อจาก Specialized Intelligence Capability Engines — ระบบ AI 12 โมดูลที่แต่ละโมดูลเชี่ยวชาญด้านหนึ่งของชีวิตมนุษย์ ทำงานร่วมกันเพื่อสร้างภาพรวมพฤติกรรมที่สมบูรณ์'
              : 'SICE stands for Specialized Intelligence Capability Engines — 12 AI modules, each an expert in one area of human life, working together to build a complete behavioral picture.'}
          </p>
          <div className="sci-grid">
            {SICE_DIMENSIONS.map((dim) => (
              <div key={dim.id} className="sci-dim-card">
                <div className="sci-dim-num">SICE-{dim.id}</div>
                <div className="sci-dim-name">{isTh ? dim.nameTh : dim.en}</div>
                {isTh && <div className="sci-dim-en">{dim.en}</div>}
                <p className="sci-dim-desc">{isTh ? dim.descTh : dim.descEn}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Twin Evolution */}
        <div className="sci-section">
          <span className="sci-badge">The AI Twin Evolution</span>
          <h2>{isTh ? 'จากข้อมูลสู่ที่ปรึกษาที่พูดได้จริง' : 'From data to a real, talking advisor'}</h2>
          <p>
            {isTh
              ? 'ข้อมูล SICE ทั้ง 12 มิติไม่ได้จบที่รายงานบนกระดาษ แต่ถูกแปรสภาพให้เป็น AI Twin ที่โต้ตอบได้จริง เรียนรู้ต่อเนื่อง และเติบโตไปพร้อมคุณ'
              : "The 12 dimensions of SICE data don't end up as a report on paper — they become an AI Twin that actually converses, keeps learning, and grows alongside you."}
          </p>
          <div className="sci-timeline">
            {(isTh
              ? [
                  { step: 'Behavioral Capture', desc: 'ระบบ NOVA รวบรวมข้อมูลพฤติกรรมผ่าน Onboarding แบบ Adaptive — ไม่ใช่แบบทดสอบสคริปต์ตายตัว' },
                  { step: 'SICE Processing', desc: '12 Engine วิเคราะห์ข้อมูลพร้อมกัน สร้างเมทริกซ์พฤติกรรมเฉพาะบุคคล' },
                  { step: 'Twin Synthesis', desc: 'ผลลัพธ์ถูก Synthesize เป็น System Prompt เฉพาะของ AI Twin คุณ — ทำให้ Twin ตอบสนองในแบบที่คุณรู้สึกว่า "มันรู้จักฉัน"' },
                  { step: 'Continuous Learning', desc: 'ทุกครั้งที่คุณสนทนา Twin เรียนรู้และอัปเดต Model ของตัวเอง ยิ่งใช้ ยิ่งแม่น' },
                ]
              : [
                  { step: 'Behavioral Capture', desc: 'NOVA gathers behavioral data through an adaptive onboarding — not a fixed, scripted test' },
                  { step: 'SICE Processing', desc: '12 engines analyze the data simultaneously, building a matrix unique to you' },
                  { step: 'Twin Synthesis', desc: 'The results are synthesized into a system prompt unique to your AI Twin — so it responds in a way that feels like "it knows me"' },
                  { step: 'Continuous Learning', desc: 'Every time you talk, your Twin learns and updates its own model — the more you use it, the more accurate it gets' },
                ]
            ).map((item) => (
              <div key={item.step} className="sci-timeline-item">
                <h4>{item.step}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="sci-cta">
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
            {isTh ? 'สัมผัสประสบการณ์วิทยาศาสตร์พฤติกรรมด้วยตัวเอง' : 'Experience behavioral science for yourself'}
          </p>
          <button className="sci-cta-btn" onClick={() => navigate('/onboarding')}>
            {isTh ? 'เริ่มวิเคราะห์ฟรี ใน 2 นาที →' : 'Start your free analysis in 2 minutes →'}
          </button>
        </div>
      </main>
    </>
  );
}
