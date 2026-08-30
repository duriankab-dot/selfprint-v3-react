/**
 * PricingSuccessPage — § 31 Monetization
 *
 * Success page after Stripe checkout completes
 * Route: /pricing/success?session_id=...
 */

import { useLanguage } from '@/context/LanguageContext';

export default function PricingSuccessPage() {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session_id');

  return (
    <div className="pricing-success">
      <div className="pricing-success-icon" aria-hidden="true">✦</div>
      <h1 className="pricing-success-title">{isTh ? 'ยินดีด้วย!' : 'Congratulations!'}</h1>
      <p className="pricing-success-subtitle">
        {isTh
          ? 'Twin ของคุณพร้อมให้รู้จักคุณในระดับที่ลึกขึ้นแล้ว'
          : 'Your Twin is ready to know you on a deeper level'}
      </p>
      {sessionId && (
        <p className="pricing-success-ref">
          {isTh ? 'หมายเลขอ้างอิง:' : 'Reference number:'} <code>{sessionId.slice(0, 20)}…</code>
        </p>
      )}
      <button
        className="pricing-cta-btn pricing-cta-btn--primary"
        onClick={() => {
          // ROUTELOOP-002 FIX: bare "/dashboard" hits the catch-all
          const langPrefix = window.location.pathname.startsWith('/th') ? '/th' : '/en';
          window.location.href = `${langPrefix}/dashboard`;
        }}
      >
        {isTh ? 'เปิด Dashboard' : 'Open Dashboard'}
      </button>
    </div>
  );
}
