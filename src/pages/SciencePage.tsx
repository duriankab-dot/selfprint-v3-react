/**
 * SciencePage — Science & Methodology
 * เบื้องหลังอัลกอริทึม: วิทยาศาสตร์พฤติกรรม + AI
 * SEO: ตัดภาพหมอดูออก แสดงหลักการทางวิทยาศาสตร์
 */

import { MetaTagManager } from '@/components/MetaTagManager';
import { useLangNavigate as useNavigate } from '@/hooks/useLangNavigate';

const SICE_DIMENSIONS = [
  { id: '01', name: 'ตัวตน', en: 'Identity Core', desc: 'รูปแบบการรับรู้และนิยามตัวเองของคุณ — เสาหลักที่ทุกมิติอื่นอ้างอิง' },
  { id: '02', name: 'จิตใจ', en: 'Emotional Architecture', desc: 'วิธีที่คุณประมวลผลและตอบสนองต่ออารมณ์ — ทั้งของตัวเองและผู้อื่น' },
  { id: '03', name: 'ความสัมพันธ์', en: 'Relational Patterns', desc: 'รูปแบบการเชื่อมต่อกับคนรอบข้าง ขอบเขตส่วนตัว และการไว้วางใจ' },
  { id: '04', name: 'ความรัก', en: 'Attachment Style', desc: 'สไตล์การผูกพันและภาษาความรักที่ฝังอยู่ในระบบความคิดของคุณ' },
  { id: '05', name: 'อาชีพ', en: 'Career Drive', desc: 'แรงจูงใจเชิงลึก ค่านิยมในการทำงาน และแนวทางการสร้างอาชีพ' },
  { id: '06', name: 'ความมั่งคั่ง', en: 'Financial Behavior', desc: 'ความสัมพันธ์ของคุณกับเงิน การตัดสินใจทางการเงิน และรูปแบบการใช้จ่าย' },
  { id: '07', name: 'ชีวิต', en: 'Lifestyle Blueprint', desc: 'จังหวะชีวิต นิสัยประจำวัน และสภาพแวดล้อมที่คุณเจริญเติบโตได้ดีที่สุด' },
  { id: '08', name: 'การเติบโต', en: 'Growth Mindset', desc: 'วิธีที่คุณเรียนรู้ รับมือกับความล้มเหลว และขยายขอบเขตความสามารถ' },
  { id: '09', name: 'การตัดสินใจ', en: 'Decision Logic', desc: 'กระบวนการตัดสินใจ — ใช้เหตุผลหรืออารมณ์ ช้าหรือเร็ว และปัจจัยไหนที่มักบิดเบือน' },
  { id: '10', name: 'จุดประสงค์', en: 'Purpose Map', desc: 'สิ่งที่ขับเคลื่อนคุณในระดับลึก ทั้งคุณค่าส่วนตัวและสิ่งที่ทำให้ชีวิตมีความหมาย' },
  { id: '11', name: 'สุขภาพ', en: 'Wellbeing Patterns', desc: 'พฤติกรรมด้านสุขภาพกาย สุขภาพจิต และวิธีที่คุณจัดการกับความเครียด' },
  { id: '12', name: 'อนาคต', en: 'Future Orientation', desc: 'มุมมองต่ออนาคต การวางแผนระยะยาว และความสามารถในการรับมือความไม่แน่นอน' },
];

