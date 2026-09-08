import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface BirthdateInputProps {
  onSubmit: (data: { dob: string; time?: string; place?: string }) => void;
}

export function BirthdateInput({ onSubmit }: BirthdateInputProps) {
  const { language } = useLanguage();
  const isTh = language === 'th';
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('');
  const [place, setPlace] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob) {
      alert(isTh ? 'ต้องการข้อมูลเกิด' : 'Birth data required');
      return;
    }
    onSubmit({ dob, time, place });
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
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {isTh ? 'เวลาเกิด (ไม่บังคับ)' : 'Time of birth (optional)'}
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {isTh ? 'สถานที่เกิด (ไม่บังคับ)' : 'Place of birth (optional)'}
          </label>
          <input
            type="text"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder={isTh ? 'เมือง, ประเทศ' : 'City, Country'}
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          {isTh ? 'วิเคราะห์' : 'Analyze'}
        </button>
      </form>
    </div>
  );
}
