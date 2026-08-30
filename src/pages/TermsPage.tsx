/**
 * TermsPage — ข้อตกลงการใช้งาน
 */
import { MetaTagManager } from '@/components/MetaTagManager';
import { useLanguage } from '@/context/LanguageContext';

export default function TermsPage() {
  const { language } = useLanguage();
  const isTh = language === 'th';

  const SECTIONS = isTh ? [
    { h: '1. การยอมรับข้อตกลง', p: 'การใช้งาน SELFPRINT ถือว่าคุณยอมรับข้อตกลงฉบับนี้ทั้งหมด หากไม่เห็นด้วยกับข้อใดข้อหนึ่ง กรุณาหยุดใช้งาน' },
    { h: '2. วัตถุประสงค์การใช้งาน', p: 'SELFPRINT ให้บริการวิเคราะห์พฤติกรรมเพื่อการพัฒนาตัวเอง ไม่ใช่บริการทางการแพทย์หรือจิตวิทยาคลินิก ผลการวิเคราะห์เป็นข้อมูลเสริมการตัดสินใจเท่านั้น' },
    { h: '3. บัญชีผู้ใช้', p: 'คุณรับผิดชอบในการรักษาความปลอดภัยของบัญชี ห้ามใช้บัญชีของผู้อื่น และต้องให้ข้อมูลที่ถูกต้องในการลงทะเบียน' },
    { h: '4. ทรัพย์สินทางปัญญา', p: 'เนื้อหา โค้ด โลโก้ และระบบ SELFPRINT ทั้งหมดเป็นทรัพย์สินของ SELFPRINT ห้ามคัดลอกหรือนำไปใช้เชิงพาณิชย์โดยไม่ได้รับอนุญาต' },
    { h: '5. ข้อมูลส่วนบุคคล', p: 'การจัดการข้อมูลส่วนบุคคลเป็นไปตาม Privacy Policy ซึ่งถือเป็นส่วนหนึ่งของข้อตกลงนี้' },
    { h: '6. การชำระเงิน', p: 'แผน Pro และ Lifetime ชำระผ่านระบบ Stripe ที่ปลอดภัย ยกเลิกได้ทุกเวลา ไม่มีการคืนเงินสำหรับรอบที่ใช้ไปแล้ว ยกเว้นกรณีที่ระบบมีปัญหาจากฝั่งเรา' },
    { h: '7. การยกเว้นความรับผิด', p: 'SELFPRINT ให้บริการ "As Is" เราพยายามอย่างเต็มที่เพื่อความแม่นยำ แต่ไม่รับประกันผลลัพธ์ใดๆ จากการใช้งาน' },
    { h: '8. การแก้ไขข้อตกลง', p: 'เราอาจปรับปรุงข้อตกลงนี้เป็นครั้งคราว การใช้งานต่อเนื่องหลังจากมีการแจ้งถือว่าคุณยอมรับข้อตกลงใหม่' },
  ] : [
    { h: '1. Acceptance of terms', p: 'By using SELFPRINT, you agree to these terms in full. If you disagree with any part, please stop using the service.' },
    { h: '2. Purpose of use', p: 'SELFPRINT provides behavioral analysis for personal development. It is not a medical or clinical psychology service. Results are supplementary information for decision-making only.' },
    { h: '3. User accounts', p: 'You are responsible for keeping your account secure. Do not use another person\'s account, and provide accurate information when registering.' },
    { h: '4. Intellectual property', p: 'All content, code, logos, and systems of SELFPRINT are the property of SELFPRINT. Copying or commercial use without permission is prohibited.' },
    { h: '5. Personal data', p: 'Handling of personal data follows our Privacy Policy, which is part of these terms.' },
    { h: '6. Payment', p: 'Pro and Lifetime plans are billed securely through Stripe. You may cancel anytime. No refunds for periods already used, except where the issue is on our side.' },
    { h: '7. Disclaimer of liability', p: 'SELFPRINT is provided "as is." We do our best to ensure accuracy, but we do not guarantee any specific outcome from using the service.' },
    { h: '8. Changes to these terms', p: 'We may update these terms from time to time. Continued use after notice means you accept the updated terms.' },
  ];

  return (
    <>
      <MetaTagManager
        title={isTh ? 'ข้อตกลงการใช้งาน — SELFPRINT' : 'Terms of Service — SELFPRINT'}
        description={isTh ? 'ข้อตกลงการใช้งานแพลตฟอร์ม SELFPRINT' : 'Terms of service for the SELFPRINT platform'}
        canonicalUrl={isTh ? '/th/terms' : '/en/terms'}
      />
      <main style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', padding: '0 0 80px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '64px 24px 0' }}>
          <h1 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 900, marginBottom: '8px' }}>{isTh ? 'ข้อตกลงการใช้งาน' : 'Terms of Service'}</h1>
          <p style={{ color: 'var(--color-text-tertiary)', fontSize: '13px', marginBottom: '40px' }}>{isTh ? 'อัปเดตล่าสุด: มกราคม 2568' : 'Last updated: January 2026'}</p>

          {SECTIONS.map((s) => (
            <div key={s.h} style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{s.h}</h2>
              <p style={{ fontSize: '14.5px', lineHeight: 1.8, color: 'var(--color-text-secondary)', margin: 0 }}>{s.p}</p>
            </div>
          ))}

          <div style={{ marginTop: '40px', padding: '20px', background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
              {isTh ? 'มีคำถามเกี่ยวกับข้อตกลง? ติดต่อ' : 'Questions about these terms? Contact'} <a href="mailto:support@selfprint.one" style={{ color: 'var(--color-accent-primary)' }}>support@selfprint.one</a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
