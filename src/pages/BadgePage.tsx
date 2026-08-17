/**
 * BadgePage.tsx — /badges
 * Master Direction §29-30
 */
import { BadgeGallery } from '@/components/features/BadgeGallery';
import '@/styles/badge-gallery.css';

export default function BadgePage() {
  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '2rem 1rem' }}>
      <BadgeGallery />
    </main>
  );
}
