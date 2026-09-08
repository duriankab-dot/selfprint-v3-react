import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { DobSelect, TimeSelect } from './BirthDateTimeSelect';
import { isDobComplete, isTimeComplete, dobToISODate, timeToHHMM } from '@/lib/geo/birthDateTime';
import type { DobValue, TimeValue } from '@/lib/geo/birthDateTime';
import { BirthPlaceSelect } from './BirthPlaceSelect';
import type { BirthPlace } from '@/lib/geo/birthPlace.types';

interface BirthdateInputProps {
  onSubmit: (data: { dob: string; time?: string; place?: string }) => void;
}

// BirthData.place stays a plain display string (unchanged downstream contract) —
// the canonical BirthPlace (lat/lng/timezone) lives in
// src/lib/geo/birthPlaceRegistry.ts for a future feature to consume end-to-end.
function formatPlace(place: BirthPlace, isTh: boolean): string {
  if (place.countryCode === 'TH') return isTh ? place.nameTh : place.nameEn;
  const city = isTh ? place.nameTh : place.nameEn;
  return place.admin1 ? `${city}, ${place.admin1}` : city;
}

export function BirthdateInput({ onSubmit }: BirthdateInputProps) {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const [dob, setDob] = useState<DobValue>({ day: null, month: null, year: null });
  const [time, setTime] = useState<TimeValue>({ hour: null, minute: null });
  const [place, setPlace] = useState<BirthPlace | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDobComplete(dob)) {
      alert(isTh ? 'ต้องการข้อมูลเกิด' : 'Birth data required');
      return;
    }
    onSubmit({
      dob: dobToISODate(dob),
      time: isTimeComplete(time) ? timeToHHMM(time) : undefined,
      place: place ? formatPlace(place, isTh) : undefined,
    });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-2">{isTh ? 'ต้องการข้อมูลเกิด' : 'Birth data required'}</h2>
      {/* STORYBEAT-BIRTHDATE-001 (Track C Story Layer, §51): this step was a
          bare form with zero narrative framing — the one clear "form, not a
          story" gap flagged by STORY_NARRATIVE_LAYER_TH.md's own Phase-2
          audit. One honest line connecting this input to what Twin actually
          does with it (real: seeds the initial-disciplines/archetype
          calculation used in the next step), not a fabricated claim. */}
      <p className="text-sm text-gray-500 mb-4">
        {isTh
          ? 'จุดเริ่มต้นของทวินคุณ — ข้อมูลนี้ใช้คำนวณ pattern เบื้องต้นที่ทวินจะต่อยอดในขั้นถัดไป'
          : "Your Twin's starting point — this seeds the initial pattern it will build on in the next step"}
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{isTh ? 'ระบุวันเกิด' : 'Enter your birthday'}</label>
          <DobSelect value={dob} onChange={setDob} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {isTh ? 'เวลาเกิด (ไม่บังคับ)' : 'Time of birth (optional)'}
          </label>
          <TimeSelect value={time} onChange={setTime} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {isTh ? 'สถานที่เกิด (ไม่บังคับ)' : 'Place of birth (optional)'}
          </label>
          <BirthPlaceSelect onSelect={setPlace} />
        </div>
        <button
          type="submit"
          disabled={!isDobComplete(dob)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isTh ? 'วิเคราะห์' : 'Analyze'}
        </button>
      </form>
    </div>
  );
}
