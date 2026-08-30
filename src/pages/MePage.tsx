/**
 * MePage.tsx — ฉัน (Me)
 *
 * §5.6 ฉัน = Profile, Goals, Privacy, Subscription, Settings
 *
 * Aggregate page สำหรับ user account:
 * - ชื่อ/อีเมล จาก useAuth().session?.user
 * - Tier จาก useSubscription()
 * - Twin Evolution State (ถ้ามี)
 * - Links ไปยัง /privacy, /settings/passkeys, /pricing, /brief, /badges, /analysis
 */

import { useLangNavigate as useNavigate } from '../hooks/useLangNavigate';
import { NavBar } from '../components/layout/NavBar';
import { BottomNav } from '../components/layout/BottomNav';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useLanguage } from '../context/LanguageContext';

// label ต่อ tier
const TIER_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  free: { label: 'Free', emoji: '🌱', color: 'var(--color-text-secondary)' },
  plus: { label: 'Plus', emoji: '⭐', color: '#8B5CF6' },
  pro: { label: 'Pro', emoji: '💎', color: 'var(--color-accent-primary)' },
  lifetime: { label: 'Lifetime', emoji: '♾️', color: '#F59E0B' },
};

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  emoji: string;
  label: string;
  sublabel?: string;
  route: string;
  external?: boolean;
}

