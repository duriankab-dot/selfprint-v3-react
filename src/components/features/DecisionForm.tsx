/**
 * 📝 DecisionForm Component — ฟอร์มบันทึกการตัดสินใจ
 *
 * **Fields:**
 * - ชื่อการตัดสินใจ
 * - บริบท (ทำไมต้องตัดสินใจ)
 * - ผลลัพธ์ที่คาดหวัง
 * - ความมั่นใจ (confidence)
 *
 * **Integration:**
 * - Decision Intelligence Analysis
 * - Bias risk display
 */

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { DecisionIntelligenceReport } from '@/lib/intelligence/DecisionIntelligenceEngine';
import './decision-form.css';

// ============================================================================
// Types
// ============================================================================

interface DecisionFormProps {
  userId: string;
  decisionAnalysis?: DecisionIntelligenceReport | null;
  onDecisionCreated?: (decision: any) => void;
}

interface FormData {
  title: string;
  context: string;
  expectedOutcome: string;
  confidence: number;
}

// ============================================================================
// Component
// ============================================================================

const DecisionForm: React.FC<DecisionFormProps> = ({
  userId,
  decisionAnalysis,
  onDecisionCreated,
}) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    context: '',
    expectedOutcome: '',
    confidence: 50,
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  // ===================================================
  // Mutation
  // ===================================================

  const createDecisionMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // TODO: Implement actual API call
      // For now, return mock data
      return {
        id: `decision_${Date.now()}`,
        userId,
        ...data,
        createdAt: new Date(),
      };
    },
    onSuccess: (decision) => {
      // ✅ Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['userDecisions', userId] });

      // Reset form
      setFormData({
        title: '',
        context: '',
        expectedOutcome: '',
        confidence: 50,
      });
      setErrors({});

      onDecisionCreated?.(decision);
    },
    onError: (error) => {
      console.error('Failed to create decision:', error);
    },
  });

  // ===================================================
  // Handlers
  // ===================================================

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.title.trim()) newErrors.title = 'ต้องระบุชื่อการตัดสินใจ';
    if (!formData.context.trim()) newErrors.context = 'ต้องระบุบริบท';
    if (!formData.expectedOutcome.trim()) newErrors.expectedOutcome = 'ต้องระบุผลลัพธ์ที่คาดหวัง';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      createDecisionMutation.mutate(formData);
    }
  };

  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form className="decision-form" onSubmit={handleSubmit}>
      <div className="decision-form__group">
        <label className="decision-form__label" htmlFor="title">
          ชื่อการตัดสินใจ <span className="required">*</span>
        </label>
        <input
          id="title"
          type="text"
          className={`decision-form__input${errors.title ? ' error' : ''}`}
          placeholder="เช่น: เปลี่ยนงาน, ย้ายเมือง, ลงทุนในโครงการนี้"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
        />
        {errors.title && <p className="decision-form__error">{errors.title}</p>}
      </div>

      <div className="decision-form__group">
        <label className="decision-form__label" htmlFor="context">
          บริบท: ทำไมต้องตัดสินใจตอนนี้? <span className="required">*</span>
        </label>
        <textarea
          id="context"
          className={`decision-form__textarea${errors.context ? ' error' : ''}`}
          placeholder="อธิบายสถานการณ์ที่ทำให้คุณต้องตัดสินใจ..."
          rows={3}
          value={formData.context}
          onChange={(e) => handleChange('context', e.target.value)}
        />
        {errors.context && <p className="decision-form__error">{errors.context}</p>}
      </div>

      <div className="decision-form__group">
        <label className="decision-form__label" htmlFor="expectedOutcome">
          ผลลัพธ์ที่คาดหวัง <span className="required">*</span>
        </label>
        <textarea
          id="expectedOutcome"
          className={`decision-form__textarea${errors.expectedOutcome ? ' error' : ''}`}
          placeholder="คุณหวังว่าการตัดสินใจนี้จะนำไปสู่อะไร?"
          rows={3}
          value={formData.expectedOutcome}
          onChange={(e) => handleChange('expectedOutcome', e.target.value)}
        />
        {errors.expectedOutcome && <p className="decision-form__error">{errors.expectedOutcome}</p>}
      </div>

      <div className="decision-form__group">
        <label className="decision-form__label" htmlFor="confidence">
          ความมั่นใจในการตัดสินใจ: {formData.confidence}%
        </label>
        <input
          id="confidence"
          type="range"
          className="decision-form__range"
          min="0"
          max="100"
          step="5"
          value={formData.confidence}
          onChange={(e) => handleChange('confidence', parseInt(e.target.value))}
        />
        <p className="decision-form__confidence-text">
          {formData.confidence < 30 && '❓ กำลังลังเล...'}
          {formData.confidence >= 30 && formData.confidence < 60 && '🤔 ค่อนข้างแน่ใจ'}
          {formData.confidence >= 60 && formData.confidence < 85 && '✅ ค่อนข้างมั่นใจ'}
          {formData.confidence >= 85 && '💯 มั่นใจมาก'}
        </p>
      </div>

      {/* Decision Analysis Recommendations */}
      {decisionAnalysis && (
        <div className="decision-form__recommendations">
          <h4>💡 ข้อเสนอแนะแบบที่เหมาะกับสไตล์ของคุณ</h4>
          <div className="frameworks-list">
            {decisionAnalysis.recommendedFrameworks.slice(0, 3).map((fw) => (
              <div key={fw.framework} className="framework-card">
                <h5>{fw.nameThai}</h5>
                <p className="framework-desc">{fw.descriptionThai}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="decision-form__actions">
        <button
          type="submit"
          className="decision-form__btn-submit"
          disabled={createDecisionMutation.isPending}
        >
          {createDecisionMutation.isPending ? '⏳ กำลังบันทึก...' : '💾 บันทึกการตัดสินใจ'}
        </button>
      </div>
    </form>
  );
};

export default DecisionForm;
