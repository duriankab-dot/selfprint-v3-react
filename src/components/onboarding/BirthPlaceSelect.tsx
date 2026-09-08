/**
 * BirthPlaceSelect.tsx
 *
 * Two-level dropdown (Country → Province/City) that resolves to a canonical
 * `BirthPlace` (lat/lng/timezone attached) — replaces free-text "city, country"
 * fields across onboarding. No typing: both levels are native <select>s.
 */

import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ALL_COUNTRIES, getPlacesForCountry } from '@/lib/geo/birthPlaceRegistry';
import type { BirthPlace } from '@/lib/geo/birthPlace.types';

interface BirthPlaceSelectProps {
  onSelect: (place: BirthPlace) => void;
  /** Pre-selected place id (e.g. when re-opening a previously-filled step). */
  initialPlaceId?: string;
}

export function BirthPlaceSelect({ onSelect, initialPlaceId }: BirthPlaceSelectProps) {
  const { language } = useLanguage();
  const isTh = language === 'th';

  const initialCountry = useMemo(() => {
    if (!initialPlaceId) return 'TH';
    return initialPlaceId.startsWith('TH-') ? 'TH' : initialPlaceId.replace('INTL-', '');
  }, [initialPlaceId]);

  const [countryCode, setCountryCode] = useState(initialCountry);
  const [placeId, setPlaceId] = useState(initialPlaceId ?? '');

  const places = useMemo(() => getPlacesForCountry(countryCode), [countryCode]);

  // Whatever is visibly selected (default: the first province/city for the
  // default country) must also be what the parent has in state — otherwise
  // a user who accepts the pre-filled default without touching either
  // dropdown would silently end up with no place recorded at all.
  useEffect(() => {
    if (!placeId && places[0]) {
      setPlaceId(places[0].id);
      onSelect(places[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCountryChange = (code: string) => {
    setCountryCode(code);
    const firstPlace = getPlacesForCountry(code)[0];
    setPlaceId(firstPlace?.id ?? '');
    if (firstPlace) onSelect(firstPlace);
  };

  const handlePlaceChange = (id: string) => {
    setPlaceId(id);
    const place = places.find((p) => p.id === id);
    if (place) onSelect(place);
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    background: 'var(--color-bg-primary)',
    color: 'var(--color-text-primary)',
    fontSize: '14px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <select
        value={countryCode}
        onChange={(e) => handleCountryChange(e.target.value)}
        style={selectStyle}
        aria-label={isTh ? 'ประเทศ' : 'Country'}
      >
        {ALL_COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {isTh ? c.nameTh : c.nameEn}
          </option>
        ))}
      </select>
      <select
        value={placeId}
        onChange={(e) => handlePlaceChange(e.target.value)}
        style={selectStyle}
        aria-label={countryCode === 'TH' ? (isTh ? 'จังหวัด' : 'Province') : isTh ? 'เมือง' : 'City'}
      >
        {places.map((place) => (
          <option key={place.id} value={place.id}>
            {isTh ? place.nameTh : place.nameEn}
          </option>
        ))}
      </select>
    </div>
  );
}
