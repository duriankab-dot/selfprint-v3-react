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
import { useLanguage } from '@/context/LanguageContext';

interface BirthDataInputProps {
  className?: string;
  onComplete?: () => void;
}

export const BirthDataInput: React.FC<BirthDataInputProps> = ({
  className = '',
  onComplete,
}) => {
  const { updateProfile } = useUserStore();
  const { language } = useLanguage();
  const isTh = language === 'th';
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
        dob: isTh ? 'กรุณากรอกวันที่ให้ถูกต้อง (YYYY-MM-DD)' : 'Please enter a valid date (YYYY-MM-DD)',
      }));
    }

    if (name === 'time' && value) {
      // Validate time format HH:MM
      const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(value)) {
        setErrors((prev) => ({
          ...prev,
          time: isTh ? 'กรุณากรอกเวลาในรูปแบบ HH:MM' : 'Please enter time in HH:MM format',
        }));
      }
    }
  };

  const handleSave = () => {
    if (!formData.dob) {
      setErrors((prev) => ({ ...prev, dob: isTh ? 'กรุณากรอกวันเกิด' : 'Please enter your date of birth' }));
      return;
    }

    if (!validateDate(formData.dob)) {
      setErrors((prev) => ({
        ...prev,
        dob: isTh ? 'กรุณากรอกวันที่ให้ถูกต้อง' : 'Please enter a valid date',
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
          {isTh ? 'บอกเราว่าคุณเกิดเมื่อไหร่' : 'Tell us when you were born'}
        </h3>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            marginBottom: '24px',
            lineHeight: 1.5,
          }}
        >
          {isTh
            ? 'ข้อมูลนี้ช่วยให้ AI Twin เข้าใจแพทเทิร์นหลักของคุณ เวลาและสถานที่เกิดใส่หรือไม่ใส่ก็ได้'
            : 'This helps your AI Twin understand your core patterns. Time and place of birth are optional.'}
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
            {isTh ? 'วันเกิด' : 'Date of birth'} <span style={{ color: 'red' }}>*</span>
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
            aria-label={isTh ? 'วันเกิด' : 'Date of birth'}
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
            {isTh ? 'เวลาเกิด (ไม่บังคับ)' : 'Time of birth (optional)'}
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
            aria-label={isTh ? 'เวลาเกิด' : 'Time of birth'}
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
            {isTh ? 'สถานที่เกิด (ไม่บังคับ)' : 'Place of birth (optional)'}
          </label>
          <input
            type="text"
            name="place"
            value={formData.place}
            onChange={handleChange}
            placeholder={isTh ? 'เช่น กรุงเทพฯ ประเทศไทย' : 'e.g. Bangkok, Thailand'}
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
            aria-label={isTh ? 'สถานที่เกิด' : 'Place of birth'}
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
          {isTh ? 'บันทึกและไปต่อ' : 'Save and continue'}
        </button>
      </div>
    </div>
  );
};

export default BirthDataInput;
