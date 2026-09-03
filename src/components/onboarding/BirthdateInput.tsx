import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/constants/translations';

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
      alert(t('birthDataRequired', language));
      return;
    }
    onSubmit({ dob, time, place });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">{t('birthDataRequired', language)}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t('enterBirthday', language)}</label>
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
