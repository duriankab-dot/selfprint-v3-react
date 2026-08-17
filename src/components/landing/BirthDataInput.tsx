/**
 * BirthDataInput.tsx
 *
 * Birth data collection component
 * - Positioned at END of landing page (MEMO principle)
 * - Date of birth: REQUIRED
 * - Time of birth: OPTIONAL
 * - Place of birth: OPTIONAL
 * - Stores in userStore + localStorage
 */

import { useState } from 'react';
import { useUserStore } from '@/store/userStore';

interface BirthDataInputProps {
  className?: string;
  onComplete?: () => void;
}

export const BirthDataInput: React.FC<BirthDataInputProps> = ({
  className = '',
  onComplete,
}) => {
  const { updateProfile } = useUserStore();
  const [formData, setFormData] = useState({
    dob: localStorage.getItem('birth_dob') || '',
    time: localStorage.getItem('birth_time') || '',
    place: localStorage.getItem('birth_place') || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateDate = (dateString: string): boolean => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'dob' && value && !validateDate(value)) {
      setErrors((prev) => ({
        ...prev,
        dob: 'กรุณากรอกวันที่ให้ถูกต้อง (YYYY-MM-DD)',
      }));
    }

    if (name === 'time' && value) {
      // Validate time format HH:MM
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(value)) {
        setErrors((prev) => ({
          ...prev,
          time: 'กรุณากรอกเวลาในรูปแบบ HH:MM',
        }));
      }
    }
  };

  const handleSave = () => {
    if (!formData.dob) {
      setErrors((prev) => ({ ...prev, dob: 'กรุณากรอกวันเกิด' }));
      return;
    }

    if (!validateDate(formData.dob)) {
      setErrors((prev) => ({
        ...prev,
        dob: 'กรุณากรอกวันที่ให้ถูกต้อง',
      }));
      return;
    }

    // Save to store
    updateProfile({
      birthDate: formData.dob,
      birthTime: formData.time || undefined,
      birthPlace: formData.place || undefined,
    });

    // Save to localStorage for persistence
    localStorage.setItem('birth_dob', formData.dob);
    if (formData.time) localStorage.setItem('birth_time', formData.time);
    if (formData.place) localStorage.setItem('birth_place', formData.place);

    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className={`birth-data-input ${className}`}>
      <div
        style={{
          maxWidth: '500px',
          margin: '0 auto',
          padding: '24px',
          background: 'var(--color-bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--color-border)',
        }}
      >
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '8px',
            color: 'var(--color-text-primary)',
          }}
        >
          บอกเราว่าคุณเกิดเมื่อไหร่
        </h3>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            marginBottom: '24px',
            lineHeight: 1.5,
          }}
        >
          ข้อมูลนี้ช่วยให้ AI Twin เข้าใจแพทเทิร์นหลักของคุณ เวลาและสถานที่เกิดใส่หรือไม่ใส่ก็ได้
        </p>

        {/* Date of Birth */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '6px',
              color: 'var(--color-text-primary)',
            }}
          >
            วันเกิด <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            onBlur={handleBlur}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: errors.dob ? '2px solid #ef5350' : '1px solid var(--color-border)',
              background: 'var(--color-bg-primary)',
              color: 'var(--color-text-primary)',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
            aria-label="วันเกิด"
          />
          {errors.dob && (
            <p
              style={{
                fontSize: '12px',
                color: '#ef5350',
                marginTop: '4px',
              }}
            >
              {errors.dob}
            </p>
          )}
        </div>

        {/* Time of Birth */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '6px',
              color: 'var(--color-text-primary)',
            }}
          >
            เวลาเกิด (ไม่บังคับ)
          </label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            onBlur={handleBlur}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: errors.time ? '2px solid #ef5350' : '1px solid var(--color-border)',
              background: 'var(--color-bg-primary)',
              color: 'var(--color-text-primary)',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
            aria-label="เวลาเกิด"
          />
          {errors.time && (
            <p
              style={{
                fontSize: '12px',
                color: '#ef5350',
                marginTop: '4px',
              }}
            >
              {errors.time}
            </p>
          )}
        </div>

        {/* Place of Birth */}
        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '6px',
              color: 'var(--color-text-primary)',
            }}
          >
            สถานที่เกิด (ไม่บังคับ)
          </label>
          <input
            type="text"
            name="place"
            value={formData.place}
            onChange={handleChange}
            placeholder="เช่น กรุงเทพฯ ประเทศไทย"
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-primary)',
              color: 'var(--color-text-primary)',
              fontSize: '14px',
              boxSizing: 'border-box',
            }}
            aria-label="สถานที่เกิด"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            border: 'none',
            background: 'var(--color-accent-primary)',
            color: 'white',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          บันทึกและไปต่อ
        </button>
      </div>
    </div>
  );
};

export default BirthDataInput;
