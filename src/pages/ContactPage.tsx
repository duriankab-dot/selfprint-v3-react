/**
 * ContactPage — ติดต่อเรา / Support
 * SEO E-E-A-T: แสดงว่ามีคนจริงอยู่เบื้องหลัง → Google ไม่มองว่าเป็น ghost site
 */

import { useState } from 'react';
import { MetaTagManager } from '@/components/MetaTagManager';
import { useLanguage } from '@/context/LanguageContext';

export default function ContactPage() {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mailto fallback — no server required at launch
    const subject = encodeURIComponent(isTh ? `[SELFPRINT Support] จาก ${form.name}` : `[SELFPRINT Support] from ${form.name}`);
    const body = encodeURIComponent(
      isTh
        ? `ชื่อ: ${form.name}\nอีเมล: ${form.email}\n\n${form.message}`
        : `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    );
    window.open(`mailto:support@selfprint.one?subject=${subject}&body=${body}`, '_blank');
    setSent(true);
  };

  return (
    <>
      <MetaTagManager
        title={isTh ? 'ติดต่อ SELFPRINT — Support & Help' : 'Contact SELFPRINT — Support & Help'}
        description={isTh
          ? 'ติดต่อทีม SELFPRINT สำหรับคำถาม ข้อเสนอแนะ หรือปัญหาการใช้งาน'
          : 'Contact the SELFPRINT team with questions, feedback, or issues'}
        canonicalUrl={isTh ? '/th/contact' : '/en/contact'}
      />
      <main style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', padding: '0 0 80px' }}>
        <style>{`
          .contact-hero { background: var(--color-bg-secondary); padding: 72px 24px 48px; text-align: center; border-bottom: 1px solid var(--color-border); }
          .contact-hero h1 { font-size: clamp(24px,4vw,40px); font-weight: 900; margin: 0 0 12px; }
          .contact-hero p { font-size: 16px; color: var(--color-text-secondary); max-width: 480px; margin: 0 auto; line-height: 1.7; }
          .contact-body { max-width: 720px; margin: 0 auto; padding: 48px 24px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
          @media (max-width: 640px) { .contact-body { grid-template-columns: 1fr; } }
          .contact-info h2 { font-size: 18px; font-weight: 800; margin: 0 0 16px; color: var(--color-accent-primary); }
          .contact-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 20px; }
          .contact-item-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
          .contact-item-text h4 { font-size: 14px; font-weight: 700; margin: 0 0 2px; }
          .contact-item-text p { font-size: 13.5px; color: var(--color-text-secondary); margin: 0; line-height: 1.5; }
          .contact-item-text a { color: var(--color-accent-primary); text-decoration: none; }
          .contact-form h2 { font-size: 18px; font-weight: 800; margin: 0 0 16px; color: var(--color-accent-primary); }
          .contact-field { margin-bottom: 16px; }
          .contact-field label { display: block; font-size: 13px; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 6px; }
          .contact-field input, .contact-field textarea { width: 100%; box-sizing: border-box; background: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: 10px; padding: 10px 14px; font-size: 14px; color: var(--color-text-primary); outline: none; transition: border-color 0.2s; resize: vertical; }
          .contact-field input:focus, .contact-field textarea:focus { border-color: var(--color-accent-primary); }
          .contact-submit { width: 100%; padding: 12px; background: var(--color-accent-primary); color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
          .contact-submit:hover { opacity: 0.88; }
          .contact-success { text-align: center; padding: 32px; background: color-mix(in srgb,var(--color-accent-primary) 10%,transparent); border: 1px solid color-mix(in srgb,var(--color-accent-primary) 30%,transparent); border-radius: 14px; }
          .contact-success h3 { font-size: 18px; font-weight: 800; margin: 0 0 8px; }
          .contact-success p { color: var(--color-text-secondary); margin: 0; }
        `}</style>

        <div className="contact-hero">
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
          <h1>{isTh ? 'ติดต่อเรา' : 'Contact us'}</h1>
          <p>{isTh ? 'มีคำถาม ข้อเสนอแนะ หรือปัญหาการใช้งาน? ทีมงานพร้อมช่วยเสมอ' : "Have a question, feedback, or an issue? Our team is happy to help."}</p>
        </div>

        <div className="contact-body">
          <div className="contact-info">
            <h2>{isTh ? 'ช่องทางติดต่อ' : 'Get in touch'}</h2>
            {(isTh ? [
              { icon: '📧', title: 'อีเมล Support', text: <a href="mailto:support@selfprint.one">support@selfprint.one</a>, sub: 'ตอบกลับภายใน 24–48 ชั่วโมง' },
              { icon: '💬', title: 'Line Official', text: <a href="https://lin.ee/selfprint" target="_blank" rel="noreferrer">@selfprint</a>, sub: 'ตอบเร็วที่สุด ในเวลาทำการ' },
              { icon: '📱', title: 'Facebook Page', text: <a href="https://facebook.com/selfprintone" target="_blank" rel="noreferrer">SELFPRINT Thailand</a>, sub: 'ข่าวสาร อัปเดต และคอมมูนิตี้' },
            ] : [
              { icon: '📧', title: 'Support email', text: <a href="mailto:support@selfprint.one">support@selfprint.one</a>, sub: 'We reply within 24–48 hours' },
              { icon: '💬', title: 'Line Official', text: <a href="https://lin.ee/selfprint" target="_blank" rel="noreferrer">@selfprint</a>, sub: 'Fastest response during business hours' },
              { icon: '📱', title: 'Facebook Page', text: <a href="https://facebook.com/selfprintone" target="_blank" rel="noreferrer">SELFPRINT Thailand</a>, sub: 'News, updates, and community' },
            ]).map((item) => (
              <div key={item.title} className="contact-item">
                <div className="contact-item-icon">{item.icon}</div>
                <div className="contact-item-text">
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                  <p>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="contact-form">
            <h2>{isTh ? 'ส่งข้อความ' : 'Send a message'}</h2>
            {sent ? (
              <div className="contact-success">
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>✅</div>
                <h3>{isTh ? 'ขอบคุณ!' : 'Thank you!'}</h3>
                <p>
                  {isTh
                    ? 'ระบบเปิด email client ให้แล้ว กด Send เพื่อส่งข้อความ ทีมงานจะตอบกลับโดยเร็ว'
                    : "We've opened your email client — hit Send to submit your message. Our team will get back to you soon."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="contact-field">
                  <label htmlFor="contact-name">{isTh ? 'ชื่อ' : 'Name'}</label>
                  <input id="contact-name" type="text" required placeholder={isTh ? 'ชื่อของคุณ' : 'Your name'} value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="contact-field">
                  <label htmlFor="contact-email">{isTh ? 'อีเมล' : 'Email'}</label>
                  <input id="contact-email" type="email" required placeholder="email@example.com" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="contact-field">
                  <label htmlFor="contact-msg">{isTh ? 'ข้อความ' : 'Message'}</label>
                  <textarea id="contact-msg" rows={5} required placeholder={isTh ? 'อธิบายสิ่งที่คุณต้องการความช่วยเหลือ...' : 'Tell us what you need help with...'} value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })} />
                </div>
                <button type="submit" className="contact-submit">{isTh ? 'ส่งข้อความ →' : 'Send message →'}</button>
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