export default function SciencePage() {
  const navigate = useNavigate();

  return (
    <>
      <MetaTagManager
        title="วิทยาศาสตร์เบื้องหลัง SELFPRINT — 12 SICE Engines & Behavioral AI"
        description="ค้นพบว่า SELFPRINT ใช้วิทยาศาสตร์พฤติกรรม Behavioral Economics และ 12 SICE Engines อย่างไรเพื่อวิเคราะห์ตัวตนได้แม่นยำกว่าการดูดวง"
        canonicalUrl="/th/science"
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
          <h1>เบื้องหลังอัลกอริทึม</h1>
          <p>เมื่อวิทยาศาสตร์พฤติกรรมผสานพลังกับ AI — ทำไม SELFPRINT จึงอ่านคุณออกได้แม่นกว่าดวงชะตา</p>
        </div>

        {/* Origin */}
        <div className="sci-section">
          <span className="sci-badge">The Origin</span>
          <h2>รากฐานทางวิทยาศาสตร์</h2>
          <p>SELFPRINT พัฒนาบนรากฐานของ Behavioral Economics (เศรษฐศาสตร์พฤติกรรม) ตามแนวทางของ Kahneman & Tversky, Big Five Personality Traits (OCEAN Model) จากงานวิจัยมหาวิทยาลัย Cambridge และ Cognitive Behavioral Patterns จากจิตวิทยาคลินิก</p>
          <p>แทนที่จะใช้วันเดือนปีเกิดหรือตำแหน่งดาว ระบบของเราวัดสิ่งที่วัดได้จริง — รูปแบบการตัดสินใจ การตอบสนองต่อสถานการณ์ และพฤติกรรมที่แสดงออกในชีวิตประจำวัน</p>

          <h3>Initial State Matrix คืออะไร?</h3>
          <p>ทันทีที่คุณเริ่มโต้ตอบกับ SELFPRINT ระบบ Initial State Matrix จะคำนวณ Behavioral Baseline ของคุณจาก Digital Interaction Patterns เบื้องต้น ก่อนที่คุณจะเริ่มตอบคำถามแม้แต่ข้อเดียว ทำให้ NOVA สามารถวิเคราะห์ได้ตรงจุดตั้งแต่แรก</p>
        </div>

        {/* 12 SICE */}
        <div className="sci-section">
          <span className="sci-badge">12 SICE Engines</span>
          <h2>12 มิติที่เปลี่ยนข้อมูลให้เป็นความเข้าใจ</h2>
          <p>SICE ย่อจาก Specialized Intelligence Capability Engines — ระบบ AI 12 โมดูลที่แต่ละโมดูลเชี่ยวชาญด้านหนึ่งของชีวิตมนุษย์ ทำงานร่วมกันเพื่อสร้างภาพรวมพฤติกรรมที่สมบูรณ์</p>
          <div className="sci-grid">
            {SICE_DIMENSIONS.map((dim) => (
              <div key={dim.id} className="sci-dim-card">
                <div className="sci-dim-num">SICE-{dim.id}</div>
                <div className="sci-dim-name">{dim.name}</div>
                <div className="sci-dim-en">{dim.en}</div>
                <p className="sci-dim-desc">{dim.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Twin Evolution */}
        <div className="sci-section">
          <span className="sci-badge">The AI Twin Evolution</span>
          <h2>จากข้อมูลสู่ที่ปรึกษาที่พูดได้จริง</h2>
          <p>ข้อมูล SICE ทั้ง 12 มิติไม่ได้จบที่รายงานบนกระดาษ แต่ถูกแปรสภาพให้เป็น AI Twin ที่โต้ตอบได้จริง เรียนรู้ต่อเนื่อง และเติบโตไปพร้อมคุณ</p>
          <div className="sci-timeline">
            {[
              { step: 'Behavioral Capture', desc: 'ระบบ NOVA รวบรวมข้อมูลพฤติกรรมผ่าน Onboarding แบบ Adaptive — ไม่ใช่แบบทดสอบสคริปต์ตายตัว' },
              { step: 'SICE Processing', desc: '12 Engine วิเคราะห์ข้อมูลพร้อมกัน สร้างเมทริกซ์พฤติกรรมเฉพาะบุคคล' },
              { step: 'Twin Synthesis', desc: 'ผลลัพธ์ถูก Synthesize เป็น System Prompt เฉพาะของ AI Twin คุณ — ทำให้ Twin ตอบสนองในแบบที่คุณรู้สึกว่า "มันรู้จักฉัน"' },
              { step: 'Continuous Learning', desc: 'ทุกครั้งที่คุณสนทนา Twin เรียนรู้และอัปเดต Model ของตัวเอง ยิ่งใช้ ยิ่งแม่น' },
            ].map((item) => (
              <div key={item.step} className="sci-timeline-item">
                <h4>{item.step}</h4>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="sci-cta">
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '20px' }}>สัมผัสประสบการณ์วิทยาศาสตร์พฤติกรรมด้วยตัวเอง</p>
          <button className="sci-cta-btn" onClick={() => navigate('/onboarding')}>
            เริ่มวิเคราะห์ฟรี ใน 2 นาที →
          </button>
        </div>
      </main>
    </>
  );
}