export default function MePage() {
  const { session } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isTh = language === 'th';

  const user = session?.user;
  const displayName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split('@')[0]
    || (isTh ? 'ผู้ใช้' : 'User');
  const email = user?.email || '';
  const tier = subscription?.tier || 'free';
  const tierInfo = TIER_LABELS[tier] ?? TIER_LABELS.free;

  const SECTIONS: MenuSection[] = isTh ? [
    {
      title: 'AI ฝาแฝด',
      items: [
        {
          emoji: '📰',
          label: 'สรุปประจำวัน',
          sublabel: 'Daily Brief จาก AI ฝาแฝดของคุณ',
          route: '/brief',
        },
        {
          emoji: '👥',
          label: 'โปรไฟล์ AI ฝาแฝด',
          sublabel: 'Accuracy %, Evolution, Stats',
          route: '/twin',
        },
        {
          emoji: '🧬',
          label: 'วิเคราะห์ตัวตน',
          sublabel: 'ภาพรวม Blueprint และ Patterns',
          route: '/analysis',
        },
        {
          emoji: '🏅',
          label: 'เหรียญรางวัล',
          sublabel: 'ความก้าวหน้าของการเติบโต',
          route: '/badges',
        },
        {
          emoji: '🎯',
          label: 'Life Hubs',
          sublabel: 'อาชีพ / ความสัมพันธ์ / สุขภาพ / เติบโต / สมดุล',
          route: '/life-hubs',
        },
        {
          emoji: '📋',
          label: 'บันทึกการตัดสินใจ',
          sublabel: 'Decision Logger + สถิติ',
          route: '/decisions',
        },
      ],
    },
    {
      title: 'บัญชีและความปลอดภัย',
      items: [
        {
          emoji: '🔑',
          label: 'จัดการ Passkeys',
          sublabel: 'เพิ่ม/ลบคีย์ยืนยันตัวตน',
          route: '/settings/passkeys',
        },
        {
          emoji: '🔒',
          label: 'ศูนย์ความเป็นส่วนตัว',
          sublabel: 'PDPA, Export, ลบบัญชี',
          route: '/privacy',
        },
      ],
    },
    {
      title: 'การสมัครสมาชิก',
      items: [
        {
          emoji: tierInfo.emoji,
          label: `แผน ${tierInfo.label}`,
          sublabel: tier === 'free'
            ? 'อัปเกรดเพื่อปลดล็อกฟีเจอร์ทั้งหมด'
            : 'ดูรายละเอียดและจัดการการสมัคร',
          route: '/pricing',
        },
      ],
    },
  ] : [
    {
      title: 'AI Twin',
      items: [
        {
          emoji: '📰',
          label: 'Daily Brief',
          sublabel: 'A daily brief from your AI Twin',
          route: '/brief',
        },
        {
          emoji: '👥',
          label: 'AI Twin profile',
          sublabel: 'Accuracy %, Evolution, Stats',
          route: '/twin',
        },
        {
          emoji: '🧬',
          label: 'Self analysis',
          sublabel: 'An overview of your Blueprint and Patterns',
          route: '/analysis',
        },
        {
          emoji: '🏅',
          label: 'Badges',
          sublabel: 'Your growth progress',
          route: '/badges',
        },
        {
          emoji: '🎯',
          label: 'Life Hubs',
          sublabel: 'Career / Relationships / Health / Growth / Balance',
          route: '/life-hubs',
        },
        {
          emoji: '📋',
          label: 'Decision log',
          sublabel: 'Decision Logger + stats',
          route: '/decisions',
        },
      ],
    },
    {
      title: 'Account & security',
      items: [
        {
          emoji: '🔑',
          label: 'Manage Passkeys',
          sublabel: 'Add/remove sign-in keys',
          route: '/settings/passkeys',
        },
        {
          emoji: '🔒',
          label: 'Privacy Center',
          sublabel: 'PDPA, export, delete account',
          route: '/privacy',
        },
      ],
    },
    {
      title: 'Subscription',
      items: [
        {
          emoji: tierInfo.emoji,
          label: `${tierInfo.label} plan`,
          sublabel: tier === 'free'
            ? 'Upgrade to unlock every feature'
            : 'View details and manage your subscription',
          route: '/pricing',
        },
      ],
    },
  ];

  const handleNav = (item: MenuItem) => {
    if (item.external) {
      window.open(item.route, '_blank', 'noopener');
    } else {
      navigate(item.route);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg-primary)', paddingBottom: 80 }}>
      <NavBar />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px 0' }}>
        {/* Profile Card */}
        <div style={{
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: 20,
          padding: '24px 20px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          {/* Avatar */}
          <div style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'color-mix(in srgb, var(--color-accent-primary) 18%, transparent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            flexShrink: 0,
          }}>
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: 2,
            }}>
              {displayName}
            </div>
            {email && (
              <div style={{
                fontSize: 13,
                color: 'var(--color-text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {email}
              </div>
            )}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              marginTop: 6,
              padding: '3px 10px',
              borderRadius: 12,
              background: 'color-mix(in srgb, var(--color-accent-primary) 10%, transparent)',
              fontSize: 12,
              fontWeight: 600,
              color: tierInfo.color,
            }}>
              <span>{tierInfo.emoji}</span>
              <span>{tierInfo.label}</span>
            </div>
          </div>
        </div>

        {/* Not logged in state */}
        {!user && (
          <div style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            padding: '20px',
            textAlign: 'center',
            marginBottom: 24,
          }}>
            <p style={{
              fontSize: 14,
              color: 'var(--color-text-secondary)',
              margin: '0 0 14px',
            }}>
              {isTh
                ? 'เข้าสู่ระบบเพื่อบันทึกข้อมูลและใช้งานฟีเจอร์ทั้งหมด'
                : 'Sign in to save your data and use every feature'}
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '12px 28px',
                background: 'var(--color-accent-primary)',
                border: 'none',
                borderRadius: 12,
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {isTh ? 'เข้าสู่ระบบ' : 'Sign in'}
            </button>
          </div>
        )}

        {/* Menu Sections */}
        {SECTIONS.map(section => (
          <div key={section.title} style={{ marginBottom: 24 }}>
            <h2 style={{
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              margin: '0 0 10px 4px',
            }}>
              {section.title}
            </h2>

            <div style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 16,
              overflow: 'hidden',
            }}>
              {section.items.map((item, idx) => (
                <button
                  key={item.route}
                  onClick={() => handleNav(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    width: '100%',
                    padding: '15px 18px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: idx < section.items.length - 1
                      ? '1px solid var(--color-border)'
                      : 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{item.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'var(--color-text-primary)',
                    }}>
                      {item.label}
                    </div>
                    {item.sublabel && (
                      <div style={{
                        fontSize: 12,
                        color: 'var(--color-text-secondary)',
                        marginTop: 2,
                      }}>
                        {item.sublabel}
                      </div>
                    )}
                  </div>
                  <span style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: 18,
                    flexShrink: 0,
                  }}>
                    ›
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* App Info */}
        <div style={{
          textAlign: 'center',
          padding: '8px 0 8px',
          color: 'var(--color-text-secondary)',
          fontSize: 12,
        }}>
          {isTh ? 'SELFPRINT · รู้จักตัวเองให้ลึกขึ้น ทุกวัน' : 'SELFPRINT · Know yourself more deeply, every day'}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
