/**
 * PricingSuccessPage — § 31 Monetization
 *
 * Success page after Stripe checkout completes
 * Route: /pricing/success?session_id=...
 */

export default function PricingSuccessPage() {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session_id');

  return (
    <div className="pricing-success">
      <div className="pricing-success-icon" aria-hidden="true">✦</div>
      <h1 className="pricing-success-title">ยินดีด้วย!</h1>
      <p className="pricing-success-subtitle">
        Twin ของคุณพร้อมให้รู้จักคุณในระดับที่ลึกขึ้นแล้ว
      </p>
      {sessionId && (
        <p className="pricing-success-ref">
          หมายเลขอ้างอิง: <code>{sessionId.slice(0, 20)}…</code>
        </p>
      )}
      <button
        className="pricing-cta-btn pricing-cta-btn--primary"
        onClick={() => (window.location.href = '/dashboard')}
      >
        เปิด Dashboard
      </button>
    </div>
  );
}
