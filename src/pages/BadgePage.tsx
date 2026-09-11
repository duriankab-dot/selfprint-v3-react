/**
 * BadgePage.tsx — /badges
 * Master Direction §29-30
 */
import { BadgeGallery } from '@/components/features/BadgeGallery';
import { AppShell } from '@/components/layout/AppShell';
import '@/styles/badge-gallery.css';

export default function BadgePage() {
  return (
    <AppShell>
      <div className="page-content" style={{ maxWidth: 560, margin: '0 auto' }}>
        <main style={{ padding: '2rem 1rem' }}>
          <BadgeGallery />
        </main>
      </div>
    </AppShell>
  );
}
