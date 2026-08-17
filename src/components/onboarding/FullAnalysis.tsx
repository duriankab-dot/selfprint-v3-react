/**
 * FullAnalysis.tsx
 *
 * Full AI Twin Analysis (85%+ accuracy)
 * MEMO V4: Complete blueprint with all insights
 *
 * Displays:
 * - Full Decision Style
 * - 3-4 Strengths
 * - 2-3 Key Insights & Opportunities
 * - Growth Suggestions
 * - Accuracy meter (85%+, green)
 * - Home navigation
 */

interface AnalysisData {
  decisionStyle: string;
  strengths: string[];
  insights: string[];
  opportunities: string[];
  blindSpots?: string[];
}

interface FullAnalysisProps {
  profile: AnalysisData;
  prototypeCore?: string;
  accuracy?: number;
  onHome: () => void;
}

export const FullAnalysis: React.FC<FullAnalysisProps> = ({
  profile,
  prototypeCore,
  accuracy = 85,
  onHome,
}) => {
  const getMeterColor = (value: number): string => {
    if (value < 75) return '#FFA726'; // Amber
    if (value < 90) return '#FFD54F'; // Yellow
    return '#66BB6A'; // Green
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, var(--accent-light, var(--color-bg-secondary)) 0%, var(--color-bg-primary) 100%)`,
        padding: '48px 24px 80px',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h1
            style={{
              fontSize: '36px',
              fontWeight: 700,
              marginBottom: '16px',
              color: 'var(--color-text-primary)',
            }}
          >
            ✨ AI Twin ฉบับสมบูรณ์ของคุณ
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: 'var(--color-text-secondary)',
              marginBottom: '12px',
            }}
          >
            ระดับความชัดเจน {Math.round(accuracy)}%
          </p>
          {prototypeCore && (
            <span
              style={{
                display: 'inline-block',
                marginTop: '4px',
                padding: '6px 16px',
                borderRadius: '999px',
                background: 'var(--accent-light)',
                color: 'var(--accent-primary)',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              Prototype Core: {prototypeCore}
            </span>
          )}

          {/* Accuracy Meter */}
          <div style={{ marginTop: '32px', maxWidth: '400px', margin: '0 auto' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                }}
              >
                ระดับความชัดเจน
              </span>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: getMeterColor(accuracy),
                }}
              >
                {Math.round(accuracy)}%
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '12px',
                background: 'var(--color-bg-tertiary)',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, accuracy)}%`,
                  height: '100%',
                  background: getMeterColor(accuracy),
                  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderRadius: '6px',
                }}
              />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '48px',
          }}
        >
          {/* Left Column: Decision Style & Strengths */}
          <div>
            {/* Decision Style Card */}
            <div
              style={{
                background: 'var(--color-bg-secondary)',
                borderRadius: '12px',
                padding: '28px',
                border: '2px solid var(--accent-light)',
                marginBottom: '24px',
              }}
            >
              <h3
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-text-secondary)',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                🎯 รูปแบบการตัดสินใจหลัก
              </h3>
              <p
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: 'var(--accent-primary)',
                  margin: '0',
                  lineHeight: 1.3,
                }}
              >
                {profile.decisionStyle}
              </p>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  margin: '12px 0 0 0',
                  lineHeight: 1.5,
                }}
              >
                นี่คือแนวทางหลักของคุณในการเลือกและแก้ปัญหา
              </p>
            </div>

            {/* Strengths Card */}
            <div
              style={{
                background: 'var(--color-bg-secondary)',
                borderRadius: '12px',
                padding: '28px',
                border: '2px solid var(--accent-light)',
              }}
            >
              <h3
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-text-secondary)',
                  marginBottom: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                💪 จุดแข็งของคุณ
              </h3>
              <ul
                style={{
                  margin: '0',
                  paddingLeft: '20px',
                  listStyleType: 'none',
                }}
              >
                {profile.strengths.map((strength, idx) => (
                  <li
                    key={idx}
                    style={{
                      fontSize: '14px',
                      color: 'var(--color-text-primary)',
                      marginBottom: idx < profile.strengths.length - 1 ? '12px' : 0,
                      paddingLeft: '20px',
                      position: 'relative',
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        color: 'var(--accent-primary)',
                        fontWeight: 700,
                      }}
                    >
                      ✓
                    </span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Insights & Opportunities */}
          <div>
            {/* Insights Card */}
            <div
              style={{
                background: 'var(--color-bg-secondary)',
                borderRadius: '12px',
                padding: '28px',
                border: '2px solid var(--accent-light)',
                marginBottom: '24px',
              }}
            >
              <h3
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-text-secondary)',
                  marginBottom: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                🔍 ข้อมูลเชิงลึกสำคัญ
              </h3>
              <ul
                style={{
                  margin: '0',
                  paddingLeft: '20px',
                  listStyleType: 'none',
                }}
              >
                {profile.insights.map((insight, idx) => (
                  <li
                    key={idx}
                    style={{
                      fontSize: '14px',
                      color: 'var(--color-text-primary)',
                      marginBottom: idx < profile.insights.length - 1 ? '12px' : 0,
                      paddingLeft: '20px',
                      position: 'relative',
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        color: 'var(--accent-secondary)',
                      }}
                    >
                      •
                    </span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities Card */}
            <div
              style={{
                background: 'var(--color-bg-secondary)',
                borderRadius: '12px',
                padding: '28px',
                border: '2px solid var(--accent-light)',
              }}
            >
              <h3
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-text-secondary)',
                  marginBottom: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                🚀 โอกาสในการเติบโต
              </h3>
              <ul
                style={{
                  margin: '0',
                  paddingLeft: '20px',
                  listStyleType: 'none',
                }}
              >
                {profile.opportunities.map((opportunity, idx) => (
                  <li
                    key={idx}
                    style={{
                      fontSize: '14px',
                      color: 'var(--color-text-primary)',
                      marginBottom: idx < profile.opportunities.length - 1 ? '12px' : 0,
                      paddingLeft: '20px',
                      position: 'relative',
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        color: '#FFD54F',
                        fontWeight: 700,
                      }}
                    >
                      ⭐
                    </span>
                    {opportunity}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Blind Spots Card — full width, only when the API/analysis actually returned some */}
        {profile.blindSpots && profile.blindSpots.length > 0 && (
          <div
            style={{
              background: 'var(--color-bg-secondary)',
              borderRadius: '12px',
              padding: '28px',
              border: '2px solid var(--accent-light)',
              marginBottom: '48px',
            }}
          >
            <h3
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--color-text-secondary)',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              ⚠️ จุดที่ควรระวัง
            </h3>
            <ul
              style={{
                margin: '0',
                paddingLeft: '20px',
                listStyleType: 'none',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4px 24px',
              }}
            >
              {profile.blindSpots.map((blindSpot, idx) => (
                <li
                  key={idx}
                  style={{
                    fontSize: '14px',
                    color: 'var(--color-text-primary)',
                    marginBottom: '12px',
                    paddingLeft: '20px',
                    position: 'relative',
                    lineHeight: 1.5,
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      color: '#FFA726',
                      fontWeight: 700,
                    }}
                  >
                    !
                  </span>
                  {blindSpot}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Nova Closing Message */}
        <div
          style={{
            background: 'var(--accent-light)',
            borderLeft: `4px solid var(--accent-primary)`,
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '48px',
          }}
        >
          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-text-primary)',
              margin: '0',
              lineHeight: 1.6,
              fontStyle: 'italic',
            }}
          >
            <span style={{ fontWeight: 600 }}>Nova:</span> ตอนนี้คุณมีความชัดเจนถึง 85% แล้ว! บลูปรินต์นี้จะพัฒนาต่อไปเรื่อยๆ ตามที่คุณเติบโต แวะกลับมาดูเป็นระยะว่า twin ของคุณเรียนรู้และปรับตัวไปกับเส้นทางของคุณอย่างไร พร้อมสำรวจศักยภาพเต็มที่ของคุณหรือยัง?
          </p>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexDirection: 'column',
          }}
        >
          <button
            onClick={onHome}
            style={{
              width: '100%',
              padding: '16px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--accent-primary)',
              color: 'white',
              fontWeight: 600,
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            → ไปที่แดชบอร์ดของคุณ
          </button>
          <button
            onClick={onHome}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: '8px',
              border: '2px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text-primary)',
              fontWeight: 600,
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            ← กลับหน้าแรก
          </button>
        </div>
      </div>
    </div>
  );
};

export default FullAnalysis;
