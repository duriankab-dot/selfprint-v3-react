/**
 * birthPlaceRegistry.ts
 *
 * Single lookup surface over the canonical birthplace dataset
 * (Thailand's 77 provinces + the international starter set). UI components
 * should go through this module rather than importing the raw data files
 * directly, so the "Thailand vs. international" split stays an
 * implementation detail.
 */

import type { BirthPlace, Country } from './birthPlace.types';
import { THAILAND_PROVINCES } from './thailandProvinces';
import { INTERNATIONAL_PLACES, INTERNATIONAL_COUNTRIES } from './internationalPlaces';

export const THAILAND_COUNTRY: Country = { code: 'TH', nameTh: 'ไทย', nameEn: 'Thailand' };

/** Thailand first, then the rest alphabetically (by English name) — matches how the UI presents the country selector. */
export const ALL_COUNTRIES: Country[] = [THAILAND_COUNTRY, ...INTERNATIONAL_COUNTRIES];

const ALL_PLACES: BirthPlace[] = [...THAILAND_PROVINCES, ...INTERNATIONAL_PLACES];

const PLACES_BY_ID = new Map(ALL_PLACES.map((place) => [place.id, place]));

/** Places for one country code, sorted by English name (Thailand keeps its natural province order). */
export function getPlacesForCountry(countryCode: string): BirthPlace[] {
  if (countryCode === 'TH') return THAILAND_PROVINCES;
  return INTERNATIONAL_PLACES.filter((place) => place.countryCode === countryCode);
}

export function getPlaceById(id: string): BirthPlace | undefined {
  return PLACES_BY_ID.get(id);
}

export function isCountrySupported(countryCode: string): boolean {
  return ALL_COUNTRIES.some((c) => c.code === countryCode);
}
