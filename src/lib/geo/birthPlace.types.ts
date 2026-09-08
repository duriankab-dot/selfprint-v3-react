/**
 * birthPlace.types.ts
 *
 * Canonical birthplace data model — shared by every onboarding surface that
 * collects "where were you born" (NovaConversation, BirthdateInput, and any
 * future entry point). Chosen over a free-text field so the value is always
 * a resolvable place with coordinates + timezone attached, not an arbitrary
 * string the user typed.
 *
 * Scope note (8 ก.ย. 2026): `src/lib/astrology.ts` (calculateInitialDisciplines /
 * getLifePathProfile) currently derives everything from `dob` alone — it does
 * NOT yet consume lat/lng/timezone. This dataset is forward-looking
 * infrastructure (canonical place selection, no free text) — wiring lat/lng
 * into the analysis engine itself is a separate decision, not part of this change.
 */

/** ISO 3166-1 alpha-2 country code (e.g. 'TH', 'US', 'JP'). */
export type CountryCode = string;

export interface Country {
  code: CountryCode;
  nameTh: string;
  nameEn: string;
}

export interface BirthPlace {
  /** Stable id, unique across the whole registry (e.g. 'TH-BANGKOK', 'INTL-JP-TOKYO'). */
  id: string;
  nameTh: string;
  nameEn: string;
  countryCode: CountryCode;
  /** Province/state/admin-1 name, English — Thai entries use the province name itself. */
  admin1?: string;
  lat: number;
  lng: number;
  /** IANA timezone identifier (e.g. 'Asia/Bangkok'). */
  timezone: string;
}
