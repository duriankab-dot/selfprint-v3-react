import { useState } from 'react';

interface BirthdateInputProps {
  onSubmit: (data: { dob: string; time?: string; place?: string }) => void;
}

export function BirthdateInput({ onSubmit }: BirthdateInputProps) {
  const [dob, setDob] = useState('');
  const [time, setTime] = useState('');
  const [place, setPlace] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob) {
      alert('กรุณากรอกวันเกิด');
      return;
    }
    onSubmit({ dob, time, place });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">ข้อมูลวันเกิดของคุณ</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">วันเกิด *</label>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">เวลาเกิด (ไม่บังคับ)</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">สถานที่เกิด (ไม่บังคับ)</label>
          <input
            type="text"
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="เมือง, ประเทศ"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          วิเคราะห์
        </button>
      </form>
    </div>
  );
}